import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavigationContext, type AppRoute } from './utils/NavigationContext';
import { getRouteFromPath, navigateToRoute } from './utils/router';
import { useSiteSettings } from './hooks/useSiteSettings';
import { useScrollRestoration } from './hooks/useScrollRestoration';
import { cachedApiFetch } from './config/api.config';

import { AnnouncementBar } from './components/common/AnnouncementBar';
import { MaintenancePage } from './components/common/MaintenancePage';
import {
  Navbar,
  BackgroundParticles,
  HeroSection,
  MarketplacePage,
  ProductDetailPage,
  ProductsPage,
  BookDemoPage,
  ContactSalesPage,
  AboutUsPage,
  PricingPage,
  ServicesPage,
  ServicesSection,
  CareersPage,
  StatsBanner,
  AboutSection,
  MarketplaceSection,
  MiddleGridSection,
  TrustAndWhySection,
  BottomFeatureStrip,
  FinalCTABanner,
  FAQSection,
  Footer,
  DezoAIWidget,
  AdminLogin,
  AdminLayout,
  SupportPage
} from './components';
import { PlaceholderPage } from './components/common/PlaceholderPage';
import { NotFoundPage } from './components/common/NotFoundPage';


export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getRouteFromPath(window.location.pathname));
  const [activeSection, setActiveSection] = useState<string | undefined>(() => window.location.hash.replace('#', '') || undefined);
  const isPopStateRef = useRef(false);
  const [isPopState, setIsPopState] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const userPref = localStorage.getItem('user_theme_preference');
    if (userPref === 'light' || userPref === 'dark') return userPref;
    const local = localStorage.getItem('dezo-theme-settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.defaultMode) return parsed.defaultMode === 'dark' ? 'dark' : 'light';
      } catch {
        // ignore
      }
    }
    return 'light';
  });
  const [adminUserRole, setAdminUserRole] = useState<string>('ADMIN');

  // Fetch and apply website settings dynamically
  const { settings: siteSettings } = useSiteSettings();

  // Disable browser native scroll restoration so our custom logic controls it
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Listen to popstate (browser back/forward & pushState events)
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      setIsPopState(true);
      setCurrentRoute(getRouteFromPath(window.location.pathname));
      setActiveSection(window.location.hash.replace('#', '') || undefined);
      // Reset after the current event tick so forward navigations start clean
      setTimeout(() => {
        isPopStateRef.current = false;
        setIsPopState(false);
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll restoration: saves position before navigating away, restores on Back/Forward
  useScrollRestoration(currentRoute, isPopState);

  const navigateTo = useCallback((route: string, sectionId?: string) => {
    const targetRoute = getRouteFromPath(route);
    setCurrentRoute(targetRoute);
    setActiveSection(sectionId);
    navigateToRoute(route, sectionId);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('user_theme_preference', next);
      } catch (_e) {}
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // Fetch dynamic theme configuration & typography from API and listen to updates
  useEffect(() => {
    const applyThemeObj = (data: any) => {
      if (!data) return;
      const root = document.documentElement;

      let mode = data.activeMode || data.defaultMode || 'light';
      if (mode === 'system') {
        const isSysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        mode = isSysDark ? 'dark' : 'light';
      }

      const userPref = localStorage.getItem('user_theme_preference');
      if (userPref === 'light' || userPref === 'dark') {
        setTheme(userPref);
        mode = userPref;
      } else {
        setTheme(mode === 'dark' ? 'dark' : 'light');
      }

      const targetConfig = mode === 'light' ? data.lightTheme : data.darkTheme;
      const colors = (targetConfig && targetConfig.colorSettings) || data.colorSettings || {};
      const typo = (targetConfig && targetConfig.typographySettings) || data.typographySettings || {};

      if (colors.primary || data.primaryColor) root.style.setProperty('--primary-color', colors.primary || data.primaryColor);
      if (colors.secondary || data.secondaryColor) root.style.setProperty('--secondary-color', colors.secondary || data.secondaryColor);
      if (colors.accent || data.accentColor) root.style.setProperty('--accent-color', colors.accent || data.accentColor);
      if (colors.background) root.style.setProperty('--bg-color', colors.background);
      if (colors.surface) root.style.setProperty('--surface-color', colors.surface);
      if (colors.card) root.style.setProperty('--card-color', colors.card);
      if (colors.border) root.style.setProperty('--border-color', colors.border);
      if (colors.success) root.style.setProperty('--success-color', colors.success);
      if (colors.warning) root.style.setProperty('--warning-color', colors.warning);
      if (colors.error) root.style.setProperty('--error-color', colors.error);
      if (colors.info) root.style.setProperty('--info-color', colors.info);
      if (colors.textPrimary) root.style.setProperty('--text-primary-color', colors.textPrimary);
      if (colors.textSecondary) root.style.setProperty('--text-secondary-color', colors.textSecondary);
      if (colors.link) root.style.setProperty('--link-color', colors.link);

      if (data.fontFamily) root.style.setProperty('--font-family', `'${data.fontFamily}', sans-serif`);
      if (data.borderRadius) root.style.setProperty('--border-radius', data.borderRadius);

      if (typo) {
        if (typo.headingFont) root.style.setProperty('--font-heading', `'${typo.headingFont}', sans-serif`);
        if (typo.bodyFont) root.style.setProperty('--font-body', `'${typo.bodyFont}', sans-serif`);
        if (typo.buttonFont) root.style.setProperty('--font-button', `'${typo.buttonFont}', sans-serif`);
        if (typo.fontWeight) root.style.setProperty('--font-weight', typo.fontWeight);
        if (typo.letterSpacing) root.style.setProperty('--letter-spacing', typo.letterSpacing);
        if (typo.lineHeight) root.style.setProperty('--line-height', typo.lineHeight);
        if (typo.textTransform) root.style.setProperty('--text-transform', typo.textTransform);
        if (typo.fontScale) root.style.setProperty('--font-scale', typo.fontScale);

        if (typo.fontSizes) {
          if (typo.fontSizes.display) root.style.setProperty('--font-size-display', typo.fontSizes.display);
          if (typo.fontSizes.h1) root.style.setProperty('--font-size-h1', typo.fontSizes.h1);
          if (typo.fontSizes.h2) root.style.setProperty('--font-size-h2', typo.fontSizes.h2);
          if (typo.fontSizes.h3) root.style.setProperty('--font-size-h3', typo.fontSizes.h3);
          if (typo.fontSizes.h4) root.style.setProperty('--font-size-h4', typo.fontSizes.h4);
          if (typo.fontSizes.h5) root.style.setProperty('--font-size-h5', typo.fontSizes.h5);
          if (typo.fontSizes.h6) root.style.setProperty('--font-size-h6', typo.fontSizes.h6);
          if (typo.fontSizes.body) root.style.setProperty('--font-size-body', typo.fontSizes.body);
          if (typo.fontSizes.smallText) root.style.setProperty('--font-size-small', typo.fontSizes.smallText);
          if (typo.fontSizes.caption) root.style.setProperty('--font-size-caption', typo.fontSizes.caption);
          if (typo.fontSizes.buttons) root.style.setProperty('--font-size-button', typo.fontSizes.buttons);
        }
      }
    };

    const fetchThemeConfig = async () => {
      try {
        const res = await cachedApiFetch('/theme');
        const data = await res.json();
        if (data.success && data.data) {
          applyThemeObj(data.data);
        }
      } catch {
        const local = localStorage.getItem('dezo-theme-settings');
        if (local) {
          try {
            applyThemeObj(JSON.parse(local));
          } catch {
            // ignore
          }
        }
      }
    };

    fetchThemeConfig();

    const handleThemeUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        applyThemeObj(detail);
      } else {
        fetchThemeConfig();
      }
    };

    window.addEventListener('dezo-theme-updated', handleThemeUpdated);
    window.addEventListener('focus', fetchThemeConfig);
    return () => {
      window.removeEventListener('dezo-theme-updated', handleThemeUpdated);
      window.removeEventListener('focus', fetchThemeConfig);
    };
  }, []);


  // Page Transition Variants (Fade & Slide Up - 500ms)
  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 }
  };

  if (currentRoute === '/admin' || currentRoute === '/admin/login') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && currentRoute === '/admin') {
      return (
        <NavigationContext.Provider value={{ currentRoute, activeSection, navigateTo }}>
          <AdminLayout
            initialRole={adminUserRole}
            onLogout={() => navigateTo('/admin/login')}
          />
        </NavigationContext.Provider>
      );
    }
    return (
      <NavigationContext.Provider value={{ currentRoute, activeSection, navigateTo }}>
        <AdminLogin
          onLoginSuccess={(role) => {
            if (role) setAdminUserRole(role);
            navigateTo('/admin/dashboard');
          }}
        />
      </NavigationContext.Provider>
    );
  }

  if (currentRoute === '/admin/dashboard' || currentRoute === '/admin/services') {
    const targetTab = currentRoute === '/admin/services' ? 'services' : 'overview';
    return (
      <NavigationContext.Provider value={{ currentRoute, activeSection, navigateTo }}>
        <AdminLayout
          initialRole={adminUserRole}
          initialTab={targetTab}
          onLogout={() => navigateTo('/admin/login')}
        />
      </NavigationContext.Provider>
    );
  }

  return (
    <NavigationContext.Provider value={{ currentRoute, activeSection, navigateTo }}>
      {/* Maintenance Mode Overlay */}
      {siteSettings.maintenanceMode && <MaintenancePage />}

      {/* ── Global floating widget — outside ALL overflow/transform containers ── */}
      <DezoAIWidget />

      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-800'} relative selection:bg-cyan-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif] overflow-x-clip w-full transition-colors duration-300`}>


        {/* Ambient background particles & lighting */}
        <BackgroundParticles />

        {/* Announcement Bar (from CMS) */}
        {siteSettings.announcementBar && siteSettings.announcementText && (
          <AnnouncementBar
            text={siteSettings.announcementText}
            color={siteSettings.announcementColor}
          />
        )}

        {/* 1. Sticky Navbar */}
        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Page Router with Framer Motion AnimatePresence Transitions */}
        <AnimatePresence mode="wait" initial={false}>
          {currentRoute === '/marketplace' && (
            <motion.main
              key="marketplace-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <MarketplacePage />
            </motion.main>
          )}

          {currentRoute === '/product-detail' && (
            <motion.main
              key={`product-detail-${window.location.search}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductDetailPage productId={new URLSearchParams(window.location.search).get('id') || undefined} />
            </motion.main>
          )}

          {currentRoute === '/products' && (
            <motion.main
              key="products-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductsPage />
            </motion.main>
          )}

          {currentRoute === '/book-demo' && (
            <motion.main
              key="book-demo-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <BookDemoPage />
            </motion.main>
          )}

          {currentRoute === '/contact-sales' && (
            <motion.main
              key="contact-sales-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ContactSalesPage />
            </motion.main>
          )}

          {currentRoute === '/about' && (
            <motion.main
              key="about-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AboutUsPage />
            </motion.main>
          )}

          {currentRoute === '/pricing' && (
            <motion.main
              key="pricing-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <PricingPage />
            </motion.main>
          )}

          {currentRoute === '/services' && (
            <motion.main
              key="services-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServicesPage />
            </motion.main>
          )}

          {currentRoute === '/careers' && (
            <motion.main
              key="careers-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <CareersPage />
            </motion.main>
          )}

          {currentRoute === '/support' && (
            <motion.main
              key="support-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <SupportPage />
            </motion.main>
          )}

          {currentRoute === '/' && (
            <motion.main
              key="home-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              id="home"
            >
              {/* 2. Hero Section */}
              <HeroSection />

              {/* 3. Statistics Section */}
              <StatsBanner />

              {/* 4. About Section */}
              <AboutSection />

              {/* 5. Enterprise Marketplace & Products Ecosystem */}
              <MarketplaceSection />

              {/* 5b. Custom Technology Services Section */}
              <ServicesSection />

              {/* 6, 7, 8. Industries We Serve + Demo Center + Get Free Demo Form */}
              <MiddleGridSection />

              {/* 9, 10, 11. Why Choose Dezoryn Technologies + Client Success Stories + Our Trusted Clients */}
              <TrustAndWhySection />

              {/* 12. Bottom Feature Strip */}
              <BottomFeatureStrip />

              {/* 13. Dynamic FAQ Accordion Section */}
              <FAQSection />

              {/* 14. Final CTA Banner */}
              <FinalCTABanner />

            </motion.main>
          )}

          {/* ── Additional Footer Routes (Placeholder pages) ── */}
          {currentRoute === '/blog' && (
            <motion.main key="blog-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Dezoryn Engineering & AI Blog" description="Deep dives into predictive CRM engines, AI copilot architectures, and enterprise scalability." eta="Q3 2026" />
            </motion.main>
          )}

          {currentRoute === '/leadership' && (
            <motion.main key="leadership-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Executive Leadership Team" description="Meet the visionaries, engineers, and strategists building the next-generation ERP & AI platform." backRoute="/about" />
            </motion.main>
          )}

          {currentRoute === '/privacy' && (
            <motion.main key="privacy-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Privacy Policy" description="We are committed to protecting enterprise data with bank-grade encryption, GDPR compliance, and strict data governance." />
            </motion.main>
          )}

          {currentRoute === '/terms' && (
            <motion.main key="terms-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Terms & Conditions" description="Terms of service, SLA guarantees, and enterprise usage policies for Dezoryn Technologies platforms." />
            </motion.main>
          )}

          {currentRoute === '/cookies' && (
            <motion.main key="cookies-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Cookie Policy" description="Information about how Dezoryn Technologies uses essential, analytical, and performance cookies." />
            </motion.main>
          )}

          {currentRoute === '/help' && (
            <motion.main key="help-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Help & Support Center" description="Access user manuals, setup guides, video walkthroughs, and 24/7 technical support." />
            </motion.main>
          )}

          {currentRoute === '/faq' && (
            <motion.main key="faq-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Frequently Asked Questions" description="Find answers to common questions about deployment, pricing, integrations, and AI features." />
            </motion.main>
          )}

          {currentRoute === '/api-docs' && (
            <motion.main key="api-docs-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="API & Developer Documentation" description="Comprehensive REST & GraphQL API specs, SDK references, webhooks, and sandbox environments." eta="v2.4 Developer Portal" />
            </motion.main>
          )}

          {currentRoute === '/status' && (
            <motion.main key="status-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="System Status & Uptime" description="Real-time system status, planned maintenance schedules, and global API uptime monitor (99.99% SLA)." />
            </motion.main>
          )}

          {currentRoute === '/sitemap' && (
            <motion.main key="sitemap-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlaceholderPage title="Platform Sitemap" description="Complete directory of all products, solutions, resources, and company pages." />
            </motion.main>
          )}

          {/* Fallback 404 Page */}
          {![
            '/', '/marketplace', '/products', '/product-detail', '/services', '/book-demo', '/contact-sales', '/about', '/pricing', '/careers', '/support',
            '/blog', '/leadership', '/privacy', '/terms', '/cookies', '/help', '/faq', '/api-docs', '/status', '/sitemap'
          ].includes(currentRoute) && (
            <motion.main key="404-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <NotFoundPage />
            </motion.main>
          )}
        </AnimatePresence>

        {/* 14. Footer */}
        <Footer />
      </div>
    </NavigationContext.Provider>
  );
};

export default App;
