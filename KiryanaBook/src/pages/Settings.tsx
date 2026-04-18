import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Store, ChevronRight, Database, FileText, Moon, Crown } from 'lucide-react';
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



export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {} = useAuth();
  const { profile, sales, expenses, stock, contacts, invoices } = useShop();
  const { setMode, isDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const storageUsed = React.useMemo(() => {
    const dataSize = JSON.stringify({ sales, expenses, stock, contacts, invoices }).length;
    return (dataSize / (1024)).toFixed(1); // KB
  }, [sales, expenses, stock, contacts, invoices]);





  const handleExportPDF = async () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 61, 36);
    doc.text(profile?.name || 'KiryanaBook Ledger', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Full Business Audit | ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    
    // Line Separator
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    // SECTION 1: SALES
    doc.setFontSize(14);
    doc.setTextColor(10, 61, 36);
    doc.text('1. Sales Transaction History', 14, 42);
    
    const salesData = sales.map(s => [
        new Date(s.date).toLocaleDateString(), 
        s.type.toUpperCase(), 
        `Rs. ${s.total.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Payment', 'Amount']],
      body: salesData,
      startY: 46,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [10, 61, 36], textColor: [255, 255, 255] }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // SECTION 2: EXPENSES
    doc.setFontSize(14);
    doc.text('2. Business Expenses', 14, currentY);
    
    const expensesData = expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.description || 'N/A',
        `Rs. ${e.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [['Date', 'Description', 'Amount']],
      body: expensesData,
      startY: currentY + 4,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [197, 34, 34], textColor: [255, 255, 255] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // NEW PAGE FOR NEXT SECTIONS IF NEEDED
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // SECTION 3: STOCK INVENTORY
    doc.setFontSize(14);
    doc.text('3. Current Stock Inventory', 14, currentY);
    
    const stockData = stock.map(s => [
        s.name,
        `Rs. ${s.price.toLocaleString()}`,
        `${s.quantity} ${s.unit}`,
        `Rs. ${(s.price * s.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [['Item Name', 'Price', 'Qty', 'Value']],
      body: stockData,
      startY: currentY + 4,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // SECTION 4: CUSTOMERS & UDHAAR
    doc.setFontSize(14);
    doc.text('4. Customer Ledger (Total Balance)', 14, currentY);
    
    const contactData = contacts.map(c => [
        c.name,
        c.phone || '-',
        c.type.toUpperCase(),
        `Rs. ${(c.initialBalance || 0).toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [['Customer', 'Phone', 'Type', 'Balance']],
      body: contactData,
      startY: currentY + 4,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
    });

    // FINAL SUMMARY
    doc.addPage();
    doc.setFontSize(22);
    doc.setTextColor(10, 61, 36);
    doc.text('FINAL PERFORMANCE SUMMARY', 14, 30);
    
    doc.setDrawColor(10, 61, 36);
    doc.setLineWidth(1);
    doc.line(14, 35, 196, 35);

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalStockValue = stock.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const totalUdhaar = contacts.reduce((sum, c) => sum + (c.type === 'customer' ? (c.initialBalance || 0) : 0), 0);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`TOTAL REVENUE (SALES): Rs. ${totalSales.toLocaleString()}`, 20, 50);
    doc.text(`TOTAL BUSINESS EXPENSES: Rs. ${totalExpenses.toLocaleString()}`, 20, 60);
    doc.text(`CURRENT STOCK ASSETS: Rs. ${totalStockValue.toLocaleString()}`, 20, 70);
    doc.text(`TOTAL PENDING UDHAAR: Rs. ${totalUdhaar.toLocaleString()}`, 20, 80);

    const fileName = `${profile?.name || 'KiryanaBook'}_FullAudit.pdf`;

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
          title: 'KiryanaBook Audit Report',
          text: 'Here is your PDF Report',
          url: savedFile.uri,
          dialogTitle: 'Save or Share PDF'
        });
        
        import('react-hot-toast').then(t => t.default.success('Full Professional Audit Report Generated!'));
      } else {
        doc.save(fileName);
        import('react-hot-toast').then(t => t.default.success('Full Professional Audit Report Generated!'));
      }
    } catch (error) {
      console.error(error);
      import('react-hot-toast').then(t => t.default.error('PDF export failed.'));
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
    <PageTransition> <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] font-outfit max-w-md mx-auto transition-colors duration-300 min-h-screen ">
        {/* HEADER */}
        <div className="pt-12 pb-3 sticky top-0 z-50 transition-colors duration-300 px-5 flex items-center gap-4 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border shadow-sm active:scale-95 transition-all text-text-primary">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-text-primary font-black text-[18px] tracking-tight">{t('settings')}</h1>
        </div>

        <div className="px-5 py-6 space-y-8">
            
            {/* SHOP PROFILE CARD */}
            <section>
                <div 
                  className="relative overflow-hidden rounded-[1.8rem] p-5 border shadow-xl transition-all active:scale-[0.98]"
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #10251A 0%, #0A0A0A 100%)' 
                      : 'linear-gradient(135deg, #0A3D24 0%, #1A5C38 100%)',
                    borderColor: isDarkMode ? '#2E4A35' : 'transparent'
                  }}
                  onClick={() => navigate('/profile-settings')}
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-[60px] h-[60px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl shrink-0 overflow-hidden">
                            {profile?.logoUrl ? (
                                <img src={profile.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={28} className="text-[#4BFF94]" strokeWidth={2.5} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-[17px] font-black text-white leading-tight mb-0.5 truncate">
                              {profile?.name || 'My Shop'}
                            </h2>
                            <div className="flex items-center gap-1.5 text-white/60 mb-1">
                                <User size={10} strokeWidth={3} />
                                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{profile?.owner || 'Setup Owner'}</span>
                            </div>
                            <div className="inline-flex items-center px-1.5 py-0.5 bg-[#4BFF94] text-[#0A3D24] rounded-md">
                                <span className="text-[8px] font-black uppercase tracking-widest">{profile?.plan || 'Free'}</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-white/40" />
                    </div>
                </div>
            </section>

            {/* QUICK STATS / STORAGE */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border/60 rounded-3xl p-4 shadow-sm">
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-2.5">
                        <Database size={16} strokeWidth={2.5} />
                    </div>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Storage</p>
                    <h4 className="text-[14px] font-black text-text-primary">{storageUsed} <span className="text-[9px] opacity-40">KB</span></h4>
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
                <div className="bg-card border border-border/60 rounded-[1.8rem] p-4 space-y-4 shadow-sm">
                    <div className="flex gap-3">
                        <button onClick={handleExportPDF} className="w-full bg-red-500/10 text-red-600 rounded-2xl py-4 flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 transition-all">
                            <FileText size={20} strokeWidth={2.5} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Full Audit PDF</span>
                        </button>
                    </div>
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
            <div className="pt-4 space-y-2">
                <button onClick={() => navigate('/help')} className="w-full flex items-center justify-between p-4 bg-card/40 rounded-2xl border border-border/40 active:scale-[0.98] transition-all">
                    <span className="text-[12px] font-black uppercase tracking-widest text-text-muted">Help & Support</span>
                    <ChevronRight size={16} className="opacity-20" />
                </button>
                <div className="text-center py-4">
                    <p className="text-[9px] font-black text-text-muted opacity-30 uppercase tracking-[0.3em]">ulooo v3.4 PRO</p>
                    <p className="text-[8px] font-bold text-text-muted opacity-20 uppercase tracking-widest mt-1">© 2026 Indus Ledger Tech</p>
                </div>
            </div>


        </div>
      </div>
    </PageTransition>
  );
};
