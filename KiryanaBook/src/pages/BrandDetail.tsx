import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { getBrandStyle } from '../data/kiryanaDatabase';

export const BrandDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const { stock } = useShop();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const brandName = name || 'Unknown Brand';
    const brandStyle = useMemo(() => getBrandStyle(brandName), [brandName]);

    const brandStock = useMemo(() => 
        stock.filter(s => s.company?.toLowerCase() === brandName.toLowerCase()), 
    [stock, brandName]);

    const stats = useMemo(() => {
        const totalItems = brandStock.reduce((acc, item) => acc + (parseFloat(String(item.quantity || 0)) || 0), 0);
        const totalValue = brandStock.reduce((acc, item) => {
            const q = parseFloat(String(item.quantity || 0)) || 0;
            const p = parseFloat(String(item.price || 0)) || 0;
            return acc + (q * p);
        }, 0);
        return { totalItems, totalValue };
    }, [brandStock]);

    const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
    const card = isDarkMode ? '#141414' : '#FFFFFF';
    const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
    const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';

    return (
        <PageTransition> <div className="w-full font-outfit max-w-md mx-auto min-h-screen " style={{ backgroundColor: bg }}>
                
                {/* HEAD & THEME HEADER */}
                <div className="relative pt-12 pb-24 px-6 overflow-hidden transition-colors duration-500" 
                     style={{ backgroundColor: brandStyle.bg }}>
                    
                    {/* Floating Brand Initials */}
                    <div className="absolute -right-4 -bottom-4 opacity-10 select-none">
                        <h1 className="text-[120px] font-black italic tracking-tighter" style={{ color: brandStyle.text }}>
                            {brandStyle.abbr}
                        </h1>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Brand Portfolio</p>
                        </div>
                        <div className="w-10" />
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-[32px] font-black leading-tight text-white mb-2">{brandName}</h1>
                        <p className="text-white/60 font-bold text-[14px] uppercase tracking-wider">{brandStock.length} Products Found</p>
                    </div>

                    {/* STATS OVERLAY CARDS */}
                    <div className="absolute -bottom-10 left-6 right-6 grid grid-cols-2 gap-4 z-20">
                        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl shadow-xl border border-black/5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Stock</p>
                            <h2 className="text-[18px] font-black" style={{ color: text }}>{stats.totalItems} <span className="text-[10px] opacity-40">units</span></h2>
                        </div>
                        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl shadow-xl border border-black/5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Value</p>
                            <h2 className="text-[18px] font-black text-emerald-500">Rs {stats.totalValue.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>

                {/* PRODUCT LIST */}
                <div className="px-6 mt-16 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[14px] font-black uppercase tracking-widest opacity-40">Catalog Items</h3>
                        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5 ml-4" />
                    </div>

                    {brandStock.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                            <Package size={48} className="mx-auto mb-4" />
                            <p className="font-black text-[12px] uppercase">No items in stock</p>
                        </div>
                    ) : (
                        brandStock.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/stock/${item.id}`)}
                                className="p-4 rounded-[2rem] border shadow-sm flex items-center gap-4 active:scale-95 transition-all"
                                style={{ backgroundColor: card, borderColor: border }}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-white/5 flex items-center justify-center overflow-hidden">
                                     {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                     ) : (
                                        <Package size={20} className="opacity-20" />
                                     )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[14px] font-black" style={{ color: text }}>{item.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[15px] font-black" style={{ color: text }}>{item.quantity}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{item.unit || 'pcs'}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

            </div>
        </PageTransition>
    );
};
