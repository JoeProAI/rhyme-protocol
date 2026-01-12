import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/video-gen/generations/[id]
 * Get a specific Luma AI generation by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.LUMA_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'LUMA_API_KEY not configured' },
      { status: 500 }
    )
  }
  
  const { id } = params
  
  if (!id) {
    return NextResponse.json(
      { error: 'Generation ID required' },
      { status: 400 }
    )
  }
  
  try {
    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${id}`,
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
      generation: data,
    })
    
  } catch (error) {
    console.error('Error fetching generation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/video-gen/generations/[id]
 * Delete a specific generation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.LUMA_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'LUMA_API_KEY not configured' },
      { status: 500 }
    )
  }
  
  const { id } = params
  
  try {
    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${id}`,
      {
        method: 'DELETE',
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
    
    return NextResponse.json({
      success: true,
      message: `Generation ${id} deleted`,
    })
    
  } catch (error) {
    console.error('Error deleting generation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
