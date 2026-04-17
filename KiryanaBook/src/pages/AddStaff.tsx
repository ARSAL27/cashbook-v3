import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, UserCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const AddStaff: React.FC = () => {
  const { addStaff, profile } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Manager' | 'Cashier' | 'Clerk'>('Manager');
  const [loading, setLoading] = useState(false);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#EEEEEE';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';
  const input = isDarkMode ? '#1E1E1E' : '#F5F5F5';

  const roles = [
    { title: 'Manager', desc: 'Full access to sales, ledger & reports', icon: Shield, color: '#00C853' },
    { title: 'Cashier', desc: 'Can only add sales & udhaar entries', icon: Send, color: '#448AFF' },
    { title: 'Clerk', desc: 'Track stock & view limited reports', icon: UserCheck, color: '#FF9100' }
  ];

  const handleInvite = async () => {
    if ((profile?.plan || 'free').toLowerCase() === 'free') {
      toast.error('Staff Management requires Business/Pro plan');
      navigate('/plans');
      return;
    }
    if (!name.trim()) return toast.error('Name zaroori hai');
    if (!phone.trim()) return toast.error('Phone number zaroori hai');
    setLoading(true);
    try {
      await addStaff({
        name: name.trim(),
        phone: phone.trim(),
        role,
        status: 'inactive' // Verification pending
      });
      toast.success('Staff invitation sent successfully!');
      navigate(-1);
    } catch (e) {
      toast.error('Kuch masla hua');
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="w-full font-outfit max-w-md mx-auto pb-32" style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="bg-[#0A3D24] px-5 pt-6 pb-6 rounded-b-[2rem] relative overflow-hidden">
          <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform mb-6">
            <ArrowLeft size={22} />
          </button>
          
          <div className="relative z-10">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Growth & Trust</p>
            <h1 className="text-white font-black text-[22px] tracking-tight">Invite Staff</h1>
            <p className="text-white/40 text-[11px] font-medium mt-1">Add a new member to Ledger.</p>
          </div>
          
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <UserCheck size={140} className="text-white" />
          </div>
        </div>

        <div className="px-5 pt-8 space-y-6">

          {/* NAME INPUT */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Staff Full Name</p>
            <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ backgroundColor: input, borderColor: border }}>
              <Send size={18} style={{ color: sub }} className="-rotate-45" />
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Fahad Ahmed"
                className="flex-1 bg-transparent outline-none text-[14px] font-bold"
                style={{ color: text }}
              />
            </div>
          </div>

          {/* PHONE INPUT */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Phone Number</p>
            <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ backgroundColor: input, borderColor: border }}>
              <Phone size={18} style={{ color: sub }} />
              <input 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="flex-1 bg-transparent outline-none text-[14px] font-bold"
                style={{ color: text }}
                type="tel"
              />
            </div>
            <p className="text-[9px] font-bold text-gray-400 px-1 mt-1">Invitation code will only be valid for 10 minutes.</p>
          </div>

          {/* ROLE SENDER */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-black uppercase tracking-widest px-1" style={{ color: sub }}>Assign Role</p>
            <div className="space-y-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const active = role === r.title;
                return (
                  <motion.button
                    key={r.title}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r.title as any)}
                    className={`w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all ${active ? 'border-[#0A3D24] dark:border-[#4BFF94] shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: card, borderColor: active ? (isDarkMode ? '#4BFF94' : '#0A3D24') : border }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: r.color + '15', color: r.color }}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-black" style={{ color: text }}>{r.title}</p>
                      <p className="text-[10px] font-medium" style={{ color: sub }}>{r.desc}</p>
                    </div>
                    {active && <div className="w-5 h-5 bg-[#00C853] rounded-full flex items-center justify-center">
                      <Shield size={10} className="text-white" />
                    </div>}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* PERMISSION HIGHLIGHTS */}
          <div className="rounded-3xl p-5 border" style={{ backgroundColor: card, borderColor: border }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#00C853' }}>
              <Shield size={12} /> Permissions for {role}
            </p>
            <div className="grid grid-cols-2 gap-y-3">
              {[
                { label: 'View Ledger', ok: true },
                { label: 'Edit Entries', ok: role === 'Manager' },
                { label: 'Delete Entries', ok: false },
                { label: 'Export Data', ok: role === 'Manager' || role === 'Cashier' }
              ].map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${p.ok ? 'bg-[#00C853]' : 'bg-[#FF5252]'}`} />
                  <p className="text-[11px] font-bold" style={{ color: text }}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* INVITE BUTTON */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleInvite}
            disabled={loading || !phone || !name}
            className="w-full bg-[#0A3D24] text-white py-5 rounded-3xl font-black text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invite'}
            {!loading && <Send size={18} className="translate-y-[-1px]" />}
          </motion.button>
        </div>

      </div>
    </PageTransition>
  );
};
