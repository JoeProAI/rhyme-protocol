import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { canUse } from '@/lib/usage-tracker'
import { createJob } from '@/lib/video-gen/job-store'

export const runtime = 'nodejs'
export const maxDuration = 10 // Quick response

/**
 * POST /api/video-gen/start
 * Start a video generation job (returns immediately with job ID)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, duration = 5, style = 'cinematic' } = body
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }
    
    // Check usage limits
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session_id')
    const sessionId = sessionCookie?.value || 'anonymous'
    
    const usage = canUse(sessionId)
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          message: usage.reason || 'Please add a payment method to continue',
        },
        { status: 402 } // Payment Required
      )
    }
    
    // Calculate segments
    const segmentCount = Math.ceil(duration / 5)
    
    // Create job
    const jobId = createJob(segmentCount)
    
    // Start generation in background (fire and forget)
    // Note: This will continue running even after response is sent
    startGenerationInBackground(jobId, prompt, style, duration, sessionId)
    
    return NextResponse.json({
      jobId,
      status: 'queued',
      estimatedTime: segmentCount * 75, // ~75s per segment
      segmentCount,
    })
    
  } catch (error) {
    console.error('Failed to start video generation:', error)
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    )
  }
}

/**
 * Start generation process in background
 * This runs independently and updates the job store
 */
async function startGenerationInBackground(
  jobId: string,
  prompt: string,
  style: string,
  duration: number,
  sessionId: string
) {
  // Import here to avoid circular dependencies and reduce cold start time
  const { generateStartFrame } = await import('@/lib/video-gen/gpt-image-1')
  const { predictSceneMotion } = await import('@/lib/video-gen/nano-banana-pro')
  const { generateVideoSegment } = await import('@/lib/video-gen/getimg')
  const { updateJobProgress, completeJob, failJob, updateJob } = await import('@/lib/video-gen/job-store')
  const { trackUsage } = await import('@/lib/usage-tracker')
  
  try {
    updateJob(jobId, { status: 'processing' })
    
    const segmentCount = Math.ceil(duration / 5)
    const segments: Array<{
      index: number
      startTime: number
      endTime: number
      videoUrl: string
      status: 'completed' | 'failed'
    }> = []
    
    let totalCost = 0
    
    // Step 1: Generate start frame with GPT-Image-1
    updateJobProgress(jobId, 0, 'Generating start frame with GPT-Image-1...')
    const { imageBase64: startFrame } = await generateStartFrame(prompt, style)
    totalCost += 0.04 // GPT-Image-1 cost
    
    // Step 2: Generate each video segment with Luma AI
    for (let i = 0; i < segmentCount; i++) {
      updateJobProgress(jobId, i + 1, `Generating video segment ${i + 1}/${segmentCount}...`)
      
      try {
        // Use Nano Banana (Gemini) to describe what motion/action should happen
        const motionDescription = await predictSceneMotion(startFrame, prompt, i)
        totalCost += 0.01 // Gemini cost
        
        // Build the full video prompt
        const videoPrompt = `${prompt}. ${motionDescription}. Style: ${style}, cinematic quality, smooth motion.`
        
        // Generate video segment with Luma AI
        const videoResult = await generateVideoSegment(videoPrompt, 5)
        totalCost += 0.30 // Luma AI cost per segment
        
        if (videoResult.status !== 'completed' || !videoResult.url) {
          throw new Error(`Video generation failed: ${videoResult.status}`)
        }
        
        segments.push({
          index: i,
          startTime: i * 5,
          endTime: (i + 1) * 5,
          videoUrl: videoResult.url,
          status: 'completed',
        })
        
      } catch (error) {
        console.error(`Segment ${i + 1} failed:`, error)
        segments.push({
          index: i,
          startTime: i * 5,
          endTime: (i + 1) * 5,
          videoUrl: '',
          status: 'failed',
        })
        throw error // Fail the whole job if any segment fails
      }
    }
    
    // Track usage
    await trackUsage(sessionId, 'api', Math.round(totalCost / 0.01))
    
    // Complete job
    const totalDuration = Date.now() - segments[0]?.startTime || 0
    completeJob(jobId, segments, totalCost, totalDuration)
    
  } catch (error) {
    console.error('Video generation failed:', error)
    failJob(jobId, error instanceof Error ? error.message : 'Unknown error')
  }
}
