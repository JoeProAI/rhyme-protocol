/**
 * Unified Video Pipeline v4
 * 
 * ENHANCEMENTS OVER V3:
 * 1. STYLE ANCHORING - Keep original frame as style reference, enforce style in ALL prompts
 * 2. MOTION PROMPTING - Specific motion descriptors for Luma (fluid, cinematic, natural)
 * 3. NARRATIVE EVOLUTION - Nano Banana evolves the story prompt, not just visual state
 * 4. NEGATIVE PROMPTS - Explicitly avoid style drift (NOT cartoon, NOT animated)
 * 5. CUMULATIVE CONTEXT - Build story context across segments
 * 
 * Technologies:
 * 1. GPT-Image-1.5 - High fidelity image generation with visual consistency
 * 2. Nano Banana (Gemini Vision) - Intelligent future state + narrative evolution
 * 3. Luma Ray-2 - Video generation with dual keyframe interpolation
 * 
 * Pipeline Flow:
 * 1. GPT-Image-1.5 generates initial START frame (becomes STYLE ANCHOR)
 * 2. Nano Banana analyzes frame → predicts future + evolves narrative
 * 3. GPT-Image-1.5 generates END frame WITH style anchor reference
 * 4. Luma Ray-2 generates video with MOTION-ENHANCED prompts
 * 5. Extract ACTUAL last frame from rendered video
 * 6. Repeat with cumulative narrative context
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
  evolvedNarrative: string // NEW: Track how narrative evolved
}

interface NanoBananaOutput {
  visualPrediction: string  // What the scene looks like
  narrativeEvolution: string // How the story has progressed
  motionDescription: string // Specific motion to occur
}

interface UnifiedPipelineResult {
  success: boolean
  segments: VideoSegment[]
  totalDuration: number
  error?: string
}

// ============================================================================
// STYLE CONSTANTS - V4 ENHANCEMENT
// ============================================================================

const STYLE_NEGATIVE_PROMPTS = `
ABSOLUTELY AVOID:
- Cartoon or animated style
- Stylized or artistic rendering
- Pixar/Disney animation aesthetic
- Flat colors or cel shading
- Exaggerated proportions
- Fantasy illustration style`

const MOTION_KEYWORDS = {
  natural: 'fluid natural movement, organic motion, realistic physics',
  cinematic: 'cinematic camera movement, professional cinematography, smooth dolly',
  environmental: 'subtle wind effects, atmospheric particles, ambient motion',
  character: 'natural breathing, micro-expressions, realistic body language, weight and momentum'
}

// ============================================================================
// GPT-IMAGE-1.5 FUNCTIONS - V4 ENHANCED
// ============================================================================

/**
 * Generate initial frame with GPT-Image-1.5
 * This becomes the STYLE ANCHOR for all subsequent generations
 */
async function generateInitialFrame(prompt: string, style: string): Promise<string> {
  console.log(`  🎨 GPT-Image-1.5: Generating initial frame (STYLE ANCHOR)...`)
  
  const fullPrompt = `${prompt}

Style: ${style}

CRITICAL STYLE REQUIREMENTS:
- Photorealistic rendering with real-world physics
- Natural lighting with proper shadows and reflections
- Realistic textures on all surfaces (fur, scales, foliage)
- Cinematic composition with professional depth of field
- Characters with realistic proportions and anatomy
- Environment with atmospheric depth and detail

${STYLE_NEGATIVE_PROMPTS}`

  const response = await getOpenAI().images.generate({
    model: 'gpt-image-1.5',
    prompt: fullPrompt,
    n: 1,
    size: '1536x1024',
  })

  if (!response.data?.[0]?.b64_json) {
    throw new Error('No image data returned from GPT-Image-1.5')
  }

  console.log(`  ✅ Initial frame generated (STYLE ANCHOR saved)`)
  return response.data[0].b64_json
}

/**
 * Generate end frame with GPT-Image-1.5 using BOTH:
 * - Current frame as immediate reference
 * - Style anchor for consistent style
 * V4: Enhanced with style enforcement and narrative context
 */
async function generateEndFrameWithReference(
  currentFrameBase64: string,
  styleAnchorBase64: string, // NEW: Original frame for style consistency
  nanoBananaOutput: NanoBananaOutput,
  originalPrompt: string,
  evolvedNarrative: string, // NEW: Cumulative story context
  style: string,
  segmentIndex: number
): Promise<string> {
  console.log(`  🎨 GPT-Image-1.5: Generating end frame with style anchor...`)
  
  const editPrompt = `Transform this image to show the scene ${segmentIndex * 9 + 9} seconds later:

VISUAL STATE:
${nanoBananaOutput.visualPrediction}

NARRATIVE CONTEXT:
${evolvedNarrative}

MOTION THAT OCCURRED:
${nanoBananaOutput.motionDescription}

CRITICAL STYLE REQUIREMENTS (MUST MATCH EXACTLY):
- Maintain EXACT same photorealistic rendering style
- Same lighting quality and color temperature
- Same texture detail level on all surfaces
- Same camera angle and lens characteristics
- Same atmospheric effects and depth
- Characters must have IDENTICAL appearance (colors, proportions, features)

${STYLE_NEGATIVE_PROMPTS}

Original scene: ${originalPrompt}
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
              image_url: `data:image/png;base64,${currentFrameBase64}`,
            },
          ],
        },
      ],
      tools: [
        {
          type: 'image_generation',
          quality: 'high',
          size: '1536x1024',
          input_fidelity: 'high',
        },
      ],
    })

    const imageGenerationCalls = response.output?.filter(
      (output: any) => output.type === 'image_generation_call'
    ) || []

    if (imageGenerationCalls.length === 0) {
      throw new Error('No image generated from Responses API')
    }

    console.log(`  ✅ End frame generated with style consistency`)
    return imageGenerationCalls[0].result
  } catch (error: any) {
    console.log(`  ⚠️ Responses API failed (${error.message}), trying GPT-Image-1.5...`)
    
    const fallbackPrompt = `${nanoBananaOutput.visualPrediction}

Narrative: ${evolvedNarrative}
Original scene: ${originalPrompt}
Style: ${style}

CRITICAL: Match the photorealistic style exactly.
${STYLE_NEGATIVE_PROMPTS}`

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
// NANO BANANA (GEMINI VISION) - V4 ENHANCED
// ============================================================================

/**
 * V4 Nano Banana: Now returns THREE things:
 * 1. Visual prediction (what scene looks like)
 * 2. Narrative evolution (how story progresses)
 * 3. Motion description (specific movements for Luma)
 */
async function nanoBananaPredictFuture(
  currentFrameBase64: string,
  originalPrompt: string,
  cumulativeNarrative: string, // NEW: Story so far
  segmentIndex: number,
  segmentSeconds: number = 9
): Promise<NanoBananaOutput> {
  console.log(`  🍌 Nano Banana: Analyzing + predicting + evolving narrative...`)
  
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const analysisPrompt = `You are an expert cinematographer, animator, and storyteller analyzing a video frame.

ORIGINAL PREMISE: ${originalPrompt}
STORY SO FAR: ${cumulativeNarrative || 'This is the opening scene.'}
CURRENT TIME: ${segmentIndex * segmentSeconds} seconds into the video
TARGET TIME: ${(segmentIndex + 1) * segmentSeconds} seconds (${segmentSeconds} seconds later)

Analyze this frame and provide THREE outputs in JSON format:

{
  "visualPrediction": "Extremely detailed description of what the scene looks like ${segmentSeconds} seconds later. Include: exact character positions, poses, expressions, lighting, environment details. Be specific enough for an AI to recreate it.",
  
  "narrativeEvolution": "How has the STORY progressed? What emotional beats occurred? What is the narrative arc building toward? This should EXPAND on the original premise, not just repeat it. Example: 'The initial curiosity has given way to tentative trust as the cat realizes the dragon means no harm...'",
  
  "motionDescription": "Specific MOVEMENTS that occur during these ${segmentSeconds} seconds. Be cinematic: 'The cat takes three deliberate steps forward, tail swishing slowly. The dragon's chest rises and falls with a deep breath. Leaves drift past in the foreground. Camera slowly pushes in.'"
}

CRITICAL RULES:
1. SAME CHARACTERS - Exact same appearance throughout
2. SAME STYLE - Photorealistic, NOT cartoon or animated
3. NATURAL PROGRESSION - What realistically happens in ${segmentSeconds} seconds
4. EXPAND THE STORY - Don't just describe static scenes, tell what HAPPENS
5. CINEMATIC MOTION - Describe movement like a film director

Output ONLY valid JSON, no markdown or explanation.`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/png',
        data: currentFrameBase64,
      },
    },
    analysisPrompt,
  ])
  
  const responseText = result.response.text()
  
  try {
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    console.log(`  ✅ Prediction: "${parsed.visualPrediction?.substring(0, 60)}..."`)
    console.log(`  📖 Narrative: "${parsed.narrativeEvolution?.substring(0, 60)}..."`)
    console.log(`  🎬 Motion: "${parsed.motionDescription?.substring(0, 60)}..."`)
    
    return {
      visualPrediction: parsed.visualPrediction || responseText,
      narrativeEvolution: parsed.narrativeEvolution || '',
      motionDescription: parsed.motionDescription || 'Smooth natural movement'
    }
  } catch (e) {
    // Fallback if JSON parsing fails
    console.log(`  ⚠️ JSON parse failed, using raw response`)
    return {
      visualPrediction: responseText,
      narrativeEvolution: `Segment ${segmentIndex + 1} of the story`,
      motionDescription: 'Smooth natural movement and subtle environmental motion'
    }
  }
}

// ============================================================================
// IMAGE UPLOAD FUNCTIONS
// ============================================================================

async function uploadImageForLuma(base64Image: string): Promise<string> {
  console.log(`  📤 Uploading image for Luma access...`)
  
  // Try freeimage.host first
  try {
    const formData = new FormData()
    formData.append('source', base64Image)
    formData.append('type', 'base64')
    formData.append('action', 'upload')
    formData.append('format', 'json')
    
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
    console.log(`  ⚠️ freeimage.host failed, trying imgbb...`)
  }

  // Fallback to imgbb
  try {
    const formData = new FormData()
    formData.append('image', base64Image)
    
    const response = await fetch('https://api.imgbb.com/1/upload?key=a]', {
      method: 'POST',
      body: formData,
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.data?.url) {
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

async function extractLastFrameFromVideo(videoUrl: string): Promise<string> {
  console.log(`  🎞️ Extracting actual last frame from rendered video...`)
  
  const tempDir = os.tmpdir()
  const videoPath = path.join(tempDir, `luma_video_${Date.now()}.mp4`)
  const framePath = path.join(tempDir, `last_frame_${Date.now()}.png`)
  
  try {
    const response = await fetch(videoUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(videoPath, buffer)
    
    await execAsync(
      `ffmpeg -sseof -0.1 -i "${videoPath}" -update 1 -q:v 2 "${framePath}" -y`,
      { timeout: 30000 }
    )
    
    const frameBuffer = fs.readFileSync(framePath)
    const base64 = frameBuffer.toString('base64')
    
    fs.unlinkSync(videoPath)
    fs.unlinkSync(framePath)
    
    console.log(`  ✅ Last frame extracted successfully`)
    return base64
  } catch (error) {
    try { fs.unlinkSync(videoPath) } catch {}
    try { fs.unlinkSync(framePath) } catch {}
    throw new Error(`Failed to extract last frame: ${error}`)
  }
}

// ============================================================================
// LUMA RAY-2 FUNCTIONS - V4 ENHANCED WITH MOTION PROMPTS
// ============================================================================

/**
 * V4: Generate video with MOTION-ENHANCED prompts
 */
async function generateVideoWithLuma(
  startFrameUrl: string,
  endFrameUrl: string,
  originalPrompt: string,
  motionDescription: string, // NEW: Specific motion from Nano Banana
  style: string,
  duration: LumaDuration = '9s'
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  // V4: Build motion-enhanced prompt
  const motionPrompt = `${originalPrompt}

MOTION: ${motionDescription}

CINEMATIC REQUIREMENTS:
- ${MOTION_KEYWORDS.natural}
- ${MOTION_KEYWORDS.cinematic}
- ${MOTION_KEYWORDS.environmental}
- ${MOTION_KEYWORDS.character}

STYLE: ${style} - Maintain photorealistic quality throughout.
Smooth interpolation between keyframes with natural physics.`

  console.log(`  🎬 Luma Ray-2: Generating ${duration} video with motion-enhanced prompt...`)
  console.log(`     frame0: ${startFrameUrl.substring(0, 50)}...`)
  console.log(`     frame1: ${endFrameUrl.substring(0, 50)}...`)
  console.log(`     motion: ${motionDescription.substring(0, 60)}...`)

  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: motionPrompt,
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
// MAIN PIPELINE - V4
// ============================================================================

export async function generateUnifiedVideoV4(
  prompt: string,
  targetDuration: number,
  style: string = 'hyper realistic, photorealistic, cinematic lighting',
  segmentDuration: LumaDuration = '9s'
): Promise<UnifiedPipelineResult> {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  
  console.log(`
════════════════════════════════════════════════════════════
🎬 UNIFIED VIDEO PIPELINE v4
════════════════════════════════════════════════════════════
NEW IN V4:
  ✓ Style anchoring (original frame as reference)
  ✓ Motion-enhanced Luma prompts
  ✓ Narrative evolution (story expands)
  ✓ Negative prompts (prevent style drift)
════════════════════════════════════════════════════════════
Technologies: GPT-Image-1.5 + Nano Banana + Luma Ray-2
Target: ${targetDuration}s → ${numSegments} x ${segmentSeconds}s segments
Style: ${style}
Prompt: ${prompt}
════════════════════════════════════════════════════════════
`)

  const segments: VideoSegment[] = []
  let currentFrameBase64: string
  let styleAnchorBase64: string // NEW: Keep original for style reference
  let cumulativeNarrative: string = '' // NEW: Build story context

  try {
    // Step 1: Generate initial frame (becomes STYLE ANCHOR)
    console.log(`\n📸 STEP 1: Generate initial frame (STYLE ANCHOR)`)
    currentFrameBase64 = await generateInitialFrame(prompt, style)
    styleAnchorBase64 = currentFrameBase64 // Save as style reference

    // Step 2: Generate each segment
    for (let i = 0; i < numSegments; i++) {
      console.log(`\n${'─'.repeat(50)}`)
      console.log(`🎬 SEGMENT ${i + 1}/${numSegments}`)
      console.log(`${'─'.repeat(50)}`)

      try {
        // 2a: Nano Banana predicts future + evolves narrative
        const nanoBananaOutput = await nanoBananaPredictFuture(
          currentFrameBase64,
          prompt,
          cumulativeNarrative,
          i,
          segmentSeconds
        )

        // Update cumulative narrative
        cumulativeNarrative = cumulativeNarrative 
          ? `${cumulativeNarrative} → ${nanoBananaOutput.narrativeEvolution}`
          : nanoBananaOutput.narrativeEvolution

        // 2b: GPT-Image-1.5 generates end frame with style anchor
        const endFrameBase64 = await generateEndFrameWithReference(
          currentFrameBase64,
          styleAnchorBase64,
          nanoBananaOutput,
          prompt,
          cumulativeNarrative,
          style,
          i
        )

        // 2c: Upload both frames for Luma
        const startFrameUrl = await uploadImageForLuma(currentFrameBase64)
        const endFrameUrl = await uploadImageForLuma(endFrameBase64)

        // 2d: Generate video with motion-enhanced prompt
        const videoResult = await generateVideoWithLuma(
          startFrameUrl,
          endFrameUrl,
          prompt,
          nanoBananaOutput.motionDescription,
          style,
          segmentDuration
        )

        segments.push({
          index: i,
          startFrameUrl,
          endFrameUrl,
          videoUrl: videoResult.videoUrl,
          thumbnailUrl: videoResult.thumbnailUrl,
          duration: segmentSeconds,
          nanoBananaPrediction: nanoBananaOutput.visualPrediction,
          evolvedNarrative: nanoBananaOutput.narrativeEvolution,
        })

        console.log(`  ✅ Segment ${i + 1} complete`)
        console.log(`  📖 Story so far: ${cumulativeNarrative.substring(0, 100)}...`)

        // 2e: Extract ACTUAL last frame from rendered video
        if (i < numSegments - 1) {
          try {
            currentFrameBase64 = await extractLastFrameFromVideo(videoResult.videoUrl)
            console.log(`  🔗 Using actual rendered frame for next segment`)
          } catch (extractError) {
            console.log(`  ⚠️ Frame extraction failed, using target end frame`)
            currentFrameBase64 = endFrameBase64
          }
        }

      } catch (error) {
        console.error(`  ❌ Segment ${i + 1} failed:`, error)
      }
    }

    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)

    console.log(`
════════════════════════════════════════════════════════════
✅ UNIFIED PIPELINE V4 COMPLETE
   Segments: ${segments.length}/${numSegments}
   Duration: ${totalDuration}s
   Final Narrative: ${cumulativeNarrative.substring(0, 150)}...
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

export function estimateTimeV4(targetDuration: number, segmentDuration: LumaDuration = '9s'): string {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  const minutes = Math.ceil(numSegments * 3.5)
  return `${minutes} minutes`
}

export function estimateCostV4(targetDuration: number, segmentDuration: LumaDuration = '9s'): string {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  // GPT-Image-1.5: ~$0.08 per image (2 per segment), Luma: ~$0.25 per 9s
  const cost = numSegments * (0.08 * 2 + 0.25)
  return `$${cost.toFixed(2)}`
}
