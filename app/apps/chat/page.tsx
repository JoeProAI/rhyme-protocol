'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider] = useState<'xai'>('xai');
  const [model, setModel] = useState('grok-4-1-fast');

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          messages: [...messages, userMessage],
          stream: false,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Grok AI Chat</h1>
          <p className="text-secondary dark:text-slate-400">
            Chat with xAI's latest Grok models
          </p>
        </div>

        {/* Model Selection */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-4 py-2 glass card-border bg-card-bg text-foreground"
          >
            <option value="grok-4-1-fast">Grok 4.1 Fast (Latest) ⚡</option>
            <option value="grok-4-1-fast-reasoning">Grok 4.1 Fast Reasoning 🧠</option>
            <option value="grok-4-1-fast-non-reasoning">Grok 4.1 Fast (No Reasoning) 💨</option>
            <option value="grok-2-latest">Grok 2 (Latest)</option>
            <option value="grok-2-1212">Grok 2 (Dec 2024)</option>
          </select>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="px-4 py-2 text-secondary hover:text-foreground transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="mb-6 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-secondary">
              <p>Start a conversation with AI</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 glass card-border ${
                  msg.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
                }`}
              >
                <div className="text-xs text-secondary mb-2">
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 text-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 glass card-border bg-card-bg text-foreground resize-none"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 bg-primary hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 clip-corners"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
