'use client';

import { useState } from 'react';
import { Rocket, Zap, ExternalLink, Sparkles, Terminal, Loader2, MessageSquare, X } from 'lucide-react';
import { CopilotKit } from '@copilotkit/react-core';
import DevAgentChat from '@/components/DevAgentChat';
import '@copilotkit/react-ui/styles.css';

interface SandboxTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  stack: string;
  language: string;
}

interface LaunchedSandbox {
  id: string;
  url: string;
  template: string;
  createdAt: string;
}

// Development environment templates - each launches a Daytona sandbox
const TEMPLATES: SandboxTemplate[] = [
  {
    id: 'node',
    name: 'Node.js',
    description: 'Node.js 20 + npm/yarn ready',
    icon: '📦',
    stack: 'JavaScript Runtime',
    language: 'javascript',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'TypeScript + Node.js + tsx',
    icon: '🔷',
    stack: 'TypeScript Runtime',
    language: 'typescript',
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python 3.11 + pip',
    icon: '🐍',
    stack: 'Python Runtime',
    language: 'python',
  },
  {
    id: 'react',
    name: 'React',
    description: 'React + Vite + TypeScript',
    icon: '⚛️',
    stack: 'Frontend Framework',
    language: 'typescript',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Next.js 14 + App Router',
    icon: '▲',
    stack: 'Full-Stack Framework',
    language: 'typescript',
  },
  {
    id: 'ai',
    name: 'AI / ML',
    description: 'Python + Data Science libs',
    icon: '🧠',
    stack: 'Machine Learning',
    language: 'python',
  },
];

export default function SandboxLauncher() {
  const [launching, setLaunching] = useState<string | null>(null);
  const [launched, setLaunched] = useState<LaunchedSandbox | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const launchSandbox = async (templateId: string) => {
    setLaunching(templateId);
    setError(null);
    setLaunched(null);
    
    try {
      const response = await fetch('/api/daytona/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId })
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        console.error('API Error:', data);
        return;
      }
      
      if (data.sandbox) {
        setLaunched(data.sandbox);
        // Open the Web Terminal in a new tab
        window.open(data.sandbox.url, '_blank');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Launch failed:', err);
    } finally {
      setLaunching(null);
    }
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="min-h-screen py-20 px-4" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(212, 160, 23, 0.1)', border: '1px solid var(--primary)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Powered by Daytona</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: 'var(--primary)' }}>
            Instant Dev Sandboxes
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
            Launch fully-configured development environments in seconds. 
            <br />
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>No setup. No waiting. Just code.</span>
          </p>

          <div className="flex items-center justify-center gap-8 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span>Instant Launch</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span>Web Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span>Pre-configured Stacks</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-12 rounded-lg p-6" style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgb(220, 38, 38)' }}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400 mb-1">Launch Failed</h3>
                <p className="text-red-300 text-sm mb-3">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Launch Success Message */}
        {launched && (
          <div className="mb-12 rounded-lg p-6" style={{ background: 'rgba(212, 160, 23, 0.1)', border: '1px solid var(--primary)' }}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <Rocket className="w-6 h-6 text-black" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--primary)' }}>
                  Sandbox Launched!
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  Your environment is ready. A new tab should have opened.
                </p>
                <a
                  href={launched.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Sandbox
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-[var(--border)] hover:border-[var(--primary)]"
              style={{ background: 'var(--card-bg)' }}
            >
              {/* Icon */}
              <div className="text-5xl mb-4">{template.icon}</div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold mb-2 text-white">
                {template.name}
              </h3>
              <p className="mb-2 text-[var(--text-muted)]">
                {template.description}
              </p>
              <div className="text-xs mb-6 text-[var(--primary)] font-medium">
                {template.stack}
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => launchSandbox(template.id)}
                  disabled={launching !== null}
                  className="btn-primary flex-1 py-3 font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {launching === template.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Launch
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage(template.language);
                    setShowAIChat(true);
                  }}
                  className="px-4 py-3 border border-[var(--border)] hover:border-[var(--primary)] rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  title="Get AI help for this stack"
                >
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-xl p-8" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--primary)' }}>
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-3xl">
              <div>
                <div className="text-3xl mb-2">1️⃣</div>
                <h4 className="font-semibold mb-1 text-white">Choose Environment</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Pick your stack - Node, Python, React, or more
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">2️⃣</div>
                <h4 className="font-semibold mb-1 text-white">Ask AI to Generate</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Use the AI assistant to write code for you
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">3️⃣</div>
                <h4 className="font-semibold mb-1 text-white">Launch & Run</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Open sandbox and paste your generated code
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Toggle Button */}
      <button
        onClick={() => setShowAIChat(!showAIChat)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          showAIChat 
            ? 'bg-[var(--background)] border border-[var(--border)]' 
            : 'bg-[var(--primary)] hover:scale-110'
        }`}
        title={showAIChat ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {showAIChat ? (
          <X className="w-6 h-6 text-[var(--text-muted)]" />
        ) : (
          <MessageSquare className="w-6 h-6 text-black" />
        )}
      </button>

      {/* AI Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] z-40 transform transition-transform duration-300 ${
          showAIChat ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--background)' }}
      >
        <div className="h-full pt-4 pr-4 pb-4">
          <DevAgentChat 
            workspaceId={launched?.id || null}
            onWorkspaceUpdate={() => {
              console.log('Workspace updated');
            }}
          />
        </div>
      </div>

      {/* Overlay when chat is open on mobile */}
      {showAIChat && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowAIChat(false)}
        />
      )}
      </div>
    </CopilotKit>
  );
}
