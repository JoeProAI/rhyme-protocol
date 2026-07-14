import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { checkUsage, trackUsage, generateSessionId } from '@/lib/usage-system'
import { storyboard, startJob, saveJob, publicJob, type ClipJob } from '@/lib/clipchain/engine'

export const runtime = 'nodejs'
export const maxDuration = 60 // storyboard + first shot submit

const BodySchema = z.object({
  prompt: z.string().min(8, 'Describe your clip in at least a few words').max(600),
  style: z.string().max(400).optional(),
})

const SHOTS = 3
const SECONDS_PER_SHOT = 5
const RESOLUTION = '720p'

/**
 * POST /api/clipchain/start
 * Gate → storyboard → submit shot 1 → return jobId for polling.
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
    const { prompt, style } = parsed.data

    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    const isNewSession = !sessionId
    if (!sessionId) sessionId = generateSessionId()

    // The paygate: 1 free clip/day, share-to-X earns more, card = unlimited.
    const gate = await checkUsage(sessionId, 'clip_generations')
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: 'limit',
          message: gate.reason ?? 'Daily clip limit reached.',
          upgrade_url: gate.upgrade_url ?? '/add-card',
          shareType: 'clip_generations',
        },
        { status: 402 }
      )
    }

    const plan = await storyboard(prompt, style, SHOTS, SECONDS_PER_SHOT)

    const job: ClipJob = {
      id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      sessionId,
      createdAt: Date.now(),
      status: 'generating',
      message: 'Storyboard locked — starting shot 1…',
      prompt,
      style,
      plan,
      shots: [],
      current: 0,
      secondsPerShot: SECONDS_PER_SHOT,
      resolution: RESOLUTION,
      totalCost: 0,
    }

    await startJob(job)
    await saveJob(job)

    // Count it at start — the expensive spend begins with shot 1.
    await trackUsage(sessionId, 'clip_generations', 1)

    const res = NextResponse.json(publicJob(job))
    if (isNewSession) {
      res.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      })
    }
    return res
  } catch (error) {
    console.error('[clipchain] start failed:', error)
    return NextResponse.json(
      { error: 'Failed to start clip generation. Try again in a minute.' },
      { status: 500 }
    )
  }
}
