import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { storyboard, storyboardFromTrack } from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
export const maxDuration = 120

const TrackSchema = z.object({
  durationSec: z.number().min(10).max(600),
  sections: z
    .array(
      z.object({
        label: z.string().max(40),
        start: z.number().min(0),
        end: z.number().min(0),
        lyrics: z.string().max(2000).optional(),
        energy: z.string().max(40).optional(),
        imagery: z.string().max(400).optional(),
      })
    )
    .min(1)
    .max(40),
})

const BodySchema = z.object({
  prompt: z.string().min(8, 'Describe your clip in at least a few words').max(600),
  style: z.string().max(400).optional(),
  shots: z.number().int().min(2).max(12).optional(),
  secondsPerShot: z.union([z.literal(5), z.literal(10), z.literal(15)]).optional(),
  // From /api/clipchain/analyze — when present, the board is drafted FROM
  // the song: one shot per timed window, count derived from track length.
  track: TrackSchema.optional(),
})

/**
 * POST /api/clipchain/plan
 * Draft an editable storyboard — the free stage of the pipeline board.
 * No job is created and nothing is generated; the client edits the plan
 * and submits it to /api/clipchain/start when ready to spend.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }
    const { prompt, style, shots = 3, secondsPerShot = 5, track } = parsed.data
    const plan = track
      ? await storyboardFromTrack(prompt, style, track, secondsPerShot)
      : await storyboard(prompt, style, shots, secondsPerShot)
    return NextResponse.json({ plan, secondsPerShot })
  } catch (error) {
    console.error('[clipchain] plan failed:', error)
    return NextResponse.json(
      { error: 'Storyboarding failed. Try again in a minute.' },
      { status: 500 }
    )
  }
}
