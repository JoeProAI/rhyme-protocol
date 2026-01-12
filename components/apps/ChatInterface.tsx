"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Download, Copy, Check, RotateCcw, Settings } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'grok-conversations';
const CURRENT_CONV_KEY = 'grok-current-conversation';

const ChatInterface = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConvId, setCurrentConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Grok 4.1-fast initialized. Systems nominal. Awaiting input.', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [model, setModel] = useState('grok-4-1-fast');
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load conversations from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const convs = JSON.parse(saved) as Conversation[];
            setConversations(convs);
        }
        const currentId = localStorage.getItem(CURRENT_CONV_KEY);
        if (currentId) {
            setCurrentConvId(currentId);
        }
    }, []);

    // Load current conversation messages
    useEffect(() => {
        if (currentConvId) {
            const conv = conversations.find(c => c.id === currentConvId);
            if (conv) {
                setMessages(conv.messages);
            }
        }
    }, [currentConvId, conversations]);

    // Save conversations to localStorage
    const saveConversations = useCallback((convs: Conversation[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
        setConversations(convs);
    }, []);

    // Generate conversation title from first message
    const generateTitle = (content: string) => {
        const words = content.split(' ').slice(0, 5).join(' ');
        return words.length > 30 ? words.substring(0, 30) + '...' : words;
    };

    // Create new conversation
    const createNewConversation = useCallback(() => {
        const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            title: 'New Chat',
            messages: [{ role: 'assistant', content: 'Grok 4.1-fast initialized. Systems nominal. Awaiting input.', timestamp: Date.now() }],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const updated = [newConv, ...conversations];
        saveConversations(updated);
        setCurrentConvId(newConv.id);
        localStorage.setItem(CURRENT_CONV_KEY, newConv.id);
        setMessages(newConv.messages);
    }, [conversations, saveConversations]);

    // Update current conversation
    const updateCurrentConversation = useCallback((newMessages: Message[]) => {
        if (!currentConvId) {
            // Create new conversation if none exists
            const newConv: Conversation = {
                id: `conv-${Date.now()}`,
                title: newMessages.find(m => m.role === 'user')?.content 
                    ? generateTitle(newMessages.find(m => m.role === 'user')!.content)
                    : 'New Chat',
                messages: newMessages,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            const updated = [newConv, ...conversations];
            saveConversations(updated);
            setCurrentConvId(newConv.id);
            localStorage.setItem(CURRENT_CONV_KEY, newConv.id);
        } else {
            const updated = conversations.map(c => 
                c.id === currentConvId 
                    ? { 
                        ...c, 
                        messages: newMessages, 
                        updatedAt: Date.now(),
                        title: c.title === 'New Chat' && newMessages.find(m => m.role === 'user')
                            ? generateTitle(newMessages.find(m => m.role === 'user')!.content)
                            : c.title
                    }
                    : c
            );
            saveConversations(updated);
        }
    }, [currentConvId, conversations, saveConversations]);

    // Delete conversation
    const deleteConversation = (id: string) => {
        const updated = conversations.filter(c => c.id !== id);
        saveConversations(updated);
        if (currentConvId === id) {
            if (updated.length > 0) {
                setCurrentConvId(updated[0].id);
                setMessages(updated[0].messages);
                localStorage.setItem(CURRENT_CONV_KEY, updated[0].id);
            } else {
                setCurrentConvId(null);
                localStorage.removeItem(CURRENT_CONV_KEY);
                setMessages([{ role: 'assistant', content: 'Grok 4.1-fast initialized. Systems nominal. Awaiting input.', timestamp: Date.now() }]);
            }
        }
    };

    // Switch conversation
    const switchConversation = (id: string) => {
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            setCurrentConvId(id);
            setMessages(conv.messages);
            localStorage.setItem(CURRENT_CONV_KEY, id);
            setShowSidebar(false);
        }
    };

    // Copy message to clipboard
    const copyMessage = async (content: string, idx: number) => {
        await navigator.clipboard.writeText(content);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    // Export conversation
    const exportConversation = () => {
        const conv = conversations.find(c => c.id === currentConvId);
        if (!conv) return;
        
        const text = conv.messages
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n\n');
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Clear current chat
    const clearChat = () => {
        const initialMessages: Message[] = [
            { role: 'assistant', content: 'Grok 4.1-fast initialized. Systems nominal. Awaiting input.', timestamp: Date.now() }
        ];
        setMessages(initialMessages);
        if (currentConvId) {
            const updated = conversations.map(c => 
                c.id === currentConvId 
                    ? { ...c, messages: initialMessages, updatedAt: Date.now() }
                    : c
            );
            saveConversations(updated);
        }
    };

    // Regenerate last response
    const regenerateResponse = async () => {
        const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserIdx === -1) return;
        
        const actualIdx = messages.length - 1 - lastUserIdx;
        const userMessage = messages[actualIdx].content;
        const messagesUpToUser = messages.slice(0, actualIdx + 1);
        
        setMessages(messagesUpToUser);
        setIsTyping(true);

        try {
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'xai',
                    model,
                    messages: messagesUpToUser.filter(m => m.role !== 'system'),
                    stream: false,
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const newMessages = [...messagesUpToUser, { role: 'assistant' as const, content: data.content, timestamp: Date.now() }];
            setMessages(newMessages);
            updateCurrentConversation(newMessages);
        } catch (error: any) {
            const newMessages = [...messagesUpToUser, { role: 'assistant' as const, content: `Error: ${error.message}`, timestamp: Date.now() }];
            setMessages(newMessages);
        } finally {
            setIsTyping(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowSidebar(false);
                setShowSettings(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                createNewConversation();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [createNewConversation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = input;
        setInput('');
        const newMessages = [...messages, { role: 'user' as const, content: userMessage, timestamp: Date.now() }];
        setMessages(newMessages);
        setIsTyping(true);

        try {
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'xai',
                    model,
                    messages: newMessages.filter(m => m.role !== 'system'),
                    stream: false,
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                // Check if it's a rate limit error
                if (response.status === 429 || data.upgrade_url) {
                    const limitMsg = `Daily limit reached. You've used ${data.used || 'all'} of your ${data.limit || 20} free messages today.\n\nAdd a payment method at /dashboard for unlimited access, or wait until tomorrow for your free tier to reset.`;
                    const errorMessages = [...newMessages, { 
                        role: 'assistant' as const, 
                        content: limitMsg,
                        timestamp: Date.now()
                    }];
                    setMessages(errorMessages);
                    updateCurrentConversation(errorMessages);
                    return;
                }
                throw new Error(data.error);
            }

            const finalMessages = [...newMessages, { role: 'assistant' as const, content: data.content, timestamp: Date.now() }];
            setMessages(finalMessages);
            updateCurrentConversation(finalMessages);
        } catch (error: any) {
            const errorMessages = [...newMessages, { 
                role: 'assistant' as const, 
                content: `Error: ${error.message}`,
                timestamp: Date.now()
            }];
            setMessages(errorMessages);
            updateCurrentConversation(errorMessages);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex h-[600px] w-full max-w-4xl mx-auto bg-cyber-darker border border-neon-cyan/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-cyber-dark border-r border-neon-cyan/20`}>
                <div className="p-3 border-b border-neon-cyan/20">
                    <button
                        onClick={createNewConversation}
                        className="w-full px-3 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-all text-sm font-mono"
                    >
                        + New Chat
                    </button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-60px)] p-2 space-y-1">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                conv.id === currentConvId 
                                    ? 'bg-neon-cyan/20 border border-neon-cyan/30' 
                                    : 'hover:bg-neon-cyan/10'
                            }`}
                            onClick={() => switchConversation(conv.id)}
                        >
                            <span className="flex-1 text-xs text-gray-300 truncate font-mono">{conv.title}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-cyber-light/80 backdrop-blur border-b border-neon-cyan/20 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-1.5 hover:bg-neon-cyan/10 rounded transition-all text-gray-400 hover:text-neon-cyan"
                            title="Toggle history"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        <h2 className="text-neon-cyan font-mono font-bold tracking-wider text-sm">GROK 4.1-FAST</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-1.5 hover:bg-neon-cyan/10 rounded transition-all text-gray-400 hover:text-neon-cyan"
                            title="Settings"
                        >
                            <Settings size={14} />
                        </button>
                        <button
                            onClick={regenerateResponse}
                            className="p-1.5 hover:bg-neon-cyan/10 rounded transition-all text-gray-400 hover:text-neon-cyan disabled:opacity-50"
                            title="Regenerate"
                            disabled={isTyping || messages.filter(m => m.role === 'user').length === 0}
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={exportConversation}
                            className="p-1.5 hover:bg-neon-cyan/10 rounded transition-all text-gray-400 hover:text-neon-cyan"
                            title="Export"
                        >
                            <Download size={14} />
                        </button>
                        <button
                            onClick={clearChat}
                            className="p-1.5 hover:bg-neon-cyan/10 rounded transition-all text-gray-400 hover:text-red-400"
                            title="Clear chat"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="bg-cyber-dark/90 border-b border-neon-cyan/20 p-3">
                        <div className="flex items-center gap-4">
                            <label className="text-xs text-gray-400 font-mono">Model:</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="bg-cyber-darker border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 font-mono focus:outline-none focus:border-neon-cyan"
                            >
                                <option value="grok-4-1-fast">Grok 4.1 Fast</option>
                                <option value="grok-2-latest">Grok 2 Latest</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                relative max-w-[80%] p-3 rounded-lg
                                ${msg.role === 'user'
                                    ? 'bg-neon-blue/10 border border-neon-blue/30 text-blue-100 rounded-br-none'
                                    : 'bg-neon-cyan/10 border border-neon-cyan/30 text-cyan-100 rounded-bl-none'}
                            `}>
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <span className="text-xs opacity-50 uppercase">{msg.role === 'user' ? 'User' : 'Grok'}</span>
                                    <button
                                        onClick={() => copyMessage(msg.content, idx)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300"
                                        title="Copy"
                                    >
                                        {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-neon-cyan/10 border border-neon-cyan/30 text-cyan-100 p-3 rounded-lg rounded-bl-none">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-3 bg-cyber-light/50 border-t border-neon-cyan/20">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter command or query... (Ctrl+N for new chat)"
                            className="flex-1 bg-cyber-dark border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all font-mono text-sm"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={isTyping || !input.trim()}
                            className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-bold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTyping ? '...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
