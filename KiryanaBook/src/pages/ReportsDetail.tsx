import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { MarqueeText } from '../components/MarqueeText';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsDetail: React.FC = () => {
    const { sales, expenses, stock, profile } = useShop();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [range, setRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1W');
    const [chartWidth, setChartWidth] = useState(window.innerWidth - 40);

    React.useEffect(() => {
        const handleResize = () => setChartWidth(Math.min(window.innerWidth - 40, 400));
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chartData = useMemo(() => {
        const data = [];
        const now = new Date();
        const days = range === '1D' ? 1 : range === '1W' ? 7 : range === '1M' ? 30 : 365;
        const step = range === '1Y' ? 30 : 1; // Monthly points if 1 year

        for (let i = days - 1; i >= 0; i -= step) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dt = String(d.getDate()).padStart(2, '0');
            const localDs = `${y}-${m}-${dt}`;

            let label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            if (range === '1Y') label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            const dailyPeriodSales = sales.filter(s => {
                const sd = new Date(s.date);
                return `${sd.getFullYear()}-${String(sd.getMonth()+1).padStart(2,'0')}-${String(sd.getDate()).padStart(2,'0')}` === localDs;
            });
            const dailySales = dailyPeriodSales.reduce((sum, s) => sum + s.total, 0);

            let dailyCogs = 0;
            dailyPeriodSales.forEach(sale => {
                (sale.items || []).forEach(item => {
                    const st = stock.find(s => s.id === item.itemId);
                    if (st) {
                        dailyCogs += (st.buyingPrice || 0) * item.qty;
                    }
                });
            });
            
            const dailyExpenses = expenses.filter(e => {
                const ed = new Date(e.date);
                return `${ed.getFullYear()}-${String(ed.getMonth()+1).padStart(2,'0')}-${String(ed.getDate()).padStart(2,'0')}` === localDs;
            }).reduce((sum, e) => sum + e.amount, 0);

            data.push({ name: label, sales: dailySales, expenses: dailyExpenses, cogs: dailyCogs, localDs });
        }
        return data;
    }, [sales, expenses, range]);

    const stats = useMemo(() => {
        const totalSales = chartData.reduce((a, b) => a + b.sales, 0);
        const totalExpenses = chartData.reduce((a, b) => a + b.expenses, 0);
        const totalCogs = chartData.reduce((a, b) => a + (b as any).cogs, 0);
        const profit = totalSales - totalExpenses - totalCogs;
        return { totalSales, totalExpenses, profit };
    }, [chartData]);



    const sendToWhatsApp = () => {
        if (!profile?.phone) {
            toast.error('Profile me phone number set nahi hai!');
            return;
        }
        
        let periodText = 'Aaj Ka';
        if (range === '1W') periodText = 'Pishlay 7 Din';
        if (range === '1M') periodText = 'Pishlay 1 Mahinay';
        if (range === '1Y') periodText = 'Pishlay 1 Saal';

        let breakdownStr = '';
        chartData.slice().reverse().forEach(day => {
            const hasActivity = day.sales > 0 || day.expenses > 0;
            if (hasActivity) {
                const dailyProfit = day.sales - day.expenses - (day.cogs || 0);
                breakdownStr += `📅 *${day.name} (${day.localDs})*\n`
                              + `   Sales: Rs. ${day.sales.toLocaleString()}\n`
                              + `   Exp: Rs. ${day.expenses.toLocaleString()}\n`
                              + `   Profit: ${dailyProfit >= 0 ? '+' : '-'}Rs. ${Math.abs(dailyProfit).toLocaleString()}\n\n`;
            }
        });

        const msg = `*${profile?.name || 'Shop'} - Business Report* 📊\n\n`
          + `*Period:* ${periodText}\n`
          + `*Total Sales:* Rs. ${stats.totalSales.toLocaleString()}\n`
          + `*Total Expenses:* Rs. ${stats.totalExpenses.toLocaleString()}\n`
          + `*Net Profit:* Rs. ${stats.profit.toLocaleString()}\n\n`
          + `*DAILY BREAKDOWN:*\n`
          + (breakdownStr || '_No activity recorded during this period_') + '\n'
          + `_Powered by KiryanaBook_`;

        let phone = profile.phone.replace(/\D/g, '');
        if (phone.startsWith('0')) phone = '92' + phone.substring(1);
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const colors = {
        primary: isDarkMode ? '#00E676' : '#0A3D24',
        secondary: isDarkMode ? '#FF5252' : '#EF4444',
        bg: isDarkMode ? '#0A0A0A' : '#FAFAFA',
        card: isDarkMode ? '#141414' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        sub: isDarkMode ? '#B0B0B0' : '#6B7280',
        profit: isDarkMode ? '#00E676' : '#059669',
        loss: isDarkMode ? '#FF5252' : '#DC2626'
    };

    return (
        <PageTransition> 
            <div className="w-full h-[100dvh] font-outfit max-w-md mx-auto bg-background text-text-primary overflow-hidden flex flex-col">
                {/* HEADER */}
                <div className="pt-10 pb-2 px-5 flex items-center justify-between shrink-0">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-card shadow-sm border border-border text-text-primary active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[17px] font-black text-text-primary">Detailed Hisaab</h1>
                    <div className="w-10" />
                </div>

                <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-4">
                    {/* RANGE TOGGLE */}
                    <div>
                    <div className="bg-gray-100 dark:bg-[#1A1A1A] p-1.5 rounded-2xl flex gap-1 shadow-inner">
                        {(['1D', '1W', '1M', '1Y'] as const).map(r => (
                            <button 
                                key={r} onClick={() => setRange(r)}
                                className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${range === r ? 'bg-white dark:bg-[#2A2A2A] shadow-md scale-[1.02] text-[#0A3D24] dark:text-[#00E676]' : 'text-gray-400 opacity-60'}`}
                            >
                                {r === '1D' ? '1 Din' : r === '1W' ? '7 Din' : r === '1M' ? '1 Mahina' : '1 Saal'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CHART CONTAINER */}
                <div className="px-5 mb-6">
                    <div className="p-5 rounded-[2.5rem] bg-card shadow-xl shadow-black/5 border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sales vs Expenses</p>
                                <h2 className="text-[20px] font-black text-text-primary">Performance Analysis</h2>
                            </div>
                            <div className="w-10 h-10 bg-success/10 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="text-success" size={18} />
                            </div>
                        </div>

                        <div className="h-64 w-full mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={chartData} 
                                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#222' : '#F3F4F6'} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: colors.sub, fontWeight: 700 }}
                                        interval={range === '1W' ? 0 : 'preserveStartEnd'}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: colors.sub, fontWeight: 700 }}
                                        tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ 
                                            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF', 
                                            border: '1px solid ' + (isDarkMode ? '#333' : '#F3F4F6'), 
                                            borderRadius: '16px', 
                                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' 
                                        }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar 
                                        dataKey="sales" 
                                        fill={colors.primary} 
                                        radius={[6, 6, 0, 0]} 
                                        barSize={range === '1W' ? 25 : undefined}
                                    />
                                    <Bar 
                                        dataKey="expenses" 
                                        fill={colors.secondary} 
                                        radius={[6, 6, 0, 0]} 
                                        barSize={range === '1W' ? 25 : undefined}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex items-center gap-6 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.primary }} />
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.sub }}>Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.secondary }} />
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.sub }}>Expenses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS SUMMARY */}
                <div className="px-5 grid grid-cols-2 gap-3 mb-6">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center mb-2">
                             <TrendingUp size={14} className="text-success" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted">Total Sales</p>
                        <h4 className="text-[16px] font-black mt-0.5 text-text-primary">Rs. {stats.totalSales.toLocaleString()}</h4>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${stats.profit >= 0 ? 'bg-success/10' : 'bg-error/10'}`}>
                             <TrendingUp size={14} className={stats.profit >= 0 ? 'text-success' : 'text-error rotate-180'} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted">{stats.profit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                        <h4 className="text-[16px] font-black mt-0.5" style={{ color: stats.profit >= 0 ? colors.profit : colors.loss }}>
                            Rs. {Math.abs(stats.profit).toLocaleString()}
                        </h4>
                    </motion.div>
                </div>

                {/* DAILY BREAKDOWN LIST */}
                <div className="px-5 mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-text-primary">Daily Breakdown</h3>
                        <p className="text-[10px] font-bold text-text-muted">{chartData.length} Days Activity</p>
                    </div>
                    
                    <div className="space-y-2.5">
                        {chartData.slice().reverse().map((day: any, idx) => {
                            const dailyProfit = day.sales - day.expenses - (day.cogs || 0);
                            const hasActivity = day.sales > 0 || day.expenses > 0;
                            
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={day.localDs}
                                    className={`p-4 rounded-2xl border transition-all ${hasActivity ? 'bg-card border-border shadow-sm' : 'bg-gray-50/50 dark:bg-white/5 border-transparent opacity-60'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <MarqueeText 
                                                text={day.name} 
                                                className="text-[13px] font-black" 
                                            />
                                            <span className="text-[10px] font-medium text-text-muted">{day.localDs}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-[#00E676]">Sales</p>
                                                <p className="text-[13px] font-black text-text-primary">Rs. {day.sales.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-[#FF5252]">Exp.</p>
                                                <p className="text-[13px] font-black text-text-primary">Rs. {day.expenses.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right min-w-[60px]">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Profit</p>
                                                <p className={`text-[13px] font-black ${dailyProfit >= 0 ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
                                                     {dailyProfit >= 0 ? '+' : '-'}{Math.abs(dailyProfit).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* EXPORT OPTIONS */}
                <div className="px-5 space-y-3 mb-10">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.2em] mb-4 text-center" style={{ color: colors.sub }}>Export Options</h3>
                    <div className="flex flex-col gap-4">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={sendToWhatsApp}
                            className="bg-[#25D366] text-white p-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 active:bg-[#1DA851] transition-colors"
                        >
                            <FileText size={20} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Send Audit To WhatsApp</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    </PageTransition>
);
};
