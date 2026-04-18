import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { Search, Plus, Users, Building2, Star, Filter, Trash2, Menu, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from '../components/Sidebar';

export const Customers: React.FC = () => {
  const { udhaars, contacts, toggleContactImportance, profile } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const deferredSearch = React.useDeferredValue(search);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('type') === 'supplier' ? 'suppliers' : 'customers';
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>(initialTab);

  const balanceMap = useMemo(() => {
    const map = new Map<string, number>();
    (udhaars || []).forEach(u => {
      if (u.customerName) {
        const name = u.customerName.trim().toLowerCase();
        map.set(name, (map.get(name) || 0) + u.amount);
      }
    });
    return map;
  }, [udhaars]);

  const filteredContacts = useMemo(() => {
    const s = deferredSearch.toLowerCase();
    const uniqueContacts = contacts.filter(c => c.type === (activeTab === 'suppliers' ? 'supplier' : 'customer'));
    const base = uniqueContacts.map(c => ({
        ...c,
        balance: balanceMap.get(c.name.toLowerCase().trim()) || 0
    }));

    if (activeTab === 'customers') {
      const allContactNames = new Set(contacts.map(c => c.name?.toLowerCase().trim()));
      const legacyMap = new Map<string, any>();
      (udhaars || []).forEach(u => {
        if (!u.customerName) return;
        const nameLow = u.customerName.toLowerCase().trim();
        if (!allContactNames.has(nameLow) && !legacyMap.has(nameLow)) {
            legacyMap.set(nameLow, {
              id: 'legacy-' + u.customerName,
              name: u.customerName,
              phone: '',
              type: 'customer',
              initialBalance: 0,
              createdAt: u.date,
              balance: balanceMap.get(nameLow) || 0
            });
        }
      });
      base.push(...Array.from(legacyMap.values()));
    }

    const min = parseFloat(minAmount) || 0;
    const max = parseFloat(maxAmount) || Infinity;

    return base
      .filter(c => s ? (c.name.toLowerCase().includes(s) || c.phone?.includes(s)) : true)
      .filter(c => {
        const bal = Math.abs(c.balance);
        return bal >= min && bal <= max;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, udhaars, balanceMap, deferredSearch, activeTab, minAmount, maxAmount]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredContacts> = {};
    filteredContacts.forEach(c => {
      const letter = (c.name && c.name[0]) ? c.name[0].toUpperCase() : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return groups;
  }, [filteredContacts]);

  const alphabetKeys = Object.keys(grouped).sort();

  const stats = useMemo(() => {
    let totalReceivable = 0;
    let totalPayable = 0;
    filteredContacts.forEach(c => {
      const bal = c.balance;
      if (activeTab === 'customers') {
        if (bal > 0) totalReceivable += bal;
        else totalPayable += Math.abs(bal);
      } else {
        if (bal < 0) totalPayable += Math.abs(bal);
        else totalReceivable += bal;
      }
    });
    
    return { totalReceivable, totalPayable, netTotal: totalReceivable - totalPayable };
  }, [filteredContacts, activeTab]);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  return (
    <PageTransition> 
      <div className="w-full font-outfit max-w-md mx-auto transition-colors " style={{ backgroundColor: bg }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* HEADER */}
        <div className="pt-10 pb-4 sticky top-0 z-40 transition-colors duration-300 shadow-xl" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => navigate('/')} 
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-white active:scale-90 transition-all shadow-lg"
              >
                  <ArrowLeft size={20} />
              </button>

              <div>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5">The Sovereign Ledger</p>
                <h1 className="text-white font-black text-[22px] tracking-tight leading-none">Udhaar Khata</h1>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${showFilter || minAmount || maxAmount ? 'bg-[#4BFF94] text-[#0A3D24]' : 'bg-white/10 text-white'}`}
              >
                <Filter size={20} />
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4BFF94] shadow-lg"
              >
                 <img src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} alt="Profile" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <div className="h-4" /> {/* Row Spacer */}

          <AnimatePresence>
            {showFilter && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 overflow-hidden"
                >
                    <div className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/5 shadow-2xl">
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">Filter by Amount Range (Rs.)</p>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1">
                                <p className="text-white/30 text-[8px] font-bold mb-1 uppercase">Minimum</p>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={minAmount}
                                    onChange={e => setMinAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[12px] font-bold outline-none focus:border-[#4BFF94]"
                                />
                            </div>
                            <div className="w-4 h-px bg-white/10 mt-4" />
                            <div className="flex-1">
                                <p className="text-white/30 text-[8px] font-bold mb-1 uppercase">Maximum</p>
                                <input 
                                    type="number" 
                                    placeholder="Any"
                                    value={maxAmount}
                                    onChange={e => setMaxAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[12px] font-bold outline-none focus:border-[#4BFF94]"
                                />
                            </div>
                            <button 
                                onClick={() => { setMinAmount(''); setMaxAmount(''); }}
                                className="mt-4 p-2.5 bg-red-500/10 text-red-400 rounded-xl active:scale-90 transition-all border border-red-500/20"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowFilter(false)}
                            className="w-full py-3.5 rounded-2xl bg-[#4BFF94] text-[#0A3D24] font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <Filter size={16} fill="currentColor" />
                            Apply All Filters
                        </motion.button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* SUMMARY CARDS */}
          <div className="px-4 pb-2 grid grid-cols-3 gap-2.5">
            <div className="bg-white/10 rounded-2xl p-3 text-center transition-all active:scale-95">
              <p className="text-white/50 text-[8px] font-bold uppercase tracking-wider mb-1">Total Net</p>
              <p className="text-white font-black text-[13px]">Rs. {stats.netTotal.toLocaleString()}</p>
            </div>
            <div className="bg-[#00C853]/10 rounded-2xl p-3 text-center border border-[#00C853]/20 transition-all active:scale-95">
              <p className="text-[#00C853]/70 text-[8px] font-bold uppercase tracking-wider mb-1">
                {activeTab === 'suppliers' ? 'Advance Diya' : 'Udhaar Diya'}
              </p>
              <p className="text-[#00C853] font-black text-[14px]">Rs. {stats.totalReceivable.toLocaleString()}</p>
            </div>
            <div className="bg-[#FF5252]/10 rounded-2xl p-3 text-center border border-[#FF5252]/20 transition-all active:scale-95">
              <p className="text-[#FF5252]/70 text-[8px] font-bold uppercase tracking-wider mb-1">
                {activeTab === 'suppliers' ? 'Supplier Ka Baqi' : 'Advance Mila'}
              </p>
              <p className="text-[#FF5252] font-black text-[14px]">Rs. {stats.totalPayable.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-1" />

          {/* SEARCH */}
          <div className="px-4 pb-3">
            <div className="relative group">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#4BFF94] transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or number..."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl py-3 pl-9 pr-4 text-[13px] font-medium outline-none border border-white/10 focus:border-[#4BFF94]/50 focus:bg-white/15 transition-all"
              />
            </div>
          </div>

          {/* TABS */}
          {!searchParams.get('type') && (
            <div className="px-4 pb-1 flex gap-2">
              {(['customers', 'suppliers'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-[#4BFF94] text-[#0A3D24] shadow-lg shadow-[#4BFF94]/10' : 'bg-white/10 text-white/60'}`}
                >
                  {tab === 'customers' ? <Users size={14} /> : <Building2 size={14} />}
                  {tab === 'customers' 
                    ? `Customers (${new Set([...contacts.filter(c => c.type === 'customer').map(c => c.name?.toLowerCase() || ''), ...udhaars.map(u => u.customerName?.toLowerCase() || '').filter(name => name && !contacts.find(c => c.name?.toLowerCase() === name && c.type === 'supplier'))]).size})` 
                    : `Suppliers (${contacts.filter(c => c.type === 'supplier').length})`
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTACT LIST */}
        <div className="px-4 pt-6 relative pb-24">
          {/* Alphabetical sidebar - MOVE MORE TO RIGHT AND SMALLER */}
          <div className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 bg-black/20 rounded-full py-3 px-1.5 backdrop-blur-md border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
            {alphabetKeys.map(l => (
              <button
                key={l}
                onClick={() => {
                  const element = document.getElementById(`letter-${l}`);
                  if (element) {
                    const headerHeight = 320; // Approx sticky header height
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }}
                className="text-[9px] font-black text-white/50 hover:text-[#4BFF94] transition-colors"
              >
                {l}
              </button>
            ))}
          </div>

          {alphabetKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
               <Users size={60} className="mb-4" />
               <p className="font-bold text-[14px]">No contacts found</p>
            </div>
          ) : (
            alphabetKeys.map(letter => (
              <div key={letter} id={`letter-${letter}`} className="mb-3">
                <div className="flex items-center gap-3 mb-2 sticky top-[280px] z-10 transition-colors" style={{ backgroundColor: bg }}>
                  <div className="w-8 h-8 rounded-lg bg-[#4BFF94]/10 border border-[#4BFF94]/20 flex items-center justify-center text-[#4BFF94] font-black text-[12px] shadow-sm">
                    {letter}
                  </div>
                  <div className="h-px flex-1 opacity-20" style={{ backgroundColor: text }} />
                </div>
                
                <div className="grid gap-3">
                  {grouped[letter].map(contact => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(`/customers/${encodeURIComponent(contact.name)}`)}
                      className="group rounded-2xl p-2.5 border transition-all active:scale-[0.98] shadow-sm flex items-center justify-between"
                      style={{ backgroundColor: card, borderColor: border }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[14px] shadow-inner ${
                          contact.balance > 0 ? 'bg-green-500/20 text-green-400' : 
                          contact.balance < 0 ? 'bg-red-500/20 text-red-400' : 
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {contact.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-[15px] group-hover:text-[#4BFF94] transition-colors" style={{ color: text }}>{contact.name}</h3>
                            {contact.isImportant && <Star size={10} fill="#4BFF94" className="text-[#4BFF94]" />}
                          </div>
                          <p className="text-[11px] font-medium" style={{ color: sub }}>
                            {contact.phone || 'No contact info'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-black text-[14px] mb-0.5 ${
                          contact.balance > 0 ? 'text-green-400' : 
                          contact.balance < 0 ? 'text-red-400' : 
                          'text-white/20'
                        }`}>
                          {contact.balance === 0 ? 'Settled' : `Rs. ${Math.abs(contact.balance).toLocaleString()}`}
                        </p>
                        <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">
                          {contact.balance > 0 ? (activeTab === 'customers' ? 'Lena Hai' : 'Advance') : 
                           contact.balance < 0 ? (activeTab === 'customers' ? 'Advance' : 'Dena Hai') : 
                           'Closed'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ADD FAB */}
        <button
          onClick={() => navigate('/add-udhaar')}
          className="fixed bottom-24 right-6 w-16 h-16 bg-[#4BFF94] text-[#0A3D24] rounded-2xl shadow-[0_8px_30px_rgb(75,255,148,0.3)] flex items-center justify-center active:scale-90 transition-all z-50 border-4 border-[#10251A]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>
    </PageTransition>
  );
};
