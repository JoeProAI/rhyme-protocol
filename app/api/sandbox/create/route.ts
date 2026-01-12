import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDaytonaClient, SANDBOX_CONFIG } from '@/lib/daytona/client'
import { trackUsage, canUse } from '@/lib/usage-tracker'

/**
 * POST /api/sandbox/create
 * 
 * Creates or resumes a sandbox for the authenticated user
 * Returns sandbox connection info
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, userName } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Check usage limits (pay-per-use system)
    const sessionId = cookies().get('anon_session')?.value
    if (sessionId) {
      const usageCheck = canUse(sessionId)
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { 
            error: usageCheck.reason,
            needsPayment: true,
            addCardUrl: '/add-card'
          },
          { status: 402 } // Payment Required
        )
      }
    }

    // Initialize Daytona client
    let daytona
    try {
      daytona = getDaytonaClient()
    } catch (error) {
      console.error('Failed to initialize Daytona client:', error)
      return NextResponse.json(
        { 
          error: 'Daytona not configured. Please add DAYTONA_API_KEY and DAYTONA_ORG_ID to environment variables.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Generate unique sandbox name for user
    const sandboxName = `joepro-${userId.slice(0, 8)}`

    // Try to find existing sandbox for this user
    let sandbox
    try {
      // Check if user already has a sandbox
      sandbox = await daytona.get(sandboxName)
      
      // Sandbox exists, attempt to start it if stopped
      console.log(`Resuming existing sandbox for ${email}`)
      try {
        await sandbox.start()
      } catch (e) {
        // Already running, continue
      }
      
      console.log(`Resumed existing sandbox for ${email}`)
    } catch (error) {
      // Sandbox doesn't exist, create new one
      console.log(`Creating new sandbox for ${email}`)
      
      sandbox = await daytona.create({
        name: sandboxName,
        language: 'nodejs',
        ...SANDBOX_CONFIG,
        labels: {
          ...SANDBOX_CONFIG.labels,
          USER_ID: userId,
          USER_EMAIL: email,
          USER_NAME: userName || 'User',
        },
      })

      // Note: Sandbox created with default environment
      // User can install their own tools via terminal
    }

    // Create SSH access token (2 hours)
    const sshAccess = await sandbox.createSshAccess(120)

    // Get preview URLs
    const previewUrl = await sandbox.getPreviewLink(3000)

    // Track usage (pay-per-use)
    if (sessionId) {
      trackUsage(sessionId, 'sandbox', 1)
      console.log(`Tracked sandbox creation for session: ${sessionId}`)
    }

    return NextResponse.json({
      success: true,
      sandbox: {
        id: sandbox.id,
        name: sandbox.name,
      },
      access: {
        ssh: {
          command: `ssh ${sshAccess.token}@ssh.app.daytona.io`,
          token: sshAccess.token,
          host: 'ssh.app.daytona.io',
          expiresIn: 120, // minutes
        },
        preview: {
          url: previewUrl.url,
          port: 3000,
        },
        terminal: {
          url: `https://22222-${sandbox.id}.proxy.daytona.works`,
        },
      },
      message: sandbox ? 'Sandbox resumed successfully' : 'Sandbox created successfully',
    })
  } catch (error) {
    console.error('Sandbox creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create sandbox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
