/**
 * Usage Tracker - Pay-per-use system
 * Tracks anonymous usage and enables frictionless payments
 */

interface UsageData {
  builds: number
  sandboxes: number
  apiCalls: number
  sandboxHours: number
  totalCost: number
  freeUsesLeft: number
  hasCard: boolean
}

// Pricing (in dollars)
export const PRICING = {
  FREE_BUILDS: 3,
  GROK_BUILD: 0.25,
  SANDBOX_CREATE: 0.10,
  SANDBOX_HOUR: 0.02,
  API_CALL: 0.01,
}

// In-memory storage (replace with Redis in production)
const usageStore = new Map<string, any>()
const customerStore = new Map<string, string>() // sessionId -> customerId

export function trackUsage(sessionId: string, action: 'build' | 'sandbox' | 'api' | 'hour', quantity: number = 1) {
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  const key = `${sessionId}:${month}`
  
  const usage = usageStore.get(key) || {
    builds: 0,
    sandboxes: 0,
    apiCalls: 0,
    sandboxHours: 0,
    totalCost: 0,
  }
  
  // Update usage
  switch (action) {
    case 'build':
      usage.builds += quantity
      usage.totalCost += PRICING.GROK_BUILD * quantity
      break
    case 'sandbox':
      usage.sandboxes += quantity
      usage.totalCost += PRICING.SANDBOX_CREATE * quantity
      break
    case 'api':
      usage.apiCalls += quantity
      usage.totalCost += PRICING.API_CALL * quantity
      break
    case 'hour':
      usage.sandboxHours += quantity
      usage.totalCost += PRICING.SANDBOX_HOUR * quantity
      break
  }
  
  usageStore.set(key, usage)
  
  return usage
}

export function getUsage(sessionId: string): UsageData {
  const month = new Date().toISOString().slice(0, 7)
  const key = `${sessionId}:${month}`
  
  const usage = usageStore.get(key) || {
    builds: 0,
    sandboxes: 0,
    apiCalls: 0,
    sandboxHours: 0,
    totalCost: 0,
  }
  
  const hasCard = customerStore.has(sessionId)
  const freeUsesLeft = Math.max(0, PRICING.FREE_BUILDS - usage.builds)
  
  return {
    ...usage,
    freeUsesLeft,
    hasCard,
  }
}

export function canUse(sessionId: string): { allowed: boolean; reason?: string } {
  const usage = getUsage(sessionId)
  
  // Has card = unlimited
  if (usage.hasCard) {
    return { allowed: true }
  }
  
  // Still has free uses
  if (usage.freeUsesLeft > 0) {
    return { allowed: true }
  }
  
  // Exceeded free tier
  return {
    allowed: false,
    reason: `You've used your ${PRICING.FREE_BUILDS} free builds. Add a card to continue.`
  }
}

export function addCustomer(sessionId: string, customerId: string) {
  customerStore.set(sessionId, customerId)
}

export function getCustomerId(sessionId: string): string | undefined {
  return customerStore.get(sessionId)
}

// Helper to calculate cost breakdown
export function getCostBreakdown(sessionId: string) {
  const usage = getUsage(sessionId)
  
  return {
    builds: {
      quantity: usage.builds,
      unitPrice: PRICING.GROK_BUILD,
      total: usage.builds * PRICING.GROK_BUILD,
    },
    sandboxes: {
      quantity: usage.sandboxes,
      unitPrice: PRICING.SANDBOX_CREATE,
      total: usage.sandboxes * PRICING.SANDBOX_CREATE,
    },
    runtime: {
      quantity: usage.sandboxHours,
      unitPrice: PRICING.SANDBOX_HOUR,
      total: usage.sandboxHours * PRICING.SANDBOX_HOUR,
    },
    api: {
      quantity: usage.apiCalls,
      unitPrice: PRICING.API_CALL,
      total: usage.apiCalls * PRICING.API_CALL,
    },
    total: usage.totalCost,
  }
}
