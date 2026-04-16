import React, { useState, useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ShopsPage, ShopDetail } from './pages/ShopsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { BarcodeScannerPage } from './pages/BarcodeScannerPage';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import './index.css';

const AppInner: React.FC = () => {
  const { user, loading, isAdmin, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <LoginPage />;
  if (user && !isAdmin) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title" style={{ color: '#ef4444' }}>Access Denied</h1>
          <p className="login-sub">Only authorized admin emails can view this control center.</p>
          <button className="google-btn" onClick={logout}>Sign Out</button>
        </div>
      </div>
    );
  }

  const handleShopSelect = (id: string) => {
    setSelectedShop(id);
    setPage('shop-detail');
  };

  const handleBack = () => {
    setSelectedShop(null);
    setPage('shops');
  };

  const handleBarcodeScan = (barcode: string) => {
    setShowScanner(false);
    toast.success(`Barcode: ${barcode}`, { duration: 4000 });
  };

  return (
    <div className="app-layout">
      {/* Full-screen barcode scanner overlay */}
      {showScanner && (
        <BarcodeScannerPage
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <Sidebar
        page={selectedShop ? 'shops' : page}
        setPage={(p) => {
          setPage(p);
          setSelectedShop(null);
        }}
      />

      <div className="main-content">
        {page === 'dashboard' && <Dashboard onShopSelect={handleShopSelect} />}
        {page === 'shops' && !selectedShop && <ShopsPage onShopSelect={handleShopSelect} />}
        {page === 'shop-detail' && selectedShop && <ShopDetail shopId={selectedShop} onBack={handleBack} />}
        {page === 'notifications' && <NotificationsPage />}
      </div>

      {/* Floating Camera/Scan Button */}
      <button
        onClick={() => setShowScanner(true)}
        title="Scan Barcode"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        📷
      </button>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </AuthProvider>
);

export default App;
