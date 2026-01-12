import { NextRequest, NextResponse } from 'next/server';
import { generateContent, ContentType } from '@/lib/content-factory';

export const maxDuration = 120; // 2 minutes for content generation

/**
 * POST /api/content-factory/generate
 * Unified content generation endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, topic, keywords, tone, audience, language, additionalInstructions } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      );
    }

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    console.log(`[Content Factory] Generating ${type}: ${topic}`);

    const result = await generateContent({
      type: type as ContentType,
      topic,
      keywords: keywords || [],
      tone: tone || 'professional',
      audience,
      language,
      additionalInstructions,
    });

    console.log(`[Content Factory] Generated ${type} with ${result.provider}`);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('[Content Factory Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
