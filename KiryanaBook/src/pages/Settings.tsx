import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Store, ChevronRight, Database, FileText, Moon, Crown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import toast from 'react-hot-toast';


export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {} = useAuth();
  const { profile, sales, expenses, stock, contacts, invoices, udhaars, staff, activities, notifications } = useShop();
  const { setMode, isDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [backupFreq, setBackupFreq] = React.useState(localStorage.getItem('backup_freq') || '24h');
  const storageUsed = React.useMemo(() => {
    // Use Blob for accurate byte count (not character count) across ALL collections
    const allData = { sales, expenses, stock, contacts, invoices, udhaars, staff, activities, notifications };
    const bytes = new Blob([JSON.stringify(allData)]).size;
    if (bytes >= 1024 * 1024) return { value: (bytes / (1024 * 1024)).toFixed(2), unit: 'MB' };
    return { value: (bytes / 1024).toFixed(1), unit: 'KB' };
  }, [sales, expenses, stock, contacts, invoices, udhaars, staff, activities, notifications]);

  const generateAuditSuggestions = () => {
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    let cogs = 0;
    sales.forEach(s => {
        if(s.items) {
            s.items.forEach(i => {
                const st = stock.find(x => x.id === i.itemId);
                const unitCost = st?.buyingPrice ? st.buyingPrice : (i.price * 0.8);
                cogs += unitCost * i.qty;
            });
        } else {
          cogs += s.total * 0.8;
        }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = revenue - cogs - totalExpenses;
    const netMarginPercent = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0.0';
    
    const totalStockValue = stock.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const deadStockValue = stock.filter(s => (s.soldCount || 0) === 0).reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const deadStockPercent = totalStockValue > 0 ? ((deadStockValue / totalStockValue) * 100).toFixed(1) : '0';
    
    const udhaarSales = sales.filter(s => s.type !== 'cash').reduce((sum, s) => sum + s.total, 0);
    const cashSales = sales.filter(s => s.type === 'cash').reduce((sum, s) => sum + s.total, 0);
    const avgBill = sales.length > 0 ? Math.round(revenue / sales.length) : 0;
    const topDebtors = [...udhaars].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const fastMoving = [...stock].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5);

    const suggestions = [];
    if (parseFloat(deadStockPercent) > 10) suggestions.push(`- Dead stock (${deadStockPercent}%) ko clearance sale par lagayen.`);
    if (udhaarSales > cashSales) suggestions.push('- Market mein udhaar barh raha hai. Purani wasooli tez karein.');
    if (parseFloat(netMarginPercent) < 15) suggestions.push('- Profit margin kam hai. Expenses kam karein.');
    if (avgBill < 3000) suggestions.push('- Average bill kam hai. Counter pe chocolates rakhen.');
    if (topDebtors.length > 0 && topDebtors[0].amount > 10000) suggestions.push(`- ${topDebtors[0].customerName} se payment ka mutalba karein.`);
    if (fastMoving.length > 0 && (fastMoving[0].quantity || 0) < 10) suggestions.push(`- Aapka best item (${fastMoving[0].name}) khatam hone wala hai.`);
    
    return suggestions.join('\n');
  };

  const handleWhatsAppAudit = () => {
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - totalExpenses;

    const suggestionsStr = generateAuditSuggestions();
    const msg = `*${profile?.name || 'Shop'} - Business Audit* 📊\n\n` 
      + `*Kul Sale:* Rs. ${revenue.toLocaleString()}\n` 
      + `*Kul Kharchay:* Rs. ${totalExpenses.toLocaleString()}\n` 
      + `*Net Profit:* Rs. ${profit.toLocaleString()}\n\n` 
      + `*Manager Suggestions:*\n${suggestionsStr ? suggestionsStr.replace(/^- /gm, '• ') : '• Business stable hai.'}\n\n` 
      + `_KiryanaBook AI Audit_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;

    // --- Data Calculations ---
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    
    // Calculate COGS approximately (using buyingPrice if available, else 80% of selling price)
    let cogs = 0;
    sales.forEach(s => {
        if(s.items) {
            s.items.forEach(i => {
                const st = stock.find(x => x.id === i.itemId);
                const unitCost = st?.buyingPrice ? st.buyingPrice : (i.price * 0.8);
                cogs += unitCost * i.qty;
            });
        } else {
            cogs += s.total * 0.8;
        }
    });
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0.0';

    // Inventory Analysis
    const sortedBySales = [...stock].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    const fastMoving = sortedBySales.slice(0, 5);
    const slowDead = sortedBySales.filter(s => (s.soldCount || 0) === 0 && s.quantity > 0).slice(0, 5);
    const deadStockValue = stock.filter(s => (s.soldCount || 0) === 0).reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const totalStockValue = stock.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const deadStockPercent = totalStockValue > 0 ? ((deadStockValue / totalStockValue) * 100).toFixed(1) : '0';

    // Sales Analysis
    const cashSales = sales.filter(s => s.type === 'cash').reduce((sum, s) => sum + s.total, 0);
    const udhaarSales = sales.filter(s => s.type !== 'cash').reduce((sum, s) => sum + s.total, 0);
    const avgBill = sales.length > 0 ? Math.round(revenue / sales.length) : 0;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 61, 36);
    doc.text(profile?.name || 'KiryanaBook Ledger', margin, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Comprehensive All-Time Business Audit | ${new Date().toLocaleDateString()}`, margin, 28);
    doc.setDrawColor(200);
    doc.line(margin, 32, pageWidth - margin, 32);

    let yPos = 42;

    // 1. FINANCIAL SNAPSHOT
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('1. Financial Snapshot', margin, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total Revenue: Rs. ${Math.round(revenue).toLocaleString()}`, margin + 5, yPos); yPos += 6;
    doc.text(`Cost of Goods (Est.): Rs. ${Math.round(cogs).toLocaleString()}`, margin + 5, yPos); yPos += 6;
    doc.text(`Total Expenses: Rs. ${Math.round(totalExpenses).toLocaleString()}`, margin + 5, yPos); yPos += 6;
    doc.setFontSize(12);
    doc.setFont('', 'bold');
    if (netProfit >= 0) {
        doc.setTextColor(10, 61, 36);
        doc.text(`Net Profit: Rs. ${Math.round(netProfit).toLocaleString()}`, margin + 5, yPos);
    } else {
        doc.setTextColor(197, 34, 34);
        doc.text(`Net Loss: Rs. ${Math.round(Math.abs(netProfit)).toLocaleString()}`, margin + 5, yPos);
    }
    yPos += 8;
    
    // Audit Check
    doc.setFontSize(10);
    const marginVal = parseFloat(netMarginPercent);
    if (marginVal < 0) doc.setTextColor(197, 34, 34); // Red
    else if (marginVal < 10) doc.setTextColor(180, 100, 0); // Orange/Brown
    else if (marginVal < 30) doc.setTextColor(10, 61, 36); // Dark Green
    else doc.setTextColor(0, 150, 0); // Bright Green

    const advice = marginVal < 0 ? 'Karobar loss mein hai, kharchay kam karein!' 
                  : marginVal < 10 ? 'Margin bohat kam hai, prices aur expenses check karein.'
                  : marginVal < 30 ? 'Margin OK hai. Isey 30% tak le jaane ki koshish karein.'
                  : 'Masha\'Allah! Margin bohat zabardast (Good) hai.';

    doc.text(`Audit Check: Net Margin is ~${netMarginPercent}%. ${advice}`, margin + 5, yPos);
    yPos += 15;

    // 2. INVENTORY AUDIT
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.setFont('', 'normal');
    doc.text('2. Inventory Audit (Fast & Slow Movers)', margin, yPos);
    yPos += 6;

    autoTable(doc, {
        head: [['Fast-Moving Products', 'Sold', 'Slow/Dead Stock']],
        body: Array.from({ length: 5 }).map((_, i) => [
            fastMoving[i]?.name || '-', 
            fastMoving[i]?.soldCount || '-', 
            slowDead[i]?.name || '-'
        ]),
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [43, 110, 75] }
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setTextColor(197, 34, 34);
    const deadNames = sortedBySales.filter(s => (s.soldCount || 0) === 0 && s.quantity > 0).map(s => s.name).slice(0, 3).join(', ');
    const deadMsg = `Audit Check: Aapke paas Rs. ${deadStockValue.toLocaleString()} ka dead stock pada hai (${deadStockPercent}%). ${deadNames ? `(Items: ${deadNames}${deadStockValue > 0 ? '...' : ''})` : ''}`;
    doc.text(deadMsg, margin + 5, yPos);
    yPos += 15;

    // 3. SALES AUDIT
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('3. Sales Audit', margin, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total Cash Sales: Rs. ${cashSales.toLocaleString()}`, margin + 5, yPos); yPos += 6;
    doc.text(`Total Udhaar Sales: Rs. ${udhaarSales.toLocaleString()}`, margin + 5, yPos); yPos += 6;
    doc.text(`Average Bill Value: Rs. ${avgBill.toLocaleString()}`, margin + 5, yPos); yPos += 8;
    doc.setFontSize(10);
    if (avgBill > 5000) doc.setTextColor(0, 150, 0); // Green
    else doc.setTextColor(197, 34, 34); // Red

    const avgAdvice = avgBill > 5000 ? 'Masha\'Allah, average sale achi hai!' : 'Isey mazeed barhane ki koshish karein.';
    doc.text(`Audit Check: Har customer se average Rs. ${avgBill.toLocaleString()} ki sale ho rahi hai. ${avgAdvice}`, margin + 5, yPos);
    yPos += 15;

    // 4. SHOP LAYOUT & RECOMMENDATIONS
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('4. Final Recommendations & Layout Audit', margin, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text('-> Kya running/fast-moving items pehle counter par hain?', margin + 5, yPos); yPos += 6;
    doc.text('-> Kya chocolates/snacks jesi impulse items customer ke samne hain?', margin + 5, yPos); yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(10, 61, 36);
    doc.setFont('', 'bold');
    doc.text('Action Plan (AI Suggestions):', margin + 5, yPos); yPos += 6;
    doc.setFont('', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40);
    const suggestionsStr = generateAuditSuggestions();
    if (!suggestionsStr) {
        doc.text('- Business stable hai. Customer loyalty programs par kaam karein.', margin + 5, yPos); yPos += 6;
    } else {
        suggestionsStr.split('\n').slice(0, 5).forEach(s => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(s, margin + 5, yPos); yPos += 6;
        });
    }

    const fileName = `Audit_${Date.now()}.pdf`;

    const toastId = toast.loading('Report tayyar ho rahi hai...');
    try {
      if (Capacitor.isNativePlatform()) {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1];
        
        // Write to Cache directory for easier sharing
        const savedFile = await Filesystem.writeFile({
          path: fileName.replace(/[^a-z0-9_.-]/gi, '_'),
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'Business Audit Report',
          text: 'Business History & Detailed Audit Report',
          url: savedFile.uri,
          dialogTitle: 'Open Audit Report'
        });
        toast.success('Report ready hai!', { id: toastId });
      } else {
        doc.save(fileName);
        toast.success('Report Download ho gai!', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Report generating mein masla aaya.', { id: toastId });
    }
  };









  // Switch Toggle Component
  const Toggle = ({ active, onClick }: { active: boolean, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-10 h-5 md:w-11 md:h-6 rounded-full relative transition-all duration-300 ${active ? (isDarkMode ? 'bg-[#00C853]' : 'bg-[#0A3D24]') : (isDarkMode ? 'bg-[#2A2A2A]' : 'bg-gray-200')} flex items-center shadow-inner`}
    >
        <motion.div 
            animate={{ x: active ? (typeof window !== 'undefined' && window.innerWidth >= 768 ? 22 : 20) : 2 }} 
            className="w-4 h-4 rounded-full bg-white shadow-md" 
        />
    </button>
  );

  return (
    <PageTransition> <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] font-outfit max-w-md mx-auto transition-colors duration-300 h-screen overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="pt-page pb-3 sticky top-0 z-sticky transition-colors duration-300 px-5 flex items-center gap-4 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm shrink-0">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border shadow-sm active:scale-95 transition-all text-text-primary">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-text-primary font-black text-[18px] tracking-tight">{t('settings')}</h1>
        </div>

        <div className="flex-1 px-5 py-2 space-y-3 overflow-hidden">
            
            {/* SHOP PROFILE CARD */}
            <section>
                <div 
                  className="relative overflow-hidden rounded-[1.5rem] p-4 border shadow-md transition-all active:scale-[0.98]"
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #10251A 0%, #0A0A0A 100%)' 
                      : 'linear-gradient(135deg, #0A3D24 0%, #1A5C38 100%)',
                    borderColor: isDarkMode ? '#2E4A35' : 'transparent'
                  }}
                  onClick={() => navigate('/profile-settings')}
                >
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-[50px] h-[50px] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                            {profile?.logoUrl ? (
                                <img src={profile.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={24} className="text-[#4BFF94]" strokeWidth={2.5} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-[15px] font-black text-white leading-tight mb-0.5 truncate">
                              {profile?.name || 'My Shop'}
                            </h2>
                            <div className="flex items-center gap-1.5 text-white/60 mb-0.5">
                                <User size={9} strokeWidth={3} />
                                <span className="text-[9px] font-bold uppercase tracking-wider truncate">{profile?.owner || 'Setup Owner'}</span>
                            </div>
                            <div className="inline-flex items-center px-1 py-0.5 bg-[#4BFF94] text-[#0A3D24] rounded-md">
                                <span className="text-[7px] font-black uppercase tracking-widest">{profile?.plan || 'Free'}</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-white/40" />
                    </div>
                </div>
            </section>

            {/* QUICK STATS / STORAGE */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-card border border-border/60 rounded-3xl p-4 shadow-sm">
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-2.5">
                        <Database size={16} strokeWidth={2.5} />
                    </div>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Storage</p>
                    <h4 className="text-[14px] font-black text-text-primary">{storageUsed.value} <span className="text-[9px] opacity-40">{storageUsed.unit}</span></h4>
                </div>
                <div className="bg-card border border-border/60 rounded-3xl p-4 shadow-sm">
                    <div className="w-8 h-8 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-2.5">
                        <Crown size={16} strokeWidth={2.5} />
                    </div>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Plan</p>
                    <h4 className="text-[14px] font-black text-text-primary">{profile?.plan?.toUpperCase() || 'FREE'}</h4>
                </div>
            </div>

            {/* SETTINGS GROUPS */}
            <div className="space-y-4">
                {/* ── DATA & EXPORTS ── */}
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mt-4 opacity-50">Reports & Data</h3>
                <div className="bg-card border border-border/60 rounded-[1.8rem] p-4 shadow-sm">
                    <button onClick={handleExportPDF} className="w-full bg-red-500/10 text-red-600 rounded-2xl py-4 flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 transition-all">
                        <FileText size={20} strokeWidth={2.5} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Full Audit PDF</span>
                    </button>
                </div>

                {/* ── PREFERENCES ── */}
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mt-4 opacity-50">Preferences</h3>
                <div className="bg-card border border-border/60 rounded-[1.8rem] p-4 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-500/10 text-gray-500 rounded-xl flex items-center justify-center">
                                <Moon size={18} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-black text-text-primary leading-tight">{t('dark_mode')}</p>
                                <p className="text-[9px] font-bold text-text-muted opacity-60 uppercase tracking-tight">Sleek style</p>
                            </div>
                        </div>
                        <Toggle active={isDarkMode} onClick={() => setMode(isDarkMode ? 'light' : 'dark')} />
                    </div>

                </div>
            </div>

            {/* ── SUPPORT & LEGAL ── */}
            <div className="pt-2 space-y-2">
                <button onClick={() => navigate('/help')} className="w-full flex items-center justify-between p-3 bg-card/40 rounded-xl border border-border/40 active:scale-[0.98] transition-all">
                    <span className="text-[11px] font-black uppercase tracking-widest text-text-muted">Help & Support</span>
                    <ChevronRight size={14} className="opacity-20" />
                </button>
                <div className="text-center py-2">
                    <p className="text-[9px] font-black text-text-muted opacity-30 uppercase tracking-[0.3em]">KiryanaBook v3.4 PRO</p>
                    <p className="text-[8px] font-bold text-text-muted opacity-20 uppercase tracking-widest mt-1">© 2026 Indus Ledger Tech</p>
                </div>
            </div>


        </div>
      </div>
    </PageTransition>
  );
};
