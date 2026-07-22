import { NextResponse } from 'next/server'
import { listVoices } from '@/lib/clipchain/voice'

export const runtime = 'nodejs'

/**
 * GET /api/clipchain/voices
 * The casting sheet — ElevenLabs voices available for characters.
 */
export async function GET() {
  try {
    const voices = await listVoices()
    return NextResponse.json({ voices })
  } catch (error) {
    console.error('[clipchain] voices failed:', error)
    return NextResponse.json({ voices: [], error: 'Voice list unavailable' }, { status: 200 })
  }
}
