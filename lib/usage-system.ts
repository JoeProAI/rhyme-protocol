/**
 * Unified Usage & Billing System
 * Tracks usage across all AI tools with persistent storage
 */

import { redisGet, redisSet, redisIncr, redisIncrBy, isRedisConfigured } from './redis'

// Free tier limits (per day for anonymous users)
export const FREE_LIMITS = {
  chat_messages: 20,      // Grok chat messages per day
  video_generations: 2,   // Video gen per day
  image_edits: 10,        // Nano Banana edits per day
  agent_calls: 10,        // Agent API calls per day
  sandbox_hours: 1,       // Sandbox runtime hours per day
  ai_assists: 20,         // Code AI assists per day
}

// Pricing (cost to you, for tracking)
export const COSTS = {
  chat_message: 0.002,    // ~$0.002 per Grok message
  video_segment: 0.35,    // ~$0.35 per video segment (Luma)
  image_edit: 0.01,       // ~$0.01 per image edit
  agent_call: 0.005,      // ~$0.005 per agent call
  sandbox_hour: 0.05,     // ~$0.05 per sandbox hour
  ai_assist: 0.003,       // ~$0.003 per AI assist
}

// Pricing for users (if they pay)
export const USER_PRICING = {
  chat_message: 0.01,     // $0.01 per message after free tier
  video_segment: 0.50,    // $0.50 per video segment
  image_edit: 0.02,       // $0.02 per image edit
  agent_call: 0.01,       // $0.01 per agent call
  sandbox_hour: 0.10,     // $0.10 per sandbox hour
  ai_assist: 0.01,        // $0.01 per AI assist
}

export type UsageType = 'chat_messages' | 'video_generations' | 'image_edits' | 'agent_calls' | 'sandbox_hours' | 'ai_assists'

interface UsageData {
  chat_messages: number
  video_generations: number
  image_edits: number
  agent_calls: number
  sandbox_hours: number
  ai_assists: number
  total_cost: number
  has_payment: boolean
  stripe_customer_id?: string
}

interface UsageCheck {
  allowed: boolean
  remaining: number
  limit: number
  used: number
  reason?: string
  upgrade_url?: string
}

/**
 * Get the Redis key for a user's daily usage
 */
function getDailyKey(sessionId: string, type: UsageType): string {
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `usage:${sessionId}:${date}:${type}`
}

/**
 * Get the Redis key for a user's monthly total
 */
function getMonthlyKey(sessionId: string): string {
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  return `usage:${sessionId}:${month}:total`
}

/**
 * Get the Redis key for user's payment status
 */
function getPaymentKey(sessionId: string): string {
  return `payment:${sessionId}`
}

/**
 * Check if user can perform an action
 */
export async function checkUsage(sessionId: string, type: UsageType): Promise<UsageCheck> {
  const dailyKey = getDailyKey(sessionId, type)
  const paymentKey = getPaymentKey(sessionId)
  
  const [used, paymentData] = await Promise.all([
    redisGet<number>(dailyKey) || 0,
    redisGet<{ has_payment: boolean; stripe_customer_id?: string }>(paymentKey),
  ])
  
  const currentUsed = used || 0
  const limit = FREE_LIMITS[type]
  const hasPayment = paymentData?.has_payment || false
  
  // Paying users have unlimited access
  if (hasPayment) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      used: currentUsed,
    }
  }
  
  // Check free tier limit
  if (currentUsed >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      used: currentUsed,
      reason: `Daily limit reached (${limit} free ${type.replace('_', ' ')} per day)`,
      upgrade_url: '/dashboard',
    }
  }
  
  return {
    allowed: true,
    remaining: limit - currentUsed,
    limit,
    used: currentUsed,
  }
}

/**
 * Track usage after an action is performed
 */
export async function trackUsage(sessionId: string, type: UsageType, quantity: number = 1): Promise<void> {
  const dailyKey = getDailyKey(sessionId, type)
  const monthlyKey = getMonthlyKey(sessionId)
  
  // Increment daily usage
  await redisIncrBy(dailyKey, quantity)
  
  // Set expiry for daily key (48 hours to be safe)
  await redisSet(dailyKey, (await redisGet<number>(dailyKey)) || quantity, 172800)
  
  // Track monthly cost
  const costKey = type.replace('_messages', '_message').replace('_generations', '_segment').replace('_edits', '_edit').replace('_calls', '_call').replace('_hours', '_hour').replace('_assists', '_assist') as keyof typeof COSTS
  const cost = COSTS[costKey] * quantity
  
  const monthlyData = await redisGet<{ total_cost: number; breakdown: Record<string, number> }>(monthlyKey) || {
    total_cost: 0,
    breakdown: {},
  }
  
  monthlyData.total_cost += cost
  monthlyData.breakdown[type] = (monthlyData.breakdown[type] || 0) + quantity
  
  await redisSet(monthlyKey, monthlyData)
}

/**
 * Get full usage data for dashboard
 */
export async function getUsageData(sessionId: string): Promise<{
  daily: Record<UsageType, { used: number; limit: number; remaining: number }>
  monthly: { total_cost: number; breakdown: Record<string, number> }
  has_payment: boolean
  stripe_customer_id?: string
}> {
  const date = new Date().toISOString().slice(0, 10)
  const paymentKey = getPaymentKey(sessionId)
  const monthlyKey = getMonthlyKey(sessionId)
  
  const [paymentData, monthlyData] = await Promise.all([
    redisGet<{ has_payment: boolean; stripe_customer_id?: string }>(paymentKey),
    redisGet<{ total_cost: number; breakdown: Record<string, number> }>(monthlyKey),
  ])
  
  const usageTypes: UsageType[] = ['chat_messages', 'video_generations', 'image_edits', 'agent_calls', 'sandbox_hours', 'ai_assists']
  
  const dailyUsage: Record<string, { used: number; limit: number; remaining: number }> = {}
  
  for (const type of usageTypes) {
    const key = `usage:${sessionId}:${date}:${type}`
    const used = await redisGet<number>(key) || 0
    const limit = FREE_LIMITS[type]
    dailyUsage[type] = {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    }
  }
  
  return {
    daily: dailyUsage as Record<UsageType, { used: number; limit: number; remaining: number }>,
    monthly: monthlyData || { total_cost: 0, breakdown: {} },
    has_payment: paymentData?.has_payment || false,
    stripe_customer_id: paymentData?.stripe_customer_id,
  }
}

/**
 * Set payment status for a user (called after Stripe checkout)
 */
export async function setPaymentStatus(sessionId: string, stripeCustomerId: string): Promise<void> {
  const paymentKey = getPaymentKey(sessionId)
  await redisSet(paymentKey, {
    has_payment: true,
    stripe_customer_id: stripeCustomerId,
    added_at: new Date().toISOString(),
  })
}

/**
 * Generate or get anonymous session ID
 */
export function generateSessionId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Check if Redis is configured (for status display)
 */
export function isStorageConfigured(): boolean {
  return isRedisConfigured()
}
