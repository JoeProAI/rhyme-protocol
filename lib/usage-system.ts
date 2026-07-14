/**
 * Unified Usage & Billing System
 * Tracks usage across all AI tools with persistent storage
 */

import { redisGet, redisSet, redisIncr, redisIncrBy, isRedisConfigured } from './redis'

// Tiered free access. Cheap stuff is truly unlimited; expensive stuff has a
// generous daily cap with a viral share-to-earn bonus. Global $ ceiling caps
// total daily spend across ALL users to protect against runaway costs.
const UNLIMITED = 999999

// Per-session daily limits for anonymous users.
// Generous-by-default for the rap community.
export const FREE_LIMITS = {
  // Effectively unlimited (per-call cost is < $0.01)
  lyric_generations: UNLIMITED,
  chat_messages: UNLIMITED,
  ai_assists: UNLIMITED,
  agent_calls: UNLIMITED,
  // Generous artist tools (low-mid cost)
  audio_isolations: 30,
  // Generous (mid-cost ~ $0.04 each at medium quality)
  cover_art: 15,
  image_edits: 15,
  // Capped + earnable (high cost)
  video_generations: 3,
  sandbox_hours: 2,
  // ClipChain multi-shot Seedance clips (~$1.85 each) — 1 free/day, earnable
  clip_generations: 1,
}

// Bonus added per successful share-to-X (or other social referral).
// Max 3 shares/day per type means real cap = base + 3 * SHARE_BONUS.
export const SHARE_BONUS = {
  video_generations: 5,    // 3 base + 15 = up to 18/day
  cover_art: 10,           // 15 base + 30 = up to 45/day
  sandbox_hours: 2,        // 2 base + 6 = up to 8/day
  clip_generations: 2,     // 1 base + 6 = up to 7/day
}

// Global daily $ ceiling across the whole site (USD). When exceeded, expensive
// generations switch to queued mode. Cheap unlimited stuff keeps flowing.
export const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD || '10')

// Which usage types are protected by the global $ ceiling.
const EXPENSIVE_TYPES: UsageType[] = ['video_generations', 'sandbox_hours', 'cover_art', 'clip_generations']

// Pricing (cost to you, for tracking)
export const COSTS = {
  lyric_generation: 0.02, // ~$0.02 per lyric gen (GPT-4o + Grok)
  cover_art: 0.04,        // ~$0.04 per cover (DALL-E 3)
  video_segment: 0.50,    // ~$0.50 per video segment (Luma Ray-2)
  chat_message: 0.002,    // ~$0.002 per message
  image_edit: 0.01,       // ~$0.01 per image edit
  agent_call: 0.005,      // ~$0.005 per agent call
  sandbox_hour: 0.05,     // ~$0.05 per sandbox hour
  ai_assist: 0.003,       // ~$0.003 per AI assist
  audio_isolation: 0.01,  // ~$0.01 per minute isolated (ElevenLabs)
  clip_segment: 1.85,     // ~$1.85 per ClipChain 15s multi-shot clip (Seedance 2.0 Fast)
}

// Pricing for users (if they pay)
export const USER_PRICING = {
  lyric_generation: 0.05, // $0.05 per lyric gen
  cover_art: 0.10,        // $0.10 per cover
  video_segment: 1.00,    // $1.00 per video segment
  chat_message: 0.01,     // $0.01 per message
  image_edit: 0.02,       // $0.02 per image edit
  agent_call: 0.01,       // $0.01 per agent call
  sandbox_hour: 0.10,     // $0.10 per sandbox hour
  ai_assist: 0.01,        // $0.01 per AI assist
  clip_segment: 4.99,     // $4.99 per ClipChain clip
}

// Coupon tiers - give different amounts of credits
export const COUPON_TIERS = {
  BETA_TESTER: {
    lyric_generations: 50,
    cover_art: 20,
    video_generations: 5,
    expires_days: 30,
  },
  EARLY_SUPPORTER: {
    lyric_generations: 100,
    cover_art: 50,
    video_generations: 10,
    expires_days: 60,
  },
  VIP: {
    lyric_generations: 500,
    cover_art: 100,
    video_generations: 30,
    expires_days: 90,
  },
  UTOPIA: {
    lyric_generations: 10000,
    cover_art: 5000,
    video_generations: 1000,
    expires_days: 365,
  },
  PRODUCER: {
    lyric_generations: 200,
    cover_art: 100,
    video_generations: 20,
    expires_days: 90,
  },
}

export type UsageType = 'lyric_generations' | 'cover_art' | 'video_generations' | 'chat_messages' | 'image_edits' | 'agent_calls' | 'sandbox_hours' | 'ai_assists' | 'audio_isolations' | 'clip_generations'

/**
 * Redis key for the per-session share bonus counter.
 * One bonus is awarded per share, capped at MAX_SHARE_BONUSES_PER_DAY.
 */
function getShareBonusKey(sessionId: string, type: UsageType): string {
  const date = new Date().toISOString().slice(0, 10)
  return `share_bonus:${sessionId}:${date}:${type}`
}

/**
 * Redis key for the global daily spend tracker.
 */
function getGlobalSpendKey(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `global_spend:${date}`
}

const MAX_SHARE_BONUSES_PER_DAY = 3

interface UsageData {
  lyric_generations: number
  cover_art: number
  video_generations: number
  chat_messages: number
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
  const shareBonusKey = getShareBonusKey(sessionId, type)

  const [used, paymentData, shareBonus, globalSpend] = await Promise.all([
    redisGet<number>(dailyKey),
    redisGet<{ has_payment: boolean; stripe_customer_id?: string }>(paymentKey),
    redisGet<number>(shareBonusKey),
    redisGet<number>(getGlobalSpendKey()),
  ])

  const currentUsed = used || 0
  const baseLimit = FREE_LIMITS[type]
  const bonus = (shareBonus || 0) * (SHARE_BONUS[type as keyof typeof SHARE_BONUS] || 0)
  const limit = baseLimit + bonus
  const hasPayment = paymentData?.has_payment || false

  // Paying users always allowed
  if (hasPayment) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      used: currentUsed,
    }
  }

  // Global daily $ ceiling for expensive generations.
  if (EXPENSIVE_TYPES.includes(type) && (globalSpend || 0) >= DAILY_BUDGET_USD) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      used: currentUsed,
      reason: `Daily community budget reached. Try again in a few hours or share to unlock priority access.`,
      upgrade_url: '/dashboard',
    }
  }

  // Per-session daily limit
  if (currentUsed >= limit) {
    const sharable = SHARE_BONUS[type as keyof typeof SHARE_BONUS]
    const reason = sharable
      ? `Daily limit reached (${limit}). Share to X to unlock +${sharable} more.`
      : `Daily limit reached (${limit} per day).`
    return {
      allowed: false,
      remaining: 0,
      limit,
      used: currentUsed,
      reason,
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
 * Award a share bonus to a session. Called from /api/usage/share-bonus after
 * verifying a real share (e.g. X intent click + return).
 * Capped at MAX_SHARE_BONUSES_PER_DAY per session per type.
 */
export async function awardShareBonus(sessionId: string, type: UsageType): Promise<{ success: boolean; new_limit?: number; reason?: string }> {
  if (!(type in SHARE_BONUS)) {
    return { success: false, reason: 'This action is not eligible for share bonuses.' }
  }
  const key = getShareBonusKey(sessionId, type)
  const current = (await redisGet<number>(key)) || 0
  if (current >= MAX_SHARE_BONUSES_PER_DAY) {
    return { success: false, reason: 'Daily share bonus cap reached.' }
  }
  const next = current + 1
  await redisSet(key, next, 172800)
  const baseLimit = FREE_LIMITS[type]
  const perShare = SHARE_BONUS[type as keyof typeof SHARE_BONUS] || 0
  return { success: true, new_limit: baseLimit + next * perShare }
}

/**
 * Get remaining global daily budget (for UI display).
 */
export async function getGlobalBudgetStatus(): Promise<{ spent: number; ceiling: number; remaining: number; pct_used: number }> {
  const spent = (await redisGet<number>(getGlobalSpendKey())) || 0
  const remaining = Math.max(0, DAILY_BUDGET_USD - spent)
  return {
    spent,
    ceiling: DAILY_BUDGET_USD,
    remaining,
    pct_used: Math.min(100, (spent / DAILY_BUDGET_USD) * 100),
  }
}

/**
 * Track usage after an action is performed
 */
export async function trackUsage(sessionId: string, type: UsageType, quantity: number = 1): Promise<void> {
  const dailyKey = getDailyKey(sessionId, type)
  const monthlyKey = getMonthlyKey(sessionId)
  const globalSpendKey = getGlobalSpendKey()

  // Increment daily usage
  await redisIncrBy(dailyKey, quantity)

  // Set expiry for daily key (48 hours to be safe)
  await redisSet(dailyKey, (await redisGet<number>(dailyKey)) || quantity, 172800)

  // Track monthly cost
  const costKey = type.replace('_messages', '_message').replace('_generations', '_segment').replace('_edits', '_edit').replace('_calls', '_call').replace('_hours', '_hour').replace('_assists', '_assist') as keyof typeof COSTS
  const cost = (COSTS[costKey] || 0) * quantity

  const monthlyData = await redisGet<{ total_cost: number; breakdown: Record<string, number> }>(monthlyKey) || {
    total_cost: 0,
    breakdown: {},
  }

  monthlyData.total_cost += cost
  monthlyData.breakdown[type] = (monthlyData.breakdown[type] || 0) + quantity

  await redisSet(monthlyKey, monthlyData)

  // Track GLOBAL daily spend (for daily $ ceiling enforcement)
  if (cost > 0) {
    const currentGlobal = (await redisGet<number>(globalSpendKey)) || 0
    await redisSet(globalSpendKey, currentGlobal + cost, 172800)
  }
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
  
  const usageTypes: UsageType[] = ['chat_messages', 'video_generations', 'image_edits', 'agent_calls', 'sandbox_hours', 'ai_assists', 'clip_generations']
  
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
