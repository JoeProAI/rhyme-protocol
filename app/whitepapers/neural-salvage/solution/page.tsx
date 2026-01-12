'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Archive, Sparkles, Users, Shield } from 'lucide-react'

export default function Solution() {
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
            Section 3
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            The Neural Salvage Solution
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Two-tier architecture for the complete creator journey
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2>The Two-Tier Architecture</h2>
          <p>
            Neural Salvage introduces a revolutionary dual-space model that separates experimentation from exhibition, process from product, private from public.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-12 not-prose">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50">
              <Archive className="w-12 h-12 text-[var(--primary)] mb-4" />
              <h3 className="text-2xl font-bold mb-4">Salvage Space</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Your private creative laboratory. Store experiments, drafts, B-sides, and behind-the-scenes content that subscribers pay to access.
              </p>
              
              <h4 className="font-semibold text-white mb-2 text-sm">Features</h4>
              <ul className="text-sm text-[var(--text-muted)] space-y-1 mb-4">
                <li>• Private, subscriber-only access</li>
                <li>• Lower standards for entry</li>
                <li>• Show creative journey</li>
                <li>• Monetize work-in-progress</li>
                <li>• Separate quota system</li>
              </ul>

              <h4 className="font-semibold text-white mb-2 text-sm">Economics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Subscription</span>
                  <span className="text-white font-semibold">$3-10/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Platform Fee</span>
                  <span className="text-white font-semibold">10-20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Creator Keeps</span>
                  <span className="text-[var(--primary)] font-bold">80-90%</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50">
              <Sparkles className="w-12 h-12 text-[var(--primary)] mb-4" />
              <h3 className="text-2xl font-bold mb-4">NFT Space</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Your permanent public gallery. Mint premium, polished work as 200+ year NFTs with true blockchain ownership.
              </p>
              
              <h4 className="font-semibold text-white mb-2 text-sm">Features</h4>
              <ul className="text-sm text-[var(--text-muted)] space-y-1 mb-4">
                <li>• Public blockchain gallery</li>
                <li>• BazAR marketplace compatible</li>
                <li>• OpenSea automatic listing</li>
                <li>• True ownership proof</li>
                <li>• Cryptographic signatures</li>
              </ul>

              <h4 className="font-semibold text-white mb-2 text-sm">Economics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Standard Mint</span>
                  <span className="text-white font-semibold">$4.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">True Ownership</span>
                  <span className="text-white font-semibold">$7.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Resale Royalties</span>
                  <span className="text-[var(--primary)] font-bold">5% Forever</span>
                </div>
              </div>
            </div>
          </div>

          <h2>The Complete Creator Journey</h2>
          <p>
            Most platforms force creators to choose: monetize finished work OR show the creative process. Neural Salvage lets you do both.
          </p>

          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] my-8">
            <h3 className="text-lg font-bold mb-4">Example: Digital Artist Sarah</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <div className="font-semibold text-white mb-1">Upload All Work to Salvage Space</div>
                  <div className="text-[var(--text-muted)]">100+ pieces/year including sketches, experiments, failed attempts</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <div className="font-semibold text-white mb-1">Charge for Subscriber Access</div>
                  <div className="text-[var(--text-muted)]">50 fans × $5/month = $250/month recurring revenue</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <div className="font-semibold text-white mb-1">Promote Best 20 Pieces to NFT Space</div>
                  <div className="text-[var(--text-muted)]">Mint and list premium work on marketplace</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <div className="font-semibold text-white mb-1">Earn from NFT Sales + Royalties</div>
                  <div className="text-[var(--text-muted)]">20 NFTs × $50 = $1,000 + 5% on all future resales</div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Monthly Revenue:</span>
                <span className="text-2xl font-bold text-[var(--primary)]">$250+</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">One-time NFT Sales:</span>
                <span className="text-2xl font-bold text-[var(--primary)]">$1,000</span>
              </div>
            </div>
          </div>

          <h2>The Hybrid Blockchain Model</h2>
          <p>
            Traditional NFT platforms present a false choice: simple but custodial, or complex but decentralized. Neural Salvage rejects this binary.
          </p>

          <h3>How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4 my-6 not-prose">
            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" />
              <div className="font-semibold mb-2">User Experience</div>
              <div className="text-sm text-[var(--text-muted)]">Pay $4.99 USD via Stripe. No crypto needed.</div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" />
              <div className="font-semibold mb-2">Platform Action</div>
              <div className="text-sm text-[var(--text-muted)]">Pays blockchain fees (~$0.05) on user's behalf</div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" />
              <div className="font-semibold mb-2">True Ownership</div>
              <div className="text-sm text-[var(--text-muted)]">User signs for ownership. NFT tagged with their wallet.</div>
            </div>
          </div>

          <h3>Dual-Chain Implementation</h3>
          <p>
            Every Neural Salvage NFT exists on TWO blockchains simultaneously, giving users the best of both ecosystems:
          </p>

          <div className="overflow-x-auto my-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-left py-3 px-4">Arweave</th>
                  <th className="text-left py-3 px-4">Polygon</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4 font-semibold">Purpose</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">Permanent storage</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">Marketplace access</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4 font-semibold">Storage Duration</td>
                  <td className="py-3 px-4 text-[var(--primary)]">200+ years</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">As long as chain exists</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4 font-semibold">Cost</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">~$0.05 per 2.5MB</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">~$0.01 gas</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4 font-semibold">Standard</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">SmartWeave/UCM</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">ERC-721</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4 font-semibold">Marketplaces</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">BazAR, Universal Content Marketplace</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">OpenSea, Rarible, LooksRare</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>AI-Powered Intelligence</h2>
          <p>
            Every upload is automatically analyzed by multiple AI models to extract maximum value:
          </p>

          <ul>
            <li><strong>GPT-4o Vision:</strong> Automatic captioning and description generation</li>
            <li><strong>Smart Tagging:</strong> AI-generated tags for organization</li>
            <li><strong>NSFW Detection:</strong> Automatic content moderation</li>
            <li><strong>OCR:</strong> Text extraction from images</li>
            <li><strong>Whisper:</strong> Audio transcription</li>
            <li><strong>Color Analysis:</strong> Dominant palette extraction</li>
            <li><strong>Semantic Search:</strong> Natural language queries with vector embeddings</li>
          </ul>

          <div className="p-6 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 my-8">
            <h3 className="text-lg font-bold mb-3">Example AI Analysis</h3>
            <div className="text-sm space-y-2">
              <div><strong>Input:</strong> Upload cyberpunk cityscape image</div>
              <div><strong>AI Caption:</strong> "Neon-lit dystopian metropolis with holographic billboards and flying vehicles at night"</div>
              <div><strong>Tags:</strong> cyberpunk, cityscape, neon, futuristic, digital art, sci-fi</div>
              <div><strong>Colors:</strong> #FF00FF, #00FFFF, #1A1A2E</div>
              <div><strong>Searchable:</strong> "futuristic city" or "neon cyberpunk" finds this asset</div>
            </div>
          </div>

          <h2>Why This Works</h2>
          <p>
            Neural Salvage succeeds where others fail because it solves the entire creator problem:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-8 not-prose">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div className="text-sm">
                  <div className="font-semibold text-white">True Permanence</div>
                  <div className="text-[var(--text-muted)]">200+ years on Arweave blockchain</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div className="text-sm">
                  <div className="font-semibold text-white">Simple UX</div>
                  <div className="text-[var(--text-muted)]">No crypto knowledge required</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div className="text-sm">
                  <div className="font-semibold text-white">Affordable</div>
                  <div className="text-[var(--text-muted)]">$4.99 vs $50-200 elsewhere</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div className="text-sm">
                  <div className="font-semibold text-white">Real Ownership</div>
                  <div className="text-[var(--text-muted)]">Cryptographic proof on-chain</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div className="text-sm">
                  <div className="font-semibold text-white">Full Monetization</div>
                  <div className="text-[var(--text-muted)]">Sell finished work AND process</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div className="text-sm">
                  <div className="font-semibold text-white">Marketplace Ready</div>
                  <div className="text-[var(--text-muted)]">BazAR + OpenSea compatible</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
          <Link 
            href="/whitepapers/neural-salvage/problem"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            The Problem
          </Link>
          <Link 
            href="/whitepapers/neural-salvage/technology"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Next: Technology
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
