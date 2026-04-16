import React, { useEffect, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop, type Notification } from '../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, AlertTriangle, CreditCard, User, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export const NotificationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { notifications, markNotificationRead, contacts } = useShop();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const [notification, setNotification] = useState<Notification | null>(null);

    const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
    const card = isDarkMode ? '#141414' : '#FFFFFF';
    const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
    const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
    const sub = isDarkMode ? '#B0B0B0' : '#888888';

    useEffect(() => {
        if (id) {
            const found = notifications.find(n => n.id === id);
            if (found) {
                setNotification(found);
                if (!found.read) {
                    markNotificationRead(id);
                }
            }
        }
    }, [id, notifications, markNotificationRead]);

    if (!notification) {
        return (
            <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: bg, color: text }}>
                <p>Notification not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary">Go Back</button>
            </div>
        );
    }

    const getIconInfo = (type: string) => {
        switch (type) {
            case 'stock': return { icon: <AlertTriangle size={36} className="text-amber-500" />, bg: 'bg-amber-500/10' };
            case 'payment': return { icon: <CreditCard size={36} className="text-emerald-500" />, bg: 'bg-emerald-500/10' };
            case 'customer': return { icon: <User size={36} className="text-blue-500" />, bg: 'bg-blue-500/10' };
            case 'supplier': return { icon: <User size={36} className="text-purple-500" />, bg: 'bg-purple-500/10' };
            default: return { icon: <Bell size={36} className="text-[#0A3D24]" />, bg: 'bg-[#0A3D24]/10' };
        }
    };

    const getContactType = (message: string) => {
        const contact = contacts.find(c => message.toLowerCase().includes(c.name.toLowerCase()));
        if (contact) return `(${contact.type === 'supplier' ? 'Supplier' : 'Customer'})`;
        return '';
    };

    const iconInfo = getIconInfo(notification.type);

    return (
        <PageTransition>
            <div className="w-full min-h-screen pb-8 font-outfit" style={{ backgroundColor: bg }}>
                {/* HEADER */}
                <div className="px-5 pt-5 pb-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: isDarkMode ? '#0A0A0A99' : '#FFFFFF99', borderColor: border }}>
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all border" style={{ backgroundColor: card, borderColor: border, color: text }}>
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Bell size={18} style={{ color: text }} className="opacity-40" fill="currentColor" />
                        <h1 className="text-[17px] font-black tracking-tight uppercase" style={{ color: text }}>Notification</h1>
                    </div>
                    <div className="w-10 h-10" />
                </div>

                <div className="px-5 pt-6 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2.5rem] p-6 border flex flex-col items-center text-center shadow-sm"
                        style={{ backgroundColor: card, borderColor: border }}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${iconInfo.bg}`}>
                            {iconInfo.icon}
                        </div>
                        <h2 className="text-[20px] font-black leading-tight mb-2" style={{ color: text }}>{notification.title}</h2>
                        <span className="text-[10px] opacity-40 font-bold uppercase mb-4" style={{ color: text }}>{getContactType(notification.message)}</span>
                        
                        <div className="w-full h-[1px] bg-border my-4" style={{ backgroundColor: border }} />
                        
                        <p className="text-[14px] leading-relaxed text-left w-full" style={{ color: sub }}>
                            {notification.message}
                        </p>

                        <div className="w-full flex justify-end mt-6">
                            <span className="text-[11px] font-bold opacity-30 uppercase tracking-wider text-text-muted">
                                {new Date(notification.date).toLocaleString()}
                            </span>
                        </div>
                    </motion.div>

                    {notification.relatedId && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => navigate(notification.relatedId!)}
                            className="w-full bg-[#0A3D24] text-white py-4 rounded-[2rem] font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#0A3D24]/20"
                        >
                            View Details 
                            <ExternalLink size={16} />
                        </motion.button>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};
