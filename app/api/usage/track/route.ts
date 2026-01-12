import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { trackUsage } from '@/lib/usage-tracker'

/**
 * POST /api/usage/track
 * Track usage event for anonymous user
 */
export async function POST(req: NextRequest) {
  const sessionId = cookies().get('anon_session')?.value
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'No session found' },
      { status: 400 }
    )
  }
  
  const body = await req.json()
  const { action, quantity = 1 } = body
  
  if (!['build', 'sandbox', 'api', 'hour'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be: build, sandbox, api, or hour' },
      { status: 400 }
    )
  }
  
  const usage = trackUsage(sessionId, action, quantity)
  
  return NextResponse.json({
    success: true,
    action,
    quantity,
    usage,
  })
}
