import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600 border border-transparent dark:border-white/5 shadow-sm">
        <Icon size={40} className="opacity-60" />
      </div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed mb-8">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#0A3D24] text-[#4BFF94] px-8 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
