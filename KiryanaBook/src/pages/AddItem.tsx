import React, { useState, useMemo, useRef } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Check, ChevronDown, Camera, Search, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { KIRYANA_DATABASE, KIRYANA_CATEGORIES } from '../data/kiryanaDatabase';
import { guessCategory, guessUnit, validateProductEntry, standardizeBrand } from '../utils/productValidation';
import { resizeBase64Image } from '../utils/image';

export const AddItem: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { stock, addStockItem } = useShop();
    const { isDarkMode } = useTheme();

    const [name, setName] = useState('');
    const [category, setCategory] = useState(KIRYANA_CATEGORIES[0].name);
    const [unit, setUnit] = useState<'kg' | 'units' | 'packs' | 'ltr' | 'pcs' | 'dozen'>('pcs');
    const [openingStock, setOpeningStock] = useState('');
    const [buyingPrice, setBuyingPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [minThreshold, setMinThreshold] = useState('5');
    const [packSize, setPackSize] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [company, setCompany] = useState('');
    const [sku, setSku] = useState('');
    
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showImageSource, setShowImageSource] = useState(false);
    
    const initialCheckDone = useRef(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── SMART SUGGESTIONS ───
    const suggestions = useMemo(() => {
        if (!name.trim() || name.length < 2) return [];
        return KIRYANA_DATABASE.filter(item => 
            item.name.toLowerCase().includes(name.toLowerCase()) || 
            item.company.toLowerCase().includes(name.toLowerCase())
        ).slice(0, 5);
    }, [name]);

    const handleSelectSuggestion = (item: any) => {
        setName(item.name);
        if (item.category) setCategory(item.category);
        if (item.company) setCompany(item.company);
        if (item.unit) setUnit(item.unit as any);
        setShowSuggestions(false);
        toast.success(`${item.name} details auto-filled! ⚡`, { icon: '✨' });
    };

    // ─── AUTO GUESS LOGIC ON TYPING ───
    const handleNameChange = (val: string) => {
        setName(val);
        setShowSuggestions(true);
        
        // Only guess if it's a new entry and not just selecting from DB
        if (val.length > 3) {
            const suggestedCat = guessCategory(val);
            if (suggestedCat && suggestedCat !== 'Others') setCategory(suggestedCat);
            
            const suggestedUnit = guessUnit(val);
            if (suggestedUnit) setUnit(suggestedUnit);
        }
    };

    // ─── BARCODE INTEGRATION ───
    React.useEffect(() => {
        const barcode = searchParams.get('barcode');
        if (!barcode || initialCheckDone.current) return;
        setSku(barcode);
        
        const existing = stock.find(s => barcode && (String(s.sku) === barcode || String(s.id) === barcode));
        if (existing) {
            initialCheckDone.current = true;
            toast.error('Yeh item pehle se stock mein hai!');
            navigate(`/stock/${existing.id}`, { replace: true });
            return;
        }

        initialCheckDone.current = true;
        const master = KIRYANA_DATABASE.find(item => item.name.toLowerCase().includes(barcode.toLowerCase()));
        if (master) handleSelectSuggestion(master);
    }, [searchParams, stock]);

    const handleSave = async () => {
        if (!name.trim()) return toast.error('Product name zaroori hai');
        
        setLoading(true);
        try {
            const finalOpening = Number(openingStock) || 0;
            const finalBuying = Number(buyingPrice) || 0;
            const finalSelling = Number(sellingPrice) || 0;
            const finalCategory = showCategoryInput ? newCategory.trim() : category;
            const finalBrand = standardizeBrand(company);

            const newItem: any = {
                name: name.trim(),
                company: finalBrand,
                category: finalCategory || 'Others',
                unit,
                quantity: finalOpening,
                buyingPrice: finalBuying,
                price: finalSelling,
                minThreshold: Number(minThreshold) || 5,
                imageUrl: imageUrl || '',
                sku: String(sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`)
            };
            
            if (packSize.trim()) newItem.packSize = packSize.trim();

            await addStockItem(newItem);
            toast.success('Product add ho gaya! 🎉');
            navigate(-1);
        } catch (e: any) {
            toast.error(`Saving fail hui: ${e?.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = toast.loading('Tasweer process ho rahi hai...');
        try {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const resized = await resizeBase64Image(ev.target?.result as string, 300, 0.7);
                setImageUrl(resized);
                toast.success('Tasweer ready hai!', { id: toastId });
            };
            reader.readAsDataURL(file);
        } catch (err) {
            toast.error('Galti hui tasweer process karne mein', { id: toastId });
        }
    };

    const colors = {
        bg: isDarkMode ? '#0A0A0A' : '#FAFAFA',
        header: isDarkMode ? '#10251A' : '#0A3D24',
        card: isDarkMode ? '#141414' : '#FFFFFF',
        input: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#0A0A0A',
        sub: isDarkMode ? '#B0B0B0' : '#888888',
        border: isDarkMode ? '#2A2A2A' : '#EEEEEE'
    };

    return (
        <PageTransition>
            <div className="w-full font-outfit max-w-md mx-auto relative min-h-screen pb-40" style={{ backgroundColor: colors.bg }}>
                {/* HEADER */}
                <div className="pt-14 pb-4 px-5 flex items-center justify-between sticky top-0 z-50 shadow-sm" style={{ backgroundColor: colors.header }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="text-white/60 p-2 -ml-2 active:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-white font-black text-[22px] tracking-tight">Add New Item</h1>
                    </div>
                </div>

                <div className="px-5 pt-8 space-y-6">
                    {/* PRODUCT NAME WITH SMART AUTO-FILL */}
                    <div className="relative">
                        <p className="text-[11px] font-black uppercase tracking-widest px-1 mb-2" style={{ color: colors.sub }}>Product Name *</p>
                        <div className="relative">
                            <input 
                                value={name} 
                                onChange={e => handleNameChange(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="e.g. Pepsi 1L, Shan Masala..."
                                className="w-full p-5 rounded-2xl border outline-none font-black text-[15px] transition-all shadow-sm focus:border-success/50"
                                style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.input }}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30">
                                <Search size={20} />
                            </div>
                        </div>

                        {/* DATABASE SUGGESTIONS DROPDOWN */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-[110%] z-[60] bg-card rounded-[2rem] shadow-2xl border border-border overflow-hidden"
                                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                >
                                    <div className="p-3 bg-success/5 border-b border-border/10 flex items-center gap-2">
                                        <Sparkles size={12} className="text-success" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-success">Smart Database Matches</span>
                                    </div>
                                    {suggestions.map(item => (
                                        <button 
                                            key={item.id} onClick={() => handleSelectSuggestion(item)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-success/5 text-left border-b last:border-0 border-border/10"
                                        >
                                            <div>
                                                <p className="font-black text-[14px]" style={{ color: colors.text }}>{item.name}</p>
                                                <p className="text-[10px] font-bold opacity-40 uppercase">{item.company} • {item.category}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-success/10 rounded-lg text-[10px] font-black text-success">AUTO FILL</div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* QUICK STATS SECTION (CATEGORY & UNIT) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: colors.sub }}>Category *</p>
                            <div className="relative">
                                <select 
                                    value={category} onChange={e => setCategory(e.target.value)}
                                    className="w-full p-4 rounded-2xl border appearance-none outline-none font-black text-[14px] bg-transparent"
                                    style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.input }}
                                >
                                    {KIRYANA_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: colors.sub }}>Unit *</p>
                            <div className="relative">
                                <select 
                                    value={unit} onChange={e => setUnit(e.target.value as any)}
                                    className="w-full p-4 rounded-2xl border appearance-none outline-none font-black text-[14px] bg-transparent"
                                    style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.input }}
                                >
                                    {['pcs', 'kg', 'ltr', 'units', 'packs', 'dozen', 'bori'].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                            </div>
                        </div>
                    </div>

                    {/* QUANTITY SECTION */}
                    <div className="space-y-2 mt-4">
                        <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: colors.sub }}>Quantity (Current Stock) *</p>
                        <input 
                            type="number" 
                            value={openingStock} 
                            onChange={e => setOpeningStock(e.target.value)}
                            placeholder="e.g. 50" 
                            className="w-full p-4 rounded-2xl border outline-none font-black text-[16px] transition-all focus:border-success/50"
                            style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.input }}
                        />
                    </div>

                    {/* OPTIONAL DETAILS (FOLDABLE OR ACCORDION IF NEEDED, BUT KEEPING CLEAN FOR 3-SEC FLOW) */}
                    <div className="pt-4 border-t border-border/5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40">Optional Details</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase opacity-40" style={{ color: colors.text }}>Buying Price</p>
                                <input type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)} placeholder="0.00" className="w-full p-4 rounded-xl border-none outline-none font-black text-[15px] bg-card" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0' }} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase opacity-40" style={{ color: colors.text }}>Selling Price</p>
                                <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="0.00" className="w-full p-4 rounded-xl border-none outline-none font-black text-[15px] bg-card" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0' }} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase opacity-40" style={{ color: colors.text }}>Company & Barcode</p>
                            <div className="grid grid-cols-2 gap-4">
                                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Brand..." className="p-4 rounded-xl outline-none font-bold text-[13px] bg-card" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0' }} />
                                <input value={sku} onChange={e => setSku(e.target.value)} placeholder="Barcode..." className="p-4 rounded-xl outline-none font-bold text-[13px] bg-card" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0' }} />
                            </div>
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="fixed bottom-8 left-5 right-5 z-[85] space-y-3">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="group w-full h-18 bg-[#4BFF94] text-[#0A3D24] rounded-[2rem] font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : (
                                <>
                                    <Sparkles size={20} className="group-hover:animate-pulse" />
                                    <span>Quick Save Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* IMAGE TRIGGER (Floating small) */}
                <div className="fixed bottom-32 right-6">
                    <button 
                        onClick={() => setShowImageSource(true)}
                        className="w-14 h-14 bg-card border border-border rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-all text-success"
                    >
                        {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover rounded-2xl" /> : <Camera size={24} />}
                    </button>
                </div>

                {/* HIDDEN INPUTS */}
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

                {/* IMAGE SOURCE CHOICE MENU */}
                {showImageSource && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={() => setShowImageSource(false)}>
                        <div className="w-full max-w-xs bg-card rounded-[2.5rem] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-[18px] font-black text-center mb-6">Tasweer Kahan Se Lein?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { cameraInputRef.current?.click(); setShowImageSource(false); }} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-success/10 active:scale-95 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-success text-[#0A3D24] flex items-center justify-center shadow-lg"><Camera size={22} /></div>
                                    <span className="text-[12px] font-black">CAMERA</span>
                                </button>
                                <button onClick={() => { fileInputRef.current?.click(); setShowImageSource(false); }} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-gray-100 dark:bg-white/5 active:scale-95 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shadow-sm"><Package size={22} /></div>
                                    <span className="text-[12px] font-black">GALLERY</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};
