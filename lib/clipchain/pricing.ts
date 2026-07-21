/**
 * Single source of truth for ClipChain pricing.
 *
 * Everything derives from ONE per-second rate that tracks provider cost:
 * when Seedance gets cheaper, lower CLIPCHAIN_PRICE_PER_SECOND_CENTS and
 * every flat price below drops with it — no code change, no redeploy of
 * copy. The UI reads these numbers from /api/clipchain/pricing.
 */

export const PRICE_PER_SECOND_CENTS = Number(
  process.env.CLIPCHAIN_PRICE_PER_SECOND_CENTS || '35'
)

export interface ClipProduct {
  id: string
  label: string
  shots: number
  secondsPerShot: 5 | 10 | 15
  seconds: number
  priceCents: number
  filmScale: boolean
}

const SHAPES: { id: string; label: string; shots: number; secondsPerShot: 5 | 10 | 15 }[] = [
  { id: 'clip', label: 'Clip', shots: 3, secondsPerShot: 5 },
  { id: 'scene', label: 'Scene', shots: 6, secondsPerShot: 10 },
  { id: 'video', label: 'Music video', shots: 12, secondsPerShot: 15 },
  { id: 'film', label: 'Film', shots: 25, secondsPerShot: 15 },
]

export function clipProducts(): ClipProduct[] {
  return SHAPES.map((s) => {
    const seconds = s.shots * s.secondsPerShot
    return {
      ...s,
      seconds,
      priceCents: seconds * PRICE_PER_SECOND_CENTS,
      filmScale: s.shots > 4 || s.secondsPerShot > 5,
    }
  })
}
