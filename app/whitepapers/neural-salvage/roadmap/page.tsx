'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, Circle, Clock, Rocket } from 'lucide-react'

export default function Roadmap() {
  return (
    <main className="min-h-screen py-20 px-4 relative" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto relative z-10">
        <Link 
          href="/whitepapers/neural-salvage"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>

        <div className="mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
            Section 6
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Roadmap & Vision
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Growth strategy and market opportunity
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2>Development Roadmap</h2>

          <div className="space-y-8 my-12 not-prose">
            {/* Phase 1 */}
            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-xl font-bold">Phase 1: Foundation</h3>
                  <div className="text-sm text-green-400">✅ COMPLETE</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Firebase infrastructure</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> AI analysis pipeline</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Arweave integration</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Hybrid minting model</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Dual-chain minting</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> BazAR compatibility</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Stripe payments</div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-6 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/50">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-[var(--primary)]" />
                <div>
                  <h3 className="text-xl font-bold">Phase 2: Marketplace</h3>
                  <div className="text-sm text-[var(--primary)]">🔄 IN PROGRESS</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> NFT gallery page</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Minting flow</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-[var(--text-muted)]" /> Salvage Space UI</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-[var(--text-muted)]" /> Subscription system</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-[var(--text-muted)]" /> Internal marketplace</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-[var(--text-muted)]" /> Sales dashboard</div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-4">
                <Circle className="w-6 h-6 text-[var(--text-muted)]" />
                <div>
                  <h3 className="text-xl font-bold">Phase 3: Growth</h3>
                  <div className="text-sm text-[var(--text-muted)]">Q1 2026</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> BazAR integration</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> STAMP royalty protocol</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> Collection creation</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> Batch minting</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> Mobile app</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> API for developers</div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-4">
                <Circle className="w-6 h-6 text-[var(--text-muted)]" />
                <div>
                  <h3 className="text-xl font-bold">Phase 4: Scale</h3>
                  <div className="text-sm text-[var(--text-muted)]">Q2-Q3 2026</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> Multi-chain expansion</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> DAO governance</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> Creator grants program</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> White-label solution</div>
                <div className="flex items-center gap-2"><Circle className="w-4 h-4" /> Enterprise tier</div>
              </div>
            </div>
          </div>

          <h2>Vision & Mission</h2>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50 my-8">
            <h3 className="text-2xl font-bold mb-4">Mission Statement</h3>
            <p className="text-xl mb-6">
              "Upload once, preserve forever. Monetize your entire creative journey, not just the highlights."
            </p>
            <p className="text-[var(--text-muted)]">
              Become the default platform for digital preservation and NFT minting, making blockchain permanence as simple as uploading to Dropbox while enabling creators to build sustainable income from their complete body of work.
            </p>
          </div>

          <h2>5-Year Goals</h2>

          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">1M+</div>
              <div className="font-semibold mb-2">Active Users</div>
              <div className="text-sm text-[var(--text-muted)]">Creators preserving their digital assets permanently</div>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">10M+</div>
              <div className="font-semibold mb-2">NFTs Minted</div>
              <div className="text-sm text-[var(--text-muted)]">Permanent artifacts preserved on Arweave blockchain</div>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">$100M+</div>
              <div className="font-semibold mb-2">Creator Revenue</div>
              <div className="text-sm text-[var(--text-muted)]">Enabled through minting, subscriptions, and royalties</div>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">#1</div>
              <div className="font-semibold mb-2">Industry Standard</div>
              <div className="text-sm text-[var(--text-muted)]">Default platform for digital legacy preservation</div>
            </div>
          </div>

          <h2>Market Trends Driving Growth</h2>

          <div className="space-y-4 my-8 not-prose">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-2xl">📈</div>
              <div>
                <div className="font-semibold mb-1">Creator Economy Explosion</div>
                <div className="text-sm text-[var(--text-muted)]">50M+ creators worldwide, $250B+ market growing 20% annually</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-2xl">🔐</div>
              <div>
                <div className="font-semibold mb-1">Digital Preservation Awareness</div>
                <div className="text-sm text-[var(--text-muted)]">Cloud shutdowns increasing, 38% of 2013 web content gone</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-2xl">🌐</div>
              <div>
                <div className="font-semibold mb-1">Web3 Maturity</div>
                <div className="text-sm text-[var(--text-muted)]">Wallets everywhere, UX improving, NFT utility focus</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="text-2xl">⚡</div>
              <div>
                <div className="font-semibold mb-1">Arweave Ecosystem Growth</div>
                <div className="text-sm text-[var(--text-muted)]">BazAR, UCM tools maturing, 20K+ daily transactions</div>
              </div>
            </div>
          </div>

          <h2>Impact & Legacy</h2>

          <p>
            Neural Salvage will preserve humanity's digital creativity for 200+ years, ensuring that the art, music, writing, and creative work of this generation isn't lost to digital decay.
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-8 not-prose">
            <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="font-semibold mb-1">For Creators</div>
              <div className="text-sm text-[var(--text-muted)]">Sustainable income from complete creative journey</div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-center">
              <div className="text-3xl mb-2">🏛️</div>
              <div className="font-semibold mb-1">For Culture</div>
              <div className="text-sm text-[var(--text-muted)]">Digital Louvre preserving 21st century creativity</div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="font-semibold mb-1">For Humanity</div>
              <div className="text-sm text-[var(--text-muted)]">Permanent record of our digital age</div>
            </div>
          </div>

          <h2>Why Now?</h2>

          <p>
            Neural Salvage sits at the perfect intersection of three massive, converging trends:
          </p>

          <ol>
            <li><strong>Creator Economy ($250B market)</strong> - Growing 20% annually, 50M+ creators need solutions</li>
            <li><strong>Digital Preservation (increasing urgency)</strong> - Cloud shutdowns accelerating, awareness growing</li>
            <li><strong>Web3 Adoption (improving UX)</strong> - Wallets mainstream, NFTs shifting to utility</li>
          </ol>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">The Opportunity</h3>
            <p className="text-lg mb-6">
              We're solving a <strong>real problem</strong> (digital decay) with <strong>real technology</strong> (Arweave permanence) in a <strong>user-friendly way</strong> (hybrid model) with <strong>proven economics</strong> (90% margins).
            </p>
            <p className="text-xl font-bold text-[var(--primary)]">
              The future of digital legacy is permanent, decentralized, and monetizable.
            </p>
            <p className="text-2xl font-bold mt-4">
              Neural Salvage is that future.
            </p>
          </div>

          <h2>Join the Movement</h2>

          <p>
            Neural Salvage isn't just a platform—it's a movement to preserve humanity's digital creativity permanently. Whether you're a creator looking to protect your legacy, an investor seeking exceptional unit economics, or a believer in decentralized permanence, there's a place for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 my-8 not-prose">
            <a 
              href="https://nueralsalvage.joepro.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 inline-flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Try Neural Salvage
            </a>
            <Link 
              href="/whitepapers/neural-salvage"
              className="px-6 py-3 border border-[var(--border)] hover:border-[var(--primary)] rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2"
            >
              Back to Overview
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
          <Link 
            href="/whitepapers/neural-salvage/economics"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Economics
          </Link>
          <Link 
            href="/whitepapers/neural-salvage"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            Back to Overview
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </main>
  )
}
