import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Lab | JoePro - Experimental AI Tools & Demos',
  description: 'Explore JoePro\'s AI Lab featuring Prompt Racer, Model Arena, and experimental AI tools. Test cutting-edge AI capabilities and compare models.',
  openGraph: {
    title: 'JoePro AI Lab - Experimental Tools',
    description: 'Interactive AI demos, model comparisons, and experimental tools by JoePro',
  },
}

const labProjects = [
  {
    name: 'Prompt Racer',
    description: 'Race AI models head-to-head. Compare GPT-4, Claude, Gemini, and Grok in real-time prompt battles.',
    url: 'https://prompt-racer.joepro.ai',
    tags: ['Live', 'Interactive', 'Multi-Model'],
    icon: '🏁',
    featured: true,
  },
  {
    name: 'JoePro Press',
    description: 'Hugging Face showcase featuring Model Arena, FLUX image generation, and Neural Analyzer. Pure HF-powered tools.',
    url: 'https://joepro-press.vercel.app',
    tags: ['Live', 'Hugging Face', '3 Tools'],
    icon: '🤗',
    featured: true,
  },
  {
    name: 'Nano Banana',
    description: 'AI-powered image editing and generation. Create, modify, and enhance images with natural language.',
    url: '/apps/nano-banana',
    tags: ['Live', 'Image AI'],
    icon: '🍌',
    featured: false,
  },
  {
    name: 'Video Generator',
    description: 'Transform ideas into cinematic videos. Powered by Luma Ray-2 and GPT-4 for stunning results.',
    url: '/apps/video-gen',
    tags: ['Live', 'Video AI'],
    icon: '🎬',
    featured: false,
  },
  {
    name: 'AI Chat Playground',
    description: 'Experiment with Grok 4.1, GPT-4, and Claude. Test different system prompts and parameters.',
    url: '/apps/ai-chat',
    tags: ['Live', 'Chat'],
    icon: '💬',
    featured: false,
  },
  {
    name: 'Prompt Library',
    description: '150+ production-ready prompts. Search, test, and customize for your use cases.',
    url: '/prompt-library',
    tags: ['Live', 'Resources'],
    icon: '📚',
    featured: false,
  },
]

export default function LabPage() {
  const featured = labProjects.filter(p => p.featured)
  const tools = labProjects.filter(p => !p.featured)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent text-sm font-medium tracking-wide mb-4">
              JoePro AI Lab
            </p>
            <h1 className="font-display mb-6">
              <span className="text-text">Experimental </span>
              <span className="text-accent">AI Tools</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Interactive demos, model comparisons, and cutting-edge AI experiments.
              All tools are production-ready and free to use.
            </p>
          </div>

          {/* Featured Projects */}
          <div className="mb-12">
            <h2 className="text-2xl font-display text-text mb-6">Featured Experiments</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((project) => (
                <Link
                  key={project.name}
                  href={project.url}
                  className="card group relative overflow-hidden"
                  target={project.url.startsWith('http') ? '_blank' : undefined}
                  rel={project.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {/* Icon */}
                  <div className="text-6xl mb-4 opacity-20 group-hover:opacity-30 transition-opacity">
                    {project.icon}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-display text-text group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                    </div>
                    
                    <p className="text-text-secondary mb-4">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded ${
                            tag === 'Live'
                              ? 'bg-accent-muted text-accent'
                              : tag === 'Coming Soon'
                              ? 'bg-border text-text-secondary'
                              : 'bg-surface-elevated text-text-secondary'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="mt-4 text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Launch →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* All Tools */}
          <div>
            <h2 className="text-2xl font-display text-text mb-6">All Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((project) => (
                <Link
                  key={project.name}
                  href={project.url}
                  className="card group"
                  target={project.url.startsWith('http') ? '_blank' : undefined}
                  rel={project.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <div className="text-4xl mb-3">{project.icon}</div>
                  
                  <h3 className="text-lg font-display text-text group-hover:text-accent transition-colors mb-2">
                    {project.name}
                  </h3>
                  
                  <p className="text-sm text-text-secondary mb-3">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-surface-elevated text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Hugging Face CTA */}
          <div className="mt-16 card card-elevated text-center py-12 px-8">
            <h2 className="font-display text-text mb-4">More on Hugging Face</h2>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Explore JoePro's Hugging Face profile for interactive Spaces, model comparisons, and AI experiments.
            </p>
            <a
              href="https://huggingface.co/JoeProAI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <span>🤗</span>
              Visit Hugging Face Profile
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
