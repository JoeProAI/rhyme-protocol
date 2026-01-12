import { NextRequest, NextResponse } from 'next/server';
import { getSEOProAIClient } from '@/lib/seoproai';

/**
 * GET /api/seoproai/status?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Check blog generation status for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date query parameters are required' },
        { status: 400 }
      );
    }

    const client = getSEOProAIClient();
    const status = await client.getBlogStatusByDate(startDate, endDate);

    // Summarize the status
    const summary = {
      ready: [] as { date: string; blog_id: number; title: string }[],
      processing: [] as string[],
      none: [] as string[],
      published: [] as string[],
    };

    for (const [date, info] of Object.entries(status.date_statuses)) {
      if (info.has_blog) {
        if (info.status === 'draft' && info.blog_id) {
          summary.ready.push({
            date,
            blog_id: info.blog_id,
            title: info.title || 'Untitled',
          });
        } else if (info.status === 'processing') {
          summary.processing.push(date);
        } else if (info.status === 'published') {
          summary.published.push(date);
        }
      } else {
        summary.none.push(date);
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      raw: status,
    });

  } catch (error) {
    console.error('[SEOPro AI Status Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    );
  }
}
