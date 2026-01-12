import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUsageData, FREE_LIMITS, USER_PRICING, generateSessionId, isStorageConfigured } from '@/lib/usage-system'

/**
 * GET /api/usage/me
 * Get current anonymous user's usage data
 */
export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  let sessionId = cookieStore.get('anon_session')?.value
  const isNewSession = !sessionId
  
  // Create session if none exists
  if (!sessionId) {
    sessionId = generateSessionId()
  }
  
  const usageData = await getUsageData(sessionId)
  
  // Build response compatible with dashboard
  const response = NextResponse.json({
    sessionId: sessionId.substring(0, 20) + '...', // Partial ID for privacy
    usage: {
      ...usageData.daily,
      totalCost: usageData.monthly.total_cost,
      hasCard: usageData.has_payment,
      freeUsesLeft: Object.entries(usageData.daily).reduce((acc, [key, val]) => {
        return acc + val.remaining
      }, 0),
    },
    breakdown: {
      builds: {
        quantity: usageData.daily.video_generations?.used || 0,
        unitPrice: USER_PRICING.video_segment,
        total: (usageData.daily.video_generations?.used || 0) * USER_PRICING.video_segment,
      },
      sandboxes: {
        quantity: usageData.daily.sandbox_hours?.used || 0,
        unitPrice: USER_PRICING.sandbox_hour,
        total: (usageData.daily.sandbox_hours?.used || 0) * USER_PRICING.sandbox_hour,
      },
      runtime: {
        quantity: usageData.daily.sandbox_hours?.used || 0,
        unitPrice: USER_PRICING.sandbox_hour,
        total: (usageData.daily.sandbox_hours?.used || 0) * USER_PRICING.sandbox_hour,
      },
      api: {
        quantity: usageData.daily.chat_messages?.used || 0,
        unitPrice: USER_PRICING.chat_message,
        total: (usageData.daily.chat_messages?.used || 0) * USER_PRICING.chat_message,
      },
    },
    daily: usageData.daily,
    monthly: usageData.monthly,
    limits: FREE_LIMITS,
    pricing: USER_PRICING,
    month: new Date().toISOString().slice(0, 7),
    storage_configured: isStorageConfigured(),
  })
  
  // Set cookie for new sessions
  if (isNewSession) {
    response.cookies.set('anon_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    })
  }
  
  return response
}
