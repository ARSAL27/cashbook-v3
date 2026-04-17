import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Check, ChevronDown, Camera } from 'lucide-react';
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

  const initialCheckDone = React.useRef(false);

  // ─── BARCODE INTEGRATION ───
  React.useEffect(() => {
    const barcode = searchParams.get('barcode');
    if (!barcode || initialCheckDone.current) return;

    setSku(barcode);
    
    // 1. Check local stock first (ONLY ONCE ON MOUNT)
    const existing = stock.find(s => barcode && (String(s.sku) === barcode || String(s.id) === barcode));
    if (existing) {
       initialCheckDone.current = true;
       toast.error('Yeh item pehle se stock mein hai!', { id: 'exists-check' });
       navigate(`/stock/${existing.id}`, { replace: true });
       return;
    }

    initialCheckDone.current = true;
    
    // 2. Search master database
    const master = KIRYANA_DATABASE.find(item => item.name.toLowerCase().includes(barcode.toLowerCase()));
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
    if (!category) return toast.error('Category zaroori hai');
    if (openingStock === '') return toast.error('Opening stock likhein');
    if (buyingPrice === '') return toast.error('Buying price likhein');
    if (sellingPrice === '') return toast.error('Selling price likhein');
    
    // Default empty numeric fields to 0 (already validated, but keeping number conversion)
    const finalOpening = Number(openingStock);
    const finalBuying = Number(buyingPrice);
    const finalSelling = Number(sellingPrice);

    const finalCategory = showCategoryInput ? newCategory.trim() : category;
    const finalBrand = standardizeBrand(company);

    // Smart Validation Engine - Reduced friction for Quick Add
    const validation = validateProductEntry(name.trim(), finalCategory, finalBrand);
    if (!validation.isValid && !categoryWarning) {
      setCategoryWarning(true);
      toast.error(`${validation.message}`, { duration: 3000 });
      // Don't return! Let them save anyway if they want, just show warning
    }
    
    setLoading(true);
    try {
      const newItem: any = {
        name: name.trim(),
        company: finalBrand,
        category: finalCategory || 'Others',
        unit,
        quantity: isNaN(finalOpening) ? 0 : finalOpening,
        buyingPrice: isNaN(finalBuying) ? 0 : finalBuying,
        price: isNaN(finalSelling) ? 0 : finalSelling,
        minThreshold: Number(minThreshold) || 5,
        imageUrl: imageUrl || '',
        sku: String(sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`)
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
        <div className="sticky top-0 z-50 transition-colors duration-300 px-5 pt-12 pb-4 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.05)]" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
           <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-white/60 p-2 -ml-2 active:bg-white/10 rounded-full transition-colors">
                 <ArrowLeft size={24} />
              </button>
              <h1 className="text-white font-black text-[22px] tracking-tight">Add New Item</h1>
           </div>
        </div>

        <div className="px-5 pt-5 space-y-5">
           
           {/* IMAGE UPLOADER */}
            <div className="flex flex-col items-center justify-center py-1">
                <div className="relative">
                    <div className="w-20 h-20 rounded-[1.5rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all" 
                         style={{ backgroundColor: input, borderColor: border }}>
                        {imageUrl ? (
                            <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 opacity-20">
                                <Package size={20} />
                                <span className="text-[8px] font-black uppercase">NO PIC</span>
                            </div>
                        )}
                    </div>
                    {/* CAMERA TRIGGER BUTTON */}
                    <button 
                      onClick={() => setShowImageSource(true)}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4BFF94] text-[#0A3D24] rounded-xl flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-transform border-2 border-white dark:border-[#0A0A0A]">
                        <Camera size={16} strokeWidth={2} />
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
           <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Product Name *</p>
              <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full p-3.5 rounded-xl border outline-none font-bold text-[14px] transition-all"
                  style={{ color: text, borderColor: border, backgroundColor: input }}
              />
              
              <div className="pt-2">
                <SearchableSelector 
                  label="Search Database (Optional)"
                  items={KIRYANA_DATABASE}
                  keys={['name', 'company']}
                  placeholder="Dhund kar add karein..."
                  category="products"
                  className="!text-[13px]"
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
              </div>
           </div>

           {/* COMPANY / BRAND */}
           <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Company / Brand</p>
              <input 
                  value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Shan, Pepsi, National"
                  className="w-full p-3.5 rounded-xl border outline-none font-bold text-[14px] transition-all"
                  style={{ color: text, borderColor: border, backgroundColor: input }}
              />
           </div>

           {/* BARCODE / SKU */}
           <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Barcode / SKU</p>
              <div className="relative">
                <input 
                    value={sku} onChange={e => setSku(e.target.value)}
                    placeholder="Enter or scan barcode"
                    className="w-full p-3.5 rounded-xl border outline-none font-bold text-[14px] transition-all pr-12"
                    style={{ color: text, borderColor: '#4BFF94', backgroundColor: input }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90">
                  <Package size={16} className="text-[#4BFF94]" />
                </div>
              </div>
           </div>

           {/* CAT, UNIT & PACK SIZE */}
           <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                 <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Category *</p>
                  <div className={`relative rounded-xl border transition-all ${categoryWarning ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}`} style={categoryWarning ? { backgroundColor: 'rgba(249,115,22,0.1)' } : { borderColor: border, backgroundColor: 'transparent' }}>

                    {!showCategoryInput ? (
                        <>
                            <select 
                            value={category} onChange={e => {
                                if (e.target.value === 'ADD_NEW') setShowCategoryInput(true);
                                else { setCategory(e.target.value); setCategoryWarning(false); }
                            }}
                            className="w-full p-3.5 rounded-xl outline-none font-bold text-[14px] appearance-none bg-transparent"
                            style={{ color: text }}
                            >
                            {KIRYANA_CATEGORIES.map(c => (
                                <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                            ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sub }} />
                        </>
                    ) : (
                        <div className="relative flex gap-1">
                            <input 
                                value={newCategory} 
                                onChange={e => setNewCategory(e.target.value)}
                                placeholder="Category name..."
                                className="w-full p-3.5 rounded-xl border outline-none font-bold text-[14px]"
                                style={{ backgroundColor: input, borderColor: '#4BFF94', color: text }}
                                autoFocus
                            />
                            <button 
                                onClick={() => setShowCategoryInput(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-[11px]"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Unit *</p>
                   <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>

                      <select 
                        value={unit} onChange={e => setUnit(e.target.value as any)}
                        className="w-full p-3.5 rounded-xl outline-none font-bold text-[14px] appearance-none bg-transparent"
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
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sub }} />
                   </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Pack Size</p>
                    <input 
                      value={packSize} onChange={e => setPackSize(e.target.value)}
                      placeholder="e.g. 5kg, 1L"
                      className="w-full p-3.5 rounded-xl border outline-none font-bold text-[14px] transition-all"
                      style={{ color: text, borderColor: border, backgroundColor: input }}

                    />
                </div>
              </div>
           </div>

           {/* LOGISTICS SECTION */}
           <div className="rounded-[1.5rem] p-5 border space-y-4" style={{ backgroundColor: isDarkMode ? '#141414' : '#F9F9F9', borderColor: border }}>
              <div className="flex items-center gap-2">
                 <Package size={16} style={{ color: '#0A3D24' }} />
                 <h3 className="text-[13px] font-black uppercase tracking-wider" style={{ color: '#0A3D24' }}>Inventory Logistics</h3>
              </div>
              
              <div className="space-y-1">
                 <p className="text-[10px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Opening Stock *</p>
                 <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>
                    <input 
                      type="number" value={openingStock} onChange={e => setOpeningStock(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3.5 rounded-xl outline-none font-black text-[16px] bg-transparent"
                      style={{ color: text }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase" style={{ color: sub }}>UNITS</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Buying Price *</p>
                    <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>

                       <input 
                         type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full p-3.5 rounded-xl outline-none font-black text-[15px] pl-8 bg-transparent"
                         style={{ color: text }}
                       />
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black" style={{ color: '#00C853' }}>Rs</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-tight opacity-40 uppercase" style={{ color: text }}>Selling Price *</p>
                    <div className="relative rounded-xl border transition-all" style={{ borderColor: border, backgroundColor: 'transparent' }}>

                       <input 
                         type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full p-3.5 rounded-xl outline-none font-black text-[15px] pl-8 bg-transparent"
                         style={{ color: text }}
                       />
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black" style={{ color: '#00C853' }}>Rs</span>
                    </div>
                 </div>
              </div>

              <div className="pt-2 border-t mt-2" style={{ borderColor: border }}>
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold tracking-tight uppercase" style={{ color: text }}>Low Stock Alert</p>
                       <p className="text-[8px] font-bold text-orange-500 uppercase">Alerts when stock drops below</p>
                    </div>
                    <div className="w-20">
                       <input 
                         type="number" value={minThreshold} onChange={e => setMinThreshold(e.target.value)}
                         className="w-full p-2 rounded-xl outline-none font-black text-center text-[14px]"
                         style={{ backgroundColor: input, color: text, border: `1px solid ${border}` }}
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* STICKY SAVE BUTTON */}
           <div className="fixed bottom-6 left-5 right-5 z-[85] max-w-md mx-auto">
              <button
                 onClick={handleSave}
                 disabled={loading}
                 className="w-full bg-[#4BFF94] text-[#0A3D24] py-4 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(75,255,148,0.3)] dark:shadow-green-900/40 disabled:opacity-50"
              >
                 {loading ? 'Saving...' : (
                   <>
                     <Check size={18} strokeWidth={4} />
                     Save Product Now
                   </>
                 )}
              </button>
           </div>
           <div className="h-24" />
        </div>
      </div>
    </PageTransition>
  );
};

