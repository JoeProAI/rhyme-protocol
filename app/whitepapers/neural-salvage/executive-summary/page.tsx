'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, Zap, DollarSign, Globe } from 'lucide-react'

export default function ExecutiveSummary() {
  return (
    <main className="min-h-screen py-20 px-4 relative" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Link */}
        <Link 
          href="/whitepapers/neural-salvage"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>

        {/* Header */}
        <div className="mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
            Section 1
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Executive Summary
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Digital permanence meets AI-powered creativity
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <h2>The Impermanence Problem</h2>
          <p>
            The internet is forgetting. 38% of web content from 2013 is no longer accessible. Cloud services shut down—Yahoo Photos, Google+, Myspace—taking billions of memories with them. Creators don't truly own their work. Platforms can delete, censor, or hold content hostage behind subscriptions.
          </p>

          <p>
            Meanwhile, NFT technology promised digital ownership but delivered complexity: $50-200 gas fees, crypto wallet requirements, and no guarantee of permanence. The storage still lives on centralized servers that can fail.
          </p>

          <h2>Neural Salvage Solution</h2>
          <p>
            Neural Salvage solves both problems with a revolutionary two-tier architecture:
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <h3 className="text-lg font-bold mb-3 text-[var(--primary)]">Salvage Space</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Private, subscriber-only archive for experiments, drafts, and creative process. Monetize your entire journey, not just the highlights.
              </p>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• $3-10/month subscriptions</li>
                <li>• Platform takes 10-20%</li>
                <li>• Show creative process</li>
                <li>• Lower entry standards</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <h3 className="text-lg font-bold mb-3 text-[var(--primary)]">NFT Space</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Public, permanent gallery for premium work. 200+ year blockchain storage with true ownership.
              </p>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• $4.99 NFT minting</li>
                <li>• No crypto required</li>
                <li>• Dual-chain (Arweave + Polygon)</li>
                <li>• 5% royalties forever</li>
              </ul>
            </div>
          </div>

          <h2>The Hybrid Model Innovation</h2>
          <p>
            Traditional NFT platforms force users to choose between complexity (true Web3 ownership) or simplicity (custodial control). Neural Salvage delivers both:
          </p>

          <ul>
            <li><strong>Platform pays blockchain fees</strong> (~$0.05/mint)</li>
            <li><strong>User signs for ownership</strong> (cryptographic proof)</li>
            <li><strong>No crypto needed</strong> ($4.99 USD via Stripe)</li>
            <li><strong>True Web3 ownership</strong> (user's signature on-chain)</li>
            <li><strong>Marketplace compatible</strong> (BazAR, OpenSea ready)</li>
          </ul>

          <h2>Market Opportunity</h2>
          <p>
            The convergence of three massive trends creates perfect timing:
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-8 not-prose">
            <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30">
              <div className="text-2xl font-bold text-[var(--primary)] mb-1">$250B</div>
              <div className="text-sm text-[var(--text-muted)]">Creator Economy</div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30">
              <div className="text-2xl font-bold text-[var(--primary)] mb-1">50M+</div>
              <div className="text-sm text-[var(--text-muted)]">Digital Creators</div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30">
              <div className="text-2xl font-bold text-[var(--primary)] mb-1">$24B</div>
              <div className="text-sm text-[var(--text-muted)]">NFT Market</div>
            </div>
          </div>

          <h2>Economics That Scale</h2>
          <p>
            Neural Salvage's business model combines high-margin minting with recurring subscription revenue:
          </p>

          <ul>
            <li><strong>90% profit margins</strong> on NFT minting ($4.48 profit on $4.99)</li>
            <li><strong>10-20% platform fee</strong> on subscriptions (recurring revenue)</li>
            <li><strong>5% royalties</strong> on all resales (perpetual income)</li>
            <li><strong>LTV:CAC ratio of 20:1</strong> (healthy unit economics)</li>
          </ul>

          <h2>Why Now?</h2>
          <p>
            Five convergent factors make this the perfect moment:
          </p>

          <ol>
            <li><strong>Web3 Maturity</strong> - Wallets are everywhere, UX improving</li>
            <li><strong>Creator Economy Boom</strong> - 50M+ creators need solutions</li>
            <li><strong>Digital Preservation Awareness</strong> - Cloud shutdowns increasing</li>
            <li><strong>Arweave Ecosystem Growth</strong> - BazAR, UCM tools maturing</li>
            <li><strong>NFT Utility Focus</strong> - Market shifting from speculation to value</li>
          </ol>

          <h2>Vision</h2>
          <p className="text-xl font-semibold text-white">
            "Upload once, preserve forever. Monetize your entire creative journey, not just the highlights."
          </p>

          <p>
            Neural Salvage will become the default platform for digital preservation and NFT minting—making blockchain permanence as simple as uploading to Dropbox, while enabling creators to build sustainable income from their complete body of work.
          </p>

          <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--card-bg)] border border-[var(--primary)]/30 my-8">
            <h3 className="text-lg font-bold mb-2">5-Year Goals</h3>
            <ul className="space-y-2 text-sm">
              <li>• 1M+ users preserving digital assets</li>
              <li>• 10M+ NFTs minted</li>
              <li>• $100M+ in creator revenue enabled</li>
              <li>• Industry standard for digital legacy preservation</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
          <Link 
            href="/whitepapers/neural-salvage"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Overview
          </Link>
          <Link 
            href="/whitepapers/neural-salvage/problem"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Next: The Problem
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
