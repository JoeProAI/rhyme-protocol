import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import Stripe from 'stripe'
import { generateSessionId } from '@/lib/usage-system'

export const runtime = 'nodejs'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

const BodySchema = z.object({
  // Whole-dollar top-ups between $5 and $500.
  amountCents: z.number().int().min(500).max(50000),
})

/**
 * POST /api/credits/checkout
 * One-time Stripe Checkout to top up the session balance. No card is ever
 * stored and nothing recurs — buy in, spend it on films.
 */
export async function POST(req: NextRequest) {
  try {
    if (!stripe) return NextResponse.json({ error: 'Payments not configured' }, { status: 500 })
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Top-up must be between $5 and $500' }, { status: 400 })
    }

    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    const isNewSession = !sessionId
    if (!sessionId) sessionId = generateSessionId()

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://rhymeprotocol.com'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Rhyme Protocol film credits',
              description: 'Prepaid balance for music films — spent on delivery, never expires',
            },
            unit_amount: parsed.data.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        anon_session_id: sessionId,
        credit_cents: String(parsed.data.amountCents),
      },
      success_url: `${base}/studio/board?topup=success`,
      cancel_url: `${base}/studio/board?topup=cancelled`,
    })

    const res = NextResponse.json({ url: session.url })
    if (isNewSession) {
      res.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      })
    }
    return res
  } catch (error) {
    console.error('[credits] checkout failed:', error)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}
