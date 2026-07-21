import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { analyzeTrack } from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
// Downloads the track and sends it to the audio model — needs real time.
export const maxDuration = 300

const BodySchema = z.object({
  audioPath: z.string().max(300),
})

/**
 * POST /api/clipchain/analyze
 * Listen to an uploaded track and return its timed structure map — free.
 * The map drives storyboarding so the film comes FROM the song.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: 'audioPath required' }, { status: 400 })
    }
    const sessionId = cookies().get('anon_session')?.value
    if (!sessionId || !parsed.data.audioPath.startsWith(`clipchain/uploads/${sessionId}/`)) {
      return NextResponse.json({ error: 'Audio not found for this session' }, { status: 403 })
    }
    const track = await analyzeTrack(parsed.data.audioPath)
    return NextResponse.json({ track })
  } catch (error) {
    console.error('[clipchain] analyze failed:', error)
    return NextResponse.json(
      { error: 'Could not analyze the track. Try again in a minute.' },
      { status: 500 }
    )
  }
}
