import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare, Bot, Zap, Bug, Code, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'code' | 'suggestion';
}

export const AIChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Assalam o alaikum! Main apka professional coding assistant hoon. Aaj kya banayen?' 
    }
  ]);
  const [input, setInput] = useState('');

  const shortcuts = [
    { label: 'Explain', icon: Search, color: 'text-blue-400' },
    { label: 'Optimize', icon: Zap, color: 'text-yellow-400' },
    { label: 'Debug', icon: Bug, color: 'text-red-400' },
    { label: 'Refactor', icon: Code, color: 'text-green-400' },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulating thinking
    setTimeout(() => {
       const botMsg: Message = { 
         id: (Date.now() + 1).toString(), 
         role: 'assistant', 
         content: 'Understood. Let me analyze your code for improvements. Scaling to industry standards...' 
       };
       setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-darker overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shadow-[0_0_15px_var(--secondary)]">
            <Sparkles size={18} className="text-bg-darker" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-bright tracking-tight">AI COPILOT</h3>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-80">Online & Ready</p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-bg-light border border-border' : 'bg-primary/20 border border-primary/30'
                }`}>
                  {msg.role === 'user' ? <MessageSquare size={14} className="text-text-muted" /> : <Bot size={16} className="text-primary" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.role === 'user' ? 'bg-bg-active text-text-bright' : 'bg-bg-light text-text-main border border-border/50'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* INPUT AREA */}
      <div className="p-6 border-t border-border bg-sidebar/50">
        {/* SHORTCUTS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {shortcuts.map(s => (
             <button key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-light border border-border hover:bg-bg-active active:scale-95 transition-all">
                <s.icon size={12} className={s.color} />
                <span className="text-[11px] font-bold text-text-muted">{s.label}</span>
             </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask AI or type commands..."
            className="w-full bg-bg-dark border border-border rounded-2xl py-3 pl-4 pr-12 text-[13px] outline-none focus:border-secondary transition-all resize-none min-h-[50px] custom-scrollbar"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-bg-darker disabled:opacity-30 transition-all hover:scale-110 active:scale-90 shadow-lg"
          >
            <Send size={14} fill="currentColor" />
          </button>
        </div>
        <p className="mt-3 text-center text-[9px] font-bold text-text-muted opacity-40 uppercase tracking-[0.2em]">Antigravity Intelligence Protocol v2.4</p>
      </div>
    </div>
  );
};
