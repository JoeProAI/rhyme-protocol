'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type GalleryType = 'all' | 'cover_art' | 'video' | 'lyrics' | 'audio'

interface Item {
  id: string
  type: 'cover_art' | 'video' | 'lyrics' | 'audio'
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  textContent?: string
  prompt: string
  style?: string
  remixCount: number
  createdAt: string
}

const TABS: { key: GalleryType; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'video', label: 'VIDEO' },
  { key: 'cover_art', label: 'COVERS' },
  { key: 'lyrics', label: 'LYRICS' },
  { key: 'audio', label: 'AUDIO' },
]

export default function GalleryPage() {
  const [type, setType] = useState<GalleryType>('all')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const url = type === 'all' ? '/api/gallery' : `/api/gallery?type=${type}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        if (data.error) setError(data.error)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [type])

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-8 px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display tracking-tight mb-4 break-words">
            <span className="text-text">PUBLIC</span>
            <span className="text-accent">_GALLERY</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl mx-auto">
            Community generations. Click any piece to remix it for free.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setType(tab.key)}
              className={`px-4 py-1.5 text-xs font-mono tracking-wider border transition-colors ${
                type === tab.key
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border-subtle text-text-secondary hover:text-text hover:border-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-text-secondary text-sm">Loading…</p>
        )}

        {!loading && error && (
          <p className="text-center text-text-secondary text-sm">
            Gallery is empty or unavailable. Be the first to publish.
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center text-text-secondary py-12">
            <p className="mb-4">No public generations yet.</p>
            <Link
              href="/studio/lyrics"
              className="inline-block px-6 py-2 border border-accent text-accent hover:bg-accent/10 transition-colors text-sm font-mono tracking-wider"
            >
              GO MAKE SOMETHING →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function GalleryCard({ item }: { item: Item }) {
  const remixHref = `/studio/${
    item.type === 'cover_art'
      ? 'cover-art'
      : item.type === 'video'
        ? 'video'
        : item.type === 'audio'
          ? 'audio'
          : 'lyrics'
  }?prompt=${encodeURIComponent(item.prompt)}${item.style ? `&style=${encodeURIComponent(item.style)}` : ''}`

  return (
    <Link
      href={remixHref}
      className="group block border border-border-subtle bg-surface hover:border-accent hover:-translate-y-1 transition-all overflow-hidden"
    >
      <div className="aspect-square bg-bg-secondary relative overflow-hidden">
        {item.type === 'video' && item.videoUrl ? (
          <video
            src={item.videoUrl}
            muted
            loop
            playsInline
            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
            onMouseLeave={(e) => {
              const v = e.target as HTMLVideoElement
              v.pause()
              v.currentTime = 0
            }}
            className="w-full h-full object-cover"
          />
        ) : item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : item.type === 'lyrics' && item.textContent ? (
          <div className="p-4 h-full overflow-hidden text-text text-xs font-mono whitespace-pre-wrap">
            {item.textContent.slice(0, 280)}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs font-mono">
            {item.type.toUpperCase()}
          </div>
        )}

        <div className="absolute top-2 left-2 px-2 py-0.5 bg-bg/80 backdrop-blur text-[10px] font-mono tracking-widest text-accent border border-accent/30">
          {item.type === 'cover_art' ? 'COVER' : item.type.toUpperCase()}
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-text-secondary line-clamp-2 mb-2 min-h-[2.5em]">
          {item.prompt || '(no prompt)'}
        </p>
        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
          <span className="text-muted">
            {item.style ? item.style.toUpperCase() : ''}
          </span>
          <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            REMIX →
          </span>
        </div>
      </div>
    </Link>
  )
}
