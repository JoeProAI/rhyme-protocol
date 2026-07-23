/**
 * Prepaid credits — the no-card billing model.
 *
 * Users top up a balance with one-time Stripe Checkout payments (nothing
 * stored, no off-session charges). Film-scale work gates on the balance
 * covering the flat price, and delivery deducts it. Failed runs deduct
 * nothing because delivery never happens.
 */

import { redisGet, redisSet } from '@/lib/redis'

const balanceKey = (sessionId: string) => `credits:balance:${sessionId}`
const eventKey = (eventId: string) => `stripe:event:${eventId}`

export async function getBalanceCents(sessionId: string): Promise<number> {
  return (await redisGet<number>(balanceKey(sessionId))) ?? 0
}

export async function addBalanceCents(sessionId: string, cents: number): Promise<number> {
  const next = (await getBalanceCents(sessionId)) + Math.max(0, Math.round(cents))
  await redisSet(balanceKey(sessionId), next)
  return next
}

/** Deduct exactly `cents` if the balance covers it. Returns success. */
export async function deductBalanceCents(sessionId: string, cents: number): Promise<boolean> {
  const balance = await getBalanceCents(sessionId)
  if (balance < cents) return false
  await redisSet(balanceKey(sessionId), balance - cents)
  return true
}

/** Stripe retries webhooks — credit each event exactly once. */
export async function claimStripeEvent(eventId: string): Promise<boolean> {
  const seen = await redisGet<number>(eventKey(eventId))
  if (seen) return false
  await redisSet(eventKey(eventId), 1, 60 * 60 * 24 * 7)
  return true
}
