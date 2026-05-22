import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChallenge, getDailyPromptForChallenge, listChallenges } from '@/lib/artist-challenges'
import ChallengeWriter from '@/components/ChallengeWriter'

export async function generateStaticParams() {
  return listChallenges().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const c = getChallenge(params.slug)
  if (!c) return { title: 'Challenge | Rhyme Protocol' }
  return {
    title: `${c.artist_name} Challenge | Rhyme Protocol`,
    description: `Write bars in the pocket of ${c.artist_name}. AI judges with real notes. Tribute mode — links route back to the artist.`,
  }
}

export default function ChallengePage({ params }: { params: { slug: string } }) {
  const found = getChallenge(params.slug)
  if (!found) {
    notFound()
  }
  const challenge = found!

  const todayPrompt = getDailyPromptForChallenge(challenge)

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 w-full overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-3">
          <Link
            href="/challenge"
            className="text-xs font-mono tracking-widest text-text-secondary hover:text-accent transition-colors"
          >
            ← ALL CHALLENGES
          </Link>
        </div>

        <div className="mb-8 px-2">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <h1 className="text-4xl sm:text-5xl font-display tracking-tight">
              <span className="text-text">{challenge.artist_name.split(' ')[0].toUpperCase()}</span>
              <span className="text-accent">
                _{(challenge.artist_name.split(' ').slice(1).join(' ') || 'CHALLENGE').toUpperCase()}
              </span>
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-muted">
              {challenge.status === 'official' ? '✓ OFFICIAL' : 'TRIBUTE MODE'}
            </span>
          </div>
          <p className="text-base text-text-secondary leading-relaxed">{challenge.intro}</p>
        </div>

        <div className="border border-accent/30 bg-accent/5 p-5 mb-8">
          <div className="text-[10px] font-mono tracking-widest text-accent mb-2">
            TODAY&apos;S PROMPT
          </div>
          <p className="text-lg sm:text-xl font-display tracking-tight text-text leading-snug">
            {todayPrompt}
          </p>
          <p className="text-xs text-text-secondary mt-2">{challenge.pocket}</p>
        </div>

        <ChallengeWriter slug={challenge.slug} prompt={todayPrompt} writerNote={challenge.writer_note} />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border border-border-subtle bg-surface p-5">
            <h3 className="text-xs font-mono tracking-widest text-accent mb-3">
              STYLE_TRAITS
            </h3>
            <ul className="space-y-2">
              {challenge.style_traits.map((t) => (
                <li key={t} className="text-sm text-text-secondary leading-relaxed">
                  · {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-border-subtle bg-surface p-5">
            <h3 className="text-xs font-mono tracking-widest text-accent mb-3">
              COMMON_THEMES
            </h3>
            <ul className="space-y-2">
              {challenge.themes.map((t) => (
                <li key={t} className="text-sm text-text-secondary leading-relaxed">
                  · {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border border-border-subtle bg-surface p-5">
          <h3 className="text-xs font-mono tracking-widest text-accent mb-3">
            GO STREAM {challenge.artist_name.toUpperCase()}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            This challenge is a tribute. The whole point is to send people to the artist&apos;s real work.
          </p>
          <div className="flex flex-wrap gap-2">
            {challenge.official_links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-accent text-accent text-xs font-mono tracking-widest hover:bg-accent/10 transition-colors"
              >
                {l.label.toUpperCase()} →
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-xs font-mono text-muted tracking-widest">
          <p className="mb-2">
            {challenge.status === 'tribute'
              ? `If you're ${challenge.artist_name} and want this taken down or made official, reach out:`
              : `Official challenge with ${challenge.artist_name}.`}
          </p>
          {challenge.status === 'tribute' && (
            <a
              href={`mailto:joe@joepro.ai?subject=${encodeURIComponent(`Re: ${challenge.artist_name} challenge on Rhyme Protocol`)}`}
              className="text-accent hover:underline"
            >
              joe@joepro.ai
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
