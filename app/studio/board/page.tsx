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
  dialogue?: { character: string; line: string }
}

interface CastMember {
  character: string
  voiceId: string
}

interface Voice {
  voiceId: string
  name: string
  labels?: string
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
  cast?: CastMember[]
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
  const [voices, setVoices] = useState<Voice[]>([])
  const [balanceCents, setBalanceCents] = useState(0)
  const [toppingUp, setToppingUp] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [plan, setPlan] = useState<ClipPlan | null>(null)
  const [job, setJob] = useState<JobView | null>(null)
  const [drafting, setDrafting] = useState(false)
  const [locking, setLocking] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [retakeIdx, setRetakeIdxRaw] = useState<number | null>(null)
  const [retakePrompt, setRetakePrompt] = useState('')
  const [retaking, setRetaking] = useState(false)
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
    fetch('/api/credits')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d?.balanceCents === 'number') setBalanceCents(d.balanceCents)
      })
      .catch(() => {})
  }, [])

  const redeemCoupon = async () => {
    if (!couponCode.trim() || redeeming) return
    setRedeeming(true)
    setCouponMsg('')
    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      })
      const data = await res.json()
      setCouponMsg(res.ok ? data.message ?? 'Code redeemed.' : data.error ?? 'Invalid code')
      if (res.ok) {
        setCouponCode('')
        setGateMessage('')
      }
    } catch {
      setCouponMsg('Could not redeem right now')
    } finally {
      setRedeeming(false)
    }
  }

  // Buy in — one-time checkout, nothing stored, balance spends on delivery.
  const topUp = async (amountCents: number) => {
    if (toppingUp) return
    setToppingUp(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout unavailable')
      window.location.href = data.url
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Checkout unavailable')
      setToppingUp(false)
    }
  }

  const flatPrice = (shots: number, seconds: number) =>
    ((shots * seconds * rateCents) / 100).toFixed(2)

  // Characters that currently have lines — drives the cast panel.
  const speakingCharacters = Array.from(
    new Set(
      (plan?.shots ?? [])
        .map((s) => s.dialogue?.character.trim())
        .filter((c): c is string => Boolean(c))
    )
  )

  useEffect(() => {
    if (speakingCharacters.length > 0 && voices.length === 0) {
      fetch('/api/clipchain/voices')
        .then((r) => (r.ok ? r.json() : { voices: [] }))
        .then((d) => setVoices(d.voices ?? []))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingCharacters.length])

  const setCastVoice = (character: string, voiceId: string) => {
    if (!plan) return
    const cast = (plan.cast ?? []).filter(
      (c) => c.character.toLowerCase() !== character.toLowerCase()
    )
    if (voiceId) cast.push({ character, voiceId })
    setPlan({ ...plan, cast })
  }

  const setDialogue = (i: number, character: string, line: string) => {
    if (!plan) return
    const dialogue = character.trim() || line.trim() ? { character, line } : undefined
    const shots = plan.shots.map((s, idx) => (idx === i ? { ...s, dialogue } : s))
    setPlan({ ...plan, shots })
  }

  const styleText = preset ? STYLE_PRESETS.find((p) => p.id === preset)?.style : undefined

  const uploadAudio = async (file: File) => {
    setUploading(true)
    setErrorMessage('')
    setTrack(null)
    try {
      // Real songs exceed the 4.5MB function cap — go straight to storage
      // with a signed URL, falling back to the proxy route for small files.
      const signRes = await fetch('/api/clipchain/audio/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      })
      const sign = await signRes.json().catch(() => ({}))
      if (signRes.ok && sign.uploadUrl) {
        try {
          const put = await fetch(sign.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          })
          if (!put.ok) throw new Error(`storage ${put.status}`)
          setAudio({ path: sign.audioPath, name: file.name })
          void analyzeAudio(sign.audioPath)
          return
        } catch {
          // CORS/network — fall through to the proxy route below
        }
      }
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('Direct upload unavailable and the file is over 4MB — try again in a minute')
      }
      const form = new FormData()
      form.append('audio', file)
      const res = await fetch('/api/clipchain/audio', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setAudio({ path: data.audioPath, name: data.name })
      // Audio-first: mapping starts the moment the track lands. Free.
      void analyzeAudio(data.audioPath)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Map the song's structure so the storyboard is drafted FROM it.
  const analyzeAudio = async (path?: string) => {
    const audioPath = path ?? audio?.path
    if (!audioPath || analyzing) return
    setAnalyzing(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/clipchain/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioPath }),
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

  const setRetakeIdx = (i: number | null) => {
    setRetakeIdxRaw(i)
    if (i !== null && plan) setRetakePrompt(plan.shots[i]?.prompt ?? '')
  }

  const submitRetake = async (mode: 'keep' | 'rechain') => {
    if (!job || retakeIdx === null || retaking) return
    setRetaking(true)
    setErrorMessage('')
    try {
      const res = await fetch(`/api/clipchain/retake/${job.jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shot: retakeIdx + 1,
          mode,
          prompt: retakePrompt.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.status === 402) {
        setGateMessage(data.message || 'Daily limit reached.')
        return
      }
      if (!res.ok) throw new Error(data.error || 'Retake failed')
      setJob(data)
      setRetakeIdxRaw(null)
      setStage('shots')
      pollRef.current = setTimeout(() => poll(data.jobId), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Retake failed')
    } finally {
      setRetaking(false)
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
            <div className="mb-4 rounded-lg border p-4" style={{ borderColor: 'rgba(201,162,39,0.4)', background: 'rgba(201,162,39,0.04)' }}>
              <div className="mb-1 font-mono text-[10px] tracking-[0.25em]" style={{ color: ACCENT }}>
                THE TRACK — START HERE
              </div>
              <p className="mb-3 text-xs text-zinc-400">
                Upload your song and the film is built FROM it: we listen, map every
                section and lyric with timestamps, and write one shot per beat of the
                track. Music, a verse, any audio. Stored private, never published.
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
                  {analyzing ? (
                    <div className="mt-3 text-xs" style={{ color: ACCENT }}>
                      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full align-middle" style={{ background: ACCENT }} />
                      Listening to the track — mapping sections and lyrics…
                    </div>
                  ) : track ? (
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
                      onClick={() => analyzeAudio()}
                      className="mt-3 rounded-lg border px-4 py-2 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400"
                      style={{ borderColor: ACCENT, color: ACCENT }}
                    >
                      MAP THE TRACK — FREE
                    </button>
                  )}
                </div>
              ) : (
                <label
                  className="inline-block cursor-pointer rounded-lg px-5 py-2.5 text-xs font-bold text-black transition focus-within:ring-2 focus-within:ring-zinc-300"
                  style={{ background: ACCENT }}
                >
                  {uploading ? 'UPLOADING…' : 'UPLOAD YOUR TRACK'}
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
            <p className="mb-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {track
                ? 'Now give it a concept — the world the song lives in. The director drafts a storyboard from the track and your idea; you edit everything before a single frame is generated.'
                : 'No track? Just describe the film. The director model drafts a storyboard — art direction, a signature motif, every shot written out. Drafting is free.'}
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
            {products.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-zinc-500">
                  <span>FLAT PRICES — TRACK SEEDANCE COST DOWN</span>
                  <span style={{ color: ACCENT }}>
                    BALANCE ${(balanceCents / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => topUp(2500)}
                    disabled={toppingUp}
                    className="rounded border px-2 py-0.5 tracking-normal transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    {toppingUp ? 'OPENING…' : '+ TOP UP'}
                  </button>
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
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Invite code?"
                aria-label="Invite code"
                maxLength={40}
                className={inputCls + ' w-40'}
              />
              <button
                onClick={redeemCoupon}
                disabled={redeeming || !couponCode.trim()}
                className="rounded-lg border px-4 py-2 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-40"
                style={{ borderColor: ACCENT, color: ACCENT }}
              >
                {redeeming ? 'REDEEMING…' : 'REDEEM'}
              </button>
              {couponMsg && <span className="text-xs text-zinc-400">{couponMsg}</span>}
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
              {speakingCharacters.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-1 font-mono text-[10px] tracking-[0.25em]" style={{ color: ACCENT }}>
                    CAST
                  </div>
                  <p className="mb-3 text-[10px] text-zinc-600">
                    One voice per character, consistent in every shot. Clone your own
                    voice at ElevenLabs and it appears here.
                  </p>
                  {speakingCharacters.map((ch) => (
                    <div key={ch} className="mb-2">
                      <label
                        className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500"
                        htmlFor={`cast-${ch}`}
                      >
                        {ch}
                      </label>
                      <select
                        id={`cast-${ch}`}
                        value={plan.cast?.find((c) => c.character.toLowerCase() === ch.toLowerCase())?.voiceId ?? ''}
                        onChange={(e) => setCastVoice(ch, e.target.value)}
                        className={inputCls}
                      >
                        <option value="">— pick a voice —</option>
                        {voices.map((v) => (
                          <option key={v.voiceId} value={v.voiceId}>
                            {v.name}
                            {v.labels ? ` (${v.labels})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {voices.length === 0 && (
                    <p className="text-[10px] text-zinc-600">Loading voices…</p>
                  )}
                </div>
              )}
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
                    className={inputCls + ' mb-3'}
                    maxLength={300}
                  />
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500" htmlFor={`shot-${i}-dlg-char`}>
                    Dialogue (optional — who speaks, and the line)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`shot-${i}-dlg-char`}
                      value={s.dialogue?.character ?? ''}
                      onChange={(e) => setDialogue(i, e.target.value, s.dialogue?.line ?? '')}
                      placeholder="Character"
                      className={inputCls + ' w-1/3'}
                      maxLength={60}
                    />
                    <input
                      aria-label={`Shot ${i + 1} dialogue line`}
                      value={s.dialogue?.line ?? ''}
                      onChange={(e) => setDialogue(i, s.dialogue?.character ?? '', e.target.value)}
                      placeholder='"The line they speak on camera"'
                      className={inputCls}
                      maxLength={300}
                    />
                  </div>
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

              {/* The editing room — reshoot any shot by taste */}
              {plan && (
                <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-1 font-mono text-[10px] tracking-[0.25em]" style={{ color: ACCENT }}>
                    RETAKES
                  </div>
                  <p className="mb-3 text-xs text-zinc-500">
                    Not feeling a shot? Reshoot just that one (fast, slight cut at the next
                    joint) or reshoot it and everything after (full continuity). Same link,
                    new cut.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {plan.shots.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setRetakeIdx(retakeIdx === i ? null : i)}
                        aria-pressed={retakeIdx === i}
                        className="rounded-md border px-3 py-1.5 font-mono text-[10px] transition focus-visible:ring-1 focus-visible:ring-zinc-400"
                        style={
                          retakeIdx === i
                            ? { borderColor: ACCENT, color: ACCENT }
                            : { borderColor: '#27272a', color: '#a1a1aa' }
                        }
                      >
                        {String(i + 1).padStart(2, '0')} {s.name.slice(0, 18)}
                      </button>
                    ))}
                  </div>
                  {retakeIdx !== null && plan.shots[retakeIdx] && (
                    <div>
                      <label
                        className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500"
                        htmlFor="retake-prompt"
                      >
                        Shot {retakeIdx + 1} prompt (edit before reshooting)
                      </label>
                      <textarea
                        id="retake-prompt"
                        value={retakePrompt}
                        onChange={(e) => setRetakePrompt(e.target.value)}
                        rows={3}
                        maxLength={1200}
                        className={inputCls + ' mb-3'}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => submitRetake('keep')}
                          disabled={retaking}
                          className="rounded-lg px-4 py-2 text-xs font-bold text-black transition focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-40"
                          style={{ background: ACCENT }}
                        >
                          {retaking ? 'RESHOOTING…' : `RESHOOT THIS SHOT — $${flatPrice(1, secondsPerShot)}`}
                        </button>
                        {retakeIdx < plan.shots.length - 1 && (
                          <button
                            onClick={() => submitRetake('rechain')}
                            disabled={retaking}
                            className="rounded-lg border px-4 py-2 text-xs font-bold transition focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-40"
                            style={{ borderColor: ACCENT, color: ACCENT }}
                          >
                            RESHOOT FROM HERE — ${flatPrice(plan.shots.length - retakeIdx, secondsPerShot)}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {[1000, 2500, 6500].map((cents) => (
                  <button
                    key={cents}
                    onClick={() => topUp(cents)}
                    disabled={toppingUp}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-black focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-50"
                    style={{ background: ACCENT }}
                  >
                    TOP UP ${cents / 100}
                  </button>
                ))}
                <span className="text-[10px] text-zinc-500">
                  no card stored · spent only on delivered films
                </span>
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
