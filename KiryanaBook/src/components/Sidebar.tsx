import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LogOut, LayoutDashboard, BookOpen, Package, FileText, Users, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile } = useShop();
  const { isDarkMode } = useTheme();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'HOME', icon: LayoutDashboard, path: '/', color: '#4BFF94' },
    { label: 'UDHAAR', icon: BookOpen, path: '/customers', color: '#448AFF' },
    { label: 'STOCK', icon: Package, path: '/stock', color: '#FCD34D' },
    { label: 'INVOICES', icon: FileText, path: '/invoices', color: '#FF5252' },
    { label: 'STAFF', icon: Users, path: '/staff', color: '#00C853' },
    { label: 'SETTINGS', icon: Settings, path: '/settings', color: '#B0B0B0' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          
          {/* Menu Panel */}
          <motion.div 
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-[80%] max-w-sm bg-[#0A0A0A] border-r border-white/5 shadow-2xl overflow-y-auto"
            style={{ backgroundColor: isDarkMode ? '#0A0A0A' : '#FFFFFF' }}
          >
            {/* Header / Profile */}
            <div className="p-8 pt-12 pb-6 border-b dark:border-white/5">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-[#4BFF94] shadow-lg shadow-[#4BFF94]/20">
                    <img 
                      src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} 
                      alt="Logo" 
                      className="w-full h-full object-cover" 
                    />
                 </div>
                 <div>
                    <h3 className="text-[18px] font-black leading-tight" style={{ color: isDarkMode ? '#FFF' : '#0A0A0A' }}>
                        {profile?.name || 'My Shop'}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {profile?.plan && ['pro', 'business'].includes(profile.plan.toLowerCase()) 
                        ? `${profile.plan} User` 
                        : 'Free Trial User'}
                    </p>
                 </div>
              </div>

              <div className="bg-[#4BFF94]/10 rounded-2xl p-4 flex items-center justify-between border border-[#4BFF94]/10">
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#4BFF94] mb-1">Current Plan</p>
                    <p className="text-[16px] font-black capitalize" style={{ color: isDarkMode ? '#FFF' : '#0A0A0A' }}>
                      {profile?.plan || 'Free'}
                    </p>
                 </div>
                 <button 
                   onClick={() => { navigate('/help'); onClose(); }}
                   className="text-[9px] font-black bg-[#4BFF94] text-[#0A3D24] px-3 py-1.5 rounded-full uppercase"
                 >
                    Upgrade
                 </button>
              </div>
            </div>

            {/* Links */}
            <div className="p-5 space-y-2">
               <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-4 mb-3">Main Menu</p>
               {menuItems.map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => { navigate(item.path); onClose(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-gray-100 dark:active:bg-white/5 transition-all text-left group"
                  >
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center border dark:border-white/5 bg-gray-50 dark:bg-white/5 group-active:scale-90 transition-transform shadow-sm">
                        <item.icon size={18} style={{ color: item.color }} />
                     </div>
                     <span className="text-[14px] font-bold" style={{ color: isDarkMode ? '#FFF' : '#0A0A0A' }}>{item.label}</span>
                  </button>
               ))}
            </div>

            {/* Logout / Bottom */}
            <div className="p-5 mt-4 border-t dark:border-white/5">
                <button 
                  onClick={async () => { 
                    try {
                      await logout();
                      onClose();
                    } catch (e) {
                      toast.error("Logout failed");
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 active:bg-red-50 dark:active:bg-red-500/10 transition-all text-left font-black"
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/10">
                       <LogOut size={18} />
                    </div>
                   Logout Account
                </button>
                <div className="text-center mt-6">
                  <span className="bg-[#4BFF94]/20 text-[#4BFF94] px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">
                    Indus Ledger
                  </span>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="absolute top-12 right-6 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100 dark:active:bg-white/5"
            >
                <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
