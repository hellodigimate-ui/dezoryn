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

const DEFAULT_HOMEPAGE_SERVICES: ServiceCategory[] = [
  {
    id: 'software-dev',
    title: 'Software Development',
    badge: 'ENTERPRISE',
    description: 'Custom enterprise software solutions tailored to automate complex workflows and scale operations.',
    iconName: 'Code2',
    services: ['Custom ERP & CRM', 'SaaS Engineering', 'Cloud DevOps'],
    ctaText: 'Explore Software'
  },
  {
    id: 'web-dev',
    title: 'Website Development',
    badge: 'WEB PLATFORMS',
    description: 'Modern, high-performance websites and web applications built with intuitive UI/UX and bank-grade security.',
    iconName: 'Globe',
    services: ['Corporate Portals', 'E-Commerce Portals', 'Progressive Web Apps'],
    ctaText: 'Explore Web'
  },
  {
    id: 'mobile-dev',
    title: 'Mobile App Development',
    badge: 'IOS & ANDROID',
    description: 'Native and cross-platform mobile apps for iOS and Android delivering engaging user experiences.',
    iconName: 'Smartphone',
    services: ['iOS App Development', 'Android App Dev', 'React Native & Flutter'],
    ctaText: 'Explore Mobile'
  },
  {
    id: 'business-mgmt',
    title: 'Business Management',
    badge: 'AUTOMATION',
    description: 'Integrated business automation platforms covering HRMS, payroll, inventory, and operational control.',
    iconName: 'Briefcase',
    services: ['HRMS & Payroll', 'Inventory Pro', 'Financial Accounting'],
    ctaText: 'Explore Business'
  }
];

const renderIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Globe':
      return <Globe className="w-6 h-6 text-cyan-500" />;
    case 'Smartphone':
      return <Smartphone className="w-6 h-6 text-indigo-500" />;
    case 'Briefcase':
      return <Briefcase className="w-6 h-6 text-purple-500" />;
    case 'Factory':
      return <Factory className="w-6 h-6 text-emerald-500" />;
    case 'Layers':
      return <Layers className="w-6 h-6 text-amber-500" />;
    case 'Megaphone':
      return <Megaphone className="w-6 h-6 text-rose-500" />;
    case 'TrendingUp':
      return <TrendingUp className="w-6 h-6 text-teal-500" />;
    case 'Cpu':
      return <Cpu className="w-6 h-6 text-blue-500" />;
    case 'Server':
      return <Server className="w-6 h-6 text-indigo-500" />;
    case 'Shield':
      return <Shield className="w-6 h-6 text-emerald-500" />;
    case 'Zap':
      return <Zap className="w-6 h-6 text-amber-500" />;
    case 'Database':
      return <Database className="w-6 h-6 text-cyan-500" />;
    case 'Sparkles':
      return <Sparkles className="w-6 h-6 text-purple-500" />;
    case 'Box':
      return <Box className="w-6 h-6 text-slate-500" />;
    case 'Award':
      return <Award className="w-6 h-6 text-amber-500" />;
    case 'Terminal':
      return <Terminal className="w-6 h-6 text-emerald-500" />;
    case 'Cloud':
      return <Cloud className="w-6 h-6 text-sky-500" />;
    case 'Lock':
      return <Lock className="w-6 h-6 text-rose-500" />;
    case 'Code2':
    default:
      return <Code2 className="w-6 h-6 text-blue-500 dark:text-cyan-400" />;
  }
};

export const ServicesSection: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [services, setServices] = useState<ServiceCategory[]>(DEFAULT_HOMEPAGE_SERVICES);

  useEffect(() => {
    const fetchHomepageServices = async () => {
      let rawData: any[] = [];

      try {
        const res = await apiFetch('/services?enabled=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          rawData = data.data;
        }
      } catch (_e) {}

      const stored = localStorage.getItem('dezo_services_cms');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawData = parsed.filter((item: any) => item.isEnabled ?? item.status === 'active');
          }
        } catch (_err) {}
      }

      if (rawData.length > 0) {
        const mapped: ServiceCategory[] = rawData.slice(0, 4).map((item: any, idx: number) => ({
          id: item.id || `srv-${idx}`,
          title: item.title,
          badge: item.badge || 'ENTERPRISE',
          description: item.description,
          iconName: item.icon || 'Code2',
          services: Array.isArray(item.services) && item.services.length > 0 ? item.services.slice(0, 3) : ['Custom Solution'],
          ctaText: item.ctaText || 'Explore Services'
        }));
        setServices(mapped);
      }
    };

    fetchHomepageServices();
    window.addEventListener('dezo_services_updated', fetchHomepageServices);
    return () => {
      window.removeEventListener('dezo_services_updated', fetchHomepageServices);
    };
  }, []);

  return (
    <section id="services-section" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 blur-[140px] pointer-events-none -z-10" />

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
            className="self-start md:self-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 border border-blue-600 dark:border-cyan-400/40 text-white dark:text-cyan-300 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              whileHover={{ y: -5 }}
              className="group bg-slate-50/90 dark:bg-slate-900/80 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-cyan-400/50 transition-all duration-300 ease-out text-left shadow-xs hover:shadow-[0_14px_36px_-10px_rgba(37,99,235,0.16)] dark:hover:shadow-[0_14px_36px_-10px_rgba(34,211,238,0.12)] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:bg-blue-50/80 dark:group-hover:bg-cyan-500/20 group-hover:border-blue-300 dark:group-hover:border-cyan-400/50 group-hover:-translate-y-0.5 group-hover:scale-[1.05] transition-all duration-300 ease-out">
                    {renderIcon(item.iconName)}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100/80 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 border border-blue-200/50 dark:border-slate-700">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors duration-300 ease-out">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">{item.description}</p>

                <div className="space-y-2 mb-6 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  {item.services.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigateTo('/services', item.id)}
                className="w-full py-2.5 px-3 rounded-xl border border-blue-600/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 group-hover:bg-white group-hover:border-blue-600 dark:group-hover:bg-slate-800 dark:group-hover:border-cyan-400 hover:!bg-blue-600 hover:!border-blue-600 dark:hover:!bg-cyan-500 text-slate-900 dark:text-slate-100 hover:!text-white dark:hover:!text-slate-950 font-extrabold text-xs transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-1.5 group/btn shadow-xs hover:shadow-md hover:shadow-blue-500/25"
              >
                <span className="font-extrabold transition-colors duration-300">{item.ctaText || 'Learn More'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 group-hover/btn:!text-white dark:group-hover/btn:!text-slate-950 group-hover:translate-x-0.75 group-hover/btn:translate-x-1 transition-all duration-300 ease-out" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
