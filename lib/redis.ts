/**
 * Redis client for persistent usage tracking
 * Uses Upstash Redis (serverless, free tier available)
 * 
 * Setup: Add these to your .env:
 * UPSTASH_REDIS_REST_URL=your_url
 * UPSTASH_REDIS_REST_TOKEN=your_token
 */

import { Redis } from '@upstash/redis'

// Initialize Redis client with validation
let redis: Redis | null = null

try {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  
  if (url && token) {
    // Validate URL format - must be https:// for REST API
    if (!url.startsWith('https://')) {
      console.warn('[Redis] Invalid URL format. UPSTASH_REDIS_REST_URL must start with https://')
      console.warn('[Redis] Falling back to in-memory storage')
    } else {
      redis = new Redis({ url, token })
    }
  }
} catch (error) {
  console.error('[Redis] Failed to initialize Redis client:', error)
  console.warn('[Redis] Falling back to in-memory storage')
}

// Fallback to in-memory if Redis not configured
const memoryStore = new Map<string, any>()

export async function redisGet<T>(key: string): Promise<T | null> {
  if (redis) {
    return await redis.get(key)
  }
  return memoryStore.get(key) || null
}

export async function redisSet(key: string, value: any, exSeconds?: number): Promise<void> {
  if (redis) {
    if (exSeconds) {
      await redis.set(key, value, { ex: exSeconds })
    } else {
      await redis.set(key, value)
    }
  } else {
    memoryStore.set(key, value)
  }
}

export async function redisIncr(key: string): Promise<number> {
  if (redis) {
    return await redis.incr(key)
  }
  const current = memoryStore.get(key) || 0
  memoryStore.set(key, current + 1)
  return current + 1
}

export async function redisIncrBy(key: string, amount: number): Promise<number> {
  if (redis) {
    return await redis.incrby(key, amount)
  }
  const current = memoryStore.get(key) || 0
  memoryStore.set(key, current + amount)
  return current + amount
}

export async function redisExpire(key: string, seconds: number): Promise<void> {
  if (redis) {
    await redis.expire(key, seconds)
  }
  // In-memory doesn't support expiry, but that's fine for dev
}

export async function redisTTL(key: string): Promise<number> {
  if (redis) {
    return await redis.ttl(key)
  }
  return -1
}

export function isRedisConfigured(): boolean {
  return redis !== null
}

export default redis
