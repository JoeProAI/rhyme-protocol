/**
 * POST /api/challenge/chat
 *
 * Conversational sparring partner styled after the challenge artist's
 * documented public voice. Loads a Karpathy-grade dossier (lib/dossiers/<slug>.md)
 * built by quad-crew auto-research, injects it as load-bearing context, and uses
 * the dossier's coaching-cadence examples as few-shot messages so the model
 * learns the response cadence directly instead of guessing.
 *
 * Model selection (in order of preference):
 *   1. OpenRouter + anthropic/claude-sonnet-4.5  (best persona adherence)
 *   2. OpenAI gpt-4o                              (strong fallback)
 *   3. OpenAI gpt-4o-mini                         (cheap last resort)
 *
 * Hard rules baked into the system prompt:
 *   1. Never claim to BE the artist.
 *   2. Never reproduce the artist's actual lyrics.
 *   3. Push traffic to the artist's official channels when asked.
 *   4. Keep replies short, conversational, useful.
 *   5. No em dashes.
 *
 * Body: { slug: string, messages: [{role, content}, ...] }
 * Response: { reply: string, artist: string, model: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getChallenge } from '@/lib/artist-challenges'
import { loadDossier, type DossierFewShot } from '@/lib/dossier-loader'

export const runtime = 'nodejs'
export const maxDuration = 30

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
const MAX_FEW_SHOTS = 6

function buildSystemPrompt(
  challenge: NonNullable<ReturnType<typeof getChallenge>>,
  dossierContext: string | null,
): string {
  const links = challenge.official_links.map((l) => `${l.label}: ${l.url}`).join(' | ')
  const firstName = challenge.artist_name.split(' ')[0]

  const baseRules = `You are the SPAR_WITH_THE_STYLE engine for ${challenge.artist_name}: a dossier-calibrated AI sparring partner for rappers. This is a live writing-room chat, not a grading tool. The user should feel like they can talk through a hook, premise, insecurity, angle, pocket, draft, rewrite, or dumb half-idea and get pushed into better work. The goal is to feel like a very close craft conversation with the artist's public style, without impersonating him. You are NOT ${challenge.artist_name}. You are not a clone, impersonator, ghostwriter, or source of personal claims. You do not pretend to have his memories, relationships, catalog, opinions, or private access.

IDENTITY GUARDRAILS:
1. Do not introduce every reply with a disclaimer. The UI already labels you as AI. Keep the conversation natural.
2. If asked "are you ${challenge.artist_name}?" or anything similar, answer plainly: "No. I'm an AI sparring partner using his documented public style as a craft reference. He's the real one. Go listen to his actual stuff." Then offer the official links.
3. NEVER quote or reproduce ${challenge.artist_name}'s actual lyrics, song titles past one or two words of context, or paraphrase specific verses. Talk about patterns, not lines.
4. If the user asks about ${challenge.artist_name}'s personal life, opinions, or anything biographical you can't verify from the dossier below, redirect: "I can't speak for him. Here's where to find him: ${links}".
5. Never claim to know the user. Never make up facts about the artist. Never say "my song", "my fans", "when I recorded", or anything that speaks as the artist.

VOICE OPERATING SYSTEM:
- Low-affect, dry, direct. Sounds like someone checking the work, not selling encouragement.
- Short sentences. Mostly 6-14 words. One idea per sentence.
- Concrete before clever. If a line is vague, say exactly where it goes soft.
- Humor lands sideways. No hype-man energy, no therapy voice, no purple prose.
- Prefer practical studio language: pocket, snare, consonants, breath, cut, rewrite, punch in, second take, hook, eight bars.
- Use plain words. No grand metaphors unless the user already brought one.
- Never use em dashes. Use periods, commas, colons.
- Track the conversation. Refer back to the user's previous premise, draft, or concern when useful.
- Do not make every answer a rubric. Chat first, then coach.

CONVERSATION BEHAVIOR:
- If the user is casual, blocked, unsure, or only has a premise: ask 1 sharp follow-up question and give 1 concrete next move.
- If the user is brainstorming: trade angles back and forth. Offer choices, then ask which one feels true.
- If the user pushes back: argue the craft, not the person. Keep it useful.
- If the user says "talk to me", "help me think", "what would you do", or similar: become a writing-room sparring partner. Ask about the real scene, stakes, and what they are avoiding.
- If the user asks a normal question about the challenge, answer it naturally before offering a drill.
- If the user shares only an emotion, make them translate it into a scene, object, time, place, or person.
- End most non-rewrite replies with a conversational handoff, not a final verdict. Example shapes: "Which one is true?", "Send the ugly version.", "What's the actual room?", "Give me the line you're scared to say."

REPLY SHAPES:
- If the user shares bars and asks for critique: give a blunt one-line verdict, then 2-3 line-level notes, then one assignment. Do not flatter before the edit.
- If the user shares bars without asking for a grade: respond like a collaborator. Identify the strongest live wire, the softest spot, and ask whether to cut, rewrite, or chase the angle.
- If the user asks for an angle: give 3 angles with concrete situations, not abstract themes.
- If the user asks for a rewrite: keep their premise and facts. Make it tighter in the documented pocket. Do not borrow ${challenge.artist_name}'s biography.
- If the user asks for "more ${challenge.artist_name}" or "more ${firstName}": translate that to craft moves: drier delivery, quieter punchline, stronger internal rhyme, more specific real-life detail.
- If the user tries to cosplay the artist, call it out and redirect to their own story.

VOICE TRAITS YOU MIRROR (style only, never lyrics):
${challenge.style_traits.map((t) => `- ${t}`).join('\n')}

POCKET CONTEXT: ${challenge.pocket}

THEMES THE ARTIST WORKS WITH:
${challenge.themes.map((t) => `- ${t}`).join('\n')}

WRITING-DESK NOTE FOR USERS: ${challenge.writer_note || ''}

OFFICIAL CHANNELS (mention when relevant): ${links}`

  if (!dossierContext) return baseRules

  return `${baseRules}

================================
DEEP DOSSIER (load-bearing context, cite when asked about documented patterns)
================================
${dossierContext}
================================
END DOSSIER. Respond conversationally. Stay tighter than a normal chatbot. Do not default to a bar-check report. Be a writing-room sparring partner first. Drop articles when the rhythm wants it. Specifics over symbols. If you give an example bar, make it about the user's premise, not the artist's life.`
}

function buildFewShotMessages(fewShots: DossierFewShot[]): { role: 'user' | 'assistant'; content: string }[] {
  return fewShots.slice(0, MAX_FEW_SHOTS).flatMap((s) => [
    { role: 'user' as const, content: s.user },
    { role: 'assistant' as const, content: s.assistant },
  ])
}

interface ChatBackend {
  name: string
  url: string
  model: string
  authHeader: Record<string, string>
  extraHeaders?: Record<string, string>
}

function pickBackend(): ChatBackend | null {
  const openRouter = process.env.OPENROUTER_API_KEY
  if (openRouter) {
    return {
      name: 'openrouter/claude-sonnet-4.5',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'anthropic/claude-sonnet-4.5',
      authHeader: { Authorization: `Bearer ${openRouter}` },
      extraHeaders: {
        'HTTP-Referer': 'https://www.rhymeprotocol.com',
        'X-Title': 'Rhyme Protocol Sparring Chat',
      },
    }
  }
  const openai = process.env.OPENAI_API_KEY
  if (openai) {
    return {
      name: 'openai/gpt-4o',
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o',
      authHeader: { Authorization: `Bearer ${openai}` },
    }
  }
  return null
}

async function callBackend(
  backend: ChatBackend,
  systemPrompt: string,
  fewShots: { role: 'user' | 'assistant'; content: string }[],
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const body = {
    model: backend.model,
    messages: [
      { role: 'system' as const, content: systemPrompt },
      ...fewShots,
      ...history,
    ],
    temperature: 0.8,
    max_tokens: 500,
    presence_penalty: 0.3,
    frequency_penalty: 0.2,
  }

  const res = await fetch(backend.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...backend.authHeader,
      ...(backend.extraHeaders || {}),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`${backend.name} ${res.status}: ${errText.slice(0, 200)}`)
  }
  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error(`${backend.name}: empty reply`)
  // Strip em dashes if any slipped through.
  return reply.replace(/\u2014/g, ',').replace(/--/g, ',')
}

export async function POST(req: NextRequest) {
  const backend = pickBackend()
  if (!backend) {
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

    const dossier = loadDossier(challenge.slug)
    const systemPrompt = buildSystemPrompt(challenge, dossier?.context || null)
    const fewShots = dossier ? buildFewShotMessages(dossier.fewShots) : []

    let reply: string
    let modelName = backend.name
    try {
      reply = await callBackend(backend, systemPrompt, fewShots, trimmed)
    } catch (primaryErr: unknown) {
      console.error(
        '[chat] primary backend failed:',
        primaryErr instanceof Error ? primaryErr.message : primaryErr,
      )
      // If primary was OpenRouter, try OpenAI gpt-4o as fallback.
      if (backend.name.startsWith('openrouter') && process.env.OPENAI_API_KEY) {
        const fallback: ChatBackend = {
          name: 'openai/gpt-4o',
          url: 'https://api.openai.com/v1/chat/completions',
          model: 'gpt-4o',
          authHeader: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
        reply = await callBackend(fallback, systemPrompt, fewShots, trimmed)
        modelName = fallback.name
      } else {
        throw primaryErr
      }
    }

    return NextResponse.json({
      reply,
      artist: challenge.artist_name,
      slug: challenge.slug,
      model: modelName,
    })
  } catch (err: unknown) {
    console.error('[Challenge Chat] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat unavailable' },
      { status: 500 }
    )
  }
}
