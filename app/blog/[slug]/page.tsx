'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Copy, Check } from 'lucide-react'
import { useState } from 'react'

// Blog post content - maps slugs to full content
const postContent: Record<string, {
  title: string
  date: string
  readTime: string
  tags: string[]
  content: string
}> = {
  'building-prompt-racer': {
    title: 'Building Prompt Racer: A Real-Time AI Model Racing Platform',
    date: '2025-12-04',
    readTime: '20 min read',
    tags: ['AI', 'Next.js', 'Stripe', 'Tutorial'],
    content: `
## Project Overview

**Prompt Racer** is a Next.js web application that lets users race 4 leading AI models simultaneously to see which one responds fastest. The app features a no-signup pay-per-race monetization system powered by Stripe.

- **Live URL:** [prompt-racer.vercel.app](https://prompt-racer.vercel.app)
- **GitHub:** [github.com/JoeProAI/prompt-racer](https://github.com/JoeProAI/prompt-racer)

---

## Tech Stack

### Frontend
- **Next.js 15.5.7** - App Router with React Server Components
- **React 19.2.0** - Modern React with hooks
- **TypeScript** - Type-safe development
- **TailwindCSS v4** - Utility-first styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **OpenAI SDK** - GPT-4o integration
- **Anthropic SDK** - Claude Sonnet 4.5 integration
- **Google Generative AI SDK** - Gemini 2.0 Flash integration
- **xAI SDK** - Grok 4.1 Fast integration
- **Stripe** - Payment processing
- **Next.js Cookies** - Credit tracking

---

## The Four Racing Models

### 1. GPT-4o (OpenAI) - Green
- Balanced speed and intelligence
- Input: $2.50/M tokens, Output: $10/M tokens

### 2. Claude Sonnet 4.5 (Anthropic) - Purple
- Long context, nuanced responses
- Max Tokens: 1024 per race

### 3. Gemini 2.0 Flash (Google) - Blue
- Experimental fast model
- Multimodal capabilities

### 4. Grok 4.1 Fast (xAI) - Red
- Optimized for speed, no reasoning overhead
- 2M token context window

---

## Multi-Model Racing Implementation

### The Challenge
Create a racing interface where users submit a single prompt and watch 4 AI models compete in real-time.

### The Solution

**1. Parallel API Calls with Promise.allSettled** - All 4 models race simultaneously with no sequential bottlenecks.

**2. Lazy Client Initialization** - Getter functions for each AI client prevent build-time errors when env vars are missing.

**3. Precise Timing** - Date.now() for millisecond-accurate timing per model.

**4. Graceful Error Handling** - Individual try-catch blocks per model so if one fails, others continue racing.

---

## Monetization System (No Signup Required)

### Cookie-Based Credit Tracking

**Architecture Decision:**
- No user authentication or database
- All credit data stored in httpOnly cookies
- Simple, fast, privacy-friendly

**Security Features:**
- httpOnly: true - Prevents XSS attacks
- sameSite: lax - CSRF protection
- maxAge: 1 year - Long-term storage

### Pricing Tiers
1. **Free:** 3 races for new users
2. **Starter Pack:** $2.99 for 10 races ($0.30/race)
3. **Value Pack:** $4.99 for 25 races ($0.20/race) - Best Value
4. **24hr Unlimited:** $9.99 for 999 races

---

## Key Technical Decisions

### Why No User Accounts?

**Pros:**
- Zero friction for new users
- No database costs
- Privacy-friendly (no PII stored)
- Simple architecture
- Fast development

**Cons:**
- Credits tied to device/browser
- No cross-device sync

**Verdict:** For an MVP focused on rapid monetization, the pros outweigh cons.

### Why Promise.allSettled vs Promise.all?
- Promise.all fails if any promise rejects
- Promise.allSettled waits for all promises regardless of failures
- Perfect for racing where we want partial results even if some models fail

---

## Cost Analysis

**Per Race Costs:**
- GPT-4o: ~$0.05
- Claude: ~$0.04
- Gemini: ~$0.02
- Grok: ~$0.003
- **Total Cost:** ~$0.11 per race

**Profit Margins:**
- Starter Pack: $0.30 - $0.11 = $0.19 profit (63% margin)
- Value Pack: $0.20 - $0.11 = $0.09 profit (45% margin)

---

## Lessons Learned

### 1. Simple is Better
- No user accounts = 10x faster development
- Cookie-based system = zero infrastructure
- Stripe Checkout = payment in 1 day

### 2. Model API Differences
- OpenAI: Most reliable, consistent naming
- Anthropic: Different response structure (content array)
- Google: Experimental models can change
- xAI: Model naming conventions differ

### 3. Race Timing Matters
- Need minimum display time (2s) for UX
- Millisecond precision matters for credibility
- Users want to see the race happen

### 4. Pricing Psychology
- Best Value badge drives conversions
- Middle tier should be most attractive
- Free trials essential for conversion

---

## Conclusion

Prompt Racer demonstrates how to:
1. Build a real-time AI model comparison tool
2. Implement no-signup monetization with Stripe
3. Create a beautiful, performant Next.js app
4. Deploy to production in 2 days

**Key Metrics:**
- Development Time: 2 days
- Lines of Code: ~800 LOC
- API Integrations: 4 AI models + Stripe
- Build Time: ~5 seconds

**Live Demo:** [prompt-racer.vercel.app](https://prompt-racer.vercel.app)

---

*This project proves that modern web development tools (Next.js, Vercel, Stripe) enable rapid MVP development with production-ready features like payments and AI integrations.*

**Author:** Claude (Anthropic) + Joseph Gaither
**Date:** December 2024
    `
  },
  'claude-code-windows-setup': {
    title: 'Installing Claude Code on Windows: The Complete Guide',
    date: '2025-12-03',
    readTime: '8 min read',
    tags: ['AI', 'Tutorial', 'Windows', 'Development'],
    content: `
## What is Claude Code?

Claude Code is Anthropic's AI-powered coding assistant that lives in your terminal. Unlike browser-based AI assistants, Claude Code can:

- **Read and edit files** directly in your codebase
- **Run terminal commands** on your behalf
- **Navigate projects** and understand context across multiple files
- **Execute complex multi-step tasks** autonomously

Think of it as having a senior developer pair programming with you, but one that never gets tired and knows every programming language.

---

## Prerequisites

Before we start, you'll need:

- ✅ Windows 10 (version 2004+) or Windows 11
- ✅ Administrator access
- ✅ An Anthropic API key (or Claude Pro/Max subscription)
- ✅ About 15-30 minutes

---

## Choose Your Path

Claude Code now works natively on Windows! You have two options:

| **Option A: Native Windows** | **Option B: WSL** |
|------------------------------|-------------------|
| ⚡ Faster setup (5 min) | 🔧 Better for Unix tools |
| ✅ Works in PowerShell | ✅ Linux environment |
| ✅ Great for most projects | ✅ Matches production servers |

**Recommendation:** Start with Native Windows. Switch to WSL later if needed.

---

## Option A: Native Windows Setup (Recommended)

### Step 1: Install Node.js

Download and install from [nodejs.org](https://nodejs.org) (LTS version).

Or use winget:

\`\`\`powershell
winget install OpenJS.NodeJS.LTS
\`\`\`

Verify installation:

\`\`\`powershell
node --version  # Should show v20.x.x or higher
\`\`\`

### Step 2: Install Claude Code

\`\`\`powershell
npm install -g @anthropic-ai/claude-code
\`\`\`

### Step 3: Set API Key

\`\`\`powershell
$env:ANTHROPIC_API_KEY = "sk-ant-xxxxx"
\`\`\`

To make it permanent, add to your PowerShell profile or use System Environment Variables.

### Step 4: Run It!

\`\`\`powershell
cd C:\\Users\\YourName\\Projects\\my-app
claude
\`\`\`

**That's it!** You're ready to go. Skip to "Pro Tips" below.

---

## Option B: WSL Setup (For Unix Tools)

Use this if you need bash scripts, make, or Linux-specific tooling.

### Step 1: Install WSL

Open **PowerShell as Administrator**:

\`\`\`powershell
wsl --install
\`\`\`

Restart your computer when prompted.

### Step 2: Set Up Ubuntu

After restart, Ubuntu launches automatically. Create a username and password:

\`\`\`bash
Enter new UNIX username: yourname
New password: ********
\`\`\`

Update packages:

\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

### Step 3: Install Node.js (via NVM)

\`\`\`bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
\`\`\`

### Step 4: Install Claude Code

\`\`\`bash
npm install -g @anthropic-ai/claude-code
\`\`\`

### Step 5: Set API Key

\`\`\`bash
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxx"' >> ~/.bashrc
\`\`\`

### Step 6: Run It!

\`\`\`bash
cd /mnt/c/Users/YourName/Projects/my-app
claude
\`\`\`

---

## Authentication Options

### API Key (Pay-per-use)

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### Claude Pro/Max Subscription

\`\`\`bash
claude auth login
\`\`\`

This opens a browser window to authenticate with your Anthropic account.

That's it! You now have an AI pair programmer at your fingertips.

---

## Pro Tips

1. **Don't work from /mnt/c** - Clone projects to Linux home for 10x faster file operations
2. **Use VS Code Remote WSL** - Best of both worlds
3. **Be specific** - The more context you give Claude, the better results you get

---

## Cost Breakdown

- **API**: ~$0.10-$1 per session
- **Claude Pro** ($20/mo): Includes usage
- **Claude Max** ($100/mo): For power users

The ROI is insane. Time saved > money spent.

---

*Happy coding!*
    `
  },
  'welcome-to-joepro': {
    title: 'Welcome to JoePro.ai',
    date: '2025-11-15',
    readTime: '3 min read',
    tags: ['Announcement', 'Personal'],
    content: `
## The Beginning

Welcome to JoePro.ai - a place where I'll be sharing my journey building AI-powered tools and products.

---

## What to Expect

This blog will cover:

- **AI Development** - Building with Claude, GPT, and other AI models
- **Web Development** - Next.js, React, and modern web tech
- **Product Building** - From idea to launch
- **Lessons Learned** - The wins, the fails, and everything in between

---

## Why Start a Blog?

I've been building things for years, but rarely documented the process. That changes now.

Writing helps me:
1. **Clarify my thinking** - If I can't explain it, I don't understand it
2. **Help others** - Someone somewhere is stuck on the same problem I solved yesterday
3. **Track progress** - A journal of the journey

---

## What's Coming

I'm currently working on several AI-powered tools:

- **Followtronics** - Social media analytics
- **Neural Salvage** - Data recovery powered by AI
- **StakeSmith** - Investment insights

More details coming soon as each project progresses.

---

## Let's Connect

Follow along on X [@JoePro](https://x.com/JoePro) for real-time updates.

Thanks for being here. Let's build something great.

*- Joe*
    `
  }
}

export default function BlogPost() {
  const params = useParams()
  const slug = params.slug as string
  const post = postContent[slug]
  const [copied, setCopied] = useState(false)

  if (!post) {
    return (
      <main className="min-h-screen p-8 md:p-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-[var(--text-muted)] mb-8">The post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-[var(--primary)] hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </main>
    )
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnX = () => {
    const text = encodeURIComponent(`${post.title} by @JoePro`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  // Simple markdown to HTML (basic)
  const renderContent = (content: string) => {
    return content
      .split('\n\n')
      .map((block, i) => {
        // Headers
        if (block.startsWith('## ')) {
          return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-white">{block.replace('## ', '')}</h2>
        }
        if (block.startsWith('### ')) {
          return <h3 key={i} className="text-xl font-bold mt-8 mb-3 text-white">{block.replace('### ', '')}</h3>
        }
        
        // Code blocks
        if (block.startsWith('```')) {
          const lines = block.split('\n')
          const lang = lines[0].replace('```', '')
          const code = lines.slice(1, -1).join('\n')
          return (
            <pre key={i} className="my-6 p-4 bg-black/50 rounded-lg overflow-x-auto border border-[var(--border)]">
              <code className="text-sm text-green-400 font-mono">{code}</code>
            </pre>
          )
        }
        
        // Horizontal rules
        if (block.trim() === '---') {
          return <hr key={i} className="my-8 border-[var(--border)]" />
        }
        
        // Lists
        if (block.includes('\n- ') || block.startsWith('- ')) {
          const items = block.split('\n').filter(line => line.startsWith('- '))
          return (
            <ul key={i} className="my-4 space-y-2">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-[var(--text-muted)]">
                  <span className="text-[var(--primary)] mt-1">•</span>
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.replace('- ', '')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  }} />
                </li>
              ))}
            </ul>
          )
        }
        
        // Numbered lists
        if (block.match(/^\d+\./m)) {
          const items = block.split('\n').filter(line => line.match(/^\d+\./))
          return (
            <ol key={i} className="my-4 space-y-2 list-decimal list-inside">
              {items.map((item, j) => (
                <li key={j} className="text-[var(--text-muted)]">
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.replace(/^\d+\.\s*/, '')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  }} />
                </li>
              ))}
            </ol>
          )
        }
        
        // Regular paragraph
        if (block.trim()) {
          return (
            <p 
              key={i} 
              className="my-4 text-[var(--text-muted)] leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: block
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-sm">$1</code>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
              }}
            />
          )
        }
        
        return null
      })
  }

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ffd700]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d4a017]/10 rounded-full blur-[120px]" />
      </div>

      <article className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={shareOnX}
                className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                title="Share on X"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {renderContent(post.content)}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[var(--text-muted)]">
                Thanks for reading! Follow me on{' '}
                <a 
                  href="https://x.com/JoePro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  X
                </a>
                {' '}for more.
              </p>
            </div>
            <Link 
              href="/blog"
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              More Posts →
            </Link>
          </div>
        </footer>
      </article>
    </main>
  )
}
