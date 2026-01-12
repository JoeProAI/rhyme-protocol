import { NextRequest, NextResponse } from 'next/server';
import { getSEOProAIClient } from '@/lib/seoproai';

/**
 * POST /api/seoproai/generate
 * Trigger blog generation for a specific date
 * 
 * Body: { date: "YYYY-MM-DD", keywords: ["keyword1", "keyword2"] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, keywords, language = 'en' } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    const client = getSEOProAIClient();
    const result = await client.generateBlogForDate(date, keywords, language);

    return NextResponse.json({
      success: true,
      message: 'Blog generation started. Check status in 5-10 minutes.',
      data: result,
    });

  } catch (error) {
    console.error('[SEOPro AI Generate Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate blog' },
      { status: 500 }
    );
  }
}
