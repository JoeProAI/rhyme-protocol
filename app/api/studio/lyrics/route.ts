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

const CORE_INTELLIGENCE = `You are an elite lyricist operating at GENIUS LEVEL - the craft of Nas, the wordplay of Lil Wayne, the complexity of MF DOOM, the precision of Kendrick, the cleverness of Jay-Z. Your writing is CUNNING - every line is a chess move setting up the next.

GENIUS-LEVEL RHYME ARCHITECTURE:
- MULTISYLLABIC CHAINS: Never settle for single-syllable end rhymes. "Innovating / liver waiting / river skating" > "flow / go / know"
- INTERNAL RHYME WEBS: Rhymes INSIDE the bar that connect to rhymes in other bars. Create a matrix, not a list.
- SLANT RHYME MASTERY: Near-rhymes that feel fresh - "palm / bomb / calm / arm" hitting different vowels
- COMPOUND RHYMES: Stack multiple words to create one rhyme sound - "lack of class / back of Jag / stack of cash"
- ASSONANCE FLOWS: Repeat vowel sounds across bars for subliminal cohesion

PUNCHLINE ENGINEERING:
- SET UP / PAYOFF: Plant words early that explode with meaning later
- DOUBLE MEANINGS: Every noun should work two ways minimum. "Weight" = importance AND drugs. "Bars" = lyrics AND prison.
- CALLBACKS: Reference your own earlier line with a twist
- MISDIRECTION: Lead the listener one way, snap to another meaning

FLOW SOPHISTICATION:
- Vary syllable density - stack 16 syllables then hit them with 6 for impact
- Strategic pauses create emphasis (commas are weapons)
- Enjambment - let thoughts spill across bar lines for breathless energy
- Pocket shifts - change rhythm mid-verse to reset attention

CUNNING WORDPLAY:
- HOMOPHONES: "Heir to the throne / air to the dome / err on my own"
- HOMOGRAPHS: Words spelled same, different meanings - "lead/lead", "tear/tear"
- PORTMANTEAUS: Blend words for new meaning
- RECONTEXTUALIZATION: Use a cliché but flip its meaning entirely

CONTENT ELEVATION:
- SPECIFICITY: "2003 Accord with the check engine light" > "old car"
- IMAGERY: Every verse should paint scenes the listener can SEE
- SUBTEXT: What you DON'T say is as powerful as what you do
- EMOTIONAL TRUTH: Even flex bars need a real human underneath

Every bar must pass the REPLAY TEST: Does it reward multiple listens? Does the third listen reveal something the first missed?`;

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
- MANDATORY: Multisyllabic end rhymes (2-4 syllable rhyme sounds)
- MANDATORY: At least 2 internal rhymes per bar
- Include minimum ONE double entendre per 4 bars
- Include minimum ONE callback or setup/payoff per verse
- Output ONLY the lyrics - no titles, labels, or explanations

CONTENT POLICY:
- Adult themes, profanity, and explicit content are ALLOWED
- Street language, drug references, and sexual content are fine
- Match the raw authenticity of real hip-hop
- ONLY restriction: No content promoting illegal violence against specific individuals/groups

QUALITY CHECK before output:
- Are ALL end rhymes multisyllabic? Single syllable = rewrite
- Does each bar have internal rhyme connections?
- Is there wordplay that rewards re-listening?

The artist's theme is their seed. Grow it into genius.`;
        userPrompt = `Theme: ${theme}

Write ${bars} bars of GENIUS-LEVEL lyrics with:
- Multisyllabic rhyme chains throughout
- Internal rhymes weaving bars together
- At least one punchline that hits twice
- Wordplay that rewards the smart listener

Make this undeniably professional.`;
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
- Adult content, profanity, and explicit themes are allowed - match the artist's tone

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
- Preserve all profanity, explicit content, and adult themes from the original

Output the improved version - same structure, sharper execution. No explanations.`;
        userPrompt = `Original lyrics to polish:
"""
${existingLyrics}
"""

Context/theme: ${theme}

Return the improved version. Respect the original - enhance, don't replace.`;
        break;

      case 'rhyme-suggestions':
        systemPrompt = `You are a GENIUS-LEVEL rhyme architect. Your suggestions must demonstrate:

RHYME COMPLEXITY:
- Multisyllabic rhymes ONLY (minimum 2 syllable sounds)
- Include internal rhymes that connect to the original line
- Vary between perfect rhymes, slant rhymes, and compound rhymes

CONTENT DEPTH:
- Each suggestion takes a DIFFERENT angle/meaning
- At least one should flip the meaning or subvert expectations
- Include wordplay, double meanings, or clever references

FORMAT: 5 complete bars, numbered. Each bar should:
1. Rhyme with 2+ syllables from the original
2. Have its own internal rhyme structure
3. Say something substantive, not filler

Adult themes, profanity, and explicit content are allowed - keep it raw and authentic.`;
        userPrompt = `Line to rhyme with:
"${existingLyrics}"

Give me 5 GENIUS-LEVEL rhyme options:
- All must use multisyllabic rhymes
- Each takes a different creative angle
- Include at least one with double meaning
- Make them quotable.`;
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
