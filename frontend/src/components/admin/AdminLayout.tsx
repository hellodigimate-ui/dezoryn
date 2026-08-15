import React, { useState, useEffect } from 'react';
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
import { AdminAIAssistantModal } from './AdminAIAssistantModal';
import type { AIGenerateType } from './AdminAIAssistantModal';
import { useNavigation } from '../../utils/NavigationContext';

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
    const saved = localStorage.getItem('admin-theme');
    return saved !== null ? saved === 'dark' : true;
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
    const userPref = localStorage.getItem('user_theme_preference');
    const effectiveDark = userPref ? userPref === 'dark' : isDark;
    if (effectiveDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleThemeUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.defaultMode) {
        setIsDark(detail.defaultMode === 'dark');
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
      case 'about':
        return <AdminAboutCMS />;
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
      case 'inquiries':
      case 'leads':
        return <AdminInquiryManager />;
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

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      localStorage.setItem('admin-theme', nextDark ? 'dark' : 'light');
      localStorage.setItem('user_theme_preference', nextDark ? 'dark' : 'light');
    } catch (_e) {}
  };

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
      />

      {/* Main Container Area - Dynamically adjusts according to sidebar state */}
      <div className={`pl-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarHovered ? 'lg:pl-64' : 'lg:pl-20'
        }`}>
        {/* Top Navbar */}
        <AdminNavbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
      </div>

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
