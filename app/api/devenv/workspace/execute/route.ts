import { NextRequest, NextResponse } from 'next/server';
import { executeCommand } from '@/lib/llm/daytona-workspace';

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, command, cwd } = await req.json();

    if (!workspaceId || !command) {
      return NextResponse.json(
        { error: 'workspaceId and command required' },
        { status: 400 }
      );
    }

    console.log(`[Workspace Execute] Running: ${command}`);
    const result = await executeCommand(workspaceId, command, cwd);
    
    return NextResponse.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    });
  } catch (error: any) {
    console.error('[Workspace Execute] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
