# 🔐 OAuth Team Access Implementation

## Your Request: "Auto session cookies for my organization"

**Goal**: Temporary team members can access sandboxes without manual sign-up

---

## 🎯 Solution: "Magic Link + Session Cookies"

### **User Flow:**

```
1. You send team member a link: 
   https://joepro.ai/join/TEMP_TOKEN_ABC123

2. They click link
   → Auto-creates session cookie
   → Grants temporary access to org sandboxes
   → No password, no sign-up form

3. Session lasts 24 hours (configurable)

4. After 24h, they can request new link
```

---

## 📋 Implementation

### **Step 1: Create Temporary Access Tokens API**

```typescript
// app/api/team/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// In-memory store (use Redis in production)
const tempTokens = new Map<string, {
  orgId: string
  email: string
  expiresAt: number
  permissions: string[]
}>()

export async function POST(request: NextRequest) {
  const { email, orgId, expiresInHours = 24 } = await request.json()
  
  // Create temporary token
  const token = nanoid(32)
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000)
  
  tempTokens.set(token, {
    orgId,
    email,
    expiresAt,
    permissions: ['view_sandboxes', 'create_sandboxes', 'edit_code']
  })
  
  // Generate magic link
  const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${token}`
  
  return NextResponse.json({
    success: true,
    magicLink,
    expiresAt: new Date(expiresAt).toISOString()
  })
}
```

---

### **Step 2: Magic Link Handler**

```typescript
// app/join/[token]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(`/api/team/verify/${params.token}`)
        const data = await response.json()
        
        if (data.success) {
          // Set session cookie
          document.cookie = `joepro_temp_session=${data.sessionId}; max-age=${data.maxAge}; path=/; secure; samesite=strict`
          
          setStatus('success')
          
          // Redirect to sandbox portal
          setTimeout(() => {
            router.push('/sandbox-portal')
          }, 2000)
        } else {
          setStatus('error')
        }
      } catch (error) {
        setStatus('error')
      }
    }
    
    verifyToken()
  }, [params.token])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'verifying' && (
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Verifying access...</h2>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Access Granted!</h2>
          <p className="text-[var(--text-muted)]">Redirecting to sandbox portal...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Invalid or Expired Link</h2>
          <p className="text-[var(--text-muted)]">Please request a new access link</p>
        </div>
      )}
    </div>
  )
}
```

---

### **Step 3: Verify Token API**

```typescript
// app/api/team/verify/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token
  const tempToken = tempTokens.get(token)
  
  if (!tempToken) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 404 }
    )
  }
  
  if (Date.now() > tempToken.expiresAt) {
    tempTokens.delete(token)
    return NextResponse.json(
      { success: false, error: 'Token expired' },
      { status: 403 }
    )
  }
  
  // Create session
  const sessionId = nanoid(32)
  const sessionExpiry = tempToken.expiresAt - Date.now()
  
  // Store session (use Redis in production)
  sessions.set(sessionId, {
    orgId: tempToken.orgId,
    email: tempToken.email,
    permissions: tempToken.permissions,
    expiresAt: tempToken.expiresAt
  })
  
  // Delete temp token (one-time use)
  tempTokens.delete(token)
  
  return NextResponse.json({
    success: true,
    sessionId,
    maxAge: Math.floor(sessionExpiry / 1000) // Convert to seconds
  })
}
```

---

### **Step 4: Session Middleware**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('joepro_temp_session')
  
  // Protected routes
  if (request.nextUrl.pathname.startsWith('/sandbox-portal')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Verify session is valid (check sessions Map/Redis)
    const session = sessions.get(sessionCookie.value)
    
    if (!session || Date.now() > session.expiresAt) {
      // Session expired, delete cookie
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('joepro_temp_session')
      return response
    }
    
    // Add session data to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-session-id', sessionCookie.value)
    requestHeaders.set('x-org-id', session.orgId)
    requestHeaders.set('x-user-email', session.email)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/sandbox-portal/:path*', '/api/sandbox/:path*']
}
```

---

### **Step 5: Update Sandbox API to Use Session**

```typescript
// app/api/sandbox/create/route.ts
export async function POST(request: NextRequest) {
  try {
    // Get session from headers (set by middleware)
    const sessionId = request.headers.get('x-session-id')
    const orgId = request.headers.get('x-org-id')
    const email = request.headers.get('x-user-email')
    
    if (!sessionId || !orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get session details
    const session = sessions.get(sessionId)
    
    if (!session || Date.now() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 403 }
      )
    }
    
    // Check permissions
    if (!session.permissions.includes('create_sandboxes')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Create sandbox using organization's Daytona account
    const daytona = getDaytonaClient() // Uses your org credentials
    
    // Generate unique sandbox name for this temp user
    const sandboxName = `joepro-temp-${sessionId.slice(0, 8)}`
    
    // ... rest of sandbox creation logic
  }
}
```

---

## 🎬 Usage Example

### **As Organization Owner:**

```typescript
// Generate invite link for team member
const response = await fetch('/api/team/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'contractor@example.com',
    orgId: 'your-org-id',
    expiresInHours: 24 // or 48, 72, etc.
  })
})

const { magicLink } = await response.json()

// Send link to team member via:
// - Email
// - Slack
// - Discord
// - SMS
console.log('Share this link:', magicLink)
// https://joepro.ai/join/kY8mN3pQ9rT2vU5wX7zA1B4cD6eF8gH
```

---

### **As Team Member:**

```
1. Click link → Auto signed in
2. Access sandboxes immediately
3. No password needed
4. Session expires after 24 hours
```

---

## 🔒 Security Features

### **1. One-Time Use Tokens**
- Token deleted after first use
- Can't reuse the same link

### **2. Time-Based Expiration**
- Tokens expire after X hours
- Sessions expire independently
- Both are validated on every request

### **3. Permission Scoping**
```typescript
permissions: [
  'view_sandboxes',      // Can see sandboxes
  'create_sandboxes',    // Can create new ones
  'edit_code',           // Can modify code
  'delete_sandboxes',    // Can delete (optional)
  'invite_others',       // Can generate new invites (optional)
]
```

### **4. Audit Logging**
```typescript
// Log all temp user actions
logAction({
  sessionId,
  email,
  action: 'created_sandbox',
  sandboxId,
  timestamp: Date.now()
})
```

---

## 🚀 Production Setup

### **Use Redis for Token/Session Storage:**

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

// Store temp token
await redis.setex(
  `temp_token:${token}`,
  60 * 60 * 24, // 24 hours
  JSON.stringify({
    orgId,
    email,
    permissions,
  })
)

// Store session
await redis.setex(
  `session:${sessionId}`,
  60 * 60 * 24, // 24 hours
  JSON.stringify({
    orgId,
    email,
    permissions,
  })
)
```

---

## 📧 Email Integration (Optional)

```typescript
// Send invite email
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'JoePro <team@joepro.ai>',
  to: email,
  subject: 'You\'ve been invited to JoePro.ai',
  html: `
    <h1>Welcome to JoePro.ai!</h1>
    <p>You've been invited to access our development sandboxes.</p>
    <a href="${magicLink}" style="background: gold; padding: 12px 24px; color: black; text-decoration: none; border-radius: 4px;">
      Access Sandbox →
    </a>
    <p>This link expires in 24 hours.</p>
  `
})
```

---

## 🎯 **TLDR: How It Works**

```
You (org owner):
  POST /api/team/invite { email, orgId }
    ↓
  Get magic link
    ↓
  Share with team member

Team member:
  Clicks link
    ↓
  GET /join/TOKEN
    ↓
  Auto-creates session cookie
    ↓
  Redirects to /sandbox-portal
    ↓
  Can use sandboxes (24 hours)
```

---

## 💰 Pricing Consideration

**Free tier**: 3 temp invites/month
**Pro tier**: Unlimited temp invites
**Enterprise**: SSO instead of magic links

---

**Want me to implement this now?** 🚀
