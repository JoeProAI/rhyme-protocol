import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkUsage, trackUsage, generateSessionId } from '@/lib/usage-system'
import { generateStartFrame } from '@/lib/video-gen/gpt-image-1'
import { predictSceneMotion } from '@/lib/video-gen/nano-banana-pro'
import { generateVideoSegment } from '@/lib/video-gen/getimg'

// Use Node.js runtime for longer timeout
// Note: Video generation takes ~30-60s per segment with Luma Ray 3
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes (requires Vercel Pro)

interface VideoSegment {
  index: number
  startTime: number
  endTime: number
  startFrame: string
  endFrame: string
  videoUrl: string
  status: 'completed' | 'failed'
  error?: string
}

/**
 * POST /api/video-gen/generate
 * Generate a complete video from a text prompt
 * 
 * Note: This may take several minutes depending on video length
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const { prompt, duration = 10, style = 'cinematic' } = body
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }
    
    // Get or create session for rate limiting
    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    if (!sessionId) {
      sessionId = generateSessionId()
    }

    // Check usage limits
    const usage = await checkUsage(sessionId, 'video_generations')
    if (!usage.allowed) {
      const response = NextResponse.json({
        error: usage.reason,
        limit: usage.limit,
        used: usage.used,
        remaining: 0,
        upgrade_url: '/dashboard',
      }, { status: 429 })
      
      if (!cookieStore.get('anon_session')?.value) {
        response.cookies.set('anon_session', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60,
          path: '/',
        })
      }
      return response
    }
    
    const segmentCount = Math.ceil(duration / 5)
    const segments: VideoSegment[] = []
    
    console.log(`🎬 Starting video generation: ${duration}s (${segmentCount} segments)`)
    
    // Step 1: Generate initial start frame
    console.log('🎨 Generating start frame...')
    const { imageBase64: startFrame, responseId } = await generateStartFrame(
      prompt,
      style
    )
    
    let currentFrame = startFrame
    
    // Step 2: Generate each segment
    for (let i = 0; i < segmentCount; i++) {
      const segmentStartTime = Date.now()
      console.log(`\n🎬 Generating segment ${i + 1}/${segmentCount}...`)
      
      try {
        // Use Nano Banana (Gemini) to predict motion/action for this segment
        console.log(`  🍌 Nano Banana: Predicting motion for segment ${i + 1}...`)
        const motionDescription = await predictSceneMotion(currentFrame, prompt, i)
        
        console.log(`  📝 Motion: ${motionDescription.substring(0, 80)}...`)
        
        // Build full video prompt
        const videoPrompt = `${prompt}. ${motionDescription}. Style: ${style}, cinematic quality, smooth motion.`
        
        // Generate video with Luma Ray 3
        console.log(`  🎥 Generating video with Luma Ray 3...`)
        const videoResult = await generateVideoSegment(videoPrompt, 5)
        
        if (videoResult.status !== 'completed' || !videoResult.url) {
          throw new Error(`Video generation failed: ${videoResult.error || 'Unknown error'}`)
        }
        
        const segmentTime = ((Date.now() - segmentStartTime) / 1000).toFixed(1)
        console.log(`  ✓ Segment ${i + 1} completed in ${segmentTime}s`)
        
        // Save segment
        segments.push({
          index: i,
          startTime: i * 5,
          endTime: (i + 1) * 5,
          startFrame: currentFrame,
          endFrame: '',
          videoUrl: videoResult.url,
          status: 'completed',
        })
        
      } catch (error) {
        console.error(`  ❌ Segment ${i + 1} failed:`, error)
        
        segments.push({
          index: i,
          startTime: i * 5,
          endTime: (i + 1) * 5,
          startFrame: currentFrame,
          endFrame: '',
          videoUrl: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        
        // Continue with remaining segments
      }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    const successCount = segments.filter(s => s.status === 'completed').length
    
    console.log(`\n✅ Video generation complete!`)
    console.log(`   Total time: ${totalTime}s`)
    console.log(`   Successful segments: ${successCount}/${segmentCount}`)
    
    // Track usage for billing
    if (sessionId) {
      // Track each successful segment
      await trackUsage(sessionId, 'video_generations', successCount)
      console.log(`Tracked ${successCount} video segments for session`)
    }
    
    // Calculate cost
    const imageCost = 0.04 // GPT-Image-1 start frame
    const motionCost = successCount * 0.01 // Gemini motion prediction
    const videoCost = successCount * 0.30 // Luma Ray 3 videos
    const totalCost = imageCost + motionCost + videoCost
    
    return NextResponse.json({
      success: true,
      duration,
      segmentCount,
      successCount,
      segments,
      generationTime: totalTime,
      cost: {
        images: imageCost,
        videos: videoCost,
        total: totalCost,
      },
      note: 'Segments are separate videos. Download individually or use a video editor to combine them.',
    })
    
  } catch (error) {
    console.error('Video generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Video generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
