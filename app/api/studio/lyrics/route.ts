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
    model: 'gpt-4.1-2025-04-14',
  },
  grok: {
    name: 'The Provocateur', 
    focus: 'bold statements, cultural references, wit and edge',
    model: 'grok-3-fast',
  },
};

const STYLE_INSTRUCTIONS: Record<string, string> = {
  trap: 'Trap style: hard 808s energy, strategic ad-libs, hypnotic hooks, flex with substance, modern vernacular, triplet pocket flows. Make every flex line carry weight.',
  conscious: 'Conscious style: profound truths wrapped in metaphor, social observation that cuts deep, introspection that resonates universally, bars that reward re-listening.',
  oldschool: 'Golden era style: boom bap pocket, narrative mastery, punchlines that land three ways, reverent nods to the culture, technical virtuosity that serves the message.',
  storytelling: 'Cinematic style: vivid sensory details, character interiority, tension and release, scenes that play like films, emotional payoffs that hit.',
  aggressive: 'Battle mode: surgical precision strikes, unshakeable confidence, imagery that dominates, quotables that end careers, controlled fury.',
  melodic: 'Melodic style: earworm hooks with depth, vulnerability as strength, emotional truth over bravado, flows that sing naturally.',
};

const CORE_INTELLIGENCE = `You are an elite lyricist with the mind of a chess grandmaster and the soul of a poet. Your gift is AMPLIFICATION - taking the artist's raw idea and elevating it to its most powerful, clever, and memorable form.

AMPLIFICATION PRINCIPLES:
- Find the SHARPEST angle on any theme. If they say "money", find the angle no one's hit before.
- Layer meaning: surface level hits immediately, deeper meaning rewards the listener.
- Wordplay should feel inevitable in hindsight, surprising in the moment.
- Every bar should justify its existence. No filler. No throwaway lines.
- Rhyme schemes should feel effortless but be technically sophisticated.
- Internal rhymes, slant rhymes, multisyllabics - use them like a surgeon, not a show-off.

INTELLIGENCE MARKERS:
- Double/triple entendres that actually work
- References that reward knowledge without excluding newcomers  
- Subverted expectations - set up one direction, land somewhere smarter
- Emotional truth even in braggadocio
- Specificity over generality (details make it real)`;

const EDIT_PHILOSOPHY = `EDITING DOCTRINE - RESPECT THE ORIGINAL:
When given existing lyrics to improve, you are a COLLABORATOR, not a replacement.

RULES FOR EDITING:
1. PRESERVE the artist's voice, word choices, and core ideas whenever possible
2. ENHANCE rhyme schemes without changing the meaning
3. TIGHTEN loose bars - cut unnecessary words, sharpen impact
4. FIX technical issues (syllable count, flow pockets) with MINIMAL word changes
5. ELEVATE weak lines by finding the SAME idea expressed more powerfully
6. NEVER impose your style over theirs - amplify THEIR vision
7. If a line is already strong, LEAVE IT ALONE

Your changes should feel like polish, not replacement. The artist should recognize their work, just better.`;

async function generateWithGPT(prompt: string, systemPrompt: string): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-2025-04-14',
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
      model: 'grok-3-fast',
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
    let systemPrompt = '';

    switch (action) {
      case 'generate':
        systemPrompt = `${CORE_INTELLIGENCE}

${styleInstruction}

TECHNICAL REQUIREMENTS:
- Exactly ${bars} bars (lines)
- 8-16 syllables per bar for proper flow
- Strong end rhymes, strategic internal rhymes
- No slurs or hate speech
- Output ONLY the lyrics - no titles, labels, or explanations

The artist's theme is their seed. Your job is to grow it into something they couldn't have written alone, but wish they had.`;
        userPrompt = `Theme to amplify: ${theme}

Write ${bars} bars that take this concept to its highest form. Find the angle that makes it unforgettable.`;
        break;

      case 'continue':
        systemPrompt = `${CORE_INTELLIGENCE}

${styleInstruction}

CONTINUATION RULES:
- Study the existing lyrics' rhyme scheme and MATCH it exactly
- Match their vocabulary level and word choices
- Continue the narrative/emotional thread seamlessly
- The transition should be invisible - like they wrote it in one session
- ${bars} new bars that feel like the natural next chapter

Output ONLY the new bars - no labels or explanations.`;
        userPrompt = `Existing lyrics to continue from:
"""
${existingLyrics}
"""

Theme/direction: ${theme}

Write ${bars} bars that continue this seamlessly. Match their voice.`;
        break;

      case 'rewrite':
        systemPrompt = `${CORE_INTELLIGENCE}

${EDIT_PHILOSOPHY}

${styleInstruction}

YOUR TASK: Polish these lyrics with SURGICAL PRECISION.
- Keep lines that already work
- Fix technical issues (flow, syllables, rhymes) with minimal word changes  
- Elevate weak bars while preserving the original idea
- The artist should recognize 80%+ of their original words

Output the improved version - same structure, sharper execution. No explanations.`;
        userPrompt = `Original lyrics to polish:
"""
${existingLyrics}
"""

Context/theme: ${theme}

Return the improved version. Respect the original - enhance, don't replace.`;
        break;

      case 'rhyme-suggestions':
        systemPrompt = `You are a rhyme architect. Your suggestions should be:
- Technically impressive (multisyllabic, internal rhymes)
- Varied in approach (different angles on the same sound)
- Ready to use - complete bar ideas, not just rhyming words
- Smart - each suggestion should have substance, not just sound

Provide exactly 5 options, numbered. Each should be a complete bar that rhymes with the given line.`;
        userPrompt = `Line to rhyme with:
"${existingLyrics}"

Give me 5 different next-bar options that rhyme hard and say something worth saying.`;
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
