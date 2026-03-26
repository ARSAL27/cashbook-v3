import React from 'react';
import { Delete, Check, RefreshCcw } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion } from 'framer-motion';

interface NumpadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  accentColor?: string;
}

export const Numpad: React.FC<NumpadProps> = ({ 
  onInput, 
  onDelete, 
  onClear, 
  onSubmit, 
  submitLabel = 'Confirm & Record',
  accentColor = 'primary'
}) => {
  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const handleKey = (val: string) => {
    triggerHaptic();
    onInput(val);
  };

  const handleDelete = () => {
    triggerHaptic(ImpactStyle.Medium);
    onDelete();
  };

  const handleClear = () => {
    triggerHaptic(ImpactStyle.Heavy);
    if (onClear) onClear();
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'];

  return (
    <div className="w-full max-w-sm mx-auto selection:bg-transparent font-outfit">
      <div className="grid grid-cols-3 gap-3">
        {keys.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleKey(n)}
            className="h-14 rounded-2xl bg-card border border-border text-lg font-black text-text-primary hover:bg-card-secondary active:bg-card-secondary transition-all flex flex-col items-center justify-center shadow-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 leading-none flex items-center justify-center h-full w-full">
              {n}
              {n !== '.' && n !== '00' && (
                <span className="absolute bottom-1.5 text-[5px] font-black text-text-muted/40 tracking-[0.2em] uppercase transition-colors">
                  {n === '1' ? '•' : n === '2' ? 'ABC' : n === '3' ? 'DEF' : n === '4' ? 'GHI' : n === '5' ? 'JKL' : n === '6' ? 'MNO' : n === '7' ? 'PARS' : n === '8' ? 'TUV' : n === '9' ? 'WXYZ' : n === '0' ? 'SPACE' : ''}
                </span>
              )}
            </span>
          </motion.button>
        ))}
        
        {/* FUNCTIONAL CLUSTER */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleClear}
          className="h-14 rounded-2xl bg-danger/5 border border-danger/10 text-danger flex items-center justify-center hover:bg-danger/10 transition-all shadow-sm group"
        >
          <RefreshCcw size={18} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-500" />
        </motion.button>

        <div className="h-14 flex items-center justify-center opacity-20">
          <div className="w-1 h-1 rounded-full bg-text-muted" />
          <div className="w-1 h-1 rounded-full bg-text-muted mx-2" />
          <div className="w-1 h-1 rounded-full bg-text-muted opacity-50" />
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-card-secondary border border-border text-text-muted flex items-center justify-center hover:bg-border transition-all shadow-sm"
        >
          <Delete size={20} strokeWidth={2.5} />
        </motion.button>
      </div>
      
      {onSubmit && (
         <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSubmit}
          className={`w-full h-14 mt-6 rounded-2xl bg-${accentColor} text-white font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center space-x-3 shadow-lg shadow-primary/20 relative overflow-hidden group`}
        >
          <div className="absolute inset-x-0 h-full w-24 bg-white/10 -skew-x-[45deg] animate-shimmer pointer-events-none" />
          <Check size={18} strokeWidth={4} className="relative z-10" />
          <span className="relative z-10 leading-none">{submitLabel}</span>
        </motion.button>
      )}
    </div>
  );
};
