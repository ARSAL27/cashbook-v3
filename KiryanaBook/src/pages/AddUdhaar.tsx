import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, UserCircle, Wallet, Delete, Sparkles, Receipt, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PageTransition } from '../components/PageTransition';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const AddUdhaar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { udhaars, contacts, addUdhaar, addSale, addContact } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const [amount, setAmount] = useState(String((location.state as any)?.amount || '0'));
  const passedType = (location.state as any)?.type as 'customer' | 'supplier' | undefined;
  const [customerName, setCustomerName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [type, setType] = useState<'diye' | 'liye'>('liye'); // Default to 'liye' (Green)
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    triggerHaptic(ImpactStyle.Light);
    setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    let val = parseFloat(amount);
    if (val <= 0) {
      toast.error('Amount sahi likhein', { icon: '⚠️' });
      triggerHaptic(ImpactStyle.Heavy);
      setIsSaving(false);
      return;
    }
    if (!customerName.trim()) {
      toast.error('Naam darj karna zaruri hai', { icon: '👤' });
      triggerHaptic(ImpactStyle.Heavy);
      setIsSaving(false);
      return;
    }

    const trimmedName = customerName.trim();
    // Auto-create contact if it doesn't exist
    const existingContact = contacts.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (!existingContact && passedType) {
        await addContact({
            name: trimmedName,
            type: passedType,
            phone: '',
            address: '',
            initialBalance: 0
        });
    }

    let finalAmount = type === 'diye' ? val : -val;

    triggerHaptic(ImpactStyle.Heavy);
    const toastId = toast.loading('Hisaab mehfooz ho raha hai...');
    
    try {
      await addUdhaar(trimmedName, finalAmount, note || undefined);
      
      if (location.state?.cart) {
        await addSale(location.state.cart, 'udhaar');
      }
      
      toast.success('Hisaab Shandaar Tareeqay se Save Hogaya!', {
         id: toastId,
         icon: '🎉',
      });
      navigate('/customers');
    } catch (error) {
      toast.error('Galti hui: Save nahi ho saka', { id: toastId });
      console.error(error);
      setIsSaving(false);
    }
  };

  const currentBalance = customerStats[customerName] || 0;
  const val = parseFloat(amount) || 0;
  const existingContact = contacts.find(c => c.name?.toLowerCase() === customerName.toLowerCase());
  const isSupplier = existingContact ? existingContact.type === 'supplier' : passedType === 'supplier';
  const finalAdd = type === 'diye' ? val : -val;
  const newBalance = currentBalance + finalAdd;

  const bgGradientType = type === 'liye' ? 'from-emerald-500 to-teal-700' : 'from-rose-500 to-red-700';
  const glowColorType = type === 'liye' ? 'shadow-emerald-500/50' : 'shadow-rose-500/50';

  return (
    <PageTransition> <div className={`w-full min-h-screen pb-[350px] transition-colors duration-500 font-outfit max-w-md mx-auto ${isDarkMode ? 'bg-[#050505]' : 'bg-[#FAFAFA]'}`}> {/* PREMIUM DYNAMIC HEADER */} <motion.div layout className={`relative overflow-hidden pt-8 pb-10 px-6 rounded-b-[2.5rem] bg-gradient-to-br ${bgGradientType} text-white shadow-2xl transition-all duration-500 min-h-[220px] z-10 flex flex-col justify-between`} > {/* Glossy Overlay */} <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-20 pointer-events-none " />
            <div className="absolute -top-24 -right-10 w-48 h-48 bg-white/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 blur-2xl rounded-full" />

            <div className="relative flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 active:scale-90 transition-transform shadow-lg border border-white/20">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-inner">
                    <Sparkles size={14} className="text-yellow-300" />
                    <span className="text-[12px] font-black uppercase tracking-widest text-white">Naya Hisaab</span>
                </div>
            </div>

            <div className="relative space-y-1 text-center">
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">
                   {type === 'liye' ? '💰 Maine Liye (Paisa Aya)' : '💸 Maine Diye (Paisa Gaya)'}
                </motion.p>
                <div className="flex items-center justify-center gap-1.5">
                    <span className="text-white/60 text-2xl font-black mt-2">Rs.</span>
                    <motion.span 
                       key={amount}
                       initial={{ scale: 1.1, opacity: 0.8 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className={`text-6xl font-black tracking-tighter ${amount === '0' ? 'text-white/50' : 'text-white drop-shadow-xl'}`}
                    >
                       {amount}
                    </motion.span>
                </div>
            </div>
        </motion.div>

        {/* FLOATING ACTION TOGGLE */}
        <div className="px-6 -mt-6 relative z-20">
            <div className="flex bg-white dark:bg-[#141414] p-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-white/10 backdrop-blur-xl">
                <button 
                  onClick={() => { setType('liye'); triggerHaptic(); }}
                  className={`flex-1 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-[0.15em] transition-all duration-300 ${type === 'liye' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  Maine Liye
                </button>
                <button 
                  onClick={() => { setType('diye'); triggerHaptic(); }}
                  className={`flex-1 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-[0.15em] transition-all duration-300 ${type === 'diye' ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  Maine Diye
                </button>
            </div>
        </div>

        {/* FORM SECTION */}
        <div className="px-6 pt-6 space-y-4 relative z-0">
            
            {/* Customer Input */}
            <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${customerName ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    <UserCircle size={22} strokeWidth={2.5} />
                </div>
                <input
                    type="text"
                    placeholder="Customer / Supplier Name"
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-white dark:bg-[#141414] border-2 border-transparent focus:border-blue-500/30 rounded-[1.25rem] py-4.5 pl-12 pr-6 outline-none font-bold text-[15px] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.02)] dark:shadow-none dark:border-white/5 text-gray-900 dark:text-white placeholder:text-gray-400"
                />
                
                {/* Custom Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="absolute left-0 right-0 top-[110%] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1A1A1A] backdrop-blur-2xl"
                        >
                            {suggestions.map((name, i) => (
                                <button
                                    key={i}
                                    onClick={() => { triggerHaptic(); setCustomerName(name); setShowSuggestions(false); }}
                                    className="w-full text-left px-5 py-4 flex items-center justify-between border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[14px] font-black text-gray-900 dark:text-white">{name}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {contacts.find(c => c.name?.toLowerCase() === name.toLowerCase())?.type === 'supplier' ? '🛍️ Supplier' : '👤 Customer'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-0.5">Balance</span>
                                      <span className="text-[13px] font-black text-gray-800 dark:text-gray-200">Rs. {Math.abs(customerStats[name]).toLocaleString()}</span>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Note Input */}
            <div className="relative">
               <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${note ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    <Receipt size={18} strokeWidth={2.5} />
                </div>
              <input
                  type="text"
                  placeholder="Note / Sabab (Optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full bg-white dark:bg-[#141414] border-2 border-transparent focus:border-amber-500/30 rounded-[1.25rem] py-4 pl-12 pr-6 outline-none font-bold text-[14px] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.02)] dark:shadow-none dark:border-white/5 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>

            {/* Smart Balance Preview */}
            <AnimatePresence>
              {customerName && (
                  <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                  >
                      <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#0A1A2A] dark:to-[#0A102A] border border-blue-100 dark:border-blue-900/30">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <Wallet size={14} className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70">Naya Balance</span>
                                <span className="text-[14px] font-black text-blue-800 dark:text-blue-300">
                                    {newBalance >= 0 ? (isSupplier ? 'Mera Advance hai' : 'Unse lene hain') : (isSupplier ? 'Baki dena hai' : 'Unko dene hain')}
                                </span>
                              </div>
                          </div>
                          <span className={`text-[18px] font-black tracking-tight ${newBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              Rs. {Math.abs(newBalance).toLocaleString()}
                          </span>
                      </div>
                  </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* BOTTOM FIXED NUMPAD & SAVE */}
        <div className="fixed bottom-0 inset-x-0 mx-auto max-w-md bg-white dark:bg-[#0A0A0A] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-gray-100 dark:border-white/5 pt-6 pb-8 px-6 z-[100] backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumpad(String(num))}
                        className="py-4 rounded-2xl text-[20px] font-black text-gray-900 dark:text-white bg-gray-50/50 dark:bg-white/5 active:bg-gray-200 dark:active:bg-white/20 transition-all active:scale-95"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleDelete}
                    className="py-4 rounded-2xl flex items-center justify-center text-rose-500 bg-rose-50/50 dark:bg-rose-500/10 active:scale-95 transition-all"
                >
                    <Delete size={24} strokeWidth={2.5} />
                </button>
            </div>

            <button
                disabled={isSaving}
                onClick={handleSave}
                className={`w-full py-5 rounded-[1.8rem] text-[18px] font-black uppercase tracking-[0.1em] transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'} ${type === 'liye' ? 'bg-[#00E676] text-black shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}
            >
                <CheckCircle2 size={24} strokeWidth={3} className={isSaving ? 'animate-pulse' : ''} />
                {isSaving ? 'Saving...' : 'Hisaab Save Karein'}
            </button>
        </div>
      </div>
    </PageTransition>
  );
};
