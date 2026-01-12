import { Daytona } from '@daytonaio/sdk'

/**
 * Get authenticated Daytona client
 * Uses organization-level API key from environment
 */
export function getDaytonaClient() {
  // Support both DAYTONA_API_KEY and DAYTONA_TOKEN
  const apiKey = process.env.DAYTONA_API_KEY || process.env.DAYTONA_TOKEN
  const orgId = process.env.DAYTONA_ORG_ID

  if (!apiKey) {
    throw new Error(
      'Daytona API key not configured. Please set DAYTONA_API_KEY or DAYTONA_TOKEN environment variable.'
    )
  }

  console.log('Initializing Daytona client...', {
    hasApiKey: !!apiKey,
    hasOrgId: !!orgId,
    apiKeyPrefix: apiKey?.substring(0, 5),
  })

  return new Daytona({
    apiKey,
    organizationId: orgId,
  })
}

/**
 * Default sandbox configuration
 */
export const SANDBOX_CONFIG = {
  resources: {
    cpu: 2,
    memory: 4,
    disk: 8,
  },
  lifecycle: {
    autoStopInterval: 120, // 2 hours of inactivity
    autoArchiveInterval: 0,
    autoDeleteInterval: 0,
  },
  labels: {
    PROJECT: 'joepro',
    MANAGED_BY: 'web-portal',
  },
} as const
