import type { Metadata } from 'next'
import Link from 'next/link'
import { listChallenges } from '@/lib/artist-challenges'

export const metadata: Metadata = {
  title: 'Artist Challenges | Rhyme Protocol',
  description: 'Write bars in the pocket of artists you respect. AI judges. Tribute mode — every challenge links back to the artist.',
}

export default function ChallengeIndexPage() {
  const challenges = listChallenges()

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12 px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display tracking-tight mb-4">
            <span className="text-text">ARTIST</span>
            <span className="text-accent">_CHALLENGES</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl mx-auto">
            Write bars in the pocket of artists you respect. AI judges, real notes, no participation trophies.
          </p>
          <p className="text-xs font-mono text-muted mt-4 tracking-widest">
            TRIBUTE_MODE · NO VOICE GENERATION · ALL TRAFFIC ROUTES BACK TO THE ARTIST
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {challenges.map((c) => (
            <Link
              key={c.slug}
              href={`/challenge/${c.slug}`}
              className="group border border-border-subtle bg-surface p-6 hover:border-accent transition-all"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-display tracking-tight text-text group-hover:text-accent transition-colors">
                  {c.artist_name}
                </h2>
                <span className="text-[10px] font-mono tracking-widest text-muted">
                  {c.status === 'official' ? 'OFFICIAL' : 'TRIBUTE'}
                </span>
              </div>
              <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                {c.intro}
              </p>
              <div className="flex items-center justify-between text-xs font-mono tracking-wider">
                <span className="text-muted">{c.style_traits.length} STYLE TRAITS</span>
                <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  TAKE THE CHALLENGE →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12 text-xs font-mono text-muted tracking-widest">
          <p>WANT YOUR OWN OFFICIAL CHALLENGE?</p>
          <a
            href="mailto:joe@joepro.ai?subject=Rhyme%20Protocol%20Artist%20Challenge"
            className="text-accent hover:underline"
          >
            joe@joepro.ai
          </a>
        </div>
      </div>
    </div>
  )
}
