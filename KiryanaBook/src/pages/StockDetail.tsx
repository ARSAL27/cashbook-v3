import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop, type Stock } from '../context/ShopContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, User, Package, DollarSign, Plus, Percent, Layers, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const StockDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { stock, updateStock, updateStockItem, deleteStockItem } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Stock>>({});

  const item = useMemo(() => stock.find(s => s.id === id), [stock, id]);

  const margin = useMemo(() => {
    if (!item || !item.buyingPrice || item.buyingPrice === 0) return 0;
    return (((item.price - item.buyingPrice) / item.buyingPrice) * 100).toFixed(1);
  }, [item]);

  // ── HAPTICS ──
  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  if (!item) return <div className="p-10 text-center font-outfit">Product nahi mila.</div>;

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative overflow-x-hidden min-h-screen" style={{ backgroundColor: bg }}>
        
        {/* TOP NAV */}
        <div className="px-5 pt-8 flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="text-gray-400">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-[17px] font-black" style={{ color: text }}>Item Details</h1>
           <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  if (window.confirm(`Kya aap "${item.name}" ko delete karna chahte hain?`)) {
                    try {
                      await deleteStockItem(item.id);
                      toast.success('Product delete ho gaya');
                      triggerHaptic(ImpactStyle.Medium);
                      navigate('/stock');
                    } catch (e) {
                      toast.error('Galti hui');
                    }
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-red-500/10 bg-red-500/5 text-red-500"
              >
                 <Trash2 size={18} />
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-card border-border">
                 <User size={18} style={{ color: sub }} />
              </div>
           </div>
        </div>

        {/* HERO CARD */}
        <div className="px-5 mt-6">
           <div className="rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl transition-all duration-300" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#4BFF94] bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
                    {item.category}
                 </span>
              </div>
              <h2 className="text-white text-[28px] font-black leading-tight mb-2">{item.name}</h2>
              <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-[#4BFF94] text-[48px] font-black leading-none">{item.quantity}</h3>
                     <p className="text-white/50 text-[14px] font-black uppercase">{item.unit || 'Units'}</p>
                  </div>
              </div>
           </div>
        </div>

        {/* INFO GRIDS */}
        <div className="px-5 mt-6 grid grid-cols-1 gap-3">
           {[
             { label: 'Buying Price', value: `Rs ${item.buyingPrice?.toLocaleString() || '0'}`, icon: Package, color: '#4BFF94' },
             { label: 'Selling Price', value: `Rs ${item.price?.toLocaleString() || '0'}`, icon: DollarSign, color: '#4BFF94' },
             { label: 'Margin', value: `+${margin}%`, icon: Percent, color: '#00C853', sub: 'Gross Profit' },
             { label: 'Unit Type', value: item.unit?.toUpperCase() || 'PIECES', icon: Layers, color: '#448AFF' }
           ].map((stat, i) => (
             <div key={i} className="rounded-3xl p-5 border flex items-center justify-between" style={{ backgroundColor: card, borderColor: border }}>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15', color: stat.color }}>
                      <stat.icon size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                      <h4 className="text-[17px] font-black leading-none mt-1" style={{ color: text }}>{stat.value}</h4>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* ACTIONS FAB */}
        <div className="fixed bottom-[100px] inset-x-0 max-w-md mx-auto px-4 z-[90]">
           <div className="rounded-[2.5rem] p-3 flex gap-2 items-center" style={{ backgroundColor: card, boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                   const q = prompt(`Enter quantity to add/subtract (current: ${item.quantity}):`, '0');
                   if (q) {
                     updateStock(item.id, item.quantity + Number(q));
                     triggerHaptic(ImpactStyle.Light);
                   }
                }}
                className="flex-[2] bg-[#0A3D24] text-[#4BFF94] py-4 rounded-3xl font-black text-[14px] flex items-center justify-center gap-2"
              >
                 <Plus size={18} strokeWidth={3} />
                 Adjust Stock
              </motion.button>
               <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                    setEditForm(item);
                    setShowEdit(true);
                }}
                className="flex-1 bg-gray-50 dark:bg-[#1E1E1E] border dark:border-white/5 text-gray-400 py-4 rounded-3xl font-black text-[14px] flex items-center justify-center gap-2 shadow-sm"
              >
                 <Edit3 size={18} />
                 Edit
              </motion.button>
           </div>
        </div>

        {/* EDIT MODAL */}
        <AnimatePresence>
        {showEdit && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
                    style={{ backgroundColor: card }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[20px] font-black" style={{ color: text }}>Edit Product</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Product Name</p>
                            <input 
                                value={editForm.name} 
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
                                    value={editForm.price} 
                                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                    style={{ borderColor: border, color: text }}
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Buying Price</p>
                                <input 
                                    type="number"
                                    value={editForm.buyingPrice} 
                                    onChange={e => setEditForm({ ...editForm, buyingPrice: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold bg-background"
                                    style={{ borderColor: border, color: text }}
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
                                        packSize: editForm.packSize
                                    };
                                    await updateStockItem(item.id, updateData);
                                    setShowEdit(false);
                                    toast.success('Tabdeeli save ho gayi!');
                                    triggerHaptic(ImpactStyle.Medium);
                                } catch (e) {
                                    toast.error('Galti hui, check karein');
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

      </div>
    </PageTransition>
  );
};
