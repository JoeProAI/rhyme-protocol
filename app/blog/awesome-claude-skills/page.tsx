'use client'

import Link from 'next/link'
import { ArrowLeft, Github, ExternalLink, FileText, Code, BarChart3, Briefcase, MessageSquare, Palette, Clock, Users, Shield, Star, Sparkles } from 'lucide-react'

const categories = [
  {
    name: 'Document Processing',
    icon: FileText,
    skills: [
      { name: 'docx', desc: 'Create, edit, analyze Word docs with tracked changes, comments, formatting.' },
      { name: 'pdf', desc: 'Extract text, tables, metadata, merge & annotate PDFs.' },
      { name: 'pptx', desc: 'Read, generate, and adjust slides, layouts, templates.' },
      { name: 'xlsx', desc: 'Spreadsheet manipulation: formulas, charts, data transformations.' },
      { name: 'Markdown to EPUB Converter', desc: 'Converts markdown documents and chat summaries into professional EPUB ebook files.', author: '@smerchek' },
    ]
  },
  {
    name: 'Development & Code Tools',
    icon: Code,
    skills: [
      { name: 'artifacts-builder', desc: 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui).' },
      { name: 'aws-skills', desc: 'AWS development with CDK best practices, cost optimization MCP servers, and serverless/event-driven architecture patterns.' },
      { name: 'Changelog Generator', desc: 'Automatically creates user-facing changelogs from git commits by analyzing history and transforming technical commits into customer-friendly release notes.' },
      { name: 'Claude Code Terminal Title', desc: "Gives each Claude-Code terminal window a dynamic title that describes the work being done so you don't lose track of what window is doing what." },
      { name: 'D3.js Visualization', desc: 'Teaches Claude to produce D3 charts and interactive data visualizations.', author: '@chrisvoncsefalvay' },
      { name: 'FFUF Web Fuzzing', desc: 'Integrates the ffuf web fuzzer so Claude can run fuzzing tasks and analyze results for vulnerabilities.', author: '@jthack' },
      { name: 'finishing-a-development-branch', desc: 'Guides completion of development work by presenting clear options and handling chosen workflow.' },
      { name: 'iOS Simulator', desc: 'Enables Claude to interact with iOS Simulator for testing and debugging iOS applications.', author: '@conorluddy' },
      { name: 'MCP Builder', desc: 'Guides creation of high-quality MCP (Model Context Protocol) servers for integrating external APIs and services with LLMs using Python or TypeScript.' },
      { name: 'move-code-quality-skill', desc: 'Analyzes Move language packages against the official Move Book Code Quality Checklist for Move 2024 Edition compliance and best practices.' },
      { name: 'Playwright Browser Automation', desc: 'Model-invoked Playwright automation for testing and validating web applications.', author: '@lackeyjb' },
      { name: 'prompt-engineering', desc: 'Teaches well-known prompt engineering techniques and patterns, including Anthropic best practices and agent persuasion principles.' },
      { name: 'pypict-claude-skill', desc: 'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing) for requirements or code, generating optimized test suites with pairwise coverage.' },
      { name: 'Skill Creator', desc: 'Provides guidance for creating effective Claude Skills that extend capabilities with specialized knowledge, workflows, and tool integrations.' },
      { name: 'Skill Seekers', desc: 'Automatically converts any documentation website into a Claude AI skill in minutes.', author: '@yusufkaraaslan' },
      { name: 'software-architecture', desc: 'Implements design patterns including Clean Architecture, SOLID principles, and comprehensive software design best practices.' },
      { name: 'subagent-driven-development', desc: 'Dispatches independent subagents for individual tasks with code review checkpoints between iterations for rapid, controlled development.' },
      { name: 'test-driven-development', desc: 'Use when implementing any feature or bugfix, before writing implementation code.' },
      { name: 'using-git-worktrees', desc: 'Creates isolated git worktrees with smart directory selection and safety verification.' },
      { name: 'Webapp Testing', desc: 'Tests local web applications using Playwright for verifying frontend functionality, debugging UI behavior, and capturing screenshots.' },
    ]
  },
  {
    name: 'Data & Analysis',
    icon: BarChart3,
    skills: [
      { name: 'CSV Data Summarizer', desc: 'Automatically analyzes CSV files and generates comprehensive insights with visualizations without requiring user prompts.', author: '@coffeefuelbump' },
      { name: 'root-cause-tracing', desc: 'Use when errors occur deep in execution and you need to trace back to find the original trigger.' },
    ]
  },
  {
    name: 'Business & Marketing',
    icon: Briefcase,
    skills: [
      { name: 'Brand Guidelines', desc: "Applies Anthropic's official brand colors and typography to artifacts for consistent visual identity and professional design standards." },
      { name: 'Competitive Ads Extractor', desc: "Extracts and analyzes competitors' ads from ad libraries to understand messaging and creative approaches that resonate." },
      { name: 'Domain Name Brainstormer', desc: 'Generates creative domain name ideas and checks availability across multiple TLDs including .com, .io, .dev, and .ai extensions.' },
      { name: 'Internal Comms', desc: 'Helps write internal communications including 3P updates, company newsletters, FAQs, status reports, and project updates using company-specific formats.' },
      { name: 'Lead Research Assistant', desc: 'Identifies and qualifies high-quality leads by analyzing your product, searching for target companies, and providing actionable outreach strategies.' },
    ]
  },
  {
    name: 'Communication & Writing',
    icon: MessageSquare,
    skills: [
      { name: 'article-extractor', desc: 'Extract full article text and metadata from web pages.' },
      { name: 'brainstorming', desc: 'Transform rough ideas into fully-formed designs through structured questioning and alternative exploration.' },
      { name: 'Content Research Writer', desc: 'Assists in writing high-quality content by conducting research, adding citations, improving hooks, and providing section-by-section feedback.' },
      { name: 'family-history-research', desc: 'Provides assistance with planning family history and genealogy research projects.' },
      { name: 'Meeting Insights Analyzer', desc: 'Analyzes meeting transcripts to uncover behavioral patterns including conflict avoidance, speaking ratios, filler words, and leadership style.' },
      { name: 'NotebookLM Integration', desc: 'Lets Claude Code chat directly with NotebookLM for source-grounded answers based exclusively on uploaded documents.', author: '@PleasePrompto' },
    ]
  },
  {
    name: 'Creative & Media',
    icon: Palette,
    skills: [
      { name: 'Canvas Design', desc: 'Creates beautiful visual art in PNG and PDF documents using design philosophy and aesthetic principles for posters, designs, and static pieces.' },
      { name: 'Image Enhancer', desc: 'Improves image and screenshot quality by enhancing resolution, sharpness, and clarity for professional presentations and documentation.' },
      { name: 'Slack GIF Creator', desc: 'Creates animated GIFs optimized for Slack with validators for size constraints and composable animation primitives.' },
      { name: 'Theme Factory', desc: 'Applies professional font and color themes to artifacts including slides, docs, reports, and HTML landing pages with 10 pre-set themes.' },
      { name: 'Video Downloader', desc: 'Downloads videos from YouTube and other platforms for offline viewing, editing, or archival with support for various formats and quality options.' },
      { name: 'youtube-transcript', desc: 'Fetch transcripts from YouTube videos and prepare summaries.' },
    ]
  },
  {
    name: 'Productivity & Organization',
    icon: Clock,
    skills: [
      { name: 'File Organizer', desc: 'Intelligently organizes files and folders by understanding context, finding duplicates, and suggesting better organizational structures.' },
      { name: 'Invoice Organizer', desc: 'Automatically organizes invoices and receipts for tax preparation by reading files, extracting information, and renaming consistently.' },
      { name: 'kaizen', desc: 'Applies continuous improvement methodology with multiple analytical approaches, based on Japanese Kaizen philosophy and Lean methodology.' },
      { name: 'n8n-skills', desc: 'Enables AI assistants to directly understand and operate n8n workflows.' },
      { name: 'Raffle Winner Picker', desc: 'Randomly selects winners from lists, spreadsheets, or Google Sheets for giveaways and contests with cryptographically secure randomness.' },
      { name: 'ship-learn-next', desc: 'Skill to help iterate on what to build or learn next, based on feedback loops.' },
      { name: 'tapestry', desc: 'Interlink and summarize related documents into knowledge networks.' },
    ]
  },
  {
    name: 'Collaboration & Project Management',
    icon: Users,
    skills: [
      { name: 'git-pushing', desc: 'Automate git operations and repository interactions.' },
      { name: 'review-implementing', desc: 'Evaluate code implementation plans and align with specs.' },
      { name: 'test-fixing', desc: 'Detect failing tests and propose patches or fixes.' },
    ]
  },
  {
    name: 'Security & Systems',
    icon: Shield,
    skills: [
      { name: 'computer-forensics', desc: 'Digital forensics analysis and investigation techniques.' },
      { name: 'file-deletion', desc: 'Secure file deletion and data sanitization methods.' },
      { name: 'metadata-extraction', desc: 'Extract and analyze file metadata for forensic purposes.' },
      { name: 'threat-hunting-with-sigma-rules', desc: 'Use Sigma detection rules to hunt for threats and analyze security events.' },
    ]
  },
]

export default function AwesomeClaudeSkillsPage() {
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
              href="https://github.com/ComposioHQ/awesome-claude-skills"
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 text-accent mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Claude Skills Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Awesome Claude Skills
          </h1>
          <p className="text-xl text-muted leading-relaxed mb-6">
            A curated list of practical Claude Skills for enhancing productivity across Claude.ai, 
            Claude Code, and the Claude API. 60+ skills organized by category.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm flex items-center gap-1">
              <Star className="w-3 h-3" /> 9.9k stars
            </span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">60+ Skills</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">9 Categories</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Apache 2.0</span>
          </div>
        </div>
      </section>

      {/* Credit Banner */}
      <section className="py-4 bg-accent/5 border-y border-accent/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-accent" />
            <p className="text-sm">
              <span className="text-muted">Source: </span>
              <a 
                href="https://github.com/ComposioHQ/awesome-claude-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                ComposioHQ/awesome-claude-skills
              </a>
              <span className="text-muted"> - Community-curated skills repository</span>
            </p>
          </div>
        </div>
      </section>

      {/* What Are Claude Skills */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-4">What Are Claude Skills?</h2>
          <p className="text-muted leading-relaxed">
            Claude Skills are customizable workflows that teach Claude how to perform specific tasks 
            according to your unique requirements. Skills enable Claude to execute tasks in a repeatable, 
            standardized manner across all Claude platforms.
          </p>
        </div>
      </section>

      {/* Skills by Category */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">Skills by Category</h2>
          
          <div className="space-y-12">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <div key={category.name}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-accent" />
                    </div>
                    {category.name}
                    <span className="text-sm font-normal text-muted">({category.skills.length})</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {category.skills.map((skill) => (
                      <div 
                        key={skill.name} 
                        className="p-4 bg-surface rounded-lg border border-border hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-white">{skill.name}</h4>
                          {skill.author && (
                            <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">
                              {skill.author}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted">{skill.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">Getting Started</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-bg rounded-lg border border-border">
              <h3 className="font-bold text-white mb-3">Using in Claude.ai</h3>
              <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
                <li>Click the skill icon (🧩) in your chat interface</li>
                <li>Add skills from the marketplace or upload custom skills</li>
                <li>Claude automatically activates relevant skills based on your task</li>
              </ol>
            </div>
            
            <div className="p-6 bg-bg rounded-lg border border-border">
              <h3 className="font-bold text-white mb-3">Using in Claude Code</h3>
              <pre className="text-xs bg-surface p-3 rounded overflow-x-auto mb-2">
                <code>{`mkdir -p ~/.config/claude-code/skills/
cp -r skill-name ~/.config/claude-code/skills/`}</code>
              </pre>
              <p className="text-sm text-muted">The skill loads automatically and activates when relevant.</p>
            </div>
            
            <div className="p-6 bg-bg rounded-lg border border-border">
              <h3 className="font-bold text-white mb-3">Using via API</h3>
              <pre className="text-xs bg-surface p-3 rounded overflow-x-auto">
                <code>{`response = client.messages.create(
    model="claude-3-5-sonnet",
    skills=["skill-id"],
    messages=[...]
)`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Structure */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Creating Your Own Skills</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-white mb-3">Skill Structure</h3>
              <pre className="text-sm bg-surface p-4 rounded-lg overflow-x-auto">
                <code>{`skill-name/
├── SKILL.md          # Required: Instructions & metadata
├── scripts/          # Optional: Helper scripts
├── templates/        # Optional: Document templates
└── resources/        # Optional: Reference files`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-3">Best Practices</h3>
              <ul className="text-sm text-muted space-y-2">
                <li>• Focus on specific, repeatable tasks</li>
                <li>• Include clear examples and edge cases</li>
                <li>• Write instructions for Claude, not end users</li>
                <li>• Test across Claude.ai, Claude Code, and API</li>
                <li>• Document prerequisites and dependencies</li>
                <li>• Include error handling guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl font-bold mb-4">Explore the Full Collection</h2>
          <p className="text-muted mb-6">
            Browse all skills, contribute your own, and join the community on GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://github.com/ComposioHQ/awesome-claude-skills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
            <a 
              href="https://github.com/ComposioHQ/awesome-claude-skills/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border text-white font-semibold rounded-lg hover:border-accent transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Contribute a Skill
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
