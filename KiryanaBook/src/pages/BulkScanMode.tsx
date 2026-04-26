import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flashlight, FlashlightOff, Check, X, ChevronDown, Zap, Pencil } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useScanner } from '../hooks/useScanner';
import { masterBarcodeLookup, saveToPakistanDB } from '../services/barcodeService';
import { getBrandStyle, KIRYANA_CATEGORIES } from '../data/kiryanaDatabase';

interface BulkItem {
  barcode: string;
  name: string;
  baseName?: string;
  packSize?: string;
  company: string;
  category: string;
  unit: string;
  imageUrl?: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  pkEntryId?: string;
}

type SheetState = 'scanning' | 'loading' | 'confirm' | 'new_product' | 'enter_qty';

export const BulkScanMode: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { stock, addStockItem, updateStockItem } = useShop();
  const { user } = useAuth();

  // --- UI THEME ---
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const inputBg = isDarkMode ? '#1A1A1A' : '#F9F9F9';

  // --- STATES ---
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [sheetState, setSheetState] = useState<SheetState>('scanning');
  const [isSaving, setIsSaving] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  
  const [tempQty, setTempQty] = useState('1');
  const [tempBuying, setTempBuying] = useState('');
  const [tempSelling, setTempSelling] = useState('');
  const [overrideCategory, setOverrideCategory] = useState('Miscellaneous');

  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState('Miscellaneous');
  const [newPackSize, setNewPackSize] = useState('');
  const [newUnit, setNewUnit] = useState('pcs');

  // --- REFS (for high frequency scan logic) ---
  const stockRef = useRef(stock);
  const bulkItemsRef = useRef(bulkItems);
  const userRef = useRef(user);
  const onBarcodeDetectedRef = useRef<((barcode: string) => void) | undefined>(undefined);

  useEffect(() => { stockRef.current = stock; }, [stock]);
  useEffect(() => { bulkItemsRef.current = bulkItems; }, [bulkItems]);
  useEffect(() => { userRef.current = user; }, [user]);

  const {
    videoRef, status, setStatus, hasError: hasCameraError, torch: torchOn,
    toggleTorch, startCamera, stopHardware, resumeScanning
  } = useScanner({
    mode: 'BULK',
    onScan: (barcode) => {
      if (onBarcodeDetectedRef.current) {
        onBarcodeDetectedRef.current(barcode);
      }
    }
  });

  const startScanner = useCallback(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    startScanner();
    return () => stopHardware();
  }, [startScanner, stopHardware]);

  // Compatibility ref
  const isProcessingRef = useRef(false);
  useEffect(() => {
    isProcessingRef.current = status === 'PAUSED';
  }, [status]);

  const onBarcodeDetected = useCallback(async (barcode: string) => {
    if (isProcessingRef.current) return;
    
    try {
      // 1. Check if already in current bulk list (using Ref for instant check)
      const existingInBulk = bulkItemsRef.current.find(i => i.barcode === barcode);
      if (existingInBulk) {
        // Increment quantity automatically instead of rejecting
        setBulkItems(prev => prev.map(item => 
          item.barcode === barcode ? { ...item, quantity: item.quantity + 1 } : item
        ));
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        toast.success(`${existingInBulk.name} qty +1`);
        if (Capacitor.isNativePlatform()) {
          setTimeout(() => {
            isProcessingRef.current = false;
            startScanner();
          }, 500);
        }
        return;
      }

      setStatus('PAUSED');
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      setScannedBarcode(barcode);

      // 2. QUICK LOCAL LOOKUP FIRST
      const existingInStock = stockRef.current.find(s => s.sku === barcode);
      if (existingInStock) {
        const item: BulkItem = {
          barcode,
          name: existingInStock.name,
          company: existingInStock.company || '',
          category: existingInStock.category,
          unit: existingInStock.unit || 'pcs',
          imageUrl: existingInStock.imageUrl,
          quantity: 1,
          buyingPrice: existingInStock.buyingPrice || 0,
          sellingPrice: existingInStock.price || 0
        };
        
        setBulkItems(prev => [...prev, item]);
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
        toast.success(`${item.name} added to list`);
        
        // Auto resume for smooth flow
        if (Capacitor.isNativePlatform()) {
          setTimeout(() => {
            isProcessingRef.current = false;
            startScanner();
          }, 300);
        } else {
          resumeScanning();
        }
        return;
      }

      // 3. IF NOT IN STOCK, SHOW LOADING & LOOKUP
      setSheetState('loading');

      const result = await masterBarcodeLookup(barcode);

      if (result.product) {
        // If from OFF, save to Pakistan DB
        if (result.source === 'openfoodfacts' && userRef.current) {
          saveToPakistanDB(barcode, {
            name: result.product.name,
            company: result.product.company,
            category: result.product.category || 'OTHER',
            unit: result.product.unit || 'pcs'
          }, userRef.current.uid, 'openfoodfacts').catch(() => {});
        }

        const p = {
          barcode,
          name: result.product.name,
          company: result.product.company,
          category: result.product.category,
          unit: result.product.unit || 'pcs',
          imageUrl: result.product.imageUrl,
          pkEntryId: result.product.pkEntryId
        };
        setPendingProduct(p);

        // Pre-fill prices if similar item exists
        const stockItem = stockRef.current.find(s => s.name.toLowerCase() === p.name.toLowerCase());
        setTempBuying(stockItem?.buyingPrice?.toString() || '');
        setTempSelling(stockItem?.price?.toString() || '');
        setTempQty('1');
        setOverrideCategory(p.category || 'Miscellaneous');
        setSheetState('confirm');
      } else {
        setNewName('');
        setNewCompany('');
        setNewCategory('Miscellaneous');
        setSheetState('new_product');
      }
    } catch (err) {
      console.error('Bulk lookup failed:', err);
      toast.error('Galti hui, check karein');
      setSheetState('scanning');
      setStatus('SCANNING');
    }
  }, [setStatus]);

  useEffect(() => {
    onBarcodeDetectedRef.current = onBarcodeDetected;
  }, [onBarcodeDetected]);

  const handleConfirm = () => {
    setSheetState('enter_qty');
  };

  const handleSaveNewProduct = async () => {
    if (!newName.trim()) return toast.error('Naam zaroori hai');
    if (!user) return;

    const saved = await saveToPakistanDB(scannedBarcode, {
      name: newName.trim(), company: newCompany.trim(), category: newCategory, unit: 'pcs'
    }, user.uid);

    setPendingProduct({
      barcode: scannedBarcode,
      name: newName.trim(),
      baseName: newName.trim(),
      packSize: newPackSize.trim(),
      company: newCompany.trim(),
      category: newCategory,
      unit: newUnit,
      pkEntryId: saved.id
    });
    setTempQty('1');
    setTempBuying('');
    setTempSelling('');
    setOverrideCategory(newCategory);
    setSheetState('enter_qty');
  };

  const handleAddItem = () => {
    if (!pendingProduct) return;
    if (!tempQty || Number(tempQty) <= 0) return toast.error('Quantity daalna zaroori hai');

    const item: BulkItem = {
      ...pendingProduct,
      category: overrideCategory,
      quantity: Number(tempQty),
      buyingPrice: Number(tempBuying) || 0,
      sellingPrice: Number(tempSelling) || 0
    };

    setBulkItems(prev => {
        const existing = prev.find(i => i.barcode === pendingProduct.barcode);
        if (existing) {
            return prev.map(i => i.barcode === pendingProduct.barcode ? item : i);
        }
        return [...prev, item];
    });
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    toast.success(`${pendingProduct.name} updated`);
    resetForNextScan();
  };

  const resetForNextScan = () => {
    setPendingProduct(null);
    setScannedBarcode('');
    setSheetState('scanning');
    resumeScanning();
    if (Capacitor.isNativePlatform()) {
      setTimeout(() => {
        isProcessingRef.current = false;
        startScanner();
      }, 500);
    }
  };

  const handleSaveAll = async () => {
    if (bulkItems.length === 0) return;
    setIsSaving(true);
    let saved = 0;
    for (const item of bulkItems) {
      try {
        // 1. CHECK BY BARCODE (SKU) FIRST - This is the most reliable unique ID
        let existing = stock.find(s => 
          item.barcode && s.sku && String(s.sku).trim() === String(item.barcode).trim()
        );

        // 2. FALLBACK TO NAME/CATEGORY IF NO BARCODE OR NO SKU MATCH
        if (!existing) {
          existing = stock.find(s =>
            s.name.toLowerCase() === item.name.toLowerCase() && s.category === item.category
          );
        }
        const brand = getBrandStyle(item.company || '');

        if (existing) {
          await updateStockItem(existing.id, {
            quantity: (existing.quantity || 0) + item.quantity,
            buyingPrice: item.buyingPrice || existing.buyingPrice,
            price: item.sellingPrice || existing.price,
            imageUrl: brand.logoUrl || item.imageUrl || existing.imageUrl,
            sku: item.barcode,
            history: [
              ...(existing.history || []),
              { id: Math.random().toString(36).substring(7), type: 'restock' as const, quantity: item.quantity, date: new Date().toISOString(), note: `Bulk Scan - ${item.barcode}` }
            ],
            isDeleted: false
          });
        } else {
          await addStockItem({
            name: item.name,
            category: item.category,
            unit: item.unit as any,
            quantity: item.quantity,
            buyingPrice: item.buyingPrice,
            price: item.sellingPrice,
            minThreshold: 10,
            imageUrl: brand.logoUrl || item.imageUrl || '',
            sku: item.barcode
          });
        }
        saved++;
      } catch (e) {
        toast.error(`${item.name} save nahi hua`);
      }
    }
    setIsSaving(false);
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    toast.success(`${saved} products stock mein add ho gaye! ✅`);
    navigate('/stock');
  };

  const removeItem = (barcode: string) => {
    setBulkItems(prev => prev.filter(i => i.barcode !== barcode));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black font-outfit">
      {/* Camera */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay />
      <div className="absolute inset-0 bg-black/40" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-12 pb-4 z-[50]">
        <button
          onClick={() => {
            stopHardware();
            navigate(-1);
          }}
          className="w-11 h-11 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        <div className="bg-black/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
          <Zap size={14} className="text-[#4BFF94]" />
          <span className="text-white font-black text-[13px]">Bulk Scan Mode</span>
          {bulkItems.length > 0 && (
            <span className="bg-[#4BFF94] text-[#0A3D24] font-black text-[11px] px-2 py-0.5 rounded-full ml-1">{bulkItems.length}</span>
          )}
        </div>

        <button
          onClick={() => toggleTorch()}
          className="w-11 h-11 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center active:scale-95"
        >
          {hasCameraError ? <Zap size={20} className="text-[#4BFF94]" /> : (torchOn ? <Flashlight size={20} className="text-[#4BFF94]" /> : <FlashlightOff size={20} className="text-white" />)}
        </button>
      </div>

      {/* Camera Error State */}
      {hasCameraError && bulkItems.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black/80 px-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center mb-6">
            <FlashlightOff size={32} className="text-red-500" />
          </div>
          <h2 className="text-white font-black text-[20px] mb-2">Camera Band Hai</h2>
          <p className="text-gray-400 text-[14px] font-bold mb-8">Permission allow karein ya button click karein.</p>
          <button 
            onClick={startScanner}
            className="px-8 py-4 bg-[#4BFF94] text-[#0A3D24] rounded-2xl font-black text-[15px] shadow-lg shadow-[#4BFF94]/20 active:scale-95 transition-transform"
          >
            Restart Camera
          </button>
        </div>
      )}

      {/* Mini Error state when list has items */}
      {hasCameraError && bulkItems.length > 0 && sheetState === 'scanning' && (
        <div className="absolute inset-0 flex items-center justify-center z-[5] bg-black/60 pointer-events-none">
           <div className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-black/40 backdrop-blur-md border border-white/10 pointer-events-auto">
             <p className="text-white/60 font-bold text-[13px]">Camera stopped</p>
             <button onClick={startScanner} className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-black text-[12px] border border-white/10">
               Resume Scanning
             </button>
           </div>
        </div>
      )}

      {/* Scanning frame */}
      {sheetState === 'scanning' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative w-72 h-44">
            {[
              'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl',
              'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl',
              'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl',
              'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl',
            ].map((cls, i) => (
              <motion.div
                key={i} className={`absolute w-8 h-8 border-[#4BFF94] ${cls}`}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
            <motion.div
              className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#4BFF94] to-transparent"
              animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {sheetState === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-[#4BFF94]/20 border-2 border-[#4BFF94] flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Zap size={28} className="text-[#4BFF94]" />
          </motion.div>
          <p className="text-white font-bold text-[15px]">Product dhund raha hoon...</p>
        </div>
      )}

      {/* Bulk list (bottom of screen when scanning) */}
      {sheetState === 'scanning' && bulkItems.length > 0 && (
        <div className="absolute bottom-8 left-4 right-4 z-[150]">
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: card + 'EE', backdropFilter: 'blur(20px)' }}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="font-black text-[13px]" style={{ color: text }}>{bulkItems.length} items ready</p>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-[#4BFF94] text-[#0A3D24] px-5 py-2 rounded-2xl font-black text-[13px] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Sab Save Karo ✓'}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto px-4 pb-3 space-y-2">
              {bulkItems.map(item => (
                <div key={item.barcode} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: getBrandStyle(item.company).bg }}>
                      {getBrandStyle(item.company).abbr.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-black text-[12px] truncate" style={{ color: text }}>{item.name}</p>
                        {item.packSize && <span className="text-[8px] font-black bg-primary/10 text-primary px-1 rounded-sm">{item.packSize}</span>}
                      </div>
                      <p className="font-bold text-[10px]" style={{ color: sub }}>x{item.quantity} • Rs {item.sellingPrice || '?'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button 
                        onClick={() => {
                            setPendingProduct(item);
                            setTempQty(item.quantity.toString());
                            setTempBuying(item.buyingPrice.toString());
                            setTempSelling(item.sellingPrice.toString());
                            setOverrideCategory(item.category);
                            setSheetState('enter_qty');
                            setStatus('PAUSED');
                        }}
                        className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                    >
                        <Pencil size={12} className="text-blue-500" />
                    </button>
                    <button onClick={() => removeItem(item.barcode)} className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <X size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Product Sheet */}
      <AnimatePresence>
        {sheetState === 'confirm' && pendingProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 z-[10]" onClick={resetForNextScan} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[2.5rem] z-[20] overflow-hidden"
              style={{ backgroundColor: card }}
            >
              <div className="px-6 pt-6 pb-8">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10 mx-auto mb-4" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#4BFF94] flex items-center justify-center"><Check size={14} className="text-[#0A3D24]" strokeWidth={3} /></div>
                  <p className="font-black text-[13px] text-[#4BFF94]">Product Mila!</p>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-md shrink-0" style={{ background: getBrandStyle(pendingProduct.company).bg }}>
                    <span className="font-black text-[14px]" style={{ color: getBrandStyle(pendingProduct.company).text }}>{getBrandStyle(pendingProduct.company).abbr}</span>
                    {getBrandStyle(pendingProduct.company).logoUrl && <img src={getBrandStyle(pendingProduct.company).logoUrl} alt="" className="absolute inset-0 w-full h-full object-contain p-1" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                  </div>
                  <div>
                    <h3 className="font-black text-[16px] leading-tight" style={{ color: text }}>{pendingProduct.name}</h3>
                    <p className="font-bold text-[11px]" style={{ color: sub }}>{pendingProduct.company} • {pendingProduct.category}</p>
                    <div className="mt-1 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-[9px] font-mono w-fit border border-black/5 dark:border-white/5">
                      {pendingProduct.barcode}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={resetForNextScan} className="py-4 rounded-2xl border font-black text-[14px] flex items-center justify-center gap-2 active:scale-95" style={{ borderColor: border, color: text }}>
                    <X size={15} /> Skip
                  </button>
                  <button onClick={handleConfirm} className="py-4 rounded-2xl bg-[#4BFF94] text-[#0A3D24] font-black text-[14px] flex items-center justify-center gap-2 active:scale-95">
                    <Check size={15} strokeWidth={3} /> Sahi Hai →
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Product Sheet */}
      <AnimatePresence>
        {sheetState === 'new_product' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 z-[10]" onClick={resetForNextScan} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[2.5rem] z-[20] overflow-hidden"
              style={{ backgroundColor: card, maxHeight: '80vh' }}
            >
              <div className="overflow-y-auto no-scrollbar px-6 pt-6 pb-8" style={{ maxHeight: '80vh' }}>
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10 mx-auto mb-4" />
                <h3 className="font-black text-[16px] mb-1" style={{ color: text }}>Naya Product</h3>
                <p className="font-mono text-[11px] text-gray-400 mb-4">{scannedBarcode}</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Product naam *" autoFocus className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px]" style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                    </div>
                    <div>
                      <input type="text" value={newPackSize} onChange={e => {
                        setNewPackSize(e.target.value);
                        const val = e.target.value.toLowerCase();
                        if (val.includes('kg')) setNewUnit('kg');
                        else if (val.includes('ltr') || val.includes('liter')) setNewUnit('ltr');
                      }} placeholder="e.g. 50g" className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px]" style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                    </div>
                  </div>
                  <input type="text" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Company naam" className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px]" style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] appearance-none" style={{ backgroundColor: inputBg, borderColor: border, color: text }}>
                        {KIRYANA_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sub }} />
                    </div>
                    <div className="w-24 relative">
                      <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] appearance-none uppercase" style={{ backgroundColor: inputBg, borderColor: border, color: text }}>
                        {['pcs', 'kg', 'ltr', 'packs'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveNewProduct} disabled={!newName.trim()} className="w-full mt-4 py-4 rounded-2xl bg-[#4BFF94] text-[#0A3D24] font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                  <Check size={18} strokeWidth={3} /> Save Karo →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Enter Qty Sheet */}
      <AnimatePresence>
        {sheetState === 'enter_qty' && pendingProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 z-[10]" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[2.5rem] z-[20] overflow-hidden"
              style={{ backgroundColor: card }}
            >
              <div className="px-6 pt-6 pb-8">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10 mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-[15px]" style={{ color: text }}>{pendingProduct.name}</h3>
                    <p className="font-bold text-[11px]" style={{ color: sub }}>{pendingProduct.company}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Category</p>
                      <div className="relative">
                        <select 
                          value={overrideCategory} 
                          onChange={e => setOverrideCategory(e.target.value)}
                          className="w-full p-4 rounded-2xl border outline-none font-bold text-[14px] appearance-none" 
                          style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                        >
                          {KIRYANA_CATEGORIES.map(c => (
                            <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="col-span-1 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Qty</p>
                    <input type="number" inputMode="numeric" value={tempQty} onChange={e => setTempQty(e.target.value)} placeholder="0" autoFocus className="w-full p-3 rounded-2xl border outline-none font-black text-[18px] text-center" style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Buy Rs</p>
                    <input type="number" inputMode="decimal" value={tempBuying} onChange={e => setTempBuying(e.target.value)} placeholder="0" className="w-full p-3 rounded-2xl border outline-none font-black text-[15px] text-center" style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Sell Rs</p>
                    <input type="number" inputMode="decimal" value={tempSelling} onChange={e => setTempSelling(e.target.value)} placeholder="0" className="w-full p-3 rounded-2xl border outline-none font-black text-[15px] text-center" style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                  </div>
                </div>
                <button onClick={handleAddItem} className="w-full py-4 rounded-2xl bg-[#4BFF94] text-[#0A3D24] font-black text-[16px] flex items-center justify-center gap-2 active:scale-95 shadow-[0_10px_30px_rgba(75,255,148,0.25)]">
                  <Check size={20} strokeWidth={3} /> List Mein Add Karo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
