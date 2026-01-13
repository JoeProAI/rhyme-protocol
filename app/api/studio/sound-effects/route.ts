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
    const { text, duration_seconds, prompt_influence } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text description required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      'https://api.elevenlabs.io/v1/sound-generation',
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          duration_seconds: duration_seconds || undefined,
          prompt_influence: prompt_influence || 0.3,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs SFX error:', error)
      return NextResponse.json(
        { error: 'Sound effect generation failed' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    return NextResponse.json({ 
      audioUrl,
      duration: duration_seconds || 'auto'
    })
  } catch (error: any) {
    console.error('Sound effects API error:', error)
    return NextResponse.json(
      { error: error.message || 'Sound effect generation failed' },
      { status: 500 }
    )
  }
}
