import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Trash2, Package, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const AddItem: React.FC = () => {
  const { addStockItem } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [unit, setUnit] = useState<'kg' | 'units' | 'packs' | 'ltr' | 'pcs'>('kg');
  const [openingStock, setOpeningStock] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minThreshold, setMinThreshold] = useState('5');
  const [imageUrl, setImageUrl] = useState('');
  const [packSize, setPackSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const input = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Product name zaroori hai');
    if (!sellingPrice || !openingStock) return toast.error('Missing required fields');
    
    setLoading(true);
    try {
      const newItem: any = {
        name: name.trim(),
        category: showCategoryInput ? newCategory : category,
        unit,
        quantity: Number(openingStock),
        buyingPrice: Number(buyingPrice),
        price: Number(sellingPrice),
        minThreshold: Number(minThreshold),
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`
      };
      
      if (packSize.trim()) newItem.packSize = packSize.trim();
      if (imageUrl.trim()) newItem.imageUrl = imageUrl.trim();

      await addStockItem(newItem);
      toast.success('Product add ho gaya! 🎉');
      navigate(-1);
    } catch (e) {
      toast.error('Kuch masla hua save karne mein');
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative" style={{ backgroundColor: bg }}>
        
        {/* HEADER */}
        <div className="sticky top-0 z-50 transition-colors duration-300 px-5 pt-5 pb-6 flex items-center justify-between" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
           <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-white/60">
                 <ArrowLeft size={22} />
              </button>
              <h1 className="text-white font-black text-[20px]">Add New Item</h1>
           </div>
           <button onClick={() => navigate(-1)} className="text-white/40">
              <Trash2 size={20} />
           </button>
        </div>

        <div className="px-5 pt-6 space-y-6">
           
           {/* PHOTO UPLOAD */}
           <div className="space-y-4">
               <div 
                 onClick={() => {
                   const url = prompt('Image URL darj karein (e.g. unsplash link):');
                   if (url) setImageUrl(url);
                 }}
                 className="w-full aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden transition-all group active:scale-[0.98] cursor-pointer" 
                 style={{ backgroundColor: card, borderColor: imageUrl ? '#4BFF94' : border }}
               >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#0A3D24] rounded-full flex items-center justify-center text-[#4BFF94] shadow-lg shadow-green-900/20">
                         <Camera size={24} />
                      </div>
                      <div>
                         <p className="text-[14px] font-black uppercase tracking-wider" style={{ color: text }}>Add Product Photo (Optional)</p>
                         <p className="text-[10px] font-medium" style={{ color: sub }}>High quality images sell faster</p>
                      </div>
                    </>
                  )}
                  {imageUrl && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                      className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
               </div>
               {imageUrl && (
                 <input 
                   value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                   className="w-full p-2 text-[10px] bg-transparent border-b outline-none opacity-50"
                   style={{ color: text, borderColor: border }}
                   placeholder="Image URL edit karein..."
                 />
               )}
           </div>

           {/* PRODUCT NAME */}
           <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Product Name</p>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Basmati Rice Premium"
                className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] transition-all"
                style={{ backgroundColor: input, borderColor: border, color: text }}
              />
           </div>

           {/* CAT, UNIT & PACK SIZE */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                 <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Category</p>
                 <div className="relative">
                    {!showCategoryInput ? (
                        <>
                            <select 
                            value={category} onChange={e => {
                                if (e.target.value === 'ADD_NEW') {
                                    setShowCategoryInput(true);
                                } else {
                                    setCategory(e.target.value);
                                }
                            }}
                            className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] appearance-none"
                            style={{ backgroundColor: input, borderColor: border, color: text }}
                            >
                            <option>Grocery</option>
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Beverages</option>
                            <option value="ADD_NEW">+ Add New Category</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sub }} />
                        </>
                    ) : (
                        <div className="relative flex gap-1">
                            <input 
                                value={newCategory} 
                                onChange={e => setNewCategory(e.target.value)}
                                placeholder="Category name..."
                                className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px]"
                                style={{ backgroundColor: input, borderColor: '#4BFF94', color: text }}
                                autoFocus
                            />
                            <button 
                                onClick={() => setShowCategoryInput(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-[12px]"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Unit</p>
                   <div className="relative">
                      <select 
                        value={unit} onChange={e => setUnit(e.target.value as any)}
                        className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] appearance-none"
                        style={{ backgroundColor: input, borderColor: border, color: text }}
                      >
                         <option value="kg">kg</option>
                         <option value="units">units</option>
                         <option value="packs">packs</option>
                         <option value="ltr">ltr</option>
                         <option value="pcs">pcs</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sub }} />
                   </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Pack Size</p>
                    <input 
                      value={packSize} onChange={e => setPackSize(e.target.value)}
                      placeholder="e.g. 5kg, 1L"
                      className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] transition-all"
                      style={{ backgroundColor: input, borderColor: border, color: text }}
                    />
                </div>
              </div>
            </div>

           {/* LOGISTICS SECTION */}
           <div className="rounded-[2.5rem] p-6 border space-y-5" style={{ backgroundColor: isDarkMode ? '#141414' : '#F9F9F9', borderColor: border }}>
              <div className="flex items-center gap-2">
                 <Package size={18} style={{ color: '#0A3D24' }} />
                 <h3 className="text-[14px] font-black uppercase tracking-wider" style={{ color: '#0A3D24' }}>Inventory Logistics</h3>
              </div>
              
              <div className="space-y-2">
                 <p className="text-[11px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Opening Stock</p>
                 <div className="relative">
                    <input 
                      type="number" value={openingStock} onChange={e => setOpeningStock(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-4 rounded-xl border outline-none font-black text-[18px]"
                      style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', borderColor: border, color: text }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase" style={{ color: sub }}>UNITS</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Buying Price</p>
                    <div className="relative">
                       <input 
                         type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full p-4 rounded-xl border outline-none font-black text-[16px] pl-10"
                         style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', borderColor: border, color: text }}
                       />
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black" style={{ color: '#00C853' }}>Rs</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Selling Price</p>
                    <div className="relative">
                       <input 
                         type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full p-4 rounded-xl border outline-none font-black text-[16px] pl-10"
                         style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', borderColor: border, color: text }}
                       />
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black" style={{ color: '#00C853' }}>Rs</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* LOW STOCK ALERT CARD */}
           <div className="rounded-[2rem] p-6 border relative overflow-hidden shadow-sm" style={{ backgroundColor: isDarkMode ? '#1A140F' : '#FFF9F4', borderColor: isDarkMode ? '#332211' : '#FEE7D3' }}>
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                       <AlertTriangle size={18} />
                    </div>
                    <div>
                       <h4 className="text-[14px] font-black" style={{ color: text }}>Low Stock Alert</h4>
                       <p className="text-[9px] font-bold text-orange-600/60 leading-none">CRUCIAL SETTING</p>
                    </div>
                 </div>
              </div>
              <p className="text-[11px] font-medium leading-tight mb-4" style={{ color: sub }}>Notify me when inventory levels drop below this amount to avoid stockouts.</p>
              <input 
                 type="number" value={minThreshold} onChange={e => setMinThreshold(e.target.value)}
                 className="w-full p-4 rounded-xl outline-none font-black text-[18px]"
                 style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', color: text }}
              />
           </div>

           {/* SAVE BUTTON */}
           <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#4BFF94] text-[#0A3D24] py-5 rounded-[2rem] font-black text-[16px] flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 disabled:opacity-50"
           >
              {loading ? 'Saving...' : (
                <>
                  <Check size={20} strokeWidth={4} />
                  Save Item
                </>
              )}
           </motion.button>
        </div>

      </div>
    </PageTransition>
  );
};
