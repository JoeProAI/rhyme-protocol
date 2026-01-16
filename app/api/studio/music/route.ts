import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: 'ElevenLabs not configured' },
      { status: 500 }
    )
  }

  try {
    const { 
      prompt, 
      duration_seconds = 30, 
      instrumental = true,
      genre,
      mood 
    } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Music prompt required' },
        { status: 400 }
      )
    }

    // Build enhanced prompt
    let enhancedPrompt = prompt
    if (genre) enhancedPrompt = `${genre} style: ${enhancedPrompt}`
    if (mood) enhancedPrompt = `${enhancedPrompt}, ${mood} mood`
    if (instrumental) enhancedPrompt = `${enhancedPrompt} [instrumental only, no vocals]`

    // Clamp duration between 10s and 300s (5 min)
    const clampedDuration = Math.min(Math.max(duration_seconds, 10), 300)
    
    console.log('Music API request:', { prompt: enhancedPrompt, duration: clampedDuration })
    
    const response = await fetch(
      'https://api.elevenlabs.io/v1/music/compose',
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          duration: clampedDuration,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs Music error:', errorText)
      
      // Check if music API is not available yet
      if (response.status === 404 || response.status === 403) {
        return NextResponse.json(
          { error: 'Music generation coming soon - API access pending' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Music generation failed' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    return NextResponse.json({ 
      audioUrl,
      duration: duration_seconds,
      prompt: enhancedPrompt
    })
  } catch (error: any) {
    console.error('Music API error:', error)
    return NextResponse.json(
      { error: error.message || 'Music generation failed' },
      { status: 500 }
    )
  }
}
