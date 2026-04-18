import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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
import { Manager } from './pages/Manager';
import { NotificationDetail } from './pages/NotificationDetail';
import { StockReceive } from './pages/StockReceive';
import { BarcodeScanner } from './pages/BarcodeScanner';
import { BrandDetail } from './pages/BrandDetail';
import { BulkScanMode } from './pages/BulkScanMode';
import { AllActivity } from './pages/AllActivity';
import { App as CapApp } from '@capacitor/app';
import { motion } from 'framer-motion';

// ─── THE EXACT DISNEY+ APP SPLASH REPLICA ('KiryanaBook' Edition) ────────────
const SplashLoader = () => {
  return (
    <div 
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #051A0F 0%, #000000 100%)' }}
    >
      <motion.div 
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative flex items-center justify-center w-full max-w-lg h-64"
      >
        
        {/* Main Text: KiryanaBook */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
           className="relative z-10 flex flex-col items-center"
           style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <span className="text-[48px] font-black text-white tracking-tight leading-none mb-1">
            KiryanaBook
          </span>
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.8 }}
             transition={{ delay: 0.8, duration: 0.5 }}
             className="flex items-center space-x-3 w-full justify-center"
          >
             <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[#00E676] rounded-full" />
             <p className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.4em] drop-shadow-[0_0_4px_rgba(0,230,118,0.5)]">Secure Ledger</p>
             <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[#00E676] rounded-full" />
          </motion.div>
        </motion.div>

        {/* The Exact Disney Swoosh Arc (Stays Visible as a Rainbow/Glow) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" viewBox="0 0 300 150">
            {/* The Trail left behind by the comet (Stays visible!) */}
            <motion.path 
                d="M 30,85 C 80,-5 220,-5 270,85" 
                fill="none" 
                stroke="url(#disneyGlow)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeIn", delay: 0.1 }}
                style={{ filter: "drop-shadow(0 0 8px rgba(0,230,118,0.6))" }}
            />
            {/* Custom Green Arc Gradient */}
            <defs>
                <linearGradient id="disneyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#051A0F" />
                    <stop offset="30%" stopColor="#00C853" />
                    <stop offset="70%" stopColor="#00E676" />
                    <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
            </defs>

            {/* Final Target Flash at precise arc landing coordinates (270, 85) */}
            <motion.circle 
               cx="270" cy="85" r={15}
               fill="#ffffff"
               initial={{ opacity: 0, scale: 0 }}
               animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 4, 6] 
               }}
               transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
               style={{ filter: "blur(20px)" }}
            />
            <motion.circle 
               cx="270" cy="85" r={10}
               fill="#ffffff"
               initial={{ opacity: 0, scale: 0 }}
               animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
               }}
               transition={{ delay: 0.9, duration: 0.3, ease: "easeOut" }}
               style={{ filter: "blur(3px)" }}
            />
        </svg>

      </motion.div>
    </div>
  );
};

// ─── AUTH GUARD ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading, pinVerified, setPinVerified, isSecurityReady } = useAuth();
  const { profile, loading: shopLoading } = useShop();
  const location = useLocation();

  useEffect(() => {
    if (!profile?.securitySettings || !user || !isSecurityReady) return;
    const path = location.pathname;
    const { lockStock, lockKhata, lockReports, lockStaff } = profile.securitySettings;

    const isLocked = (path.includes('/stock') && lockStock) ||
                    (path.includes('/customers') && lockKhata) ||
                    (path.includes('/reports') && lockReports) ||
                    (path.includes('/staff') && lockStaff);

    if (isLocked && !pinVerified) {
       setPinVerified(false);
    }
  }, [location.pathname, profile, pinVerified, user, setPinVerified, isSecurityReady]);

  if (authLoading || !isSecurityReady) return <SplashLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com');
  const isEmailPasswordUser = user?.providerData?.some(p => p.providerId === 'password');

  if (user && isEmailPasswordUser && !isGoogleUser && (!user.email || !user.emailVerified) && !user.isAnonymous) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!user.email && !user.isAnonymous) {
    return <Navigate to="/login" replace />;
  }

  if (shopLoading) return <SplashLoader />;
  if (!profile) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

// ─── NEW USER GUARD ─────────────────────────────────────────────────────────
const NewUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading, isSecurityReady } = useAuth();
  const { profile, loading: shopLoading } = useShop();

  if (authLoading || !isSecurityReady) return <SplashLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (shopLoading) return <SplashLoader />;
  if (profile) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function AppRoutes() {
  const { user, loading: authLoading, isSecurityReady } = useAuth();
  const { loading: shopLoading } = useShop();
  const location = useLocation();
  const [initialSplash, setInitialSplash] = React.useState(true);
  const [forceHideSplash, setForceHideSplash] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          const path = notification.notification.extra?.path;
          if (path) navigate(path);
      });
    }

    // 🕒 INITIAL ANIMATION TIMER (MINIMUM)
    const timer = setTimeout(() => {
      setInitialSplash(false);
    }, 400); 

    // 🚀 MAX SPLASH LIMIT (FORCE TRANSITION AFTER 3 SECONDS)
    const forceTimer = setTimeout(() => {
      setForceHideSplash(true);
    }, 3000);

    return () => {
        clearTimeout(timer);
        clearTimeout(forceTimer);
        if (Capacitor.isNativePlatform()) LocalNotifications.removeAllListeners();
    };
  }, [navigate]);

  useEffect(() => {
    const handleBackButton = async () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/login') {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    };
    
    // Resume Listeners to prevent Splash Hang
    const backHandler = CapApp.addListener('backButton', handleBackButton);
    const resumeHandler = CapApp.addListener('resume', () => {
      setForceHideSplash(prev => {
        setTimeout(() => setForceHideSplash(true), 150);
        return false;
      });
    });

    return () => {
      backHandler.then(h => h.remove());
      resumeHandler.then(h => h.remove());
    };
  }, []);

  // ✅ TRANSITION LOGIC: Exit splash if all data is ready OR if 3 seconds have passed
  const isDataReady = !authLoading && isSecurityReady && (!user || !shopLoading);
  const shouldShowSplash = initialSplash || (!isDataReady && !forceHideSplash);

  if (shouldShowSplash) {
    return <SplashLoader />;
  }

  return (
    <>
      <Toaster position="top-right" />
      {user && isSecurityReady && location.pathname !== '/help' && location.pathname !== '/verify-email' && <SecurityPinScreen />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<NewUserRoute><Onboarding /></NewUserRoute>} />
        <Route path="/setup" element={<NewUserRoute><Setup /></NewUserRoute>} />
        <Route path="/verify-email" element={user && user.providerData?.some((p: any) => p.providerId === 'password') && !user.emailVerified && !user.isAnonymous ? <VerifyEmail /> : <Navigate to="/" replace />} />
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
          <Route path="notification/:id" element={<NotificationDetail />} />
          <Route path="cashflow" element={<CashFlow />} />
          <Route path="reports-detail" element={<ReportsDetail />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
          <Route path="plans" element={<Plans />} />
          <Route path="add-item" element={<AddItem />} />
          <Route path="stock-receive" element={<StockReceive />} />
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
          <Route path="manager" element={<Manager />} />
          <Route path="all-activity" element={<AllActivity />} />
          <Route path="barcode-scan" element={<BarcodeScanner />} />
          <Route path="brand/:name" element={<BrandDetail />} />
          <Route path="bulk-scan" element={<BulkScanMode />} />
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
