import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  listGallery,
  publishToGallery,
  unpublishFromGallery,
  GalleryType,
} from '@/lib/public-gallery'
import { generateSessionId } from '@/lib/usage-system'

/**
 * GET /api/gallery?type=cover_art|video|lyrics|audio&limit=60
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const typeParam = url.searchParams.get('type') as GalleryType | null
  const limit = Number(url.searchParams.get('limit') || '60')
  try {
    const items = await listGallery({
      type: typeParam || undefined,
      limit: isNaN(limit) ? 60 : limit,
    })
    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json(
      { items: [], error: err?.message || 'Gallery unavailable' },
      { status: 200 },
    )
  }
}

/**
 * POST /api/gallery
 * Body: { type, prompt, imageUrl?, videoUrl?, audioUrl?, textContent?, style? }
 * Publishes the generation to the public wall (opt-in per click).
 */
export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  let sessionId = cookieStore.get('anon_session')?.value
  const isNewSession = !sessionId
  if (!sessionId) sessionId = generateSessionId()

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.type || !body.prompt) {
    return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 })
  }

  try {
    const item = await publishToGallery(sessionId, {
      type: body.type,
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl,
      audioUrl: body.audioUrl,
      textContent: body.textContent,
      style: body.style,
    })

    const res = NextResponse.json({ item })
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to publish' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/gallery?id=...
 * Lets the original session unpublish their own item.
 */
export async function DELETE(req: NextRequest) {
  const cookieStore = cookies()
  const sessionId = cookieStore.get('anon_session')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const ok = await unpublishFromGallery(sessionId, id)
  if (!ok) return NextResponse.json({ error: 'Not your item or not found' }, { status: 403 })
  return NextResponse.json({ success: true })
}
