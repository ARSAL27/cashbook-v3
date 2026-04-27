import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { Users, Plus, Minus, Bell, HandCoins, BarChart2, Filter, ArrowDownLeft, ArrowUpRight, Menu, MessageCircle, Mic } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MarqueeText } from '../components/MarqueeText';
import { isToday, getLocalDateString } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { 
    sales, expenses, udhaars, profile, notifications, contacts, stock
  } = useShop();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: 0, max: Infinity });
  const [showFilter, setShowFilter] = useState(false);
  // Removed chartWidth + window resize listener — caused page jitter on Android
  // every time the soft keyboard opened/closed (resize event → setState → reflow).
  // The chart now uses ResponsiveContainer which fits its parent without
  // listening to window events.

  const stats = useMemo(() => {
    // Convert contacts to Map for O(1) lookups
    const contactsMap = new Map();
    (contacts || []).forEach(c => {
      if (c?.name) contactsMap.set(c.name.toLowerCase(), c);
    });

    let totalToday = 0;
    (sales || []).forEach(s => {
      if (s?.date && isToday(s.date)) totalToday += (s?.total || 0);
    });

    let totalExpenses = 0;
    (expenses || []).forEach(e => {
      if (e?.date && isToday(e.date)) totalExpenses += (e?.amount || 0);
    });
    
    const customerBalances: Record<string, number> = {};
    (udhaars || []).forEach(u => {
      if (u?.customerName) {
        const name = u.customerName.trim();
        customerBalances[name] = (customerBalances[name] || 0) + (u.amount || 0);
      }
    });
    
    let receivable = 0;
    let payable = 0;
    let customerAdvance = 0;
    let supplierAdvance = 0;

    Object.entries(customerBalances).forEach(([name, bal]) => {
      const contact = contactsMap.get(name.toLowerCase());
      const type = contact?.type || 'customer';
      
      if (type === 'customer') {
        if (bal > 0) receivable += bal;       // Customer owes shop → Account Receivable
        else if (bal < 0) customerAdvance += Math.abs(bal); // Customer pre-paid to shop → Customer Advance
      } else {
        // Supplier
        if (bal < 0) payable += Math.abs(bal); // Shop owes supplier → Account Payable
        else if (bal > 0) supplierAdvance += bal;      // Shop pre-paid to supplier → Supplier Advance
      }
    });

    const dueCustomersCount = Object.values(customerBalances).filter(b => b > 0).length;
    const uniqueCustomers = Object.keys(customerBalances).length;
    
    // Calculate low stock items
    const lowStockItems = (stock || []).filter(item => (item?.quantity || 0) <= (item?.minThreshold || 5));
    
    return { 
      totalToday, totalExpenses, receivable, payable, customerAdvance, supplierAdvance,
      dueCustomersCount, uniqueCustomers, lowStockItems 
    };
  }, [sales, expenses, udhaars, contacts, stock]);

  const weeklyData = useMemo(() => {
    const days = [0,1,2,3,4,5,6];
    const now = new Date();
    const last7Days = days.map(d => {
      const date = new Date(); 
      date.setDate(date.getDate() - (6 - d));
      const ds = getLocalDateString(date);
      return {
        ds: ds,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        value: 0
      };
    });

    // Single pass over sales instead of nested filter
    (sales || []).forEach(s => {
      if (!s?.date) return;
      const saleDate = getLocalDateString(s.date);
      const dayData = last7Days.find(d => d.ds === saleDate);
      if (dayData) {
        dayData.value += (s.total || 0);
      }
    });

    return last7Days.map(({ dayName, value }) => ({ dayName, value }));
  }, [sales]);


  const recentActivity = useMemo(() => {
    const s = (sales || []).slice(0, 20).map(item => ({ ...item, _type: 'sale' as const }));
    const e = (expenses || []).slice(0, 20).map(item => ({ ...item, _type: 'expense' as const }));
    const all = [...s, ...e].sort((a, b) => {
      const db = b.date ? new Date(b.date).getTime() : 0;
      const da = a.date ? new Date(a.date).getTime() : 0;
      return db - da;
    });
    
    return all.filter(item => {
      const amount = item._type === 'sale' ? (item.total || 0) : (item.amount || 0);
      return amount >= (amountRange.min || 0) && (amountRange.max === Infinity || amount <= amountRange.max);
    }).slice(0, 5);
  }, [sales, expenses, amountRange]);

  const urgentUdhaars = useMemo(() => {
    const importantContacts = (contacts || []).filter(c => c?.isImportant);
    const importantNames = new Set(importantContacts.map(c => (c?.name || '').toLowerCase()));
    
    // Group all pending balances
    const balances: Record<string, number> = {};
    const urgentTransactionNames = new Set<string>();
    
    (udhaars || []).forEach(u => {
      if (u?.customerName) {
        const name = u.customerName.trim();
        balances[name] = (balances[name] || 0) + (u.amount || 0);
        if (u.isUrgent) urgentTransactionNames.add(name.toLowerCase());
      }
    });

    // Pick customers to show: Important ones FIRST, then ones with urgent transactions
    const targetNames = Array.from(new Set([
      ...importantContacts.map(c => c.name), 
      ...Array.from(urgentTransactionNames).map(name => {
         // Try to find the original casing
         const found = (udhaars || []).find(u => u.customerName?.toLowerCase() === name);
         return found?.customerName || name;
      })
    ])).filter(Boolean);

    return targetNames
      .filter(name => (balances[name] || 0) !== 0 || importantNames.has(name.toLowerCase())) 
      .map(name => ({
        customerName: name,
        totalBalance: balances[name] || 0,
        isImportant: importantNames.has(name.toLowerCase())
      }))
      .sort((a, b) => (a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1))
      .slice(0, 10); // Limit to 10 for performance
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
      title: "Business Manager", 
      msg: "Assalam-o-Alaikum! Shop ka haal jaanne ke liye mujh se poochein.",
      color: "green" 
    };
  }, [stats]);

  return (
    <PageTransition> <div className="w-full bg-[#F2F2F7] dark:bg-[#0A0A0A] font-outfit max-w-md mx-auto transition-colors duration-300 pb-32">

        {/* ── STICKY HEADER ── */}
        <div className="pt-page pb-3 sticky top-0 z-sticky px-5 border-b transition-all duration-300 dark:border-white/5 shadow-sm" style={{ backgroundColor: isDarkMode ? '#0A0A0A' : '#1A5C38' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-all shadow-sm"
              >
                <Menu size={20} className="text-white" strokeWidth={2.5} />
              </button>
              <div>
                <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em] leading-none mb-1">
                  {new Date().toLocaleDateString('ur-PK', { weekday: 'short' })} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-center gap-1.5">
                   <h1 className="text-[17px] text-white font-black leading-tight tracking-tight">{profile?.name || 'KiryanaBook'}</h1>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#4BFF94] shadow-[0_0_8px_#4BFF94]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/notifications')}
                className="relative w-9 h-9 bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-all"
              >
                <Bell size={18} className="text-white" strokeWidth={2.5} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1A5C38] dark:border-[#0A0A0A] text-[8px] text-white flex items-center justify-center font-black">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 dark:border-white/10 shadow-lg shadow-black/10">
                <img src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} alt="Avatar" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </div> 

        {/* ── PREMIUM BALANCE CARD ── */}
        <div className="px-4 mt-3 relative z-10">
          <div 
            onClick={() => navigate('/balance-history')}
            className="rounded-[1.8rem] px-5 py-4 transition-all duration-500 shadow-[0_12px_25px_rgba(26,92,56,0.12)] relative overflow-hidden cursor-pointer active:scale-[0.98]" 
            style={{ background: isDarkMode ? 'linear-gradient(145deg, #10251A, #0A0A0A)' : 'linear-gradient(145deg, #1A5C38, #0A3D24)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12" />
            
            <div className="relative z-10">
              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">{t('today_balance')}</p>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[28px] font-black text-white leading-tight tracking-tight">
                    <span className="text-[16px] mr-1 opacity-70">Rs.</span>
                    {(stats.totalToday - stats.totalExpenses).toLocaleString()}
                  </h2>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                   <HandCoins className="text-white" size={20} strokeWidth={2.5} />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/cashflow?type=in');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/15 active:scale-95 transition-all rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center shadow-lg">
                    <ArrowDownLeft size={16} className="text-[#4BFF94]" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[7.5px] text-white/40 font-black tracking-widest leading-none mb-1 uppercase">CASH IN</p>
                    <p className="text-[11px] text-white font-black leading-none">{stats.totalToday.toLocaleString()}</p>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/cashflow?type=out');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/15 active:scale-95 transition-all rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center shadow-lg">
                    <ArrowUpRight size={16} className="text-[#FF5252]" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[7.5px] text-white/40 font-black tracking-widest leading-none mb-1 uppercase">CASH OUT</p>
                    <p className="text-[11px] text-white font-black leading-none">{stats.totalExpenses.toLocaleString()}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SMART BUSINESS MANAGER CARD ── */}
        <div className="px-4 mt-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => navigate('/manager', { state: { autoStartVoice: true } })}
            className={`group relative overflow-hidden rounded-[1.5rem] p-3.5 border transition-all duration-300 shadow-sm active:scale-[0.97] ${
              aiInsight.color === 'red' ? 'bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/40' :
              aiInsight.color === 'orange' ? 'bg-orange-50/50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/40' :
              'bg-white dark:bg-[#141414] border-gray-100 dark:border-white/5 hover:border-[#00E676]/30'
            }`}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:rotate-[-6deg] ${
                  aiInsight.color === 'red' ? 'bg-red-500' :
                  aiInsight.color === 'orange' ? 'bg-orange-500' :
                  'bg-[#00E676]'
                }`}>
                  <MessageCircle className="text-[#0A0A0A]" size={22} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                        aiInsight.color === 'red' ? 'text-red-600' :
                        aiInsight.color === 'orange' ? 'text-orange-600' :
                        'text-[#00A846]'
                      }`}>
                        {aiInsight.title}
                      </span>
                   </div>
                   <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5">
                      <Mic size={9} className="text-gray-400" />
                      <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-tighter">Live Munshi</span>
                   </div>
                </div>
                <p className="text-[14px] font-black text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
                  {aiInsight.msg}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── CENTRAL LEDGER BUTTON ── */}
        <div className="px-4 mt-3">
          <button 
            onClick={() => navigate('/ledger')} 
            className="w-full bg-white dark:bg-[#141414] rounded-[1.5rem] p-3.5 shadow-sm border border-transparent dark:border-white/5 active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#B0B0B0]/60 mb-0.5">Shop Khata</p>
                <h2 className="text-[16px] font-black text-[#0A3D24] dark:text-[#4BFF94]">Cash Flow Statement</h2>
              </div>
              <div className="w-9 h-9 bg-[#0A3D24]/5 dark:bg-[#4BFF94]/5 rounded-xl flex items-center justify-center">
                <BarChart2 className="text-[#0A3D24] dark:text-[#4BFF94]" size={18} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-white/5">
                <div className="flex-1">
                    <p className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Account Receivable</p>
                    <p className="text-[12px] font-black text-green-600 truncate leading-none">Rs. {stats.receivable.toLocaleString()}</p>
                </div>
                <div className="w-px h-6 bg-gray-100 dark:bg-white/5" />
                <div className="flex-1 px-1">
                    <p className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Account Payable</p>
                    <p className="text-[12px] font-black text-red-500 truncate leading-none">Rs. {stats.payable.toLocaleString()}</p>
                </div>
                <div className="w-px h-6 bg-gray-100 dark:bg-white/5" />
                <div className="flex-1">
                    <p className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Advance</p>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[6.5px] font-black px-1 rounded-sm bg-red-500 text-white leading-none py-0.5">CUST</span>
                            <p className="text-[11px] font-black text-red-500">Rs. {stats.customerAdvance.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[6.5px] font-black px-1 rounded-sm bg-green-600 text-white leading-none py-0.5">SUPP</span>
                            <p className="text-[11px] font-black text-green-600">Rs. {stats.supplierAdvance.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
          </button>
        </div>



        {/* ── QUICK ACTIONS GRID ──
            Was 110px aspect-square with gap-6 px-8 → rendered as huge boxes filling the screen.
            Now: compact horizontal pills, fixed comfortable height, icon+label inline. */}
        <div className="px-5 mt-5 grid grid-cols-2 gap-3">
          {[
            { icon: <Plus size={20} strokeWidth={3} className="text-[#1A5C38] dark:text-[#4BFF94]" />, label: 'Sale', path: '/add-sale', bg: '#E8F5EE', darkBg: '#1A3A25' },
            { icon: <Minus size={20} strokeWidth={3} className="text-red-500" />, label: 'Expense', path: '/add-expense', bg: '#FEF2F2', darkBg: '#3A1A1A' },
          ].map((a, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(a.path)}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl shadow-sm border border-transparent dark:border-white/5 transition-all active:shadow-inner"
              style={{ backgroundColor: isDarkMode ? (a as any).darkBg : a.bg }}
            >
              {a.icon}
              <span className="text-[14px] font-black uppercase tracking-wider text-gray-700 dark:text-white/90">{a.label}</span>
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
            {(urgentUdhaars || []).length > 0 ? urgentUdhaars.map((u, i) => {
              const nameRaw = u?.customerName || 'Unknown';
              const initials = nameRaw.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
              return (
                <motion.div key={nameRaw} onClick={() => navigate(`/customers/${encodeURIComponent(nameRaw)}`)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-[#141414] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm border border-transparent dark:border-[#2A2A2A] active:scale-[0.98] transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1E1E1E] flex items-center justify-center text-[12px] font-black text-gray-500 dark:text-[#B0B0B0]">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none">{nameRaw}</p>
                        {u.isImportant && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-[#B0B0B0]/60 font-medium tracking-tight">Total Udhaar Balance</p>
                    </div>
                  </div>
                  <p className="text-[14px] font-black text-red-500 dark:text-[#FF5252]">Rs. {(u.totalBalance || 0).toLocaleString()}</p>
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
            <div 
              onClick={() => navigate('/all-activity')}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
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
            {(recentActivity || []).length > 0 ? recentActivity.map((item, i) => {
              const isExp = item?._type === 'expense';
              const isSale = item?._type === 'sale';
              const isCash = !isExp && (item as any)?.type === 'cash';
              const borderColor = isExp ? '#FF5252' : isCash ? '#00E676' : '#FFB300';
              const labelColor = isExp ? (isDarkMode ? '#3A1A1A' : '#FEE2E2') : isCash ? (isDarkMode ? '#1A3A25' : '#DCFCE7') : (isDarkMode ? '#3A2E1A' : '#FEF3C7');
              const textColor = isExp ? '#FF5252' : isCash ? '#00E676' : '#FFB300';
              const label = isExp ? 'EXPENSE' : isCash ? 'CASH SALE' : 'UDHAAR GIVEN';
              
              const itemSummary = !isExp && (item as any)?.items && (item as any)?.items?.length > 0 
                ? (item as any).items.map((it: any) => it?.name || 'Item').join(', ')
                : '';
              const name = isExp ? ((item as any)?.description || 'Expense') : isCash ? (itemSummary || 'CASH SALE') : ((item as any)?.customerName || 'UDHAAR');
              
              const amount = isExp ? ((item as any)?.amount || 0) : ((item as any)?.total || 0);
              const dateObj = item?.date ? new Date(item.date) : null;
              const time = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00';
              
              return (
                <motion.div key={item?.id || i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} 
                  onClick={() => {
                    if (isSale) {
                        const invId = (item as any)?.invoiceId || item?.id;
                        if (invId) navigate(`/invoice/${invId}`);
                    }
                  }}
                  className={`bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-sm flex border border-transparent dark:border-[#2A2A2A] active:scale-[0.98] transition-all ${isSale ? 'cursor-pointer hover:border-gray-200 dark:hover:border-gray-700' : ''}`}
                >
                  <div className="w-1" style={{ backgroundColor: borderColor }} />
                  <div className="flex-1 px-4 py-3 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <MarqueeText 
                        text={name} 
                        className="text-[13px] font-black text-gray-800 dark:text-white uppercase tracking-tight" 
                      />
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block" style={{ backgroundColor: labelColor, color: textColor }}>{label}</span>
                    </div>
                    
                    <div className="text-right shrink-0 min-w-[80px]">
                      <p className="text-[14px] font-black leading-none mb-1" style={{ color: textColor }}>Rs. {(amount || 0).toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 dark:text-[#B0B0B0]/60 font-black uppercase">{time}</p>
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

        {/* ── REPORTS SECTION ── */}
        <div className="px-4 mt-5">
          <button 
            onClick={() => navigate('/reports')} 
            className="w-full bg-[#EFF6FF] dark:bg-[#1A2A3A] rounded-[1.5rem] p-4 shadow-sm border border-transparent dark:border-[#2A2A2A] active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <BarChart2 className="text-blue-600 dark:text-blue-400" size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h2 className="text-[17px] font-black text-blue-800 dark:text-blue-300 leading-tight">Business Reports</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-blue-600/60 dark:text-blue-400/60 mt-0.5">View all detailed insights</p>
              </div>
            </div>
            <ArrowUpRight className="text-blue-600/40 dark:text-blue-400/40" size={22} strokeWidth={2.5} />
          </button>
        </div>

      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </PageTransition>
  );
};
export { Dashboard };
