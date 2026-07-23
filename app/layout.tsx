import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";
import SoftPaywall from "@/components/SoftPaywall";
import NeuralBackground from "@/components/NeuralBackground";
import { PHProvider } from "./providers";
import { Providers } from "@/components/providers";

// ============================================
// SEO CONFIGURATION - RHYME PROTOCOL
// ============================================
const TWITTER_HANDLE = "@RhymeProtocol";
const SITE_URL = "https://www.rhymeprotocol.com";
const SITE_NAME = "Rhyme Protocol";
const BRAND_NAME = "Rhyme Protocol";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rhyme Protocol | AI Tools for Rap Artists",
    template: "%s | Rhyme Protocol",
  },
  description: "AI-powered tools for rap artists to write sharper lyrics, create cover art, and generate cinematic music videos.",
  keywords: [
    "Rhyme Protocol", "AI rap tools", "rap lyrics generator",
    "AI lyrics", "hip hop AI", "rap artist tools",
    "cover art generator", "AI music video generator", "lyric lab",
    "music visuals", "artist challenges"
  ],
  authors: [{ name: "Rhyme Protocol", url: SITE_URL }],
  creator: "Rhyme Protocol",
  publisher: "Rhyme Protocol",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Rhyme Protocol | AI Tools for Rap Artists",
    description: "Lyrics, cover art, and cinematic music videos powered by AI.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/opengraph-image?v=rap-tools-20260626`,
        width: 1200,
        height: 630,
        alt: "Rhyme Protocol - AI tools for rap artists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rhyme Protocol | AI Tools for Rap Artists",
    description: "Lyrics, cover art, and cinematic music videos powered by AI.",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    images: [
      {
        url: `${SITE_URL}/twitter-image?v=rap-tools-20260626`,
        alt: "Rhyme Protocol - AI tools for rap artists",
        width: 1200,
        height: 630,
      },
    ],
  },
  verification: {
    // Add your verification codes after claiming your sites:
    // google: "your-google-search-console-verification-code",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
    shortcut: '/favicon.ico',
  },
  other: {
    "msapplication-TileColor": "#1f1f1a",
    "theme-color": "#0a0a14",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Rhyme Protocol",
      description: "AI-powered creative suite for rap artists to write lyrics, generate cover art, and create cinematic music videos.",
      publisher: { "@id": `${SITE_URL}/#organization` }
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Rhyme Protocol",
      url: SITE_URL,
      description: "Rhyme Protocol builds AI tools for rap artists, from lyric writing to cover art and music-video generation."
    },
    {
      "@type": "SoftwareApplication",
      name: "Rhyme Protocol AI Tools for Rap Artists",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      creator: { "@id": `${SITE_URL}/#organization` }
    }
  ],
};

// Navigation items
const navItems = [
  { href: "/studio/board", label: "Music Films" },
  { href: "/studio/lyrics", label: "Lyrics" },
  { href: "/studio/cover-art", label: "Cover Art" },
  { href: "/studio/video", label: "Video" },
  { href: "/studio/audio", label: "Audio" },
  { href: "/studio/voice-clean", label: "Voice Cleaner" },
  { href: "/challenge", label: "Challenges" },
  { href: "/gallery", label: "Gallery" },
  { href: "/free", label: "Free Pack" },
  { href: "/studio/clips", label: "My Clips" },
  { href: "/studio/gallery", label: "My Creations" },
  { href: "/how-to", label: "How To" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-grain">
        <Providers>
        <PHProvider>
          {/* Neural Network Background */}
          <NeuralBackground />

          {/* Skip to main content - Accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] btn btn-primary"
          >
            Skip to main content
          </a>

          {/* Navigation */}
          <nav className="nav-surface fixed top-0 left-0 right-0 z-50" role="navigation" aria-label="Main navigation">
            <div className="container">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center" aria-label="Rhyme Protocol home">
                  <span className="text-xl font-display tracking-tight">
                    <span className="text-text">RHYME</span>
                    <span className="text-accent">_PROTOCOL</span>
                  </span>
                </Link>

                {/* Nav Links - Desktop */}
                <div className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-link gold-underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  className="md:hidden p-2 text-text-secondary hover:text-text transition-colors"
                  aria-label="Open menu"
                  aria-expanded="false"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Gold Thread - Signature Element */}
            <div 
              className="absolute bottom-0 left-0 h-px w-full"
              style={{ 
                background: 'linear-gradient(to right, transparent, var(--color-accent), transparent)',
                opacity: 0.4 
              }}
              aria-hidden="true"
            />
          </nav>

          {/* Main Content */}
          <main id="main-content" className="pt-16 min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border-subtle mt-24" role="contentinfo">
            <div className="container py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="md:col-span-2">
                  <Link href="/" className="inline-block mb-4">
                    <span className="text-xl font-display">
                      <span className="text-text">RHYME</span>
                      <span className="text-accent">_PROTOCOL</span>
                    </span>
                  </Link>
                  <p className="text-text-secondary text-sm max-w-md">
                    AI-powered tools for rap and hip-hop artists. Free for the community.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h4 className="text-sm font-medium text-text mb-4">Platform</h4>
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link 
                          href={item.href}
                          className="text-sm text-text-secondary hover:text-accent transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social */}
                <div>
                  <h4 className="text-sm font-medium text-text mb-4">Connect</h4>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="https://github.com/JoeProAI/rhyme-protocol" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        GitHub
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted">
                  © {new Date().getFullYear()} Rhyme Protocol
                </p>
                <p className="text-xs text-muted">
                  Built with care for the rap community
                </p>
              </div>
            </div>
          </footer>

          {/* Floating Chat Widget */}
          <FloatingChat />
          
          {/* Soft Paywall */}
          <SoftPaywall />
        </PHProvider>
        </Providers>
      </body>
    </html>
  );
}