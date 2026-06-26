'use client'

import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatThread {
  id: string
  title: string
  updatedAt: number
  messages: ChatMessage[]
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
  openingLine,
  calibrationPoints,
  seedPrompts,
}: {
  slug: string
  artistName: string
  openingLine?: string
  calibrationPoints?: string[]
  seedPrompts?: string[]
}) {
  const firstName = artistName.split(' ')[0]
  const replaceArtistTokens = (text: string) => text.replaceAll('{firstName}', firstName)
  const opening =
    openingLine
      ? replaceArtistTokens(openingLine)
      : `Talk to me like we are in the room. Send the ugly premise, half hook, one line, or the problem. I am not ${firstName}. I am a craft sparring partner calibrated on the public profile. I will ask questions, push back, and help you find the real scene.`
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: opening,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeThreadId, setActiveThreadId] = useState(() => `thread-${Date.now()}`)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const storageKey = `rhyme-protocol:challenge-chat:${slug}`

  function focusInput() {
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  function openingMessage(): ChatMessage {
    return {
      role: 'assistant',
      content: opening,
    }
  }

  function getThreadTitle(threadMessages: ChatMessage[]) {
    const firstUserMessage = threadMessages.find((message) => message.role === 'user')?.content
    if (!firstUserMessage) return 'NEW CHAT'
    return firstUserMessage.replace(/\s+/g, ' ').slice(0, 48)
  }

  function cleanThreads(nextThreads: ChatThread[]) {
    return nextThreads
      .filter((thread) => thread.messages.some((message) => message.role === 'user'))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (!saved) {
        setStorageReady(true)
        focusInput()
        return
      }
      const parsed = JSON.parse(saved) as { activeThreadId?: string; threads?: ChatThread[] }
      const savedThreads = Array.isArray(parsed.threads) ? cleanThreads(parsed.threads) : []
      const savedActiveThread = savedThreads.find((thread) => thread.id === parsed.activeThreadId)
      if (savedThreads.length > 0) {
        const activeThread = savedActiveThread || savedThreads[0]
        setThreads(savedThreads)
        setActiveThreadId(activeThread.id)
        setMessages(activeThread.messages)
      }
    } catch {
      window.localStorage.removeItem(storageKey)
    } finally {
      setStorageReady(true)
      focusInput()
    }
  }, [storageKey])

  useEffect(() => {
    if (!storageReady) return

    const now = Date.now()
    setThreads((currentThreads) => {
      const nextThreads = cleanThreads([
        {
          id: activeThreadId,
          title: getThreadTitle(messages),
          updatedAt: now,
          messages,
        },
        ...currentThreads.filter((thread) => thread.id !== activeThreadId),
      ])

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ activeThreadId, threads: nextThreads })
      )

      return nextThreads
    })
  }, [activeThreadId, messages, storageKey, storageReady])

  useEffect(() => {
    if (!busy) focusInput()
  }, [busy, activeThreadId])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setError(null)
    focusInput()
    try {
      const res = await fetch('/api/challenge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`)
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Chat failed.')
      setMessages(next)
    } finally {
      setBusy(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function startNewChat() {
    setActiveThreadId(`thread-${Date.now()}`)
    setMessages([openingMessage()])
    setError(null)
    setInput('')
    focusInput()
  }

  function loadThread(thread: ChatThread) {
    if (busy) return
    setActiveThreadId(thread.id)
    setMessages(thread.messages)
    setError(null)
    setInput('')
    focusInput()
  }

  const prompts = (seedPrompts || [
    'I have an idea but no angle.',
    'Talk me through this hook.',
    'Ask me the question that gets the verse unstuck.',
    "I need this closer to {firstName}'s craft without cosplay.",
  ]).map(replaceArtistTokens)

  const points = calibrationPoints || [
    'pocket',
    'punchline discipline',
    'internal rhyme',
    'specific scenes',
    'no cosplay',
  ]

  return (
    <div className="border border-border-subtle bg-surface">
      <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-border-subtle">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-accent">
            SPAR_WITH_THE_STYLE · LIVE ROOM
          </div>
          <div className="mt-1 max-w-2xl text-xs text-text-secondary leading-relaxed">
            Chat through angles, lines, hooks, and second takes. {firstName}-calibrated craft.
            Still not the artist, not a clone, not a ghostwriter.
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right text-[10px] font-mono uppercase tracking-widest text-muted sm:block">
            {threads.length > 0 ? `${threads.length} saved` : 'auto-saves'}
          </div>
          <button
            onClick={startNewChat}
            disabled={busy || messages.length <= 1}
            className="text-[10px] font-mono tracking-widest text-text-secondary hover:text-text transition-colors disabled:opacity-30"
          >
            NEW CHAT
          </button>
        </div>
      </div>

      <div className="border-b border-border-subtle px-4 py-3">
        <div className="mb-2 text-[10px] font-mono tracking-widest text-muted">
          CALIBRATED FOR
        </div>
        <div className="flex flex-wrap gap-2">
          {points.map((point) => (
            <span
              key={point}
              className="border border-border-subtle bg-background/40 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-text-secondary"
            >
              {point}
            </span>
          ))}
        </div>
      </div>

      {threads.length > 0 && (
        <div className="border-b border-border-subtle px-4 py-3">
          <div className="mb-2 text-[10px] font-mono tracking-widest text-muted">
            RECENT CHATS
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => loadThread(thread)}
                disabled={busy}
                className={`shrink-0 border px-2 py-1 text-left text-[10px] font-mono uppercase tracking-widest transition-colors disabled:opacity-40 ${
                  thread.id === activeThreadId
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-border-subtle text-text-secondary hover:text-accent'
                }`}
              >
                {thread.title}
              </button>
            ))}
          </div>
        </div>
      )}

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
              LISTENING BACK…
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
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => {
                setInput(p)
                focusInput()
              }}
              className="text-[10px] font-mono tracking-widest text-text-secondary hover:text-accent border border-border-subtle px-2 py-1 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border-subtle p-3 flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            maxLength={1500}
            placeholder="Talk through an angle, paste bars, or ask for the next move."
            className="w-full bg-transparent text-sm text-text font-mono resize-none focus:outline-none px-2 py-1 placeholder:text-muted"
          />
          <div className="px-2 text-[10px] font-mono tracking-widest text-muted">
            ENTER TO SEND · SHIFT+ENTER FOR BARS
          </div>
        </div>
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
