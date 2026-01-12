import { NextRequest, NextResponse } from 'next/server';
import { readFile } from '@/lib/llm/daytona-workspace';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    const path = searchParams.get('path');

    if (!workspaceId || !path) {
      return NextResponse.json(
        { error: 'workspaceId and path required' },
        { status: 400 }
      );
    }

    const content = await readFile(workspaceId, path);
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('[Workspace Read] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
