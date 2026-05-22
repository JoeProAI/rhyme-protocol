/**
 * POST /api/audio/isolate
 *
 * Free voice isolation for artists. Strips background noise / beats / room tone
 * and returns a clean acapella using ElevenLabs Audio Isolation.
 *
 * Body: multipart/form-data with field `audio` (the upload).
 * Response: audio/mpeg (the isolated track).
 *
 * Rate-limited to FREE_LIMITS.audio_isolations per session per day.
 * Max upload: 25MB. Supported formats: anything ffmpeg/ElevenLabs accepts
 * (mp3, wav, m4a, aac, flac, ogg, webm).
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, recordUsage, createRateLimitError, createRateLimitedResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const MAX_BYTES = 25 * 1024 * 1024 // 25MB

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: 'Voice isolation is temporarily unavailable.' },
      { status: 503 }
    )
  }

  // Rate limit
  const rl = await checkRateLimit(req, 'audio_isolations')
  if (!rl.success) {
    return createRateLimitError(rl)
  }

  try {
    const inForm = await req.formData()
    const file = inForm.get('audio') as File | null

    if (!file) {
      return createRateLimitedResponse(
        { error: 'No audio file provided. Use field name "audio".' },
        rl.sessionId,
        400
      )
    }

    if (file.size > MAX_BYTES) {
      return createRateLimitedResponse(
        { error: `File too large. Max ${MAX_BYTES / 1024 / 1024}MB.` },
        rl.sessionId,
        413
      )
    }

    // Forward to ElevenLabs Audio Isolation
    const elForm = new FormData()
    elForm.append('audio', file, file.name || 'upload')

    const elRes = await fetch('https://api.elevenlabs.io/v1/audio-isolation', {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      body: elForm,
    })

    if (!elRes.ok) {
      const errText = await elRes.text().catch(() => '')
      console.error('[audio-isolate] elevenlabs error', elRes.status, errText.slice(0, 300))
      return createRateLimitedResponse(
        { error: 'Isolation failed. Try a different file or shorter clip.' },
        rl.sessionId,
        502
      )
    }

    const cleaned = await elRes.arrayBuffer()

    // Track usage AFTER success
    await recordUsage(rl.sessionId, 'audio_isolations', 1)

    // Stream the isolated audio back. Set the session cookie via headers.
    const res = new NextResponse(cleaned, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="isolated-${Date.now()}.mp3"`,
        'Cache-Control': 'no-store',
      },
    })
    res.cookies.set('anon_session', rl.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (err: any) {
    console.error('[audio-isolate] unexpected error', err)
    return createRateLimitedResponse(
      { error: err?.message || 'Isolation failed.' },
      rl.sessionId,
      500
    )
  }
}
