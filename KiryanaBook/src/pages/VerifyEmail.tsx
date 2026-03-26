import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, RefreshCcw, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const VerifyEmail: React.FC = () => {
  const { user, reloadUser, sendVerification, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // If user is already verified, they shouldn't be here, but App.tsx handles that.
    // We can also auto-check every few seconds if we want.
    const interval = setInterval(() => {
      reloadUser();
    }, 5000);
    return () => clearInterval(interval);
  }, [reloadUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await reloadUser();
    if (user?.emailVerified) {
      toast.success('Email Verified!');
    } else {
      toast.error('Not verified yet. Check your inbox.');
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await sendVerification();
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error('Failed to send. Try again later.');
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col font-outfit max-w-md mx-auto p-6">
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#0A3D24] dark:bg-[#00E676] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20"
        >
          <Mail size={40} className="text-[#00E676] dark:text-[#0A3D24]" strokeWidth={2.5} />
        </motion.div>

        <h2 className="text-[32px] font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
          Verify Your Email
        </h2>
        
        <p className="text-[15px] font-medium text-gray-500 dark:text-[#B0B0B0] mb-8 leading-relaxed max-w-[300px]">
          We've sent a verification link to <br/>
          <span className="text-[#0A3D24] dark:text-[#00E676] font-bold">{user?.email}</span>. <br/>
          Please click it to gain access to your ledger.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full bg-[#0A3D24] text-white py-5 rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            I've Verified
          </button>

          <button 
            onClick={handleResend}
            disabled={countdown > 0}
            className="w-full bg-white dark:bg-[#141414] text-[#0A3D24] dark:text-white py-5 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 border-2 border-[#0A3D24]/10 dark:border-white/10 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
          </button>
        </div>
      </div>

      <button 
        onClick={logout}
        className="mt-8 flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors mx-auto font-bold uppercase tracking-widest text-[13px]"
      >
        <LogOut size={16} />
        Log Out
      </button>

      {/* FOOTER DECORATION */}
      <div className="py-6 flex justify-center">
           <div className="w-12 h-1 bg-gray-200 dark:bg-[#2A2A2A] rounded-full" />
       </div>
    </div>
  );
};
