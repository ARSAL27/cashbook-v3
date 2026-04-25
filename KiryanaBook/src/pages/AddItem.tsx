import React, { useState, useMemo, useRef } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Check, ChevronDown, Camera, Search, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { KIRYANA_DATABASE, KIRYANA_CATEGORIES } from '../data/kiryanaDatabase';
import { guessCategory, guessUnit, validateProductEntry, standardizeBrand } from '../utils/productValidation';
import { resizeBase64Image } from '../utils/image';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { masterBarcodeLookup } from '../services/barcodeService';
import { LiveBulkScanner } from '../components/LiveBulkScanner';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { BarcodeScanner as NativeScanner, BarcodeFormat as NativeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';

export const AddItem: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { stock, addStockItem } = useShop();
    const { isDarkMode } = useTheme();

    const [name, setName] = useState('');
    const [category, setCategory] = useState(KIRYANA_CATEGORIES?.[0]?.name || 'Groceries');
    const [unit, setUnit] = useState<'kg' | 'units' | 'packs' | 'ltr' | 'pcs' | 'dozen' | 'bori'>('pcs');
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
    const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [scanStep, setScanStep] = useState<'none' | 'front' | 'back'>('none');
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showImageSource, setShowImageSource] = useState(false);
    
    const initialCheckDone = useRef(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRefAI = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── SMART SUGGESTIONS ───
    const suggestions = useMemo(() => {
        if (!name.trim() || name.length < 2) return [];
        return KIRYANA_DATABASE.filter(item => 
            item.name.toLowerCase().includes(name.toLowerCase()) || 
            item.company.toLowerCase().includes(name.toLowerCase())
        ).slice(0, 5);
    }, [name]);

    // ─── REAL-TIME DUPLICATE CHECK ───
    const existingInStock = useMemo(() => {
        if (!sku || sku.trim().length < 4) return null;
        const normalized = sku.trim();
        return stock.find(s => s.sku && String(s.sku).trim() === normalized);
    }, [sku, stock]);

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
        
        const checkGlobalDatabase = async () => {
            const tid = toast.loading('Searching global barcode database...', { id: 'barcode-search' });
            try {
                // Check offline database first
                const master = KIRYANA_DATABASE.find(item => item.name.toLowerCase().includes(barcode.toLowerCase()));
                if (master) {
                    toast.success('Found in offline database', { id: 'barcode-search' });
                    handleSelectSuggestion(master);
                    return;
                }
                
                // If not found offline, check Firebase and external APIs via masterBarcodeLookup
                const result = await masterBarcodeLookup(barcode);
                if (result.product) {
                    toast.success(`Found in ${result.source === 'pakistan' ? 'Global' : result.source} Database!`, { id: 'barcode-search' });
                    // Maps global data to local state
                    setName(result.product.name || '');
                    setCompany(result.product.company || '');
                    setCategory(result.product.category || 'Others');
                    setPackSize(result.product.packSize || '');
                    if (result.product.imageUrl) setImageUrl(result.product.imageUrl);
                    if (result.product.unit) setUnit(result.product.unit as any);
                } else {
                    toast.dismiss('barcode-search');
                }
            } catch (err) {
                toast.dismiss('barcode-search');
            }
        };
        
        checkGlobalDatabase();
    }, [searchParams, stock]);

    const handleAIScan = async (base64Images: string[]) => {
        setAiLoading(true);
        const toastId = toast.loading('AI is analyzing the product... 🤖');
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            // Reverted to 3.1-flash-lite-preview as requested for higher quota
            const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

            // 1. NATIVE BARCODE SCANNING (Ultra Accuracy, Zero AI Quota)
            let nativeBarcode: string | null = null;
            if (base64Images[1] && Capacitor.isNativePlatform()) {
                try {
                    const fileName = `temp_bc_${Date.now()}.jpg`;
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Images[1].split(',')[1],
                        directory: Directory.Cache
                    });
                    
                    const scanResult = await NativeScanner.readBarcodesFromImage({
                        path: savedFile.uri,
                        formats: [NativeFormat.Ean13, NativeFormat.Ean8, NativeFormat.Code128, NativeFormat.UpcA]
                    });

                    if (scanResult.barcodes && scanResult.barcodes.length > 0) {
                        nativeBarcode = scanResult.barcodes[0].displayValue || scanResult.barcodes[0].rawValue || null;
                    }
                    await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }).catch(() => {});
                } catch (err) {
                    console.error('Native scan failed:', err);
                }
            }

            // 2. AI ANALYSIS for Metadata (Name, Brand, etc.)
            const resizedImages = await Promise.all(base64Images.map(img => resizeBase64Image(img, 1200, 0.8)));
            const imageParts = resizedImages.map(img => ({
                inlineData: { data: img.split(',')[1], mimeType: "image/jpeg" }
            }));

            const result = await model.generateContent([
                ...imageParts,
                `Analyze these grocery product images (Front and Back). 
                Extract product details and return ONLY a JSON object.
                
                Keys:
                - "name": Full product name
                - "brand": Brand/Company name
                - "category": EXACTLY one from: ${KIRYANA_CATEGORIES.map(c => c.name).join(', ')}
                - "barcode": The numeric barcode digits if visible.
                - "price": Numeric selling price if visible
                - "size": Pack size (e.g. "500ml", "1kg")
                
                Return ONLY valid JSON.`
            ]);

            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
            const data = JSON.parse(cleanJson);

            // 1. SAVE THE FRONT IMAGE TO THE PRODUCT
            if (base64Images[0]) {
                const storageImage = await resizeBase64Image(base64Images[0], 600, 0.6);
                setImageUrl(storageImage);
            }

            // 2. Apply AI results
            if (data.name) {
                const fullName = data.size ? `${data.name} ${data.size}` : data.name;
                setName(fullName);
            }
            if (data.brand) setCompany(data.brand);
            
            // 3. COMBINE & APPLY
            // Use Native Barcode if found, otherwise fallback to AI
            const finalBarcode = (nativeBarcode || data.barcode || '').trim().replace(/\s/g, '');
            
            if (base64Images[0]) {
                const storageImage = await resizeBase64Image(base64Images[0], 600, 0.6);
                setImageUrl(storageImage);
            }

            if (data.name) setName(data.size ? `${data.name} ${data.size}` : data.name);
            if (data.brand) setCompany(data.brand);
            
            if (finalBarcode && finalBarcode !== 'null') {
                setSku(finalBarcode);
                const existing = stock.find(s => s.sku && String(s.sku).trim() === finalBarcode);
                if (existing) {
                    toast.success('Ye product pehle se stock mein hai! ✨', { id: toastId });
                    setTimeout(() => navigate(`/stock/${existing.id}`), 1000);
                    return;
                }
                
                // Info if using AI only (less accurate)
                if (!nativeBarcode && Capacitor.isNativePlatform()) {
                    toast.error('Barcode AI se pehchana gaya hai, check karlein.', { id: toastId + '-warn' });
                }

                masterBarcodeLookup(finalBarcode).then(globalMatch => {
                    if (globalMatch.product) {
                        const gp = globalMatch.product;
                        if (gp.name) setName(gp.name);
                        if (gp.company) setCompany(gp.company);
                        if (gp.category) setCategory(gp.category);
                        if (gp.unit) setUnit(gp.unit as any);
                        toast.success(`Verified with Global Database!`, { id: 'global-lookup', duration: 2000 });
                    }
                }).catch(() => {});
            } else {
                toast.error('Barcode saaf nahi hai! 📸', { id: toastId + '-barcode', duration: 5000 });
            }
            
            if (data.price && !sellingPrice) setSellingPrice(String(data.price));
            if (data.size) setPackSize(data.size);
            if (data.category) {
                const match = KIRYANA_CATEGORIES.find(c => c.name.toLowerCase() === data.category.toLowerCase());
                if (match) setCategory(match.name);
            }

            toast.success('AI magic complete! ✨', { id: toastId });
        } catch (error: any) {
            console.error('AI Error:', error);
            const errMsg = error?.message?.toLowerCase() || '';
            const status = error?.status || '';
            
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exceeded')) {
                toast.error('AI Limit Reached! Please wait 1 minute before trying again.', { id: toastId, duration: 5000 });
            } else if (errMsg.includes('api key') || errMsg.includes('invalid') || errMsg.includes('403')) {
                toast.error(`API Key Error: ${error.message}`, { id: toastId, duration: 5000 });
            } else if (errMsg.includes('not found') || errMsg.includes('404')) {
                toast.error(`Model Error: ${error.message}`, { id: toastId, duration: 5000 });
            } else {
                toast.error(`AI Error: ${error.message || 'Unknown error'}`, { id: toastId });
            }
        } finally {
            setAiLoading(false);
        }
    };

    const handleSave = async () => {
        if (loading) return;
        if (!name.trim()) return toast.error('Product name zaroori hai');
        
        setLoading(true);
        try {
            // Check for duplicates before saving
            if (existingInStock) {
                toast.error('Yeh barcode pehle se stock mein hai! (Duplicate found)', { duration: 5000 });
                setLoading(false);
                return;
            }

            const finalOpening = Number(openingStock) || 0;
            const finalBuying = Number(buyingPrice) || 0;
            const finalSelling = Number(sellingPrice) || 0;
            const finalCategory = showCategoryInput ? newCategory.trim() : category;
            const finalBrand = standardizeBrand(company);

                // Validate barcode: must be numeric and at least 4 digits
                const isValidBarcode = /^\d{4,}$/.test(String(sku).trim());
                const finalSku = isValidBarcode 
                    ? String(sku).trim() 
                    : `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

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
                sku: finalSku
            };
            
            if (packSize.trim()) newItem.packSize = packSize.trim();

            addStockItem(newItem);
            toast.success('Product add ho gaya! 🎉');
            navigate(-1);
        } catch (e: any) {
            toast.error(`Saving fail hui: ${e?.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAIScan = false) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const toastId = toast.loading('Tasweer process ho rahi hai...');
        try {
            const base64Images = await Promise.all(files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                        try {
                            const resized = await resizeBase64Image(ev.target?.result as string, 800, 0.7);
                            resolve(resized);
                        } catch (err) { reject(err); }
                    };
                    reader.readAsDataURL(file);
                });
            }));

            if (isAIScan) {
                toast.dismiss(toastId);
                
                if (scanStep === 'front') {
                    const frontImg = base64Images[0];
                    setCapturedImages([frontImg]);
                    setScanStep('back');
                    toast.success('Ab BACK side (Barcode) ki pic lein! 📸', { duration: 3000 });
                } else if (scanStep === 'back') {
                    const backImg = base64Images[0];
                    setCapturedImages(prev => {
                        const newImages = [...prev, backImg];
                        // Trigger AI scan only when we have both
                        if (newImages.length >= 2) {
                            handleAIScan(newImages);
                            setScanStep('none');
                        }
                        return newImages;
                    });
                } else {
                    // Fallback for single scan if needed
                    handleAIScan(base64Images);
                    setImageUrl(base64Images[0]);
                }
                if (e.target) e.target.value = '';
            } else {
                setImageUrl(base64Images[0]);
                toast.success('Tasweer ready hai!', { id: toastId });
            }
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

                    {/* GUIDED AI SCANNER */}
                    <div className="bg-card rounded-[2.5rem] p-6 border border-border shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={16} className="text-success" />
                            <h3 className="text-[13px] font-black uppercase tracking-widest" style={{ color: colors.text }}>Smart AI Add (2 Photos)</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setScanStep('front');
                                    cameraInputRefAI.current?.click();
                                }}
                                className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden ${capturedImages.length >= 1 ? 'bg-success/10 border-success' : 'border-dashed border-border'}`}
                                style={{ backgroundColor: capturedImages.length >= 1 ? 'rgba(75, 255, 148, 0.05)' : colors.input }}
                            >
                                {capturedImages.length >= 1 ? (
                                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-[#0A3D24]">
                                        <Check size={18} strokeWidth={3} />
                                    </div>
                                ) : (
                                    <Camera size={24} className="text-sub" />
                                )}
                                <div className="text-center">
                                    <h3 className={`text-[12px] font-black ${capturedImages.length >= 1 ? 'text-success' : ''}`} style={{ color: capturedImages.length >= 1 ? '#4BFF94' : colors.text }}>Front Pic</h3>
                                    <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{capturedImages.length >= 1 ? 'Captured' : 'Face side'}</p>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    if (capturedImages.length === 0) return toast.error('Pehle Front ki pic lein!');
                                    setScanStep('back');
                                    cameraInputRefAI.current?.click();
                                }}
                                disabled={capturedImages.length === 0 || aiLoading}
                                className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden ${capturedImages.length >= 2 ? 'bg-success/10 border-success' : (capturedImages.length === 1 ? 'border-dashed border-success/30' : 'border-dashed border-border opacity-50')}`}
                                style={{ backgroundColor: capturedImages.length >= 2 ? 'rgba(75, 255, 148, 0.05)' : colors.input }}
                            >
                                {aiLoading ? (
                                    <div className="w-6 h-6 border-2 border-success border-t-transparent rounded-full animate-spin" />
                                ) : capturedImages.length >= 2 ? (
                                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-[#0A3D24]">
                                        <Check size={18} strokeWidth={3} />
                                    </div>
                                ) : (
                                    <RefreshCw size={24} className={capturedImages.length === 1 ? 'text-success' : 'text-sub'} />
                                )}
                                <div className="text-center">
                                    <h3 className={`text-[12px] font-black ${capturedImages.length >= 2 ? 'text-success' : ''}`} style={{ color: capturedImages.length >= 2 ? '#4BFF94' : colors.text }}>Back Pic</h3>
                                    <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{capturedImages.length >= 2 ? 'Captured' : 'Barcode side'}</p>
                                </div>
                            </button>
                        </div>

                        {capturedImages.length === 2 && !aiLoading && (
                            <button 
                                onClick={() => handleAIScan(capturedImages)}
                                className="w-full py-4 bg-success text-[#0A3D24] rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-success/20"
                            >
                                <Sparkles size={16} />
                                Analyze Both Pics
                            </button>
                        )}
                        
                        <div className="flex justify-center">
                            <button 
                                onClick={() => setIsLiveScannerOpen(true)}
                                className="text-[10px] font-black uppercase tracking-widest text-success/60 hover:text-success py-2"
                            >
                                Switch to Live Bulk Scan
                            </button>
                        </div>
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

                    {/* QUANTITY & SIZE SECTION */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: colors.sub }}>Stock Qty *</p>
                            <input 
                                type="number" 
                                value={openingStock} 
                                onChange={e => setOpeningStock(e.target.value)}
                                placeholder="e.g. 50" 
                                className="w-full p-4 rounded-2xl border outline-none font-black text-[16px] transition-all focus:border-success/50"
                                style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.input }}
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: colors.sub }}>Size/Weight</p>
                            <input 
                                value={packSize} 
                                onChange={e => setPackSize(e.target.value)}
                                placeholder="e.g. 1 ltr, 250g" 
                                className="w-full p-4 rounded-2xl border outline-none font-black text-[16px] transition-all focus:border-success/50"
                                style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.input }}
                            />
                        </div>
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
                            
                            {existingInStock && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl flex items-center justify-between gap-3 border border-red-500/30 bg-red-500/10"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-[12px] font-black">!</div>
                                        <div>
                                            <p className="text-[11px] font-black text-red-500 uppercase">Duplicate Found</p>
                                            <p className="text-[12px] font-bold opacity-80 leading-tight">{existingInStock.name} already has this barcode.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/stock/${existingInStock.id}`)}
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[11px] font-black active:scale-95 transition-all"
                                    >
                                        VIEW ITEM
                                    </button>
                                </motion.div>
                            )}
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

                {/* HIDDEN INPUTS */}
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={(e) => handleImageUpload(e, false)} />
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRefAI} onChange={(e) => handleImageUpload(e, true)} />
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleImageUpload(e, false)} />

                {showImageSource && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={() => setShowImageSource(false)}>
                        <div className="w-full max-w-xs bg-card rounded-[2.5rem] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-[18px] font-black text-center mb-6">Tasweer Kahan Se Lein?</h3>
                            <div className="space-y-4">
                                <button 
                                    onClick={() => { 
                                        setScanStep('front'); 
                                        setCapturedImages([]);
                                        cameraInputRefAI.current?.click(); 
                                        setShowImageSource(false); 
                                    }} 
                                    className="w-full flex items-center gap-4 p-5 rounded-3xl bg-success text-[#0A3D24] active:scale-95 transition-all shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Wand2 size={24} /></div>
                                    <div className="text-left">
                                        <p className="text-[14px] font-black uppercase">Smart AI Scan</p>
                                        <p className="text-[10px] font-bold opacity-70">Front + Back Pics (Recommended)</p>
                                    </div>
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => { cameraInputRef.current?.click(); setShowImageSource(false); }} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-card border border-border active:scale-95 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center"><Camera size={22} /></div>
                                        <span className="text-[11px] font-black">DIRECT PIC</span>
                                    </button>
                                    <button onClick={() => { fileInputRef.current?.click(); setShowImageSource(false); }} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-card border border-border active:scale-95 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 text-sub flex items-center justify-center"><Package size={22} /></div>
                                        <span className="text-[11px] font-black">GALLERY</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <LiveBulkScanner 
                    isOpen={isLiveScannerOpen} 
                    onClose={() => setIsLiveScannerOpen(false)} 
                    onProductFound={(product) => {
                        addStockItem(product);
                    }} 
                />
            </div>
        </PageTransition>
    );
};
