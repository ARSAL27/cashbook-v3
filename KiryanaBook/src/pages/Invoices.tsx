import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Trash2, Menu, Filter, Calendar, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import toast from 'react-hot-toast';

export const Invoices: React.FC = () => {
  const { invoices, deleteInvoice, profile } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const filtered = useMemo(() => {
    let results = invoices
      .filter(inv => {
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        if (inv.total < min || inv.total > max) return false;

        if (dateFrom) {
          const invDate = new Date(inv.date).setHours(0,0,0,0);
          const from = new Date(dateFrom).setHours(0,0,0,0);
          if (invDate < from) return false;
        }
        if (dateTo) {
          const invDate = new Date(inv.date).setHours(23,59,59,999);
          const to = new Date(dateTo).setHours(23,59,59,999);
          if (invDate > to) return false;
        }
        return true;
      })
      .filter(inv =>
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        (inv.items || []).some(it => it.name.toLowerCase().includes(search.toLowerCase()))
      );
      
    results = [...results].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; 
    });
    
    return results;
  }, [invoices, search, minPrice, maxPrice, dateFrom, dateTo]);

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
      <div className="w-full font-outfit max-w-md mx-auto relative min-h-screen" style={{ backgroundColor: bg }}>
        
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* HEADER - INCREASED PADDING */}
        <div className="pt-10 pb-4 sticky top-0 z-40 transition-colors duration-300 shadow-xl" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="px-5">
            <div className="flex items-center gap-3 mb-3">
                <button 
                  onClick={() => navigate('/')} 
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-white active:scale-90 transition-all shadow-lg"
                >
                    <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-white active:scale-90 transition-all shadow-lg"
                >
                    <Menu size={18} />
                </button>
                <div className="flex-1">
                   <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1">
                     The Sovereign Ledger
                   </p>
                   <h1 className="text-white font-black text-[22px] tracking-tight leading-none">Billing History</h1>
                </div>
                <button 
                  onClick={() => navigate('/settings')} 
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4BFF94] shadow-lg"
                >
                  <img src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} alt="Avatar" className="w-full h-full object-cover" />
                </button>
            </div>
          </div>

          <div className="px-4 pb-1 flex gap-2">
            <div className="relative flex-1 group">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#4BFF94] transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Find Record..."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl py-3 pl-10 pr-4 text-[13px] font-bold outline-none border border-white/10 focus:border-[#4BFF94]/50 focus:bg-white/15 transition-all"
              />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-lg ${showFilters ? 'bg-[#4BFF94] border-[#4BFF94] text-[#0A3D24]' : 'bg-white/10 border-white/10 text-white'}`}
            >
                <Filter size={20} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/10 mt-2"
                >
                    <div className="px-5 pb-5 pt-3 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">Min Price</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30">Rs</span>
                                    <input
                                        type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0"
                                        className="w-full bg-white/5 text-white placeholder-white/20 rounded-xl py-2.5 pl-8 pr-3 text-[11px] font-bold outline-none border border-white/5"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">Max Price</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30">Rs</span>
                                    <input
                                        type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any"
                                        className="w-full bg-white/5 text-white placeholder-white/20 rounded-xl py-2.5 pl-8 pr-3 text-[11px] font-bold outline-none border border-white/5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-1.5">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">From</p>
                                <input
                                    type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                    className="w-full bg-white/5 text-white py-2.5 px-3 rounded-xl text-[10px] font-black outline-none border border-white/5"
                                />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">To</p>
                                <input
                                    type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                    className="w-full bg-white/5 text-white py-2.5 px-3 rounded-xl text-[10px] font-black outline-none border border-white/5"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INVOICE LIST */}
        <div className="px-4 pt-6 space-y-4 pb-32">
          {filtered.length === 0 ? (
            <EmptyState 
                icon={FileText} title="No Records Found" description="Try adjusting your filters or searching for something else."
                action={{ label: "Create Invoice", onClick: () => navigate('/new-invoice') }}
            />
          ) : (
            filtered.map((inv, idx) => (
              <motion.div
                key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/invoice/${inv.id}`)}
                className="relative overflow-hidden group border rounded-3xl p-4 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all active:scale-[0.98]"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[15px] font-black" style={{ color: text }}>{inv.customerName}</h3>
                    <p className="text-[9px] font-bold opacity-30 mt-0.5 tracking-widest uppercase">#{inv.invoiceNumber}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'bg-green-500/10 text-green-500 shadow-sm shadow-green-500/5' : 'bg-red-500/10 text-red-500 shadow-sm shadow-red-500/5'}`}>
                    {inv.status}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-[9px] font-black opacity-30 leading-none mb-2 uppercase tracking-tight">{new Date(inv.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inv.items.slice(0, 3).map((it, i) => (
                        <span key={i} className="text-[9px] font-black bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-transparent dark:border-white/5" style={{ color: sub }}>{it.name}</span>
                      ))}
                      {inv.items.length > 3 && <span className="text-[9px] font-black bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-transparent dark:border-white/5" style={{ color: sub }}>+{inv.items.length - 3}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-black tabular-nums" style={{ color: text }}>Rs. {inv.total.toLocaleString()}</p>
                    <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-0.5">{inv.paymentMethod}</p>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => handleDelete(inv.id, e)}
                  className="absolute bottom-4 left-4 p-2 rounded-xl text-red-500/10 hover:text-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/new-invoice')}
          className="fixed bottom-24 right-6 w-16 h-16 bg-[#4BFF94] rounded-2xl flex items-center justify-center shadow-xl shadow-[#4BFF94]/20 z-[90] border-4 border-[#10251A]"
        >
          <Plus size={32} className="text-[#0A3D24]" strokeWidth={3} />
        </motion.button>
      </div>
    </PageTransition>
  );
};
