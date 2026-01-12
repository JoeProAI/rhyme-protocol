import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// xAI Grok client
function getGrokClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
}

export interface LyricRequest {
  theme: string;
  style: 'trap' | 'conscious' | 'oldschool' | 'storytelling' | 'aggressive' | 'melodic';
  model: 'gpt' | 'grok' | 'both';
  bars?: number;
  existingLyrics?: string;
  action: 'generate' | 'continue' | 'rewrite' | 'rhyme-suggestions';
}

const AI_PERSONALITIES = {
  gpt: {
    name: 'The Technician',
    focus: 'complex rhyme schemes, multisyllabic rhymes, intricate wordplay',
    model: 'gpt-4o',
  },
  grok: {
    name: 'The Provocateur', 
    focus: 'bold statements, cultural references, wit and edge',
    model: 'grok-beta',
  },
};

const STYLE_INSTRUCTIONS: Record<string, string> = {
  trap: 'Write in trap style: hard-hitting ad-libs, repetitive hooks, flex-heavy content, modern slang, triplet flows',
  conscious: 'Write conscious rap: meaningful messages, social commentary, introspective bars, metaphors about life and struggle',
  oldschool: 'Write old school hip-hop: boom bap flow, storytelling, clever punchlines, classic references, lyrical complexity',
  storytelling: 'Write narrative rap: vivid scenes, character development, beginning-middle-end structure, cinematic imagery',
  aggressive: 'Write aggressive rap: intense delivery, battle rap energy, confidence, powerful imagery, dominance',
  melodic: 'Write melodic rap: singable hooks, emotional depth, vulnerability, catchy melodies implied in the flow',
};

async function generateWithGPT(prompt: string, systemPrompt: string): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 1500,
  });
  return response.choices[0]?.message?.content || '';
}

async function generateWithGrok(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const grok = getGrokClient();
    const response = await grok.chat.completions.create({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 1500,
    });
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[Lyrics] Grok error, falling back:', error);
    return generateWithGPT(prompt, systemPrompt);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LyricRequest = await request.json();
    const { theme, style, model, bars = 16, existingLyrics, action } = body;

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      );
    }

    const styleInstruction = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS['trap'];
    
    let userPrompt = '';
    let systemPrompt = `You are a legendary rap ghostwriter with decades of experience. ${styleInstruction}

Rules:
- Write exactly ${bars} bars (lines)
- Each bar should have 8-16 syllables for good flow
- Use internal rhymes and end rhymes
- Be creative but authentic to hip-hop culture
- No explicit slurs or hate speech
- Output ONLY the lyrics, no explanations or labels`;

    switch (action) {
      case 'generate':
        userPrompt = `Write ${bars} bars about: ${theme}`;
        break;
      case 'continue':
        systemPrompt += `\n\nContinue these existing lyrics naturally, matching the flow and rhyme scheme:`;
        userPrompt = `Existing lyrics:\n${existingLyrics}\n\nWrite ${bars} more bars continuing this song about: ${theme}`;
        break;
      case 'rewrite':
        systemPrompt += `\n\nRewrite these lyrics to be better while keeping the same theme and message:`;
        userPrompt = `Original lyrics:\n${existingLyrics}\n\nRewrite to be more impactful, with better rhymes and flow.`;
        break;
      case 'rhyme-suggestions':
        systemPrompt = `You are a rhyme expert. Given the last line of lyrics, suggest 5 different ways to continue with strong rhymes. Be creative with multisyllabic rhymes.`;
        userPrompt = `Last line: "${existingLyrics}"\n\nSuggest 5 next lines that rhyme well. Format as numbered list.`;
        break;
    }

    const results: { source: string; name: string; lyrics: string }[] = [];

    if (model === 'gpt' || model === 'both') {
      const gptLyrics = await generateWithGPT(userPrompt, systemPrompt);
      results.push({
        source: 'gpt',
        name: AI_PERSONALITIES.gpt.name,
        lyrics: gptLyrics,
      });
    }

    if (model === 'grok' || model === 'both') {
      const grokLyrics = await generateWithGrok(userPrompt, systemPrompt);
      results.push({
        source: 'grok',
        name: AI_PERSONALITIES.grok.name,
        lyrics: grokLyrics,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        theme,
        style,
        bars,
        action,
      },
    });
  } catch (error: any) {
    console.error('[Lyrics] Generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate lyrics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
