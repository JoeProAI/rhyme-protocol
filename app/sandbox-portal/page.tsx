import SandboxLauncher from '@/components/SandboxLauncher'

export const metadata = {
  title: 'Dev Sandbox - JoePro.ai',
  description: 'Launch your personal cloud development environment',
}

export default function SandboxPortalPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Your Cloud Dev Environment
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
            One-click access to your personal development sandbox. No configuration needed.
          </p>
        </div>

        {/* Launcher Component */}
        <div className="max-w-xl mx-auto">
          <SandboxLauncher />
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-[var(--border)] rounded-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Your sandbox launches in seconds. Resume exactly where you left off.
            </p>
          </div>

          <div className="p-6 border border-[var(--border)] rounded-lg">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-bold mb-2">Secure & Isolated</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Your sandbox is completely isolated. Only you can access it.
            </p>
          </div>

          <div className="p-6 border border-[var(--border)] rounded-lg">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-bold mb-2">Auto-Save</h3>
            <p className="text-sm text-[var(--text-muted)]">
              All your work is automatically saved. Never lose progress again.
            </p>
          </div>

          <div className="p-6 border border-[var(--border)] rounded-lg">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="text-lg font-bold mb-2">Access Anywhere</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Work from any device with a browser. No local setup required.
            </p>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-16 p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <h3 className="text-lg font-bold mb-4">What's Included</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-[var(--primary)]">Resources</div>
              <ul className="text-[var(--text-muted)] space-y-1 mt-2">
                <li>2 vCPU</li>
                <li>4GB RAM</li>
                <li>8GB Storage</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[var(--primary)]">Runtime</div>
              <ul className="text-[var(--text-muted)] space-y-1 mt-2">
                <li>Node.js 20</li>
                <li>npm/yarn</li>
                <li>Git</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[var(--primary)]">Access</div>
              <ul className="text-[var(--text-muted)] space-y-1 mt-2">
                <li>Web Terminal</li>
                <li>SSH</li>
                <li>Preview URLs</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[var(--primary)]">Lifecycle</div>
              <ul className="text-[var(--text-muted)] space-y-1 mt-2">
                <li>2hr Auto-stop</li>
                <li>Resume anytime</li>
                <li>No data loss</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
