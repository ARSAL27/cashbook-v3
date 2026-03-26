import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Stock } from './pages/Stock';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { StockDetail } from './pages/StockDetail';
import { CustomerDetail } from './pages/CustomerDetail';
import { AddSale } from './pages/AddSale';
import { AddExpense } from './pages/AddExpense';
import { AddUdhaar } from './pages/AddUdhaar';
import { ReportsDetail } from './pages/ReportsDetail';
import { ProfileSettings } from './pages/ProfileSettings';
import { HelpSupport } from './pages/HelpSupport';
import { Plans } from './pages/Plans';
import { AddContact } from './pages/AddContact';
import { LedgerDetail } from './pages/LedgerDetail';
import { Invoices } from './pages/Invoices';
import { StaffDirectory } from './pages/StaffDirectory';
import { AddStaff } from './pages/AddStaff';
import { StaffActivity } from './pages/StaffActivity';
import { RolePermissions } from './pages/RolePermissions';
import { Notifications } from './pages/Notifications';
import { CashFlow } from './pages/CashFlow';
import { AddItem } from './pages/AddItem';
import { NewInvoice } from './pages/NewInvoice';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Setup } from './pages/Setup';
import { VerifyEmail } from './pages/VerifyEmail';
import { SecurityPinScreen } from './components/SecurityPinScreen';
import { App as CapApp } from '@capacitor/app';
import { motion } from 'framer-motion';

// ─── SPLASH LOADER ──────────────────────────────────────────────────────────
const SplashLoader = () => {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col items-center justify-center font-outfit">
      <div className="relative flex flex-col items-center">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#22C55E] dark:bg-[#00E676] rounded-[2rem] shadow-xl flex items-center justify-center mb-6"
        >
             <div className="w-10 h-1 bg-white/30 rounded-full rotate-45" />
        </motion.div>
        <h2 className="text-[18px] font-black text-[#0A3D24] dark:text-[#E0E0E0] tracking-[0.2em] uppercase mb-1">KiryanaBook</h2>
        <div className="flex items-center space-x-2">
            <p className="text-[8px] font-black text-[#22C55E] dark:text-[#00E676] uppercase tracking-[0.3em] opacity-40">Secure Ledger</p>
        </div>
        
        <div className="absolute -bottom-20 w-32 h-[3px] bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
             <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1/2 h-full bg-[#22C55E] dark:bg-[#00E676] rounded-full shadow-[0_0_10px_rgba(0,230,118,0.5)]" 
             />
        </div>
      </div>
    </div>
  );
};

// ─── AUTH GUARD ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading, pinVerified, setPinVerified } = useAuth();
  const { profile, loading: shopLoading } = useShop();
  const location = useLocation();

  useEffect(() => {
    if (!profile?.securitySettings || !user) return;
    const path = location.pathname;
    const { lockStock, lockKhata, lockReports, lockStaff } = profile.securitySettings;

    const isLocked = (path.includes('/stock') && lockStock) ||
                    (path.includes('/customers') && lockKhata) ||
                    (path.includes('/reports') && lockReports) ||
                    (path.includes('/staff') && lockStaff);

    if (isLocked && !pinVerified) {
       setPinVerified(false);
    }
  }, [location.pathname, profile, pinVerified, user, setPinVerified]);

  if (authLoading) return <SplashLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  // NEW: Email Verification Guard
  if (user && !user.emailVerified && !user.isAnonymous && user.email) {
    return <Navigate to="/verify-email" replace />;
  }

  if (shopLoading) return <SplashLoader />;
  if (!profile) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

// ─── NEW USER GUARD ─────────────────────────────────────────────────────────
const NewUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: shopLoading } = useShop();

  if (authLoading) return <SplashLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (shopLoading) return <SplashLoader />;
  if (profile) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    const handleBackButton = async () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/login') {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    };

    const handler = CapApp.addListener('backButton', handleBackButton);
    return () => {
      handler.then(h => h.remove());
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      {user && location.pathname !== '/help' && <SecurityPinScreen />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<NewUserRoute><Onboarding /></NewUserRoute>} />
        <Route path="/setup" element={<NewUserRoute><Setup /></NewUserRoute>} />
        <Route path="/verify-email" element={user && !user.emailVerified && !user.isAnonymous ? <VerifyEmail /> : <Navigate to="/" replace />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="stock" element={<Stock />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="staff" element={<StaffDirectory />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cashflow" element={<CashFlow />} />
          <Route path="reports-detail" element={<ReportsDetail />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
          <Route path="plans" element={<Plans />} />
          <Route path="add-item" element={<AddItem />} />
          <Route path="stock/:id" element={<StockDetail />} />
          <Route path="add-sale" element={<AddSale />} />
          <Route path="add-expense" element={<AddExpense />} />
          <Route path="add-udhaar" element={<AddUdhaar />} />
          <Route path="customers/:name" element={<CustomerDetail />} />
          <Route path="add-contact" element={<AddContact />} />
          <Route path="ledger" element={<LedgerDetail />} />
          <Route path="new-invoice" element={<NewInvoice />} />
          <Route path="invoice/:id" element={<InvoiceDetail />} />
          <Route path="add-staff" element={<AddStaff />} />
          <Route path="staff/:id" element={<StaffActivity />} />
          <Route path="staff/roles" element={<RolePermissions />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ShopProvider>
            <Router>
               <AppRoutes />
            </Router>
          </ShopProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
