import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { loadJob, saveJob, foleyShot, publicJob, registerActive } from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
export const maxDuration = 300

const BodySchema = z.object({
  shots: z
    .array(
      z.object({
        shot: z.number().int().min(1).max(25),
        prompt: z.string().min(4).max(300),
      })
    )
    .min(1)
    .max(25),
})

/**
 * POST /api/clipchain/foley/[jobId]
 * The sound-design pass: generated ambience laid into existing shots,
 * video untouched, then the cut reassembles under the same link.
 */
export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: 'shots[{shot, prompt}] required' }, { status: 400 })
    }
    const job = await loadJob(params.jobId)
    if (!job) return NextResponse.json({ error: 'Unknown or expired job' }, { status: 404 })
    const sessionId = cookies().get('anon_session')?.value
    if (job.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Not your film' }, { status: 403 })
    }
    if (job.status !== 'complete') {
      return NextResponse.json(
        { error: `Film is ${job.status} — the foley pass needs a finished cut` },
        { status: 409 }
      )
    }

    for (const s of parsed.data.shots) {
      await foleyShot(job, s.shot - 1, s.prompt)
    }

    job.status = 'assembling'
    job.message = `Foley laid into ${parsed.data.shots.length} shot${parsed.data.shots.length === 1 ? '' : 's'} — reassembling final cut…`
    await saveJob(job)
    await registerActive(job.id).catch(() => {})
    return NextResponse.json(publicJob(job))
  } catch (error) {
    console.error('[clipchain] foley failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message.slice(0, 200) : 'Foley pass failed' },
      { status: 500 }
    )
  }
}
