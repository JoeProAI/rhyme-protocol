import { NextRequest, NextResponse } from 'next/server'
import { 
  generateWithNanoBananaKeyframes, 
  estimateTime, 
  estimateCost 
} from '@/lib/video-gen/nano-banana-keyframe-pipeline'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

// Luma Ray-2 only supports these durations
type LumaDuration = '5s' | '9s'

/**
 * POST /api/video-gen/nano-banana
 * 
 * TRUE Nano Banana Keyframe Pipeline:
 * - Nano Banana generates END frames (actual keyframes, not just motion text)
 * - Uses DUAL keyframes (frame0 + frame1) in Ray-2 for interpolation
 * - End frame of segment N = Start frame of segment N+1
 * 
 * Body:
 * - prompt: string - Scene/story description
 * - duration: number - Target total duration (default: 30, max: 90)
 * - style: string - Visual style
 * - segmentDuration: '5s' | '9s' - Duration per segment (default: '9s')
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { 
      prompt, 
      duration = 30, 
      style = 'cinematic, high quality, Pixar-style animation',
      segmentDuration = '9s' as LumaDuration
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (duration > 90) {
      return NextResponse.json(
        { error: 'Maximum duration is 90 seconds' },
        { status: 400 }
      )
    }

    // Validate segment duration
    const validDuration: LumaDuration = segmentDuration === '5s' ? '5s' : '9s'

    const estTime = estimateTime(duration, validDuration)
    const estCost = estimateCost(duration, validDuration)

    console.log(`\n🍌 Starting Nano Banana Keyframe Pipeline`)
    console.log(`   Estimated time: ${Math.ceil(estTime / 60)} minutes`)
    console.log(`   Estimated cost: $${estCost.toFixed(2)}`)

    const result = await generateWithNanoBananaKeyframes(prompt, duration, style, validDuration)

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Generation failed', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pipeline: 'nano-banana-dual-keyframe',
      totalDuration: result.totalDuration,
      segmentCount: result.segments.length,
      segments: result.segments.map(s => ({
        index: s.index,
        startFrameUrl: s.startFrameUrl,
        endFrameUrl: s.endFrameUrl,
        videoUrl: s.videoUrl,
        thumbnailUrl: s.thumbnailUrl,
        motionDescription: s.motionDescription,
        duration: s.duration,
      })),
      generationTime: `${totalTime}s`,
      cost: {
        estimated: `$${estCost.toFixed(2)}`,
        breakdown: {
          photonFrames: `$${((result.segments.length + 1) * 0.02).toFixed(2)}`,
          nanoBanana: `$${(result.segments.length * 0.01).toFixed(2)}`,
          ray2Videos: `$${(result.segments.length * 0.30).toFixed(2)}`,
        }
      },
      keyframeInfo: {
        method: 'Nano Banana generates END frames, Ray-2 interpolates between START and END',
        continuity: 'Each segment\'s end frame becomes the next segment\'s start frame',
      },
      instructions: {
        concatenate: 'ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4',
      }
    })

  } catch (error) {
    console.error('Nano Banana pipeline error:', error)
    return NextResponse.json(
      { error: 'Generation failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video-gen/nano-banana
 */
export async function GET() {
  return NextResponse.json({
    name: 'Nano Banana Dual Keyframe Pipeline',
    description: 'TRUE keyframe generation - Nano Banana generates END frames (keyframes), not just motion descriptions',
    pipeline: [
      '1. Photon-1 generates START frame (Luma image model)',
      '2. Nano Banana (Gemini Vision) analyzes start frame',
      '3. Nano Banana PREDICTS what scene looks like N seconds later',
      '4. Photon-1 generates that END frame based on prediction',
      '5. Ray-2 uses BOTH frame0 (start) AND frame1 (end) for interpolation',
      '6. End frame becomes next segment\'s start frame',
      '7. Repeat for continuous video with perfect keyframe continuity',
    ],
    keyDifference: 'Ray-2 gets TWO anchor points (keyframes) per segment, ensuring it interpolates between known states rather than guessing the end state.',
    parameters: {
      prompt: 'Scene/story description (required)',
      duration: 'Target total duration in seconds (default: 30, max: 90)',
      style: 'Visual style (default: cinematic)',
      segmentDuration: "'5s' or '9s' - Luma Ray-2 only supports these durations (default: '9s')",
    },
    limits: { 
      maxDuration: 90,
      segmentDurations: ['5s', '9s'],
    },
    estimates: {
      '30s_9s_segments': { segments: 4, time: '~5 minutes', cost: '$1.34' },
      '30s_5s_segments': { segments: 6, time: '~7 minutes', cost: '$1.98' },
      '60s_9s_segments': { segments: 7, time: '~8 minutes', cost: '$2.31' },
    },
  })
}
