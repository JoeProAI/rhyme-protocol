'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, DollarSign, TrendingUp, Repeat } from 'lucide-react'

export default function Economics() {
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
            Section 5
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Economics & Business Model
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Revenue streams and scaling economics that work
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2>Three Revenue Streams</h2>

          <div className="grid md:grid-cols-3 gap-6 my-8 not-prose">
            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50">
              <DollarSign className="w-10 h-10 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">NFT Minting</h3>
              <div className="text-3xl font-bold text-[var(--primary)] mb-2">90%</div>
              <div className="text-sm text-[var(--text-muted)]">Profit Margin</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50">
              <Repeat className="w-10 h-10 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Subscriptions</h3>
              <div className="text-3xl font-bold text-[var(--primary)] mb-2">10-20%</div>
              <div className="text-sm text-[var(--text-muted)]">Platform Fee</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50">
              <TrendingUp className="w-10 h-10 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Royalties</h3>
              <div className="text-3xl font-bold text-[var(--primary)] mb-2">5%</div>
              <div className="text-sm text-[var(--text-muted)]">Forever</div>
            </div>
          </div>

          <h2>1. NFT Minting Service</h2>

          <h3>Standard Mint: $4.99</h3>
          <div className="overflow-x-auto my-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2">Cost Component</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-muted)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2">Arweave storage (~2.5MB)</td>
                  <td className="py-2 text-right">$0.05</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2">Polygon gas fee</td>
                  <td className="py-2 text-right">$0.01</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2">Stripe fee (3% + $0.30)</td>
                  <td className="py-2 text-right">$0.45</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 font-bold">Total Platform Cost</td>
                  <td className="py-2 text-right font-bold">$0.51</td>
                </tr>
                <tr className="border-t-2 border-[var(--primary)]">
                  <td className="py-2 font-bold text-[var(--primary)]">Platform Profit</td>
                  <td className="py-2 text-right font-bold text-[var(--primary)]">$4.48</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Profit Margin</td>
                  <td className="py-2 text-right font-bold text-[var(--primary)]">90%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>True Ownership: $7.99</h3>
          <p>
            Premium tier includes cryptographic signature verification and "Verified Decentralized" badge:
          </p>
          <ul>
            <li>Platform cost: Same $0.51</li>
            <li>Platform profit: $7.48</li>
            <li>Profit margin: <strong>94%</strong></li>
          </ul>

          <h2>2. Salvage Space Subscriptions</h2>
          <p>
            Creators charge $3-10/month for subscriber-only access to their creative process. Platform takes 10-20% commission.
          </p>

          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] my-8">
            <h3 className="text-lg font-bold mb-4">Creator Revenue Example</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span>100 subscribers × $5/month</span>
                <span className="font-bold">$500/month</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Platform fee (15%)</span>
                <span className="text-[var(--text-muted)]">-$75</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-white">Creator Keeps</span>
                <span className="font-bold text-[var(--primary)] text-xl">$425/month</span>
              </div>
            </div>
          </div>

          <h2>3. Royalties (STAMP Protocol)</h2>
          <p>
            Every Neural Salvage NFT includes 5% royalties enforced via the STAMP protocol:
          </p>

          <ul>
            <li><strong>Creator gets 5%</strong> on every resale, forever</li>
            <li><strong>Smart contract enforced</strong> - can't be bypassed</li>
            <li><strong>Works across marketplaces</strong> - BazAR, OpenSea, anywhere</li>
            <li><strong>Compounds infinitely</strong> - passive income that scales</li>
          </ul>

          <div className="p-6 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 my-8">
            <h3 className="text-lg font-bold mb-3">Royalty Example</h3>
            <div className="text-sm space-y-2">
              <div>• Creator mints NFT, sells for $100</div>
              <div>• Buyer 1 resells to Buyer 2 for $500 → Creator earns <strong>$25</strong></div>
              <div>• Buyer 2 resells to Buyer 3 for $1,000 → Creator earns <strong>$50</strong></div>
              <div>• Buyer 3 resells to Buyer 4 for $5,000 → Creator earns <strong>$250</strong></div>
              <div className="pt-2 border-t border-[#ffd700]/30 font-bold">
                Total from royalties: <span className="text-[#ffd700]">$325</span> (from a $100 original sale)
              </div>
            </div>
          </div>

          <h2>Scaling Economics</h2>

          <div className="overflow-x-auto my-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3">Users/Month</th>
                  <th className="text-right py-3">Minting</th>
                  <th className="text-right py-3">Subscriptions</th>
                  <th className="text-right py-3">Royalties</th>
                  <th className="text-right py-3">Total</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-muted)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3">100</td>
                  <td className="py-3 text-right">$448</td>
                  <td className="py-3 text-right">$1,500</td>
                  <td className="py-3 text-right">$500</td>
                  <td className="py-3 text-right font-bold text-white">$2,448</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3">500</td>
                  <td className="py-3 text-right">$2,240</td>
                  <td className="py-3 text-right">$7,500</td>
                  <td className="py-3 text-right">$3,000</td>
                  <td className="py-3 text-right font-bold text-white">$12,740</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3">1,000</td>
                  <td className="py-3 text-right">$4,480</td>
                  <td className="py-3 text-right">$15,000</td>
                  <td className="py-3 text-right">$8,000</td>
                  <td className="py-3 text-right font-bold text-white">$27,480</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3">5,000</td>
                  <td className="py-3 text-right">$22,400</td>
                  <td className="py-3 text-right">$75,000</td>
                  <td className="py-3 text-right">$50,000</td>
                  <td className="py-3 text-right font-bold text-[var(--primary)]">$147,400</td>
                </tr>
                <tr className="border-t-2 border-[var(--primary)]">
                  <td className="py-3 font-bold">10,000</td>
                  <td className="py-3 text-right font-bold">$44,800</td>
                  <td className="py-3 text-right font-bold">$150,000</td>
                  <td className="py-3 text-right font-bold">$120,000</td>
                  <td className="py-3 text-right font-bold text-[var(--primary)] text-lg">$314,800</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Unit Economics</h2>

          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <h3 className="font-bold mb-4">Customer Acquisition</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">CAC (Social Media)</span>
                  <span className="font-semibold">$10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Conversion Rate</span>
                  <span className="font-semibold">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Payback Period</span>
                  <span className="font-semibold text-[var(--primary)]">1 month</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <h3 className="font-bold mb-4">Lifetime Value</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Avg Mints/User</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Subscription Revenue</span>
                  <span className="font-semibold">$30/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">LTV</span>
                  <span className="font-semibold text-[var(--primary)]">$200+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card-bg)] border border-[var(--primary)]/50 my-8">
            <h3 className="text-2xl font-bold mb-2">LTV:CAC Ratio</h3>
            <div className="text-5xl font-bold text-[var(--primary)] mb-2">20:1</div>
            <p className="text-sm text-[var(--text-muted)]">
              Industry benchmark is 3:1. Neural Salvage achieves 20:1 due to high margins and recurring revenue.
            </p>
          </div>

          <h2>Why 90% Margins Scale</h2>
          <p>
            Most businesses struggle with margins as they scale. Neural Salvage improves with scale:
          </p>

          <ul>
            <li><strong>Fixed Blockchain Costs:</strong> $0.06/mint regardless of volume</li>
            <li><strong>Zero Inventory:</strong> Digital products, no manufacturing</li>
            <li><strong>Automated Operations:</strong> AI handles analysis, no human labor</li>
            <li><strong>Serverless Infrastructure:</strong> Pay only for actual usage</li>
            <li><strong>Network Effects:</strong> More creators = more collectors = more sales</li>
          </ul>

          <h2>Market Opportunity</h2>

          <div className="space-y-4 my-8">
            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold mb-1">Total Addressable Market (TAM)</div>
                  <div className="text-sm text-[var(--text-muted)]">Digital creators worldwide</div>
                </div>
                <div className="text-2xl font-bold text-[var(--primary)]">50M+</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold mb-1">Serviceable Market (SAM)</div>
                  <div className="text-sm text-[var(--text-muted)]">Creators actively minting NFTs</div>
                </div>
                <div className="text-2xl font-bold text-[var(--primary)]">500K</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold mb-1">Obtainable Market (SOM)</div>
                  <div className="text-sm text-[var(--text-muted)]">Year 1 target users</div>
                </div>
                <div className="text-2xl font-bold text-[var(--primary)]">5,000</div>
              </div>
            </div>
          </div>

          <h2>Revenue Projections</h2>

          <div className="overflow-x-auto my-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3">Metric</th>
                  <th className="text-right py-3">Year 1</th>
                  <th className="text-right py-3">Year 2</th>
                  <th className="text-right py-3">Year 3</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-muted)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3">Active Users</td>
                  <td className="py-3 text-right">5,000</td>
                  <td className="py-3 text-right">25,000</td>
                  <td className="py-3 text-right">100,000</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3">Monthly Revenue</td>
                  <td className="py-3 text-right">$150K</td>
                  <td className="py-3 text-right">$750K</td>
                  <td className="py-3 text-right">$3M</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 font-bold">Annual Revenue</td>
                  <td className="py-3 text-right font-bold text-white">$1.8M</td>
                  <td className="py-3 text-right font-bold text-white">$9M</td>
                  <td className="py-3 text-right font-bold text-[var(--primary)]">$36M</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xl font-semibold text-center my-12">
            High margins + recurring revenue + network effects = exceptional unit economics
          </p>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-[var(--border)]">
          <Link 
            href="/whitepapers/neural-salvage/technology"
            className="text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Technology
          </Link>
          <Link 
            href="/whitepapers/neural-salvage/roadmap"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Next: Roadmap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
