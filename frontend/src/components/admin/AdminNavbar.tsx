import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Moon, Sun, Sparkles } from 'lucide-react';
import { AdminNotifications } from './AdminNotifications';
import { AdminProfileMenu } from './AdminProfileMenu';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: string;
  userRole?: string;
  onLogout?: () => void;
  onOpenAI?: () => void;
  onNavigate?: (tabId: string) => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onToggleSidebar,
  isDark,
  onToggleTheme,
  activeTab,
  userRole = 'ADMIN',
  onLogout,
  onOpenAI,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      {/* Left: Mobile Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open Mobile Menu"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 lg:hidden transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AdminBreadcrumbs activeTab={activeTab} />
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages, users, media, logs... (Press '/')"
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition shadow-inner"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            /
          </span>
        </div>
      </div>

      {/* Right: Actions (AI Assistant, Theme Toggle, Notifications, Profile) */}
      <div className="flex items-center gap-2.5">
        {/* AI Assistant Trigger Button */}
        <button
          type="button"
          onClick={onOpenAI}
          title="Open AI Content Assistant"
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Ultra-Smooth Animated Dark Mode Toggle */}
        <motion.button
          type="button"
          onClick={onToggleTheme}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Dark Mode"
          className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition cursor-pointer overflow-hidden shadow-xs"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ y: -16, opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ y: 16, opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex items-center justify-center"
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notifications Dropdown */}
        <AdminNotifications />

        {/* Profile Dropdown Menu */}
        <AdminProfileMenu
          user={{
            name: 'System Admin',
            email: `${userRole.toLowerCase()}@dezoryn.com`,
            role: userRole,
          }}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />
      </div>
    </header>
  );
};
