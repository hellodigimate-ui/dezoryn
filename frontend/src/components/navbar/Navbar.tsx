import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigation, type AppRoute } from '../../utils/NavigationContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { apiFetch } from '../../config/api.config';


interface NavItemData {
  id: string;
  label: string;
  route: string;
  order: number;
  isVisible: boolean;
  isHighlight: boolean;
}

interface NavbarProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const STATIC_NAV: NavItemData[] = [
  { id: '1', label: 'Home', route: '/', order: 0, isVisible: true, isHighlight: false },
  { id: '2', label: 'Ecosystem', route: '/products', order: 1, isVisible: true, isHighlight: false },
  { id: '3', label: 'Marketplace', route: '/marketplace', order: 2, isVisible: true, isHighlight: false },
  { id: '4', label: 'Services', route: '/services', order: 3, isVisible: true, isHighlight: false },
  { id: '5', label: 'Careers', route: '/careers', order: 4, isVisible: true, isHighlight: false },
  { id: '6', label: 'Pricing', route: '/pricing', order: 5, isVisible: true, isHighlight: false },
  { id: '7', label: 'About Us', route: '/about', order: 6, isVisible: true, isHighlight: false },
  { id: '8', label: 'Contact', route: '/contact-sales', order: 7, isVisible: true, isHighlight: false },
];

export const Navbar: React.FC<NavbarProps> = React.memo(({
  theme = 'light',
  onToggleTheme
}) => {
  const { currentRoute, activeSection, navigateTo } = useNavigation();
  const { settings: siteSettings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItemData[]>(STATIC_NAV);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [siteSettings.logoUrl]);

  // Fetch navigation items from backend CMS API
  useEffect(() => {
    apiFetch('/nav')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const normalized = data.data.map((item: NavItemData) => {
            let updated = { ...item };
            if (updated.route === '/contact-sales' || updated.label === 'Contact Sales' || updated.label === 'Contact Sales Team') {
              updated = { ...updated, label: 'Contact', route: '/contact-sales' };
            }
            return updated;
          });
          // Deduplicate items by route to prevent duplicate header navigation links
          const uniqueItems: NavItemData[] = [];
          const seenRoutes = new Set<string>();
          for (const item of normalized) {
            const routeKey = item.route.toLowerCase().replace(/\/$/, '') || '/';
            if (item.isVisible && !seenRoutes.has(routeKey)) {
              seenRoutes.add(routeKey);
              uniqueItems.push(item);
            }
          }

          // Ensure Ecosystem (/products) is present in Navbar items
          if (!seenRoutes.has('/products')) {
            uniqueItems.splice(1, 0, {
              id: 'nav-products',
              label: 'Ecosystem',
              route: '/products',
              order: 1,
              isVisible: true,
              isHighlight: false,
            });
          }

          // Ensure Services is present in Navbar items
          if (!seenRoutes.has('/services')) {
            uniqueItems.splice(3, 0, {
              id: 'nav-services',
              label: 'Services',
              route: '/services',
              order: 3,
              isVisible: true,
              isHighlight: false,
            });
          }

          setNavItems(
            uniqueItems.sort((a: NavItemData, b: NavItemData) => a.order - b.order)
          );
        }
      })
      .catch(() => {
        // fallback to static nav
      });
  }, []);

  const isNavItemActive = (item: NavItemData): boolean => {
    const cleanItemRoute = item.route.toLowerCase().split('?')[0].replace(/\/$/, '') || '/';
    const cleanCurrent = currentRoute.toLowerCase().split('?')[0].replace(/\/$/, '') || '/';
    if (cleanItemRoute === '/') return cleanCurrent === '/' && !activeSection;
    if (cleanItemRoute === '/marketplace') return cleanCurrent === '/marketplace';
    if (cleanItemRoute === '/products') return cleanCurrent === '/products';
    if (cleanItemRoute === '/services') return cleanCurrent === '/services';
    if (cleanItemRoute === '/careers') return cleanCurrent === '/careers';
    if (cleanItemRoute === '/pricing') return cleanCurrent === '/pricing';
    if (cleanItemRoute === '/about') return cleanCurrent === '/about';
    if (cleanItemRoute === '/contact-sales') return cleanCurrent === '/contact-sales';
    if (item.route.startsWith('#')) return activeSection === item.route.replace('#', '');
    return cleanCurrent === cleanItemRoute;
  };

  const handleNavClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (route.startsWith('#')) {
      const elementId = route.replace('#', '');
      if (currentRoute !== '/') {
        navigateTo('/', elementId);
      } else {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.location.hash = elementId;
        }
      }
      return;
    }

    navigateTo(route as AppRoute);
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
      }}
      className="fixed top-0 inset-x-0 z-[100] pt-[calc(0.625rem+env(safe-area-inset-top,0px))] pb-2.5 px-4 sm:px-6 lg:px-8 pointer-events-none"
    >
      <div className="max-w-[1440px] mx-auto bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl backdrop-saturate-180 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-slate-950/60 px-6 lg:px-10 py-3 flex items-center justify-between pointer-events-auto transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">

        {/* Left Brand Logo */}
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer border-none bg-transparent min-w-0"
        >
          <img 
            src={logoError ? '/dezoryn-brand-logo.png' : (siteSettings.logoUrl || '/dezoryn-brand-logo.png')} 
            alt={siteSettings.websiteName || 'Dezoryn Technologies'} 
            className="h-9 sm:h-11 w-auto max-w-[120px] sm:max-w-[150px] object-contain rounded-xl shrink-0" 
            onError={() => {
              if (!logoError) setLogoError(true);
            }}
          />
          <div className="flex flex-col text-left truncate">
            <span className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none truncate">
              {siteSettings.websiteName || 'Dezoryn Technologies'}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 sm:mt-1 uppercase truncate">
              Predictive Sales Platform
            </span>
          </div>
        </button>

        {/* Center Navigation Links — Dynamic from CMS */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px]">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item);
            return (
              <button
                type="button"
                key={item.id}
                onClick={(e) => handleNavClick(e, item.route)}
                className={`transition-all duration-200 py-1 font-medium relative cursor-pointer border-none bg-transparent ${
                  item.isHighlight
                    ? 'text-amber-500 dark:text-amber-400 font-black'
                    : isActive
                    ? 'text-blue-600 dark:text-cyan-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 dark:bg-cyan-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Button & Theme Toggle (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Sliding Pill Switch */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleTheme) onToggleTheme();
            }}
            aria-label="Toggle Theme Mode"
            className={`relative z-10 inline-flex items-center w-15 h-8 rounded-full p-1 transition-colors duration-200 cursor-pointer shadow-inner ${theme === 'dark'
                ? 'bg-slate-800 border border-slate-700 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-slate-200 border border-slate-300/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center transition-transform duration-200 ease-out transform-gpu ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                }`}
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
          </button>

          {/* Primary Book Demo CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo('/book-demo')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-cyan-500/35 transition-all duration-200 cursor-pointer border-none"
          >
            <span>Book Demo</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleTheme) onToggleTheme();
            }}
            aria-label="Toggle Mobile Theme"
            className={`relative z-10 inline-flex items-center w-13 h-7 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shadow-inner ${theme === 'dark'
                ? 'bg-slate-800 border border-slate-700 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'bg-slate-200 border border-slate-300/80 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center transition-transform duration-300 ease-out transform-gpu ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
            >
              {theme === 'dark' ? (
                <Moon className="w-3 h-3 text-sky-400" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden pointer-events-auto max-w-[1440px] mx-auto mt-2 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl backdrop-saturate-180 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-8 py-5 flex flex-col gap-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden"
          >
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={(e) => handleNavClick(e, item.route)}
                className={`py-2 text-base font-medium transition-colors text-left border-none bg-transparent ${
                  item.isHighlight
                    ? 'text-amber-500 dark:text-amber-400 font-black'
                    : isNavItemActive(item)
                    ? 'text-blue-600 dark:text-cyan-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  navigateTo('/book-demo');
                  setMobileMenuOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer border-none"
              >
                <span>Book Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});
