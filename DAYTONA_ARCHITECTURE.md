# 🏗️ Automated Sandbox Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. User Visits: https://joepro.ai/sandbox-portal

2. Clicks: "🚀 Open Dev Sandbox"

3. Authentication: 
   ┌───────────────┐
   │  Sign In?     │
   │  (Clerk/Auth) │
   └───────┬───────┘
           │
           ↓
   ┌───────────────┐
   │ User Session  │
   │ (id, email)   │
   └───────┬───────┘
           │
           ↓

4. Frontend Calls API:
   POST /api/sandbox/create
   Body: { userId, email, userName }

5. Backend Process:
   ┌─────────────────────────────────────────────┐
   │ Server-Side (Has Daytona API Key)          │
   ├─────────────────────────────────────────────┤
   │ 1. Check if sandbox exists for user         │
   │    Name: "joepro-{first-8-chars-of-userId}" │
   │                                              │
   │ 2. If exists:                                │
   │    - Resume sandbox (if stopped)            │
   │    - Get connection info                    │
   │                                              │
   │ 3. If not exists:                            │
   │    - Create new sandbox                     │
   │    - Assign to user (via labels)            │
   │    - Configure resources (2 CPU, 4GB RAM)   │
   │                                              │
   │ 4. Generate access tokens:                  │
   │    - SSH token (120 min expiry)             │
   │    - Preview URL (port 3000)                │
   │    - Terminal URL (port 22222)              │
   └─────────────────────────────────────────────┘
           │
           ↓

6. Response to User:
   {
     sandbox: { id, name },
     access: {
       ssh: { command, token, host },
       preview: { url },
       terminal: { url }
     }
   }

7. Auto-Redirect:
   Browser opens: terminal.url
   
8. User Starts Coding! 🎉
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                            │
└──────────────────────────────────────────────────────────────┘

Layer 1: User Authentication
├── Handled by: Clerk/Auth0/NextAuth
├── Verifies: User identity
└── Provides: userId, email, name

Layer 2: Server-Side API Key
├── Stored in: Environment variables (server only)
├── Used for: Daytona organization API calls
├── Never exposed: To client/browser
└── Scopes: write:sandboxes, read:volumes

Layer 3: Organization Boundary
├── All sandboxes: Belong to your org
├── User isolation: Via unique sandbox names
├── Resource limits: Set by org quotas
└── Access control: Only org members

Layer 4: Time-Limited Tokens
├── SSH tokens: Expire after 2 hours
├── Regeneration: User clicks "Open Sandbox" again
├── Preview URLs: Only work while sandbox runs
└── Terminal access: Org members only

Layer 5: Sandbox Isolation
├── Each sandbox: Completely isolated environment
├── No cross-talk: Between user sandboxes
├── Resource caps: 2 CPU, 4GB RAM, 8GB disk
└── Network: Configurable firewall rules
```

---

## Data Flow

```
┌────────────┐         ┌──────────────┐         ┌────────────────┐
│   User     │         │   JoePro.ai  │         │    Daytona     │
│  Browser   │         │   Next.js    │         │  Organization  │
└─────┬──────┘         └──────┬───────┘         └────────┬───────┘
      │                       │                          │
      │ 1. Click "Open"       │                          │
      │──────────────────────>│                          │
      │                       │                          │
      │                       │ 2. Create/Resume         │
      │                       │────────────────────────> │
      │                       │   (API Key Auth)         │
      │                       │                          │
      │                       │ 3. Sandbox Info          │
      │                       │<──────────────────────── │
      │                       │   (ID, Tokens, URLs)     │
      │                       │                          │
      │ 4. Access Info        │                          │
      │<──────────────────────│                          │
      │   (Tokens, URLs)      │                          │
      │                       │                          │
      │ 5. Connect via SSH/Terminal                      │
      │─────────────────────────────────────────────────>│
      │                                                   │
      │ 6. Terminal Session                               │
      │<─────────────────────────────────────────────────│
      │                                                   │
```

---

## File Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│  lib/daytona/client.ts                                      │
├─────────────────────────────────────────────────────────────┤
│  • Initialize Daytona SDK client                           │
│  • Load API key from environment                            │
│  • Define default sandbox configuration                     │
│  • Export reusable client getter                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  app/api/sandbox/create/route.ts                            │
├─────────────────────────────────────────────────────────────┤
│  • Receive user data from frontend                          │
│  • Validate authentication                                  │
│  • Check for existing user sandbox                          │
│  • Create new sandbox if needed                             │
│  • Resume stopped sandbox                                   │
│  • Generate SSH tokens                                      │
│  • Get preview URLs                                         │
│  • Return access info to frontend                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  components/SandboxLauncher.tsx                             │
├─────────────────────────────────────────────────────────────┤
│  • Render "Open Sandbox" button                             │
│  • Handle user authentication                               │
│  • Call create API                                          │
│  • Display loading state                                    │
│  • Show access information                                  │
│  • Auto-redirect to terminal                                │
│  • Provide SSH command copy                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  app/sandbox-portal/page.tsx                                │
├─────────────────────────────────────────────────────────────┤
│  • Landing page for sandbox feature                         │
│  • Embed SandboxLauncher component                          │
│  • Show features and benefits                               │
│  • Display tech specs                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```
┌──────────────────────────────────────────────────────────┐
│  Required (Server-Side Only)                             │
├──────────────────────────────────────────────────────────┤
│  DAYTONA_API_KEY=dt_xxxxx...                            │
│  • Where: .env.local, Vercel settings                   │
│  • Used by: lib/daytona/client.ts                       │
│  • Security: NEVER commit, NEVER expose to client       │
│                                                          │
│  DAYTONA_ORG_ID=org_xxxxx...                            │
│  • Where: .env.local, Vercel settings                   │
│  • Used by: lib/daytona/client.ts                       │
│  • Security: Sensitive, keep private                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Authentication (Depends on Provider)                    │
├──────────────────────────────────────────────────────────┤
│  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxx...         │
│  CLERK_SECRET_KEY=sk_xxxxx...                          │
│  • If using Clerk                                       │
│                                                          │
│  NEXTAUTH_SECRET=xxxxx...                              │
│  NEXTAUTH_URL=https://joepro.ai                        │
│  • If using NextAuth                                    │
└──────────────────────────────────────────────────────────┘
```

---

## Resource Allocation Per User

```
┌─────────────────────────────────────────┐
│         USER SANDBOX SPECS              │
├─────────────────────────────────────────┤
│  CPU:     2 vCPUs                       │
│  Memory:  4 GB RAM                      │
│  Disk:    8 GB Storage                  │
│  Ports:   3000-9999 (preview)           │
│           22222 (terminal)              │
│  Runtime: Node.js 20                    │
│  Tools:   npm, yarn, git                │
│  Lifetime:                              │
│    • Auto-stop: After 2hr inactivity    │
│    • Auto-resume: On next access        │
│    • Data: Persists across stops        │
└─────────────────────────────────────────┘
```

---

## Implementation Checklist

### 🔴 OFF-STREAM (Contains Secrets):
- [ ] Create Daytona organization
- [ ] Generate API key with scopes
- [ ] Add environment variables to `.env.local`
- [ ] Add environment variables to Vercel
- [ ] Test API key validity

### 🟢 ON-STREAM (Safe):
- [ ] Install `@daytonaio/sdk`
- [ ] Set up authentication provider (Clerk)
- [ ] Create `lib/daytona/client.ts`
- [ ] Create `app/api/sandbox/create/route.ts`
- [ ] Create `components/SandboxLauncher.tsx`
- [ ] Create `app/sandbox-portal/page.tsx`
- [ ] Update `.gitignore` for `.env.local`
- [ ] Test sandbox creation locally
- [ ] Deploy to Vercel
- [ ] Test production deployment

---

## Cost Estimation

```
Daytona Credits Usage:
├── Sandbox Running: ~X credits/hour
├── Sandbox Stopped: 0 credits/hour
├── Storage (8GB): ~Y credits/month
└── With 20,000 credits: ~Z user-hours

Optimization Strategies:
├── Auto-stop after 2 hours inactivity
├── Resume on-demand (no cold start penalty)
├── Shared resources when possible
└── Monitor usage via dashboard
```

---

## Next Features

1. **User Dashboard**
   - View active sandboxes
   - Manage SSH tokens
   - Usage statistics

2. **Template System**
   - Pre-configured environments
   - Next.js, Python, Full-stack, etc.
   - One-click template deployment

3. **Collaboration**
   - Share sandbox with team
   - Guest access tokens
   - Pair programming mode

4. **Monitoring**
   - Resource usage alerts
   - Cost tracking
   - Performance metrics

---

**Architecture is complete!** 🏗️

All components work together to provide seamless, automated sandbox access.
