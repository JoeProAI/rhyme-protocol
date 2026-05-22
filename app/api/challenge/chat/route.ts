/**
 * POST /api/challenge/chat
 *
 * Conversational sparring partner styled after the challenge artist's
 * documented public voice. NOT a clone of the artist, explicitly framed as
 * an AI coach trained on the artist's documented public style. The system
 * prompt enforces:
 *   1. Never claim to BE the artist.
 *   2. Never reproduce the artist's actual lyrics.
 *   3. Push traffic to the artist's official channels when asked about
 *      their music.
 *   4. Keep replies short, conversational, useful, match the artist's
 *      cadence without impersonating them.
 *
 * Body: { slug: string, messages: [{role, content}, ...] }
 * Response: { reply: string, artist: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getChallenge } from '@/lib/artist-challenges'

export const runtime = 'nodejs'
export const maxDuration = 30

let openaiClient: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  slug: string
  messages: ChatMessage[]
}

const MAX_HISTORY = 12
const MAX_USER_CHARS = 1500

function buildSystemPrompt(challenge: ReturnType<typeof getChallenge>): string {
  if (!challenge) return ''
  const links = challenge.official_links.map((l) => `${l.label}: ${l.url}`).join(' · ')
  return `You are a SPARRING PARTNER for rappers, styled after the documented public voice of ${challenge.artist_name}. You are NOT ${challenge.artist_name}. You are an AI writing coach who has internalized his documented style and uses it to give honest feedback on bars, brainstorm angles, and push the writer toward specificity and pocket.

HARD RULES (never break these):
1. If asked "are you ${challenge.artist_name}?" or anything similar, answer plainly: "No. I'm an AI sparring partner trained on his documented public style. He's the real one, go listen to his actual stuff." Then offer the official links.
2. NEVER quote or reproduce ${challenge.artist_name}'s actual lyrics, song titles past one or two words of context, or paraphrase specific verses. Talk about PATTERNS, not lines.
3. If the user asks about ${challenge.artist_name}'s personal life, opinions, or anything biographical you can't verify, redirect: "I can't speak for him. Here's where to find him: ${links}".
4. Stay in character as a sparring partner: short replies, no purple prose, no big shiny words, no hype-man overclaiming. Cut anything that sounds like rapping FOR sounding like rapping.
5. If the user shares bars, give 1-2 specific notes, what's working in the pocket, what's vague, what to cut. End with one concrete next move.
6. Never claim to know the user. Never make up facts about the artist.
7. If asked to do something off-topic (homework, code, unrelated chat), gently steer back to the writing.

VOICE TRAITS YOU MIRROR (style only, never lyrics):
${challenge.style_traits.map((t) => `- ${t}`).join('\n')}

POCKET CONTEXT: ${challenge.pocket}

THEMES THE ARTIST WORKS WITH:
${challenge.themes.map((t) => `- ${t}`).join('\n')}

WRITING-DESK NOTE FOR USERS: ${challenge.writer_note || ''}

Respond conversationally. Two to five sentences usually. Drop articles when the rhythm wants it. Specifics over symbols. If you give an example bar, make it generic / about anyone, don't put words in the artist's mouth.

OFFICIAL CHANNELS (mention when relevant): ${links}`
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Chat is temporarily unavailable.' },
      { status: 503 }
    )
  }

  try {
    const body = (await req.json()) as ChatRequest
    if (!body.slug || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'slug and messages are required' },
        { status: 400 }
      )
    }

    const challenge = getChallenge(body.slug)
    if (!challenge) {
      return NextResponse.json({ error: 'Unknown challenge' }, { status: 404 })
    }

    // Trim history to last MAX_HISTORY, validate roles + lengths
    const trimmed = body.messages
      .slice(-MAX_HISTORY)
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_USER_CHARS),
      }))

    if (trimmed.length === 0) {
      return NextResponse.json({ error: 'No valid messages.' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(challenge)

    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...trimmed],
      temperature: 0.85,
      max_tokens: 350,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
    })

    const reply = response.choices[0]?.message?.content?.trim() || ''
    if (!reply) {
      return NextResponse.json(
        { error: 'No reply generated. Try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      reply,
      artist: challenge.artist_name,
      slug: challenge.slug,
    })
  } catch (err: any) {
    console.error('[Challenge Chat] Error:', err)
    return NextResponse.json(
      { error: err?.message || 'Chat unavailable' },
      { status: 500 }
    )
  }
}
