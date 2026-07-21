'use client'

import { useEffect, useState } from 'react'

interface LibraryClip {
  jobId: string
  title: string
  videoUrl: string
  seconds: number
  shots: number
  createdAt: number
  billedUsd?: number
}

const ACCENT = '#C9A227'

export default function MyClipsPage() {
  const [clips, setClips] = useState<LibraryClip[] | null>(null)

  useEffect(() => {
    fetch('/api/clipchain/library')
      .then((r) => (r.ok ? r.json() : { clips: [] }))
      .then((d) => setClips(d.clips ?? []))
      .catch(() => setClips([]))
  }, [])

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-2 font-mono text-xs tracking-[0.3em]" style={{ color: ACCENT }}>
          STUDIO / MY_CLIPS
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">Everything you&apos;ve made.</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Films stay hosted and listed here — they don&apos;t expire with your session.
        </p>

        {clips === null ? (
          <div className="text-sm text-zinc-500">Loading…</div>
        ) : clips.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="mb-4 text-sm text-zinc-400">Nothing here yet.</p>
            <a
              href="/studio/board"
              className="inline-block rounded-lg px-5 py-3 text-sm font-bold text-black"
              style={{ background: ACCENT }}
            >
              MAKE YOUR FIRST FILM
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {clips.map((c) => (
              <div key={c.jobId} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <video src={c.videoUrl} controls playsInline className="mb-3 w-full rounded-md" />
                <div className="text-sm font-bold">{c.title}</div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                  <span>
                    {c.shots} shots · {c.seconds}s · {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <a
                    href={c.videoUrl}
                    download
                    className="underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
                  >
                    download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
