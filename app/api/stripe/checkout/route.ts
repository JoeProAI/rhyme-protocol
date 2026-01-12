import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { generateSessionId } from '@/lib/usage-system'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

/**
 * POST /api/stripe/checkout
 * Create a Stripe Checkout session for adding a payment method
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured. Add STRIPE_SECRET_KEY to environment.' },
      { status: 500 }
    )
  }

  try {
    // Get or create session ID
    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    
    if (!sessionId) {
      sessionId = generateSessionId()
    }

    const { returnUrl } = await req.json()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joepro.ai'

    // Create Stripe Checkout session for setup (card on file, no immediate charge)
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: `${baseUrl}/dashboard?setup=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?setup=cancelled`,
      metadata: {
        anon_session_id: sessionId,
      },
      // Optional: collect customer email
      customer_creation: 'always',
    })

    const response = NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })

    // Set session cookie if new
    if (!cookieStore.get('anon_session')?.value) {
      response.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      })
    }

    return response
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
