import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CurrencyLogo } from '../components/CurrencyLogo';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ShieldCheck, Zap, BarChart3, ArrowRight, Wallet } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const completeOnboarding = () => {
    triggerHaptic(ImpactStyle.Heavy);
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/setup');
  };

  const nextSlide = () => {
    triggerHaptic(ImpactStyle.Medium);
    setDirection(1);
    setCurrentSlide(prev => prev + 1);
  };

  const skip = () => {
    triggerHaptic(ImpactStyle.Light);
    completeOnboarding();
  };

  const SLIDES = [
    {
      id: 1,
      content: (
        <div className="flex flex-col items-center text-center w-full px-8 font-outfit">
          <div className="relative mb-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="z-10 relative"
            >
              <div className="w-28 h-28 rounded-[2rem] bg-card border border-border flex items-center justify-center shadow-lg">
                <CurrencyLogo className="text-primary scale-[2]" />
              </div>
            </motion.div>
          </div>
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="space-y-3"
          >
            <h1 className="text-4xl font-black text-text-primary tracking-tight leading-tight uppercase">
              Indus<br /><span className="text-primary">Ledger v3.0</span>
            </h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic opacity-80">
                Asaan Karobar, Behtar Hisaab
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 2,
      content: (
        <div className="flex flex-col items-center text-center w-full px-8 font-outfit">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="w-20 h-20 bg-danger/5 rounded-[2rem] border border-danger/10 flex items-center justify-center mb-8 shadow-sm"
          >
            <Zap size={32} className="text-danger" strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-2 w-full"
          >
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Track Sales</h2>
            <p className="text-text-muted text-xs font-bold opacity-40 max-w-[240px] mx-auto leading-relaxed uppercase tracking-wider">
              Record daily sales and expenses instantly. No more paper registers needed.
            </p>
            
            <div className="mt-8 mx-auto w-full max-w-[240px] h-32 bg-card border border-border rounded-3xl shadow-xl relative p-5 flex flex-col justify-end">
              <div className="w-full h-16 flex items-end space-x-2.5 mb-3">
                <div className="flex-1 h-8 bg-card-secondary rounded-lg border border-border" />
                <div className="flex-1 h-12 bg-primary/10 rounded-lg border border-primary/20" />
                <div className="flex-1 h-10 bg-card-secondary/50 rounded-lg border border-border" />
                <motion.div 
                    animate={{ height: ['30%', '80%', '40%'] }} transition={{ duration: 2, repeat: Infinity }}
                    className="flex-1 bg-primary/30 rounded-lg border border-primary/20" 
                />
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                 <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 3,
      content: (
        <div className="flex flex-col items-center text-center w-full px-8 font-outfit">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-warning/5 rounded-[2rem] border border-warning/10 flex items-center justify-center mb-8 shadow-sm"
          >
            <Wallet size={32} className="text-warning" strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-2 w-full"
          >
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Khata Book</h2>
            <p className="text-text-muted text-xs font-bold opacity-40 max-w-[240px] mx-auto leading-relaxed uppercase tracking-wider">
              Manage customer udhaar and send reminders. Never lose track of your money.
            </p>
            
            <div className="mt-8 mx-auto w-full max-w-[240px] bg-card border border-border rounded-3xl shadow-xl flex flex-col p-5 space-y-3">
               <div className="flex items-center space-x-3 w-full bg-danger/5 p-3 rounded-xl border border-danger/10">
                 <div className="w-8 h-8 rounded-lg bg-danger/10 flex-shrink-0 flex items-center justify-center text-danger text-xs font-black italic">A</div>
                 <div className="flex flex-col space-y-1.5 flex-1 items-start">
                   <div className="w-2/3 h-1.5 bg-text-primary opacity-10 rounded-full" />
                   <div className="w-1/2 h-1 bg-danger/20 rounded-full" />
                 </div>
               </div>
               <div className="flex items-center space-x-3 w-full bg-primary/5 p-3 rounded-xl border border-primary/10">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary text-xs font-black italic">Z</div>
                 <div className="flex flex-col space-y-1.5 flex-1 items-start">
                   <div className="w-3/4 h-1.5 bg-text-primary opacity-10 rounded-full" />
                   <div className="w-1/3 h-1 bg-primary/20 rounded-full" />
                 </div>
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 4,
      content: (
        <div className="flex flex-col items-center text-center w-full px-8 font-outfit">
          <motion.div 
            initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            className="w-20 h-20 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-center mb-8 shadow-sm"
          >
            <BarChart3 size={32} className="text-primary" strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-2 w-full"
          >
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Smart Reports</h2>
            <p className="text-text-muted text-xs font-bold opacity-40 max-w-[240px] mx-auto leading-relaxed uppercase tracking-wider">
              Detailed analysis of your shop's performance. Grow your business with data.
            </p>
            
            <div className="mt-8 mx-auto w-full max-w-[240px] h-32 bg-card border border-border rounded-3xl shadow-xl flex items-center justify-center">
              <div className="relative w-20 h-20">
                  <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[6px] border-border border-t-primary" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 size={24} className="text-primary opacity-20" />
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden z-50 font-outfit">
      <div className="flex justify-end p-6 z-20">
        <button 
          onClick={skip}
          className="px-5 py-2 rounded-lg text-text-muted font-black text-[10px] uppercase tracking-widest hover:text-text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ x: direction > 0 ? '100vw' : '-100vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? '-100vw' : '100vw', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 150 }}
            className="absolute flex items-center justify-center w-full inset-0 px-6"
          >
            {SLIDES[currentSlide].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pb-12 flex flex-col items-center space-y-10 z-20 bg-background relative">
        <div className="flex space-x-2">
          {SLIDES.map((_, index) => (
            <motion.div 
              key={index} 
              animate={{ 
                width: index === currentSlide ? 24 : 6,
                opacity: index === currentSlide ? 1 : 0.2,
                backgroundColor: index === currentSlide ? 'var(--primary)' : 'var(--text-muted)'
              }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <div className="w-full max-w-sm h-14 relative">
          <AnimatePresence mode="popLayout">
            {currentSlide === SLIDES.length - 1 ? (
              <motion.button 
                key="start-btn" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={completeOnboarding}
                className="w-full h-full rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <ShieldCheck size={18} strokeWidth={3} />
                <span>Get Started</span>
              </motion.button>
            ) : (
              <motion.button 
                key="next-btn" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                className="w-full h-full rounded-xl bg-text-primary text-background font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center space-x-2 shadow-lg transition-all"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
