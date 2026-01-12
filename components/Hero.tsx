'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

const services = [
  { 
    name: 'AI Video Generator', 
    href: '/apps', 
    description: 'Create cinematic videos with GPT-Image + Luma Ray-2',
    status: 'Live'
  },
  { 
    name: 'Custom Agents', 
    href: '/agents', 
    description: 'Build specialized AI agents with Grok 4.1 Fast + GPT-4',
    status: 'Live'
  },
  { 
    name: 'Dev Sandbox', 
    href: '/devenv', 
    description: 'Instant cloud development environments',
    status: 'Live'
  },
  { 
    name: 'Prompt Library', 
    href: '/prompt-library', 
    description: '150+ production-ready prompts for any use case',
    status: 'Live'
  },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });
  
  const goldThreadWidth = useTransform(scrollYProgress, [0, 0.5], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center">
        <div className="container">
          <div className="grid-asymmetric items-center">
            {/* Left Column - Main Content */}
            <div className="stagger">
              {/* Eyebrow */}
              <motion.p 
                className="text-accent text-sm font-medium tracking-wide mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                JoePro - AI Development Platform
              </motion.p>
              
              {/* Main Heading */}
              <h1 className="font-display mb-6">
                <span className="text-text">Build </span>
                <span className="text-accent">smarter</span>
                <br />
                <span className="text-text">with </span>
                <span className="text-accent">JoePro</span>
                <br />
                <span className="text-text-secondary">AI tools that work.</span>
              </h1>
              
              {/* Subheading */}
              <p className="text-text-secondary text-lg max-w-lg mb-10">
                Production-ready video generation, custom agents, and development 
                resources. No fluff, just tools that ship.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/apps" className="btn btn-primary">
                  Explore Tools
                </Link>
                <Link href="/devenv" className="btn btn-secondary">
                  Open Sandbox
                </Link>
              </div>

              {/* User Persona Buttons */}
              <div className="flex flex-wrap gap-3">
                <p className="w-full text-text-secondary text-sm mb-2">I'm looking for:</p>
                <Link href="/start-here" className="text-sm px-4 py-2 border border-border rounded hover:border-accent hover:text-accent transition-colors">
                  New to AI
                </Link>
                <Link href="/best-ai-tools" className="text-sm px-4 py-2 border border-accent bg-accent-muted rounded hover:bg-accent hover:text-bg transition-colors">
                  AI Tool Recs
                </Link>
                <Link href="/devenv" className="text-sm px-4 py-2 border border-border rounded hover:border-accent hover:text-accent transition-colors">
                  Developer Tools
                </Link>
                <Link href="/apps" className="text-sm px-4 py-2 border border-border rounded hover:border-accent hover:text-accent transition-colors">
                  Image & Video
                </Link>
                <Link href="/feeds" className="text-sm px-4 py-2 border border-border rounded hover:border-accent hover:text-accent transition-colors">
                  Tech News
                </Link>
              </div>
            </div>

            {/* Right Column - Stats/Proof */}
            <div className="hidden md:block">
              <div className="section-accent space-y-8">
                <Link href="/prompt-library" className="block group">
                  <p className="text-4xl font-display text-accent group-hover:text-accent-hover transition-colors">150+</p>
                  <p className="text-text-secondary text-sm group-hover:text-text transition-colors">Ready-to-use prompts →</p>
                </Link>
                <Link href="/agents" className="block group">
                  <p className="text-4xl font-display text-text group-hover:text-accent transition-colors">4</p>
                  <p className="text-text-secondary text-sm group-hover:text-text transition-colors">AI providers integrated →</p>
                </Link>
                <Link href="/apps" className="block group">
                  <p className="text-4xl font-display text-text group-hover:text-accent transition-colors">30s</p>
                  <p className="text-text-secondary text-sm group-hover:text-text transition-colors">Video generation time →</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Thread - Signature Element */}
      <div className="container">
        <motion.div 
          className="h-px bg-accent"
          style={{ width: goldThreadWidth }}
          aria-hidden="true"
        />
      </div>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <div className="mb-12">
            <h2 className="font-display text-text mb-4">What we build</h2>
            <p className="text-text-secondary max-w-xl">
              Tools designed for developers and creators who need results, not demos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-display text-text group-hover:text-accent transition-colors">
                    {service.name}
                  </h3>
                  <span className="text-xs text-accent bg-accent-muted px-2 py-1 rounded">
                    {service.status}
                  </span>
                </div>
                <p className="text-text-secondary">
                  {service.description}
                </p>
                <div className="mt-4 text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section border-t border-border-subtle">
        <div className="container">
          <div className="mb-12">
            <h2 className="font-display text-text mb-4">Featured projects</h2>
            <p className="text-text-secondary max-w-xl">
              Production applications built with our stack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {[
              { name: 'Prompt Racer', url: 'https://prompt-racer.joepro.ai', desc: 'AI prompt engineering game' },
              { name: 'Followtronics', url: 'https://followtronics.com', desc: 'Social analytics platform' },
              { name: 'StakeSmith', url: 'https://stakesmith.joepro.ai', desc: 'Investment insights' },
              { name: 'Neural Salvage', url: 'https://nueralsalvage.joepro.ai', desc: 'NFT infrastructure' },
              { name: 'Food Empire', url: 'https://food-empire-ai.vercel.app/', desc: 'AI recipe generator' }
            ].map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group"
              >
                <h3 className="text-lg text-text group-hover:text-accent transition-colors mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {project.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="card card-elevated text-center py-16 px-8">
            <h2 className="font-display text-text mb-4">Ready to build?</h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              Start with our free tools or schedule a consultation for custom solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/apps" className="btn btn-primary">
                Get Started Free
              </Link>
              <a 
                href="https://calendly.com/joeproai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}