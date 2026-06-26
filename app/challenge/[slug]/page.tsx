import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChallenge, getDailyPromptForChallenge, listChallenges } from '@/lib/artist-challenges'
import ChallengeWriter from '@/components/ChallengeWriter'
import ChallengeChat from '@/components/ChallengeChat'
import ChallengeBeat from '@/components/ChallengeBeat'
import ChallengeActivity from '@/components/ChallengeActivity'

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
    description: `Write bars in the pocket of ${c.artist_name}. AI judges with real notes. Tribute mode, links route back to the artist.`,
    openGraph: {
      title: `${c.artist_name} Challenge | Rhyme Protocol`,
      description: `Cook a beat. Write a verse. Get judged. Tribute to ${c.artist_name}.`,
      type: 'website',
    },
  }
}

export default function ChallengePage({ params }: { params: { slug: string } }) {
  const found = getChallenge(params.slug)
  if (!found) {
    notFound()
  }
  const challenge = found!
  const todayPrompt = getDailyPromptForChallenge(challenge)
  const firstName = challenge.artist_name.split(' ')[0]
  const lastName = challenge.artist_name.split(' ').slice(1).join(' ')
  const proofPoints = [
    'No lyrics stored',
    'No voice clone',
    'Official links first',
    `${challenge.style_traits.length} style receipts`,
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden">
      {/* HERO: full-bleed cinematic prompt */}
      <section className="relative border-b border-border-subtle">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/challenge"
              className="text-[10px] font-mono tracking-widest text-text-secondary hover:text-accent transition-colors"
            >
              ALL CHALLENGES
            </Link>
            <span className="border border-border-subtle px-3 py-1 text-[10px] font-mono tracking-widest text-muted">
              {challenge.status === 'official' ? 'OFFICIAL' : 'TRIBUTE MODE'}
            </span>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
            <div>
              <p className="mb-3 text-[10px] font-mono tracking-[0.35em] text-accent">
                WRITE IN THE POCKET, NOT THE PERSONA
              </p>
              <h1 className="text-5xl sm:text-7xl font-display tracking-tight leading-[0.95] mb-4">
                <span className="text-text">{firstName.toUpperCase()}</span>
                <span className="text-accent">_{(lastName || 'CHALLENGE').toUpperCase()}</span>
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
                {challenge.intro}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {proofPoints.map((point) => (
                <div
                  key={point}
                  className="border border-border-subtle bg-surface/70 px-3 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Today's prompt as the main moment */}
          <div className="border border-accent/40 bg-accent/[0.03] backdrop-blur-sm">
            <div className="flex flex-col gap-2 border-b border-accent/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] font-mono tracking-widest text-accent">
                TODAY'S PROMPT
              </span>
              <ChallengeActivity slug={challenge.slug} />
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xl sm:text-3xl font-display tracking-tight text-text leading-[1.15] mb-3">
                {todayPrompt}
              </p>
              <div className="grid gap-3 border-t border-accent/20 pt-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <p className="text-xs text-text-secondary leading-relaxed">{challenge.pocket}</p>
                <span className="border border-accent/30 px-3 py-1 text-[10px] font-mono tracking-widest text-accent">
                  YOUR STORY ONLY
                </span>
              </div>
            </div>
          </div>

          {/* Credibility receipt */}
          {challenge.research_credit && (
            <p className="mt-4 max-w-3xl text-[10px] font-mono tracking-widest text-muted leading-relaxed">
              {challenge.research_credit}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* STEP 1: COOK A BEAT */}
        {challenge.beat_prompt && (
          <section>
            <SectionHeader
              step="01"
              title="COOK_A_BEAT"
              sub={`Style-palette instrumental in ${firstName}'s production lane.`}
              meta="15-60S · FREE"
            />
            <div className="border border-border-subtle bg-surface p-5 sm:p-6">
              <ChallengeBeat slug={challenge.slug} artistName={challenge.artist_name} />
            </div>
          </section>
        )}

        {/* STEP 2: WRITE BARS */}
        <section>
          <SectionHeader
            step={challenge.beat_prompt ? '02' : '01'}
            title="WRITE_THE_BARS"
            sub="Use the pocket as a constraint. Keep the biography yours."
            meta="JUDGED ON 6 AXES"
          />
          <ChallengeWriter
            slug={challenge.slug}
            prompt={todayPrompt}
            writerNote={challenge.writer_note}
          />
        </section>

        {/* STEP 3: SPAR */}
        <section>
          <SectionHeader
            step={challenge.beat_prompt ? '03' : '02'}
            title="SPAR_WITH_THE_STYLE"
            sub={`AI sparring partner using ${challenge.artist_name}'s documented public style as a craft reference. Not the artist. Not a clone. Won't flatter you.`}
            meta="FREE · UNLIMITED"
          />
          <ChallengeChat slug={challenge.slug} artistName={challenge.artist_name} />
        </section>

        {/* THE ARTIST: featured video + style cards + links */}
        <section>
          <SectionHeader
            step="00"
            title={`STREAM_${firstName.toUpperCase()}`}
            sub="This whole thing is a tribute. The point is to send you to the source."
            meta="OFFICIAL"
          />

          {challenge.featured_video && (
            <div className="mb-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${challenge.featured_video.id}?rel=0&modestbranding=1`}
                  title={challenge.featured_video.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border border-border-subtle"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-[10px] font-mono tracking-widest text-muted">
                {challenge.featured_video.title.toUpperCase()}
              </p>
            </div>
          )}

          <div className="border border-border-subtle bg-surface p-5">
            <div className="text-[10px] font-mono tracking-widest text-accent mb-3">
              EVERYWHERE TO FIND HIM
            </div>
            <div className="flex flex-wrap gap-2">
              {challenge.official_links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-accent text-accent text-[10px] font-mono tracking-widest hover:bg-accent hover:text-bg transition-colors"
                >
                  {l.label.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* STYLE BREAKDOWN: the receipts */}
        <section>
          <SectionHeader
            step="DEEP"
            title="STYLE_BREAKDOWN"
            sub="What the judge is actually scoring against. No vibes, no guesses."
            meta={`${challenge.style_traits.length} TRAITS · ${challenge.themes.length} THEMES`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border-subtle bg-surface p-5">
              <h3 className="text-[10px] font-mono tracking-widest text-accent mb-3">
                STYLE_TRAITS
              </h3>
              <ul className="space-y-2">
                {challenge.style_traits.map((t) => (
                  <li
                    key={t}
                    className="text-xs sm:text-sm text-text-secondary leading-relaxed flex gap-2"
                  >
                    <span className="text-accent flex-shrink-0">/</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border-subtle bg-surface p-5">
              <h3 className="text-[10px] font-mono tracking-widest text-accent mb-3">
                COMMON_THEMES
              </h3>
              <ul className="space-y-2">
                {challenge.themes.map((t) => (
                  <li
                    key={t}
                    className="text-xs sm:text-sm text-text-secondary leading-relaxed flex gap-2"
                  >
                    <span className="text-accent flex-shrink-0">/</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* TRIBUTE FOOTER */}
        <footer className="pt-8 border-t border-border-subtle text-center">
          <p className="text-[10px] font-mono tracking-widest text-muted mb-2">
            {challenge.status === 'tribute'
              ? `IF YOU'RE ${challenge.artist_name.toUpperCase()} AND WANT THIS OFFICIAL OR TAKEN DOWN`
              : `OFFICIAL CHALLENGE WITH ${challenge.artist_name.toUpperCase()}`}
          </p>
          {challenge.status === 'tribute' && (
            <a
              href={`mailto:joe@joepro.ai?subject=${encodeURIComponent(
                `Re: ${challenge.artist_name} challenge on Rhyme Protocol`,
              )}`}
              className="text-xs font-mono tracking-widest text-accent hover:underline"
            >
              JOE@JOEPRO.AI
            </a>
          )}
        </footer>
      </div>
    </div>
  )
}

function SectionHeader({
  step,
  title,
  sub,
  meta,
}: {
  step: string
  title: string
  sub: string
  meta: string
}) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-mono tracking-widest text-muted">
            {step}
          </span>
          <h2 className="text-base sm:text-lg font-mono tracking-widest text-accent">
            {title}
          </h2>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-muted">
          {meta}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
        {sub}
      </p>
    </div>
  )
}
