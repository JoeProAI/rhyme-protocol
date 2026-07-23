import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getBalanceCents } from '@/lib/clipchain/credits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/credits — this session's prepaid balance. */
export async function GET() {
  const sessionId = cookies().get('anon_session')?.value
  if (!sessionId) return NextResponse.json({ balanceCents: 0 })
  return NextResponse.json({ balanceCents: await getBalanceCents(sessionId) })
}
