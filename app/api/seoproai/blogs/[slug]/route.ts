import { NextRequest, NextResponse } from 'next/server'
import { getSEOProAIClient } from '@/lib/seoproai'

export const dynamic = 'force-dynamic'

/**
 * GET /api/seoproai/blogs/[slug]
 * Fetch a single SEOPro AI blog by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const client = getSEOProAIClient()
    const blog = await client.getBlogBySlug(params.slug, 90)
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      article: {
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.meta_description,
        content: blog.content,
        date: blog.scheduled_date,
        readTime: `${Math.ceil(blog.word_count / 200)} min read`,
        wordCount: blog.word_count,
        featuredImage: blog.featured_image_url,
        focusKeyword: blog.focus_keyword,
        status: blog.status,
      },
    })
  } catch (error) {
    console.error('Failed to fetch blog:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch blog' },
      { status: 500 }
    )
  }
}
