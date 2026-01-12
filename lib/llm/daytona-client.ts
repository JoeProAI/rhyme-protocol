/**
 * Daytona.io - Secure Sandbox Infrastructure
 * SDK: @daytonaio/sdk
 * 
 * Get your API key from: https://app.daytona.io/dashboard/keys
 * 
 * Usage:
 * - Port 22222 = Web Terminal (gives users a browser terminal)
 * - Port 3000 = App preview (for running web apps)
 * - sandbox.process.codeRun() = Execute code directly
 */

import { Daytona } from '@daytonaio/sdk';

// Daytona client singleton
let daytonaClient: Daytona | null = null;

function getDaytonaClient(): Daytona {
  if (!daytonaClient) {
    const apiKey = process.env.DAYTONA_API_KEY;
    if (!apiKey) {
      throw new Error('DAYTONA_API_KEY environment variable is required. Get your key from https://app.daytona.io/dashboard/keys');
    }
    daytonaClient = new Daytona({ apiKey });
  }
  return daytonaClient;
}

export interface SandboxTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  stack: string;
  snapshotName: string; // Actual snapshot name in Daytona dashboard
}

export interface CreateSandboxRequest {
  template: string;
  name?: string;
  repositoryUrl?: string;
}

export interface Sandbox {
  id: string;
  url: string;
  token?: string; // Auth token for preview URL
  template: string;
  createdAt: string;
}

// Pre-configured sandbox templates matching the devenv page
export const SANDBOX_TEMPLATES: SandboxTemplate[] = [
  {
    id: 'node',
    name: 'Node.js',
    description: 'Node.js 20 + npm/yarn ready',
    icon: '�',
    stack: 'javascript',
    snapshotName: 'javascript',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'TypeScript + Node.js + tsx',
    icon: '�',
    stack: 'typescript',
    snapshotName: 'typescript',
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python 3.11 + pip',
    icon: '🐍',
    stack: 'python',
    snapshotName: 'python',
  },
  {
    id: 'react',
    name: 'React',
    description: 'React + Vite + TypeScript',
    icon: '⚛️',
    stack: 'typescript',
    snapshotName: 'typescript',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Next.js 14 + App Router',
    icon: '▲',
    stack: 'typescript',
    snapshotName: 'typescript',
  },
  {
    id: 'ai',
    name: 'AI / ML',
    description: 'Python + Data Science libs',
    icon: '�',
    stack: 'python',
    snapshotName: 'python',
  },
];

// Map template ID to Daytona language parameter
const TEMPLATE_TO_LANGUAGE: Record<string, 'python' | 'typescript' | 'javascript'> = {
  'node': 'javascript',
  'typescript': 'typescript',
  'python': 'python',
  'react': 'typescript',
  'nextjs': 'typescript',
  'fullstack': 'typescript',
  'ai': 'python',
};

// Web Terminal port in Daytona sandboxes
const WEB_TERMINAL_PORT = 22222;

/**
 * Create a sandbox using Daytona SDK
 * Returns a URL to the Web Terminal (port 22222) for user interaction
 * 
 * Docs: https://www.daytona.io/docs/en/getting-started/
 */
export async function createInstantSandbox(request: CreateSandboxRequest): Promise<Sandbox> {
  const template = SANDBOX_TEMPLATES.find(t => t.id === request.template);
  
  if (!template) {
    throw new Error('Invalid template. Available: ' + SANDBOX_TEMPLATES.map(t => t.id).join(', '));
  }

  const client = getDaytonaClient();
  const language = TEMPLATE_TO_LANGUAGE[request.template] || 'typescript';

  console.log(`[Daytona] Creating sandbox - template: ${request.template}, language: ${language}`);

  try {
    // Create sandbox with the specified language runtime
    const sandbox = await client.create({
      language,
    });

    console.log(`[Daytona] Sandbox created successfully: ${sandbox.id}`);

    // Get the Web Terminal URL (port 22222) - this gives users a browser-based terminal
    const terminalPreview = await sandbox.getPreviewLink(WEB_TERMINAL_PORT);
    console.log(`[Daytona] Web Terminal URL: ${terminalPreview.url}`);

    return {
      id: sandbox.id,
      url: terminalPreview.url,
      token: terminalPreview.token,
      template: request.template,
      createdAt: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Daytona] Failed to create sandbox:', errorMsg);
    throw new Error(`Daytona Error: ${errorMsg}`);
  }
}

/**
 * Get a preview URL for a specific port on an existing sandbox
 */
export async function getSandboxPreviewUrl(sandboxId: string, port: number = 3000): Promise<string> {
  const client = getDaytonaClient();
  // @ts-ignore - Need to get sandbox by ID
  const sandbox = await client.get(sandboxId);
  const preview = await sandbox.getPreviewLink(port);
  return preview.url;
}

/**
 * Delete a sandbox when done
 */
export async function deleteSandbox(sandboxId: string): Promise<void> {
  const client = getDaytonaClient();
  try {
    // @ts-ignore - SDK method
    const sandbox = await client.get(sandboxId);
    await sandbox.delete();
    console.log(`[Daytona] Sandbox ${sandboxId} deleted`);
  } catch (error) {
    console.error(`[Daytona] Failed to delete sandbox ${sandboxId}:`, error);
  }
}
