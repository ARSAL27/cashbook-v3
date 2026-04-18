import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Coffee, Home, Zap, PenTool, Info, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const AddExpense: React.FC = () => {
    const { addExpense } = useShop();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState('Chai/Snacks');
    const [otherText, setOtherText] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = [
        { name: 'Chai/Snacks', icon: <Coffee size={18} />, color: '#FF9800' },
        { name: 'Bill (Bijli/Gas)', icon: <Zap size={18} />, color: '#2196F3' },
        { name: 'Dokan Rent', icon: <Home size={18} />, color: '#9C27B0' },
        { name: 'Stationery', icon: <PenTool size={18} />, color: '#4CAF50' },
        { name: 'Staff Kharcha', icon: <Wallet size={18} />, color: '#E91E63' },
        { name: 'Other', icon: <Info size={18} />, color: '#607D8B' },
    ];

    const handleSave = async () => {
        const val = parseFloat(amount);
        if (!val || val <= 0) return toast.error('Amount sahi likhein');
        const finalCategory = category === 'Other' ? (otherText.trim() || 'Other') : category;
        setLoading(true);
        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
            await addExpense(val, note || finalCategory, finalCategory);
            toast.success('Kharcha darj ho gaya');
            navigate(-1);
        } catch (e) {
            toast.error('Kuch galti hui');
        }
        setLoading(false);
    };

    const colors = {
        bg: isDarkMode ? '#0A0A0A' : '#FAFAFA',
        card: isDarkMode ? '#141414' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        sub: isDarkMode ? '#B0B0B0' : '#6B7280',
        border: isDarkMode ? '#2A2A2A' : '#F3F4F6'
    };

    return (
        <PageTransition> <div className="w-full font-outfit max-w-md mx-auto bg-background text-text-primary ">
                {/* HEADER */}
                <div className="pt-12 pb-3 px-5 flex items-center justify-between sticky top-0 z-50 bg-inherit border-b border-border">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-card shadow-sm border border-border text-text-primary">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[17px] font-black text-text-primary">Cash Out (Kharcha)</h1>
                    <div className="w-10" />
                </div>

                <div className="px-5 pt-8">
                    {/* INFO BOX */}
                    <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl flex items-start gap-3 mb-8 border border-blue-100 dark:border-blue-500/20">
                        <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 leading-relaxed">
                            Ye page sirf dukaan ke chotay kharchon (Tea, Bill, Rent) ke liye hai. <br/>
                            <span className="text-red-500 font-black italic underline decoration-red-500/30">Merchandise/Stock khareedne ke liye ye use Na karein.</span>
                        </p>
                    </div>

                    {/* AMOUNT INPUT */}
                    <div className="mb-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-text-muted">Kitna Kharcha Hua?</p>
                        <div className="relative inline-flex items-center">
                            <span className="text-[24px] font-black mr-2 opacity-50 text-text-primary">Rs.</span>
                            <input 
                                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder="0.00" autoFocus
                                className="bg-transparent text-[48px] font-black outline-none border-b-2 border-dashed border-border w-48 text-center text-text-primary"
                            />
                        </div>
                    </div>

                    {/* CATEGORY SELECTION */}
                    <div className="mb-8">
                        <p className="text-[11px] font-black uppercase tracking-widest mb-4 pl-1" style={{ color: colors.sub }}>Category Select Karein</p>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((cat) => (
                                <motion.button 
                                    key={cat.name} 
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setCategory(cat.name)}
                                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${category === cat.name ? 'border-transparent shadow-lg scale-105' : 'border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] opacity-50'}`}
                                    style={{ 
                                        backgroundColor: category === cat.name ? cat.color : '',
                                        color: category === cat.name ? 'white' : colors.text
                                    }}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${category === cat.name ? 'bg-white/20' : 'bg-gray-50 dark:bg-white/5'}`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-tight text-left leading-tight">{cat.name}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Custom input when 'Other' is selected */}
                        {category === 'Other' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 overflow-hidden"
                            >
                                <input
                                    type="text"
                                    autoFocus
                                    value={otherText}
                                    onChange={e => setOtherText(e.target.value)}
                                    placeholder="Apna kharcha category likhein... (e.g. Truck Kiraya)"
                                    className="w-full bg-white dark:bg-[#141414] border-2 border-[#607D8B]/40 focus:border-[#607D8B] rounded-2xl px-4 py-3.5 text-[14px] font-bold outline-none transition-all"
                                    style={{ color: colors.text }}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* NOTE SECTION */}
                    <div className="mb-8">
                        <p className="text-[11px] font-black uppercase tracking-widest mb-3 pl-1 text-text-muted">Kharcha Detail (Optional)</p>
                        <textarea 
                            value={note} onChange={e => setNote(e.target.value)}
                            placeholder="Ziyada detail likh saktay hein..."
                            className="w-full h-24 p-4 rounded-2xl bg-card border border-border text-[13px] font-medium resize-none shadow-sm focus:border-primary/50 outline-none transition-all text-text-primary"
                        />
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="fixed bottom-6 inset-x-0 max-w-md mx-auto px-5 bg-inherit z-50">
                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        onClick={handleSave}
                        className={`w-full py-4 rounded-[2rem] font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${loading ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: isDarkMode ? '#FF5252' : '#0A3D24', color: 'white' }}
                    >
                        {loading ? 'Bachat...' : <><Save size={18} /> Kharcha Save Karein</>}
                    </motion.button>
                </div>
            </div>
        </PageTransition>
    );
};
