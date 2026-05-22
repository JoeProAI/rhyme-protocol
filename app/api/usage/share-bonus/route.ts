import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { awardShareBonus, generateSessionId, UsageType } from '@/lib/usage-system'

/**
 * POST /api/usage/share-bonus
 * Awards a +N bonus to the user's daily limit after a verified share.
 *
 * Body: { type: UsageType, source?: 'x' | 'tiktok' | 'manual' }
 *
 * In a stricter setup we'd verify the share via OAuth or a referral cookie.
 * For now we trust the click-through pattern (X intent URL -> return -> POST).
 */
export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  let sessionId = cookieStore.get('anon_session')?.value
  const isNewSession = !sessionId
  if (!sessionId) {
    sessionId = generateSessionId()
  }

  let body: { type?: UsageType; source?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.type) {
    return NextResponse.json({ success: false, error: 'type is required' }, { status: 400 })
  }

  const result = await awardShareBonus(sessionId, body.type)

  const res = NextResponse.json(result, { status: result.success ? 200 : 400 })
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
}
