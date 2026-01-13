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
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = await req.json()

    if (!text || text.length > 5000) {
      return NextResponse.json(
        { error: 'Text required (max 5000 chars)' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs error:', error)
      return NextResponse.json(
        { error: 'Voice generation failed' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    return NextResponse.json({ audioUrl })
  } catch (error: any) {
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: error.message || 'Voice generation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ voices: [] })
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ voices: [] })
    }

    const data = await response.json()
    const voices = data.voices?.map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
      labels: v.labels,
    })) || []

    return NextResponse.json({ voices })
  } catch (error) {
    return NextResponse.json({ voices: [] })
  }
}
