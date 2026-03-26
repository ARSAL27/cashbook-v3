import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
}

// THIS IS THE SECRET CODE FOR THE CURRENT UPDATE
// I (THE AI) WILL CHANGE THIS EVERY TIME I UPDATE THE CODE
const LATEST_VERSION = "v2.1.0";
const SECRET_CODE = "5566"; 

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, currentVersion }) => {
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'info' | 'auth'>('info');

  const handleUpdate = () => {
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    if (code === SECRET_CODE) {
      toast.success('CORE INTEGRITY AUTHENTICATED', {
        style: { background: '#4A7AF2', color: '#fff', fontWeight: '900', borderRadius: '12px' }
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error('ACCESS REJECTED: INVALID CODE', {
        style: { background: '#ff4757', color: '#fff', fontWeight: '900', borderRadius: '12px' }
      });
    }
  };

  const isNewAvailable = LATEST_VERSION !== currentVersion;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="relative p-8">
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 text-text-muted hover:text-text-primary transition-colors p-2 hover:bg-slate-50 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-6">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100 ${isNewAvailable ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-text-muted opacity-50'}`}>
                  {isNewAvailable ? <RefreshCcw size={40} className="animate-spin-slow" /> : <ShieldCheck size={40} />}
                </div>

                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-80 mb-2 block font-mono">
                    {isNewAvailable ? 'Update Protocol Initialized' : 'System Integrity Verified'}
                  </span>
                  <h2 className="text-3xl font-black text-text-primary tracking-tighter leading-tight">
                    {isNewAvailable ? 'Core Upgrade' : 'System Secured'}
                  </h2>
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Local: {currentVersion}</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Cloud: {LATEST_VERSION}</span>
                  </div>
                </div>

                {isNewAvailable ? (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl text-left">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 opacity-60">Update Manifest</p>
                      <ul className="text-xs text-text-primary space-y-3 font-bold tracking-tight">
                        <li className="flex items-start space-x-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                          <span>Google Authentication Fix for APK</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                          <span>Email & Cloud Identity Setup</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                          <span>Real-time Usage & Limit Dashboard</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                          <span>Bespoke Blue Branding Architecture</span>
                        </li>
                      </ul>
                    </div>

                    {step === 'info' ? (
                      <button 
                        onClick={() => {
                          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                          setStep('auth');
                        }}
                        className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest text-[11px] hover:brightness-105 active:scale-95 transition-all"
                      >
                        Install Core Update
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center block">Clearance Code Required</label>
                          <input 
                            type="tel" 
                            placeholder="••••"
                            maxLength={4}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-center font-black text-3xl tracking-[0.5em] text-primary"
                          />
                        </div>
                        <div className="flex gap-3">
                            <button 
                              onClick={() => setStep('info')}
                              className="flex-1 py-4 bg-slate-100 text-text-muted font-black rounded-2xl uppercase tracking-widest text-[10px]"
                            >
                              Back
                            </button>
                            <button 
                              onClick={handleUpdate}
                              className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                            >
                              Confirm Update
                            </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-xs text-text-muted font-bold bg-slate-50 p-6 rounded-3xl italic leading-relaxed">
                      You are running CashBook v2.0 - The most advanced version of your digital store. No updates required.
                    </p>
                    <button 
                      onClick={onClose}
                      className="mt-8 w-full py-5 bg-slate-100 text-text-primary font-black rounded-2xl uppercase tracking-widest text-[10px] border border-slate-200 transition-all active:scale-95"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
