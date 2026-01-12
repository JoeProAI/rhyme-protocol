/**
 * API Route for Unified Video Pipeline V5
 * 
 * V5 Key Changes:
 * - Single keyframe only (no end frame forcing)
 * - Luma Camera Concepts for cinematic motion control
 * - Motion-focused prompts (describes action, not end state)
 * - Natural motion generation instead of morph between stills
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateUnifiedVideoV5, estimateCostV5 } from '@/lib/video-gen/unified-video-pipeline-v5'

export const maxDuration = 300

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

    const segmentSeconds = segmentDuration === '9s' ? 9 : 5
    const numSegments = Math.ceil(duration / segmentSeconds)

    console.log(`
🎬 Starting Unified Video Pipeline V5
   Segments: ${numSegments} x ${segmentSeconds}s
   Estimated cost: ${estimateCostV5(duration, segmentDuration)}
   Key feature: Single keyframe + Camera Concepts
`)

    const result = await generateUnifiedVideoV5(
      prompt,
      duration,
      style,
      segmentDuration
    )

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Generated ${result.segments.length} segments (${result.totalDuration}s)`
        : 'Pipeline failed',
      segments: result.segments,
      totalDuration: result.totalDuration,
      v5Features: {
        singleKeyframe: 'Only start frame provided - no end frame forcing',
        cameraConcepts: 'Luma Camera Concepts for cinematic motion',
        motionPrompts: 'Describes action/motion, not end state',
        naturalMotion: 'Luma generates fluid motion instead of morphing'
      },
      cost: {
        estimated: estimateCostV5(duration, segmentDuration)
      },
      error: result.error
    })

  } catch (error) {
    console.error('V5 Pipeline error:', error)
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
    name: 'Unified Video Pipeline V5',
    version: '5.0',
    description: 'Natural motion video generation with Camera Concepts',
    keyChanges: {
      v4Problem: 'Dual keyframes caused play-pause-zoom-change effect (morphing between stills)',
      v5Solution: 'Single keyframe + Camera Concepts = natural continuous motion'
    },
    cameraConcepts: [
      'push_in', 'pull_out', 'orbit_left', 'orbit_right', 'pan_left', 'pan_right',
      'crane_up', 'crane_down', 'handheld', 'static', 'dolly_zoom', 'aerial_drone'
    ],
    endpoints: {
      POST: {
        body: {
          prompt: 'string (required)',
          duration: 'number (default: 30)',
          style: 'string (default: hyper realistic)',
          segmentDuration: '"5s" | "9s" (default: "9s")'
        }
      }
    },
    example: {
      prompt: 'A cat and a dragon in a magical forest. The cat is curious and approaches the friendly dragon.',
      duration: 30,
      style: 'hyper realistic, photorealistic, cinematic lighting'
    }
  })
}
