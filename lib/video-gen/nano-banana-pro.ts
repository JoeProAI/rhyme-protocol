/**
 * Nano Banana Pro 2 - Future Frame Prediction
 * Uses Gemini Vision to analyze current frame and predict what happens 5 seconds later
 * This is the MAGIC that maintains continuity between video segments!
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

/**
 * Generate the END frame by analyzing the START frame
 * This is the key to maintaining visual continuity!
 */
export async function generateEndFrame(
  startFrameBase64: string,
  originalPrompt: string,
  segmentIndex: number = 0
): Promise<{ imageBase64: string; description: string }> {
  
  console.log(`  🎨 Nano Banana: Analyzing frame ${segmentIndex} and predicting 5s future...`)
  
  // Step 1: Use Gemini Vision to analyze current frame and predict future
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  // Remove data URL prefix if present
  const base64Data = startFrameBase64.includes(',') 
    ? startFrameBase64.split(',')[1] 
    : startFrameBase64
  
  const analysisPrompt = `
You are an AI video frame predictor. You're looking at frame ${segmentIndex} of a video.

ORIGINAL SCENE: ${originalPrompt}

TASK: Imagine what this exact scene looks like 5 seconds later in the video. The scene should progress naturally.

RULES:
1. Maintain EXACT same characters, objects, and art style from the image
2. Show natural progression - what realistically happens in 5 seconds?
3. Keep the same camera angle and composition
4. Preserve lighting, color palette, and atmosphere
5. Make subtle but clear changes (movement, position, expression)
6. Stay true to the original prompt's story/narrative

TIME CONTEXT:
- Current: ${segmentIndex * 5} seconds into video
- Next frame: ${(segmentIndex + 1) * 5} seconds into video
- What changes in these 5 seconds?

OUTPUT: Provide a DETAILED description of what the scene looks like 5 seconds later. Be specific about:
- Character positions and movements
- Facial expressions or body language changes
- Environmental changes (lighting, weather, etc.)
- Any new elements that appear
- Camera perspective (if it shifts slightly)

Make it so detailed that an AI image generator can recreate it EXACTLY.
`
  
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      },
      analysisPrompt,
    ])
    
    const futureDescription = result.response.text()
    console.log(`  ✓ Nano Banana predicted future: "${futureDescription.substring(0, 100)}..."`)
    
    // Step 2: Use GPT-Image-1 to generate the actual end frame from this description
    console.log(`  🎨 GPT-Image-1: Generating end frame from prediction...`)
    
    const imagePrompt = `
${futureDescription}

CRITICAL: This is frame ${segmentIndex + 1} of a video sequence. It MUST maintain perfect visual consistency with the previous frame.

Style: ${originalPrompt.includes('cinematic') ? 'cinematic' : originalPrompt.includes('cartoon') ? 'cartoon' : originalPrompt.includes('anime') ? 'anime' : originalPrompt.includes('realistic') ? 'photorealistic' : 'high quality'}

Maintain the exact same:
- Art style and rendering quality
- Color palette and lighting
- Character design and proportions
- Camera angle and framing
`
    
    // Use Responses API with image input for better continuity
    const response: any = await (getOpenAI() as any).responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text' as any,
              text: imagePrompt,
            },
            {
              type: 'input_image' as any,
              image_url: `data:image/png;base64,${base64Data}`,
            },
          ],
        },
      ],
      tools: [
        {
          type: 'image_generation',
          quality: 'high',
          size: '1024x1024',
          input_fidelity: 'high', // CRITICAL: Maintains details from input
        } as any,
      ],
    } as any)
    
    // Extract generated image
    const imageGenerationCalls = (response as any).output.filter(
      (output: any) => output.type === 'image_generation_call'
    )
    
    if (imageGenerationCalls.length === 0) {
      throw new Error('No image generated from prediction')
    }
    
    const endFrameBase64 = imageGenerationCalls[0].result
    
    console.log(`  ✓ End frame generated with high fidelity`)
    
    return {
      imageBase64: endFrameBase64,
      description: futureDescription,
    }
    
  } catch (error) {
    console.error('Nano Banana prediction failed:', error)
    throw new Error(`Failed to predict future frame: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Alternative: Pure Gemini approach (if GPT-Image-1 not available)
 * Uses Gemini to both analyze AND generate the next frame
 */
export async function generateEndFramePureGemini(
  startFrameBase64: string,
  originalPrompt: string,
  segmentIndex: number = 0
): Promise<{ imageBase64: string; description: string }> {
  
  // This would use Gemini's built-in image editing capabilities
  // For now, this is a placeholder - Gemini Imagen 3 needed
  
  throw new Error('Pure Gemini approach not yet implemented. Use generateEndFrame (hybrid approach) instead.')
}

/**
 * Helper: Estimate how long this will take
 */
export function estimateEndFrameGenerationTime(): number {
  // Gemini analysis: ~2-5 seconds
  // GPT-Image-1 generation: ~10-15 seconds
  // Total: ~12-20 seconds per frame
  return 15 // seconds (average)
}

/**
 * Predict scene motion/action for video generation
 * Uses Gemini Vision to analyze the start frame and describe what should happen
 * This powers Luma AI video generation with intelligent motion prediction
 */
export async function predictSceneMotion(
  startFrameBase64: string,
  originalPrompt: string,
  segmentIndex: number = 0
): Promise<string> {
  
  console.log(`🍌 Nano Banana: Predicting motion for segment ${segmentIndex + 1}...`)
  
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  // Remove data URL prefix if present
  const base64Data = startFrameBase64.includes(',') 
    ? startFrameBase64.split(',')[1] 
    : startFrameBase64
  
  const motionPrompt = `
You are an AI video director. Analyze this image and describe the MOTION and ACTION that should happen over the next 5 seconds.

SCENE CONTEXT: ${originalPrompt}
SEGMENT: ${segmentIndex + 1} (${segmentIndex * 5}s to ${(segmentIndex + 1) * 5}s)

DESCRIBE THE MOTION:
1. What movements happen? (camera pan, character motion, object movement)
2. What changes? (lighting shifts, weather, expressions)
3. What's the energy? (slow/contemplative, dynamic/action-packed)
4. Any sound/visual effects implied? (wind, particles, lens flare)

OUTPUT: Write a concise 1-2 sentence description of the motion/action for a video generator.
Focus on VERBS and MOVEMENT. Example: "The camera slowly pushes in as the character turns their head, golden light gradually intensifying from the setting sun."

Be cinematic and specific.`
  
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      },
      motionPrompt,
    ])
    
    const motionDescription = result.response.text().trim()
    console.log(`✓ Motion predicted: "${motionDescription.substring(0, 80)}..."`)
    
    return motionDescription
    
  } catch (error) {
    console.error('Motion prediction failed:', error)
    // Return a generic motion description as fallback
    return 'Smooth cinematic movement with subtle environmental changes'
  }
}
