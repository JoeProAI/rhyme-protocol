'use client'

import { useState } from 'react'

export default function SEOProAIAdmin() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [keywords, setKeywords] = useState('JoePro AI platform, JoeProAI, best AI tools 2025')

  const generateBlog = async () => {
    setLoading(true)
    setResult('Generating...')
    try {
      const res = await fetch('/api/seoproai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          keywords: keywords.split(',').map(k => k.trim()),
        }),
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setResult(`Error: ${err}`)
    }
    setLoading(false)
  }

  const checkStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/seoproai/status?start_date=${date}&end_date=${date}`)
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setResult(`Error: ${err}`)
    }
    setLoading(false)
  }

  const fetchDraft = async (blogId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/seoproai/draft/${blogId}`)
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setResult(`Error: ${err}`)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[var(--primary)]">SEOPro AI Admin</h1>
      
      <div className="space-y-6">
        {/* Generate Blog */}
        <section className="glass card-border p-6">
          <h2 className="text-xl font-bold mb-4">Generate Blog</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded"
              />
            </div>
            <button
              onClick={generateBlog}
              disabled={loading}
              className="px-4 py-2 bg-[var(--primary)] rounded hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Working...' : '🚀 Generate Blog'}
            </button>
          </div>
        </section>

        {/* Check Status */}
        <section className="glass card-border p-6">
          <h2 className="text-xl font-bold mb-4">Check Status</h2>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-4 py-2 bg-green-600 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Checking...' : '📊 Check Status for ' + date}
          </button>
        </section>

        {/* Fetch Draft */}
        <section className="glass card-border p-6">
          <h2 className="text-xl font-bold mb-4">Fetch Draft by ID</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Blog ID"
              id="blogId"
              className="flex-1 p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded"
            />
            <button
              onClick={() => {
                const input = document.getElementById('blogId') as HTMLInputElement
                if (input.value) fetchDraft(input.value)
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded hover:opacity-90 disabled:opacity-50"
            >
              Fetch
            </button>
          </div>
        </section>

        {/* Result */}
        <section className="glass card-border p-6">
          <h2 className="text-xl font-bold mb-4">Result</h2>
          <pre className="bg-black/50 p-4 rounded overflow-auto max-h-96 text-sm">
            {result || 'No results yet. Click a button above.'}
          </pre>
        </section>
      </div>
    </main>
  )
}
