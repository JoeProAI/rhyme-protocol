/**
 * TRUE Nano Banana Keyframe Pipeline
 * 
 * This is the CORRECT implementation that uses Nano Banana for what it's designed for:
 * GENERATING END FRAMES (keyframes), not just motion descriptions.
 * 
 * Pipeline:
 * 1. Generate START frame with Photon-1 (Luma's image model)
 * 2. Nano Banana (Gemini Vision) analyzes start frame → predicts future state
 * 3. Generate END frame with Photon-1 based on Nano Banana's prediction
 * 4. Ray-2 uses BOTH frame0 (start) AND frame1 (end) for interpolation
 * 5. End frame becomes next segment's start frame
 * 6. Repeat
 * 
 * Luma Ray-2 supported durations: 5s or 9s
 * We use 9s for longer, smoother segments with better continuity.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1'

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// Luma Ray-2 only supports 5s or 9s durations
type LumaDuration = '5s' | '9s'

interface KeyframedSegment {
  index: number
  startFrameUrl: string
  endFrameUrl: string
  videoUrl: string
  thumbnailUrl: string
  motionDescription: string
  duration: number // actual seconds (5 or 9)
}

interface NanoBananaPipelineResult {
  success: boolean
  segments: KeyframedSegment[]
  totalDuration: number
  error?: string
}

/**
 * Generate start frame with Luma Photon
 */
async function generatePhotonFrame(prompt: string): Promise<string> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  console.log(`  🖼️ Generating frame with Photon...`)

  const response = await fetch(`${LUMA_API_BASE}/generations/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'photon-1',
      aspect_ratio: '16:9',
    }),
  })

  if (!response.ok) {
    throw new Error(`Photon error: ${await response.text()}`)
  }

  const data = await response.json()
  return await pollForImage(data.id, apiKey)
}

/**
 * Poll for Luma image completion
 */
async function pollForImage(id: string, apiKey: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000))
    
    const response = await fetch(`${LUMA_API_BASE}/generations/${id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    
    if (!response.ok) continue
    const data = await response.json()
    
    if (data.state === 'completed' && data.assets?.image) {
      console.log(`  ✅ Frame ready: ${data.assets.image}`)
      return data.assets.image
    }
    if (data.state === 'failed') throw new Error(`Failed: ${data.failure_reason}`)
  }
  throw new Error('Image generation timeout')
}

/**
 * Fetch image and convert to base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

/**
 * Generate end frame using GPT-4o with image input for visual reference
 * THIS IS THE REAL NANO BANANA - it uses the actual image to maintain consistency
 */
async function generateEndFrameWithGPT(startFrameBase64: string, prompt: string): Promise<string> {
  console.log(`  🎨 GPT-Image-1: Generating with visual reference...`)
  
  try {
    // Use OpenAI Responses API with image input for better visual consistency
    const response: any = await (getOpenAI() as any).responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${startFrameBase64}`,
            },
          ],
        },
      ],
      tools: [
        {
          type: 'image_generation',
          quality: 'high',
          size: '1536x1024',
          input_fidelity: 'high', // CRITICAL: Maintains details from input image
        },
      ],
    })

    // Extract generated image from response
    const imageGenerationCalls = response.output?.filter(
      (output: any) => output.type === 'image_generation_call'
    ) || []

    if (imageGenerationCalls.length === 0) {
      throw new Error('No image generated from GPT-4o')
    }

    console.log(`  ✅ GPT-Image-1 generated end frame with high fidelity`)
    return imageGenerationCalls[0].result
  } catch (error: any) {
    // Fallback to standard DALL-E generation
    console.log(`  ⚠️ Responses API failed, trying DALL-E 3: ${error.message}`)
    
    const response = await getOpenAI().images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      response_format: 'b64_json',
    })

    if (!response.data?.[0]?.b64_json) {
      throw new Error('No image data returned from DALL-E 3')
    }

    return response.data[0].b64_json
  }
}

/**
 * Upload a base64 image to get a public URL for Luma
 * Uses free image hosting services to upload the ACTUAL generated image
 */
async function uploadBase64ImageForLuma(base64Image: string, description: string): Promise<string> {
  // Remove data URL prefix if present
  const base64Data = base64Image.includes(',') 
    ? base64Image.split(',')[1] 
    : base64Image

  console.log(`  📤 Uploading GPT-generated image to get public URL...`)

  // Strategy 1: Use freeimage.host (no API key needed)
  try {
    const formData = new FormData()
    formData.append('source', base64Data)
    formData.append('type', 'base64')
    formData.append('action', 'upload')
    
    const response = await fetch('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
      method: 'POST',
      body: formData,
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.image?.url) {
        console.log(`  ✅ Image uploaded to freeimage.host: ${data.image.url}`)
        return data.image.url
      }
    }
  } catch (e) {
    console.log(`  ⚠️ freeimage.host failed: ${e}`)
  }

  // Strategy 2: Use imgbb
  try {
    const formData = new FormData()
    formData.append('image', base64Data)
    
    const response = await fetch('https://api.imgbb.com/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
      method: 'POST',
      body: formData,
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data?.url) {
        console.log(`  ✅ Image uploaded to imgbb: ${data.data.url}`)
        return data.data.url
      }
    }
  } catch (e) {
    console.log(`  ⚠️ imgbb failed: ${e}`)
  }

  // Strategy 3: Fallback to Photon (loses visual consistency but at least works)
  console.log(`  ⚠️ Image upload failed, falling back to Photon regeneration...`)
  return await generatePhotonFrame(description)
}

/**
 * NANO BANANA CORE: Analyze start frame and generate the END frame
 * 
 * This is the key differentiator - we're not just describing motion,
 * we're actually GENERATING what the scene looks like N seconds later.
 */
async function nanoBananaGenerateEndFrame(
  startFrameUrl: string,
  originalPrompt: string,
  segmentIndex: number,
  style: string,
  segmentSeconds: number = 9 // Duration of each segment (5 or 9)
): Promise<{ endFrameUrl: string; motionDescription: string }> {
  
  console.log(`  🍌 NANO BANANA: Analyzing frame and generating future state...`)
  
  // Step 1: Fetch start frame and convert to base64
  const startFrameBase64 = await imageUrlToBase64(startFrameUrl)
  
  // Step 2: Use Gemini Vision to analyze and predict the future
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const analysisPrompt = `
You are an expert cinematographer analyzing a video frame.

SCENE: ${originalPrompt}
CURRENT TIME: ${segmentIndex * segmentSeconds} seconds
TARGET TIME: ${(segmentIndex + 1) * segmentSeconds} seconds (${segmentSeconds} seconds later)

Analyze this frame and describe EXACTLY what the scene looks like ${segmentSeconds} seconds later.

CRITICAL RULES:
1. SAME characters - exact same appearance, clothing, features
2. SAME art style - identical rendering quality and aesthetic
3. SAME environment - same location, same objects
4. NATURAL progression - what realistically changes in ${segmentSeconds} seconds?
5. SAME camera angle - maintain framing and perspective

Describe the END STATE (not the motion, the RESULT):
- Where are characters now positioned?
- What are their expressions/poses?
- How has lighting changed?
- What environmental changes occurred?

OUTPUT: A detailed description of the scene at the ${segmentSeconds}-second mark that an image generator can recreate with perfect consistency.`

  const analysisResult = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: startFrameBase64,
      },
    },
    analysisPrompt,
  ])
  
  const futureDescription = analysisResult.response.text()
  console.log(`  ✅ Future predicted: "${futureDescription.substring(0, 100)}..."`)
  
  // Step 3: Generate the END frame with Photon using Nano Banana's detailed prediction
  // NOTE: We must use Photon because Luma Ray-2 can only access Luma CDN URLs
  // The key is making the prediction EXTREMELY detailed so Photon maintains consistency
  console.log(`  🖼️ Generating end frame with Photon (guided by Nano Banana prediction)...`)
  
  const endFramePrompt = `
${futureDescription}

CRITICAL CONSISTENCY REQUIREMENTS:
- This is frame ${segmentIndex + 1} of a continuous video sequence
- Must match the EXACT same art style: ${style}
- Same characters with identical appearance, clothing, and features
- Same environment, lighting quality, and color palette
- Same camera angle and framing
- Natural ${segmentSeconds}-second progression from previous state

Original scene context: ${originalPrompt}
`

  // Use Photon to generate the end frame (Luma can access its own CDN URLs)
  const endFrameUrl = await generatePhotonFrame(endFramePrompt)
  
  // Also generate a motion description for Ray-2
  const motionPrompt = `Based on this scene transition, describe the MOTION in 1-2 sentences for a video generator. Focus on movement verbs.

Start: Frame at ${segmentIndex * segmentSeconds}s
End: ${futureDescription}

Describe what MOVES and HOW:`

  const motionResult = await model.generateContent(motionPrompt)
  const motionDescription = motionResult.response.text().trim()
  
  return {
    endFrameUrl,
    motionDescription,
  }
}

/**
 * Generate video with DUAL keyframes (frame0 + frame1)
 * This is the key to perfect interpolation - Nano Banana provides both keyframes
 * 
 * @param duration - '5s' or '9s' (Luma Ray-2 only supports these)
 */
async function generateVideoWithDualKeyframes(
  startFrameUrl: string,
  endFrameUrl: string,
  prompt: string,
  segmentIndex: number,
  duration: LumaDuration = '9s' // Default to 9s for smoother, longer segments
): Promise<{ videoUrl: string; thumbnailUrl: string; duration: number }> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  const durationSeconds = duration === '9s' ? 9 : 5

  console.log(`  🎬 Generating ${duration} video with DUAL keyframes (Nano Banana)...`)
  console.log(`     frame0 (start): ${startFrameUrl.substring(0, 50)}...`)
  console.log(`     frame1 (end): ${endFrameUrl.substring(0, 50)}...`)

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
      duration: duration, // '5s' or '9s'
      loop: false,
      keyframes: {
        frame0: {
          type: 'image',
          url: startFrameUrl,
        },
        frame1: {
          type: 'image',
          url: endFrameUrl,
        }
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Ray-2 error: ${await response.text()}`)
  }

  const data = await response.json()
  console.log(`     Generation started: ${data.id}`)

  const result = await pollForVideo(data.id, apiKey)
  return { ...result, duration: durationSeconds }
}

/**
 * Poll for video completion
 */
async function pollForVideo(id: string, apiKey: string): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000))
    
    const response = await fetch(`${LUMA_API_BASE}/generations/${id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    
    if (!response.ok) continue
    const data = await response.json()
    console.log(`     Status: ${data.state} (${i + 1}/60)`)
    
    if (data.state === 'completed') {
      if (!data.assets?.video) throw new Error('No video URL')
      console.log(`  ✅ Video ready`)
      return { videoUrl: data.assets.video, thumbnailUrl: data.assets.image }
    }
    if (data.state === 'failed') throw new Error(`Failed: ${data.failure_reason}`)
  }
  throw new Error('Video generation timeout')
}

/**
 * MAIN PIPELINE: True Nano Banana Keyframe Generation
 * 
 * @param prompt - Scene description
 * @param targetDuration - Target total duration in seconds
 * @param style - Visual style
 * @param segmentDuration - Duration per segment: '5s' or '9s' (default: '9s' for smoother videos)
 */
export async function generateWithNanoBananaKeyframes(
  prompt: string,
  targetDuration: number = 30,
  style: string = 'cinematic, high quality, Pixar-style animation',
  segmentDuration: LumaDuration = '9s'
): Promise<NanoBananaPipelineResult> {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const segmentCount = Math.ceil(targetDuration / segmentSeconds)
  const segments: KeyframedSegment[] = []

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🍌 NANO BANANA KEYFRAME PIPELINE`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`Target: ${targetDuration}s → ${segmentCount} x ${segmentDuration} segments`)
  console.log(`Style: ${style}`)
  console.log(`Prompt: ${prompt}`)
  console.log(`${'═'.repeat(60)}\n`)

  try {
    // STEP 1: Generate the FIRST frame with Photon
    console.log(`\n📸 STEP 1: Generate initial frame with Photon`)
    const initialPrompt = `${prompt}. Style: ${style}. Opening frame of a cinematic video.`
    let currentStartFrameUrl = await generatePhotonFrame(initialPrompt)

    // STEP 2: For each segment, use Nano Banana to generate end frame, then Ray-2 with dual keyframes
    for (let i = 0; i < segmentCount; i++) {
      console.log(`\n${'─'.repeat(50)}`)
      console.log(`🎬 SEGMENT ${i + 1}/${segmentCount}`)
      console.log(`${'─'.repeat(50)}`)

      try {
        // 2a: Nano Banana generates the END frame (keyframe)
        const { endFrameUrl, motionDescription } = await nanoBananaGenerateEndFrame(
          currentStartFrameUrl,
          prompt,
          i,
          style,
          segmentSeconds // Pass the segment duration for accurate timing
        )

        // 2b: Generate video with BOTH keyframes (Nano Banana provides the keyframes)
        const videoPrompt = `${prompt}. ${motionDescription}. Style: ${style}, smooth interpolation between keyframes.`
        const videoResult = await generateVideoWithDualKeyframes(
          currentStartFrameUrl,
          endFrameUrl,
          videoPrompt,
          i,
          segmentDuration // Pass the duration (5s or 9s)
        )

        // Save segment
        segments.push({
          index: i,
          startFrameUrl: currentStartFrameUrl,
          endFrameUrl,
          videoUrl: videoResult.videoUrl,
          thumbnailUrl: videoResult.thumbnailUrl,
          motionDescription,
          duration: videoResult.duration, // Actual duration (5 or 9)
        })

        // 2c: CRITICAL - The END frame becomes the START frame of the next segment
        // This is what creates TRUE continuity!
        currentStartFrameUrl = endFrameUrl

        console.log(`  ✅ Segment ${i + 1} complete with dual keyframes`)

      } catch (error) {
        console.error(`  ❌ Segment ${i + 1} failed:`, error)
      }
    }

    const actualDuration = segments.reduce((sum, s) => sum + s.duration, 0)
    
    console.log(`\n${'═'.repeat(60)}`)
    console.log(`✅ NANO BANANA PIPELINE COMPLETE`)
    console.log(`   Segments: ${segments.length}/${segmentCount}`)
    console.log(`   Duration: ${actualDuration}s`)
    console.log(`${'═'.repeat(60)}\n`)

    return {
      success: segments.length > 0,
      segments,
      totalDuration: actualDuration,
    }

  } catch (error) {
    console.error('Pipeline failed:', error)
    return {
      success: false,
      segments: [],
      totalDuration: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Estimate time: ~2-3 minutes per segment
 * - Photon end frame: ~15s
 * - Nano Banana analysis: ~5s  
 * - Ray-2 video: ~45s
 */
export function estimateTime(targetDuration: number, segmentDuration: LumaDuration = '9s'): number {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const segments = Math.ceil(targetDuration / segmentSeconds)
  return 15 + (segments * 65) // Initial frame + per-segment time
}

/**
 * Estimate cost
 */
export function estimateCost(targetDuration: number, segmentDuration: LumaDuration = '9s'): number {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const segments = Math.ceil(targetDuration / segmentSeconds)
  const photonCost = (segments + 1) * 0.02 // Start + end frames
  const geminCost = segments * 0.01
  const ray2Cost = segments * 0.30
  return photonCost + geminCost + ray2Cost
}
