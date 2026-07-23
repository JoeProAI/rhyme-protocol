import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { adminStorage } from '@/lib/firebase-admin'
import { generateSessionId } from '@/lib/usage-system'

export const runtime = 'nodejs'

const ALLOWED: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
}

const BodySchema = z.object({
  contentType: z.string().max(40),
})

/**
 * POST /api/clipchain/audio/sign
 * Real songs are bigger than Vercel's 4.5MB function-body cap, so uploads
 * go STRAIGHT to storage: this returns a short-lived signed PUT URL for a
 * session-scoped private path. The bucket stays private; the URL is the
 * capability and it expires in 15 minutes.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
    const ext = parsed.success ? ALLOWED[parsed.data.contentType] : undefined
    if (!ext) {
      return NextResponse.json(
        { error: 'Unsupported format — use mp3, wav, m4a, aac, or ogg' },
        { status: 415 }
      )
    }

    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    const isNewSession = !sessionId
    if (!sessionId) sessionId = generateSessionId()

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const audioPath = `clipchain/uploads/${sessionId}/${id}.${ext}`
    const [uploadUrl] = await adminStorage()
      .bucket()
      .file(audioPath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType: parsed.success ? parsed.data.contentType : 'audio/mpeg',
      })

    const res = NextResponse.json({ uploadUrl, audioPath })
    if (isNewSession) {
      res.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      })
    }
    return res
  } catch (error) {
    console.error('[clipchain] sign failed:', error)
    return NextResponse.json({ error: 'Could not prepare upload' }, { status: 500 })
  }
}
