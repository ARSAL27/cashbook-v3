import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Package, AlertTriangle, DollarSign, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export const Stock: React.FC = () => {
  const { stock, profile, categories, addCategory, deleteCategory } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');

  const stats = useMemo(() => {
    const totalItems = stock.reduce((acc, item) => acc + item.quantity, 0);
    const totalValue = stock.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const lowStockCount = stock.filter(item => item.quantity <= (item.minThreshold || 5)).length;
    return { totalItems, totalValue, lowStockCount };
  }, [stock]);

  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku?.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All Items' || item.category === activeCategory;
      
      let matchFilter = true;
      if (filterType === 'low') matchFilter = item.quantity > 0 && item.quantity <= (item.minThreshold || 5);
      if (filterType === 'out') matchFilter = item.quantity <= 0;

      return matchSearch && matchCat && matchFilter;
    });
  }, [stock, search, activeCategory, filterType]);

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto relative" style={{ backgroundColor: bg }}>
        
         <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
         
         <div className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300" style={{ backgroundColor: bg + 'CC', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center bg-card shadow-sm border border-border rounded-xl active:scale-90 transition-all duration-200"
              style={{ color: text }}
            >
              <Menu size={18} />
            </button>
            <h1 className="text-[20px] font-black tracking-tight" style={{ color: text }}>The Stock</h1>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#4BFF94]"
          >
             <img src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>

        <div className="px-5 grid grid-cols-3 gap-2 mt-2">
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
             className="rounded-xl p-2.5 relative overflow-hidden shadow-sm"
             style={{ backgroundColor: isDarkMode ? '#1A3D30' : '#C1F0DB' }}
           >
              <p className="text-[7px] font-black uppercase tracking-wider mb-0.5" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24', opacity: 0.6 }}>Items</p>
              <h2 className="text-[14px] font-black leading-none" style={{ color: isDarkMode ? '#FFFFFF' : '#0A3D24' }}>{stats.totalItems.toLocaleString()}</h2>
              <div className="absolute right-[-4px] bottom-[-4px] opacity-10">
                <Package size={30} style={{ color: isDarkMode ? '#FFFFFF' : '#0A3D24' }} />
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
             className="rounded-xl p-2.5 relative overflow-hidden shadow-sm transition-colors duration-300"
             style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}
           >
              <p className="text-[7px] font-black uppercase tracking-wider mb-0.5 text-white/50">Value</p>
              <h2 className="text-[14px] font-black leading-none text-[#4BFF94]">
                 Rs.{stats.totalValue >= 1000000 ? (stats.totalValue / 1000000).toFixed(1) + 'M' : stats.totalValue >= 1000 ? (stats.totalValue / 1000).toFixed(0) + 'k' : stats.totalValue.toLocaleString()}
              </h2>
              <div className="absolute right-[-4px] bottom-[-4px] opacity-10">
                <DollarSign size={30} className="text-white" />
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
             className="rounded-xl p-2.5 relative overflow-hidden shadow-sm"
             style={{ backgroundColor: isDarkMode ? '#3D1A1A' : '#FFD9D9' }}
           >
              <p className="text-[7px] font-black uppercase tracking-wider mb-0.5" style={{ color: isDarkMode ? '#FF4B4B' : '#8A0000', opacity: 0.6 }}>Low</p>
              <h2 className="text-[14px] font-black leading-none" style={{ color: isDarkMode ? '#FFFFFF' : '#8A0000' }}>{stats.lowStockCount}</h2>
              <div className="absolute right-[-4px] bottom-[-4px] opacity-10">
                <AlertTriangle size={30} style={{ color: isDarkMode ? '#FFFFFF' : '#8A0000' }} />
              </div>
           </motion.div>
        </div>

        <div className="px-5 mt-8 flex gap-3">
           <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: sub }} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search inventory items..."
                className="w-full py-4 pl-12 pr-4 rounded-2xl border outline-none font-bold text-[14px] transition-all"
                style={{ backgroundColor: card, borderColor: border, color: text }}
              />
           </div>
           <button 
              onClick={() => setShowFilter(!showFilter)}
              className="w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-colors shadow-sm" 
              style={{ backgroundColor: showFilter || filterType !== 'all' ? '#4BFF94' : card, borderColor: showFilter || filterType !== 'all' ? '#4BFF94' : border }}
           >
              <Filter size={20} style={{ color: showFilter || filterType !== 'all' ? '#0A3D24' : text }} />
           </button>
        </div>

        {/* ── FILTER OPTIONS ── */}
        <AnimatePresence>
          {showFilter && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 overflow-hidden"
            >
              <div className="mt-3 p-4 rounded-2xl border shadow-sm flex flex-col gap-3" style={{ backgroundColor: card, borderColor: border }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: sub }}>Stock Status Filter</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setFilterType('all')} 
                    className="py-2.5 rounded-xl text-[11px] font-bold border transition-colors uppercase tracking-wider"
                    style={{ 
                      backgroundColor: filterType === 'all' ? (isDarkMode ? '#0A3D24' : '#E8F5E9') : 'transparent',
                      borderColor: filterType === 'all' ? '#4BFF94' : border,
                      color: filterType === 'all' ? (isDarkMode ? '#4BFF94' : '#0A3D24') : text
                    }}
                  >
                    All Items
                  </button>
                  <button 
                    onClick={() => setFilterType('low')} 
                    className="py-2.5 rounded-xl text-[11px] font-bold border transition-colors uppercase tracking-wider"
                    style={{ 
                      backgroundColor: filterType === 'low' ? (isDarkMode ? '#3D1A1A' : '#FFEBEE') : 'transparent',
                      borderColor: filterType === 'low' ? '#FF5252' : border,
                      color: filterType === 'low' ? '#FF5252' : text
                    }}
                  >
                    Low Stock
                  </button>
                  <button 
                    onClick={() => setFilterType('out')} 
                    className="py-2.5 rounded-xl text-[11px] font-bold border transition-colors uppercase tracking-wider"
                    style={{ 
                      backgroundColor: filterType === 'out' ? (isDarkMode ? '#4A0000' : '#FFD9D9') : 'transparent',
                      borderColor: filterType === 'out' ? '#D50000' : border,
                      color: filterType === 'out' ? '#D50000' : text
                    }}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-2 items-center">
           <button
             onClick={() => setActiveCategory('All Items')}
             className={`px-4 py-2.5 rounded-full text-[11px] font-black uppercase transition-all ${
                 activeCategory === 'All Items' ? (isDarkMode ? 'bg-[#4BFF94] text-[#0A3D24]' : 'bg-[#0A3D24] text-white') : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-400'
             }`}
           >
              All Items
           </button>

           {categories.map(c => (
              <div key={c} className="relative group flex items-center">
                <button
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-2.5 rounded-full text-[11px] font-black uppercase whitespace-nowrap transition-all ${
                        activeCategory === c ? (isDarkMode ? 'bg-[#4BFF94] text-[#0A3D24]' : 'bg-[#0A3D24] text-white') : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-400'
                    }`}
                >
                    {c}
                </button>
                {activeCategory === c && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Kya aap category "${c}" delete karna chahte hain?`)) { deleteCategory(c); setActiveCategory('All Items'); } }}
                        className="ml-[-12px] mr-2 bg-red-500 text-white rounded-full p-0.5 shadow-md z-10 scale-75"
                    >
                        <Plus size={10} className="rotate-45" />
                    </button>
                )}
              </div>
           ))}

           <button 
               onClick={() => {
                   const name = window.prompt('Nai category ka naam likhein:');
                   if (name?.trim()) addCategory(name.trim());
               }}
               className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-dashed border-gray-300 dark:border-white/10"
           >
               <Plus size={16} className="text-gray-400" />
           </button>
        </div>

        <div className="px-5 mt-6 space-y-2.5">
           {filteredStock.map((item, i) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.04 }}
               onClick={() => navigate(`/stock/${item.id}`)}
               className="rounded-2xl p-3 border flex flex-col gap-1.5 relative overflow-hidden transition-all active:scale-[0.98]"
               style={{ backgroundColor: card, borderColor: border }}
             >
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full ${item.quantity <= 0 ? 'bg-red-500' : item.quantity <= (item.minThreshold || 5) ? 'bg-orange-500' : 'bg-[#4BFF94]'}`} />
                
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#1E1E1E] flex items-center justify-center border border-gray-100 dark:border-white/5 overflow-hidden shrink-0">
                         {item.imageUrl ? (
                           <img 
                             src={item.imageUrl} 
                             alt={item.name} 
                             className="w-full h-full object-contain p-1.5" 
                             onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                           />
                         ) : (
                           <Package size={16} style={{ color: sub }} />
                         )}
                      </div>
                      <div className="min-w-0 pr-2">
                         <h3 className="text-[14px] font-black leading-tight truncate" style={{ color: text }}>{item.name}</h3>
                         <p className="text-[8px] font-bold mt-0.5 tracking-wider uppercase truncate" style={{ color: sub }}>{item.category} • {item.sku || 'N/A'}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-1 px-1">
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: sub }}>Stock</p>
                      <p className={`text-[12px] font-black leading-none ${item.quantity <= 0 ? 'text-red-500' : item.quantity <= (item.minThreshold || 5) ? 'text-orange-500' : text}`}>
                        {item.quantity} <span className="text-[8px] font-bold opacity-60">{item.unit || 'units'}</span>
                      </p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: sub }}>Price</p>
                      <p className="text-[12px] font-black leading-none" style={{ color: text }}>Rs {item.price.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: sub }}>Value</p>
                      <p className="text-[12px] font-black leading-none" style={{ color: text }}>Rs {(item.quantity * item.price > 1000 ? `${(item.quantity * item.price / 1000).toFixed(1)}k` : (item.quantity * item.price).toLocaleString())}</p>
                   </div>
                </div>

                <div className={`absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${item.quantity <= 0 ? 'bg-red-500' : item.quantity <= (item.minThreshold || 5) ? 'bg-orange-500' : 'bg-[#4BFF94]'}`} />
             </motion.div>
           ))}
        </div>

        <motion.div 
           className="fixed bottom-[180px] right-5 flex flex-col gap-3 items-end z-[90]"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/stock-receive')}
            className="px-6 py-4 bg-[#0A3D24] text-[#4BFF94] rounded-2xl flex items-center gap-3 shadow-2xl border-4 border-white dark:border-[#0A0A0A] font-black text-[14px]"
          >
            <Package size={20} />
            Company Product
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/add-item')}
            className="px-6 py-4 bg-[#4BFF94] text-[#0A3D24] rounded-2xl flex items-center gap-3 shadow-2xl border-4 border-white dark:border-[#0A0A0A] font-black text-[14px]"
          >
            <Plus size={20} strokeWidth={3} />
            Custom Product
          </motion.button>
        </motion.div>

      </div>
    </PageTransition>
  );
};
