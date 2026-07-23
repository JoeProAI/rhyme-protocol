import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  loadJob,
  tickJob,
  publicJob,
  listActive,
  registerActive,
  unregisterActive,
} from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

/**
 * GET /api/clipchain/cron  (Vercel cron, every minute)
 * Server-driven ticking: advance every active job so films finish even if
 * the owner's browser dies mid-generation. Client polls remain a bonus.
 */
export async function GET() {
  const ids = await listActive()
  const results: Record<string, string> = {}
  for (const id of ids) {
    try {
      const job = await loadJob(id)
      if (!job || job.status === 'complete' || job.status === 'failed') {
        await unregisterActive(id)
        results[id] = job ? job.status : 'expired'
        continue
      }
      const after = await tickJob(job)
      results[id] = `${after.status}: ${after.message}`
    } catch (err) {
      results[id] = `tick error: ${err instanceof Error ? err.message : String(err)}`
    }
  }
  return NextResponse.json({ ticked: ids.length, results })
}

const KickSchema = z.object({ jobId: z.string().min(8).max(80) })

/**
 * POST /api/clipchain/cron  { jobId }
 * Adopt-and-tick: re-attach an in-flight job that lost its owner (closed
 * browser, cleared cookies) to the cron index and advance it once. Knowing
 * the jobId is the capability, same trust model as the tokened video URL.
 */
export async function POST(req: NextRequest) {
  const parsed = KickSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 })
  }
  const job = await loadJob(parsed.data.jobId)
  if (!job) {
    return NextResponse.json({ error: 'Unknown or expired job' }, { status: 404 })
  }
  if (job.status === 'generating' || job.status === 'assembling') {
    await registerActive(job.id).catch(() => {})
    const after = await tickJob(job)
    return NextResponse.json(publicJob(after))
  }
  return NextResponse.json(publicJob(job))
}
