import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const AddSale: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { addSale, stock } = useShop();

    const [basket, setBasket] = useState<{ id: string, name: string, price: number, qty: number }[]>([]);
    const [discount, setDiscount] = useState('0');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
        Haptics.impact({ style }).catch(() => {});
    };

    const addToBasket = (item: any) => {
        triggerHaptic(ImpactStyle.Medium);
        const stockItem = stock.find(s => s.id === item.id);
        if (!stockItem || stockItem.quantity <= 0) {
            toast.error("Stock khatam hai!");
            return;
        }

        setBasket(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                if (exists.qty >= stockItem.quantity) {
                    toast.error(`Sirf ${stockItem.quantity} pieces mawjood hain`);
                    return prev;
                }
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
        });
        setSearchTerm(''); // Clear search
    };

    const updateQty = (id: string, delta: number) => {
        triggerHaptic();
        const stockItem = stock.find(s => s.id === id);
        setBasket(prev => prev.map(i => {
            if (i.id === id) {
                const newQty = i.qty + delta;
                if (delta > 0 && stockItem && newQty > stockItem.quantity) {
                    toast.error(`Sirf ${stockItem.quantity} pieces mawjood hain`);
                    return i;
                }
                return { ...i, qty: Math.max(0, newQty) };
            }
            return i;
        }).filter(i => i.qty > 0));
    };

    const subtotal = basket.reduce((acc, current) => acc + (current.price * current.qty), 0);
    const total = Math.max(0, subtotal - parseFloat(discount || '0'));

    const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';

    const handleSave = async () => {
        if (basket.length === 0) {
            toast.error("Basket khali hai");
            return;
        }
        if (isSaving) return;

        setIsSaving(true);
        triggerHaptic(ImpactStyle.Heavy);

        try {
            const saleItems = basket.map(i => ({ itemId: i.id, name: i.name, price: i.price, qty: i.qty }));
            const invId = await addSale(saleItems, 'cash');
            toast.success("Hisaab Save Hogaya! ✅");
            if (invId) {
                navigate(`/invoice/${invId}`);
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error("Sale Save Error:", err);
            toast.error(err?.message || "Save karne mein masla hua. Dobara try karein.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageTransition>
        <div className="w-full pb-8 transition-colors duration-300 font-outfit max-w-md mx-auto bg-background text-text-primary">
                {/* HEADER */}
                <div className="px-5 pt-5 pb-4 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-card border border-border text-text-primary active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-[17px] font-black uppercase tracking-tight">New Sale</h1>
                        <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] opacity-40 italic">Indus Ledger Core</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                        <Plus size={18} strokeWidth={3} />
                    </div>
                </div>

                {/* ── BASKET DISPLAY ── */}
                <div className="flex-1 overflow-y-auto px-5 mt-4 pb-80">
                    <div className="space-y-3">
                        {basket.length === 0 ? (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                                <ShoppingCart size={32} className="mb-2 opacity-50" />
                                <p className="text-[12px] font-bold uppercase tracking-widest">Basket Khali Hai</p>
                            </div>
                        ) : (
                             basket.map(item => (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={item.id} className="p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors duration-300 bg-card border-border">
                                    <div className="flex-1 pr-3">
                                        <p className="text-[14px] font-bold leading-tight truncate text-text-primary">{item.name}</p>
                                        <p className="text-[11px] font-bold mt-0.5 text-text-muted">Rs. {item.price} each</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors" style={{ backgroundColor: isDarkMode ? '#252525' : '#F9FAFB', color: isDarkMode ? '#B0B0B0' : '#888888', borderColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }}>-</button>
                                        <span className="text-[15px] font-black w-6 text-center" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors" style={{ backgroundColor: isDarkMode ? '#1A3D24' : '#E8F5E9', color: isDarkMode ? '#4BFF94' : '#0A3D24', borderColor: isDarkMode ? '#00E67640' : '#4BFF9440' }}>+</button>
                                    </div>
                                    <p className="text-[14px] font-black ml-4 w-20 text-right text-text-primary">Rs. {item.price * item.qty}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                 {/* ── CONTROLS ── */}
                <div className="fixed bottom-[90px] inset-x-0 mx-auto max-w-md p-5 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t transition-colors duration-300 bg-card border-border z-40">
                        <>
                            <div className="relative mb-4">
                                <input 
                                    list="stock-items-sale"
                                    value={searchTerm}
                                    onChange={e => {
                                        setSearchTerm(e.target.value);
                                        const found = stock.find(s => s.name === e.target.value);
                                        if (found) addToBasket(found);
                                    }}
                                    placeholder="Select Items (Type names one by one...)" 
                                    className="w-full rounded-2xl py-4 px-5 outline-none text-[14px] font-bold" 
                                    style={{ backgroundColor: isDarkMode ? '#252525' : '#F4F4F5', color: text }}
                                />
                                <datalist id="stock-items-sale">
                                    {stock.map(s => <option key={s.id} value={s.name}>{s.category} - Rs. {s.price}</option>)}
                                </datalist>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-[#4BFF94] flex items-center justify-center">
                                    <Plus size={14} className="text-[#0A3D24]" strokeWidth={3} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="rounded-2xl p-4 flex flex-col items-center transition-colors" style={{ backgroundColor: isDarkMode ? '#252525' : '#F4F4F5' }}>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pieces</p>
                                    <p className="text-[18px] font-black" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>{basket.reduce((a, b) => a + b.qty, 0)}</p>
                                </div>
                                <div className="rounded-2xl p-4 flex flex-col items-center transition-colors" style={{ backgroundColor: isDarkMode ? '#252525' : '#F4F4F5' }}>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Discount Rs.</p>
                                    <input 
                                        type="number" 
                                        value={discount} 
                                        onChange={e => setDiscount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent text-center text-[18px] font-black text-red-500 outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 mb-2">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Net Total Amount</p>
                                    <h2 className="text-[28px] font-black text-gray-800 dark:text-white tracking-tight">Rs. {total.toLocaleString()}</h2>
                                </div>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`px-8 py-4 rounded-2xl font-black text-[15px] shadow-lg active:scale-95 transition-all ${isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#4BFF94] text-[#0A3D24] shadow-[#4BFF94]/30'}`}
                                >
                                    {isSaving ? 'Saving...' : 'SAVE KRDO'}
                                </button>
                            </div>
                        </>
                </div>
            </div>
        </PageTransition>
    );
}
