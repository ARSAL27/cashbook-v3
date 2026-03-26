import React from 'react';
import { motion } from 'framer-motion';

interface CurrencyLogoProps {
  className?: string;
  animate?: boolean;
}

export const CurrencyLogo: React.FC<CurrencyLogoProps> = ({ className = '', animate = false }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Book Icon */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      {/* Rs Symbol */}
      <span className="absolute bottom-1 right-0 text-[10px] font-black bg-white px-1 rounded-sm border border-primary/20 text-primary">₨</span>
      
      {/* Pen Animation (Optional) */}
      {animate && (
        <motion.div
          animate={{ 
            x: [0, 5, 0, 10, 0],
            y: [0, -5, 0, -10, 0],
            rotate: [15, 25, 15, 35, 15]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-2 text-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </motion.div>
      )}
    </div>
  );
};
