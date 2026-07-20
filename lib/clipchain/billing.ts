/**
 * Pay-per-delivery billing for ClipChain.
 *
 * The fairness contract: money moves only when a finished clip is delivered.
 * Free-tier users are never charged (they spend daily allowance). Card-on-file
 * users are charged per delivered clip, priced per shot. Failed runs charge
 * nothing — there is nothing to charge for until the final cut exists.
 */

import Stripe from 'stripe'
import { redisGet } from '@/lib/redis'
import { PRICE_PER_SECOND_CENTS } from '@/lib/clipchain/pricing'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export interface ChargeResult {
  charged: boolean
  amountUsd?: number
  error?: string
}

/**
 * Charge the session's saved card for a delivered clip. Idempotent per job:
 * the Stripe idempotency key is derived from the jobId, so a re-entered
 * tick can never double-charge. Returns charged:false (no error) for
 * free-tier sessions with no card on file.
 */
export async function chargeForDeliveredClip(
  sessionId: string,
  jobId: string,
  shotCount: number,
  secondsPerShot: number
): Promise<ChargeResult> {
  const payment = await redisGet<{ has_payment: boolean; stripe_customer_id?: string }>(
    `payment:${sessionId}`
  )
  if (!payment?.has_payment || !payment.stripe_customer_id) {
    return { charged: false }
  }
  if (!stripe) {
    return { charged: false, error: 'Stripe not configured' }
  }

  const amountCents = PRICE_PER_SECOND_CENTS * shotCount * secondsPerShot
  try {
    const customerId = payment.stripe_customer_id
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    })
    const method = methods.data[0]
    if (!method) {
      return { charged: false, error: 'No saved card on customer' }
    }

    const intent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: 'usd',
        customer: customerId,
        payment_method: method.id,
        off_session: true,
        confirm: true,
        description: `ClipChain clip ${jobId} (${shotCount} shots x ${secondsPerShot}s)`,
        metadata: { jobId, sessionId, shots: String(shotCount), secondsPerShot: String(secondsPerShot) },
      },
      { idempotencyKey: `clipchain-${jobId}` }
    )

    if (intent.status === 'succeeded') {
      return { charged: true, amountUsd: amountCents / 100 }
    }
    return { charged: false, error: `Payment ${intent.status}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { charged: false, error: msg }
  }
}
