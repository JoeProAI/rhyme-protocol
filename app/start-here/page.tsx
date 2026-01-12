import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Start Here: 30-Day AI Mastery Roadmap by JoePro | JoeProAI',
  description: 'JoePro\'s official 30-day AI mastery roadmap. Go from AI beginner to power user with step-by-step guidance from JoeProAI. Free resources, tutorials, and tools.',
  keywords: [
    'JoePro AI course', 'learn AI', '30 day AI challenge', 'AI mastery', 'JoeProAI tutorial',
    'AI beginner guide', 'how to learn AI', 'JoePro roadmap', 'AI learning path'
  ],
  openGraph: {
    title: 'Start Here: 30-Day AI Mastery Roadmap by JoePro',
    description: 'Your complete roadmap to AI mastery. Created by JoePro (JoeProAI).',
  },
}

const roadmap = [
  {
    week: 'Week 1: AI Foundations',
    theme: 'Understand the landscape and build your toolkit',
    days: [
      {
        day: 1,
        title: 'AI Landscape Overview',
        description: 'Understand the major AI models, companies, and capabilities',
        tasks: [
          'Read: What are LLMs and how do they work?',
          'Learn the difference between GPT-4, Claude, Gemini, and Grok',
          'Create accounts on ChatGPT, Claude, and Grok (all free tiers)',
        ],
        resource: 'JoePro\'s AI Landscape Guide',
        resourceUrl: '/best-ai-tools',
        timeEstimate: '45 min',
      },
      {
        day: 2,
        title: 'Prompt Engineering 101',
        description: 'Learn the basics of communicating with AI effectively',
        tasks: [
          'Learn the anatomy of a good prompt',
          'Practice: Role, Task, Format, Context framework',
          'Try 10 prompts from the JoePro Prompt Library',
        ],
        resource: 'JoePro Prompt Library',
        resourceUrl: '/prompt-library',
        timeEstimate: '1 hour',
      },
      {
        day: 3,
        title: 'AI for Research',
        description: 'Use AI for deep research and fact-finding',
        tasks: [
          'Try Grok for real-time research with X integration',
          'Learn how to verify AI-generated information',
          'Practice: Research a topic you\'re curious about end-to-end',
        ],
        resource: 'Grok on X',
        resourceUrl: 'https://x.com/i/grok',
        timeEstimate: '45 min',
      },
      {
        day: 4,
        title: 'AI for Writing',
        description: 'Supercharge your writing workflow',
        tasks: [
          'Use AI to outline a blog post or document',
          'Learn to edit and iterate with AI',
          'Practice: Transform a rough draft into polished content',
        ],
        resource: 'Claude.ai',
        resourceUrl: 'https://claude.ai',
        timeEstimate: '1 hour',
      },
      {
        day: 5,
        title: 'AI Image Generation',
        description: 'Create visuals with AI',
        tasks: [
          'Try DALL-E 3 in ChatGPT',
          'Experiment with Midjourney or Ideogram',
          'Create 5 images for a project you\'re working on',
        ],
        resource: 'Ideogram (free)',
        resourceUrl: 'https://ideogram.ai',
        timeEstimate: '1 hour',
      },
      {
        day: 6,
        title: 'AI Voice & Audio',
        description: 'Explore voice cloning and text-to-speech',
        tasks: [
          'Try ElevenLabs text-to-speech',
          'Experiment with voice cloning',
          'Create a short audio narration for content',
        ],
        resource: 'ElevenLabs',
        resourceUrl: 'https://elevenlabs.io',
        timeEstimate: '45 min',
      },
      {
        day: 7,
        title: 'Week 1 Review & Integration',
        description: 'Consolidate your learning and build a workflow',
        tasks: [
          'Document your favorite AI tools so far',
          'Create a personal AI toolkit note',
          'Identify 3 areas where AI saves you the most time',
        ],
        resource: 'Notion Template',
        resourceUrl: 'https://notion.so',
        timeEstimate: '30 min',
      },
    ],
  },
  {
    week: 'Week 2: AI for Productivity',
    theme: 'Automate your daily workflows',
    days: [
      {
        day: 8,
        title: 'AI-Powered Note Taking',
        description: 'Use AI to capture and organize information',
        tasks: [
          'Try NotebookLM with your documents',
          'Set up AI-powered meeting notes (Otter or Fireflies)',
          'Create a knowledge base from content you\'ve consumed',
        ],
        resource: 'NotebookLM',
        resourceUrl: 'https://notebooklm.google.com',
        timeEstimate: '1 hour',
      },
      {
        day: 9,
        title: 'Email & Communication AI',
        description: 'Write better emails faster',
        tasks: [
          'Use AI to draft email responses',
          'Create email templates for common scenarios',
          'Practice: Clear your inbox with AI assistance',
        ],
        resource: 'ChatGPT',
        resourceUrl: 'https://chat.openai.com',
        timeEstimate: '45 min',
      },
      {
        day: 10,
        title: 'Meeting Productivity',
        description: 'Never take manual meeting notes again',
        tasks: [
          'Set up automatic meeting transcription',
          'Learn to generate action items from transcripts',
          'Practice: Run a meeting with AI note-taking',
        ],
        resource: 'Fathom (free)',
        resourceUrl: 'https://fathom.video',
        timeEstimate: '1 hour',
      },
      {
        day: 11,
        title: 'AI for Reading & Learning',
        description: 'Consume content 10x faster',
        tasks: [
          'Use AI to summarize articles and papers',
          'Try YouTube transcript analysis',
          'Create a learning system with AI summaries',
        ],
        resource: 'Claude.ai',
        resourceUrl: 'https://claude.ai',
        timeEstimate: '1 hour',
      },
      {
        day: 12,
        title: 'Task Automation with AI',
        description: 'Connect AI to your other tools',
        tasks: [
          'Explore Zapier AI features',
          'Set up one AI automation',
          'Identify 5 tasks you could automate',
        ],
        resource: 'Zapier',
        resourceUrl: 'https://zapier.com',
        timeEstimate: '1 hour',
      },
      {
        day: 13,
        title: 'AI Calendar & Planning',
        description: 'Let AI manage your time',
        tasks: [
          'Try Reclaim.ai or Motion',
          'Set up AI-powered task scheduling',
          'Create a weekly planning prompt',
        ],
        resource: 'Reclaim.ai',
        resourceUrl: 'https://reclaim.ai',
        timeEstimate: '45 min',
      },
      {
        day: 14,
        title: 'Week 2 Review: Productivity Stack',
        description: 'Build your complete productivity system',
        tasks: [
          'Document your productivity AI stack',
          'Calculate time saved this week',
          'Share your setup on social media',
        ],
        resource: 'X @JoePro',
        resourceUrl: 'https://x.com/JoePro',
        timeEstimate: '30 min',
      },
    ],
  },
  {
    week: 'Week 3: AI for Creation',
    theme: 'Build and ship with AI assistance',
    days: [
      {
        day: 15,
        title: 'AI Coding: Getting Started',
        description: 'Write code faster with AI',
        tasks: [
          'Install GitHub Copilot or Cursor',
          'Complete a small coding task with AI help',
          'Learn prompt patterns for code generation',
        ],
        resource: 'Cursor',
        resourceUrl: 'https://cursor.sh',
        timeEstimate: '1.5 hours',
      },
      {
        day: 16,
        title: 'Building with AI Agents',
        description: 'Let AI do multi-step tasks',
        tasks: [
          'Try Windsurf or Cursor with agentic features',
          'Have AI build a simple tool end-to-end',
          'Learn when to use agents vs chat',
        ],
        resource: 'Windsurf',
        resourceUrl: 'https://codeium.com/windsurf',
        timeEstimate: '1.5 hours',
      },
      {
        day: 17,
        title: 'AI Video Creation',
        description: 'Generate videos from text',
        tasks: [
          'Try JoePro\'s AI Video Generator',
          'Experiment with Luma AI',
          'Create a short video clip',
        ],
        resource: 'JoePro Video Gen',
        resourceUrl: '/apps/video-gen',
        timeEstimate: '1 hour',
      },
      {
        day: 18,
        title: 'AI for Social Content',
        description: 'Create content at scale',
        tasks: [
          'Use AI to repurpose content across platforms',
          'Create a week\'s worth of social posts',
          'Try Opus Clip for video clips',
        ],
        resource: 'Opus Clip',
        resourceUrl: 'https://opus.pro',
        timeEstimate: '1 hour',
      },
      {
        day: 19,
        title: 'AI Website Building',
        description: 'Build websites with AI',
        tasks: [
          'Try v0.dev for UI generation',
          'Build a landing page with AI',
          'Deploy something live',
        ],
        resource: 'v0.dev',
        resourceUrl: 'https://v0.dev',
        timeEstimate: '1.5 hours',
      },
      {
        day: 20,
        title: 'AI Music & Audio Creation',
        description: 'Generate music and audio content',
        tasks: [
          'Try Suno or Udio for music',
          'Create background music for content',
          'Experiment with sound effects',
        ],
        resource: 'Suno',
        resourceUrl: 'https://suno.ai',
        timeEstimate: '1 hour',
      },
      {
        day: 21,
        title: 'Week 3 Project: Ship Something',
        description: 'Create and launch a complete project',
        tasks: [
          'Combine tools to create something real',
          'Ship it publicly (tweet, post, or deploy)',
          'Get feedback from at least 3 people',
        ],
        resource: 'JoePro.ai Apps',
        resourceUrl: '/apps',
        timeEstimate: '2 hours',
      },
    ],
  },
  {
    week: 'Week 4: AI Mastery & Beyond',
    theme: 'Advanced techniques and future-proofing',
    days: [
      {
        day: 22,
        title: 'Advanced Prompting',
        description: 'Level up your prompt engineering',
        tasks: [
          'Learn chain-of-thought prompting',
          'Master few-shot learning',
          'Create a personal prompt template library',
        ],
        resource: 'JoePro Prompt Library',
        resourceUrl: '/prompt-library',
        timeEstimate: '1 hour',
      },
      {
        day: 23,
        title: 'Local AI & Privacy',
        description: 'Run AI models on your own computer',
        tasks: [
          'Install Ollama',
          'Run a local LLM',
          'Understand when to use local vs cloud AI',
        ],
        resource: 'Ollama',
        resourceUrl: 'https://ollama.ai',
        timeEstimate: '1 hour',
      },
      {
        day: 24,
        title: 'AI APIs & Building',
        description: 'Integrate AI into your own projects',
        tasks: [
          'Get an OpenAI API key',
          'Make your first API call',
          'Build a simple AI-powered tool',
        ],
        resource: 'OpenAI Platform',
        resourceUrl: 'https://platform.openai.com',
        timeEstimate: '1.5 hours',
      },
      {
        day: 25,
        title: 'Custom GPTs & Assistants',
        description: 'Build AI tools for specific use cases',
        tasks: [
          'Create a Custom GPT',
          'Build an assistant for your workflow',
          'Share it with someone who\'d find it useful',
        ],
        resource: 'ChatGPT',
        resourceUrl: 'https://chat.openai.com',
        timeEstimate: '1 hour',
      },
      {
        day: 26,
        title: 'AI Ethics & Critical Thinking',
        description: 'Use AI responsibly',
        tasks: [
          'Learn about AI biases and limitations',
          'Develop a verification workflow',
          'Create guidelines for AI use in your work',
        ],
        resource: 'Anthropic Guidelines',
        resourceUrl: 'https://anthropic.com',
        timeEstimate: '45 min',
      },
      {
        day: 27,
        title: 'Building an AI-First Workflow',
        description: 'Design systems, not just use tools',
        tasks: [
          'Map your current workflows',
          'Identify AI enhancement points',
          'Design your ideal AI-augmented process',
        ],
        resource: 'Notion Template',
        resourceUrl: 'https://notion.so',
        timeEstimate: '1 hour',
      },
      {
        day: 28,
        title: 'Staying Current with AI',
        description: 'Never fall behind again',
        tasks: [
          'Set up AI news sources (X, newsletters)',
          'Follow key AI accounts',
          'Create a weekly AI learning habit',
        ],
        resource: 'Follow @JoePro on X',
        resourceUrl: 'https://x.com/JoePro',
        timeEstimate: '30 min',
      },
      {
        day: 29,
        title: 'Teaching & Sharing AI',
        description: 'Solidify knowledge by teaching',
        tasks: [
          'Write about what you\'ve learned',
          'Help someone else get started with AI',
          'Create content about your AI journey',
        ],
        resource: 'LinkedIn',
        resourceUrl: 'https://linkedin.com',
        timeEstimate: '1 hour',
      },
      {
        day: 30,
        title: 'Graduation Day',
        description: 'Celebrate and plan next steps',
        tasks: [
          'Review all 30 days of progress',
          'Document your AI stack and workflows',
          'Set 3 AI goals for the next 90 days',
          'Share your journey with #JoeProAI',
        ],
        resource: 'JoePro.ai',
        resourceUrl: '/',
        timeEstimate: '1 hour',
      },
    ],
  },
]

export default function StartHerePage() {
  const totalDays = roadmap.reduce((acc, week) => acc + week.days.length, 0)
  
  return (
    <main className="min-h-screen relative z-10 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Hero */}
        <header className="text-center mb-12">
          <p className="text-[var(--primary)] mb-2">Welcome to JoePro.ai</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Start Here</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] mb-4">
            30-Day AI Mastery Roadmap by JoePro
          </p>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            Go from AI curious to AI power user in 30 days. This is the exact roadmap JoePro (JoeProAI) 
            uses to teach AI skills. Free, practical, no fluff.
          </p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="glass card-border p-4 text-center">
            <p className="text-3xl font-bold text-[var(--primary)]">{totalDays}</p>
            <p className="text-sm text-[var(--text-muted)]">Days</p>
          </div>
          <div className="glass card-border p-4 text-center">
            <p className="text-3xl font-bold text-[var(--primary)]">~45</p>
            <p className="text-sm text-[var(--text-muted)]">Hours Total</p>
          </div>
          <div className="glass card-border p-4 text-center">
            <p className="text-3xl font-bold text-[var(--primary)]">Free</p>
            <p className="text-sm text-[var(--text-muted)]">Cost</p>
          </div>
        </div>

        {/* How to Use */}
        <section className="glass card-border p-6 mb-12">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">How to Use This Roadmap</h2>
          <ol className="list-decimal list-inside space-y-2 text-[var(--text-muted)]">
            <li><strong className="text-white">Commit 45-90 minutes daily</strong> - Consistency beats intensity</li>
            <li><strong className="text-white">Do the tasks</strong> - Reading isn&apos;t enough, you must practice</li>
            <li><strong className="text-white">Ship something each week</strong> - Create real outputs</li>
            <li><strong className="text-white">Share your progress</strong> - Tag @JoePro on X</li>
          </ol>
        </section>

        {/* Roadmap */}
        {roadmap.map((week, weekIndex) => (
          <section key={weekIndex} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">{week.week}</h2>
              <p className="text-[var(--text-muted)]">{week.theme}</p>
            </div>
            
            <div className="space-y-4">
              {week.days.map((day, dayIndex) => (
                <div key={dayIndex} className="glass card-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm text-[var(--primary)]">Day {day.day}</span>
                      <h3 className="font-bold text-white">{day.title}</h3>
                      <p className="text-sm text-[var(--text-muted)]">{day.description}</p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--card-bg)] px-2 py-1 rounded">
                      {day.timeEstimate}
                    </span>
                  </div>
                  
                  <ul className="mt-3 space-y-1">
                    {day.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                        <span className="text-[var(--primary)]">□</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <a 
                      href={day.resourceUrl}
                      target={day.resourceUrl.startsWith('http') ? '_blank' : undefined}
                      rel={day.resourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      {day.resource} →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="glass card-border p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Start?
          </h2>
          <p className="text-[var(--text-muted)] mb-6">
            Day 1 begins now. Share your commitment on X and tag @JoePro.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="https://x.com/intent/tweet?text=I%27m%20starting%20the%2030-Day%20AI%20Mastery%20Roadmap%20by%20%40JoePro!%20%F0%9F%9A%80%0A%0ADay%201%20begins%20now.%0A%0Ahttps%3A%2F%2Fjoepro.ai%2Fstart-here"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
            >
              Share on X
            </a>
            <Link 
              href="/best-ai-tools"
              className="px-6 py-3 border border-[var(--border)] hover:border-[var(--primary)] rounded-lg transition-colors"
            >
              Browse AI Tools
            </Link>
            <Link 
              href="/prompt-library"
              className="px-6 py-3 border border-[var(--border)] hover:border-[var(--primary)] rounded-lg transition-colors"
            >
              Get Prompts
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
