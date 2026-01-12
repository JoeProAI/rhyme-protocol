import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Extend timeout for image generation (default is 10s)
export const maxDuration = 60 // 60 seconds max
export const dynamic = 'force-dynamic'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Generate a blog header image using GPT-Image-1
 */
export async function POST(req: NextRequest) {
  try {
    // Check API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Blog Image] OPENAI_API_KEY not set')
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }
    
    const { prompt, style = 'tech' } = await req.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }
    
    const styleEnhancers: Record<string, string> = {
      tech: 'modern tech aesthetic, clean design, professional, dark gradient background with subtle accents',
      food: 'appetizing food photography, warm lighting, professional food styling',
      diagram: 'clean technical diagram, modern infographic style, minimal design',
      hero: 'cinematic, dramatic lighting, high contrast, professional',
    }
    
    const enhancer = styleEnhancers[style] || styleEnhancers.tech
    const fullPrompt = `${prompt}. Style: ${enhancer}. High quality, detailed, 16:9 aspect ratio.`
    
    console.log('[Blog Image] Generating:', fullPrompt.substring(0, 100))
    
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: fullPrompt,
      n: 1,
      size: '1536x1024',
      quality: 'high',
    })
    
    const imageUrl = response.data?.[0]?.url
    
    if (!imageUrl) {
      throw new Error('No image generated')
    }
    
    return NextResponse.json({
      success: true,
      image: imageUrl,
    })
    
  } catch (error: unknown) {
    const err = error as Error & { status?: number; code?: string }
    console.error('[Blog Image] Full error:', JSON.stringify({
      message: err.message,
      status: err.status,
      code: err.code,
      stack: err.stack?.substring(0, 500)
    }))
    return NextResponse.json(
      { 
        error: err.message || 'Image generation failed',
        code: err.code,
        details: err.status 
      },
      { status: 500 }
    )
  }
}
