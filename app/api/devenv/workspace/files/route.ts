import { NextRequest, NextResponse } from 'next/server';
import { writeFile, listFiles } from '@/lib/llm/daytona-workspace';

// GET: List files in directory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    const path = searchParams.get('path') || '/';

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    const files = await listFiles(workspaceId, path);
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('[Workspace Files] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create/write file
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, path, content } = await req.json();

    if (!workspaceId || !path || content === undefined) {
      return NextResponse.json(
        { error: 'workspaceId, path, and content required' },
        { status: 400 }
      );
    }

    await writeFile(workspaceId, path, content);
    return NextResponse.json({ success: true, path });
  } catch (error: any) {
    console.error('[Workspace Files] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
