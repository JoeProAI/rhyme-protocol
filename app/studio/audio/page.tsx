'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { CostNotice } from '@/components/CostNotice'

type AudioMode = 'voice' | 'sfx' | 'music'

interface Voice {
  id: string
  name: string
  style: string
}

const SFX_PRESETS = [
  { label: 'Cinematic Hit', prompt: 'Deep cinematic impact hit with reverb tail' },
  { label: 'Vinyl Scratch', prompt: 'DJ vinyl scratch, quick turntable sound' },
  { label: 'Bass Drop', prompt: 'Heavy bass drop with sub frequencies' },
  { label: 'Cash Register', prompt: 'Cash register cha-ching money sound' },
  { label: 'Gunshot', prompt: 'Single gunshot with echo, action movie style' },
  { label: 'Car Engine', prompt: 'Sports car engine revving, powerful V8' },
  { label: 'Crowd Hype', prompt: 'Excited crowd cheering and hyping' },
  { label: 'Record Stop', prompt: 'Vinyl record stop scratch, DJ effect' },
]

const MUSIC_GENRES = [
  { value: 'trap', label: 'Trap' },
  { value: 'boom-bap', label: 'Boom Bap' },
  { value: 'drill', label: 'Drill' },
  { value: 'lo-fi', label: 'Lo-Fi' },
  { value: 'r&b', label: 'R&B' },
  { value: 'jazz-hop', label: 'Jazz Hop' },
]

export default function AudioStudio() {
  const [mode, setMode] = useState<AudioMode>('voice')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [text, setText] = useState('')
  const [sfxPrompt, setSfxPrompt] = useState('')
  const [sfxDuration, setSfxDuration] = useState(2)
  const [musicPrompt, setMusicPrompt] = useState('')
  const [musicGenre, setMusicGenre] = useState('trap')
  const [musicDuration, setMusicDuration] = useState(30)
  const [instrumental, setInstrumental] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/api/studio/voice')
      .then(res => res.json())
      .then(data => {
        setVoices(data.voices || [])
        if (data.voices?.length > 0) {
          setSelectedVoice(data.voices[0].id)
        }
      })
      .catch(console.error)
  }, [])

  const generateVoice = async () => {
    if (!text.trim()) return
    setGenerating(true)
    setError(null)
    setAudioUrl(null)

    try {
      const res = await fetch('/api/studio/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAudioUrl(data.audioUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const generateSfx = async () => {
    if (!sfxPrompt.trim()) return
    setGenerating(true)
    setError(null)
    setAudioUrl(null)

    try {
      const res = await fetch('/api/studio/sound-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: sfxPrompt, 
          duration_seconds: sfxDuration 
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAudioUrl(data.audioUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const generateMusic = async () => {
    if (!musicPrompt.trim()) return
    setGenerating(true)
    setError(null)
    setAudioUrl(null)

    try {
      const res = await fetch('/api/studio/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: musicPrompt,
          genre: musicGenre,
          duration_seconds: musicDuration,
          instrumental,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAudioUrl(data.audioUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const downloadAudio = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `rhyme-protocol-${mode}-${Date.now()}.mp3`
    a.click()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/" 
              className="text-text-secondary hover:text-accent transition-colors text-sm mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-display tracking-tight mb-2">
              <span className="text-text">AUDIO</span>
              <span className="text-accent">_STUDIO</span>
            </h1>
            <p className="text-text-secondary">
              Voice synthesis, sound effects, and beat generation powered by ElevenLabs
            </p>
          </div>

          <div className="mb-8">
            <CostNotice type="lyrics" />
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'voice', label: 'Text to Speech' },
              { key: 'sfx', label: 'Sound Effects' },
              { key: 'music', label: 'Beat Generator' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setMode(tab.key as AudioMode)
                  setAudioUrl(null)
                  setError(null)
                }}
                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                  mode === tab.key
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-subtle text-muted hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Voice Mode */}
          {mode === 'voice' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Select Voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {voices.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`p-3 border text-left transition-colors ${
                        selectedVoice === voice.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border-subtle hover:border-border'
                      }`}
                    >
                      <div className="font-medium text-text text-sm">{voice.name}</div>
                      <div className="text-xs text-muted">{voice.style}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Text to Speak
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your lyrics or enter text to hear it spoken..."
                  className="w-full h-40 px-4 py-3 bg-surface border border-border-subtle text-text placeholder:text-muted resize-none focus:outline-none focus:border-accent"
                  maxLength={1000}
                />
                <p className="text-xs text-muted mt-1">{text.length}/1000 characters</p>
              </div>

              <button
                onClick={generateVoice}
                disabled={generating || !text.trim()}
                className="w-full py-3 bg-accent text-bg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? 'Generating...' : 'Generate Speech'}
              </button>
            </div>
          )}

          {/* SFX Mode */}
          {mode === 'sfx' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SFX_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setSfxPrompt(preset.prompt)}
                      className="p-2 border border-border-subtle text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Describe the Sound
                </label>
                <textarea
                  value={sfxPrompt}
                  onChange={(e) => setSfxPrompt(e.target.value)}
                  placeholder="Describe the sound effect you want... e.g., 'Heavy 808 bass hit with long reverb tail'"
                  className="w-full h-24 px-4 py-3 bg-surface border border-border-subtle text-text placeholder:text-muted resize-none focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Duration: {sfxDuration}s
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={sfxDuration}
                  onChange={(e) => setSfxDuration(parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <button
                onClick={generateSfx}
                disabled={generating || !sfxPrompt.trim()}
                className="w-full py-3 bg-accent text-bg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? 'Generating...' : 'Generate Sound Effect'}
              </button>
            </div>
          )}

          {/* Music Mode */}
          {mode === 'music' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Genre
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MUSIC_GENRES.map(genre => (
                    <button
                      key={genre.value}
                      onClick={() => setMusicGenre(genre.value)}
                      className={`p-2 border text-xs font-medium transition-colors ${
                        musicGenre === genre.value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-subtle text-muted hover:border-border'
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Describe Your Beat
                </label>
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Describe the beat... e.g., 'Dark melodic trap beat with haunting piano and hard 808s, 140 BPM'"
                  className="w-full h-24 px-4 py-3 bg-surface border border-border-subtle text-text placeholder:text-muted resize-none focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Duration: {musicDuration}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={musicDuration}
                    onChange={(e) => setMusicDuration(parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInstrumental(true)}
                      className={`flex-1 py-2 border text-xs font-medium transition-colors ${
                        instrumental
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-subtle text-muted'
                      }`}
                    >
                      Instrumental
                    </button>
                    <button
                      onClick={() => setInstrumental(false)}
                      className={`flex-1 py-2 border text-xs font-medium transition-colors ${
                        !instrumental
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-subtle text-muted'
                      }`}
                    >
                      With Vocals
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={generateMusic}
                disabled={generating || !musicPrompt.trim()}
                className="w-full py-3 bg-accent text-bg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? 'Generating Beat...' : 'Generate Beat'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 border border-danger bg-danger/10 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="mt-8 p-6 border border-accent/30 bg-accent/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-text">Generated Audio</span>
                <button
                  onClick={downloadAudio}
                  className="text-xs px-3 py-1 border border-accent text-accent hover:bg-accent/10 transition-colors"
                >
                  Download
                </button>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
                style={{ filter: 'sepia(20%) saturate(70%) hue-rotate(10deg)' }}
              />
            </div>
          )}

          {/* Generating Indicator */}
          {generating && (
            <div className="mt-8 p-6 border border-border-subtle text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted text-sm">
                {mode === 'music' ? 'Creating your beat...' : 'Generating audio...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
