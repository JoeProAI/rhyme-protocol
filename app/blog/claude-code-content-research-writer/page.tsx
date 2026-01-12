'use client'

import Link from 'next/link'
import { ArrowLeft, Github, BookOpen, Sparkles, FileText, Search, MessageSquare, Edit3, CheckCircle } from 'lucide-react'

export default function ContentResearchWriterPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-2 text-muted hover:text-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <a 
              href="https://github.com/anthropics/claude-code/blob/main/.claude/skills/content-research-writer.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-surface to-bg">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 text-accent mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Claude Code Skill</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Content Research Writer
          </h1>
          <p className="text-xl text-muted leading-relaxed mb-8">
            Assists in writing high-quality content by conducting research, adding citations, 
            improving hooks, iterating on outlines, and providing real-time feedback on each section. 
            Transforms your writing process from solo effort to collaborative partnership.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Writing</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Research</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Citations</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Claude Code</span>
          </div>
        </div>
      </section>

      {/* Credit Banner */}
      <section className="py-4 bg-accent/5 border-y border-accent/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-accent" />
            <p className="text-sm">
              <span className="text-muted">Source: </span>
              <a 
                href="https://github.com/anthropics/claude-code/blob/main/.claude/skills/content-research-writer.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                anthropics/claude-code
              </a>
              <span className="text-muted"> - Official Claude Code Skills Repository</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* When to Use */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-accent" />
                When to Use This Skill
              </h2>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Writing blog posts, articles, or newsletters
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Creating educational content or tutorials
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Drafting thought leadership pieces
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Researching and writing case studies
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Producing technical documentation with sources
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Writing with proper citations and references
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Improving hooks and introductions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  Getting section-by-section feedback while writing
                </li>
              </ul>
            </section>

            {/* What This Skill Does */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" />
                What This Skill Does
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Collaborative Outlining', desc: 'Helps you structure ideas into coherent outlines' },
                  { title: 'Research Assistance', desc: 'Finds relevant information and adds citations' },
                  { title: 'Hook Improvement', desc: 'Strengthens your opening to capture attention' },
                  { title: 'Section Feedback', desc: 'Reviews each section as you write' },
                  { title: 'Voice Preservation', desc: 'Maintains your writing style and tone' },
                  { title: 'Citation Management', desc: 'Adds and formats references properly' },
                  { title: 'Iterative Refinement', desc: 'Helps you improve through multiple drafts' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-surface rounded-lg border border-border">
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Setup */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                Setup Your Writing Environment
              </h2>
              <div className="bg-surface rounded-lg border border-border p-6">
                <p className="text-muted mb-4">Create a dedicated folder for your article:</p>
                <pre className="bg-bg rounded p-4 overflow-x-auto text-sm mb-4">
                  <code>{`mkdir ~/writing/my-article-title
cd ~/writing/my-article-title`}</code>
                </pre>
                <p className="text-muted mb-4">Create your draft file:</p>
                <pre className="bg-bg rounded p-4 overflow-x-auto text-sm mb-4">
                  <code>{`touch article-draft.md`}</code>
                </pre>
                <p className="text-muted">Open Claude Code from this directory and start writing.</p>
              </div>
            </section>

            {/* Basic Workflow */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-accent" />
                Basic Workflow
              </h2>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Start with an outline', prompt: 'Help me create an outline for an article about [topic]' },
                  { step: 2, title: 'Research and add citations', prompt: 'Research [specific topic] and add citations to my outline' },
                  { step: 3, title: 'Improve the hook', prompt: "Here's my introduction. Help me make the hook more compelling." },
                  { step: 4, title: 'Get section feedback', prompt: 'I just finished the "Why This Matters" section. Review it and give feedback.' },
                  { step: 5, title: 'Refine and polish', prompt: 'Review the full draft for flow, clarity, and consistency.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 bg-surface rounded-lg border border-border">
                    <div className="w-8 h-8 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                      <code className="text-sm text-accent bg-bg px-2 py-1 rounded">{item.prompt}</code>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Example: Hook Improvement */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-accent" />
                Example: Hook Improvement
              </h2>
              <div className="bg-surface rounded-lg border border-border p-6">
                <h3 className="font-semibold text-white mb-4">User's Original Hook:</h3>
                <blockquote className="border-l-4 border-red-400/50 pl-4 text-muted italic mb-6">
                  "Product management is changing because of AI. In this article, I'll discuss some ways AI affects product managers."
                </blockquote>
                
                <h3 className="font-semibold text-white mb-4">Improved Options:</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-bg rounded-lg">
                    <span className="text-xs text-accent uppercase tracking-wider">Option 1: Data-driven</span>
                    <blockquote className="border-l-4 border-green-400/50 pl-4 text-white italic mt-2">
                      "Last month, I asked AI to analyze 500 customer interviews. It took 30 minutes instead of 3 weeks. Product management will never be the same."
                    </blockquote>
                  </div>
                  
                  <div className="p-4 bg-bg rounded-lg">
                    <span className="text-xs text-accent uppercase tracking-wider">Option 2: Question</span>
                    <blockquote className="border-l-4 border-green-400/50 pl-4 text-white italic mt-2">
                      "What if you could talk to every customer, read every review, and analyze every support ticket—all before your morning coffee?"
                    </blockquote>
                  </div>
                  
                  <div className="p-4 bg-bg rounded-lg">
                    <span className="text-xs text-accent uppercase tracking-wider">Option 3: Story</span>
                    <blockquote className="border-l-4 border-green-400/50 pl-4 text-white italic mt-2">
                      "Sarah spent two weeks building the wrong feature. Not because she didn't understand her users, but because she couldn't process the hundreds of interviews fast enough to spot the pattern."
                    </blockquote>
                  </div>
                </div>
              </div>
            </section>

            {/* File Organization */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                Recommended File Organization
              </h2>
              <div className="bg-surface rounded-lg border border-border p-6">
                <pre className="bg-bg rounded p-4 overflow-x-auto text-sm">
                  <code>{`~/writing/article-name/
├── outline.md          # Your outline
├── research.md         # All research and citations
├── draft-v1.md         # First draft
├── draft-v2.md         # Revised draft
├── final.md            # Publication-ready
├── feedback.md         # Collected feedback
└── sources/            # Reference materials
    ├── study1.pdf
    └── article2.md`}</code>
                </pre>
              </div>
            </section>

            {/* Pro Tips */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" />
                Pro Tips
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Work in VS Code: Better than web Claude for long-form writing',
                  'One section at a time: Get feedback incrementally',
                  'Save research separately: Keep a research.md file',
                  'Version your drafts: article-v1.md, article-v2.md, etc.',
                  'Read aloud: Use feedback to identify clunky sentences',
                  'Set deadlines: "I want to finish the draft today"',
                  'Take breaks: Write, get feedback, pause, revise',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
                    <span className="text-accent font-bold">{i + 1}.</span>
                    <span className="text-muted">{tip}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Use Cases */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Search className="w-6 h-6 text-accent" />
                Related Use Cases
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  'Creating social media posts from articles',
                  'Adapting content for different audiences',
                  'Writing email newsletters',
                  'Drafting technical documentation',
                  'Creating presentation content',
                  'Writing case studies',
                  'Developing course outlines',
                ].map((useCase, i) => (
                  <span key={i} className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-muted">
                    {useCase}
                  </span>
                ))}
              </div>
            </section>

          </div>
        </div>
      </article>

      {/* Footer CTA */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Get the Full Skill</h2>
          <p className="text-muted mb-6">
            View the complete skill documentation with all instructions, examples, and workflows on GitHub.
          </p>
          <a 
            href="https://github.com/anthropics/claude-code/blob/main/.claude/skills/content-research-writer.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  )
}
