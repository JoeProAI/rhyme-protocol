import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rhyme Protocol | AI Music Video Generator',
  description: 'Generate cinematic rap and hip-hop music videos with AI. Powered by GPT-Image, Luma Ray-2, and intelligent scene prediction.',
  openGraph: {
    title: 'Rhyme Protocol | AI Music Video Generator',
    description: 'Generate cinematic rap and hip-hop music videos with AI',
  },
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <h1 className="text-5xl md:text-7xl font-display tracking-tight mb-6">
          <span className="text-text">RHYME</span>
          <span className="text-accent">_PROTOCOL</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-text-secondary mb-12 font-light">
          AI-Powered Music Video Generation
        </p>
        
        {/* CTA */}
        <Link 
          href="/studio/video"
          className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-bg font-medium text-lg transition-all hover:bg-accent/90 hover:scale-105"
        >
          <span>Enter Studio</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
        
        {/* Tech Stack */}
        <div className="mt-16 pt-8 border-t border-border-subtle">
          <p className="text-sm text-muted mb-4">Powered by</p>
          <div className="flex flex-wrap justify-center gap-6 text-text-secondary text-sm">
            <span>GPT-Image-1.5</span>
            <span className="text-border-subtle">|</span>
            <span>Luma Ray-2</span>
            <span className="text-border-subtle">|</span>
            <span>Gemini Vision</span>
          </div>
        </div>
      </div>
    </div>
  );
}