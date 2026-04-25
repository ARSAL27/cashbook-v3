import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeTextProps {
  text: string;
  className?: string;
  threshold?: number;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({ 
  text, 
  className = "", 
  threshold = 25 
}) => {
  const isLong = text.length > threshold;

  if (!isLong) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className="overflow-hidden whitespace-nowrap relative w-full">
      <div className="flex gap-10 min-w-max">
        <motion.div
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            duration: Math.max(10, text.length * 0.2), // Speed based on length
            repeat: Infinity,
            ease: "linear",
          }}
          className="inline-block"
        >
          <p className={`${className} pr-10 uppercase`}>{text}</p>
        </motion.div>
        <motion.div
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            duration: Math.max(10, text.length * 0.2),
            repeat: Infinity,
            ease: "linear",
          }}
          className="inline-block"
        >
          <p className={`${className} pr-10 uppercase`}>{text}</p>
        </motion.div>
      </div>
    </div>
  );
};
