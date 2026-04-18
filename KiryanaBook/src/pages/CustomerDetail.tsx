import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Trash2, FileText, MessageSquare, Plus, Minus, Star, X as XIcon, Edit3, ArrowUpRight, ArrowDownLeft, History, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const CustomerDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { udhaars, contacts, invoices, addUdhaar, deleteCustomer, toggleContactImportance, updateContact } = useShop();
    const { isDarkMode } = useTheme();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showStatement, setShowStatement] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [modalType, setModalType] = useState<'debit' | 'credit'>('debit');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const contact = contacts.find(c => c.name === name);
    const isSupplier = contact?.type === 'supplier';

    const transactions = useMemo(() => {
        const lowerName = name?.toLowerCase().trim();
        return udhaars
            .filter(u => u.customerName?.toLowerCase().trim() === lowerName)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [udhaars, name]);

    const stats = useMemo(() => {
        let totalCredit = 0;
        let totalDebit = 0;
        transactions.forEach(t => {
            if (t.amount > 0) totalDebit += t.amount;
            else totalCredit += Math.abs(t.amount);
        });
        const netBalance = totalDebit - totalCredit;
        return { totalCredit, totalDebit, netBalance };
    }, [transactions]);

    const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleEditCustomer = async () => {
        if (!contact) return;
        if (!editForm.name.trim()) return toast.error('Naam zaruri hai', { icon: '👤' });
        setLoading(true);
        try {
            await updateContact(contact.id, contact.name, {
                name: editForm.name.trim(),
                phone: editForm.phone.trim()
            });
            setShowEditModal(false);
            toast.success('Hishab update ho gaya!', { icon: '✨' });
            if (editForm.name.trim() !== name) {
                navigate(`/customers/${encodeURIComponent(editForm.name.trim())}`, { replace: true });
            }
        } catch (e) {
            toast.error('Masla hua update karne mein');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const val = parseFloat(amount);
        if (!val || val <= 0) return toast.error('Valid amount darj karein', { icon: '⚠️' });
        setLoading(true);
        try {
            if (modalType === 'debit') {
                const finalAmount = isSupplier ? -val : val;
                await addUdhaar(name || '', finalAmount, note || undefined);
                toast.success(isSupplier ? 'Udhaar (Dena) darj ho gaya' : 'Udhaar (Lena) darj ho gaya', { icon: '💸' });
            } else {
                const finalAmount = isSupplier ? val : -val;
                await addUdhaar(name || '', finalAmount, note || undefined);
                toast.success(isSupplier ? 'Payment (Diya) darj ho gaya' : 'Payment (Mila) darj ho gaya', { icon: '💰' });
            }
            setAmount(''); setNote(''); setShowAddModal(false);
        } catch (e) {
            toast.error('Kuch masla hua');
        }
        setLoading(false);
    };

    const handleDelete = () => {
        if (window.confirm(`${name} ka saara data delete karna chahte hain?`)) {
            deleteCustomer(name || '');
            navigate(-1);
            toast.success('Record delete ho gaya', { icon: '🗑️' });
        }
    };

    const handleWhatsApp = () => {
        const phone = contact?.phone || '';
        if (!phone) return toast.error('Phone number nahi hai', { icon: '📱' });
        const msg = encodeURIComponent(`Assalam o Alaikum ${name}! Aap ka baqi Rs. ${Math.abs(stats.netBalance).toLocaleString()} hai. Meherbani kar ke ada kar dein.`);
        
        let cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '92' + cleanPhone.slice(1);
        } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('92')) {
            cleanPhone = '92' + cleanPhone;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('920')) {
            cleanPhone = '92' + cleanPhone.slice(3); 
        }
        
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    };

    const handleToggleStar = async () => {
        if (!contact) return toast.error('Contact record nahi mila');
        try {
            await toggleContactImportance(contact.id);
            toast.success(contact.isImportant ? 'Un-starred' : 'Starred as Important', { icon: '⭐' });
        } catch (e) {
            toast.error('Star update nahi hua');
        }
    };

    const generateStatement = () => {
        const lines = [
            `===== STATEMENT =====`,
            `Name: ${name}`,
            `Type: ${isSupplier ? 'Supplier' : 'Customer'}`,
            `Date: ${new Date().toLocaleDateString('en-PK')}`,
            ``,
            `--- Transactions ---`,
            ...transactions.map(t => {
                const label = t.note || (isSupplier ? (t.amount < 0 ? 'Udhaar Liya' : 'Payment Di') : (t.amount > 0 ? 'Udhaar Diya' : 'Payment Mili'));
                const sign = t.amount > 0 ? '+' : '-';
                return `${new Date(t.date).toLocaleDateString('en-PK')} | ${label} | ${sign}Rs. ${Math.abs(t.amount).toLocaleString()}`;
            }),
            ``,
            `--- Summary ---`,
            `Total Received: Rs. ${stats.totalCredit.toLocaleString()}`,
            `Total Given:    Rs. ${stats.totalDebit.toLocaleString()}`,
            `Net Balance:    Rs. ${Math.abs(stats.netBalance).toLocaleString()} ${stats.netBalance > 0 ? '(Unka Baqi)' : stats.netBalance < 0 ? '(Aapka Baqi)' : '(Settled)'}`,
            `====================`
        ].join('\n');

        const phone = contact?.phone || '';
        if (phone) {
            let cleanPhone = phone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '92' + cleanPhone.slice(1);
            } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('92')) {
                cleanPhone = '92' + cleanPhone;
            }
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines)}`, '_blank');
        } else {
            navigator.clipboard?.writeText(lines).then(() => {
                toast.success('Statement clipboard me copy ho gaya!', { icon: '📋' });
            }).catch(() => {
                setShowStatement(true);
            });
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <PageTransition> 
            <div className={`w-full min-h-screen pb-20 font-outfit max-w-md mx-auto ${isDarkMode ? 'bg-[#050505]' : 'bg-[#FAFAFA]'}`}> 
                {/* DYNAMIC METALLIC HEADER */} 
                <div className="bg-gradient-to-b from-[#0A3D24] to-[#0D4B2D] px-6 pt-10 pb-10 relative overflow-hidden flex flex-col justify-between ">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
                    <div className="absolute top-10 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                    
                    <div className="relative flex items-center justify-between mb-6 z-10">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/20">
                            <ArrowLeft size={20} />
                        </button>
                        <p className="text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em]">{isSupplier ? 'Supplier Ledger' : 'Customer Ledger'}</p>
                        <div className="flex items-center gap-2">
                             <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (contact?.id) {
                                        navigate(`/add-contact?id=${contact.id}`);
                                    } else {
                                        toast.error('Contact data loading ho raha hai...', { icon: '⏳' });
                                    }
                                }} 
                                className="w-11 h-11 bg-white/15 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer z-50"
                            >
                                <Edit3 size={18} className="text-white" />
                            </button>
                            <button onClick={handleDelete} className="w-10 h-10 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                                <Trash2 size={16} className="text-rose-400" />
                            </button>
                        </div>
                    </div>

                    <div className="relative flex items-center gap-4 mb-6 z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-[22px] font-black shadow-lg border border-emerald-300 drop-shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-150%]" />
                            {initials}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-white font-black text-[26px] leading-tight tracking-tight drop-shadow-md">{name}</h1>
                                {/* STAR BUTTON */}
                                <button 
                                    onClick={handleToggleStar}
                                    className={`p-1.5 rounded-full transition-all duration-300 active:scale-75 shadow-lg ${contact?.isImportant ? 'text-yellow-400 bg-yellow-400/20 border border-yellow-400' : 'text-white/40 bg-white/10 border border-white/10'}`}
                                >
                                    <Star size={18} fill={contact?.isImportant ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <p className="text-emerald-200/80 text-[14px] font-bold mt-1 tracking-wide">{isSupplier ? 'Shop Supplier' : 'Regular Customer'}</p>
                        </div>
                    </div>

                    <div className="relative grid grid-cols-3 gap-3 z-10">
                        <button 
                            onClick={() => {
                                let p = contact?.phone || '';
                                if (!p) return toast.error('Number nahi hai');
                                window.location.href=`tel:${p}`;
                            }} 
                            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-2 flex flex-col items-center gap-1 shadow-md active:scale-95 transition-all text-white"
                        >
                            <Phone size={18} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Call</span>
                        </button>
                        <button onClick={handleWhatsApp} className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-2xl py-2 flex flex-col items-center gap-1 shadow-md active:scale-95 transition-all text-emerald-300">
                            <MessageSquare size={18} />
                            <span className="text-[9px] font-black uppercase tracking-wider">WhatsApp</span>
                        </button>
                        <button onClick={generateStatement} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-2 flex flex-col items-center gap-1 shadow-md active:scale-95 transition-all text-white">
                            <FileText size={18} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Msg</span>
                        </button>
                    </div>
                </div>

                {/* PREMIUM GLOSSY NET BALANCE CARD */}
                <div className="px-5 -mt-8 relative z-20">
                    <motion.div 
                       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                       className="rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border bg-white dark:bg-[#141414] dark:border-white/10 border-gray-100 relative overflow-hidden backdrop-blur-2xl"
                    >
                        {/* Decorative Gradient Blob Array inside Card */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 blur-2xl rounded-full" />

                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">Final Balance</p>
                                <p className={`text-[32px] font-black leading-none tracking-tighter drop-shadow-sm ${
                                    isSupplier 
                                    ? (stats.netBalance < 0 ? 'text-rose-500' : stats.netBalance > 0 ? 'text-emerald-500' : 'text-gray-400')
                                    : (stats.netBalance > 0 ? 'text-rose-500' : stats.netBalance < 0 ? 'text-emerald-500' : 'text-gray-400')
                                }`}>
                                    Rs. {Math.abs(stats.netBalance).toLocaleString()}
                                </p>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mt-3 shadow-inner ${
                                    isSupplier
                                    ? (stats.netBalance < 0 ? 'bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' : stats.netBalance > 0 ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 text-gray-500')
                                    : (stats.netBalance > 0 ? 'bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' : stats.netBalance < 0 ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 text-gray-500')
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stats.netBalance !== 0 ? 'bg-current' : 'bg-transparent'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                       {isSupplier
                                       ? (stats.netBalance < 0 ? 'Dena Hai' : stats.netBalance > 0 ? 'Advance Diya' : 'SETTLED')
                                       : (stats.netBalance > 0 ? 'Lene Hain' : stats.netBalance < 0 ? 'Aapka Baqi' : 'SETTLED')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-4 rounded-[1.25rem] border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1A1A1A] shadow-inner transition-transform hover:scale-[1.02]">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                       <ArrowDownLeft size={12} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{isSupplier ? 'Total Diya' : 'Total Mila'}</p>
                                </div>
                                <p className="text-emerald-600 dark:text-emerald-400 text-[18px] font-black tracking-tight">Rs. {stats.totalCredit.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-[1.25rem] border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1A1A1A] shadow-inner transition-transform hover:scale-[1.02]">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                       <ArrowUpRight size={12} className="text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{isSupplier ? 'Total Liya' : 'Total Diya'}</p>
                                </div>
                                <p className="text-rose-600 dark:text-rose-400 text-[18px] font-black tracking-tight">Rs. {stats.totalDebit.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* TRANSACTIONS HISTORY */}
                <div className="px-5 mt-10">
                    <p className="text-[15px] font-black mb-5 px-1 text-gray-900 dark:text-white flex items-center gap-2">
                       <History size={20} className="text-gray-400" /> 
                       Transactions History
                    </p>
                    <div className="space-y-4">
                        {transactions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-60">
                               <MessageSquare size={40} className="text-gray-300 dark:text-gray-700 mb-3" />
                               <p className="text-center text-[13px] font-bold text-gray-500">Koi transaction nahi he abhi</p>
                            </div>
                        )}
                        {transactions.map(t => {
                            const invNoMatch = t.note?.match(/INV-[\d-]+/);
                            const invoiceIdFromNote = invNoMatch ? invoices.find(inv => inv.invoiceNumber === invNoMatch[0])?.id : null;

                            return (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                  key={t.id} 
                                  onClick={() => {
                                      if (invoiceIdFromNote) navigate(`/invoice/${invoiceIdFromNote}`);
                                  }}
                                  className={`bg-white dark:bg-[#141414] p-4 rounded-[1.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${invoiceIdFromNote ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border shrink-0 ${t.amount < 0 ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 border-rose-100 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20'}`}>
                                            {t.amount < 0 ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownLeft size={20} strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="min-w-0 overflow-hidden">
                                                <motion.p 
                                                  animate={(t.note?.length || 0) > 20 ? { x: [0, -150, 0] } : {}}
                                                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                  className="text-[15px] font-black text-gray-900 dark:text-white whitespace-nowrap"
                                                >
                                                   {t.note || (isSupplier ? (t.amount < 0 ? 'Udhaar Liya' : 'Payment Di') : (t.amount > 0 ? 'Udhaar Diya' : 'Payment Mili'))}
                                                </motion.p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] font-bold text-gray-400">{formatDate(t.date)}</p>
                                                {invoiceIdFromNote && (
                                                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                                        View Bill
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-[17px] font-black tracking-tighter shrink-0 ml-4 tabular-nums ${
                                        isSupplier 
                                        ? (t.amount < 0 ? 'text-rose-500' : 'text-emerald-500')
                                        : (t.amount > 0 ? 'text-rose-500' : 'text-emerald-500')
                                    }`}>
                                       {t.amount > 0 ? '+' : '-'} Rs. {Math.abs(t.amount).toLocaleString()}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* DYNAMIC FLOATING ACTIONS */}
                <div className="fixed bottom-6 inset-x-0 mx-auto max-w-md px-5 z-[80]">
                    {/* Glassy pill backdrop */}
                    <div className="flex gap-3 bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-3xl p-2 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10">
                        <button 
                            onClick={() => { setModalType('debit'); setShowAddModal(true); }}
                            className="flex-1 bg-gradient-to-br from-rose-500 to-red-600 text-white py-4 rounded-[1.5rem] shadow-lg shadow-rose-500/30 active:scale-95 transition-all duration-300 font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                            <Minus size={18} strokeWidth={3.5} className="group-active:-translate-y-0.5 transition-transform" /> {isSupplier ? 'Liye (Debt)' : 'Diye (Udhaar)'}
                        </button>
                        <button 
                            onClick={() => { setModalType('credit'); setShowAddModal(true); }}
                            className="flex-1 bg-gradient-to-br from-emerald-500 to-teal-600 text-white py-4 rounded-[1.5rem] shadow-lg shadow-emerald-500/30 active:scale-95 transition-all duration-300 font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                            <Plus size={18} strokeWidth={3.5} className="group-active:-translate-y-0.5 transition-transform" /> {isSupplier ? 'Diye (Pay)' : 'Miley (Cash)'}
                        </button>
                    </div>
                </div>

                {/* PREMIUM ENTRY BOTTOM SHEET MODAL */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 z-[120] flex items-end justify-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div 
                               initial={{ y: '100%', scale: 0.95 }} 
                               animate={{ y: 0, scale: 1 }} 
                               exit={{ y: '100%', scale: 0.95 }} 
                               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                               className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-t-[2.5rem] p-7 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] border-t border-gray-100 dark:border-white/10"
                            >
                                {/* Drag Handle */}
                                <div className="absolute top-3 inset-x-0 mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                                
                                <div className="flex items-center justify-between mb-8 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modalType === 'debit' ? 'bg-rose-100 text-rose-500 dark:bg-rose-500/20' : 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20'}`}>
                                            {modalType === 'debit' ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                                        </div>
                                        <h3 className="text-[20px] font-black text-gray-900 dark:text-white leading-none">
                                            {isSupplier ? (modalType === 'debit' ? 'Udhaar Liya' : 'Payment Di') : (modalType === 'debit' ? 'Udhaar Diya' : 'Wapsi (Miley)')}
                                        </h3>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"><XIcon size={16} className="text-gray-500" /></button>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* AMOUNT ENTRY (Centered, Massive) */}
                                    <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1A1A1A] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-inner">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Cash Amount</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[24px] font-black ${modalType === 'debit' ? 'text-rose-500' : 'text-emerald-500'}`}>Rs.</span>
                                            <input 
                                                type="number" 
                                                autoFocus 
                                                value={amount} 
                                                onChange={e => setAmount(e.target.value)} 
                                                placeholder="0"
                                                className={`w-full max-w-[200px] bg-transparent font-black text-[54px] tracking-tighter outline-none text-center ${modalType === 'debit' ? 'text-rose-500' : 'text-emerald-500'} placeholder:text-gray-300 dark:placeholder:text-gray-700`} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Note Input */}
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                           <FileText size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={note} 
                                            onChange={e => setNote(e.target.value)} 
                                            placeholder="Note / Detail (Optional)" 
                                            className="w-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-[1.25rem] py-4.5 pl-12 pr-5 font-bold text-[14px] outline-none focus:border-blue-500/50 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 shadow-sm" 
                                        />
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={handleSave} 
                                        disabled={loading || !amount || amount === '0'} 
                                        className={`w-full py-5 rounded-[1.5rem] font-black text-[15px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 ${
                                            modalType === 'debit' ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'
                                        } text-white`}
                                    >
                                        {loading ? 'DURUST KAR RAHE HAIN...' : 'ENTRY SAVE KAREIN'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* EDIT CUSTOMER MODAL */}
                <AnimatePresence>
                    {showEditModal && (
                        <div className="fixed inset-0 z-[130] flex items-end justify-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                            <motion.div initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-t-[2.5rem] p-8 pb-12 shadow-2xl">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6" />
                                <h3 className="text-[20px] font-black mb-6 text-gray-900 dark:text-white">Profile Update</h3>
                                
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"><UserCircle size={18} /></div>
                                        <input 
                                            type="text" 
                                            value={editForm.name} 
                                            onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                            placeholder="Naam"
                                            className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-2 border-transparent focus:border-emerald-500/20 rounded-[1.25rem] py-4 pl-12 pr-5 font-black text-[15px] outline-none transition-all text-gray-900 dark:text-white" 
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"><Phone size={18} /></div>
                                        <input 
                                            type="tel" 
                                            value={editForm.phone} 
                                            onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                                            placeholder="Phone Number"
                                            className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-2 border-transparent focus:border-emerald-500/20 rounded-[1.25rem] py-4 pl-12 pr-5 font-black text-[15px] outline-none transition-all text-gray-900 dark:text-white" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleEditCustomer} 
                                        disabled={loading || !editForm.name} 
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-[1.5rem] font-black text-[14px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30 active:scale-95 transition-all mt-4 disabled:opacity-50"
                                    >
                                        {loading ? 'SABOOT TABDEEL HO RHA HAI...' : 'UPDATE PROFILE'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* STATEMENT MODAL (fallback if no phone) */}
                <AnimatePresence>
                    {showStatement && (
                        <div className="fixed inset-0 z-[130] flex items-end justify-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStatement(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-t-[2.5rem] p-6 pb-10 shadow-2xl max-h-[80vh] overflow-y-auto">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-5" />
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[18px] font-black text-gray-900 dark:text-white">Full Statement</h3>
                                    <button onClick={() => setShowStatement(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><XIcon size={16} className="text-gray-500" /></button>
                                </div>
                                
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-[1.5rem] p-5 mb-5 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                                    <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Account Statement</p>
                                    <p className="text-[22px] font-black leading-none drop-shadow-sm">{name}</p>
                                    <p className="text-emerald-100 text-[11px] font-bold mt-2">{isSupplier ? 'Supplier' : 'Customer'} • {new Date().toLocaleDateString('en-PK')}</p>
                                </div>
                                
                                <div className="space-y-3 mb-5">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
                                            <div>
                                                <p className="text-[14px] font-bold text-gray-900 dark:text-white">{t.note || (t.amount > 0 ? 'Udhaar (Debt)' : 'Payment (Wasooli)')}</p>
                                                <p className="text-[11px] font-bold text-gray-400">{formatDate(t.date)}</p>
                                            </div>
                                            <p className={`text-[15px] font-black ${t.amount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {t.amount > 0 ? '+' : '-'}Rs.{Math.abs(t.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-[1.5rem] p-5 space-y-3 border border-gray-100 dark:border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-[12px] font-bold text-gray-500">Total Received</span>
                                        <span className="text-[14px] font-black text-emerald-500">Rs. {stats.totalCredit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[12px] font-bold text-gray-500">Total Given</span>
                                        <span className="text-[14px] font-black text-rose-500">Rs. {stats.totalDebit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-3 mt-1">
                                        <span className="text-[14px] font-black text-gray-900 dark:text-white">Net Balance</span>
                                        <span className={`text-[16px] font-black ${stats.netBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>Rs. {Math.abs(stats.netBalance).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleWhatsApp()}
                                    className="w-full mt-6 bg-[#25D366] text-white py-4.5 rounded-[1.5rem] font-black text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/30 active:scale-95 transition-all"
                                >
                                    <MessageSquare size={18} /> WARN ON WHATSAPP
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};
