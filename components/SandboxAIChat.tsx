'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Code, Bug, HelpCircle, Loader2, Copy, Check } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SandboxAIChatProps {
  language?: string
  onCodeGenerated?: (code: string) => void
}

export default function SandboxAIChat({ language = 'javascript', onCodeGenerated }: SandboxAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI coding assistant. I can help you:\n\n• **Generate code** - Tell me what you want to build\n• **Explain code** - Paste code and ask me to explain it\n• **Fix errors** - Share your error message and I'll help debug\n\nWhat would you like to build today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (action: 'generate' | 'explain' | 'fix' | 'chat' = 'chat') => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/sandbox/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt: input,
          language,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.error ? `Error: ${data.error}` : data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // If code was generated, extract and notify
      if (data.response && onCodeGenerated) {
        const codeMatch = data.response.match(/```[\w]*\n([\s\S]*?)```/)
        if (codeMatch) {
          onCodeGenerated(codeMatch[1])
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response'
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    // Extract code from markdown code blocks
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/)
    const codeToCopy = codeMatch ? codeMatch[1] : text
    
    await navigator.clipboard.writeText(codeToCopy)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const quickActions = [
    { icon: Code, label: 'Generate', action: 'generate' as const, placeholder: 'Create a function that...' },
    { icon: HelpCircle, label: 'Explain', action: 'explain' as const, placeholder: 'Explain this code...' },
    { icon: Bug, label: 'Fix Error', action: 'fix' as const, placeholder: 'Fix this error...' },
  ]

  return (
    <div className="flex flex-col h-full bg-[var(--card-bg)] rounded-lg border border-[var(--border)]">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
        <Sparkles className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="font-semibold text-white">AI Assistant</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-black font-medium">
          {language}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-3 border-b border-[var(--border)]">
        {quickActions.map(({ icon: Icon, label, action, placeholder }) => (
          <button
            key={action}
            onClick={() => {
              setInput(placeholder)
              inputRef.current?.focus()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full 
                       bg-[var(--background)] hover:bg-[var(--border)] text-[var(--text-muted)] 
                       hover:text-white transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[var(--primary)] text-black'
                  : 'bg-[var(--background)] text-[var(--foreground)]'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                {message.content.split('```').map((part, index) => {
                  if (index % 2 === 1) {
                    // Code block
                    const lines = part.split('\n')
                    const lang = lines[0] || language
                    const code = lines.slice(1).join('\n')
                    return (
                      <div key={index} className="relative my-2">
                        <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-1 rounded-t text-xs text-[var(--text-muted)]">
                          <span>{lang}</span>
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-[#0d0d0d] p-3 rounded-b overflow-x-auto text-xs">
                          <code>{code}</code>
                        </pre>
                      </div>
                    )
                  }
                  // Regular text - render with basic markdown
                  return (
                    <span key={index}>
                      {part.split('**').map((segment, i) =>
                        i % 2 === 1 ? <strong key={i}>{segment}</strong> : segment
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--background)] rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
              <span className="text-sm text-[var(--text-muted)]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about coding..."
            rows={2}
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 
                       text-sm text-white placeholder-[var(--text-muted)] resize-none
                       focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-[var(--primary)] text-black font-semibold rounded-lg
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Shift+Enter for new line • Enter to send
        </p>
      </div>
    </div>
  )
}
