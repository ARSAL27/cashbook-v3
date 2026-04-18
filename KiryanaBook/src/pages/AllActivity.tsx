import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Filter, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';

type ActivityType = 'all' | 'sale' | 'expense' | 'udhaar';

export const AllActivity: React.FC = () => {
    const navigate = useNavigate();
    const { sales, expenses, udhaars } = useShop();
    const { isDarkMode } = useTheme();
    const [filter, setFilter] = useState<ActivityType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const allActivities = useMemo(() => {
        const s = sales.map(item => ({
            id: item.id,
            type: 'sale' as const,
            title: item.items?.map((i: any) => i.name).join(', ') || 'Cash Sale',
            amount: item.total,
            date: item.date,
            subLabel: item.type === 'udhaar' ? 'Udhaar Sale' : 'Cash Sale',
            color: '#4BFF94'
        }));

        const e = expenses.map(item => ({
            id: item.id,
            type: 'expense' as const,
            title: item.description || item.category || 'Expense',
            amount: item.amount,
            date: item.date,
            subLabel: item.category || 'General Expense',
            color: '#FF5252'
        }));

        const u = udhaars.map(item => {
            const isPayment = item.amount < 0;
            return {
                id: item.id,
                type: 'udhaar' as const,
                title: item.customerName,
                amount: Math.abs(item.amount),
                date: item.date,
                subLabel: isPayment ? 'Pese Wasool (Payment)' : 'Udhaar Diya (Credit)',
                color: isPayment ? '#4BFF94' : '#FFB300',
                isPayment
            };
        });

        const combined = [...s, ...e, ...u].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return combined;
    }, [sales, expenses, udhaars]);

    const filtered = allActivities.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.subLabel.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const colors = {
        bg: isDarkMode ? '#0A0A0A' : '#FAFAFA',
        card: isDarkMode ? '#141414' : '#FFFFFF',
        border: isDarkMode ? '#2A2A2A' : '#F0F0F0',
        text: isDarkMode ? '#FFFFFF' : '#0A0A0A',
        sub: isDarkMode ? '#B0B0B0' : '#888888'
    };

    return (
        <PageTransition>
            <div className="w-full font-outfit max-w-md mx-auto min-h-screen" style={{ backgroundColor: colors.bg }}>
                
                {/* HEADER */}
                <div className="pt-14 pb-6 px-6 sticky top-0 z-50 shadow-sm border-b transition-all flex flex-col gap-4" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24', borderColor: colors.border }}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform p-1">
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-white font-black text-[20px] tracking-tight uppercase">Sari Activity</h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Dhundyein (Sale, Expense, Naam)..."
                            className="w-full py-3 pl-11 pr-4 bg-white/10 border border-white/10 rounded-2xl text-white text-[13px] font-bold placeholder:text-white/20 outline-none focus:bg-white/15 transition-all"
                        />
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="px-5 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'sale', 'expense', 'udhaar'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                filter === t 
                                ? 'bg-[#4BFF94] text-[#0A3D24] border-[#4BFF94] shadow-lg shadow-[#4BFF94]/10' 
                                : 'bg-card text-text-muted border-border'
                            }`}
                        >
                            {t === 'all' ? 'Sab 📋' : t === 'sale' ? 'Sale 💰' : t === 'expense' ? 'Kharcha 💸' : 'Udhaar 👤'}
                        </button>
                    ))}
                </div>

                {/* ACTIVITY LIST */}
                <div className="px-5 pb-32 space-y-3">
                    {filtered.length > 0 ? filtered.map((item, idx) => {
                        const isIncome = (item.type === 'sale') || (item.type === 'udhaar' && (item as any).isPayment);
                        return (
                            <motion.div
                                key={`${item.type}-${item.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all active:scale-[0.98] shadow-sm"
                                style={{ borderColor: colors.border }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: item.color }} />
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                                            {isIncome ? (
                                                <TrendingUp size={20} style={{ color: item.color }} />
                                            ) : (
                                                <TrendingDown size={20} style={{ color: item.color }} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-black truncate" style={{ color: colors.text }}>{item.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                                    {item.subLabel}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-40">
                                                    <Clock size={9} />
                                                    <span className="text-[10px] font-bold">
                                                        {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right shrink-0">
                                        <p className="text-[16px] font-black leading-none mb-1" style={{ color: item.color }}>
                                            {isIncome ? '+' : '-'} Rs. {item.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-black uppercase tracking-tighter opacity-30">
                                            {new Date(item.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <EmptyState 
                            icon={Clock}
                            title="Nahi Mila"
                            description="Is filter ke sath koi activity nahi mili."
                        />
                    )}
                </div>
            </div>
        </PageTransition>
    );
};
