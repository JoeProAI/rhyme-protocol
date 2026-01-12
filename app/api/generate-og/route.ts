import { NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

/**
 * Generate the main OG image for JoePro.ai
 * GET /api/generate-og
 */
export async function GET() {
  try {
    const prompt = `
A premium, professional hero image for "JoePro.ai" - an AI development platform.

Design:
- Clean, modern gradient background (deep navy blue #0a1628 to rich purple #1a0a28)
- Elegant gold accent color (#d4a017) for highlights
- The text "JoePro.ai" prominently displayed in bold white modern font
- Subtle glowing AI-themed elements: neural network nodes, code brackets, rocket icon
- Professional tech company aesthetic like Vercel, Linear, or Stripe
- Minimalist, not cluttered
- Tagline below logo: "Build Smarter with AI"

NOT cyberpunk. NOT neon chaos. Clean, premium, trustworthy.
Style: Modern SaaS landing page hero image, 16:9 aspect ratio, high contrast, professional.
`

    console.log('[OG Gen] Generating premium OG image...')

    const openai = getOpenAIClient()
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high',
      response_format: 'b64_json',
    })

    const imageBase64 = response.data?.[0]?.b64_json

    if (!imageBase64) {
      throw new Error('No image generated')
    }

    // Return the base64 image
    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${imageBase64}`,
      message: 'Save this image as public/og-image.png'
    })

  } catch (error) {
    console.error('[OG Gen] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate' },
      { status: 500 }
    )
  }
}
