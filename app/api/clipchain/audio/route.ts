import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminStorage } from '@/lib/firebase-admin'
import { generateSessionId } from '@/lib/usage-system'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BYTES = 15 * 1024 * 1024
const ALLOWED = new Map([
  ['audio/mpeg', 'mp3'],
  ['audio/mp3', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'],
  ['audio/mp4', 'm4a'],
  ['audio/x-m4a', 'm4a'],
  ['audio/aac', 'aac'],
  ['audio/ogg', 'ogg'],
])

/**
 * POST /api/clipchain/audio
 * Upload the soundtrack for a clip — music, vocal, voicemail, anything.
 * Stored PRIVATE (unreleased tracks must never get a public URL); only the
 * engine reads it back via the admin SDK, and only for this session's jobs.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    const isNewSession = !sessionId
    if (!sessionId) sessionId = generateSessionId()

    const form = await req.formData().catch(() => null)
    const file = form?.get('audio')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Attach an audio file as "audio"' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Audio must be under 15 MB' }, { status: 413 })
    }
    const ext = ALLOWED.get(file.type)
    if (!ext) {
      return NextResponse.json(
        { error: 'Unsupported format — use mp3, wav, m4a, aac, or ogg' },
        { status: 415 }
      )
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const path = `clipchain/uploads/${sessionId}/${id}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())
    await adminStorage().bucket().file(path).save(buf, {
      contentType: file.type,
      resumable: false,
    })

    const res = NextResponse.json({ audioPath: path, name: file.name })
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
    console.error('[clipchain] audio upload failed:', error)
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 })
  }
}
