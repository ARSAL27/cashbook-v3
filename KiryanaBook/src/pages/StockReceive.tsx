import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Check, Mic, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { KIRYANA_CATEGORIES, KIRYANA_DATABASE, type KiryanaProduct, getBrandStyle } from '../data/kiryanaDatabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4; // 1=Category, 2=Company, 3=Product, 4=Search

export const StockReceive: React.FC = () => {
  const { addStockItem, updateStockItem, stock } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Sheet state
  const [selectedProduct, setSelectedProduct] = useState<KiryanaProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [lowStock, setLowStock] = useState('10');
  const [overrideCategory, setOverrideCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Session stats
  const [addedCount, setAddedCount] = useState(0);

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const inputBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';

  const companiesMatch = useMemo(() => {
    if (!selectedCategory) return [];
    const prods = KIRYANA_DATABASE.filter(p => p.category === selectedCategory);
    const comps = Array.from(new Set(prods.map(p => p.company)));
    return comps.map(c => ({
      name: c,
      brand: getBrandStyle(c),
      count: prods.filter(p => p.company === c).length
    }));
  }, [selectedCategory]);

  const productsMatch = useMemo(() => {
    if (!selectedCompany || !selectedCategory) return [];
    return KIRYANA_DATABASE.filter(p => 
      p.company === selectedCompany && 
      p.category === selectedCategory
    );
  }, [selectedCompany, selectedCategory]);

  // Global search implementation
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const searchLower = globalSearch.toLowerCase();
    return KIRYANA_DATABASE.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.company.toLowerCase().includes(searchLower)
    );
  }, [globalSearch]);

  const handleSearchFocus = () => {
    setStep(4);
  };

  const cancelSearch = () => {
    setGlobalSearch('');
    if (selectedCompany) setStep(3);
    else if (selectedCategory) setStep(2);
    else setStep(1);
  };

  const openProduct = (product: KiryanaProduct) => {
    // Check if it exists in stock to auto-fill price/min
    const existing = stock.find(s => s.name === product.name && s.category === product.category);
    
    setSelectedProduct(product);
    setSelectedSize(''); // Reset size
    setQuantity('');
    if (existing) {
      setBuyingPrice(existing.buyingPrice?.toString() || '');
      setSellingPrice(existing.price?.toString() || '');
      setLowStock(existing.minThreshold?.toString() || '10');
      setOverrideCategory(existing.category || product.category);
    } else {
      setBuyingPrice('');
      setSellingPrice('');
      setLowStock('10');
      setOverrideCategory(product.category);
    }
  };

  const handleAddStock = async () => {
    if (!selectedProduct) return;
    if (!quantity || !buyingPrice || !sellingPrice) return toast.error('Quantity aur Prices zaroori hain');
    
    // VALIDATION
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) return toast.error('Quantity sahi daalein');
    if (isNaN(Number(buyingPrice)) || Number(buyingPrice) < 0) return toast.error('Khareed qemat sahi daalein');
    if (isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) return toast.error('Farokht qemat sahi daalein');
    
    setLoading(true);
    console.log('Adding Stock Details:', { product: selectedProduct, quantity, buyingPrice, sellingPrice, size: selectedSize });
    try {
      // Check if item already exists - Check using the target category
      const targetCategory = overrideCategory || selectedProduct.category;
      const existing = stock.find(s => s.name === selectedProduct.name && s.category === targetCategory);
      
      if (existing) {
        // UPDATE EXISTING ITEM
        const historyEntry = {
          id: Math.random().toString(36).substring(7),
          type: 'restock' as const,
          quantity: Number(quantity),
          date: new Date().toISOString(),
          note: 'Stock Receive (Database)'
        };

        await updateStockItem(existing.id, {
          quantity: (existing.quantity || 0) + Number(quantity),
          buyingPrice: Number(buyingPrice),
          price: Number(sellingPrice),
          minThreshold: Number(lowStock),
          packSize: selectedSize || existing.packSize,
          company: selectedProduct.company,
          imageUrl: getBrandStyle(selectedProduct.company).logoUrl || existing.imageUrl,
          history: [...(existing.history || []), historyEntry],
          isDeleted: false
        });
      } else {
        // ADD NEW ITEM
        await addStockItem({
          name: selectedProduct.name,
          company: selectedProduct.company,
          category: overrideCategory || selectedProduct.category,
          unit: selectedProduct.unit as any,
          packSize: selectedSize,
          quantity: Number(quantity),
          buyingPrice: Number(buyingPrice),
          price: Number(sellingPrice),
          minThreshold: Number(lowStock),
          imageUrl: getBrandStyle(selectedProduct.company).logoUrl,
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`
        });
      }

      toast.success(`${selectedProduct.name} ${selectedSize ? `(${selectedSize})` : ''} stock mein add ho gaya!`);
      setAddedCount(prev => prev + 1);
      setSelectedProduct(null);
    } catch (e: any) {
      console.error("Stock Save Error:", e);
      toast.error('Error saving stock: ' + (e.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const renderProgress = () => {
    return (
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: s <= step && step !== 4 ? '#4BFF94' : border }} />
        ))}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="w-full font-outfit max-w-md mx-auto relative min-h-screen pb-32" style={{ backgroundColor: bg }}>
        
        {/* HEADER */}
        <div className="pt-12 pb-3 sticky top-0 z-40 transition-colors duration-300 px-5 " style={{ backgroundColor: bg + 'CC', backdropFilter: 'blur(10px)' }}>
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <button onClick={() => {
                   if (selectedProduct) setSelectedProduct(null);
                   else if (step === 4) cancelSearch();
                   else if (step === 3) setStep(2);
                   else if (step === 2) setStep(1);
                   else navigate(-1);
                 }} style={{ color: text }}>
                    <ArrowLeft size={22} />
                 </button>
                 <h1 className="font-black text-[20px]" style={{ color: text }}>Company Product</h1>
              </div>
              {addedCount > 0 && (
                <button 
                  onClick={() => navigate('/stock')}
                  className="bg-[#4BFF94] text-[#0A3D24] px-4 py-1.5 rounded-full text-[12px] font-black shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                   <Check size={14} strokeWidth={4} />
                   Done ({addedCount})
                </button>
              )}
           </div>

           {/* Global Search Bar */}
           <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: sub }} />
              <input 
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder="Product dhundo..."
                className="w-full py-3.5 pl-12 pr-12 rounded-2xl border outline-none font-bold text-[14px] transition-all"
                style={{ backgroundColor: card, borderColor: border, color: text }}
              />
              <button 
                 disabled={true} // Wait for native
                 className="absolute right-3 w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 opacity-60 pointer-events-none"
              >
                 <Mic size={16} />
              </button>
           </div>
        </div>

        <div className="px-5 mt-2">
          {step !== 4 && renderProgress()}

          {/* STEP 1: CATEGORIES */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-[18px] font-black mb-4" style={{ color: text }}>Category Select Karo</h2>
              <div className="grid grid-cols-2 gap-4">
                {KIRYANA_CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setStep(2); }}
                    className="flex flex-col items-center justify-center p-6 rounded-[2rem] border shadow-sm transition-all active:scale-[0.98]"
                    style={{ backgroundColor: isDarkMode ? '#1E1E1E' : cat.color, borderColor: border }}
                  >
                    <span className="text-4xl mb-3">{cat.emoji}</span>
                    <h3 className="font-black text-[14px] text-center leading-tight mb-1" style={{ color: text }}>{cat.name}</h3>
                    <p className="text-[10px] font-bold opacity-60 uppercase" style={{ color: text }}>{cat.productCount} products</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: COMPANIES */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-[18px] font-black mb-4" style={{ color: text }}>Company Select Karo</h2>
              <div className="grid grid-cols-3 gap-3">
                {companiesMatch.map(comp => (
                  <button 
                    key={comp.name}
                    onClick={() => { setSelectedCompany(comp.name); setStep(3); }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm transition-all active:scale-[0.98]"
                    style={{ backgroundColor: card, borderColor: border }}
                  >
                    {/* Brand Card - always beautiful, no broken images */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden shadow-md"
                      style={{ background: comp.brand.bg }}
                    >
                      {/* Brand abbreviation always shown as base */}
                      <span 
                        className="font-black text-[17px] tracking-tight select-none"
                        style={{ color: comp.brand.text }}
                      >
                        {comp.brand.abbr}
                      </span>
                      {/* Real logo image overlaid if available */}
                      {comp.brand.logoUrl && (
                        <img
                          src={comp.brand.logoUrl}
                          alt={comp.name}
                          className="absolute inset-0 w-full h-full object-contain p-1.5"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <h3 className="font-black text-[11px] text-center leading-tight mb-0.5 truncate w-full" style={{ color: text }}>{comp.name}</h3>
                    <p className="text-[9px] font-bold uppercase text-gray-400">{comp.count} products</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 & 4: PRODUCTS LIST */}
          {(step === 3 || step === 4) && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 pb-32">
              <h2 className="text-[18px] font-black mb-2" style={{ color: text }}>
                {step === 4 ? 'Search Results' : 'Product Select Karo'}
              </h2>
              
              {(() => {
                const list = step === 4 ? searchResults : productsMatch;
                
                // Grouping Logic
                const grouped: Record<string, { baseName: string; variations: typeof list; company: string; category: string }> = {};
                
                list.forEach(item => {
                  // Basic extraction: "Coca Cola 250ml Can" -> "Coca Cola"
                  // We can use a regex or just take everything before the first digit
                  const nameMatch = item.name.match(/^(.*?)\s*\d/);
                  const base = nameMatch ? nameMatch[1].trim() : item.name;
                  
                  if (!grouped[base]) {
                    grouped[base] = { baseName: base, variations: [], company: item.company, category: item.category };
                  }
                  grouped[base].variations.push(item);
                });

                return Object.values(grouped).map(group => {
                  const brand = getBrandStyle(group.company);
                  
                  return (
                    <div 
                      key={group.baseName}
                      className="p-4 rounded-[2rem] border shadow-sm transition-all"
                      style={{ backgroundColor: card, borderColor: border }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center relative shadow-sm border border-gray-100 dark:border-white/5"
                          style={{ backgroundColor: brand.bg }}
                        >
                          <span className="font-black text-[12px]" style={{ color: brand.text }}>{brand.abbr}</span>
                          {brand.logoUrl && (
                            <img src={brand.logoUrl} alt="" className="absolute inset-0 w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-black leading-tight" style={{ color: text }}>{group.baseName}</h3>
                          <p className="text-[10px] font-bold mt-0.5 opacity-60" style={{ color: text }}>{group.company}</p>
                        </div>
                      </div>

                      {/* Variations List */}
                      <div className="space-y-2">
                        {group.variations.map(variant => {
                          const isAdded = stock.some(s => s.name === variant.name && s.category === variant.category);
                          return (
                            <div key={variant.id} className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-white/5">
                              <span className="text-[13px] font-bold" style={{ color: text }}>
                                {variant.name.replace(group.baseName, '').trim() || 'Standard'}
                              </span>
                              <button 
                                onClick={() => openProduct(variant)}
                                className="px-5 py-2 rounded-xl text-[11px] font-black transition-colors"
                                style={{ backgroundColor: isAdded ? '#E8F5E9' : '#0A3D24', color: isAdded ? '#00C853' : '#4BFF94' }}
                              >
                                {isAdded ? 'UPDATE' : '+ ADD'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}

              {step === 4 && searchResults.length === 0 && (
                 <div className="text-center py-10">
                   <p className="font-bold text-gray-400">Koi product nahi mila</p>
                 </div>
              )}
            </motion.div>
          )}
        </div>

        {/* BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[2.5rem] z-[110] overflow-hidden"
                style={{ backgroundColor: card, maxHeight: '90vh' }}
              >
                <div className="overflow-y-auto px-6 py-8 no-scrollbar" style={{ maxHeight: '90vh' }}>
                  <div className="relative">
                    <button onClick={() => setSelectedProduct(null)} className="absolute right-0 top-0 p-2 bg-gray-100 dark:bg-[#2A2A2A] rounded-full">
                      <X size={18} style={{ color: text }} />
                    </button>
                    
                      <h3 className="text-[18px] font-black pr-10 leading-tight" style={{ color: text }}>
                        {selectedProduct.name}
                        {selectedSize && <span className="text-[#00C853] ml-2">({selectedSize})</span>}
                      </h3>
                      <p className="text-[12px] font-bold mt-1" style={{ color: sub }}>{selectedProduct.company} • {overrideCategory}</p>
                    </div>

                    {/* CATEGORY SELECTOR */}
                    <div className="mt-6">
                      <p className="text-[10px] font-black uppercase tracking-widest pl-1 mb-2" style={{ color: sub }}>Category Select Karein</p>
                      <div className="relative">
                        <select 
                          value={overrideCategory} 
                          onChange={e => setOverrideCategory(e.target.value)}
                          className="w-full p-4 rounded-2xl border outline-none font-bold text-[14px] appearance-none transition-all" 
                          style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                        >
                          {KIRYANA_CATEGORIES.map(c => (
                            <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <Search size={16} />
                        </div>
                      </div>
                    </div>

                  {/* SIZE SELECTOR */}
                  <div className="mt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest pl-1 mb-2" style={{ color: sub }}>Select Pack Size</p>
                    <div className="flex flex-wrap gap-2">
                      {['50g', '100g', '200g', '250g', '400g', '500g', '800g', '1kg', '2kg', '5kg', '10kg', 'sachet', '250ml', '500ml', '800ml', '1L', '1.5L', '2.5L', '3L', '5L', '1 pcs', 'Half Doz', '1 Doz'].map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${
                            selectedSize === size 
                              ? 'bg-[#4BFF94] text-[#0A3D24] border-[#4BFF94]' 
                              : `bg-transparent border-${border} text-${text} opacity-60`
                          }`}
                          style={{ 
                            borderColor: selectedSize === size ? '#4BFF94' : border,
                            backgroundColor: selectedSize === size ? '#4BFF94' : 'transparent',
                            color: selectedSize === size ? '#0A3D24' : text
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Quantity Received</p>
                       <div className="relative">
                          <input 
                            type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                            placeholder="0"
                            className="w-full p-4 rounded-2xl border outline-none font-black text-[18px]"
                            style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                            autoFocus
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-black" style={{ color: sub }}>{selectedProduct.unit}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Buying Price</p>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-[#00C853]">Rs</span>
                            <input 
                              type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)}
                              placeholder="0"
                              className="w-full pl-10 pr-4 py-4 rounded-2xl border outline-none font-black text-[16px]"
                              style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                            />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Selling Price</p>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-[#00C853]">Rs</span>
                            <input 
                              type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                              placeholder="0"
                              className="w-full pl-10 pr-4 py-4 rounded-2xl border outline-none font-black text-[16px]"
                              style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                            />
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest pl-1 text-orange-500">Low Stock Alert</p>
                       <div className="relative">
                          <input 
                            type="number" value={lowStock} onChange={e => setLowStock(e.target.value)}
                            placeholder="10"
                            className="w-full p-4 rounded-2xl border outline-none font-black text-[16px]"
                            style={{ backgroundColor: isDarkMode ? '#1A140F' : '#FFF9F4', borderColor: isDarkMode ? '#2A1A0F' : '#FFE0B2', color: text }}
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-black" style={{ color: sub }}>{selectedProduct.unit}</span>
                       </div>
                    </div>
                  </div>

                  <button
                     onClick={handleAddStock}
                     disabled={loading}
                     className="w-full mt-6 bg-[#4BFF94] text-[#0A3D24] py-5 rounded-[1.5rem] font-black text-[16px] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(75,255,148,0.25)] disabled:opacity-50 mb-6"
                  >
                     <Check size={20} strokeWidth={4} />
                     {loading ? 'Saving...' : 'ADD TO STOCK'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
};
