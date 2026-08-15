import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedDividerProps {
  className?: string;
}

export const AnimatedDivider: React.FC<AnimatedDividerProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full py-8 flex items-center justify-center overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] ${className}`}>
      {/* 1. Base Gradient Line fading out at both edges */}
      <div
        className="w-full h-[1.5px] relative"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--primary-color, #2563eb) 20%, var(--accent-color, #06b6d4) 50%, var(--secondary-color, #4f46e5) 80%, transparent 100%)',
          boxShadow: '0 0 12px var(--accent-color, rgba(6, 182, 212, 0.4))',
        }}
      >
        {/* 2. Moving Light Sweep Beam (Triggers every 4s) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-[3px] w-32 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
            boxShadow: '0 0 20px #ffffff, 0 0 30px var(--accent-color, #06b6d4)',
          }}
          animate={{
            x: ['-20%', '900%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 2.5,
            ease: 'easeInOut',
          }}
        />

        {/* 3. Central Glow Pulse Dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 dark:bg-cyan-300 animate-ping opacity-60 pointer-events-none" />
          <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 border border-cyan-400 shadow-[0_0_10px_#06b6d4] z-10" />
        </div>
      </div>

      {/* 4. Small Lightweight Floating Micro-Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '25%', delay: 0 },
          { left: '48%', delay: 1.2 },
          { left: '72%', delay: 2.4 },
        ].map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/60 blur-[0.3px]"
            style={{ left: p.left, top: '50%' }}
            animate={{
              y: [0, -12, 0],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 1,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};
