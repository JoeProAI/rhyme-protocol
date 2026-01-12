# 🚀 Automated Daytona Sandbox Setup

## Overview

This system provides **one-click sandbox access** for users. They simply sign in, and everything else is automated:

1. **User clicks "Open Sandbox"**
2. **Authentication** (OAuth/Session)
3. **Auto-create or resume** their personal sandbox
4. **Auto-redirect** to terminal/workspace
5. **Done!** ✨

---

## 🔒 Security Model

### Organization-Based Access
- All sandboxes belong to your Daytona organization
- Users are identified by unique IDs (from auth provider)
- Each user gets a personal sandbox: `joepro-{userId}`
- Sandboxes auto-resume if they already exist

### Access Levels
- **Your API Key**: Full organization control (server-side only)
- **User Sessions**: Individual sandbox access via generated tokens
- **SSH Tokens**: Time-limited (2 hours), auto-expire
- **Preview URLs**: Accessible only while sandbox is running

---

## 📋 Setup Steps

### 🔴 Step 1: Get Daytona Credentials (OFF-STREAM)

1. **Create Organization:**
   - Go to: https://app.daytona.io/dashboard/settings
   - Click "Create Organization"
   - Copy the **Organization ID**

2. **Generate API Key:**
   - Go to: https://app.daytona.io/dashboard/keys
   - Click "Create Key"
   - Name: "JoePro Website API"
   - Select scopes:
     - ✅ `write:sandboxes`
     - ✅ `delete:sandboxes`
     - ✅ `read:volumes`
   - Copy the **API Key** (starts with `dt_`)

3. **Add to Environment Variables:**
   ```bash
   # Add to .env.local (NEVER COMMIT THIS FILE)
   DAYTONA_API_KEY=dt_your_key_here
   DAYTONA_ORG_ID=org_your_id_here
   ```

4. **Add to Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add both variables for Production

---

### 🟢 Step 2: Install Daytona SDK (SAFE FOR STREAM)

```bash
npm install @daytonaio/sdk
```

---

### 🟢 Step 3: Add Authentication (SAFE FOR STREAM)

The system needs to identify users. You can integrate with:

#### Option A: Clerk (Recommended)

```bash
npm install @clerk/nextjs
```

Update `components/SandboxLauncher.tsx`:

```typescript
import { useUser } from '@clerk/nextjs'

export default function SandboxLauncher() {
  const { user, isSignedIn } = useUser()
  
  const authenticateUser = async () => {
    if (!isSignedIn || !user) {
      throw new Error('Please sign in first')
    }
    
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: user.fullName || 'User',
    }
  }
  
  // Rest of component...
}
```

Add Sign In button:
```typescript
import { SignInButton } from '@clerk/nextjs'

{!isSignedIn ? (
  <SignInButton mode="modal">
    <button className="btn-primary">
      Sign In to Launch Sandbox
    </button>
  </SignInButton>
) : (
  <button onClick={handleOpenSandbox} className="btn-primary">
    🚀 Open Dev Sandbox
  </button>
)}
```

#### Option B: NextAuth.js

```bash
npm install next-auth
```

#### Option C: Custom Auth

Use your existing authentication system and pass user data to the API route.

---

### 🟢 Step 4: Test Locally (SAFE FOR STREAM)

```bash
npm run dev
```

1. Navigate to `/sandbox-portal`
2. Click "Open Sandbox"
3. Check console for sandbox creation progress
4. Terminal should auto-open

---

### 🟢 Step 5: Deploy to Production

```bash
git add .
git commit -m "Add automated Daytona sandbox system"
git push origin main
vercel --prod
```

---

## 🎯 User Experience Flow

### For First-Time Users:

```
1. User visits /sandbox-portal
2. Clicks "🚀 Open Dev Sandbox"
3. Signs in (if not already)
4. System creates new sandbox
5. Terminal opens automatically
6. User starts coding immediately!
```

### For Returning Users:

```
1. User clicks "🚀 Open Dev Sandbox"
2. System finds existing sandbox
3. Resumes if stopped
4. Terminal opens automatically
5. User continues where they left off!
```

---

## 📁 File Structure

```
joepro/
├── lib/
│   └── daytona/
│       └── client.ts              # Daytona client setup
├── app/
│   ├── api/
│   │   └── sandbox/
│   │       └── create/
│   │           └── route.ts       # Sandbox creation API
│   └── sandbox-portal/
│       └── page.tsx               # User-facing portal
└── components/
    └── SandboxLauncher.tsx        # Main UI component
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Store API keys in environment variables
- Use server-side API routes for sandbox creation
- Implement proper user authentication
- Set reasonable auto-stop intervals (2 hours)
- Use time-limited SSH tokens
- Validate user identity before creating sandboxes

### ❌ DON'T:
- Expose Daytona API keys in client code
- Allow unauthenticated sandbox creation
- Share organization API keys
- Commit `.env.local` to git
- Show API keys on stream/recordings

---

## 🎬 Streaming Safety

### 🔴 Hide From Stream:
- `.env.local` file contents
- Daytona dashboard API Keys page
- API key values in terminal
- Organization IDs

### 🟢 Safe to Show:
- The code structure and components
- Running `npm install`
- Testing the sandbox launcher UI
- User authentication flow
- Terminal output (after redacting tokens)
- Preview URLs
- SSH commands (tokens are temporary)

---

## 🔧 Configuration

### Sandbox Resources

Edit `lib/daytona/client.ts`:

```typescript
export const SANDBOX_CONFIG = {
  resources: {
    cpu: 2,      // Increase for more power
    memory: 4,   // In GB
    disk: 8,     // In GB
  },
  lifecycle: {
    autoStopInterval: 120,  // Minutes of inactivity
    autoArchiveInterval: 0,  // 0 = never archive
    autoDeleteInterval: 0,   // 0 = never auto-delete
  },
}
```

### SSH Token Duration

Edit `app/api/sandbox/create/route.ts`:

```typescript
// Create SSH access token (2 hours)
const sshAccess = await sandbox.createSshAccess(120)  // Change duration here
```

---

## 🐛 Troubleshooting

### "Failed to create sandbox"
- Check that `DAYTONA_API_KEY` is set in environment variables
- Verify API key has `write:sandboxes` scope
- Check organization has available resources

### "Authentication failed"
- Ensure user authentication is properly configured
- Check that user object has required fields (id, email)

### "Sandbox won't start"
- Sandbox may take 10-30 seconds to start first time
- Check Daytona dashboard for sandbox status
- Try manually starting via dashboard

### SSH connection fails
- Token may have expired (2 hour limit)
- Regenerate by clicking "Open Sandbox" again
- Check network/firewall settings

---

## 🚀 Next Steps

### For Production:
1. Set up proper user authentication (Clerk/Auth0)
2. Add user dashboard to see their sandboxes
3. Implement usage tracking/limits
4. Add sandbox templates (Next.js, Python, etc.)
5. Set up monitoring and alerts

### For Streaming:
1. Create a "guest" role with read-only access
2. Generate temporary tokens for viewers
3. Set shorter auto-stop intervals for demos
4. Use screen recording software to blur secrets

---

## 📚 Documentation Links

- **Daytona Docs**: https://www.daytona.io/docs
- **Daytona SDK**: https://www.npmjs.com/package/@daytonaio/sdk
- **API Reference**: https://www.daytona.io/docs/en/typescript-sdk/
- **Dashboard**: https://app.daytona.io/dashboard/

---

## 💡 Tips

### For Users:
- Sandboxes auto-save all work
- Use SSH for VS Code/Cursor integration
- Preview URLs work for web apps (port 3000-9999)
- Terminal is accessible even after expiring SSH tokens

### For Admins:
- Monitor organization resource usage in dashboard
- Set appropriate auto-stop intervals to save resources
- Use labels to track sandbox purposes
- Regularly clean up unused sandboxes

---

**Ready to launch!** 🚀

Your users can now get instant cloud development environments with a single click!
