import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Bell, FileText, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { isToday, isThisWeek, isThisMonth, getLocalDateString } from '../utils/dateUtils';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { sales, expenses, udhaars, stock, profile } = useShop();
    const [activeTab, setActiveTab] = useState('Today');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showCustom, setShowCustom] = useState(false);

    // Removed window-resize listener that set unused chartWidth state — caused
    // page jitter on Android keyboard show/hide. Charts already use ResponsiveContainer.
    React.useEffect(() => {
        window.scrollTo(0, 0);
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

    if (activeTab === 'Today') {
      s = s.filter(item => isToday(item.date));
      e = e.filter(item => isToday(item.date));
      u = u.filter(item => isToday(item.date));
    } else if (activeTab === 'This Week') {
      s = s.filter(item => isThisWeek(item.date));
      e = e.filter(item => isThisWeek(item.date));
      u = u.filter(item => isThisWeek(item.date));
    } else if (activeTab === 'This Month') {
      s = s.filter(item => isThisMonth(item.date));
      e = e.filter(item => isThisMonth(item.date));
      u = u.filter(item => isThisMonth(item.date));
    } else if (activeTab === 'Custom' && customRange.start && customRange.end) {
      s = s.filter(item => {
        const d = getLocalDateString(item.date);
        return d >= customRange.start && d <= customRange.end;
      });
      e = e.filter(item => {
        const d = getLocalDateString(item.date);
        return d >= customRange.start && d <= customRange.end;
      });
      u = u.filter(item => {
        const d = getLocalDateString(item.date);
        return d >= customRange.start && d <= customRange.end;
      });
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
        // Build the last 7 calendar days (in LOCAL time) as fixed buckets.
        // Old code grouped by weekday name across all-time, so 5 Mondays collapsed
        // into one bar — totals were wildly wrong. Now we key by YYYY-MM-DD.
        const days: { key: string; name: string; date: Date }[] = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({ key, name: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d });
        }
        const buckets: Record<string, { name: string; income: number; expense: number; udhaar: number; profit: number }> = {};
        days.forEach(d => { buckets[d.key] = { name: d.name, income: 0, expense: 0, udhaar: 0, profit: 0 }; });

        const localKey = (dateStr: string): string | null => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        sales.forEach(s => {
            const k = localKey(s.date);
            if (k && buckets[k]) buckets[k].income += (Number(s.total) || 0);
        });
        expenses.forEach(e => {
            const k = localKey(e.date);
            if (k && buckets[k]) buckets[k].expense += (Number(e.amount) || 0);
        });
        udhaars.forEach(u => {
            const k = localKey(u.date);
            if (k && buckets[k]) buckets[k].udhaar += (Number(u.amount) || 0);
        });

        return days.map(d => {
            const b = buckets[d.key];
            return { ...b, profit: b.income - b.expense };
        });
    }, [sales, expenses, udhaars]);

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
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 0;

    const fmt = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
    const today = new Date();
    const periodLabel = activeTab === 'Custom' && customRange.start && customRange.end
      ? `${customRange.start} to ${customRange.end}`
      : activeTab;

    // ─── HEADER BAND ───────────────────────────────────────────────────────
    // Branded green band with shop name, owner, period.
    doc.setFillColor(10, 61, 36);
    doc.rect(0, 0, pageWidth, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(profile?.name || 'KiryanaBook', margin, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 230, 200);
    doc.text(`${profile?.owner || ''}${profile?.city ? ` · ${profile.city}` : ''}`, margin, 22);
    doc.setFontSize(8);
    doc.text(`${profile?.phone || ''}`, margin, 27);
    // Right side: report meta
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BUSINESS REPORT', pageWidth - margin, 14, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 230, 200);
    doc.text(`Period: ${periodLabel}`, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Generated: ${today.toLocaleString('en-PK')}`, pageWidth - margin, 25, { align: 'right' });
    yPos = 50;

    // ─── EXECUTIVE SUMMARY CARDS ───────────────────────────────────────────
    // 4 KPI boxes in a row — Revenue / Expenses / Profit / Udhaar.
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin, yPos);
    yPos += 4;
    const cardW = (contentWidth - 9) / 4;
    const cardH = 22;
    const cards = [
      { label: 'REVENUE', value: fmt(totalRevenue), color: [240, 248, 255], text: [10, 61, 36] },
      { label: 'EXPENSE', value: fmt(totalExpense), color: [255, 245, 245], text: [197, 34, 34] },
      { label: netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS', value: fmt(Math.abs(netProfit)), color: netProfit >= 0 ? [232, 250, 240] : [255, 235, 235], text: netProfit >= 0 ? [0, 130, 60] : [180, 0, 0] },
      { label: 'PENDING UDHAAR', value: fmt(udhaarPending), color: [255, 248, 235], text: [180, 100, 0] },
    ];
    cards.forEach((c, i) => {
      const x = margin + i * (cardW + 3);
      doc.setFillColor(c.color[0], c.color[1], c.color[2]);
      doc.roundedRect(x, yPos, cardW, cardH, 2, 2, 'F');
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(c.label, x + 3, yPos + 6);
      doc.setTextColor(c.text[0], c.text[1], c.text[2]);
      doc.setFontSize(11);
      doc.text(c.value, x + 3, yPos + 16);
    });
    yPos += cardH + 10;

    // ─── COMPUTED INSIGHTS ─────────────────────────────────────────────────
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const expenseRatio = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : 0;
    const debtorsList = [...udhaars].filter(u => u.amount > 0);
    const totalReceivable = debtorsList.reduce((s, u) => s + u.amount, 0);
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('KEY INSIGHTS', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const insights = [
      `Gross Margin:  ${grossMargin.toFixed(1)}%   (industry healthy: 20-35%)`,
      `Expense / Revenue:  ${expenseRatio.toFixed(1)}%   (lower is better)`,
      `Total Receivable from Customers:  ${fmt(totalReceivable)}  across ${debtorsList.length} debtor(s)`,
      `Best-selling SKU:  ${bestSelling[0]?.name || 'No sales yet'}${bestSelling[0] ? `  (${bestSelling[0].qty} units, ${fmt(bestSelling[0].rev)})` : ''}`,
    ];
    insights.forEach(line => { doc.text(`•  ${line}`, margin + 2, yPos); yPos += 5; });
    if (showCogsWarning) {
      doc.setTextColor(180, 100, 0);
      doc.text(`!  Cost of goods is Rs. 0 — set buying price for items to see real profit.`, margin + 2, yPos); yPos += 5;
    }
    yPos += 6;

    // ─── DAILY CASH FLOW ───────────────────────────────────────────────────
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DAILY CASH FLOW (Last 7 Days)', margin, yPos);
    yPos += 4;
    autoTable(doc, {
      startY: yPos,
      head: [['Day', 'Income', 'Expense', 'Net']],
      body: flowData.map(d => [
        d.name,
        fmt(d.income),
        fmt(d.expense),
        { content: fmt(d.income - d.expense), styles: { textColor: (d.income - d.expense) >= 0 ? [0, 130, 60] : [180, 0, 0] } }
      ]),
      theme: 'striped',
      headStyles: { fillColor: [10, 61, 36], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: margin, right: margin },
    });
    yPos = doc.lastAutoTable.finalY + 10;
    if (yPos > 240) { doc.addPage(); yPos = 20; }

    // ─── TOP PRODUCTS ──────────────────────────────────────────────────────
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP-SELLING PRODUCTS', margin, yPos);
    yPos += 4;
    if (bestSelling.length === 0) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(150);
      doc.text('No sales recorded for this period.', margin + 2, yPos + 4); yPos += 10;
    } else {
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Product', 'Qty Sold', 'Revenue', 'Avg / Unit']],
        body: bestSelling.map((p, i) => [
          i + 1, p.name, p.qty, fmt(p.rev), fmt(p.qty > 0 ? p.rev / p.qty : 0)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [10, 61, 36], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }
    if (yPos > 240) { doc.addPage(); yPos = 20; }

    // ─── TOP DEBTORS ───────────────────────────────────────────────────────
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP DEBTORS — Udhaar Pending', margin, yPos);
    yPos += 4;
    const debtorRows = topDebtors.filter(d => d.amount > 0);
    if (debtorRows.length === 0) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(150);
      doc.text('No outstanding udhaar — sab clear hai!', margin + 2, yPos + 4); yPos += 10;
    } else {
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Customer', 'Last Note', 'Amount Pending']],
        body: debtorRows.map((d, i) => [
          i + 1, d.customerName, d.note || '—', { content: fmt(d.amount), styles: { textColor: [197, 34, 34], fontStyle: 'bold' } }
        ]),
        theme: 'striped',
        headStyles: { fillColor: [197, 34, 34], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }
    if (yPos > 250) { doc.addPage(); yPos = 20; }

    // ─── LOW STOCK ALERTS ──────────────────────────────────────────────────
    const lowStock = stock.filter(s => (s.quantity || 0) <= (s.minThreshold || 5));
    if (lowStock.length > 0) {
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('LOW STOCK ALERTS', margin, yPos);
      yPos += 4;
      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Category', 'In Stock', 'Min Required']],
        body: lowStock.slice(0, 15).map(s => [s.name, s.category || '—', `${s.quantity || 0} ${s.unit || ''}`, `${s.minThreshold || 5}`]),
        theme: 'striped',
        headStyles: { fillColor: [180, 100, 0], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // ─── FOOTER ON EVERY PAGE ──────────────────────────────────────────────
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `KiryanaBook · ${profile?.name || 'Shop'} · Page ${p} of ${totalPages}`,
        margin,
        doc.internal.pageSize.getHeight() - 6
      );
      doc.text(
        `${today.toLocaleDateString('en-PK')}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'right' }
      );
    }

    const fileName = `KiryanaBook_${activeTab}_Report_${today.toISOString().slice(0, 10)}.pdf`;

    try {
      if (Capacitor.isNativePlatform()) {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: fileName.replace(/[^a-z0-9_.-]/gi, '_'),
          data: base64Data,
          directory: Directory.Documents,
        });
        
        await Share.share({
          title: 'KiryanaBook Report',
          text: `Financial overview for ${activeTab}`,
          url: savedFile.uri,
          dialogTitle: 'Share PDF Report'
        });
      } else {
        doc.save(fileName);
        toast.success("PDF Report Downloaded!");
      }
    } catch (e) {
      toast.error('Export failed');
    }
  };

  return (
    <PageTransition> 
      <div className="w-full transition-colors duration-300 font-outfit max-w-md mx-auto bg-background text-text-primary min-h-screen pb-40">
        
        {/* HEADER */}
        <div className="pt-page pb-4 px-5 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-xl z-sticky border-b border-border/10">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-primary active:scale-90 transition-transform">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-[20px] font-black tracking-tight uppercase">Reports Overview</h1>
            </div>
            <button 
                onClick={() => { setActiveTab('Custom'); setShowCustom(!showCustom); }}
                className={`flex items-center gap-2 border px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-all ${activeTab === 'Custom' ? 'border-primary bg-primary/10' : 'bg-card border-border'}`}
            >
                <Calendar size={16} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase">Custom</span>
            </button>
        </div>

        <div className="h-2" />

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
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                        activeTab === tab ? 'bg-primary text-black border-primary shadow-lg shadow-primary/10' : 'bg-card text-text-muted border-border'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div className="px-5 mt-6 grid grid-cols-2 gap-3">
            {[
                { label: 'Revenue', val: totalRevenue, color: '#4BFF94', icon: TrendingUp },
                { label: 'Expenses', val: totalExpense, color: '#FF5252', icon: TrendingDown },
                { 
                  label: netProfit >= 0 ? 'Net Profit' : 'Net Loss', 
                  val: Math.abs(netProfit), 
                  color: netProfit >= 0 ? (isDarkMode ? '#4BFF94' : '#0A3D24') : '#FF5252', 
                  icon: netProfit >= 0 ? ArrowUpRight : TrendingDown 
                },
                { label: 'Udhaar', val: udhaarPending, color: '#FB923C', icon: AlertTriangle }
            ].map((card, i) => (
                <div key={i} className="rounded-2xl p-4 shadow-sm border border-border bg-card relative overflow-hidden h-[95px] flex flex-col justify-center transition-all active:scale-95">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: card.color }} />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{card.label}</p>
                    <h3 className="text-[18px] font-black tabular-nums" style={{ color: card.color }}>Rs. {card.val.toLocaleString()}</h3>
                </div>
            ))}
        </div>

        {/* ── CASH FLOW (Grouped Bars for Clarity) ── */}
        <div className="px-5 mt-8">
            <h2 className="text-[14px] font-black tracking-widest uppercase mb-4 opacity-40">Cash Flow History</h2>
            <div className="h-72 w-full flex justify-center bg-card/30 rounded-3xl p-4 border border-border/5">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#222' : '#f0f0f0'} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fill: colors.sub, fontWeight: '900' }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fill: colors.sub, fontWeight: '900' }}
                            tickFormatter={(text) => text >= 1000 ? `${(text/1000).toFixed(0)}K` : text}
                        />
                        <Tooltip 
                            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                            contentStyle={{ 
                                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF', 
                                border: 'none', 
                                borderRadius: '16px', 
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 0' }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingBottom: '15px' }} />
                        <Bar dataKey="income" name="Revenue" fill="#4BFF94" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="udhaar" name="Udhaar" fill="#FB923C" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" name="Profit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-10 pb-60">
            {/* BEST SELLING */}
            <div className="px-5">
                <h2 className="text-[12px] font-black tracking-widest uppercase mb-4 opacity-40">Top Selling Products</h2>
                <div className="space-y-3">
                    {bestSelling.map((item, idx) => (
                        <div key={idx} className="rounded-2xl p-4 flex items-center justify-between border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                            <span className="text-[11px] font-black text-primary bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center"># {idx + 1}</span>
                            <span className="text-[14px] font-bold flex-1 px-4 truncate">{item.name}</span>
                            <span className="text-[14px] font-black text-primary">Rs.{item.rev.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* DEBTORS */}
            <div className="px-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[12px] font-black tracking-widest uppercase opacity-40">Top Debtors List</h2>
                    <button className="text-[10px] font-black uppercase text-primary border border-primary/20 px-4 py-1.5 rounded-xl active:scale-95 transition-all">Remind All</button>
                </div>
                <div className="space-y-3">
                    {topDebtors.map((deb, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-[12px] shadow-inner">{deb.customerName[0]}</div>
                                <span className="text-[14px] font-bold">{deb.customerName}</span>
                            </div>
                            <span className="text-[15px] font-black text-red-500">Rs.{deb.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COMPACT FLOATING DOWNLOAD - FIXED AT BOTTOM */}
        <div className="fixed bottom-6 left-0 right-0 px-6 z-[100] pointer-events-none">
            <button 
                onClick={exportToPDF}
                className="w-full max-w-[240px] mx-auto bg-primary text-black shadow-[0_20px_50px_rgba(75,255,148,0.3)] rounded-[2rem] py-5 flex items-center gap-3 justify-center pointer-events-auto active:scale-95 transition-all font-black text-[14px] uppercase tracking-widest border-4 border-white dark:border-[#0A0A0A]"
            >
                <FileText size={22} />
                <span>DOWNLOAD REPORT</span>
            </button>
        </div>
      </div>
    </PageTransition>
  );
};
