/**
 * Gamma AI Integration
 * Generate presentations, documents, and websites
 * 
 * Get API key from: https://gamma.app/settings (Pro+ plan required)
 * Set: GAMMA_API_KEY in environment
 * 
 * Docs: https://developers.gamma.app/docs
 */

const GAMMA_API_BASE = 'https://api.gamma.app/v1'

interface GammaGenerateRequest {
  topic: string
  audience?: string
  tone?: 'professional' | 'casual' | 'academic' | 'creative'
  format?: 'presentation' | 'document' | 'webpage' | 'social'
  numCards?: number
  language?: string
  themeId?: string
  imageOptions?: {
    model?: 'basic' | 'advanced' | 'premium' | 'ultra'
    style?: string
  }
}

interface GammaGeneration {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  creditsUsed?: number
  url?: string
  pdfUrl?: string
  pptxUrl?: string
}

/**
 * Generate content with Gamma
 */
export async function generateGammaContent(
  request: GammaGenerateRequest
): Promise<GammaGeneration> {
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) {
    throw new Error('GAMMA_API_KEY not configured. Get from https://gamma.app/settings')
  }

  console.log(`[Gamma] Generating ${request.format || 'presentation'}: "${request.topic}"`)

  const createRes = await fetch(`${GAMMA_API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: request.topic,
      audience: request.audience || 'general audience',
      tone: request.tone || 'professional',
      format: request.format || 'presentation',
      numCards: request.numCards || 10,
      textOptions: {
        language: request.language || 'en',
      },
      imageOptions: {
        model: request.imageOptions?.model || 'advanced',
        style: request.imageOptions?.style,
      },
      themeId: request.themeId,
    }),
  })

  if (!createRes.ok) {
    const error = await createRes.text()
    throw new Error(`Gamma API error: ${error}`)
  }

  const generation: GammaGeneration = await createRes.json()
  console.log(`[Gamma] Generation started: ${generation.id}`)

  // Poll for completion
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000))

    const statusRes = await fetch(`${GAMMA_API_BASE}/generate/${generation.id}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!statusRes.ok) continue

    const status: GammaGeneration = await statusRes.json()

    if (status.status === 'completed') {
      console.log(`[Gamma] Content generated: ${status.url}`)
      return status
    }

    if (status.status === 'failed') {
      throw new Error('Gamma generation failed')
    }

    console.log(`[Gamma] Status: ${status.status} (attempt ${i + 1})`)
  }

  throw new Error('Gamma generation timed out')
}

/**
 * Get export URLs for a generation
 */
export async function getGammaExports(generationId: string): Promise<{
  url: string
  pdfUrl?: string
  pptxUrl?: string
}> {
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) {
    throw new Error('GAMMA_API_KEY not configured')
  }

  const res = await fetch(`${GAMMA_API_BASE}/generate/${generationId}/files`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to get export URLs')
  }

  return res.json()
}

/**
 * List available themes
 */
export async function listGammaThemes(): Promise<Array<{ id: string; name: string }>> {
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) {
    throw new Error('GAMMA_API_KEY not configured')
  }

  const res = await fetch(`${GAMMA_API_BASE}/themes`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to list themes')
  }

  return res.json()
}
