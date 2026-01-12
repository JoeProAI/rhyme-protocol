import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { setPaymentStatus } from '@/lib/usage-system'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get the anonymous session ID from metadata
        const anonSessionId = session.metadata?.anon_session_id
        const customerId = session.customer as string
        
        if (anonSessionId && customerId) {
          // Mark this user as having a payment method
          await setPaymentStatus(anonSessionId, customerId)
          console.log(`Payment method added for session: ${anonSessionId.substring(0, 20)}...`)
        }
        break
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent
        console.log('Setup intent succeeded:', setupIntent.id)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // Handle subscription events if you add subscriptions later
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription event:', event.type, subscription.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

