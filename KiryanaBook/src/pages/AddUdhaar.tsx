import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, UserCircle, Plus as UserPlus, Wallet, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PageTransition } from '../components/PageTransition';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const AddUdhaar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { udhaars, contacts, addUdhaar, addSale } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';

  const [amount, setAmount] = useState(String((location.state as any)?.amount || '0'));
  const [customerName, setCustomerName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [type, setType] = useState<'diye' | 'liye'>('diye'); 
  const [note, setNote] = useState('');

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const customerStats = useMemo(() => {
    const data: Record<string, number> = {};
    udhaars.forEach(u => {
      const name = (u.customerName || 'Unknown').trim();
      data[name] = (data[name] || 0) + u.amount;
    });
    return data;
  }, [udhaars]);

  const existingCustomers = useMemo(() => Object.keys(customerStats), [customerStats]);

  const suggestions = useMemo(() => {
    if (!customerName.trim()) return [];
    return existingCustomers.filter(name => 
      name && customerName && name.toLowerCase().includes(customerName.toLowerCase())
    ).slice(0, 5);
  }, [customerName, existingCustomers]);

  const handleNumpad = (val: string) => {
    triggerHaptic();
    if (amount === '0' && val !== '.') {
        setAmount(val);
    } else if (amount.includes('.') && val === '.') {
        return;
    } else if (amount.length < 9) {
        setAmount(prev => prev + val);
    }
  };

  const handleDelete = () => {
    triggerHaptic();
    setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleSave = () => {
    let val = parseFloat(amount);
    if (val <= 0) {
      toast.error('Amount sahi likhein');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Naam likhein');
      return;
    }

    let finalAmount = type === 'diye' ? val : -val;

    triggerHaptic(ImpactStyle.Heavy);
    addUdhaar(customerName.trim(), finalAmount, note || undefined);
    
    if (location.state?.cart) {
      addSale(location.state.cart, 'udhaar');
    }
    
    toast.success('Khata entry saved!');
    navigate('/customers');
  };

  const currentBalance = customerStats[customerName] || 0;
  const val = parseFloat(amount) || 0;
  const isSupplier = contacts.find(c => c.name?.toLowerCase() === customerName.toLowerCase())?.type === 'supplier';
  const finalAdd = type === 'diye' ? val : -val;
  const newBalance = currentBalance + finalAdd;

  return (
    <PageTransition>
      <div className="w-full pb-8 transition-colors duration-300 font-outfit max-w-md mx-auto bg-background text-text-primary">
        {/* HEADER */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between z-50 sticky top-0 border-b border-border bg-card dark:bg-[#141414] text-white">
          <button onClick={() => navigate(-1)} className="hover:opacity-70 active:scale-95 transition-transform">
            <ArrowLeft size={22} className={isDarkMode ? 'text-text-primary' : 'text-white'} />
          </button>
          <h1 className={`${isDarkMode ? 'text-text-primary' : 'text-white'} font-bold text-[17px] tracking-wide`}>Add New Entry</h1>
          <div className="w-8" />
        </div>

        {/* FORM SECTION - Moved to top for better visibility */}
        <div className="px-5 pt-3 pb-2 space-y-3">
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <UserCircle size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Enter Customer Name"
                    value={customerName}
                    onChange={e => {
                        setCustomerName(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full rounded-2xl py-4 pl-12 pr-6 outline-none font-bold text-[14px] transition-all shadow-sm border border-border bg-card-secondary text-text-primary"
                />
                
                {/* Suggestions */}
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl z-[100] overflow-hidden border dark:border-white/5"
                            style={{ backgroundColor: card }}
                        >
                            {suggestions.map((name, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        triggerHaptic();
                                        setCustomerName(name);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-5 py-4 text-[13px] font-bold flex items-center justify-between border-b dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
                                    style={{ color: text }}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span>{name}</span>
                                            <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                                ({contacts.find(c => c.name?.toLowerCase() === name.toLowerCase())?.type === 'supplier' ? 'Supplier' : 'Customer'})
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter" style={{ color: text }}>Balance: Rs. {customerStats[name].toLocaleString()}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full rounded-2xl py-3 px-5 outline-none font-semibold text-[13px] transition-all shadow-sm border dark:border-white/5"
                style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#F4F4F5', color: text }}
            />
        </div>

        {/* TYPE TOGGLE - Made slightly smaller */}
        <div className="px-5 mt-2 flex gap-3">
            <button 
                onClick={() => { setType('diye'); triggerHaptic(); }}
                className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] transition-all border ${type === 'diye' ? (isDarkMode ? 'bg-[#00E676] text-black border-[#00E676]' : 'bg-[#0A3D24] text-white border-[#0A3D24]') : 'bg-card text-gray-400 dark:border-white/5'}`}
            >
                Maine Diye
            </button>
            <button 
                onClick={() => { setType('liye'); triggerHaptic(); }}
                className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] transition-all border ${type === 'liye' ? 'bg-[#FF5252] text-white border-[#FF5252]' : 'bg-card text-gray-400 dark:border-white/5'}`}
            >
                Maine Liye
            </button>
        </div>

        {/* AMOUNT PANEL */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative mb-2">
             <span className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em] mb-2">
                {type === 'diye' ? 'You Gave (Payment / Credit)' : 'You Received (Debt / Bill)'}
             </span>
              <div className="flex items-center gap-2">
                <span className={`text-[16px] font-black mt-1 opacity-60 ${type === 'diye' ? 'text-success' : 'text-danger'}`}>Rs.</span>
                <span className="text-[48px] font-black leading-none tracking-tighter text-text-primary">{amount}</span>
                <button onClick={handleDelete} className="ml-2 mt-2 w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform bg-card-secondary text-text-muted">
                    <Delete size={18} />
                </button>
              </div>
             
             {customerName && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col items-center gap-1 px-4 py-2 rounded-2xl border transition-colors shadow-sm" style={{ backgroundColor: isDarkMode ? '#18241F' : '#F0F5F2', borderColor: isDarkMode ? '#00E67620' : '#E8F5E9' }}>
                    <div className="flex items-center gap-2">
                        <Wallet size={10} style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }} />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>Status after this:</span>
                    </div>
                    <span className={`text-[14px] font-black ${newBalance >= 0 ? (isDarkMode ? 'text-[#4BFF94]' : 'text-[#0A3D24]') : 'text-[#FF5252]'}`}>
                        Rs. {Math.abs(newBalance).toLocaleString()} {newBalance >= 0 ? (isSupplier ? 'Advance To Him' : 'Lena Hai') : (isSupplier ? 'Dena Hai' : 'Advance From Him')}
                    </span>
                </motion.div>
             )}
        </div>


        {/* NUMPAD & BUTTON - FIXED ABOVE NAV */}
        <div className="fixed bottom-[80px] inset-x-0 mx-auto max-w-md p-5 rounded-t-[2rem] shadow-2xl border-t bg-card animate-in slide-in-from-bottom duration-300 z-50" style={{ borderColor: border }}>
            <div className="grid grid-cols-3 gap-2.5 mb-4 w-full">
                {['1','2','3','4','5','6','7','8','9','.', '0'].map(n => (
                    <button 
                        key={n} onClick={() => handleNumpad(n)} 
                        className="h-[64px] rounded-2xl text-[24px] font-black shadow-sm active:scale-95 transition-all text-center border dark:border-white/5"
                        style={{ backgroundColor: isDarkMode ? '#222' : '#FFFFFF', color: text }}
                    >
                        {n}
                    </button>
                ))}
                <button onClick={handleDelete} className="h-[64px] rounded-2xl text-[24px] font-black shadow-sm active:scale-95 transition-all flex items-center justify-center border dark:border-white/5" style={{ backgroundColor: isDarkMode ? '#222' : '#FFFFFF', color: '#FF5252' }}>
                    <Delete size={20} />
                </button>
            </div>
            
            <button 
                onClick={handleSave} 
                className={`w-full text-[15px] font-black py-4 rounded-[1.5rem] shadow-xl active:scale-[0.98] transition-all tracking-[0.15em] uppercase flex items-center justify-center gap-3 ${
                    customerName.trim() ? (isDarkMode ? 'bg-[#00E676] text-black' : 'bg-[#0A3D24] text-white') : 'bg-gray-200 text-gray-400 opacity-50'
                }`}
            >
                <UserPlus size={16} strokeWidth={3} />
                SAVE HISAAB
            </button>
        </div>
      </div>
    </PageTransition>
  );
};
