import React, { useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Settings, UserCog, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import toast from 'react-hot-toast';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { motion } from 'framer-motion';

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
        style: { borderRadius: '24px', background: '#1A5C38', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      triggerHaptic(ImpactStyle.Heavy);
    }
    prevNotifyCount.current = notifications.length;
  }, [notifications]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/customers', icon: BookOpen, label: 'Khata' },
    { to: '/manager', icon: UserCog, label: 'Manager' },
    { to: '/stock', icon: Package, label: 'Stock' },
    { to: '/settings', icon: Settings, label: 'More' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#050510] transition-colors duration-500 font-outfit">
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pb-[100px]">
        <Outlet />
      </main>

      {/* FLOATING PREMIUM BOTTOM NAVIGATION */}
      <div className="fixed bottom-6 inset-x-5 z-[150] max-w-md mx-auto">
        <nav className="glass-card bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between">
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            
            return (
              <NavLink 
                key={item.to}
                to={item.to} 
                onClick={() => triggerHaptic(ImpactStyle.Light)}
                className="relative flex flex-col items-center gap-1 group"
              >
                <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-[#1A5C38] dark:text-[#4BFF94] scale-110' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#4BFF94]/20 dark:bg-[#4BFF94]/10 rounded-2xl -z-10"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {item.to === '/manager' && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={10} className="text-amber-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100 text-[#1A5C38] dark:text-[#4BFF94]' : 'opacity-40 text-gray-400'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

    </div>
  );
};
