# Complete Project Context Prompt

Use this prompt to give Claude (or any AI assistant) full context about this project:

---

## Prompt:

```
I have a Next.js 14 AI platform called JoePro.ai. Here's the complete context:

PROJECT STATE:
Read PROJECT_STATE.md for complete details. Key points:
- Next.js 14 with App Router, TypeScript, Tailwind CSS
- AI features: OpenAI GPT-4o, xAI Grok 2, Daytona cloud sandboxes
- Professional design: Deep purple palette, Linear/Vercel inspired
- Interactive neural network canvas background
- Fully responsive, dark/light mode support

DESIGN SPECIFICATIONS:
Colors:
- Primary: #6366f1 (deep indigo)
- Background (dark): #0a0a14 (navy black)
- Background (light): #fafafa (off-white)
- Text muted: #64748b / #94a3b8

Typography:
- Headlines: 96-128px, font-weight 800, tracking -0.03em
- Main headline: "Build Faster / with AI Agents" (gradient on second line)
- Body: 18px, font-weight 500
- System font stack (Apple/SF Pro style)

Components:
- Hero section with badge, headline, CTAs, 3 service cards
- Primary button: Purple gradient, white text, subtle lift on hover
- Secondary button: Bordered, background matches card
- Service cards: White/dark cards, 1px border, arrow on hover, -4px lift

Animation:
- Page load: fade-up 20px, 500-700ms duration
- Hover: translateY(-1 to -4px), 200ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- All animations respect prefers-reduced-motion

Layout:
- Max width: 1280px
- Center-aligned hero
- Generous spacing (24-48px)
- 3-column grid for service cards (responsive to single column)

CURRENT APPEARANCE:
Homepage:
- Neural network canvas background (subtle, mouse-interactive)
- Center-aligned hero section
- Small badge: "Professional AI Platform" with sparkle icon
- Large bold headline split across 2 lines
- Short subheadline (1 sentence)
- 2 CTA buttons side-by-side (desktop) or stacked (mobile)
- 3 service cards below: Followlytics 📊, StakeSmith 💎, Neural Salvage 🔧
- Each card shows icon, name, description, and arrow on hover

Style:
- Professional B2B SaaS aesthetic
- NOT cyberpunk, NOT neon, NOT gaming
- Similar to Linear.app, Vercel.com, Stripe.com
- Clean, modern, confident
- High contrast for readability
- Subtle shadows and borders

TECH STACK:
- Framework: Next.js 14, React 18, TypeScript 5
- Styling: Tailwind CSS 3.4, Framer Motion 12
- AI: OpenAI SDK, @ai-sdk/openai, @daytonaio/sdk
- Icons: Lucide React
- Other: axios, rss-parser, zod

FILE STRUCTURE:
app/
  page.tsx - Homepage
  layout.tsx - Root layout
  globals.css - Styles
  agents/page.tsx - AI agents
  apps/chat/page.tsx - Chat UI
  devenv/page.tsx - Daytona sandboxes
  api/*/route.ts - API routes

components/
  Hero.tsx - Main hero section
  NeuralNetCanvas.tsx - Background canvas
  GlowCard.tsx - Card component
  ChatWidget.tsx - Chat UI

lib/
  llm/daytona-client.ts - Daytona SDK
  llm/providers.ts - AI configs
  feeds/scraper.ts - RSS parser

STATUS:
✅ Working: Homepage, AI chat, AI agents, RSS feeds, navigation, design system
🟡 Partial: Daytona sandboxes (needs API key + testing)
📝 Documented: Complete specs in PROJECT_STATE.md, REDESIGN_BRIEF.md

ENVIRONMENT VARS NEEDED:
- OPENAI_API_KEY
- XAI_API_KEY
- DAYTONA_TOKEN

DEPLOYMENT:
- Target: Vercel
- Auto-deploys from main branch
- Build: npm run build
- Dev: npm run dev (localhost:3000)

[Ask your question or request changes based on this context]
```

---

## Alternative Shorter Prompt:

```
This is JoePro.ai - a Next.js 14 AI platform with:

Design: Professional B2B SaaS (Linear/Vercel style)
- Deep purple (#6366f1) + dark navy (#0a0a14)
- Large bold headlines (96-128px, weight 800)
- Headline: "Build Faster / with AI Agents"
- Clean cards, subtle animations, neural network background
- NOT cyberpunk or neon

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion
Features: AI agents (Grok 2), AI chat (GPT-4o), cloud sandboxes (Daytona)
Files: Hero.tsx (hero section), NeuralNetCanvas.tsx (background), globals.css (styles)

Read PROJECT_STATE.md for complete specs.

[Your question/request]
```

---

## For Design-Specific Questions:

```
Design specs for JoePro.ai:

Colors:
- Primary: #6366f1 (deep purple/indigo)
- Dark mode bg: #0a0a14 (navy black)
- Light mode bg: #fafafa
- Borders: subtle, low contrast
- Text: high contrast (#0a0a0a / #f8fafc)

Typography:
- Headlines: 6-8rem, extrabold, tight tracking (-0.03em)
- Body: 1.125rem, medium weight
- Font: System sans-serif (SF Pro / Segoe UI style)

Layout:
- Max width: 1280px, center-aligned
- Generous spacing (24-48px between sections)
- Hero + 3 service cards below
- Mobile: single column, stacked buttons

Components:
- Buttons: Gradient primary, bordered secondary, 8px radius
- Cards: 1px border, 12px radius, subtle shadow on hover
- Badge: Small pill with border, 16px padding
- Animations: 200-500ms, subtle lifts/fades

Style: Professional B2B, like Linear/Vercel/Stripe
NOT: Gaming, cyberpunk, neon, web3

[Your design question]
```

---

## For Code-Specific Questions:

```
JoePro.ai - Next.js 14 AI platform codebase:

Structure:
- app/page.tsx: Homepage (Hero + NeuralNetCanvas)
- components/Hero.tsx: Main hero section
- app/globals.css: Design system + utilities
- lib/llm/daytona-client.ts: Daytona SDK integration

Key files:
- Hero section: Large headline, CTAs, service cards
- Neural canvas: Interactive background (mouse-sensitive)
- Global styles: CSS vars for colors, button utilities

Stack: Next.js 14 App Router, TypeScript, Tailwind, Framer Motion
APIs: OpenAI, xAI Grok, Daytona

Current state:
✅ Hero, chat, agents working
🟡 Daytona needs env var testing
📝 Full specs in PROJECT_STATE.md

[Your code question]
```

---

## Quick Reference

**Key Files to Read:**
1. `PROJECT_STATE.md` - Complete project snapshot with exact specs
2. `REDESIGN_BRIEF.md` - Design philosophy and guidelines
3. `CLAUDE_PROMPT.md` - Quick design instructions
4. `components/Hero.tsx` - Main landing section
5. `app/globals.css` - Design system implementation

**Design Philosophy:**
Professional B2B SaaS platform inspired by Linear, Vercel, and Stripe. NOT cyberpunk, gaming, or neon aesthetic.

**Color Variables:**
```css
--primary: #6366f1
--background: #0a0a14 (dark) / #fafafa (light)
--foreground: #f8fafc (dark) / #0a0a0a (light)
--border: #27273a (dark) / #e5e7eb (light)
```

**Typography:**
- H1: 96-128px, weight 800, tracking -0.03em
- Body: 18px, weight 500
- Muted: 14px, color var(--text-muted)

**Animation Timing:**
- Hover: 200ms
- Page load: 500-700ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

---

**Choose the appropriate prompt length based on your needs. All reference PROJECT_STATE.md for complete details.**
