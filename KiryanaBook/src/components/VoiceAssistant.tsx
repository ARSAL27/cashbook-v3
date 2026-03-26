import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import toast from 'react-hot-toast';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceLine {
  id: string;
  name: string;
  qty: string;
  price: string;
}

export const VoiceAssistant: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addSale } = useShop();
  const [phase, setPhase] = useState<'listening' | 'processing' | 'confirming'>('listening');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Realtime
  const [liveTranscript, setLiveTranscript] = useState('');
  
  // Data State
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [discount, setDiscount] = useState<string>('');
  
  const silenceTimer = useRef<any>(null);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const resetState = () => {
    setPhase('listening');
    setLiveTranscript('');
    setLines([]);
    setDiscount('');
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
  };

  useEffect(() => {
    if (!isOpen) {
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }
      resetState();
      return;
    }

    resetState();

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'ur-PK'; // Urdu/Hindi

      recog.onresult = (event: any) => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final + interim).trim();
        setLiveTranscript(currentText);

        silenceTimer.current = setTimeout(() => {
          stopListeningAndProcess();
        }, 2200);
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone permission denied.");
        } else if (event.error === 'network') {
          toast.error("Network issue. Check internet.");
        } else {
          toast.error("Voice error: " + event.error);
        }
        setIsListening(false);
        onClose();
      };

      recog.onend = () => {
        setIsListening(false);
        // Do not auto-close if we are already processing or confirming
      };

      setRecognition(recog);
      
      setTimeout(() => {
        try { 
          recog.start(); 
          setIsListening(true); 
          triggerHaptic(ImpactStyle.Medium);
        } catch(e) {
          console.error("Failed to start recognition", e);
        }
      }, 500);
    } else {
        toast.error("Voice feature is not supported on this browser.");
        onClose();
    }

    return () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        if (recognition) { try { recognition.stop(); } catch(e) {} }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  const stopListeningAndProcess = () => {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    setPhase('processing');
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    
    // Simple heuristic parser for demo
    setTimeout(() => {
      const lowerText = liveTranscript.toLowerCase();
      const newLines: InvoiceLine[] = [];
      let disc = '';

      // Mock heuristic: split by ' aur ', ' phir ', ',' etc.
      const parts = lowerText.split(/(?: aur |,|\.)/);
      
      parts.forEach(part => {
        part = part.trim();
        if (!part) return;

        // Check if it's a discount
        if (part.includes('discount') || part.includes('choot') || part.includes('less')) {
            const numMatch = part.match(/\d+/);
            if (numMatch) disc = numMatch[0];
        } else {
            // Find numbers
            const nums = part.match(/\d+/g);
            let name = part.replace(/\d+/g, '').replace(/(kilo|kg|gram|litre|piece|daana)/gi, '').trim() || 'Item';
            let qty = '1';
            let price = '0';
            
            if (nums) {
                if (nums.length >= 2) {
                    qty = nums[0];
                    price = nums[1];
                } else if (nums.length === 1) {
                    price = nums[0];
                    // attempt to parse qty from text e.g., 'do kilo'
                    if(part.includes('do kilo')) qty = '2kg';
                    else if (part.includes('ek kilo')) qty = '1kg';
                    else qty = '1';
                }
            } else {
                // No numbers? Default
                price = '100'; // dummy
            }

            // Cleanup name edge cases
            if(name.length > 15) name = name.substring(0, 15);
            newLines.push({ id: Date.now() + Math.random().toString(), name, qty, price });
        }
      });

      if (newLines.length === 0 && lowerText.length > 0) {
          // Fallback if regex failed
          newLines.push({ id: 'fallback', name: 'General', qty: '1', price: (lowerText.match(/\d+/) || ['0'])[0] });
      }

      setLines(newLines);
      setDiscount(disc);
      triggerHaptic(ImpactStyle.Medium);
      setPhase('confirming');
    }, 1000); // fake processing time
  };

  const updateLine = (id: string, field: keyof InvoiceLine, val: string) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: val } : l));
  };

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), name: '', qty: '1', price: '' }]);
    triggerHaptic(ImpactStyle.Light);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
    triggerHaptic(ImpactStyle.Heavy);
  };

  const totalAmount = useMemo(() => {
    const linesTotal = lines.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const discAmt = parseFloat(discount) || 0;
    return Math.max(0, linesTotal - discAmt);
  }, [lines, discount]);

  const handleSave = async () => {
    if (lines.length === 0 || totalAmount <= 0) {
        toast.error("Please add details before saving.");
        return;
    }
    try {
        const items = lines.map(l => ({
            itemId: 'voice-' + l.id,
            name: l.name || 'Unknown',
            qty: parseFloat(l.qty) || 1,
            price: parseFloat(l.price) || 0
        }));

        const parsedDiscount = discount ? parseFloat(discount) : 0;
        if (parsedDiscount > 0) {
            items.push({
                itemId: 'voice-discount',
                name: 'Discount',
                qty: 1,
                price: -parsedDiscount
            });
        }
        await addSale(items, 'cash');
        toast.success("Saved successfully!");
        triggerHaptic(ImpactStyle.Heavy);
        onClose();
    } catch(e) {
        toast.error("Failed to save.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Standard Styling */}
          <style>{`
            .voice-line-item {
              border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            .dark .voice-line-item {
              border-bottom: 1px solid rgba(255,255,255,0.05);
            }
          `}</style>

          {/* BACKGROUND OVERLAY */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[1000] backdrop-blur-md transition-colors duration-500 ${phase === 'listening' || phase === 'processing' ? 'bg-black/80' : 'bg-black/40'}`}
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 inset-x-0 z-[1010] flex flex-col w-full max-w-md mx-auto h-[90vh] rounded-t-[32px] overflow-hidden ${
                phase === 'listening' || phase === 'processing' ? 'bg-[#0f1115]' : 'bg-white'
            }`}
          >
            {/* ─── PHASE: LISTENING / PROCESSING ───────────── */}
            {(phase === 'listening' || phase === 'processing') && (
              <div className="flex flex-col h-full items-center p-6 relative">
                 {/* Top Chip */}
                 <div className="absolute top-6 right-6 px-3 py-1 bg-white/10 rounded-full border border-white/5">
                    <p className="text-white/60 text-[10px] uppercase font-black tracking-widest">Urdu / Mixed</p>
                 </div>

                 {/* Waveform Area */}
                 <div className="mt-12 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 h-16 mb-4">
                        {[0,1,2,3,4,5,6].map(i => (
                            <motion.div 
                                key={i}
                                animate={
                                    phase === 'processing' ? { height: 8, opacity: 0.3 } :
                                    isListening ? { height: [12, 45, 12] } : { height: 8 }
                                }
                                transition={{ repeat: Infinity, duration: 0.6 + (i * 0.1), delay: i * 0.05 }}
                                className={`w-2 rounded-full ${
                                  phase === 'processing' 
                                    ? 'bg-gradient-to-t from-[#FFD600] to-[#FFB300]' 
                                    : 'bg-gradient-to-t from-[#00E676] to-[#4BFF94]'
                                } shadow-[0_0_15px_rgba(0,230,118,0.3)]`}
                            />
                        ))}
                    </div>
                    <p className={`text-[12px] font-black tracking-widest uppercase transition-colors ${phase === 'processing' ? 'text-[#FFB300]' : 'text-[#00E676]'}`}>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-current mr-2 animate-pulse" />
                        {phase === 'processing' ? 'Tehqeeqat...' : 'Main Sun Raha Hoon...'}
                    </p>
                 </div>

                 {/* Live Transcript Area */}
                 <div className="mt-12 w-full flex-1 max-h-[40vh] bg-white/5 rounded-2xl p-6 border border-white/5 overflow-y-auto relative">
                    {liveTranscript ? (
                        <p className="text-[24px] font-bold leading-tight text-white">
                            {liveTranscript}
                            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1 h-[24px] bg-[#00E676] ml-1 align-middle" />
                        </p>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                             <Mic size={48} className="text-gray-400 mb-4" />
                             <p className="text-[18px] text-gray-400 font-medium italic">"Chawal 2 kilo paanch sau..."</p>
                        </div>
                    )}
                 </div>

                 {/* Bottom Cancel */}
                 <button 
                    onClick={onClose}
                    className="mt-8 mb-4 px-8 py-3 rounded-full border border-white/20 text-white/80 font-bold text-[13px] uppercase tracking-widest active:bg-white/10"
                 >
                    Cancel
                 </button>
              </div>
            )}


            {/* ─── PHASE: CONFIRMING ───────────── */}
            {phase === 'confirming' && (
              <div className="flex flex-col h-full">
                  <div className="px-6 pt-8 pb-4 text-center">
                      <h2 className="text-[#1a1a1a] text-[24px] font-black tracking-tight">Theek Hai?</h2>
                      <p className="text-[#666] text-[12px] font-medium mt-1">Kuch ghalat ho toh seedha tap karke theek karo.</p>
                  </div>

                   <div className="flex-1 overflow-y-auto px-4 pb-4">
                      {/* Standard List View */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm font-sans text-gray-800">
                          
                          {lines.length === 0 && (
                             <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl mb-2 text-xs font-bold">
                                 <AlertTriangle size={14} /> Details add karein
                             </div>
                          )}
                          {lines.map(line => (
                              <div key={line.id} className="voice-line-item flex items-center gap-2 px-2 py-3">
                                  <input 
                                      value={line.name}
                                      onChange={(e) => updateLine(line.id, 'name', e.target.value)}
                                      className="flex-[2] min-w-0 bg-transparent outline-none text-[15px] font-bold text-gray-800"
                                      placeholder="Item name"
                                  />
                                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] text-gray-400 font-bold">Qty:</span>
                                    <input 
                                        value={line.qty}
                                        onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                                        className="w-10 text-center bg-transparent outline-none text-[13px] font-bold"
                                        placeholder="1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] text-gray-400 font-bold">Rs.</span>
                                    <input 
                                        value={line.price}
                                        onChange={(e) => updateLine(line.id, 'price', e.target.value)}
                                        type="number"
                                        className="w-16 text-right bg-transparent outline-none text-[15px] font-black text-[#1A5C38]"
                                        placeholder="0"
                                    />
                                  </div>
                                  <button onClick={() => removeLine(line.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                          {/* Add Row Button */}
                          <button onClick={addLine} className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-[#888] hover:text-[#1A5C38] border-t border-dashed border-[#eee] transition-colors font-sans text-[12px] font-semibold uppercase tracking-wider">
                              <Plus size={14} /> Nayi item add karo
                          </button>

                          {/* Total Row */}
                          <div className="flex justify-between items-center px-4 py-5 bg-gray-50/50 rounded-2xl mt-4 border border-dashed border-gray-200">
                             <span className="text-[16px] font-black text-gray-500 uppercase tracking-widest">Total Bill</span>
                             <span className="text-[24px] font-black text-[#1A5C38]">
                                 Rs. {totalAmount.toLocaleString()}
                             </span>
                          </div>
                      </div>

                      {/* Metadata below card */}
                      <div className="mt-4 px-2 space-y-3 font-sans">
                         <div className="flex items-center gap-3">
                             <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[12px] font-bold text-[#0A3D24]">
                                 Sale
                             </div>
                             <input 
                                placeholder="Kuch note karna hai?" 
                                className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2 text-[12px] outline-none focus:border-[#4BFF94]"
                             />
                         </div>
                         <div className="text-[10px] text-gray-400 font-medium px-2 uppercase tracking-widest">
                             {new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                         </div>
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-white border-t border-gray-100 space-y-2 pb-8">
                      <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSave}
                          className="w-full h-[56px] rounded-[18px] bg-[#00E676] text-[#0A3D24] font-black text-[14px] uppercase tracking-[0.1em] shadow-[0_10px_20px_-5px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2"
                      >
                          <Check size={20} strokeWidth={3} />
                          Haan Save Karo
                      </motion.button>
                      <button 
                          onClick={onClose}
                          className="w-full h-[48px] rounded-[18px] bg-transparent border border-red-200 text-red-500 font-bold text-[12px] uppercase tracking-widest active:bg-red-50 transition-colors"
                      >
                          Nahi Cancel Karo
                      </button>
                  </div>
              </div>
            )}
            
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
