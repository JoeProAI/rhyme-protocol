/**
 * User Generations Storage
 * Stores generated images and videos per user in Redis
 */

import { redisGet, redisSet, isRedisConfigured } from './redis'

export interface Generation {
  id: string
  type: 'cover_art' | 'video'
  imageUrl: string
  prompt: string
  metadata: Record<string, any>
  createdAt: string
}

interface UserGenerations {
  items: Generation[]
  lastUpdated: string
}

function getGenerationsKey(userId: string): string {
  return `generations:${userId}`
}

/**
 * Save a generation to user's history
 */
export async function saveGeneration(
  userId: string,
  generation: Omit<Generation, 'id' | 'createdAt'>
): Promise<Generation> {
  const key = getGenerationsKey(userId)
  const existing = await redisGet<UserGenerations>(key) || { items: [], lastUpdated: '' }
  
  const newGeneration: Generation = {
    ...generation,
    id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  
  // Add to front, keep last 50
  existing.items.unshift(newGeneration)
  existing.items = existing.items.slice(0, 50)
  existing.lastUpdated = new Date().toISOString()
  
  await redisSet(key, existing)
  
  return newGeneration
}

/**
 * Get user's generation history
 */
export async function getGenerations(userId: string): Promise<Generation[]> {
  const key = getGenerationsKey(userId)
  const data = await redisGet<UserGenerations>(key)
  return data?.items || []
}

/**
 * Delete a generation from user's history
 */
export async function deleteGeneration(userId: string, generationId: string): Promise<boolean> {
  const key = getGenerationsKey(userId)
  const existing = await redisGet<UserGenerations>(key)
  
  if (!existing) return false
  
  const index = existing.items.findIndex(g => g.id === generationId)
  if (index === -1) return false
  
  existing.items.splice(index, 1)
  existing.lastUpdated = new Date().toISOString()
  
  await redisSet(key, existing)
  return true
}
