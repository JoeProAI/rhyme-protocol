/**
 * Daily Prompt
 *
 * Curated rotating prompts that change once per day, server-cached for free.
 * Drives habitual return ("what's today's prompt?") with zero per-request cost.
 *
 * Add new entries to PROMPT_POOL — order doesn't matter, rotation is by
 * day-of-year mod pool size.
 */

export interface DailyPromptItem {
  theme: string
  style: string
  bars: number
  hint: string
}

const PROMPT_POOL: DailyPromptItem[] = [
  { theme: 'a 3am phone call you almost answered', style: 'storytelling', bars: 16, hint: 'Trust the silence between bars.' },
  { theme: 'the version of you that didn\'t make it', style: 'conscious', bars: 16, hint: 'Specificity beats abstraction. Name the corner.' },
  { theme: 'first time you got real money', style: 'trap', bars: 12, hint: 'What did you buy that you didn\'t actually want?' },
  { theme: 'a room your mother would not enter', style: 'aggressive', bars: 16, hint: 'Make every line earn its disrespect.' },
  { theme: 'the weather the day you grew up', style: 'oldschool', bars: 16, hint: 'Boom bap pocket. Let the scene breathe.' },
  { theme: 'love letter to the kid who never got picked', style: 'melodic', bars: 12, hint: 'Vulnerability hits harder than flex.' },
  { theme: 'driving with no destination, full tank', style: 'storytelling', bars: 16, hint: 'Camera-eye view. What do you see?' },
  { theme: 'the lie you tell yourself before sleep', style: 'conscious', bars: 12, hint: 'Truth in the punchline, lie in the setup.' },
  { theme: 'arguing with God in a Walmart parking lot', style: 'aggressive', bars: 16, hint: 'Make the holy and the mundane collide.' },
  { theme: 'the friend who never made it back', style: 'storytelling', bars: 16, hint: 'Their absence is the chorus.' },
  { theme: 'cash before culture, then culture pulled up', style: 'oldschool', bars: 16, hint: 'Show the receipt and the regret.' },
  { theme: 'the smile that means \"I won\"', style: 'trap', bars: 12, hint: 'Quiet flex > loud flex. Always.' },
  { theme: 'last conversation with your old self', style: 'melodic', bars: 16, hint: 'Forgive yourself out loud.' },
  { theme: 'the city at 4:47am from a rooftop', style: 'storytelling', bars: 16, hint: 'Light, sound, distance. Three senses minimum.' },
  { theme: 'the bill you opened with your eyes closed', style: 'conscious', bars: 12, hint: 'Money pressure as gravity, not topic.' },
  { theme: 'the friend who got religion suddenly', style: 'oldschool', bars: 16, hint: 'Curiosity > judgment in the writing.' },
  { theme: 'rage you can\'t spend yet', style: 'aggressive', bars: 16, hint: 'Tighten every consonant.' },
  { theme: 'the door you wish you hadn\'t opened', style: 'storytelling', bars: 16, hint: 'Don\'t name it directly. Circle the room.' },
  { theme: 'when winning started feeling like grief', style: 'melodic', bars: 12, hint: 'Joy and loss in the same syllable.' },
  { theme: 'the version of love your father showed', style: 'conscious', bars: 16, hint: 'No verdicts. Just the receipts.' },
]

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = (d.getTime() - start.getTime()) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getDailyPrompt(now: Date = new Date()): DailyPromptItem & { date: string; index: number; total: number } {
  const idx = dayOfYear(now) % PROMPT_POOL.length
  const item = PROMPT_POOL[idx]
  return {
    ...item,
    date: now.toISOString().slice(0, 10),
    index: idx,
    total: PROMPT_POOL.length,
  }
}
