# 🚀 Video Generator - Deployment & Testing Guide

## ✅ What Was Built

### **Complete AI Video Generation System:**
- **GPT-Image-1 Integration** (`lib/video-gen/gpt-image-1.ts`)
- **GetImg.ai Video API** (`lib/video-gen/getimg.ts`)
- **Main Generation Endpoint** (`app/api/video-gen/generate/route.ts`)
- **Frontend UI** (`app/apps/video-gen/page.tsx`)
- **API Test Endpoint** (`app/api/video-gen/test/route.ts`)

### **Features:**
✅ Text-to-video generation with continuous flow  
✅ GPT-Image-1 for frame generation (start + end)  
✅ High input fidelity for frame consistency  
✅ Multi-turn context preservation  
✅ GetImg.ai for video interpolation  
✅ Real-time progress tracking  
✅ Cost estimation  
✅ Usage tracking integration  
✅ Edge runtime optimized (no local FFmpeg needed)  

---

## 🔑 Step 1: Get API Keys

### **1. OpenAI API Key (GPT-Image-1)**

**URL:** https://platform.openai.com/api-keys

1. Sign in to OpenAI Platform
2. Click "Create new secret key"
3. Name it "JoePro Video Generator"
4. Copy the key (starts with `sk-proj-...`)
5. Save it securely

**Cost:** ~$0.06 per image frame (high quality)

**Important:** Ensure your OpenAI account has access to GPT-Image-1. You may need to complete "API Organization Verification" for this model.

### **2. GetImg.ai API Key**

**URL:** https://getimg.ai/dashboard

1. Sign up or log in
2. Go to Dashboard → API Keys
3. Create a new API key
4. Copy the key
5. Save it securely

**Cost:** ~$0.10 per 5-second video segment

**Note:** GetImg.ai offers image-to-video generation. Check their pricing page for current rates.

### **3. Gemini API Key (Optional - for Nano Banana Pro)**

**URL:** https://aistudio.google.com/app/apikey

1. Go to Google AI Studio
2. Create API key
3. Copy the key
4. Save it securely

**Cost:** Very low (often free tier is sufficient)

---

## 🌐 Step 2: Deploy to Vercel

### **A) Via GitHub (Recommended)**

1. **Commit all changes:**
```bash
git add .
git commit -m "Add AI Video Generator with GPT-Image-1 + GetImg.ai"
git push origin main
```

2. **Vercel will auto-deploy** (if already connected)

### **B) Via Vercel CLI**

```bash
vercel deploy --prod
```

---

## ⚙️ Step 3: Configure Environment Variables on Vercel

### **Go to Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

### **Add these variables:**

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `OPENAI_API_KEY` | `sk-proj-...` | From OpenAI Platform |
| `GETIMG_API_KEY` | `your_getimg_key` | From GetImg.ai Dashboard |
| `GEMINI_API_KEY` | `your_gemini_key` | From Google AI Studio |

**Important:** After adding variables, redeploy:
```bash
vercel --prod
```

Or trigger redeploy from Vercel Dashboard → Deployments → Redeploy

---

## 🧪 Step 4: Test the System

### **Test 1: API Configuration Check**

**URL:** `https://your-domain.vercel.app/api/video-gen/test`

**Expected Response:**
```json
{
  "configured": true,
  "services": {
    "OpenAI (GPT-Image-1)": "✅ Configured",
    "GetImg.ai (Video)": "✅ Configured",
    "Gemini (Nano Banana Pro)": "✅ Configured"
  },
  "message": "All APIs configured! Ready to generate videos."
}
```

**If you see ❌ Missing:**
- Double-check environment variables in Vercel
- Make sure you redeployed after adding them
- Verify the keys are correct (no extra spaces)

### **Test 2: Generate a Short Video (5 seconds)**

1. **Go to:** `https://your-domain.vercel.app/apps/video-gen`

2. **Enter this prompt:**
```
A cute cat sitting on a windowsill, looking outside at falling snow, cinematic lighting
```

3. **Settings:**
- Duration: **5 seconds** (1 segment - fastest test)
- Style: **Cinematic**

4. **Click "Generate Video"**

5. **Expected Timeline:**
- ~10-15s: Generating start frame
- ~10-15s: Generating end frame
- ~30-45s: Creating video segment
- **Total: ~60-75 seconds**

6. **Expected Result:**
- ✅ 1 segment completed
- Video player shows the 5-second clip
- Download button works
- Cost shown: ~$0.22

**If it fails:**
- Check browser console for errors
- Check Vercel function logs (Dashboard → Deployments → View Function Logs)
- Verify API keys are valid

### **Test 3: Generate a Medium Video (10 seconds)**

**Same as Test 2, but:**
- Duration: **10 seconds** (2 segments)
- Expected time: ~120-150 seconds
- Expected cost: ~$0.44

**This tests:**
- Multi-segment generation
- Frame continuity between segments
- Sequential processing

### **Test 4: Stress Test (30 seconds)**

**Only run if Tests 1-3 pass!**

- Duration: **30 seconds** (6 segments)
- Expected time: ~6-7 minutes
- Expected cost: ~$1.32

**Note:** This will take several minutes. Don't close the browser tab!

---

## 📊 What to Monitor During Testing

### **In Browser Console:**
```javascript
// You should see logs like:
🎬 Starting video generation: 10s (2 segments)
🎨 Generating start frame...
✓ End frame generated
🎥 Generating video segment 1...
✓ Segment 1 completed in 45.2s
...
✅ Video generation complete!
```

### **In Vercel Function Logs:**
```
Initializing Daytona client...
🎬 Starting video generation: 10s (2 segments)
🎨 Generating start frame...
Video segment abc123 is processing...
Video abc123 status: completed (attempt 1/60)
✅ Video generation complete!
```

### **Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| `OPENAI_API_KEY not configured` | Missing env var | Add to Vercel, redeploy |
| `GETIMG_API_KEY not configured` | Missing env var | Add to Vercel, redeploy |
| `GPT-Image-1 not available` | Account needs verification | Complete OpenAI org verification |
| `Video generation timeout` | GetImg.ai slow/overloaded | Retry or increase timeout |
| `Function timeout (10s)` | Wrong runtime | Should use `edge` runtime |
| `Function timeout (60s)` | Need Vercel Pro | Upgrade or use shorter videos |

---

## 💰 Cost Breakdown (Per Video)

### **5-Second Video (1 segment):**
```
GPT-Image-1 Start Frame:  $0.06
GPT-Image-1 End Frame:    $0.06
GetImg.ai Video:          $0.10
─────────────────────────────────
Total Cost:               $0.22
Charge User:              $0.50  (2.3x markup)
Your Profit:              $0.28
```

### **10-Second Video (2 segments):**
```
GPT-Image-1 Frames:       $0.18  (3 frames)
GetImg.ai Videos:         $0.20  (2 videos)
─────────────────────────────────
Total Cost:               $0.38
Charge User:              $1.00  (2.6x markup)
Your Profit:              $0.62
```

### **30-Second Video (6 segments):**
```
GPT-Image-1 Frames:       $0.42  (7 frames)
GetImg.ai Videos:         $0.60  (6 videos)
─────────────────────────────────
Total Cost:               $1.02
Charge User:              $3.00  (2.9x markup)
Your Profit:              $1.98
```

---

## 🐛 Debugging Checklist

### **Before Testing:**
- [ ] All environment variables added to Vercel
- [ ] Redeployed after adding env vars
- [ ] `/api/video-gen/test` returns all ✅
- [ ] OpenAI account has GPT-Image-1 access
- [ ] GetImg.ai account has credits/active subscription

### **During Testing:**
- [ ] Browser console shows progress logs
- [ ] No red errors in console
- [ ] Vercel function logs show activity
- [ ] No 500 errors in API responses

### **If Video Generation Fails:**
1. Check Vercel function logs
2. Verify API keys are correct
3. Check OpenAI usage limits
4. Check GetImg.ai credits
5. Try a shorter video (5s)
6. Simplify the prompt

---

## 📈 Performance Optimization Tips

### **For Faster Generation:**
1. Use shorter prompts (less processing)
2. Start with 5-second videos
3. Use "realistic" style (often faster than "cinematic")
4. Avoid complex scenes with many objects

### **For Better Quality:**
1. Use detailed, specific prompts
2. Mention camera angles ("close-up", "wide shot")
3. Specify lighting ("soft lighting", "golden hour")
4. Add style keywords ("photorealistic", "4K", "detailed")

### **For Cost Savings:**
1. Start with low quality for testing
2. Cache successful frames for similar prompts
3. Implement rate limiting
4. Add usage limits per user

---

## 🚀 Next Steps After Testing

### **If All Tests Pass:**

1. **Enable for production:**
   - Remove BETA status from app card
   - Add to main navigation
   - Create demo video for marketing

2. **Add advanced features:**
   - Streaming progress updates (Server-Sent Events)
   - Video stitching (combine segments automatically)
   - Template library (pre-made prompts)
   - Voice-over generation (ElevenLabs)
   - Background music (Suno AI)

3. **Optimize costs:**
   - Implement caching for similar frames
   - Add volume discounts
   - Negotiate bulk pricing with GetImg.ai

4. **Marketing:**
   - Create demo videos
   - Share on Twitter/X
   - Post on Product Hunt
   - Add to landing page

### **If Tests Fail:**

1. **Check this doc for troubleshooting**
2. **Review Vercel function logs**
3. **Test each API separately:**
   - Test OpenAI: `/api/video-gen/test-openai` (create if needed)
   - Test GetImg.ai: `/api/video-gen/test-getimg` (create if needed)
4. **Contact support if needed:**
   - OpenAI: https://help.openai.com
   - GetImg.ai: https://getimg.ai/support

---

## 📝 Quick Start Commands

```bash
# 1. Commit and push
git add .
git commit -m "Add AI Video Generator"
git push origin main

# 2. Deploy to Vercel
vercel --prod

# 3. Test API configuration
curl https://your-domain.vercel.app/api/video-gen/test

# 4. Open video generator
open https://your-domain.vercel.app/apps/video-gen
```

---

## 🎯 Testing Checklist

- [ ] API test endpoint returns all ✅
- [ ] Can generate 5-second video successfully
- [ ] Can generate 10-second video successfully
- [ ] Video segments are downloadable
- [ ] Cost calculations are correct
- [ ] Usage tracking works
- [ ] Error handling works (try invalid prompt)
- [ ] Mobile responsive design works
- [ ] Dashboard link from nav works

---

## 🎉 Success Criteria

**You're ready for production when:**

✅ All API keys configured and verified  
✅ 5-second test video generates successfully  
✅ 10-second test video generates successfully  
✅ Videos are high quality and smooth  
✅ Frame continuity is maintained  
✅ No errors in Vercel logs  
✅ Cost tracking is accurate  
✅ UI is responsive and polished  

---

**Ready to test? Start with Step 3! 🚀**
