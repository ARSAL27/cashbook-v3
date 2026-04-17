import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, Check, ChevronDown, Mic, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { SearchableSelector } from '../components/SearchableSelector';
import { KIRYANA_DATABASE, KIRYANA_CATEGORIES } from '../data/kiryanaDatabase';
import { guessCategory, validateProductEntry, standardizeBrand } from '../utils/productValidation';


export const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { stock, addStockItem } = useShop();
  const { isDarkMode } = useTheme();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(KIRYANA_CATEGORIES[0].name);
  const [unit, setUnit] = useState<'kg' | 'units' | 'packs' | 'ltr' | 'pcs' | 'dozen'>('kg');
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

  const [categoryWarning, setCategoryWarning] = useState(false);
  const [sku, setSku] = useState('');
  const [showImageSource, setShowImageSource] = useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ─── BARCODE INTEGRATION ───
  React.useEffect(() => {
    const barcode = searchParams.get('barcode');
    if (!barcode) return;

    setSku(barcode);
    
    // 1. Check local stock first
    const existing = stock.find(s => s.sku === barcode);
    if (existing) {
       setName(existing.name);
       setCategory(existing.category);
       setUnit(existing.unit as any);
       setCompany(existing.company || '');
       setBuyingPrice(existing.buyingPrice?.toString() || '');
       setSellingPrice(existing.price?.toString() || '');
       setImageUrl(existing.imageUrl || '');
       toast('Yeh item pehle se stock mein hai. Updates save honge.', { icon: 'ℹ️' });
       return;
    }

    // 2. Search master database
    const master = KIRYANA_DATABASE.find(item => item.name.toLowerCase().includes(barcode.toLowerCase())); // Mock lookup or exact if available
    if (master) {
       setName(master.name);
       if (master.category) setCategory(master.category);
       if (master.company) setCompany(master.company);
       if (master.unit) setUnit(master.unit as any);
       toast.success('Product found in Database!', { icon: '📦' });
    }
  }, [searchParams, stock]);


  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const input = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const netWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const netHeight = (img.height / img.width) * netWidth;
        canvas.width = netWidth;
        canvas.height = netHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, netWidth, netHeight);
        setImageUrl(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Product name zaroori hai');
    if (buyingPrice === '' || sellingPrice === '' || openingStock === '') {
      return toast.error('Qemat aur Stock ki details bharna lazmi hai');
    }

    const finalCategory = showCategoryInput ? newCategory.trim() : category;
    const finalBrand = standardizeBrand(company);

    // Smart Validation Engine
    const validation = validateProductEntry(name.trim(), finalCategory, finalBrand);
    if (!validation.isValid && !categoryWarning) {
      setCategoryWarning(true);
      return toast.error(`${validation.message} (Save dubara dabayein confirm karne ke liye)`, { duration: 5000 });
    }
    
    setLoading(true);
    try {
      const newItem: any = {
        name: name.trim(),
        company: finalBrand,
        category: finalCategory || 'Others',
        unit,
        quantity: Number(openingStock),
        buyingPrice: Number(buyingPrice),
        price: Number(sellingPrice),
        minThreshold: Number(minThreshold),
        imageUrl: imageUrl || '',
        sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`
      };
      
      if (packSize.trim()) newItem.packSize = packSize.trim();

      await addStockItem(newItem);
      toast.success('Product add ho gaya! 🎉');
      setLoading(false);
      navigate(-1);
    } catch (e: any) {
      console.error('AddItem Error:', e);
      toast.error(`Saving fail hui: ${e?.message || 'Unknown error'}`);
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
           
           {/* IMAGE UPLOADER */}
            <div className="flex flex-col items-center justify-center py-2">
                <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all" 
                         style={{ backgroundColor: input, borderColor: border }}>
                        {imageUrl ? (
                            <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 opacity-20">
                                <Package size={24} />
                                <span className="text-[8px] font-black uppercase">NO PIC</span>
                            </div>
                        )}
                    </div>
                    {/* CAMERA TRIGGER BUTTON */}
                    <button 
                      onClick={() => setShowImageSource(true)}
                      className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#4BFF94] text-[#0A3D24] rounded-2xl flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-transform border-4 border-white dark:border-[#0A0A0A]">
                        <Camera size={18} strokeWidth={3} />
                    </button>
                    
                    {/* HIDDEN INPUTS */}
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-3 opacity-40">Product Image</p>
            </div>

            {/* IMAGE SOURCE CHOICE MENU */}
            {showImageSource && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={() => setShowImageSource(false)}>
                <div className="w-full max-w-xs bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                   <h3 className="text-[18px] font-black text-center mb-6" style={{ color: text }}>Tasweer Kahan Se Lein?</h3>
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
                        onClick={() => { fileInputRef.current?.click(); setShowImageSource(false); }}
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
                    className="w-full mt-6 py-3 rounded-xl font-bold text-[13px] opacity-40" 
                    style={{ color: text }}
                   >
                     Nahin, rehne dein
                   </button>
                </div>
              </div>
            )}
           
           {/* PRODUCT NAME (Database Integrated) */}
           <div className="space-y-2">
              <SearchableSelector 
                label="Product Search"
                items={KIRYANA_DATABASE}
                keys={['name', 'company']}
                placeholder="Dhund kar add karein (e.g. Shan Dalda)"
                category="products"
                onSelect={(item) => {
                   setName(item.name);
                   if (item.category) setCategory(item.category);
                   if (item.company) setCompany(item.company);
                   if (item.unit) setUnit(item.unit as any);
                }}
                onAddNew={(newName) => {
                   setName(newName);
                   const suggested = guessCategory(newName);
                   if (suggested) {
                     setCategory(suggested);
                     toast.success(`Category auto-selected: ${suggested}`, { icon: '🤖' });
                   }
                }}
              />
              <div className="flex items-center gap-1.5 px-1 mt-1 opacity-40">
                <span className="text-[10px] font-bold uppercase tracking-tighter">Database matching active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
           </div>

           {/* COMPANY / BRAND */}
           <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Company / Brand</p>
              <input 
                  value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Shan, Pepsi, National"
                  className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] transition-all"
                  style={{ color: text, borderColor: border, backgroundColor: input }}
              />
           </div>

           {/* BARCODE / SKU */}
           <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Barcode / SKU</p>
              <div className="relative">
                <input 
                    value={sku} onChange={e => setSku(e.target.value)}
                    placeholder="Enter or scan barcode"
                    className="w-full p-4 rounded-2xl border outline-none font-bold text-[15px] transition-all pr-12"
                    style={{ color: text, borderColor: '#4BFF94', backgroundColor: input }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90">
                  <Package size={18} className="text-[#4BFF94]" />
                </div>
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
                            {KIRYANA_CATEGORIES.map(c => (
                                <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                            ))}
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
                         <option value="bori">bori</option>
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
           <div className="absolute -top-2 bg-purple-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">PRO</div>
        </button>

      </div>
    </PageTransition>
  );
};

