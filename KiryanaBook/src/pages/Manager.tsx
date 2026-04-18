import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, UserCog, History, X, Trash2, ChevronRight, MessageCircle, Mic, Volume2, VolumeX, Sparkles, ArrowLeft, HelpCircle } from 'lucide-react';
import { askLocalAgent, detectMicroAnomalies } from '../lib/localAgent';
import { useShop } from '../context/ShopContext';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  isBot: boolean;
  time: string; // ISO string for JSON serialization
  isWelcome?: boolean; // If it's the first greet (to show live alerts)
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'manager_chat_history';

function loadSessions(): ChatSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 30))); // keep last 30
}

function makeWelcomeMessage(): Message {
  return {
    id: `b-welcome`,
    text: `🌟 **Assalam-o-Alaikum!**\n\nMain aapka **Business Manager** hoon.`,
    isBot: true,
    time: new Date().toISOString(),
    isWelcome: true // New flag for dynamic rendering
  };
}

// ─── Stress Meter Component (Simplified) ────────────────────────────────────
function StressMeter({ score }: { score: number }) {
  const isStressed = score < 60;
  const color = isStressed ? 'text-red-500' : 'text-[#00C853]';

  return (
    <div className="flex items-center gap-2 px-1">
       <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className={`h-full ${isStressed ? 'bg-red-500' : 'bg-[#00E676]'}`}
          />
       </div>
       <span className={`text-[9px] font-black ${color}`}>{score}% SAFE</span>
    </div>
  );
}

// ─── Message Renderer (Simplified & Ultra-Safe) ──────────────────────────
function renderBotMessage(text: string, isWelcome?: boolean, anomalies?: string[], onAction?: (a: string) => void) {
  const safeText = text || '';
  const lines = safeText.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = (line || '').trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // [ACTION: Label] Detection
        const actionMatch = trimmed.match(/\[ACTION:\s*(.*?)\]/);
        if (actionMatch && actionMatch[1]) {
          return (
            <button 
              key={i}
              onClick={() => onAction?.(actionMatch[1])}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00A846] rounded-full transition-all active:scale-95 text-xs font-black mr-2 mb-2"
            >
              <Sparkles size={12} strokeWidth={3} />
              {actionMatch[1]}
            </button>
          );
        }

        if (/^─+$/.test(trimmed))
          return <hr key={i} className="border-gray-100 dark:border-white/5 my-1" />;

        const headingMatch = trimmed.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*\*\*(.*?)\*\*$/u);
        if (headingMatch && headingMatch[2]) {
          return (
            <p key={i} className="text-[14px] font-black text-gray-900 dark:text-white flex items-center gap-2 pt-1">
              <span>{headingMatch[1]}</span>
              {headingMatch[2]}
            </p>
          );
        }

        const amountMatch = trimmed.match(/^(.+?):\s*(-?)?(Rs\.[\d,]+|[\d,]+)(.*)$/);
        if (amountMatch && !trimmed.startsWith('•')) {
          const label = (amountMatch[1] || '').replace(/\*\*/g, '');
          const isNegative = trimmed.includes('-') || label.toLowerCase().includes('cogs') || label.toLowerCase().includes('expense');
          const isProfit = label.includes('Profit') || label.includes('profit') || label.includes('Munafa');
          const amountValue = (amountMatch[2] || '') + (amountMatch[3] || '');
          return (
            <div key={i} className="flex items-center justify-between py-1 px-0.5">
              <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
              <span className={`text-[14px] font-black tabular-nums ${isProfit ? 'text-[#00C853]' : isNegative ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{amountValue}{amountMatch[4] || ''}</span>
            </div>
          );
        }

        if (trimmed.startsWith('•'))
          return (
            <div key={i} className="flex items-start gap-2.5 text-[14px] text-gray-700 dark:text-gray-300 px-0.5">
              <div className="w-1 h-1 rounded-full bg-[#00E676] mt-2 shrink-0" />
              <span className="leading-snug font-bold">{renderInlineBold(trimmed.slice(1).trim())}</span>
            </div>
          );

        return <p key={i} className="text-[13px] text-gray-700 dark:text-gray-300 font-bold leading-snug px-0.5">{renderInlineBold(trimmed)}</p>;
      })}
      
      {isWelcome && (
        <div className="pt-2 mt-2 space-y-2 border-t border-gray-100 dark:border-white/5">
           <StressMeter score={Math.min(100, Math.max(40, 80 + (anomalies?.length ? -anomalies.length * 10 : 10)))} />
          {anomalies && anomalies.length > 0 ? (
            <div className="bg-red-50 dark:bg-red-500/5 p-3 rounded-xl border border-red-100 dark:border-red-500/10">
              <p className="text-[12px] font-bold text-red-600 dark:text-red-400 leading-snug">⚠️ {(anomalies[0] || '').replace(/\*\*/g, '')}</p>
            </div>
          ) : (
             <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C853] shadow-[0_0_5px_#00C853]" />
                <p className="text-[9px] font-black text-gray-400 uppercase">Analysis Engine Active</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderInlineBold(text: string): React.ReactNode {
  const safeText = text || '';
  return safeText.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-black text-gray-900 dark:text-white">{part}</strong> : part
  );
}

// ─── Quick Chips ──────────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  "💰 Galle mein cash?",
  "📊 Aaj ki sale?",
  "🚨 Masail hal karein (Problems)",
  "⏳ Purani recovery?",
  "📈 Munafa barhaun?",
  "📦 Stock alert?",
];

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({
  sessions,
  onSelect,
  onDelete,
  onClose,
}: {
  sessions: ChatSession[];
  onSelect: (s: ChatSession) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  function formatDate(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return `Aaj ${d.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('ur-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="absolute inset-0 z-50 bg-slate-50 dark:bg-[#0A0A0A] flex flex-col"
    >
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-br from-[#00E676] to-[#00A846] px-4 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <History size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Chat History</h2>
              <p className="text-xs text-white/80">{sessions.length} guftagu saved hain</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center active:scale-90">
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sessions.filter(s => s.messages.filter(m => !m.isBot).length >= 5).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-20">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold text-base">Koi history nahi</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Sirf wo chat save hoti hain jin mein user ke 5+ messages hon.</p>
          </div>
        ) : (
          sessions
            .filter(s => s.messages.filter(m => !m.isBot).length >= 5)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 bg-white dark:bg-[#181818] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
                onClick={() => onSelect(session)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 flex items-center justify-center shrink-0">
                  <UserCog size={18} className="text-[#00A846]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(session.updatedAt)} • {session.messages.filter(m => !m.isBot).length} messages</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-90"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const Manager: React.FC = () => {
  const { sales, expenses, udhaars, stock, contacts, profile } = useShop();

  // 🧪 Memoize shopData to prevent unnecessary re-calculates on every keystroke
  const shopData = useMemo(() => ({
    sales: Array.isArray(sales) ? sales : [],
    expenses: Array.isArray(expenses) ? expenses : [],
    udhaars: Array.isArray(udhaars) ? udhaars : [],
    stock: Array.isArray(stock) ? stock : [],
    contacts: Array.isArray(contacts) ? contacts : [],
    profile: profile || null,
  }), [sales, expenses, udhaars, stock, contacts, profile]);

  const location = useLocation();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `s-${Date.now()}`);
  
  // Memoized Live Vitals
  const allAnomalies = useMemo(() => {
    try {
      return detectMicroAnomalies(shopData).filter(x => x && !x.includes('Masha\'Allah'));
    } catch (e) {
      console.error("Anomaly detection failed", e);
      return [];
    }
  }, [shopData]);

  const [messages, setMessages] = useState<Message[]>([makeWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(() => localStorage.getItem('manager_speaker') !== 'off');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(input);
  const isMounted = useRef(true);
  const listenersRef = useRef<any[]>([]);

  // ── Single consolidated cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      // 1. Mark unmounted FIRST
      isMounted.current = false;
      
      // 2. Remove all native listeners BEFORE stopping recognition
      try {
        if (listenersRef.current && Array.isArray(listenersRef.current)) {
          listenersRef.current.forEach(l => {
            if (l && typeof l.remove === 'function') {
              try { l.remove(); } catch (e) {}
            }
          });
        }
        listenersRef.current = [];
      } catch (e) {}

      // 3. Cancel TTS with safety
      try { 
        if (window && window.speechSynthesis) {
          window.speechSynthesis.cancel(); 
        }
      } catch (e) {}

      // 4. Stop native microphone last
      try { 
        if (SpeechRecognition && typeof SpeechRecognition.stop === 'function') {
          SpeechRecognition.stop().catch(() => {}); 
        }
      } catch (e) {}
    };
  }, []);

  // Sync ref with state
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-start voice if requested from Dashboard
  useEffect(() => {
    if ((location.state as any)?.autoStartVoice) {
      const timer = setTimeout(() => {
        startListening(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // TTS Helper
  const speak = (text: string) => {
    try {
      if (!isSpeakerOn) return;
      window.speechSynthesis.cancel();
      // Clean text for speech (remove markdown, emoji symbols, and divider lines)
      const cleanText = (text || '')
         .replace(/\*\*(.*?)\*\*/g, '$1') // remove ** but keep text
         .replace(/─+/g, '')
         .replace(/•/g, '')
         .replace(/[🚀💰📊🚨⏳📈📦🌟🌟]/g, '') // remove common UI emojis for cleaner speech
         .replace(/\[ACTION:.*?\]/g, ''); // hide action buttons from speech

      if (!cleanText.trim()) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ur-PK'; 
      utterance.pitch = 1.1; 
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("SpeechSynthesis failed:", e);
    }
  };

  const toggleSpeaker = () => {
    const newVal = !isSpeakerOn;
    setIsSpeakerOn(newVal);
    localStorage.setItem('manager_speaker', newVal ? 'on' : 'off');
    if (!newVal) window.speechSynthesis.cancel();
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  };



  const startListening = async (silent = false) => {
    // 🌐 WEB SPEECH API FALLBACK (Reliable for Browsers)
    const WebSpeech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (WebSpeech && !Capacitor.isNativePlatform()) {
      try {
        const recognition = new WebSpeech();
        recognition.lang = 'en-PK';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
          setIsListening(true);
          Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
        };

        recognition.onresult = (event: any) => {
          if (!isMounted.current) return;
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput(transcript);
        };

        recognition.onend = async () => {
          if (!isMounted.current) return;
          setIsListening(false);
          
          const currentInput = inputRef.current;
          if (currentInput.trim().length > 2) {
            handleSend(currentInput);
          }
        };

        recognition.onerror = () => {
          if (!isMounted.current) return;
          setIsListening(false);
          if (!silent) toast.error('Mic access denied or error');
        };

        recognition.start();
        return;
      } catch (e) {
        console.error("Web Speech Error:", e);
      }
    }

    // 📱 NATIVE CAPACITOR IMPLEMENTATION
    try {
      const { available } = await SpeechRecognition.available();
      if (!available) {
        if (!silent) toast.error('Speech recognition not available');
        return;
      }

      await SpeechRecognition.requestPermissions();
      if (!isMounted.current) return;
      setIsListening(true);
      
      SpeechRecognition.start({
        language: 'en-PK',
        partialResults: true,
        popup: false, 
      });

      const partialHandle = await SpeechRecognition.addListener('partialResults', (data: any) => {
        if (isMounted.current && data && data.matches && data.matches.length > 0) {
          setInput(data.matches[0] || '');
        }
      });
      if (partialHandle) listenersRef.current.push(partialHandle);
    } catch (e) {
      setIsListening(false);
      if (!silent) toast.error('Could not start mic');
    }
  };

  // Handle auto-send after voice input stops (native only)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    let stopHandle: any;
    let cancelled = false;

    const setupListener = async () => {
      try {
        if (!SpeechRecognition || cancelled) return;
        
        stopHandle = await SpeechRecognition.addListener('listeningState', (state: any) => {
          // Double-guard: both local cancelled flag AND isMounted ref
          if (cancelled || !isMounted.current) return;
          if (state && state.status === 'stopped') {
            setIsListening(false);
            const currentInput = inputRef.current || '';
            if (currentInput.trim().length > 2) {
              handleSend(currentInput);
            }
          }
        });
        if (stopHandle && !cancelled) {
          listenersRef.current.push(stopHandle);
        } else if (stopHandle) {
          // Already unmounted by the time promise resolved — remove immediately
          try { stopHandle.remove(); } catch (e) {}
        }
      } catch (e) {
        console.error('Failed to setup SpeechRecognition listener', e);
      }
    };
    setupListener();

    return () => {
      cancelled = true;
      if (stopHandle && typeof stopHandle.remove === 'function') {
        try { stopHandle.remove(); } catch (e) {}
      }
    };
  }, []); 

  // (TTS cleanup is handled in the consolidated useEffect above)

  // Auto-save session whenever messages change (if more than 5 messages)
  useEffect(() => {
    const userMsgCount = messages.filter(m => !m.isBot).length;
    if (userMsgCount < 5) return; // Only save if user has sent 5+ messages

    const firstUserMsg = messages.find(m => !m.isBot);
    const title = firstUserMsg ? firstUserMsg.text.slice(0, 40) : 'Nayi Guftagu';
    const now = new Date().toISOString();

    const existing = sessions.find(s => s.id === currentSessionId);
    let updated: ChatSession[];
    
    if (existing) {
      updated = sessions.map(s => s.id === currentSessionId ? { ...s, messages, title, updatedAt: now } : s);
    } else {
      updated = [...sessions, { id: currentSessionId, title, messages, createdAt: now, updatedAt: now }];
    }
    
    setSessions(updated);
    saveSessions(updated);
  }, [messages, currentSessionId]);

  const startNewChat = () => {
    setCurrentSessionId(`s-${Date.now()}`);
    setMessages([makeWelcomeMessage()]);
    setInput('');
    setShowHistory(false);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !isMounted.current) return;
    const userMsg: Message = { id: `u-${Date.now()}`, text: text.trim(), isBot: false, time: new Date().toISOString() };
    if (!isMounted.current) return;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 1. Use Local Agent (Offline Brain) — wrapped in try-catch to prevent crash on navigation
    let finalResponse = 'Kuch masla aa gaya, dobara try karein.';
    try {
      finalResponse = askLocalAgent(text.trim(), shopData);
    } catch (e) {
      console.error('localAgent error:', e);
    }

    if (!isMounted.current) return;
    setIsTyping(false);
    setMessages(prev => [...prev, { 
      id: `b-${Date.now()}`, 
      text: finalResponse, 
      isBot: true, 
      time: new Date().toISOString()
    }]);
    if (isMounted.current) speak(finalResponse);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    if (id === currentSessionId) startNewChat();
  };

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100dvh-100px)] flex flex-col bg-[#F9F9FB] dark:bg-[#0A0A0A] relative overflow-hidden overscroll-none">

      {/* ── Header (Slim & Pro) ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-[60] shrink-0 bg-white dark:bg-[#0A0A0A] px-5 pt-10 pb-4 border-b dark:border-white/5 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-white/70 active:scale-90 transition-all border dark:border-white/5">
                <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-[17px] font-black text-gray-900 dark:text-white leading-none mb-1 tracking-tight">Business Manager</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C853] shadow-[0_0_5px_#00C853]" />
                <p className="text-[8px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">Testing Mode</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => toast('Guide: Aap yahan voice ya text se sawal pooch sakte hain. Maslan: "Aaj ki sale kitni hai?"', { icon: '💡' })} 
              className="w-9 h-9 text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center"
            >
               <HelpCircle size={18} />
            </button>
            <button onClick={() => setShowHistory(true)} className="w-9 h-9 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
               <History size={18} />
            </button>
            <button onClick={toggleSpeaker} className={`w-9 h-9 transition-all ${isSpeakerOn ? 'text-[#00C853]' : 'text-gray-300'}`}>
               {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Chat Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {(messages || []).map((msg) => (
          <motion.div
            key={msg?.id || Math.random()}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-3 ${msg?.isBot ? 'justify-start pr-8' : 'justify-end pl-8'}`}
          >
            {msg?.isBot && (
              <div className="w-9 h-9 rounded-[1.1rem] bg-white dark:bg-[#1A1A1A] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-white/5 mt-0.5">
                <UserCog size={18} className="text-[#00C853]" strokeWidth={2.5} />
              </div>
            )}
            <div className={`max-w-full rounded-[1.8rem] px-5 py-4 relative shadow-[0_8px_25px_rgba(0,0,0,0.03)] ${msg?.isBot
              ? 'bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-tl-none'
              : 'bg-[#00E676] text-[#0A0A0A] rounded-tr-none'}`}
            >
             
              {msg?.isBot 
                ? renderBotMessage(msg?.text || '', msg?.isWelcome, allAnomalies, (action) => handleSend(`${action} ke baray mein batao`)) 
                : <p className="text-[15px] font-black tracking-tight leading-relaxed">{(msg?.text || '')}</p>
              }
              <div className={`flex items-center gap-1 mt-2.5 ${msg?.isBot ? 'justify-start' : 'justify-end'}`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${msg?.isBot ? 'text-gray-400' : 'text-black/40'}`}>
                   {msg?.time ? new Date(msg.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
             <div className="w-9 h-9 rounded-[1.1rem] bg-white dark:bg-[#1A1A1A] flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/5">
                <UserCog size={18} className="text-[#00C853]" />
              </div>
            <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-2 h-2 bg-[#00E676] rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {messages.length === 1 && !isTyping && (
          <div className="pt-2 px-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Quick Commands</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map((chip, i) => (
                <button key={i} onClick={() => handleSend(chip)}
                  className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 text-[13px] font-black py-3 px-5 rounded-[1.3rem] shadow-sm transform hover:translate-y-[-2px] active:scale-95 transition-all">
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-6" />
      </div>

      {/* ── Input (Minimalistic) ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-white dark:bg-[#0A0A0A] border-t dark:border-white/5 shadow-sm">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
             <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Manager se baat karein..."
              className="w-full bg-gray-50 dark:bg-[#141414] text-gray-900 dark:text-white rounded-2xl py-4.5 pl-6 pr-14 font-black text-[13.5px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 transition-all"
            />
            <button 
              onClick={() => startListening()}
              className={`absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isListening ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 bg-transparent'
              }`}
            >
              <Mic size={20} strokeWidth={2.5} />
            </button>
          </div>

          <button onClick={() => handleSend()} disabled={!input.trim()}
            className="w-14 h-14 rounded-2xl bg-[#00E676] text-[#0A0A0A] flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all shadow-[0_8px_20px_rgba(0,230,118,0.2)]">
            <Send size={22} strokeWidth={4} />
          </button>
        </div>
      </div>

      {/* ── History Panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanel
            sessions={sessions}
            onSelect={handleSelectSession}
            onDelete={handleDeleteSession}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
