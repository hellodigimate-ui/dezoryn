import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Globe,
  Smartphone,
  Briefcase,
  Factory,
  Layers,
  Megaphone,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Server,
  Shield,
  Zap,
  Database,
  Box,
  Award,
  Terminal,
  Cloud,
  Lock
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';
import type { ServiceCategory } from './ServicesPage';



interface CardTheme {
  topGradient: string;
  ambientGradient: string;
  borderHover: string;
  iconBg: string;
  iconGlow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotBg: string;
  checkBg: string;
  checkBorder: string;
  checkIcon: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
  btnHoverShadow: string;
}

const CARD_THEMES: CardTheme[] = [
  // 0: Software Dev (Blue / Cyan)
  {
    topGradient: 'from-blue-500 via-cyan-400 to-indigo-500',
    ambientGradient: 'from-blue-600/15 via-cyan-500/10 to-transparent',
    borderHover: 'group-hover:border-cyan-400/80 dark:group-hover:border-cyan-400/80',
    iconBg: 'bg-gradient-to-br from-blue-600 to-cyan-500',
    iconGlow: 'shadow-[0_0_25px_rgba(56,189,248,0.35)]',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-950/60',
    badgeText: 'text-blue-600 dark:text-cyan-400',
    badgeBorder: 'border-blue-500/30 dark:border-cyan-400/30',
    dotBg: 'bg-cyan-400',
    checkBg: 'bg-blue-500/10 dark:bg-cyan-500/15',
    checkBorder: 'border-blue-500/20 dark:border-cyan-500/30',
    checkIcon: 'text-blue-600 dark:text-cyan-400',
    btnBg: 'bg-blue-50/80 dark:bg-slate-900/90 hover:bg-blue-600 dark:hover:bg-cyan-500',
    btnBorder: 'border-blue-600/40 dark:border-cyan-500/40 hover:border-blue-600 dark:hover:border-cyan-400',
    btnText: 'text-blue-600 dark:text-cyan-400 hover:text-white dark:hover:text-slate-950',
    btnHoverShadow: 'hover:shadow-[0_0_24px_rgba(56,189,248,0.35)]',
  },
  // 1: Website Dev (Cyan / Sky)
  {
    topGradient: 'from-cyan-500 via-sky-400 to-blue-500',
    ambientGradient: 'from-cyan-600/15 via-sky-500/10 to-transparent',
    borderHover: 'group-hover:border-sky-400/80 dark:group-hover:border-sky-400/80',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
    iconGlow: 'shadow-[0_0_25px_rgba(14,165,233,0.35)]',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-600 dark:text-sky-400',
    badgeBorder: 'border-cyan-500/30 dark:border-sky-400/30',
    dotBg: 'bg-sky-400',
    checkBg: 'bg-cyan-500/10 dark:bg-sky-500/15',
    checkBorder: 'border-cyan-500/20 dark:border-sky-500/30',
    checkIcon: 'text-cyan-600 dark:text-sky-400',
    btnBg: 'bg-cyan-50/80 dark:bg-slate-900/90 hover:bg-sky-600 dark:hover:bg-sky-400',
    btnBorder: 'border-cyan-600/40 dark:border-sky-500/40 hover:border-sky-600 dark:hover:border-sky-400',
    btnText: 'text-cyan-600 dark:text-sky-400 hover:text-white dark:hover:text-slate-950',
    btnHoverShadow: 'hover:shadow-[0_0_24px_rgba(14,165,233,0.35)]',
  },
  // 2: Mobile App Dev (Violet / Purple)
  {
    topGradient: 'from-violet-500 via-purple-400 to-fuchsia-500',
    ambientGradient: 'from-violet-600/15 via-purple-500/10 to-transparent',
    borderHover: 'group-hover:border-violet-400/80 dark:group-hover:border-violet-400/80',
    iconBg: 'bg-gradient-to-br from-violet-600 to-fuchsia-500',
    iconGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.35)]',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-950/60',
    badgeText: 'text-purple-600 dark:text-violet-300',
    badgeBorder: 'border-purple-500/30 dark:border-violet-400/30',
    dotBg: 'bg-purple-400',
    checkBg: 'bg-purple-500/10 dark:bg-violet-500/15',
    checkBorder: 'border-purple-500/20 dark:border-violet-500/30',
    checkIcon: 'text-purple-600 dark:text-violet-400',
    btnBg: 'bg-purple-50/80 dark:bg-slate-900/90 hover:bg-purple-600 dark:hover:bg-violet-500',
    btnBorder: 'border-purple-600/40 dark:border-violet-500/40 hover:border-purple-600 dark:hover:border-violet-400',
    btnText: 'text-purple-600 dark:text-violet-300 hover:text-white dark:hover:text-slate-950',
    btnHoverShadow: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]',
  },
  // 3: Business Management (Emerald / Teal)
  {
    topGradient: 'from-emerald-500 via-teal-400 to-cyan-500',
    ambientGradient: 'from-emerald-600/15 via-teal-500/10 to-transparent',
    borderHover: 'group-hover:border-emerald-400/80 dark:group-hover:border-emerald-400/80',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-500',
    iconGlow: 'shadow-[0_0_25px_rgba(52,211,153,0.35)]',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-600 dark:text-emerald-300',
    badgeBorder: 'border-emerald-500/30 dark:border-emerald-400/30',
    dotBg: 'bg-emerald-400',
    checkBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    checkBorder: 'border-emerald-500/20 dark:border-emerald-500/30',
    checkIcon: 'text-emerald-600 dark:text-emerald-400',
    btnBg: 'bg-emerald-50/80 dark:bg-slate-900/90 hover:bg-emerald-600 dark:hover:bg-emerald-400',
    btnBorder: 'border-emerald-600/40 dark:border-emerald-500/40 hover:border-emerald-600 dark:hover:border-emerald-400',
    btnText: 'text-emerald-600 dark:text-emerald-300 hover:text-white dark:hover:text-slate-950',
    btnHoverShadow: 'hover:shadow-[0_0_24px_rgba(52,211,153,0.35)]',
  },
];

const renderWhiteIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Globe':
      return <Globe className="w-6 h-6 text-white" />;
    case 'Smartphone':
      return <Smartphone className="w-6 h-6 text-white" />;
    case 'Briefcase':
      return <Briefcase className="w-6 h-6 text-white" />;
    case 'Factory':
      return <Factory className="w-6 h-6 text-white" />;
    case 'Layers':
      return <Layers className="w-6 h-6 text-white" />;
    case 'Megaphone':
      return <Megaphone className="w-6 h-6 text-white" />;
    case 'TrendingUp':
      return <TrendingUp className="w-6 h-6 text-white" />;
    case 'Cpu':
      return <Cpu className="w-6 h-6 text-white" />;
    case 'Server':
      return <Server className="w-6 h-6 text-white" />;
    case 'Shield':
      return <Shield className="w-6 h-6 text-white" />;
    case 'Zap':
      return <Zap className="w-6 h-6 text-white" />;
    case 'Database':
      return <Database className="w-6 h-6 text-white" />;
    case 'Sparkles':
      return <Sparkles className="w-6 h-6 text-white" />;
    case 'Box':
      return <Box className="w-6 h-6 text-white" />;
    case 'Award':
      return <Award className="w-6 h-6 text-white" />;
    case 'Terminal':
      return <Terminal className="w-6 h-6 text-white" />;
    case 'Cloud':
      return <Cloud className="w-6 h-6 text-white" />;
    case 'Lock':
      return <Lock className="w-6 h-6 text-white" />;
    case 'Code2':
    default:
      return <Code2 className="w-6 h-6 text-white" />;
  }
};

export const ServicesSection: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHomepageServices = async () => {
      try {
        const res = await apiFetch('/services?enabled=true', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped: ServiceCategory[] = data.data.slice(0, 4).map((item: any, idx: number) => ({
            id: item.id || `srv-${idx}`,
            title: item.title,
            badge: item.badge || 'ENTERPRISE',
            description: item.description || '',
            iconName: item.icon || 'Code2',
            services: Array.isArray(item.services) && item.services.length > 0 ? item.services.slice(0, 4) : [],
            ctaText: item.ctaText || 'Explore Services'
          }));
          setServices(mapped);
          try {
            localStorage.removeItem('dezo_services_cms');
          } catch (_e) {}
        }
      } catch (_e) {
        // network notice
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageServices();
    window.addEventListener('dezo_services_updated', fetchHomepageServices);
    window.addEventListener('focus', fetchHomepageServices);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchHomepageServices();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('dezo_services_updated', fetchHomepageServices);
      window.removeEventListener('focus', fetchHomepageServices);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <section id="services-section" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Background Accent Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-500/10 via-cyan-500/10 to-purple-500/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              TECHNOLOGY SOLUTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Technology Solutions for Every Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              From a simple business website to a complete enterprise management system, we build customized technology solutions according to your business requirements.
            </p>
          </div>

          <button
            onClick={() => navigateTo('/services')}
            className="self-start md:self-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 border border-blue-600 dark:border-cyan-400/40 text-white dark:text-cyan-300 font-extrabold text-xs shadow-md hover:shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2 shrink-0 group/btn"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* 4 Cards Grid with Futuristic 3D Glass Panel Styling */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="w-20 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="w-full h-3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-5/6 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="w-full h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-700 dark:text-slate-300">No Services Available</h3>
            <p className="text-xs text-slate-500 mt-1">Services configured in the Admin Panel will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((item, idx) => {
              const theme = CARD_THEMES[idx % CARD_THEMES.length];

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.08,
                  type: 'spring',
                  stiffness: 160,
                  damping: 22,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="transform-gpu h-full"
              >
                <div
                  className={`group relative h-full bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-2xl backdrop-blur-2xl transition-all duration-300 text-left overflow-hidden transform-gpu ${theme.borderHover}`}
                >
                  {/* Glowing Top Edge Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${theme.topGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10`} />

                  {/* Ambient Interactive Background Mesh */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${theme.ambientGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10`} />

                  {/* Diagonal Glass Reflection Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 dark:via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

                  <div>
                    {/* Top Bar: Icon + Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconGlow} flex items-center justify-center text-white border border-white/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0`}>
                        {renderWhiteIcon(item.iconName)}
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} backdrop-blur-md flex items-center gap-1.5`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dotBg} animate-pulse`} />
                        {item.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 font-['Plus_Jakarta_Sans'] group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors duration-200">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-5 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Feature List */}
                    <ul className="space-y-2.5 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      {item.services.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-transform duration-200 group-hover:translate-x-1.5"
                          style={{ transitionDelay: `${i * 30}ms` }}
                        >
                          <span className={`w-4 h-4 rounded-full ${theme.checkBg} border ${theme.checkBorder} flex items-center justify-center shrink-0`}>
                            <CheckCircle2 className={`w-3 h-3 ${theme.checkIcon}`} />
                          </span>
                          <span className="truncate">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => navigateTo('/services', item.id)}
                    className={`w-full py-3 px-4 rounded-2xl border ${theme.btnBorder} ${theme.btnBg} ${theme.btnText} font-extrabold text-xs transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group/btn ${theme.btnHoverShadow}`}
                  >
                    <span className="font-extrabold">{item.ctaText || 'Explore Services'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
};

export default ServicesSection;
