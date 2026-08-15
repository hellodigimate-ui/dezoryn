import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,

  Cross,
  Users2,
  Boxes,
  Sparkles
} from 'lucide-react';


interface ModuleNode {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  positionClasses: string;
  delay: number;
  yOffset: number;
}

export const FloatingCards: React.FC = () => {
  const nodes: ModuleNode[] = [
    {
      id: 'schoolycore',
      title: 'SchoolyCore',
      subtitle: 'School ERP',
      icon: <GraduationCap className="w-4 h-4 text-white" />,
      iconBg: 'bg-blue-600 shadow-md shadow-blue-600/30',
      positionClasses: 'top-[4%] left-[32%]',
      delay: 0,
      yOffset: -6
    },

    {
      id: 'hrms',
      title: 'HRMS',
      subtitle: 'Human Resource',
      icon: <Users2 className="w-4 h-4 text-white" />,
      iconBg: 'bg-emerald-500 shadow-md shadow-emerald-500/30',
      positionClasses: 'bottom-[18%] left-[2%]',
      delay: 0.2,
      yOffset: -6
    },
    {
      id: 'hms',
      title: 'HMS',
      subtitle: 'Hospital Management',
      icon: <Cross className="w-4 h-4 text-white" />,
      iconBg: 'bg-purple-600 shadow-md shadow-purple-600/30',
      positionClasses: 'top-[22%] right-[2%]',
      delay: 0.3,
      yOffset: 6
    },
    {
      id: 'inventorypro',
      title: 'InventoryPro',
      subtitle: 'Inventory Management',
      icon: <Boxes className="w-4 h-4 text-white" />,
      iconBg: 'bg-amber-500 shadow-md shadow-amber-500/30',
      positionClasses: 'bottom-[16%] right-[2%]',
      delay: 0.4,
      yOffset: -6
    }
  ];


  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Network Orbits & Connecting Nodes overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
        <circle cx="50%" cy="50%" r="180" fill="none" stroke="rgba(37, 99, 235, 0.18)" strokeWidth="1.5" />
        <circle cx="50%" cy="50%" r="240" fill="none" stroke="rgba(37, 99, 235, 0.12)" strokeWidth="1.5" strokeDasharray="5 7" />

        {/* Pulsing connection node dots */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const cx = `calc(50% + ${Math.cos(rad) * 240}px)`;
          const cy = `calc(50% + ${Math.sin(rad) * 240}px)`;
          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="3.5"
              fill="#3b82f6"
              className="animate-pulse"
            />
          );
        })}
      </svg>

      {/* Floating Sales Intelligence Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, node.yOffset, 0]
          }}
          transition={{
            opacity: { duration: 0.5, delay: node.delay },
            scale: { duration: 0.5, delay: node.delay },
            y: {
              duration: 2.0 + node.delay * 0.3,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut'
            }
          }}
          className={`absolute pointer-events-auto ${node.positionClasses}`}
        >
          <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 rounded-2xl shadow-xl shadow-blue-950/10 dark:shadow-slate-950/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer backdrop-blur-md group">
            {/* Circular Colored Icon Badge */}
            <div className={`w-8 h-8 rounded-xl ${node.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              {node.icon}
            </div>

            {/* Label Text */}
            <div className="flex flex-col text-left pr-1">
              <span className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight">
                {node.title}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 whitespace-nowrap">
                {node.subtitle}
              </span>
            </div>

            {/* Pulsing Blue Dot */}
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
          </div>

        </motion.div>
      ))}

      {/* Holographic Platform Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto"
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-blue-400/30 text-white text-[11px] font-semibold shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Real-time Global Sync</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

