/**
 * Unified Video Pipeline v3
 * 
 * Combines three technologies for consistent long-form video generation:
 * 1. GPT-Image-1.5 - High fidelity image generation with visual consistency
 * 2. Nano Banana (Gemini Vision) - Intelligent future state prediction
 * 3. Luma Ray-2 - Video generation with dual keyframe interpolation
 * 
 * KEY IMPROVEMENT in v3: Extract ACTUAL last frame from rendered video
 * This ensures true visual continuity between segments, since Luma doesn't
 * always land exactly on the target end keyframe.
 * 
 * Pipeline Flow:
 * 1. GPT-Image-1.5 generates initial START frame
 * 2. Nano Banana analyzes start frame → predicts scene 9s later
 * 3. GPT-Image-1.5 generates END frame WITH start frame as reference
 * 4. Upload both frames to get public URLs for Luma
 * 5. Luma Ray-2 generates video interpolating between START and END
 * 6. **NEW: Extract ACTUAL last frame from rendered video**
 * 7. Use that actual frame as next segment's START (not the target keyframe)
 * 8. Repeat for desired duration
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const execAsync = promisify(exec)
const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1'

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

type LumaDuration = '5s' | '9s'

interface VideoSegment {
  index: number
  startFrameUrl: string
  endFrameUrl: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  nanoBananaPrediction: string
}

interface UnifiedPipelineResult {
  success: boolean
  segments: VideoSegment[]
  totalDuration: number
  error?: string
}

// ============================================================================
// GPT-IMAGE-1.5 FUNCTIONS
// ============================================================================

/**
 * Generate initial frame with GPT-Image-1.5
 */
async function generateInitialFrame(prompt: string, style: string): Promise<string> {
  console.log(`  🎨 GPT-Image-1.5: Generating initial frame...`)
  
  const fullPrompt = `${prompt}

Style: ${style}
Requirements:
- Cinematic composition with clear focal point
- Rich, vibrant colors with professional lighting
- Characters should be clearly visible and well-defined
- Environment should have depth and atmosphere`

  const response = await getOpenAI().images.generate({
    model: 'gpt-image-1.5',
    prompt: fullPrompt,
    n: 1,
    size: '1536x1024', // 16:9 aspect ratio
  })

  if (!response.data?.[0]?.b64_json) {
    throw new Error('No image data returned from GPT-Image-1.5')
  }

  console.log(`  ✅ Initial frame generated`)
  return response.data[0].b64_json
}

/**
 * Generate end frame with GPT-Image-1.5 using start frame as reference
 * THIS IS THE KEY - GPT-Image-1.5 can see the input image and maintain consistency
 * Uses the Responses API with image input for visual consistency
 */
async function generateEndFrameWithReference(
  startFrameBase64: string,
  nanoBananaPrediction: string,
  originalPrompt: string,
  style: string,
  segmentIndex: number
): Promise<string> {
  console.log(`  🎨 GPT-Image-1.5: Generating end frame with visual reference...`)
  
  const editPrompt = `Transform this image to show the scene ${segmentIndex * 9 + 9} seconds later:

${nanoBananaPrediction}

CRITICAL REQUIREMENTS:
- Maintain EXACT same characters (same appearance, colors, proportions)
- Maintain EXACT same art style and rendering quality
- Maintain same environment and lighting atmosphere
- Show natural progression - what realistically changes in 9 seconds
- Keep same camera angle and framing
- Preserve all visual details from the original

Original context: ${originalPrompt}
Style: ${style}`

  try {
    // Use the Responses API with image input for visual consistency
    const response: any = await (openai as any).responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: editPrompt,
            },
            {
              type: 'input_image',
              image_url: `data:image/png;base64,${startFrameBase64}`,
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
      throw new Error('No image generated from Responses API')
    }

    console.log(`  ✅ End frame generated with visual consistency (Responses API)`)
    return imageGenerationCalls[0].result
  } catch (error: any) {
    // Fallback to GPT-Image-1.5 generation with detailed description
    console.log(`  ⚠️ Responses API failed (${error.message}), trying GPT-Image-1.5 generation...`)
    
    const fallbackPrompt = `${nanoBananaPrediction}

This is frame ${segmentIndex + 1} of a continuous video sequence.
Original scene: ${originalPrompt}
Style: ${style}

CRITICAL: Maintain perfect visual consistency:
- Same characters with identical appearance
- Same art style and color palette
- Same environment and atmosphere
- Natural 9-second progression from previous state`

    const response = await getOpenAI().images.generate({
      model: 'gpt-image-1.5',
      prompt: fallbackPrompt,
      n: 1,
      size: '1536x1024',
    })

    if (!response.data?.[0]?.b64_json) {
      throw new Error('No image data returned from GPT-Image-1.5')
    }

    return response.data[0].b64_json
  }
}

// ============================================================================
// NANO BANANA (GEMINI VISION) FUNCTIONS
// ============================================================================

/**
 * Nano Banana: Analyze current frame and predict future state
 * Uses Gemini Vision to understand the scene and predict what happens next
 */
async function nanoBananaPredictFuture(
  currentFrameBase64: string,
  originalPrompt: string,
  segmentIndex: number,
  segmentSeconds: number = 9
): Promise<string> {
  console.log(`  🍌 Nano Banana: Analyzing frame and predicting ${segmentSeconds}s future...`)
  
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const analysisPrompt = `You are an expert cinematographer and animator analyzing a video frame.

SCENE CONTEXT: ${originalPrompt}
CURRENT TIME: ${segmentIndex * segmentSeconds} seconds into the video
TARGET TIME: ${(segmentIndex + 1) * segmentSeconds} seconds (${segmentSeconds} seconds later)

TASK: Describe EXACTLY what this scene looks like ${segmentSeconds} seconds later.

CRITICAL RULES FOR CONSISTENCY:
1. SAME CHARACTERS - Describe them with EXACT same appearance, clothing, colors, features
2. SAME ART STYLE - Identical rendering quality, color palette, lighting style
3. SAME ENVIRONMENT - Same location, same objects, same atmosphere
4. NATURAL PROGRESSION - What realistically changes in ${segmentSeconds} seconds?
5. SAME CAMERA - Maintain framing and perspective

Describe the END STATE in extreme detail:
- Exact character positions and poses
- Facial expressions and body language
- Lighting changes (subtle shifts)
- Environmental changes (wind, particles, etc.)
- Any movement that occurred

Be EXTREMELY specific so an AI image generator can recreate it with perfect consistency.
Output only the scene description, no preamble.`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/png',
        data: currentFrameBase64,
      },
    },
    analysisPrompt,
  ])
  
  const prediction = result.response.text()
  console.log(`  ✅ Future predicted: "${prediction.substring(0, 80)}..."`)
  
  return prediction
}

// ============================================================================
// IMAGE UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload base64 image to get a public URL for Luma
 * Uses multiple fallback strategies
 */
async function uploadImageForLuma(base64Image: string): Promise<string> {
  const base64Data = base64Image.includes(',') 
    ? base64Image.split(',')[1] 
    : base64Image

  console.log(`  📤 Uploading image for Luma access...`)

  // Strategy 1: freeimage.host
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
        console.log(`  ✅ Uploaded to freeimage.host`)
        return data.image.url
      }
    }
  } catch (e) {
    console.log(`  ⚠️ freeimage.host failed`)
  }

  // Strategy 2: imgbb
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
        console.log(`  ✅ Uploaded to imgbb`)
        return data.data.url
      }
    }
  } catch (e) {
    console.log(`  ⚠️ imgbb failed`)
  }

  throw new Error('Failed to upload image to any hosting service')
}

// ============================================================================
// VIDEO FRAME EXTRACTION
// ============================================================================

/**
 * Extract the last frame from a video URL and return as base64
 * This is KEY for true continuity - we use what Luma actually rendered
 */
async function extractLastFrameFromVideo(videoUrl: string): Promise<string> {
  console.log(`  🎞️ Extracting actual last frame from rendered video...`)
  
  const tempDir = os.tmpdir()
  const videoPath = path.join(tempDir, `luma_video_${Date.now()}.mp4`)
  const framePath = path.join(tempDir, `last_frame_${Date.now()}.png`)
  
  try {
    // Download the video
    const response = await fetch(videoUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(videoPath, buffer)
    
    // Extract last frame using ffmpeg
    // -sseof -0.1 seeks to 0.1 seconds before end of file
    await execAsync(
      `ffmpeg -sseof -0.1 -i "${videoPath}" -update 1 -q:v 2 "${framePath}" -y`,
      { timeout: 30000 }
    )
    
    // Read frame as base64
    const frameBuffer = fs.readFileSync(framePath)
    const base64 = frameBuffer.toString('base64')
    
    // Cleanup
    fs.unlinkSync(videoPath)
    fs.unlinkSync(framePath)
    
    console.log(`  ✅ Last frame extracted successfully`)
    return base64
  } catch (error) {
    // Cleanup on error
    try { fs.unlinkSync(videoPath) } catch {}
    try { fs.unlinkSync(framePath) } catch {}
    throw new Error(`Failed to extract last frame: ${error}`)
  }
}

// ============================================================================
// LUMA RAY-2 FUNCTIONS
// ============================================================================

/**
 * Generate video with Luma Ray-2 using dual keyframes
 */
async function generateVideoWithLuma(
  startFrameUrl: string,
  endFrameUrl: string,
  prompt: string,
  duration: LumaDuration = '9s'
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  console.log(`  🎬 Luma Ray-2: Generating ${duration} video with dual keyframes...`)
  console.log(`     frame0: ${startFrameUrl.substring(0, 50)}...`)
  console.log(`     frame1: ${endFrameUrl.substring(0, 50)}...`)

  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'ray-2',
      duration,
      resolution: '720p',
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
    const errorText = await response.text()
    throw new Error(`Luma Ray-2 error: ${errorText}`)
  }

  const data = await response.json()
  console.log(`     Generation started: ${data.id}`)

  return await pollForVideo(data.id, apiKey)
}

/**
 * Poll for Luma video completion
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
    
    if (data.state === 'completed' && data.assets?.video) {
      console.log(`  ✅ Video ready`)
      return {
        videoUrl: data.assets.video,
        thumbnailUrl: data.assets.thumbnail || '',
      }
    }
    if (data.state === 'failed') {
      throw new Error(`Video generation failed: ${data.failure_reason}`)
    }
  }
  throw new Error('Video generation timeout')
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

/**
 * Generate a long-form video with visual consistency
 */
export async function generateUnifiedVideo(
  prompt: string,
  targetDuration: number,
  style: string = 'cinematic, high quality',
  segmentDuration: LumaDuration = '9s'
): Promise<UnifiedPipelineResult> {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  
  console.log(`
════════════════════════════════════════════════════════════
🎬 UNIFIED VIDEO PIPELINE v3
════════════════════════════════════════════════════════════
Technologies: GPT-Image-1.5 + Nano Banana + Luma Ray-2
Target: ${targetDuration}s → ${numSegments} x ${segmentSeconds}s segments
Style: ${style}
Prompt: ${prompt}
════════════════════════════════════════════════════════════
`)

  const segments: VideoSegment[] = []
  let currentFrameBase64: string

  try {
    // Step 1: Generate initial frame with GPT-Image-1.5
    console.log(`\n📸 STEP 1: Generate initial frame with GPT-Image-1.5`)
    currentFrameBase64 = await generateInitialFrame(prompt, style)

    // Step 2: Generate each segment
    for (let i = 0; i < numSegments; i++) {
      console.log(`\n${'─'.repeat(50)}`)
      console.log(`🎬 SEGMENT ${i + 1}/${numSegments}`)
      console.log(`${'─'.repeat(50)}`)

      try {
        // 2a: Nano Banana predicts future state
        const prediction = await nanoBananaPredictFuture(
          currentFrameBase64,
          prompt,
          i,
          segmentSeconds
        )

        // 2b: GPT-Image-1.5 generates end frame WITH start frame reference
        const endFrameBase64 = await generateEndFrameWithReference(
          currentFrameBase64,
          prediction,
          prompt,
          style,
          i
        )

        // 2c: Upload both frames for Luma
        const startFrameUrl = await uploadImageForLuma(currentFrameBase64)
        const endFrameUrl = await uploadImageForLuma(endFrameBase64)

        // 2d: Generate video with Luma Ray-2
        const motionPrompt = `${prompt}. Smooth, natural movement transitioning from start to end keyframe.`
        const videoResult = await generateVideoWithLuma(
          startFrameUrl,
          endFrameUrl,
          motionPrompt,
          segmentDuration
        )

        segments.push({
          index: i,
          startFrameUrl,
          endFrameUrl,
          videoUrl: videoResult.videoUrl,
          thumbnailUrl: videoResult.thumbnailUrl,
          duration: segmentSeconds,
          nanoBananaPrediction: prediction,
        })

        console.log(`  ✅ Segment ${i + 1} complete`)

        // 2e: KEY IMPROVEMENT - Extract ACTUAL last frame from rendered video
        // This ensures true visual continuity (not the target keyframe, but what Luma actually rendered)
        if (i < numSegments - 1) {
          try {
            currentFrameBase64 = await extractLastFrameFromVideo(videoResult.videoUrl)
            console.log(`  🔗 Using actual rendered frame for next segment`)
          } catch (extractError) {
            console.log(`  ⚠️ Frame extraction failed, falling back to target end frame`)
            currentFrameBase64 = endFrameBase64
          }
        }

      } catch (error) {
        console.error(`  ❌ Segment ${i + 1} failed:`, error)
        // Continue with remaining segments
      }
    }

    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)

    console.log(`
════════════════════════════════════════════════════════════
✅ UNIFIED PIPELINE COMPLETE
   Segments: ${segments.length}/${numSegments}
   Duration: ${totalDuration}s
════════════════════════════════════════════════════════════
`)

    return {
      success: segments.length > 0,
      segments,
      totalDuration,
    }

  } catch (error) {
    console.error('Pipeline failed:', error)
    return {
      success: false,
      segments,
      totalDuration: segments.reduce((sum, s) => sum + s.duration, 0),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Estimate generation time
 */
export function estimateTime(targetDuration: number, segmentDuration: LumaDuration = '9s'): string {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  // GPT-Image-1.5: ~15s per image, Nano Banana: ~5s, Luma: ~2-3min per segment
  const minutes = Math.ceil(numSegments * 3.5)
  return `${minutes} minutes`
}

/**
 * Estimate cost
 */
export function estimateCost(targetDuration: number, segmentDuration: LumaDuration = '9s'): string {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  // GPT-Image-1.5: ~$0.08 per image (2 per segment), Luma: ~$0.25 per 9s
  const cost = numSegments * (0.08 * 2 + 0.25)
  return `$${cost.toFixed(2)}`
}
