/**
 * Audio-to-Video API Endpoint
 * 
 * POST /api/video-gen/audio-to-video
 * 
 * Converts audio (speech, music, podcast) into coherent video with visual consistency.
 * 
 * Pipeline:
 * 1. Whisper - Transcribe audio with timestamps
 * 2. GPT-4 - Plan scenes based on transcript
 * 3. GPT-Image-1.5 - Generate keyframes with style consistency
 * 4. Nano Banana (Gemini) - Predict motion for each scene
 * 5. Luma Ray-2 - Generate video segments
 * 6. FFmpeg - Concatenate and merge with original audio
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateAudioToVideo, AudioToVideoInput } from '@/lib/video-gen/audio-to-video-pipeline'

export const maxDuration = 300 // 5 minutes max for serverless

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.audioUrl) {
      return NextResponse.json(
        { error: 'audioUrl is required' },
        { status: 400 }
      )
    }
    
    // Build input
    const input: AudioToVideoInput = {
      audioUrl: body.audioUrl,
      audioFormat: body.audioFormat || 'mp3',
      style: body.style,
      aspectRatio: body.aspectRatio || '16:9',
      segmentDuration: body.segmentDuration || '5s',
      maxDuration: body.maxDuration,
      styleReferenceImage: body.styleReferenceImage
    }
    
    // Run pipeline
    const result = await generateAudioToVideo(input)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Pipeline failed',
          partialSegments: result.segments.length
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      duration: result.totalDuration,
      segments: result.segments.length,
      transcription: result.transcription.fullText,
      scenes: result.scenePlan.scenes.map(s => ({
        index: s.sceneIndex,
        startTime: s.startTime,
        endTime: s.endTime,
        visual: s.visualDescription,
        mood: s.mood
      }))
    })
    
  } catch (error) {
    console.error('Audio-to-Video API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Audio-to-Video Pipeline',
    version: '1.0.0',
    description: 'Converts audio to coherent video with visual consistency',
    
    pipeline: [
      '1. Whisper - Transcribe audio with timestamps',
      '2. GPT-4 - Plan scenes based on transcript',
      '3. GPT-Image-1.5 - Generate keyframes with style consistency',
      '4. Nano Banana (Gemini) - Predict motion for each scene',
      '5. Luma Ray-2 - Generate video segments',
      '6. FFmpeg - Concatenate and merge with original audio'
    ],
    
    consistencyMechanisms: [
      'Style Anchor - Consistent style description for all frames',
      'Character Descriptions - Named characters with detailed descriptions',
      'Frame-to-Frame Reference - Previous frame as reference for next keyframe',
      'Motion Continuity - Last frame extraction for smooth transitions'
    ],
    
    request: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        audioUrl: 'string (required) - URL or base64 data URL of audio file',
        audioFormat: 'string (optional) - mp3, wav, webm, m4a. Default: mp3',
        style: 'string (optional) - Visual style description',
        aspectRatio: 'string (optional) - 16:9, 9:16, 1:1. Default: 16:9',
        segmentDuration: 'string (optional) - 5s or 9s. Default: 5s',
        maxDuration: 'number (optional) - Max output duration in seconds',
        styleReferenceImage: 'string (optional) - Base64 reference image for style'
      }
    },
    
    response: {
      success: 'boolean',
      videoUrl: 'string - URL/path to final video with audio',
      duration: 'number - Total duration in seconds',
      segments: 'number - Number of video segments generated',
      transcription: 'string - Full transcribed text',
      scenes: 'array - Scene breakdown with timing and descriptions'
    },
    
    costEstimate: {
      '60s_audio_5s_segments': {
        whisper: '$0.006',
        gpt4_planning: '$0.03',
        gpt_image_12_frames: '$0.96',
        gemini_12_calls: '$0.012',
        luma_12_segments: '$3.84',
        total: '~$4.85'
      }
    },
    
    requiredEnvVars: [
      'OPENAI_API_KEY',
      'GEMINI_API_KEY', 
      'LUMA_API_KEY'
    ],
    
    requiredDependencies: [
      'ffmpeg (system)',
      'openai',
      '@google/generative-ai'
    ]
  })
}
