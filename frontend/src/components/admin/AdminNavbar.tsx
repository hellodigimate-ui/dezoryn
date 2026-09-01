import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Moon, Sun, Sparkles, X,
  LayoutDashboard, FileText, Layers, Package, DollarSign,
  Navigation, LayoutGrid, Tv, LifeBuoy, MessageSquareQuote,
  HelpCircle, Briefcase, PhoneCall, FolderOpen, Cog,
  Settings, Building, BarChart3, ExternalLink,
  CornerDownLeft, Command
} from 'lucide-react';
import { AdminNotifications } from './AdminNotifications';
import { AdminProfileMenu } from './AdminProfileMenu';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { useNavigation } from '../../utils/NavigationContext';

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

interface SearchItem {
  id: string;
  title: string;
  category: 'CMS Modules' | 'Global Settings' | 'Engagement & CRM' | 'Quick Actions' | 'Public Website';
  description: string;
  keywords: string[];
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  action: () => void;
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
  const { navigateTo } = useNavigation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Helper to safely navigate inside admin tabs
  const handleAdminTabJump = useCallback((tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
    setIsOpen(false);
    setQuery('');
  }, [onNavigate]);

  // Master Search Index
  const searchItems: SearchItem[] = useMemo(() => [
    // ── CMS MODULES ──
    {
      id: 'products',
      title: 'SaaS Marketplace Manager',
      category: 'CMS Modules',
      description: 'Manage SaaS catalog products, 25+ database fields, pricing tiers, and reviews',
      keywords: ['product', 'marketplace', 'saas', 'pricing', 'inventory', 'schoolycore', 'enterprise', 'edit', 'store'],
      icon: Package,
      badge: 'Database',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      action: () => handleAdminTabJump('products'),
    },
    {
      id: 'offices',
      title: 'Worldwide Offices CMS',
      category: 'CMS Modules',
      description: 'Manage global footprint office locations, Global HQ, cities, addresses, hours, and phones',
      keywords: ['office', 'location', 'city', 'indore', 'san francisco', 'london', 'singapore', 'footprint', 'map', 'global hq', 'address'],
      icon: Building,
      badge: 'Live Sync',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      action: () => handleAdminTabJump('offices'),
    },
    {
      id: 'contact',
      title: 'Contact Information CMS',
      category: 'CMS Modules',
      description: 'Configure direct channels, support line, WhatsApp, SLA badges, and security guarantees',
      keywords: ['contact', 'phone', 'email', 'whatsapp', 'support', 'sla', 'guarantee', 'direct line', 'inquiry'],
      icon: PhoneCall,
      badge: 'Contact',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      action: () => handleAdminTabJump('contact'),
    },
    {
      id: 'pricing',
      title: 'Pricing Plans & Tiers',
      category: 'CMS Modules',
      description: 'Set subscription tiers, feature checklists, billing periods, and enterprise quotes',
      keywords: ['pricing', 'plans', 'tiers', 'cost', 'subscription', 'monthly', 'annual', 'starter', 'pro'],
      icon: DollarSign,
      action: () => handleAdminTabJump('pricing'),
    },
    {
      id: 'pages',
      title: 'Hero Section CMS',
      category: 'CMS Modules',
      description: 'Customize homepage hero headlines, gradient texts, CTA buttons, and background glow',
      keywords: ['hero', 'banner', 'header', 'headline', 'title', 'homepage', 'cta', 'button'],
      icon: FileText,
      action: () => handleAdminTabJump('pages'),
    },
    {
      id: 'homepage-stats',
      title: 'Stats & AI Trust Bar',
      category: 'CMS Modules',
      description: 'Configure live company metric counters, growth stats, and enterprise partner logos',
      keywords: ['stats', 'metrics', 'trust bar', 'numbers', 'counters', 'logos', 'homepage stats', 'partners'],
      icon: BarChart3,
      action: () => handleAdminTabJump('homepage-stats'),
    },
    {
      id: 'services',
      title: 'Technology Solutions CMS',
      category: 'CMS Modules',
      description: 'Manage enterprise software solutions, cloud architecture, and technical services',
      keywords: ['services', 'solutions', 'technology', 'cloud', 'architecture', 'features', 'modules'],
      icon: Layers,
      action: () => handleAdminTabJump('services'),
    },
    {
      id: 'about',
      title: 'About Section CMS',
      category: 'CMS Modules',
      description: 'Edit company journey, leadership vision, milestones, and brand story',
      keywords: ['about', 'company', 'story', 'mission', 'vision', 'team', 'journey', 'timeline'],
      icon: Layers,
      action: () => handleAdminTabJump('about'),
    },
    {
      id: 'navigation',
      title: 'Navigation Menus',
      category: 'CMS Modules',
      description: 'Configure main navigation bar links, badges, dropdown hierarchies, and ordering',
      keywords: ['nav', 'navigation', 'menu', 'header menu', 'links', 'navbar', 'items'],
      icon: Navigation,
      action: () => handleAdminTabJump('navigation'),
    },
    {
      id: 'footer',
      title: 'Footer CMS Manager',
      category: 'CMS Modules',
      description: 'Edit footer columns, copyright notice, social media links, and newsletter box',
      keywords: ['footer', 'copyright', 'socials', 'links', 'bottom', 'privacy', 'terms'],
      icon: LayoutGrid,
      action: () => handleAdminTabJump('footer'),
    },
    {
      id: 'demos',
      title: 'Demo Center & Booking',
      category: 'CMS Modules',
      description: 'Manage interactive software walkthroughs and booked client demo slots',
      keywords: ['demo', 'booking', 'interactive demo', 'schedule demo', 'calendar', 'slots'],
      icon: Tv,
      action: () => handleAdminTabJump('demos'),
    },

    // ── ENGAGEMENT & CRM ──
    {
      id: 'inquiries',
      title: 'Leads & Form Inquiries',
      category: 'Engagement & CRM',
      description: 'Review inbound enterprise inquiries, demo requests, and customer contact leads',
      keywords: ['leads', 'inquiries', 'submissions', 'form data', 'sales inquiries', 'messages', 'crm'],
      icon: MessageSquareQuote,
      badge: 'Leads',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      action: () => handleAdminTabJump('inquiries'),
    },
    {
      id: 'support',
      title: 'Support Requests & Tickets',
      category: 'Engagement & CRM',
      description: 'Track and respond to client help tickets, support requests, and user inquiries',
      keywords: ['support', 'ticket', 'help', 'requests', 'customer service', 'issues'],
      icon: LifeBuoy,
      action: () => handleAdminTabJump('support'),
    },
    {
      id: 'testimonials',
      title: 'Testimonials CMS',
      category: 'Engagement & CRM',
      description: 'Moderate customer quotes, executive testimonials, ratings, and client photos',
      keywords: ['testimonial', 'reviews', 'quotes', 'client', 'feedback', 'ratings', 'social proof'],
      icon: MessageSquareQuote,
      action: () => handleAdminTabJump('testimonials'),
    },
    {
      id: 'faqs',
      title: 'FAQ Accordion CMS',
      category: 'Engagement & CRM',
      description: 'Manage Frequently Asked Questions, categories, answers, and accordions',
      keywords: ['faq', 'questions', 'answers', 'help', 'accordion', 'knowledge'],
      icon: HelpCircle,
      action: () => handleAdminTabJump('faqs'),
    },
    {
      id: 'jobs',
      title: 'Careers & Job Listings',
      category: 'Engagement & CRM',
      description: 'Create job postings, departments, experience levels, and application tracking',
      keywords: ['jobs', 'careers', 'hiring', 'positions', 'recruitment', 'vacancies'],
      icon: Briefcase,
      action: () => handleAdminTabJump('jobs'),
    },

    // ── GLOBAL SETTINGS ──
    {
      id: 'overview',
      title: 'Overview & Analytics Dashboard',
      category: 'Global Settings',
      description: 'Executive performance KPIs, live traffic metrics, and activity feeds',
      keywords: ['overview', 'dashboard', 'analytics', 'metrics', 'home', 'kpi', 'traffic', 'summary'],
      icon: LayoutDashboard,
      action: () => handleAdminTabJump('overview'),
    },
    {
      id: 'media',
      title: 'Media Library',
      category: 'Global Settings',
      description: 'Upload, manage, and browse photos, product screenshots, and brand assets',
      keywords: ['media', 'images', 'uploads', 'assets', 'pictures', 'files', 'photos', 'library'],
      icon: FolderOpen,
      action: () => handleAdminTabJump('media'),
    },
    {
      id: 'site-settings',
      title: 'Website Settings & SEO',
      category: 'Global Settings',
      description: 'Global site configuration, SEO metadata tags, favicon, and brand identities',
      keywords: ['settings', 'seo', 'meta', 'analytics', 'brand', 'site config', 'website'],
      icon: Cog,
      action: () => handleAdminTabJump('site-settings'),
    },
    {
      id: 'settings',
      title: 'Theme & Appearance',
      category: 'Global Settings',
      description: 'Customize theme colors, primary accents, UI border radiuses, and appearance',
      keywords: ['theme', 'appearance', 'colors', 'dark mode', 'style', 'ui', 'brand color'],
      icon: Settings,
      action: () => handleAdminTabJump('settings'),
    },

    // ── QUICK ACTIONS ──
    {
      id: 'action-ai',
      title: 'Open AI Assistant',
      category: 'Quick Actions',
      description: 'Generate high-converting headlines, feature specs, product descriptions, and SEO tags',
      keywords: ['ai', 'generate', 'assistant', 'writer', 'sparkles', 'copilot', 'create copy', 'gpt'],
      icon: Sparkles,
      badge: '⚡ AI Copilot',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      action: () => {
        if (onOpenAI) onOpenAI();
        setIsOpen(false);
        setQuery('');
      },
    },
    {
      id: 'action-theme',
      title: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`,
      category: 'Quick Actions',
      description: `Toggle admin theme immediately to ${isDark ? 'Light' : 'Dark'} visual mode`,
      keywords: ['theme', 'dark mode', 'light mode', 'switch theme', 'toggle dark', 'sun', 'moon'],
      icon: isDark ? Sun : Moon,
      badge: isDark ? 'Light' : 'Dark',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      action: () => {
        onToggleTheme();
        setIsOpen(false);
      },
    },
    {
      id: 'action-logout',
      title: 'Log Out of Admin Session',
      category: 'Quick Actions',
      description: 'Safely terminate current administrative pair session',
      keywords: ['logout', 'sign out', 'exit', 'leave'],
      icon: ExternalLink,
      badge: 'Account',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      action: () => {
        if (onLogout) onLogout();
        setIsOpen(false);
      },
    },

    // ── PUBLIC WEBSITE LINKS ──
    {
      id: 'public-home',
      title: 'View Live Public Website',
      category: 'Public Website',
      description: 'Navigate directly to visitor homepage (/)',
      keywords: ['public', 'home', 'website', 'live site', 'frontend', 'visitor'],
      icon: ExternalLink,
      action: () => {
        navigateTo('/');
        setIsOpen(false);
      },
    },
    {
      id: 'public-marketplace',
      title: 'View Public Marketplace',
      category: 'Public Website',
      description: 'Navigate to visitor SaaS marketplace catalog (/marketplace)',
      keywords: ['public marketplace', 'catalog', 'live products', 'store'],
      icon: ExternalLink,
      action: () => {
        navigateTo('/marketplace');
        setIsOpen(false);
      },
    },
    {
      id: 'public-contact',
      title: 'View Public Contact & Offices Page',
      category: 'Public Website',
      description: 'Navigate to visitor contact & global footprint office locations (/contact-sales)',
      keywords: ['public contact', 'offices page', 'locations page', 'sales page'],
      icon: ExternalLink,
      action: () => {
        navigateTo('/contact-sales');
        setIsOpen(false);
      },
    },
  ], [handleAdminTabJump, isDark, navigateTo, onLogout, onOpenAI, onToggleTheme]);

  // Filter Search Items
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return searchItems.filter(item => {
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;

      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inCat = item.category.toLowerCase().includes(q);
      const inKeywords = item.keywords.some(k => k.toLowerCase().includes(q));

      return inTitle || inDesc || inCat || inKeywords;
    });
  }, [searchItems, query, categoryFilter]);

  // Reset selected index when query or filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, categoryFilter]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Keyboard Event Handlers (⌘K / Ctrl+K & Arrow Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Toggle search modal with ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen(prev => {
          if (!prev) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return !prev;
        });
        return;
      }

      if (!isOpen) return;

      // 2. Escape closes
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        return;
      }

      // 3. Arrow Down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
        return;
      }

      // 4. Arrow Up
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredResults.length || 1)) % (filteredResults.length || 1));
        return;
      }

      // 5. Enter executes
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredResults[selectedIndex];
        if (selected) {
          selected.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const categories = [
    { id: 'all', label: 'All Results' },
    { id: 'CMS Modules', label: 'CMS Modules' },
    { id: 'Engagement & CRM', label: 'Engagement' },
    { id: 'Global Settings', label: 'Settings' },
    { id: 'Quick Actions', label: 'Quick Actions' },
    { id: 'Public Website', label: 'Public Site' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      {/* Left: Mobile Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar Navigation"
          title="Toggle Sidebar"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AdminBreadcrumbs activeTab={activeTab} />
      </div>

      {/* Center: Command Palette & Global Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-3 sm:mx-6">
        <div
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className={`relative w-full flex items-center rounded-2xl transition-all duration-300 cursor-text ${
            isOpen
              ? 'ring-2 ring-cyan-500/40 border-cyan-500 bg-white dark:bg-slate-900 shadow-xl shadow-cyan-500/10'
              : 'bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
          }`}
        >
          <Search className={`w-4 h-4 ml-3.5 shrink-0 transition-colors ${
            isOpen ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
          }`} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search pages, offices, products, settings... (⌘K)"
            className="w-full pl-2.5 pr-20 py-2 bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-200/90 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-300/80 dark:border-slate-700 shadow-2xs pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          </div>
        </div>

        {/* ── COMMAND PALETTE DROPDOWN / OVERLAY ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-50 max-h-[520px] flex flex-col"
            >
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 p-3 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto bg-slate-50/70 dark:bg-slate-950/40 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryFilter(cat.id);
                      inputRef.current?.focus();
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div
                ref={resultsContainerRef}
                className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100/50 dark:divide-slate-800/50 flex-1 max-h-[380px]"
              >
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, idx) => {
                    const IconComponent = item.icon;
                    const isSelected = idx === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        data-index={idx}
                        onClick={() => item.action()}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent dark:from-cyan-500/20 dark:via-blue-500/10 border border-blue-500/20 dark:border-cyan-500/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-extrabold truncate ${
                                isSelected ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {item.title}
                              </span>

                              {item.badge && (
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-md">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
                            {item.category}
                          </span>

                          <div className={`p-1.5 rounded-lg transition-transform ${
                            isSelected
                              ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 translate-x-0.5'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100'
                          }`}>
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No matches found for "{query}"
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        Try searching for <button type="button" onClick={() => setQuery('offices')} className="text-cyan-500 hover:underline">offices</button>, <button type="button" onClick={() => setQuery('products')} className="text-cyan-500 hover:underline">products</button>, <button type="button" onClick={() => setQuery('pricing')} className="text-cyan-500 hover:underline">pricing</button>, or <button type="button" onClick={() => setQuery('contact')} className="text-cyan-500 hover:underline">contact</button>.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Command Palette Footer Keyboard Shortcuts */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono border border-slate-300 dark:border-slate-700">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono border border-slate-300 dark:border-slate-700">↓</kbd>
                    <span>Navigate</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono border border-slate-300 dark:border-slate-700">↵</kbd>
                    <span>Open</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono border border-slate-300 dark:border-slate-700">ESC</kbd>
                    <span>Close</span>
                  </span>
                </div>

                <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Spotlight Search</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Actions (AI Assistant, Theme Toggle, Notifications, Profile) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
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
