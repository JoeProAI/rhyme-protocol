import { FieldValue } from 'firebase-admin/firestore'
import { cookies, headers } from 'next/headers'
import { adminDb } from './firebase-admin'

type UsageProvider = 'openai' | 'xai' | 'elevenlabs'

type UsageUnit = 'tokens' | 'characters' | 'seconds' | 'images' | 'audio'

interface ApiUsageEvent {
  feature: string
  provider: UsageProvider
  model: string
  endpoint: string
  operation: string
  unit: UsageUnit
  quantity: number
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  inputCharacters?: number
  outputCharacters?: number
  durationSeconds?: number
  imageCount?: number
  costUsd: number
  success: boolean
  userId?: string | null
  statusCode?: number
  metadata?: Record<string, unknown>
}

const OPENAI_TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  'gpt-4.1-2025-04-14': { input: 0.000002, output: 0.000008 },
  'gpt-4.1': { input: 0.000002, output: 0.000008 },
}

const XAI_TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'grok-3-fast': { input: 0.000005, output: 0.000025 },
}

const OPENAI_IMAGE_COSTS: Record<string, Record<string, number>> = {
  'gpt-image-1.5': { low: 0.02, medium: 0.04, high: 0.17 },
  'gpt-image-2': { low: 0.05, medium: 0.1, high: 0.19 },
}

const ELEVENLABS_COSTS = {
  ttsPerCharacter: 0.00003,
  musicPerSecond: 0.002,
  sfxPerSecond: 0.0015,
  isolationPerSecond: 0.001,
}

export function estimateChatCost(provider: UsageProvider, model: string, inputTokens = 0, outputTokens = 0): number {
  const table = provider === 'xai' ? XAI_TOKEN_COSTS : OPENAI_TOKEN_COSTS
  const rates = table[model] || { input: 0, output: 0 }
  return roundUsd(inputTokens * rates.input + outputTokens * rates.output)
}

export function estimateImageCost(model: string, quality = 'medium', imageCount = 1): number {
  return roundUsd((OPENAI_IMAGE_COSTS[model]?.[quality] || 0) * imageCount)
}

export function estimateElevenLabsCost(operation: 'tts' | 'music' | 'sfx' | 'isolation', quantity: number): number {
  const rate = operation === 'tts'
    ? ELEVENLABS_COSTS.ttsPerCharacter
    : operation === 'music'
      ? ELEVENLABS_COSTS.musicPerSecond
      : operation === 'sfx'
        ? ELEVENLABS_COSTS.sfxPerSecond
        : ELEVENLABS_COSTS.isolationPerSecond
  return roundUsd(quantity * rate)
}

export async function recordApiUsage(event: ApiUsageEvent): Promise<void> {
  try {
    const sessionId = cookies().get('anon_session')?.value || null
    const headerStore = headers()
    const userId = event.userId || headerStore.get('x-rhyme-user-id') || null
    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const month = now.toISOString().slice(0, 7)
    const db = adminDb()
    const payload = {
      ...event,
      userId,
      sessionId,
      day,
      month,
      createdAt: FieldValue.serverTimestamp(),
    }

    await db.collection('api_usage_events').add(payload)

    const aggregateId = `${month}_${event.provider}_${event.model}_${event.feature}_${event.operation}`.replace(/[^a-zA-Z0-9_.-]/g, '_')
    await db.collection('api_usage_monthly').doc(aggregateId).set({
      month,
      provider: event.provider,
      model: event.model,
      feature: event.feature,
      operation: event.operation,
      calls: FieldValue.increment(1),
      quantity: FieldValue.increment(event.quantity),
      costUsd: FieldValue.increment(event.costUsd),
      inputTokens: FieldValue.increment(event.inputTokens || 0),
      outputTokens: FieldValue.increment(event.outputTokens || 0),
      totalTokens: FieldValue.increment(event.totalTokens || 0),
      inputCharacters: FieldValue.increment(event.inputCharacters || 0),
      outputCharacters: FieldValue.increment(event.outputCharacters || 0),
      durationSeconds: FieldValue.increment(event.durationSeconds || 0),
      imageCount: FieldValue.increment(event.imageCount || 0),
      successCalls: FieldValue.increment(event.success ? 1 : 0),
      failedCalls: FieldValue.increment(event.success ? 0 : 1),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.error('[usage] failed to record api usage', error)
  }
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}
