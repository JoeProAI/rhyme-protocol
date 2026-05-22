'use client'

import { useState } from 'react'
import VoiceIsolator from './VoiceIsolator'

interface JudgeResult {
  scores: {
    pocket: number
    specificity: number
    wit_weight: number
    authenticity: number
  }
  overall: number
  verdict: string
  notes: string[]
  artist?: string
}

export default function ChallengeWriter({
  slug,
  prompt,
  writerNote,
}: {
  slug: string
  prompt: string
  writerNote?: string
}) {
  const [bars, setBars] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<JudgeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [showAudio, setShowAudio] = useState(false)

  const wordCount = bars.trim() ? bars.trim().split(/\s+/).length : 0
  const lineCount = bars.trim() ? bars.trim().split(/\n+/).filter(Boolean).length : 0

  async function handleSubmit() {
    if (!bars.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/challenge/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, bars, prompt }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Judge failed')
      }
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish() {
    if (!result || publishing) return
    setPublishing(true)
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lyrics',
          prompt: `[${slug} challenge] ${prompt}`,
          textContent: `${bars.trim()}\n\n- Score: ${result.overall}/100 · ${result.verdict}`,
          style: slug,
        }),
      })
      if (res.ok) setPublished(true)
    } catch {
      // silent
    } finally {
      setPublishing(false)
    }
  }

  function handleShare() {
    if (!result) return
    const text = `Just scored ${result.overall}/100 on the ${result.artist || 'rap'} challenge at @rhymeprotocol\n\n"${result.verdict}"\n\nTry it →`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://www.rhymeprotocol.com/challenge/' + slug)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600')
  }

  return (
    <div>
      {writerNote && (
        <div className="mb-4 text-xs text-muted italic px-1 leading-relaxed">
          {writerNote}
        </div>
      )}

      <div className="border border-border-subtle bg-surface mb-3">
        <textarea
          value={bars}
          onChange={(e) => setBars(e.target.value)}
          placeholder={`Write your bars on the prompt above.\n\nNo wrong answers. The judge wants honesty over polish.`}
          rows={14}
          className="w-full bg-transparent p-4 text-sm sm:text-base text-text font-mono resize-none focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
          maxLength={4000}
          spellCheck={false}
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle text-[10px] font-mono tracking-widest text-muted">
          <span>
            {lineCount} LINES · {wordCount} WORDS
          </span>
          <span>{bars.length}/4000</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={handleSubmit}
          disabled={!bars.trim() || submitting}
          className="px-6 py-2 border border-accent text-accent text-xs font-mono tracking-widest hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'JUDGING…' : 'GET JUDGED →'}
        </button>
        <button
          onClick={() => {
            setBars('')
            setResult(null)
            setError(null)
            setPublished(false)
          }}
          disabled={submitting || !bars}
          className="px-4 py-2 border border-border-subtle text-text-secondary text-xs font-mono tracking-widest hover:border-text-secondary hover:text-text transition-colors disabled:opacity-40"
        >
          CLEAR
        </button>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowAudio((s) => !s)}
          className="text-[10px] font-mono tracking-widest text-text-secondary hover:text-text transition-colors"
        >
          {showAudio ? '− HIDE' : '+ ADD'} VOCAL TAKE (OPTIONAL)
        </button>
        {showAudio && (
          <div className="mt-3 border border-border-subtle bg-surface p-4">
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Record yourself performing the bars on your phone, drop it in,
              and we'll strip the room noise / beat bleed. Download the clean
              acapella to layer over a beat or share with the verdict.
            </p>
            <VoiceIsolator compact />
          </div>
        )}
      </div>

      {result && (
        <div className="border border-accent/40 bg-accent/5 p-5 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-accent mb-1">
                VERDICT
              </div>
              <div className="text-5xl sm:text-6xl font-display tracking-tight text-text">
                {result.overall}
                <span className="text-xl text-muted">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono tracking-widest text-muted">SCORES</div>
              <ScoreLine label="POCKET" value={result.scores.pocket} max={25} />
              <ScoreLine label="SPECIFICITY" value={result.scores.specificity} max={25} />
              <ScoreLine label="WIT/WEIGHT" value={result.scores.wit_weight} max={25} />
              <ScoreLine label="AUTHENTIC" value={result.scores.authenticity} max={25} />
            </div>
          </div>

          {result.verdict && (
            <p className="text-base sm:text-lg text-text font-display tracking-tight mb-4 italic">
              &ldquo;{result.verdict}&rdquo;
            </p>
          )}

          {result.notes && result.notes.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-mono tracking-widest text-accent mb-2">
                NOTES
              </div>
              <ul className="space-y-1.5">
                {result.notes.map((n, i) => (
                  <li key={i} className="text-sm text-text-secondary leading-relaxed">
                    · {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t border-accent/20">
            <button
              onClick={handleShare}
              className="px-4 py-1.5 border border-accent text-accent text-[10px] font-mono tracking-widest hover:bg-accent/10 transition-colors"
            >
              SHARE TO X →
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              className="px-4 py-1.5 border border-border-subtle text-text-secondary text-[10px] font-mono tracking-widest hover:border-text-secondary hover:text-text transition-colors disabled:opacity-40"
            >
              {published ? '✓ IN GALLERY' : publishing ? 'PUBLISHING…' : 'ADD TO GALLERY'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreLine({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[9px] font-mono tracking-widest text-muted w-20 text-right">
        {label}
      </span>
      <div className="w-16 h-1 bg-border-subtle relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-text w-8 text-left">
        {value}
      </span>
    </div>
  )
}
