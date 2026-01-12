import { NextRequest, NextResponse } from 'next/server';
import { installPackages } from '@/lib/llm/daytona-workspace';

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, packages } = await req.json();

    if (!workspaceId || !packages || !Array.isArray(packages)) {
      return NextResponse.json(
        { error: 'workspaceId and packages array required' },
        { status: 400 }
      );
    }

    console.log(`[Workspace Packages] Installing: ${packages.join(', ')}`);
    const output = await installPackages(workspaceId, packages);
    
    return NextResponse.json({ success: true, output });
  } catch (error: any) {
    console.error('[Workspace Packages] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
