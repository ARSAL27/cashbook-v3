import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, AlertTriangle, CreditCard, Trash2, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { EmptyState } from '../components/EmptyState';

export const Notifications: React.FC = () => {
  const { notifications, clearNotifications, contacts } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#EEEEEE';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#666666';

  const getIcon = (type: string) => {
    switch (type) {
      case 'stock': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'payment': return <CreditCard size={18} className="text-emerald-500" />;
      case 'customer': return <User size={18} className="text-blue-500" />;
      case 'supplier': return <User size={18} className="text-purple-500" />;
      default: return <Bell size={18} className="text-[#0A3D24]" />;
    }
  };

  const getContactType = (message: string) => {
    // Try to find a contact name in the message and return their type
    const contact = contacts.find(c => message.toLowerCase().includes(c.name.toLowerCase()));
    if (contact) return `(${contact.type === 'supplier' ? 'Supplier' : 'Customer'})`;
    return '';
  };

  return (
    <PageTransition>
      <div className="w-full font-outfit max-w-md mx-auto pb-32" style={{ backgroundColor: bg }}>
        
        {/* HEADER */}
        <div className="pt-12 pb-3 sticky top-0 z-50 transition-colors duration-300 px-5 flex items-center justify-between" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-white/60" fill="currentColor" />
              <h1 className="text-xl font-black text-white tracking-tight">Notifications</h1>
            </div>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('Saare notifications delete/clear karein?')) {
                  clearNotifications();
                  toast.success('Notifications cleared');
                }
              }}
              className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 active:scale-90 transition-all"
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="px-5 py-6">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
                <EmptyState 
                  icon={Bell}
                  title="Koi Notification Nahi Hai"
                  description="Jab bhi aapki dukan mein koi khass update hoga, hum aapko yahan inform karenge."
                />
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    onClick={() => {
                        navigate('/notification/' + n.id);
                    }}
                    style={{ backgroundColor: card, borderColor: border }}
                    className={`p-4 rounded-2xl border flex gap-4 items-start active:scale-[0.98] transition-all relative overflow-hidden ${!n.read ? 'border-l-4 border-l-[#0A3D24]' : ''}`}
                  >
                    {!n.read && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full" />}
                    
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center shrink-0">
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[14px]" style={{ color: text }}>{n.title}</h3>
                        <span className="text-[10px] opacity-40 font-bold uppercase">{getContactType(n.message)}</span>
                      </div>
                      <p className="text-[12px] leading-relaxed mb-2 line-clamp-2" style={{ color: sub }}>{n.message}</p>
                      <span className="text-[10px] font-bold opacity-30">{new Date(n.date).toLocaleDateString()} • {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};
