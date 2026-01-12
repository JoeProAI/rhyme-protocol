import { NextResponse } from 'next/server';
import { fetchFeeds } from '@/lib/feeds/scraper';

export const revalidate = 300;

export async function GET() {
  try {
    const feeds = await fetchFeeds();
    return NextResponse.json({ feeds, count: feeds.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
