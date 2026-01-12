'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, AlertTriangle, Ban, DollarSign, Lock } from 'lucide-react'

export default function Problem() {
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
            Section 2
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            The Digital Preservation Crisis
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Why the internet is forgetting and creators are losing
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2>The Four Horsemen of Digital Decay</h2>

          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-bold mb-3">1. Digital Decay</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• <strong>38%</strong> of web content from 2013 gone</li>
                <li>• Yahoo Photos shutdown: 1B+ photos lost</li>
                <li>• Google+ deleted: millions of posts</li>
                <li>• Myspace reset: 50M+ songs vanished</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
              <Lock className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-bold mb-3">2. Platform Dependency</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• Platforms own your content</li>
                <li>• Can delete/censor at will</li>
                <li>• Stop paying = lose everything</li>
                <li>• No portability between services</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
              <DollarSign className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-bold mb-3">3. Monetization Barriers</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• NFT minting: $50-200 gas fees</li>
                <li>• Requires crypto knowledge</li>
                <li>• Complex wallet setup</li>
                <li>• Storage still centralized</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
              <Ban className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-bold mb-3">4. Quality vs Experimentation</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• No space for work-in-progress</li>
                <li>• Everything public or nothing</li>
                <li>• Can't monetize creative process</li>
                <li>• Pressure to only show "perfect" work</li>
              </ul>
            </div>
          </div>

          <h2>Case Study: The Cloud Services Graveyard</h2>
          
          <table className="w-full text-sm my-8">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3">Service</th>
                <th className="text-left py-3">Shutdown Year</th>
                <th className="text-left py-3">Content Lost</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-muted)]">
              <tr className="border-b border-[var(--border)]">
                <td className="py-3">Yahoo Photos</td>
                <td>2007</td>
                <td>1B+ photos</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3">Google+</td>
                <td>2019</td>
                <td>Millions of posts</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3">Myspace Music</td>
                <td>2019</td>
                <td>50M songs</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3">Vine</td>
                <td>2017</td>
                <td>Millions of videos</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3">Windows Live Spaces</td>
                <td>2011</td>
                <td>30M blogs</td>
              </tr>
            </tbody>
          </table>

          <h2>The NFT Platform Problem</h2>
          <p>
            NFTs promised to solve digital ownership, but introduced new problems:
          </p>

          <h3>High Barriers to Entry</h3>
          <ul>
            <li><strong>Gas Fees:</strong> $50-200 per mint on Ethereum during peak times</li>
            <li><strong>Crypto Requirement:</strong> Must buy ETH, understand wallets, manage private keys</li>
            <li><strong>Technical Complexity:</strong> Smart contracts, blockchain explorers, gas optimization</li>
            <li><strong>Risk:</strong> One wrong click can lose funds forever</li>
          </ul>

          <h3>False Permanence</h3>
          <ul>
            <li>Most NFT metadata stored on centralized servers (IPFS gateways can fail)</li>
            <li>Images hosted on AWS/Cloudflare (can disappear)</li>
            <li>No guarantee of long-term accessibility</li>
            <li>"Permanent" tokens pointing to 404 errors</li>
          </ul>

          <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 my-8">
            <h3 className="text-lg font-bold mb-3">📊 The Numbers Don't Lie</h3>
            <ul className="text-sm space-y-2">
              <li>• <strong>80%</strong> of NFT projects fail within first year</li>
              <li>• <strong>95%</strong> of creators deterred by complexity</li>
              <li>• <strong>$200</strong> average cost to mint 1 NFT on Ethereum</li>
              <li>• <strong>38%</strong> of web content from 2013 is gone</li>
            </ul>
          </div>

          <h2>The Creator's Dilemma</h2>
          <p>
            Modern creators face an impossible choice:
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <h4 className="font-bold mb-3 text-white">Option A: Traditional Platforms</h4>
              <div className="text-sm text-[var(--text-muted)] space-y-2 mb-4">
                <div>✅ Easy to use</div>
                <div>✅ No crypto needed</div>
                <div>❌ Don't own content</div>
                <div>❌ Can be deleted anytime</div>
                <div>❌ Subscription forever</div>
                <div>❌ Platform takes 30-50%</div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <h4 className="font-bold mb-3 text-white">Option B: Web3 NFTs</h4>
              <div className="text-sm text-[var(--text-muted)] space-y-2 mb-4">
                <div>✅ Own your content</div>
                <div>✅ Blockchain verified</div>
                <div>❌ $50-200 gas fees</div>
                <div>❌ Complex setup</div>
                <div>❌ Need crypto knowledge</div>
                <div>❌ Storage still centralized</div>
              </div>
            </div>
          </div>

          <p className="text-xl font-semibold text-center my-12 text-white">
            Why choose when you can have both?
          </p>

          <h2>What Creators Really Need</h2>
          <ol>
            <li><strong>True Permanence:</strong> Storage that outlasts companies and platforms (200+ years)</li>
            <li><strong>Simple UX:</strong> No crypto complexity, just upload and pay</li>
            <li><strong>Affordable Pricing:</strong> Single-digit dollars, not hundreds</li>
            <li><strong>Real Ownership:</strong> Cryptographic proof they control their work</li>
            <li><strong>Monetization:</strong> Sell both finished work AND creative process</li>
            <li><strong>Marketplace Access:</strong> List on OpenSea, BazAR without extra work</li>
          </ol>

          <p>
            Neural Salvage was built to deliver all six. The next section reveals how.
          </p>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
          <Link 
            href="/whitepapers/neural-salvage/executive-summary"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Executive Summary
          </Link>
          <Link 
            href="/whitepapers/neural-salvage/solution"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Next: The Solution
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
