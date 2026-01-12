'use client'

import { useState } from 'react'
import { Play, Download, Loader, Film, Zap, AlertCircle } from 'lucide-react'

interface Segment {
  index: number
  startTime: number
  endTime: number
  startFrame: string
  endFrame: string
  videoUrl: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error?: string
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(10)
  const [style, setStyle] = useState('cinematic')
  const [generating, setGenerating] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setResult(null)
    
    // Initialize segments
    const segmentCount = Math.ceil(duration / 5)
    const initialSegments: Segment[] = Array.from({ length: segmentCount }, (_, i) => ({
      index: i,
      status: 'processing',
      startTime: i * 5,
      endTime: (i + 1) * 5,
      startFrame: '',
      endFrame: '',
      videoUrl: '',
    }))
    
    setSegments(initialSegments)
    
    try {
      console.log('🎬 Starting video generation with Luma Ray 3...')
      
      // Use synchronous generate endpoint (works better on serverless)
      const response = await fetch('/api/video-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, style }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }
      
      console.log('✅ Video generation complete!')
      console.log('📊 Full API Response:', JSON.stringify(data, null, 2))
      
      // Update segments with results
      if (data.segments && data.segments.length > 0) {
        const updatedSegments = data.segments.map((seg: any) => {
          console.log(`Segment ${seg.index}:`, seg)
          return {
            ...seg,
            status: seg.status || 'completed',
            videoUrl: seg.videoUrl || seg.video_url || seg.url || '',
          }
        })
        setSegments(updatedSegments)
        
        // Check if any segment has a video URL
        const hasVideos = updatedSegments.some((s: Segment) => s.videoUrl)
        if (!hasVideos) {
          console.warn('⚠️ No video URLs found in segments!')
          setError('Videos generated but URLs not returned. Check Vercel logs.')
        }
      } else {
        console.warn('⚠️ No segments in response!')
      }
      
      setResult({
        success: true,
        segments: data.segments || [],
        duration: data.duration,
        cost: data.cost || { total: 0 },
        generationTime: data.generationTime,
        raw: data, // Keep raw response for debugging
      })
      
    } catch (err) {
      console.error('Video generation failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }
  
  const completedSegments = segments.filter(s => s.status === 'completed')
  const failedSegments = segments.filter(s => s.status === 'failed')
  
  return (
    <div className="min-h-screen relative z-10 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-white">AI Video</span>
            <span className="text-[var(--primary)]"> Generator</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base">
            Create videos from text using Nano Banana + Luma Ray 3
          </p>
        </div>
        
        {/* Input Section */}
        {!generating && !result && (
          <div className="glass card-border p-6 mb-6">
            <label className="block mb-4">
              <span className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                Video Prompt
              </span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cat walking through a magical forest, cinematic lighting..."
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-foreground resize-none focus:border-[var(--primary)] focus:outline-none transition-colors"
                rows={3}
              />
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label>
                <span className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                  Duration
                </span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-foreground focus:border-[var(--primary)] focus:outline-none transition-colors"
                >
                  <option value={5}>5 seconds (1 segment)</option>
                  <option value={10}>10 seconds (2 segments)</option>
                  <option value={15}>15 seconds (3 segments)</option>
                  <option value={30}>30 seconds (6 segments)</option>
                </select>
              </label>
              
              <label>
                <span className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                  Style
                </span>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-foreground focus:border-[var(--primary)] focus:outline-none transition-colors"
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="realistic">Realistic</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="anime">Anime</option>
                  <option value="3d">3D Render</option>
                </select>
              </label>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!prompt || generating}
              className="w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Film size={20} />
              Generate Video
            </button>
            
            <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <div className="flex items-start gap-3 text-sm">
                <Zap className="text-[var(--primary)] flex-shrink-0 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="font-medium mb-1">Estimated</p>
                  <div className="text-[var(--text-muted)] space-y-1">
                    <p>Time: ~{Math.ceil(duration / 5) * 45} seconds</p>
                    <p>Cost: ${(Math.ceil(duration / 5) * 0.22).toFixed(2)} (API costs)</p>
                    <p className="text-xs mt-2">You'll be charged: ${(Math.ceil(duration / 5) * 0.50).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="glass card-border border-2 border-red-500 p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-red-500 mb-2">Generation Failed</h3>
                <p className="text-sm text-[var(--text-muted)]">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Progress Section */}
        {generating && (
          <div className="glass card-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Loader className="animate-spin text-[var(--primary)]" size={24} />
              <h2 className="text-xl font-bold">Generating Video...</h2>
            </div>
            
            <div className="space-y-3">
              {segments.map((segment) => (
                <div
                  key={segment.index}
                  className="flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                      {segment.status === 'completed' && <span className="text-[var(--primary)]">✓</span>}
                      {segment.status === 'processing' && <Loader className="animate-spin text-[var(--primary)]" size={16} />}
                      {segment.status === 'failed' && <span className="text-red-500">✗</span>}
                      {segment.status === 'queued' && <span className="text-[var(--text-muted)] text-sm">{segment.index + 1}</span>}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Segment {segment.index + 1}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {segment.startTime}s - {segment.endTime}s
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs text-[var(--text-muted)] capitalize px-3 py-1 bg-[var(--card-bg)] border border-[var(--border)] rounded">
                    {segment.status}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
              This may take several minutes depending on video length...
            </p>
          </div>
        )}
        
        {/* Results Section */}
        {result && completedSegments.length > 0 && (
          <div className="glass card-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Video Complete!</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {completedSegments.length}/{segments.length} segments successful
                  {failedSegments.length > 0 && ` • ${failedSegments.length} failed`}
                </p>
              </div>
            </div>
            
            {/* Video Segments */}
            <div className="space-y-4 mb-6">
              {completedSegments.map((segment) => (
                <div key={segment.index} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Segment {segment.index + 1} ({segment.startTime}s - {segment.endTime}s)
                    </span>
                    <a
                      href={segment.videoUrl}
                      download={`segment-${segment.index + 1}.mp4`}
                      className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-medium rounded transition-all flex items-center gap-2"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  </div>
                  
                  <video
                    src={segment.videoUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
                <p className="text-xs text-[var(--text-muted)] mb-1">Duration</p>
                <p className="text-lg font-bold text-[var(--primary)]">{result.duration}s</p>
              </div>
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
                <p className="text-xs text-[var(--text-muted)] mb-1">Segments</p>
                <p className="text-lg font-bold text-[var(--primary)]">{completedSegments.length}</p>
              </div>
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
                <p className="text-xs text-[var(--text-muted)] mb-1">Gen Time</p>
                <p className="text-lg font-bold text-[var(--primary)]">{result.generationTime}s</p>
              </div>
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
                <p className="text-xs text-[var(--text-muted)] mb-1">Cost</p>
                <p className="text-lg font-bold text-[var(--primary)]">${(result.cost?.total || 0).toFixed(2)}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResult(null)
                  setSegments([])
                  setPrompt('')
                  setError(null)
                }}
                className="flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded-lg transition-all"
              >
                Generate New Video
              </button>
            </div>
            
            {/* Note */}
            <div className="mt-6 p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <p className="text-xs text-[var(--text-muted)]">
                <strong>Note:</strong> Segments are separate video files. Use a video editor like 
                CapCut, iMovie, or Adobe Premiere to combine them into a single video, or download 
                them individually.
              </p>
            </div>
            
            {/* Debug Info */}
            {result.raw && (
              <details className="mt-4">
                <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-white">
                  Debug: View Raw Response
                </summary>
                <pre className="mt-2 p-4 bg-black/50 rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
