import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkUsage, trackUsage, generateSessionId } from '@/lib/usage-system'
import { generateUnifiedVideoV5 } from '@/lib/video-gen/unified-video-pipeline-v5'
import { loadPreset, enhancePromptWithPreset, RapStyle } from '@/lib/video-gen/presets'
import { createJob, getJob, updateJob, completeJob, failJob } from '@/lib/video-gen/job-store'

export const runtime = 'nodejs'
export const maxDuration = 300

interface RapVideoRequest {
  prompt?: string
  audioUrl?: string
  style?: RapStyle
  lyrics?: string
  lyricsFormat?: 'plain' | 'lrc' | 'srt'
  lyricOptions?: {
    fontSize?: number
    position?: 'bottom' | 'center' | 'top'
    animation?: 'fade' | 'typewriter' | 'none'
  }
  segmentDuration?: 5 | 9
  aspectRatio?: '16:9' | '9:16' | '1:1'
  targetDuration?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: RapVideoRequest = await req.json()
    const {
      prompt = '',
      style = 'street',
      lyrics,
      lyricsFormat = 'plain',
      lyricOptions = {},
      segmentDuration = 9,
      targetDuration = 30
    } = body

    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    if (!sessionId) {
      sessionId = generateSessionId()
    }

    const usage = await checkUsage(sessionId, 'video_generations')
    if (!usage.allowed) {
      return NextResponse.json({
        error: usage.reason,
        limit: usage.limit,
        used: usage.used,
        remaining: 0,
        upgrade_url: '/dashboard',
      }, { status: 429 })
    }

    const preset = loadPreset(style)
    if (!preset) {
      return NextResponse.json(
        { error: `Invalid style: ${style}` },
        { status: 400 }
      )
    }

    const enhancedPrompt = prompt
      ? enhancePromptWithPreset(prompt, preset)
      : enhancePromptWithPreset('music video scene', preset)

    const styleString = `${preset.basePrompt}, ${preset.colorGrade}, photorealistic, cinematic`

    const numSegments = Math.ceil(targetDuration / segmentDuration)
    const jobId = createJob(numSegments)

    updateJob(jobId, { status: 'processing' })

    console.log(`
════════════════════════════════════════════════════════════
🎤 RAP VIDEO GENERATION STARTED
════════════════════════════════════════════════════════════
Job ID: ${jobId}
Style: ${style} (${preset.name})
Duration: ${targetDuration}s
Segment Duration: ${segmentDuration}s
Enhanced Prompt: ${enhancedPrompt.substring(0, 100)}...
════════════════════════════════════════════════════════════
`)

    generateRapVideoAsync(jobId, {
      prompt: enhancedPrompt,
      style: styleString,
      targetDuration,
      segmentDuration,
      lyrics,
      lyricsFormat,
      lyricOptions,
      sessionId
    })

    return NextResponse.json({
      success: true,
      jobId,
      status: 'processing',
      message: `Generating ${preset.name} style music video...`,
      estimatedTime: `${Math.ceil(targetDuration / segmentDuration) * 45} seconds`
    })

  } catch (error) {
    console.error('Rap video generation error:', error)
    return NextResponse.json(
      {
        error: 'Video generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateRapVideoAsync(
  jobId: string,
  options: {
    prompt: string
    style: string
    targetDuration: number
    segmentDuration: 5 | 9
    lyrics?: string
    lyricsFormat?: 'plain' | 'lrc' | 'srt'
    lyricOptions?: any
    sessionId: string
  }
) {
  const job = getJob(jobId)
  if (!job) return

  try {
    const segmentDurationStr = options.segmentDuration === 9 ? '9s' : '5s'

    const result = await generateUnifiedVideoV5(
      options.prompt,
      options.targetDuration,
      options.style,
      segmentDurationStr as '5s' | '9s'
    )

    if (result.success && result.segments.length > 0) {
      const segments = result.segments.map(s => ({
        index: s.index,
        startTime: s.index * options.segmentDuration,
        endTime: (s.index + 1) * options.segmentDuration,
        videoUrl: s.videoUrl,
        status: 'completed' as const
      }))

      const imageCost = result.segments.length * 0.08
      const videoCost = result.segments.length * 0.25
      const totalCost = imageCost + videoCost

      completeJob(jobId, segments, totalCost, result.totalDuration)

      await trackUsage(options.sessionId, 'video_generations', result.segments.length)

      console.log(`✅ Rap video job ${jobId} completed: ${result.segments.length} segments`)
    } else {
      failJob(jobId, result.error || 'No segments generated')
      console.error(`❌ Rap video job ${jobId} failed:`, result.error)
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    failJob(jobId, errorMsg)
    console.error(`❌ Rap video job ${jobId} error:`, error)
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 })
  }

  const job = getJob(jobId)
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    segments: job.segments,
    totalDuration: job.totalDuration,
    totalCost: job.totalCost,
    error: job.error
  })
}
