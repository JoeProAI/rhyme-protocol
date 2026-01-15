'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getGenerations, deleteGeneration as deleteGen, Generation } from '@/lib/firestore-generations'
import Link from 'next/link'

export default function Gallery() {
  const { user, loading: authLoading, signOut, signInAnonymously } = useAuth()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Auto sign-in guests so they can see their creations
  useEffect(() => {
    if (!user && !authLoading) {
      signInAnonymously().catch(console.error)
    }
  }, [user, authLoading, signInAnonymously])

  useEffect(() => {
    if (user) {
      console.log('Fetching generations for user:', user.uid, 'isAnonymous:', user.isAnonymous)
      getGenerations(user.uid)
        .then(gens => {
          console.log('Loaded generations:', gens.length)
          setGenerations(gens)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load generations:', err)
          setLoading(false)
        })
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this creation?') || !user) return
    
    setDeleting(id)
    try {
      await deleteGen(user.uid, id)
      setGenerations(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-text-secondary hover:text-accent transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-display tracking-tight mb-2">
            <span className="text-text">MY</span>
            <span className="text-accent">_CREATIONS</span>
          </h1>
          <p className="text-text-secondary">
            {user ? `Signed in as ${user.email || (user.isAnonymous ? 'Guest' : 'User')}` : 'Sign in to view your creations'}
          </p>
          {!user && (
            <Link 
              href="/auth/signin" 
              className="inline-block mt-2 text-sm text-accent hover:underline"
            >
              Sign in to get started
            </Link>
          )}
          {user && (
            <button 
              onClick={() => signOut()}
              className="inline-block mt-2 text-sm text-muted hover:text-accent transition-colors"
            >
              Sign out
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link 
            href="/studio/cover-art" 
            className="px-4 py-2 border border-border-subtle hover:border-accent text-sm font-medium transition-colors"
          >
            Cover Art
          </Link>
          <Link 
            href="/studio/lyrics" 
            className="px-4 py-2 border border-border-subtle hover:border-accent text-sm font-medium transition-colors"
          >
            Lyrics
          </Link>
          <Link 
            href="/studio/video" 
            className="px-4 py-2 border border-border-subtle hover:border-accent text-sm font-medium transition-colors"
          >
            Video
          </Link>
          <Link 
            href="/studio/audio" 
            className="px-4 py-2 border border-border-subtle hover:border-accent text-sm font-medium transition-colors"
          >
            Audio
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-20 border border-border-subtle bg-surface">
            <p className="text-text-secondary mb-6">No creations yet</p>
            <p className="text-sm text-muted mb-4">Start creating with:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                href="/studio/cover-art" 
                className="px-6 py-3 bg-accent text-bg font-medium hover:bg-accent/90 transition-colors"
              >
                Cover Art
              </Link>
              <Link 
                href="/studio/lyrics" 
                className="px-6 py-3 border border-accent text-accent font-medium hover:bg-accent/10 transition-colors"
              >
                Lyrics
              </Link>
              <Link 
                href="/studio/video" 
                className="px-6 py-3 border border-accent text-accent font-medium hover:bg-accent/10 transition-colors"
              >
                Video
              </Link>
              <Link 
                href="/studio/audio" 
                className="px-6 py-3 border border-accent text-accent font-medium hover:bg-accent/10 transition-colors"
              >
                Audio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen) => {
              const isAudio = gen.type.startsWith('audio_')
              const isLyrics = gen.type === 'lyrics'
              
              return (
                <div key={gen.id} className="border border-border-subtle bg-surface group">
                  {isLyrics ? (
                    <div className="aspect-square relative overflow-hidden bg-bg flex flex-col p-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" className="mb-2 flex-shrink-0">
                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                      </svg>
                      <pre className="text-xs text-text font-mono whitespace-pre-wrap overflow-hidden flex-1 leading-relaxed">
                        {gen.textContent?.substring(0, 300) || gen.prompt}
                        {(gen.textContent?.length || 0) > 300 && '...'}
                      </pre>
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigator.clipboard.writeText(gen.textContent || '')}
                          className="px-3 py-1 bg-accent text-bg text-xs font-medium hover:bg-accent/90"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDelete(gen.id)}
                          disabled={deleting === gen.id}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleting === gen.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ) : isAudio ? (
                    <div className="aspect-square relative overflow-hidden bg-bg flex flex-col items-center justify-center p-4">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" className="mb-4">
                        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2Zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2Z"/>
                      </svg>
                      {gen.audioUrl && (
                        <audio src={gen.audioUrl} controls className="w-full max-w-[200px]" />
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {gen.audioUrl && (
                          <a
                            href={gen.audioUrl}
                            download={`${gen.id}.mp3`}
                            className="px-3 py-1 bg-accent text-bg text-xs font-medium hover:bg-accent/90"
                          >
                            Download
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(gen.id)}
                          disabled={deleting === gen.id}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleting === gen.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={gen.imageUrl} 
                        alt={gen.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleDownload(gen.imageUrl, gen.id)}
                          className="px-4 py-2 bg-accent text-bg text-sm font-medium hover:bg-accent/90"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(gen.id)}
                          disabled={deleting === gen.id}
                          className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleting === gen.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-text line-clamp-2 mb-2">{gen.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="uppercase">{gen.type.replace(/_/g, ' ')}</span>
                      <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
