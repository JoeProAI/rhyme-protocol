'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * VoiceIsolator, drag/drop or browse, isolate via /api/audio/isolate,
 * preview before & after, download cleaned MP3.
 *
 * Optional `onIsolated(blob, url)` callback lets a parent (like ChallengeWriter)
 * grab the cleaned audio for further use.
 */
export default function VoiceIsolator({
  compact = false,
  onIsolated,
}: {
  compact?: boolean
  onIsolated?: (blob: Blob, url: string) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [origUrl, setOrigUrl] = useState<string | null>(null)
  const [cleanUrl, setCleanUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (origUrl) URL.revokeObjectURL(origUrl)
      if (cleanUrl) URL.revokeObjectURL(cleanUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickFile(f: File | null) {
    if (origUrl) URL.revokeObjectURL(origUrl)
    if (cleanUrl) URL.revokeObjectURL(cleanUrl)
    setCleanUrl(null)
    setError(null)
    if (!f) {
      setFile(null)
      setOrigUrl(null)
      return
    }
    if (f.size > 25 * 1024 * 1024) {
      setError('File over 25MB. Trim it first.')
      return
    }
    setFile(f)
    setOrigUrl(URL.createObjectURL(f))
  }

  async function handleIsolate() {
    if (!file || busy) return
    setBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('audio', file)
      const res = await fetch('/api/audio/isolate', { method: 'POST', body: fd })
      if (!res.ok) {
        let msg = `Failed (${res.status})`
        try {
          const j = await res.json()
          msg = j.error || msg
        } catch {}
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setCleanUrl(url)
      onIsolated?.(blob, url)
    } catch (e: any) {
      setError(e.message || 'Isolation failed.')
    } finally {
      setBusy(false)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) pickFile(f)
  }

  return (
    <div className={compact ? '' : 'space-y-4'}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border ${
          drag ? 'border-accent bg-accent/5' : 'border-border-subtle bg-surface'
        } cursor-pointer p-6 text-center hover:border-text-secondary transition-colors`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div>
            <div className="text-xs font-mono text-text mb-1">
              {file.name}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-muted">
              {(file.size / 1024 / 1024).toFixed(2)} MB · CLICK TO REPLACE
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-mono tracking-widest text-text-secondary mb-1">
              DROP AUDIO OR CLICK TO BROWSE
            </div>
            <div className="text-[10px] font-mono tracking-widest text-muted">
              MP3 · WAV · M4A · UP TO 25MB
            </div>
          </div>
        )}
      </div>

      {origUrl && (
        <div>
          <div className="text-[10px] font-mono tracking-widest text-muted mb-1">
            ORIGINAL
          </div>
          <audio controls src={origUrl} className="w-full" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleIsolate}
          disabled={!file || busy}
          className="px-5 py-2 border border-accent text-accent text-xs font-mono tracking-widest hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'ISOLATING…' : 'ISOLATE VOCALS →'}
        </button>
        {cleanUrl && (
          <a
            href={cleanUrl}
            download={`isolated-${Date.now()}.mp3`}
            className="px-5 py-2 border border-border-subtle text-text-secondary text-xs font-mono tracking-widest hover:border-text-secondary hover:text-text transition-colors"
          >
            ↓ DOWNLOAD CLEAN
          </a>
        )}
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/5 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {cleanUrl && (
        <div>
          <div className="text-[10px] font-mono tracking-widest text-accent mb-1">
            ISOLATED
          </div>
          <audio controls src={cleanUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
