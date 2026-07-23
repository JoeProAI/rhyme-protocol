import type { Metadata } from 'next'

const TITLE = 'AI Music Video Generator — Turn Your Song Into a Film'
const DESCRIPTION =
  'Upload your track and get a real music film: AI listens to your song, maps every section and lyric, storyboards one shot per beat, and generates a continuity-locked video. Edit every shot before you spend a cent. Flat pricing from $5.25 — no subscription, no card stored.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'AI music video generator',
    'make a music video from a song',
    'song to video AI',
    'AI music film',
    'music video maker for rappers',
    'turn my song into a music video',
    'AI video generator for musicians',
    'storyboard music video AI',
  ],
  alternates: { canonical: 'https://rhymeprotocol.com/studio/board' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://rhymeprotocol.com/studio/board',
    siteName: 'Rhyme Protocol',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Rhyme Protocol Music Films',
  serviceType: 'AI music video generation',
  provider: { '@type': 'Organization', name: 'Rhyme Protocol', url: 'https://rhymeprotocol.com' },
  description: DESCRIPTION,
  url: 'https://rhymeprotocol.com/studio/board',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '5.25',
    highPrice: '131.25',
    offerCount: '4',
    offers: [
      { '@type': 'Offer', name: 'Clip — 15 seconds', price: '5.25', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Scene — 1 minute', price: '21.00', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Music video — 3 minutes', price: '63.00', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Film — 6+ minutes', price: '131.25', priceCurrency: 'USD' },
    ],
  },
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
