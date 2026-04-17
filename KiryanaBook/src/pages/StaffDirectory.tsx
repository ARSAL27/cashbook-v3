import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Wallet, Shield, Users, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const StaffDirectory: React.FC = () => {
  const { staff, profile } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const plan = (profile?.plan || 'free').toLowerCase();
  const isLocked = plan === 'free';

  const stats = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'active').length;
    const pendingStaff = staff.filter(s => s.status === 'inactive').length;
    const totalPayout = staff.length * 20000; 
    return { activeStaff, pendingStaff, totalPayout };
  }, [staff]);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  // ── FREE PLAN LOCK SCREEN ──────────────────────────────────────────
  if (isLocked) {
    return (
      <PageTransition>
        <div className="w-full font-outfit max-w-md mx-auto flex flex-col pb-32" style={{ backgroundColor: bg }}>
          {/* HEADER */}
          <div className="bg-[#0A3D24] px-5 pt-6 pb-6 rounded-b-[2rem]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Management</p>
                <h1 className="text-white font-black text-[22px] tracking-tight">Staff Directory</h1>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                <Users size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* UPGRADE WALL */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-[2rem] bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mb-2"
            >
              <Shield size={44} className="text-amber-400" />
            </motion.div>

            <div>
              <h2 className="text-[22px] font-black mb-2" style={{ color: text }}>Staff Feature Locked</h2>
              <p className="text-[13px] font-medium leading-relaxed" style={{ color: sub }}>
                Free plan mein Staff Management ki ijazat nahi hai.{'\n'}
                Pro ya Business plan par upgrade kar ke apni team manage karein.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl border" style={{ backgroundColor: card, borderColor: border }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-amber-500">Pro / Business Plan Mein Milega</p>
              {['Unlimited Staff Members', 'Cashier & Manager Roles', 'Attendance Tracking', 'Monthly Payroll View', 'Activity Logs'].map(f => (
                <div key={f} className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  <p className="text-[12px] font-bold" style={{ color: text }}>{f}</p>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/help')}
              className="w-full py-4 rounded-2xl bg-amber-400 text-[#0A0A0A] font-black text-[14px] shadow-lg shadow-amber-400/30 active:scale-95 transition-all"
            >
              🚀 Upgrade Karen — Plans Dekhein
            </motion.button>

            <button onClick={() => navigate(-1)} className="text-[12px] font-bold" style={{ color: sub }}>
              ← Wapas Jao
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
        <div className="w-full pb-8 font-outfit max-w-md mx-auto" style={{ backgroundColor: bg }}>
        <div className="bg-[#0A3D24] px-5 pt-6 pb-6 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Management</p>
              <h1 className="text-white font-black text-[22px] tracking-tight">Staff Directory</h1>
              <p className="text-white/40 text-[11px] font-medium mt-1">Manage permissions and track attendance.</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
              <Users size={20} className="text-white" />
            </div>
          </div>
          <button 
            onClick={() => {
              if ((profile?.plan || 'free').toLowerCase() === 'free') {
                toast.error('Free plan me staff control nahi he. Upgrade Karen!');
                navigate('/plans');
              } else {
                navigate('/add-staff');
              }
            }}
            className="w-full mt-4 bg-[#4BFF94] text-[#0A3D24] py-3.5 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} strokeWidth={3} />
            Staff Add Karo
          </button>
        </div>

        <div className="px-4 mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl p-5 border" style={{ backgroundColor: card, borderColor: border }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: sub }}>Total Active Staff</p>
              <div className="flex items-end gap-2">
                <p className="text-[28px] font-black leading-none" style={{ color: text }}>{stats.activeStaff.toString().padStart(2, '0')}</p>
                <p className="text-[10px] font-bold text-[#00C853] mb-1">↗ 02 NEW</p>
              </div>
            </div>
            <div className="rounded-3xl p-5 border" style={{ backgroundColor: card, borderColor: border }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: sub }}>Pending Verification</p>
              <p className="text-[28px] font-black leading-none text-[#FF9100]">{stats.pendingStaff.toString().padStart(2, '0')}</p>
              <p className="text-[10px] font-bold" style={{ color: sub }}>Waiting for assignment</p>
            </div>
          </div>
          <div className="rounded-3xl p-5 border bg-[#0A3D24] relative overflow-hidden" style={{ borderColor: '#185536' }}>
            <div className="relative z-10">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Total Monthly Payout</p>
              <p className="text-white text-[28px] font-black leading-none">Rs. {(stats.totalPayout / 1000).toFixed(0)}k</p>
              <p className="text-white/40 text-[10px] font-bold mt-2">Next payout in 15 days</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
              <Wallet size={100} className="text-white" />
            </div>
          </div>
        </div>

        <div className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['All Staff', 'Managers', 'Cashiers', 'Clerks'].map((tab, i) => (
            <button 
              key={tab}
              className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase whitespace-nowrap transition-all ${i === 0 ? 'bg-[#0A3D24] text-white' : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-4 mt-2 space-y-3">
          {staff.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-[#1E1E1E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-bold" style={{ color: sub }}>Koi staff member nahi hai</p>
            </div>
          ) : (
            staff.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/staff/${s.id}`)}
                className="rounded-3xl p-4 border flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="w-12 h-12 bg-[#E2FFED] dark:bg-[#185536] rounded-2xl flex items-center justify-center text-[#0A3D24] dark:text-[#4BFF94] font-black text-[16px] relative">
                  {s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  <div className={`absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#141414] ${s.status === 'active' ? 'bg-[#00C853]' : 'bg-[#FF9100]'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-black" style={{ color: text }}>{s.name}</p>
                    <span className="text-[8px] font-black bg-[#E2FFED] dark:bg-[#185536] text-[#0A3D24] dark:text-[#4BFF94] px-2 py-0.5 rounded-full uppercase">
                      {s.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: sub }}>{s.phone}</p>
                </div>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5">
                  <MoreVertical size={16} style={{ color: sub }} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        <div className="px-4 mt-8">
          <div className="rounded-3xl p-6 border border-dashed text-center" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: border }}>
            <div className="w-12 h-12 bg-gray-100 dark:bg-[#1E1E1E] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={20} className="text-gray-400" />
            </div>
            <h4 className="text-[15px] font-black mb-2" style={{ color: text }}>Need to change access?</h4>
            <p className="text-[11px] font-medium mb-5" style={{ color: sub }}>Update what your managers and cashiers can see. Granting specific permissions helps secure your shop data.</p>
            <button 
              onClick={() => {
                if ((profile?.plan || 'free').toLowerCase() === 'free') {
                  toast.error('Upgrade to Business or Pro to change roles');
                  navigate('/plans');
                } else {
                  navigate('/staff/roles');
                }
              }}
              className="px-6 py-2.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl text-[12px] font-black shadow-sm"
              style={{ color: text }}
            >
              Manage Roles
            </button>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if ((profile?.plan || 'free').toLowerCase() === 'free') {
              toast.error('Staff Management is Pro feature');
              navigate('/plans');
            } else {
              navigate('/add-staff');
            }
          }}
          className="fixed bottom-24 right-5 w-14 h-14 bg-[#4BFF94] rounded-2xl flex items-center justify-center shadow-2xl z-50 border-2 border-[#0A3D24]/10"
        >
          <UserPlus size={24} className="text-[#0A3D24]" strokeWidth={3} />
        </motion.button>
      </div>
    </PageTransition>
  );
};
