'use client'

import Link from 'next/link'
import { ArrowRight, Download, BookOpen, Zap, Shield, DollarSign, Users, Globe, ChevronRight } from 'lucide-react'

export default function NeuralSalvageWhitepaper() {
  const sections = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      icon: BookOpen,
      description: 'Digital permanence meets AI-powered creativity',
    },
    {
      id: 'problem',
      title: 'The Problem',
      icon: Shield,
      description: 'Digital decay and the preservation crisis',
    },
    {
      id: 'solution',
      title: 'The Solution',
      icon: Zap,
      description: 'Two-tier architecture for creators',
    },
    {
      id: 'technology',
      title: 'Technology',
      icon: Globe,
      description: 'Hybrid blockchain model and dual-chain implementation',
    },
    {
      id: 'economics',
      title: 'Economics',
      icon: DollarSign,
      description: 'Revenue streams and scaling model',
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      icon: Users,
      description: 'Growth strategy and market opportunity',
    },
  ]

  return (
    <main className="min-h-screen py-20 px-4 relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#d4a017]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
              Technical White Paper
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Neural Salvage</span>
            <br />
            <span className="text-transparent bg-gradient-to-r from-[var(--primary)] to-[#d4a017] bg-clip-text">
              Digital Permanence
            </span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto mb-8">
            The Architecture of Sovereign Digital Consciousness - A Technical White Paper on Blockchain-Powered Preservation for the Creator Economy
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a 
              href="https://nueralsalvage.joepro.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 inline-flex items-center gap-2"
            >
              Visit Platform
              <ArrowRight className="w-4 h-4" />
            </a>
            <button className="px-6 py-3 border border-[var(--border)] hover:border-[var(--primary)] rounded-lg font-semibold transition-all inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
            <span>Version 1.0</span>
            <span>•</span>
            <span>December 2025</span>
            <span>•</span>
            <span>JoePro.ai</span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">200+</div>
            <div className="text-sm text-[var(--text-muted)]">Year Storage</div>
          </div>
          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">$4.99</div>
            <div className="text-sm text-[var(--text-muted)]">NFT Minting</div>
          </div>
          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">90%</div>
            <div className="text-sm text-[var(--text-muted)]">Profit Margin</div>
          </div>
          <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">2 Chains</div>
            <div className="text-sm text-[var(--text-muted)]">Arweave + Polygon</div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/whitepapers/neural-salvage/${section.id}`}
              className="group p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30">
                  <section.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-3">
                    {section.description}
                  </p>
                  <span className="text-[var(--primary)] text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Section
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Overview */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--card-bg)] border border-[var(--primary)]/30 p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Quick Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-[var(--primary)]">The Problem</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>• 38% of web content from 2013 is gone</li>
                <li>• Cloud services shut down regularly</li>
                <li>• Creators don't own their content</li>
                <li>• NFT minting costs $50-200 in gas fees</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-[var(--primary)]">The Solution</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>• 200+ year permanent storage on Arweave</li>
                <li>• $4.99 NFT minting (no crypto needed)</li>
                <li>• Dual-chain ownership (Arweave + Polygon)</li>
                <li>• AI-powered organization and monetization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Neural Salvage?</h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
            Discover how we're solving digital preservation with blockchain permanence and AI-powered creativity.
          </p>
          <Link 
            href="/whitepapers/neural-salvage/executive-summary"
            className="btn-primary px-8 py-4 inline-flex items-center gap-2"
          >
            Start Reading
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  )
}
