/**
 * Luma AI Video Generation Integration
 * Creates videos using Luma's Ray 3 model
 * Also supports Photon for image generation
 */

interface VideoGenerationResponse {
  id: string
  status: 'processing' | 'completed' | 'failed'
  url?: string
  duration: number
  error?: string
}

/**
 * Generate a video segment using Luma AI
 * Takes a scene description and generates video
 */
export async function generateVideoSegment(
  sceneDescription: string,
  duration: number = 5
): Promise<VideoGenerationResponse> {
  const apiKey = process.env.LUMA_API_KEY
  
  if (!apiKey) {
    throw new Error('LUMA_API_KEY not configured')
  }
  
  console.log('🎬 Generating video with Luma AI...')
  
  try {
    // Luma AI generations endpoint
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: sceneDescription,
        model: 'ray-2',
        aspect_ratio: '16:9',
        resolution: '720p',
        duration: '5s',
        loop: false,
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Luma AI API error (${response.status}): ${error}`)
    }
    
    const data = await response.json()
    
    console.log(`Video generation started: ${data.id}`)
    
    // Poll for completion
    return await pollForCompletion(data.id, apiKey)
    
  } catch (error) {
    console.error('Video generation error:', error)
    throw error
  }
}

/**
 * Generate video from an image using Luma AI
 */
export async function generateVideoFromImage(
  imageUrl: string,
  sceneDescription: string,
  duration: number = 5
): Promise<VideoGenerationResponse> {
  const apiKey = process.env.LUMA_API_KEY
  
  if (!apiKey) {
    throw new Error('LUMA_API_KEY not configured')
  }
  
  console.log('🎬 Generating video from image with Luma AI...')
  
  try {
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: sceneDescription,
        model: 'ray-2',
        aspect_ratio: '16:9',
        resolution: '720p',
        duration: '5s',
        loop: false,
        keyframes: {
          frame0: {
            type: 'image',
            url: imageUrl,
          }
        }
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Luma AI API error (${response.status}): ${error}`)
    }
    
    const data = await response.json()
    
    console.log(`Video generation started: ${data.id}`)
    
    return await pollForCompletion(data.id, apiKey)
    
  } catch (error) {
    console.error('Video generation error:', error)
    throw error
  }
}

/**
 * Poll Luma AI API until video is ready
 */
async function pollForCompletion(
  generationId: string,
  apiKey: string,
  maxAttempts: number = 60 // 5 minutes max (5s intervals)
): Promise<VideoGenerationResponse> {
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait 5 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    try {
      const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      console.log(`Video ${generationId} state: ${data.state} (attempt ${attempt + 1}/${maxAttempts})`)
      console.log(`Full response:`, JSON.stringify(data, null, 2))
      
      if (data.state === 'completed') {
        // Luma returns video URL at assets.video
        const videoUrl = data.assets?.video
        
        console.log(`✓ Video ${generationId} completed!`)
        console.log(`  Video URL found: ${videoUrl}`)
        console.log(`  All assets:`, JSON.stringify(data.assets, null, 2))
        
        if (!videoUrl) {
          console.error('❌ Video completed but no URL found in response!')
          console.error('Response structure:', Object.keys(data))
          throw new Error('Video completed but no URL found')
        }
        
        return {
          id: generationId,
          status: 'completed',
          url: videoUrl,
          duration: 5,
        }
      }
      
      if (data.state === 'failed') {
        console.error(`❌ Video ${generationId} failed:`, data.failure_reason || data.error)
        throw new Error(`Video generation failed: ${data.failure_reason || data.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error(`Error polling video ${generationId}:`, error)
      
      if (attempt === maxAttempts - 1) {
        throw new Error(`Video generation timeout after ${maxAttempts * 5} seconds`)
      }
    }
  }
  
  throw new Error('Video generation timeout')
}

/**
 * Generate an image using Luma Photon
 */
export async function generateImageWithPhoton(
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16' = '16:9'
): Promise<{ imageUrl: string; id: string }> {
  const apiKey = process.env.LUMA_API_KEY
  
  if (!apiKey) {
    throw new Error('LUMA_API_KEY not configured')
  }
  
  console.log('🖼️ Generating image with Luma Photon...')
  
  try {
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'photon-1',
        aspect_ratio: aspectRatio,
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Luma Photon API error (${response.status}): ${error}`)
    }
    
    const data = await response.json()
    
    console.log(`Image generation started: ${data.id}`)
    
    // Poll for completion
    return await pollForImageCompletion(data.id, apiKey)
    
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}

/**
 * Poll Luma AI API until image is ready
 */
async function pollForImageCompletion(
  generationId: string,
  apiKey: string,
  maxAttempts: number = 30 // 2.5 minutes max
): Promise<{ imageUrl: string; id: string }> {
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    try {
      const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to check image status: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      console.log(`Image ${generationId} state: ${data.state} (attempt ${attempt + 1}/${maxAttempts})`)
      
      if (data.state === 'completed') {
        console.log(`✓ Image ${generationId} completed!`)
        return {
          id: generationId,
          imageUrl: data.assets?.image,
        }
      }
      
      if (data.state === 'failed') {
        throw new Error(`Image generation failed: ${data.failure_reason || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error(`Error polling image ${generationId}:`, error)
      
      if (attempt === maxAttempts - 1) {
        throw new Error(`Image generation timeout after ${maxAttempts * 5} seconds`)
      }
    }
  }
  
  throw new Error('Image generation timeout')
}

/**
 * Estimate video generation time
 */
export function estimateGenerationTime(duration: number): number {
  // Ray 2 - ~30-60 seconds per segment
  const secondsPerSegment = 45
  const segmentCount = Math.ceil(duration / 5)
  return segmentCount * secondsPerSegment
}

/**
 * Estimate cost for video generation
 */
export function estimateVideoCost(duration: number): number {
  const costPerSegment = 0.30 // Ray 2 pricing
  const segmentCount = Math.ceil(duration / 5)
  return segmentCount * costPerSegment
}
