# 💰 Frictionless Pay-Per-Use System

## Philosophy: "Just Use It" → Money Prints

No sign-in walls. No free trial countdown. No pressure.
Just pure value → Natural conversion → Passive revenue.

---

## 🎯 User Experience

### **First-Time Visitor:**
```
1. Land on joepro.ai
2. See "Grok Builder" demo
3. Type: "Build me a blog"
4. 10 seconds → Live app appears
5. NO SIGN IN REQUIRED
```

### **After 3 Uses (Anonymous):**
```
Small banner (not annoying):
"💳 Enjoying this? Add a card to keep building (pay only for what you use)"
[Add Card] [Remind Me Later]
```

### **With Card Added:**
```
- Unlimited usage
- Billed monthly for actual usage
- No subscription (pure pay-per-use)
- Dashboard shows current month: $2.47
```

---

## 🔧 Technical Implementation

### **1. Anonymous Session Tracking**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get or create anonymous session ID
  let sessionId = request.cookies.get('anon_session')?.value
  
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36)}`
    response.cookies.set('anon_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    })
  }
  
  return response
}

export const config = {
  matcher: ['/api/:path*', '/apps/:path*']
}
```

### **2. Usage Tracking (Redis/DB)**

```typescript
// lib/usage-tracker.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function trackUsage(sessionId: string, action: string, cost: number) {
  const key = `usage:${sessionId}:${new Date().toISOString().slice(0, 7)}` // YYYY-MM
  
  await redis.hincrby(key, action, 1)
  await redis.hincrbyfloat(key, 'total_cost', cost)
  
  // Set expiry to 3 months
  await redis.expire(key, 60 * 60 * 24 * 90)
}

export async function getUsage(sessionId: string) {
  const key = `usage:${sessionId}:${new Date().toISOString().slice(0, 7)}`
  const usage = await redis.hgetall(key)
  
  return {
    sandboxes: parseInt(usage.sandbox_create || '0'),
    builds: parseInt(usage.grok_build || '0'),
    totalCost: parseFloat(usage.total_cost || '0'),
    freeUsesLeft: Math.max(0, 3 - parseInt(usage.grok_build || '0'))
  }
}
```

### **3. Pricing Tiers (Usage-Based)**

```typescript
// lib/pricing.ts
export const PRICING = {
  // Free tier
  FREE_BUILDS: 3,
  
  // Pay-per-use (Stripe)
  SANDBOX_CREATE: 0.10,      // $0.10 per sandbox
  SANDBOX_HOUR: 0.02,        // $0.02 per hour running
  GROK_BUILD: 0.25,          // $0.25 per AI-generated app
  GROK_API_CALL: 0.01,       // $0.01 per API call
  STORAGE_GB_MONTH: 0.05,    // $0.05 per GB/month
  
  // Volume discounts (automatic)
  DISCOUNTS: {
    10: 0.10,   // 10% off at $10/month
    50: 0.20,   // 20% off at $50/month
    100: 0.30,  // 30% off at $100/month
  }
}

export function calculateCost(usage: any) {
  let cost = 0
  
  cost += usage.sandboxes * PRICING.SANDBOX_CREATE
  cost += usage.sandboxHours * PRICING.SANDBOX_HOUR
  cost += usage.builds * PRICING.GROK_BUILD
  cost += usage.apiCalls * PRICING.GROK_API_CALL
  
  // Apply volume discount
  for (const [threshold, discount] of Object.entries(PRICING.DISCOUNTS)) {
    if (cost >= parseInt(threshold)) {
      cost *= (1 - discount)
    }
  }
  
  return cost
}
```

### **4. Stripe Integration (Usage-Based Billing)**

```typescript
// lib/stripe/usage-billing.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCustomer(sessionId: string, email?: string) {
  const customer = await stripe.customers.create({
    metadata: { sessionId },
    email,
  })
  
  // Create subscription with metered billing
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: process.env.STRIPE_USAGE_PRICE_ID!, // Metered price
      }
    ],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
  })
  
  return { customer, subscription }
}

export async function reportUsage(customerId: string, quantity: number) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
  })
  
  if (subscriptions.data[0]) {
    const subscriptionItem = subscriptions.data[0].items.data[0]
    
    await stripe.subscriptionItems.createUsageRecord(subscriptionItem.id, {
      quantity: Math.round(quantity * 100), // Convert dollars to cents
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    })
  }
}
```

### **5. Soft Paywall Component**

```typescript
// components/SoftPaywall.tsx
'use client'

import { useState, useEffect } from 'react'
import { CreditCard, X } from 'lucide-react'

export default function SoftPaywall() {
  const [usage, setUsage] = useState<any>(null)
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    fetch('/api/usage/me')
      .then(r => r.json())
      .then(data => {
        setUsage(data)
        // Show after 3 free uses, but not annoying
        if (data.builds >= 3 && !data.hasCard) {
          setShow(true)
        }
      })
  }, [])
  
  if (!show || !usage) return null
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-[var(--card-bg)] border-2 border-[var(--primary)] rounded-lg p-4 shadow-2xl z-50">
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--primary)]"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[var(--primary)]/10 rounded">
          <CreditCard className="text-[var(--primary)]" size={20} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">
            Enjoying Grok Builder?
          </h3>
          
          <p className="text-sm text-[var(--text-muted)] mb-3">
            You've built {usage.builds} apps. Add a card to keep building.
            <br />
            <span className="text-[var(--primary)] font-medium">
              Pay only for what you use.
            </span>
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = '/add-card'}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-medium rounded transition-all"
            >
              Add Card
            </button>
            
            <button
              onClick={() => setShow(false)}
              className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-foreground transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **6. Add Card Flow (Stripe Checkout)**

```typescript
// app/api/checkout/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const sessionId = cookies().get('anon_session')?.value
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No session' }, { status: 400 })
  }
  
  const session = await stripe.checkout.sessions.create({
    mode: 'setup', // Just collect card, don't charge yet
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?setup=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/?setup=cancel`,
    metadata: { sessionId },
    customer_creation: 'always',
    payment_method_types: ['card'],
  })
  
  return NextResponse.json({ url: session.url })
}
```

### **7. Usage Dashboard**

```typescript
// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Zap, Database, Clock } from 'lucide-react'

export default function Dashboard() {
  const [usage, setUsage] = useState<any>(null)
  
  useEffect(() => {
    fetch('/api/usage/me').then(r => r.json()).then(setUsage)
  }, [])
  
  if (!usage) return <div>Loading...</div>
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        <span className="text-white">Usage</span>
        <span className="text-[var(--primary)]"> Dashboard</span>
      </h1>
      
      {/* Current Month Cost */}
      <div className="glass card-border p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Current Month</p>
            <p className="text-4xl font-bold text-[var(--primary)]">
              ${usage.totalCost.toFixed(2)}
            </p>
          </div>
          <DollarSign size={48} className="text-[var(--primary)]/20" />
        </div>
      </div>
      
      {/* Usage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UsageCard
          icon={<Zap />}
          label="AI Builds"
          value={usage.builds}
          cost={usage.builds * 0.25}
        />
        
        <UsageCard
          icon={<Database />}
          label="Sandboxes"
          value={usage.sandboxes}
          cost={usage.sandboxes * 0.10}
        />
        
        <UsageCard
          icon={<Clock />}
          label="Runtime Hours"
          value={usage.sandboxHours}
          cost={usage.sandboxHours * 0.02}
        />
      </div>
      
      {!usage.hasCard && (
        <div className="mt-8 p-6 border-2 border-[var(--primary)] rounded-lg">
          <h3 className="font-bold mb-2">Add a card to continue</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            You'll be billed monthly for your usage. No subscription required.
          </p>
          <button className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded">
            Add Card
          </button>
        </div>
      )}
    </div>
  )
}

function UsageCard({ icon, label, value, cost }: any) {
  return (
    <div className="glass card-border p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[var(--primary)]">{icon}</div>
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        ${cost.toFixed(2)} this month
      </p>
    </div>
  )
}
```

---

## 📊 Pricing Display (Transparent, Not Pushy)

```typescript
// components/PricingTooltip.tsx
export function PricingTooltip() {
  return (
    <div className="text-xs text-[var(--text-muted)]">
      Pricing: $0.25/build • $0.10/sandbox • $0.02/hour
      <br />
      First 3 builds free
    </div>
  )
}
```

---

## 🎯 Revenue Model

### **Projected Revenue:**

```
Scenario 1: 1,000 users/month
- 10% convert (add card) = 100 paying users
- Average usage: $5/user/month
- Monthly Revenue: $500

Scenario 2: 10,000 users/month  
- 10% convert = 1,000 paying users
- Average usage: $5/user/month
- Monthly Revenue: $5,000

Scenario 3: 100,000 users/month (viral)
- 10% convert = 10,000 paying users
- Average usage: $5/user/month
- Monthly Revenue: $50,000

Power Users (top 5%):
- Average: $25-50/month
- These are your best customers
```

### **Why This Works:**

1. **No friction** → More users try it
2. **Free tier** → Viral sharing
3. **Natural conversion** → People add card when they LOVE it
4. **Fair pricing** → Pay for value received
5. **No subscriptions** → No cancel anxiety

---

## 🚀 Implementation Timeline

### **Week 1: Core Anonymous System**
- ✅ Session cookies
- ✅ Usage tracking (Redis)
- ✅ Free tier (3 builds)
- ✅ Soft paywall component

### **Week 2: Stripe Integration**
- ✅ Stripe Checkout (card collection)
- ✅ Usage-based billing setup
- ✅ Monthly invoicing
- ✅ Usage dashboard

### **Week 3: Polish**
- ✅ Usage API endpoints
- ✅ Cost calculator
- ✅ Email notifications
- ✅ Volume discounts

---

## 💡 Non-Pushy Monetization

### **DO:**
- ✅ Show current usage transparently
- ✅ Highlight value ("You built 5 apps!")
- ✅ Soft reminder after free tier
- ✅ Easy card addition
- ✅ Fair, predictable pricing

### **DON'T:**
- ❌ Countdown timers
- ❌ "Limited time offer!"
- ❌ Fake urgency
- ❌ Hidden fees
- ❌ Aggressive upsells
- ❌ Annoying popups

---

## 📈 Growth Loop

```
1. User tries Grok Builder (free)
2. Shares their app on Twitter
3. Friends click → Try it (free)
4. Some convert → Add card
5. Keep using → Monthly revenue
6. Tell more friends
7. REPEAT
```

**The product sells itself. No pressure needed.** 🎯

---

## 🎉 Summary

**User Flow:**
```
Visit → Use (free) → Love it → Add card → Keep using → Pay fairly
```

**Revenue:**
```
1% power users = 50% of revenue
9% regular users = 40% of revenue
90% free users = viral growth engine
```

**Result:**
- Product that "prints money"
- No annoying paywalls
- Fair, transparent pricing
- Natural viral growth
- Happy customers who WANT to pay

---

## 🔥 Want Me To Build This?

I can implement:
1. Anonymous session tracking
2. Redis usage database
3. Stripe usage-based billing
4. Soft paywall component
5. Usage dashboard
6. API endpoints

**Just say the word and I'll start coding.** 💰

This is how you make money without being annoying about it. 🚀
