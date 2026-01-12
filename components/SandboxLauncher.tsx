'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SandboxAccess {
  ssh: {
    command: string
    token: string
    host: string
    expiresIn: number
  }
  preview: {
    url: string
    port: number
  }
  terminal: {
    url: string
  }
}

export default function SandboxLauncher() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sandboxAccess, setSandboxAccess] = useState<SandboxAccess | null>(null)

  const handleOpenSandbox = async () => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Authenticate user (simplified - you can integrate with Clerk, Auth0, etc.)
      const user = await authenticateUser()
      
      if (!user) {
        throw new Error('Authentication failed')
      }

      // Step 2: Create/resume sandbox
      const response = await fetch('/api/sandbox/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          userName: user.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create sandbox')
      }

      const data = await response.json()
      setSandboxAccess(data.access)

      // Step 3: Auto-redirect to terminal
      setTimeout(() => {
        window.open(data.access.terminal.url, '_blank')
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Simplified authentication - integrate with your auth provider
  const authenticateUser = async () => {
    // TODO: Replace with real authentication
    // For now, generate a mock user (you'll integrate Clerk/Auth0/etc.)
    const mockUserId = `user-${Math.random().toString(36).substring(7)}`
    return {
      id: mockUserId,
      email: 'user@example.com', // Replace with real email from auth
      name: 'Developer', // Replace with real name from auth
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Launch Button */}
      {!sandboxAccess && (
        <motion.button
          onClick={handleOpenSandbox}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-4 btn-primary text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Setting up your sandbox...</span>
            </span>
          ) : (
            '🚀 Open Dev Sandbox'
          )}
        </motion.button>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </motion.div>
      )}

      {/* Sandbox Access Info */}
      {sandboxAccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-bold">Sandbox Ready!</h3>
          </div>

          {/* Web Terminal */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--primary)]">🖥️ Web Terminal</h4>
            <a
              href={sandboxAccess.terminal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[var(--background)] border border-[var(--border)] rounded hover:border-[var(--primary)] transition-colors"
            >
              <span className="text-sm">Click to open terminal →</span>
            </a>
          </div>

          {/* SSH Access */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--primary)]">🔐 SSH Access</h4>
            <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded">
              <code className="text-xs break-all">{sandboxAccess.ssh.command}</code>
              <button
                onClick={() => copyToClipboard(sandboxAccess.ssh.command)}
                className="mt-2 text-xs text-[var(--primary)] hover:underline"
              >
                Copy SSH command
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Expires in {sandboxAccess.ssh.expiresIn} minutes
            </p>
          </div>

          {/* Preview URL */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--primary)]">🌐 Preview URL</h4>
            <a
              href={sandboxAccess.preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[var(--background)] border border-[var(--border)] rounded hover:border-[var(--primary)] transition-colors"
            >
              <span className="text-sm break-all">{sandboxAccess.preview.url}</span>
            </a>
            <p className="text-xs text-[var(--text-muted)]">
              Port {sandboxAccess.preview.port} will be accessible here once your app is running
            </p>
          </div>

          {/* New Sandbox Button */}
          <button
            onClick={() => {
              setSandboxAccess(null)
              setError(null)
            }}
            className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            ← Back
          </button>
        </motion.div>
      )}

      {/* Info */}
      {!sandboxAccess && !loading && (
        <div className="text-sm text-[var(--text-muted)] space-y-1">
          <p>✨ Instant cloud development environment</p>
          <p>⚡ 2 vCPU, 4GB RAM, 8GB storage</p>
          <p>🔒 Secure, isolated workspace</p>
          <p>🚀 Auto-saves your progress</p>
        </div>
      )}
    </div>
  )
}
