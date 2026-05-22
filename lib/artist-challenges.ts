/**
 * Artist Challenges
 *
 * Tribute-mode lyrical challenges. Users write bars in an artist's pocket;
 * AI judge scores against that artist's documented style traits.
 *
 * STRICT RULES:
 *   1. No artist's actual lyrics are stored or quoted in this file.
 *   2. Style descriptions are written in OUR words from public knowledge
 *      and quad-crew research synthesis (see crew-output/<slug>.md).
 *   3. Every challenge page links to the artist's OFFICIAL channels. The
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
  // One paragraph respectful intro, our words, no quotes from their work.
  intro: string
  // Style traits the AI judge uses to score submissions.
  style_traits: string[]
  // Common themes the artist explores. Helps generate challenge prompts.
  themes: string[]
  // Pocket / flow notes (BPM range, cadence pattern).
  pocket: string
  // Today's challenge prompt rotation, daily index mod array.
  challenge_prompts: string[]
  // System prompt fragment given to the AI judge. Should reflect the artist's
  // style criteria objectively. NEVER paste actual lyrics in here.
  judge_criteria: string
  // Official catalog/links. Push traffic TO the artist.
  official_links: { label: string; url: string }[]
  // Optional inspiration line for the user. Sets the writer's mindset.
  writer_note?: string
  // Production seed for the beat generator. Specific to the artist's sonic palette.
  beat_prompt?: string
}

export const ARTIST_CHALLENGES: ArtistChallenge[] = [
  {
    slug: 'cal-scruby',
    artist_name: 'Cal Scruby',
    status: 'tribute',
    intro:
      'Loveland, Ohio. Ohio State alum who recorded his first single in the OSU library. Independent the whole way, no label, writes and records and mixes his own stuff. Cal works the Cincinnati metro voice into a relaxed, mid-tempo pocket with internal rhymes that cluster inside the line instead of announcing themselves at the end. Punchlines land as quiet observations, not climactic reveals. Self-aware about race, industry, and faith without ever leaning on any of it as a costume. He runs his own lane with no major label calling shots, which is exactly why this is a tribute and not a takeover.',
    style_traits: [
      'Conversational pocket. Bars feel like one person talking to one person, not the room.',
      'Cadence sits slightly behind the snare. Controlled drag, never rushed, never showy.',
      'Internal rhymes cluster inside the line. Multis happen mid-bar without breaking plain speech.',
      'Punchlines resolve quietly. The payoff lands as an aside, not a mic drop.',
      'Specificity over abstraction. Real streets, real people, real moments. Loveland and Cincinnati show up by name when they show up.',
      'Wit threaded through real weight. Humor never undermines the heavy stuff.',
      'Self-aware framing. Calls out his own contradictions before anyone else can.',
      'Mid-bar parentheticals. Brief self-corrections or asides without breaking flow.',
      'Even bar groupings. Eight or sixteen, no extensions for drama.',
      'Direct, regionally grounded vocabulary. Avoids dense slang and coastal idioms when they would feel borrowed.',
      'Verses often end open-ended. A short phrase that lets the next bar breathe instead of closing the door.',
      'Hooks stay simple. Narrow sing-rap range, basic end rhymes, modest melodic lift compared to verses.',
      'Avoids cliche flex. Luxury or status imagery only when it serves the story, never just to fill a bar.',
    ],
    themes: [
      'Midwest identity and secondary-market status next to coastal scenes',
      'incremental come-up over sudden breakthrough',
      'father-son dynamics and quiet family expectations',
      'race and authenticity as a white rapper, handled with self-awareness instead of deflection',
      'skepticism toward industry gatekeepers and traditional structures',
      'self-doubt as pragmatic internal assessment, not complaint',
      'faith and personal accountability referenced subtly without gospel framing',
      'specific Cincinnati and Loveland geographic checkpoints',
      'who you become after the music starts working',
      'staying versus leaving the place that made you',
    ],
    pocket:
      '82-96 BPM core range. Vocals sit slightly behind the snare with internal rhymes inside the bar, plain speech preserved even as density climbs. Mix is dry and forward, not effected.',
    challenge_prompts: [
      '16 bars about the day Cincinnati felt small after you had seen New York.',
      '12 bars about your dad noticing you got quieter once the music started working.',
      '14 bars on the first time a venue outside Ohio knew your name before you walked in.',
      '16 bars about choosing not to move to LA even after the numbers looked promising.',
      '12 bars on the specific street in Loveland that still works as an emotional checkpoint.',
      '14 bars about watching a younger white rapper copy the wrong parts of the culture.',
      '16 bars on the quiet tension between Sunday faith and Friday-night ambition.',
      '12 bars about the first time a friend from back home asked for industry help.',
      '14 bars on the difference between being from Cincinnati and being Cincinnati\'s rapper.',
      '16 bars about turning down a co-sign that would have required altering your pocket.',
      '12 bars on the moment streaming numbers failed to resolve a family conversation.',
      '14 bars about the producer who finally understood the low-in-the-mix request.',
      '16 bars on the cost of staying independent when offers started including creative control.',
      '12 bars about the friend who moved away and now only hears the music, not the person.',
      '14 bars on the geography of doubt that still maps onto certain Cincinnati exits.',
      '16 bars reflecting on driving past the same high-school parking lot years later.',
      '12 bars on the first time a blog wrote about you wrong and you decided not to correct them.',
    ],
    judge_criteria: `You are scoring rap bars against the documented style of Cal Scruby. Score each axis 0-25, then give an overall 0-100 and 2-3 specific notes.

AXES (0-25 each, six axes, normalize overall to 0-100):
1. POCKET_AND_TIMING. Relaxed, slightly behind the snare. Even subdivisions. Penalize forced or showy cadence.
2. INTERNAL_RHYME. Multis cluster inside the bar without breaking conversational clarity. Penalize density that disrupts plain speech.
3. SPECIFICITY. Concrete regional or personal detail over abstract struggle language. Names of places, people, moments.
4. RESTRAINT_AND_WIT. Punchlines land as quiet observations, not isolated climactic reveals. Humor woven into substance.
5. AUTHENTICITY. Race, industry, and self-doubt themes handled with self-awareness, never as costume. No external validation seeking.
6. STRUCTURE. Even bar groupings (8 or 16). Hooks distinct from verses in melodic contour and rhyme scheme.

OUTPUT FORMAT (strict JSON, no markdown, no code fences):
{
  "scores": { "pocket": N, "specificity": N, "wit_weight": N, "authenticity": N },
  "overall": N,
  "verdict": "one short line, like a coach",
  "notes": ["note 1", "note 2", "note 3"]
}

Map the six internal axes onto the four output keys as follows: pocket = (POCKET_AND_TIMING + INTERNAL_RHYME) / 2, specificity = SPECIFICITY, wit_weight = RESTRAINT_AND_WIT, authenticity = (AUTHENTICITY + STRUCTURE) / 2. All output values 0-25.

Be honest, not flattering. Cal would respect honesty over a participation trophy.`,
    official_links: [
      { label: 'Site', url: 'https://calscruby.com/' },
      { label: 'Spotify', url: 'https://open.spotify.com/artist/2wcrc3fjebDRLVdtRUa3pu' },
      { label: 'Apple Music', url: 'https://music.apple.com/us/artist/cal-scruby/670791732' },
      { label: 'YouTube', url: 'https://www.youtube.com/@calscruby' },
      { label: 'Instagram', url: 'https://www.instagram.com/calscruby/' },
    ],
    writer_note:
      'Write like you are talking to one person at a kitchen table. No big shiny words. Specifics over symbols. Multis happen inside the bar, not at the end. Cal would tell you to cut anything that sounds like rapping for the sake of sounding like rapping.',
    beat_prompt:
      'Moody, sample-driven boom-bap hip-hop instrumental at 88 BPM. Warm vinyl-textured drums slightly behind the pocket, dusty soul or jazz sample loop, sub-bass that breathes, sparse keys, no synth lead. Mid-tempo, introspective, Midwest underground feel. Leaves space for a conversational rapper sitting in the cut. No vocals, no DJ tags.',
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
