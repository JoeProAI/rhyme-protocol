'use client'

import { useState } from 'react'

// All content types organized by category
const CONTENT_CATEGORIES = {
  create: {
    label: 'Create',
    icon: '🚀',
    items: [
      { value: 'presentation', label: 'Presentation', icon: '📊', model: 'Gamma', time: '~30s', color: 'from-purple-500 to-pink-500' },
      { value: 'document', label: 'Document', icon: '📄', model: 'Gamma', time: '~30s', color: 'from-blue-500 to-cyan-500' },
      { value: 'blog_post', label: 'Blog Post', icon: '📝', model: 'Claude', time: '~15s', color: 'from-orange-500 to-yellow-500' },
      { value: 'research_report', label: 'Research', icon: '🔬', model: 'Opus', time: '~60s', color: 'from-green-500 to-emerald-500' },
    ],
  },
  social: {
    label: 'Social',
    icon: '📱',
    items: [
      { value: 'x_thread', label: 'X Thread', icon: '𝕏', model: 'Grok', time: '~10s', color: 'from-gray-700 to-gray-900' },
      { value: 'social_post', label: 'Multi-Post', icon: '📱', model: 'Claude', time: '~15s', color: 'from-pink-500 to-rose-500' },
      { value: 'content_ideas', label: 'Ideas', icon: '💡', model: 'Grok', time: '~10s', color: 'from-yellow-500 to-orange-500' },
      { value: 'trend_analysis', label: 'Trends', icon: '📈', model: 'Grok', time: '~20s', color: 'from-red-500 to-pink-500' },
    ],
  },
  visual: {
    label: 'Visual',
    icon: '🎨',
    items: [
      { value: 'image', label: 'Image+Text', icon: '🖼️', model: 'Ideogram', time: '~20s', color: 'from-violet-500 to-purple-500' },
      { value: 'dalle_image', label: 'HD Art', icon: '🎨', model: 'DALL-E', time: '~30s', color: 'from-emerald-500 to-teal-500' },
      { value: 'video', label: 'Video', icon: '🎬', model: 'Luma', time: '~3min', color: 'from-blue-600 to-indigo-600' },
    ],
  },
  business: {
    label: 'Business',
    icon: '💼',
    items: [
      { value: 'email', label: 'Email', icon: '✉️', model: 'GPT-4o', time: '~10s', color: 'from-cyan-500 to-blue-500' },
      { value: 'places_search', label: 'Places', icon: '📍', model: 'Google', time: '~5s', color: 'from-green-600 to-lime-500' },
      { value: 'seo_blog', label: 'SEO Blog', icon: '🔍', model: 'SEOPro', time: '~5min', color: 'from-indigo-500 to-purple-500' },
    ],
  },
};

interface ContentItem {
  value: string;
  label: string;
  icon: string;
  model: string;
  time: string;
  color: string;
}

export default function ContentFactoryPage() {
  const [selectedType, setSelectedType] = useState<ContentItem>(CONTENT_CATEGORIES.create.items[0]);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; content: unknown; url?: string } | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'social' | 'visual' | 'business'>('create');

  const generate = async () => {
    if (!topic) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/content-factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType.value,
          topic,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    }

    setLoading(false);
  };

  const allItems = Object.values(CONTENT_CATEGORIES).flatMap(cat => cat.items);
  const getCurrentCategoryItems = () => CONTENT_CATEGORIES[activeTab].items;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              JoePro Content Factory
            </h1>
            <p className="text-sm text-gray-400">Powered by 10+ AI models</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">All Systems Active</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(CONTENT_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === key
                  ? 'bg-white text-gray-900 shadow-lg shadow-white/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Type Grid */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-3">
              {getCurrentCategoryItems().map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSelectedType(item)}
                  className={`relative p-4 rounded-2xl border transition-all overflow-hidden group ${
                    selectedType.value === item.value
                      ? 'border-white/30 bg-white/10 scale-105'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-102'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative">
                    <span className="text-3xl">{item.icon}</span>
                    <p className="font-semibold text-white mt-2">{item.label}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{item.model}</span>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Type Info */}
            <div className={`mt-6 p-4 rounded-2xl bg-gradient-to-br ${selectedType.color} bg-opacity-20`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedType.icon}</span>
                <div>
                  <h3 className="font-bold text-xl text-white">{selectedType.label}</h3>
                  <p className="text-sm text-white/70">Powered by {selectedType.model}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">What do you want to create?</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe your content...\n\nExamples:\n• A presentation about AI productivity tools\n• Viral X thread about startup growth\n• Blog post on machine learning trends"
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl min-h-[200px] text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Keywords (optional)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="JoePro, AI, automation..."
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={loading || !topic}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r ${selectedType.color} ${
                  loading || !topic ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating with {selectedType.model}...
                  </span>
                ) : (
                  `Generate ${selectedType.label}`
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                'JoePro AI overview',
                'Top 10 AI tools 2025',
                'How to use Claude API',
                'Viral content strategy',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setTopic(prompt)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full min-h-[500px] flex flex-col">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Output
              </h3>

              {result ? (
                <div className="flex-1 overflow-auto">
                  {/* Show URL if available */}
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-400 transition-all"
                    >
                      <p className="text-green-400 font-medium">View Generated Content</p>
                      <p className="text-sm text-gray-400 truncate">{result.url}</p>
                    </a>
                  )}

                  {/* Content Preview */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
                      {typeof result.content === 'string' 
                        ? result.content 
                        : JSON.stringify(result.content, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <span className="text-5xl mb-4 block">{selectedType.icon}</span>
                    <p>Your {selectedType.label.toLowerCase()} will appear here</p>
                    <p className="text-sm mt-2">Estimated time: {selectedType.time}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Models Status */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { name: 'Gamma', status: 'active', icon: '📊' },
            { name: 'Claude', status: 'active', icon: '🧠' },
            { name: 'Grok', status: 'active', icon: '𝕏' },
            { name: 'GPT-4o', status: 'active', icon: '🤖' },
            { name: 'DALL-E', status: 'active', icon: '🎨' },
            { name: 'Ideogram', status: 'active', icon: '🖼️' },
            { name: 'Luma', status: 'active', icon: '🎬' },
            { name: 'SEOPro', status: 'active', icon: '🔍' },
          ].map((model) => (
            <div
              key={model.name}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-center"
            >
              <span className="text-xl">{model.icon}</span>
              <p className="text-xs text-gray-400 mt-1">{model.name}</p>
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-1" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
