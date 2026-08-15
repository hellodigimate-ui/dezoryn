import React, { useState } from 'react';
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
  DollarSign,
  MessageSquareQuote,
  HelpCircle,
  Briefcase,
  PhoneCall,
  LayoutGrid,
  Tv,
  Cog
} from 'lucide-react';


import { useNavigation } from '../../utils/NavigationContext';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
  { id: 'pages', label: 'Page Builder', icon: FileText },
  { id: 'about', label: 'About Section', icon: Layers, badge: 'About CMS', badgeColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' },
  { id: 'navigation', label: 'Navigation', icon: Navigation, badge: 'Menus', badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  { id: 'products', label: 'Marketplace Manager', icon: Package, badge: '12 Modules', badgeColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, badge: 'Plans', badgeColor: 'bg-violet-500/20 text-violet-600 dark:text-violet-400' },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, badge: 'Reviews', badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { id: 'faqs', label: 'FAQ Management', icon: HelpCircle, badge: 'Accordion', badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  { id: 'jobs', label: 'Careers & Hiring', icon: Briefcase, badge: 'Jobs', badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { id: 'contact', label: 'Contact Info', icon: PhoneCall, badge: 'Reach', badgeColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' },
  { id: 'inquiries', label: 'Leads & Inquiries', icon: MessageSquareQuote, badge: 'Leads', badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { id: 'footer', label: 'Footer CMS', icon: LayoutGrid, badge: 'Footer', badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
  { id: 'demos', label: 'Demo Center', icon: Tv, badge: 'Demos', badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  { id: 'services', label: 'Services CMS', icon: Layers, badge: 'Services', badgeColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' },
  { id: 'media', label: 'Media Library', icon: FolderOpen, badge: 'Uploads', badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
  { id: 'site-settings', label: 'Website Settings', icon: Cog, badge: 'Config', badgeColor: 'bg-teal-500/20 text-teal-600 dark:text-teal-400' },
  { id: 'settings', label: 'Theme & Appearance', icon: Settings },
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
}) => {
  const { navigateTo } = useNavigation();
  const [isHovered, setIsHovered] = useState(false);

  // Expanded if hovered on desktop OR opened via mobile drawer
  const isExpanded = isHovered || isOpen;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverChange) onHoverChange(false);
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Gmail-Style Hover Expandable Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 bottom-0 z-50 transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
          isDark
            ? 'bg-slate-900 border-r border-slate-800 text-slate-100'
            : 'bg-white border-r border-slate-200/90 text-slate-800 shadow-xl shadow-slate-200/40'
        } ${
          isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${
          isHovered
            ? `lg:w-64 z-50 ${isDark ? 'lg:shadow-[0_0_35px_rgba(0,0,0,0.6)] lg:border-slate-700' : 'lg:shadow-[0_10px_35px_rgba(0,0,0,0.12)] lg:border-slate-300'}`
            : 'lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-all ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        } ${!isExpanded && 'lg:justify-center'}`}>
          <div
            onClick={() => navigateTo('/')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
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

            {/* Text Label - Expands on Hover */}
            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ${
              isExpanded ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4 overflow-hidden pointer-events-none lg:hidden'
            }`}>
              <span className={`text-sm font-black tracking-tight transition-colors ${
                isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-600'
              }`}>
                Dezoryn
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                Admin
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg lg:hidden transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden space-y-1.5 scrollbar-none">
          <div className={`px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-all ${
            isExpanded ? 'opacity-100' : 'opacity-0 lg:hidden'
          }`}>
            Navigation
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group/item">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center px-3 py-3 rounded-xl font-bold text-xs transition-all group cursor-pointer ${
                    isExpanded ? 'justify-between' : 'justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-cyan-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${
                      isActive ? 'text-white' : isDark ? 'text-slate-400 group-hover:text-cyan-400' : 'text-slate-500 group-hover:text-cyan-600'
                    }`} />
                    
                    {/* Item Label */}
                    <span className={`whitespace-nowrap transition-all duration-300 ${
                      isExpanded ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4 overflow-hidden pointer-events-none lg:hidden'
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Badge or Arrow indicator */}
                  {isExpanded && (
                    item.badge ? (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-slate-200 dark:border-slate-700/50 whitespace-nowrap ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    )
                  )}
                </button>

                {/* Collapsed Hover Tooltip */}
                {!isExpanded && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap border border-slate-800 shadow-xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-50 hidden lg:block">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Role & Footer Card */}
        <div className={`p-3 border-t space-y-2 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className={`p-2.5 rounded-xl border flex items-center transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } ${
            isExpanded ? 'justify-between' : 'justify-center'
          }`}>
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ${
                isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden pointer-events-none lg:hidden'
              }`}>
                <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">System Role</span>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{userRole}</span>
              </div>
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
            <span className={`whitespace-nowrap transition-all duration-300 ${
              isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden pointer-events-none lg:hidden'
            }`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
