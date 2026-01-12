'use client';

import { useState } from 'react';
import Link from 'next/link';

type CoverStyle = 'album-cover' | 'single-cover' | 'mixtape' | 'ep';
type CoverMood = 'dark' | 'vibrant' | 'minimal' | 'luxury' | 'street' | 'abstract';
type AspectRatio = '1:1' | '16:9' | '9:16';

const STYLES: { value: CoverStyle; label: string; desc: string }[] = [
  { value: 'album-cover', label: 'Album', desc: 'Full project artwork' },
  { value: 'single-cover', label: 'Single', desc: 'Eye-catching single art' },
  { value: 'mixtape', label: 'Mixtape', desc: 'Underground aesthetic' },
  { value: 'ep', label: 'EP', desc: 'Artistic and cohesive' },
];

const MOODS: { value: CoverMood; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'street', label: 'Street' },
  { value: 'abstract', label: 'Abstract' },
];

export default function CoverArtStudio() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<CoverStyle>('album-cover');
  const [mood, setMood] = useState<CoverMood>('vibrant');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ imageUrl: string; revisedPrompt?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/studio/cover-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, mood, aspectRatio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setResult({
        imageUrl: data.imageUrl,
        revisedPrompt: data.revisedPrompt,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-text-secondary hover:text-accent transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-display tracking-tight mb-2">
            <span className="text-text">COVER</span>
            <span className="text-accent">_ART</span>
          </h1>
          <p className="text-text-secondary">
            Generate professional album covers and artwork with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Describe your vision
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A lone figure standing on a rooftop overlooking a neon-lit city at night, silhouette against purple sky..."
                className="w-full h-32 px-4 py-3 bg-surface border border-border-subtle rounded-none text-text placeholder:text-muted resize-none focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`px-4 py-3 border text-left transition-all ${
                      style === s.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-muted">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`px-4 py-2 border transition-all ${
                      mood === m.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {(['1:1', '16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-2 border transition-all ${
                      aspectRatio === ratio
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-accent text-bg font-medium text-lg transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Cover Art'}
            </button>

            {error && (
              <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text">
              Preview
            </label>
            <div 
              className={`border border-border-subtle bg-surface flex items-center justify-center overflow-hidden ${
                aspectRatio === '1:1' ? 'aspect-square' :
                aspectRatio === '16:9' ? 'aspect-video' :
                'aspect-[9/16] max-h-[600px]'
              }`}
            >
              {isGenerating ? (
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-secondary">Creating your artwork...</p>
                </div>
              ) : result ? (
                <img 
                  src={result.imageUrl} 
                  alt="Generated cover art"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted p-8">
                  <div className="text-6xl mb-4 opacity-20">🎨</div>
                  <p>Your cover art will appear here</p>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-2">
                <a
                  href={result.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 border border-accent text-accent text-center hover:bg-accent/10 transition-colors"
                >
                  Download Full Resolution
                </a>
                {result.revisedPrompt && (
                  <details className="text-sm">
                    <summary className="text-text-secondary cursor-pointer hover:text-text">
                      View AI interpretation
                    </summary>
                    <p className="mt-2 text-muted p-3 bg-surface border border-border-subtle">
                      {result.revisedPrompt}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
