/**
 * Unified Video Pipeline v5
 * 
 * KEY CHANGE: Single keyframe + Camera Concepts for natural motion
 * 
 * V4 Problem: Dual keyframes caused "play-pause-zoom-change scene" effect
 * because Luma was morphing between two stills instead of generating natural motion.
 * 
 * V5 Solution:
 * 1. Use ONLY start keyframe (no end keyframe forcing)
 * 2. Use Luma Camera Concepts for cinematic motion control
 * 3. Nano Banana describes MOTION/ACTION, not end state
 * 4. Let Luma generate natural motion based on prompt + concepts
 * 5. Extract actual last frame for next segment continuity
 * 
 * Available Camera Concepts:
 * - Motion: push_in, pull_out, orbit_left, orbit_right, pan_left, pan_right
 * - Vertical: crane_up, crane_down, pedestal_up, pedestal_down, tilt_up, tilt_down
 * - Style: handheld, static, bolt_cam, aerial_drone, dolly_zoom
 * - Angle: low_angle, high_angle, eye_level, overhead, ground_level, pov
 * - Special: zoom_in, zoom_out, tiny_planet, elevator_doors, selfie
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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type LumaDuration = '5s' | '9s'

// Available Luma Camera Concepts
const CAMERA_CONCEPTS = [
  'push_in', 'pull_out', 'orbit_left', 'orbit_right', 'pan_left', 'pan_right',
  'crane_up', 'crane_down', 'pedestal_up', 'pedestal_down', 'tilt_up', 'tilt_down',
  'handheld', 'static', 'bolt_cam', 'aerial_drone', 'dolly_zoom',
  'low_angle', 'high_angle', 'eye_level', 'overhead', 'ground_level', 'pov',
  'zoom_in', 'zoom_out', 'truck_left', 'truck_right', 'roll_left', 'roll_right'
] as const

type CameraConcept = typeof CAMERA_CONCEPTS[number]

interface VideoSegment {
  index: number
  startFrameUrl: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  motionDescription: string
  cameraConcepts: CameraConcept[]
  narrativeContext: string
}

interface NanoBananaMotionOutput {
  motionDescription: string    // What ACTION/MOTION happens (not end state)
  cameraConcepts: CameraConcept[] // Which camera concepts to use
  narrativeProgression: string // How story advances
}

interface UnifiedPipelineResult {
  success: boolean
  segments: VideoSegment[]
  totalDuration: number
  error?: string
}

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

const STYLE_REQUIREMENTS = `
CRITICAL STYLE REQUIREMENTS:
- Photorealistic rendering with real-world physics
- Natural lighting with proper shadows and reflections
- Realistic textures on all surfaces
- Cinematic composition with professional depth of field
- Characters with realistic proportions and anatomy

ABSOLUTELY AVOID:
- Cartoon or animated style
- Stylized or artistic rendering
- Pixar/Disney animation aesthetic
- Flat colors or cel shading
- Exaggerated proportions`

// ============================================================================
// GPT-IMAGE-1.5 FUNCTIONS
// ============================================================================

async function generateInitialFrame(prompt: string, style: string): Promise<string> {
  console.log(`  🎨 GPT-Image-1.5: Generating initial frame...`)
  
  const fullPrompt = `${prompt}

Style: ${style}
${STYLE_REQUIREMENTS}`

  const response = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt: fullPrompt,
    n: 1,
    size: '1536x1024',
  })

  if (!response.data?.[0]?.b64_json) {
    throw new Error('No image data returned from GPT-Image-1.5')
  }

  console.log(`  ✅ Initial frame generated`)
  return response.data[0].b64_json
}

// ============================================================================
// NANO BANANA V5 - MOTION-FOCUSED (NOT END STATE)
// ============================================================================

async function nanoBananaDescribeMotion(
  currentFrameBase64: string,
  originalPrompt: string,
  cumulativeNarrative: string,
  segmentIndex: number,
  segmentSeconds: number = 9
): Promise<NanoBananaMotionOutput> {
  console.log(`  🍌 Nano Banana V5: Analyzing frame and describing MOTION...`)
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const analysisPrompt = `You are an expert cinematographer planning a ${segmentSeconds}-second video shot.

SCENE: ${originalPrompt}
STORY SO FAR: ${cumulativeNarrative || 'Opening scene.'}
SEGMENT: ${segmentIndex + 1}

Analyze this frame and plan the MOTION and ACTION for the next ${segmentSeconds} seconds.

IMPORTANT: Do NOT describe an end state. Describe CONTINUOUS MOTION and ACTION.

Available camera concepts (pick 1-2 that fit):
- push_in: Camera moves toward subject
- pull_out: Camera moves away from subject  
- orbit_left/orbit_right: Camera circles around subject
- pan_left/pan_right: Camera rotates horizontally
- crane_up/crane_down: Camera moves vertically
- handheld: Slight natural camera shake
- static: No camera movement
- dolly_zoom: Vertigo effect
- tilt_up/tilt_down: Camera tilts vertically

Output JSON:
{
  "motionDescription": "Describe the CONTINUOUS ACTION happening. Example: 'The cat slowly approaches the dragon, its tail swishing with curiosity. The dragon's nostrils flare gently as it breathes. Leaves drift through the scene. The cat's paw reaches out tentatively.' Focus on MOVEMENT, not end positions.",
  
  "cameraConcepts": ["push_in", "handheld"],
  
  "narrativeProgression": "How the story/emotion advances during this shot. Example: 'Trust builds as the cat overcomes its initial fear.'"
}

CRITICAL: 
- motionDescription should describe ONGOING ACTION, not "the cat is now at position X"
- Think like a film director: what HAPPENS during these ${segmentSeconds} seconds?
- Include character motion, environmental motion, and emotional beats

Output ONLY valid JSON.`

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
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate camera concepts
    const validConcepts = (parsed.cameraConcepts || []).filter(
      (c: string) => CAMERA_CONCEPTS.includes(c as CameraConcept)
    ) as CameraConcept[]
    
    // Default to push_in + handheld if none valid
    const concepts = validConcepts.length > 0 ? validConcepts : ['push_in', 'handheld'] as CameraConcept[]
    
    console.log(`  ✅ Motion: "${parsed.motionDescription?.substring(0, 60)}..."`)
    console.log(`  🎥 Camera: ${concepts.join(' + ')}`)
    console.log(`  📖 Story: "${parsed.narrativeProgression?.substring(0, 50)}..."`)
    
    return {
      motionDescription: parsed.motionDescription || 'Natural movement and subtle environmental motion',
      cameraConcepts: concepts,
      narrativeProgression: parsed.narrativeProgression || ''
    }
  } catch (e) {
    console.log(`  ⚠️ JSON parse failed, using defaults`)
    return {
      motionDescription: 'The scene unfolds naturally with subtle character movement and environmental motion.',
      cameraConcepts: ['push_in', 'handheld'],
      narrativeProgression: `Segment ${segmentIndex + 1} continues the story`
    }
  }
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

async function uploadImageForLuma(base64Image: string): Promise<string> {
  console.log(`  📤 Uploading image for Luma...`)
  
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
    console.log(`  ⚠️ freeimage.host failed`)
  }

  throw new Error('Failed to upload image')
}

// ============================================================================
// VIDEO FRAME EXTRACTION
// ============================================================================

async function extractLastFrameFromVideo(videoUrl: string): Promise<string> {
  console.log(`  🎞️ Extracting last frame from video...`)
  
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
    
    console.log(`  ✅ Last frame extracted`)
    return base64
  } catch (error) {
    try { fs.unlinkSync(videoPath) } catch {}
    try { fs.unlinkSync(framePath) } catch {}
    throw new Error(`Frame extraction failed: ${error}`)
  }
}

// ============================================================================
// LUMA RAY-2 WITH CAMERA CONCEPTS - V5 KEY CHANGE
// ============================================================================

async function generateVideoWithLuma(
  startFrameUrl: string,
  motionDescription: string,
  cameraConcepts: CameraConcept[],
  originalPrompt: string,
  style: string,
  duration: LumaDuration = '9s'
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('LUMA_API_KEY not configured')

  // Build motion-focused prompt (no end state description)
  const motionPrompt = `${originalPrompt}

ACTION: ${motionDescription}

Style: ${style}
Natural, fluid motion with realistic physics. Smooth continuous movement.`

  console.log(`  🎬 Luma Ray-2: Generating ${duration} video...`)
  console.log(`     Start frame: ${startFrameUrl.substring(0, 50)}...`)
  console.log(`     Camera: ${cameraConcepts.join(' + ')}`)
  console.log(`     Motion: ${motionDescription.substring(0, 60)}...`)

  // V5: Single keyframe (frame0 only) + Camera Concepts
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
        }
        // NO frame1 - let Luma generate natural motion
      },
      concepts: cameraConcepts.map(key => ({ key }))
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Luma error: ${errorText}`)
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
      throw new Error(`Generation failed: ${data.failure_reason}`)
    }
  }
  throw new Error('Generation timeout')
}

// ============================================================================
// MAIN PIPELINE V5
// ============================================================================

export async function generateUnifiedVideoV5(
  prompt: string,
  targetDuration: number,
  style: string = 'hyper realistic, photorealistic, cinematic lighting',
  segmentDuration: LumaDuration = '9s'
): Promise<UnifiedPipelineResult> {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  
  console.log(`
════════════════════════════════════════════════════════════
🎬 UNIFIED VIDEO PIPELINE v5
════════════════════════════════════════════════════════════
KEY CHANGES IN V5:
  ✓ Single keyframe only (no end frame forcing)
  ✓ Luma Camera Concepts for cinematic motion
  ✓ Motion-focused prompts (action, not end state)
  ✓ Natural motion generation
════════════════════════════════════════════════════════════
Technologies: GPT-Image-1.5 + Nano Banana + Luma Ray-2 + Camera Concepts
Target: ${targetDuration}s → ${numSegments} x ${segmentSeconds}s segments
Style: ${style}
Prompt: ${prompt}
════════════════════════════════════════════════════════════
`)

  const segments: VideoSegment[] = []
  let currentFrameBase64: string
  let cumulativeNarrative: string = ''

  try {
    // Step 1: Generate initial frame
    console.log(`\n📸 STEP 1: Generate initial frame`)
    currentFrameBase64 = await generateInitialFrame(prompt, style)

    // Step 2: Generate each segment
    for (let i = 0; i < numSegments; i++) {
      console.log(`\n${'─'.repeat(50)}`)
      console.log(`🎬 SEGMENT ${i + 1}/${numSegments}`)
      console.log(`${'─'.repeat(50)}`)

      try {
        // 2a: Nano Banana describes MOTION (not end state)
        const motionOutput = await nanoBananaDescribeMotion(
          currentFrameBase64,
          prompt,
          cumulativeNarrative,
          i,
          segmentSeconds
        )

        // Update narrative
        cumulativeNarrative = cumulativeNarrative 
          ? `${cumulativeNarrative} → ${motionOutput.narrativeProgression}`
          : motionOutput.narrativeProgression

        // 2b: Upload start frame
        const startFrameUrl = await uploadImageForLuma(currentFrameBase64)

        // 2c: Generate video with single keyframe + camera concepts
        const videoResult = await generateVideoWithLuma(
          startFrameUrl,
          motionOutput.motionDescription,
          motionOutput.cameraConcepts,
          prompt,
          style,
          segmentDuration
        )

        segments.push({
          index: i,
          startFrameUrl,
          videoUrl: videoResult.videoUrl,
          thumbnailUrl: videoResult.thumbnailUrl,
          duration: segmentSeconds,
          motionDescription: motionOutput.motionDescription,
          cameraConcepts: motionOutput.cameraConcepts,
          narrativeContext: motionOutput.narrativeProgression,
        })

        console.log(`  ✅ Segment ${i + 1} complete`)
        console.log(`  📖 Story: ${cumulativeNarrative.substring(0, 80)}...`)

        // 2d: Extract last frame for next segment
        if (i < numSegments - 1) {
          try {
            currentFrameBase64 = await extractLastFrameFromVideo(videoResult.videoUrl)
            console.log(`  🔗 Using rendered frame for next segment`)
          } catch (extractError) {
            console.log(`  ⚠️ Frame extraction failed, regenerating frame`)
            // Fallback: generate new frame based on narrative
            currentFrameBase64 = await generateInitialFrame(
              `${prompt}. ${cumulativeNarrative}`,
              style
            )
          }
        }

      } catch (error) {
        console.error(`  ❌ Segment ${i + 1} failed:`, error)
      }
    }

    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)

    console.log(`
════════════════════════════════════════════════════════════
✅ UNIFIED PIPELINE V5 COMPLETE
   Segments: ${segments.length}/${numSegments}
   Duration: ${totalDuration}s
   Narrative: ${cumulativeNarrative.substring(0, 100)}...
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

export function estimateCostV5(targetDuration: number, segmentDuration: LumaDuration = '9s'): string {
  const segmentSeconds = segmentDuration === '9s' ? 9 : 5
  const numSegments = Math.ceil(targetDuration / segmentSeconds)
  // GPT-Image-1.5: ~$0.08 (1 per segment now), Luma: ~$0.25 per 9s
  const cost = numSegments * (0.08 + 0.25)
  return `$${cost.toFixed(2)}`
}
