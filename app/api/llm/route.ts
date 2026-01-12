import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createXAIStreamCompletion, createXAICompletion } from '@/lib/llm/xai-client';
import { checkUsage, trackUsage, generateSessionId } from '@/lib/usage-system';
import type OpenAI from 'openai';

export const runtime = 'nodejs'; // Need nodejs for cookies

export async function POST(req: NextRequest) {
  try {
    // Get or create session
    const cookieStore = cookies();
    let sessionId = cookieStore.get('anon_session')?.value;
    const isNewSession = !sessionId;
    
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Check rate limit
    const usage = await checkUsage(sessionId, 'chat_messages');
    
    if (!usage.allowed) {
      const response = NextResponse.json({
        error: usage.reason,
        limit: usage.limit,
        used: usage.used,
        remaining: 0,
        upgrade_url: '/dashboard',
      }, { status: 429 });
      
      // Set cookie for new sessions
      if (isNewSession) {
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

    const body = await req.json();
    const { provider = 'xai', model, messages, temperature = 0.7, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    if (stream) {
      const streamResponse = await createXAIStreamCompletion(messages, model || 'grok-4-1-fast', temperature);

      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ content }) + '\n\n'));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            
            // Track usage after successful stream
            await trackUsage(sessionId!, 'chat_messages', 1);
          } catch (error: any) {
            controller.enqueue(encoder.encode('data: ' + JSON.stringify({ error: error.message }) + '\n\n'));
            controller.close();
          }
        },
      });

      const response = new Response(readableStream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
      
      return response;
    } else {
      const apiResponse = await createXAICompletion(messages, model || 'grok-4-1-fast', temperature, false) as OpenAI.ChatCompletion;

      // Track usage after successful call
      await trackUsage(sessionId, 'chat_messages', 1);

      const response = NextResponse.json({
        content: apiResponse.choices?.[0]?.message?.content || '',
        model: apiResponse.model || model,
        usage: apiResponse.usage || {},
        remaining: usage.remaining - 1,
      });
      
      // Set cookie for new sessions
      if (isNewSession) {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'LLM API Endpoint - Powered by xAI Grok',
    provider: 'xai',
    methods: ['POST'],
  });
}
