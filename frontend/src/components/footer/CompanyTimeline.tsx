import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Building2, Zap, Globe, Award, Trophy, Star, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../config/api.config';


export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  icon?: string;
  orderIndex?: number;
  enabled?: boolean;
}

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: 't-1',
    year: '2020',
    title: 'Founded',
    description: 'Started with a vision to unify ERP, CRM, and AI operations into a single intelligent platform.',
    icon: 'Sparkles',
    enabled: true,
  },
  {
    id: 't-2',
    year: '2023',
    title: 'Product Suite Expansion',
    description: 'Launched SchoolyCore ERP and Hospitality HMS modules serving 200+ clients.',
    icon: 'Building2',
    enabled: true,
  },
  {
    id: 't-3',
    year: '2025',
    title: 'AI Platform Launch',
    description: 'Unveiled DezoAI Predictive Sales Engine with autonomous copilot workflows.',
    icon: 'Zap',
    enabled: true,
  },
  {
    id: 't-4',
    year: '2026',
    title: 'Global Expansion',
    description: 'Scaled to 10M+ active workflows across global enterprise fleets.',
    icon: 'Globe',
    enabled: true,
  },
];

const getMilestoneIcon = (iconName?: string) => {
  switch (iconName?.toLowerCase()) {
    case 'building2':
    case 'building':
      return Building2;
    case 'zap':
    case 'lightning':
      return Zap;
    case 'globe':
    case 'world':
      return Globe;
    case 'award':
      return Award;
    case 'trophy':
      return Trophy;
    case 'star':
      return Star;
    case 'sparkles':
    case 'rocket':
    default:
      return Rocket;
  }
};

export const CompanyTimeline: React.FC = () => {
  const [items, setItems] = useState<TimelineItem[]>(DEFAULT_TIMELINE_ITEMS);

  useEffect(() => {
    apiFetch('/timeline')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setItems(data.data.filter((i: TimelineItem) => i.enabled !== false));
        }
      })
      .catch(() => {
        // Fallback
      });
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest mb-3"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Growth & Evolution</span>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Company Journey
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium"
        >
          Key milestones driving our mission to transform enterprise AI operations.
        </motion.p>
      </div>

      {/* Horizontal Animated Timeline Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Horizontal Connecting Glow Line (Desktop) */}
        <div className="absolute top-6 left-12 right-12 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 dark:from-blue-500 dark:via-cyan-400 dark:to-indigo-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] hidden lg:block z-0" />

        {/* Milestone Items Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
          {items.map((item, idx) => {
            const IconComp = getMilestoneIcon(item.icon);
            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Milestone Node Dot Aligned on Horizontal Line */}
                <div className="relative mb-5 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-2 border-cyan-500 shadow-xl shadow-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300 z-10">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 animate-pulse" />
                  </div>

                  {/* Horizontal Arrow Indicator to next item (Desktop) */}
                  {idx < items.length - 1 && (
                    <div className="hidden lg:block absolute left-full ml-2 text-cyan-400/60 pointer-events-none">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Milestone Card Container */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="w-full p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 text-left flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs tracking-wider">
                      {item.year}
                    </span>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
