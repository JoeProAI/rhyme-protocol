import { NextResponse } from 'next/server'
import { getGlobalBudgetStatus } from '@/lib/usage-system'

/**
 * GET /api/usage/budget
 * Public read of the global daily $ budget status. Used by UI to show a
 * "community budget" bar so users understand why expensive generations might
 * pause for the day.
 */
export async function GET() {
  const status = await getGlobalBudgetStatus()
  return NextResponse.json(status)
}
