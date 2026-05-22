/**
 * POST /api/challenge/beat
 *
 * Generates a beat in the documented production palette of the challenge
 * artist. Uses ElevenLabs music compose. Free, rate-limited via the
 * existing audio_isolations bucket (cheap, capped).
 *
 * Body: { slug: string, vibe?: string, duration?: number }
 * Response: { audioUrl: string (data URI), prompt: string }
 *
 * Hard rules:
 *   1. Beats are INSTRUMENTAL ONLY, never vocals.
 *   2. We never reproduce the artist's actual production. The prompt is
 *      a documented-style descriptor written in our words.
 *   3. Duration capped at 60s to control cost.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getChallenge } from '@/lib/artist-challenges'
import { checkRateLimit, recordUsage, createRateLimitError, createRateLimitedResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const MAX_DURATION = 60
const MIN_DURATION = 15

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: 'Beat generation is temporarily unavailable.' },
      { status: 503 }
    )
  }

  const rl = await checkRateLimit(req, 'audio_isolations')
  if (!rl.success) {
    return createRateLimitError(rl)
  }

  try {
    const { slug, vibe, duration } = await req.json()

    if (!slug || typeof slug !== 'string') {
      return createRateLimitedResponse(
        { error: 'slug required' },
        rl.sessionId,
        400
      )
    }

    const challenge = getChallenge(slug)
    if (!challenge) {
      return createRateLimitedResponse(
        { error: 'Unknown challenge' },
        rl.sessionId,
        404
      )
    }

    if (!challenge.beat_prompt) {
      return createRateLimitedResponse(
        { error: 'Beat generation not configured for this artist yet.' },
        rl.sessionId,
        404
      )
    }

    const clampedDuration = Math.min(
      Math.max(typeof duration === 'number' ? duration : 30, MIN_DURATION),
      MAX_DURATION
    )

    let prompt = challenge.beat_prompt
    if (vibe && typeof vibe === 'string' && vibe.trim().length > 0) {
      prompt += ` Additional direction: ${vibe.trim().slice(0, 200)}.`
    }
    prompt += ' Instrumental only, no vocals, no DJ tags, no shoutouts.'

    const elRes = await fetch('https://api.elevenlabs.io/v1/music/compose', {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        prompt,
        music_length_ms: clampedDuration * 1000,
      }),
    })

    if (!elRes.ok) {
      const errText = await elRes.text().catch(() => '')
      console.error('[beat] elevenlabs error', elRes.status, errText.slice(0, 300))
      if (elRes.status === 403 || elRes.status === 404) {
        return createRateLimitedResponse(
          { error: 'Beat generation API access pending. Try again later.' },
          rl.sessionId,
          503
        )
      }
      return createRateLimitedResponse(
        { error: 'Beat generation failed. Try a shorter duration or different vibe.' },
        rl.sessionId,
        502
      )
    }

    const audioBuffer = await elRes.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    await recordUsage(rl.sessionId, 'audio_isolations', 1)

    return createRateLimitedResponse(
      {
        audioUrl,
        duration: clampedDuration,
        prompt,
        artist: challenge.artist_name,
        slug: challenge.slug,
      },
      rl.sessionId,
      200
    )
  } catch (err: any) {
    console.error('[beat] unexpected error', err)
    return createRateLimitedResponse(
      { error: err?.message || 'Beat generation failed.' },
      rl.sessionId,
      500
    )
  }
}
