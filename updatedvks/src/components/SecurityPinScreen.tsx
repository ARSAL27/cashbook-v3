import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyPin } from '../utils/crypto';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
const PIN_LENGTH = 6;

export const SecurityPinScreen: React.FC = () => {
  const navigate = useNavigate();
  const { pinVerified, setPinVerified, userPin, savePin, failedAttempts, lockedUntil, updateSecurityStatus, isChangingPin, setIsChangingPin } = useAuth();
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'verify' | 'create' | 'confirm'>('verify');
  const [tempPin, setTempPin] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userPin === null) {
      setMode('create');
    } else {
      setMode('verify');
    }
  }, [userPin]);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, lockedUntil - now);
      setTimeLeft(diff);
      if (diff === 0) {
        updateSecurityStatus(0, null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil, updateSecurityStatus]);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Medium) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const processPin = useCallback(async (finalPin: string) => {
    if (mode === 'verify') {
      const isCorrect = await verifyPin(finalPin, userPin || '');
      if (isCorrect) {
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
        if (isChangingPin) {
            setMode('create');
            setPin('');
            return;
        }
        setPinVerified(true);
        updateSecurityStatus(0, null);
        setPin('');
      } else {
        const newAttempts = failedAttempts + 1;
        triggerHaptic(ImpactStyle.Heavy);
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
          updateSecurityStatus(newAttempts, lockoutTime);
          setErrorMessage('System Locked');
        } else {
          updateSecurityStatus(newAttempts, null);
          setErrorMessage(`Wrong PIN! ${MAX_ATTEMPTS - newAttempts} attempts left`);
        }
        setPin('');
      }
    } else if (mode === 'create') {
      triggerHaptic(ImpactStyle.Light);
      setTempPin(finalPin);
      setMode('confirm');
      setPin('');
    } else if (mode === 'confirm') {
      if (finalPin === tempPin) {
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
        await savePin(finalPin);
        toast.success(isChangingPin ? "PIN Updated" : "PIN Saved");
        setIsChangingPin(false);
        setPinVerified(true);
        setPin('');
      } else {
        triggerHaptic(ImpactStyle.Heavy);
        toast.error('PINs do not match.');
        setMode('create');
        setPin('');
      }
    }
  }, [mode, userPin, failedAttempts, updateSecurityStatus, tempPin, savePin, setPinVerified, isChangingPin, setIsChangingPin]);

  const handleInput = (val: string) => {
    if (lockedUntil && timeLeft > 0) return;
    setErrorMessage(null);
    if (pin.length < PIN_LENGTH) {
      triggerHaptic();
      setPin(prev => prev + val);
    }
  };

  const handleDelete = () => {
    triggerHaptic(ImpactStyle.Light);
    setPin(prev => prev.slice(0, -1));
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (pinVerified) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-[360px] bg-white dark:bg-[#141414] rounded-[2.5rem] shadow-2xl flex flex-col items-center py-8 px-6 font-outfit border border-white/20"
      >
        <div className="w-full flex items-center justify-between mb-6">
            <h1 className="text-[#0A3D24] dark:text-[#00E676] font-black text-[12px] tracking-[0.2em] uppercase">Security Vault</h1>
            {isChangingPin && (
               <button 
                 onClick={() => { setIsChangingPin(false); setPinVerified(true); }}
                 className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
               >
                 <ArrowLeft className="text-gray-400" size={18} />
               </button>
            )}
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
            {timeLeft > 0 ? (
                <>
                    <h1 className="text-[24px] font-black text-red-500 tracking-tight mb-2">Locked</h1>
                    <p className="text-[12px] font-medium text-gray-400 max-w-[240px] leading-relaxed">
                        Too many attempts. Ends in {formatTime(timeLeft)}.
                    </p>
                </>
            ) : mode === 'verify' ? (
                <>
                    <h2 className="text-[26px] font-black text-[#0A3D24] dark:text-white tracking-tight leading-tight mb-1">Verify PIN</h2>
                    <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Enter your 6-digit access code</p>
                </>
            ) : mode === 'confirm' ? (
                 <>
                    <h1 className="text-[26px] font-black text-[#0A3D24] dark:text-white tracking-tight leading-tight mb-1">Confirm PIN</h1>
                    <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Please re-enter to confirm</p>
                 </>
            ) : (
                <>
                    <h1 className="text-[26px] font-black text-[#0A3D24] dark:text-white tracking-tight leading-tight mb-1">{isChangingPin ? 'New Security PIN' : 'Setup Vault'}</h1>
                    <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Choose a secure 6-digit code</p>
                </>
            )}
        </div>

        <div className="flex flex-col items-center mb-8">
            <div className="flex justify-center space-x-3 mb-4">
              {[...Array(PIN_LENGTH)].map((_, i) => {
                  const isActive = pin.length > i;
                  return (
                    <motion.div 
                        key={i}
                        animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                        className={`w-3 h-3 rounded-full border-2 transition-colors ${
                            isActive ? 'bg-[#0A3D24] dark:bg-[#00E676] border-[#0A3D24] dark:border-[#00E676]' : 'bg-transparent border-gray-200 dark:border-gray-800'
                        }`}
                    />
                  );
              })}
            </div>
            <AnimatePresence>
                {errorMessage && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest"
                    >
                        {errorMessage}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>

        <div className={`grid grid-cols-3 gap-y-3 gap-x-4 w-full mb-8 transition-all duration-300 ${timeLeft > 0 ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <motion.button
                key={n} whileTap={{ scale: 0.92 }}
                onClick={() => handleInput(n.toString())}
                className="h-14 w-full rounded-2xl bg-[#F4F4F5] dark:bg-[#1E1E1E] text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center transition-colors active:bg-gray-200"
            >
                {n}
            </motion.button>
          ))}
          <div className="h-14 w-full opacity-0 pointer-events-none" />
          <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => handleInput('0')}
              className="h-14 w-full rounded-2xl bg-[#F4F4F5] dark:bg-[#1E1E1E] text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center transition-colors active:bg-gray-200"
          >
              0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="h-14 w-full rounded-2xl bg-[#F4F4F5] dark:bg-[#1E1E1E] flex items-center justify-center"
          >
            <Delete size={22} className="text-red-500" />
          </motion.button>
        </div>

        <button
            onClick={() => { if (pin.length === PIN_LENGTH) processPin(pin); }}
            disabled={timeLeft > 0 || pin.length !== PIN_LENGTH}
            className={`w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all ${
                pin.length === PIN_LENGTH ? 'bg-[#0A3D24] dark:bg-[#00E676] text-white dark:text-black active:scale-95 shadow-lg' : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-400 pointer-events-none'
            }`}
        >
            Authorize Access
        </button>

        <button 
          onClick={() => navigate('/help')}
          className="mt-6 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] hover:text-[#0A3D24] transition-colors"
        >
          Forgot PIN? Contact Support
        </button>
      </motion.div>
    </div>
  );
};
