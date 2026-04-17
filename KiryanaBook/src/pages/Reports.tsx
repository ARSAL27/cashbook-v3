import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Calendar, Bell, FileText, FileSpreadsheet, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
   const { isDarkMode } = useTheme();
    const { sales, expenses, udhaars, stock } = useShop();
    const [activeTab, setActiveTab] = useState('Today');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showCustom, setShowCustom] = useState(false);

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

  // Income: All sales revenue (Cash + Udhaar) for business calculation
  const totalRevenue = useMemo(() => filteredData.s.reduce((sum, s) => sum + (s.total || 0), 0), [filteredData.s]);
  const totalExpense = useMemo(() => filteredData.e.reduce((sum, e) => sum + e.amount, 0), [filteredData.e]);
  
  // Calculate COGS - Cost of Items Sold
  const costOfSoldItems = useMemo(() => {
    let cost = 0;
    filteredData.s.forEach(sale => {
      sale.items?.forEach(i => {
         // Search by ID first, then by Name as fallback (case-insensitive)
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

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Sales Sheet
      const salesHeader = [["Date", "Payment Type", "Total Amount", "Items Sold"]];
      const salesRows = filteredData.s.map(s => [
        new Date(s.date).toLocaleDateString(),
        s.type.toUpperCase(),
        s.total,
        s.items?.map(i => `${i.name} (x${i.qty})`).join(', ') || 'None'
      ]);
      const salesWs = XLSX.utils.aoa_to_sheet([...salesHeader, ...salesRows]);
      XLSX.utils.book_append_sheet(wb, salesWs, "Sales History");

      // 2. Expenses Sheet
      const expenseHeader = [["Date", "Description", "Amount"]];
      const expenseRows = filteredData.e.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.description || 'N/A',
        e.amount
      ]);
      const expenseWs = XLSX.utils.aoa_to_sheet([...expenseHeader, ...expenseRows]);
      XLSX.utils.book_append_sheet(wb, expenseWs, "Expenses");

      // 3. Udhaar Sheet
      const udhaarHeader = [["Date", "Customer Name", "Pending Amount"]];
      const udhaarRows = filteredData.u.map(u => [
        new Date(u.date).toLocaleDateString(),
        u.customerName,
        u.amount
      ]);
      const udhaarWs = XLSX.utils.aoa_to_sheet([...udhaarHeader, ...udhaarRows]);
      XLSX.utils.book_append_sheet(wb, udhaarWs, "Udhaar Records");

      XLSX.writeFile(wb, `KiryanaBook_Audit_${activeTab}.xlsx`);
      toast.success("Excel report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Excel download failed.");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(10, 61, 36);
    doc.text(`Business Performance Audit: ${activeTab}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    // Table 1: Sales Summary
    doc.setFontSize(14);
    doc.setTextColor(10, 61, 36);
    doc.text('1. Sales Summary', 14, 40);
    autoTable(doc, {
        startY: 44,
        head: [['Date', 'Payment', 'Total Amount']],
        body: filteredData.s.map(s => [new Date(s.date).toLocaleDateString(), s.type.toUpperCase(), `Rs. ${s.total.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [10, 61, 36] }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // Table 2: Expenses
    doc.setFontSize(14);
    doc.text('2. Expense Records', 14, currentY);
    autoTable(doc, {
        startY: currentY + 4,
        head: [['Date', 'Description', 'Amount']],
        body: filteredData.e.map(e => [new Date(e.date).toLocaleDateString(), e.description || '-', `Rs. ${e.amount.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [197, 34, 34] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Table 3: Pending Udhaars
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.text('3. Udhaar / Credit Ledger', 14, currentY);
    autoTable(doc, {
        startY: currentY + 4,
        head: [['Customer Name', 'Pending Amount']],
        body: filteredData.u.map(u => [u.customerName, `Rs. ${u.amount.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [251, 146, 60] }
    });

    // FINAL TOTALS PAGE
    doc.addPage();
    doc.setFontSize(22);
    doc.setTextColor(10, 61, 36);
    doc.text('PERIOD FINANCIAL SUMMARY', 14, 30);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Total Sales (Revenue): Rs. ${totalRevenue.toLocaleString()}`, 20, 55);
    doc.text(`Total Expenses: Rs. ${totalExpense.toLocaleString()}`, 20, 68);
    doc.text(`Gross Profit: Rs. ${grossProfit.toLocaleString()}`, 20, 81);
    doc.text(`Net (After Expenses): Rs. ${netProfit.toLocaleString()}`, 20, 94);
    doc.text(`Pending Udhaar: Rs. ${udhaarPending.toLocaleString()}`, 20, 107);

    doc.save(`KiryanaBook_Audit_${activeTab}.pdf`);
    toast.success("Professional PDF audit report ready!");
  };

  return (
    <PageTransition>
      <div className="w-full transition-colors duration-300 font-outfit max-w-md mx-auto pb-8 bg-background text-text-primary">
        
        {/* ── HEADER ── */}
        <div className="px-5 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-inherit z-20">
            <h1 className="text-[22px] font-black tracking-tight text-text-primary">Reports Overview</h1>
            <button 
                onClick={() => { setActiveTab('Custom'); setShowCustom(!showCustom); }}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all ${activeTab === 'Custom' ? 'border-primary bg-primary/10' : 'bg-card border-border'}`}
            >
                <Calendar size={14} className="text-primary" />
                <span className="text-[10px] font-bold text-primary">Custom Date</span>
            </button>
        </div>

        {showCustom && (
            <div className="px-5 mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                    type="date" value={customRange.start} onChange={e => setCustomRange(p => ({ ...p, start: e.target.value }))}
                    className="flex-1 border border-border rounded-xl px-3 py-2 text-[12px] font-bold outline-none bg-card text-text-primary"
                />
                <input 
                    type="date" value={customRange.end} onChange={e => setCustomRange(p => ({ ...p, end: e.target.value }))}
                    className="flex-1 border border-border rounded-xl px-3 py-2 text-[12px] font-bold outline-none bg-card text-text-primary"
                />
            </div>
        )}

        {/* ── TABS ── */}
        <div className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['Today', 'This Week', 'This Month', 'Last Month'].map(tab => (
                <button 
                    key={tab} onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm border ${
                        activeTab === tab 
                          ? (isDarkMode ? 'bg-primary text-black border-primary' : 'bg-[#0A3D24] text-white border-transparent') 
                          : 'bg-card text-text-muted border-border'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* ── 4 SUMMARY CARDS ── */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="rounded-[1.25rem] p-4 shadow-sm border flex flex-col justify-between h-[100px] relative overflow-hidden transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4BFF94]" />
                <p className="text-[11px] font-bold opacity-80 pl-1" style={{ color: colors.sub }}>Total Sales (Revenue)</p>
                <div className="pl-1">
                    <h3 className="text-[20px] font-black leading-none mb-1" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>
                       Rs. {totalRevenue.toLocaleString()}
                    </h3>
                    <p className="text-[9px] font-bold text-[#4BFF94] flex items-center gap-0.5">
                        <TrendingUp size={10} /> 12% zyada
                    </p>
                </div>
            </div>
            
            {/* Expenses */}
            <div className="rounded-[1.25rem] p-4 shadow-sm border flex flex-col justify-between h-[100px] relative overflow-hidden transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                <p className="text-[11px] font-bold opacity-80 pl-1" style={{ color: colors.sub }}>Total Expenses</p>
                <div className="pl-1">
                    <h3 className="text-[20px] font-black leading-none mb-1" style={{ color: isDarkMode ? '#FF5252' : '#0A3D24' }}>
                        Rs. {totalExpense.toLocaleString()}
                    </h3>
                    <p className="text-[9px] font-bold text-red-500 flex items-center gap-0.5">
                        <TrendingDown size={10} /> 5% kam
                    </p>
                </div>
            </div>

            {/* Gross Profit */}
            <div className="rounded-[1.25rem] p-4 shadow-sm border flex flex-col justify-between h-[100px] relative overflow-hidden transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A3D24] dark:bg-[#00C853]" />
                <p className="text-[11px] font-bold opacity-80 pl-1" style={{ color: colors.sub }}>Gross Profit (Sales - Cost)</p>
                <div className="pl-1">
                    <h3 className="text-[20px] font-black leading-none mb-1" style={{ color: colors.text }}>
                        Rs. {grossProfit.toLocaleString()}
                    </h3>
                    {showCogsWarning ? (
                       <p className="text-[8px] font-black text-orange-500 flex items-center gap-0.5 leading-tight pr-2">
                          <AlertTriangle size={8} /> Cost missing
                       </p>
                    ) : (
                        <p className="text-[9px] font-bold flex items-center gap-0.5 leading-tight pr-2" style={{ color: colors.sub }}>
                            <ArrowUpRight size={10} /> Progress
                        </p>
                    )}
                </div>
            </div>

            {/* Udhaar Pending */}
            <div className="rounded-[1.25rem] p-4 shadow-sm border flex flex-col justify-between h-[100px] relative overflow-hidden transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
                <p className="text-[11px] font-bold opacity-80 pl-1" style={{ color: colors.sub }}>Udhaar Pending</p>
                <div className="pl-1">
                    <h3 className="text-[20px] font-black leading-none mb-1" style={{ color: isDarkMode ? '#FFB74D' : '#0A3D24' }}>
                        Rs. {udhaarPending.toLocaleString()}
                    </h3>
                    <p className="text-[9px] font-bold text-orange-400 flex items-center gap-0.5">
                        <AlertTriangle size={8} className="fill-orange-400 text-white" /> {debtorsCount} Debtors
                    </p>
                </div>
            </div>
        </div>

        {/* ── CASH FLOW CHART ── */}
        <div className="px-5 mt-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-black tracking-tight" style={{ color: colors.text }}>Cash Flow Analysis</h2>
                <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#4BFF94] rounded-sm" /><span className="text-[9px] font-bold" style={{ color: colors.sub }}>Income</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm" /><span className="text-[9px] font-bold" style={{ color: colors.sub }}>Expense</span></div>
                </div>
            </div>
            <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                    <LineChart data={flowData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#222' : '#f0f0f0'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: colors.sub, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: colors.sub, fontWeight: 'bold' }} tickFormatter={(val) => val === 0 ? '' : val >= 1000 ? `${val / 1000}K` : val} />
                        <Line type="monotone" dataKey="income" stroke="#4BFF94" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* ── TOP 5 BEST SELLING ── */}
        <div className="px-5 mt-10">
            <h2 className="text-[16px] font-black tracking-tight mb-4" style={{ color: colors.text }}>Top 5 Best Selling</h2>
            <div className="space-y-3">
                {bestSelling.map((item, idx) => (
                    <div key={idx} className="rounded-[1rem] p-4 flex items-center justify-between shadow-sm border transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                        <div className="flex items-center gap-4">
                            <span className="text-[12px] font-black italic" style={{ color: isDarkMode ? '#00E676' : '#0A3D24' }}>#{idx + 1}</span>
                            <span className="text-[13px] font-bold leading-none" style={{ color: colors.text }}>{item.name}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[13px] font-black leading-none mb-1" style={{ color: isDarkMode ? '#00E676' : '#0A3D24' }}>Rs.{item.rev.toLocaleString()}</p>
                            <p className="text-[9px] font-bold leading-none" style={{ color: colors.sub }}>{item.qty} Units</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* ── TOP 5 DEBTORS ── */}
        <div className="px-5 mt-10 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-black tracking-tight" style={{ color: colors.text }}>Top 5 Debtors</h2>
                <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform ${isDarkMode ? 'bg-[#00E676] text-black' : 'bg-[#0A3D24] text-white'}`}>
                    <Bell size={12} strokeWidth={3} />
                    <span className="text-[10px] font-bold">Remind All</span>
                </button>
            </div>
            
            <div className="space-y-0.5">
                {topDebtors.map((deb, idx) => {
                    const initials = deb.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                        <div key={idx} className="p-4 flex items-center justify-between last:border-0 rounded-xl mb-1 shadow-sm border transition-colors" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[13px] shadow-sm" style={{ backgroundColor: isDarkMode ? '#1A3D24' : '#E2FFED', color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>
                                    {initials}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold leading-none mb-1.5" style={{ color: colors.text }}>{deb.customerName}</span>
                                    <span className="text-[9px] font-bold text-gray-400 leading-none">Pending Payment</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[14px] font-black leading-none mb-1.5" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>Rs.{deb.amount.toLocaleString()}</p>
                                <button className="text-[8px] font-black uppercase tracking-widest leading-none active:opacity-50 transition-opacity" style={{ color: isDarkMode ? '#4BFF94' : '#0A3D24' }}>
                                    View Ledger
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* ── FLOATING DOWNLOAD BUTTONS ── */}
        <div className="fixed bottom-32 left-0 right-0 px-4 flex items-center justify-center gap-3 w-full max-w-md mx-auto pointer-events-none z-[90]">
            <button 
                onClick={exportToPDF}
                className="flex-1 bg-white border border-red-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-[#1A1111] dark:border-red-900/30 rounded-2xl py-3.5 flex items-center gap-2 justify-center pointer-events-auto active:scale-95 transition-all text-red-600 font-black text-[12px] uppercase tracking-wide"
            >
                <FileText size={16} />
                <span>PDF Download</span>
            </button>
            <button 
                onClick={exportToExcel}
                className="flex-1 bg-white border border-[#E2FFED] shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-[#111A14] dark:border-green-900/30 rounded-2xl py-3.5 flex items-center gap-2 justify-center pointer-events-auto active:scale-95 transition-all text-[#0A3D24] dark:text-[#4BFF94] font-black text-[12px] uppercase tracking-wide"
            >
                <FileSpreadsheet size={16} />
                <span>Excel Download</span>
            </button>
        </div>

      </div>
    </PageTransition>
  );
};
