import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { loadJob, resumeJob, publicJob } from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
// May need to re-derive a seed frame from storage before resubmitting.
export const maxDuration = 300

/**
 * POST /api/clipchain/resume/[jobId]
 * Restart a failed job from its last completed shot. Free — completed shots
 * are never regenerated and the daily allowance is not re-counted.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const job = await loadJob(params.jobId)
  if (!job) {
    return NextResponse.json({ error: 'Unknown or expired job' }, { status: 404 })
  }

  const sessionId = cookies().get('anon_session')?.value
  if (job.sessionId !== sessionId) {
    return NextResponse.json({ error: 'Not your job' }, { status: 403 })
  }

  if (job.status !== 'failed') {
    return NextResponse.json(
      { error: `Job is ${job.status} — only failed jobs can be resumed` },
      { status: 409 }
    )
  }

  try {
    const resumed = await resumeJob(job)
    return NextResponse.json(publicJob(resumed))
  } catch (error) {
    console.error('[clipchain] resume failed:', error)
    return NextResponse.json(
      { error: 'Resume failed. Completed shots are still saved — try again in a minute.' },
      { status: 500 }
    )
  }
}
