import React from 'react';
import { motion } from 'framer-motion';
import {
  Headphones,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Rocket,
  Award,
  Bot
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

export const MarketplaceCTASection: React.FC = () => {
  const { navigateTo } = useNavigation();

  // Floating icons configuration with independent physics animations
  const FLOATING_ICONS = [
    { icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', pos: 'top-6 left-6 sm:left-12', delay: 0, duration: 4.2 },
    { icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', pos: 'top-10 right-6 sm:right-16', delay: 0.7, duration: 5.1 },
    { icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', pos: 'bottom-8 left-8 sm:left-20', delay: 1.2, duration: 4.8 },
    { icon: Headphones, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', pos: 'bottom-10 right-8 sm:right-24', delay: 0.4, duration: 5.5 },
    { icon: Rocket, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', pos: 'top-1/2 -left-3 sm:left-4 -translate-y-1/2 hidden md:flex', delay: 1.5, duration: 4.5 },
    { icon: Award, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', pos: 'top-1/2 -right-3 sm:right-4 -translate-y-1/2 hidden md:flex', delay: 0.9, duration: 5.2 }
  ];

  // Floating background particles
  const PARTICLES = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    top: `${Math.random() * 90 + 5}%`,
    left: `${Math.random() * 90 + 5}%`,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 2
  }));

  return (
    <section className="relative my-12 sm:my-16 overflow-hidden rounded-3xl sm:rounded-[36px] bg-slate-950 border border-slate-800/80 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.6)] select-none">
      
      {/* ── 1. ANIMATED GRADIENT BACKGROUND & RADIAL GLOW ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Animated Radial Light Spheres */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.65, 0.35],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/2 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/30 via-cyan-500/30 to-indigo-600/20 rounded-full blur-[140px]"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.55, 0.25],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-1/2 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/25 via-purple-600/25 to-cyan-400/20 rounded-full blur-[130px]"
        />

        {/* Mesh Grid Backdrop Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* ── 2. PARTICLES ── */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.3, 0.8]
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: p.top,
              left: p.left
            }}
            className="absolute rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]"
          />
        ))}
      </div>

      {/* ── 3. FLOATING 3D GLASS ICONS ── */}
      {FLOATING_ICONS.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={idx}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 4, -4, 0]
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay
            }}
            className={`absolute ${item.pos} p-3 rounded-2xl border backdrop-blur-md shadow-xl pointer-events-none z-10 hidden sm:flex items-center justify-center ${item.color}`}
          >
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        );
      })}

      {/* ── 4. MAIN CONTENT & BUTTONS ── */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 py-14 sm:py-18 lg:py-20 text-center space-y-6">
        
        {/* Top Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-xs font-black text-cyan-300 shadow-lg shadow-cyan-500/10">
            <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="uppercase tracking-widest text-[11px]">DEZORYN ARCHITECT CONSULTATION</span>
          </span>
        </motion.div>

        {/* Customizable Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]"
        >
          Need help choosing the <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            right solution?
          </span>
        </motion.h2>

        {/* Supporting Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Schedule a 1-on-1 strategy session with our senior software architects. We will evaluate your business tech stack and recommend the optimal AI copilot or enterprise ERP solution.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          {/* Button 1: Talk to an Expert */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigateTo('/contact-sales')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2.5 border-none"
          >
            <Headphones className="w-4 h-4" />
            <span>Talk to an Expert</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Button 2: Book Free Demo */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigateTo('/book-demo')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-extrabold text-xs border border-slate-700/80 backdrop-blur-md shadow-md transition cursor-pointer flex items-center justify-center gap-2.5"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Book Free Demo</span>
          </motion.button>
        </motion.div>

        {/* Footer Guarantee Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-slate-400"
        >
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            No Obligations • 100% Confidential
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            Instant 30-Min SLA Response
          </span>
        </motion.div>

      </div>
    </section>
  );
};

export default MarketplaceCTASection;
