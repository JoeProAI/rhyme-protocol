import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { canUse, getUsage } from '@/lib/usage-tracker'

/**
 * GET /api/usage/can-use
 * Check if anonymous user can perform an action
 */
export async function GET(req: NextRequest) {
  const sessionId = cookies().get('anon_session')?.value
  
  if (!sessionId) {
    return NextResponse.json(
      {
        allowed: true, // First-time users can always try
        reason: 'New session',
      },
      { status: 200 }
    )
  }
  
  const check = canUse(sessionId)
  const usage = getUsage(sessionId)
  
  return NextResponse.json({
    ...check,
    freeUsesLeft: usage.freeUsesLeft,
    hasCard: usage.hasCard,
    totalCost: usage.totalCost,
  })
}
