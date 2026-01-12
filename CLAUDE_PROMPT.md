# Prompt for Claude Code

Hi Claude, I need you to redesign this Next.js website to look professional, modern, and confident - like Vercel, Linear, or Stripe.

## Context
Read `REDESIGN_BRIEF.md` for full design requirements. Here's the summary:

**Current problem:** The site is functionally complete but looks bland and generic (basic blue/gray template).

**Goal:** Make it look like a premium B2B AI platform - professional, bold, modern, with subtle motion that suggests speed/efficiency.

## What to Change

### 1. Pick ONE Color Palette (from REDESIGN_BRIEF.md)
Choose either:
- **Option A:** Deep purple + electric blue (sophisticated)
- **Option B:** Slate + amber (warm professional)
- **Option C:** Monochrome + one bold accent (minimalist)

Update `app/globals.css` CSS variables accordingly.

### 2. Redesign Hero Section (`components/Hero.tsx`)
- Make headline **much larger and bolder** (64-80px, font-weight: 800-900)
- Tighten letter-spacing on headline (-0.03em)
- Shorten subheadline to 1-2 sentences max
- Make primary CTA button more prominent (gradient or solid bold color)
- Improve service card design (cleaner, subtle hover states)
- Add proper animation delays (stagger elements)

### 3. Update Global Styles (`app/globals.css`)
- Define clean color variables
- Better typography scale
- Subtle utility classes
- Remove any overly bright/neon colors
- Keep it professional

### 4. Animation Principles
- Subtle fade-up on page load (translate Y: 20px → 0)
- Gentle hover states (scale: 1.02 or translateY: -4px)
- Duration: 300-500ms
- Easing: ease-out or cubic-bezier(0.4, 0.0, 0.2, 1)

## Design References
Look at these for inspiration:
- **Vercel.com** - Clean, spacious, strong typography
- **Linear.app** - Bold sans-serif, tight tracking, purple accents
- **Stripe.com** - Professional gradients, smooth motion

## What NOT to Do
❌ No neon colors or excessive glows
❌ No cyberpunk aesthetic
❌ No rainbow gradients
❌ No literal "speed lines" backgrounds
❌ No over-animation

## Files to Modify
1. `app/globals.css` - Color variables, base styles
2. `components/Hero.tsx` - Main redesign work here
3. `app/page.tsx` - Only if layout needs adjustment

## Keep These
✅ Neural network background (it's already subtle and good)
✅ All existing functionality and links
✅ Dark/light mode support
✅ Framer Motion for animations (already installed)
✅ Responsive design

## Success Criteria
The redesign should feel like a **premium B2B SaaS platform** - think enterprise AI tools, not consumer apps. Professional, confident, modern, clean.

---

**Read REDESIGN_BRIEF.md for complete specifications. Think Vercel/Linear/Stripe - not neon cyberpunk.**
