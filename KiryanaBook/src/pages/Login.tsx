import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ArrowLeft, Phone, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signInGuest } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'welcome' | 'login_options' | 'signup_options' | 'email_login' | 'email_signup'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+92');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validatePhone = (p: string) => {
    const digitsOnly = p.replace('+92', '').replace(/\s/g, '');
    return digitsOnly.length === 10 && /^\d+$/.test(digitsOnly);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+92')) {
        val = '+92' + val.replace(/\D/g, '');
    } else {
        const suffix = val.slice(3).replace(/\D/g, '');
        val = '+92' + suffix;
    }
    if (val.length <= 13) setPhone(val);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'email_signup' && (!name || !phone || phone === '+92'))) {
      toast.error('Please fill all fields');
      return;
    }

    if (mode === 'email_signup' && !validatePhone(phone)) {
      toast.error('Ghalat Number! Please enter exactly 10 digits after +92');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'email_login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name, phone);
      }
    } catch (err) {
      // Handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneClick = () => {
    toast('Phone login is currently disabled for this demo.', { icon: '⚠️' });
  };

  const getStepNumber = () => {
    if (mode === 'welcome') return 0;
    if (mode.includes('options')) return 1;
    return 1; // Email form is still part of step 1 identity
  };

  return (
    <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col font-outfit max-w-md mx-auto transition-colors duration-300 pb-8 min-h-[100dvh]">
      {/* ── HEADER ── */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-center relative">
        {mode !== 'welcome' && (
          <button onClick={() => setMode('welcome')} className="absolute left-6 active:scale-95 transition-transform p-2 rounded-xl bg-gray-100 dark:bg-[#141414]">
            <ArrowLeft className="text-[#0A3D24] dark:text-[#00E676]" size={20} strokeWidth={3} />
          </button>
        )}
        <h1 className="text-[#0A3D24] dark:text-[#00E676] font-black text-[15px] tracking-[0.2em] uppercase">KiryanaBook v3</h1>
      </div>

      {/* ── PROGRESS BAR ── */}
      {mode !== 'welcome' && (
        <div className="px-6 flex items-center justify-between mt-2 mb-8">
          <div className={`flex-1 h-[3px] rounded-full mr-2 ${getStepNumber() >= 1 ? 'bg-[#0A3D24] dark:bg-[#00E676]' : 'bg-gray-200 dark:bg-[#2A2A2A]'}`} />
          <div className="flex-1 h-[3px] bg-gray-200 dark:bg-[#2A2A2A] rounded-full mx-2" />
          <div className="flex-1 h-[3px] bg-gray-200 dark:bg-[#2A2A2A] rounded-full ml-2" />
          <span className="text-[10px] font-black text-gray-500 dark:text-[#B0B0B0]/60 ml-4 uppercase tracking-widest">Step {getStepNumber()}/3</span>
        </div>
      )}

      <div className="px-6 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center py-10"
            >
              <div className="mb-12">
                <div className="w-16 h-16 bg-[#0A3D24] dark:bg-[#00E676] rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                    <UserCircle size={32} className="text-[#4BFF94] dark:text-[#0A3D24]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[40px] font-black text-gray-900 dark:text-white leading-none mb-4 tracking-tighter">
                  Welcome to <br/> <span className="text-[#0A3D24] dark:text-[#00E676]">KiryanaBook</span>
                </h2>
                <p className="text-[15px] font-medium text-gray-500 dark:text-[#B0B0B0] max-w-[280px]">
                  Digital Ledger for modern shopkeepers. Secure, Fast and Reliable.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setMode('login_options')}
                  className="w-full bg-[#0A3D24] text-white py-5 rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest"
                >
                  Log In
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => setMode('signup_options')}
                 className="w-full bg-white dark:bg-[#141414] text-[#0A3D24] dark:text-white py-5 rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 border-2 border-[#0A3D24]/10 dark:border-white/10 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          )}

          {(mode === 'login_options' || mode === 'signup_options') && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 pt-4"
            >
              <h2 className="text-[32px] font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                {mode === 'login_options' ? 'Glad to see you back' : 'Start your journey'}
              </h2>
              <p className="text-[14px] font-medium text-gray-500 dark:text-[#B0B0B0] mb-8 leading-relaxed max-w-[280px]">
                {mode === 'login_options' ? 'Choose your login method to access your ledger.' : 'Set up your digital ledger in just a few seconds.'}
              </p>

              {/* Phone Option - Only for Login */}
              {mode === 'login_options' && (
                <button 
                  onClick={handlePhoneClick}
                  className="w-full bg-[#F4F4F5] dark:bg-[#141414] p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all border dark:border-[#2A2A2A]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] flex items-center justify-center shadow-sm">
                      <Phone className="text-gray-700 dark:text-[#00E676]" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none mb-1">Phone Number</p>
                      <p className="text-[11px] font-medium text-gray-400 dark:text-[#B0B0B0]/60">Login via SMS code</p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-300" size={18} />
                </button>
              )}

              {/* Email Option */}
              <button 
                onClick={() => setMode(mode === 'login_options' ? 'email_login' : 'email_signup')}
                className="w-full bg-[#F4F4F5] dark:bg-[#141414] p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all border dark:border-[#2A2A2A]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] flex items-center justify-center shadow-sm">
                    <Mail className="text-[#0A3D24] dark:text-[#00E676]" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none mb-1">Email & Password</p>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#B0B0B0]/60">{mode === 'login_options' ? 'Classic login' : 'Safe cloud sync'}</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-300" size={18} />
              </button>

              {/* Google Option */}
              <button 
                onClick={signInWithGoogle}
                className="w-full bg-[#F4F4F5] dark:bg-[#141414] p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all border dark:border-[#2A2A2A]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white flex items-center justify-center shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.14 0 5.96 1.08 8.17 2.86l6.1-6.1C34.46 3.14 29.52 1 24 1 14.84 1 7.04 6.48 3.71 14.28l7.2 5.6C12.56 13.08 17.82 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.52 24.5c0-1.6-.14-3.14-.4-4.63H24v8.76h12.66c-.55 2.9-2.2 5.36-4.68 7.02l7.2 5.6C43.44 37.3 46.52 31.4 46.52 24.5z"/>
                      <path fill="#FBBC05" d="M10.91 28.38A14.6 14.6 0 0 1 9.5 24c0-1.52.24-3 .66-4.38l-7.2-5.6A23.35 23.35 0 0 0 .5 24c0 3.76.88 7.34 2.46 10.48l7.95-6.1z"/>
                      <path fill="#34A853" d="M24 46.5c5.52 0 10.16-1.83 13.55-4.96l-7.2-5.6c-1.84 1.24-4.2 1.96-6.35 1.96-6.18 0-11.44-3.58-13.09-8.72l-7.95 6.1C7.04 41.52 14.84 46.5 24 46.5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none mb-1">Google Account</p>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#B0B0B0]/60">Fast & One-tap</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-300" size={18} />
              </button>

              {/* Guest Option - Only for Signup/Login (initial entry) */}
              <button 
                onClick={signInGuest}
                className="w-full bg-[#E5F2EB] dark:bg-[#1A3A25] p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all border border-[#0A3D24]/10 dark:border-[#00E676]/20 mt-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0A3D24] flex items-center justify-center shadow-sm">
                    <UserCircle className="text-[#0A3D24] dark:text-[#00E676]" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-[#0A3D24] dark:text-[#00E676] leading-none mb-1">Try as Guest</p>
                    <p className="text-[11px] font-medium text-[#0A3D24]/60 dark:text-[#00E676]/60">Local only, no cloud storage</p>
                  </div>
                </div>
                <ArrowRight className="text-[#0A3D24]/40 dark:text-[#00E676]/40" size={18} />
              </button>
            </motion.div>
          )}

          {(mode === 'email_login' || mode === 'email_signup') && (
            <motion.form 
              key="email-form"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               onSubmit={handleAuth} className="space-y-4 flex flex-col flex-1 pt-4"
            >
              <h2 className="text-[32px] font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                {mode === 'email_login' ? 'Login' : 'Create Account'}
              </h2>
              
              {mode === 'email_signup' && (
                <>
                <div className="space-y-1.5 pt-4">
                  <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">Shop Owner Name</label>
                   <input 
                      type="text" placeholder="Aslam Bhai" value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">WhatsApp Number (+92)</label>
                   <input 
                      type="tel" placeholder="+92 3XX XXXXXXX" value={phone} onChange={handlePhoneChange}
                      className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                  />
                </div>
                </>
              )}
              
               <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">Email Address</label>
                 <input 
                    type="email" placeholder="shop@kiryanabook.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                />
              </div>
 
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">Secure Password</label>
                 <input 
                    type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                />
              </div>

              <div className="flex-1" />

              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#033A1F] text-white py-5 mt-auto rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest"
              >
                <span>{isLoading ? 'Wait...' : (mode === 'email_login' ? 'Login Now' : 'Create Account')}</span>
                {!isLoading && <ArrowRight size={18} strokeWidth={3} />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

       <div className="py-6 flex justify-center">
           <div className="w-12 h-1 bg-gray-200 dark:bg-[#2A2A2A] rounded-full" />
       </div>
    </div>
  );
};
