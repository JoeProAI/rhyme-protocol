import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/video-gen/generations
 * List recent Luma AI generations
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.LUMA_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'LUMA_API_KEY not configured' },
      { status: 500 }
    )
  }
  
  const { searchParams } = new URL(req.url)
  const limit = searchParams.get('limit') || '10'
  const offset = searchParams.get('offset') || '0'
  
  try {
    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Luma API error: ${error}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      generations: data,
    })
    
  } catch (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video-gen/generations/[id]
 * Get a specific generation by ID
 */
