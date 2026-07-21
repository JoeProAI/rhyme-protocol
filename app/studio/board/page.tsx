'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * PIPELINE_BOARD — the ComfyUI-spirit builder, without the noodles.
 * A stage rail across the top (Concept → Storyboard → Shots → Final cut),
 * an editable style-bible sidebar, and shot cards that go live during
 * generation. Storyboarding is free; money is only spent after LOCK.
 */

type Stage = 'concept' | 'board' | 'shots' | 'final'

interface PlannedShot {
  name: string
  prompt: string
  camera?: string
  window?: string
}

interface TrackSection {
  label: string
  start: number
  end: number
  lyrics?: string
  energy?: string
  imagery?: string
}

interface TrackMap {
  durationSec: number
  sections: TrackSection[]
}

interface ClipPlan {
  title: string
  art_direction?: string
  signature?: string
  style_bible: string
  shots: PlannedShot[]
}

interface ShotStatus {
  name: string
  done: boolean
  generating: boolean
  attempts?: number
}

interface JobView {
  jobId: string
  status: 'generating' | 'assembling' | 'complete' | 'failed'
  message: string
  title?: string
  artDirection?: string
  signature?: string
  shots: ShotStatus[]
  videoUrl?: string
  totalCost?: number
  billedUsd?: number
  canResume?: boolean
  error?: string
}

const FALLBACK_RATE_CENTS = 35
const FREE_MAX_SHOTS = 4
const FREE_MAX_SECONDS = 5

interface ClipProduct {
  id: string
  label: string
  shots: number
  secondsPerShot: 5 | 10 | 15
  seconds: number
  priceCents: number
  filmScale: boolean
}

const ACCENT = '#C9A227'

const STYLE_PRESETS = [
  { id: 'minidv', label: 'MiniDV Cyberpunk', style: '1995 miniDV camcorder cyberpunk dystopia with a heavy color grade' },
  { id: '16mm', label: '16mm Street', style: 'hand-processed 16mm film with skate-video energy, visible grain and light leaks' },
  { id: 'tableau', label: 'Staged Tableau', style: 'Gregory Crewdson-style staged suburban tableau, sodium vapor and window light' },
  { id: 'crt', label: 'CRT Broadcast', style: 'CRT-scanline analog broadcast look with video noise and timestamp burn-in' },
  { id: 'anamorphic', label: '80s Anamorphic', style: '1982 anamorphic Kodak sci-fi noir, practical lights only' },
]

const STAGES: { key: Stage; num: string; label: string }[] = [
  { key: 'concept', num: '01', label: 'CONCEPT' },
  { key: 'board', num: '02', label: 'STORYBOARD' },
  { key: 'shots', num: '03', label: 'SHOTS' },
  { key: 'final', num: '04', label: 'FINAL CUT' },
]

const inputCls =
  'w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:opacity-50'

export default function PipelineBoardPage() {
  const [stage, setStage] = useState<Stage>('concept')
  const [prompt, setPrompt] = useState('')
  const [preset, setPreset] = useState<string | null>(null)
  const [shotCount, setShotCount] = useState(3)
  const [secondsPerShot, setSecondsPerShot] = useState<5 | 10 | 15>(5)
  const [audio, setAudio] = useState<{ path: string; name: string } | null>(null)
  const [track, setTrack] = useState<TrackMap | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [email, setEmail] = useState('')
  const [uploading, setUploading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [rateCents, setRateCents] = useState(FALLBACK_RATE_CENTS)
  const [products, setProducts] = useState<ClipProduct[]>([])
  const [plan, setPlan] = useState<ClipPlan | null>(null)
  const [job, setJob] = useState<JobView | null>(null)
  const [drafting, setDrafting] = useState(false)
  const [locking, setLocking] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [gateMessage, setGateMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [shared, setShared] = useState(false)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current) }, [])

  // Live pricing — one server-side rate that tracks Seedance cost down.
  useEffect(() => {
    fetch('/api/clipchain/pricing')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.perSecondCents) setRateCents(d.perSecondCents)
        if (Array.isArray(d?.products)) setProducts(d.products)
      })
      .catch(() => {})
  }, [])

  const flatPrice = (shots: number, seconds: number) =>
    ((shots * seconds * rateCents) / 100).toFixed(2)

  const styleText = preset ? STYLE_PRESETS.find((p) => p.id === preset)?.style : undefined

  const uploadAudio = async (file: File) => {
    setUploading(true)
    setErrorMessage('')
    setTrack(null)
    try {
      const form = new FormData()
      form.append('audio', file)
      const res = await fetch('/api/clipchain/audio', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setAudio({ path: data.audioPath, name: data.name })
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Map the song's structure so the storyboard is drafted FROM it.
  const analyzeAudio = async () => {
    if (!audio || analyzing) return
    setAnalyzing(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/clipchain/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioPath: audio.path }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      const t: TrackMap = data.track
      setTrack(t)
      // The film takes the shape of the song: 15s shots across its length.
      setSecondsPerShot(15)
      setShotCount(Math.max(2, Math.min(25, Math.round(t.durationSec / 15))))
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  // ---------------------------------------------------------------- concept

  const draftStoryboard = async (redraft = false) => {
    if (!prompt.trim() || drafting) return
    setDrafting(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/clipchain/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: styleText,
          shots: Math.min(shotCount, 12),
          secondsPerShot,
          track: track ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Storyboarding failed')
      setPlan(data.plan)
      if (!redraft) setStage('board')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Storyboarding failed')
    } finally {
      setDrafting(false)
    }
  }

  // ------------------------------------------------------------------ board

  const updateShot = (i: number, patch: Partial<PlannedShot>) => {
    if (!plan) return
    const shots = plan.shots.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    setPlan({ ...plan, shots })
  }

  // Bring your own board: paste a plan JSON, or a bare array of shots
  // ({ name?, prompt, camera? } — film-workflow boards map straight in).
  const importBoard = () => {
    setErrorMessage('')
    try {
      const raw = JSON.parse(importText) as unknown
      const shotsIn = Array.isArray(raw)
        ? raw
        : (raw as { shots?: unknown[] }).shots
      if (!Array.isArray(shotsIn) || shotsIn.length < 2 || shotsIn.length > 25) {
        throw new Error('Need 2-25 shots')
      }
      const shots: PlannedShot[] = shotsIn.map((s, i) => {
        const o = s as Record<string, unknown>
        const promptText = typeof o.prompt === 'string' ? o.prompt : ''
        if (promptText.length < 20) throw new Error(`Shot ${i + 1} has no usable prompt`)
        return {
          name:
            typeof o.name === 'string' && o.name
              ? o.name
              : typeof o.location === 'string' && o.location
                ? o.location
                : `Shot ${i + 1}`,
          prompt: promptText,
          camera: typeof o.camera === 'string' ? o.camera : undefined,
        }
      })
      const base = !Array.isArray(raw) ? (raw as Partial<ClipPlan>) : {}
      setPlan({
        title: typeof base.title === 'string' && base.title ? base.title : 'Imported board',
        art_direction: typeof base.art_direction === 'string' ? base.art_direction : undefined,
        signature: typeof base.signature === 'string' ? base.signature : undefined,
        style_bible:
          typeof base.style_bible === 'string' && base.style_bible.length >= 20
            ? base.style_bible
            : 'Every shot obeys the imported board exactly as written; no added style.',
        shots,
      })
      setShotCount(shots.length)
      setImportOpen(false)
      setImportText('')
      setStage('board')
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? `Import failed: ${err.message}` : 'Import failed: invalid JSON'
      )
    }
  }

  const lockAndGenerate = async () => {
    if (!plan || locking) return
    setLocking(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/clipchain/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || plan.title,
          style: styleText,
          plan,
          audioPath: audio?.path,
          secondsPerShot,
          email: email.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.status === 402) {
        setGateMessage(data.message || 'Daily clip limit reached.')
        setLocking(false)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed to start')
      setJob(data)
      setStage('shots')
      pollRef.current = setTimeout(() => poll(data.jobId), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start')
    } finally {
      setLocking(false)
    }
  }

  // ------------------------------------------------------------------ shots

  const poll = async (jobId: string) => {
    try {
      const res = await fetch(`/api/clipchain/status/${jobId}`)
      const data: JobView = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Status check failed')
      setJob(data)
      if (data.status === 'complete') {
        setStage('final')
        return
      }
      if (data.status === 'failed') return // resume button renders; polling stops
      pollRef.current = setTimeout(() => poll(jobId), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lost contact with the job')
    }
  }

  const resume = async () => {
    if (!job || resuming) return
    setResuming(true)
    setErrorMessage('')
    try {
      const res = await fetch(`/api/clipchain/resume/${job.jobId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Resume failed')
      setJob(data)
      pollRef.current = setTimeout(() => poll(data.jobId), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Resume failed')
    } finally {
      setResuming(false)
    }
  }

  const handleShare = async () => {
    const text = encodeURIComponent(
      `Storyboarded and generated this on the @rhymeprotocol pipeline board — every shot directed, chained, and continuity-locked.\n\nrhymeprotocol.com/studio/board`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener')
    try {
      const res = await fetch('/api/usage/share-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clip_generations', source: 'x' }),
      })
      if (res.ok) setShared(true)
    } catch {
      /* bonus is best-effort */
    }
  }

  const stageIndex = STAGES.findIndex((s) => s.key === stage)

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-2 font-mono text-xs tracking-[0.3em]" style={{ color: ACCENT }}>
          STUDIO / PIPELINE_BOARD
        </div>
        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Direct it shot by shot.
        </h1>

        {/* ------------------------------------------------ stage rail */}
        <nav aria-label="Pipeline stages" className="mb-10 flex items-center gap-0 overflow-x-auto">
          {STAGES.map((s, i) => {
            const active = s.key === stage
            const done = i < stageIndex
            return (
              <div key={s.key} className="flex items-center">
                {i > 0 && (
                  <div
                    className="h-px w-8 sm:w-14"
                    style={{ background: done || active ? ACCENT : '#27272a' }}
                  />
                )}
                <div
                  aria-current={active ? 'step' : undefined}
                  className="flex items-center gap-2 rounded-md border px-3 py-2"
                  style={{
                    borderColor: active ? ACCENT : done ? 'rgba(201,162,39,0.4)' : '#27272a',
                    background: active ? 'rgba(201,162,39,0.08)' : 'transparent',
                  }}
                >
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: active || done ? ACCENT : '#52525b' }}
                  >
                    {done ? '✓' : s.num}
                  </span>
                  <span
                    className="whitespace-nowrap text-xs font-medium tracking-wider"
                    style={{ color: active ? '#f4f4f5' : done ? '#a1a1aa' : '#52525b' }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </nav>

        {/* ------------------------------------------------ 01 CONCEPT */}
        {stage === 'concept' && (
          <section aria-label="Concept">
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Describe the film. The director model drafts a storyboard — art direction,
              a signature motif, and every shot written out. Drafting is free; you edit
              everything before a single frame is generated.
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={drafting}
              rows={3}
              maxLength={600}
              placeholder="A boxer wraps her hands in a flooded gym as the lights flicker on, round bell echoing…"
              className={inputCls}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPreset(preset === s.id ? null : s.id)}
                  disabled={drafting}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50"
                  style={
                    preset === s.id
                      ? { borderColor: ACCENT, color: ACCENT, background: 'rgba(201,162,39,0.08)' }
                      : { borderColor: '#27272a', color: '#a1a1aa' }
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-1 font-mono text-[10px] tracking-[0.25em]" style={{ color: ACCENT }}>
                SOUNDTRACK
              </div>
              <p className="mb-3 text-xs text-zinc-500">
                Your audio under the final cut — a track, a verse, a voicemail, sound design.
                Doesn&apos;t have to be music. Stored private, never published.
              </p>
              {audio ? (
                <div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-200">{audio.name}</span>
                    <button
                      onClick={() => {
                        setAudio(null)
                        setTrack(null)
                      }}
                      className="text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
                    >
                      remove
                    </button>
                  </div>
                  {track ? (
                    <div className="mt-3 rounded-md border border-zinc-800 p-3">
                      <div className="font-mono text-[10px]" style={{ color: ACCENT }}>
                        TRACK MAPPED — the film will follow the song
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {Math.floor(track.durationSec / 60)}:{String(Math.floor(track.durationSec % 60)).padStart(2, '0')} ·{' '}
                        {track.sections.length} sections ·{' '}
                        {track.sections.map((s) => s.label).join(' → ')}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={analyzeAudio}
                      disabled={analyzing}
                      className="mt-3 rounded-lg border px-4 py-2 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50"
                      style={{ borderColor: ACCENT, color: ACCENT }}
                    >
                      {analyzing ? 'LISTENING…' : 'MAP THE TRACK — FREE'}
                    </button>
                  )}
                </div>
              ) : (
                <label className="inline-block cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition focus-within:ring-1 focus-within:ring-zinc-400"
                  style={{ borderColor: '#3f3f46', color: '#a1a1aa' }}
                >
                  {uploading ? 'UPLOADING…' : 'ADD AUDIO (OPTIONAL)'}
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) uploadAudio(f)
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>
            {products.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-zinc-500">
                  FLAT PRICES — TRACK SEEDANCE COST DOWN
                </div>
                <div className="flex flex-wrap gap-2">
                  {products.map((p) => {
                    const active = shotCount === p.shots && secondsPerShot === p.secondsPerShot
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setShotCount(p.shots)
                          setSecondsPerShot(p.secondsPerShot)
                        }}
                        disabled={drafting}
                        aria-pressed={active}
                        className="rounded-lg border px-4 py-2 text-left text-xs transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50"
                        style={
                          active
                            ? { borderColor: ACCENT, background: 'rgba(201,162,39,0.08)' }
                            : { borderColor: '#27272a' }
                        }
                      >
                        <div className="font-bold" style={{ color: active ? ACCENT : '#e4e4e7' }}>
                          {p.label} — ${(p.priceCents / 100).toFixed(2)} flat
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-zinc-500">
                          {p.shots} shots × {p.secondsPerShot}s = {p.seconds}s
                          {p.filmScale ? ' · card required' : ' · free tier eligible'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-500">Shots:</span>
              {[2, 3, 4, 8, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => setShotCount(n)}
                  disabled={drafting}
                  aria-pressed={shotCount === n}
                  className="rounded-md border px-3 py-1.5 font-mono text-xs transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50"
                  style={
                    shotCount === n
                      ? { borderColor: ACCENT, color: ACCENT }
                      : { borderColor: '#27272a', color: '#a1a1aa' }
                  }
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-zinc-500">Length:</span>
              {([5, 10, 15] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSecondsPerShot(s)}
                  disabled={drafting}
                  aria-pressed={secondsPerShot === s}
                  className="rounded-md border px-3 py-1.5 font-mono text-xs transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50"
                  style={
                    secondsPerShot === s
                      ? { borderColor: ACCENT, color: ACCENT }
                      : { borderColor: '#27272a', color: '#a1a1aa' }
                  }
                >
                  {s}s
                </button>
              ))}
              <span className="text-xs text-zinc-600">
                = {shotCount * secondsPerShot}s film
                {(shotCount > FREE_MAX_SHOTS || secondsPerShot > FREE_MAX_SECONDS) &&
                  ' · film scale, card required'}
              </span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setImportOpen(!importOpen)}
                className="text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
              >
                {importOpen ? 'close board import' : 'already have a board? import JSON'}
              </button>
              {importOpen && (
                <div className="mt-3">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={6}
                    placeholder='{"title": "...", "style_bible": "...", "shots": [{"name": "...", "prompt": "..."}]} — or a bare array of shots'
                    className={inputCls}
                  />
                  <button
                    onClick={importBoard}
                    disabled={!importText.trim()}
                    className="mt-2 rounded-lg border px-4 py-2 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-40"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    IMPORT → BOARD
                  </button>
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => draftStoryboard()}
                disabled={drafting || !prompt.trim()}
                className="rounded-lg px-6 py-3 text-sm font-bold text-black transition focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-40"
                style={{ background: ACCENT }}
              >
                {drafting
                  ? 'DRAFTING…'
                  : track
                    ? 'DRAFT FROM THE SONG — FREE'
                    : 'DRAFT STORYBOARD — FREE'}
              </button>
              <span className="text-xs text-zinc-500">nothing is generated yet</span>
            </div>
          </section>
        )}

        {/* --------------------------------------------- 02 STORYBOARD */}
        {stage === 'board' && plan && (
          <section aria-label="Storyboard" className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Bible sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-3 font-mono text-[10px] tracking-[0.25em]" style={{ color: ACCENT }}>
                  STYLE BIBLE
                </div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor="bible-title">
                  Title
                </label>
                <input
                  id="bible-title"
                  value={plan.title}
                  onChange={(e) => setPlan({ ...plan, title: e.target.value })}
                  className={inputCls + ' mb-3'}
                  maxLength={120}
                />
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor="bible-direction">
                  Art direction
                </label>
                <input
                  id="bible-direction"
                  value={plan.art_direction ?? ''}
                  onChange={(e) => setPlan({ ...plan, art_direction: e.target.value })}
                  className={inputCls + ' mb-3'}
                  maxLength={300}
                />
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor="bible-signature">
                  Signature motif
                </label>
                <input
                  id="bible-signature"
                  value={plan.signature ?? ''}
                  onChange={(e) => setPlan({ ...plan, signature: e.target.value })}
                  className={inputCls + ' mb-3'}
                  maxLength={400}
                />
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor="bible-text">
                  The bible (in every shot, verbatim)
                </label>
                <textarea
                  id="bible-text"
                  value={plan.style_bible}
                  onChange={(e) => setPlan({ ...plan, style_bible: e.target.value })}
                  rows={8}
                  maxLength={2000}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={lockAndGenerate}
                  disabled={locking}
                  className="rounded-lg px-5 py-3 text-sm font-bold text-black transition focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-40"
                  style={{ background: ACCENT }}
                >
                  {locking ? 'LOCKING…' : 'LOCK & GENERATE'}
                </button>
                <div className="text-center font-mono text-[10px] text-zinc-500">
                  {plan.shots.length} shots × {secondsPerShot}s · card on file: $
                  {flatPrice(plan.shots.length, secondsPerShot)} flat, on delivery
                </div>
                <button
                  onClick={() => draftStoryboard(true)}
                  disabled={drafting}
                  className="rounded-lg border px-5 py-2.5 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-40"
                  style={{ borderColor: '#3f3f46', color: '#a1a1aa' }}
                >
                  {drafting ? 'RE-DRAFTING…' : 'RE-DRAFT FROM CONCEPT'}
                </button>
                <div>
                  <label
                    className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500"
                    htmlFor="delivery-email"
                  >
                    Email the finished film to (optional)
                  </label>
                  <input
                    id="delivery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@..."
                    className={inputCls}
                    maxLength={254}
                  />
                  <p className="mt-1 text-[10px] text-zinc-600">
                    Either way it&apos;s saved to{' '}
                    <a href="/studio/clips" className="underline decoration-zinc-700 underline-offset-2">
                      your clips
                    </a>{' '}
                    and stays hosted.
                  </p>
                </div>
                <button
                  onClick={() => setStage('concept')}
                  className="text-left text-xs text-zinc-600 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-400"
                >
                  ← back to concept
                </button>
              </div>
            </aside>

            {/* Shot cards */}
            <div className="space-y-4">
              {plan.shots.map((s, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
                      SHOT {String(i + 1).padStart(2, '0')} · {secondsPerShot}s
                      {s.window && (
                        <span className="ml-2 tracking-normal" style={{ color: ACCENT }}>
                          {s.window}
                        </span>
                      )}
                    </span>
                    {i > 0 && (
                      <span className="text-[10px] text-zinc-600">
                        opens on shot {i}&apos;s final frame
                      </span>
                    )}
                  </div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor={`shot-${i}-name`}>
                    Name
                  </label>
                  <input
                    id={`shot-${i}-name`}
                    value={s.name}
                    onChange={(e) => updateShot(i, { name: e.target.value })}
                    className={inputCls + ' mb-3'}
                    maxLength={80}
                  />
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor={`shot-${i}-prompt`}>
                    Prompt
                  </label>
                  <textarea
                    id={`shot-${i}-prompt`}
                    value={s.prompt}
                    onChange={(e) => updateShot(i, { prompt: e.target.value })}
                    rows={4}
                    maxLength={1200}
                    className={inputCls + ' mb-3'}
                  />
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor={`shot-${i}-camera`}>
                    Camera
                  </label>
                  <input
                    id={`shot-${i}-camera`}
                    value={s.camera ?? ''}
                    onChange={(e) => updateShot(i, { camera: e.target.value })}
                    className={inputCls}
                    maxLength={300}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* -------------------------------------------------- 03 SHOTS */}
        {(stage === 'shots' || stage === 'final') && job && (
          <section aria-label="Generation" className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-1 text-lg font-bold">{job.title ?? plan?.title}</div>
              {(job.artDirection ?? plan?.art_direction) && (
                <div className="mb-4 text-xs" style={{ color: ACCENT }}>
                  {job.artDirection ?? plan?.art_direction}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {job.shots.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-md border p-3"
                    style={{
                      borderColor: s.done ? 'rgba(201,162,39,0.5)' : s.generating ? '#52525b' : '#27272a',
                    }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          background: s.done ? ACCENT : s.generating ? '#e4e4e7' : '#3f3f46',
                          animation: s.generating ? 'pulse 1.2s infinite' : undefined,
                        }}
                      />
                      <span className="font-mono text-[10px] tracking-widest text-zinc-500">
                        SHOT {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300">{s.name}</div>
                    <div className="mt-1 text-[10px] text-zinc-600">
                      {s.done
                        ? 'done'
                        : s.generating
                          ? `rendering${(s.attempts ?? 1) > 1 ? ` · attempt ${s.attempts}` : ''}`
                          : 'queued'}
                    </div>
                  </div>
                ))}
              </div>
              {stage === 'shots' && (
                <div className="mt-4 text-xs text-zinc-500">
                  <span
                    className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full align-middle"
                    style={{ background: ACCENT }}
                  />
                  {job.message}
                </div>
              )}
              {typeof job.totalCost === 'number' && (
                <div className="mt-2 font-mono text-[10px] text-zinc-600">
                  spend so far: ${job.totalCost.toFixed(2)}
                </div>
              )}
            </div>

            {/* Failed → resume */}
            {job.status === 'failed' && (
              <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4">
                <div className="mb-2 text-sm text-red-300">{job.error ?? 'Generation failed.'}</div>
                <div className="mb-3 text-xs text-zinc-400">
                  Finished shots are saved — resuming picks up exactly where it stopped and
                  never regenerates what you already have.
                </div>
                {job.canResume && (
                  <button
                    onClick={resume}
                    disabled={resuming}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-black transition focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-40"
                    style={{ background: ACCENT }}
                  >
                    {resuming ? 'RESUMING…' : 'RESUME — FREE'}
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------- 04 FINAL CUT */}
        <AnimatePresence>
          {stage === 'final' && job?.videoUrl && (
            <motion.section
              aria-label="Final cut"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <video
                src={job.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full rounded-lg border border-zinc-800"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={job.videoUrl}
                  download
                  className="rounded-lg px-4 py-2 text-xs font-bold text-black focus-visible:ring-2 focus-visible:ring-zinc-300"
                  style={{ background: ACCENT }}
                >
                  DOWNLOAD MP4
                </a>
                <button
                  onClick={handleShare}
                  className="rounded-lg border px-4 py-2 text-xs font-bold focus-visible:ring-1 focus-visible:ring-zinc-400"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  {shared ? 'BONUS UNLOCKED' : 'SHARE TO X → +2 CLIPS'}
                </button>
                {typeof job.billedUsd === 'number' && (
                  <span className="font-mono text-[10px] text-zinc-600">
                    billed on delivery: ${job.billedUsd.toFixed(2)}
                  </span>
                )}
                <a
                  href="/studio/clips"
                  className="text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
                >
                  saved to your clips →
                </a>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Paygate */}
        <AnimatePresence>
          {gateMessage && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="mb-2 font-mono text-xs tracking-widest" style={{ color: ACCENT }}>
                DAILY LIMIT
              </div>
              <p className="mb-4 text-sm text-zinc-300">{gateMessage}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="rounded-lg border px-4 py-2 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  {shared ? 'BONUS UNLOCKED — TRY AGAIN' : 'SHARE TO X → +2 CLIPS'}
                </button>
                <a
                  href="/add-card"
                  className="rounded-lg px-4 py-2 text-xs font-bold text-black focus-visible:ring-2 focus-visible:ring-zinc-300"
                  style={{ background: ACCENT }}
                >
                  ADD CARD → ${(rateCents / 100).toFixed(2)}/SECOND, PAY ON DELIVERY
                </a>
                <button
                  onClick={() => setGateMessage('')}
                  className="text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-2"
                >
                  dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300"
            >
              {errorMessage}
              <button
                onClick={() => setErrorMessage('')}
                className="ml-3 underline decoration-red-700 underline-offset-2"
              >
                dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
