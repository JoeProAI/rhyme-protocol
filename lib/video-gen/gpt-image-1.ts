/**
 * Start Frame Generation using Luma Photon
 * Uses Luma AI's Photon model for high-quality image generation
 */

/**
 * Generate the initial start frame using Luma Photon
 */
export async function generateStartFrame(
  prompt: string,
  style: string = 'cinematic'
): Promise<{ imageBase64: string; responseId?: string }> {
  
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) {
    throw new Error('LUMA_API_KEY not configured')
  }
  
  console.log('🎨 Generating start frame with Luma Photon...')
  
  const stylePrompts: Record<string, string> = {
    cinematic: 'cinematic lighting, movie quality, 35mm film aesthetic, depth of field',
    realistic: 'photorealistic, hyperrealistic, 8K resolution, professional photography',
    cartoon: 'cartoon style, vibrant colors, clean lines, animated movie quality',
    anime: 'anime style, Studio Ghibli inspired, detailed, beautiful',
    '3d': '3D render, Pixar style, high quality CGI, detailed textures',
  }
  
  const styleDesc = stylePrompts[style] || stylePrompts.cinematic
  const fullPrompt = `A high-quality video frame: ${prompt}. Style: ${styleDesc}. Detailed, vivid.`
  
  try {
    // Create image generation with Luma Photon
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        model: 'photon-1',
        aspect_ratio: '16:9',
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Luma Photon API error (${response.status}): ${error}`)
    }
    
    const data = await response.json()
    console.log('Luma Photon generation started:', data.id)
    
    // Poll for completion
    const imageUrl = await pollForImageCompletion(data.id, apiKey)
    
    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl)
    const arrayBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64')
    
    console.log('✓ Start frame generated with Luma Photon')
    
    return {
      imageBase64,
      responseId: data.id,
    }
  } catch (error) {
    console.error('Luma Photon error:', error)
    throw error
  }
}

/**
 * Poll Luma API until image is ready
 */
async function pollForImageCompletion(
  generationId: string,
  apiKey: string,
  maxAttempts: number = 30
): Promise<string> {
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second intervals
    
    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to check image status: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`Image ${generationId} state: ${data.state} (attempt ${attempt + 1}/${maxAttempts})`)
    
    if (data.state === 'completed') {
      const imageUrl = data.assets?.image
      if (!imageUrl) {
        throw new Error('Image completed but no URL found')
      }
      console.log('✓ Image completed:', imageUrl)
      return imageUrl
    }
    
    if (data.state === 'failed') {
      throw new Error(`Image generation failed: ${data.failure_reason || 'Unknown error'}`)
    }
  }
  
  throw new Error('Image generation timeout')
}

// Video frames generated with GPT-Image-1 + Luma Ray 3

/**
 * Helper function to estimate cost
 * Based on GPT-Image-1 pricing from docs
 */
export function estimateImageCost(
  quality: 'low' | 'medium' | 'high',
  size: 'square' | 'portrait' | 'landscape' = 'square'
): number {
  // Token counts from documentation
  const tokenCounts = {
    low: { square: 272, portrait: 408, landscape: 400 },
    medium: { square: 1056, portrait: 1584, landscape: 1568 },
    high: { square: 4160, portrait: 6240, landscape: 6208 },
  }
  
  const tokens = tokenCounts[quality][size]
  
  // Assuming image tokens cost similar to text tokens
  // Check OpenAI pricing page for exact rates
  const costPerImageToken = 0.000015 // $0.015 per 1K image tokens (example)
  
  return tokens * costPerImageToken
}
