import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Filter, FileText, User, TrendingUp, DollarSign, Edit3, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export const StaffActivity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { staff, activities } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const member = useMemo(() => staff.find(s => s.id === id), [staff, id]);
  const memberActivities = useMemo(() => activities.filter(a => a.staffId === id), [activities, id]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayActions = memberActivities.filter(a => a.date.startsWith(today)).length;
    const weeklyActions = memberActivities.length; // Simplified
    return { todayActions, weeklyActions };
  }, [memberActivities]);

  if (!member) return <div className="p-8 text-center font-outfit">Staff member nahi mila.</div>;

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign size={14} className="text-[#00C853]" />;
      case 'expense': return <DollarSign size={14} className="text-[#FF5252]" />;
      case 'customer': return <UserPlus size={14} className="text-[#448AFF]" />;
      default: return <Edit3 size={14} className="text-[#FF9100]" />;
    }
  };

  const getDayLabel = (date: string) => {
    const d = new Date(date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (d === today) return 'TODAY, 21 OCTOBER'; // Reference image style date
    return 'YESTERDAY, 20 OCTOBER';
  };

  return (
    <PageTransition>
      <div className="w-full font-outfit max-w-md mx-auto pb-32" style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="px-5 pt-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[17px] font-black" style={{ color: text }}>Staff Activity</h1>
          <div className="w-10 h-10 bg-[#E2FFED] dark:bg-[#185536] rounded-full flex items-center justify-center border border-[#0A3D24]">
            <User size={20} className="text-[#0A3D24] dark:text-[#4BFF94]" />
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="px-4 mt-6">
          <div className="rounded-[40px] p-8 border-2 border-dashed flex flex-col items-center text-center" style={{ backgroundColor: card, borderColor: border }}>
            <div className="w-24 h-24 bg-[#0A3D24] rounded-[32px] flex items-center justify-center text-[#4BFF94] font-black text-[32px] mb-4 relative">
              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              <div className="absolute bottom-[-8px] right-[-8px] bg-[#4BFF94] text-[#0A3D24] px-3 py-1 rounded-xl text-[9px] font-black uppercase shadow-lg border-2 border-white dark:border-[#141414]">
                {member.status}
              </div>
            </div>
            
            <h2 className="text-[24px] font-black leading-tight" style={{ color: text }}>{member.name}</h2>
            <p className="text-[12px] font-bold mt-1" style={{ color: sub }}>{member.role} • Joined {new Date(member.joinedAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}</p>
            
            <div className="flex gap-2 mt-4">
              <span className="bg-gray-100 dark:bg-[#1E1E1E] text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5" style={{ color: sub }}>ID: {member.id.substring(0, 8).toUpperCase()}</span>
              <span className="bg-gray-100 dark:bg-[#1E1E1E] text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5" style={{ color: sub }}>Sales Cashier</span>
            </div>
          </div>
        </div>

        {/* STATS BANNERS */}
        <div className="px-4 mt-4">
          <div className="bg-[#0A3D24] rounded-3xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Daily Actions</p>
              <p className="text-white text-[48px] font-black leading-none">{stats.todayActions}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp size={14} className="text-[#4BFF94]" />
                <p className="text-[#4BFF94] text-[11px] font-bold">+12% from yesterday</p>
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <TrendingUp size={120} className="text-white" />
            </div>
          </div>
        </div>

        {/* TIME FILTERS */}
        <div className="px-4 mt-6 flex gap-2">
          {['Today', 'Past 7 Days', 'Custom Range'].map((f, i) => (
            <button 
              key={f}
              className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${i === 0 ? 'bg-white dark:bg-[#252525] shadow-md border-2 border-[#0A3D24]' : 'bg-transparent text-gray-400 border border-gray-200 dark:border-[#333]'}`}
              style={{ color: i === 0 ? text : sub }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="px-4 mt-4 flex gap-2">
          <button className="flex-1 py-3 rounded-2xl text-[11px] font-black uppercase border border-gray-200 dark:border-[#333] flex items-center justify-center gap-2" style={{ color: sub }}>
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 py-3 rounded-2xl text-[11px] font-black uppercase border border-gray-200 dark:border-[#333] flex items-center justify-center gap-2" style={{ color: sub }}>
            <FileText size={14} /> Export Log
          </button>
        </div>

        {/* ACTIVITY LIST */}
        <div className="px-4 mt-8 pb-10 space-y-6">
          {memberActivities.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <Clock size={32} className="mx-auto mb-2" style={{ color: sub }} />
              <p className="text-[13px] font-bold" style={{ color: sub }}>No activity logged yet.</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-center mb-6">
                  <span className="bg-gray-100 dark:bg-[#1E1E1E] text-[10px] font-black uppercase px-4 py-1.5 rounded-full" style={{ color: sub }}>
                    {getDayLabel(new Date().toISOString())}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {memberActivities.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-3xl border-l-[4px] p-5 shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4 active:scale-[0.98] transition-all"
                      style={{ 
                        backgroundColor: card,
                        borderColor: i === 0 ? '#4BFF94' : i === 1 ? '#FFB74D' : '#00C853',
                        borderLeftColor: i === 0 ? '#4BFF94' : i === 1 ? '#FFB74D' : '#00C853'
                      }}
                    >
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9F9FB' }}>
                        {getActivityIcon(a.type)}
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[14px] font-black truncate" style={{ color: text }}>{a.action}</p>
                        <p className="text-[10px] font-medium mt-0.5 truncate" style={{ color: sub }}>{a.details}</p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-black" style={{ color: text }}>{new Date(a.date).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                        <p className="text-[9px] font-bold text-gray-400">SUCCESS</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </PageTransition>
  );
};
