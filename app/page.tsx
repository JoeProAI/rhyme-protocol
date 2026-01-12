import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rhyme Protocol | AI Tools for Rap Artists',
  description: 'The complete AI platform for rap artists. Generate lyrics with GPT and Grok, create album covers, and produce cinematic music videos.',
  openGraph: {
    title: 'Rhyme Protocol | AI Tools for Rap Artists',
    description: 'Lyrics, covers, and music videos powered by AI',
  },
};

const STUDIO_TOOLS = [
  {
    href: '/studio/lyrics',
    title: 'LYRIC_LAB',
    description: 'Write bars with GPT-4o and Grok. Get rhyme suggestions, continue verses, or generate fresh content.',
    icon: '✍️',
    accent: 'from-purple-500/20 to-transparent',
  },
  {
    href: '/studio/cover-art',
    title: 'COVER_ART',
    description: 'Generate professional album covers and single artwork with DALL-E 3. Multiple styles and moods.',
    icon: '🎨',
    accent: 'from-amber-500/20 to-transparent',
  },
  {
    href: '/studio/video',
    title: 'VIDEO_GEN',
    description: 'Create cinematic music videos with GPT-Image-1.5 and Luma Ray-2. Scene-by-scene generation.',
    icon: '🎬',
    accent: 'from-cyan-500/20 to-transparent',
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display tracking-tight mb-6">
            <span className="text-text">RHYME</span>
            <span className="text-accent">_PROTOCOL</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary font-light max-w-2xl mx-auto">
            AI-powered tools for rap artists. From lyrics to visuals.
          </p>
        </div>

        {/* Studio Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {STUDIO_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative border border-border-subtle bg-surface p-6 transition-all hover:border-accent hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="text-4xl mb-4">{tool.icon}</div>
                <h2 className="text-xl font-display tracking-tight mb-2">
                  <span className="text-text">{tool.title.split('_')[0]}</span>
                  <span className="text-accent">_{tool.title.split('_')[1]}</span>
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Enter</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="text-center pt-8 border-t border-border-subtle">
          <p className="text-sm text-muted mb-4">Powered by</p>
          <div className="flex flex-wrap justify-center gap-4 text-text-secondary text-sm">
            <span>GPT-4o</span>
            <span className="text-border-subtle">|</span>
            <span>Grok</span>
            <span className="text-border-subtle">|</span>
            <span>DALL-E 3</span>
            <span className="text-border-subtle">|</span>
            <span>Luma Ray-2</span>
          </div>
        </div>
      </div>
    </div>
  );
}