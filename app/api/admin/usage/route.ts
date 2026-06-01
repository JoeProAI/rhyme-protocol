import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_USAGE_TOKEN
  if (!adminToken) {
    return NextResponse.json({ error: 'Admin usage token is not configured' }, { status: 503 })
  }
  if (req.headers.get('authorization') !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = new Date().toISOString().slice(0, 7)
  const snapshot = await adminDb()
    .collection('api_usage_monthly')
    .where('month', '==', month)
    .get()

  const rows = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => (b.costUsd || 0) - (a.costUsd || 0))

  const totals = rows.reduce(
    (acc: any, row: any) => {
      acc.calls += row.calls || 0
      acc.costUsd += row.costUsd || 0
      acc.totalTokens += row.totalTokens || 0
      acc.inputTokens += row.inputTokens || 0
      acc.outputTokens += row.outputTokens || 0
      acc.inputCharacters += row.inputCharacters || 0
      acc.durationSeconds += row.durationSeconds || 0
      acc.imageCount += row.imageCount || 0
      return acc
    },
    {
      calls: 0,
      costUsd: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      inputCharacters: 0,
      durationSeconds: 0,
      imageCount: 0,
    }
  )

  return NextResponse.json({ month, totals, rows })
}
