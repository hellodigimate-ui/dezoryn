import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-red-500/8 via-purple-600/8 to-blue-600/8 blur-[130px]"
        />
        {/* Floating particles */}
        {[
          { left: '10%', top: '20%', delay: 0 },
          { left: '80%', top: '15%', delay: 1 },
          { left: '60%', top: '75%', delay: 0.6 },
          { left: '25%', top: '65%', delay: 1.8 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 blur-[1px]"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* 404 giant text */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-6"
        >
          <span
            className="text-[120px] sm:text-[160px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #06b6d4 40%, #2563eb 70%, #1e293b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'dezo-shimmer 5s linear infinite',
            }}
          >
            404
          </span>
          {/* Glow behind number */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-24 bg-cyan-500/20 blur-[60px] rounded-full" />
          </div>
        </motion.div>

        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={() => navigateTo('/')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 cursor-pointer border-none"
          >
            <Home className="w-4 h-4" />
            Go Home
          </motion.button>
          <motion.button
            type="button"
            onClick={() => window.history.back()}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold mb-4">Popular Pages</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Products', route: '/products' },
              { label: 'Pricing', route: '/pricing' },
              { label: 'About', route: '/about' },
              { label: 'Book Demo', route: '/book-demo' },
              { label: 'Contact', route: '/contact-sales' },
            ].map((link) => (
              <button
                key={link.route}
                type="button"
                onClick={() => navigateTo(link.route as any)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
