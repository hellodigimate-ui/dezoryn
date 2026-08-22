import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Cog,
  LogOut,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

interface AdminProfileMenuProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onNavigate?: (tabId: string) => void;
}

export const AdminProfileMenu: React.FC<AdminProfileMenuProps> = ({
  user = {
    name: 'System Admin',
    email: 'dezoryntechnology@gmail.com',
    role: 'ADMIN',
  },
  onLogout,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigateTo } = useNavigation();

  const handleNavClick = (tabId: string) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      navigateTo('/admin/login');
    }
  };

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle profile menu"
        className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
          {user.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="hidden md:flex flex-col text-left pr-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
            {user.role}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/30 z-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Header Info */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Role: {user.role}
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('site-settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('site-settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <Cog className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  System Settings
                </button>
              </div>

              {/* Divider & Logout */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
