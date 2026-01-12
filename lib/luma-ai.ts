/**
 * Luma AI Integration
 * High-quality image generation using Photon model
 * 
 * Get API key from: https://lumalabs.ai/
 * Set: LUMA_API_KEY in environment
 */

const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1'

interface LumaImageGeneration {
  id: string
  state: 'pending' | 'processing' | 'completed' | 'failed'
  assets?: {
    image?: string
  }
}

/**
 * Generate an image with Luma Photon
 */
export async function generateLumaImage(
  prompt: string,
  options: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
    model?: 'photon-1' | 'photon-flash-1'
  } = {}
): Promise<string> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) {
    throw new Error('LUMA_API_KEY not configured')
  }

  const { aspectRatio = '16:9', model = 'photon-1' } = options

  console.log(`[Luma] Generating image: "${prompt.substring(0, 50)}..."`)

  // Start generation
  const createRes = await fetch(`${LUMA_API_BASE}/generations/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio,
      model,
    }),
  })

  if (!createRes.ok) {
    const error = await createRes.text()
    throw new Error(`Luma API error: ${error}`)
  }

  const generation: LumaImageGeneration = await createRes.json()
  console.log(`[Luma] Generation started: ${generation.id}`)

  // Poll for completion
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const statusRes = await fetch(`${LUMA_API_BASE}/generations/${generation.id}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!statusRes.ok) continue

    const status: LumaImageGeneration = await statusRes.json()

    if (status.state === 'completed' && status.assets?.image) {
      console.log(`[Luma] Image generated successfully`)
      return status.assets.image
    }

    if (status.state === 'failed') {
      throw new Error('Luma generation failed')
    }

    console.log(`[Luma] Status: ${status.state} (attempt ${i + 1})`)
  }

  throw new Error('Luma generation timed out')
}

/**
 * Generate a video with Luma Ray
 */
export async function generateLumaVideo(
  prompt: string,
  options: {
    aspectRatio?: '16:9' | '9:16' | '1:1'
    model?: 'ray-2' | 'ray-flash-2'
    duration?: '5s' | '9s'
    loop?: boolean
  } = {}
): Promise<string> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) {
    throw new Error('LUMA_API_KEY not configured')
  }

  const { 
    aspectRatio = '16:9', 
    model = 'ray-2',
    duration = '5s',
    loop = false 
  } = options

  console.log(`[Luma] Generating video: "${prompt.substring(0, 50)}..."`)

  const createRes = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio,
      model,
      duration,
      loop,
    }),
  })

  if (!createRes.ok) {
    const error = await createRes.text()
    throw new Error(`Luma API error: ${error}`)
  }

  const generation = await createRes.json()
  console.log(`[Luma] Video generation started: ${generation.id}`)

  // Poll for completion (videos take longer)
  const maxAttempts = 120
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000))

    const statusRes = await fetch(`${LUMA_API_BASE}/generations/${generation.id}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!statusRes.ok) continue

    const status = await statusRes.json()

    if (status.state === 'completed' && status.assets?.video) {
      console.log(`[Luma] Video generated successfully`)
      return status.assets.video
    }

    if (status.state === 'failed') {
      throw new Error('Luma video generation failed')
    }
  }

  throw new Error('Luma video generation timed out')
}
