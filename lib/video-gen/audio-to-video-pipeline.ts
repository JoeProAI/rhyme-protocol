/**
 * Audio-to-Video Pipeline
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

import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type LumaDuration = '5s' | '9s'
type AspectRatio = '16:9' | '9:16' | '1:1'

const CAMERA_CONCEPTS = [
  'push_in', 'pull_out', 'orbit_left', 'orbit_right', 'pan_left', 'pan_right',
  'crane_up', 'crane_down', 'pedestal_up', 'pedestal_down', 'tilt_up', 'tilt_down',
  'handheld', 'static', 'bolt_cam', 'aerial_drone', 'dolly_zoom',
  'low_angle', 'high_angle', 'eye_level', 'overhead', 'ground_level', 'pov',
  'zoom_in', 'zoom_out', 'truck_left', 'truck_right'
] as const

type CameraConcept = typeof CAMERA_CONCEPTS[number]

// Input types
export interface AudioToVideoInput {
  audioUrl: string
  audioFormat?: 'mp3' | 'wav' | 'webm' | 'm4a'
  style?: string
  aspectRatio?: AspectRatio
  segmentDuration?: LumaDuration
  maxDuration?: number
  styleReferenceImage?: string
}

// Transcription types
interface TranscriptionSegment {
  start: number
  end: number
  text: string
  confidence: number
}

interface TranscriptionResult {
  fullText: string
  segments: TranscriptionSegment[]
  language: string
  duration: number
}

// Scene planning types
interface ScenePlan {
  sceneIndex: number
  startTime: number
  endTime: number
  duration: number
  transcriptText: string
  visualDescription: string
  mood: string
  cameraMotion: string
  transitionType: 'cut' | 'fade' | 'dissolve'
  keyElements: string[]
}

interface ScenePlanResult {
  scenes: ScenePlan[]
  styleAnchor: string
  characterDescriptions: Record<string, string>
  settingDescriptions: Record<string, string>
}

// Motion prediction types
interface NanoBananaMotionOutput {
  motionDescription: string
  cameraConcepts: CameraConcept[]
  narrativeProgression: string
}

// Video generation types
interface GeneratedSegment {
  sceneIndex: number
  keyframeUrl: string
  keyframeBase64: string
  videoUrl: string
  startTime: number
  endTime: number
  motionDescription: string
  cameraConcepts: CameraConcept[]
}

// Final output
export interface AudioToVideoResult {
  success: boolean
  videoUrl?: string
  segments: GeneratedSegment[]
  totalDuration: number
  transcription: TranscriptionResult
  scenePlan: ScenePlanResult
  error?: string
}

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

const DEFAULT_STYLE = `Photorealistic cinematic style with professional lighting, 
natural shadows, and film-quality depth of field. Rich, grounded color palette 
with subtle film grain. Professional cinematography composition.`

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
// STEP 1: AUDIO TRANSCRIPTION (Whisper)
// ============================================================================

async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  console.log('📝 Step 1: Transcribing audio with Whisper...')
  
  // Download audio file if URL
  let audioBuffer: Buffer
  if (audioUrl.startsWith('http')) {
    const response = await fetch(audioUrl)
    audioBuffer = Buffer.from(await response.arrayBuffer())
  } else if (audioUrl.startsWith('data:')) {
    // Base64 data URL
    const base64Data = audioUrl.split(',')[1]
    audioBuffer = Buffer.from(base64Data, 'base64')
  } else {
    // Local file path
    audioBuffer = await fs.readFile(audioUrl) as unknown as Buffer
  }
  
  // Create temp file for Whisper
  const tempDir = os.tmpdir()
  const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`)
  await fs.writeFile(tempFile, audioBuffer)
  
  try {
    const file = await fs.readFile(tempFile)
    const response = await getOpenAI().audio.transcriptions.create({
      file: new File([file], 'audio.mp3', { type: 'audio/mpeg' }),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    })
    
    const result: TranscriptionResult = {
      fullText: response.text,
      segments: (response as any).segments?.map((s: any) => ({
        start: s.start,
        end: s.end,
        text: s.text.trim(),
        confidence: Math.exp(s.avg_logprob || -1)
      })) || [],
      language: (response as any).language || 'en',
      duration: (response as any).duration || 0
    }
    
    console.log(`   ✓ Transcribed ${result.duration}s of audio`)
    console.log(`   ✓ Found ${result.segments.length} segments`)
    
    return result
  } finally {
    // Cleanup temp file
    await fs.unlink(tempFile).catch(() => {})
  }
}

// ============================================================================
// STEP 2: SCENE PLANNING (GPT-4)
// ============================================================================

async function planScenes(
  transcription: TranscriptionResult,
  style: string,
  segmentDuration: LumaDuration
): Promise<ScenePlanResult> {
  console.log('🎬 Step 2: Planning scenes with GPT-4...')
  
  const durationSeconds = segmentDuration === '5s' ? 5 : 9
  
  const prompt = `You are a visual storyteller and cinematographer. Given this audio transcript, plan video scenes.

TRANSCRIPT:
${transcription.fullText}

TIMESTAMPS:
${transcription.segments.map(s => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s]: ${s.text}`).join('\n')}

TOTAL DURATION: ${transcription.duration} seconds
VISUAL STYLE: ${style}
TARGET SEGMENT DURATION: ${durationSeconds} seconds per scene

Create a scene plan that:
1. Groups transcript segments into visual scenes (~${durationSeconds}s each)
2. Describes what to SHOW visually (not just what's being said)
3. Maintains visual consistency across all scenes
4. Suggests camera movements that match the audio energy and content
5. Identifies recurring characters/elements for visual consistency
6. Creates smooth narrative flow between scenes

For each scene, consider:
- What visual metaphor or literal representation fits the audio?
- What mood should the visuals convey?
- How does this scene connect to the previous and next?

Output valid JSON with this exact structure:
{
  "scenes": [
    {
      "sceneIndex": 0,
      "startTime": 0,
      "endTime": 5,
      "duration": 5,
      "transcriptText": "What's being said in this segment",
      "visualDescription": "Detailed description of what to show",
      "mood": "emotional tone",
      "cameraMotion": "suggested camera movement",
      "transitionType": "cut",
      "keyElements": ["element1", "element2"]
    }
  ],
  "styleAnchor": "Consistent style description to apply to ALL frames",
  "characterDescriptions": {
    "characterName": "Detailed physical description for consistency"
  },
  "settingDescriptions": {
    "locationName": "Detailed setting description for consistency"
  }
}`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })
  
  const result = JSON.parse(response.choices[0].message.content || '{}') as ScenePlanResult
  
  console.log(`   ✓ Planned ${result.scenes.length} scenes`)
  console.log(`   ✓ Style anchor: ${result.styleAnchor.substring(0, 50)}...`)
  
  return result
}

// ============================================================================
// STEP 3: KEYFRAME GENERATION (GPT-Image-1.5)
// ============================================================================

async function generateKeyframe(
  scene: ScenePlan,
  styleAnchor: string,
  characterDescriptions: Record<string, string>,
  settingDescriptions: Record<string, string>,
  previousFrameBase64?: string
): Promise<{ url: string; base64: string }> {
  console.log(`   🎨 Generating keyframe for scene ${scene.sceneIndex + 1}...`)
  
  // Build character/setting context
  const characterContext = Object.entries(characterDescriptions)
    .map(([name, desc]) => `${name}: ${desc}`)
    .join('\n')
  
  const settingContext = Object.entries(settingDescriptions)
    .map(([name, desc]) => `${name}: ${desc}`)
    .join('\n')
  
  const prompt = `${scene.visualDescription}

STYLE ANCHOR (MUST FOLLOW EXACTLY):
${styleAnchor}

${characterContext ? `CHARACTERS (maintain exact appearance):\n${characterContext}\n` : ''}
${settingContext ? `SETTINGS (maintain exact appearance):\n${settingContext}\n` : ''}

MOOD: ${scene.mood}
KEY ELEMENTS TO INCLUDE: ${scene.keyElements.join(', ')}

${STYLE_REQUIREMENTS}`

  const input: any[] = [{ type: 'text', text: prompt }]
  
  // Add previous frame for visual consistency
  if (previousFrameBase64) {
    input.push({
      type: 'image_url',
      image_url: { 
        url: `data:image/png;base64,${previousFrameBase64}`,
        detail: 'high'
      }
    })
    input.push({
      type: 'text',
      text: 'REFERENCE IMAGE: Match the visual style, color grading, lighting, and any recurring character/element appearances from this previous frame exactly.'
    })
  }

  const response = await getOpenAI().responses.create({
    model: 'gpt-image-1.5',
    input,
    tools: [{ 
      type: 'image_generation', 
      quality: 'high',
      size: '1536x1024' // 16:9 aspect
    }],
    tool_choice: { type: 'image_generation' }
  })

  // Extract base64 from response
  const imageOutput = response.output.find((o: any) => o.type === 'image_generation_result')
  if (!imageOutput) {
    throw new Error('No image generated')
  }
  
  const base64 = (imageOutput as any).result
  
  // Upload to get URL (or use data URL)
  const url = `data:image/png;base64,${base64}`
  
  return { url, base64 }
}

// ============================================================================
// STEP 4: MOTION PREDICTION (Nano Banana / Gemini Vision)
// ============================================================================

async function predictMotion(
  keyframeBase64: string,
  scene: ScenePlan,
  nextScene?: ScenePlan
): Promise<NanoBananaMotionOutput> {
  console.log(`   🍌 Predicting motion for scene ${scene.sceneIndex + 1}...`)
  
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const prompt = `You are a cinematographer planning camera motion for a video segment.

Analyze this keyframe image and describe the MOTION that should happen over the next ${scene.duration} seconds.

SCENE CONTEXT: ${scene.visualDescription}
AUDIO CONTENT: "${scene.transcriptText}"
MOOD: ${scene.mood}
SUGGESTED CAMERA: ${scene.cameraMotion}
${nextScene ? `NEXT SCENE: ${nextScene.visualDescription}` : ''}

IMPORTANT: Describe CONTINUOUS MOTION/ACTION, not an end state. The video AI will animate based on your description.

Available camera concepts (pick 1-2 that fit best):
- Motion: push_in, pull_out, orbit_left, orbit_right, pan_left, pan_right
- Vertical: crane_up, crane_down, tilt_up, tilt_down
- Style: handheld, static, dolly_zoom, aerial_drone
- Angle: low_angle, high_angle, pov

Output valid JSON:
{
  "motionDescription": "Describe the continuous motion/action that should happen. Be specific about movement direction, speed, and what elements are moving. Example: 'Camera slowly pushes in while leaves gently sway in the breeze, light shifts subtly across the scene'",
  "cameraConcepts": ["concept1", "concept2"],
  "narrativeProgression": "How this motion advances the story and connects to the next scene"
}`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/png',
        data: keyframeBase64
      }
    },
    prompt
  ])

  const text = result.response.text()
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    // Fallback if JSON parsing fails
    return {
      motionDescription: `Gentle camera movement with subtle ambient motion. ${scene.cameraMotion}`,
      cameraConcepts: ['static'] as CameraConcept[],
      narrativeProgression: 'Continues the visual narrative'
    }
  }
  
  const parsed = JSON.parse(jsonMatch[0])
  
  // Validate camera concepts
  const validConcepts = (parsed.cameraConcepts || []).filter(
    (c: string) => CAMERA_CONCEPTS.includes(c as CameraConcept)
  ) as CameraConcept[]
  
  return {
    motionDescription: parsed.motionDescription || scene.visualDescription,
    cameraConcepts: validConcepts.length > 0 ? validConcepts : ['static'],
    narrativeProgression: parsed.narrativeProgression || ''
  }
}

// ============================================================================
// STEP 5: VIDEO GENERATION (Luma Ray-2)
// ============================================================================

async function generateVideo(
  keyframeUrl: string,
  motion: NanoBananaMotionOutput,
  duration: LumaDuration,
  aspectRatio: AspectRatio
): Promise<string> {
  console.log(`   🎥 Generating video segment with Luma Ray-2...`)
  
  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LUMA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: motion.motionDescription,
      keyframes: {
        frame0: {
          type: 'image',
          url: keyframeUrl
        }
      },
      aspect_ratio: aspectRatio,
      duration,
      model: 'ray-2',
      concepts: motion.cameraConcepts
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Luma API error: ${error}`)
  }

  const generation = await response.json()
  
  // Poll for completion
  return await pollLumaGeneration(generation.id)
}

async function pollLumaGeneration(generationId: string): Promise<string> {
  const maxAttempts = 120 // 10 minutes max
  const pollInterval = 5000 // 5 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.LUMA_API_KEY}`
      }
    })
    
    const generation = await response.json()
    
    if (generation.state === 'completed') {
      console.log(`   ✓ Video segment generated`)
      return generation.assets.video
    }
    
    if (generation.state === 'failed') {
      throw new Error(`Luma generation failed: ${generation.failure_reason}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }
  
  throw new Error('Luma generation timed out')
}

// ============================================================================
// STEP 6: FINAL ASSEMBLY (FFmpeg)
// ============================================================================

async function extractLastFrame(videoUrl: string): Promise<string> {
  const tempDir = os.tmpdir()
  const videoPath = path.join(tempDir, `video_${Date.now()}.mp4`)
  const framePath = path.join(tempDir, `frame_${Date.now()}.png`)
  
  // Download video
  const response = await fetch(videoUrl)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(videoPath, buffer)
  
  try {
    // Extract last frame
    await execAsync(`ffmpeg -sseof -0.1 -i "${videoPath}" -update 1 -q:v 2 "${framePath}" -y`)
    
    // Read as base64
    const frameBuffer = await fs.readFile(framePath)
    return frameBuffer.toString('base64')
  } finally {
    await fs.unlink(videoPath).catch(() => {})
    await fs.unlink(framePath).catch(() => {})
  }
}

async function assembleVideo(
  segments: GeneratedSegment[],
  originalAudioUrl: string,
  outputPath: string
): Promise<string> {
  console.log('🎞️ Step 6: Assembling final video with FFmpeg...')
  
  const tempDir = os.tmpdir()
  const workDir = path.join(tempDir, `atv_${Date.now()}`)
  await fs.mkdir(workDir, { recursive: true })
  
  try {
    // Download all video segments
    const segmentPaths: string[] = []
    for (let i = 0; i < segments.length; i++) {
      const segPath = path.join(workDir, `segment_${i}.mp4`)
      const response = await fetch(segments[i].videoUrl)
      const buffer = Buffer.from(await response.arrayBuffer())
      await fs.writeFile(segPath, buffer)
      segmentPaths.push(segPath)
    }
    
    // Download original audio
    const audioPath = path.join(workDir, 'audio.mp3')
    if (originalAudioUrl.startsWith('http')) {
      const response = await fetch(originalAudioUrl)
      const buffer = Buffer.from(await response.arrayBuffer())
      await fs.writeFile(audioPath, buffer)
    } else if (originalAudioUrl.startsWith('data:')) {
      const base64Data = originalAudioUrl.split(',')[1]
      await fs.writeFile(audioPath, Buffer.from(base64Data, 'base64'))
    } else {
      await fs.copyFile(originalAudioUrl, audioPath)
    }
    
    // Create concat file
    const concatPath = path.join(workDir, 'concat.txt')
    const concatContent = segmentPaths.map(p => `file '${p}'`).join('\n')
    await fs.writeFile(concatPath, concatContent)
    
    // Concatenate videos
    const concatenatedPath = path.join(workDir, 'concatenated.mp4')
    await execAsync(`ffmpeg -f concat -safe 0 -i "${concatPath}" -c copy "${concatenatedPath}" -y`)
    
    // Merge with original audio
    await execAsync(`ffmpeg -i "${concatenatedPath}" -i "${audioPath}" -c:v libx264 -c:a aac -map 0:v -map 1:a -shortest "${outputPath}" -y`)
    
    console.log(`   ✓ Final video saved to ${outputPath}`)
    
    return outputPath
  } finally {
    // Cleanup work directory
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

export async function generateAudioToVideo(
  input: AudioToVideoInput
): Promise<AudioToVideoResult> {
  console.log('🚀 Starting Audio-to-Video Pipeline')
  console.log('=' .repeat(60))
  
  const {
    audioUrl,
    style = DEFAULT_STYLE,
    aspectRatio = '16:9',
    segmentDuration = '5s',
    maxDuration,
    styleReferenceImage
  } = input
  
  const segments: GeneratedSegment[] = []
  
  try {
    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(audioUrl)
    
    // Limit duration if specified
    const effectiveDuration = maxDuration 
      ? Math.min(transcription.duration, maxDuration)
      : transcription.duration
    
    // Step 2: Plan scenes
    const scenePlan = await planScenes(transcription, style, segmentDuration)
    
    // Filter scenes to max duration
    const scenesToProcess = scenePlan.scenes.filter(s => s.startTime < effectiveDuration)
    
    console.log('🎬 Step 3-5: Generating video segments...')
    console.log(`   Processing ${scenesToProcess.length} scenes`)
    
    let previousFrameBase64: string | undefined = styleReferenceImage
    
    // Process each scene
    for (let i = 0; i < scenesToProcess.length; i++) {
      const scene = scenesToProcess[i]
      const nextScene = scenesToProcess[i + 1]
      
      console.log(`\n📍 Scene ${i + 1}/${scenesToProcess.length} [${scene.startTime}s - ${scene.endTime}s]`)
      
      // Step 3: Generate keyframe
      const keyframe = await generateKeyframe(
        scene,
        scenePlan.styleAnchor,
        scenePlan.characterDescriptions,
        scenePlan.settingDescriptions,
        previousFrameBase64
      )
      
      // Step 4: Predict motion
      const motion = await predictMotion(keyframe.base64, scene, nextScene)
      
      // Step 5: Generate video
      const videoUrl = await generateVideo(
        keyframe.url,
        motion,
        segmentDuration,
        aspectRatio
      )
      
      // Extract last frame for next segment's consistency
      previousFrameBase64 = await extractLastFrame(videoUrl)
      
      segments.push({
        sceneIndex: scene.sceneIndex,
        keyframeUrl: keyframe.url,
        keyframeBase64: keyframe.base64,
        videoUrl,
        startTime: scene.startTime,
        endTime: scene.endTime,
        motionDescription: motion.motionDescription,
        cameraConcepts: motion.cameraConcepts
      })
    }
    
    // Step 6: Assemble final video
    const outputPath = path.join(os.tmpdir(), `audio_to_video_${Date.now()}.mp4`)
    const finalVideoPath = await assembleVideo(segments, audioUrl, outputPath)
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ Audio-to-Video Pipeline Complete!')
    console.log(`   Total segments: ${segments.length}`)
    console.log(`   Total duration: ${effectiveDuration}s`)
    console.log(`   Output: ${finalVideoPath}`)
    
    return {
      success: true,
      videoUrl: finalVideoPath,
      segments,
      totalDuration: effectiveDuration,
      transcription,
      scenePlan
    }
    
  } catch (error) {
    console.error('❌ Pipeline error:', error)
    return {
      success: false,
      segments,
      totalDuration: 0,
      transcription: { fullText: '', segments: [], language: 'en', duration: 0 },
      scenePlan: { scenes: [], styleAnchor: '', characterDescriptions: {}, settingDescriptions: {} },
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  transcribeAudio,
  planScenes,
  generateKeyframe,
  predictMotion,
  generateVideo,
  assembleVideo,
  extractLastFrame
}
