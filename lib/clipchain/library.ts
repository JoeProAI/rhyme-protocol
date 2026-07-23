/**
 * Per-session clip library — the durable record of everything a user made.
 *
 * Job state in Redis expires (it's operational), but the library does not:
 * a finished film must survive the tab closing, the day ending, and the
 * user coming back next month. Video files live in Firebase Storage and
 * are not auto-deleted; this list holds the pointers.
 */

import { redisGet, redisSet } from '@/lib/redis'

export interface LibraryClip {
  jobId: string
  title: string
  videoUrl: string
  seconds: number
  shots: number
  createdAt: number
  billedUsd?: number
}

const MAX_CLIPS = 100
const key = (sessionId: string) => `clipchain:library:${sessionId}`

export async function saveClip(sessionId: string, clip: LibraryClip): Promise<void> {
  const list = (await redisGet<LibraryClip[]>(key(sessionId))) ?? []
  const existing = list.findIndex((c) => c.jobId === clip.jobId)
  if (existing !== -1) {
    // Retake redelivery: refresh the entry in place, keep its position.
    list[existing] = { ...list[existing], ...clip }
  } else {
    list.unshift(clip)
  }
  await redisSet(key(sessionId), list.slice(0, MAX_CLIPS))
}

export async function listClips(sessionId: string): Promise<LibraryClip[]> {
  return (await redisGet<LibraryClip[]>(key(sessionId))) ?? []
}
