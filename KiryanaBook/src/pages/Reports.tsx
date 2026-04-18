import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, Bell, FileText, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const Reports: React.FC = () => {
    const { isDarkMode } = useTheme();
    const { sales, expenses, udhaars, stock, profile } = useShop();
    const [activeTab, setActiveTab] = useState('Today');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showCustom, setShowCustom] = useState(false);
    const [chartWidth, setChartWidth] = useState(window.innerWidth - 40);

    React.useEffect(() => {
        const handleResize = () => setChartWidth(Math.min(window.innerWidth - 40, 400));
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

  const colors = {
    bg: isDarkMode ? '#0A0A0A' : '#FAFAFA',
    card: isDarkMode ? '#141414' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#0A3D24',
    sub: isDarkMode ? '#B0B0B0' : '#888888',
    border: isDarkMode ? '#2A2A2A' : '#F0F0F0'
  };

  const filteredData = useMemo(() => {
    let s = [...sales];
    let e = [...expenses];
    let u = [...udhaars];

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (activeTab === 'Today') {
      s = s.filter(item => item.date.startsWith(today));
      e = e.filter(item => item.date.startsWith(today));
      u = u.filter(item => item.date.startsWith(today));
    } else if (activeTab === 'This Week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      s = s.filter(item => item.date >= weekAgo);
      e = e.filter(item => item.date >= weekAgo);
      u = u.filter(item => item.date >= weekAgo);
    } else if (activeTab === 'This Month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      s = s.filter(item => item.date >= monthStart);
      e = e.filter(item => item.date >= monthStart);
      u = u.filter(item => item.date >= monthStart);
    } else if (activeTab === 'Custom' && customRange.start && customRange.end) {
      s = s.filter(item => item.date >= customRange.start && item.date <= customRange.end + 'T23:59:59');
      e = e.filter(item => item.date >= customRange.start && item.date <= customRange.end + 'T23:59:59');
      u = u.filter(item => item.date >= customRange.start && item.date <= customRange.end + 'T23:59:59');
    }

    return { s, e, u };
  }, [sales, expenses, udhaars, activeTab, customRange]);

  const totalRevenue = useMemo(() => filteredData.s.reduce((sum, s) => sum + (s.total || 0), 0), [filteredData.s]);
  const totalExpense = useMemo(() => filteredData.e.reduce((sum, e) => sum + e.amount, 0), [filteredData.e]);
  
  const costOfSoldItems = useMemo(() => {
    let cost = 0;
    filteredData.s.forEach(sale => {
      sale.items?.forEach(i => {
         const itemDetail = stock.find(st => st.id === i.itemId) || 
                          stock.find(st => st.name?.toLowerCase() === i.name?.toLowerCase());
         const bPrice = Number(itemDetail?.buyingPrice) || 0;
         cost += bPrice * i.qty;
      });
    });
    return cost;
  }, [filteredData.s, stock]);

  const grossProfit = totalRevenue - costOfSoldItems;
  const netProfit = grossProfit - totalExpense;
  const showCogsWarning = totalRevenue > 0 && costOfSoldItems === 0;
  const udhaarPending = useMemo(() => filteredData.u.reduce((sum: number, u) => sum + u.amount, 0), [filteredData.u]);
  const debtorsCount = new Set(filteredData.u.map(u => u.customerName)).size;

  const flowData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const dayIncome = sales.filter(s => s.date.startsWith(ds)).reduce((sum: number, s) => sum + s.total, 0);
        const dayExpense = expenses.filter(e => e.date.startsWith(ds)).reduce((sum: number, e) => sum + e.amount, 0);
        days.push({ name: dayName, income: dayIncome, expense: dayExpense });
    }
    return days;
  }, [sales, expenses]);

  const itemSalesCount: Record<string, { name: string, qty: number, rev: number }> = {};
  sales.forEach(s => {
      s.items?.forEach(req => {
          if (!itemSalesCount[req.itemId]) itemSalesCount[req.itemId] = { name: req.name, qty: 0, rev: 0 };
          itemSalesCount[req.itemId].qty += req.qty;
          itemSalesCount[req.itemId].rev += (req.qty * req.price);
      });
  });
  const bestSelling = Object.values(itemSalesCount).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const topDebtors = [...udhaars].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const exportToPDF = async () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(10, 61, 36);
    doc.text(`${profile?.name || 'KiryanaBook'} Audit: ${activeTab}`, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    autoTable(doc, {
        startY: 40,
        head: [['Date', 'Payment', 'Total Amount']],
        body: filteredData.s.map(s => [new Date(s.date).toLocaleDateString(), s.type.toUpperCase(), `Rs. ${s.total.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [10, 61, 36] }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;
    autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Description', 'Amount']],
        body: filteredData.e.map(e => [new Date(e.date).toLocaleDateString(), e.description || '-', `Rs. ${e.amount.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [197, 34, 34] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    autoTable(doc, {
        startY: currentY,
        head: [['Customer Name', 'Pending Amount']],
        body: filteredData.u.map(u => [u.customerName, `Rs. ${u.amount.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [251, 146, 60] }
    });

    doc.addPage();
    doc.setFontSize(22); doc.setTextColor(10, 61, 36);
    doc.text('FINANCIAL SUMMARY', 14, 30);
    doc.line(14, 35, 196, 35);
    doc.setFontSize(14); doc.setTextColor(0);
    doc.text(`Total Sales: Rs. ${totalRevenue.toLocaleString()}`, 20, 55);
    doc.text(`Total Expenses: Rs. ${totalExpense.toLocaleString()}`, 20, 68);
    doc.text(`Gross Profit: Rs. ${grossProfit.toLocaleString()}`, 20, 81);
    doc.text(`Net Profit: Rs. ${netProfit.toLocaleString()}`, 20, 94);
    doc.text(`Pending Udhaar: Rs. ${udhaarPending.toLocaleString()}`, 20, 107);

    const fileName = `KiryanaBook_${activeTab}_Report.pdf`;

    try {
      if (Capacitor.isNativePlatform()) {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });
        
        // Share via Native Share (opens WhatsApp choice)
        await Share.share({
          title: 'KiryanaBook Report',
          text: `Financial Audit Report for ${activeTab}`,
          url: savedFile.uri,
          dialogTitle: 'Share via WhatsApp'
        });
      } else {
        doc.save(fileName);
        toast.success("PDF Downloaded Successfully");
      }
    } catch (e) {
      toast.error('Share failed');
    }
  };

  return (
    <PageTransition> 
      <div className="w-full transition-colors duration-300 font-outfit max-w-md mx-auto bg-background text-text-primary min-h-screen pb-40">
        
        {/* COMPACTED HEADER */}
        <div className="pt-10 pb-3 px-5 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-20 border-b border-border/10">
            <h1 className="text-[18px] font-black tracking-tight uppercase">Reports Overview</h1>
            <button 
                onClick={() => { setActiveTab('Custom'); setShowCustom(!showCustom); }}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all ${activeTab === 'Custom' ? 'border-primary bg-primary/10' : 'bg-card border-border'}`}
            >
                <Calendar size={14} className="text-primary" />
                <span className="text-[9px] font-black text-primary uppercase">Custom</span>
            </button>
        </div>

        {showCustom && (
            <div className="px-5 mt-2 flex gap-2">
                <input 
                    type="date" value={customRange.start} onChange={e => setCustomRange(p => ({ ...p, start: e.target.value }))}
                    className="flex-1 border border-border rounded-xl px-3 py-2 text-[11px] font-bold bg-card"
                />
                <input 
                    type="date" value={customRange.end} onChange={e => setCustomRange(p => ({ ...p, end: e.target.value }))}
                    className="flex-1 border border-border rounded-xl px-3 py-2 text-[11px] font-bold bg-card"
                />
            </div>
        )}

        {/* ── TABS ── */}
        <div className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {['Today', 'This Week', 'This Month', 'Last Month'].map(tab => (
                <button 
                    key={tab} onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                        activeTab === tab ? 'bg-primary text-black border-primary' : 'bg-card text-text-muted border-border'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-2">
            {[
                { label: 'Revenue', val: totalRevenue, color: '#4BFF94', icon: TrendingUp },
                { label: 'Expenses', val: totalExpense, color: '#FF5252', icon: TrendingDown },
                { label: 'Net Profit', val: netProfit, color: isDarkMode ? '#4BFF94' : '#0A3D24', icon: ArrowUpRight },
                { label: 'Udhaar', val: udhaarPending, color: '#FB923C', icon: AlertTriangle }
            ].map((card, i) => (
                <div key={i} className="rounded-2xl p-4 shadow-sm border border-border bg-card relative overflow-hidden h-[90px] flex flex-col justify-center">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: card.color }} />
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">{card.label}</p>
                    <h3 className="text-[17px] font-black tabular-nums" style={{ color: card.color }}>Rs. {card.val.toLocaleString()}</h3>
                </div>
            ))}
        </div>

        {/* ── CASH FLOW ── */}
        <div className="px-5 mt-6">
            <h2 className="text-[14px] font-black tracking-widest uppercase mb-4 opacity-40">Cash Flow</h2>
            <div className="h-40 w-full flex justify-center">
                <LineChart width={chartWidth} height={160} data={flowData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#222' : '#f0f0f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: colors.sub, fontWeight: '900' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: colors.sub, fontWeight: '900' }} />
                    <Line type="monotone" dataKey="income" stroke="#4BFF94" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                </LineChart>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-8 pb-32">
            {/* BEST SELLING */}
            <div className="px-5">
                <h2 className="text-[12px] font-black tracking-widest uppercase mb-4 opacity-40">Top Performers</h2>
                <div className="space-y-2">
                    {bestSelling.map((item, idx) => (
                        <div key={idx} className="rounded-xl p-3 flex items-center justify-between border border-border bg-card">
                            <span className="text-[10px] font-black text-primary"># {idx + 1}</span>
                            <span className="text-[12px] font-bold flex-1 px-3 truncate">{item.name}</span>
                            <span className="text-[12px] font-black text-primary">Rs.{item.rev.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* DEBTORS */}
            <div className="px-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[12px] font-black tracking-widest uppercase opacity-40">Top Debtors</h2>
                    <button className="text-[9px] font-black uppercase text-primary border border-primary/20 px-3 py-1 rounded-lg">Remind All</button>
                </div>
                <div className="space-y-1">
                    {topDebtors.map((deb, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between rounded-xl border border-border bg-card">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">{deb.customerName[0]}</div>
                                <span className="text-[12px] font-bold">{deb.customerName}</span>
                            </div>
                            <span className="text-[13px] font-black text-red-500">Rs.{deb.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COMPACT FLOATING DOWNLOAD (EXCEL REMOVED) */}
        <div className="fixed bottom-32 left-0 right-0 px-6 z-[90] pointer-events-none">
            <button 
                onClick={exportToPDF}
                className="w-full max-w-[200px] mx-auto bg-primary text-black shadow-2xl rounded-2xl py-4 flex items-center gap-3 justify-center pointer-events-auto active:scale-95 transition-all font-black text-[12px] uppercase tracking-widest border-4 border-white dark:border-[#0A0A0A]"
            >
                <FileText size={18} />
                <span>Download Report</span>
            </button>
        </div>
      </div>
    </PageTransition>
  );
};
