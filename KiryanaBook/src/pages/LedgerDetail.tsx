import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';

export const LedgerDetail: React.FC = () => {
  const { udhaars, contacts } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentView = (searchParams.get('view') || 'receivables') as 'receivables' | 'payables' | 'advances';

  // Compute balance per contact from udhaar entries
  const balanceMap = useMemo(() => {
    const map = new Map<string, number>();
    udhaars.forEach(u => {
      if (!u.customerName) return;
      const nameKey = u.customerName.trim();
      // Look for an existing key that matches case-insensitively
      const existingKey = Array.from(map.keys()).find(k => k.toLowerCase() === nameKey.toLowerCase());
      const finalKey = existingKey || nameKey;
      map.set(finalKey, (map.get(finalKey) || 0) + (u.amount || 0));
    });
    return map;
  }, [udhaars]);

  const filteredEntries = useMemo(() => {
    const list: Array<{ name: string; balance: number; type: 'customer' | 'supplier'; isImportant?: boolean }> = [];
    
    // Get all names that have a balance
    const allNames = Array.from(balanceMap.keys());
    
    allNames.forEach(name => {
      const bal = balanceMap.get(name) || 0;
      const contact = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
      const type = contact?.type || 'customer'; // Default to customer for legacy entries
      const isImportant = contact?.isImportant || false;

      if (currentView === 'receivables' && type === 'customer' && bal > 0) {
        list.push({ name, balance: bal, type: 'customer', isImportant });
      } else if (currentView === 'payables' && type === 'supplier' && bal < 0) {
        list.push({ name, balance: Math.abs(bal), type: 'supplier', isImportant });
      } else if (currentView === 'advances') {
          // Advance check
          if (type === 'customer' && bal < 0) {
            list.push({ name, balance: Math.abs(bal), type: 'customer', isImportant });
          } else if (type === 'supplier' && bal > 0) {
            list.push({ name, balance: bal, type: 'supplier', isImportant });
          }
      }
    });

    return list.sort((a, b) => b.balance - a.balance);
  }, [contacts, balanceMap, currentView]);

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  const viewLabels = {
    receivables: 'Lena Hai',
    payables: 'Dena Hai',
    advances: 'Advance Entries'
  };

  return (
    <PageTransition> <div className="w-full font-outfit max-w-md mx-auto " style={{ backgroundColor: bg }}>
        {/* HEADER */}
        <div className="px-5 pt-14 pb-14 rounded-b-[2rem] relative shadow-lg transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform p-1">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-white font-black text-[18px] tracking-wide">Detailed Ledger</h1>
            <div className="w-8" />
          </div>
          <div className="flex flex-col items-center">
             <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10 mb-2">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{viewLabels[currentView]}</p>
             </div>
             <p className="text-white text-[28px] font-black">
                Rs. {filteredEntries.reduce((a, b) => a + b.balance, 0).toLocaleString()}
             </p>
          </div>
        </div>

        {/* TABS */}
        <div className="px-5 -mt-10 mb-6 flex gap-2">
            {(['receivables', 'payables', 'advances'] as const).map(v => (
                <button
                    key={v}
                    onClick={() => setSearchParams({ view: v })}
                    className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg ${currentView === v ? 'bg-[#4BFF94] text-[#0A3D24] scale-105 z-10' : 'bg-white dark:bg-[#1E1E1E] text-gray-400 opacity-60'}`}
                >
                    {v === 'receivables' ? 'Lena' : v === 'payables' ? 'Dena' : 'Advance'}
                </button>
            ))}
        </div>

        {/* ENTRIES LIST */}
        <div className="px-5 space-y-3">
            {filteredEntries.map((e, i) => (
                <motion.div
                    key={e.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/customers/${encodeURIComponent(e.name)}`)}
                    className="group"
                >
                    <div className="flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] border shadow-sm" style={{ backgroundColor: card, borderColor: border }}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[15px] ${e.type === 'supplier' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>
                                {e.name[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[14px] font-black" style={{ color: text }}>{e.name}</p>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-full text-gray-400">
                                        ({e.type === 'customer' ? 'Customer' : 'Supplier'})
                                    </span>
                                    {e.isImportant && <Star size={10} className="text-amber-400" fill="currentColor" />}
                                </div>
                                <p className="text-[9px] font-bold mt-0.5 flex items-center gap-1" style={{ color: sub }}>
                                    {e.type === 'supplier' ? <Building2 size={10} /> : <Users size={10} />}
                                    View full history
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-[15px] font-black ${
                                currentView === 'receivables' ? 'text-[#00C853]' : 
                                currentView === 'payables' ? 'text-[#FF5252]' : 
                                (e.type === 'customer' ? 'text-red-500' : 'text-green-600')
                            }`}>
                                Rs. {e.balance.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    currentView === 'receivables' ? 'bg-[#00C853]' : 
                                    currentView === 'payables' ? 'bg-[#FF5252]' : 
                                    (e.type === 'customer' ? 'bg-red-500' : 'bg-green-600')
                                }`} />
                                <p className="text-[8px] font-black uppercase tracking-wider" style={{ color: sub }}>
                                    {currentView === 'receivables' ? 'Outstanding' : currentView === 'payables' ? 'Debt' : 'Advance Payment'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {filteredEntries.length === 0 && (
                <EmptyState 
                    icon={Users}
                    title="Koi Entry Nahi Hai"
                    description={`Abhi tak aapne koi ${currentView === 'receivables' ? 'Lena (Receivable)' : currentView === 'payables' ? 'Dena (Payable)' : 'Advance'} entry nahi ki hai.`}
                    action={{
                        label: "+ Nayi Entry",
                        onClick: () => navigate('/add-sale')
                    }}
                />
            )}
        </div>
      </div>
    </PageTransition>
  );
};

export default LedgerDetail;
