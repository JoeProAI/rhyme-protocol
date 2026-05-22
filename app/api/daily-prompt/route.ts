import { NextResponse } from 'next/server'
import { getDailyPrompt } from '@/lib/daily-prompt'

/**
 * GET /api/daily-prompt
 * Returns today's prompt. Cached at the edge for 1 hour, in browser for 5 min.
 */
export async function GET() {
  const prompt = getDailyPrompt()
  return NextResponse.json(prompt, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, max-age=300, stale-while-revalidate=86400',
    },
  })
}
