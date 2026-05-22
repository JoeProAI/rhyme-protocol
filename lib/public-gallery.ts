import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit as fsLimit,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Public Gallery
 *
 * Opt-in wall of community generations. Users explicitly "Add to Gallery"
 * after a generation; we mirror a record into a top-level `public_gallery`
 * collection so anyone can browse without auth.
 *
 * No PII is stored — just the generated artifact, prompt, type, and a hashed
 * session_id for soft attribution / unpublish later.
 */

export type GalleryType = 'cover_art' | 'video' | 'lyrics' | 'audio'

export interface GalleryItem {
  id: string
  type: GalleryType
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  textContent?: string
  prompt: string
  style?: string
  sessionHash: string
  remixCount: number
  createdAt: Date
}

function hashSession(sessionId: string): string {
  // Simple, stable, non-cryptographic hash. We just want a way for a user to
  // unpublish their own posts without exposing the raw session cookie.
  let h = 5381
  for (let i = 0; i < sessionId.length; i++) {
    h = ((h << 5) + h + sessionId.charCodeAt(i)) | 0
  }
  return `s_${(h >>> 0).toString(36)}`
}

/**
 * Publish a generation to the public gallery.
 */
export async function publishToGallery(
  sessionId: string,
  item: Omit<GalleryItem, 'id' | 'createdAt' | 'sessionHash' | 'remixCount'>,
): Promise<GalleryItem> {
  const sessionHash = hashSession(sessionId)
  const ref = collection(db, 'public_gallery')

  const sanitized: Record<string, any> = {
    type: item.type,
    prompt: item.prompt || '',
    sessionHash,
    remixCount: 0,
    createdAt: serverTimestamp(),
  }
  if (item.imageUrl) sanitized.imageUrl = item.imageUrl
  if (item.videoUrl) sanitized.videoUrl = item.videoUrl
  if (item.audioUrl) sanitized.audioUrl = item.audioUrl
  if (item.textContent) sanitized.textContent = item.textContent
  if (item.style) sanitized.style = item.style

  const docRef = await addDoc(ref, sanitized)

  return {
    id: docRef.id,
    type: item.type,
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl,
    audioUrl: item.audioUrl,
    textContent: item.textContent,
    prompt: item.prompt,
    style: item.style,
    sessionHash,
    remixCount: 0,
    createdAt: new Date(),
  }
}

/**
 * Read recent public gallery items, optionally filtered by type.
 */
export async function listGallery(opts?: {
  type?: GalleryType
  limit?: number
}): Promise<GalleryItem[]> {
  const ref = collection(db, 'public_gallery')
  const max = Math.min(opts?.limit || 60, 200)

  const q = opts?.type
    ? query(ref, where('type', '==', opts.type), orderBy('createdAt', 'desc'), fsLimit(max))
    : query(ref, orderBy('createdAt', 'desc'), fsLimit(max))

  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as any
    return {
      id: d.id,
      type: data.type,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      audioUrl: data.audioUrl,
      textContent: data.textContent,
      prompt: data.prompt || '',
      style: data.style,
      sessionHash: data.sessionHash || '',
      remixCount: data.remixCount || 0,
      createdAt:
        data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    }
  })
}

/**
 * Allow a user to unpublish their own gallery item (via stable session hash).
 */
export async function unpublishFromGallery(sessionId: string, itemId: string): Promise<boolean> {
  const sessionHash = hashSession(sessionId)
  const ref = collection(db, 'public_gallery')
  const q = query(ref, where('__name__', '==', itemId))
  const snap = await getDocs(q)
  if (snap.empty) return false

  const found = snap.docs[0]
  const data = found.data() as any
  if (data.sessionHash !== sessionHash) {
    return false
  }
  await deleteDoc(doc(db, 'public_gallery', itemId))
  return true
}

export const _internal = { hashSession }
