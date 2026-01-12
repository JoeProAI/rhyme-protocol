import { NextRequest, NextResponse } from 'next/server'
import { generateContinuousVideo, generateContinuousVideoPremium } from '@/lib/video-gen/continuous-video'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

/**
 * POST /api/video-gen/continuous
 * 
 * Generate a video with TRUE visual continuity using keyframing.
 * Each segment uses the previous segment's last frame as its starting keyframe.
 * 
 * Body:
 * - prompt: string - The scene/story description
 * - duration: number - Total duration in seconds (default: 30)
 * - style: string - Visual style (default: 'cinematic')
 * - premium: boolean - Use premium mode with dual keyframes (default: false)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { 
      prompt, 
      duration = 30, 
      style = 'cinematic',
      premium = false 
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (duration > 60) {
      return NextResponse.json(
        { error: 'Maximum duration is 60 seconds (12 segments)' },
        { status: 400 }
      )
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`🎬 CONTINUOUS VIDEO GENERATION`)
    console.log(`${'='.repeat(60)}`)
    console.log(`Mode: ${premium ? 'PREMIUM (dual keyframes)' : 'STANDARD (single keyframe)'}`)
    console.log(`Duration: ${duration}s`)
    console.log(`Style: ${style}`)
    console.log(`Prompt: ${prompt.substring(0, 100)}...`)
    console.log(`${'='.repeat(60)}\n`)

    // Generate the video
    const result = premium
      ? await generateContinuousVideoPremium(prompt, duration, style)
      : await generateContinuousVideo(prompt, duration, style)

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Video generation failed',
          details: result.error,
        },
        { status: 500 }
      )
    }

    // Calculate costs
    const segmentCount = result.segments.length
    const imageCost = premium ? segmentCount * 0.04 : 0.04 // GPT-Image-1 per frame
    const motionCost = segmentCount * 0.01 // Gemini
    const videoCost = segmentCount * 0.30 // Luma Ray-2
    const totalCost = imageCost + motionCost + videoCost

    return NextResponse.json({
      success: true,
      mode: premium ? 'premium' : 'standard',
      totalDuration: result.totalDuration,
      segmentCount,
      segments: result.segments.map(s => ({
        index: s.index,
        videoUrl: s.videoUrl,
        thumbnailUrl: s.thumbnailUrl,
        duration: s.duration,
      })),
      generationTime: `${totalTime}s`,
      cost: {
        images: imageCost.toFixed(2),
        motion: motionCost.toFixed(2),
        videos: videoCost.toFixed(2),
        total: totalCost.toFixed(2),
      },
      instructions: {
        concatenate: 'Download all segments and use ffmpeg: ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4',
        note: 'Segments are generated with keyframe continuity - characters and scenes should persist across segments.',
      }
    })

  } catch (error) {
    console.error('Continuous video generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Video generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
