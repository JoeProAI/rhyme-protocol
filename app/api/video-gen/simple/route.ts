import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkUsage, trackUsage, generateSessionId } from '@/lib/usage-system';

export const runtime = 'nodejs';
export const maxDuration = 120;

const LUMA_API_KEY = process.env.LUMA_API_KEY;

interface LumaGeneration {
  id: string;
  state: 'pending' | 'processing' | 'completed' | 'failed';
  assets?: {
    video?: string;
  };
  failure_reason?: string;
}

async function createLumaGeneration(prompt: string, aspectRatio: string, duration: string): Promise<LumaGeneration> {
  const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LUMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio,
      duration,
      model: 'ray-2',
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Luma API error: ${error}`);
  }

  return res.json();
}

async function getLumaGeneration(id: string): Promise<LumaGeneration> {
  const res = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${id}`, {
    headers: {
      'Authorization': `Bearer ${LUMA_API_KEY}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Luma API error: ${error}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    if (!LUMA_API_KEY) {
      return NextResponse.json(
        { error: 'Video generation not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { prompt, aspectRatio = '16:9', duration = '5s' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    let sessionId = cookieStore.get('anon_session')?.value;
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    const usage = await checkUsage(sessionId, 'video_generations');
    if (!usage.allowed) {
      return NextResponse.json({
        error: usage.reason,
        limit: usage.limit,
        used: usage.used,
        remaining: 0,
      }, { status: 429 });
    }

    console.log(`[Video Gen] Starting Luma generation: ${prompt.substring(0, 50)}...`);

    const generation = await createLumaGeneration(prompt, aspectRatio, duration);

    console.log(`[Video Gen] Created job: ${generation.id}`);

    let attempts = 0;
    const maxAttempts = 40;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const status = await getLumaGeneration(generation.id);
      console.log(`[Video Gen] Status: ${status.state}`);

      if (status.state === 'completed' && status.assets?.video) {
        await trackUsage(sessionId, 'video_generations', 1);
        
        const response = NextResponse.json({
          success: true,
          videoUrl: status.assets.video,
          generationId: generation.id,
        });

        if (!cookieStore.get('anon_session')?.value) {
          response.cookies.set('anon_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60,
            path: '/',
          });
        }

        return response;
      }

      if (status.state === 'failed') {
        return NextResponse.json(
          { error: status.failure_reason || 'Generation failed' },
          { status: 500 }
        );
      }

      attempts++;
    }

    return NextResponse.json(
      { error: 'Generation timed out' },
      { status: 504 }
    );

  } catch (error) {
    console.error('[Video Gen] Error:', error);
    return NextResponse.json(
      { 
        error: 'Video generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    if (!LUMA_API_KEY) {
      return NextResponse.json(
        { error: 'Video generation not configured' },
        { status: 503 }
      );
    }

    const status = await getLumaGeneration(jobId);

    return NextResponse.json({
      status: status.state === 'completed' ? 'completed' : 
              status.state === 'failed' ? 'failed' : 'processing',
      videoUrl: status.assets?.video || null,
      error: status.failure_reason || null,
    });

  } catch (error) {
    console.error('[Video Gen] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
