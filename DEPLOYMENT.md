# 🚀 JoePro.ai - Deployment Guide

This guide will help you deploy JoePro.ai to Vercel with all features working correctly.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository (optional for Vercel deployment)
- OpenAI API key
- xAI API key (optional)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- TypeScript
- Tailwind CSS + Autoprefixer
- Framer Motion
- OpenAI SDK
- RSS Parser
- All necessary type definitions

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
XAI_API_KEY=your-xai-api-key-here
DAYTONA_TOKEN=your-daytona-token-here
```

**Important Notes:**
- `OPENAI_API_KEY` is required for `/api/llm` and agent features
- `XAI_API_KEY` is required for xAI/Grok integration
- `DAYTONA_TOKEN` is optional (stub implementation)

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your app.

## Build and Test Locally

### 1. Run Production Build

```bash
npm run build
```

This will:
- Compile TypeScript
- Build all pages and API routes
- Optimize assets
- Generate static pages where possible

### 2. Test Production Build

```bash
npm start
```

Visit http://localhost:3000 to test the production build.

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy to Preview

```bash
vercel
```

This creates a preview deployment. Vercel will:
- Detect it's a Next.js project
- Use the settings from `vercel.json`
- Build and deploy your application
- Provide a preview URL

#### Step 4: Set Environment Variables

In the Vercel dashboard or via CLI:

```bash
vercel env add OPENAI_API_KEY
vercel env add XAI_API_KEY
vercel env add DAYTONA_TOKEN
```

Select "Production" when prompted.

#### Step 5: Deploy to Production

```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

#### Step 1: Push to Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

#### Step 2: Import Project in Vercel

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel auto-detects Next.js configuration
4. Click "Deploy"

#### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   - `OPENAI_API_KEY` (Production, Preview, Development)
   - `XAI_API_KEY` (Production, Preview, Development)
   - `DAYTONA_TOKEN` (optional)
3. Redeploy if needed

### Option 3: One-Click Deploy

Click the button below to deploy directly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/joepro)

**Note:** You'll need to set environment variables after deployment.

## Vercel Configuration Explained

The project includes a `vercel.json` file with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Runtime Configuration

- **Edge Runtime**: Used for `/api/llm` and `/api/agents/run` (fast streaming)
- **Node Runtime**: Used for `/api/gadgets/status` (uses Node.js `os` module)
- **Default**: Node.js for pages with data fetching

## Post-Deployment Verification

### 1. Test Homepage

Visit your deployment URL. You should see:
- ✅ Animated neural network background
- ✅ Neon-styled hero section
- ✅ Navigation working
- ✅ Responsive design

### 2. Test API Endpoints

#### LLM API (requires API keys)

```bash
curl -X POST https://your-domain.vercel.app/api/llm \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4-turbo-preview",
    "messages": [{"role": "user", "content": "Hello"}],
    "temperature": 0.7
  }'
```

#### Tech Feeds API

```bash
curl https://your-domain.vercel.app/api/feeds
```

#### Gadgets API

```bash
curl https://your-domain.vercel.app/api/gadgets/latest
curl https://your-domain.vercel.app/api/gadgets/status
```

### 3. Test Pages

- **Apps**: https://your-domain.vercel.app/apps
- **Agents**: https://your-domain.vercel.app/agents
- **Feeds**: https://your-domain.vercel.app/feeds

## Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### 2. Update DNS Records

Add these records at your DNS provider:

**For root domain (example.com):**
```
A     @     76.76.21.21
```

**For www subdomain:**
```
CNAME www   cname.vercel-dns.com
```

### 3. Enable HTTPS

Vercel automatically provisions SSL certificates via Let's Encrypt.

## Performance Optimization

### Already Configured

✅ **SWC Minification**: Faster builds and smaller bundles  
✅ **Edge Runtime**: Low-latency API responses  
✅ **Image Optimization**: AVIF/WebP formats  
✅ **React Strict Mode**: Better development experience  
✅ **Streaming Responses**: Real-time AI completions  
✅ **Code Splitting**: Automatic per-route optimization  

### Monitoring

Enable Vercel Analytics:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. Monitor performance in real-time

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build

**Solution**: Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Routes Return 500

**Issue**: Missing environment variables

**Solution**: Verify all API keys are set in Vercel:
```bash
vercel env ls
```

### Neural Canvas Not Rendering

**Issue**: Browser compatibility

**Solution**: The canvas uses modern browser APIs. Ensure users are on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### RSS Feeds Fail

**Issue**: CORS or network errors

**Solution**: 
- Feeds are fetched server-side (no CORS issues)
- Check if feed sources are accessible
- Verify `revalidate = 300` in `/api/feeds/route.ts`

### Rate Limiting

**Issue**: OpenAI rate limits exceeded

**Solution**: 
- Built-in rate limiting in `openai-client.ts` (60 req/min)
- Increase limits in your OpenAI account
- Implement caching for common queries

## Monitoring and Logs

### View Logs in Vercel

```bash
vercel logs your-deployment-url
```

Or in the dashboard:
1. Go to Deployments
2. Click on a deployment
3. View Runtime Logs

### Error Tracking

Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance
- Custom logging in API routes

## Security Best Practices

### Already Implemented

✅ **API Key Protection**: Never exposed to client  
✅ **Security Headers**: CSP, X-Frame-Options, etc.  
✅ **HTTPS Only**: Enforced by Vercel  
✅ **CORS Configuration**: Controlled in `vercel.json`  
✅ **Input Validation**: Using Zod schemas  

### Additional Recommendations

1. **Rate Limiting**: Implement IP-based rate limiting for public APIs
2. **API Key Rotation**: Regularly rotate OpenAI/xAI keys
3. **Environment Separation**: Use different keys for preview/production
4. **Audit Logs**: Log all API requests for monitoring

## Scaling Considerations

### Current Architecture

- **Stateless**: No database, perfect for horizontal scaling
- **Edge Functions**: Auto-scale globally
- **Caching**: RSS feeds cached for 5 minutes
- **Rate Limiting**: Built-in protection

### Future Enhancements

- Add Redis for caching and rate limiting
- Implement database for agent configurations
- Add queue system for long-running tasks
- Set up CDN for static assets

## Cost Estimation

### Vercel Costs

- **Hobby Plan**: Free (100GB bandwidth, 100 hrs build time/month)
- **Pro Plan**: $20/month (1TB bandwidth, 400 hrs build time)
- **Enterprise**: Custom pricing

### API Costs

- **OpenAI**: Pay per token (~$0.01-0.03 per 1K tokens)
- **xAI**: Check current pricing at https://x.ai/api
- **RSS Feeds**: Free (public APIs)

## Support and Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **xAI API**: https://x.ai/api/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## Rollback Strategy

### If deployment fails:

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

Or in Vercel Dashboard:
1. Go to Deployments
2. Find working deployment
3. Click "Promote to Production"

---

**Built with ⚡ by Machine AI**
