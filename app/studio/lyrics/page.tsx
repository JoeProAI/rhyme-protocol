'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { CostNotice } from '@/components/CostNotice';

type LyricStyle = 'trap' | 'conscious' | 'oldschool' | 'storytelling' | 'aggressive' | 'melodic';
type AIModel = 'gpt' | 'grok' | 'both';
type Action = 'generate' | 'continue' | 'rewrite' | 'rhyme-suggestions';

const STYLES: { value: LyricStyle; label: string; desc: string }[] = [
  { value: 'trap', label: 'Trap', desc: 'Hard beats, flex bars' },
  { value: 'conscious', label: 'Conscious', desc: 'Deep meaning, social commentary' },
  { value: 'oldschool', label: 'Old School', desc: 'Boom bap, classic flow' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Vivid narratives' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Battle rap energy' },
  { value: 'melodic', label: 'Melodic', desc: 'Singable hooks, emotion' },
];

const AI_MODELS: { value: AIModel; label: string; desc: string }[] = [
  { value: 'gpt', label: 'The Technician', desc: 'Complex rhyme schemes' },
  { value: 'grok', label: 'The Provocateur', desc: 'Bold and edgy' },
  { value: 'both', label: 'Both', desc: 'Compare outputs side by side' },
];

interface LyricResult {
  source: string;
  name: string;
  lyrics: string;
}

export default function LyricLab() {
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState<LyricStyle>('trap');
  const [model, setModel] = useState<AIModel>('both');
  const [bars, setBars] = useState(16);
  const [action, setAction] = useState<Action>('generate');
  const [existingLyrics, setExistingLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<LyricResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState('');

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/studio/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme, 
          style, 
          model, 
          bars,
          action,
          existingLyrics: action !== 'generate' ? existingLyrics : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const useInEditor = (lyrics: string) => {
    setSelectedLyrics(lyrics);
    setExistingLyrics(lyrics);
  };

  return (
    <AuthGuard>
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-text-secondary hover:text-accent transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-display tracking-tight mb-2">
            <span className="text-text">LYRIC</span>
            <span className="text-accent">_LAB</span>
          </h1>
          <p className="text-text-secondary">
            AI-powered lyric writing assistant
          </p>
        </div>

        <div className="mb-8">
          <CostNotice type="lyrics" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Theme Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Theme / Topic
              </label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Coming up from nothing, proving doubters wrong, chasing dreams in the city..."
                className="w-full h-24 px-4 py-3 bg-surface border border-border-subtle rounded-none text-text placeholder:text-muted resize-none focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'generate', label: 'Generate New' },
                  { value: 'continue', label: 'Continue' },
                  { value: 'rewrite', label: 'Rewrite' },
                  { value: 'rhyme-suggestions', label: 'Rhyme Help' },
                ].map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAction(a.value as Action)}
                    className={`px-3 py-2 border text-sm transition-all ${
                      action === a.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`px-3 py-2 border text-left text-sm transition-all ${
                      style === s.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-muted truncate">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                AI Writer
              </label>
              <div className="space-y-2">
                {AI_MODELS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setModel(m.value)}
                    className={`w-full px-4 py-3 border text-left transition-all ${
                      model === m.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-muted">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bars */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Bars: {bars}
              </label>
              <input
                type="range"
                min="4"
                max="32"
                step="4"
                value={bars}
                onChange={(e) => setBars(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>4</span>
                <span>16</span>
                <span>32</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !theme.trim()}
              className="w-full py-4 bg-accent text-bg font-medium text-lg transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Writing...' : 'Generate Lyrics'}
            </button>

            {error && (
              <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Existing Lyrics Editor */}
            {(action === 'continue' || action === 'rewrite' || action === 'rhyme-suggestions') && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {action === 'rhyme-suggestions' ? 'Last Line' : 'Existing Lyrics'}
                </label>
                <textarea
                  value={existingLyrics}
                  onChange={(e) => setExistingLyrics(e.target.value)}
                  placeholder={action === 'rhyme-suggestions' 
                    ? "Enter the last line you want rhymes for..."
                    : "Paste your existing lyrics here..."
                  }
                  className="w-full h-32 px-4 py-3 bg-surface border border-border-subtle rounded-none text-text placeholder:text-muted font-mono text-sm resize-none focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}

            {/* AI Results */}
            {isGenerating ? (
              <div className="border border-border-subtle bg-surface p-12 text-center">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">AI is writing...</p>
              </div>
            ) : results.length > 0 ? (
              <div className={`grid gap-6 ${results.length > 1 ? 'md:grid-cols-2' : ''}`}>
                {results.map((result, idx) => (
                  <div key={idx} className="border border-border-subtle bg-surface">
                    <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                      <div>
                        <span className="font-medium text-text">{result.name}</span>
                        <span className="text-muted text-sm ml-2">({result.source.toUpperCase()})</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(result.lyrics)}
                          className="text-xs px-2 py-1 border border-border-subtle text-text-secondary hover:border-accent hover:text-accent transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => useInEditor(result.lyrics)}
                          className="text-xs px-2 py-1 border border-accent text-accent hover:bg-accent/10 transition-colors"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-text leading-relaxed">
                        {result.lyrics}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-border-subtle bg-surface p-12 text-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-20">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-muted">Generated lyrics will appear here</p>
                <p className="text-muted text-sm mt-2">
                  Choose &quot;Both&quot; to compare GPT and Grok side by side
                </p>
              </div>
            )}

            {/* Selected/Working Lyrics */}
            {selectedLyrics && (
              <div className="border border-accent/50 bg-accent/5">
                <div className="px-4 py-3 border-b border-accent/30">
                  <span className="font-medium text-text">Working Draft</span>
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-text leading-relaxed">
                    {selectedLyrics}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
