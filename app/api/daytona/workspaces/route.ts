import { NextRequest, NextResponse } from 'next/server';
import { createInstantSandbox, SANDBOX_TEMPLATES } from '@/lib/llm/daytona-client';

export async function GET() {
  // Return available templates
  return NextResponse.json({ templates: SANDBOX_TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template, name, repositoryUrl } = body;

    if (!template) {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    }

    console.log('[Daytona] Creating sandbox:', { template, name });
    
    const sandbox = await createInstantSandbox({
      template,
      name,
      repositoryUrl
    });

    console.log('[Daytona] Sandbox created:', sandbox.id);
    
    return NextResponse.json({ sandbox });
  } catch (error: any) {
    console.error('[Daytona] Error creating sandbox:', {
      message: error.message,
      stack: error.stack,
      details: error.toString()
    });
    
    return NextResponse.json({ 
      error: error.message || 'Failed to create sandbox',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
