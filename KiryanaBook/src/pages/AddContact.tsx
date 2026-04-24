import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const { addContact, updateContact, contacts } = useShop();
  const { isDarkMode } = useTheme();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const initialType = searchParams.get('type') === 'supplier' ? 'supplier' : 'customer';
  
  const [type, setType] = useState<'customer' | 'supplier'>(initialType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [balanceDir, setBalanceDir] = useState<'udhaar' | 'advance'>('udhaar');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (editId) {
      const c = contacts.find(x => x.id === editId);
      if (c) {
        setName(c.name);
        setPhone(c.phone || '');
        setAddress(c.address || '');
        setType(c.type);
        // Balance editing is restricted to prevent ledger inconsistency
      }
    }
  }, [editId, contacts]);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#EEEEEE';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  const handleSave = async () => {
    if (loading) return;
    if (!name.trim()) return toast.error('Name zaroori hai');
    setLoading(true);
    try {
      if (editId) {
        const oldContact = contacts.find(x => x.id === editId);
        await updateContact(editId, oldContact?.name || '', { 
          name: name.trim(), 
          phone: phone.trim(),
          address: address.trim() 
        });
        toast.success('Update ho gaya!');
        navigate(-1);
        return;
      }

      // DEDUPLICATION for New Contacts
      const existing = contacts.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
      if (existing) {
          toast.error(`${name} ke naam se pehle hi ${existing.type} mojood hai!`);
          setLoading(false);
          return;
      }

      const formattedPhone = phone.trim();
      const balVal = parseFloat(initialBalance) || 0;
      let finalBalance = 0;
      if (type === 'customer') {
          finalBalance = balanceDir === 'udhaar' ? balVal : -balVal;
      } else {
          finalBalance = balanceDir === 'udhaar' ? -balVal : balVal;
      }

      await addContact({
        name: name.trim(),
        phone: formattedPhone,
        address: address.trim(),
        type,
        initialBalance: finalBalance
      });
      toast.success(`${type === 'customer' ? 'Customer' : 'Supplier'} add ho gaya!`);
      navigate(-1);
    } catch (e) {
      toast.error('Kuch masla hua');
    }
    setLoading(false);
  };


  return (
    <PageTransition> <div className="w-full font-outfit max-w-md mx-auto " style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="px-5 pt-6 pb-6 transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#10251A' : '#0A3D24' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
              <ArrowLeft size={22} />
            </button>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{editId ? 'Edit Contact' : 'Add Contact'}</p>
            <button 
              onClick={() => toast("Ye page naya customer ya supplier add karne ke liye he. Blue buttons se select karein ke kese balance shuru karna he (Lenay hain ya Denay hain).", { icon: 'ℹ️', duration: 4000 })}
              className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center animate-pulse"
            >
              <HelpCircle size={16} className="text-white" />
            </button>
          </div>

          {/* Avatar Placeholder */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 mb-3">
              <User size={32} className="text-white/40" />
            </div>
            <h2 className="text-white font-black text-[15px]">Contact Details</h2>
            <p className="text-white/40 text-[10px] font-medium">Create a new entry in your ledger</p>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-5">

          {/* CONTACT TYPE (Only show if not pre-selected) */}
          {!searchParams.get('type') && (
            <div className="rounded-3xl p-4 border" style={{ backgroundColor: card, borderColor: border }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: sub }}>Contact Type</p>
                <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => setType('customer')}
                    className={`py-3 rounded-2xl font-black text-[12px] transition-all ${type === 'customer' ? 'bg-[#0A3D24] text-white' : 'text-gray-400'}`}
                    style={{ backgroundColor: type === 'customer' ? '#0A3D24' : isDarkMode ? '#1E1E1E' : '#F5F5F5' }}
                >
                    Customer
                </button>
                <button
                    onClick={() => setType('supplier')}
                    className={`py-3 rounded-2xl font-black text-[12px] transition-all ${type === 'supplier' ? 'bg-[#0A3D24] text-white' : 'text-gray-400'}`}
                    style={{ backgroundColor: type === 'supplier' ? '#0A3D24' : isDarkMode ? '#1E1E1E' : '#F5F5F5' }}
                >
                    Supplier
                </button>
                </div>
            </div>
          )}

          {/* CONTACT FORM */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: card, borderColor: border }}>
            {/* Name */}
            <div className="flex items-center gap-3 px-5 py-4 border-b relative" style={{ borderColor: border }}>
              <User size={18} style={{ color: sub }} />
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: sub }}>Full Name *</p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Zahid Hassan"
                  className="w-full bg-transparent outline-none text-[14px] font-bold"
                  style={{ color: text }}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: border }}>
              <Phone size={18} style={{ color: sub }} />
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: sub }}>Phone Number (Optional)</p>
                <div className="flex items-center gap-2">
                  <input
                    value={phone}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9+]/g, '');
                      setPhone(val);
                    }}
                    placeholder="e.g. 03001234567"
                    type="tel"
                    className="w-full bg-transparent outline-none text-[14px] font-bold"
                    style={{ color: text }}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderColor: border }}>
              <MapPin size={18} style={{ color: sub }} />
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: sub }}>Address (Optional)</p>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, City, Area"
                  className="w-full bg-transparent outline-none text-[14px] font-bold"
                  style={{ color: text }}
                />
              </div>
            </div>
          </div>

          {/* INITIAL BALANCE */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: '#0A3D24', display: editId ? 'none' : 'block' }}>
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Initial Ledger Balance</p>
                  <p className="text-white text-[32px] font-black leading-tight">
                    PKR {parseFloat(initialBalance || '0').toLocaleString() || '0.00'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setBalanceDir('udhaar')}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${balanceDir === 'udhaar' ? 'bg-[#FF5252] text-white shadow-lg' : 'bg-white/10 text-white/50'}`}
                  >
                    {type === 'customer' ? 'Lenay Hain' : 'Dena Hai'} (Udhaar)
                  </button>
                  <button
                    onClick={() => setBalanceDir('advance')}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${balanceDir === 'advance' ? 'bg-[#4BFF94] text-[#0A3D24] shadow-lg' : 'bg-white/10 text-white/50'}`}
                  >
                    {type === 'customer' ? 'Milay Hain' : 'Diye Hain'} (Advance)
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                placeholder="0"
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl px-4 py-3 text-[15px] font-bold outline-none border border-white/10"
              />
            </div>
            <div className="px-5 pb-4">
              <p className="text-white/40 text-[9px]">By saving, you establish a permanent record for this merchant in The Sovereign Ledger. Fields marked with * are mandatory.</p>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="w-full bg-[#0A3D24] text-white py-5 rounded-3xl font-black text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : '💾 Save Contact'}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};
