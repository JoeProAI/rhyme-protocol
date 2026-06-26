'use client'

import { useState } from 'react'

/**
 * ChallengeBeat. One-click beat generator in the artist's documented
 * production palette. Instrumental only, 15-60s, free.
 */
export default function ChallengeBeat({
  slug,
  artistName,
}: {
  slug: string
  artistName: string
}) {
  const firstName = artistName.split(' ')[0]
  const [duration, setDuration] = useState(30)
  const [vibe, setVibe] = useState('')
  const [busy, setBusy] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (busy) return
    setBusy(true)
    setError(null)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/challenge/beat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, vibe: vibe.trim() || undefined, duration }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`)
      setAudioUrl(data.audioUrl)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Beat generation failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">
        Instrumental beat around {firstName}&apos;s documented production palette.
        Mid-tempo, sample-driven, and deliberately not a clone.
        Hit generate and write the verse over it.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10px] font-mono tracking-widest text-muted mb-1">
            DURATION
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            disabled={busy}
            className="w-full bg-transparent border border-border-subtle text-text text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-accent"
          >
            <option value={15}>15 SECONDS</option>
            <option value={30}>30 SECONDS</option>
            <option value={45}>45 SECONDS</option>
            <option value={60}>60 SECONDS</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono tracking-widest text-muted mb-1">
            VIBE (OPTIONAL)
          </label>
          <input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            disabled={busy}
            maxLength={120}
            placeholder="e.g. rainy night, late drive"
            className="w-full bg-transparent border border-border-subtle text-text text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-accent placeholder:text-muted"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={generate}
          disabled={busy}
          className="px-5 py-2 border border-accent text-accent text-xs font-mono tracking-widest hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'COOKING BEAT...' : 'GENERATE BEAT'}
        </button>
        {audioUrl && (
          <a
            href={audioUrl}
            download={`${slug}-beat-${Date.now()}.mp3`}
            className="px-5 py-2 border border-border-subtle text-text-secondary text-xs font-mono tracking-widest hover:border-text-secondary hover:text-text transition-colors"
          >
            DOWNLOAD
          </a>
        )}
      </div>

      {busy && (
        <p className="text-[10px] font-mono tracking-widest text-muted animate-pulse">
          BEATS TAKE 20-60 SECONDS. STAY ON THIS PAGE.
        </p>
      )}

      {error && (
        <div className="border border-red-500/40 bg-red-500/5 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-2">
          <audio controls src={audioUrl} className="w-full" />
          <p className="mt-2 text-[10px] font-mono tracking-widest text-muted leading-relaxed">
            AI-generated instrumental around {firstName}&apos;s documented production lane. Not his actual beat, not his voice. Use freely for your submission. If you ship something derived from this commercially, credit AI + write your own.
          </p>
        </div>
      )}
    </div>
  )
}
