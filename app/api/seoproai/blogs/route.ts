import { NextResponse } from 'next/server'
import { getSEOProAIClient } from '@/lib/seoproai'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

/**
 * GET /api/seoproai/blogs
 * Fetch all SEOPro AI generated blogs from content history
 * Content History Dashboard: https://seoproai.co/content-history/{website_id}
 */
export async function GET() {
  // Check for required env vars
  if (!process.env.SEOPROAI_API_KEY || !process.env.SEOPROAI_WEBSITE_ID) {
    console.error('[SEOPro AI] Missing SEOPROAI_API_KEY or SEOPROAI_WEBSITE_ID')
    return NextResponse.json({
      success: false,
      error: 'SEOPro AI not configured',
      articles: [],
    })
  }

  try {
    const client = getSEOProAIClient()
    
    console.log(`[SEOPro AI] Fetching content for website ${process.env.SEOPROAI_WEBSITE_ID}`)
    
    // Use the new getAllContent method which tries content-history first
    const blogs = await client.getAllBlogs(365) // Last year of content
    
    console.log(`[SEOPro AI] Fetched ${blogs.length} articles`)
    
    // Transform to a simpler format for the frontend
    const articles = blogs
      .filter(blog => blog.slug && blog.title && blog.status !== 'processing') // Only published/draft, not processing
      .map(blog => {
        // Ensure date is valid, fallback to today
        let date = blog.scheduled_date || blog.created_at
        if (!date || isNaN(new Date(date).getTime())) {
          date = new Date().toISOString().split('T')[0]
        }
        
        // Generate tags from focus keyword
        const tags = ['AI Generated']
        if (blog.focus_keyword) {
          tags.unshift(blog.focus_keyword)
        }
        
        return {
          id: blog.id,
          slug: blog.slug,
          title: blog.title,
          excerpt: blog.meta_description || blog.title,
          content: blog.content,
          date,
          readTime: `${Math.ceil((blog.word_count || 500) / 200)} min read`,
          wordCount: blog.word_count || 500,
          featuredImage: blog.featured_image_url,
          focusKeyword: blog.focus_keyword,
          status: blog.status,
          tags,
        }
      })
    
    return NextResponse.json({
      success: true,
      count: articles.length,
      websiteId: process.env.SEOPROAI_WEBSITE_ID,
      articles,
    })
  } catch (error) {
    console.error('[SEOPro AI] Failed to fetch blogs:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blogs',
        articles: [],
      },
      { status: 500 }
    )
  }
}
