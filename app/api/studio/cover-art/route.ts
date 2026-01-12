import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { auth } from '@/lib/auth';
import { saveGeneration } from '@/lib/generations';

export const maxDuration = 60;

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface CoverArtRequest {
  prompt: string;
  style: 'album-cover' | 'single-cover' | 'mixtape' | 'ep';
  mood: 'dark' | 'vibrant' | 'minimal' | 'luxury' | 'street' | 'abstract';
  aspectRatio: '1:1' | '16:9' | '9:16';
}

const STYLE_PROMPTS: Record<string, string> = {
  'album-cover': 'professional album cover art, high production value, suitable for major streaming platforms',
  'single-cover': 'eye-catching single artwork, bold and memorable, social media optimized',
  'mixtape': 'underground mixtape aesthetic, raw and authentic, street credibility',
  'ep': 'cohesive EP artwork, artistic and thoughtful, indie aesthetic',
};

const MOOD_PROMPTS: Record<string, string> = {
  dark: 'dark moody atmosphere, shadows, noir aesthetic, dramatic lighting',
  vibrant: 'vivid colors, energetic, dynamic composition, bold contrasts',
  minimal: 'minimalist design, clean lines, negative space, sophisticated simplicity',
  luxury: 'opulent, gold accents, premium feel, high-end aesthetic, wealth imagery',
  street: 'urban gritty aesthetic, concrete textures, graffiti influence, authentic',
  abstract: 'abstract art style, surreal elements, artistic interpretation, unique visuals',
};

const SIZE_MAP: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1536x1024',
  '9:16': '1024x1536',
};

export async function POST(request: NextRequest) {
  try {
    const body: CoverArtRequest = await request.json();
    const { prompt, style, mood, aspectRatio } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS['album-cover'];
    const moodPrompt = MOOD_PROMPTS[mood] || MOOD_PROMPTS['vibrant'];
    const size = SIZE_MAP[aspectRatio] || '1024x1024';

    const fullPrompt = `Create album cover art: ${prompt}. Style: ${stylePrompt}. Mood: ${moodPrompt}. Professional quality, no text or typography, suitable for music streaming platforms. High resolution, visually striking composition.`;

    console.log(`[Cover Art] Generating with gpt-image-1.5: ${fullPrompt.substring(0, 100)}...`);

    const openai = getOpenAI();
    
    const response = await openai.images.generate({
      model: 'gpt-image-1.5',
      prompt: fullPrompt,
      n: 1,
      size: size as '1024x1024' | '1536x1024' | '1024x1536',
      quality: 'high',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data in response');
    }

    const imageData = response.data[0];
    const revisedPrompt = imageData?.revised_prompt;
    
    let imageUrl: string;
    if (imageData?.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    } else if (imageData?.url) {
      imageUrl = imageData.url;
    } else {
      throw new Error('No image data in response');
    }

    // Save to user's generation history
    let userId: string;
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const cookieStore = cookies();
      userId = cookieStore.get('anon_session')?.value || 'anonymous';
    }

    const saved = await saveGeneration(userId, {
      type: 'cover_art',
      imageUrl,
      prompt,
      metadata: {
        style,
        mood,
        aspectRatio,
        revisedPrompt,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt,
      generationId: saved.id,
      metadata: {
        style,
        mood,
        aspectRatio,
        originalPrompt: prompt,
      },
    });
  } catch (error: any) {
    console.error('[Cover Art] Generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate cover art',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
