import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About JoePro | JoeProAI - The Official AI Platform',
  description: 'Learn about JoePro (JoeProAI) - the AI developer and founder of JoePro.ai. Discover how JoePro builds cutting-edge AI tools, custom agents, and video generation technology.',
  keywords: [
    'JoePro', 'JoeProAI', 'about JoePro', 'who is JoePro', 'JoePro AI developer',
    'JoePro.ai founder', 'Joe Pro AI', 'joeproai about', 'joepro about'
  ],
  openGraph: {
    title: 'About JoePro | JoeProAI',
    description: 'Meet JoePro - AI developer, founder of JoePro.ai, and creator of innovative AI tools.',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen relative z-10 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-white">About </span>
            <span className="text-[var(--primary)]">JoePro</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            The mind behind JoeProAI and JoePro.ai
          </p>
        </header>

        {/* Main Content */}
        <article className="glass card-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">
            Who is JoePro?
          </h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            <strong className="text-white">JoePro</strong> (also known as <strong className="text-white">JoeProAI</strong>) 
            is an AI developer and innovator building the future of artificial intelligence. As the founder of 
            <strong className="text-white"> JoePro.ai</strong>, JoePro creates cutting-edge AI tools that make 
            advanced technology accessible to everyone.
          </p>
          
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">
            What is JoePro.ai?
          </h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            <strong className="text-white">JoePro.ai</strong> is the official AI platform by JoePro, featuring:
          </p>
          <ul className="list-disc list-inside text-[var(--text-muted)] mb-6 space-y-2">
            <li><strong className="text-white">Custom AI Agents</strong> - Powered by GPT-4 and Grok</li>
            <li><strong className="text-white">AI Video Generator</strong> - Create videos using Nano Banana + Luma Ray 3</li>
            <li><strong className="text-white">Nano Banana</strong> - AI-powered image editing and generation</li>
            <li><strong className="text-white">Cloud Dev Environments</strong> - Instant coding sandboxes</li>
          </ul>

          <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">
            The JoeProAI Mission
          </h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            JoeProAI is on a mission to democratize AI technology. Whether you&apos;re a developer, creator, 
            or entrepreneur, JoePro.ai provides the tools you need to harness the power of artificial 
            intelligence without the complexity.
          </p>

          <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">
            Connect with JoePro
          </h2>
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://x.com/JoePro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
            >
              X @JoePro
            </a>
            <a 
              href="https://github.com/JoeProAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
            >
              GitHub JoeProAI
            </a>
            <a 
              href="https://youtube.com/@JoeProAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
            >
              YouTube @JoeProAI
            </a>
          </div>
        </article>

        {/* SEO Rich Text */}
        <section className="glass card-border p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Why Choose JoePro.ai?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-[var(--text-muted)]">
            <div>
              <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Built by JoePro</h3>
              <p>Every tool on JoePro.ai is personally developed and maintained by JoePro, ensuring quality and innovation.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Cutting-Edge AI</h3>
              <p>JoeProAI integrates the latest AI models including GPT-4, Grok, Gemini, and Luma AI.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Free to Start</h3>
              <p>JoePro.ai offers free tiers for all tools, making AI accessible to everyone.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Active Development</h3>
              <p>JoePro continuously ships new features and improvements to JoePro.ai.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
