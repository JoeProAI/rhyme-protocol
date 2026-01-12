import { NextRequest, NextResponse } from 'next/server'
import { 
  generateContinuousVideoWithPhoton, 
  estimateGenerationTime, 
  estimateCost 
} from '@/lib/video-gen/photon-pipeline'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

/**
 * POST /api/video-gen/photon-pipeline
 * 
 * Generate a video with TRUE visual continuity using:
 * - Luma Photon for the start frame (same visual style as Ray-2)
 * - Nano Banana (Gemini Vision) for motion prediction
 * - Luma Ray-2 with keyframes for video generation
 * 
 * Body:
 * - prompt: string - The scene/story description
 * - duration: number - Total duration in seconds (default: 30, max: 60)
 * - style: string - Visual style (default: 'cinematic, high quality')
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { 
      prompt, 
      duration = 30, 
      style = 'cinematic, high quality, detailed'
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (duration > 60) {
      return NextResponse.json(
        { error: 'Maximum duration is 60 seconds' },
        { status: 400 }
      )
    }

    // Estimate time and cost
    const estimatedTime = estimateGenerationTime(duration)
    const estimatedCost = estimateCost(duration)

    console.log(`\n🎬 Starting Photon Pipeline`)
    console.log(`   Estimated time: ${Math.ceil(estimatedTime / 60)} minutes`)
    console.log(`   Estimated cost: $${estimatedCost.toFixed(2)}`)

    // Generate the video
    const result = await generateContinuousVideoWithPhoton(prompt, duration, style)

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

    return NextResponse.json({
      success: true,
      pipeline: 'photon-nanoBanana-ray2',
      totalDuration: result.totalDuration,
      segmentCount: result.segments.length,
      startFrameUrl: result.startFrameUrl,
      segments: result.segments.map(s => ({
        index: s.index,
        videoUrl: s.videoUrl,
        thumbnailUrl: s.thumbnailUrl,
        keyframeUrl: s.keyframeUrl,
        motionDescription: s.motionDescription,
        duration: s.duration,
      })),
      generationTime: `${totalTime}s`,
      cost: {
        estimated: `$${estimatedCost.toFixed(2)}`,
        breakdown: {
          photon: '$0.02',
          nanoBanana: `$${(result.segments.length * 0.01).toFixed(2)}`,
          ray2: `$${(result.segments.length * 0.30).toFixed(2)}`,
        }
      },
      instructions: {
        concatenate: 'ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4',
        note: 'All frames generated with Luma (Photon + Ray-2) for consistent visual style. Nano Banana provides intelligent motion prediction.',
      }
    })

  } catch (error) {
    console.error('Photon pipeline error:', error)
    
    return NextResponse.json(
      { 
        error: 'Video generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video-gen/photon-pipeline
 * 
 * Get information about the pipeline
 */
export async function GET() {
  return NextResponse.json({
    name: 'Photon + Nano Banana + Ray-2 Pipeline',
    description: 'Generates videos with true visual continuity using Luma\'s unified visual style',
    pipeline: [
      '1. Luma Photon generates start frame (consistent with Ray-2 style)',
      '2. Nano Banana (Gemini Vision) analyzes frame and predicts motion',
      '3. Ray-2 generates 5s video using Photon frame as keyframe',
      '4. Video thumbnail becomes next segment\'s keyframe',
      '5. Repeat for desired duration',
    ],
    advantages: [
      'Visual consistency: Photon and Ray-2 share the same visual DNA',
      'Intelligent motion: Nano Banana predicts natural scene progression',
      'True keyframing: Each segment starts where the last one ended',
    ],
    limits: {
      maxDuration: 60,
      segmentDuration: 5,
    },
    estimatedCosts: {
      '30s': '$1.94',
      '60s': '$3.86',
    },
    estimatedTime: {
      '30s': '~6 minutes',
      '60s': '~11 minutes',
    },
  })
}
