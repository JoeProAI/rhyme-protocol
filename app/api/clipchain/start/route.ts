import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { checkUsage, trackUsage, generateSessionId, getPaymentInfo } from '@/lib/usage-system'
import { redisGet } from '@/lib/redis'
import { storyboard, startJob, saveJob, publicJob, type ClipJob } from '@/lib/clipchain/engine'

// Owner-approved (Joe, 2026-07-23): premium coupon tiers unlock film scale
// without a card on file — invite-grade codes for artists the house backs.
// Film-scale coupon sessions are not billed (no card); generation cost is
// the house's spend, same as the free tier.
const FILM_SCALE_TIERS = ['VIP', 'UTOPIA', 'PRODUCER']

// Redemptions before this moment came from codes that were hardcoded in this
// public repo — leaked by definition. Only redemptions of the new env-var
// codes (after the rotation deploy) may unlock film scale.
const FILM_SCALE_COUPON_EPOCH = '2026-07-23T05:00:00.000Z'

async function hasFilmScaleCoupon(sessionId: string): Promise<boolean> {
  const coupon = await redisGet<{ tier?: string; expiresAt?: string; redeemedAt?: string }>(
    `coupon:user:${sessionId}`
  )
  if (!coupon?.tier || !FILM_SCALE_TIERS.includes(coupon.tier)) return false
  if (!coupon.redeemedAt || coupon.redeemedAt < FILM_SCALE_COUPON_EPOCH) return false
  return !coupon.expiresAt || new Date(coupon.expiresAt) > new Date()
}

export const runtime = 'nodejs'
export const maxDuration = 60 // storyboard + first shot submit

const PlanSchema = z.object({
  title: z.string().min(1).max(120),
  art_direction: z.string().max(300).optional(),
  signature: z.string().max(400).optional(),
  style_bible: z.string().min(20, 'Style bible is too thin to hold shots together').max(2000),
  shots: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        prompt: z.string().min(20, 'Each shot prompt needs real direction').max(1200),
        camera: z.string().max(300).optional(),
        window: z.string().max(120).optional(),
        dialogue: z
          .object({
            character: z.string().min(1).max(60),
            line: z.string().min(1).max(300),
          })
          .optional(),
      })
    )
    .min(2)
    .max(25),
  cast: z
    .array(
      z.object({
        character: z.string().min(1).max(60),
        voiceId: z.string().min(1).max(80),
      })
    )
    .max(8)
    .optional(),
})

const BodySchema = z.object({
  prompt: z.string().min(8, 'Describe your clip in at least a few words').max(600),
  style: z.string().max(400).optional(),
  // Board flow: a user-edited storyboard skips the LLM and generates exactly
  // what's on the cards.
  plan: PlanSchema.optional(),
  // From /api/clipchain/audio — the soundtrack laid under the final cut.
  audioPath: z.string().max(300).optional(),
  secondsPerShot: z.union([z.literal(5), z.literal(10), z.literal(15)]).optional(),
  // Where to send the finished film. Optional — the library keeps it either way.
  email: z.string().email().max(254).optional(),
})

const SHOTS = 3
const SECONDS_PER_SHOT = 5
const RESOLUTION = '720p'

// Free tier stays small. Anything bigger — more shots or longer shots — is
// film scale: card on file required, billed per shot-second on delivery.
const FREE_MAX_SHOTS = 4
const FREE_MAX_SECONDS = 5

/**
 * POST /api/clipchain/start
 * Gate → storyboard → submit shot 1 → return jobId for polling.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }
    const { prompt, style, plan: editedPlan, audioPath, secondsPerShot = SECONDS_PER_SHOT, email } = parsed.data

    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    const isNewSession = !sessionId
    if (!sessionId) sessionId = generateSessionId()

    // An upload may only be attached by the session that made it.
    if (audioPath && !audioPath.startsWith(`clipchain/uploads/${sessionId}/`)) {
      return NextResponse.json({ error: 'Audio not found for this session' }, { status: 403 })
    }

    const shotCount = editedPlan?.shots.length ?? SHOTS
    const filmScale = shotCount > FREE_MAX_SHOTS || secondsPerShot > FREE_MAX_SECONDS
    if (filmScale) {
      const payment = await getPaymentInfo(sessionId)
      if (!payment.has_payment && !(await hasFilmScaleCoupon(sessionId))) {
        return NextResponse.json(
          {
            error: 'limit',
            message: `Film scale (${shotCount} shots × ${secondsPerShot}s) needs a card on file — billed per delivered clip, never for failed runs.`,
            upgrade_url: '/add-card',
            shareType: 'clip_generations',
          },
          { status: 402 }
        )
      }
    }

    // The paygate: 1 free clip/day, share-to-X earns more, card = unlimited.
    const gate = await checkUsage(sessionId, 'clip_generations')
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: 'limit',
          message: gate.reason ?? 'Daily clip limit reached.',
          upgrade_url: gate.upgrade_url ?? '/add-card',
          shareType: 'clip_generations',
        },
        { status: 402 }
      )
    }

    const plan = editedPlan ?? (await storyboard(prompt, style, SHOTS, SECONDS_PER_SHOT))

    const job: ClipJob = {
      id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      sessionId,
      createdAt: Date.now(),
      status: 'generating',
      message: 'Storyboard locked — starting shot 1…',
      prompt,
      style,
      plan,
      shots: [],
      current: 0,
      secondsPerShot,
      resolution: RESOLUTION,
      audioPath,
      email,
      totalCost: 0,
    }

    await startJob(job)
    await saveJob(job)

    // Count it at start — the expensive spend begins with shot 1.
    await trackUsage(sessionId, 'clip_generations', 1)

    const res = NextResponse.json(publicJob(job))
    if (isNewSession) {
      res.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      })
    }
    return res
  } catch (error) {
    console.error('[clipchain] start failed:', error)
    return NextResponse.json(
      { error: 'Failed to start clip generation. Try again in a minute.' },
      { status: 500 }
    )
  }
}
