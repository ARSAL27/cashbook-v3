import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Settings, Mic, FileText, Users, Bell } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { VoiceAssistant } from '../components/VoiceAssistant';
import toast from 'react-hot-toast';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const FULL_NAV_ITEMS = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Khata', path: '/customers', icon: BookOpen },
  { name: 'Stock', path: '/stock', icon: Package },
  { name: 'Invoices', path: '/invoices', icon: FileText },
  { name: 'Staff', path: '/staff', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Khata', path: '/customers', icon: BookOpen },
  { name: 'Stock', path: '/stock', icon: Package },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile: _profile, notifications } = useShop();
  const [showVoice, setShowVoice] = useState(false);
  const prevNotifyCount = useRef(notifications.length);

  // Request Notification Permission on mount
  useEffect(() => {
    const checkPerms = async () => {
      if (Capacitor.isNativePlatform()) {
        const perms = await LocalNotifications.checkPermissions();
        if (perms.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
        // Create Channel for Android 8+
        try {
          await LocalNotifications.createChannel({
            id: 'default',
            name: 'General Notifications',
            description: 'Alerts and System Updates',
            importance: 5,
            visibility: 1,
            sound: 'default'
          });
        } catch (e) { console.error("Channel creation failed", e); }
      } else if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    };
    checkPerms();

    const handleOpenVoice = () => setShowVoice(true);
    window.addEventListener('openVoiceAssistant', handleOpenVoice);
    return () => {
      window.removeEventListener('openVoiceAssistant', handleOpenVoice);
    };
  }, []);

  // Monitor for new notifications in real-time
  useEffect(() => {
    if (notifications.length > prevNotifyCount.current) {
      const latest = notifications[0]; // notifications are sorted by date desc
      if (latest && !latest.read) {
        // 1. Show In-App Toast
        toast((_t) => (
          <div className="flex items-start gap-3 cursor-pointer p-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
               <Bell size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-text-primary leading-tight">{latest.title}</p>
              <p className="text-[10px] text-text-muted line-clamp-2">{latest.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                   window.dispatchEvent(new CustomEvent('openVoiceAssistant'));
                }}
                className="w-10 h-10 bg-[#ffffff18] dark:bg-[#141414] rounded-xl flex items-center justify-center border dark:border-[#2A2A2A] active:scale-90 transition-transform"
              >
                  <Mic size={18} className="text-[#4BFF94]" strokeWidth={3} />
              </button>
              <button 
                onClick={() => navigate('/notifications')}
                className="relative w-9 h-9 bg-[#ffffff12] dark:bg-[#141414] rounded-full flex items-center justify-center border dark:border-[#2A2A2A]"
              >
                <Bell size={17} className="text-white dark:text-[#B0B0B0]" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full border-2 border-[#1A5C38] dark:border-[#141414] text-[9px] text-white flex items-center justify-center font-black px-0.5">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        ), { duration: 5000, position: 'top-center' });

        // 2. Trigger System Notification (Mobile/OS Tray)
        if (Capacitor.isNativePlatform()) {
            LocalNotifications.schedule({
                notifications: [
                    {
                        title: latest.title,
                        body: latest.message,
                        id: Math.floor(Math.random() * 1000000),
                        schedule: { at: new Date(Date.now() + 1000) },
                        channelId: 'default',
                        sound: 'default',
                        attachments: [],
                        actionTypeId: '',
                        extra: null
                    }
                ]
            }).catch(e => console.error("Native notification failed", e));
        } else if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const systemNote = new Notification(latest.title, {
              body: latest.message,
              icon: '/launcher_icon.png' // App icon from public folder
            });
            systemNote.onclick = () => {
              window.focus();
              navigate('/notifications');
              systemNote.close();
            };
          } catch (err) {
            console.error("System notification failed", err);
          }
        }
      }
    }
    prevNotifyCount.current = notifications.length;
  }, [notifications, navigate]);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative font-outfit select-none overscroll-none">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border h-full relative z-20 shadow-sm">
        <div className="p-5 flex flex-col items-center border-b border-border/50">
          <div className="relative mb-2.5">
             {_profile?.logoUrl ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border shadow-lg">
                  <img src={_profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
             ) : (
                <div className="p-2.5 bg-card-secondary rounded-2xl border border-border">
                   <LayoutDashboard size={24} className="text-primary" />
                </div>
             )}
          </div>
          <h1 className="text-[11px] font-bold text-text-primary tracking-tight uppercase mt-1">
            {_profile?.name || 'My Shop'}
          </h1>
          <p className="text-[6px] font-bold text-primary tracking-widest uppercase opacity-40 italic">Business Hub</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {FULL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all relative overflow-hidden group ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-text-muted hover:bg-card-secondary hover:text-text-primary'
                  }`
                }
              >
                <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-5 border-t border-border opacity-20 text-center">
            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest italic">KiryanaBook Core</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative md:pb-0" style={{ paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth overscroll-contain">
          <Outlet />
        </div>
      </main>

      {/* App Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-2xl border-t border-gray-100 flex items-center justify-between pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 px-2 z-[60] shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.05)] rounded-t-[2.5rem] transition-colors duration-300">
        <div className="flex flex-1 items-center justify-around">
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={`mob-primary-${item.path}`}
                to={item.path}
                className={({ isActive: active }) => `flex flex-col items-center justify-center transition-all ${active ? 'text-[#0A3D24]' : 'text-gray-300'}`}
              >
                <div className="p-2 rounded-2xl transition-all">
                  <Icon size={22} strokeWidth={2.5} />
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* PROMINENT VOICE BUTTON */}
        <div className="relative -top-6 px-1.5">
          <button
            onClick={() => setShowVoice(true)}
            className="w-14 h-14 bg-[#0A3D24] rounded-[1.8rem] flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(0,163,80,0.4)] border-[5px] border-white relative z-10 active:scale-95 transition-transform"
          >
            <Mic size={24} className="text-[#4BFF94]" strokeWidth={3} />
          </button>
          <p className="text-[9px] font-black text-[#0A3D24] uppercase tracking-tighter text-center mt-1.5">Speak</p>
        </div>

        <div className="flex flex-1 items-center justify-around">
          {NAV_ITEMS.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={`mob-secondary-${item.path}`}
                to={item.path}
                className={({ isActive: active }) => `flex flex-col items-center justify-center transition-all ${active ? 'text-[#0A3D24]' : 'text-gray-300'}`}
              >
                <div className="p-2 rounded-2xl transition-all">
                  <Icon size={22} strokeWidth={2.5} />
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <VoiceAssistant isOpen={showVoice} onClose={() => setShowVoice(false)} />
    </div>
  );
};
