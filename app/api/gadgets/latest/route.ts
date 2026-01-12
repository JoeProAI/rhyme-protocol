import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    headline: 'JoePro.ai - AI Innovation Hub',
    timestamp: new Date().toISOString(),
    status: 'online',
    activeAgents: 0,
    feedCount: 8,
  };
  
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}
