'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ViewState = 'idle' | 'starting' | 'generating' | 'complete' | 'error' | 'paygate'

interface ShotStatus {
  name: string
  done: boolean
  generating: boolean
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
  error?: string
}

const ACCENT = '#C9A227'

// Authored directions, not moods — each one is a reproducible recipe seed.
const STYLE_PRESETS = [
  { id: 'minidv', label: 'MiniDV Cyberpunk', hint: '1995 camcorder dystopia, heavy grade' },
  { id: '16mm', label: '16mm Street', hint: 'hand-processed film, skate-video energy' },
  { id: 'tableau', label: 'Staged Tableau', hint: 'Crewdson-style suburban cinema, sodium light' },
  { id: 'crt', label: 'CRT Broadcast', hint: 'scanlines, analog horror, video noise' },
  { id: 'anamorphic', label: '80s Anamorphic', hint: 'Kodak stock sci-fi noir, practical lights' },
]

const PRESET_STYLE: Record<string, string> = {
  minidv: '1995 miniDV camcorder cyberpunk dystopia with a heavy color grade',
  '16mm': 'hand-processed 16mm film with skate-video energy, visible grain and light leaks',
  tableau: 'Gregory Crewdson-style staged suburban tableau, sodium vapor and window light',
  crt: 'CRT-scanline analog broadcast look with video noise and timestamp burn-in',
  anamorphic: '1982 anamorphic Kodak sci-fi noir, practical lights only',
}

export default function ClipStudioPage() {
  const [prompt, setPrompt] = useState('')
  const [preset, setPreset] = useState<string | null>(null)
  const [view, setView] = useState<ViewState>('idle')
  const [job, setJob] = useState<JobView | null>(null)
  const [gateMessage, setGateMessage] = useState('')
  const [shared, setShared] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current) }, [])

  const poll = async (jobId: string) => {
    try {
      const res = await fetch(`/api/clipchain/status/${jobId}`)
      const data: JobView = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Status check failed')
      setJob(data)
      if (data.status === 'complete') {
        setView('complete')
        return
      }
      if (data.status === 'failed') {
        setErrorMessage(data.error || 'Generation failed')
        setView('error')
        return
      }
      pollRef.current = setTimeout(() => poll(jobId), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lost contact with the job')
      setView('error')
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || view === 'starting' || view === 'generating') return
    setView('starting')
    setJob(null)
    setErrorMessage('')
    try {
      const res = await fetch('/api/clipchain/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: preset ? PRESET_STYLE[preset] : undefined,
        }),
      })
      const data = await res.json()
      if (res.status === 402) {
        setGateMessage(data.message || 'Daily clip limit reached.')
        setView('paygate')
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed to start')
      setJob(data)
      setView('generating')
      pollRef.current = setTimeout(() => poll(data.jobId), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start')
      setView('error')
    }
  }

  const handleShare = async () => {
    const text = encodeURIComponent(
      job?.videoUrl
        ? `Made this with CLIP_CHAIN on @rhymeprotocol — one prompt, three chained AI shots, zero continuity breaks.\n\nrhymeprotocol.com/studio/clip`
        : `CLIP_CHAIN on @rhymeprotocol turns one prompt into a multi-shot AI music video clip.\n\nrhymeprotocol.com/studio/clip`
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

  const busy = view === 'starting' || view === 'generating'

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-2 font-mono text-xs tracking-[0.3em]" style={{ color: ACCENT }}>
          STUDIO / CLIP_CHAIN
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          One prompt. A multi-shot clip that holds together.
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-zinc-400">
          Three chained Seedance 2.0 shots. Between every cut, two vision models —
          GPT Omni and Nano Banana — study the final frame and lock your subject,
          light, and palette into the next shot. 15 seconds, 720p, yours to post.
        </p>

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={busy}
          rows={3}
          maxLength={600}
          placeholder="A boxer wraps her hands in a flooded gym as the lights flicker on, round bell echoing…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-600 disabled:opacity-50"
        />

        {/* Style presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.id}
              onClick={() => setPreset(preset === s.id ? null : s.id)}
              disabled={busy}
              title={s.hint}
              className="rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
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

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={busy || !prompt.trim()}
            className="rounded-lg px-6 py-3 text-sm font-bold text-black transition disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            {busy ? 'WORKING…' : 'GENERATE CLIP'}
          </button>
          <span className="text-xs text-zinc-500">
            1 free clip a day · share to X for more · ~90s to render ·{' '}
            <a href="/studio/board" className="underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300">
              want to direct every shot? open the board
            </a>
          </span>
        </div>

        {/* Paygate */}
        <AnimatePresence>
          {view === 'paygate' && (
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
                  className="rounded-lg border px-4 py-2 text-xs font-bold transition"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  {shared ? 'BONUS UNLOCKED — TRY AGAIN' : 'SHARE TO X → +2 CLIPS'}
                </button>
                <a
                  href="/add-card"
                  className="rounded-lg px-4 py-2 text-xs font-bold text-black"
                  style={{ background: ACCENT }}
                >
                  ADD CARD → $1.75/SHOT, PAY ON DELIVERY
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {(view === 'generating' || view === 'starting') && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6"
            >
              {view === 'starting' || !job ? (
                <div className="text-sm text-zinc-400">
                  <Pulse /> Director is storyboarding — committing to an art direction…
                </div>
              ) : (
                <>
                  <div className="mb-1 text-lg font-bold">{job.title}</div>
                  {job.artDirection && (
                    <div className="mb-1 text-xs" style={{ color: ACCENT }}>
                      {job.artDirection}
                    </div>
                  )}
                  {job.signature && (
                    <div className="mb-4 text-xs italic text-zinc-500">
                      signature: {job.signature}
                    </div>
                  )}
                  <div className="mb-4 space-y-2">
                    {job.shots.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{
                            background: s.done ? ACCENT : s.generating ? '#e4e4e7' : '#3f3f46',
                            animation: s.generating ? 'pulse 1.2s infinite' : undefined,
                          }}
                        />
                        <span className={s.done ? 'text-zinc-200' : 'text-zinc-500'}>
                          Shot {i + 1} — {s.name}
                        </span>
                        {s.done && <span className="text-xs text-zinc-600">done</span>}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500">
                    <Pulse /> {job.message}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {view === 'complete' && job?.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
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
                  className="rounded-lg px-4 py-2 text-xs font-bold text-black"
                  style={{ background: ACCENT }}
                >
                  DOWNLOAD MP4
                </a>
                <button
                  onClick={handleShare}
                  className="rounded-lg border px-4 py-2 text-xs font-bold"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  SHARE TO X → +2 CLIPS
                </button>
                <span className="text-xs text-zinc-600">
                  “{job.title}” {job.artDirection ? `· ${job.artDirection}` : ''}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {view === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300"
            >
              {errorMessage}
              <button
                onClick={() => setView('idle')}
                className="ml-3 underline decoration-red-700 underline-offset-2"
              >
                try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function Pulse() {
  return (
    <span
      className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full align-middle"
      style={{ background: ACCENT }}
    />
  )
}
