import { NextRequest, NextResponse } from 'next/server';
import { deployToVercel } from '@/lib/llm/daytona-workspace';

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, projectName, provider = 'vercel' } = await req.json();

    if (!workspaceId || !projectName) {
      return NextResponse.json(
        { error: 'workspaceId and projectName required' },
        { status: 400 }
      );
    }

    if (provider !== 'vercel') {
      return NextResponse.json(
        { error: 'Only Vercel deployment is currently supported' },
        { status: 400 }
      );
    }

    console.log(`[Workspace Deploy] Deploying ${projectName} to Vercel`);
    const result = await deployToVercel(workspaceId, projectName);
    
    return NextResponse.json({
      success: true,
      url: result.url,
      deploymentId: result.deploymentId,
    });
  } catch (error: any) {
    console.error('[Workspace Deploy] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
