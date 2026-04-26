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
import { sumLineItems, applyDiscount, parseDiscount, formatRs } from '../utils/money';

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

  const subtotal = useMemo(() => sumLineItems(items), [items]);
  const discountVal = parseDiscount(discount);
  const finalTotal = applyDiscount(subtotal, discountVal);

  const updateItem = (idx: number, field: keyof Item, val: any) => {
    setItems(prev => {
      const copy = [...prev];
      // Coerce qty/price to numbers HERE so they're never strings in state.
      let coerced = val;
      if (field === 'qty') {
        const n = parseInt(String(val), 10);
        coerced = isFinite(n) && n > 0 ? n : 1;
      } else if (field === 'price') {
        const n = parseFloat(String(val));
        coerced = isFinite(n) && n >= 0 ? n : 0;
      }
      const item = { ...copy[idx], [field]: coerced } as Item;
      if (field === 'qty' || field === 'price') {
        item.total = sumLineItems([{ price: item.price, qty: item.qty }]);
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
    if (loading) return;

    if (!customerName.trim()) {
      toast.error('Customer ka naam zaruri hai!');
      return;
    }
    if (items.length === 0) {
      toast.error('Kam az kam aik cheez add karein');
      return;
    }
    // Validate every line — saves a round trip to Firestore for obvious garbage.
    if (items.some(i => !i.itemId || !i.name || !isFinite(i.qty) || i.qty <= 0 || !isFinite(i.price) || i.price < 0)) {
      toast.error('Kuch items mein qty/price galat hai');
      return;
    }
    if (discountVal > subtotal) {
      toast.error('Discount subtotal se zyada nahi ho sakta');
      return;
    }

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
      toast.error(e?.message || 'Saving failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <PageTransition> 
      <div className={`min-h-screen font-outfit pb-40 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#0A3D24]'}`}>
        
        {/* HEADER - INCREASED PADDING */}
        <div className="pt-20 pb-4 px-6 flex items-center justify-between sticky top-0 z-[60] bg-background/90 backdrop-blur-3xl border-b dark:border-white/5 shadow-xl">
            <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center active:scale-95 transition-all shadow-lg">
                <ArrowLeft size={20} />
            </button>
            <div className="text-center">
                <h1 className="text-[18px] font-black tracking-tight leading-none uppercase">Standard Billing</h1>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mt-2">Smart POS Pro</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-600 shadow-inner">
                <ShoppingCart size={22} />
            </div>
        </div>

        {/* MAIN BODY */}
        <div className="px-5 mt-8 space-y-6">
            
            {/* 1. CUSTOMER BOX */}
            <div className="rounded-[3rem] bg-card p-6 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-4 opacity-40 uppercase tracking-[0.3em] font-black text-[9px]">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Buyer Details
                </div>

                <div className="relative mb-5">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                    <input 
                        value={customerSearch || customerName}
                        onChange={e => { setCustomerSearch(e.target.value); setCustomerName(e.target.value); setShowCustomerSearch(true); }}
                        placeholder="Buyer Name..."
                        className="w-full h-16 rounded-[1.5rem] bg-background px-14 text-[15px] font-bold outline-none border border-border focus:border-green-500/50 transition-all shadow-inner"
                    />
                    <AnimatePresence>
                        {showCustomerSearch && filteredCustomers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 z-[70] bg-card rounded-2xl shadow-2xl border border-border mt-3 overflow-hidden"
                            >
                                {filteredCustomers.map(c => (
                                    <button 
                                        key={c.id} 
                                        onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); setCustomerSearch(''); setShowCustomerSearch(false); }}
                                        className="w-full flex items-center gap-4 p-5 hover:bg-green-50 dark:hover:bg-green-900/10 text-left border-b last:border-0 border-border transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-[14px] shadow-sm">{c.name[0]}</div>
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
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {frequentCustomers.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); triggerHaptic(ImpactStyle.Light); }}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[12px] font-black tracking-tight transition-all border-2 ${customerName === c.name ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-transparent border-border opacity-40 hover:opacity-100'}`}
                            >
                                {c.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. ITEM BOX */}
            <div className="rounded-[3rem] bg-card p-6 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-4 opacity-40 uppercase tracking-[0.3em] font-black text-[9px]">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Basket Items
                </div>

                <div className="relative mb-5">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                    <input 
                        value={itemSearch}
                        onChange={e => { setItemSearch(e.target.value); setShowItemResults(true); }}
                        placeholder="Scan or Search Product..."
                        className="w-full h-16 rounded-[1.5rem] bg-background px-14 text-[15px] font-bold outline-none border border-border focus:border-green-500/50 transition-all shadow-inner"
                    />
                    <AnimatePresence>
                        {showItemResults && itemSearch && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="absolute top-full left-0 right-0 z-[70] bg-card rounded-2xl shadow-2xl border border-border mt-3 max-h-[300px] overflow-y-auto"
                            >
                                {stock.filter(s => s.name.toLowerCase().includes(itemSearch.toLowerCase())).map(s => (
                                    <button 
                                        key={s.id} onClick={() => addItemToBill(s)}
                                        className="w-full flex items-center justify-between p-5 border-b last:border-0 border-border active:bg-green-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 font-black text-[12px]">📦</div>
                                            <div>
                                                <p className="font-black text-[15px]">{s.name}</p>
                                                <p className="text-[10px] opacity-40 uppercase font-black">Stock: {s.quantity} {s.unit}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[17px] text-primary">Rs. {s.price}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    {items.length === 0 ? (
                        <div className="py-12 text-center opacity-20">
                            <ShoppingCart size={40} className="mx-auto mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Basket is Empty</p>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                key={item.itemId} 
                                className="p-5 rounded-[2rem] bg-background/50 border border-border shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-[16px] truncate flex-1 pr-3">
                                        {item.name}
                                    </h4>
                                    <button onClick={() => removeItem(idx)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center active:scale-75 transition-all outline-none border border-red-500/10"><Trash2 size={14} /></button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-card rounded-2xl p-1 border border-border shadow-sm shrink-0">
                                        <button onClick={() => updateItem(idx, 'qty', Math.max(1, item.qty - 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-background active:scale-90 border border-border shadow-sm"><Minus size={14}/></button>
                                        <input 
                                            type="number" value={item.qty} 
                                            onChange={e => updateItem(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))} 
                                            className="w-12 text-center font-black text-[15px] bg-transparent outline-none tabular-nums"
                                        />
                                        <button onClick={() => updateItem(idx, 'qty', item.qty + 1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-background active:scale-90 border border-border shadow-sm"><Plus size={14}/></button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline text-[16px] font-black">
                                            <span className="text-gray-400 mr-1 text-[11px] opacity-40">@</span>
                                            <input
                                                type="number" inputMode="decimal" min={0} value={item.price}
                                                onChange={e => {
                                                  const v = e.target.value;
                                                  if (v === '' || (Number(v) >= 0 && isFinite(Number(v)))) updateItem(idx, 'price', v);
                                                }}
                                                className="bg-transparent outline-none w-full tabular-nums"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[17px] font-black text-primary tabular-nums">Rs. {formatRs(item.total)}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* 3. FINAL SUMMARY */}
            <div className="rounded-[3rem] bg-card p-6 shadow-sm border border-border">
                <div className="space-y-4">
                    <div className="flex justify-between items-center opacity-60">
                        <span className="text-[14px] font-bold">Total Items Count</span>
                        <span className="font-black text-[16px] tabular-nums">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[14px] font-bold opacity-60">Applied Discount</span>
                        <div className="flex items-center bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-2xl border border-red-100 dark:border-red-900/20 w-32 shadow-inner">
                            <span className="text-[12px] font-black text-red-500 mr-2">Rs.</span>
                            <input
                              type="number" inputMode="decimal" min={0} value={discount}
                              onChange={e => {
                                const v = e.target.value;
                                if (v === '' || (Number(v) >= 0 && isFinite(Number(v)))) setDiscount(v);
                              }}
                              placeholder="0" className="bg-transparent outline-none w-full font-black text-red-600 text-right text-[15px] tabular-nums"
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                        <span className="text-[16px] font-black uppercase tracking-[0.2em] opacity-40">Grand Total</span>
                        <span className="text-[32px] font-black text-primary tabular-nums leading-none">Rs. {formatRs(finalTotal)}</span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3">
                    {(['cash', 'online', 'udhaar'] as const).map(m => (
                        <button 
                            key={m} onClick={() => { triggerHaptic(ImpactStyle.Light); setPaymentMethod(m); }}
                            className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border-2 transition-all ${paymentMethod === m ? 'bg-[#00E676] border-[#00E676] text-[#0A3D24] shadow-xl shadow-[#00E676]/10 scale-[1.05]' : 'bg-transparent border-border text-gray-400'}`}
                        >
                            {m === 'cash' ? <Wallet size={20} /> : m === 'online' ? <CreditCard size={20} /> : <BookOpenCheck size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-widest mt-2">{m}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* FLOATING ACTION BAR — anchored above iPhone home indicator. */}
        <div
          className="fixed left-6 right-6 z-fab max-w-md mx-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
        >
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={loading}
                className="w-full h-20 rounded-[2.5rem] bg-gradient-to-r from-[#00E676] to-[#0A3D24] text-white shadow-[0_15px_50px_rgba(0,230,118,0.25)] flex items-center justify-between px-8 disabled:opacity-50 active:shadow-none transition-all"
            >
                <div className="text-left">
                   <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.2em] mb-0.5">Final Amount</p>
                   <p className="text-[24px] font-black tracking-tight tabular-nums leading-none">Rs. {formatRs(finalTotal)}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[14px] font-black uppercase tracking-widest px-6 py-3 bg-white/10 rounded-2xl shadow-sm backdrop-blur-md border border-white/5">Confirm Sale</span>
                    {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <BookOpenCheck size={28} />}
                </div>
            </motion.button>
        </div>
        
        {/* SUCCESS OVERLAY */}
        <AnimatePresence>
          {savedInvoice && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center px-8"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-card rounded-[4rem] p-10 text-center shadow-2xl relative overflow-hidden border border-white/5"
              >
                <div className="absolute top-6 right-6">
                  <button onClick={() => setSavedInvoice(null)} className="p-3 bg-white/5 rounded-2xl opacity-40 hover:opacity-100 transition-all border border-white/5">
                    <Trash2 size={24} />
                  </button>
                </div>

                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/20">
                  <BookOpenCheck size={48} className="text-primary" />
                </div>

                <h2 className="text-[26px] font-black leading-tight mb-3 uppercase tracking-tight">Invoice Saved!</h2>
                <p className="text-[13px] opacity-40 mb-10 font-black uppercase tracking-[0.3em]">No. #{savedInvoice.invoiceNumber}</p>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      const msg = formatReceipt(savedInvoice, profile?.name || 'Our Shop');
                      shareOnWhatsApp(savedInvoice.customerPhone, msg);
                    }}
                    className="w-full h-18 rounded-[2rem] bg-[#25D366] text-white font-black text-[16px] flex items-center justify-center gap-4 shadow-xl shadow-[#25D366]/20 active:scale-95 transition-all outline-none"
                  >
                    <Share2 size={22} strokeWidth={2.5} />
                    WhatsApp Invoice
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
                    className="w-full h-18 rounded-[2rem] bg-card border border-border/50 font-black text-[15px] active:scale-95 transition-all shadow-sm"
                  >
                    Create New Bill
                  </button>
                  
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 opacity-30 font-black text-[11px] uppercase tracking-[0.4em] mt-6 active:opacity-100 transition-opacity"
                  >
                    Go To Home
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
