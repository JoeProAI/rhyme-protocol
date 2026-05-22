import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getChallenge } from '@/lib/artist-challenges'

let openaiClient: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

export interface JudgeRequest {
  slug: string
  bars: string
  prompt: string
}

export interface JudgeResult {
  scores: {
    pocket: number
    specificity: number
    wit_weight: number
    authenticity: number
  }
  overall: number
  verdict: string
  notes: string[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as JudgeRequest
    if (!body.slug || !body.bars) {
      return NextResponse.json(
        { error: 'slug and bars are required' },
        { status: 400 },
      )
    }

    const challenge = getChallenge(body.slug)
    if (!challenge) {
      return NextResponse.json({ error: 'Unknown challenge' }, { status: 404 })
    }

    if (body.bars.length > 4000) {
      return NextResponse.json(
        { error: 'Submission too long' },
        { status: 400 },
      )
    }

    const systemPrompt = `${challenge.judge_criteria}

ARTIST STYLE TRAITS:
${challenge.style_traits.map((t) => `- ${t}`).join('\n')}

POCKET: ${challenge.pocket}

You are scoring user-written bars in this artist's style. The artist did not
write these bars; the user did. Score what they actually wrote — don't be
flattering, don't be cruel. Be a coach.

Return ONLY valid JSON matching the format. No prose, no markdown, no code fences.`

    const userPrompt = `CHALLENGE PROMPT GIVEN TO USER:
"${body.prompt}"

USER'S SUBMITTED BARS:
"""
${body.bars.trim()}
"""

Score them now. Return ONLY the JSON.`

    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0]?.message?.content || '{}'
    let parsed: JudgeResult
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'Judge returned malformed response' },
        { status: 502 },
      )
    }

    // Sanity-clamp scores
    const clamp = (n: any) => Math.max(0, Math.min(100, Number(n) || 0))
    const scores = {
      pocket: clamp(parsed.scores?.pocket),
      specificity: clamp(parsed.scores?.specificity),
      wit_weight: clamp(parsed.scores?.wit_weight),
      authenticity: clamp(parsed.scores?.authenticity),
    }
    const overall =
      clamp(parsed.overall) ||
      Math.round(
        (scores.pocket + scores.specificity + scores.wit_weight + scores.authenticity) /
          4,
      )

    return NextResponse.json({
      scores,
      overall,
      verdict: typeof parsed.verdict === 'string' ? parsed.verdict.slice(0, 240) : '',
      notes: Array.isArray(parsed.notes) ? parsed.notes.slice(0, 5) : [],
      artist: challenge.artist_name,
      slug: challenge.slug,
    })
  } catch (err: any) {
    console.error('[Challenge Judge] Error:', err)
    return NextResponse.json(
      { error: err?.message || 'Judge unavailable' },
      { status: 500 },
    )
  }
}
