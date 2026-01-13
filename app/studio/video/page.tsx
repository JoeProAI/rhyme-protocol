'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthGuard } from '@/components/AuthGuard'
import { CostNotice } from '@/components/CostNotice'

type VideoMode = 'regular' | 'music'
type ViewState = 'idle' | 'generating' | 'complete' | 'error'

const ASPECT_RATIOS = [
  { id: '16:9', label: 'Landscape', desc: '16:9' },
  { id: '9:16', label: 'Portrait', desc: '9:16' },
  { id: '1:1', label: 'Square', desc: '1:1' },
]

const VIDEO_STYLES = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Film-quality visuals' },
  { id: 'animated', label: 'Animated', desc: 'Motion graphics' },
  { id: 'abstract', label: 'Abstract', desc: 'Artistic visuals' },
  { id: 'realistic', label: 'Realistic', desc: 'Photorealistic' },
]

export default function VideoStudioPage() {
  const [mode, setMode] = useState<VideoMode>('regular')
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('cinematic')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [duration, setDuration] = useState<'5s' | '9s'>('5s')
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [resultVideo, setResultVideo] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const accentColor = '#C9A227'

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setViewState('generating')
    setResultVideo(null)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/video-gen/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}. Style: ${selectedStyle}`,
          aspectRatio,
          duration,
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      if (data.videoUrl) {
        setResultVideo(data.videoUrl)
        setViewState('complete')
      } else if (data.jobId) {
        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/video-gen/simple?jobId=${data.jobId}`)
            const status = await statusRes.json()

            if (status.status === 'completed' && status.videoUrl) {
              if (pollRef.current) clearInterval(pollRef.current)
              setResultVideo(status.videoUrl)
              setViewState('complete')
            } else if (status.status === 'failed') {
              if (pollRef.current) clearInterval(pollRef.current)
              setErrorMessage(status.error || 'Generation failed')
              setViewState('error')
            }
          } catch (err) {
            console.error('Poll error:', err)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Generation error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Network error')
      setViewState('error')
    }
  }

  const handleReset = () => {
    setResultVideo(null)
    setPrompt('')
    setViewState('idle')
    setErrorMessage(null)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  return (
    <AuthGuard>
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-accent" style={{ opacity: viewState === 'generating' ? 1 : 0, transition: 'opacity 0.3s' }} />
        
        <header className="mb-12 relative">
          <div className="absolute -left-6 top-0 w-1 h-full bg-accent" />
          <p className="font-mono text-[10px] tracking-[0.4em] text-muted uppercase mb-3">RHYME PROTOCOL</p>
          <h1 className="text-4xl font-display tracking-tight text-text">Video<span className="text-accent">_</span>Generator</h1>
        </header>

        <div className="mb-8">
          <CostNotice type="video" />
        </div>

        <div className="flex gap-2 mb-12">
          <button
            onClick={() => setMode('regular')}
            className={`px-4 py-2 font-mono text-xs tracking-wider border transition-all ${
              mode === 'regular' 
                ? 'border-accent bg-accent/10 text-accent' 
                : 'border-border-subtle text-muted hover:border-border'
            }`}
          >
            VIDEO GEN
          </button>
          <button
            onClick={() => setMode('music')}
            className="px-4 py-2 font-mono text-xs tracking-wider border border-border-subtle text-muted/50 cursor-not-allowed relative"
            disabled
          >
            MUSIC VIDEO
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] bg-surface border border-border-subtle text-muted">
              SOON
            </span>
          </button>
        </div>

        {mode === 'regular' ? (
          <>
            <section className="mb-10">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-mono text-[10px] text-muted">01</span>
                <h2 className="font-mono text-xs tracking-widest text-text-secondary uppercase">Prompt</h2>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={viewState === 'generating'}
                placeholder="Describe your video scene: a lone figure walking through neon-lit streets at night, rain falling, cinematic mood..."
                className="w-full h-32 px-4 py-3 bg-surface border border-border-subtle text-text placeholder:text-muted font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50 resize-none transition-colors"
              />
            </section>

            <section className="mb-10">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-mono text-[10px] text-muted">02</span>
                <h2 className="font-mono text-xs tracking-widest text-text-secondary uppercase">Style</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {VIDEO_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    disabled={viewState === 'generating'}
                    className={`p-3 text-left border transition-all ${
                      selectedStyle === style.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border-subtle hover:border-border'
                    } disabled:opacity-50`}
                  >
                    <p className="font-mono text-xs font-medium">{style.label}</p>
                    <p className="font-mono text-[9px] text-muted mt-1">{style.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-mono text-[10px] text-muted">03</span>
                <h2 className="font-mono text-xs tracking-widest text-text-secondary uppercase">Format</h2>
              </div>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      disabled={viewState === 'generating'}
                      className={`px-3 py-2 border font-mono text-xs transition-all ${
                        aspectRatio === ratio.id
                          ? 'border-accent text-accent'
                          : 'border-border-subtle text-muted hover:border-border'
                      } disabled:opacity-50`}
                    >
                      {ratio.desc}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDuration('5s')}
                    disabled={viewState === 'generating'}
                    className={`px-3 py-2 border font-mono text-xs transition-all ${
                      duration === '5s'
                        ? 'border-accent text-accent'
                        : 'border-border-subtle text-muted hover:border-border'
                    } disabled:opacity-50`}
                  >
                    5s
                  </button>
                  <button
                    onClick={() => setDuration('9s')}
                    disabled={viewState === 'generating'}
                    className={`px-3 py-2 border font-mono text-xs transition-all ${
                      duration === '9s'
                        ? 'border-accent text-accent'
                        : 'border-border-subtle text-muted hover:border-border'
                    } disabled:opacity-50`}
                  >
                    9s
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || viewState === 'generating'}
                className={`w-full py-4 font-mono text-sm tracking-widest uppercase transition-all ${
                  !prompt.trim() || viewState === 'generating'
                    ? 'bg-surface text-muted cursor-not-allowed border border-border-subtle'
                    : 'bg-accent text-bg hover:opacity-90'
                }`}
              >
                {viewState === 'generating' ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    GENERATING
                  </span>
                ) : (
                  'GENERATE VIDEO'
                )}
              </button>
            </section>

            <AnimatePresence>
              {viewState === 'error' && errorMessage && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-10"
                >
                  <div className="p-6 border border-danger bg-danger/10">
                    <p className="font-mono text-xs text-danger mb-2">ERROR</p>
                    <p className="text-sm text-text">{errorMessage}</p>
                    <button onClick={handleReset} className="mt-4 font-mono text-xs text-muted hover:text-text transition-colors">
                      TRY AGAIN
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {viewState === 'complete' && resultVideo && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-mono text-[10px] text-muted">04</span>
                    <h2 className="font-mono text-xs tracking-widest text-text-secondary uppercase">Output</h2>
                  </div>
                  <div className="border border-border-subtle overflow-hidden">
                    <video src={resultVideo} controls className="w-full aspect-video bg-black" />
                    <div className="p-4 flex items-center justify-between border-t border-border-subtle">
                      <span className="font-mono text-[10px] text-muted">GENERATED</span>
                      <a
                        href={resultVideo}
                        download="rhyme-protocol-video.mp4"
                        className="font-mono text-[10px] text-accent hover:underline"
                      >
                        DOWNLOAD
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-6 w-full py-3 border border-border-subtle font-mono text-xs tracking-widest text-muted hover:text-text hover:border-border transition-colors uppercase"
                  >
                    Create Another
                  </button>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="py-20 text-center border border-border-subtle bg-surface/50">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-6 text-muted/30">
              <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="font-display text-xl text-text mb-2">Music Video Generator</h3>
            <p className="text-muted text-sm mb-4">Coming Soon</p>
            <p className="text-muted/70 text-xs max-w-md mx-auto">
              Full music video generation with lyrics overlay, audio sync, and style presets.
              <br />Currently under development.
            </p>
          </div>
        )}

        <footer className="mt-24 pt-8 border-t border-border-subtle">
          <p className="font-mono text-[9px] text-muted tracking-wider">
            RHYME PROTOCOL / VIDEO GEN
          </p>
        </footer>
      </div>
    </div>
    </AuthGuard>
  )
}
