import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminHeroCMS } from './AdminHeroCMS';
import { AdminNavCMS } from './AdminNavCMS';
import { AdminMarketplaceManager } from './AdminMarketplaceManager';
import { AdminPricingManager } from './AdminPricingManager';
import { AdminTestimonialManager } from './AdminTestimonialManager';
import { AdminFAQManager } from './AdminFAQManager';
import { AdminJobManager } from './AdminJobManager';
import { AdminContactManager } from './AdminContactManager';
import { AdminInquiryManager } from './AdminInquiryManager';
import { AdminFooterManager } from './AdminFooterManager';
import { AdminMediaLibrary } from './AdminMediaLibrary';
import { AdminDemoManager } from './AdminDemoManager';
import { AdminServicesManager } from './AdminServicesManager';
import { AdminThemeManager } from './AdminThemeManager';
import { AdminWebsiteSettings } from './AdminWebsiteSettings';
import { AdminAboutCMS } from './AdminAboutCMS';
import { AdminHomepageStatsCMS } from './AdminHomepageStatsCMS';
import { AdminSupportManager } from './AdminSupportManager';
import { AdminAIAssistantModal } from './AdminAIAssistantModal';
import type { AIGenerateType } from './AdminAIAssistantModal';
import { useNavigation } from '../../utils/NavigationContext';
import { applyGlobalTheme } from '../../utils/themeUtils';

export interface openAIModalDetail {
  type?: AIGenerateType;
  topic?: string;
  onInsert?: (fieldType: string, value: any) => void;
}

export const openAdminAIAssistant = (detail?: openAIModalDetail) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-admin-ai-assistant', { detail }));
  }
};

interface AdminLayoutProps {
  initialRole?: string;
  initialTab?: string;
  onLogout?: () => void;
}

const getInitialAdminTab = (defaultTab: string): string => {
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const queryTab = searchParams.get('tab');
    if (queryTab) return queryTab;

    if (window.location.pathname === '/admin/services') {
      return 'services';
    }

    const saved = localStorage.getItem('dezo_admin_active_tab');
    if (saved) return saved;
  }
  return defaultTab;
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  initialRole = 'ADMIN',
  initialTab = 'overview',
  onLogout,
}) => {
  const [activeTab, setActiveTabState] = useState<string>(() => getInitialAdminTab(initialTab));

  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId);
    try {
      localStorage.setItem('dezo_admin_active_tab', tabId);
    } catch (_e) { }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const userPref = typeof window !== 'undefined' ? localStorage.getItem('user_theme_preference') : null;
    if (userPref === 'light' || userPref === 'dark') return userPref === 'dark';
    const saved = typeof window !== 'undefined' ? localStorage.getItem('admin-theme') : null;
    if (saved !== null) return saved === 'dark';
    return false;
  });
  const [role, setRole] = useState(initialRole);
  const { navigateTo } = useNavigation();

  // AI Assistant Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState<AIGenerateType>('hero');
  const [aiModalTopic, setAiModalTopic] = useState('');
  const [aiInsertCallback, setAiInsertCallback] = useState<((fieldType: string, value: any) => void) | null>(null);

  useEffect(() => {
    if (initialTab && initialTab !== 'overview') {
      setActiveTabState(initialTab);
      try {
        localStorage.setItem('dezo_admin_active_tab', initialTab);
      } catch (_e) { }
    }
  }, [initialTab]);

  useEffect(() => {
    const handleOpenAI = (e: Event) => {
      const customEv = e as CustomEvent<openAIModalDetail>;
      if (customEv.detail?.type) setAiModalType(customEv.detail.type);
      if (customEv.detail?.topic) setAiModalTopic(customEv.detail.topic);
      if (customEv.detail?.onInsert) setAiInsertCallback(() => customEv.detail.onInsert);
      setIsAIModalOpen(true);
    };

    window.addEventListener('open-admin-ai-assistant', handleOpenAI);
    return () => window.removeEventListener('open-admin-ai-assistant', handleOpenAI);
  }, []);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    const handleThemeUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        const mode = detail.effectiveMode || (detail.defaultMode ? (detail.defaultMode === 'dark' ? 'dark' : 'light') : null);
        if (mode) {
          setIsDark(mode === 'dark');
        }
      } else {
        const userPref = localStorage.getItem('user_theme_preference');
        if (userPref) {
          setIsDark(userPref === 'dark');
        }
      }
    };
    window.addEventListener('dezo-theme-updated', handleThemeUpdated);
    return () => window.removeEventListener('dezo-theme-updated', handleThemeUpdated);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigateTo('/admin/login');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview setActiveTab={setActiveTab} userRole={role} />;
      case 'pages':
        return <AdminHeroCMS />;
      case 'homepage-stats':
        return <AdminHomepageStatsCMS />;
      case 'about':
      case 'about-page':
      case 'about-us':
        return <AdminAboutCMS />;
      case 'timeline':
      case 'milestones':
        return <AdminAboutCMS initialTab="milestones" />;
      case 'navigation':
        return <AdminNavCMS />;
      case 'products':
        return <AdminMarketplaceManager />;
      case 'pricing':
        return <AdminPricingManager />;
      case 'testimonials':
        return <AdminTestimonialManager />;
      case 'faqs':
        return <AdminFAQManager />;
      case 'jobs':
        return <AdminJobManager />;
      case 'contact':
        return <AdminContactManager />;
      case 'offices':
        return <AdminContactManager initialTab="offices" />;
      case 'inquiries':
      case 'leads':
        return <AdminInquiryManager />;
      case 'support':
      case 'support-requests':
      case 'tickets':
        return <AdminSupportManager />;
      case 'footer':
        return <AdminFooterManager />;
      case 'demos':
        return <AdminDemoManager />;
      case 'services':
        return <AdminServicesManager />;
      case 'media':
        return <AdminMediaLibrary />;
      case 'site-settings':
        return <AdminWebsiteSettings />;
      case 'settings':
        return <AdminThemeManager />;
      default:
        return <AdminOverview setActiveTab={setActiveTab} userRole={role} />;
    }
  };

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dezo_admin_sidebar_collapsed');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dezo_admin_sidebar_collapsed', String(next));
      } catch (_e) {}
      return next;
    });
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(prev => !prev);
    } else {
      handleToggleCollapse();
    }
  };

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const targetMode = nextDark ? 'dark' : 'light';
    let cachedThemeData = null;
    try {
      const local = localStorage.getItem('dezo-theme-settings');
      if (local) cachedThemeData = JSON.parse(local);
    } catch (_e) {}
    applyGlobalTheme(targetMode, cachedThemeData, true);
  };

  // Calculate synchronized padding width
  const isExpandedDesktop = isDesktop && (!isSidebarCollapsed || isSidebarHovered);
  const sidebarPadding = isDesktop ? (isExpandedDesktop ? 256 : 80) : 0;

  return (
    <div className={`admin-scope min-h-screen font-['Plus_Jakarta_Sans',sans-serif] ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f5f7fb] text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={role}
        onLogout={handleLogout}
        isDark={isDark}
        onHoverChange={setIsSidebarHovered}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Container Area - Synchronized in real-time with sidebar movement */}
      <motion.div
        initial={false}
        animate={{ paddingLeft: sidebarPadding }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 32,
          mass: 0.85
        }}
        className="flex flex-col min-h-screen w-full"
      >
        {/* Top Navbar */}
        <AdminNavbar
          onToggleSidebar={handleToggleSidebar}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          activeTab={activeTab}
          userRole={role}
          onLogout={handleLogout}
          onOpenAI={() => setIsAIModalOpen(true)}
          onNavigate={(tabId) => setActiveTab(tabId)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto">
          {renderContent()}
        </main>
      </motion.div>

      {/* AI Content Assistant Modal */}
      <AdminAIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialType={aiModalType}
        initialTopic={aiModalTopic}
        onInsertField={(fieldType, value) => {
          if (aiInsertCallback) {
            aiInsertCallback(fieldType, value);
          }
        }}
      />
    </div>
  );
};
