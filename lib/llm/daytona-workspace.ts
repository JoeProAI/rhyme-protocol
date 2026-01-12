/**
 * Daytona Workspace Management for Agentic AI
 * Provides file operations, command execution, and deployment capabilities
 */

import { Daytona } from '@daytonaio/sdk';

let daytonaClient: Daytona | null = null;

function getClient(): Daytona {
  if (!daytonaClient) {
    const apiKey = process.env.DAYTONA_API_KEY;
    if (!apiKey) throw new Error('DAYTONA_API_KEY not configured');
    daytonaClient = new Daytona({ apiKey });
  }
  return daytonaClient;
}

/**
 * Write a file to the workspace
 */
export async function writeFile(workspaceId: string, path: string, content: string): Promise<void> {
  const client = getClient();
  const sandbox = await client.get(workspaceId);
  
  // Upload content as buffer
  await sandbox.fs.uploadFile(Buffer.from(content), path);
  console.log(`[Daytona] Wrote file: ${path}`);
}

/**
 * Read a file from the workspace
 */
export async function readFile(workspaceId: string, path: string): Promise<string> {
  const client = getClient();
  const sandbox = await client.get(workspaceId);
  
  const buffer = await sandbox.fs.downloadFile(path);
  return buffer.toString('utf-8');
}

/**
 * List files in a directory
 */
export async function listFiles(workspaceId: string, path: string = '/'): Promise<string[]> {
  const client = getClient();
  const sandbox = await client.get(workspaceId);
  
  const files = await sandbox.fs.listFiles(path);
  return files.map(f => f.name);
}

/**
 * Execute a command in the workspace
 */
export async function executeCommand(workspaceId: string, command: string, cwd?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const client = getClient();
  const sandbox = await client.get(workspaceId);
  
  console.log(`[Daytona] Executing: ${command}`);
  
  const result = await sandbox.process.executeCommand(command, cwd);
  
  return {
    stdout: result.artifacts?.stdout || result.result || '',
    stderr: '', // ExecuteResponse doesn't have stderr separately
    exitCode: result.exitCode || 0,
  };
}

/**
 * Install npm packages
 */
export async function installPackages(workspaceId: string, packages: string[]): Promise<string> {
  const packageList = packages.join(' ');
  const result = await executeCommand(workspaceId, `npm install ${packageList}`);
  
  if (result.exitCode !== 0) {
    throw new Error(`Failed to install packages: ${result.stderr}`);
  }
  
  return result.stdout;
}

/**
 * Run a dev server
 */
export async function startDevServer(workspaceId: string, port: number = 3000): Promise<{ url: string; processId?: string }> {
  const client = getClient();
  const sandbox = await client.get(workspaceId);
  
  // Start dev server in background
  await sandbox.process.executeCommand(`npm run dev -- --port ${port} &`);
  
  // Get preview URL
  const preview = await sandbox.getPreviewLink(port);
  
  return {
    url: preview.url,
  };
}

/**
 * Deploy to Vercel
 */
export async function deployToVercel(workspaceId: string, projectName: string): Promise<{ url: string; deploymentId: string }> {
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    throw new Error('VERCEL_TOKEN not configured. Cannot deploy.');
  }
  
  // Install Vercel CLI
  await executeCommand(workspaceId, 'npm install -g vercel');
  
  // Deploy (using token for auth)
  const result = await executeCommand(
    workspaceId,
    `vercel --token=${vercelToken} --yes --name=${projectName}`
  );
  
  // Extract URL from output
  const urlMatch = result.stdout.match(/https:\/\/[^\s]+/);
  const url = urlMatch ? urlMatch[0] : '';
  
  return {
    url,
    deploymentId: url.split('/').pop() || '',
  };
}

/**
 * Create a GitHub repo and push code
 */
export async function pushToGitHub(
  workspaceId: string,
  repoName: string,
  commitMessage: string = 'Initial commit'
): Promise<{ repoUrl: string }> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN not configured');
  }
  
  // Initialize git
  await executeCommand(workspaceId, 'git init');
  await executeCommand(workspaceId, 'git add .');
  await executeCommand(workspaceId, `git commit -m "${commitMessage}"`);
  
  // Create GitHub repo via API
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      private: false,
      auto_init: false,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create GitHub repo: ${await response.text()}`);
  }
  
  const repo = await response.json();
  
  // Push to GitHub
  await executeCommand(workspaceId, `git remote add origin ${repo.clone_url}`);
  await executeCommand(workspaceId, 'git branch -M main');
  await executeCommand(workspaceId, `git push -u origin main`);
  
  return {
    repoUrl: repo.html_url,
  };
}

/**
 * Create a complete project structure
 */
export async function scaffoldProject(
  workspaceId: string,
  projectType: 'react' | 'nextjs' | 'node' | 'python',
  projectName: string
): Promise<void> {
  console.log(`[Daytona] Scaffolding ${projectType} project: ${projectName}`);
  
  switch (projectType) {
    case 'react':
      await executeCommand(workspaceId, `npm create vite@latest ${projectName} -- --template react-ts`);
      await executeCommand(workspaceId, `cd ${projectName} && npm install`);
      break;
      
    case 'nextjs':
      await executeCommand(workspaceId, `npx create-next-app@latest ${projectName} --typescript --tailwind --app --no-src-dir --import-alias "@/*"`);
      break;
      
    case 'node':
      await executeCommand(workspaceId, `mkdir -p ${projectName}`);
      await executeCommand(workspaceId, `cd ${projectName} && npm init -y`);
      await writeFile(workspaceId, `${projectName}/index.js`, 'console.log("Hello from Node.js!");');
      break;
      
    case 'python':
      await executeCommand(workspaceId, `mkdir -p ${projectName}`);
      await writeFile(workspaceId, `${projectName}/main.py`, 'print("Hello from Python!")');
      await writeFile(workspaceId, `${projectName}/requirements.txt`, '');
      break;
  }
  
  console.log(`[Daytona] Project scaffolded successfully`);
}
