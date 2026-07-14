import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { loadJob, tickJob, publicJob } from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
// The heavy tick (shot download → frame extract → analyzers → next submit,
// or final concat + upload) needs real time. vercel.json grants 300s.
export const maxDuration = 300

/**
 * GET /api/clipchain/status/[jobId]
 * Reports job state AND advances it one step (client-driven state machine —
 * no fire-and-forget background work to lose on serverless).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const job = await loadJob(params.jobId)
  if (!job) {
    return NextResponse.json({ error: 'Unknown or expired job' }, { status: 404 })
  }

  // Only the session that started the job may drive/see it.
  const sessionId = cookies().get('anon_session')?.value
  if (job.sessionId !== sessionId) {
    return NextResponse.json({ error: 'Not your job' }, { status: 403 })
  }

  const advanced = await tickJob(job)
  return NextResponse.json(publicJob(advanced))
}
