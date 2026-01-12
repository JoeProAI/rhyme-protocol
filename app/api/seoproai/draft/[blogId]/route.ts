import { NextRequest, NextResponse } from 'next/server';
import { getSEOProAIClient } from '@/lib/seoproai';

/**
 * GET /api/seoproai/draft/[blogId]
 * Fetch complete HTML content of a draft blog
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const blogIdNum = parseInt(blogId, 10);

    if (isNaN(blogIdNum)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const client = getSEOProAIClient();
    const draft = await client.getBlogDraft(blogIdNum);

    return NextResponse.json({
      success: true,
      draft,
    });

  } catch (error) {
    console.error('[SEOPro AI Draft Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}
