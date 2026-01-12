'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function JoeProAILabLaunch() {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnX = () => {
    const text = encodeURIComponent('Introducing JoePro AI Lab: Experimental AI Tools & HuggingFace Showcase by @JoePro')
    const url = encodeURIComponent(window.location.href)
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ffd700]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px]" />
      </div>

      <article className="max-w-4xl mx-auto">
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
            {['AI Lab', 'HuggingFace', 'Launch', 'Tools', 'Experimental'].map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Introducing JoePro AI Lab: Where Experimental AI Tools Come to Life
          </h1>

          <p className="text-xl text-[var(--text-muted)] mb-6">
            Launching our new AI Lab with interactive demos, HuggingFace integration, and a showcase of cutting-edge AI experiments.
          </p>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                January 6, 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                5 min read
              </span>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={shareOnX}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Share on X"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Copy link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <p className="lead text-lg text-[var(--text-muted)]">
            Today, I'm excited to announce the launch of <strong>JoePro AI Lab</strong> — a dedicated space for experimental AI tools, interactive demos, and cutting-edge AI research. Plus, we're officially establishing our presence on HuggingFace with <strong>JoePro Press</strong>.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">🧪 What is JoePro AI Lab?</h2>
          <p className="text-[var(--text-muted)] mb-6">
            The AI Lab is where I test, experiment, and showcase AI tools before they become production features. It's a sandbox for innovation where you can:
          </p>
          <ul className="space-y-2 text-[var(--text-muted)] mb-8">
            <li>✨ Try experimental AI features first</li>
            <li>🏁 Race AI models head-to-head with <strong>Prompt Racer</strong></li>
            <li>🤗 Explore pure <strong>HuggingFace-powered tools</strong></li>
            <li>🎨 Test image and video generation pipelines</li>
            <li>💬 Compare GPT-4, Claude, Gemini, and Grok side-by-side</li>
          </ul>

          <div className="not-prose my-8 p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h3 className="text-xl font-bold text-white">Check it out now</h3>
            </div>
            <a 
              href="https://joepro.ai/lab"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit JoePro AI Lab
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">🤗 JoePro Press: Our HuggingFace Showcase</h2>
          <p className="text-[var(--text-muted)] mb-6">
            Alongside the Lab, I've launched <strong>JoePro Press</strong> — a dedicated site featuring three pure HuggingFace-powered tools:
          </p>

          <div className="space-y-6 mb-8">
            <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">⚔️ Model Arena</h3>
              <p className="text-[var(--text-muted)]">
                Race open-source LLMs (Mistral 7B, Llama 3 8B, Phi-3, Gemma 7B) head-to-head. See which model responds fastest and best for your prompts.
              </p>
            </div>

            <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">🎨 Image Generator</h3>
              <p className="text-[var(--text-muted)]">
                Create images using FLUX.1-schnell, Stable Diffusion XL, and SD 2.1. All powered by HuggingFace Inference API.
              </p>
            </div>

            <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">🔍 Neural Analyzer</h3>
              <p className="text-[var(--text-muted)]">
                Image captioning, classification, and safety detection using BLIP, ViT, and NSFW detectors.
              </p>
            </div>
          </div>

          <div className="not-prose my-8 p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤗</span>
              <h3 className="text-xl font-bold text-white">Try JoePro Press</h3>
            </div>
            <a 
              href="https://joepro-press.vercel.app"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit JoePro Press
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">🎯 Why This Matters</h2>
          <p className="text-[var(--text-muted)] mb-6">
            The AI landscape is moving fast. Really fast. Having a dedicated Lab space allows me to:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-[var(--text-muted)] mb-8">
            <li><strong className="text-white">Experiment publicly</strong> — Ship features faster without worrying about production polish</li>
            <li><strong className="text-white">Gather feedback early</strong> — Get real user input before committing to full builds</li>
            <li><strong className="text-white">Showcase versatility</strong> — Demonstrate integration with multiple AI providers</li>
            <li><strong className="text-white">Build in the open</strong> — Share the journey, not just the destination</li>
          </ol>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">🛠️ The Full JoePro Toolkit</h2>
          <p className="text-[var(--text-muted)] mb-6">
            With the Lab launch, here's the complete JoePro ecosystem:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <h4 className="font-semibold text-white mb-2">Production Tools</h4>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                <li>• Video Generator (Luma AI)</li>
                <li>• Nano Banana (Image Editing)</li>
                <li>• Custom AI Agents</li>
                <li>• Dev Sandbox</li>
              </ul>
            </div>

            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
              <h4 className="font-semibold text-white mb-2">Experimental (Lab)</h4>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                <li>• Prompt Racer</li>
                <li>• JoePro Press (HF Tools)</li>
                <li>• Model Comparisons</li>
                <li>• AI Experiments</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">🔮 What's Next?</h2>
          <p className="text-[var(--text-muted)] mb-6">
            This is just the beginning. Coming soon to the Lab:
          </p>
          <ul className="space-y-2 text-[var(--text-muted)] mb-8">
            <li>🎬 <strong className="text-white">Audio-to-Video Pipeline</strong> — Transform podcast clips into visual content</li>
            <li>🧠 <strong className="text-white">Fine-tuned Models</strong> — Custom models for specific use cases</li>
            <li>📊 <strong className="text-white">Performance Benchmarks</strong> — Real-world AI model comparisons</li>
            <li>🤝 <strong className="text-white">HuggingFace Spaces</strong> — Deploy tools directly on HF</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">💬 Try It & Give Feedback</h2>
          <p className="text-[var(--text-muted)] mb-6">
            The Lab is live now. Jump in, break things, and let me know what you think:
          </p>

          <div className="not-prose flex flex-col gap-4 my-8">
            <a 
              href="https://joepro.ai/lab"
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors text-center font-medium"
            >
              🧪 Visit AI Lab
            </a>
            <a 
              href="https://joepro-press.vercel.app"
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-center font-medium"
            >
              🤗 Try JoePro Press
            </a>
            <a 
              href="https://x.com/JoePro"
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-center font-medium"
            >
              🐦 Share Feedback on X
            </a>
          </div>

          <p className="text-[var(--text-muted)] mb-6">
            Building in public, shipping fast, and sharing the journey. That's the JoePro way.
          </p>

          <p className="text-[var(--text-muted)] mb-6">
            — JoePro
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 bg-gradient-to-r from-[var(--primary)]/10 to-transparent border border-[var(--primary)]/20 rounded-lg">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to experiment?</h3>
          <p className="text-[var(--text-muted)] mb-6">
            Explore the AI Lab and see what's possible with cutting-edge AI tools.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/lab"
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium"
            >
              Visit AI Lab →
            </Link>
            <Link 
              href="/apps"
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
            >
              View All Tools
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
