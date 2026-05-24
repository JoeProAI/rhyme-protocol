/**
 * Dossier loader. Reads the per-artist dossier markdown at module init,
 * extracts the coaching-cadence few-shot examples, and caches both.
 *
 * Dossiers live at lib/dossiers/<slug>.md and are produced by quad-crew
 * deep research. They contain documented public-style data only. NO LYRICS.
 *
 * The chat agent loads:
 *   - Dossier sections 1-9, 11 as load-bearing context in the system prompt.
 *   - Dossier section 10 (coaching examples) as actual few-shot messages
 *     before the user's turn, so the model learns the cadence directly.
 */

import { DOSSIERS } from '@/lib/dossiers'

export interface DossierFewShot {
  user: string
  assistant: string
}

export interface Dossier {
  /** Full markdown dossier minus the few-shot section, for system prompt. */
  context: string
  /** Parsed coaching examples used as few-shot messages. */
  fewShots: DossierFewShot[]
  /** Build date + confidence summary, for the credibility line. */
  metadata: string
}

const cache = new Map<string, Dossier | null>()

function tryRead(slug: string): string | null {
  return DOSSIERS[slug] || null
}

function parseFewShots(raw: string): DossierFewShot[] {
  // Section 10 is "COACHING-CADENCE EXAMPLES" with blocks like:
  //   [Writer]: ...
  //   [Coach in Cal-style]: ...
  const sectionMatch = raw.match(/#\s*10\.\s*COACHING-CADENCE EXAMPLES[\s\S]*?(?=\n#\s*11\.|\n#\s*\d+\.|$)/i)
  if (!sectionMatch) return []
  const section = sectionMatch[0]
  const pairs: DossierFewShot[] = []
  const blockRegex = /\[Writer\]:\s*([\s\S]*?)\n\s*\[Coach[^\]]*\]:\s*([\s\S]*?)(?=\n\s*\[Writer\]|$)/gi
  let m: RegExpExecArray | null
  while ((m = blockRegex.exec(section)) !== null) {
    const user = m[1].trim()
    const assistant = m[2].trim()
    if (user && assistant) pairs.push({ user, assistant })
  }
  return pairs
}

function stripFewShots(raw: string): string {
  return raw.replace(
    /#\s*10\.\s*COACHING-CADENCE EXAMPLES[\s\S]*?(?=\n#\s*11\.|$)/i,
    '# 10. COACHING-CADENCE EXAMPLES\n(Loaded separately as few-shot examples for the model.)\n\n',
  )
}

function extractMetadata(raw: string): string {
  const m = raw.match(/#\s*11\.\s*DOSSIER METADATA[\s\S]*?$/i)
  return m ? m[0].trim() : ''
}

export function loadDossier(slug: string): Dossier | null {
  if (cache.has(slug)) return cache.get(slug)!
  const raw = tryRead(slug)
  if (!raw) {
    cache.set(slug, null)
    return null
  }
  const dossier: Dossier = {
    context: stripFewShots(raw),
    fewShots: parseFewShots(raw),
    metadata: extractMetadata(raw),
  }
  cache.set(slug, dossier)
  return dossier
}
