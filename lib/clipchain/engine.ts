/**
 * ClipChain engine — prompt → chained multi-shot Seedance 2.0 clip with
 * dual vision-analyzer scene consistency (GPT "Omni" + Nano Banana/Gemini).
 *
 * Everything runs through OpenRouter with one key (OPENROUTER_API_KEY):
 * video generation (/api/v1/videos), the storyboard LLM, and both analyzers.
 *
 * Serverless-safe design: job state lives in Redis; the client polls
 * /api/clipchain/status/[jobId], and each poll "ticks" the state machine
 * forward one bounded step (check OpenRouter job → on shot completion:
 * store shot, extract last frame, analyze, submit next shot → finally
 * concat + upload to Firebase Storage). No fire-and-forget background work.
 */

import { execFile } from 'child_process'
import { randomUUID } from 'crypto'
import { access, mkdir, readFile, unlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'
import { redisGet, redisSet } from '@/lib/redis'
import { adminStorage } from '@/lib/firebase-admin'
import { trackSpend, refundUsage, trackUsage } from '@/lib/usage-system'
import { chargeForDeliveredClip } from '@/lib/clipchain/billing'
import { saveClip } from '@/lib/clipchain/library'
import { emailClip } from '@/lib/clipchain/deliver'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------- types

export interface PlannedShot {
  name: string
  prompt: string
  camera?: string
  // Timed song window this shot covers, e.g. "0:45–1:00 · CHORUS 1".
  window?: string
}

export interface TrackSection {
  label: string
  start: number
  end: number
  lyrics?: string
  energy?: string
  imagery?: string
}

export interface TrackMap {
  durationSec: number
  sections: TrackSection[]
}

export interface ClipPlan {
  title: string
  art_direction?: string
  signature?: string
  style_bible: string
  shots: PlannedShot[]
}

export interface ShotState {
  name: string
  fullPrompt?: string
  orId?: string
  pollUrl?: string
  storagePath?: string
  frameUrl?: string
  cost?: number
  attempts?: number
  submittedAt?: number
  done: boolean
}

export interface ClipJob {
  id: string
  sessionId: string
  createdAt: number
  status: 'generating' | 'assembling' | 'complete' | 'failed'
  message: string
  prompt: string
  style?: string
  plan: ClipPlan
  shots: ShotState[]
  current: number
  secondsPerShot: number
  resolution: string
  videoUrl?: string
  audioPath?: string
  email?: string
  emailed?: boolean
  totalCost: number
  tickErrors?: number
  wastedCost?: number
  refunded?: boolean
  charged?: boolean
  chargedUsd?: number
  billingError?: string
  error?: string
}

// Operational job state sticks around a week (resume, status re-checks).
// The durable pointer to the finished film lives in the library, not here.
const JOB_TTL_SECONDS = 60 * 60 * 24 * 7

// Resilience budget: a shot may be resubmitted up to MAX_SHOT_ATTEMPTS times
// (provider-side failures or hangs), and a tick may hit transient errors up to
// MAX_TICK_ERRORS times in a row before the job parks as failed. A parked job
// keeps every completed shot and can be resumed via resumeJob().
const MAX_SHOT_ATTEMPTS = 3
const MAX_TICK_ERRORS = 5
const SHOT_TIMEOUT_MS = 15 * 60 * 1000

/** An error that should park the job immediately instead of burning retries. */
class PermanentError extends Error {}
const jobKey = (id: string) => `clipchain:job:${id}`
const lockKey = (id: string) => `clipchain:lock:${id}`

export async function loadJob(id: string): Promise<ClipJob | null> {
  return redisGet<ClipJob>(jobKey(id))
}

export async function saveJob(job: ClipJob): Promise<void> {
  await redisSet(jobKey(job.id), job, JOB_TTL_SECONDS)
}

// ------------------------------------------------------------ OpenRouter

const OR_BASE = 'https://openrouter.ai/api/v1'

function orKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured')
  return key
}

async function orChat(
  messages: unknown[],
  model: string,
  json = true
): Promise<string> {
  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${orKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      messages,
    }),
  })
  if (!res.ok) {
    throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const out = await res.json()
  return out.choices?.[0]?.message?.content ?? ''
}

/**
 * Generate an image via an OpenRouter image-output model (Nano Banana family).
 * Returns the raw image bytes, or null on any failure — seed frames are an
 * upgrade, never a blocker.
 */
async function orImage(prompt: string, model: string): Promise<Buffer | null> {
  try {
    const res = await fetch(`${OR_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${orKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        modalities: ['image', 'text'],
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      console.warn(`[clipchain] image model ${res.status}:`, (await res.text()).slice(0, 200))
      return null
    }
    const out = await res.json()
    const msg = out.choices?.[0]?.message
    const dataUrl: string | undefined =
      msg?.images?.[0]?.image_url?.url ??
      (Array.isArray(msg?.content)
        ? msg.content.find((c: { type?: string }) => c.type === 'image_url')?.image_url?.url
        : undefined)
    if (!dataUrl?.startsWith('data:')) return null
    const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    return Buffer.from(b64, 'base64')
  } catch (err) {
    console.warn('[clipchain] image generation failed:', err)
    return null
  }
}

function parseJsonLoose<T>(text: string): T {
  try {
    return JSON.parse(text) as T
  } catch {
    const a = text.indexOf('{')
    const b = text.lastIndexOf('}')
    if (a !== -1 && b > a) return JSON.parse(text.slice(a, b + 1)) as T
    throw new Error(`unparseable JSON from model: ${text.slice(0, 120)}`)
  }
}

// ------------------------------------------------------------ storyboard

const STORYBOARD_MODEL = process.env.CLIPCHAIN_LLM ?? 'openai/gpt-4o'

export async function storyboard(
  prompt: string,
  style: string | undefined,
  shots: number,
  secondsPerShot: number
): Promise<ClipPlan> {
  const text = await orChat(
    [
      {
        role: 'user',
        content: `You are a music-video director with a singular, recognizable point of view — think of directors whose 15 seconds you can identify without credits. Design a ${shots}-shot sequence (each shot ${secondsPerShot}s, generated by an AI video model) for this concept:

"${prompt}"
${style ? `Client's style direction (honor it, then sharpen it): ${style}` : ''}

THE MEDIUM ANCHOR LAW (non-negotiable): commit to ONE named real physical medium with a massive real photographic or art tradition — a specific stock, craft, era, or technique (e.g. "1982 anamorphic Kodak 5247 sci-fi noir", "hand-processed 16mm skate video", "Gregory Crewdson suburban tableau", "1948 three-strip Technicolor soundstage", "O. Winston Link flash-lit night documentary", "Pathé stencil-tinted nitrate"). The anchor is what makes frames read as photographed instead of generated. Not a mood — a reproducible recipe: film stock/sensor character, exact lens focal lengths, lighting sources that exist in the world, a 3-color palette with named roles for each color.

SECOND, invent a SIGNATURE — one unforgettable visual motif that appears in every shot and EVOLVES (an object, a light behavior, a compositional rule, a recurring gesture). This is the thing viewers remember.

THE AVERAGED AI AESTHETIC IS BANNED. Your client is a serious artist; treat them like the da Vincis and Banksys of their generation, not a content farm. Instant rejection for:
- cyberpunk-by-default: neon-drenched streets, purple-to-blue gradients, holographic UI, glowing circuitry — UNLESS the client's own words ask for it, and even then it must be anchored in a named real tradition, not "cyberpunk vibes"
- "epic cinematic" as a descriptor; generic drone/orbit establishing shots; slow-motion for its own sake
- lens flares + floating dust particles + volumetric god-rays as default atmosphere
- teal-and-orange grading; "8k", "trending", "hyper-detailed" filler vocabulary
- subjects staring into the distance while camera dollies in; "hooded figure"; "glowing eyes"
- abstract poetry in prompts ("a dance of light and shadow") — every sentence must be filmable
The test: could a working cinematographer in the anchor's era have lit and staged this frame? If not, cut it.

Rules:
- Every shot obeys the STYLE BIBLE paragraph (palette, stock, lenses, lighting grammar, world, signature).
- Shots flow: each opens on the previous shot's closing frame (the generator is seeded with that exact frame). Write the handoff into the prompts.
- Escalate with intent: shot N must change something structural (scale, speed, proximity, light state) — not just "more".
- Each shot prompt: 2-4 sentences, concrete film grammar — subject + action, shot size, lens mm, camera move with motivation, light source. Specify what the SIGNATURE does in this shot.

Output ONLY JSON:
{
  "title": "...",
  "art_direction": "the named direction in one line",
  "signature": "the recurring motif and how it evolves",
  "style_bible": "one paragraph, reused verbatim in every generation — includes palette, stock, lenses, lighting, signature",
  "shots": [ { "name": "...", "prompt": "...", "camera": "..." } ]
}
Exactly ${shots} shots.`,
      },
    ],
    STORYBOARD_MODEL
  )
  const plan = parseJsonLoose<ClipPlan>(text)
  if (!Array.isArray(plan.shots) || plan.shots.length === 0) {
    throw new Error('storyboard returned no shots')
  }
  plan.shots = plan.shots.slice(0, shots)
  return enforceAntiTrope(plan, prompt, style)
}

// ------------------------------------------------- anti-trope enforcement

// The averaged AI aesthetic, detectable as vocabulary. Case-insensitive.
const TROPE_PATTERNS: [RegExp, string][] = [
  [/\bcyber\s?punk\b/i, 'cyberpunk-by-default'],
  [/\bneon[\s-]?(lit|soaked|drenched|glow\w*|sign\w*)?\b/i, 'neon-as-atmosphere'],
  [/\bholograph\w+/i, 'holographic UI'],
  [/\bglowing\s+(eyes|circuit\w*|rune\w*|particle\w*|energy)\b/i, 'glowing filler'],
  [/\bvolumetric\b/i, 'volumetric god-rays'],
  [/\bepic\s+cinematic\b/i, 'epic-cinematic filler'],
  [/\b(8k|hyper[\s-]?detailed|trending\s+on)\b/i, 'resolution filler vocabulary'],
  [/\bhooded\s+figure\b/i, 'hooded figure'],
  [/\bteal[\s-]?(and|&)[\s-]?orange\b/i, 'teal-and-orange grade'],
  [/\bpurple\b[^.]{0,40}\bblue\b|\bblue\b[^.]{0,40}\bpurple\b/i, 'purple-to-blue gradient'],
]

/** Trope labels present in the plan that the client's own words did not ask for. */
function unexcusedTropes(plan: ClipPlan, clientAsked: string): string[] {
  const corpus = [
    plan.art_direction ?? '',
    plan.style_bible,
    ...plan.shots.map((s) => `${s.prompt} ${s.camera ?? ''}`),
  ].join('\n')
  const hits: string[] = []
  for (const [re, label] of TROPE_PATTERNS) {
    if (re.test(corpus) && !re.test(clientAsked)) hits.push(label)
  }
  return hits
}

/**
 * If the drafted plan leaks the averaged AI aesthetic the CLIENT didn't ask
 * for, run one bounded repair pass that re-anchors it in a real tradition.
 * Clean plans (the common case) cost nothing extra. Repair failures fall
 * back to the original draft — the artist can still edit it on the board.
 */
async function enforceAntiTrope(
  plan: ClipPlan,
  prompt: string,
  style: string | undefined
): Promise<ClipPlan> {
  const clientAsked = `${prompt} ${style ?? ''}`
  const violations = unexcusedTropes(plan, clientAsked)
  if (violations.length === 0) return plan

  try {
    const text = await orChat(
      [
        {
          role: 'user',
          content: `You are the art-direction enforcer for serious artists. This storyboard leaked the averaged AI aesthetic — the client did NOT ask for any of it. Violations detected: ${violations.join('; ')}.

REWRITE the storyboard to purge every violation. Re-anchor the whole world in ONE named real physical medium with a real photographic or art tradition (a specific stock, craft, era, or technique a working cinematographer could reproduce). Keep the client's concept, the shot structure, the shot count, and the signature motif's ROLE — change only the visual world and the vocabulary. Every sentence must be filmable in the anchor's era.

CLIENT CONCEPT: "${prompt}"
${style ? `CLIENT STYLE DIRECTION: ${style}` : ''}

CURRENT STORYBOARD (JSON):
${JSON.stringify(plan, null, 1)}

Output ONLY the corrected JSON with the same schema and exactly ${plan.shots.length} shots.`,
        },
      ],
      STORYBOARD_MODEL
    )
    const repaired = parseJsonLoose<ClipPlan>(text)
    if (!Array.isArray(repaired.shots) || repaired.shots.length !== plan.shots.length) {
      return plan
    }
    // Only accept the repair if it actually cleaned the leak.
    return unexcusedTropes(repaired, clientAsked).length < violations.length
      ? repaired
      : plan
  } catch (err) {
    console.warn('[clipchain] anti-trope repair skipped:', err)
    return plan
  }
}

// -------------------------------------------------- track-driven boarding

const AUDIO_MODEL = process.env.CLIPCHAIN_AUDIO_MODEL ?? 'google/gemini-2.5-flash'

const ANALYZE_TRACK_PROMPT = `You are a music supervisor mapping a track for a music film. Listen to the ENTIRE track. Output ONLY JSON:
{
  "durationSec": <number, total length in seconds>,
  "sections": [
    {
      "label": "INTRO | VERSE 1 | PRE-CHORUS | CHORUS 1 | VERSE 2 | BRIDGE | DROP | OUTRO ...",
      "start": <seconds>,
      "end": <seconds>,
      "lyrics": "the words actually heard in this section, verbatim as best you can; empty string if instrumental",
      "energy": "one word: sparse | building | driving | explosive | falling | still",
      "imagery": "concrete visual cues THIS sound suggests — instruments, texture, pace, mood as filmable images, one sentence"
    }
  ]
}
Sections must tile the whole track in order (no gaps, no overlaps). Be precise about where choruses repeat — repeated choruses should share the same base label with a number.`

/**
 * Listen to an uploaded track and return its timed structure map.
 * This is what makes the film come FROM the song instead of sitting under it.
 */
export async function analyzeTrack(audioPath: string): Promise<TrackMap> {
  const [buf] = await adminStorage().bucket().file(audioPath).download()
  const ext = (audioPath.split('.').pop() ?? 'mp3').toLowerCase()
  const format = ext === 'm4a' || ext === 'aac' ? 'mp4' : ext
  const text = await orChat(
    [
      {
        role: 'user',
        content: [
          { type: 'text', text: ANALYZE_TRACK_PROMPT },
          {
            type: 'input_audio',
            input_audio: { data: Buffer.from(buf).toString('base64'), format },
          },
        ],
      },
    ],
    AUDIO_MODEL
  )
  const map = parseJsonLoose<TrackMap>(text)
  if (!map.durationSec || !Array.isArray(map.sections) || map.sections.length === 0) {
    throw new Error('track analysis returned no structure')
  }
  map.sections = map.sections.slice(0, 40)
  return map
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Which sections overlap a [start, end) window, with their lyrics. */
function windowBrief(track: TrackMap, start: number, end: number): string {
  const hits = track.sections.filter((s) => s.start < end && s.end > start)
  if (hits.length === 0) return 'instrumental'
  return hits
    .map((s) => `${s.label} (${s.energy ?? ''}): ${s.lyrics?.trim() || '[instrumental]'}${s.imagery ? ` | sound suggests: ${s.imagery}` : ''}`)
    .join(' / ')
}

/**
 * Storyboard FROM the track: one shot per timed window, each reflecting its
 * window's lyrics and energy. The shot count comes from the song's length,
 * not a dial — the film is the shape of the song.
 */
export async function storyboardFromTrack(
  prompt: string,
  style: string | undefined,
  track: TrackMap,
  secondsPerShot: number
): Promise<ClipPlan> {
  const shots = Math.max(2, Math.min(25, Math.round(track.durationSec / secondsPerShot)))
  const windows = Array.from({ length: shots }, (_, i) => {
    const start = i * secondsPerShot
    const end = Math.min((i + 1) * secondsPerShot, track.durationSec)
    return {
      i: i + 1,
      window: `${fmtTime(start)}–${fmtTime(end)}`,
      brief: windowBrief(track, start, end),
    }
  })

  const text = await orChat(
    [
      {
        role: 'user',
        content: `You are a music-video director designing the definitive film FOR this exact song — the song is the score, the script, and the clock. Concept from the artist:

"${prompt}"
${style ? `Artist's style direction (honor it, then sharpen it): ${style}` : ''}

THE SONG, mapped (total ${fmtTime(track.durationSec)}):
${JSON.stringify(track.sections, null, 1)}

THE ${shots} TIMED WINDOWS — one shot each, ${secondsPerShot}s per shot, in order:
${windows.map((w) => `SHOT ${w.i} [${w.window}]: ${w.brief}`).join('\n')}

THE MEDIUM ANCHOR LAW (non-negotiable): commit to ONE named real physical medium with a massive real photographic or art tradition — a specific stock, craft, era, or technique. Not a mood — a reproducible recipe: film stock/sensor character, exact lens focal lengths, lighting sources that exist in the world, a 3-color palette with named roles. The averaged AI aesthetic is BANNED (cyberpunk-by-default, neon atmosphere, purple-to-blue gradients, "epic cinematic" filler) unless the artist's own words asked for it. The test: could a working cinematographer in the anchor's era have lit and staged this frame?

SECOND, invent a SIGNATURE — one motif that appears in every shot and EVOLVES with the song's energy arc.

RULES OF FUSION:
- Each shot serves ITS window: verses breathe, pre-choruses build, choruses land the film's biggest recurring image. Repeated choruses must RHYME visually — same location or motif, escalated.
- Lyrics are subtext, not subtitles: never render words on screen; translate what the words mean into what the camera sees.
- Shots flow: each opens on the previous shot's closing frame (the generator is seeded with that exact frame). Write the handoff into the prompts.
- Each shot prompt: 2-4 sentences of concrete film grammar — subject + action, shot size, lens mm, camera move with motivation, light source, what the SIGNATURE does.

Output ONLY JSON:
{
  "title": "...",
  "art_direction": "the named direction in one line",
  "signature": "the recurring motif and how it evolves with the song",
  "style_bible": "one paragraph, reused verbatim in every generation",
  "shots": [ { "name": "...", "prompt": "...", "camera": "...", "window": "M:SS–M:SS · SECTION LABEL" } ]
}
Exactly ${shots} shots, in window order.`,
      },
    ],
    STORYBOARD_MODEL
  )
  const plan = parseJsonLoose<ClipPlan>(text)
  if (!Array.isArray(plan.shots) || plan.shots.length === 0) {
    throw new Error('track storyboard returned no shots')
  }
  plan.shots = plan.shots.slice(0, shots)
  return enforceAntiTrope(plan, prompt, style)
}

// ------------------------------------------------------------- analyzers

const OMNI_MODEL = process.env.CLIPCHAIN_OMNI ?? 'openai/gpt-4o'
const NANO_MODEL = process.env.CLIPCHAIN_NANO ?? 'google/gemini-2.5-flash'

const ANALYZER_PROMPT = `You are a film continuity supervisor. This is the FINAL frame of the previous shot; the next shot will be generated starting from it. Report exactly what must stay consistent. Output ONLY JSON:
{
  "subject": "main character/subject: appearance, wardrobe, distinguishing details",
  "environment": "location, architecture, weather, key objects and their positions",
  "lighting": "sources, direction, color temperature",
  "palette": "dominant colors",
  "camera": "apparent lens, angle, height, distance from subject",
  "style_keywords": ["5-8", "short", "style", "tags"]
}`

interface ContinuityReport {
  subject?: string
  environment?: string
  lighting?: string
  palette?: string
  camera?: string
  style_keywords?: string[]
}

async function analyzeFrame(frameUrl: string, model: string): Promise<ContinuityReport | null> {
  try {
    const text = await orChat(
      [
        {
          role: 'user',
          content: [
            { type: 'text', text: ANALYZER_PROMPT },
            { type: 'image_url', image_url: { url: frameUrl } },
          ],
        },
      ],
      model
    )
    return parseJsonLoose<ContinuityReport>(text)
  } catch (err) {
    console.warn(`[clipchain] analyzer ${model} skipped:`, err)
    return null
  }
}

function continuityBlock(omni: ContinuityReport | null, nano: ContinuityReport | null): string {
  const merged: ContinuityReport = { ...(omni ?? {}) }
  if (nano) {
    for (const k of Object.keys(nano) as (keyof ContinuityReport)[]) {
      if (k === 'style_keywords') {
        merged.style_keywords = Array.from(
          new Set([...(omni?.style_keywords ?? []), ...(nano.style_keywords ?? [])])
        ).slice(0, 10)
      } else if (
        nano[k] &&
        String(nano[k]).length > String(merged[k] ?? '').length
      ) {
        merged[k] = nano[k] as never
      }
    }
  }
  return [
    `SUBJECT (keep identical): ${merged.subject ?? ''}`,
    `ENVIRONMENT (continues): ${merged.environment ?? ''}`,
    `LIGHTING: ${merged.lighting ?? ''}`,
    `PALETTE: ${merged.palette ?? ''}`,
    `CAMERA PICKS UP FROM: ${merged.camera ?? ''}`,
    `STYLE: ${(merged.style_keywords ?? []).join(', ')}`,
  ].join('\n')
}

// --------------------------------------------------------- video backend

const VIDEO_MODEL = process.env.CLIPCHAIN_VIDEO_MODEL ?? 'bytedance/seedance-2.0-fast'

async function submitShot(
  prompt: string,
  duration: number,
  resolution: string,
  frameUrl?: string
): Promise<{ orId: string; pollUrl: string }> {
  const res = await fetch(`${OR_BASE}/videos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${orKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VIDEO_MODEL,
      prompt,
      duration,
      resolution,
      aspect_ratio: '16:9',
      generate_audio: false,
      ...(frameUrl
        ? {
            frame_images: [
              {
                type: 'image_url',
                image_url: { url: frameUrl },
                frame_type: 'first_frame',
              },
            ],
          }
        : {}),
    }),
  })
  if (!res.ok) {
    throw new Error(`video submit ${res.status}: ${(await res.text()).slice(0, 400)}`)
  }
  const job = await res.json()
  return {
    orId: job.id,
    pollUrl: job.polling_url ?? `${OR_BASE}/videos/${job.id}`,
  }
}

interface OrVideoStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  unsigned_urls?: string[]
  usage?: { cost?: number }
  error?: unknown
}

async function checkShot(pollUrl: string): Promise<OrVideoStatus> {
  const res = await fetch(pollUrl, {
    headers: { Authorization: `Bearer ${orKey()}` },
  })
  if (!res.ok) {
    // transient — report as still pending; the next poll retries
    return { status: 'in_progress' }
  }
  return (await res.json()) as OrVideoStatus
}

// ----------------------------------------------------- storage + ffmpeg

const bucketPath = (jobId: string, file: string) => `clipchain/${jobId}/${file}`

async function uploadPublic(
  jobId: string,
  file: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  // Firebase download-token URL instead of per-object ACLs: the bucket has
  // uniform bucket-level access, where makePublic() is forbidden. The token
  // is the capability — bucket stays private, the URL works forever.
  const bucket = adminStorage().bucket()
  const path = bucketPath(jobId, file)
  const blob = bucket.file(path)
  const token = randomUUID()
  await blob.save(data, {
    resumable: false,
    metadata: {
      contentType,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  })
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
}

async function downloadBuffer(url: string, auth = false): Promise<Buffer> {
  let res = await fetch(url, auth ? { headers: { Authorization: `Bearer ${orKey()}` } } : undefined)
  if (!res.ok && auth) res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status} from ${url.slice(0, 100)}`)
  return Buffer.from(await res.arrayBuffer())
}

async function ffmpegPath(): Promise<string> {
  const mod = await import('ffmpeg-static')
  const p = (mod.default ?? mod) as unknown as string
  if (p) {
    try {
      await access(p)
      return p
    } catch {
      // fall through — bundler rewrote the path to a location without the binary
    }
  }
  // Traced location in the deployed function (/var/task/node_modules/...).
  const fallback = join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg')
  await access(fallback).catch(() => {
    throw new Error('ffmpeg binary not found in bundle')
  })
  return fallback
}

async function extractLastFrame(videoBuf: Buffer, jobId: string, shotIndex: number): Promise<Buffer> {
  const dir = join(tmpdir(), 'clipchain')
  await mkdir(dir, { recursive: true })
  const vidPath = join(dir, `${jobId}-s${shotIndex}.mp4`)
  const framePath = join(dir, `${jobId}-s${shotIndex}.jpg`)
  await writeFile(vidPath, videoBuf)
  const ff = await ffmpegPath()
  await execFileAsync(ff, [
    '-hide_banner', '-loglevel', 'error',
    '-sseof', '-0.1', '-i', vidPath,
    '-frames:v', '1', '-q:v', '2', '-update', '1', '-y', framePath,
  ]).catch(async () => {
    // -sseof can land past the last frame; decode-through fallback
    await execFileAsync(ff, [
      '-hide_banner', '-loglevel', 'error',
      '-i', vidPath, '-frames:v', '999999', '-q:v', '2', '-update', '1', '-y', framePath,
    ])
  })
  const frame = await readFile(framePath)
  await Promise.all([unlink(vidPath).catch(() => {}), unlink(framePath).catch(() => {})])
  return frame
}

async function concatShots(job: ClipJob): Promise<Buffer> {
  const dir = join(tmpdir(), 'clipchain', job.id)
  await mkdir(dir, { recursive: true })
  const bucket = adminStorage().bucket()
  const locals: string[] = []
  for (let i = 0; i < job.shots.length; i++) {
    const shot = job.shots[i]
    if (!shot.storagePath) throw new Error(`shot ${i + 1} missing storagePath`)
    const local = join(dir, `shot-${i + 1}.mp4`)
    await bucket.file(shot.storagePath).download({ destination: local })
    locals.push(local)
  }
  const listPath = join(dir, 'concat.txt')
  await writeFile(
    listPath,
    locals.map((p) => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n')
  )
  const outPath = join(dir, 'final.mp4')
  const ff = await ffmpegPath()
  await execFileAsync(ff, [
    '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', listPath,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '24', '-an',
    '-movflags', '+faststart', '-y', outPath,
  ])

  const cleanup: string[] = [...locals, listPath, outPath]
  let finalPath = outPath

  // Audio underlay: the user's track (music, vocal, anything) laid under the
  // cut, trimmed to the video's length with a fade-out. Shots are generated
  // silent; the uploaded audio IS the soundtrack.
  if (job.audioPath) {
    const audioLocal = join(dir, 'track')
    await bucket.file(job.audioPath).download({ destination: audioLocal })
    const durationSec = job.shots.length * job.secondsPerShot
    const fadeStart = Math.max(0, durationSec - 1.2)
    const muxPath = join(dir, 'final-audio.mp4')
    await execFileAsync(ff, [
      '-hide_banner', '-loglevel', 'error',
      '-i', outPath, '-i', audioLocal,
      '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k',
      '-af', `afade=t=out:st=${fadeStart}:d=1.2`,
      '-t', String(durationSec),
      '-movflags', '+faststart', '-y', muxPath,
    ])
    cleanup.push(audioLocal, muxPath)
    finalPath = muxPath
  }

  const buf = await readFile(finalPath)
  await Promise.all(cleanup.map((p) => unlink(p).catch(() => {})))
  return buf
}

// ------------------------------------------------------------- the tick

function shotFullPrompt(job: ClipJob, index: number, continuity?: string): string {
  const shot = job.plan.shots[index]
  return [
    shot.prompt,
    shot.window ? `SONG WINDOW (this shot's beat in the track): ${shot.window}` : '',
    `Camera: ${shot.camera ?? 'as specified in the style bible'}`,
    job.plan.signature ? `SIGNATURE MOTIF (must appear): ${job.plan.signature}` : '',
    `STYLE BIBLE: ${job.plan.style_bible}`,
    continuity
      ? `\nCONTINUITY — the shot begins exactly at the provided frame; maintain:\n${continuity}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

// Nano Banana Pro by default — master frames are where consistency is won.
const IMAGE_MODEL = process.env.CLIPCHAIN_IMAGE_MODEL ?? 'google/gemini-3-pro-image'

/**
 * The SIGNAL BLOOM discipline: an image model renders the film's opening
 * master frame from the bible BEFORE any video is generated, and shot 1
 * seeds from it. The whole chain then inherits the image model's craft
 * instead of the video model's first guess. Failure returns undefined —
 * the film still generates, just unseeded.
 */
async function generateSeedFrame(job: ClipJob): Promise<string | undefined> {
  const shot = job.plan.shots[0]
  const prompt = [
    `A single cinematic film frame — the OPENING frame of a film. Render it as a real photographed frame in this exact visual world, nothing outside it.`,
    `STYLE BIBLE (absolute law): ${job.plan.style_bible}`,
    `THE FRAME: ${shot.prompt}`,
    shot.camera ? `Camera: ${shot.camera}` : '',
    `16:9 widescreen. No text, no titles, no watermarks, no borders. This frame is the first thing the audience sees — it must read as ${job.plan.art_direction ?? 'the named medium'} and nothing else.`,
  ]
    .filter(Boolean)
    .join('\n')
  const buf = await orImage(prompt, IMAGE_MODEL)
  if (!buf) return undefined
  return uploadPublic(job.id, 'seed-frame.jpg', buf, 'image/jpeg')
}

export async function startJob(job: ClipJob): Promise<void> {
  const seedUrl = await generateSeedFrame(job)
  const fullPrompt = shotFullPrompt(job, 0)
  const { orId, pollUrl } = await submitShot(
    fullPrompt,
    job.secondsPerShot,
    job.resolution,
    seedUrl
  )
  job.shots[0] = {
    name: job.plan.shots[0].name,
    fullPrompt,
    orId,
    pollUrl,
    frameUrl: seedUrl,
    attempts: 1,
    submittedAt: Date.now(),
    done: false,
  }
  job.message = seedUrl
    ? `Master frame set — shot 1/${job.plan.shots.length}: generating…`
    : `Shot 1/${job.plan.shots.length}: generating…`
  await saveJob(job)
}

/** Resubmit the job's current shot (same prompt, same seed frame). */
async function resubmitCurrentShot(job: ClipJob, reason: string): Promise<void> {
  const idx = job.current
  const existing = job.shots[idx]
  const attempts = existing?.attempts ?? 0
  if (attempts >= MAX_SHOT_ATTEMPTS) {
    throw new PermanentError(
      `Shot ${idx + 1} failed after ${attempts} attempts (${reason}). Completed shots are saved — resume to try again.`
    )
  }
  // Shot 1 reseeds from its master frame; later shots from the previous
  // shot's extracted last frame.
  const prevFrame = idx > 0 ? job.shots[idx - 1]?.frameUrl : job.shots[0]?.frameUrl
  const fullPrompt = existing?.fullPrompt ?? shotFullPrompt(job, idx)
  const { orId, pollUrl } = await submitShot(
    fullPrompt,
    job.secondsPerShot,
    job.resolution,
    prevFrame
  )
  job.shots[idx] = {
    name: job.plan.shots[idx].name,
    fullPrompt,
    orId,
    pollUrl,
    frameUrl: existing?.frameUrl,
    attempts: attempts + 1,
    submittedAt: Date.now(),
    done: false,
  }
  job.message = `Shot ${idx + 1}/${job.plan.shots.length}: retrying (attempt ${attempts + 1}/${MAX_SHOT_ATTEMPTS})…`
}

/**
 * Advance the job one bounded step. Called from the status route on every
 * client poll. Uses a soft lock so overlapping polls don't double-advance.
 */
export async function tickJob(job: ClipJob): Promise<ClipJob> {
  if (job.status === 'complete' || job.status === 'failed') return job

  const lock = lockKey(job.id)
  const held = await redisGet<number>(lock)
  if (held) return job // another tick in flight — just report current state
  await redisSet(lock, 1, 120)

  try {
    if (job.status === 'generating') {
      const shot = job.shots[job.current]
      if (!shot?.pollUrl) {
        await resubmitCurrentShot(job, 'never submitted')
        job.tickErrors = 0
        await saveJob(job)
        return job
      }

      const st = await checkShot(shot.pollUrl)
      if (st.status === 'failed') {
        // Provider-side failure: any billed cost is waste, then bounded resubmit.
        if (typeof st.usage?.cost === 'number' && st.usage.cost > 0) {
          job.wastedCost = (job.wastedCost ?? 0) + st.usage.cost
          await trackSpend(job.sessionId, st.usage.cost).catch(() => {})
        }
        await resubmitCurrentShot(job, 'provider reported failure')
        job.tickErrors = 0
        await saveJob(job)
        return job
      }
      if (st.status !== 'completed') {
        // Hung jobs count as failures too — resubmit past the timeout.
        if (shot.submittedAt && Date.now() - shot.submittedAt > SHOT_TIMEOUT_MS) {
          await resubmitCurrentShot(job, 'timed out')
        } else {
          job.message = `Shot ${job.current + 1}/${job.plan.shots.length}: ${st.status === 'pending' ? 'queued' : 'rendering'}…`
        }
        job.tickErrors = 0
        await saveJob(job)
        return job
      }

      // Shot finished: persist cost first (idempotent — a re-entered tick
      // must not meter the same shot twice).
      const srcUrl = st.unsigned_urls?.[0]
      if (!srcUrl) throw new Error('completed shot had no video url')
      if (typeof st.usage?.cost === 'number' && shot.cost === undefined) {
        shot.cost = st.usage.cost
        job.totalCost =
          (job.wastedCost ?? 0) +
          job.shots.reduce((sum, s) => sum + (s?.cost ?? 0), 0)
        await trackSpend(job.sessionId, st.usage.cost).catch(() => {})
        await saveJob(job)
      }
      const videoBuf = await downloadBuffer(srcUrl, true)
      const shotFile = `shot-${job.current + 1}.mp4`
      await uploadPublic(job.id, shotFile, videoBuf, 'video/mp4')
      shot.storagePath = bucketPath(job.id, shotFile)
      shot.done = true

      const isLast = job.current === job.plan.shots.length - 1
      if (!isLast) {
        // Frame → analyzers → next shot submit
        job.message = `Shot ${job.current + 1} done — analyzing continuity…`
        await saveJob(job)

        const frameBuf = await extractLastFrame(videoBuf, job.id, job.current + 1)
        const frameUrl = await uploadPublic(
          job.id,
          `frame-${job.current + 1}.jpg`,
          frameBuf,
          'image/jpeg'
        )
        shot.frameUrl = frameUrl

        const [omni, nano] = await Promise.all([
          analyzeFrame(frameUrl, OMNI_MODEL),
          analyzeFrame(frameUrl, NANO_MODEL),
        ])
        if (!omni && !nano) {
          console.warn('[clipchain] both analyzers failed — continuing on frame seed alone')
        }
        const next = job.current + 1
        const fullPrompt = shotFullPrompt(job, next, continuityBlock(omni, nano))
        const { orId, pollUrl } = await submitShot(
          fullPrompt,
          job.secondsPerShot,
          job.resolution,
          frameUrl
        )
        job.shots[next] = {
          name: job.plan.shots[next].name,
          fullPrompt,
          orId,
          pollUrl,
          attempts: 1,
          submittedAt: Date.now(),
          done: false,
        }
        job.current = next
        job.message = `Shot ${next + 1}/${job.plan.shots.length}: generating…`
        job.tickErrors = 0
        await saveJob(job)
        return job
      }

      // Last shot done → assemble now (still inside this tick)
      job.status = 'assembling'
      job.message = 'All shots done — assembling final cut…'
      await saveJob(job)
    }

    if (job.status === 'assembling') {
      const finalBuf = await concatShots(job)
      job.videoUrl = await uploadPublic(job.id, 'final.mp4', finalBuf, 'video/mp4')
      job.status = 'complete'
      job.message = 'Complete'
      await saveJob(job) // the clip is delivered no matter what billing does

      // Pay-per-delivery: card-on-file sessions are charged now, free-tier
      // sessions are not. Idempotent at the Stripe layer (key = jobId), so
      // a re-entered tick cannot double-charge.
      if (!job.charged) {
        const bill = await chargeForDeliveredClip(
          job.sessionId,
          job.id,
          job.shots.length,
          job.secondsPerShot
        )
        if (bill.charged) {
          job.charged = true
          job.chargedUsd = bill.amountUsd
        } else if (bill.error) {
          // Deliver anyway — a billing hiccup is our problem, not the artist's.
          job.billingError = bill.error
          console.warn(`[clipchain] billing failed for ${job.id}:`, bill.error)
        }
      }

      // Durable delivery: library entry (survives the session), then email.
      await saveClip(job.sessionId, {
        jobId: job.id,
        title: job.plan.title,
        videoUrl: job.videoUrl,
        seconds: job.shots.length * job.secondsPerShot,
        shots: job.shots.length,
        createdAt: Date.now(),
        billedUsd: job.chargedUsd,
      }).catch((err) => console.warn('[clipchain] library save failed:', err))
      if (job.email && !job.emailed) {
        job.emailed = await emailClip(
          job.email,
          job.plan.title,
          job.videoUrl,
          job.shots.length * job.secondsPerShot
        )
      }
    }

    job.tickErrors = 0
    await saveJob(job)
    return job
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const permanent = err instanceof PermanentError
    job.tickErrors = permanent ? MAX_TICK_ERRORS : (job.tickErrors ?? 0) + 1

    if (permanent || job.tickErrors >= MAX_TICK_ERRORS) {
      // Park, don't destroy: completed shots stay in storage and the job
      // stays resumable for its TTL.
      job.status = 'failed'
      job.error = msg
      const doneCount = job.shots.filter((s) => s?.done).length
      job.message =
        doneCount > 0
          ? `Failed on shot ${job.current + 1} — ${doneCount} finished shot${doneCount === 1 ? '' : 's'} saved. Resume to continue.`
          : 'Failed before any shot finished.'
      // Fair billing: nothing delivered → the clip doesn't count against
      // the user's daily allowance.
      if (doneCount === 0 && !job.refunded) {
        job.refunded = true
        await refundUsage(job.sessionId, 'clip_generations', 1).catch(() => {})
      }
    } else {
      job.message = `Transient hiccup (${job.tickErrors}/${MAX_TICK_ERRORS}) — retrying: ${msg.slice(0, 120)}`
    }
    await saveJob(job)
    return job
  } finally {
    await redisSet(lock, 0, 1)
  }
}

/**
 * Restart a parked (failed) job from its last completed shot. Completed
 * shots are never regenerated; the current shot is resubmitted with its
 * original prompt and seed frame. Does NOT re-count the user's allowance.
 */
export async function resumeJob(job: ClipJob): Promise<ClipJob> {
  if (job.status !== 'failed') return job

  job.error = undefined
  job.tickErrors = 0

  // A zero-delivery failure refunded the allowance; resuming revives the
  // clip, so it counts again.
  if (job.refunded) {
    job.refunded = false
    await trackUsage(job.sessionId, 'clip_generations', 1).catch(() => {})
  }

  // If the user resumes past the attempt cap, grant a fresh attempt budget —
  // resuming is an explicit choice, not a silent retry loop.
  let i = 0
  while (i < job.plan.shots.length && job.shots[i]?.done) i++

  if (i >= job.plan.shots.length) {
    job.status = 'assembling'
    job.message = 'All shots done — assembling final cut…'
    await saveJob(job)
    return job
  }

  // The seed frame for shot i is the last frame of shot i-1. If the crash
  // happened between upload and frame extraction, re-derive it from storage.
  if (i > 0) {
    const prev = job.shots[i - 1]
    if (prev && !prev.frameUrl && prev.storagePath) {
      const [buf] = await adminStorage().bucket().file(prev.storagePath).download()
      const frameBuf = await extractLastFrame(Buffer.from(buf), job.id, i)
      prev.frameUrl = await uploadPublic(job.id, `frame-${i}.jpg`, frameBuf, 'image/jpeg')
    }
  }

  const existing = job.shots[i]
  if (existing) existing.attempts = 0
  job.current = i
  await resubmitCurrentShot(job, 'resumed by user')
  job.status = 'generating'
  job.message = `Resumed — shot ${i + 1}/${job.plan.shots.length}: generating…`
  await saveJob(job)
  return job
}

/** Public projection — everything the UI needs, none of the internals. */
export function publicJob(job: ClipJob) {
  return {
    jobId: job.id,
    status: job.status,
    message: job.message,
    title: job.plan.title,
    artDirection: job.plan.art_direction,
    signature: job.plan.signature,
    shots: job.plan.shots.map((s, i) => ({
      name: s.name,
      done: job.shots[i]?.done ?? false,
      generating: i === job.current && job.status === 'generating',
      attempts: job.shots[i]?.attempts,
    })),
    videoUrl: job.videoUrl,
    totalCost: job.totalCost > 0 ? Number(job.totalCost.toFixed(2)) : undefined,
    billedUsd: job.chargedUsd,
    canResume: job.status === 'failed',
    error: job.error,
  }
}
