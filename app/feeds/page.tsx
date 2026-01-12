import { Metadata } from 'next';
import { Rss, ExternalLink } from 'lucide-react';
import { FEED_SOURCES } from '@/lib/feeds/sources';
import { fetchFeeds } from '@/lib/feeds/scraper';

export const metadata: Metadata = {
  title: 'Tech News - JoePro.ai',
  description: 'Real-time tech news from top sources',
};

export const revalidate = 300; // Revalidate every 5 minutes

export default async function FeedsPage() {
  const feeds = await fetchFeeds().catch(() => []);
  return (
    <main className="min-h-screen relative z-10 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-display text-text mb-4">Tech News</h1>
          <p className="text-text-secondary">
            Real-time updates from {FEED_SOURCES.length} sources · {feeds.length} articles
          </p>
        </header>

        {feeds.length > 0 ? (
          <div className="space-y-3">
            {feeds.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <span className="text-accent font-medium">
                        {item.source}
                      </span>
                      <span className="text-text-secondary">·</span>
                      <span className="text-text-secondary">
                        {new Date(item.published).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {item.category && (
                        <>
                          <span className="text-text-secondary">·</span>
                          <span className="px-2 py-0.5 bg-accent-muted text-accent rounded text-xs">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-text group-hover:text-accent transition-colors">
                      {item.title}
                    </h2>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-accent flex-shrink-0 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Rss className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-display text-text mb-2">Loading Feeds...</h2>
            <p className="text-text-secondary">
              Aggregating news from {FEED_SOURCES.length} sources
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
