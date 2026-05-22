/**
 * Free Starter Pack
 *
 * Static, zero-cost resources for rap artists. Everything here is free to
 * download, copy, remix, and use. No API calls, no rate limits, no signups.
 *
 * Built for the rap community.
 */

export interface PromptIdea {
  title: string
  prompt: string
  style: string
  bars: number
}

export interface FlowPattern {
  name: string
  description: string
  bpm_range: [number, number]
  example: string
}

export interface RhymeFamily {
  vowel_sound: string
  examples: string[]
  notes: string
}

export const STARTER_PROMPTS: PromptIdea[] = [
  { title: 'Hood Origin', prompt: 'where you came up vs. who you became', style: 'storytelling', bars: 16 },
  { title: 'Industry Mirror', prompt: 'what the industry tried to make you', style: 'aggressive', bars: 16 },
  { title: '3am Confession', prompt: 'the verse you only write when you can\'t sleep', style: 'conscious', bars: 12 },
  { title: 'Quiet Flex', prompt: 'success that nobody can see from the outside', style: 'trap', bars: 12 },
  { title: 'The Phone Call', prompt: 'a conversation you keep replaying', style: 'storytelling', bars: 16 },
  { title: 'Block Royalty', prompt: 'what royalty looked like on your block', style: 'oldschool', bars: 16 },
  { title: 'Self-Diss', prompt: 'all the criticisms of yourself, but make them bars', style: 'aggressive', bars: 16 },
  { title: 'Sunday Morning', prompt: 'the version of you your grandmother saw', style: 'melodic', bars: 12 },
  { title: 'First Show', prompt: 'the first time a stranger knew your words', style: 'storytelling', bars: 16 },
  { title: 'The Replacement', prompt: 'who took the spot that was supposed to be yours', style: 'aggressive', bars: 16 },
  { title: 'Forgiveness Bar', prompt: 'who you finally stopped being mad at', style: 'conscious', bars: 12 },
  { title: 'Receipt Verse', prompt: 'a verse made entirely of specific receipts', style: 'oldschool', bars: 16 },
  { title: 'Brand New', prompt: 'the day everything changed but nobody noticed', style: 'melodic', bars: 12 },
  { title: 'Loyalty Test', prompt: 'who passed and who failed, no names', style: 'trap', bars: 16 },
  { title: 'Two Versions', prompt: 'who you are on stage vs at home', style: 'conscious', bars: 16 },
  { title: 'The Comeback', prompt: 'what they didn\'t see coming', style: 'aggressive', bars: 16 },
  { title: 'Every Mirror', prompt: 'what you see in every reflection', style: 'melodic', bars: 12 },
  { title: 'Last Year', prompt: 'a letter to yourself 12 months ago', style: 'storytelling', bars: 16 },
  { title: 'Block By Block', prompt: 'a tour of your old neighborhood, scene by scene', style: 'storytelling', bars: 16 },
  { title: 'Hidden Track', prompt: 'the verse you wrote but never released', style: 'conscious', bars: 12 },
  { title: 'Mama Said', prompt: 'something your mother said that became a punchline', style: 'oldschool', bars: 16 },
  { title: 'The Money Test', prompt: 'who showed up after you got it', style: 'trap', bars: 12 },
  { title: 'Funeral Bars', prompt: 'who you\'d want to write your verse', style: 'storytelling', bars: 16 },
  { title: 'Everything Cost', prompt: 'the price tag on each level you climbed', style: 'aggressive', bars: 16 },
  { title: 'Future Self', prompt: 'a verse from you, ten years from now', style: 'conscious', bars: 16 },
]

export const FLOW_PATTERNS: FlowPattern[] = [
  {
    name: 'Boom Bap',
    description: 'Classic 90s pocket. 4/4 kick on 1-3, snare on 2-4. Lyrics ride the snare.',
    bpm_range: [85, 95],
    example: 'Tribe Called Quest, Nas - Illmatic, early Wu-Tang',
  },
  {
    name: 'Triplet Trap',
    description: 'Three syllables per beat, hi-hat rolls. Migos pocket.',
    bpm_range: [130, 145],
    example: 'Migos, Future "Mask Off", Travis Scott',
  },
  {
    name: 'Drill Stagger',
    description: 'Bars start slightly off-beat, sliding 808s, half-time feel over fast hats.',
    bpm_range: [140, 145],
    example: 'Pop Smoke, Chief Keef, UK drill',
  },
  {
    name: 'Double Time',
    description: 'Twice the syllables per bar. Verbal showcase mode.',
    bpm_range: [85, 100],
    example: 'Twista, Tech N9ne, Eminem',
  },
  {
    name: 'Pocket Drift',
    description: 'Lazy-feel flow that lags behind the beat then snaps back. Conversation pocket.',
    bpm_range: [70, 85],
    example: 'Drake "Marvins Room", Earl Sweatshirt',
  },
  {
    name: 'Singsong Melodic',
    description: 'Melodic motif stays consistent across verses. Hooks inside hooks.',
    bpm_range: [70, 90],
    example: 'Lil Baby, Rod Wave, Lil Tjay',
  },
]

export const RHYME_FAMILIES: RhymeFamily[] = [
  {
    vowel_sound: 'ay (long A)',
    examples: ['away', 'today', 'replay', 'A.K.', 'cliché', 'parquet', 'soufflé', 'sashay', 'replay'],
    notes: 'Big family. Easy starter for multisyllabics: "today / replay" -> "all the way / J.Cole way".',
  },
  {
    vowel_sound: 'ee (long E)',
    examples: ['greedy', 'speedy', 'TV', 'ETC', 'CD', 'AC', 'clearly', 'dearly', 'merci'],
    notes: 'Easy melodic landings. Pairs naturally with internal rhymes on -ee endings.',
  },
  {
    vowel_sound: 'ow',
    examples: ['proud', 'crowd', 'loud', 'plowed', 'Saudi', 'cloudy', 'roundup'],
    notes: 'Strong landing for emphasis bars. Use sparingly — overused = corny.',
  },
  {
    vowel_sound: 'ack/at',
    examples: ['back', 'track', 'crack', 'stat', 'gnat', 'flat', 'combat', 'Iraq'],
    notes: 'Hard consonants give percussive feel. Great for aggressive verses.',
  },
  {
    vowel_sound: 'ight/ite',
    examples: ['night', 'light', 'fight', 'right', 'spite', 'ignite', 'satellite', 'oversight'],
    notes: 'Cinematic vowel. Pairs well with imagery-heavy storytelling.',
  },
  {
    vowel_sound: 'ow/ole',
    examples: ['cold', 'gold', 'sold', 'bowl', 'patrol', 'control', 'parole', 'pothole', 'rocked the soul'],
    notes: 'Smooth, weighted landings. Works in luxury or conscious mode.',
  },
]

export const STARTER_FREESTYLE_TEMPLATE = `[INTRO - 4 bars]
Set the scene. Where are you, what's the energy?
Don't waste lines on intros longer than this.

[VERSE 1 - 16 bars]
Bars 1-4: Hook the listener. Best line up top.
Bars 5-8: Build context. Who, what, why.
Bars 9-12: Twist or escalate. Reveal something.
Bars 13-16: Payoff line. The one they screenshot.

[HOOK - 8 bars]
4 lines that capture the verse in feeling.
Repeat once for emphasis.
Should work as a tweet on its own.

[VERSE 2 - 16 bars]
Don't repeat verse 1's structure. Mirror, invert, or escalate.
End on a line that reframes the hook's meaning.

[OUTRO - 4 bars]
Ride out. Don't over-explain. Let the silence do work.`

export const STARTER_PACK_VERSION = 'v1.0 - 2026-05-22'
