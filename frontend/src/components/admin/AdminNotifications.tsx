import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileUp,
  ShieldAlert,
  X,
  CheckCheck,
  Trash2
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'user' | 'upload' | 'security' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'security',
    title: 'New Admin Session',
    message: 'Admin logged in from IP 192.168.1.45 (Chrome, Windows)',
    time: '2 mins ago',
    isRead: false,
  },
  {
    id: 'n-2',
    type: 'user',
    title: 'New User Account Created',
    message: 'Sarah Jenkins account was created by Admin.',
    time: '15 mins ago',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'upload',
    title: 'Media Asset Uploaded',
    message: 'hero_banner_v2.webp (4.2 MB) was uploaded to Media Library.',
    time: '1 hour ago',
    isRead: true,
  },
  {
    id: 'n-4',
    type: 'system',
    title: 'Automated Database Backup',
    message: 'PostgreSQL daily snapshot backup completed successfully.',
    time: '3 hours ago',
    isRead: true,
  },
];

export const AdminNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'user':
        return <UserPlus className="w-4 h-4 text-cyan-500" />;
      case 'upload':
        return <FileUp className="w-4 h-4 text-emerald-500" />;
      case 'system':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications menu"
        className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition cursor-pointer"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[10px] font-black text-slate-950 items-center justify-center border border-white dark:border-slate-900">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-[320px] sm:w-[380px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/30 z-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-extrabold">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      title="Clear all"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 scrollbar-thin">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No notifications found.
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => toggleRead(n.id)}
                      className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                        n.isRead
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850'
                          : 'bg-cyan-50/40 dark:bg-cyan-950/20 hover:bg-cyan-50/70 dark:hover:bg-cyan-950/30'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h5 className={`text-xs font-extrabold truncate ${n.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>
                            {n.title}
                          </h5>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 text-center bg-slate-50/80 dark:bg-slate-950/60">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Dezoryn Real-Time Notification Center
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
