import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import type { AppRoute } from '../../utils/router';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  eta?: string;
  backRoute?: AppRoute;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This page is currently under construction. Check back soon.',
  icon,
  eta,
  backRoute = '/',
}) => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-purple-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-center w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-blue-600/30"
        >
          {icon ?? <Construction className="w-12 h-12 text-white" />}
        </motion.div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-5">
          <Sparkles className="w-3 h-3" />
          Coming Soon
        </div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{description}</p>
        {eta && (
          <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mb-8">Expected: {eta}</p>
        )}

        {/* Progress bar animation */}
        <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Back button */}
        <motion.button
          type="button"
          onClick={() => navigateTo(backRoute)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 cursor-pointer border-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
