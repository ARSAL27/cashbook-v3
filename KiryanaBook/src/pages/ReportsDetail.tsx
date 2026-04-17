import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsDetail: React.FC = () => {
    const { sales, expenses, profile } = useShop();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [range, setRange] = useState<'1W' | '1M' | '1Y'>('1W');
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
        const days = range === '1W' ? 7 : range === '1M' ? 30 : 365;
        const step = range === '1Y' ? 30 : 1; // Monthly points if 1 year

        for (let i = days - 1; i >= 0; i -= step) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            
            let label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            if (range === '1Y') label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            const dailySales = sales
                .filter(s => s.date.startsWith(ds))
                .reduce((sum, s) => sum + s.total, 0);
            
            const dailyExpenses = expenses
                .filter(e => e.date.startsWith(ds))
                .reduce((sum, e) => sum + e.amount, 0);

            data.push({ name: label, sales: dailySales, expenses: dailyExpenses, date: ds });
        }
        return data;
    }, [sales, expenses, range]);

    const stats = useMemo(() => {
        const totalSales = chartData.reduce((a, b) => a + b.sales, 0);
        const totalExpenses = chartData.reduce((a, b) => a + b.expenses, 0);
        const profit = totalSales - totalExpenses;
        return { totalSales, totalExpenses, profit };
    }, [chartData]);

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(chartData.map(d => ({
            Date: d.date,
            'Total Sales (Rs)': d.sales,
            'Total Expenses (Rs)': d.expenses,
            'Net Profit (Rs)': d.sales - d.expenses
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reports");
        XLSX.writeFile(wb, `Report_${range}_${new Date().getTime()}.xlsx`);
        toast.success("Excel file download ho rahi hai!");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`${profile?.name || 'My Shop'} - Detailed Report`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Range: ${range === '1W' ? 'Last 7 Days' : range === '1M' ? 'Last 30 Days' : 'Last Year'}`, 14, 32);
        
        const tableBody = chartData.map(d => [d.date, d.sales.toLocaleString(), d.expenses.toLocaleString(), (d.sales - d.expenses).toLocaleString()]);
        
        autoTable(doc, {
            startY: 40,
            head: [['Date', 'Sales (Rs)', 'Expenses (Rs)', 'Profit (Rs)']],
            body: tableBody,
            headStyles: { fillColor: [10, 61, 36], textColor: [255, 255, 255] },
        });

        doc.save(`Report_${range}_${new Date().getTime()}.pdf`);
        toast.success("PDF file download ho rahi hai!");
    };

    const colors = {
        primary: isDarkMode ? '#00E676' : '#0A3D24',
        secondary: isDarkMode ? '#FF5252' : '#EF4444',
        bg: isDarkMode ? '#0A0A0A' : '#FAFAFA',
        card: isDarkMode ? '#141414' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        sub: isDarkMode ? '#B0B0B0' : '#6B7280'
    };

    return (
        <PageTransition>
            <div className="w-full font-outfit max-w-md mx-auto bg-background text-text-primary pb-32">
                {/* HEADER */}
                <div className="pt-12 pb-3 px-5 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-card shadow-sm border border-border text-text-primary active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[17px] font-black text-text-primary">Detailed Hisaab</h1>
                    <div className="w-10" />
                </div>

                {/* RANGE TOGGLE */}
                <div className="px-5 mb-6">
                    <div className="bg-gray-100 dark:bg-[#1A1A1A] p-1.5 rounded-2xl flex gap-1 shadow-inner">
                        {(['1W', '1M', '1Y'] as const).map(r => (
                            <button 
                                key={r} onClick={() => setRange(r)}
                                className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${range === r ? 'bg-white dark:bg-[#2A2A2A] shadow-md scale-[1.02] text-[#0A3D24] dark:text-[#00E676]' : 'text-gray-400 opacity-60'}`}
                            >
                                {r === '1W' ? '1 Hafta' : r === '1M' ? '1 Mahina' : '1 Saal'}
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

                        <div className="h-60 w-full mb-4 flex justify-center">
                            <AreaChart width={chartWidth} height={240} data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={colors.secondary} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#2A2A2A' : '#F3F4F6'} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fill: colors.sub, fontWeight: 700 }}
                                    interval={range === '1W' ? 0 : range === '1M' ? 5 : 2}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fill: colors.sub, fontWeight: 700 }}
                                    tickFormatter={(val) => val >= 1000 ? `${val/1000}K` : val}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: colors.card, border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke={colors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="expenses" stroke={colors.secondary} strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </div>

                        <div className="flex items-center gap-6 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.sub }}>Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1.5 rounded-full border border-dashed" style={{ borderColor: colors.secondary }} />
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.sub }}>Expenses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS SUMMARY */}
                <div className="px-5 grid grid-cols-2 gap-3 mb-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-card border border-border shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">Total Sales</p>
                        <h4 className="text-[18px] font-black mt-1 text-text-primary">Rs. {stats.totalSales.toLocaleString()}</h4>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-3xl bg-card border border-border shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">Net Profit</p>
                        <h4 className="text-[18px] font-black mt-1" style={{ color: stats.profit >= 0 ? colors.primary : colors.secondary }}>Rs. {stats.profit.toLocaleString()}</h4>
                    </motion.div>
                </div>

                {/* EXPORT OPTIONS */}
                <div className="px-5 space-y-3">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.2em] mb-4 text-center" style={{ color: colors.sub }}>Export Options</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToPDF}
                            className="bg-red-500 text-white p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-xl shadow-red-500/20 active:bg-red-600 transition-colors"
                        >
                            <FileText size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-widest">PDF Report</span>
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToExcel}
                            className="bg-[#1A5C38] dark:bg-[#00E676] text-white dark:text-black p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-xl shadow-green-500/20 active:opacity-90 transition-all"
                        >
                            <FileSpreadsheet size={28} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Excel Sheet</span>
                        </motion.button>
                    </div>
                </div>

                {/* PRINT BUTTON */}
                <div className="px-5 mt-6">
                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.print()}
                        className="w-full bg-white dark:bg-[#1E1E1E] border-2 border-dashed dark:border-[#333] p-5 rounded-[2rem] flex items-center justify-center gap-3 text-gray-400 font-black text-[12px] uppercase tracking-widest active:bg-gray-50 transition-colors"
                    >
                        <Download size={18} />
                        Print Full Detailed Report
                    </motion.button>
                </div>
            </div>
        </PageTransition>
    );
};
