import React, { useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Settings, UserCog } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import toast from 'react-hot-toast';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { notifications } = useShop();
  const prevNotifyCount = useRef(notifications.length);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  useEffect(() => {
    const initNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display === 'granted') {
          await LocalNotifications.createChannel({
             id: 'stock_alerts',
             name: 'Stock Alerts',
             importance: 5,
             description: 'Alerts for low stock',
             sound: 'beep.wav',
             visibility: 1,
             vibration: true
          });
        }
      }
    };
    initNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > prevNotifyCount.current) {
      const last = notifications[notifications.length-1];
      toast(`${last.title}: ${last.message}`, {
        icon: '🔔',
        duration: 4000,
        position: 'top-center',
        style: { borderRadius: '20px', background: '#333', color: '#fff' }
      });
      triggerHaptic(ImpactStyle.Heavy);
    }
    prevNotifyCount.current = notifications.length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] transition-colors duration-300">
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pb-[90px] sm:pb-[100px]">
        <Outlet />
      </main>

      {/* STANDARD MATERIAL BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#0D0D0D] backdrop-blur-xl border-t border-gray-100 dark:border-white/5 z-[90] flex items-center justify-around px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] shadow-[0_-15px_50px_rgba(0,0,0,0.1)]">
        
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-all ${isActive ? 'text-[#00E676] scale-105' : 'text-gray-400/80'}`}>
          <div className={`p-1.5 rounded-xl ${location.pathname === '/' ? 'bg-[#00E676]/10' : ''}`}>
            <LayoutDashboard size={24} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Asal</span>
        </NavLink>

        <NavLink to="/customers" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-all ${isActive ? 'text-[#00E676] scale-105' : 'text-gray-400/80'}`}>
          <div className={`p-1.5 rounded-xl ${location.pathname === '/customers' ? 'bg-[#00E676]/10' : ''}`}>
            <BookOpen size={24} strokeWidth={location.pathname === '/customers' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Khata</span>
        </NavLink>


        <NavLink to="/manager" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-all ${isActive ? 'text-[#00E676] scale-105' : 'text-gray-400/80'}`}>
          <div className={`p-1.5 rounded-xl ${location.pathname === '/manager' ? 'bg-[#00E676]/10' : ''}`}>
            <UserCog size={24} strokeWidth={location.pathname === '/manager' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Manager</span>
        </NavLink>

        <NavLink to="/stock" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-all ${isActive ? 'text-[#00E676] scale-105' : 'text-gray-400/80'}`}>
          <div className={`p-1.5 rounded-xl ${location.pathname === '/stock' ? 'bg-[#00E676]/10' : ''}`}>
            <Package size={24} strokeWidth={location.pathname === '/stock' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Stock</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-all ${isActive ? 'text-[#00E676] scale-105' : 'text-gray-400/80'}`}>
          <div className={`p-1.5 rounded-xl ${location.pathname === '/settings' ? 'bg-[#00E676]/10' : ''}`}>
            <Settings size={24} strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Settings</span>
        </NavLink>
      </nav>

    </div>
  );
};
