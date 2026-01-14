'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { CostNotice } from '@/components/CostNotice';
import { saveGeneration } from '@/lib/firestore-generations';

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
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<CoverStyle>('album-cover');
  const [mood, setMood] = useState<CoverMood>('vibrant');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editCount, setEditCount] = useState(0);
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
      setEditCount(0);

      // Save to user's gallery if signed in
      if (user) {
        try {
          console.log('Saving to gallery for user:', user.uid);
          const saved = await saveGeneration(user.uid, {
            type: 'cover_art',
            imageUrl: data.imageUrl,
            prompt,
            metadata: { style, mood, aspectRatio, revisedPrompt: data.revisedPrompt },
          });
          console.log('Saved to gallery:', saved.id);
        } catch (saveErr: any) {
          console.error('Failed to save to gallery:', saveErr?.message || saveErr);
          // Show error to user
          setError(`Image generated but failed to save: ${saveErr?.message || 'Unknown error'}`);
        }
      } else {
        console.log('User not signed in, skipping gallery save');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.imageUrl) return;
    
    try {
      let blob: Blob;
      
      if (result.imageUrl.startsWith('data:')) {
        const response = await fetch(result.imageUrl);
        blob = await response.blob();
      } else {
        const response = await fetch(result.imageUrl);
        blob = await response.blob();
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-art-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download image');
    }
  };

  const MAX_EDITS = 3;

  const handleEdit = async () => {
    if (!result?.imageUrl || !editPrompt.trim() || editCount >= MAX_EDITS) return;
    
    setIsEditing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          imageData: result.imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit');
      }

      if (data.editedImage) {
        setResult({
          imageUrl: data.editedImage,
          revisedPrompt: data.result,
        });
        setEditPrompt('');
        setEditCount(prev => prev + 1);
      } else {
        throw new Error('No edited image returned');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <AuthGuard>
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

        <div className="mb-8">
          <CostNotice type="cover-art" />
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
              {isGenerating ? 'Creating artwork...' : 'Generate Cover Art'}
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
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-20">
                    <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Your cover art will appear here</p>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="block w-full py-3 bg-accent text-bg font-medium text-center hover:bg-accent/90 transition-colors"
                >
                  Download PNG
                </button>
                
                <div className="border border-border-subtle p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-text">
                      Edit with AI
                    </label>
                    <span className={`text-xs font-mono ${editCount >= MAX_EDITS ? 'text-red-400' : 'text-muted'}`}>
                      {editCount}/{MAX_EDITS} edits
                    </span>
                  </div>
                  {editCount >= MAX_EDITS ? (
                    <p className="text-sm text-muted py-2">
                      Edit limit reached. Generate a new image to continue editing.
                    </p>
                  ) : (
                    <>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Make the colors more vibrant, add gold accents, change background to night sky..."
                        className="w-full h-20 px-3 py-2 bg-surface border border-border-subtle text-text placeholder:text-muted text-sm resize-none focus:outline-none focus:border-accent transition-colors"
                      />
                      <button
                        onClick={handleEdit}
                        disabled={isEditing || !editPrompt.trim()}
                        className="w-full py-2 border border-accent text-accent text-sm hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEditing ? 'Editing...' : 'Apply Edit'}
                      </button>
                    </>
                  )}
                </div>

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
    </AuthGuard>
  );
}
