import { NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

/**
 * Generate the main OG image for Rhyme Protocol
 * GET /api/generate-og
 */
export async function GET() {
  try {
    const prompt = `
A cinematic social hero image for "Rhyme Protocol" - an AI rap and hip-hop music video platform.

Design:
- Dark stage atmosphere with volumetric haze, laser light geometry, and dynamic motion streaks
- Strong rap/hip-hop visual language: street energy, cinematic framing, premium textures
- Futuristic AI motifs blended into music culture: waveform lattices, neural rhythm patterns, camera rigs
- Center composition with clear negative space for social crop safety
- Include text exactly: "RHYME PROTOCOL"
- Optional subline in smaller text: "AI MUSIC VIDEO GENERATOR"
- Color direction: obsidian black, electric cyan, and hot magenta accents

Style: Epic, modern, premium, high contrast, social-share-ready, 16:9, photorealistic digital artwork.
`

    console.log('[OG Gen] Generating premium OG image...')

    const openai = getOpenAIClient()
    const response = await openai.images.generate({
      model: 'gpt-image-2',
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
      message: 'Save this image as public/og-image.png and/or public/twitter-image.png'
    })

  } catch (error) {
    console.error('[OG Gen] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate' },
      { status: 500 }
    )
  }
}
