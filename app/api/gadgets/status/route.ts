import { NextResponse } from 'next/server';
import os from 'os';

export const runtime = 'nodejs';

export async function GET() {
  const data = {
    server: 'JoePro.ai',
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
  
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}
