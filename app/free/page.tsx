import type { Metadata } from 'next'
import Link from 'next/link'
import {
  STARTER_PROMPTS,
  FLOW_PATTERNS,
  RHYME_FAMILIES,
  STARTER_FREESTYLE_TEMPLATE,
  STARTER_PACK_VERSION,
} from '@/lib/starter-pack'

export const metadata: Metadata = {
  title: 'Free Starter Pack | Rhyme Protocol',
  description: 'Free prompts, flow patterns, rhyme families, and templates for rap artists. No signup. No limits. For the community.',
}

export default function FreePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12 px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display tracking-tight mb-4">
            <span className="text-text">FREE</span>
            <span className="text-accent">_PACK</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl mx-auto">
            No signup. No limits. No catch. For the rap community.
          </p>
          <p className="text-xs font-mono text-muted mt-4 tracking-widest">
            {STARTER_PACK_VERSION}
          </p>
        </div>

        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6 border-b border-border-subtle pb-3">
            <h2 className="text-2xl font-display tracking-tight">
              <span className="text-text">25</span>
              <span className="text-accent"> _STARTER_PROMPTS</span>
            </h2>
            <span className="text-xs font-mono text-muted">free, no API call</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STARTER_PROMPTS.map((p) => {
              const href = `/studio/lyrics?theme=${encodeURIComponent(p.prompt)}&style=${encodeURIComponent(p.style)}&bars=${p.bars}`
              return (
                <Link
                  key={p.title}
                  href={href}
                  className="group border border-border-subtle bg-surface p-4 hover:border-accent transition-colors"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-sm font-medium text-text">{p.title}</h3>
                    <span className="text-[10px] font-mono text-muted tracking-widest">
                      {p.style.toUpperCase()} · {p.bars}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{p.prompt}</p>
                  <span className="text-xs font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    USE IT →
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6 border-b border-border-subtle pb-3">
            <h2 className="text-2xl font-display tracking-tight">
              <span className="text-text">FLOW</span>
              <span className="text-accent">_PATTERNS</span>
            </h2>
            <span className="text-xs font-mono text-muted">core pockets explained</span>
          </div>
          <div className="space-y-4">
            {FLOW_PATTERNS.map((f) => (
              <div
                key={f.name}
                className="border border-border-subtle bg-surface p-5"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-display tracking-tight text-text">
                    {f.name}
                  </h3>
                  <span className="text-xs font-mono text-accent">
                    {f.bpm_range[0]}-{f.bpm_range[1]} BPM
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-2">{f.description}</p>
                <p className="text-xs font-mono text-muted">
                  REF: {f.example}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6 border-b border-border-subtle pb-3">
            <h2 className="text-2xl font-display tracking-tight">
              <span className="text-text">RHYME</span>
              <span className="text-accent">_FAMILIES</span>
            </h2>
            <span className="text-xs font-mono text-muted">build multisyllabics</span>
          </div>
          <div className="space-y-3">
            {RHYME_FAMILIES.map((r) => (
              <div
                key={r.vowel_sound}
                className="border border-border-subtle bg-surface p-4"
              >
                <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                  <span className="text-sm font-mono text-accent tracking-widest">
                    [{r.vowel_sound}]
                  </span>
                  <span className="text-sm text-text-secondary">
                    {r.examples.join(' · ')}
                  </span>
                </div>
                <p className="text-xs text-muted">{r.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6 border-b border-border-subtle pb-3">
            <h2 className="text-2xl font-display tracking-tight">
              <span className="text-text">SONG</span>
              <span className="text-accent">_SKELETON</span>
            </h2>
            <span className="text-xs font-mono text-muted">copy + paste</span>
          </div>
          <pre className="border border-border-subtle bg-surface p-5 text-xs sm:text-sm font-mono text-text-secondary whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {STARTER_FREESTYLE_TEMPLATE}
          </pre>
        </section>

        <section className="text-center py-12 border-t border-border-subtle">
          <p className="text-sm text-text-secondary mb-6">
            Need more? Everything on this site is free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/studio/lyrics"
              className="px-6 py-2 border border-accent text-accent hover:bg-accent/10 transition-colors text-xs font-mono tracking-widest"
            >
              WRITE BARS →
            </Link>
            <Link
              href="/gallery"
              className="px-6 py-2 border border-border-subtle text-text-secondary hover:border-text-secondary hover:text-text transition-colors text-xs font-mono tracking-widest"
            >
              SEE GALLERY →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
