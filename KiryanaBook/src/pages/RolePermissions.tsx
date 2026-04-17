import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Eye, Edit3, Trash2, Users, PieChart, Plus, Check, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const RolePermissions: React.FC = () => {
  const { role: urlRole } = useParams<{ role: string }>();
  const { profile, updateRolePermissions } = useShop();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'Cashier' | 'Manager' | 'Custom'>( (urlRole as any) || 'Cashier');
  const [permissions, setPermissions] = useState({
    viewDashboard: true,
    viewReports: false,
    addEntry: true,
    editEntry: false,
    viewUdhaar: true,
    deleteRecords: false,
    manageStaff: false
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (profile?.rolePermissions?.[activeRole]) {
      setPermissions(profile.rolePermissions[activeRole]);
    }
  }, [activeRole, profile]);

  const bg = isDarkMode ? '#0A0A0A' : '#F5F5F5';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#888888';

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateRolePermissions(activeRole, permissions);
      toast.success(`${activeRole} permissions updated in database!`);
    } catch (e) {
      toast.error('Ghalti hui save karne mein');
    }
    setLoading(false);
  };

  const PermissionItem = ({ icon: Icon, label, desc, state, toggle }: { icon: any, label: string, desc: string, state: boolean, toggle: () => void }) => (
    <div className="flex items-center gap-4 p-5 rounded-3xl border mb-3 transition-all" style={{ backgroundColor: card, borderColor: border }}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9F9FB', color: state ? '#00C853' : sub }}>
        <Icon size={18} />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[14px] font-black truncate" style={{ color: text }}>{label}</p>
        <p className="text-[10px] font-medium mt-0.5 truncate" style={{ color: sub }}>{desc}</p>
      </div>
      <button 
        onClick={toggle}
        className={`w-12 h-6 rounded-full p-1 transition-all ${state ? 'bg-[#0A3D24]' : 'bg-gray-200 dark:bg-[#252525]'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${state ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <PageTransition>
      <div className="w-full font-outfit max-w-md mx-auto pb-32" style={{ backgroundColor: bg }}>
        <div className="px-5 pt-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[17px] font-black" style={{ color: text }}>Role Permissions</h1>
          <div className="w-10 h-10 bg-[#FFD180] dark:bg-[#FFD18020] rounded-full flex items-center justify-center border border-[#FFD180]">
            <Shield size={20} className="text-[#E65100]" />
          </div>
        </div>

        <div className="px-5 mt-6">
          <h2 className="text-[24px] font-black leading-tight" style={{ color: text }}>Configure Access</h2>
          <p className="text-[12px] font-medium mt-1" style={{ color: sub }}>Fine-tune what members of a role can access and do within the application.</p>
        </div>

        <div className="px-4 mt-8 flex gap-2">
          {['Cashier', 'Manager', 'Custom'].map(r => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveRole(r as any)}
              className={`flex-1 py-4 rounded-3xl border transition-all text-center ${activeRole === r ? 'shadow-md border-[#0A3D24]' : 'border-transparent'}`}
              style={{ backgroundColor: activeRole === r ? '#0A3D24' : card, color: activeRole === r ? '#fff' : sub }}
            >
              <p className="text-[14px] font-black">{r}</p>
              {activeRole === r && <p className="text-[8px] font-black uppercase opacity-60">Selected</p>}
            </motion.button>
          ))}
        </div>

        <div className="mt-8">
          <div className="px-5 mb-4">
            <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: isDarkMode ? '#44FF85' : '#0A3D24' }}>
              <span className="w-1 h-4 bg-green-500 rounded-full" /> DASHBOARDS & ANALYTICS
            </p>
          </div>
          <div className="px-4">
            <PermissionItem icon={Eye} label="View Dashboard" desc="Access the daily statistics & charts" state={permissions.viewDashboard} toggle={() => togglePermission('viewDashboard')} />
            <PermissionItem icon={PieChart} label="View Reports" desc="Generate & view detailed CSV/PDF reports" state={permissions.viewReports} toggle={() => togglePermission('viewReports')} />
          </div>

          <div className="px-5 mt-8 mb-4">
            <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: isDarkMode ? '#44FF85' : '#0A3D24' }}>
              <span className="w-1 h-4 bg-green-500 rounded-full" /> TRANSACTIONS & LEDGER
            </p>
          </div>
          <div className="px-4">
            <PermissionItem icon={Plus} label="Add Cash Entry" desc="Create sales or udhaar records" state={permissions.addEntry} toggle={() => togglePermission('addEntry')} />
            <PermissionItem icon={Edit3} label="Edit Entry" desc="Modify existing ledger records" state={permissions.editEntry} toggle={() => togglePermission('editEntry')} />
            <PermissionItem icon={Users} label="View Udhaar" desc="Access customer names and balances" state={permissions.viewUdhaar} toggle={() => togglePermission('viewUdhaar')} />
            <PermissionItem icon={Trash2} label="Delete Records" desc="Permanently remove ledger entries" state={permissions.deleteRecords} toggle={() => togglePermission('deleteRecords')} />
          </div>

          <div className="px-5 mt-8 mb-4">
            <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: isDarkMode ? '#FFB74D' : '#E65100' }}>
              <span className="w-1 h-4 bg-orange-500 rounded-full" /> STAFF & SETTINGS
            </p>
          </div>
          <div className="px-4">
            <PermissionItem icon={Users} label="Manage Staff" desc="Add members or change shop team" state={permissions.manageStaff} toggle={() => togglePermission('manageStaff')} />
          </div>
        </div>

        <div className="fixed bottom-[90px] inset-x-0 max-w-md mx-auto px-4 z-50">
          <div className="rounded-3xl p-3" style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between px-4 mb-3">
              <p className="text-[11px] font-bold" style={{ color: sub }}>Changes will be applied instantly</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#0A3D24] text-white py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-xl shadow-green-900/10 disabled:opacity-50"
            >
              <Check size={18} strokeWidth={3} />
              {loading ? 'Saving...' : 'Save Role Config'}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
