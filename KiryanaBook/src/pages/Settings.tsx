import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Grid3x3, ChevronRight, RotateCcw, Database, FileSpreadsheet, FileText, Moon, Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';



export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { userPin, resetPin, autoLockTimer, saveAutoLockTimer } = useAuth();
  const { profile, sales, expenses, stock, contacts, invoices, clearOldData } = useShop();
  const { setMode, isDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const storageUsed = React.useMemo(() => {
    const dataSize = JSON.stringify({ sales, expenses, stock, contacts, invoices }).length;
    return (dataSize / (1024)).toFixed(1); // KB
  }, [sales, expenses, stock, contacts, invoices]);



  const handleExportExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // 1. Sales Sheet
      const salesHeader = [["Date", "Payment Type", "Amount", "Items Count"]];
      const salesRows = sales.map(s => [s.date, s.type.toUpperCase(), s.total, s.items?.length || 0]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...salesHeader, ...salesRows]), "Sales");

      // 2. Expenses Sheet
      const expenseHeader = [["Date", "Description", "Amount"]];
      const expenseRows = expenses.map(e => [e.date, e.description, e.amount]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...expenseHeader, ...expenseRows]), "Expenses");

      // 3. Stock Sheet
      const stockHeader = [["Name", "Price", "Quantity", "Unit"]];
      const stockRows = stock.map(s => [s.name, s.price, s.quantity, s.unit]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...stockHeader, ...stockRows]), "Stock");

      // 4. Contacts Sheet
      const contactHeader = [["Name", "Phone", "Type", "Balance"]];
      const contactRows = contacts.map(c => [c.name, c.phone, c.type, c.initialBalance]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...contactHeader, ...contactRows]), "Contacts");

      const fileName = `${profile?.name || 'KiryanaBook'}_Backup.xlsx`;

      if (Capacitor.isNativePlatform()) {
        const base64Data = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const savedFile = await Filesystem.writeFile({
          path: fileName.replace(/[^a-z0-9_.-]/gi, '_'),
          data: base64Data,
          directory: Directory.Documents,
        });

        await Share.share({
          title: 'KiryanaBook Backup',
          text: 'Here is your Excel backup',
          url: savedFile.uri,
          dialogTitle: 'Save or Share Excel'
        });
        import('react-hot-toast').then(t => t.default.success('Excel backup generated!'));
      } else {
        XLSX.writeFile(wb, fileName);
        import('react-hot-toast').then(t => t.default.success('Full Excel backup ready!'));
      }
    } catch (err) {
      console.error(err);
      import('react-hot-toast').then(t => t.default.error('Excel export failed.'));
    }
  };

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








  const handleClearOldData = async () => {
    if (window.confirm('Kya aap 90 din se purane records delete karna chahte hain?')) {
        await clearOldData(90);
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
    <PageTransition>
      <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] font-outfit max-w-md mx-auto pb-8 transition-colors duration-300">
        {/* HEADER */}
        <div className="sticky top-0 z-50 transition-colors duration-300 px-5 py-4 flex items-center gap-4 border-b dark:border-[#2A2A2A]" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <button onClick={() => navigate(-1)} className="text-white active:scale-95 transition-transform">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-white font-bold text-[17px] tracking-wide">{t('settings')}</h1>
        </div>

        <div className="px-5 py-6 space-y-8">
            
            {/* SHOP PROFILE */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B0B0]/60 tracking-[0.15em] uppercase mb-2 ml-1">{t('my_shop')}</h3>
                <div className="bg-white dark:bg-[#141414] rounded-[1.25rem] p-4 flex items-center justify-between border border-gray-100 dark:border-[#2A2A2A] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                        <div className="w-[60px] h-[60px] bg-[#FDBA74] dark:bg-[#1A3A25] rounded-2xl flex flex-col items-center justify-center text-[#9A3412] dark:text-[#00E676] shadow-sm shrink-0 overflow-hidden">
                            {profile?.logoUrl ? (
                                <img src={profile.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-5 h-5 border-2 border-current rounded-full mb-0.5" />
                                    <div className="w-6 h-1 bg-current rounded-full" />
                                </>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[15px] font-black text-[#0A3D24] dark:text-white leading-tight mb-1.5">
                              {profile?.name || 'My Shop'}
                            </h2>
                            {profile?.owner && (
                              <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#B0B0B0] mb-0.5">
                                  <User size={10} strokeWidth={3} />
                                  <span className="text-[10px] font-medium">{profile.owner}</span>
                              </div>
                            )}
                            {profile?.phone && (
                              <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#B0B0B0]">
                                  <Phone size={10} strokeWidth={3} />
                                  <span className="text-[10px] font-medium">{profile.phone}</span>
                              </div>
                            )}
                        </div>
                    </div>
                    <button onClick={() => navigate('/profile-settings')} className="bg-[#F4F4F5] dark:bg-[#252525] text-gray-700 dark:text-white px-4 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition-transform">
                        Edit
                    </button>
                </div>
            </section>

            {/* SUBSCRIPTION PLAN */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B0B0]/60 tracking-[0.15em] uppercase mb-2 ml-1">Subscription Plan</h3>
                <div className="bg-white dark:bg-[#141414] rounded-[1.25rem] p-4 flex items-center justify-between border border-gray-100 dark:border-[#2A2A2A] shadow-sm active:scale-[0.99] transition-all" onClick={() => navigate('/help')}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0A3D24]/10 dark:bg-[#00E676]/20 rounded-xl flex items-center justify-center text-[#0A3D24] dark:text-[#00E676]">
                            <Crown size={20} />
                        </div>
                        <div>
                            <p className="text-[13px] font-black text-gray-900 dark:text-white uppercase leading-none mb-1">{profile?.plan || 'Free'}</p>
                            <p className="text-[10px] font-medium text-gray-400">Current active plan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#0A3D24] dark:text-[#00E676] text-[10px] font-black uppercase tracking-tight">Change</span>
                        <ChevronRight size={14} className="text-gray-300" />
                    </div>
                </div>
            </section>

            {/* SECURITY */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B0B0]/60 tracking-[0.15em] uppercase mb-2 ml-1">Security</h3>
                <div className="bg-white dark:bg-[#141414] rounded-[1.25rem] border border-gray-100 dark:border-[#2A2A2A] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                    {!userPin ? (
                      <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-[#1E1E1E] active:bg-gray-50 dark:active:bg-[#1E1E1E]" onClick={resetPin}>
                        <div className="flex items-center gap-3">
                            <Grid3x3 size={18} className="text-[#0A3D24] dark:text-[#00E676]" />
                            <span className="text-[13px] font-bold text-gray-800 dark:text-white">Setup Security PIN</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-[#1E1E1E] active:bg-gray-50 dark:active:bg-[#1E1E1E]" onClick={resetPin}>
                        <div className="flex items-center gap-3">
                            <RotateCcw size={18} className="text-[#0A3D24] dark:text-[#00E676]" />
                            <span className="text-[13px] font-bold text-gray-800 dark:text-white">{t('change_pin')}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    )}

                    <div className="p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl mx-4 mb-4 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex gap-3">
                            <Lock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-800 dark:text-white mb-1">Login Password Kaise Badlein?</span>
                                <p className="text-[10px] font-medium text-gray-500 dark:text-[#B0B0B0] leading-relaxed">
                                    Agar aap apna signup password badalna chahtay hain to login screen par <span className="font-bold text-blue-500">"Forgot Password"</span> ka option use karein. Aapko email par reset link mil jaye ga.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NOTIFICATIONS - simple row, no scary blocked message */}
            {/* NOTIFICATIONS REMOVED */}

            {/* AUTO-LOCK SETTINGS */}
            <section>
                <div className="flex items-center justify-between mb-2 ml-1">
                    <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B0B0]/60 tracking-[0.15em] uppercase">Security Auto-Lock</h3>
                </div>
                <div className="bg-white dark:bg-[#141414] rounded-[1.25rem] border border-gray-100 dark:border-[#2A2A2A] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-white mb-3">Require PIN after inactivity:</p>
                    <div className="relative">
                        <select
                          value={autoLockTimer}
                          onChange={(e) => saveAutoLockTimer(Number(e.target.value))}
                          className="w-full bg-[#F4F4F5] dark:bg-[#252525] text-gray-800 dark:text-white rounded-xl py-3 px-4 text-[13px] font-bold outline-none appearance-none cursor-pointer border-r-[16px] border-transparent"
                        >
                            <option value={0}>Immediately</option>
                            <option value={60000}>After 1 Minute</option>
                            <option value={300000}>After 5 Minutes</option>
                            <option value={900000}>After 15 Minutes</option>
                            <option value={-1}>Never (Session only)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronRight size={14} className="rotate-90 text-gray-400" />
                        </div>
                    </div>
                </div>
            </section>



            {/* LANGUAGE & DISPLAY */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B0B0]/60 tracking-[0.15em] uppercase mb-2 ml-1">Language & Display</h3>
                <div className="bg-white dark:bg-[#141414] rounded-[1.25rem] border border-gray-100 dark:border-[#2A2A2A] p-4 space-y-5 shadow-sm">
                    
                    <div className="space-y-2.5">
                        <p className="text-[11px] font-bold text-gray-800 dark:text-white">{t('language')}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setLanguage('English')} className={`${language === 'English' ? 'bg-[#0A3D24] dark:bg-[#00C853] text-white dark:text-black' : 'bg-[#F4F4F5] dark:bg-[#252525] text-gray-500 dark:text-[#B0B0B0]'} px-5 py-2 rounded-full text-[11px] font-bold transition-all transition-colors`}>English</button>
                            <button onClick={() => setLanguage('Urdu')} className={`${language === 'Urdu' ? 'bg-[#0A3D24] dark:bg-[#00C853] text-white dark:text-black' : 'bg-[#F4F4F5] dark:bg-[#252525] text-gray-500 dark:text-[#B0B0B0]'} px-5 py-2 rounded-full text-[11px] font-bold transition-all transition-colors`}>Urdu</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                            <Moon size={18} className={isDarkMode ? "text-[#00E676]" : "text-gray-400"} />
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-800 dark:text-white leading-tight">{t('dark_mode')}</span>
                                <span className="text-[10px] font-medium text-gray-400 dark:text-[#B0B0B0] leading-tight">Behtar visual experience ke liye</span>
                            </div>
                        </div>
                        <Toggle active={isDarkMode} onClick={() => setMode(isDarkMode ? 'light' : 'dark')} />
                    </div>
                </div>
            </section>

            {/* DATA MANAGEMENT */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B0B0]/60 tracking-[0.15em] uppercase mb-2 ml-1">Data Management</h3>
                <div className="bg-white dark:bg-[#141414] rounded-[1.25rem] border border-gray-100 dark:border-[#2A2A2A] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 space-y-4">
                    
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-[#1E1E1E]">
                        <div className="flex items-start gap-3">
                            <Database size={18} className="text-[#0A3D24] dark:text-[#00E676] mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-800 dark:text-white mb-0.5 leading-tight">Data Usage</span>
                                <span className="text-[9px] font-medium text-gray-400 dark:text-[#B0B0B0]">{storageUsed} KB of storage used</span>
                            </div>
                        </div>
                        <button onClick={handleClearOldData} className="text-[10px] font-black text-[#0A3D24] dark:text-[#4BFF94]">Clear Old Data</button>
                    </div>

                    <div className="pb-4 border-b border-gray-50 dark:border-[#1E1E1E]">
                        <p className="text-[11px] font-bold text-gray-800 dark:text-white mb-3">Export All Data</p>
                        <div className="flex gap-3">
                            <button onClick={handleExportExcel} className="flex-1 bg-[#E2FFED] dark:bg-[#1A3A25] border border-[#0A3D24]/10 dark:border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform text-[#0A3D24] dark:text-[#4BFF94]">
                                <FileSpreadsheet size={16} />
                                <span className="text-[11px] font-bold">Excel</span>
                            </button>
                            <button onClick={handleExportPDF} className="flex-1 bg-red-50 border border-red-100 rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform text-red-700">
                                <FileText size={16} />
                                <span className="text-[11px] font-bold">PDF</span>
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* FOOTER REMOVED */}
            {/* GLOBAL SAVE BUTTON REMOVED FOR AUTO-SAVE */}

            <div className="h-40" />
        </div>
      </div>
    </PageTransition>
  );
};
