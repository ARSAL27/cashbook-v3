import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export const BalanceHistory: React.FC = () => {
    const { sales, expenses, profile } = useShop();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const history = useMemo(() => {
        const dataMap: Record<string, { in: number, out: number, date: string }> = {};

        // Aggregate Sales (Cash In)
        (sales || []).forEach(s => {
            if (!s.date) return;
            const ds = s.date.split('T')[0];
            if (!dataMap[ds]) dataMap[ds] = { in: 0, out: 0, date: ds };
            dataMap[ds].in += (s.total || 0);
        });

        // Aggregate Expenses (Cash Out)
        (expenses || []).forEach(e => {
            if (!e.date) return;
            const ds = e.date.split('T')[0];
            if (!dataMap[ds]) dataMap[ds] = { in: 0, out: 0, date: ds };
            dataMap[ds].out += (e.amount || 0);
        });

        return Object.values(dataMap).sort((a, b) => b.date.localeCompare(a.date));
    }, [sales, expenses]);

    const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
    const card = isDarkMode ? '#141414' : '#FFFFFF';
    const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
    const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
    const sub = isDarkMode ? '#B0B0B0' : '#888888';

    const formatDate = (ds: string) => {
        const date = new Date(ds);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <PageTransition>
            <div className="w-full font-outfit max-w-md mx-auto min-h-screen pb-20 transition-colors duration-300" style={{ backgroundColor: bg }}>
                
                {/* HEADER */}
                <div className="pt-12 pb-10 sticky top-0 z-50 px-5 transition-all duration-300 shadow-xl rounded-b-[2rem]" style={{ backgroundColor: isDarkMode ? '#10251A' : '#1A5C38' }}>
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-white font-black text-[20px] tracking-tight">Balance History</h1>
                        <div className="w-10" />
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-1">
                            <Wallet className="text-[#4BFF94]" size={20} strokeWidth={2.5} />
                        </div>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">Total Records</p>
                        <h2 className="text-white text-[22px] font-black leading-none">{history.length} Days</h2>
                    </div>
                </div>

                {/* LIST */}
                <div className="px-4 -mt-5 space-y-4 relative z-10 pb-10">
                    {history.length === 0 ? (
                        <div className="bg-white dark:bg-[#141414] rounded-3xl p-10 text-center shadow-lg border dark:border-white/5">
                            <Calendar size={48} className="mx-auto mb-4 text-gray-200 dark:text-white/5" />
                            <p className="text-gray-400 font-bold">Abhi tak koi records nahi hain.</p>
                        </div>
                    ) : (
                        history.map((day, idx) => {
                            // Calculate COGS for this day to show actual Profit
                            let dailyCogs = 0;
                            (sales || []).filter(s => s.date?.startsWith(day.date)).forEach(sale => {
                                (sale.items || []).forEach(item => {
                                    const st = (useShop() as any).stock.find((s: any) => s.id === item.itemId);
                                    if (st) dailyCogs += (st.buyingPrice || 0) * item.qty;
                                });
                            });

                            const net = day.in - day.out - dailyCogs;
                            const isProfit = net >= 0;

                            return (
                                <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="rounded-3xl p-5 shadow-sm border transition-all active:scale-[0.98]"
                                    style={{ backgroundColor: card, borderColor: border }}
                                >
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#1A5C38] dark:text-[#4BFF94]" />
                                            <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: sub }}>
                                                {formatDate(day.date)}
                                            </span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isProfit ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                                            {isProfit ? 'Profit' : 'Loss'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/50 dark:bg-white/5 p-3 rounded-2xl">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <TrendingUp size={10} className="text-[#00C853]" />
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cash In</p>
                                            </div>
                                            <p className="text-[15px] font-black text-[#00C853]">Rs. {day.in.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50/50 dark:bg-white/5 p-3 rounded-2xl">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <TrendingDown size={10} className="text-[#FF5252]" />
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cash Out</p>
                                            </div>
                                            <p className="text-[15px] font-black text-[#FF5252]">Rs. {day.out.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t dark:border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Daily Net Profit</p>
                                            <p className="text-[8px] font-bold text-gray-400">(Sales - Exp - COGS)</p>
                                        </div>
                                        <p className={`text-[18px] font-black ${isProfit ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                                            {isProfit ? '+' : '-'} Rs. {Math.abs(net).toLocaleString()}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </PageTransition>
    );
};
