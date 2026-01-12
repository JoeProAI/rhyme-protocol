/**
 * Rate Limiting Middleware
 * Protects AI endpoints from abuse
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkUsage, trackUsage, generateSessionId, UsageType } from './usage-system'

interface RateLimitResult {
  success: boolean
  sessionId: string
  remaining?: number
  limit?: number
  error?: string
  upgradeUrl?: string
}

/**
 * Check rate limit and get/create session
 */
export async function checkRateLimit(
  req: NextRequest,
  usageType: UsageType
): Promise<RateLimitResult> {
  // Get or create session ID
  const cookieStore = cookies()
  let sessionId = cookieStore.get('anon_session')?.value
  
  if (!sessionId) {
    sessionId = generateSessionId()
  }
  
  // Check usage limits
  const usage = await checkUsage(sessionId, usageType)
  
  if (!usage.allowed) {
    return {
      success: false,
      sessionId,
      remaining: 0,
      limit: usage.limit,
      error: usage.reason,
      upgradeUrl: usage.upgrade_url,
    }
  }
  
  return {
    success: true,
    sessionId,
    remaining: usage.remaining,
    limit: usage.limit,
  }
}

/**
 * Create rate-limited response with session cookie
 */
export function createRateLimitedResponse(
  data: any,
  sessionId: string,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // Set session cookie if not exists (1 year expiry)
  response.cookies.set('anon_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/',
  })
  
  return response
}

/**
 * Create error response for rate limit exceeded
 */
export function createRateLimitError(result: RateLimitResult): NextResponse {
  return createRateLimitedResponse(
    {
      error: result.error || 'Rate limit exceeded',
      limit: result.limit,
      remaining: 0,
      upgrade_url: result.upgradeUrl || '/dashboard',
      message: 'Add a payment method to continue using this feature.',
    },
    result.sessionId,
    429
  )
}

/**
 * Track usage after successful API call
 */
export async function recordUsage(sessionId: string, usageType: UsageType, quantity: number = 1): Promise<void> {
  await trackUsage(sessionId, usageType, quantity)
}

/**
 * Helper to wrap an API handler with rate limiting
 */
export function withRateLimit(usageType: UsageType) {
  return async function rateLimit(req: NextRequest): Promise<RateLimitResult> {
    return checkRateLimit(req, usageType)
  }
}
