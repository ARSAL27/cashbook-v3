import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Trash2, Search, Plus, Minus, CreditCard, Wallet, BookOpenCheck, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import toast from 'react-hot-toast';
import { formatReceipt, shareOnWhatsApp } from '../services/whatsappService';

interface Item { itemId: string; name: string; qty: number; price: number; total: number; }

export const NewInvoice: React.FC = () => {
  const { contacts, stock, addInvoice } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  const [items, setItems] = useState<Item[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemResults, setShowItemResults] = useState(false);
  
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'udhaar'>('cash');
  const [notes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const { profile } = useShop();

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const filteredCustomers = useMemo(() =>
    contacts.filter(c => (c.name || '').toLowerCase().includes((customerSearch || '').toLowerCase())).slice(0, 5),
    [contacts, customerSearch]
  );

  const frequentCustomers = useMemo(() => contacts.slice(0, 5), [contacts]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.total, 0), [items]);
  const discountVal = parseFloat(discount) || 0;
  const finalTotal = Math.max(0, subtotal - discountVal);

  const updateItem = (idx: number, field: keyof Item, val: any) => {
    setItems(prev => {
      const copy = [...prev];
      const item = { ...copy[idx], [field]: val };
      if (field === 'qty' || field === 'price') {
        item.total = (parseFloat(item.qty as any) || 0) * (parseFloat(item.price as any) || 0);
      }
      copy[idx] = item;
      return copy;
    });
  };

  const addItemToBill = (s: any) => {
    triggerHaptic(ImpactStyle.Medium);
    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.itemId === s.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].qty += 1;
        copy[existingIdx].total = copy[existingIdx].qty * copy[existingIdx].price;
        return copy;
      }
      return [...prev, { itemId: s.id, name: s.name, qty: 1, price: s.price, total: s.price }];
    });
    setItemSearch('');
    setShowItemResults(false);
  };

  const removeItem = (idx: number) => {
    triggerHaptic(ImpactStyle.Heavy);
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!customerName.trim()) return toast.error('Customer ka naam zaruri hai!');
    if (items.length === 0) return toast.error('Kam az kam aik cheez add karein');
    
    // Check if any item lacks a proper name or price
    if (items.some(i => !i.name.trim() || i.price < 0)) return toast.error('Sahi maalumat darj karein');

    setLoading(true);
    try {
      const newInvoice = await addInvoice({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items,
        subtotal,
        discount: discountVal,
        total: finalTotal,
        paymentMethod,
        status: paymentMethod === 'udhaar' ? 'unpaid' : 'paid',
        notes
      });
      triggerHaptic(ImpactStyle.Heavy);
      toast.success('Bill Mehfooz Kar Liya Gaya! ✅');
      setSavedInvoice(newInvoice);
    } catch (e: any) {
      toast.error(e.message || 'Saving failed');
    }
    setLoading(false);
  };


  return (
    <PageTransition> <div className={`min-h-screen font-outfit pb-40 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#0A3D24]'}`}> {/* APP BAR */} <div className="pt-12 sticky top-0 z-[60] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl border-b dark:border-white/5 px-6 flex items-center justify-between ">
            <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center active:scale-95 transition-transform">
                <ArrowLeft size={20} />
            </button>
            <div className="text-center">
                <h1 className="text-[18px] font-black tracking-tight leading-none">Standard Billing</h1>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Smart POS Pro</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-600">
                <Package size={20} />
            </div>
        </div>

        <div className="px-5 mt-6 space-y-6">
            
            {/* 1. CUSTOMER BOX */}
            <div className="rounded-[40px] bg-white dark:bg-[#111] p-6 shadow-sm border dark:border-white/5">
                <div className="flex items-center gap-2 mb-4 opacity-40 uppercase tracking-[0.2em] font-black text-[9px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Customer Info
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        value={customerSearch || customerName}
                        onChange={e => { setCustomerSearch(e.target.value); setCustomerName(e.target.value); setShowCustomerSearch(true); }}
                        placeholder="Search or Type Buyer Name..."
                        className="w-full h-16 rounded-[24px] bg-gray-50 dark:bg-white/5 px-14 text-[15px] font-bold outline-none focus:ring-2 ring-green-500/20 transition-all border border-transparent"
                    />
                    <AnimatePresence>
                        {showCustomerSearch && filteredCustomers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute top-full left-0 right-0 z-[70] bg-white dark:bg-[#181818] rounded-[24px] shadow-2xl border dark:border-white/10 mt-2 overflow-hidden"
                            >
                                {filteredCustomers.map(c => (
                                    <button 
                                        key={c.id} 
                                        onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); setCustomerSearch(''); setShowCustomerSearch(false); }}
                                        className="w-full flex items-center gap-4 p-5 hover:bg-green-50 dark:hover:bg-green-900/10 text-left border-b last:border-0 dark:border-white/5"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-[#0A3D24] flex items-center justify-center text-white font-black text-[14px]">{c.name[0]}</div>
                                        <div>
                                            <p className="font-black text-[15px]">{c.name}</p>
                                            <p className="text-[11px] opacity-50">{c.phone}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {frequentCustomers.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {frequentCustomers.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); triggerHaptic(ImpactStyle.Light); }}
                                className={`flex-shrink-0 px-5 py-3 rounded-full text-[12px] font-black tracking-tight transition-all border ${customerName === c.name ? 'bg-[#0A3D24] text-white border-[#0A3D24]' : 'bg-transparent border-gray-100 dark:border-white/10 opacity-50'}`}
                            >
                                {c.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. ITEM BOX */}
            <div className="rounded-[40px] bg-white dark:bg-[#111] p-6 shadow-sm border dark:border-white/5">
                <div className="flex items-center gap-2 mb-4 opacity-40 uppercase tracking-[0.2em] font-black text-[9px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Basket Items
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        value={itemSearch}
                        onChange={e => { setItemSearch(e.target.value); setShowItemResults(true); }}
                        placeholder="Scan or Search Product..."
                        className="w-full h-16 rounded-[24px] bg-gray-50 dark:bg-white/5 px-14 text-[15px] font-bold outline-none border border-transparent focus:border-green-500/30"
                    />
                    <AnimatePresence>
                        {showItemResults && itemSearch && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="absolute top-full left-0 right-0 z-[70] bg-white dark:bg-[#181818] rounded-[32px] shadow-2xl border dark:border-white/10 mt-2 max-h-[300px] overflow-y-auto"
                            >
                                {stock.filter(s => s.name.toLowerCase().includes(itemSearch.toLowerCase())).map(s => (
                                    <button 
                                        key={s.id} onClick={() => addItemToBill(s)}
                                        className="w-full flex items-center justify-between p-5 border-b last:border-0 dark:border-white/5 active:bg-green-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-black text-[15px]">{s.name}</p>
                                            <p className="text-[10px] opacity-40">Available: {s.quantity} {s.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[16px] text-[#0A3D24] dark:text-[#00E676]">Rs. {s.price}</p>
                                            <p className="text-[9px] font-black uppercase text-green-500">Pick Item</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    {items.length === 0 ? (
                        <div className="py-10 text-center opacity-20">
                            <Package size={40} className="mx-auto mb-2" />
                            <p className="text-[12px] font-black uppercase tracking-widest">Basket is Empty</p>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                key={item.itemId} 
                                className="p-4 rounded-[28px] bg-gray-50 dark:bg-white/5 border dark:border-white/5"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-black text-[15px] flex items-center gap-2">
                                        {item.name}
                                    </h4>
                                    <button onClick={() => removeItem(idx)} className="text-red-400 active:scale-75 transition-transform"><Trash2 size={16} /></button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-white dark:bg-black/20 rounded-2xl p-1 border dark:border-white/10 shadow-sm">
                                        <button onClick={() => updateItem(idx, 'qty', Math.max(0.5, item.qty - 0.5))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 active:scale-90"><Minus size={14}/></button>
                                        <input 
                                            type="number" value={item.qty} 
                                            onChange={e => updateItem(idx, 'qty', e.target.value)} 
                                            className="w-12 text-center font-black text-[14px] bg-transparent outline-none"
                                        />
                                        <button onClick={() => updateItem(idx, 'qty', item.qty + 0.5)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 active:scale-90"><Plus size={14}/></button>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Rate</span>
                                        <div className="flex items-center text-[15px] font-black">
                                            <span className="text-gray-400 mr-1 text-[12px]">Rs.</span>
                                            <input 
                                                type="number" value={item.price} 
                                                onChange={e => updateItem(idx, 'price', e.target.value)}
                                                className="bg-transparent outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Sub</span>
                                        <p className="text-[17px] font-black text-[#0A3D24] dark:text-[#00E676]">Rs. {item.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* 3. FINAL SUMMARY */}
            <div className="rounded-[40px] bg-white dark:bg-[#111] p-6 shadow-sm border dark:border-white/5">
                <div className="space-y-4">
                    <div className="flex justify-between items-center opacity-60">
                        <span className="text-[14px] font-bold">Total Items</span>
                        <span className="font-black">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[14px] font-bold opacity-60">Discount</span>
                        <div className="flex items-center bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-2xl border border-red-100 dark:border-red-900/20 w-32">
                            <span className="text-[11px] font-black text-red-500 mr-2">Rs.</span>
                            <input 
                              type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                              placeholder="0" className="bg-transparent outline-none w-full font-black text-red-600 text-right"
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t dark:border-white/5 flex justify-between items-center">
                        <span className="text-[16px] font-black uppercase tracking-widest">Payable</span>
                        <span className="text-[32px] font-black text-[#0A3D24] dark:text-[#00E676]">Rs. {finalTotal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3">
                    {(['cash', 'online', 'udhaar'] as const).map(m => (
                        <button 
                            key={m} onClick={() => { triggerHaptic(ImpactStyle.Light); setPaymentMethod(m); }}
                            className={`flex flex-col items-center justify-center p-4 rounded-[28px] border-2 transition-all ${paymentMethod === m ? 'bg-[#00E676] border-[#00E676] text-[#0A3D24] shadow-lg scale-105' : 'bg-transparent border-gray-100 dark:border-white/5 text-gray-400'}`}
                        >
                            {m === 'cash' ? <Wallet size={20} /> : m === 'online' ? <CreditCard size={20} /> : <BookOpenCheck size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-tighter mt-2">{m}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* FLOATING ACTION BAR - Increased height for Redmi/Xiaomi devices */}
        <div className="fixed bottom-6 left-6 right-6 z-[80]">
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={loading}
                className="w-full h-20 rounded-[32px] bg-gradient-to-r from-[#00E676] to-[#0A3D24] text-white shadow-[0_20px_40px_-5px_rgba(0,230,118,0.4)] flex items-center justify-between px-8 disabled:opacity-50"
            >
                <div>
                   <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Final Amount</p>
                   <p className="text-[22px] font-black tracking-tighter">Rs. {finalTotal.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[14px] font-black uppercase tracking-widest px-4 py-2 bg-white/20 rounded-2xl">Save Bill</span>
                    {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <BookOpenCheck size={28} />}
                </div>
            </motion.button>
        </div>
        
        {/* SUCCESS OVERLAY */}
        <AnimatePresence>
          {savedInvoice && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end justify-center px-4 pb-12"
            >
              <motion.div 
                initial={{ y: 100, scale: 0.9 }} animate={{ y: 0, scale: 1 }}
                className="w-full max-w-sm bg-white dark:bg-[#111] rounded-[40px] p-8 text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setSavedInvoice(null)} className="opacity-30 hover:opacity-100 transition-opacity">
                    <Trash2 size={24} />
                  </button>
                </div>

                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpenCheck size={48} className="text-green-500" />
                </div>

                <h2 className="text-[24px] font-black leading-tight mb-2">Bill Saved!</h2>
                <p className="text-[14px] opacity-60 mb-8 font-medium">Invoice #{savedInvoice.invoiceNumber} tyar hai.</p>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      const msg = formatReceipt(savedInvoice, profile?.name || 'Our Shop');
                      shareOnWhatsApp(savedInvoice.customerPhone, msg);
                    }}
                    className="w-full py-5 rounded-[24px] bg-[#25D366] text-white font-black text-[15px] flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                  >
                    <Share2 size={20} />
                    WhatsApp Receipt
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSavedInvoice(null);
                      setItems([]);
                      setCustomerName('');
                      setCustomerPhone('');
                      setDiscount('');
                      navigate('/new-invoice'); // Refresh state
                    }}
                    className="w-full py-5 rounded-[24px] bg-gray-100 dark:bg-white/5 font-black text-[15px] active:scale-95 transition-transform"
                  >
                    Naya Bill Banayein
                  </button>
                  
                  <button 
                    onClick={() => navigate('/invoices')}
                    className="w-full py-3 opacity-40 font-black text-[12px] uppercase tracking-widest"
                  >
                    Dashboard Per Jayein
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};
