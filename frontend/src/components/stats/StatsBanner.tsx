import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Building2,
  Layers,
  Headphones,
  ShieldCheck,
  Activity,
  TrendingUp,
  Sparkles,
  Bot,
  Zap,
  Globe,
  Award,
  Clock,
  Lock,
  BarChart3
} from 'lucide-react';
import { openDezoAI } from '../ai/DezoAIWidget';
import { useNavigation } from '../../utils/NavigationContext';
import { cachedApiFetch } from '../../config/api.config';

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar,
  Users,
  Building2,
  Building: Building2,
  Layers,
  Headphones,
  ShieldCheck,
  Activity,
  TrendingUp,
  Sparkles,
  Bot,
  Zap,
  Globe,
  Award,
  Clock,
  Lock,
  BarChart3,
};

const DEFAULT_STATS_BANNER_DATA = {
  statsEnabled: true,
  aiAssistantEnabled: true,
  aiAssistantTitle: 'AI Assistant',
  aiAssistantGreeting: 'Hello! How can I help you today?',
  aiAssistantButtonLabel: 'Chat Now',
  aiAssistantButtonLink: '/chat',
  stats: [
    { id: 'stat-1', label: 'Year Established', value: '2023', icon: 'Calendar', displayOrder: 0, enabled: true, route: '/about' },
    { id: 'stat-2', label: 'Happy Users', value: '10,000+', icon: 'Users', displayOrder: 1, enabled: true, route: '/about' },
    { id: 'stat-3', label: 'Clients', value: '100+', icon: 'Building2', displayOrder: 2, enabled: true, route: '/about' },
    { id: 'stat-4', label: 'Products', value: '15+', icon: 'Layers', displayOrder: 3, enabled: true, route: '/marketplace' },
    { id: 'stat-5', label: 'Support', value: '24/7', icon: 'Headphones', displayOrder: 4, enabled: true, route: '/contact-sales' },
    { id: 'stat-6', label: 'Uptime', value: '99.9%', icon: 'ShieldCheck', displayOrder: 5, enabled: true, route: '/about' },
  ],
};

export const StatsBanner: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const [data, setData] = useState(DEFAULT_STATS_BANNER_DATA);

  useEffect(() => {
    cachedApiFetch('/homepage-stats')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData({
            statsEnabled: resData.data.statsEnabled ?? DEFAULT_STATS_BANNER_DATA.statsEnabled,
            aiAssistantEnabled: resData.data.aiAssistantEnabled ?? DEFAULT_STATS_BANNER_DATA.aiAssistantEnabled,
            aiAssistantTitle: resData.data.aiAssistantTitle || DEFAULT_STATS_BANNER_DATA.aiAssistantTitle,
            aiAssistantGreeting: resData.data.aiAssistantGreeting || DEFAULT_STATS_BANNER_DATA.aiAssistantGreeting,
            aiAssistantButtonLabel: resData.data.aiAssistantButtonLabel || DEFAULT_STATS_BANNER_DATA.aiAssistantButtonLabel,
            aiAssistantButtonLink: resData.data.aiAssistantButtonLink || DEFAULT_STATS_BANNER_DATA.aiAssistantButtonLink,
            stats: Array.isArray(resData.data.stats) && resData.data.stats.length > 0 ? resData.data.stats : DEFAULT_STATS_BANNER_DATA.stats,
          });
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_STATS_BANNER_DATA
      });
  }, []);

  if (!data.statsEnabled && !data.aiAssistantEnabled) {
    return null;
  }

  const activeStats = (data.stats || [])
    .filter((s: any) => s.enabled)
    .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const handleAssistantClick = () => {
    if (data.aiAssistantButtonLink && data.aiAssistantButtonLink.startsWith('/')) {
      navigateTo(data.aiAssistantButtonLink as any);
    } else if (data.aiAssistantButtonLink && data.aiAssistantButtonLink.startsWith('http')) {
      window.open(data.aiAssistantButtonLink, '_blank');
    } else {
      openDezoAI();
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 mt-10 mb-24">
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transform-gpu border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 lg:p-8 shadow-xl shadow-blue-900/10 dark:shadow-slate-950/70 flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8 transition-colors duration-300 overflow-hidden"
      >
        {/* Stats items grid */}
        {data.statsEnabled && activeStats.length > 0 && (
          <div className={`grid gap-4 sm:gap-6 flex-1 w-full min-w-0 ${
            activeStats.length <= 2 ? 'grid-cols-2' :
            activeStats.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
            'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6'
          }`}>
            {activeStats.map((stat: any, idx: number) => {
              const IconComp = ICON_MAP[stat.icon] || BarChart3;
              return (
                <div
                  key={stat.id || idx}
                  onClick={() => navigateTo((stat.route || '/about') as any)}
                  className="flex items-center gap-3 sm:gap-3.5 min-w-0 cursor-pointer group hover:scale-105 transition-transform"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50/90 dark:bg-slate-800/90 border border-blue-100/90 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-xs group-hover:border-blue-500/50 transition-colors">
                    <IconComp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight font-['Plus_Jakarta_Sans'] truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {stat.value}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Far Right: AI Assistant Badge */}
        {data.aiAssistantEnabled && (
          <div className="xl:pl-8 border-t xl:border-t-0 xl:border-l border-slate-200/80 dark:border-slate-800 flex items-center gap-4 sm:gap-6 w-full xl:w-auto justify-between xl:justify-start pt-6 xl:pt-0 shrink-0">
            <div 
              onClick={handleAssistantClick} 
              className="flex items-center gap-3 sm:gap-4 min-w-0 cursor-pointer group"
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 relative shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] flex items-center gap-1.5 truncate group-hover:text-blue-500 transition-colors">
                  {data.aiAssistantTitle}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  {data.aiAssistantGreeting}
                </span>
              </div>
            </div>

            <button 
              onClick={handleAssistantClick}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {data.aiAssistantButtonLabel}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
});



