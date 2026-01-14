'use client';

import Link from 'next/link';

const FEATURES = [
  {
    id: 'lyrics',
    title: 'LYRIC_LAB',
    icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
    description: 'AI-powered lyric writing with genius-level rhyme schemes',
    steps: [
      'Choose your style: Trap, Conscious, Old School, Storytelling, Aggressive, or Melodic',
      'Select an AI model: The Technician (GPT) for complex schemes, The Provocateur (Grok) for edgy content, or Both to compare',
      'Enter your theme or topic - be specific for better results',
      'Set the number of bars (8-32)',
      'Click Generate and wait for your lyrics',
      'Use "Listen" to hear the AI read your lyrics aloud',
      'Click "Save" to store lyrics in My Creations - unsaved lyrics are lost when you leave',
      'Use "Copy" to paste into your notes, or "Use" to continue building on them',
    ],
    tips: [
      'Multisyllabic rhymes are automatic - the AI prioritizes complex rhyme patterns',
      'Adult content is allowed - street language, profanity, and explicit themes work fine',
      'Use "Continue" mode to extend existing lyrics seamlessly',
      'Use "Rewrite" mode to polish your own bars while keeping your voice',
      'Use "Rhyme Suggestions" to get options for your last line',
    ],
  },
  {
    id: 'cover-art',
    title: 'COVER_ART',
    icon: 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z',
    description: 'Generate professional album covers and single artwork',
    steps: [
      'Describe your cover concept - include colors, mood, subjects, and style',
      'Select a format: Album, Single, Mixtape, or EP',
      'Choose a mood: Dark, Vibrant, Minimal, Luxury, Street, or Abstract',
      'Pick aspect ratio (1:1 for most platforms)',
      'Click Generate and wait ~15-30 seconds',
      'Download immediately or it will be auto-saved to My Creations',
      'Use Edit mode to refine specific parts of your image',
    ],
    tips: [
      'Be descriptive: "shadowy figure in hoodie, neon city background, rain, cinematic" works better than "cool cover"',
      'Reference real art styles: "in the style of vintage 90s hip-hop posters"',
      'Include text placement hints: "leave space at top for title"',
      'Generated covers are automatically saved to your gallery',
    ],
  },
  {
    id: 'video',
    title: 'VIDEO_GEN',
    icon: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z',
    description: 'Generate cinematic music videos from text prompts',
    steps: [
      'Describe your video scene - be cinematic and specific',
      'Choose a style: Cinematic, Animated, Abstract, or Realistic',
      'Select aspect ratio: 16:9 (landscape), 9:16 (portrait/TikTok), or 1:1 (square)',
      'Pick duration: 5 seconds or 9 seconds',
      'Click Generate - videos take 1-3 minutes to render',
      'Download your video when complete',
    ],
    tips: [
      'Each video is one continuous shot - think of single scenes, not montages',
      'Include camera movement: "slow dolly forward", "orbiting shot", "static wide angle"',
      'Describe lighting: "golden hour", "neon-lit", "dramatic shadows"',
      'Videos cost more than images - be specific on first try',
      'Download videos promptly - they are saved to your gallery automatically',
    ],
  },
  {
    id: 'audio',
    title: 'AUDIO_LAB',
    icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2Zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2Z',
    description: 'Voice synthesis, sound effects, and beat generation',
    sections: [
      {
        name: 'Text to Speech',
        steps: [
          'Select a voice from 8 curated options',
          'Paste your lyrics or enter text (up to 5000 characters)',
          'Longer content splits into parts to save credits',
          'Click Generate Speech - the AI will pronounce rap slang correctly',
          'Use "Continue to Next Part" for longer lyrics',
          'All audio auto-saves to My Creations',
        ],
      },
      {
        name: 'Sound Effects',
        steps: [
          'Use a preset (Cinematic Hit, Vinyl Scratch, Bass Drop, etc.) or describe your own',
          'Set duration from 0.5 to 10 seconds',
          'Click Generate - perfect for video intros and transitions',
        ],
      },
      {
        name: 'Beat Generator',
        steps: [
          'Select a genre: Trap, Boom Bap, Drill, Lo-Fi, R&B, or Jazz Hop',
          'Describe your beat with tempo, instruments, and mood',
          'Choose duration (30s to 5 minutes) - see cost estimate',
          'Toggle Instrumental or With Vocals',
          'Click Generate Beat - longer beats take more time',
        ],
      },
    ],
    tips: [
      'Voice synthesis auto-adds pauses and flow for rap delivery',
      'Sound effects are great for video transitions and intros',
      'Beats cost approximately $0.005 per second',
      'All audio saves automatically to your gallery',
    ],
  },
];

export default function HowToPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-text-secondary hover:text-accent transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-display tracking-tight mb-2">
            <span className="text-text">HOW</span>
            <span className="text-accent">_TO</span>
          </h1>
          <p className="text-text-secondary">
            Complete guide to using Rhyme Protocol
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-12">
          {FEATURES.map(f => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="px-4 py-2 border border-border-subtle hover:border-accent text-sm font-medium transition-colors"
            >
              {f.title.replace('_', ' ')}
            </a>
          ))}
        </div>

        {/* Feature Sections */}
        <div className="space-y-16">
          {FEATURES.map(feature => (
            <section key={feature.id} id={feature.id} className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-accent/40 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.icon} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-display">
                    <span className="text-text">{feature.title.split('_')[0]}</span>
                    <span className="text-accent">_{feature.title.split('_')[1]}</span>
                  </h2>
                  <p className="text-text-secondary text-sm">{feature.description}</p>
                </div>
              </div>

              {feature.steps && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">Steps</h3>
                  <ol className="space-y-2">
                    {feature.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-text">
                        <span className="text-accent font-mono text-sm">{idx + 1}.</span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {feature.sections && (
                <div className="space-y-6 mb-6">
                  {feature.sections.map((section, idx) => (
                    <div key={idx} className="border-l-2 border-accent/30 pl-4">
                      <h3 className="text-sm font-medium text-accent mb-2">{section.name}</h3>
                      <ol className="space-y-1">
                        {section.steps.map((step, sidx) => (
                          <li key={sidx} className="flex gap-3 text-text">
                            <span className="text-muted font-mono text-xs">{sidx + 1}.</span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

              {feature.tips && (
                <div className="bg-surface border border-border-subtle p-4">
                  <h3 className="text-sm font-medium text-accent mb-3">Pro Tips</h3>
                  <ul className="space-y-2">
                    {feature.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-text-secondary">
                        <span className="text-accent">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* My Creations Section */}
        <section className="mt-16 pt-8 border-t border-border-subtle">
          <h2 className="text-2xl font-display mb-4">
            <span className="text-text">MY</span>
            <span className="text-accent">_CREATIONS</span>
          </h2>
          <p className="text-text-secondary mb-4">
            Your gallery stores all saved content. Access it from the navigation menu.
          </p>
          <ul className="space-y-2 text-sm text-text">
            <li className="flex gap-2"><span className="text-accent">•</span> Cover art and videos save automatically</li>
            <li className="flex gap-2"><span className="text-accent">•</span> Lyrics require clicking "Save" - unsaved lyrics are lost</li>
            <li className="flex gap-2"><span className="text-accent">•</span> Audio files save automatically after generation</li>
            <li className="flex gap-2"><span className="text-accent">•</span> Hover over items to download or delete</li>
            <li className="flex gap-2"><span className="text-accent">•</span> Lyrics can be copied directly from the gallery</li>
          </ul>
        </section>

        {/* Cost Section */}
        <section className="mt-16 pt-8 border-t border-border-subtle">
          <h2 className="text-2xl font-display mb-4">
            <span className="text-text">CREDITS</span>
            <span className="text-accent">_&_COSTS</span>
          </h2>
          <p className="text-text-secondary mb-4">
            Free daily limits reset at midnight. Add a payment method for unlimited access.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface border border-border-subtle p-4 text-center">
              <div className="text-2xl font-display text-accent">5</div>
              <div className="text-xs text-muted">Lyrics/day</div>
            </div>
            <div className="bg-surface border border-border-subtle p-4 text-center">
              <div className="text-2xl font-display text-accent">3</div>
              <div className="text-xs text-muted">Covers/day</div>
            </div>
            <div className="bg-surface border border-border-subtle p-4 text-center">
              <div className="text-2xl font-display text-accent">2</div>
              <div className="text-xs text-muted">Videos/day</div>
            </div>
            <div className="bg-surface border border-border-subtle p-4 text-center">
              <div className="text-2xl font-display text-accent">10</div>
              <div className="text-xs text-muted">Audio/day</div>
            </div>
          </div>
        </section>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-accent text-bg font-medium hover:bg-accent/90 transition-colors"
          >
            Start Creating
          </Link>
        </div>
      </div>
    </div>
  );
}
