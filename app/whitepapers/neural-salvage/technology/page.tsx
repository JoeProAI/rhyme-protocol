'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Code, Database, Zap, Shield } from 'lucide-react'

export default function Technology() {
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
            Section 4
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Technology Architecture
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Hybrid blockchain model and dual-chain implementation
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2>The Technology Stack</h2>

          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <Code className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-3">Frontend</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• <strong>Next.js 15</strong> - React with App Router</li>
                <li>• <strong>TypeScript</strong> - Type-safe development</li>
                <li>• <strong>Tailwind CSS</strong> - Utility-first styling</li>
                <li>• <strong>shadcn/ui</strong> - Component library</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <Database className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-3">Backend</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• <strong>Firebase Auth</strong> - User authentication</li>
                <li>• <strong>Firestore</strong> - NoSQL database</li>
                <li>• <strong>Firebase Storage</strong> - File storage</li>
                <li>• <strong>Next.js API Routes</strong> - Serverless</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <Zap className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-3">Blockchain</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• <strong>Arweave</strong> - Permanent storage</li>
                <li>• <strong>Bundlr Network</strong> - Fast uploads</li>
                <li>• <strong>Polygon</strong> - ERC-721 NFTs</li>
                <li>• <strong>MetaMask</strong> - Wallet integration</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              <Shield className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-3">AI & Payments</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>• <strong>OpenAI GPT-4o</strong> - Vision & language</li>
                <li>• <strong>Whisper</strong> - Audio transcription</li>
                <li>• <strong>Qdrant</strong> - Vector database</li>
                <li>• <strong>Stripe</strong> - Payment processing</li>
              </ul>
            </div>
          </div>

          <h2>Arweave: Permanent Storage</h2>
          <p>
            Arweave is a blockchain designed specifically for permanent data storage. Unlike traditional blockchains that store state, Arweave stores data—forever.
          </p>

          <h3>How Arweave Works</h3>
          <ul>
            <li><strong>One-time payment:</strong> Pay once, store for 200+ years</li>
            <li><strong>Economic model:</strong> Endowment covers declining storage costs</li>
            <li><strong>Cost:</strong> ~$5 per GB (decreasing over time)</li>
            <li><strong>Immutable:</strong> Once uploaded, cannot be changed or deleted</li>
          </ul>

          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] my-8">
            <h3 className="text-lg font-bold mb-4">Arweave vs Traditional Storage</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-left py-2">Arweave</th>
                    <th className="text-left py-2">AWS S3</th>
                    <th className="text-left py-2">IPFS</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-muted)]">
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2">Duration</td>
                    <td className="text-[var(--primary)]">200+ years</td>
                    <td>Until you stop paying</td>
                    <td>Until pinned</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2">Cost Model</td>
                    <td className="text-[var(--primary)]">One-time</td>
                    <td>Monthly forever</td>
                    <td>Pin or pay gateway</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2">Censorship</td>
                    <td className="text-[var(--primary)]">Resistant</td>
                    <td>Platform controlled</td>
                    <td>Gateway dependent</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2">Verifiable</td>
                    <td className="text-[var(--primary)]">Yes (on-chain)</td>
                    <td>No</td>
                    <td>Content hash only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3>SmartWeave Contract Integration</h3>
          <p>
            Neural Salvage NFTs use Arweave's SmartWeave standard for BazAR marketplace compatibility:
          </p>

          <pre className="bg-[#0d0d0d] p-4 rounded-lg text-xs overflow-x-auto my-6">
{`// SmartWeave Contract Tags
{
  "App-Name": "SmartWeaveContract",
  "Contract-Src": "Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ",
  "Init-State": { 
    "balances": { 
      "[userWallet]": 100 
    } 
  },
  "Creator": "[User's Arweave Address]",
  "Indexed-By": "ucm"
}`}
          </pre>

          <h2>Polygon: Marketplace Access</h2>
          <p>
            While Arweave provides permanent storage, Polygon provides marketplace liquidity through the ERC-721 standard.
          </p>

          <h3>Why Polygon?</h3>
          <ul>
            <li><strong>ERC-721 Compatible:</strong> Works with OpenSea, Rarible, LooksRare</li>
            <li><strong>Low Fees:</strong> ~$0.01 per transaction</li>
            <li><strong>Ethereum Ecosystem:</strong> Access to largest NFT market</li>
            <li><strong>Fast Confirmation:</strong> 2-second block times</li>
          </ul>

          <h2>Dual-Chain Synchronization</h2>
          <p>
            Every Neural Salvage NFT mint creates TWO permanent records:
          </p>

          <div className="space-y-4 my-8 not-prose">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
              <div>
                <div className="font-semibold mb-1">Upload to Arweave</div>
                <div className="text-sm text-[var(--text-muted)]">File + metadata stored permanently. Returns transaction ID.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
              <div>
                <div className="font-semibold mb-1">Tag with User Wallet</div>
                <div className="text-sm text-[var(--text-muted)]">Creator tag points to user's Arweave address for ownership proof.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
              <div>
                <div className="font-semibold mb-1">Mint on Polygon</div>
                <div className="text-sm text-[var(--text-muted)]">ERC-721 token minted with Arweave URL as tokenURI.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
              <div>
                <div className="font-semibold mb-1">Transfer to User</div>
                <div className="text-sm text-[var(--text-muted)]">Polygon NFT transferred to user's wallet. User now owns on both chains.</div>
              </div>
            </div>
          </div>

          <h2>AI Analysis Pipeline</h2>
          <p>
            Every upload triggers a multi-stage AI analysis pipeline:
          </p>

          <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--card-bg)] border border-[var(--primary)]/30 my-8">
            <h3 className="text-lg font-bold mb-4">Analysis Workflow</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div><strong>File Upload:</strong> Firebase Storage with resumable uploads</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div><strong>GPT-4o Vision:</strong> Image/video captioning and description</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div><strong>Tag Generation:</strong> AI-suggested tags based on content</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                <div><strong>NSFW Detection:</strong> Content moderation scoring</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                <div><strong>Vector Embedding:</strong> Create semantic search embedding</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                <div><strong>Store in Qdrant:</strong> Enable natural language search</div>
              </div>
            </div>
          </div>

          <h2>Security Architecture</h2>

          <h3>Multi-Layer Protection</h3>
          <ul>
            <li><strong>Rate Limiting:</strong> 5 mints/min per IP to prevent abuse</li>
            <li><strong>Cost Caps:</strong> $50/day platform spend limit</li>
            <li><strong>Wallet Security:</strong> 3-location encrypted backup (local + cloud + paper)</li>
            <li><strong>Firestore Rules:</strong> User data isolation and validation</li>
            <li><strong>HTTPS Only:</strong> All connections encrypted end-to-end</li>
          </ul>

          <h3>Data Backup Strategy</h3>
          <ul>
            <li><strong>Firebase:</strong> Automatic daily backups to separate region</li>
            <li><strong>Arweave:</strong> Already permanent by design</li>
            <li><strong>Code:</strong> GitHub with semantic versioning</li>
            <li><strong>Platform Wallet:</strong> Seed phrase + encrypted JWK file</li>
          </ul>

          <h2>API Architecture</h2>
          <p>
            Neural Salvage exposes clean REST APIs for all core functionality:
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">Endpoint</th>
                  <th className="text-left py-2 px-3">Method</th>
                  <th className="text-left py-2 px-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-muted)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 px-3 font-mono text-xs">/api/nft/mint-dual-chain</td>
                  <td className="py-2 px-3">POST</td>
                  <td className="py-2 px-3">Mint on Arweave + Polygon</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 px-3 font-mono text-xs">/api/payment/create-checkout</td>
                  <td className="py-2 px-3">POST</td>
                  <td className="py-2 px-3">Stripe payment session</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 px-3 font-mono text-xs">/api/nft/by-wallet</td>
                  <td className="py-2 px-3">GET</td>
                  <td className="py-2 px-3">Fetch user's NFTs</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 px-3 font-mono text-xs">/api/upload/process</td>
                  <td className="py-2 px-3">POST</td>
                  <td className="py-2 px-3">AI analysis pipeline</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Performance Optimization</h2>
          <ul>
            <li><strong>Edge Caching:</strong> Static assets on Vercel Edge Network</li>
            <li><strong>Lazy Loading:</strong> Images load as user scrolls</li>
            <li><strong>Firebase Indexes:</strong> Optimized queries for gallery views</li>
            <li><strong>Vector Caching:</strong> Qdrant embeddings cached for 24 hours</li>
            <li><strong>Streaming Uploads:</strong> Large files chunked and streamed</li>
          </ul>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
          <Link 
            href="/whitepapers/neural-salvage/solution"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            The Solution
          </Link>
          <Link 
            href="/whitepapers/neural-salvage/economics"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Next: Economics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
