import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Mail } from 'lucide-react';

export const MaintenancePage: React.FC = () => (
  <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
    <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 max-w-lg text-center space-y-6"
    >
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 shadow-xl shadow-amber-500/10 mx-auto">
        <Shield className="w-10 h-10 text-amber-400" />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Scheduled Maintenance
      </div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
        We'll be right<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          back soon
        </span>
      </h1>

      <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
        Our team is performing scheduled maintenance to improve your experience. We apologize for the inconvenience and appreciate your patience.
      </p>

      {/* Contact */}
      <a
        href="mailto:support@dezoryn.com"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-500/20 hover:opacity-90 transition"
      >
        <Mail className="w-4 h-4" />
        Contact Support
        <ArrowRight className="w-3.5 h-3.5" />
      </a>

      <p className="text-[10px] text-slate-600 font-semibold">
        Dezoryn Technologies · Enterprise Platform
      </p>
    </motion.div>
  </div>
);
