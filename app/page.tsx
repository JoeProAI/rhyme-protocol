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
    description: 'Write bars with GPT 5.2 and Grok 4.1. Get rhyme suggestions, continue verses, or generate fresh content.',
    iconPath: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
    available: true,
  },
  {
    href: '/studio/cover-art',
    title: 'COVER_ART',
    description: 'Generate professional album covers and single artwork with GPT-Image-1.5. Multiple styles and moods.',
    iconPath: 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z',
    available: true,
  },
  {
    href: '/studio/video',
    title: 'VIDEO_GEN',
    description: 'Create cinematic music videos with GPT-Image-1.5 and Luma Ray-2. Scene-by-scene generation.',
    iconPath: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z',
    available: false,
    comingSoon: true,
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
          {STUDIO_TOOLS.map((tool) => {
            const CardContent = (
              <>
                <div className={`absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 ${tool.available ? 'group-hover:opacity-100' : ''} transition-opacity`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 border ${tool.available ? 'border-accent/40' : 'border-border-subtle'} flex items-center justify-center`}>
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={tool.available ? 'var(--color-accent)' : 'var(--color-muted)'} 
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={tool.iconPath} />
                      </svg>
                    </div>
                    {tool.comingSoon && (
                      <span className="px-2 py-1 text-xs font-mono tracking-wider bg-surface border border-border-subtle text-muted">
                        SOON
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-display tracking-tight mb-2">
                    <span className={tool.available ? 'text-text' : 'text-text/50'}>{tool.title.split('_')[0]}</span>
                    <span className={tool.available ? 'text-accent' : 'text-accent/50'}>_{tool.title.split('_')[1]}</span>
                  </h2>
                  <p className={`text-sm leading-relaxed ${tool.available ? 'text-text-secondary' : 'text-text-secondary/50'}`}>
                    {tool.description}
                  </p>
                  {tool.available && (
                    <div className="mt-6 flex items-center gap-2 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Enter Studio</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  )}
                </div>
              </>
            );

            if (tool.available) {
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group relative border border-border-subtle bg-surface p-6 transition-all hover:border-accent hover:-translate-y-1 hover:shadow-lg"
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={tool.href}
                className="relative border border-border-subtle/50 bg-surface/30 p-6 cursor-not-allowed"
              >
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="text-center pt-8 border-t border-border-subtle">
          <p className="text-sm text-muted mb-4">Powered by</p>
          <div className="flex flex-wrap justify-center gap-4 text-text-secondary text-sm">
            <span>GPT 5.2</span>
            <span className="text-border-subtle">|</span>
            <span>Grok 4.1</span>
            <span className="text-border-subtle">|</span>
            <span>GPT-Image-1.5</span>
            <span className="text-border-subtle">|</span>
            <span>Luma Ray-2</span>
          </div>
        </div>
      </div>
    </div>
  );
}