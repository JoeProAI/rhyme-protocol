import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { listClips } from '@/lib/clipchain/library'

export const runtime = 'nodejs'

/**
 * GET /api/clipchain/library
 * Everything this session has made — durable, no expiry.
 */
export async function GET() {
  const sessionId = cookies().get('anon_session')?.value
  if (!sessionId) return NextResponse.json({ clips: [] })
  const clips = await listClips(sessionId)
  return NextResponse.json({ clips })
}
