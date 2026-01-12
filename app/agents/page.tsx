'use client';

import { useState } from 'react';
import { Upload, TrendingUp, Eye, Send, Loader2, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  type: 'vision' | 'analytics' | 'general';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'vision-analyst',
      name: 'Vision Analyst',
      systemPrompt: 'You are a Grok-powered vision analyst. Analyze images in detail, identify objects, read text, detect patterns, and provide insights. Be thorough and specific.',
      type: 'vision'
    },
    {
      id: 'data-scientist',
      name: 'Data Scientist',
      systemPrompt: 'You are a Grok-powered data scientist. Analyze data, identify trends, perform calculations, and provide actionable insights. Be precise with numbers and statistical analysis.',
      type: 'analytics'
    },
    {
      id: 'business-analyst',
      name: 'Business Analyst',
      systemPrompt: 'You are a Grok-powered business analyst. Analyze business scenarios, identify opportunities, assess risks, and provide strategic recommendations.',
      type: 'general'
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', systemPrompt: '', type: 'general' as Agent['type'] });
  const [provider] = useState<'xai'>('xai');
  const [model, setModel] = useState('grok-4-1-fast');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !uploadedImage) || loading || !selectedAgent) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      image: uploadedImage || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentImage = uploadedImage;
    setUploadedImage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          messages: [
            { role: 'system', content: selectedAgent.systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentImage ? `[Image attached] ${input}` : input }
          ],
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

  const createAgent = () => {
    if (!newAgent.name.trim() || !newAgent.systemPrompt.trim()) return;

    const agent: Agent = {
      id: newAgent.name.toLowerCase().replace(/\s+/g, '-'),
      name: newAgent.name,
      systemPrompt: newAgent.systemPrompt,
      type: newAgent.type
    };

    setAgents(prev => [...prev, agent]);
    setNewAgent({ name: '', systemPrompt: '', type: 'general' });
    setShowCreateAgent(false);
    setSelectedAgent(agent);
  };

  const deleteAgent = (agentId: string) => {
    if (agents.length <= 1) return;
    setAgents(prev => prev.filter(a => a.id !== agentId));
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(agents[0]);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4"><span className="text-white">Grok</span><span className="text-[var(--primary)]"> Agents</span></h1>
          <p className="text-secondary dark:text-slate-400">
            Specialized Grok AI agents with vision, analytics, and custom capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agents Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Your Agents</h2>
              <button
                onClick={() => setShowCreateAgent(!showCreateAgent)}
                className="p-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white transition-all clip-corners premium-button"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Create Agent Form */}
            {showCreateAgent && (
              <div className="glass card-border p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Agent name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-white text-sm placeholder:text-gray-500"
                />
                <select
                  value={newAgent.type}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, type: e.target.value as Agent['type'] }))}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-white text-sm placeholder:text-gray-500"
                >
                  <option value="general">General</option>
                  <option value="vision">Vision</option>
                  <option value="analytics">Analytics</option>
                </select>
                <textarea
                  placeholder="System prompt..."
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-white text-sm placeholder:text-gray-500 resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={createAgent}
                    className="flex-1 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm transition-all clip-corners premium-button"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateAgent(false)}
                    className="px-3 py-2 glass card-border text-secondary text-sm clip-corners premium-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Agent List */}
            <div className="space-y-2">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`p-4 glass card-border cursor-pointer transition-all hover:card-border-hover ${
                    selectedAgent?.id === agent.id ? 'bg-[var(--primary)]/10 border-[var(--primary)]' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {agent.type === 'vision' && <Eye className="w-4 h-4 text-[var(--primary)]" />}
                        {agent.type === 'analytics' && <TrendingUp className="w-4 h-4 text-[var(--primary)]" />}
                        <h3 className="font-medium text-sm">{agent.name}</h3>
                      </div>
                      <p className="text-xs text-secondary line-clamp-2">{agent.systemPrompt}</p>
                    </div>
                    {agents.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAgent(agent.id);
                        }}
                        className="p-1 text-secondary hover:text-red-500 transition-colors clip-corners premium-button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 space-y-4">
            {selectedAgent && (
              <>
                {/* Agent Info */}
                <div className="glass card-border p-4">
                  <h2 className="font-bold text-xl mb-2">{selectedAgent.name}</h2>
                  <p className="text-sm text-secondary mb-3">{selectedAgent.systemPrompt}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 glass text-xs">Powered by Grok</span>
                    {selectedAgent.type === 'vision' && (
                      <span className="px-3 py-1 glass text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Vision Enabled
                      </span>
                    )}
                    {selectedAgent.type === 'analytics' && (
                      <span className="px-3 py-1 glass text-xs flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Analytics Mode
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="glass card-border p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-secondary">
                      <p>Start a conversation with {selectedAgent.name}</p>
                      {selectedAgent.type === 'vision' && (
                        <p className="text-sm mt-2">Upload images for visual analysis</p>
                      )}
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
                          {msg.role === 'user' ? 'You' : selectedAgent.name}
                        </div>
                        {msg.image && (
                          <div className="mb-3">
                            <img src={msg.image} alt="Uploaded" className="max-w-[200px] h-auto" />
                          </div>
                        )}
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex items-center gap-2 text-secondary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Agent is thinking...</span>
                    </div>
                  )}
                </div>

                {/* Model Selector */}
                <div className="flex items-center gap-4 mb-4 px-4 py-3 glass card-border">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-secondary">Grok Model:</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-white rounded"
                    >
                      <option value="grok-4-1-fast">Grok 4.1 Fast (Latest) ⚡</option>
                      <option value="grok-4-1-fast-reasoning">Grok 4.1 Fast Reasoning 🧠</option>
                      <option value="grok-4-1-fast-non-reasoning">Grok 4.1 Fast (No Reasoning) 💨</option>
                      <option value="grok-2-latest">Grok 2 (Latest)</option>
                      <option value="grok-2-1212">Grok 2 (Dec 2024)</option>
                    </select>
                  </div>
                </div>

                {/* Input Area */}
                <div className="space-y-3">
                  {uploadedImage && (
                    <div className="glass card-border p-3 flex items-center gap-3">
                      <img src={uploadedImage} alt="Upload preview" className="h-16 w-16 object-cover" />
                      <p className="text-sm text-secondary flex-1">Image ready for analysis</p>
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="text-secondary hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {selectedAgent.type === 'vision' && (
                      <label className="px-4 py-3 glass card-border hover:card-border-hover cursor-pointer transition-all flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Message agent..."
                      className="flex-1 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-white placeholder:text-gray-500 resize-none"
                      rows={2}
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || (!input.trim() && !uploadedImage)}
                      className="px-6 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 clip-corners"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
