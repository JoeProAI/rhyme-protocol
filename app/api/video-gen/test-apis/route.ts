import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/video-gen/test-apis
 * Test each API individually to verify they work
 */
export async function POST(req: NextRequest) {
  const results: Record<string, any> = {}
  
  // Test 1: OpenAI API
  try {
    console.log('Testing OpenAI API...')
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })
    
    if (openaiResponse.ok) {
      results.openai = { status: 'success', message: 'OpenAI API key is valid' }
    } else {
      const error = await openaiResponse.text()
      results.openai = { status: 'error', message: error }
    }
  } catch (error) {
    results.openai = { status: 'error', message: String(error) }
  }
  
  // Test 2: Gemini API
  try {
    console.log('Testing Gemini API...')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    )
    
    if (geminiResponse.ok) {
      results.gemini = { status: 'success', message: 'Gemini API key is valid' }
    } else {
      const error = await geminiResponse.text()
      results.gemini = { status: 'error', message: error }
    }
  } catch (error) {
    results.gemini = { status: 'error', message: String(error) }
  }
  
  // Test 3: Luma AI API
  try {
    console.log('Testing Luma AI API...')
    const lumaResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.LUMAAI_API_KEY}`,
      },
    })
    
    if (lumaResponse.ok || lumaResponse.status === 200) {
      results.luma = { 
        status: 'success', 
        message: 'Luma AI API key is valid'
      }
    } else {
      const error = await lumaResponse.text()
      results.luma = { status: 'error', message: error }
    }
  } catch (error) {
    results.luma = { status: 'error', message: String(error) }
  }
  
  const allSuccess = Object.values(results).every((r: any) => r.status === 'success')
  
  return NextResponse.json({
    success: allSuccess,
    results,
    message: allSuccess 
      ? '✅ All APIs are working!' 
      : '❌ Some APIs failed - check results for details'
  })
}

// Also support GET for easy browser testing
export async function GET(req: NextRequest) {
  return POST(req)
}
