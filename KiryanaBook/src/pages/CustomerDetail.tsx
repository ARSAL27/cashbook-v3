import React, { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Trash2, FileText, MessageSquare, Plus, Minus, ChevronRight, Star, X as XIcon, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const CustomerDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { udhaars, contacts, addUdhaar, deleteCustomer, toggleContactImportance, updateContact } = useShop();
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
        return udhaars
            .filter(u => u.customerName === name)
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
        if (!editForm.name.trim()) return toast.error('Naam zaruri hai');
        setLoading(true);
        try {
            await updateContact(contact.id, contact.name, {
                name: editForm.name.trim(),
                phone: editForm.phone.trim()
            });
            setShowEditModal(false);
            toast.success('Hishab update ho gaya!');
            if (editForm.name.trim() !== name) {
                navigate(`/customer/${encodeURIComponent(editForm.name.trim())}`, { replace: true });
            }
        } catch (e) {
            toast.error('Masla hua update karne mein');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const val = parseFloat(amount);
        if (!val || val <= 0) return toast.error('Valid amount darj karein');
        setLoading(true);
        try {
            if (modalType === 'debit') {
                const finalAmount = isSupplier ? -val : val;
                await addUdhaar(name || '', finalAmount, note || undefined);
                toast.success(isSupplier ? 'Udhaar (Dena) darj ho gaya' : 'Udhaar (Lena) darj ho gaya');
            } else {
                const finalAmount = isSupplier ? val : -val;
                await addUdhaar(name || '', finalAmount, note || undefined);
                toast.success(isSupplier ? 'Payment (Diya) darj ho gaya' : 'Payment (Mila) darj ho gaya');
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
            toast.success('Record delete ho gaya');
        }
    };

    const handleWhatsApp = () => {
        const phone = contact?.phone || '';
        if (!phone) return toast.error('Phone number nahi hai');
        const msg = encodeURIComponent(`Assalam o Alaikum ${name}! Aap ka baqi Rs. ${Math.abs(stats.netBalance).toLocaleString()} hai. Meherbani kar ke ada kar dein.`);
        
        let cleanPhone = phone.replace(/[^0-9]/g, '');
        // If it starts with 0, replace with 92. If it's 10 digits and doesn't start with 92, add 92.
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '92' + cleanPhone.slice(1);
        } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('92')) {
            cleanPhone = '92' + cleanPhone;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('920')) {
            cleanPhone = '92' + cleanPhone.slice(3); // Handle cases like 920300...
        }
        
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    };

    const handleToggleStar = async () => {
        if (!contact) return toast.error('Contact record nahi mila');
        try {
            await toggleContactImportance(contact.id);
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

        // Share via WhatsApp if possible
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
            // Fallback - copy to clipboard
            navigator.clipboard?.writeText(lines).then(() => {
                toast.success('Statement clipboard me copy ho gaya!');
            }).catch(() => {
                setShowStatement(true);
            });
        }
    };

    const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
    const card = isDarkMode ? '#141414' : '#FFFFFF';
    const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
    const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
    const sub = isDarkMode ? '#B0B0B0' : '#888888';

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <PageTransition>
            <div className="w-full pb-8 font-outfit max-w-md mx-auto" style={{ backgroundColor: bg }}>
                {/* HEADER */}
                <div className="bg-[#0A3D24] px-5 pt-5 pb-6">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
                            <ArrowLeft size={22} />
                        </button>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{isSupplier ? 'Supplier Ledger' : 'Customer Ledger'}</p>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => {
                                    setEditForm({ name: contact?.name || name || '', phone: contact?.phone || '' });
                                    setShowEditModal(true);
                                }} 
                                className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <Edit3 size={14} className="text-white" />
                            </button>
                            <button onClick={handleDelete} className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center active:scale-90 transition-transform">
                                <Trash2 size={15} className="text-red-400" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 bg-[#185536] rounded-2xl flex items-center justify-center text-[#4BFF94] text-[22px] font-black border border-[#4BFF94]/20">
                            {initials}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-white font-black text-[20px] leading-tight">{name}</h1>
                                {/* STAR BUTTON - tap to toggle importance */}
                                <button 
                                    onClick={handleToggleStar}
                                    className={`p-1.5 rounded-full transition-all active:scale-75 ${contact?.isImportant ? 'text-amber-400 bg-amber-400/20' : 'text-white/30 bg-white/5'}`}
                                >
                                    <Star size={18} fill={contact?.isImportant ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <p className="text-white/50 text-[12px] font-medium">{isSupplier ? 'Shop Supplier' : 'Regular Customer'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => {
                                let p = contact?.phone || '';
                                if (!p) return toast.error('Number nahi hai');
                                window.location.href=`tel:${p}`;
                            }} 
                            className="bg-white/10 border border-white/5 rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                        >
                            <Phone size={18} className="text-white" />
                            <span className="text-white text-[10px] font-bold">Call</span>
                        </button>
                        <button onClick={handleWhatsApp} className="bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                            <MessageSquare size={18} className="text-[#25D366]" />
                            <span className="text-[#25D366] text-[10px] font-bold">WhatsApp</span>
                        </button>
                        <button onClick={generateStatement} className="bg-white/10 rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                            <FileText size={18} className="text-white" />
                            <span className="text-white text-[10px] font-bold">Statement</span>
                        </button>
                    </div>
                </div>

                {/* NET BALANCE CARD */}
                <div className="px-4 -mt-2">
                    <div className="rounded-3xl p-5 border shadow-sm" style={{ backgroundColor: card, borderColor: border }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: sub }}>Final Balance</p>
                                <p className={`text-[32px] font-black leading-none ${
                                    isSupplier 
                                    ? (stats.netBalance < 0 ? 'text-[#FF5252]' : stats.netBalance > 0 ? 'text-[#00C853]' : 'text-gray-400')
                                    : (stats.netBalance > 0 ? 'text-[#FF5252]' : stats.netBalance < 0 ? 'text-[#00C853]' : 'text-gray-400')
                                }`}>
                                    Rs. {Math.abs(stats.netBalance).toLocaleString()}
                                </p>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mt-2 inline-block ${
                                    isSupplier
                                    ? (stats.netBalance < 0 ? 'bg-red-100 text-red-600' : stats.netBalance > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')
                                    : (stats.netBalance > 0 ? 'bg-red-100 text-red-600' : stats.netBalance < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')
                                }`}>
                                    {isSupplier
                                    ? (stats.netBalance < 0 ? '● Dena Hai' : stats.netBalance > 0 ? '● Advance Diya' : '✓ SETTLED')
                                    : (stats.netBalance > 0 ? '● Unka Baqi' : stats.netBalance < 0 ? '● Aapka Baqi' : '✓ SETTLED')}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-2xl" style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9F9F9' }}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C853]" />
                                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: sub }}>{isSupplier ? 'Total Diya' : 'Total Mila'}</p>
                                </div>
                                <p className="text-[#00C853] text-[16px] font-black">Rs. {stats.totalCredit.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-2xl" style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9F9F9' }}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5252]" />
                                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: sub }}>{isSupplier ? 'Total Liya' : 'Total Diya'}</p>
                                </div>
                                <p className="text-[#FF5252] text-[16px] font-black">Rs. {stats.totalDebit.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRANSACTIONS */}
                <div className="px-4 mt-6">
                    <p className="text-[14px] font-black mb-3 px-1" style={{ color: text }}>Transactions History</p>
                    <div className="space-y-2">
                        {transactions.length === 0 && (
                            <p className="text-center text-[13px] py-8 opacity-40 font-bold">Koi transaction nahi he abhi</p>
                        )}
                        {transactions.map(t => (
                            <div key={t.id} className="bg-white dark:bg-[#141414] p-4 rounded-2xl border flex items-center justify-between shadow-sm" style={{ borderColor: border }}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.amount < 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-green-50 dark:bg-green-500/10 text-green-500'}`}>
                                        {t.amount < 0 ? <ArrowLeft size={18} /> : <ChevronRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold" style={{ color: text }}>{t.note || (isSupplier ? (t.amount < 0 ? 'Udhaar Liya' : 'Payment Di') : (t.amount > 0 ? 'Udhaar Diya' : 'Payment Mili'))}</p>
                                        <p className="text-[10px] font-medium" style={{ color: sub }}>{formatDate(t.date)}</p>
                                    </div>
                                </div>
                                <p className={`text-[15px] font-black ${
                                    isSupplier 
                                    ? (t.amount < 0 ? 'text-[#FF5252]' : 'text-[#00C853]')
                                    : (t.amount > 0 ? 'text-[#FF5252]' : 'text-[#00C853]')
                                }`}>
                                   {t.amount > 0 ? '+' : '-'} Rs. {Math.abs(t.amount).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FLOATING ACTIONS */}
                <div className="fixed bottom-32 inset-x-0 px-4 flex gap-3 max-w-md mx-auto z-[90]">
                    <button 
                        onClick={() => { setModalType('debit'); setShowAddModal(true); }}
                        className="flex-1 bg-red-500 text-white py-4 rounded-2xl shadow-lg active:scale-95 transition-all font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Minus size={18} strokeWidth={3} /> {isSupplier ? 'Liye (Debt)' : 'Diye (Udhaar)'}
                    </button>
                    <button 
                        onClick={() => { setModalType('credit'); setShowAddModal(true); }}
                        className="flex-1 bg-[#0A3D24] text-white py-4 rounded-2xl shadow-lg active:scale-95 transition-all font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Plus size={18} strokeWidth={3} /> {isSupplier ? 'Diye (Pay)' : 'Miley (Cash)'}
                    </button>
                </div>

                {/* ENTRY MODAL */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 z-[100] flex items-end justify-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-t-[2.5rem] p-6 pb-10 shadow-2xl">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-5" />
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[18px] font-black">{isSupplier ? (modalType === 'debit' ? 'Maine Udhaar Liya' : 'Maine Payment Di') : (modalType === 'debit' ? 'Maine Udhaar Diya' : 'Mila Hishab')}</h3>
                                    <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <XIcon size={16} />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Amount */}
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Cash Amount *</p>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">Rs.</span>
                                            <input 
                                                type="number" 
                                                autoFocus 
                                                value={amount} 
                                                onChange={e => setAmount(e.target.value)} 
                                                className="w-full bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl py-4 pl-12 pr-4 font-black text-[20px] outline-none border-2 border-transparent focus:border-[#0A3D24]/20 transition-all text-black dark:text-white" 
                                            />
                                        </div>
                                    </div>
                                    {/* Note (Optional) */}
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Note (Optional)</p>
                                        <input 
                                            type="text" 
                                            value={note} 
                                            onChange={e => setNote(e.target.value)} 
                                            placeholder="e.g. Grocery bill, monthly payment..." 
                                            className="w-full bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl py-4 px-4 font-bold text-[14px] outline-none border-2 border-transparent focus:border-[#0A3D24]/20 transition-all text-black dark:text-white placeholder:text-gray-300" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSave} 
                                        disabled={loading || !amount} 
                                        className="w-full bg-[#0A3D24] text-white py-4 rounded-2xl font-black text-[15px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'ENTRY SAVE'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* EDIT CUSTOMER MODAL */}
                <AnimatePresence>
                    {showEditModal && (
                        <div className="fixed inset-0 z-[110] flex items-end justify-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-t-[2.5rem] p-8 pb-12 shadow-2xl">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6" />
                                <h3 className="text-[20px] font-black mb-6" style={{ color: text }}>Hishab ki Tafseelat</h3>
                                
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Customer/Supplier Naam</p>
                                        <input 
                                            type="text" 
                                            value={editForm.name} 
                                            onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                            className="w-full bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl py-4 px-5 font-black text-[16px] outline-none border-2 border-transparent focus:border-[#0A3D24]/20 transition-all text-black dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Mobile Number</p>
                                        <input 
                                            type="tel" 
                                            value={editForm.phone} 
                                            onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                                            className="w-full bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl py-4 px-5 font-black text-[16px] outline-none border-2 border-transparent focus:border-[#0A3D24]/20 transition-all text-black dark:text-white" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleEditCustomer} 
                                        disabled={loading || !editForm.name} 
                                        className="w-full bg-[#0A3D24] text-white py-5 rounded-[2rem] font-black text-[14px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4 disabled:opacity-50"
                                    >
                                        {loading ? 'SABOOT TABDEEL HO RHA HAI...' : 'TABDEELI SAVE KAREIN'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* STATEMENT MODAL (fallback if no phone) */}
                <AnimatePresence>
                    {showStatement && (
                        <div className="fixed inset-0 z-[100] flex items-end justify-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStatement(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-t-[2.5rem] p-6 pb-10 shadow-2xl max-h-[80vh] overflow-y-auto">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-5" />
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[18px] font-black">Statement</h3>
                                    <button onClick={() => setShowStatement(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><XIcon size={16} /></button>
                                </div>
                                {/* Header */}
                                <div className="bg-[#0A3D24] text-white rounded-2xl p-4 mb-4">
                                    <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Account Statement</p>
                                    <p className="text-[18px] font-black">{name}</p>
                                    <p className="text-white/50 text-[11px]">{isSupplier ? 'Supplier' : 'Customer'} • {new Date().toLocaleDateString('en-PK')}</p>
                                </div>
                                {/* Txns */}
                                <div className="space-y-2 mb-4">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex items-center justify-between py-2.5 border-b dark:border-gray-800">
                                            <div>
                                                <p className="text-[13px] font-bold">{t.note || (t.amount > 0 ? 'Udhaar' : 'Payment')}</p>
                                                <p className="text-[10px] text-gray-400">{formatDate(t.date)}</p>
                                            </div>
                                            <p className={`text-[14px] font-black ${t.amount > 0 ? 'text-[#FF5252]' : 'text-[#00C853]'}`}>
                                                {t.amount > 0 ? '+' : '-'}Rs.{Math.abs(t.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {/* Summary */}
                                <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-[12px] text-gray-500">Total Received</span>
                                        <span className="text-[13px] font-black text-[#00C853]">Rs. {stats.totalCredit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[12px] text-gray-500">Total Given</span>
                                        <span className="text-[13px] font-black text-[#FF5252]">Rs. {stats.totalDebit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t dark:border-gray-700 pt-2">
                                        <span className="text-[13px] font-black">Net Balance</span>
                                        <span className={`text-[15px] font-black ${stats.netBalance > 0 ? 'text-[#FF5252]' : 'text-[#00C853]'}`}>Rs. {Math.abs(stats.netBalance).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleWhatsApp}
                                    className="w-full mt-6 bg-[#0A3D24] text-[#4BFF94] py-5 rounded-[2rem] font-black text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all"
                                >
                                    <MessageSquare size={18} /> SEND ON WHATSAPP
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};
