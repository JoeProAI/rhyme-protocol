import { NextResponse } from 'next/server'
import { PRICE_PER_SECOND_CENTS, clipProducts } from '@/lib/clipchain/pricing'

export const runtime = 'nodejs'

/**
 * GET /api/clipchain/pricing
 * Flat, transparent prices — the UI renders exactly what billing charges.
 * All derived from one per-second rate that tracks Seedance cost down.
 */
export async function GET() {
  return NextResponse.json({
    perSecondCents: PRICE_PER_SECOND_CENTS,
    products: clipProducts(),
  })
}
