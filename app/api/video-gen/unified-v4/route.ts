/**
 * API Route for Unified Video Pipeline V4
 * 
 * V4 Enhancements:
 * - Style anchoring (original frame as reference)
 * - Motion-enhanced Luma prompts
 * - Narrative evolution (story expands over time)
 * - Negative prompts (prevent style drift)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateUnifiedVideoV4, estimateTimeV4, estimateCostV4 } from '@/lib/video-gen/unified-video-pipeline-v4'

export const maxDuration = 300 // 5 minutes max for serverless

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      prompt,
      duration = 30,
      style = 'hyper realistic, photorealistic, cinematic lighting',
      segmentDuration = '9s'
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log(`
🎬 Starting Unified Video Pipeline V4
   Estimated time: ${estimateTimeV4(duration, segmentDuration)}
   Estimated cost: ${estimateCostV4(duration, segmentDuration)}
`)

    const result = await generateUnifiedVideoV4(
      prompt,
      duration,
      style,
      segmentDuration
    )

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Generated ${result.segments.length} video segments (${result.totalDuration}s total)`
        : 'Pipeline failed',
      segments: result.segments,
      totalDuration: result.totalDuration,
      technologies: {
        imageGeneration: 'GPT-Image-1.5',
        futurePrediction: 'Nano Banana (Gemini Vision)',
        videoGeneration: 'Luma Ray-2',
        v4Enhancements: [
          'Style anchoring',
          'Motion-enhanced prompts',
          'Narrative evolution',
          'Negative prompts for style consistency'
        ]
      },
      cost: {
        estimated: estimateCostV4(duration, segmentDuration)
      },
      instructions: {
        concatenate: 'ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4'
      },
      error: result.error
    })

  } catch (error) {
    console.error('Unified V4 Pipeline error:', error)
    return NextResponse.json(
      { 
        error: 'Pipeline failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Unified Video Pipeline V4',
    version: '4.0',
    description: 'Long-form video generation with GPT-Image-1.5 + Nano Banana + Luma Ray-2',
    v4Enhancements: {
      styleAnchoring: 'Original frame kept as style reference for all subsequent generations',
      motionPrompts: 'Specific motion descriptors passed to Luma for natural movement',
      narrativeEvolution: 'Story expands and evolves across segments via Nano Banana',
      negativePrompts: 'Explicit style constraints to prevent drift (NOT cartoon, NOT animated)',
      cumulativeContext: 'Each segment builds on previous narrative context'
    },
    endpoints: {
      POST: {
        body: {
          prompt: 'string (required) - Scene description',
          duration: 'number (optional, default: 30) - Target duration in seconds',
          style: 'string (optional, default: "hyper realistic, photorealistic, cinematic lighting")',
          segmentDuration: '"5s" | "9s" (optional, default: "9s")'
        }
      }
    },
    example: {
      prompt: 'A cat and a dragon in a magical forest. The cat is curious and approaches the friendly dragon. They become friends.',
      duration: 30,
      style: 'hyper realistic, photorealistic, cinematic lighting',
      segmentDuration: '9s'
    },
    costs: {
      perSegment: '$0.41 (2x GPT-Image-1.5 + Luma Ray-2)',
      example30s: estimateCostV4(30, '9s')
    }
  })
}
