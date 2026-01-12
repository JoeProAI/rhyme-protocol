'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type RapStyle = 'street' | 'trap' | 'luxury' | 'conscious' | 'oldschool' | 'storytelling'
type ViewState = 'idle' | 'generating' | 'complete' | 'error' | 'offline'

interface StyleOption {
  id: RapStyle
  name: string
  tag: string
  color: string
}

const RAP_STYLES: StyleOption[] = [
  { id: 'street', name: 'STREET', tag: 'GRITTY', color: '#F97316' },
  { id: 'trap', name: 'TRAP', tag: 'HYPNOTIC', color: '#A855F7' },
  { id: 'luxury', name: 'LUXURY', tag: 'OPULENT', color: '#EAB308' },
  { id: 'conscious', name: 'CONSCIOUS', tag: 'MINDFUL', color: '#22C55E' },
  { id: 'oldschool', name: 'OLDSCHOOL', tag: 'CLASSIC', color: '#D97706' },
  { id: 'storytelling', name: 'STORY', tag: 'CINEMATIC', color: '#3B82F6' }
]

function FrequencyBars({ color, active }: { color: string; active: boolean }) {
  const bars = 12
  return (
    <div className="flex items-end justify-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-sm"
          style={{ backgroundColor: active ? color : '#27272a' }}
          animate={{
            height: active ? [8, 20 + Math.random() * 12, 8] : 4,
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.3,
            repeat: active ? Infinity : 0,
            repeatType: 'reverse',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  )
}

interface JobStatus {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  progress: { currentSegment: number; totalSegments: number; message: string }
  segments: Array<{ index: number; videoUrl: string }>
  totalDuration?: number
  error?: string
}

export default function VideoStudioPage() {
  const [selectedStyle, setSelectedStyle] = useState<RapStyle | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [resultVideos, setResultVideos] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => { setIsOnline(false); setViewState('offline') }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const selectedStyleData = RAP_STYLES.find(s => s.id === selectedStyle)

  const handleGenerate = async () => {
    if (!selectedStyle || !isOnline) return

    setViewState('generating')
    setJobStatus(null)
    setResultVideos([])
    setErrorMessage(null)

    try {
      const res = await fetch('/api/video-gen/rap-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || undefined,
          style: selectedStyle,
          lyrics: lyrics || undefined,
          lyricsFormat: 'plain',
          lyricOptions: { fontSize: 48, position: 'bottom', animation: 'fade' },
          segmentDuration: 9,
          targetDuration: 30
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      const { jobId } = data

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/video-gen/rap-video?jobId=${jobId}`)
          const status: JobStatus = await statusRes.json()
          setJobStatus(status)

          if (status.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current)
            setResultVideos(status.segments?.map(s => s.videoUrl) || [])
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

    } catch (error) {
      console.error('Generation error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Network error')
      setViewState('error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAudioFile(file)
  }

  const handleReset = () => {
    setResultVideos([])
    setJobStatus(null)
    setSelectedStyle(null)
    setCustomPrompt('')
    setLyrics('')
    setAudioFile(null)
    setViewState('idle')
    setErrorMessage(null)
  }

  const accentColor = selectedStyleData?.color || '#C9A227'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      <div className="fixed top-0 left-0 w-full h-1 z-50" style={{ backgroundColor: accentColor, opacity: viewState === 'generating' ? 1 : 0, transition: 'opacity 0.3s' }} />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-20 relative">
          <div className="absolute -left-6 top-0 w-1 h-full" style={{ backgroundColor: accentColor }} />
          <p className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase mb-3">RHYME PROTOCOL</p>
          <h1 className="text-5xl font-light tracking-tight text-white">Video Generator</h1>
          <div className="mt-6 flex items-center gap-4">
            <FrequencyBars color={accentColor} active={viewState === 'generating'} />
            {viewState === 'generating' && (
              <span className="font-mono text-xs text-zinc-500">RENDERING</span>
            )}
          </div>
        </header>

        {!isOnline && (
          <div className="mb-8 p-4 border border-red-900 bg-red-950/30">
            <p className="font-mono text-xs text-red-400">OFFLINE - Check your connection</p>
          </div>
        )}

        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-mono text-[10px] text-zinc-600">01</span>
            <h2 className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Style</h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {RAP_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id
              const isDisabled = viewState === 'generating'
              return (
                <motion.button
                  key={style.id}
                  onClick={() => !isDisabled && setSelectedStyle(style.id)}
                  disabled={isDisabled}
                  whileHover={isDisabled ? {} : { y: -2 }}
                  whileTap={isDisabled ? {} : { scale: 0.97 }}
                  className={`
                    relative p-4 text-center border transition-all
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected ? 'border-current bg-current/10' : 'border-zinc-800 hover:border-zinc-700'}
                  `}
                  style={isSelected ? { borderColor: style.color, color: style.color } : {}}
                >
                  <p className="font-mono text-[11px] font-medium tracking-wider">{style.name}</p>
                  <p className="font-mono text-[9px] text-zinc-600 mt-1">{style.tag}</p>
                </motion.button>
              )
            })}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-mono text-[10px] text-zinc-600">02</span>
            <h2 className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Prompt</h2>
            <span className="font-mono text-[9px] text-zinc-700">optional</span>
          </div>

          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={viewState === 'generating'}
            placeholder="rapper in dark studio, smoke, dramatic lighting"
            className="
              w-full h-24 px-4 py-3 bg-zinc-900/50 border border-zinc-800
              text-zinc-200 placeholder:text-zinc-700 font-mono text-sm
              focus:border-zinc-600 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none transition-colors
            "
          />
        </section>

        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-mono text-[10px] text-zinc-600">03</span>
            <h2 className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Lyrics</h2>
            <span className="font-mono text-[9px] text-zinc-700">optional</span>
          </div>

          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            disabled={viewState === 'generating'}
            placeholder="Paste lyrics for text overlay..."
            className="
              w-full h-32 px-4 py-3 bg-zinc-900/50 border border-zinc-800
              text-zinc-200 placeholder:text-zinc-700 font-mono text-sm
              focus:border-zinc-600 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none transition-colors
            "
          />
        </section>

        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-mono text-[10px] text-zinc-600">04</span>
            <h2 className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Audio</h2>
            <span className="font-mono text-[9px] text-zinc-700">optional</span>
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={viewState === 'generating'}
            className="
              w-full p-5 border border-dashed border-zinc-800
              bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors text-left
            "
          >
            <p className="font-mono text-xs text-zinc-400">
              {audioFile ? audioFile.name : 'DROP AUDIO FILE'}
            </p>
            <p className="font-mono text-[9px] text-zinc-700 mt-1">
              {audioFile ? 'Click to change' : 'MP3 / WAV / FLAC'}
            </p>
          </button>
        </section>

        <section className="mb-16">
          <motion.button
            onClick={handleGenerate}
            disabled={!selectedStyle || viewState === 'generating' || !isOnline}
            whileHover={selectedStyle && viewState !== 'generating' ? { y: -1 } : {}}
            whileTap={selectedStyle && viewState !== 'generating' ? { scale: 0.99 } : {}}
            className={`
              w-full py-5 font-mono text-sm tracking-widest uppercase transition-all
              ${!selectedStyle || viewState === 'generating' || !isOnline
                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                : 'text-black hover:opacity-90 border-0'
              }
            `}
            style={
              selectedStyle && viewState !== 'generating' && isOnline
                ? { backgroundColor: accentColor }
                : {}
            }
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
          </motion.button>
        </section>

        <AnimatePresence>
          {viewState === 'error' && errorMessage && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-16"
            >
              <div className="p-6 border border-red-900 bg-red-950/20">
                <p className="font-mono text-xs text-red-400 mb-2">ERROR</p>
                <p className="text-sm text-red-300">{errorMessage}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  TRY AGAIN
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {jobStatus && viewState === 'generating' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-16"
            >
              <div className="p-6 border border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest">PROGRESS</span>
                  <span className="font-mono text-xs text-zinc-400">
                    {jobStatus.progress?.currentSegment || 0} / {jobStatus.progress?.totalSegments || 0}
                  </span>
                </div>

                <div className="h-1 bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: accentColor }}
                    initial={{ width: 0 }}
                    animate={{
                      width: jobStatus.progress?.totalSegments
                        ? `${(jobStatus.progress.currentSegment / jobStatus.progress.totalSegments) * 100}%`
                        : '0%'
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                {jobStatus.progress?.message && (
                  <p className="mt-4 font-mono text-[10px] text-zinc-600">{jobStatus.progress.message}</p>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewState === 'complete' && resultVideos.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-mono text-[10px] text-zinc-600">05</span>
                <h2 className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Output</h2>
                <span className="font-mono text-[9px]" style={{ color: accentColor }}>
                  {resultVideos.length} SEGMENTS
                </span>
              </div>

              <div className="space-y-4">
                {resultVideos.map((url, index) => (
                  <div key={index} className="border border-zinc-800 overflow-hidden">
                    <video src={url} controls className="w-full aspect-video bg-black" />
                    <div className="p-4 flex items-center justify-between border-t border-zinc-800">
                      <span className="font-mono text-[10px] text-zinc-600">SEG_{String(index + 1).padStart(2, '0')}</span>
                      <a
                        href={url}
                        download={`rhyme-protocol-seg-${index + 1}.mp4`}
                        className="font-mono text-[10px] text-zinc-500 hover:text-white transition-colors"
                      >
                        DOWNLOAD
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="
                  mt-8 w-full py-4 border border-zinc-800
                  font-mono text-xs tracking-widest text-zinc-500
                  hover:text-white hover:border-zinc-600
                  transition-colors uppercase
                "
              >
                Create Another
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="mt-24 pt-8 border-t border-zinc-900">
          <p className="font-mono text-[9px] text-zinc-700 tracking-wider">
            RHYME PROTOCOL v0.1.0 / NEURAL SALVAGE FORK
          </p>
        </footer>
      </div>
    </div>
  )
}
