import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Trash2, Menu, Filter, Calendar } from 'lucide-react';
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
      <div className="w-full font-outfit max-w-md mx-auto relative " style={{ backgroundColor: bg }}>
        
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* HEADER - COMPACTED SPACING */}
        <div className="pt-10 pb-4 sticky top-0 z-40 transition-colors duration-300 shadow-sm" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="px-5">
            <div className="flex items-center gap-3 mb-1">
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl text-white active:scale-90 transition-all"
                >
                    <Menu size={18} />
                </button>
                <div className="flex-1">
                   <p className="text-white/50 text-[10px] font-black uppercase tracking-widest leading-none">
                     Standard Records
                   </p>
                </div>
                <button 
                  onClick={() => navigate('/settings')} 
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#4BFF94]"
                >
                  <img src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} alt="Avatar" className="w-full h-full object-cover" />
                </button>
            </div>
            <h1 className="text-white font-black text-[22px] tracking-tight">Billing History</h1>
          </div>

          <div className="px-4 pb-4 flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Find Record..."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl py-3 pl-10 pr-4 text-[12px] font-bold outline-none border border-white/10"
              />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${showFilters ? 'bg-[#4BFF94] border-[#4BFF94] text-[#0A3D24]' : 'bg-white/10 border-white/10 text-white'}`}
            >
                <Filter size={20} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/10"
                >
                    <div className="px-5 pb-5 pt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">Min Price</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30">Rs</span>
                                    <input
                                        type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0"
                                        className="w-full bg-white/5 text-white placeholder-white/20 rounded-xl py-2.5 pl-8 pr-3 text-[11px] font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">Max Price</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30">Rs</span>
                                    <input
                                        type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any"
                                        className="w-full bg-white/5 text-white placeholder-white/20 rounded-xl py-2.5 pl-8 pr-3 text-[11px] font-bold outline-none"
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
        <div className="px-4 pt-4 space-y-3 pb-32">
          {filtered.length === 0 ? (
            <EmptyState 
                icon={FileText} title="No Records" description="No invoices found matching your criteria."
                action={{ label: "Create Invoice", onClick: () => navigate('/new-invoice') }}
            />
          ) : (
            filtered.map((inv, idx) => (
              <motion.div
                key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/invoice/${inv.id}`)}
                className="relative overflow-hidden group border rounded-3xl p-4 active:scale-[0.98] transition-all"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[14px] font-black" style={{ color: text }}>{inv.customerName}</p>
                    <p className="text-[9px] font-bold opacity-40">#{inv.invoiceNumber}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${inv.status === 'paid' ? 'bg-[#00C853]/10 text-[#00C853]' : 'bg-[#FF5252]/10 text-[#FF5252]'}`}>
                    {inv.status}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold opacity-40 leading-none mb-1.5">{new Date(inv.date).toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-1">
                      {inv.items.slice(0, 2).map((it, i) => (
                        <span key={i} className="text-[8px] font-black bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md" style={{ color: sub }}>{it.name}</span>
                      ))}
                      {inv.items.length > 2 && <span className="text-[8px] font-black bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md" style={{ color: sub }}>+{inv.items.length - 2}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black tabular-nums" style={{ color: text }}>Rs. {inv.total.toLocaleString()}</p>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => handleDelete(inv.id, e)}
                  className="absolute bottom-4 left-4 p-2 rounded-xl text-red-500/20 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/new-invoice')}
          className="fixed bottom-32 right-5 w-16 h-16 bg-[#4BFF94] rounded-2xl flex items-center justify-center shadow-2xl z-[90] border-4 border-white dark:border-[#0A0A0A]"
        >
          <Plus size={32} className="text-[#0A3D24]" strokeWidth={3} />
        </motion.button>
      </div>
    </PageTransition>
  );
};
