'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Search, Loader2, Sparkles } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  tags: string[]
  featured?: boolean
  isSeoPro?: boolean
  featuredImage?: string
}

// Static blog posts (manually created)
const staticPosts: BlogPost[] = [
  {
    slug: 'joepro-ai-lab-huggingface',
    title: 'Introducing JoePro AI Lab: Where Experimental AI Tools Come to Life',
    excerpt: 'Launching our new AI Lab with interactive demos, HuggingFace integration, and a showcase of cutting-edge AI experiments.',
    date: '2026-01-06',
    readTime: '5 min read',
    tags: ['AI Lab', 'HuggingFace', 'Launch', 'Tools'],
    featured: true,
  },
  {
    slug: '2026-developer-platform-checklist',
    title: 'The 2026 Checklist: Choose the Developer Platform for Building AI Powered Tools',
    excerpt: 'How indie teams can prototype, deploy, and monetize fast with the right developer platform choice for building AI powered tools.',
    date: '2025-12-09',
    readTime: '15 min read',
    tags: ['AI', 'Developer Tools', 'Platform', 'Monetization'],
    featured: true,
  },
  {
    slug: 'food-empire-ai-production',
    title: 'Building a Production-Quality Food Empire AI: From Mock Data to Real APIs',
    excerpt: 'How I transformed a prototype with fake data into a production-ready food trading game with intelligent APIs—while spending $0/month.',
    date: '2025-12-08',
    readTime: '12 min read',
    tags: ['AI', 'Case Study', 'APIs', 'Production'],
    featured: false,
  },
  {
    slug: 'step-by-step-ai-development-guides',
    title: 'Step by Step AI Development Guides: Build, Deploy & Monetize Custom Agents',
    excerpt: 'Hands-on projects to build, deploy and monetize custom agents with JoePro.ai. From idea to production in one week.',
    date: '2025-12-08',
    readTime: '15 min read',
    tags: ['AI', 'Tutorial', 'Agents', 'Monetization'],
    featured: false,
  },
  {
    slug: 'awesome-claude-skills',
    title: 'Awesome Claude Skills: 60+ Curated Skills for Claude AI',
    excerpt: 'A comprehensive collection of practical Claude Skills for document processing, development, data analysis, marketing, writing, and more. From the ComposioHQ community.',
    date: '2025-12-24',
    readTime: '15 min read',
    tags: ['AI', 'Claude Code', 'Skills', 'Productivity'],
    featured: true,
  },
  {
    slug: 'claude-code-content-research-writer',
    title: 'Claude Code Skill: Content Research Writer',
    excerpt: 'Transform your writing process with AI-powered research, citations, hook improvement, and section-by-section feedback. From the official Claude Code skills repository.',
    date: '2025-12-24',
    readTime: '10 min read',
    tags: ['AI', 'Claude Code', 'Writing', 'Productivity'],
    featured: false,
  },
  {
    slug: 'building-prompt-racer',
    title: 'Building Prompt Racer: A Real-Time AI Model Racing Platform',
    excerpt: 'How I built a platform that races 4 AI models simultaneously with pay-per-race monetization using Stripe - no signup required.',
    date: '2025-12-04',
    readTime: '20 min read',
    tags: ['AI', 'Next.js', 'Stripe', 'Tutorial'],
    featured: false,
  },
  {
    slug: 'claude-code-windows-setup',
    title: 'Installing Claude Code on Windows: The Complete Guide',
    excerpt: 'A step-by-step guide to getting Claude Code running on Windows with WSL. From zero to AI-powered coding in 15 minutes.',
    date: '2025-12-03',
    readTime: '8 min read',
    tags: ['AI', 'Tutorial', 'Windows', 'Development'],
    featured: false,
  },
  {
    slug: 'welcome-to-joepro',
    title: 'Welcome to JoePro.ai',
    excerpt: 'The journey begins. Building AI-powered tools and sharing what I learn along the way.',
    date: '2025-11-15',
    readTime: '3 min read',
    tags: ['Announcement', 'Personal'],
    featured: false,
  },
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [seoProPosts, setSeoProPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch SEOPro articles on mount
  useEffect(() => {
    async function fetchSeoProBlogs() {
      try {
        const res = await fetch('/api/seoproai/blogs')
        if (res.ok) {
          const data = await res.json()
          if (data.articles) {
            const seoPosts: BlogPost[] = data.articles.map((a: { slug: string; title: string; excerpt: string; date: string; readTime: string; tags: string[]; featuredImage?: string }) => ({
              ...a,
              isSeoPro: true,
              featuredImage: a.featuredImage,
              tags: [...(a.tags || []), 'AI Generated'],
            }))
            setSeoProPosts(seoPosts)
          }
        }
      } catch (e) {
        console.error('Failed to fetch SEOPro blogs:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSeoProBlogs()
  }, [])

  // Combine static and SEOPro posts - filter out any with undefined/empty slugs
  const allPosts = [...staticPosts, ...seoProPosts]
    .filter(post => post.slug && post.slug !== 'undefined') // Remove invalid slugs
    .filter((post, index, self) => self.findIndex(p => p.slug === post.slug) === index) // Dedupe by slug
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date

  // Get all unique tags
  const allTags = Array.from(new Set(allPosts.flatMap((post: BlogPost) => post.tags)))

  // Filter posts
  const filteredPosts = allPosts.filter((post: BlogPost) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const featuredPost = allPosts.find((p: BlogPost) => p.featured)
  const regularPosts = filteredPosts.filter((p: BlogPost) => !p.featured || selectedTag || searchQuery)

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ffd700]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d4a017]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">The </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '1px #ffd700', textShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }}>Journal</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
            Thoughts on AI, development, and building the future.
          </p>
        </header>

        {/* Search & Filter */}
        <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                !selectedTag 
                  ? 'bg-[var(--primary)] text-black font-medium' 
                  : 'bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedTag === tag 
                    ? 'bg-[var(--primary)] text-black font-medium' 
                    : 'bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && !searchQuery && !selectedTag && (
          <Link 
            href={`/blog/${featuredPost.slug}`}
            className="block mb-12 group"
          >
            <article className="relative p-8 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card-bg)] to-[#1a1a2e] hover:border-[var(--primary)] transition-all overflow-hidden">
              {/* Featured Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--primary)] text-black text-xs font-bold rounded-full">
                FEATURED
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-[var(--primary)] transition-colors">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-[var(--text-muted)] mb-6 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <span className="inline-flex items-center gap-2 text-[var(--primary)] font-medium group-hover:gap-3 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 mb-8 text-[var(--text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading AI-generated articles...</span>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularPosts.map((post: BlogPost) => (
            <Link 
              key={post.slug}
              href={post.isSeoPro ? `/blog/ai/${post.slug}` : `/blog/${post.slug}`}
              className="group"
            >
              <article className="h-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--primary)] transition-all relative overflow-hidden">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="w-full h-40 overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                {/* AI Generated Badge */}
                {post.isSeoPro && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full z-10">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--primary)] transition-colors pr-12">
                  {post.title}
                </h3>
                
                <p className="text-[var(--text-muted)] mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)] text-lg">
              No posts found matching your search.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
              className="mt-4 text-[var(--primary)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
