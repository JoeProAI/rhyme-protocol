'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Generation {
  id: string
  type: 'cover_art' | 'video'
  imageUrl: string
  prompt: string
  metadata: Record<string, any>
  createdAt: string
}

export default function Gallery() {
  const { data: session, status } = useSession()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/generations')
      .then(r => r.json())
      .then(data => {
        setGenerations(data.generations || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load generations:', err)
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this creation?')) return
    
    setDeleting(id)
    try {
      await fetch(`/api/generations?id=${id}`, { method: 'DELETE' })
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
            href="/studio" 
            className="text-text-secondary hover:text-accent transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Studio
          </Link>
          <h1 className="text-4xl font-display tracking-tight mb-2">
            <span className="text-text">MY</span>
            <span className="text-accent">_CREATIONS</span>
          </h1>
          <p className="text-text-secondary">
            {session?.user ? `Signed in as ${session.user.email}` : 'Your generated artwork (this session)'}
          </p>
          {!session?.user && (
            <Link 
              href="/auth/signin" 
              className="inline-block mt-2 text-sm text-accent hover:underline"
            >
              Sign in to save across devices
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-20 border border-border-subtle bg-surface">
            <p className="text-text-secondary mb-4">No creations yet</p>
            <Link 
              href="/studio/cover-art" 
              className="inline-block px-6 py-3 bg-accent text-bg font-medium hover:bg-accent/90 transition-colors"
            >
              Create Cover Art
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen) => (
              <div key={gen.id} className="border border-border-subtle bg-surface group">
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
                <div className="p-4">
                  <p className="text-sm text-text line-clamp-2 mb-2">{gen.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="uppercase">{gen.type.replace('_', ' ')}</span>
                    <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
