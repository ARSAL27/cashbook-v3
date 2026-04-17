import React, { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, User, Phone, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion } from 'framer-motion';

export const OwnerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useShop();
  
  const [name, setName] = useState(profile?.owner || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  useEffect(() => {
    if (profile) {
      setName(profile.owner);
      setPhone(profile.phone);
    }
  }, [profile]);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!name || !phone) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      triggerHaptic(ImpactStyle.Medium);
      await updateProfile({
        ...profile,
        owner: name,
        phone: phone 
      });
      toast.success('Profile updated successfully');
      navigate(-1);
    } catch (error) {
      triggerHaptic(ImpactStyle.Heavy);
      toast.error('Failed to update profile');
    }
  };

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ID';

  return (
    <PageTransition>
      <div className="w-full bg-background font-outfit pb-32">
        {/* HEADER */}
        <header className="pt-12 pb-3 px-6 flex items-center justify-between border-b border-border bg-white sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(); navigate(-1); }} 
              className="p-3 bg-slate-50 rounded-2xl text-text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">Owner Profile</h1>
          </div>
        </header>

        <div className="px-6 max-w-xl mx-auto space-y-10 mt-10">
          {/* AVATAR */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-3xl shadow-lg shadow-primary/5">
              {initials}
            </div>
            <p className="mt-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Profile Identity</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Your Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter your name"
                  className="w-full bg-white border border-border focus:border-primary/50 text-text-primary rounded-2xl py-5 pl-14 pr-6 outline-none transition-all shadow-sm font-bold" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Contact Phone</label>
              <div className="relative group">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                <input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="e.g. 0300 1234567"
                  className="w-full bg-white border border-border focus:border-primary/50 text-text-primary rounded-2xl py-5 pl-14 pr-6 outline-none transition-all shadow-sm font-bold" 
                />
              </div>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSave} 
            className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center space-x-3 uppercase tracking-widest text-xs hover:brightness-105 transition-all"
          >
            <Save size={18} />
            <span>Save Profile</span>
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};
