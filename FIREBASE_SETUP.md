# 🔥 Firebase Setup for JoePro.ai

## ⚠️ SECURITY WARNING

**NEVER commit or share your Firebase service account private key!**

The key contains credentials that give full access to your Firebase project.

---

## Firebase Project Details

- **Project Name**: JoeProAI
- **Project ID**: `joeproai`
- **Project Number**: 666718987759
- **Support Email**: joe@joepro.ai

---

## Quick Setup

### Step 1: Install Firebase CLI

```powershell
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```powershell
firebase login
```

This will open a browser for authentication.

### Step 3: Initialize Project

The `.firebaserc` file is already configured for project `joeproai`.

```powershell
cd "c:\Projects\The Machine\Website\joepro"
firebase init hosting
```

**When prompted:**
- Project: Select "joeproai" (already configured)
- Public directory: Enter `out`
- Single-page app: `Yes`
- GitHub actions: `No` (optional)
- Overwrite index.html: `No`

### Step 4: Configure Next.js for Static Export

Since Firebase Hosting only supports static files, you need to configure Next.js for static export.

**Edit `next.config.mjs`:**

Replace the entire file with:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  
  images: {
    unoptimized: true,
  },
  
  // Note: async headers() doesn't work with static export
  // Security headers will be handled by firebase.json
};

export default nextConfig;
```

### Step 5: Build Static Site

```powershell
npm run build
```

This creates the `out` directory with static files.

### Step 6: Test Locally (Optional)

```powershell
firebase serve
```

Visit: http://localhost:5000

### Step 7: Deploy to Firebase

```powershell
firebase deploy --only hosting
```

Your site will be live at: **https://joeproai.web.app**

---

## 🚨 Important Limitations

### What Works ✅
- Homepage with neural network canvas
- Apps page (static)
- Agents page (static)
- Feeds page (static)
- Client-side routing
- All CSS and animations
- Static assets

### What Doesn't Work ❌
- **API routes** (`/api/llm`, `/api/feeds`, `/api/agents/run`, etc.)
- **OpenAI integration** (requires server-side)
- **xAI integration** (requires server-side)
- **RSS feed aggregation** (server-side)
- **Agent execution** (server-side)
- **Rainmeter endpoints** (server-side)
- **Streaming responses**

---

## 💡 Recommended Solution

### For Full Functionality: Use Vercel

Firebase Hosting is great for static sites, but JoePro.ai requires:
- Server-side API routes
- Environment variables for API keys
- Streaming responses
- Edge runtime

**Deploy to Vercel instead**: See `VERCEL_DEPLOY.md`

### Hybrid Approach

If you must use Firebase:

1. **Deploy frontend to Firebase Hosting**
   - Homepage, apps page, agents page, feeds page
   
2. **Deploy API routes to Vercel**
   - Set up a separate Vercel project for `/api/*`
   - Update frontend to call Vercel API URLs

3. **Update API calls**
   ```typescript
   // Instead of: /api/llm
   // Use: https://your-api.vercel.app/api/llm
   ```

---

## Environment Variables (If Using Firebase Functions)

To use API keys with Firebase, you need Firebase Cloud Functions:

### Step 1: Initialize Functions

```powershell
firebase init functions
```

### Step 2: Set Environment Variables

```powershell
firebase functions:config:set openai.key="sk-your-key-here"
firebase functions:config:set xai.key="your-xai-key-here"
```

### Step 3: Create Function

This requires significant additional work and costs. See `FIREBASE_FUNCTIONS.md` for details.

---

## Service Account Security

### ⚠️ You Exposed Your Private Key

The service account key you shared contains sensitive credentials. You should:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/joeproai/settings/serviceaccounts
2. **Delete the exposed service account**
3. **Create a new service account** if needed
4. **Download new key** and keep it secure
5. **Never share private keys** publicly

### Secure Storage

If you need the service account key:

1. Download it from Firebase Console
2. Save as `firebase-service-account.json` (already in .gitignore)
3. Never commit to Git
4. Never share in chat/email
5. Use environment variables in CI/CD

---

## Firebase vs Vercel Comparison

| Feature | Firebase | Vercel |
|---------|----------|--------|
| **Static Hosting** | ✅ Excellent | ✅ Excellent |
| **API Routes** | ❌ Requires Functions | ✅ Native |
| **Setup Time** | 15-20 min | 3-5 min |
| **Configuration** | Complex | Zero |
| **Environment Vars** | Functions only | Built-in |
| **AI Features** | ❌ Extra setup | ✅ Works |
| **Cost** | Free tier limited | Free tier generous |
| **JoePro.ai Ready** | ⚠️ 40% features | ✅ 100% features |

---

## Quick Commands

```powershell
# Install CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Build static site
npm run build

# Test locally
firebase serve

# Deploy
firebase deploy --only hosting

# View logs
firebase hosting:logs
```

---

## Custom Domain

### Step 1: Add Domain in Firebase Console

1. Go to: https://console.firebase.google.com/project/joeproai/hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `joepro.ai`)

### Step 2: Configure DNS

Firebase will provide DNS records. Typically:

**A Records:**
```
@  151.101.1.195
@  151.101.65.195
```

**Verification TXT Record:**
```
firebase-verification=xxxxxxxxx
```

### Step 3: Wait for SSL

SSL certificate is provisioned automatically (15-30 minutes).

---

## Troubleshooting

### Build Fails

**Error**: "Error: Export encountered errors"

**Solution**: Ensure `output: 'export'` is in `next.config.mjs`

### API Routes Return 404

**Expected**: API routes don't work in static export mode.

**Solution**: Deploy APIs to Vercel or use Firebase Functions.

### Images Don't Load

**Error**: Image optimization errors

**Solution**: Set `images: { unoptimized: true }` in config.

---

## Final Recommendation

### For JoePro.ai: Use Vercel ✅

**Reasons:**
1. All features work out of the box
2. No configuration changes needed
3. API routes work natively
4. Environment variables built-in
5. Faster deployment (3-5 min vs 15-20 min)
6. Better for Next.js applications

**Firebase is better for:**
- Pure static sites
- Projects already using Firebase Auth/Firestore
- When you prefer Google Cloud

---

## Next Steps

### Option A: Deploy to Firebase (Frontend Only)

```powershell
firebase init hosting
npm run build
firebase deploy --only hosting
```

**Result**: Static site at https://joeproai.web.app (no API features)

### Option B: Deploy to Vercel (Full Features)

```powershell
# Push to GitHub first
git push origin main

# Then deploy via Vercel dashboard
# https://vercel.com/new
```

**Result**: Full JoePro.ai at https://your-project.vercel.app

---

**Recommendation**: Use Vercel for complete functionality. Firebase requires too many workarounds for this project.

See `VERCEL_DEPLOY.md` for Vercel deployment guide.
