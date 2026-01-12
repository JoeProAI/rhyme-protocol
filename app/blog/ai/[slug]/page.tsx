'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Sparkles, Loader2 } from 'lucide-react'

interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  wordCount: number
  featuredImage?: string
  focusKeyword: string
}

export default function AIBlogPost({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/seoproai/blogs/${params.slug}`)
        if (!res.ok) {
          throw new Error('Article not found')
        }
        const data = await res.json()
        setArticle(data.article)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load article')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [params.slug])

  if (loading) {
    return (
      <main className="min-h-screen p-8 md:p-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading article...</span>
        </div>
      </main>
    )
  }

  if (error || !article) {
    return (
      <main className="min-h-screen p-8 md:p-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-[var(--text-muted)] mb-8">{error || 'This article could not be loaded.'}</p>
          <Link href="/blog" className="text-[var(--primary)] hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#ffd700]/10 rounded-full blur-[120px]" />
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* AI Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
            <Sparkles className="w-4 h-4" />
            AI Generated Article
          </span>
          <span className="text-[var(--text-muted)] text-sm">
            Powered by SEOPro AI
          </span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
            <span className="text-[var(--text-muted)]">
              {article.wordCount.toLocaleString()} words
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-[var(--text-muted)]">
            {article.excerpt}
          </p>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src={article.featuredImage} 
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content - Rendered as HTML from SEOPro */}
        <div 
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:my-2
            prose-blockquote:border-[var(--primary)] prose-blockquote:bg-[var(--card-bg)] prose-blockquote:rounded-r-lg prose-blockquote:py-4
            prose-table:border-collapse prose-th:bg-[var(--card-bg)] prose-th:p-4 prose-td:p-4 prose-td:border prose-td:border-[var(--border)]
            prose-img:rounded-xl prose-img:my-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              This article was generated by SEOPro AI and may be edited for accuracy.
            </p>
            <Link 
              href="/blog"
              className="text-[var(--primary)] hover:underline text-sm"
            >
              More Articles →
            </Link>
          </div>
        </footer>
      </article>
    </main>
  )
}
