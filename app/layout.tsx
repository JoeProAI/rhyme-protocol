import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";
import SoftPaywall from "@/components/SoftPaywall";
import NeuralBackground from "@/components/NeuralBackground";
import { PHProvider } from "./providers";

// ============================================
// SEO CONFIGURATION - OPTIMIZED FOR JOEPRO BRAND
// ============================================
const TWITTER_HANDLE = "@JoePro";
const SITE_URL = "https://joepro.ai";
const SITE_NAME = "JoePro.ai";
const BRAND_NAME = "JoePro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JoePro.ai – AI Tools, Prompts & Dev Resources",
    template: "%s | JoePro.ai",
  },
  description: "Curated AI tools, ready-to-use prompts, and practical guides for developers and creators. Custom agents, video generation, and instant dev environments.",
  keywords: [
    // Primary brand keywords - CRITICAL for search ownership
    "JoePro", "joepro", "JoeProAI", "joeproai", "Joe Pro", "joe pro",
    "JoePro.ai", "joepro.ai", "JoePro AI", "joepro ai",
    // Brand + service combinations
    "JoePro AI agents", "JoePro video generator", "JoePro AI platform",
    "JoeProAI agents", "JoeProAI tools", "JoeProAI video",
    // Technical keywords
    "AI platform", "AI agents", "custom AI agents", "AI video generator",
    "GPT-4", "Grok", "xAI", "OpenAI", "Luma AI", "Nano Banana",
    "cloud development", "AI development tools", "machine learning platform"
  ],
  authors: [{ name: "JoePro", url: SITE_URL }],
  creator: "JoePro",
  publisher: "JoePro.ai",
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
    title: "JoePro.ai – Build Smarter with AI",
    description: "Curated AI tools, ready-to-use prompts, and practical guides. Custom agents, video generation, and instant dev environments.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "JoePro.ai – Build Smarter with AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoePro.ai – Build Smarter with AI",
    description: "Curated AI tools, ready-to-use prompts, and practical guides. Custom agents, video generation, and instant dev environments.",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    images: [`${SITE_URL}/opengraph-image`],
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
    "msapplication-TileColor": "#6366f1",
    "theme-color": "#0a0a14",
  },
};

// JSON-LD Structured Data - Optimized for JoePro/JoeProAI brand ownership
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "JoePro | JoeProAI",
      alternateName: ["JoePro", "JoeProAI", "JoePro.ai", "Joe Pro AI"],
      description: "JoePro (JoeProAI) - The official AI platform by JoePro for custom AI agents, video generation, and cloud development tools.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "JoeProAI",
      alternateName: ["JoePro", "JoePro.ai", "Joe Pro", "JoePro AI"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630
      },
      description: "JoePro (JoeProAI) builds AI-powered tools including custom agents, video generators, and cloud development environments.",
      foundingDate: "2024",
      founder: { "@id": `${SITE_URL}/#person` },
      sameAs: [
        "https://x.com/JoePro",
        "https://github.com/JoeProAI",
        "https://linkedin.com/in/JoeProAI",
        "https://youtube.com/@JoeProAI",
        "https://x.com/JoePro",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: SITE_URL
      }
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "JoePro",
      alternateName: ["JoeProAI", "Joe Pro"],
      url: SITE_URL,
      jobTitle: "AI Developer & Founder",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      sameAs: [
        "https://x.com/JoePro",
        "https://github.com/JoeProAI",
        "https://linkedin.com/in/JoeProAI",
        "https://youtube.com/@JoeProAI",
        "https://x.com/JoePro",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "JoePro AI Video Generator",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      creator: { "@id": `${SITE_URL}/#organization` }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "JoePro Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "AI Apps", item: `${SITE_URL}/apps` },
        { "@type": "ListItem", position: 3, name: "AI Agents", item: `${SITE_URL}/agents` }
      ]
    }
  ],
};

// Navigation items
const navItems = [
  { href: "/apps", label: "Apps" },
  { href: "/agents", label: "Agents" },
  { href: "/lab", label: "Lab" },
  { href: "/best-ai-tools", label: "Recs" },
  { href: "/feeds", label: "News" },
  { href: "/devenv", label: "Dev" },
  { href: "/blog", label: "Blog" },
  { href: "/dashboard", label: "Usage" },
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
                <Link href="/" className="flex items-center" aria-label="JoePro.ai home">
                  <span className="text-xl font-display tracking-tight">
                    <span className="text-text">JoePro</span>
                    <span className="text-accent">.ai</span>
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
                      <span className="text-text">JoePro</span>
                      <span className="text-accent">.ai</span>
                    </span>
                  </Link>
                  <p className="text-text-secondary text-sm max-w-md">
                    Production-ready AI tools and development resources. 
                    Build smarter with curated prompts, custom agents, and video generation.
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
                        href="https://x.com/JoePro" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        X (Twitter)
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://github.com/JoeProAI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://huggingface.co/JoeProAI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        🤗 Hugging Face
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://youtube.com/@JoeProAI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        YouTube
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted">
                  © {new Date().getFullYear()} JoePro.ai. Built with intention.
                </p>
                <p className="text-xs text-muted">
                  Powered by Next.js, OpenAI, and Luma AI
                </p>
              </div>
            </div>
          </footer>

          {/* Floating Chat Widget */}
          <FloatingChat />
          
          {/* Soft Paywall */}
          <SoftPaywall />
        </PHProvider>
      </body>
    </html>
  );
}