'use client'

import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * ChallengeChat, conversational sparring partner styled after the artist.
 * Backed by /api/challenge/chat. Free, unlimited (chat_messages tier).
 *
 * Frame is explicit: this is an AI sparring partner, NOT the artist.
 */
export default function ChallengeChat({
  slug,
  artistName,
}: {
  slug: string
  artistName: string
}) {
  const firstName = artistName.split(' ')[0]
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Yo. I'm a sparring partner, not ${firstName}. Trained on his documented style. Drop bars, ask for angles, throw a draft at me. I'll give you real notes, not gold stars.`,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/challenge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`)
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (e: any) {
      setError(e.message || 'Chat failed.')
      setMessages(next) // keep user msg, no assistant reply
    } finally {
      setBusy(false)
      // refocus
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function reset() {
    setMessages([messages[0]]) // keep opening line
    setError(null)
    setInput('')
  }

  const seedPrompts = [
    `What's Cal's pocket actually doing different?`,
    `I'm stuck on the second verse, give me an angle.`,
    `Roast my opening bar honestly.`,
    `What would Cal cut from this draft?`,
  ].map((s) => s.replace('Cal', firstName))

  return (
    <div className="border border-border-subtle bg-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-accent">
            SPARRING PARTNER · {firstName.toUpperCase()}-STYLE
          </div>
          <div className="text-[10px] font-mono tracking-widest text-muted mt-0.5">
            AI COACH · NOT THE ARTIST
          </div>
        </div>
        <button
          onClick={reset}
          disabled={busy || messages.length <= 1}
          className="text-[10px] font-mono tracking-widest text-text-secondary hover:text-text transition-colors disabled:opacity-30"
        >
          RESET
        </button>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[420px] min-h-[260px] overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-accent/10 border border-accent/30 text-text px-3 py-2'
                  : 'text-text-secondary'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="text-xs font-mono tracking-widest text-muted animate-pulse">
              THINKING…
            </div>
          </div>
        )}
        {error && (
          <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/5 p-2">
            {error}
          </div>
        )}
      </div>

      {messages.length <= 1 && !busy && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {seedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-[10px] font-mono tracking-widest text-text-secondary hover:text-accent border border-border-subtle px-2 py-1 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border-subtle p-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          maxLength={1500}
          placeholder={`Ask ${firstName}-style for notes, angles, or a roast.`}
          className="flex-1 bg-transparent text-sm text-text font-mono resize-none focus:outline-none px-2 py-1 placeholder:text-muted"
          disabled={busy}
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="px-4 py-2 border border-accent text-accent text-[10px] font-mono tracking-widest hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SEND →
        </button>
      </div>
    </div>
  )
}
