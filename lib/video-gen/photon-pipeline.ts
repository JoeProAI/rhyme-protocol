/**
 * Photon + Nano Banana + Ray-2 Pipeline
 * 
 * This is the CORRECT approach for visual continuity:
 * 
 * 1. Luma Photon generates the START frame (same visual style as Ray-2)
 * 2. Nano Banana (Gemini Vision) analyzes the frame and predicts motion
 * 3. Ray-2 generates video using Photon frame as keyframe.frame0
 * 4. Extract last frame from video (thumbnail)
 * 5. Use that as keyframe.frame0 for next segment
 * 6. Repeat
 * 
 * Key insight: Photon and Ray-2 are both Luma products with consistent visual style.
 * Using GPT-Image-1 introduces style inconsistency.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface VideoSegment {
  index: number
  videoUrl: string
  thumbnailUrl: string
  keyframeUrl: string
  motionDescription: string
  duration: number
}

interface PipelineResult {
  success: boolean
  segments: VideoSegment[]
  totalDuration: number
  startFrameUrl: string
  error?: string
}

/**
 * Generate an image with Luma Photon
 * This ensures visual consistency with Ray-2 videos
 */
async function generatePhotonImage(
  prompt: string,
  aspectRatio: '16:9' | '1:1' | '9:16' = '16:9'
): Promise<string> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  console.log(`  🖼️ Generating image with Photon...`)
  console.log(`     Prompt: ${prompt.substring(0, 80)}...`)

  const response = await fetch(`${LUMA_API_BASE}/generations/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'photon-1',
      aspect_ratio: aspectRatio,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Photon API error: ${error}`)
  }

  const data = await response.json()
  console.log(`     Generation started: ${data.id}`)

  // Poll for completion
  return await pollForImage(data.id, apiKey)
}

/**
 * Poll Luma API for image completion
 */
async function pollForImage(generationId: string, apiKey: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000))

    const response = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!response.ok) continue

    const data = await response.json()
    console.log(`     Status: ${data.state}`)

    if (data.state === 'completed' && data.assets?.image) {
      console.log(`  ✅ Photon image ready: ${data.assets.image}`)
      return data.assets.image
    }

    if (data.state === 'failed') {
      throw new Error(`Photon generation failed: ${data.failure_reason}`)
    }
  }

  throw new Error('Photon generation timeout')
}

/**
 * Use Nano Banana (Gemini Vision) to analyze a frame and predict motion
 * This is TEXT-ONLY output - no image generation
 */
async function predictMotionWithNanoBanana(
  imageUrl: string,
  originalPrompt: string,
  segmentIndex: number
): Promise<string> {
  console.log(`  🍌 Nano Banana analyzing frame ${segmentIndex + 1}...`)

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  // Fetch the image and convert to base64
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')

  const prompt = `
You are an expert cinematographer and video director. Analyze this image and describe what should happen in the NEXT 5 SECONDS of this video.

SCENE CONTEXT: ${originalPrompt}
CURRENT SEGMENT: ${segmentIndex + 1} (timestamp: ${segmentIndex * 5}s to ${(segmentIndex + 1) * 5}s)

ANALYZE THE IMAGE AND DESCRIBE:
1. What MOTION should occur? (camera movement, character actions, object movement)
2. What CHANGES happen? (lighting shifts, expressions, environment)
3. What's the ENERGY? (slow/contemplative vs dynamic/action)
4. Any EFFECTS? (particles, lens flare, weather)

OUTPUT FORMAT:
Write a single, detailed paragraph (2-3 sentences) describing the motion and action.
Focus on VERBS and MOVEMENT.
Be specific and cinematic.

Example output:
"The camera slowly pushes in as the character turns their head toward the light, golden particles drifting through the air. The wind picks up, rustling leaves in the foreground while the background gradually shifts from shadow to warm sunset tones."

Your motion description:`

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
      prompt,
    ])

    const motionDescription = result.response.text().trim()
    console.log(`  ✅ Motion predicted: "${motionDescription.substring(0, 100)}..."`)
    return motionDescription

  } catch (error) {
    console.error(`  ⚠️ Nano Banana failed, using fallback`)
    return 'Smooth cinematic movement with subtle environmental changes and natural progression of the scene.'
  }
}

/**
 * Generate video with Ray-2 using a keyframe
 */
async function generateVideoWithKeyframe(
  keyframeUrl: string,
  prompt: string,
  segmentIndex: number
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  console.log(`  🎬 Generating video segment ${segmentIndex + 1} with Ray-2...`)
  console.log(`     Keyframe: ${keyframeUrl.substring(0, 60)}...`)

  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'ray-2',
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '5s',
      loop: false,
      keyframes: {
        frame0: {
          type: 'image',
          url: keyframeUrl,
        }
      }
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ray-2 API error: ${error}`)
  }

  const data = await response.json()
  console.log(`     Generation started: ${data.id}`)

  return await pollForVideo(data.id, apiKey)
}

/**
 * Poll Luma API for video completion
 */
async function pollForVideo(
  generationId: string,
  apiKey: string
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000))

    const response = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!response.ok) continue

    const data = await response.json()
    console.log(`     Status: ${data.state} (${i + 1}/60)`)

    if (data.state === 'completed') {
      const videoUrl = data.assets?.video
      const thumbnailUrl = data.assets?.image

      if (!videoUrl) throw new Error('Video completed but no URL')

      console.log(`  ✅ Video ready: ${videoUrl}`)
      return { videoUrl, thumbnailUrl }
    }

    if (data.state === 'failed') {
      throw new Error(`Ray-2 generation failed: ${data.failure_reason}`)
    }
  }

  throw new Error('Video generation timeout')
}

/**
 * MAIN PIPELINE: Generate continuous video with Photon + Nano Banana + Ray-2
 * 
 * @param prompt - Scene/story description
 * @param duration - Total duration in seconds (rounded to 5s segments)
 * @param style - Visual style to append to prompts
 */
export async function generateContinuousVideoWithPhoton(
  prompt: string,
  duration: number = 30,
  style: string = 'cinematic, high quality, detailed'
): Promise<PipelineResult> {
  const segmentCount = Math.ceil(duration / 5)
  const segments: VideoSegment[] = []

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎬 PHOTON + NANO BANANA + RAY-2 PIPELINE`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Duration: ${duration}s (${segmentCount} segments)`)
  console.log(`Style: ${style}`)
  console.log(`Prompt: ${prompt}`)
  console.log(`${'='.repeat(60)}\n`)

  try {
    // STEP 1: Generate the FIRST frame with Photon
    console.log(`\n📸 STEP 1: Generate start frame with Photon`)
    const startFramePrompt = `${prompt}. Style: ${style}. A single frame from a cinematic video, detailed and vivid.`
    const startFrameUrl = await generatePhotonImage(startFramePrompt)

    // Track the current keyframe URL (starts with Photon image, then uses video thumbnails)
    let currentKeyframeUrl = startFrameUrl

    // STEP 2: Generate each segment
    for (let i = 0; i < segmentCount; i++) {
      console.log(`\n${'─'.repeat(40)}`)
      console.log(`🎬 SEGMENT ${i + 1}/${segmentCount}`)
      console.log(`${'─'.repeat(40)}`)

      try {
        // 2a: Use Nano Banana to predict motion from current keyframe
        const motionDescription = await predictMotionWithNanoBanana(
          currentKeyframeUrl,
          prompt,
          i
        )

        // 2b: Build the full video prompt
        const videoPrompt = `${prompt}. ${motionDescription}. Style: ${style}, smooth motion, cinematic quality.`

        // 2c: Generate video with Ray-2 using current keyframe
        const { videoUrl, thumbnailUrl } = await generateVideoWithKeyframe(
          currentKeyframeUrl,
          videoPrompt,
          i
        )

        // Save segment
        segments.push({
          index: i,
          videoUrl,
          thumbnailUrl,
          keyframeUrl: currentKeyframeUrl,
          motionDescription,
          duration: 5,
        })

        // 2d: CRITICAL - Use the video's thumbnail as the NEXT segment's keyframe
        // This maintains visual continuity!
        currentKeyframeUrl = thumbnailUrl

        console.log(`  ✅ Segment ${i + 1} complete`)

      } catch (error) {
        console.error(`  ❌ Segment ${i + 1} failed:`, error)
        // Continue with remaining segments
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ PIPELINE COMPLETE`)
    console.log(`   Successful segments: ${segments.length}/${segmentCount}`)
    console.log(`   Total duration: ${segments.length * 5}s`)
    console.log(`${'='.repeat(60)}\n`)

    return {
      success: segments.length > 0,
      segments,
      totalDuration: segments.length * 5,
      startFrameUrl,
    }

  } catch (error) {
    console.error('Pipeline failed:', error)
    return {
      success: false,
      segments: [],
      totalDuration: 0,
      startFrameUrl: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Estimate generation time
 */
export function estimateGenerationTime(duration: number): number {
  const segmentCount = Math.ceil(duration / 5)
  // Photon: ~15s, Nano Banana: ~5s, Ray-2: ~45s per segment
  const photonTime = 15
  const perSegmentTime = 5 + 45 // Nano Banana + Ray-2
  return photonTime + (segmentCount * perSegmentTime)
}

/**
 * Estimate cost
 */
export function estimateCost(duration: number): number {
  const segmentCount = Math.ceil(duration / 5)
  const photonCost = 0.02 // Photon image
  const nanoBananaCost = segmentCount * 0.01 // Gemini per segment
  const ray2Cost = segmentCount * 0.30 // Ray-2 per segment
  return photonCost + nanoBananaCost + ray2Cost
}
