# JoePro AI Platform - Complete Project State

**Last Updated:** Nov 18, 2025  
**Status:** Functional, professionally designed, ready for Vercel deployment  
**Commit:** `817f264`

---

## 🎯 Project Overview

**JoePro.ai** is a Next.js 14 AI platform showcasing professional AI services. It features:
- AI agents with Grok 2 and GPT-4o
- Cloud development sandboxes via Daytona.io
- RSS tech news feeds
- Social analytics integrations
- Interactive neural network background

**Target Audience:** Enterprise B2B customers, technical teams  
**Design Philosophy:** Professional SaaS platform - Linear/Vercel aesthetic

---

## 🏗️ Tech Stack

### Core
- **Next.js 14** - App Router, React Server Components
- **React 18** - Client components with hooks
- **TypeScript 5** - Full type safety
- **Tailwind CSS 3.4** - Utility-first styling

### AI & APIs
- **OpenAI API** - GPT-4o completions (`openai`, `@ai-sdk/openai`)
- **xAI Grok 2** - Agent conversations (via `ai` SDK)
- **Daytona SDK** - Cloud dev sandboxes (`@daytonaio/sdk` v0.115.0)

### UI & Animation
- **Framer Motion 12** - Smooth animations, gestures
- **Lucide React** - Icon library
- **Canvas API** - Neural network background

### Utilities
- **Axios** - HTTP requests
- **RSS Parser** - Feed aggregation
- **Zod** - Schema validation

---

## 🎨 Current Design Specifications

### Color Palette (Deep Purple + Blues)

**Light Mode:**
```css
--background: #fafafa
--foreground: #0a0a0a
--primary: #6366f1      /* Deep indigo */
--primary-dark: #4f46e5 /* Darker indigo */
--secondary: #64748b    /* Slate gray */
--accent: #3b82f6       /* Electric blue */
--border: #e5e7eb       /* Light gray border */
--card-bg: #ffffff      /* Pure white cards */
--text-muted: #64748b   /* Muted text */
```

**Dark Mode:**
```css
--background: #0a0a14   /* Near-black navy */
--foreground: #f8fafc   /* Off-white */
--card-bg: #151521      /* Dark card background */
--border: #27273a       /* Subtle border */
--text-muted: #94a3b8   /* Lighter muted text */
```

### Typography

**Font Stack:**
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
```

**Font Settings:**
- Letter spacing: -0.011em (slightly tight)
- Font features: 'cv11', 'ss01' (enhanced ligatures)
- Antialiasing: subpixel

**Type Scale:**
```
Headline (h1):  96-128px (6-8rem), weight: 800, tracking: -0.03em
Section (h2):   40px (2.5rem), weight: 700
Card title (h3): 18px (1.125rem), weight: 600
Body text:      18px (1.125rem), weight: 500
Muted text:     14px (0.875rem), weight: 500
```

### Layout & Spacing

**Container:**
- Max width: 80rem (1280px)
- Padding: 1.5rem (24px) mobile, 3rem (48px) desktop

**Spacing Scale:**
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
4xl: 96px
```

### Component Styles

#### **Buttons**

**Primary (`.btn-primary`):**
```css
background: linear-gradient(135deg, #6366f1, #4f46e5);
color: white;
font-weight: 600;
border-radius: 8px;
padding: 16px 32px;
hover: translateY(-1px) + shadow(0 8px 16px rgba(99,102,241,0.3));
transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Secondary (`.btn-secondary`):**
```css
border: 1px solid var(--border);
background: var(--card-bg);
color: var(--foreground);
font-weight: 600;
border-radius: 8px;
padding: 16px 32px;
hover: border-color(var(--primary)) + translateY(-1px);
```

#### **Cards**

```css
background: var(--card-bg);
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;
hover: border-color(var(--primary)) + translateY(-4px) + shadow-lg;
transition: all 200ms;
```

#### **Badge**

```css
border: 1px solid var(--border);
background: var(--card-bg);
border-radius: 9999px;
padding: 6px 16px;
font-size: 14px;
font-weight: 500;
```

### Animation Specs

**Page Load Animations:**
```javascript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5-0.7s, delay: 0-0.3s }
```

**Hover Animations:**
```javascript
whileHover: { y: -1 to -4 }  // Subtle lift
transition: { duration: 200ms }
```

**Easing:**
```
cubic-bezier(0.4, 0, 0.2, 1)  // Material Design ease-out
```

**Scroll Indicator:**
```javascript
animate: { y: [0, 8, 0] }
transition: { duration: 2s, repeat: Infinity, ease: "easeInOut" }
```

---

## 📄 Page-by-Page Breakdown

### Homepage (`/`)

**Structure:**
```
[Neural Network Canvas Background - fixed, z-index: -10]
  └─ [Hero Section]
       ├─ Badge: "Professional AI Platform" + Sparkles icon
       ├─ Headline: "Build Faster / with AI Agents" (96-128px, gradient)
       ├─ Subheadline: One-sentence value prop (18-20px)
       ├─ CTA Buttons: "Book Consultation" + "Try AI Agents"
       └─ Service Cards: 3-column grid (Followlytics, StakeSmith, Neural Salvage)
```

**Headline Styling:**
- Line 1: "Build Faster" (solid foreground color)
- Line 2: "with AI Agents" (purple-to-blue gradient)
- Font size: 96px desktop, 72px tablet, 64px mobile
- Line height: 1.1
- Letter spacing: -0.03em

**Service Cards (3):**
1. **Followlytics** - 📊 icon, purple hover border
2. **StakeSmith** - 💎 icon, purple hover border  
3. **Neural Salvage** - 🔧 icon, purple hover border

Each card:
- White/dark background
- 1px border (default: var(--border), hover: var(--primary))
- Arrow icon appears on hover (right side)
- Lifts -4px on hover
- Shadow increases on hover

**Neural Network Background:**
- Canvas element, full viewport
- Animated nodes (circles) with physics
- Nodes connect when close (lines)
- Mouse interaction: nodes attract to cursor
- Colors: Muted grays (20-30% opacity)
- Dark mode: Lighter nodes on dark background
- Respects `prefers-reduced-motion`

### AI Agents (`/agents`)

**Features:**
- Create custom agents with system prompts
- Image upload for vision analysis
- Grok 2 integration
- Message history
- Agent configuration UI

**Current Status:** ✅ Functional

### AI Chat (`/apps/chat`)

**Features:**
- Floating chat widget (bottom-right)
- OpenAI GPT-4o completions
- Streaming responses

**Current Status:** ✅ Functional

### Cloud Sandboxes (`/devenv`)

**Features:**
- 6 pre-configured templates (Node, Python, React, Next.js, Full Stack, AI/ML)
- One-click launch
- Maps to Daytona snapshots: `daytona-small`, `daytona-medium`, `daytona-large`
- Error display UI (red banner)
- Success message with auto-open

**Current Status:** 🟡 SDK implemented, needs API key + snapshot verification

### RSS Feeds (`/feeds`)

**Features:**
- Aggregates tech news from multiple RSS feeds
- Sorted by publish date
- Card-based layout

**Current Status:** ✅ Functional

---

## 🔧 File Structure

```
joepro/
├── app/
│   ├── page.tsx                      # Homepage (Hero + Neural Canvas)
│   ├── layout.tsx                    # Root layout + nav
│   ├── globals.css                   # Global styles + utilities
│   ├── agents/page.tsx               # AI agents UI
│   ├── apps/chat/page.tsx            # Chat interface
│   ├── devenv/page.tsx               # Daytona sandbox launcher
│   ├── feeds/page.tsx                # RSS feeds
│   └── api/
│       ├── chat/route.ts             # OpenAI/Grok completions
│       ├── feeds/route.ts            # RSS aggregation
│       └── daytona/workspaces/route.ts # Sandbox creation
│
├── components/
│   ├── Hero.tsx                      # Landing hero section
│   ├── NeuralNetCanvas.tsx           # Interactive canvas background
│   ├── GlowCard.tsx                  # Reusable card component
│   └── ChatWidget.tsx                # Floating chat UI
│
├── lib/
│   ├── llm/
│   │   ├── daytona-client.ts         # Daytona SDK wrapper
│   │   └── providers.ts              # AI provider configs
│   └── feeds/
│       └── scraper.ts                # RSS parser
│
├── public/                           # Static assets
├── .env.local.example                # Env var template
├── package.json                      # Dependencies
├── REDESIGN_BRIEF.md                 # Design specifications
├── CLAUDE_PROMPT.md                  # Quick Claude instructions
├── PROJECT_SUMMARY.md                # Tech stack overview
└── DAYTONA_STATUS.md                 # Daytona debugging guide
```

---

## 🚀 Environment Variables

**Required for full functionality:**

```bash
OPENAI_API_KEY=sk-...           # OpenAI API key
XAI_API_KEY=xai-...             # xAI Grok API key
DAYTONA_TOKEN=...               # Daytona cloud dev token
```

**Get Daytona Token:**
1. Go to https://app.daytona.io/dashboard/keys
2. Create key with `write:sandboxes` permission
3. Copy and set as `DAYTONA_TOKEN`

**Daytona Snapshots Required:**
- `daytona-small` (Node.js, Python)
- `daytona-medium` (React, Next.js)
- `daytona-large` (Full Stack, AI/ML)

---

## ✅ What's Working

- ✅ Homepage with hero section
- ✅ Neural network canvas background
- ✅ AI chat with OpenAI GPT-4o
- ✅ AI agents with Grok 2
- ✅ RSS feed aggregation
- ✅ All navigation links
- ✅ Dark/light mode support
- ✅ Responsive design (mobile → desktop)
- ✅ External service links (Followlytics, StakeSmith, Neural Salvage)
- ✅ Professional design system (Linear/Vercel inspired)

---

## 🟡 Partially Working

### Daytona Cloud Sandboxes

**Status:** Code complete, SDK installed, needs configuration

**What's Done:**
- SDK installed (`@daytonaio/sdk` v0.115.0)
- Client code using correct method names
- API route with error handling
- UI with error display
- Template mapping to snapshots

**What's Needed:**
- Set `DAYTONA_TOKEN` env var in Vercel
- Verify snapshots exist in Daytona dashboard
- Test actual sandbox creation

**Current Code:**
```typescript
// lib/llm/daytona-client.ts
const daytonaClient = new Daytona({
  apiKey: process.env.DAYTONA_TOKEN!
});

const sandbox = await daytonaClient.create({
  snapshot: template.snapshotName,  // e.g., 'daytona-small'
  name: `joepro-${template}-${Date.now()}`,
  public: true,
});

const preview = await sandbox.getPreviewLink(3000);
// Returns: { url: string, token: string }
```

---

## 🔴 Known Issues

### 1. Daytona Implementation Uncertainty

**Issue:** SDK code is written but untested. Possible mismatches:
- Snapshot names might need to be IDs not names
- Port 3000 might not exist on all snapshots
- `public: true` parameter might not exist

**Solution:** Test with real Daytona API, adjust based on errors

### 2. Text Balance Utility

**Issue:** `.text-balance` CSS utility used in Hero might not work in all browsers

**Browser Support:**
- Chrome 114+: ✅
- Firefox: ❌
- Safari: ❌

**Fallback:** Text still displays, just doesn't balance lines

---

## 🎨 Design Decisions Explained

### Why Deep Purple?

Chosen for:
- **Professional:** Not childish or playful
- **Modern:** Used by Linear, Stripe, Twitch
- **Distinct:** Stands out from blue-heavy tech sites
- **Accessible:** Good contrast in dark mode

### Why Large, Bold Typography?

- **Confidence:** Large type = confident brand
- **Hierarchy:** Clear visual priority
- **Readability:** Easier to scan
- **Trend:** Modern SaaS aesthetic (Linear, Vercel)

### Why Subtle Animations?

- **Performance:** 60fps on all devices
- **Professional:** Doesn't feel gimmicky
- **Accessibility:** Respects reduced motion preference
- **Purpose:** Guides attention, doesn't distract

### Why Keep Neural Network Background?

- **Unique:** Most sites don't have this
- **Relevant:** Fits AI theme
- **Interactive:** Responds to mouse
- **Subtle:** Doesn't compete with content

---

## 📦 Dependencies

**Production:**
```json
{
  "@ai-sdk/openai": "^2.0.65",
  "@daytonaio/sdk": "^0.115.0",
  "ai": "^5.0.92",
  "axios": "^1.13.2",
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.553.0",
  "next": "14.2.33",
  "openai": "^6.8.1",
  "react": "^18",
  "react-dom": "^18",
  "rss-parser": "^3.13.0",
  "zod": "^4.1.12"
}
```

**Dev:**
```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "autoprefixer": "^10",
  "eslint": "^8",
  "eslint-config-next": "14.2.33",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

**Steps:**
1. Connect GitHub repo to Vercel
2. Set environment variables in project settings
3. Deploy automatically on push to `main`

**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Framework:** Next.js

**Environment Variables to Set:**
- `OPENAI_API_KEY`
- `XAI_API_KEY`
- `DAYTONA_TOKEN`

### Local Development

```bash
npm install
npm run dev
# Runs on http://localhost:3000
```

**Env file:** Copy `.env.local.example` to `.env.local` and add keys

---

## 🎯 Design System Summary

### Visual Language

**Mood:** Professional, confident, modern  
**Inspiration:** Linear, Vercel, Stripe  
**NOT:** Cyberpunk, gaming, web3, neon

### Core Principles

1. **Hierarchy First** - Make important things big
2. **Generous Spacing** - Let content breathe
3. **Subtle Motion** - Animate with purpose
4. **High Contrast** - Ensure readability
5. **Consistent Patterns** - Reuse components

### Do's and Don'ts

**DO:**
- ✅ Use deep purple as primary color
- ✅ Make headlines large and bold
- ✅ Keep animations under 500ms
- ✅ Use var(--*) for colors
- ✅ Test in dark mode

**DON'T:**
- ❌ Add neon glows or rainbow gradients
- ❌ Use more than 3 colors
- ❌ Over-animate (motion sickness)
- ❌ Add unnecessary decoration
- ❌ Break visual consistency

---

## 📊 Performance Targets

- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Animation Frame Rate:** 60fps
- **Bundle Size:** < 500kb (JS initial load)

---

## 🔄 Git Status

**Current Branch:** `main`  
**Latest Commit:** `817f264`  
**Commit Message:** "Professional redesign: Linear/Vercel inspired - bold typography, deep purple, clean cards + Daytona SDK fix + Claude prompt docs"

**Recent Changes:**
- Professional redesign (deep purple palette)
- Bold typography system
- Refined component styles
- Daytona SDK method fix (`getPreviewLink`)
- Documentation files (this file + REDESIGN_BRIEF + CLAUDE_PROMPT)

---

## 🎯 Next Steps

### Immediate (Required for Full Functionality)
1. Set `DAYTONA_TOKEN` in Vercel env vars
2. Verify Daytona snapshots exist in dashboard
3. Test `/devenv` sandbox launching
4. Monitor Vercel build logs for errors

### Future Enhancements (Optional)
1. Add testimonials section to homepage
2. Create pricing page
3. Add blog with MDX
4. Implement user authentication
5. Add analytics (Plausible or PostHog)
6. SEO optimization (meta tags, sitemap)

---

## 📝 Notes

- **CSS Lint Warnings:** `@tailwind` warnings are normal, can be ignored
- **Neural Canvas:** May slow down on very old devices (Canvas API intensive)
- **Dark Mode:** Automatically follows system preference
- **Mobile:** Fully responsive, tested down to 320px width
- **Browser Support:** Modern browsers only (Chrome 100+, Firefox 100+, Safari 15+)

---

**This document represents the complete state of the project as of Nov 18, 2025. Use it as a reference for development, debugging, or handoff to another developer.**
