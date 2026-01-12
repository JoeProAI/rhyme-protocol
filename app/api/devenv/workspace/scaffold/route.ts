import { NextRequest, NextResponse } from 'next/server';
import { scaffoldProject } from '@/lib/llm/daytona-workspace';

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, projectType, projectName } = await req.json();

    if (!workspaceId || !projectType || !projectName) {
      return NextResponse.json(
        { error: 'workspaceId, projectType, and projectName required' },
        { status: 400 }
      );
    }

    const validTypes = ['react', 'nextjs', 'node', 'python'];
    if (!validTypes.includes(projectType)) {
      return NextResponse.json(
        { error: `Invalid projectType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[Workspace Scaffold] Creating ${projectType} project: ${projectName}`);
    await scaffoldProject(workspaceId, projectType as any, projectName);
    
    return NextResponse.json({ success: true, projectType, projectName });
  } catch (error: any) {
    console.error('[Workspace Scaffold] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
