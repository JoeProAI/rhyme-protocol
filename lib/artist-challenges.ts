/**
 * Artist Challenges
 *
 * Tribute-mode lyrical challenges. Users write bars in an artist's pocket;
 * AI judge scores against that artist's documented style traits.
 *
 * STRICT RULES:
 *   1. No artist's actual lyrics are stored or quoted in this file.
 *   2. Style descriptions are written in OUR words from public knowledge.
 *   3. Every challenge page links to the artist's OFFICIAL channels — the
 *      whole point is to drive traffic to them, not extract from them.
 *   4. We never generate the artist's voice without explicit signoff.
 *
 * To add an artist: append to ARTIST_CHALLENGES with a respectful profile
 * and links. That's it.
 */

export interface ArtistChallenge {
  slug: string
  artist_name: string
  status: 'tribute' | 'official' // 'official' = artist signed off + collaborating
  // One-paragraph respectful intro, our words, no quotes from their work.
  intro: string
  // 5-8 traits that describe the artist's lyrical style. Used by the AI judge.
  style_traits: string[]
  // Common themes the artist explores. Helps generate challenge prompts.
  themes: string[]
  // Pocket / flow notes (BPM range, cadence pattern).
  pocket: string
  // Today's challenge prompt rotation — daily index mod array.
  challenge_prompts: string[]
  // System prompt fragment given to the AI judge. Should reflect the artist's
  // style criteria objectively. NEVER paste actual lyrics in here.
  judge_criteria: string
  // Official catalog/links — push traffic TO the artist.
  official_links: { label: string; url: string }[]
  // Optional inspiration line for the user — sets the writer's mindset.
  writer_note?: string
}

export const ARTIST_CHALLENGES: ArtistChallenge[] = [
  {
    slug: 'cal-scruby',
    artist_name: 'Cal Scruby',
    status: 'tribute',
    intro:
      'Cincinnati-bred, independent, conversational pocket, midwest grit dressed in wit. ' +
      'Cal writes like the kid you grew up with who somehow read more than you ' +
      'and noticed everything you missed. Specific, self-aware, never forced. ' +
      'He runs his own lane — no label calling shots — which is exactly why this is a tribute, not a takeover.',
    style_traits: [
      'Conversational delivery — bars feel like he\'s talking to one person, not the room',
      'Specificity over abstraction — names streets, people, brands, exact moments',
      'Wit threaded through real pain — humor never undermines the weight',
      'Self-aware framing — calls out his own contradictions before you can',
      'Midwest references that feel earned, not nametag — Ohio, Cincinnati, the come-up',
      'Pocket sits behind the beat slightly — confident, never rushed',
      'Punchlines pay off two bars later — patient setups, satisfying snaps',
      'Avoids cliche flex — luxury imagery only when it serves the story, not the bag',
    ],
    themes: [
      'the come-up nobody believed in',
      'small-town leaving versus small-town staying',
      'industry vs. integrity',
      'family expectations',
      'who you become after you "make it"',
      'specific Midwest scenes',
      'self-doubt the night before a big moment',
    ],
    pocket: '85-95 BPM, slightly behind the beat, conversational cadence with internal rhymes that don\'t announce themselves',
    challenge_prompts: [
      'A 16-bar verse about a hometown friend who never believed you\'d make it.',
      '12 bars about the moment you realized success was lonelier than struggle.',
      '16 bars about the first time you went home after the world started watching.',
      '12 bars about a specific teacher, coach, or boss who got you wrong.',
      '16 bars about a Midwest winter and what it taught you.',
      '12 bars about leaving a friend behind without saying it out loud.',
      '16 bars about the version of you your parents still imagine.',
    ],
    judge_criteria: `You are scoring rap bars against the documented style of Cal Scruby. Score 0-100 across these axes, then give an overall score and 2-3 specific notes.

AXES (0-25 each):
1. POCKET — Conversational? Sits behind the beat? Or forced and showy?
2. SPECIFICITY — Real places, names, moments? Or generic flex / abstraction?
3. WIT-WEIGHT BALANCE — Humor woven into substance, or one-dimensional?
4. AUTHENTICITY — Self-aware, earned, no posturing? Or trying too hard?

OUTPUT FORMAT (strict JSON):
{
  "scores": { "pocket": N, "specificity": N, "wit_weight": N, "authenticity": N },
  "overall": N,
  "verdict": "one short line, like a coach",
  "notes": ["note 1", "note 2", "note 3"]
}

Be honest, not flattering. Cal would respect honesty over a participation trophy.`,
    official_links: [
      { label: 'Spotify', url: 'https://open.spotify.com/artist/4kkbHKsGz9MXuNomidcCvm' },
      { label: 'Apple Music', url: 'https://music.apple.com/us/artist/cal-scruby/977770181' },
      { label: 'YouTube', url: 'https://www.youtube.com/@calscruby' },
      { label: 'Instagram', url: 'https://www.instagram.com/calscruby/' },
    ],
    writer_note:
      'Write like you\'re talking to one person at a kitchen table. No big shiny words. Specifics over symbols. Cal would tell you to cut anything that sounds like rapping FOR sounding like rapping.',
  },
]

export function getChallenge(slug: string): ArtistChallenge | null {
  return ARTIST_CHALLENGES.find((c) => c.slug === slug) || null
}

export function listChallenges(): ArtistChallenge[] {
  return ARTIST_CHALLENGES
}

export function getDailyPromptForChallenge(challenge: ArtistChallenge, now: Date = new Date()): string {
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  const idx = dayOfYear % challenge.challenge_prompts.length
  return challenge.challenge_prompts[idx]
}
