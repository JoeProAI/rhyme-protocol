import { NextRequest, NextResponse } from 'next/server'
import { estimateElevenLabsCost, recordApiUsage } from '@/lib/api-usage'

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

    let enhancedPrompt = prompt
    if (genre) enhancedPrompt = `${genre} style: ${enhancedPrompt}`
    if (mood) enhancedPrompt = `${enhancedPrompt}, ${mood} mood`
    if (instrumental) {
      enhancedPrompt = `Instrumental beat only. Do not include singing, rapping, spoken words, chants, humming, vocal chops, backing vocals, ad-libs, DJ tags, shoutouts, hooks, lyrics, or sampled voices. If the description mentions lyrics or vocals, treat those words as mood only and generate music with zero human voice. ${enhancedPrompt}`
    }

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
          music_length_ms: clampedDuration * 1000,
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

    await recordApiUsage({
      feature: 'studio_music',
      provider: 'elevenlabs',
      model: 'music-compose',
      endpoint: '/api/studio/music',
      operation: 'music_compose',
      unit: 'seconds',
      quantity: clampedDuration,
      inputCharacters: enhancedPrompt.length,
      durationSeconds: clampedDuration,
      costUsd: estimateElevenLabsCost('music', clampedDuration),
      success: true,
      metadata: { genre, mood, instrumental },
    })

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
