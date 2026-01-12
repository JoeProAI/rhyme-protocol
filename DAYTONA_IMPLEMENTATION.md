# Daytona Implementation Guide

## What I Learned from Docs

### 1. **Snapshots** (Pre-configured Images)
- Snapshots are Docker/OCI images configured with your dev stack
- Launch in **milliseconds** from warm pool
- Created via Dashboard or API
- Can be:
  - Public images (node:20, python:3.11)
  - Private registries
  - Custom Dockerfiles
  - Declarative Builder

### 2. **Sandboxes** (Running Environments)
- Created from snapshots using SDK
- Get unique ID and preview URL
- Can be:
  - **Public**: Anyone with link can access
  - **Private**: Only org members + token required
- Preview URLs: `https://PORT-sandbox-ID.proxy.daytona.work`

### 3. **Access Control**
- API Key from dashboard (with scopes)
- Sandbox `public` flag:
  - `true` = public access
  - `false` = org-only + token auth
- Token in header: `x-daytona-preview-token: TOKEN`

### 4. **SDK Usage** (TypeScript)
```typescript
import { Daytona } from '@daytonaio/sdk';

// Initialize with API key
const daytona = new Daytona({
  apiKey: process.env.DAYTONA_API_KEY
});

// Create sandbox from snapshot
const sandbox = await daytona.create({
  snapshot: 'my-node-snapshot',  // Pre-configured snapshot name
  name: 'user-sandbox-123',
  public: true  // or false for private
});

// Get preview URL for port 3000
const preview = await sandbox.getPreviewUrl(3000);
console.log(preview.url);   // https://3000-sandbox-xxx.proxy.daytona.work
console.log(preview.token); // Auth token for private sandboxes
```

## Proper Implementation Strategy

### Phase 1: Create Snapshots (One-time setup)
1. Go to [Daytona Dashboard](https://app.daytona.io/dashboard/snapshots)
2. Create snapshots for each template:
   - `joepro-node` - Node.js 20
   - `joepro-python` - Python 3.11 + pip
   - `joepro-react` - Node + Vite + React template
   - `joepro-nextjs` - Next.js 14 starter
   - `joepro-fullstack` - Node + PostgreSQL
   - `joepro-ai` - Python + Jupyter + TF

### Phase 2: Backend Implementation
```typescript
// lib/daytona/client.ts
import { Daytona } from '@daytonaio/sdk';

export const daytonaClient = new Daytona({
  apiKey: process.env.DAYTONA_API_KEY!
});

// Map templates to snapshot names
export const SNAPSHOT_MAP = {
  node: 'joepro-node',
  python: 'joepro-python',
  react: 'joepro-react',
  nextjs: 'joepro-nextjs',
  fullstack: 'joepro-fullstack',
  ai: 'joepro-ai'
};

// Create sandbox
export async function launchSandbox(template: string) {
  const snapshot = SNAPSHOT_MAP[template];
  
  const sandbox = await daytonaClient.create({
    snapshot,
    public: true,  // Users don't need accounts
    name: `joepro-${template}-${Date.now()}`
  });
  
  // Get IDE preview URL (usually port 3000 or 8000)
  const preview = await sandbox.getPreviewUrl(3000);
  
  return {
    id: sandbox.id,
    url: preview.url,
    token: preview.token  // Include token for programmatic access
  };
}
```

### Phase 3: API Route
```typescript
// app/api/daytona/launch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { launchSandbox } from '@/lib/daytona/client';

export async function POST(req: NextRequest) {
  const { template } = await req.json();
  
  try {
    const sandbox = await launchSandbox(template);
    return NextResponse.json({ sandbox });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Phase 4: Frontend (No Changes Needed!)
The existing UI works perfectly - just hits the API and opens the real preview URL.

## Key Benefits

1. **Fast Launch**: Warm snapshots = millisecond startup
2. **No Auth Required**: Public flag means instant access
3. **Full IDEs**: VS Code in browser with preview URLs
4. **Your Credits**: Uses your 20K Daytona credits
5. **Org Control**: All sandboxes under your org dashboard

## Next Steps

1. Install SDK: `npm install @daytonaio/sdk`
2. Get API key from [dashboard](https://app.daytona.io/dashboard/keys)
3. Create snapshots for each template
4. Update implementation with real SDK calls
5. Test launch flow

## Example User Flow

1. User clicks "Launch Sandbox" (Node.js)
2. Backend creates sandbox from `joepro-node` snapshot
3. Returns preview URL: `https://3000-sandbox-abc123.proxy.daytona.work`
4. Frontend opens URL in new tab
5. User sees VS Code with Node.js already configured
6. Start coding immediately!

## Security Note

Since `public: true`, anyone with the link can access. This is fine for:
- Quick demos
- Public templates
- Temporary environments

For private/sensitive work, set `public: false` and implement token auth.
