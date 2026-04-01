import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { useShop, type Stock } from '../context/ShopContext';
import { ArrowLeft, User, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const AddSale: React.FC = () => {
    const { stock, addSale } = useShop();
    const navigate = useNavigate();
    
    const [isSaving, setIsSaving] = useState(false);
    const [view, setView] = useState<'add' | 'review'>('add');
    const [searchTerm, setSearchTerm] = useState('');
    const [basket, setBasket] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
    const [discount, setDiscount] = useState<string | number>(0);
    const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

    const activeStock = useMemo(() => stock.filter(s => s.status !== 'inactive'), [stock]);

    // ── HAPTICS ──
    const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
        Haptics.impact({ style }).catch(() => {});
    };

    // ── BASKET LOGIC ──
    const addToBasket = (item: Stock, initialQty = 1) => {
        triggerHaptic(ImpactStyle.Medium);
        if (item.quantity <= 0) {
            toast.error("Stock khatam hai!");
            return;
        }
        setBasket(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                const newQty = exists.qty + initialQty;
                if (newQty > item.quantity) {
                    toast.error(`Sirf ${item.quantity} pieces hain`);
                    return prev;
                }
                return prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, qty: initialQty }];
        });
        setSearchTerm('');
    };



    const updateQty = (id: string, delta: number) => {
        triggerHaptic();
        const stockItem = stock.find(s => s.id === id);
        setBasket(prev => prev.map(i => {
            if (i.id === id) {
                const newQty = i.qty + delta;
                if (delta > 0 && stockItem && newQty > stockItem.quantity) {
                    toast.error(`Stock kam hai!`);
                    return i;
                }
                return { ...i, qty: Math.max(0, newQty) };
            }
            return i;
        }).filter(i => i.qty > 0));
    };

    const subtotal = basket.reduce((acc, current) => acc + (current.price * current.qty), 0);
    const total = Math.max(0, subtotal - parseFloat(String(discount || '0')));

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
            const parsedDiscount = parseFloat(String(discount || '0'));
            const invId = await addSale(saleItems, 'cash', parsedDiscount);
            toast.success("Hisaab Save Hogaya! ✅");
            if (invId) navigate(`/invoice/${invId}`);
            else navigate('/');
        } catch (err: any) {
            toast.error(err?.message || "Error saving sale.");
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
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-[17px] font-black uppercase tracking-tight">New Sale</h1>
                        {selectedCustomerName && (
                             <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mt-1">
                                <User size={10} className="text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-wider">{selectedCustomerName}</span>
                                <button onClick={() => setSelectedCustomerName(null)} className="ml-1 text-primary hover:text-red-500">×</button>
                             </motion.div>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <ShoppingBasket size={18} strokeWidth={3} />
                    </div>
                </div>

                {/* BASKET DISPLAY */}
                <div className="flex-1 overflow-y-auto px-5 mt-4 pb-96">
                    {view === 'add' ? (
                        <div className="space-y-4">
                            {basket.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-border rounded-[2.5rem] bg-card/30">
                                    <ShoppingCart size={48} className="mb-4 opacity-10" />
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] opacity-40">Add items to start</p>
                                </div>
                            ) : (
                                basket.map(item => (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="p-4 rounded-[2.2rem] border flex items-center justify-between shadow-sm transition-colors duration-300 bg-card border-border">
                                        <div className="flex-1 pr-3">
                                            <p className="text-[15px] font-black leading-tight truncate text-text-primary">{item.name}</p>
                                            <p className="text-[11px] font-bold mt-1 text-primary">Rs. {item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-background/50 p-1.5 rounded-2xl border border-border">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted active:scale-90 transition-all">-</button>
                                            <span className="text-[17px] font-black w-6 text-center text-primary">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-primary/30 bg-primary/10 text-primary active:scale-90 transition-all">+</button>
                                        </div>
                                        <div className="text-right ml-4 min-w-[80px]">
                                            <p className="text-[14px] font-black text-text-primary">Rs. {item.price * item.qty}</p>
                                            <button onClick={() => updateQty(item.id, -999)} className="text-[9px] font-black text-red-500/60 uppercase tracking-widest mt-1">Remove</button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10">
                                <h3 className="text-[14px] font-black uppercase tracking-widest text-primary mb-4">Summary Review</h3>
                                <div className="space-y-3">
                                    {basket.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-[14px]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">{item.qty}x</span>
                                                <span className="font-bold text-text-primary">{item.name}</span>
                                            </div>
                                            <span className="font-black text-text-primary">Rs. {item.price * item.qty}</span>
                                        </div>
                                    ))}
                                    <div className="h-px bg-border my-4" />
                                    <div className="flex justify-between text-[14px]">
                                        <span className="text-text-muted font-bold">Subtotal</span>
                                        <span className="font-black text-text-primary">Rs. {subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-[14px]">
                                        <span className="text-text-muted font-bold">Discount</span>
                                        <span className="font-black text-red-500">- Rs. {discount || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-black/20 p-4 rounded-2xl mt-4">
                                        <span className="text-[12px] font-black uppercase">Net Total</span>
                                        <span className="text-[24px] font-black text-primary">Rs. {total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="fixed bottom-[100px] inset-x-0 mx-auto max-w-md p-6 rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t transition-all duration-500 bg-card border-border z-40">
                    {view === 'add' ? (
                        <>
                            <div className="relative mb-6 flex items-center gap-3">
                                <div className="flex-1 relative transition-all duration-300 rounded-3xl overflow-hidden border border-border">
                                    <input 
                                        list="stock-items-sale-list"
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            const found = stock.find(s => s.name === e.target.value);
                                            if (found) addToBasket(found);
                                        }}
                                        placeholder="Select Items..." 
                                        className="w-full rounded-3xl py-5 px-6 outline-none text-[15px] font-bold bg-background text-text-primary placeholder:text-text-muted/40" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="rounded-[2.2rem] p-5 flex flex-col items-center border border-border bg-background/40">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Pieces</p>
                                    <p className="text-[22px] font-black text-primary">{basket.reduce((a, b) => a + b.qty, 0)}</p>
                                </div>
                                <div className="rounded-[2.2rem] p-5 flex flex-col items-center border border-border bg-background/40">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Discount Rs.</p>
                                    <input 
                                        type="number" 
                                        value={discount} 
                                        onChange={e => setDiscount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent text-center text-[22px] font-black text-red-500 outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 mb-2">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Net Payable</p>
                                    <h2 className="text-[34px] font-black text-text-primary tracking-tight">Rs. {total.toLocaleString()}</h2>
                                </div>
                                <button 
                                    onClick={() => basket.length > 0 && setView('review')}
                                    disabled={basket.length === 0}
                                    className={`px-10 py-5 rounded-[1.8rem] font-black text-[17px] shadow-2xl active:scale-95 transition-all ${basket.length === 0 ? 'bg-border text-text-muted cursor-not-allowed opacity-50' : 'bg-primary text-black shadow-primary/40'}`}
                                >
                                    Review Order
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setView('add')}
                                    className="flex-1 py-5 rounded-[1.8rem] border border-border font-black text-[15px] active:scale-95 transition-all"
                                >
                                    PICHAY
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`flex-[2] py-5 rounded-[1.8rem] font-black text-[17px] shadow-2xl active:scale-95 transition-all ${isSaving ? 'bg-border text-text-muted cursor-not-allowed opacity-50' : 'bg-primary text-black shadow-primary/40'}`}
                                >
                                    {isSaving ? 'Processing...' : 'CONFIRM SALE'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <datalist id="stock-items-sale-list">
                    {activeStock.map(s => <option key={s.id} value={s.name} />)}
                </datalist>
            </div>
        </PageTransition>
    );
};
