import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { Users, Plus, Minus, Bell, HandCoins, BarChart2, Filter, ArrowDownLeft, ArrowUpRight, AlertTriangle, Menu, MessageCircle, Mic } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const Dashboard: React.FC = () => {
  const { 
    sales, expenses, udhaars, profile, notifications, contacts, stock
  } = useShop();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: 0, max: Infinity });
  const [showFilter, setShowFilter] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalToday = sales.filter(s => s.date.startsWith(today)).reduce((a, s) => a + s.total, 0);
    const totalExpenses = expenses.filter(e => e.date.startsWith(today)).reduce((a, e) => a + e.amount, 0);
    
    const customerBalances: Record<string, number> = {};
    udhaars.forEach(u => {
      customerBalances[u.customerName] = (customerBalances[u.customerName] || 0) + u.amount;
    });
    
    let receivable = 0;
    let payable = 0;
    let customerAdvance = 0;
    let supplierAdvance = 0;

    Object.entries(customerBalances).forEach(([name, bal]) => {
      const contact = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
      const type = contact?.type || 'customer';
      
      if (type === 'customer') {
        if (bal > 0) receivable += bal;
        else if (bal < 0) customerAdvance += Math.abs(bal);
      } else {
        if (bal < 0) payable += Math.abs(bal);
        else if (bal > 0) supplierAdvance += bal;
      }
    });

    const dueCustomersCount = Object.values(customerBalances).filter(b => b > 0).length;
    const uniqueCustomers = Object.keys(customerBalances).length;
    
    // Calculate low stock items
    const lowStockItems = (stock || []).filter(item => item.quantity <= (item.minThreshold || 5));
    
    return { 
      totalToday, totalExpenses, receivable, payable, customerAdvance, supplierAdvance, 
      dueCustomersCount, uniqueCustomers, lowStockItems 
    };
  }, [sales, expenses, udhaars, contacts, stock]);

  const weeklyData = useMemo(() => {
    const days = [0,1,2,3,4,5,6];
    const now = new Date();
    return days.map(d => {
      const date = new Date(now); date.setDate(now.getDate() - (6 - d));
      const ds = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const value = sales.filter(s => s.date.startsWith(ds)).reduce((a, s) => a + s.total, 0);
      return { dayName, value };
    });
  }, [sales]);


  const recentActivity = useMemo(() => {
    const s = sales.map(item => ({ ...item, _type: 'sale' as const }));
    const e = expenses.map(item => ({ ...item, _type: 'expense' as const }));
    const all = [...s, ...e].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return all.filter(item => {
      const amount = item._type === 'sale' ? item.total : item.amount;
      return amount >= amountRange.min && (amountRange.max === Infinity || amount <= amountRange.max);
    }).slice(0, 5);
  }, [sales, expenses, amountRange]);

  const urgentUdhaars = useMemo(() => {
    const importantContacts = contacts.filter(c => c.isImportant);
    const importantNames = importantContacts.map(c => c.name);
    
    // Group all pending balances
    const balances: Record<string, number> = {};
    udhaars.forEach(u => {
      balances[u.customerName] = (balances[u.customerName] || 0) + u.amount;
    });

    // Pick customers to show: Important ones FIRST, then ones with urgent transactions
    const urgentTransactionNames = udhaars.filter(u => u.isUrgent).map(u => u.customerName);
    const targetNames = Array.from(new Set([...importantNames, ...urgentTransactionNames]));

    return targetNames
      .filter(name => (balances[name] || 0) !== 0 || importantNames.includes(name)) // Always show starred ones
      .map(name => ({
        customerName: name,
        totalBalance: balances[name],
        isImportant: importantNames.includes(name)
      }))
      .sort((a, b) => (a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1)); // Important first
  }, [udhaars, contacts]);

  const aiInsight = useMemo(() => {
    if (stats.lowStockItems.length > 3) {
      return { 
        title: "Stock Alert", 
        msg: `${stats.lowStockItems.length} items khatam ho rahe hain. Jald mangwaein!`,
        color: "orange" 
      };
    }
    if (stats.receivable > 20000) {
      return { 
        title: "Udhaar Recovery", 
        msg: `Rs. ${stats.receivable.toLocaleString()} market mein hai. Wasooli ka waqt hai!`,
        color: "red" 
      };
    }
    if (stats.totalToday > 5000) {
      return { 
        title: "Masha'Allah!", 
        msg: "Aaj ki sale zabardast ja rahi hai. Allah Barkat de!",
        color: "green" 
      };
    }
    return { 
      title: "AI Munshi", 
      msg: "Assalam-o-Alaikum! Shop ka haal jaanne ke liye mujh se poochein.",
      color: "green" 
    };
  }, [stats]);

  return (
    <PageTransition>
      <div className="w-full bg-[#F2F2F7] dark:bg-[#0A0A0A] font-outfit max-w-md mx-auto pb-8 transition-colors duration-300">

        {/* ── HEADER ── */}
        <div className="sticky top-0 z-50 px-5 pt-safe pt-3 pb-4 border-b transition-colors duration-300 dark:border-[#2A2A2A]" style={{ backgroundColor: isDarkMode ? '#10251A' : '#1A5C38' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 bg-[#ffffff18] dark:bg-[#141414] rounded-xl flex items-center justify-center border dark:border-[#2A2A2A] active:scale-90 transition-transform"
              >
                <Menu size={20} className="text-white dark:text-[#00E676]" />
              </button>
              <div>
                <p className="text-[10px] text-white/50 dark:text-[#B0B0B0] font-semibold uppercase tracking-widest leading-none mb-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[18px] text-white font-black leading-tight truncate max-w-[180px]">{profile?.name || 'My Shop'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/notifications')}
                className="relative w-9 h-9 bg-[#ffffff12] dark:bg-[#141414] rounded-full flex items-center justify-center border dark:border-[#2A2A2A]"
              >
                <Bell size={17} className="text-white dark:text-[#B0B0B0]" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full border-2 border-[#1A5C38] dark:border-[#141414] text-[9px] text-white flex items-center justify-center font-black px-0.5">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 dark:border-[#2A2A2A]">
                <img src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} alt="Avatar" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </div>

        {/* ── BALANCE CARD ── */}
        <div className="px-4 -mt-0.5">
          <div className="rounded-b-[2.5rem] px-6 pb-6 pt-1 border-x border-b transition-all duration-300 dark:border-[#2E4A35]" style={{ background: isDarkMode ? 'linear-gradient(to bottom right, #10251A, #1A3A25)' : '#1A5C38' }}>
            <p className="text-[11px] text-white/50 dark:text-[#B0B0B0]/60 font-semibold uppercase tracking-widest mb-1">{t('today_balance')}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[34px] font-black text-white leading-none tracking-wide">
                  Rs. {(stats.totalToday - stats.totalExpenses).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-white/10 dark:bg-[#00E676]/10 rounded-lg flex items-center justify-center border dark:border-[#00E676]/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white dark:text-[#00E676]">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                </svg>
              </div>
            </div>

            {/* Cash In / Cash Out row */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 dark:border-white/5">
              <button
                onClick={() => navigate('/cashflow?type=in')}
                className="flex items-center gap-2 flex-1 active:opacity-70 transition-opacity text-left"
              >
                <div className="w-8 h-8 bg-[#22C55E]/20 dark:bg-[#00C853]/10 rounded-xl flex items-center justify-center">
                  <ArrowDownLeft size={16} className="text-[#4ADE80] dark:text-[#00C853]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-white/40 dark:text-[#B0B0B0]/40 font-bold uppercase tracking-wider leading-none mb-0.5">CASH IN</p>
                  <p className="text-[13px] text-white font-bold leading-none">Rs. {stats.totalToday.toLocaleString()}</p>
                </div>
              </button>
              <div className="w-px h-8 bg-white/10 dark:bg-white/5" />
              <button
                onClick={() => navigate('/cashflow?type=out')}
                className="flex items-center gap-2 flex-1 active:opacity-70 transition-opacity text-left"
              >
                <div className="w-8 h-8 bg-[#F59E0B]/20 dark:bg-[#FF5252]/10 rounded-xl flex items-center justify-center">
                  <ArrowUpRight size={16} className="text-[#FCD34D] dark:text-[#FF5252]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] text-white/40 dark:text-[#B0B0B0]/40 font-bold uppercase tracking-wider leading-none mb-0.5">CASH OUT</p>
                  <p className="text-[13px] text-white font-bold leading-none">Rs. {stats.totalExpenses.toLocaleString()}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── AI MUNSHI WIDGET ── */}
        <div className="px-4 mt-3">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => navigate('/manager', { state: { autoStartVoice: true } })}
            className={`relative overflow-hidden rounded-[2rem] p-5 border shadow-sm cursor-pointer active:scale-[0.98] transition-all ${
              aiInsight.color === 'red' ? 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/40' :
              aiInsight.color === 'orange' ? 'bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/40' :
              'bg-[#00E676]/10 border-[#00E676]/20 dark:bg-[#00E676]/5 dark:border-[#00E676]/10'
            }`}
          >
            {/* Background accent */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/40 dark:bg-white/5 rounded-full blur-2xl opacity-50" />
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  aiInsight.color === 'red' ? 'bg-red-500' :
                  aiInsight.color === 'orange' ? 'bg-orange-500' :
                  'bg-[#00E676]'
                }`}>
                  <MessageCircle className="text-[#0A0A0A]" size={24} strokeWidth={2.5} />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className={`absolute inset-0 rounded-2xl -z-10 ${
                    aiInsight.color === 'red' ? 'bg-red-400' :
                    aiInsight.color === 'orange' ? 'bg-orange-400' :
                    'bg-[#00E676]'
                  }`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    aiInsight.color === 'red' ? 'text-red-700' :
                    aiInsight.color === 'orange' ? 'text-orange-700' :
                    'text-[#00A846]'
                  }`}>
                    {aiInsight.title}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    aiInsight.color === 'red' ? 'bg-red-500' :
                    aiInsight.color === 'orange' ? 'bg-orange-500' :
                    'bg-[#00E676]'
                  }`} />
                </div>
                <p className="text-[15px] font-black text-[#0A3D24] dark:text-gray-100 leading-tight">
                  {aiInsight.msg}
                </p>
              </div>
              
              <div className="bg-white/60 dark:bg-white/5 p-2 rounded-xl backdrop-blur-md border border-white/50 dark:border-white/5">
                <Mic size={18} className={
                  aiInsight.color === 'red' ? 'text-red-500' :
                  aiInsight.color === 'orange' ? 'text-orange-500' :
                  'text-[#00A846]'
                } />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── CENTRAL LEDGER BUTTON ── */}
        <div className="px-4 mt-3">
          <button 
            onClick={() => navigate('/ledger')} 
            className="w-full bg-white dark:bg-[#141414] rounded-[2rem] p-5 shadow-sm border border-transparent dark:border-white/5 active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#B0B0B0]/60 mb-1">Shop Khata</p>
                <h2 className="text-[18px] font-black text-[#0A3D24] dark:text-[#4BFF94]">Cash Flow Statement</h2>
              </div>
              <div className="w-12 h-12 bg-[#0A3D24]/5 dark:bg-[#4BFF94]/5 rounded-2xl flex items-center justify-center">
                <BarChart2 className="text-[#0A3D24] dark:text-[#4BFF94]" size={22} />
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-gray-50 dark:border-white/5">
                <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lena Hai</p>
                    <p className="text-[14px] font-black text-green-600 truncate">Rs. {stats.receivable.toLocaleString()}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:border-white/5" />
                <div className="flex-1 px-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dena Hai</p>
                    <p className="text-[14px] font-black text-red-500 truncate">Rs. {stats.payable.toLocaleString()}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:border-white/5" />
                <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Advances</p>
                    <p className="text-[14px] font-black text-blue-500 truncate">Rs. {(stats.customerAdvance + stats.supplierAdvance).toLocaleString()}</p>
                </div>
            </div>
          </button>
        </div>

        {/* ── LOW STOCK ALERT ── */}
        {stats.lowStockItems.length > 0 && (
          <div className="px-4 mt-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => navigate('/stock')}
              className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-3xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-[13px] font-black text-orange-900 dark:text-orange-200 leading-tight">
                    {stats.lowStockItems.length} Items Low Stock
                  </p>
                  <p className="text-[10px] text-orange-700/60 dark:text-orange-400/50 font-bold uppercase tracking-wider">
                    Jald Restock Karein
                  </p>
                </div>
              </div>
              <div className="flex -space-x-2">
                {stats.lowStockItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-white dark:bg-[#141414] overflow-hidden">
                    <img 
                      src={item.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.name}`} 
                      alt="" className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* ── QUICK ACTIONS GRID ── */}
        <div className="px-4 mt-4 grid grid-cols-4 gap-3">
          {[
            { icon: <Plus size={22} strokeWidth={2.5} className="text-[#1A5C38] dark:text-[#00E676]" />, label: 'CASH IN', path: '/add-sale', bg: '#E8F5EE', darkBg: '#1A3A25' },
            { icon: <Minus size={22} strokeWidth={2.5} className="text-red-500" />, label: 'CASH OUT', path: '/add-expense', bg: '#FEF2F2', darkBg: '#3A1A1A' },
            { icon: <HandCoins size={20} strokeWidth={2} className="text-amber-500 dark:text-[#FFB300]" />, label: 'UDHAAR', path: '/add-udhaar', bg: '#FFFBEB', darkBg: '#3A2E1A' },
            { icon: <BarChart2 size={20} strokeWidth={2} className="text-blue-500" />, label: 'HISAAB', path: '/reports', bg: '#EFF6FF', darkBg: '#1A2A3A' },
          ].map((a, i) => (
            <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => navigate(a.path)} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center shadow-sm border border-transparent dark:border-white/5" style={{ backgroundColor: isDarkMode ? (a as any).darkBg : a.bg }}>
                {a.icon}
              </div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#B0B0B0] uppercase tracking-wide text-center leading-tight">{a.label}</p>
            </motion.button>
          ))}
        </div>


        {/* ── WEEKLY CHART ── */}
        <div className="px-4 mt-5">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/reports-detail')}
            className="bg-white dark:bg-[#141414] rounded-3xl px-5 py-5 shadow-sm border border-transparent dark:border-[#2A2A2A] cursor-pointer"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-[14px] font-black text-gray-800 dark:text-white">Hisaab Ka Graph</p>
              <p className="text-[11px] text-gray-400 dark:text-[#B0B0B0] font-semibold">Last 7 Days</p>
            </div>
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDarkMode ? '#00E676' : '#1A5C38'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={isDarkMode ? '#00E676' : '#1A5C38'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke={isDarkMode ? '#00E676' : '#1A5C38'} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#2A2A2A' : '#F3F4F6'} />
                  <XAxis dataKey="dayName" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: isDarkMode ? '#555' : '#9ca3af', fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── ZAROORI UDHAAR ── */}
        <div className="px-4 mt-5">
          <div className="flex justify-between items-center mb-3 px-1">
            <p className="text-[15px] font-black text-gray-800 dark:text-white">Zaroori Udhaar</p>
            <button onClick={() => navigate('/customers')} className="text-[12px] text-[#1A5C38] dark:text-[#00E676] font-bold">Dekhen Sab</button>
          </div>
          <div className="space-y-2.5">
            {urgentUdhaars.length > 0 ? urgentUdhaars.map((u, i) => {
              const initials = u.customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              return (
                <motion.div key={u.customerName} onClick={() => navigate(`/customers/${u.customerName}`)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-[#141414] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm border border-transparent dark:border-[#2A2A2A] active:scale-[0.98] transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1E1E1E] flex items-center justify-center text-[12px] font-black text-gray-500 dark:text-[#B0B0B0]">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none">{u.customerName}</p>
                        {u.isImportant && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-[#B0B0B0]/60 font-medium tracking-tight">Total Udhaar Balance</p>
                    </div>
                  </div>
                  <p className="text-[14px] font-black text-red-500 dark:text-[#FF5252]">Rs. {u.totalBalance.toLocaleString()}</p>
                </motion.div>
              );
            }) : (
              <div className="bg-white dark:bg-[#141414] rounded-2xl p-8 text-center text-gray-300 dark:text-[#2A2A2A] shadow-sm">
                <Users size={28} className="mx-auto mb-2" />
                <p className="text-[11px] font-bold uppercase tracking-widest">No entries found</p>
              </div>
            )}
          </div>
        </div>

        {/* ── AAJ KI ACTIVITY ── */}
        <div className="px-4 mt-5">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-black text-gray-800 dark:text-white">Aaj Ki Activity</p>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            </div>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`p-1.5 rounded-xl shadow-sm border transition-all ${showFilter ? 'bg-[#00E676] border-[#00E676] text-white' : 'bg-white dark:bg-[#141414] border-transparent text-gray-400'}`}
            >
              <Filter size={14} />
            </button>
          </div>

          <motion.div initial={false} animate={{ height: showFilter ? 'auto' : 0, opacity: showFilter ? 1 : 0 }} className="overflow-hidden">
            <div className="mb-4 bg-white dark:bg-[#141414] rounded-2xl p-4 border dark:border-[#2A2A2A] shadow-sm flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-1">Min Rs.</p>
                <input 
                  type="number" placeholder="0" 
                  onChange={e => setAmountRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                  className="w-full bg-gray-50 dark:bg-[#1E1E1E] rounded-xl px-3 py-2 text-[12px] font-bold outline-none border dark:border-white/5"
                />
              </div>
              <div className="text-gray-300 mt-5">→</div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-1">Max Rs.</p>
                <input 
                  type="number" placeholder="Limit" 
                  onChange={e => setAmountRange(prev => ({ ...prev, max: Number(e.target.value) || Infinity }))}
                  className="w-full bg-gray-50 dark:bg-[#1E1E1E] rounded-xl px-3 py-2 text-[12px] font-bold outline-none border dark:border-white/5"
                />
              </div>
            </div>
          </motion.div>
          <div className="space-y-2.5">
            {recentActivity.length > 0 ? recentActivity.map((item, i) => {
              const isExp = item._type === 'expense';
              const isCash = !isExp && (item as any).type === 'cash';
              const borderColor = isExp ? '#FF5252' : isCash ? '#00E676' : '#FFB300';
              const labelColor = isExp ? (isDarkMode ? '#3A1A1A' : '#FEE2E2') : isCash ? (isDarkMode ? '#1A3A25' : '#DCFCE7') : (isDarkMode ? '#3A2E1A' : '#FEF3C7');
              const textColor = isExp ? '#FF5252' : isCash ? '#00E676' : '#FFB300';
              const label = isExp ? 'EXPENSE' : isCash ? 'CASH SALE' : 'UDHAAR GIVEN';
              
              // Improved name display to show items
              const itemSummary = !isExp && (item as any).items && (item as any).items.length > 0 
                ? (item as any).items.map((it: any) => it.name).join(', ')
                : '';
              const name = isExp ? (item as any).description : isCash ? (itemSummary || 'CASH SALE') : (item as any).customerName || 'UDHAAR';
              
              const amount = isExp ? (item as any).amount : (item as any).total;
              const time = new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-sm flex border border-transparent dark:border-[#2A2A2A] active:scale-[0.98] transition-all">
                  <div className="w-1" style={{ backgroundColor: borderColor }} />
                  <div className="flex-1 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-gray-800 dark:text-white leading-none mb-1.5 uppercase tracking-tight">{name}</p>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: labelColor, color: textColor }}>{label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black leading-none mb-1" style={{ color: textColor }}>Rs. {amount.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 dark:text-[#B0B0B0]/60 font-medium">{time}</p>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="bg-white dark:bg-[#141414] rounded-2xl p-10 text-center text-gray-300 dark:text-[#2A2A2A] shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest">Khamoshi hai aaj...</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </PageTransition>
  );
};
