"use client";

import React, { useState } from 'react';
import AppCard from '@/components/apps/AppCard';
import ChatInterface from '@/components/apps/ChatInterface';
import NanoBanana from '@/components/apps/NanoBanana';

export default function AppsPage() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ffd700]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d4a017]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center relative">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">JoePro</span>
            <span className="text-transparent" style={{ WebkitTextStroke: '1px #ffd700', textShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }}> Apps</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
            Professional AI tools and development interfaces.
          </p>
        </header>

        {/* Featured Apps / Active App View */}
        {activeApp ? (
          <div className="mb-16 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {activeApp === 'chat' ? 'Grok 4.1-fast' : 'Nano Banana'}
              </h2>
              <button
                onClick={() => setActiveApp(null)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                Close App
              </button>
            </div>

            <div className="bg-cyber-dark/50 backdrop-blur-xl rounded-2xl p-1 border border-white/10 shadow-2xl">
              {activeApp === 'chat' && <ChatInterface />}
              {activeApp === 'banana' && <NanoBanana />}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AppCard
              title="GROK 4.1-FAST"
              description="Advanced conversational AI with attitude. Real-time processing and neural optimization."
              status="ONLINE"
              onClick={() => setActiveApp('chat')}
            />

            <AppCard
              title="NANO BANANA"
              description="AI-powered image editing with natural language. Upload photos, describe edits, get results instantly."
              status="ONLINE"
              onClick={() => setActiveApp('banana')}
            />

            <AppCard
              title="VIDEO GENERATOR"
              description="Create AI videos from text prompts. GPT-Image-1 + Luma Ray continuous flow technology."
              status="BETA"
              href="/apps/video-gen"
            />

            <AppCard
              title="PROMPT RACER"
              description="Race against AI to craft the perfect prompt. Test your prompt engineering skills."
              status="ONLINE"
              href="https://prompt-racer.joepro.ai"
            />

            <AppCard
              title="SYSTEM MONITOR"
              description="Real-time metrics of the JoePro network. Coming Soon."
              status="OFFLINE"
              href="#"
            />

            <AppCard
              title="NEURAL PAINTER"
              description="Generate art using pure thought waves. Coming Soon."
              status="COMING SOON"
              href="#"
            />
          </div>
        )}
      </div>
    </main>
  );
}