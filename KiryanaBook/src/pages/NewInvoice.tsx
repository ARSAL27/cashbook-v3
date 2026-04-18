import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, Search, Plus, Minus, CreditCard, Wallet, BookOpenCheck, Share2 } from 'lucide-react';
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
      } as any);
      triggerHaptic(ImpactStyle.Heavy);
      toast.success('Bill Mehfooz Kar Liya Gaya! ✅');
      setSavedInvoice(newInvoice);
    } catch (e: any) {
      toast.error(e.message || 'Saving failed');
    }
    setLoading(false);
  };


  return (
    <PageTransition> 
      <div className={`min-h-screen font-outfit pb-40 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#0A3D24]'}`}>
        
        {/* HEADER - COMPACTED PADDING */}
        <div className="pt-10 pb-2 px-6 flex items-center justify-between sticky top-0 z-[60] bg-background/80 backdrop-blur-3xl border-b dark:border-white/5">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-transform">
                <ArrowLeft size={18} />
            </button>
            <div className="text-center">
                <h1 className="text-[16px] font-black tracking-tight leading-none">Standard Billing</h1>
                <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-1">Smart POS Pro</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-600">
                <ShoppingCart size={18} />
            </div>
        </div>

        {/* MAIN BODY - REDUCED TOP MARGIN */}
        <div className="px-5 mt-4 space-y-4">
            
            {/* 1. CUSTOMER BOX */}
            <div className="rounded-[2.5rem] bg-card p-5 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-3 opacity-40 uppercase tracking-[0.2em] font-black text-[8px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Customer Info
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        value={customerSearch || customerName}
                        onChange={e => { setCustomerSearch(e.target.value); setCustomerName(e.target.value); setShowCustomerSearch(true); }}
                        placeholder="Buyer Name..."
                        className="w-full h-14 rounded-2xl bg-background px-12 text-[14px] font-bold outline-none border border-border/50 focus:border-green-500/30"
                    />
                    <AnimatePresence>
                        {showCustomerSearch && filteredCustomers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute top-full left-0 right-0 z-[70] bg-card rounded-2xl shadow-2xl border border-border mt-2 overflow-hidden"
                            >
                                {filteredCustomers.map(c => (
                                    <button 
                                        key={c.id} 
                                        onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); setCustomerSearch(''); setShowCustomerSearch(false); }}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-green-50 dark:hover:bg-green-900/10 text-left border-b last:border-0 border-border"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-[12px]">{c.name[0]}</div>
                                        <div>
                                            <p className="font-black text-[14px]">{c.name}</p>
                                            <p className="text-[10px] opacity-50">{c.phone}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {frequentCustomers.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {frequentCustomers.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); triggerHaptic(ImpactStyle.Light); }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black tracking-tight transition-all border ${customerName === c.name ? 'bg-primary text-white border-primary' : 'bg-transparent border-border opacity-50'}`}
                            >
                                {c.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. ITEM BOX */}
            <div className="rounded-[2.5rem] bg-card p-5 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-3 opacity-40 uppercase tracking-[0.2em] font-black text-[8px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Basket Items
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        value={itemSearch}
                        onChange={e => { setItemSearch(e.target.value); setShowItemResults(true); }}
                        placeholder="Scan or Search Product..."
                        className="w-full h-14 rounded-2xl bg-background px-12 text-[14px] font-bold outline-none border border-border/50 focus:border-green-500/30"
                    />
                    <AnimatePresence>
                        {showItemResults && itemSearch && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="absolute top-full left-0 right-0 z-[70] bg-card rounded-2xl shadow-2xl border border-border mt-2 max-h-[250px] overflow-y-auto"
                            >
                                {stock.filter(s => s.name.toLowerCase().includes(itemSearch.toLowerCase())).map(s => (
                                    <button 
                                        key={s.id} onClick={() => addItemToBill(s)}
                                        className="w-full flex items-center justify-between p-4 border-b last:border-0 border-border active:bg-green-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-black text-[14px]">{s.name}</p>
                                            <p className="text-[9px] opacity-40">Available: {s.quantity} {s.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[15px] text-primary">Rs. {s.price}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-3">
                    {items.length === 0 ? (
                        <div className="py-8 text-center opacity-20">
                            <ShoppingCart size={32} className="mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Basket is Empty</p>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                key={item.itemId} 
                                className="p-3.5 rounded-2xl bg-background/50 border border-border"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black text-[14px] truncate flex-1 pr-2">
                                        {item.name}
                                    </h4>
                                    <button onClick={() => removeItem(idx)} className="text-red-400 active:scale-75 transition-transform"><Trash2 size={14} /></button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-card rounded-xl p-0.5 border border-border shadow-sm shrink-0">
                                        <button onClick={() => updateItem(idx, 'qty', Math.max(0.5, item.qty - 0.5))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-background active:scale-90"><Minus size={12}/></button>
                                        <input 
                                            type="number" value={item.qty} 
                                            onChange={e => updateItem(idx, 'qty', e.target.value)} 
                                            className="w-10 text-center font-black text-[12px] bg-transparent outline-none"
                                        />
                                        <button onClick={() => updateItem(idx, 'qty', item.qty + 0.5)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-background active:scale-90"><Plus size={12}/></button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline text-[14px] font-black">
                                            <span className="text-gray-400 mr-1 text-[10px]">@</span>
                                            <input 
                                                type="number" value={item.price} 
                                                onChange={e => updateItem(idx, 'price', e.target.value)}
                                                className="bg-transparent outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[15px] font-black text-primary">Rs. {item.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* 3. FINAL SUMMARY */}
            <div className="rounded-[2.5rem] bg-card p-5 shadow-sm border border-border">
                <div className="space-y-3">
                    <div className="flex justify-between items-center opacity-60">
                        <span className="text-[12px] font-bold">Total Items</span>
                        <span className="font-black text-[14px]">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold opacity-60">Discount</span>
                        <div className="flex items-center bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-900/20 w-28">
                            <span className="text-[10px] font-black text-red-500 mr-2">Rs.</span>
                            <input 
                              type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                              placeholder="0" className="bg-transparent outline-none w-full font-black text-red-600 text-right text-[13px]"
                            />
                        </div>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                        <span className="text-[14px] font-black uppercase tracking-widest">Payable</span>
                        <span className="text-[28px] font-black text-primary tabular-nums">Rs. {finalTotal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                    {(['cash', 'online', 'udhaar'] as const).map(m => (
                        <button 
                            key={m} onClick={() => { triggerHaptic(ImpactStyle.Light); setPaymentMethod(m); }}
                            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all ${paymentMethod === m ? 'bg-[#00E676] border-[#00E676] text-[#0A3D24] shadow-lg scale-[1.03]' : 'bg-transparent border-border text-gray-400'}`}
                        >
                            {m === 'cash' ? <Wallet size={16} /> : m === 'online' ? <CreditCard size={16} /> : <BookOpenCheck size={16} />}
                            <span className="text-[9px] font-black uppercase tracking-tighter mt-1">{m}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* FLOATING ACTION BAR - COMPACTED GAPS */}
        <div className="fixed bottom-6 left-5 right-5 z-[80]">
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={loading}
                className="w-full h-18 rounded-[2rem] bg-gradient-to-r from-[#00E676] to-[#0A3D24] text-white shadow-2xl flex items-center justify-between px-7 disabled:opacity-50"
            >
                <div className="text-left">
                   <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Total Amount</p>
                   <p className="text-[20px] font-black tracking-tighter tabular-nums">Rs. {finalTotal.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-black uppercase tracking-widest px-4 py-2 bg-white/10 rounded-xl">Save Bill</span>
                    {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <BookOpenCheck size={24} />}
                </div>
            </motion.button>
            <div className="h-4" /> {/* Safeway for bottom gestures */}
        </div>
        
        {/* SUCCESS OVERLAY */}
        <AnimatePresence>
          {savedInvoice && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-center justify-center px-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-card rounded-[3rem] p-8 text-center shadow-2xl relative overflow-hidden boarder border-border"
              >
                <div className="absolute top-4 right-4">
                  <button onClick={() => setSavedInvoice(null)} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <BookOpenCheck size={40} className="text-primary" />
                </div>

                <h2 className="text-[22px] font-black leading-tight mb-2 uppercase tracking-tight">Bill Saved!</h2>
                <p className="text-[12px] opacity-60 mb-6 font-bold uppercase tracking-widest">Invoice #{savedInvoice.invoiceNumber} tyar hai.</p>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      const msg = formatReceipt(savedInvoice, profile?.name || 'Our Shop');
                      shareOnWhatsApp(savedInvoice.customerPhone, msg);
                    }}
                    className="w-full h-16 rounded-2xl bg-[#25D366] text-white font-black text-[14px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
                  >
                    <Share2 size={18} />
                    WhatsApp Receipt
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSavedInvoice(null);
                      setItems([]);
                      setCustomerName('');
                      setCustomerPhone('');
                      setDiscount('');
                      navigate('/new-invoice');
                    }}
                    className="w-full h-16 rounded-2xl bg-card border border-border font-black text-[14px] active:scale-95 transition-transform"
                  >
                    Naya Bill Banayein
                  </button>
                  
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-2 opacity-40 font-black text-[10px] uppercase tracking-[0.3em] mt-4"
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
