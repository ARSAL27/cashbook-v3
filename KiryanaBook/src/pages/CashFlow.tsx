import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Calendar, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import { MarqueeText } from '../components/MarqueeText';

type RangeType = 'daily' | 'weekly' | 'monthly' | 'custom';

export const CashFlow: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('type') === 'out' ? 'out' : 'in';
    const { sales, expenses, udhaars } = useShop();
    const { isDarkMode } = useTheme();

    const [range, setRange] = useState<RangeType>('daily');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const isIn = mode === 'in';
    const accentColor = isIn ? '#00C853' : '#FF5252';
    const bgAccent = isIn ? 'rgba(0,200,83,0.08)' : 'rgba(255,82,82,0.08)';
    const headerBg = isIn 
        ? (isDarkMode ? '#10251A' : '#0A3D24') 
        : (isDarkMode ? '#2D0A0A' : '#7B1717');

    const getDateRange = (): { from: Date; to: Date } => {
        const now = new Date();
        const to = new Date(now);
        to.setHours(23, 59, 59, 999);

        if (range === 'daily') {
            const from = new Date(now);
            from.setHours(0, 0, 0, 0);
            return { from, to };
        }
        if (range === 'weekly') {
            const from = new Date(now);
            from.setDate(now.getDate() - 6);
            from.setHours(0, 0, 0, 0);
            return { from, to };
        }
        if (range === 'monthly') {
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            return { from, to };
        }
        // custom
        const from = customFrom ? new Date(customFrom) : new Date(0);
        const customToDate = customTo ? new Date(customTo) : new Date();
        customToDate.setHours(23, 59, 59, 999);
        return { from, to: customToDate };
    };

    const filtered = useMemo(() => {
        const { from, to } = getDateRange();
        if (isIn) {
            const s = sales
                .filter(s => {
                    const d = new Date(s.date);
                    return d >= from && d <= to;
                })
                .map(s => ({
                    id: s.id,
                    amount: s.total,
                    label: (s as any).items?.map((i: any) => i.name).join(', ') || 'Cash Sale',
                    subLabel: (s as any).type === 'udhaar' ? 'Udhaar Sale' : 'Cash Sale',
                    date: s.date,
                    type: (s as any).type as string,
                }));
            
            const u = udhaars
                .filter(u => {
                    const d = new Date(u.date);
                    return d >= from && d <= to && u.amount < 0; // Payment Received (Inflow)
                })
                .map(u => ({
                    id: u.id,
                    amount: Math.abs(u.amount),
                    label: `Wasooli: ${u.customerName}`,
                    subLabel: 'Advance / Wasooli',
                    date: u.date,
                    type: 'advance',
                }));

            return [...s, ...u].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            const e = expenses
                .filter(e => {
                    const d = new Date(e.date);
                    return d >= from && d <= to;
                })
                .map(e => ({
                    id: e.id,
                    amount: e.amount,
                    label: e.description || e.category || 'Expense',
                    subLabel: e.category || 'Other',
                    date: e.date,
                    type: 'expense',
                }));

            const u = udhaars
                .filter(u => {
                    const d = new Date(u.date);
                    return d >= from && d <= to && u.amount > 0; // Udhaar Given (Outflow)
                })
                .map(u => ({
                    id: u.id,
                    amount: u.amount,
                    label: `Udhaar: ${u.customerName}`,
                    subLabel: 'Udhaar Given',
                    date: u.date,
                    type: 'udhaar_given',
                }));

            return [...e, ...u].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isIn, sales, expenses, range, customFrom, customTo]);

    const total = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered]);

    const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
    const card = isDarkMode ? '#141414' : '#FFFFFF';
    const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
    const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
    const sub = isDarkMode ? '#888' : '#999';

    const ranges: { key: RangeType; label: string }[] = [
        { key: 'daily', label: 'Aaj' },
        { key: 'weekly', label: '7 Din' },
        { key: 'monthly', label: 'Is Mahine' },
        { key: 'custom', label: 'Custom' },
    ];


    return (
        <PageTransition> 
            <div className="w-full font-outfit max-w-md mx-auto min-h-screen flex flex-col relative pb-40" style={{ backgroundColor: bg }}>

                {/* HEADER */}
                <div style={{ backgroundColor: headerBg }} className="px-5 pt-10 pb-10 sticky top-0 z-30 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
                            <ArrowLeft size={22} />
                        </button>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                            {isIn ? 'Cash In — Income' : 'Cash Out — Kharcha'}
                        </p>
                        <div className="w-7" />
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: isIn ? 'rgba(75,255,148,0.15)' : 'rgba(255,82,82,0.15)' }}>
                                {isIn
                                    ? <ArrowDownLeft size={26} className="text-[#4BFF94]" />
                                    : <ArrowUpRight size={26} className="text-[#FF7070]" />
                                }
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-0.5">Total {isIn ? 'Cash In' : 'Cash Out'}</p>
                                <p className="text-white font-black text-[32px] leading-none">Rs. {total.toLocaleString()}</p>
                                <p className="text-white/30 text-[11px] mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RANGE FILTER */}
                <div className="px-4 -mt-6 mb-4 relative z-40">
                    <div className="bg-white dark:bg-[#141414] rounded-[1.8rem] p-1.5 shadow-xl border" style={{ borderColor: border }}>
                        <div className="grid grid-cols-4 gap-1">
                            {ranges.map(r => (
                                <button
                                    key={r.key}
                                    onClick={() => {
                                        setRange(r.key);
                                        if (r.key === 'custom') setShowCustom(true);
                                        else setShowCustom(false);
                                    }}
                                    className="py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all"
                                    style={{
                                        backgroundColor: range === r.key ? accentColor : 'transparent',
                                        color: range === r.key ? 'white' : sub
                                    }}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom date inputs */}
                        <AnimatePresence>
                            {showCustom && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3 pb-1 flex gap-2">
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-[9px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Shuru (From)</p>
                                            <div className="relative">
                                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                                                <input
                                                    type="date"
                                                    value={customFrom}
                                                    onChange={e => setCustomFrom(e.target.value)}
                                                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-[12px] font-bold outline-none border border-transparent focus:border-accent transition-all [color-scheme:dark]"
                                                    style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', color: text }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-[9px] font-black uppercase tracking-widest pl-1" style={{ color: sub }}>Khatam (To)</p>
                                            <div className="relative">
                                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                                                <input
                                                    type="date"
                                                    value={customTo}
                                                    onChange={e => setCustomTo(e.target.value)}
                                                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-[12px] font-bold outline-none border border-transparent focus:border-accent transition-all [color-scheme:dark]"
                                                    style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', color: text }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* TRANSACTION LIST */}
                <div className="px-4 space-y-2">
                    {filtered.length === 0 ? (
                        <EmptyState 
                            icon={Calendar}
                            title="Koi Record Nahi Mila"
                            description={`Is period mein aapka koi cash ${isIn ? 'in (income)' : 'out (expense)'} record nahi hai.`}
                        />
                    ) : (
                        filtered.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 p-4 rounded-2xl border shadow-sm"
                                style={{ backgroundColor: card, borderColor: border }}
                            >
                                {/* Icon */}
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: bgAccent }}>
                                    {isIn
                                        ? <ArrowDownLeft size={20} style={{ color: accentColor }} />
                                        : <ArrowUpRight size={20} style={{ color: accentColor }} />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <MarqueeText 
                                        text={item.label} 
                                        className="text-[13px] font-bold" 
                                    />
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: bgAccent, color: accentColor }}>
                                            {item.subLabel}
                                        </span>
                                        <span className="text-[10px]" style={{ color: sub }}>
                                            {new Date(item.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                                            {' · '}
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount */}
                                <p className="text-[16px] font-black shrink-0" style={{ color: accentColor }}>
                                    {isIn ? '+' : '-'} Rs. {item.amount.toLocaleString()}
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* STICKY TOTAL FOOTER */}
                {filtered.length > 0 && (
                    <div className="fixed bottom-6 inset-x-0 max-w-md mx-auto px-4 z-30">
                        <div className="rounded-2xl p-4 shadow-xl flex items-center justify-between border"
                            style={{ backgroundColor: card, borderColor: border }}>
                            <div className="flex items-center gap-2">
                                <Filter size={14} style={{ color: sub }} />
                                <p className="text-[12px] font-bold" style={{ color: sub }}>{filtered.length} entries</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: sub }}>Kul {isIn ? 'Income' : 'Kharcha'}</p>
                                <p className="text-[20px] font-black" style={{ color: accentColor }}>Rs. {total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};
