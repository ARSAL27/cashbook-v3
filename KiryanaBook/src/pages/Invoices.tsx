import React, { useState, useMemo, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Trash2, Menu, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const Invoices: React.FC = () => {
  const { invoices, deleteInvoice } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const filtered = useMemo(() => {
    let results = invoices
      .filter(inv => {
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return inv.total >= min && inv.total <= max;
      })
      .filter(inv =>
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        (inv.items || []).some(it => it.name.toLowerCase().includes(search.toLowerCase()))
      );
      
    // Always sort by Newest first
    results = [...results].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; 
    });
    
    return results;
  }, [invoices, search, minPrice, maxPrice]);

  // Assuming checkPerms and setShowVoice are defined elsewhere or intended for a different component
  // The provided snippet for useMemo was syntactically incorrect and contained logic typically for useEffect.
  // I'm preserving the original useMemo structure and adding the event listener in a useEffect.
  useEffect(() => {
    // checkPerms(); // Assuming checkPerms is defined and accessible
    const handleOpenVoice = () => {
      // Assuming setShowVoice is a state setter for a voice assistant modal/component
      // For this component, we'll just dispatch the event.
      // If a voice assistant UI needs to be shown, its state should be managed here or globally.
      console.log('openVoiceAssistant event received in Invoices component');
    };
    window.addEventListener('openVoiceAssistant', handleOpenVoice);
    return () => {
      window.removeEventListener('openVoiceAssistant', handleOpenVoice);
    };
  }, []);


  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Invoice delete karna chahte hain?')) return;
    await deleteInvoice(id);
    toast.success('Invoice delete ho gaya');
  };

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative" style={{ backgroundColor: bg }}>
        
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* HEADER */}
        <div className="sticky top-0 z-40 transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3 mb-1">
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl text-white active:scale-90 transition-all"
                >
                    <Menu size={18} />
                </button>
                <div className="flex-1">
                   <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-none">
                     Indus Ledger v3.0
                   </p>
                </div>
                {/* Fallback Voice Button in Header */}
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openVoiceAssistant'));
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-[#4BFF94]/20 rounded-xl text-[#4BFF94] active:scale-90 transition-all"
                >
                    <Mic size={16} strokeWidth={3} />
                </button>
            </div>
            <h1 className="text-white font-black text-[22px] tracking-tight">Purane Invoices</h1>
          </div>

          {/* SEARCH + FILTER */}
          <div className="px-4 pb-3 flex gap-2 w-full">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, ID or item..."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl py-2.5 pl-9 pr-4 text-[12px] font-medium outline-none border border-white/10"
              />
            </div>
          </div>

          {/* PRICE RANGE FILTER */}
          <div className="px-4 pb-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Min Rs."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl py-2 px-4 text-[11px] font-bold outline-none border border-white/10"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Max Rs."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl py-2 px-4 text-[11px] font-bold outline-none border border-white/10"
              />
            </div>
            {(minPrice || maxPrice) && (
              <button 
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="px-3 bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase"
              >
                Clear
              </button>
            )}
          </div>
        </div>



        {/* INVOICE LIST */}
        <div className="px-4 pt-4 space-y-3">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pt-16">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: card }}>
                <FileText size={32} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-bold" style={{ color: sub }}>Koi invoice nahi</p>
              <button
                onClick={() => navigate('/new-invoice')}
                className="mt-4 bg-[#0A3D24] text-white px-6 py-2.5 rounded-2xl text-[12px] font-black"
              >
                + Pehla Invoice Banao
              </button>
            </motion.div>
          ) : (
            filtered.map((inv, idx) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/invoice/${inv.id}`)}
                className="relative overflow-hidden group border rounded-3xl p-4 active:scale-[0.98] transition-all"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[14px] font-black" style={{ color: text }}>{inv.customerName}</p>
                    <p className="text-[10px] font-bold" style={{ color: sub }}>#{inv.invoiceNumber}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${inv.status === 'paid' ? 'bg-[#00C853]/10 text-[#00C853]' : 'bg-[#FF5252]/10 text-[#FF5252]'}`}>
                    {inv.status}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold mb-1" style={{ color: sub }}>
                      {new Date(inv.date).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {inv.items.slice(0, 2).map((it, i) => (
                        <span key={i} className="text-[8px] font-black bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md" style={{ color: sub }}>
                          {it.name}
                        </span>
                      ))}
                      {inv.items.length > 2 && (
                        <span className="text-[8px] font-black bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md" style={{ color: sub }}>
                          +{inv.items.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold" style={{ color: sub }}>Kull Raqam</p>
                    <p className="text-[16px] font-black" style={{ color: text }}>Rs. {inv.total.toLocaleString()}</p>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => handleDelete(inv.id, e)}
                  className="absolute bottom-4 left-4 p-2 rounded-xl text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => navigate('/new-invoice')}
          className="fixed bottom-[90px] right-6 w-14 h-14 rounded-2xl bg-[#0A3D24] text-white shadow-2xl flex items-center justify-center active:scale-95 transition-all z-50 border border-white/10"
        >
          <Plus size={24} />
        </button>
      </div>
    </PageTransition>
  );
};
