import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface Item { itemId: string; name: string; qty: number; price: number; total: number; }

export const NewInvoice: React.FC = () => {
  const { contacts, stock, addInvoice } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // Frequent customers (first 5 contacts with balance or just first 5)
  const frequentCustomers = useMemo(() => contacts.slice(0, 5), [contacts]);
  
  const [items, setItems] = useState<Item[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemResults, setShowItemResults] = useState(false);
  
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'udhaar'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#EEEEEE';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const input = isDarkMode ? '#1E1E1E' : '#F5F5F5';

  const filteredCustomers = useMemo(() =>
    contacts.filter(c => (c.name || '').toLowerCase().includes((customerSearch || '').toLowerCase())).slice(0, 5),
    [contacts, customerSearch]
  );

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.total, 0), [items]);
  const discountVal = parseFloat(discount) || 0;
  const finalTotal = subtotal - discountVal;

  const updateItem = (idx: number, field: keyof Item, val: string | number) => {
    setItems(prev => {
      const copy = [...prev];
      const item = { ...copy[idx], [field]: val };
      
      // LOGIC: If name changes, try to find stock item and auto-fill ID and Price
      if (field === 'name') {
        const found = stock.find(s => (s.name || '').toLowerCase() === String(val || '').toLowerCase());
        if (found) {
          item.itemId = found.id;
          item.price = found.price;
          item.total = item.qty * item.price;
        }
      }

      if (field === 'qty' || field === 'price') {
        item.total = item.qty * item.price;
      }
      copy[idx] = item;
      return copy;
    });
  };

  const addItem = (s: any) => {
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


  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!customerName.trim()) return toast.error('Customer ka naam darj karein');
    
    if (items.some(i => !i.name.trim() || !i.itemId || i.itemId.startsWith('custom-'))) return toast.error('Har item stock se hona zaroori hai!');

    if (items.some(i => i.price <= 0)) return toast.error('Total price 0 nahi ho sakti');
    if (finalTotal < 0) return toast.error('Discount total se zyada nahi ho sakta');
    setLoading(true);
    try {
      const _id = await addInvoice({
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
      toast.success('Invoice ban gaya!');
      // Give Firestore a small window to sync the new record into memory
      setTimeout(() => {
        navigate('/invoices');
      }, 500);
    } catch (e: any) {
      toast.error(e.message || 'Kuch masla hua');
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative" style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="bg-card dark:bg-[#141414] px-5 pt-5 pb-4 sticky top-0 z-40 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => navigate(-1)} className="text-text-primary active:scale-90 transition-transform">
              <ArrowLeft size={22} />
            </button>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Indus Ledger v3.0</p>
            <div className="w-8" />
          </div>
          <h1 className="text-text-primary font-black text-[22px]">Naya Invoice</h1>
        </div>

        <div className="px-4 pt-4 space-y-4">

          {/* ── SECTION 1: CUSTOMER ── */}
          <div className="rounded-3xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">① Customer Selection</p>
            </div>

            <div className="p-4 space-y-4">
              {/* Customer Search Bar */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-2xl border bg-card-secondary active:border-primary transition-all" style={{ borderColor: border }}>
                  <Search size={18} style={{ color: sub }} />
                  <input
                    value={customerSearch || customerName}
                    onChange={e => {
                      setCustomerSearch(e.target.value);
                      setCustomerName(e.target.value);
                      setShowCustomerSearch(true);
                    }}
                    onFocus={() => setShowCustomerSearch(true)}
                    placeholder="Search repeat/udhaar buyer..."
                    className="flex-1 bg-transparent outline-none text-[15px] font-bold"
                    style={{ color: text }}
                  />
                  {customerName && (
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {showCustomerSearch && filteredCustomers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 rounded-2xl border z-50 overflow-hidden mt-1 shadow-2xl"
                      style={{ backgroundColor: card, borderColor: border }}
                    >
                      {filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { 
                            setCustomerName(c.name); 
                            setCustomerPhone(c.phone); 
                            setCustomerSearch(''); 
                            setShowCustomerSearch(false); 
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ borderColor: border }}
                        >
                          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-[12px] font-black text-primary">
                            {c.name && c.name[0] ? c.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold" style={{ color: text }}>{c.name}</p>
                            <p className="text-[11px]" style={{ color: sub }}>{c.phone}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Frequent Customers Row */}
              {frequentCustomers.length > 0 && (
                <div className="pt-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Frequent Buyers</p>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {frequentCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCustomerName(c.name);
                          setCustomerPhone(c.phone);
                        }}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-90 transition-transform"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] font-black border-2 transition-all ${customerName === c.name ? 'bg-primary border-primary text-white' : 'bg-card border-border text-gray-400'}`}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <span className="text-[9px] font-bold max-w-[50px] truncate" style={{ color: customerName === c.name ? 'var(--primary)' : sub }}>{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 2: ITEMS ── */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: card, borderColor: border }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">② Item Details</p>
               
               {/* Search Bar */}
               <div className="relative">
                 <div className="flex items-center gap-2 p-3 rounded-2xl border bg-card-secondary" style={{ borderColor: border }}>
                   <Search size={15} style={{ color: sub }} />
                   <input
                     value={itemSearch}
                     onChange={e => { setItemSearch(e.target.value); setShowItemResults(true); }}
                     onFocus={() => setShowItemResults(true)}
                     placeholder="Search product from stock..."
                     className="flex-1 bg-transparent outline-none text-[13px] font-medium"
                     style={{ color: text }}
                   />
                   {/* Custom item button removed to enforce stock tracking */}

                 </div>

                 <AnimatePresence>
                   {showItemResults && itemSearch && (
                     <motion.div
                       initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                       className="absolute top-full left-0 right-0 max-h-[220px] overflow-y-auto rounded-2xl border z-50 mt-1 shadow-2xl"
                       style={{ backgroundColor: card, borderColor: border }}
                     >
                       {stock.filter(s => s.name.toLowerCase().includes(itemSearch.toLowerCase())).length > 0 ? (
                         stock.filter(s => s.name.toLowerCase().includes(itemSearch.toLowerCase())).map(s => (
                           <button
                             key={s.id}
                             onClick={() => addItem(s)}
                             className="w-full flex items-center justify-between p-3 border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                             style={{ borderColor: border }}
                           >
                             <div>
                               <p className="text-[13px] font-bold" style={{ color: text }}>{s.name}</p>
                               <p className="text-[10px]" style={{ color: sub }}>Stock: {s.quantity} {s.unit}</p>
                             </div>
                             <div className="text-right">
                               <p className="text-[13px] font-black text-primary">Rs. {s.price}</p>
                               <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Add to Bill</p>
                             </div>
                           </button>
                         ))
                       ) : (
                         <div className="p-4 text-center">
                           <p className="text-[11px] font-bold" style={{ color: sub }}>No product found</p>
                         </div>
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>

            {/* Added Items List */}
            <div className="divide-y" style={{ borderColor: border }}>
              {items.length === 0 ? (
                <div className="py-12 text-center">
                   <Package className="mx-auto mb-2 text-gray-200" size={32} />
                   <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">No items added yet</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.itemId} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                       <p className="text-[14px] font-black uppercase tracking-tight" style={{ color: text }}>{item.name}</p>
                       <button onClick={() => removeItem(idx)} className="text-red-400 p-1 active:scale-75 transition-transform">
                         <Trash2 size={16} />
                       </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       {/* Qty Controls */}
                       <div className="flex items-center gap-1 bg-card-secondary p-1 rounded-xl border" style={{ borderColor: border }}>
                          <button 
                            onClick={() => updateItem(idx, 'qty', Math.max(1, item.qty - 1))}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px] font-bold active:bg-gray-200 dark:active:bg-white/10"
                            style={{ color: text }}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className="w-10 text-center bg-transparent text-[13px] font-black outline-none"
                            value={item.qty}
                            onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                            style={{ color: text }}
                          />
                          <button 
                            onClick={() => updateItem(idx, 'qty', item.qty + 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px] font-bold active:bg-gray-200 dark:active:bg-white/10"
                            style={{ color: text }}
                          >
                            +
                          </button>
                       </div>

                       {/* Rate Input */}
                       <div className="flex-1 flex flex-col gap-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Rate</p>
                          <div className="flex items-center gap-1">
                             <span className="text-[11px] font-bold opacity-40">Rs.</span>
                             <input 
                               type="number"
                               value={item.price || ''}
                               onChange={e => updateItem(idx, 'price', Number(e.target.value))}
                               className="w-full bg-transparent text-[14px] font-black outline-none"
                               style={{ color: text }}
                             />
                          </div>
                       </div>

                       {/* Row Total */}
                       <div className="text-right flex flex-col gap-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total</p>
                          <p className="text-[16px] font-black" style={{ color: text }}>Rs. {item.total.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── SECTION 3: SUMMARY ── */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: card, borderColor: border }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#0A3D24' }}>③ Summary</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium" style={{ color: sub }}>Subtotal</span>
                <span className="text-[15px] font-black" style={{ color: text }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] font-medium" style={{ color: sub }}>Discount</span>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 w-28">
                  <span className="text-[14px] font-black" style={{ color: sub }}>Rs.</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-right text-[15px] font-black outline-none bg-transparent w-full"
                    style={{ color: '#FF5252' }}
                  />
                </div>
              </div>
              <div className="border-t pt-3 mt-3 flex items-center justify-between" style={{ borderColor: border }}>
                <span className="text-[14px] font-black" style={{ color: text }}>Final Total</span>
                <span className="text-[24px] font-black text-[#0A3D24] dark:text-[#00E676]">Rs. {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: PAYMENT ── */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: card, borderColor: border }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0A3D24] dark:text-[#00E676]">④ Payment & Notes</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
                {(['cash', 'online', 'udhaar'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${paymentMethod === method
                      ? method === 'cash' ? 'bg-[#00C853] text-white shadow-md'
                        : method === 'online' ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-[#FF5252] text-white shadow-md'
                      : 'text-gray-500'}`}
                  >
                    {method === 'cash' ? '💵 Cash' : method === 'online' ? '📱 Online' : '📋 Udhaar'}
                  </button>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Notes (Optional) — e.g. Bank Transfer, Easypaisa..."
                className="w-full rounded-2xl p-4 text-[13px] font-medium outline-none border focus:border-primary transition-all resize-none"
                style={{ backgroundColor: input, color: text, borderColor: border }}
              />
            </div>
          </div>
          
          <div className="h-6" /> {/* Extra spacing before bottom bar */}
        </div>

        {/* SAVE INVOICE BUTTON */}
        <div className="fixed bottom-[90px] left-0 right-0 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-t z-50 px-4 py-3 transition-colors duration-300" style={{ borderColor: border }}>
          <div className="max-w-md mx-auto flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sub }}>Total Amount</span>
              <span className="text-[20px] font-black leading-none" style={{ color: text }}>Rs. {finalTotal.toLocaleString()}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#0A3D24] text-white h-14 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_10px_20px_rgba(10,61,36,0.3)]"
            >
              {loading ? 'Saving...' : '🧾 INVOICE BANAO'}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

