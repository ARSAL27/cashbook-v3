import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { useShop, type Stock } from '../context/ShopContext';
import { ArrowLeft, User, ShoppingCart, ScanLine, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { fuzzySearch, highlightMatch } from '../services/searchService';
import { sumLineItems, applyDiscount, parseDiscount, formatRs } from '../utils/money';

export const AddSale: React.FC = () => {
    const { stock, addSale } = useShop();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [isSaving, setIsSaving] = useState(false);
    const [view, setView] = useState<'add' | 'review'>('add');
    const [searchTerm, setSearchTerm] = useState('');
    const [basket, setBasket] = useState<{ id: string; name: string; price: number; qty: number }[]>(() => {
        // Guard against corrupted localStorage — JSON.parse on garbage used to crash this whole page.
        try {
            const saved = localStorage.getItem('current_sale_basket');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];
            // Only keep entries that look like valid basket items.
            return parsed.filter((i: any) =>
                i && typeof i.id === 'string' && typeof i.name === 'string' &&
                isFinite(Number(i.price)) && isFinite(Number(i.qty)) && Number(i.qty) > 0
            );
        } catch {
            try { localStorage.removeItem('current_sale_basket'); } catch {}
            return [];
        }
    });
    const [discount, setDiscount] = useState<string>('');
    const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Save basket to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('current_sale_basket', JSON.stringify(basket));
    }, [basket]);
    
    // ✅ FIX: Guard ref to prevent duplicate scan processing
    const processedScanRef = useRef<string | null>(null);

    // Auto-add item when returning from barcode scan
    useEffect(() => {
        try {
            const scannedId = searchParams.get('scanned');
            const scannedBarcode = searchParams.get('scanned_barcode');
            
            // ✅ Nothing to process
            if (!scannedId && !scannedBarcode) return;
            
            const scanKey = scannedId || scannedBarcode || '';
            
            // ✅ FIX: Prevent double processing on re-renders
            if (processedScanRef.current === scanKey) return;
            
            // ✅ FIX: Wait for stock to load before processing
            if (!stock || stock.length === 0) {
                // Stock hasn't loaded yet, will re-run when stock is available
                return;
            }
            
            // Mark as processed BEFORE doing anything
            processedScanRef.current = scanKey;

            const item = stock.find(s => 
                (scannedId && String(s.id) === String(scannedId)) || 
                (scannedBarcode && String(s.sku) === String(scannedBarcode))
            );
            
            if (item) {
                // Ensure price and qty are numbers
                const safeItem = {
                    ...item,
                    price: Number(item.price || 0),
                    quantity: Number(item.quantity || 0)
                };
                addToBasket(safeItem);
                toast.success(`${item.name} basket mein add ho gaya`, { id: 'scan-added' });
                
                // Remove the param so refresh doesn't re-add
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('scanned');
                newParams.delete('scanned_barcode');
                navigate({ search: newParams.toString() }, { replace: true });
            } else if (scannedBarcode) {
                toast.error('Product nahi mila: ' + scannedBarcode, { id: 'scan-notfound' });
                navigate(`/add-item?barcode=${encodeURIComponent(scannedBarcode)}`, { replace: true });
            }
        } catch (err) {
            console.error('Scan processing error:', err);
            toast.error('Scan process mein masla hua');
        }
    }, [searchParams, stock]);

    const activeStock = useMemo(() => stock.filter(s => s.status !== 'inactive'), [stock]);

    const searchResults = useMemo(() => {
        return fuzzySearch(searchTerm, activeStock, ['name', 'company', 'sku'], 5);
    }, [activeStock, searchTerm]);

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

    const subtotal = sumLineItems(basket);
    const cleanDiscount = parseDiscount(discount);
    const total = applyDiscount(subtotal, cleanDiscount);

    const handleSave = async () => {
        if (basket.length === 0) {
            toast.error("Basket khali hai");
            return;
        }
        if (isSaving) return;
        setIsSaving(true);
        triggerHaptic(ImpactStyle.Heavy);

        const saleItems = basket.map(i => ({
            itemId: String(i.id),
            name: String(i.name),
            price: Number(i.price || 0),
            qty: Number(i.qty || 0)
        }));

        // Validate BEFORE network call — fail fast.
        if (saleItems.some(item => !item.itemId || !item.name || !isFinite(item.qty) || item.qty <= 0 || !isFinite(item.price) || item.price < 0)) {
            toast.error('Kuch items mein masla hai (Name/Price/Qty galat), dobara try karein');
            setIsSaving(false);
            return;
        }
        const parsedDiscount = parseDiscount(discount);
        if (parsedDiscount > subtotal) {
            toast.error('Discount subtotal se zyada nahi ho sakta');
            setIsSaving(false);
            return;
        }

        // ✅ AWAIT the sale. Don't pre-show success — only toast after Firestore confirms.
        // Don't navigate until we know it actually saved, otherwise silent data loss.
        try {
            const invId = await addSale(saleItems, 'cash', parsedDiscount);
            if (!invId) throw new Error('Sale save nahi hui.');
            try { localStorage.removeItem('current_sale_basket'); } catch {}
            toast.success("Hisaab Save Hogaya! ✅");
            navigate('/');
        } catch (err: any) {
            console.error('Sale save error:', err);
            toast.error(err?.message || "Sale save nahi ho saki. Dobara try karein.");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <PageTransition> <div className="w-full transition-colors duration-300 font-outfit max-w-md mx-auto bg-background text-text-primary ">
                {/* HEADER — pt-page accounts for status-bar safe area on real devices. */}
                <div className="pt-page pb-4 px-5 flex items-center justify-between sticky top-0 z-sticky bg-background/80 backdrop-blur-md border-b border-border transition-all">
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
                        <ShoppingCart size={18} strokeWidth={3} />
                    </div>
                </div>

                {/* BASKET DISPLAY — bottom padding sized for the floating action card below.
                    Was pb-96 (24rem) which left a huge empty gap; now matches the actual bar height. */}
                <div className="flex-1 overflow-y-auto px-5 mt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 22rem)' }}>
                    {view === 'add' ? (
                        <div className="space-y-4">
                            {basket.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-border rounded-[2.5rem] bg-card/30">
                                    <ShoppingCart size={48} className="mb-4 opacity-10" />
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] opacity-40">Add items to start</p>
                                </div>
                            ) : (
                                basket.map(item => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        key={item.id} 
                                        className="p-4 rounded-[2.2rem] border flex items-center justify-between shadow-sm transition-colors duration-300 bg-card border-border"
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-[14px] font-black leading-tight truncate text-text-primary">{item.name}</p>
                                            <p className="text-[11px] font-bold mt-1 text-primary">Rs. {item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-background/50 p-1 rounded-2xl border border-border shrink-0">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-xl flex items-center justify-center border border-border text-text-muted active:scale-90 transition-all">-</button>
                                            <span className="text-[16px] font-black w-5 text-center text-primary">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-xl flex items-center justify-center border border-primary/30 bg-primary/10 text-primary active:scale-90 transition-all">+</button>
                                        </div>
                                        <div className="text-right ml-3 min-w-[95px] shrink-0">
                                            <p className="text-[14px] font-black text-text-primary whitespace-nowrap">Rs. {formatRs(item.price * item.qty)}</p>
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
                                        <span className="font-black text-text-primary">Rs. {formatRs(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[14px]">
                                        <span className="text-text-muted font-bold">Discount</span>
                                        <span className="font-black text-red-500">- Rs. {formatRs(cleanDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-black/20 p-4 rounded-2xl mt-4">
                                        <span className="text-[12px] font-black uppercase">Net Total</span>
                                        <span className="text-[24px] font-black text-primary">Rs. {formatRs(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                  className="fixed inset-x-0 mx-auto max-w-md p-6 rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t transition-all duration-500 bg-card border-border z-fab"
                  style={{ bottom: 'env(safe-area-inset-bottom, 0px)' }}
                >
                    {view === 'add' ? (
                        <>
                            <div className="relative mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`flex-1 relative transition-all duration-300 rounded-3xl overflow-hidden border ${isSearchFocused ? 'border-[#4BFF94] shadow-[0_0_20px_rgba(75,255,148,0.1)]' : 'border-border'}`}>
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted">
                                            <Search size={18} />
                                        </div>
                                        <input 
                                            value={searchTerm}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay for click on results
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Select Items..." 
                                            className="w-full rounded-3xl py-5 pl-12 pr-6 outline-none text-[15px] font-bold bg-background text-text-primary placeholder:text-text-muted/40" 
                                        />
                                        {searchTerm && (
                                            <button 
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-border/20 flex items-center justify-center"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate('/barcode-scan?mode=SINGLE&target=sale')}
                                        className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 active:scale-90 transition-all"
                                    >
                                        <ScanLine size={24} className="text-primary" strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Custom Autocomplete Results */}
                                <AnimatePresence>
                                    {isSearchFocused && searchResults.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -2 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 right-0 mb-3 bg-card border border-border rounded-[2.2rem] shadow-2xl overflow-hidden z-[60]"
                                        >
                                            <div className="p-2 space-y-1">
                                                {searchResults.map(item => {
                                                    const inBasket = basket.find(b => b.id === item.id);
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => addToBasket(item)}
                                                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-colors text-left group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0 font-black text-xs text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                    {item.imageUrl ? (
                                                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        item.name[0].toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <p className="text-[13px] font-black text-text-primary leading-none">
                                                                            {highlightMatch(item.name, searchTerm).map((part, i) => (
                                                                                <span key={i} className={part.match ? 'text-primary underline' : ''}>{part.text}</span>
                                                                            ))}
                                                                        </p>
                                                                        {item.packSize && (
                                                                            <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md">{item.packSize}</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Rs. {item.price} • {item.company || 'Universal'}</p>
                                                                </div>
                                                            </div>
                                                            {inBasket ? (
                                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <Check size={12} className="text-primary" strokeWidth={3} />
                                                                </div>
                                                            ) : (
                                                                <button className="text-[10px] font-black text-primary uppercase pr-2 opacity-0 group-hover:opacity-100 transition-opacity">+ ADD</button>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                        inputMode="decimal"
                                        min={0}
                                        value={discount}
                                        onChange={e => {
                                            const v = e.target.value;
                                            // Block negatives and obviously bad input at the source.
                                            if (v === '' || (Number(v) >= 0 && isFinite(Number(v)))) setDiscount(v);
                                        }}
                                        placeholder="0"
                                        className="w-full bg-transparent text-center text-[22px] font-black text-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 mb-2">
                                <div className="min-w-[120px]">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Net Payable</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[14px] font-black text-text-primary/40 uppercase tracking-tighter">Rs.</span>
                                        <h2 className="text-[32px] font-black text-text-primary tracking-tighter leading-none">{formatRs(total)}</h2>
                                    </div>
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

            </div>
        </PageTransition>
    );
};
