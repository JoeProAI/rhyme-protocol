'use client';

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotSidebar, CopilotChat } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { useState } from 'react';

interface DevAgentChatProps {
  workspaceId: string | null;
  onWorkspaceUpdate?: () => void;
}

export default function DevAgentChat({ workspaceId, onWorkspaceUpdate }: DevAgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [lastCommand, setLastCommand] = useState<string>('');

  // Make workspace context available to the AI
  useCopilotReadable({
    description: 'Current workspace information',
    value: {
      workspaceId,
      hasWorkspace: !!workspaceId,
      files,
      lastCommand,
    },
  });

  // Action: Create a file
  useCopilotAction({
    name: 'create_file',
    description: 'Create a new file in the workspace with specified content',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path (e.g., "src/App.tsx")',
        required: true,
      },
      {
        name: 'content',
        type: 'string',
        description: 'File content',
        required: true,
      },
    ],
    handler: async ({ path, content }) => {
      if (!workspaceId) {
        throw new Error('No active workspace. Please launch a sandbox first.');
      }

      const response = await fetch('/api/devenv/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, path, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create file');
      }

      setFiles([...files, path]);
      onWorkspaceUpdate?.();
      
      return `Created file: ${path}`;
    },
  });

  // Action: Execute command
  useCopilotAction({
    name: 'run_command',
    description: 'Execute a shell command in the workspace',
    parameters: [
      {
        name: 'command',
        type: 'string',
        description: 'Shell command to execute (e.g., "npm install react")',
        required: true,
      },
      {
        name: 'cwd',
        type: 'string',
        description: 'Working directory (optional)',
        required: false,
      },
    ],
    handler: async ({ command, cwd }) => {
      if (!workspaceId) {
        throw new Error('No active workspace. Please launch a sandbox first.');
      }

      const response = await fetch('/api/devenv/workspace/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, command, cwd }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Command execution failed');
      }

      const result = await response.json();
      setLastCommand(command);
      
      return `Command output:\n${result.stdout}\n${result.stderr ? `Errors: ${result.stderr}` : ''}`;
    },
  });

  // Action: List files
  useCopilotAction({
    name: 'list_files',
    description: 'List all files in a directory',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'Directory path (default: "/")',
        required: false,
      },
    ],
    handler: async ({ path = '/' }) => {
      if (!workspaceId) {
        throw new Error('No active workspace. Please launch a sandbox first.');
      }

      const response = await fetch(`/api/devenv/workspace/files?workspaceId=${workspaceId}&path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to list files');
      }

      const data = await response.json();
      setFiles(data.files);
      
      return `Files in ${path}:\n${data.files.join('\n')}`;
    },
  });

  // Action: Read file
  useCopilotAction({
    name: 'read_file',
    description: 'Read the contents of a file',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path to read',
        required: true,
      },
    ],
    handler: async ({ path }) => {
      if (!workspaceId) {
        throw new Error('No active workspace. Please launch a sandbox first.');
      }

      const response = await fetch(`/api/devenv/workspace/files/read?workspaceId=${workspaceId}&path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to read file');
      }

      const data = await response.json();
      return `Content of ${path}:\n\`\`\`\n${data.content}\n\`\`\``;
    },
  });

  // Action: Install packages
  useCopilotAction({
    name: 'install_packages',
    description: 'Install npm packages in the workspace',
    parameters: [
      {
        name: 'packages',
        type: 'string[]',
        description: 'Array of package names to install',
        required: true,
      },
    ],
    handler: async ({ packages }) => {
      if (!workspaceId) {
        throw new Error('No active workspace. Please launch a sandbox first.');
      }

      const response = await fetch('/api/devenv/workspace/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, packages }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to install packages');
      }

      const result = await response.json();
      return `Installed packages: ${packages.join(', ')}\n${result.output}`;
    },
  });

  // Action: Deploy to Vercel
  useCopilotAction({
    name: 'deploy_to_vercel',
    description: 'Deploy the current workspace to Vercel. Only call this when the user explicitly asks to deploy.',
    parameters: [
      {
        name: 'projectName',
        type: 'string',
        description: 'Project name for deployment',
        required: true,
      },
    ],
    handler: async ({ projectName }) => {
      if (!workspaceId) {
        throw new Error('No active workspace');
      }

      const response = await fetch('/api/devenv/workspace/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, projectName, provider: 'vercel' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment failed');
      }

      const result = await response.json();
      return `✅ Deployed successfully!\n\nURL: ${result.url}\nDeployment ID: ${result.deploymentId}`;
    },
  });

  // Action: Scaffold project
  useCopilotAction({
    name: 'scaffold_project',
    description: 'Create a complete project structure (React, Next.js, Node.js, or Python)',
    parameters: [
      {
        name: 'projectType',
        type: 'string',
        description: 'Type of project: react, nextjs, node, or python',
        required: true,
      },
      {
        name: 'projectName',
        type: 'string',
        description: 'Name for the project',
        required: true,
      },
    ],
    handler: async ({ projectType, projectName }) => {
      if (!workspaceId) {
        throw new Error('No active workspace');
      }

      const response = await fetch('/api/devenv/workspace/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, projectType, projectName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scaffold project');
      }

      onWorkspaceUpdate?.();
      return `✅ Created ${projectType} project: ${projectName}`;
    },
  });

  if (!workspaceId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-[var(--text-muted)] mb-2">No active workspace</p>
          <p className="text-sm text-[var(--text-muted)]">Launch a sandbox to start building with AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <CopilotChat
        instructions="You are an expert full-stack developer assistant. Help users build applications by creating files, running commands, installing packages, and deploying projects. Always provide clear explanations of what you're doing."
        labels={{
          title: "Dev Assistant",
          initial: "Hi! I can help you build apps. Tell me what you want to create!"
        }}
      />
    </div>
  );
}
