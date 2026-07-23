import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { loadJob, retakeShot, publicJob } from '@/lib/clipchain/engine'
import { checkUsage, trackUsage, getPaymentInfo } from '@/lib/usage-system'
import { getBalanceCents } from '@/lib/clipchain/credits'
import { rateForResolution } from '@/lib/clipchain/pricing'

export const runtime = 'nodejs'
// May regenerate a master frame and re-derive a seed frame before submitting.
export const maxDuration = 300

const BodySchema = z.object({
  // 1-based shot number as shown on the board.
  shot: z.number().int().min(1).max(25),
  mode: z.enum(['keep', 'rechain']),
  prompt: z.string().min(20).max(1200).optional(),
  camera: z.string().max(300).optional(),
})

/**
 * POST /api/clipchain/retake/[jobId]
 * The editing room: reshoot one shot of a completed film. Card sessions are
 * billed per retaken shot on redelivery; free sessions spend a daily clip
 * allowance per retake so the reshoot loop can't become a free farm.
 */
export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }

    const job = await loadJob(params.jobId)
    if (!job) return NextResponse.json({ error: 'Unknown or expired job' }, { status: 404 })

    const sessionId = cookies().get('anon_session')?.value
    if (job.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Not your film' }, { status: 403 })
    }
    if (job.status !== 'complete') {
      return NextResponse.json(
        { error: `Film is ${job.status} — retakes need a finished cut` },
        { status: 409 }
      )
    }

    // Prepaid first: retakes deduct from the balance on redelivery. Legacy
    // card sessions bill as before. Neither → a daily clip allowance per
    // retake so the reshoot loop can't become a free farm.
    const retakeShots =
      parsed.data.mode === 'rechain' ? job.plan.shots.length - (parsed.data.shot - 1) : 1
    const priceCents = retakeShots * job.secondsPerShot * rateForResolution(job.resolution)
    const payment = await getPaymentInfo(job.sessionId)
    const balance = await getBalanceCents(job.sessionId)
    let requiresPayment = false
    if (balance >= priceCents || payment.has_payment) {
      requiresPayment = true
    } else {
      const usage = await checkUsage(job.sessionId, 'clip_generations')
      if (!usage.allowed) {
        return NextResponse.json(
          {
            error: 'limit',
            message: `This retake is $${(priceCents / 100).toFixed(2)} flat — top up credits, or ${usage.reason ?? 'come back tomorrow for your free clip.'}`,
            shareType: 'clip_generations',
          },
          { status: 402 }
        )
      }
      await trackUsage(job.sessionId, 'clip_generations', 1)
    }

    const after = await retakeShot(
      job,
      parsed.data.shot - 1,
      parsed.data.mode,
      parsed.data.prompt,
      parsed.data.camera,
      requiresPayment
    )
    return NextResponse.json(publicJob(after))
  } catch (error) {
    console.error('[clipchain] retake failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message.slice(0, 200) : 'Retake failed' },
      { status: 500 }
    )
  }
}
