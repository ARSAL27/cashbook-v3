import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LogOut, LayoutDashboard, Package, FileText, Users, Settings, CreditCard, HelpCircle, ShieldCheck, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile } = useShop();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/', color: '#4BFF94' },
    { label: 'Customers', icon: Users, path: '/customers', color: '#448AFF' },
    { label: 'Inventory', icon: Package, path: '/stock', color: '#FCD34D' },
    { label: 'Invoices', icon: FileText, path: '/invoices', color: '#B0B0B0' },
    { label: 'Staff Management', icon: ShieldCheck, path: '/staff', color: '#00C853' },
    { label: 'Notifications', icon: Bell, path: '/notifications', color: '#FF5252' }, // Added Notifications
    { label: 'Settings', icon: Settings, path: '/settings', color: '#6366F1' },
  ];

  const secondaryItems = [
    { label: 'Billing & Plans', icon: CreditCard, path: '/plans' },
    { label: 'Help & Support', icon: HelpCircle, path: '/help' },
  ];

  const sidebarVariants = {
    closed: { x: '-100%', transition: { type: 'spring' as const, damping: 30, stiffness: 300 } },
    open: { x: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } }
  };

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
            className="absolute inset-0 bg-black/40 backdrop-blur-md" 
          />
          
          {/* Menu Panel */}
          <motion.div 
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-[#080812] border-r border-black/5 dark:border-white/5 shadow-2xl flex flex-col"
          >
            {/* Header / Profile Section */}
            <div className="p-8 pt-14 pb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
               
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-primary/20 p-1 bg-white dark:bg-white/5">
                     <img 
                       src={profile?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'U'}&backgroundColor=34d399`} 
                       alt="Logo" 
                       className="w-full h-full object-cover rounded-2xl" 
                     />
                  </div>
                  <div>
                     <h3 className="text-[18px] font-black leading-tight text-gray-900 dark:text-white">
                         {profile?.name || 'My Shop'}
                     </h3>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                       {profile?.plan?.toUpperCase() || 'FREE'} ACCOUNT
                     </p>
                  </div>
               </div>

               <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-primary/10">
                  <div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Store Status</p>
                     <p className="text-[14px] font-black text-green-500">Active & Syncing</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
               </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-4 mb-4">Master Menu</p>
               {menuItems.map((item, i) => (
                  <motion.button 
                    key={i} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-2xl active:bg-gray-100 dark:active:bg-white/5 transition-all text-left group"
                  >
                     <div className="w-11 h-11 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/5 group-hover:scale-110 transition-transform shadow-sm">
                        <item.icon size={20} style={{ color: item.color }} />
                     </div>
                     <span className="text-[15px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">{item.label}</span>
                  </motion.button>
               ))}

               <div className="pt-6 mt-4 border-t border-black/5 dark:border-white/5">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-4 mb-4">Support</p>
                 {secondaryItems.map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => { navigate(item.path); onClose(); }}
                      className="w-full flex items-center gap-4 p-3.5 rounded-2xl active:bg-gray-100 dark:active:bg-white/5 transition-all text-left group opacity-70 hover:opacity-100"
                    >
                       <item.icon size={18} className="text-gray-400 ml-3" />
                       <span className="text-[14px] font-bold text-gray-600 dark:text-gray-300">{item.label}</span>
                    </button>
                 ))}
               </div>
            </div>

            {/* Footer / Logout Section */}
            <div className="p-6 mt-auto border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => { 
                    try {
                      await logout();
                      onClose();
                    } catch (e) {
                      toast.error("Logout failed");
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-500/5 text-red-500 transition-all font-black border border-red-100 dark:border-red-500/10"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </motion.button>
                <div className="text-center mt-6 flex flex-col items-center gap-1 opacity-40">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]">Kiryana Book v3.0</p>
                  <p className="text-[8px] font-bold">Safest Digital Ledger</p>
                </div>
            </div>

            {/* Internal Close Button */}
            <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={onClose}
                className="absolute top-10 right-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100 dark:active:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md"
            >
                <X size={20} />
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
