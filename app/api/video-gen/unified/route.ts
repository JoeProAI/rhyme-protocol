/**
 * Unified Video Pipeline API
 * 
 * Combines GPT-Image-1.5 + Nano Banana + Luma Ray-2 for consistent long-form video
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  generateUnifiedVideo, 
  estimateTime, 
  estimateCost 
} from '@/lib/video-gen/unified-video-pipeline'

type LumaDuration = '5s' | '9s'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      prompt, 
      duration = 30, 
      style = 'cinematic, high quality',
      segmentDuration = '9s'
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Validate segment duration
    const validDuration: LumaDuration = segmentDuration === '5s' ? '5s' : '9s'

    console.log(`\n🎬 Starting Unified Video Pipeline`)
    console.log(`   Estimated time: ${estimateTime(duration, validDuration)}`)
    console.log(`   Estimated cost: ${estimateCost(duration, validDuration)}`)

    const result = await generateUnifiedVideo(
      prompt,
      duration,
      style,
      validDuration
    )

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Pipeline failed', 
          details: result.error,
          partialResults: result.segments 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prompt,
      targetDuration: duration,
      actualDuration: result.totalDuration,
      segmentCount: result.segments.length,
      segments: result.segments,
      technologies: {
        imageGeneration: 'GPT-Image-1.5',
        futurePrediction: 'Nano Banana (Gemini Vision)',
        videoGeneration: 'Luma Ray-2',
      },
      cost: {
        estimated: estimateCost(duration, validDuration),
      },
      instructions: {
        concatenate: "ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4"
      }
    })

  } catch (error) {
    console.error('Unified pipeline error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Unified Video Pipeline v2',
    description: 'Generate consistent long-form videos using GPT-Image-1.5 + Nano Banana + Luma Ray-2',
    technologies: {
      'GPT-Image-1.5': 'High fidelity image generation with visual consistency',
      'Nano Banana': 'Gemini Vision for intelligent future state prediction',
      'Luma Ray-2': 'Video generation with dual keyframe interpolation',
    },
    pipeline: [
      '1. GPT-Image-1.5 generates initial START frame',
      '2. Nano Banana analyzes frame → predicts scene 9s later',
      '3. GPT-Image-1.5 generates END frame WITH start frame as reference',
      '4. Luma Ray-2 generates video interpolating between START and END',
      '5. END frame becomes next segment START frame',
      '6. Repeat for desired duration',
    ],
    usage: {
      method: 'POST',
      body: {
        prompt: 'Scene description (required)',
        duration: 'Target duration in seconds (default: 30)',
        style: 'Visual style (default: cinematic, high quality)',
        segmentDuration: '5s or 9s (default: 9s)',
      },
      example: {
        prompt: 'A cat and a dragon in a magical forest becoming friends',
        duration: 30,
        style: 'cinematic, high quality, magical atmosphere',
        segmentDuration: '9s',
      },
    },
    estimates: {
      '30s video': {
        time: estimateTime(30, '9s'),
        cost: estimateCost(30, '9s'),
        segments: 4,
      },
      '60s video': {
        time: estimateTime(60, '9s'),
        cost: estimateCost(60, '9s'),
        segments: 7,
      },
    },
  })
}
