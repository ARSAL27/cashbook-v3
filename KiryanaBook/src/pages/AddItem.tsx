import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, Check, ChevronDown, Mic } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';


export const AddItem: React.FC = () => {
  const { addStockItem, categories } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories.length > 0 ? categories[0] : 'Grocery');
  const [unit, setUnit] = useState<'kg' | 'units' | 'packs' | 'ltr' | 'pcs' | 'dozen'>('kg');
  const [openingStock, setOpeningStock] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minThreshold, setMinThreshold] = useState('5');
  const [packSize, setPackSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [categoryWarning, setCategoryWarning] = useState(false);


  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const input = isDarkMode ? '#1E1E1E' : '#FFFFFF';





  const handleSave = async () => {
    if (!name.trim()) return toast.error('Product name zaroori hai');
    if (!sellingPrice || !openingStock || !buyingPrice) return toast.error('Khareed qemat aur Farokht qemat dono zaroori hain');
    
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

      await addStockItem(newItem);
      toast.success('Product add ho gaya! 🎉');
      navigate(-1);
    } catch (e) {
      toast.error('Kuch masla hua save karne mein');
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative min-h-screen" style={{ backgroundColor: bg }}>
        
        {/* HEADER */}
        <div className="sticky top-0 z-50 transition-colors duration-300 px-5 pt-5 pb-6 flex items-center justify-between" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
           <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-white/60">
                 <ArrowLeft size={22} />
              </button>
              <h1 className="text-white font-black text-[20px]">Add New Item</h1>
           </div>
        </div>

        <div className="px-5 pt-6 space-y-6">
           
           {/* PRODUCT NAME */}
           <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Product Name</p>
              <div className="relative flex items-center">
                <input 
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Basmati Rice Premium"
                    className="w-full p-4 pr-12 rounded-2xl border outline-none font-bold text-[15px] transition-all"
                    style={{ color: text, borderColor: border, backgroundColor: input }}

                />
                <button
                   disabled={true}
                   className="absolute right-3 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed opacity-60"
                >
                   <Mic size={18} />
                   <span className="absolute -top-1 -right-1 bg-yellow-500 text-[6px] text-white px-1 rounded-full font-black">PRO</span>
                </button>
              </div>
           </div>

           {/* CAT, UNIT & PACK SIZE */}
           <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                 <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Category</p>
                  <div className={`relative rounded-2xl border transition-all ${categoryWarning ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}`} style={categoryWarning ? { backgroundColor: 'rgba(249,115,22,0.1)' } : { borderColor: border, backgroundColor: 'transparent' }}>

                    {!showCategoryInput ? (
                        <>
                            <select 
                            value={category} onChange={e => {
                                if (e.target.value === 'ADD_NEW') setShowCategoryInput(true);
                                else { setCategory(e.target.value); setCategoryWarning(false); }
                            }}
                            className="w-full p-4 rounded-2xl outline-none font-bold text-[15px] appearance-none bg-transparent"
                            style={{ color: text }}
                            >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
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
                   <div className="relative rounded-2xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>

                      <select 
                        value={unit} onChange={e => setUnit(e.target.value as any)}
                        className="w-full p-4 rounded-2xl outline-none font-bold text-[15px] appearance-none bg-transparent"
                        style={{ color: text }}
                      >
                         <option value="kg">kg</option>
                         <option value="units">units</option>
                         <option value="packs">packs</option>
                         <option value="ltr">ltr</option>
                         <option value="pcs">pcs</option>
                         <option value="dozen">dozen</option>
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
                      style={{ color: text, borderColor: border, backgroundColor: input }}

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
                 <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>
                    <input 
                      type="number" value={openingStock} onChange={e => setOpeningStock(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-4 rounded-xl outline-none font-black text-[18px] bg-transparent"
                      style={{ color: text }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase" style={{ color: sub }}>UNITS</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Buying Price</p>
                    <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>

                       <input 
                         type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full p-4 rounded-xl outline-none font-black text-[16px] pl-10 bg-transparent"
                         style={{ color: text }}
                       />
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black" style={{ color: '#00C853' }}>Rs</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Selling Price</p>
                    <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>

                       <input 
                         type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full p-4 rounded-xl outline-none font-black text-[16px] pl-10 bg-transparent"
                         style={{ color: text }}
                       />
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black" style={{ color: '#00C853' }}>Rs</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* LOW STOCK ALERT CARD */}
           <div 
              className={`rounded-[2rem] p-6 border relative overflow-hidden transition-all duration-500`}
              style={{ backgroundColor: (isDarkMode ? '#1A140F' : '#FFF9F4'), borderColor: border }}
            >
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-orange-500">
                       <AlertTriangle size={18} />
                    </div>
                    <div>
                       <h4 className="text-[14px] font-black" style={{ color: text }}>Low Stock Alert</h4>
                       <p className="text-[9px] font-bold uppercase leading-none text-orange-600">CRUCIAL SETTING</p>
                    </div>
                 </div>
              </div>
               <input 
                 type="number" value={minThreshold} onChange={e => setMinThreshold(e.target.value)}
                 className="w-full p-4 rounded-xl outline-none font-black text-[18px] bg-transparent transition-all"
                 style={{ color: text, borderColor: border }}
              />
           </div>

           {/* STICKY SAVE BUTTON */}
           <div className="fixed bottom-[110px] left-5 right-5 z-[85] max-w-md mx-auto">
              <button
                 onClick={handleSave}
                 disabled={loading}
                 className="w-full bg-[#4BFF94] text-[#0A3D24] py-5 rounded-[2.2rem] font-black text-[16px] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(75,255,148,0.25)] dark:shadow-green-900/30 disabled:opacity-50"
              >
                 {loading ? 'Saving...' : (
                   <>
                     <Check size={20} strokeWidth={4} />
                     Save Product Now
                   </>
                 )}
              </button>
           </div>
           
           <div className="h-56" />
        </div>
        
      
        {/* FLOATING MIC BUTTON */}
        <button
           disabled={true}
           className="fixed bottom-[180px] right-5 z-[80] w-[60px] h-[60px] rounded-full shadow-2xl flex items-center justify-center bg-gray-400 text-white cursor-not-allowed opacity-50"
        >
           <Mic size={26} />
           <div className="absolute -top-2 bg-yellow-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">PAID</div>
        </button>

      </div>
    </PageTransition>
  );
};

