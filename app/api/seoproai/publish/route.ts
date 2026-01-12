import { NextRequest, NextResponse } from 'next/server';
import { getSEOProAIClient } from '@/lib/seoproai';

/**
 * POST /api/seoproai/publish
 * Mark a blog as published and send the published URL to SEOPro AI
 * 
 * Body: { blog_id: number, published_url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blog_id, published_url } = body;

    if (!blog_id) {
      return NextResponse.json(
        { error: 'blog_id is required' },
        { status: 400 }
      );
    }

    if (!published_url) {
      return NextResponse.json(
        { error: 'published_url is required' },
        { status: 400 }
      );
    }

    const client = getSEOProAIClient();

    // Step 1: Update the blog with the published URL
    await client.updateBlogUrl(blog_id, published_url);

    // Step 2: Mark the blog as published
    const result = await client.markBlogAsPublished(blog_id);

    return NextResponse.json({
      success: true,
      message: 'Blog marked as published in SEOPro AI',
      data: result,
    });

  } catch (error) {
    console.error('[SEOPro AI Publish Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish blog' },
      { status: 500 }
    );
  }
}
