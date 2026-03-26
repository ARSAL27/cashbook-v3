import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop, type Stock } from '../context/ShopContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, User, TrendingUp, Package, DollarSign, History, Plus, Activity, Percent, Layers, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const StockDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { stock, updateStock, updateStockItem, toggleStockItemStatus } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = React.useState(false);
  const [editForm, setEditForm] = React.useState<Partial<Stock>>({});

  const item = useMemo(() => stock.find(s => s.id === id), [stock, id]);

  const margin = useMemo(() => {
    if (!item || !item.buyingPrice || item.buyingPrice === 0) return 0;
    return (((item.price - item.buyingPrice) / item.buyingPrice) * 100).toFixed(1);
  }, [item]);

  if (!item) return <div className="p-10 text-center font-outfit">Product nahi mila.</div>;

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  const healthStatus = item.quantity > item.minThreshold ? 'Optimal Level' : item.quantity > 0 ? 'Low Levels' : 'Out of Stock';
  const healthColor = item.quantity > item.minThreshold ? '#4BFF94' : item.quantity > 0 ? '#F97316' : '#EF4444';
  const healthProgress = Math.min(100, (item.quantity / (item.minThreshold * 4)) * 100);

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative overflow-x-hidden" style={{ backgroundColor: bg }}>
        
        {/* TOP NAV */}
        <div className="px-5 pt-8 flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="text-gray-400">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-[17px] font-black" style={{ color: text }}>Item Details</h1>
           <div className="w-9 h-9 bg-gray-100 dark:bg-[#1E1E1E] rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10">
              <User size={18} style={{ color: sub }} />
           </div>
        </div>

        {/* HERO CARD */}
        <div className="px-5 mt-6">
           <div className="rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl shadow-green-900/10 transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
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
                  {item.packSize && (
                      <span className="bg-white/10 text-white/80 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/5">
                        {item.packSize}
                      </span>
                  )}
              </div>
              
              {/* Background Shapes */}
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-[#4BFF94]/5 rounded-full blur-3xl" />
           </div>
        </div>

        {/* HEALTH STATUS CARD */}
        <div className="px-5 mt-4">
           <div className="rounded-[2.5rem] p-6 border shadow-sm" style={{ backgroundColor: card, borderColor: border }}>
              <div className="flex items-center justify-between mb-3">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Health Status</p>
                    <h4 className="text-[16px] font-black" style={{ color: healthColor }}>{healthStatus}</h4>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Min Threshold</p>
                    <p className="text-[11px] font-black" style={{ color: sub }}>{item.minThreshold} Units</p>
                 </div>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${healthProgress}%` }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: healthColor }} 
                 />
              </div>
           </div>
        </div>

        {/* INFO GRIDS */}
        <div className="px-5 mt-4 grid grid-cols-1 gap-3">
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
                {stat.sub && (
                  <span className="text-[9px] font-black text-[#00C853] bg-[#00C85310] px-3 py-1 rounded-full uppercase">
                    {stat.sub}
                  </span>
                )}
             </div>
           ))}
        </div>

        {/* MOVEMENT CHART PLACEHOLDER */}
        <div className="px-5 mt-4">
           <div className="rounded-[2.5rem] p-6 border shadow-sm" style={{ backgroundColor: card, borderColor: border }}>
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h4 className="text-[16px] font-black" style={{ color: text }}>Stock Movement</h4>
                    <p className="text-[10px] font-bold text-gray-400">(Last 15 Transactions)</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0A3D24]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">Inventory Levels</span>
                 </div>
              </div>
              
               {/* Dynamic Chart logic */}
               <div className="h-24 w-full flex items-end gap-1 px-1 opacity-40">
                  {(() => {
                      const counts = new Array(15).fill(item.quantity);
                      (item.history || []).slice(-15).forEach((h, idx) => {
                          const i = 14 - idx;
                          if (i >= 0) {
                              const base = counts[i+1] || item.quantity;
                              counts[i] = base - h.quantity;
                          }
                      });
                      const max = Math.max(...counts, 10);
                      return counts.map((c, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ height: 0 }} animate={{ height: `${(c / max) * 100}%` }}
                          transition={{ delay: i * 0.03 }}
                          className="flex-1 bg-gradient-to-t from-[#0A3D24] to-[#4BFF94] rounded-t-[2px]" 
                        />
                      ));
                  })()}
               </div>
              <div className="flex justify-between mt-4 text-[8px] font-black text-gray-300 uppercase tracking-widest px-1">
                 <span>{new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                 <span>{new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                 <span>{new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                 <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
           </div>
        </div>

        {/* STOCK HISTORY */}
        <div className="px-5 mt-8 pb-10">
           <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: text }}>
                <History size={16} /> Stock History
              </h3>
              <button className="text-[10px] font-black text-[#4BFF94] uppercase tracking-widest">View All</button>
           </div>
           
           <div className="space-y-3">
              {(item.history || []).slice(-5).reverse().map((h) => (
                <div key={h.id} className="rounded-3xl p-4 border flex items-center gap-4" style={{ backgroundColor: card, borderColor: border }}>
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${h.type === 'restock' ? 'bg-[#4BFF94]15 text-[#00C853]' : h.type === 'sale' ? 'bg-[#EF4444]15 text-[#EF4444]' : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-400'}`} style={{ backgroundColor: h.type === 'restock' ? '#4BFF9420' : h.type === 'sale' ? '#EF444420' : border }}>
                      {h.type === 'restock' ? <TrendingUp size={18} /> : h.type === 'sale' ? <Package size={18} /> : <Activity size={18} />}
                   </div>
                   <div className="flex-1">
                      <h4 className="text-[14px] font-black" style={{ color: text }}>{h.type === 'restock' ? 'Inventory Restock' : h.type === 'sale' ? 'Sale - Units Sold' : 'Manual Adjustment'}</h4>
                      <p className="text-[10px] font-medium" style={{ color: sub }}>{h.note || 'No notes added'} • {new Date(h.date).toLocaleDateString()}</p>
                   </div>
                   <div className="text-right">
                      <p className={`text-[15px] font-black leading-none ${h.quantity > 0 ? 'text-[#00C853]' : 'text-[#EF4444]'}`}>
                        {h.quantity > 0 ? '+' : ''}{h.quantity}
                      </p>
                      <p className="text-[8px] font-black text-gray-300 uppercase mt-1">Units</p>
                   </div>
                </div>
              ))}

              {(!item.history || item.history.length === 0) && (
                <div className="py-10 text-center opacity-30">
                   <p className="text-[11px] font-black uppercase tracking-widest">No transaction history</p>
                </div>
              )}
           </div>
        </div>

        {/* ACTIONS FAB */}
        <div className="fixed bottom-[90px] inset-x-0 max-w-md mx-auto px-4 z-[60]">
           <div className="rounded-[2.5rem] p-3 flex gap-2 items-center" style={{ backgroundColor: card, boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                   const q = prompt(`Enter quantity to add/subtract (current: ${item.quantity}):`, '0');
                   if (q) updateStock(item.id, item.quantity + Number(q));
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
                 Edit Item
              </motion.button>
           </div>
           
           <button 
             onClick={() => {
                 if (window.confirm(`Kya aap is item ko ${item.status === 'inactive' ? 'active' : 'inactive'} karna chahte hain?`)) {
                     toggleStockItemStatus(item.id);
                 }
             }}
             className={`w-full mt-3 py-2 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${item.status === 'inactive' ? 'text-[#00C853]' : 'text-[#EF4444]'}`}
           >
              {item.status === 'inactive' ? <Plus size={12} /> : <Trash2 size={12} />}
              Mark Item as {item.status === 'inactive' ? 'Active' : 'Inactive'}
           </button>
        </div>

        {/* EDIT MODAL */}
        {showEdit && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }}
                    className="w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
                    style={{ backgroundColor: card }}
                >
                    <h3 className="text-[20px] font-black mb-6" style={{ color: text }}>Edit Product</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Product Name</p>
                            <input 
                                value={editForm.name} 
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full p-4 rounded-2xl border outline-none font-bold"
                                style={{ backgroundColor: bg, borderColor: border, color: text }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Selling Price</p>
                                <input 
                                    type="number"
                                    value={editForm.price} 
                                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold"
                                    style={{ backgroundColor: bg, borderColor: border, color: text }}
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Buying Price</p>
                                <input 
                                    type="number"
                                    value={editForm.buyingPrice} 
                                    onChange={e => setEditForm({ ...editForm, buyingPrice: Number(e.target.value) })}
                                    className="w-full p-4 rounded-2xl border outline-none font-bold"
                                    style={{ backgroundColor: bg, borderColor: border, color: text }}
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
                                    // PREVENT DATA OVERWRITE: Only send relevant editable fields
                                    const updateData = {
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

      </div>
    </PageTransition>
  );
};
