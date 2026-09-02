import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  Activity,
  Layers,
  X,
  ChevronRight,
  LogOut,
  Navigation,
  Package,
  IndianRupee,
  MessageSquareQuote,
  HelpCircle,
  Briefcase,
  PhoneCall,
  LayoutGrid,
  Tv,
  Cog,
  BarChart3,
  LifeBuoy,
  Building2
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export interface MenuCategory {
  categoryTitle: string;
  items: MenuItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    categoryTitle: 'ANALYTICS',
    items: [
      { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
    ],
  },
  {
    categoryTitle: 'HOMEPAGE CMS',
    items: [
      { id: 'pages', label: 'Hero Section CMS', icon: FileText },
      { id: 'homepage-stats', label: 'Stats & AI Trust Bar', icon: BarChart3 },
      { id: 'services', label: 'Technology Solutions', icon: Layers },
      { id: 'about', label: 'About Section CMS', icon: Building2 },
    ],
  },
  {
    categoryTitle: 'MARKETPLACE & PRODUCTS',
    items: [
      { id: 'products', label: 'SaaS Marketplace Manager', icon: Package, badge: 'Live DB', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
      { id: 'pricing', label: 'Pricing Plans & Tiers', icon: IndianRupee },
    ],
  },
  {
    categoryTitle: 'SITE NAVIGATION & FOOTER',
    items: [
      { id: 'navigation', label: 'Navigation Menus', icon: Navigation },
      { id: 'footer', label: 'Footer CMS Manager', icon: LayoutGrid },
      { id: 'demos', label: 'Demo Center & Booking', icon: Tv },
    ],
  },
  {
    categoryTitle: 'ENGAGEMENT & LEADS',
    items: [
      { id: 'support', label: 'Support Requests', icon: LifeBuoy },
      { id: 'testimonials', label: 'Testimonials CMS', icon: MessageSquareQuote },
      { id: 'faqs', label: 'FAQ Accordion CMS', icon: HelpCircle },
      { id: 'jobs', label: 'Careers & Job Listings', icon: Briefcase },
      { id: 'contact', label: 'Contact Information', icon: PhoneCall },
      { id: 'inquiries', label: 'Leads & Form Inquiries', icon: MessageSquareQuote },
    ],
  },
  {
    categoryTitle: 'SYSTEM CONFIGURATION',
    items: [
      { id: 'media', label: 'Media Library', icon: FolderOpen },
      { id: 'site-settings', label: 'Website Settings', icon: Cog },
      { id: 'settings', label: 'Theme & Appearance', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  onLogout?: () => void;
  isDark?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  isCollapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  userRole = 'ADMIN',
  onLogout,
  isDark = true,
  onHoverChange,
  isCollapsed = false,
}) => {
  const { navigateTo } = useNavigation();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverChange) onHoverChange(false);
  };

  // Expanded condition:
  // On mobile: active when mobile drawer is open
  // On desktop: active when NOT collapsed, OR when mouse is hovered
  const isExpanded = isMobile ? isOpen : (!isCollapsed || isHovered);
  const desktopWidth = isCollapsed && !isHovered ? 80 : 280;

  return (
    <>
      {/* Mobile Overlay Backdrop with Motion */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Gmail-Style Smooth Motion Animated Sidebar */}
      <motion.aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={false}
        animate={
          isMobile
            ? { x: isOpen ? 0 : -290, width: 256 }
            : { x: 0, width: desktopWidth }
        }
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 32,
          mass: 0.85
        }}
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
          isDark
            ? 'bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 text-slate-100'
            : 'bg-white/95 backdrop-blur-xl border-r border-slate-200/90 text-slate-800 shadow-xl shadow-slate-200/40'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div
            onClick={() => navigateTo('/')}
            className="flex items-center gap-3 cursor-pointer group shrink-0 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-900'}`}>
                <img
                  src="/dezoryn-logo.jpg"
                  alt="Dezoryn Technology Logo"
                  className="w-full h-full object-cover scale-[2.1] transform transition-transform"
                />
              </div>
            </div>

            {/* Text Label - Expands with Framer Motion */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0, x: -10 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden"
                >
                  <span className={`text-sm font-black tracking-tight transition-colors ${
                    isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-600'
                  }`}>
                    Dezoryn
                  </span>
                  <span className="text-[10px] font-extrabold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                    Admin
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Categories & Items List */}
        <div className="flex-1 py-3 px-3 overflow-y-auto overflow-x-hidden space-y-4 scrollbar-none">
          {MENU_CATEGORIES.map((cat, catIdx) => (
            <div key={cat.categoryTitle} className="space-y-1">
              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-2 pt-1 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 overflow-hidden whitespace-nowrap"
                  >
                    {cat.categoryTitle}
                  </motion.div>
                ) : (
                  catIdx > 0 && <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-2 mx-1" />
                )}
              </AnimatePresence>

              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group/item">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isMobile) onClose();
                      }}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl font-bold text-xs transition-colors relative group cursor-pointer ${
                        isExpanded ? 'justify-between' : 'justify-center'
                      } ${
                        isActive
                          ? 'text-white shadow-lg shadow-blue-500/20'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-cyan-50/80'
                      }`}
                    >
                      {/* Active Item Motion Background Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="activeAdminNavPill"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-xl -z-10"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      <div className="flex items-center gap-3 shrink-0">
                        <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 shrink-0 ${
                          isActive ? 'text-white' : isDark ? 'text-slate-400 group-hover:text-cyan-400' : 'text-slate-500 group-hover:text-cyan-600'
                        }`} />
                        
                        {/* Item Label with Motion */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.span
                              initial={{ opacity: 0, width: 0, x: -8 }}
                              animate={{ opacity: 1, width: 'auto', x: 0 }}
                              exit={{ opacity: 0, width: 0, x: -8 }}
                              transition={{ duration: 0.18 }}
                              className="whitespace-nowrap overflow-hidden text-left"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Badge or Arrow indicator */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          item.badge ? (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-slate-200 dark:border-slate-700/50 whitespace-nowrap shrink-0 ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                            >
                              {item.badge}
                            </motion.span>
                          ) : (
                            isActive && (
                              <motion.div
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -4 }}
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
                              </motion.div>
                            )
                          )
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Collapsed Hover Tooltip */}
                    {!isExpanded && !isMobile && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap border border-slate-800 shadow-xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-all duration-200 z-50 transform translate-x-1 group-hover/item:translate-x-0">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Role & Footer Card */}
        <div className={`p-3 border-t space-y-2 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className={`p-2.5 rounded-xl border flex items-center transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } ${
            isExpanded ? 'justify-between' : 'justify-center'
          }`}>
            <div className="flex items-center gap-2.5 shrink-0 overflow-hidden">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, x: -8 }}
                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">System Role</span>
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{userRole}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {isExpanded && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
          </div>

          <button
            type="button"
            onClick={onLogout ? onLogout : () => navigateTo('/admin/login')}
            className={`w-full flex items-center rounded-xl border text-xs font-extrabold transition cursor-pointer py-2.5 ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/50'
                : 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
            } ${
              isExpanded ? 'justify-center gap-2 px-3' : 'justify-center'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0, x: -8 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

