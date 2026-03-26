import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { Search, Plus, Users, Building2, Star, Filter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const Customers: React.FC = () => {
  const { udhaars, contacts, toggleContactImportance } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('type') === 'supplier' ? 'suppliers' : 'customers';
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>(initialTab);

  // Compute balance per contact from udhaar entries
  const balanceMap = useMemo(() => {
    const map = new Map<string, number>();
    udhaars.forEach(u => {
      if (u.customerName) {
        map.set(u.customerName.trim(), (map.get(u.customerName.trim()) || 0) + u.amount);
      }
    });
    return map;
  }, [udhaars]);

  // Get contacts for the active tab, merged with udhaar balances
  const filteredContacts = useMemo(() => {
    // DEDUPLICATION: Ensure unique names in the list
    const uniqueContacts = Array.from(new Map(contacts.map(c => [(c.name?.toLowerCase() || ''), c])).values());

    const base = uniqueContacts
      .filter(c => c.type === (activeTab === 'suppliers' ? 'supplier' : 'customer'))
      .map(c => ({
        ...c,
        balance: balanceMap.get(c.name) || 0
      }));

    // Also include legacy udhaar-only people (no contact record) for customers tab
    if (activeTab === 'customers') {
      const contactNames = new Set(uniqueContacts.map(c => c.name?.toLowerCase() || ''));
      udhaars
        .filter(u => u.customerName && !contactNames.has(u.customerName.toLowerCase()))
        .forEach(u => {
          if (!base.find(f => f.name?.toLowerCase() === u.customerName.toLowerCase())) {
            base.push({
              id: 'legacy-' + u.customerName,
              name: u.customerName,
              phone: '',
              type: 'customer',
              initialBalance: 0,
              createdAt: u.date,
              balance: balanceMap.get(u.customerName) || 0
            });
          }
        });
    }

    const min = parseFloat(minAmount) || 0;
    const max = parseFloat(maxAmount) || Infinity;

    return base
      .filter(c => search ? (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)) : true)
      .filter(c => {
        const bal = Math.abs(c.balance);
        return bal >= min && bal <= max;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, udhaars, balanceMap, search, activeTab, minAmount, maxAmount]);

  // Alphabetical groups
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

  // Summary stats from udhaar - scoped to the current view
  const stats = useMemo(() => {
    let totalReceivable = 0; // Money others owe us
    let totalPayable = 0;    // Money we owe others
    
    // Scoped to people shown in this tab
    filteredContacts.forEach(c => {
      const bal = c.balance;
      if (activeTab === 'customers') {
        if (bal > 0) totalReceivable += bal; // Customers owe us
        else totalPayable += Math.abs(bal);  // We owe customers (advance)
      } else {
        if (bal < 0) totalPayable += Math.abs(bal); // We owe suppliers
        else totalReceivable += bal; // Suppliers owe us (advance)
      }
    });
    
    return { 
        totalReceivable, 
        totalPayable,
        netTotal: totalReceivable - totalPayable
    };
  }, [filteredContacts, activeTab]);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto overflow-x-hidden transition-colors" style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="sticky top-0 z-40 transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">The Sovereign Ledger</p>
              <h1 className="text-white font-black text-[20px] tracking-tight">Udhaar Khata</h1>
            </div>
            <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showFilter || minAmount || maxAmount ? 'bg-[#4BFF94] text-[#0A3D24]' : 'bg-white/10 text-white'}`}
            >
              <Filter size={20} />
            </button>
          </div>

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
                        {/* THE PROMINENT APPLY BUTTON */}
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
          <div className="px-4 pb-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-white/50 text-[8px] font-bold uppercase tracking-wider mb-1">Total Net</p>
              <p className="text-white font-black text-[13px]">Rs. {stats.netTotal.toLocaleString()}</p>
            </div>
            <div className="bg-[#00C853]/10 rounded-2xl p-3 text-center border border-[#00C853]/20">
              <p className="text-[#00C853]/70 text-[8px] font-bold uppercase tracking-wider mb-1">
                {activeTab === 'suppliers' ? 'Advance Diya' : 'Udhaar Diya'}
              </p>
              <p className="text-[#00C853] font-black text-[14px]">Rs. {stats.totalReceivable.toLocaleString()}</p>
            </div>
            <div className="bg-[#FF5252]/10 rounded-2xl p-3 text-center border border-[#FF5252]/20">
              <p className="text-[#FF5252]/70 text-[8px] font-bold uppercase tracking-wider mb-1">
                {activeTab === 'suppliers' ? 'Supplier Ka Baqi' : 'Advance Mila'}
              </p>
              <p className="text-[#FF5252] font-black text-[14px]">Rs. {stats.totalPayable.toLocaleString()}</p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or number..."
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl py-2.5 pl-9 pr-4 text-[13px] font-medium outline-none border border-white/10"
              />
            </div>
          </div>

          {/* TABS */}
          {!searchParams.get('type') && (
            <div className="px-4 pb-3 flex gap-2">
              {(['customers', 'suppliers'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === tab ? 'bg-[#4BFF94] text-[#0A3D24]' : 'bg-white/10 text-white/60'}`}
                >
                  {tab === 'customers' ? <Users size={13} /> : <Building2 size={13} />}
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
        <div className="px-4 pt-4 relative">
          {/* Alphabetical sidebar */}
          <div className="fixed right-1.5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0.5">
            {alphabetKeys.map(l => (
              <button
                key={l}
                onClick={() => document.getElementById(`section-${l}`)?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[9px] font-black text-[#0A3D24] dark:text-[#00E676] w-4 text-center"
              >
                {l}
              </button>
            ))}
          </div>

          {filteredContacts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center pt-20">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: card }}>
                <Users size={32} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-bold" style={{ color: sub }}>Koi {activeTab === 'customers' ? 'customer' : 'supplier'} nahi mila</p>
              <button
                onClick={() => navigate(`/add-contact?type=${activeTab === 'suppliers' ? 'supplier' : 'customer'}`)}
                className="mt-4 bg-[#0A3D24] text-white px-6 py-2.5 rounded-2xl text-[12px] font-black"
              >
                + Pehla {activeTab === 'customers' ? 'Customer' : 'Supplier'} Add Karein
              </button>
            </motion.div>
          ) : (
            alphabetKeys.map(letter => (
              <div key={letter} id={`section-${letter}`} className="mb-2">
                <p className="text-[10px] font-black text-[#0A3D24] dark:text-[#00E676] tracking-widest uppercase mb-1.5 ml-1">{letter}</p>
                <div className="rounded-3xl overflow-hidden border" style={{ borderColor: border }}>
                  {grouped[letter].map((c, idx) => {
                    const isLast = idx === grouped[letter].length - 1;
                    const bal = c.balance;
                    const initials = c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    const isOverdue = bal > 0;
                    return (
                      <motion.div
                        key={c.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/customers/${encodeURIComponent(c.name)}`)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:opacity-70 cursor-pointer"
                        style={{
                          backgroundColor: card,
                          borderBottom: isLast ? 'none' : `1px solid ${border}`
                        }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[13px] font-black shrink-0"
                          style={{
                            backgroundColor: isOverdue ? 'rgba(255,82,82,0.12)' : 'rgba(0,200,83,0.10)',
                            color: isOverdue ? '#FF5252' : '#00C853'
                          }}
                        >
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                             {/* STAR ICON — Moved to front for maximum visibility */}
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleContactImportance(c.id);
                               }}
                               className={`transition-all active:scale-75 shrink-0 ${
                                 c.isImportant 
                                   ? 'text-amber-500 scale-110 drop-shadow-sm' 
                                   : 'text-gray-300 dark:text-gray-700 hover:text-gray-400'
                               }`}
                             >
                               <Star size={20} fill={c.isImportant ? "currentColor" : "none"} strokeWidth={c.isImportant ? 0 : 2} />
                             </button>

                             <div className="min-w-0 flex-1">
                               <div className="flex items-center gap-1.5 mb-0.5">
                                 <p className="text-[14px] font-bold truncate" style={{ color: text }}>{c.name}</p>
                                 {isOverdue && c.type === 'customer' && (
                                   <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase leading-none">DUE</span>
                                 )}
                               </div>
                               {c.phone ? (
                                 <p className="text-[11px] font-medium" style={{ color: sub }}>+92 {c.phone.replace('+92', '').trim()}</p>
                               ) : (
                                 <p className="text-[10px] font-medium text-gray-400">No contact (Legacy)</p>
                               )}
                             </div>
                          </div>
                        </div>

                        {/* Balance */}
                        <div className="text-right shrink-0">
                          {bal !== 0 ? (
                            <>
                              <p className={`text-[14px] font-black ${
                                  c.type === 'supplier' 
                                    ? (bal < 0 ? 'text-[#FF5252]' : 'text-[#00C853]')
                                    : (bal > 0 ? 'text-[#FF5252]' : 'text-[#00C853]')
                                }`}>
                                Rs. {Math.abs(bal).toLocaleString()}
                              </p>
                              <p className="text-[9px] font-bold" style={{ color: sub }}>
                                {c.type === 'supplier' 
                                  ? (bal < 0 ? 'Dena Hai' : 'Advance')
                                  : (bal > 0 ? 'Unka Baqi' : 'Aapka Baqi')}
                              </p>
                            </>
                          ) : (
                            <p className="text-[11px] font-black text-[#00C853]">Settled</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/add-contact?type=${activeTab === 'suppliers' ? 'supplier' : 'customer'}`)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-[#0A3D24] rounded-2xl flex items-center justify-center shadow-2xl z-50 border-2 border-[#4BFF94]/20"
        >
          <Plus size={24} className="text-white" strokeWidth={3} />
        </motion.button>
      </div>
    </PageTransition>
  );
};
