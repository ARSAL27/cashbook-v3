import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop, type Stock } from '../context/ShopContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Package, Plus, Percent, Layers, Trash2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getBrandStyle } from '../data/kiryanaDatabase';

export const StockDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { stock, updateStock, updateStockItem, deleteStockItem } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [editForm, setEditForm] = useState<Partial<Stock>>({});
  const [showImageSource, setShowImageSource] = useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const item = useMemo(() => stock.find(s => s.id === id), [stock, id]);
  const brandStyle = useMemo(() => getBrandStyle(item?.company || ''), [item]);

  const margin = useMemo(() => {
    if (!item || !item.buyingPrice || item.buyingPrice === 0) return 0;
    return (((item.price - item.buyingPrice) / item.buyingPrice) * 100).toFixed(1);
  }, [item]);

  // ── HAPTICS ──
  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };
  // ── IMAGE LOGIC ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading or immediate feedback
    const toastId = toast.loading('Image processing...');
    
    try {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setEditForm(prev => ({ ...prev, imageUrl: base64String }));
            triggerHaptic(ImpactStyle.Medium);
            toast.success('Image ready! Save changes per click karein.', { id: toastId });
        };
        reader.readAsDataURL(file);
    } catch (err) {
        toast.error('Image upload fail ho gaya', { id: toastId });
    }
  };

  if (!item) return <div className="p-10 text-center font-outfit">Product nahi mila.</div>;

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative overflow-x-hidden min-h-screen" style={{ backgroundColor: bg }}>
        
        {/* TOP NAV */}
        <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: bg + 'E6' }}>
           <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#1E1E1E]">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
           </button>
           <h1 className="text-[18px] font-black" style={{ color: text }}>Item Details</h1>
           <button 
             onClick={async () => {
               if (window.confirm(`Kya aap "${item.name}" ko delete karna chahte hain?`)) {
                 try {
                   await deleteStockItem(item.id);
                   toast.success('Product delete ho gaya');
                   triggerHaptic(ImpactStyle.Medium);
                   navigate(-1);
                 } catch (e) {
                   toast.error('Galti hui');
                 }
               }
             }}
             className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-500"
           >
              <Trash2 size={18} />
           </button>
        </div>

        {/* HERO CARD (Dynamic Brand Theme) */}
        <div className="px-4 mt-2">
           <div className="rounded-[3rem] p-8 relative overflow-hidden shadow-2xl transition-colors duration-500" 
                style={{ backgroundColor: brandStyle.bg }}>
              
              {/* Decorative Brand Accent */}
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <Package size={80} strokeWidth={1.5} style={{ color: brandStyle.text }} />
              </div>

              <div className="flex items-center gap-2 mb-4 relative z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-current"
                       style={{ color: brandStyle.text + 'CC' }}>
                    {item.company || 'LOCAL BRAND'}
                 </span>
                 {brandStyle.abbr && (
                   <span className="text-[10px] font-black px-2 py-1 bg-white/20 rounded-lg text-white">
                      {brandStyle.abbr}
                   </span>
                 )}
              </div>

              <h2 className="text-[28px] font-black leading-tight mb-6 relative z-10" 
                  style={{ color: brandStyle.text }}>
                 {item.name}
              </h2>

              <div className="flex items-end justify-between relative z-10">
                  <div className="flex items-end gap-3">
                    <h3 className="text-[48px] font-black leading-none" 
                        style={{ color: brandStyle.text }}>
                       {item.quantity}
                    </h3>
                    <p className="text-[14px] font-bold uppercase mb-2" 
                       style={{ color: brandStyle.text + 'AA' }}>
                       {item.unit || 'Units'}
                    </p>
                  </div>
                  {item.imageUrl && (
                    <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden border-2 border-white/20 shadow-xl">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
              </div>
           </div>
        </div>

        {/* INFO GRIDS */}
        <div className="px-4 mt-6 grid grid-cols-2 gap-3">
           {[
             { label: 'Buying', value: `Rs ${item.buyingPrice?.toLocaleString() || '0'}`, icon: Package, color: brandStyle.bg },
             { label: 'Selling', value: `Rs ${item.price?.toLocaleString() || '0'}`, icon: null, color: brandStyle.bg, customIcon: 'Rs' },
             { label: 'Margin', value: `+${margin}%`, icon: Percent, color: '#4BFF94' },
             { label: 'Unit', value: item.unit?.toUpperCase() || 'PCS', icon: Layers, color: '#f59e0b' }
           ].map((stat, i) => (
             <div key={i} className="rounded-3xl p-3.5 border flex flex-col gap-3 shadow-sm" 
                  style={{ backgroundColor: card, borderColor: border }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110" 
                     style={{ backgroundColor: stat.color + '10', color: stat.color }}>
                   {stat.icon ? (
                     <stat.icon size={16} strokeWidth={2.5} />
                   ) : (
                     <span className="text-[10px] font-black">{stat.customIcon}</span>
                   )}
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">{stat.label}</p>
                   <h4 className="text-[15px] font-black leading-tight mt-0.5" style={{ color: text }}>{stat.value}</h4>
                </div>
             </div>
           ))}
        </div>

        {/* IN-PAGE ACTIONS */}
        <div className="px-4 mt-8 flex gap-4">
           <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
               setAdjustQty(item.quantity);
               setShowAdjust(true);
               triggerHaptic(ImpactStyle.Light);
            }}
            className="flex-[2] py-5 rounded-[1.8rem] font-black text-[15px] flex items-center justify-center gap-3 shadow-xl transition-all"
            style={{ backgroundColor: brandStyle.bg, color: brandStyle.text, boxShadow: `0 10px 30px ${brandStyle.bg}44` }}
          >
             <Plus size={20} strokeWidth={3.5} />
             Adjust Stock
          </motion.button>
           <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
                setEditForm(item);
                setShowEdit(true);
            }}
            className="flex-1 bg-gray-100 dark:bg-[#1E1E1E] border dark:border-white/5 text-gray-600 dark:text-gray-300 py-3.5 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2"
          >
             <Edit3 size={18} />
             Edit
          </motion.button>
        </div>

        {/* EDIT MODAL */}
        <AnimatePresence>
        {showEdit && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="w-full max-w-md rounded-t-[3rem] p-8 shadow-2xl relative overflow-y-auto max-h-[92vh] pb-32"
                    style={{ backgroundColor: card }}
                >
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6 opacity-40" />
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[20px] font-black" style={{ color: text }}>Edit Product</h3>
                    </div>

                    {/* IMAGE EDIT */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden" 
                                 style={{ backgroundColor: bg, borderColor: border }}>
                                {editForm.imageUrl ? (
                                    <img src={editForm.imageUrl} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <Package size={20} className="opacity-20" />
                                )}
                            </div>
                            <button 
                                onClick={() => setShowImageSource(true)}
                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4BFF94] text-[#0A3D24] rounded-xl flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-transform border-2 border-white dark:border-[#141414]"
                            >
                                <Camera size={14} strokeWidth={3} />
                            </button>
                            
                            {/* Hidden Inputs */}
                            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
                            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleImageUpload} />
                        </div>
                    </div>

                    {/* CHOICE MENU FOR IMAGE SOURCE */}
                    <AnimatePresence>
                    {showImageSource && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
                            onClick={() => setShowImageSource(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white dark:bg-[#1E1E1E] w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <h4 className="text-[18px] font-black text-center mb-6" style={{ color: text }}>Source Choose Karein</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => { cameraInputRef.current?.click(); setShowImageSource(false); }}
                                        className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-[#4BFF94]/10 border border-[#4BFF94]/20 active:scale-95 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#4BFF94] text-[#0A3D24] flex items-center justify-center shadow-lg">
                                            <Camera size={22} strokeWidth={3} />
                                        </div>
                                        <span className="text-[12px] font-black" style={{ color: text }}>CAMERA</span>
                                    </button>
                                    <button 
                                        onClick={() => { galleryInputRef.current?.click(); setShowImageSource(false); }}
                                        className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-gray-100 dark:bg-white/5 border border-transparent active:scale-95 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center shadow-sm">
                                            <Package size={22} />
                                        </div>
                                        <span className="text-[12px] font-black" style={{ color: text }}>GALLERY</span>
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setShowImageSource(false)}
                                    className="w-full mt-6 py-2 text-gray-400 font-bold text-[13px]"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Product Name</p>
                            <input 
                                value={editForm.name || ''} 
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                style={{ borderColor: border, color: text }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Selling Price</p>
                                <input 
                                    type="number"
                                    value={editForm.price || ''} 
                                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                    style={{ borderColor: border, color: text }}
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Buying Price</p>
                                <input 
                                    type="number"
                                    value={editForm.buyingPrice || ''} 
                                    onChange={e => setEditForm({ ...editForm, buyingPrice: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                    style={{ borderColor: border, color: text }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Stock Alert (Min)</p>
                                <input 
                                    type="number"
                                    value={editForm.minThreshold || ''} 
                                    onChange={e => setEditForm({ ...editForm, minThreshold: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                    style={{ borderColor: border, color: text }}
                                    placeholder="e.g. 10"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Barcode / SKU</p>
                                <input 
                                    value={editForm.sku || ''} 
                                    onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                    style={{ borderColor: border, color: text }}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setShowEdit(false)}
                            className="flex-1 py-4 rounded-2xl font-black text-[14px] bg-gray-100 dark:bg-[#1E1E1E] text-gray-400"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    const updateData: any = {
                                        name: editForm.name,
                                        price: editForm.price,
                                        buyingPrice: editForm.buyingPrice,
                                        category: editForm.category,
                                        unit: editForm.unit,
                                        minThreshold: editForm.minThreshold,
                                        sku: editForm.sku,
                                        packSize: editForm.packSize,
                                        imageUrl: editForm.imageUrl
                                    };

                                    // Firebase hates undefined, strip it!
                                    Object.keys(updateData).forEach(key => {
                                        if (updateData[key] === undefined) {
                                            delete updateData[key];
                                        }
                                    });

                                    // Instantly close and show feedback
                                    setShowEdit(false);
                                    toast.success('Tabdeeli save ho gayi!');
                                    triggerHaptic(ImpactStyle.Medium);

                                    // Then sync (Offline-friendly)
                                    await updateStockItem(item.id, updateData);
                                } catch (e) {
                                    console.log('Syncing in background / error');
                                }
                            }}
                            className="flex-[2] py-4 rounded-2xl font-black text-[14px] bg-[#4BFF94] text-[#0A3D24]"
                        >
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>

        {/* ADJUST STOCK MODAL */}
        <AnimatePresence>
        {showAdjust && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="w-full max-w-md rounded-t-[3rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto pb-32"
                    style={{ backgroundColor: card }}
                >
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6 opacity-40" />
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[20px] font-black" style={{ color: text }}>Adjust Stock Quantity</h3>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 py-4">
                        <p className="text-gray-400 font-bold text-[14px]">Update the current quantity for {item.name}</p>
                        
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setAdjustQty(prev => Math.max(0, prev - 1))}
                                className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center text-[28px] font-black active:scale-90 transition-transform"
                            >
                                -
                            </button>
                            
                            <div className="w-24 text-center">
                                <input 
                                    type="number" 
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(Math.max(0, Number(e.target.value)))}
                                    className="w-full bg-transparent text-center text-[42px] font-black outline-none"
                                    style={{ color: text }}
                                />
                            </div>

                            <button 
                                onClick={() => setAdjustQty(prev => prev + 1)}
                                className="w-16 h-16 rounded-full bg-[#4BFF94]/20 text-[#0A3D24] dark:text-[#4BFF94] flex items-center justify-center text-[28px] font-black active:scale-90 transition-transform"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setShowAdjust(false)}
                            className="flex-1 py-4 rounded-2xl font-black text-[14px] bg-gray-100 dark:bg-[#1E1E1E] text-gray-400"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    // Instantly close and feedback
                                    setShowAdjust(false);
                                    toast.success('Stock updated!');
                                    triggerHaptic(ImpactStyle.Medium);
                                    
                                    // Sync in background (offline-friendly)
                                    await updateStock(item.id, adjustQty);
                                } catch (e) {
                                    console.log('Sync delayed');
                                }
                            }}
                            className="flex-[2] py-4 rounded-2xl font-black text-[14px] bg-[#0A3D24] text-[#4BFF94]"
                        >
                            Update Stock
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>
        
        {/* STOCK HISTORY */}
        <div className="px-4 mt-8 pb-10">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[14px] font-black uppercase tracking-widest" style={{ color: text }}>Stock History</h3>
                <div className="h-[1px] flex-1 bg-border/20 ml-4" />
            </div>
            
            <div className="space-y-3">
              {item.history && item.history.length > 0 ? (
                [...item.history].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, i) => (
                  <div key={i} className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: card, borderColor: border }}>
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                           h.type === 'sale' ? 'bg-red-500/10 text-red-500' : 
                           h.type === 'restock' ? 'bg-green-500/10 text-green-500' : 
                           h.type === 'reversal' ? 'bg-blue-500/10 text-blue-500' :
                           'bg-orange-500/10 text-orange-500'
                        }`}>
                           <Package size={18} />
                        </div>
                        <div>
                           <p className="text-[13px] font-black uppercase tracking-tight" style={{ color: text }}>
                              {h.type === 'sale' ? 'Sale' : h.type === 'restock' ? 'Refill' : h.type === 'reversal' ? 'Rollback' : 'Adjust'}
                           </p>
                           <p className="text-[9px] font-bold text-gray-400">
                              {new Date(h.date).toLocaleDateString()} • {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-[15px] font-black ${h.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {h.quantity > 0 ? '+' : ''}{h.quantity}
                        </p>
                        {h.note && <p className="text-[8px] font-bold text-gray-400 max-w-[80px] truncate uppercase">{h.note}</p>}
                     </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-widest">No history recorded yet</p>
                </div>
              )}
            </div>
        </div>

      </div>
    </PageTransition>
  );
};
