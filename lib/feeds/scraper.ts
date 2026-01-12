import Parser from 'rss-parser';
import { FEED_SOURCES } from './sources';

export interface FeedItem {
  title: string;
  url: string;
  source: string;
  published: string;
  tags: string[];
  category: string;
}

const parser = new Parser();

export async function fetchFeeds(): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  for (const source of FEED_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      
      const items = feed.items.slice(0, 10).map(item => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        source: source.name,
        published: item.pubDate || new Date().toISOString(),
        tags: item.categories || [],
        category: source.category,
      }));

      allItems.push(...items);
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
    }
  }

  return allItems.sort((a, b) => 
    new Date(b.published).getTime() - new Date(a.published).getTime()
  );
}
