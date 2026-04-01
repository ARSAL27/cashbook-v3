import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

type Mode =
  | 'welcome'
  | 'login_options'
  | 'signup_options'
  | 'email_login'
  | 'email_signup'
  | 'verify_pending'
  | 'set_password'; // After Google signup — set backup password

export const Login: React.FC = () => {
  const { user, signInWithEmail, signUpWithEmail, linkEmailPassword, hasPasswordLinked, isPasswordRecorded, sendResetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+92');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Stored after Google login to use in set_password screen
  const [googleEmail, setGoogleEmail] = useState('');

  useEffect(() => {
    // If user is logged in:
    // 1. If it's an email/password user, we're good (they already set a password)
    // 2. If it's a Google user, they MUST have hasPasswordLinked: true AND isPasswordRecorded: true to proceed to dashboard.
    if (user) {
      const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
      
      if (!isGoogleUser || (hasPasswordLinked && isPasswordRecorded)) {
        // Redirection happens only if we aren't already there.
        navigate('/', { replace: true });
      } else if (isGoogleUser && (!hasPasswordLinked || !isPasswordRecorded) && mode !== 'set_password') {
        // Force set_password mode if it's a new Google user or redirect result just came in, OR if record is missing
        setGoogleEmail(user.email || '');
        setMode('set_password');
      }
    }
  }, [user, mode, navigate, hasPasswordLinked, isPasswordRecorded]);

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

  // ── Email / Password Auth ────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'email_signup' && (!name || !phone || phone === '+92'))) {
      toast.error('Sab fields bhar dein');
      return;
    }
    if (mode === 'email_signup' && !validatePhone(phone)) {
      toast.error('Ghalat Number! +92 ke baad exactly 10 digits likhein');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'email_login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name, phone);
        setMode('verify_pending');
      }
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };


  // ── Set Backup Password (after Google signup) ────────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password kam se kam 6 characters ka hona chahiye');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Dono passwords same nahi hain');
      return;
    }
    setIsLoading(true);
    try {
      await linkEmailPassword(googleEmail, password);
      // Don't navigate — onAuthStateChanged will handle it automatically
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col font-outfit max-w-md mx-auto transition-colors duration-300 pb-8 min-h-[100dvh]">

      {/* HEADER */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-center relative">
        {mode !== 'welcome' && (
          <button
            onClick={() => setMode('welcome')}
            className="absolute left-6 active:scale-95 transition-transform p-2 rounded-xl bg-gray-100 dark:bg-[#141414]"
          >
            <ArrowLeft className="text-[#0A3D24] dark:text-[#00E676]" size={20} strokeWidth={3} />
          </button>
        )}
        <h1 className="text-[#0A3D24] dark:text-[#00E676] font-black text-[15px] tracking-[0.2em] uppercase">
          KiryanaBook v3
        </h1>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ══ WELCOME ══════════════════════════════════════════════════════════ */}
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
                  <ShieldCheck size={32} className="text-[#4BFF94] dark:text-[#0A3D24]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[40px] font-black text-gray-900 dark:text-white leading-none mb-4 tracking-tighter">
                  Welcome to <br /> <span className="text-[#0A3D24] dark:text-[#00E676]">KiryanaBook</span>
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
                  Log In <ArrowRight size={18} strokeWidth={3} />
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

          {/* ══ LOGIN / SIGNUP OPTIONS ════════════════════════════════════════════ */}
          {(mode === 'login_options' || mode === 'signup_options') && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 pt-4"
            >
              <h2 className="text-[32px] font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                {mode === 'login_options' ? 'Dobara Khush Aamdeed' : 'Shuru Karen'}
              </h2>
              <p className="text-[14px] font-medium text-gray-500 dark:text-[#B0B0B0] mb-8 leading-relaxed max-w-[280px]">
                {mode === 'login_options'
                  ? 'Login ka tarika chunein.'
                  : 'Apna digital khata shuru karein.'}
              </p>

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
                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#B0B0B0]/60">
                      {mode === 'login_options' ? 'Classic login' : 'Safe cloud sync'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-gray-300" size={18} />
              </button>

              {/* Google Option (Locked) */}
              <button
                type="button"
                className="w-full bg-[#F4F4F5] dark:bg-[#141414] p-5 rounded-2xl flex items-center justify-between transition-all border dark:border-[#2A2A2A] opacity-60 cursor-not-allowed"
                onClick={() => toast.error('Google Login temporarily disabled. Please use Email.')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-[#1E1E1E] flex items-center justify-center shadow-sm">
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none mb-1">
                      Google Account
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#B0B0B0]/60">Temporarily Locked</p>
                  </div>
                </div>
                <Lock className="text-gray-400" size={18} />
              </button>
            </motion.div>
          )}

          {/* ══ EMAIL FORM ═══════════════════════════════════════════════════════ */}
          {(mode === 'email_login' || mode === 'email_signup') && (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAuth}
              className="space-y-4 flex flex-col flex-1 pt-4"
            >
              <h2 className="text-[32px] font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                {mode === 'email_login' ? 'Login' : 'Account Banayein'}
              </h2>

              {mode === 'email_signup' && (
                <>
                  <div className="space-y-1.5 pt-4">
                    <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                      Dukandaar ka Naam
                    </label>
                    <input
                      type="text" placeholder="Aslam Bhai" value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                    />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                      WhatsApp Number (+92)
                    </label>
                    <input
                      type="tel" placeholder="+92 3XX XXXXXXX" value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <input
                  type="email" placeholder="shop@kiryanabook.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  if (!email) return toast.error('Apni email likhein pehle');
                  sendResetPassword(email);
                }}
                className="text-[11px] font-bold text-gray-400 dark:text-[#555] active:scale-95 transition-transform text-right pr-2"
              >
                Forgot Password?
              </button>

              <div className="flex-1" />

              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#033A1F] text-white py-5 mt-auto rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest disabled:opacity-60"
              >
                <span>{isLoading ? 'Wait...' : (mode === 'email_login' ? 'Login Karen' : 'Account Banayein')}</span>
                {!isLoading && <ArrowRight size={18} strokeWidth={3} />}
              </button>
            </motion.form>
          )}

          {/* ══ VERIFY PENDING ═══════════════════════════════════════════════════ */}
          {mode === 'verify_pending' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-20 h-20 bg-[#E5F2EB] dark:bg-[#1A3A25] rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
                <Mail size={38} className="text-[#0A3D24] dark:text-[#00E676]" strokeWidth={2} />
              </div>
              <h2 className="text-[30px] font-black text-gray-900 dark:text-white leading-tight mb-3 tracking-tight">
                Email Verify Karo
              </h2>
              <p className="text-[14px] font-medium text-gray-500 dark:text-[#B0B0B0] max-w-[260px] leading-relaxed mb-2">
                <span className="font-bold text-[#0A3D24] dark:text-[#00E676]">{email}</span> par ek verification link bheja gaya hai.
              </p>
              <p className="text-[13px] font-medium text-gray-400 dark:text-[#666] max-w-[240px] leading-relaxed mb-10">
                Email verify karne ke baad wapas aao aur login karo.
              </p>
              <button
                onClick={() => { setMode('email_login'); setPassword(''); }}
                className="w-full bg-[#033A1F] text-white py-5 rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest"
              >
                Login Karo <ArrowRight size={18} strokeWidth={3} />
              </button>
              <button
                onClick={() => setMode('welcome')}
                className="mt-4 text-[13px] font-bold text-gray-400 dark:text-[#555] underline underline-offset-4"
              >
                Wapas Home
              </button>
            </motion.div>
          )}

          {/* ══ SET BACKUP PASSWORD (after Google signup) ═════════════════════════ */}
          {mode === 'set_password' && (
            <motion.form
              key="set-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSetPassword}
              className="flex-1 flex flex-col pt-4"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-[#0A3D24] dark:bg-[#00E676] rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                <Lock size={28} className="text-[#4BFF94] dark:text-[#0A3D24]" strokeWidth={2.5} />
              </div>

              <h2 className="text-[28px] font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                Backup Password Set Karein
              </h2>
              <p className="text-[13px] font-medium text-gray-500 dark:text-[#B0B0B0] leading-relaxed mb-6 max-w-[280px]">
                Yeh password aapke Gmail account se link hoga. Agar kabhi Google se login na ho sake to <span className="font-bold text-[#0A3D24] dark:text-[#00E676]">{googleEmail}</span> + yeh password use karein.
              </p>

              {/* Email (readonly) */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                  Google Email
                </label>
                <input
                  type="email" value={googleEmail} readOnly
                  className="w-full px-5 py-4 bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl text-[15px] font-bold text-gray-400 dark:text-gray-500 border dark:border-[#2A2A2A] cursor-not-allowed"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                  Naya Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-black text-[#0A3D24] dark:text-[#00E676] uppercase tracking-widest pl-1">
                  Password Confirm Karein
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 bg-[#F4F4F5] dark:bg-[#141414] rounded-2xl outline-none text-[15px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A3D24]/20 dark:focus:ring-[#00E676]/20 transition-all border dark:border-[#2A2A2A]"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex-1" />
  
              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#033A1F] text-white py-5 rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest disabled:opacity-60"
              >
                {isLoading ? 'Saving...' : 'Password Set Karen'}
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
