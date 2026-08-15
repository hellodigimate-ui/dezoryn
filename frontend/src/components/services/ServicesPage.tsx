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
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Headphones,
  Cpu,
  Server,
  Shield,
  Database,
  Box,
  Award,
  Terminal,
  Cloud,
  Lock as LockIcon
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';

export interface ServiceCategory {
  id: string;
  title: string;
  category?: string;
  badge?: string;
  description: string;
  iconName?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
  glowColor?: string;
  services: string[];
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  status?: string;
  isEnabled?: boolean;
}

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'software-development',
    title: 'Software Development',
    category: 'Software Development',
    badge: 'ENTERPRISE ARCHITECTURE',
    description: 'Custom enterprise software solutions tailored to automate complex workflows, enhance operational efficiency, and scale seamlessly with your business growth.',
    iconName: 'Code2',
    bgColor: 'bg-blue-50 dark:bg-cyan-500/10',
    borderColor: 'border-blue-200 dark:border-cyan-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(56,189,248,0.3)]',
    services: [
      'Custom Software Development',
      'CRM Development',
      'ERP Development',
      'Business Management Software',
      'SaaS Development',
      'Software Customization'
    ],
    ctaText: 'Explore Software Services',
    ctaLink: '/contact-sales'
  },
  {
    id: 'website-development',
    title: 'Website Development',
    category: 'Website Development',
    badge: 'WEB PLATFORMS',
    description: 'Modern, high-performance websites and web applications built with intuitive UI/UX, ultra-fast loading speeds, and bank-grade security protocols.',
    iconName: 'Globe',
    bgColor: 'bg-cyan-50 dark:bg-cyan-400/10',
    borderColor: 'border-cyan-200 dark:border-cyan-400/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(34,211,238,0.3)]',
    services: [
      'Business Website',
      'Corporate Website',
      'E-commerce Website',
      'Custom Web Application',
      'Landing Page',
      'Portal Development'
    ],
    ctaText: 'Explore Web Services',
    ctaLink: '/contact-sales'
  },
  {
    id: 'mobile-app-development',
    title: 'Mobile App Development',
    category: 'Mobile App Development',
    badge: 'IOS & ANDROID',
    description: 'Native and cross-platform mobile apps for iOS and Android delivering engaging user experiences, offline capabilities, and real-time data sync.',
    iconName: 'Smartphone',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    borderColor: 'border-indigo-200 dark:border-indigo-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(99,102,241,0.3)]',
    services: [
      'Android App',
      'iOS App',
      'Cross-Platform App',
      'Customer Apps',
      'Employee Apps',
      'Admin Apps'
    ],
    ctaText: 'Explore Mobile Services',
    ctaLink: '/contact-sales'
  },
  {
    id: 'business-management',
    title: 'Business Management Solutions',
    category: 'Business Management Solutions',
    badge: 'AUTOMATION SUITE',
    description: 'Integrated business automation platforms covering HRMS, automated payroll, inventory management, billing, and complete operational control.',
    iconName: 'Briefcase',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(168,85,247,0.3)]',
    services: [
      'CRM',
      'HRM & Payroll',
      'ERP',
      'Billing & Accounting',
      'Inventory Management',
      'Customer Management',
      'Employee Management',
      'Reporting & Analytics'
    ],
    ctaText: 'Explore Business Solutions',
    ctaLink: '/contact-sales'
  },
  {
    id: 'industry-solutions',
    title: 'Industry-Specific Solutions',
    category: 'Industry-Specific Solutions',
    badge: 'TURNKEY VERTICALS',
    description: 'Specialized turnkey software suites customized for healthcare, education, real estate, retail, manufacturing, and logistics domains.',
    iconName: 'Factory',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(16,185,129,0.3)]',
    services: [
      'School Management',
      'Hospital Management',
      'Property Management',
      'Society Management',
      'Restaurant Management',
      'Hotel Management',
      'Retail Management',
      'Logistics Management',
      'Real Estate Solutions',
      'Other Industry Solutions'
    ],
    ctaText: 'Explore Industry Solutions',
    ctaLink: '/contact-sales'
  },
  {
    id: 'api-integration',
    title: 'API & Integration Services',
    category: 'API & Integration Services',
    badge: 'CONNECTIVITY & SYNC',
    description: 'Seamless RESTful & GraphQL API integration, microservices architecture, webhooks, and multi-tenant SaaS ecosystem connectivity.',
    iconName: 'Layers',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(245,158,11,0.3)]',
    services: [
      'Meta Lead Integration',
      'WhatsApp Integration',
      'Payment Gateway',
      'Google Services',
      'CRM Integration',
      'API Development',
      'Third-Party Integration'
    ],
    ctaText: 'Explore API Services',
    ctaLink: '/contact-sales'
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    category: 'Digital Marketing',
    badge: 'GROWTH & LEADS',
    description: 'Data-driven digital marketing campaigns engineered to expand brand visibility, generate high-intent enterprise leads, and maximize ROI.',
    iconName: 'Megaphone',
    bgColor: 'bg-rose-50 dark:bg-rose-500/10',
    borderColor: 'border-rose-200 dark:border-rose-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(244,63,94,0.3)]',
    services: [
      'Social Media Marketing',
      'Meta Ads',
      'Google Ads',
      'Lead Generation',
      'Content Marketing',
      'Campaign Management'
    ],
    ctaText: 'Explore Digital Marketing',
    ctaLink: '/contact-sales'
  },
  {
    id: 'seo-services',
    title: 'SEO Services',
    category: 'SEO Services',
    badge: 'ORGANIC RANKINGS',
    description: 'Comprehensive Search Engine Optimization (SEO) strategies to rank #1 on Google, capture high-converting organic search traffic, and build domain authority.',
    iconName: 'TrendingUp',
    bgColor: 'bg-teal-50 dark:bg-teal-500/10',
    borderColor: 'border-teal-200 dark:border-teal-500/30',
    glowColor: 'hover:shadow-[0_12px_36px_-10px_rgba(20,184,166,0.3)]',
    services: [
      'Website SEO',
      'Local SEO',
      'Technical SEO',
      'Keyword Research',
      'On-Page SEO',
      'SEO Audit'
    ],
    ctaText: 'Explore SEO Services',
    ctaLink: '/contact-sales'
  }
];

const renderServiceIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Globe':
      return <Globe className="w-7 h-7 text-cyan-600 dark:text-cyan-300" />;
    case 'Smartphone':
      return <Smartphone className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />;
    case 'Briefcase':
      return <Briefcase className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
    case 'Factory':
      return <Factory className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />;
    case 'Layers':
      return <Layers className="w-7 h-7 text-amber-600 dark:text-amber-400" />;
    case 'Megaphone':
      return <Megaphone className="w-7 h-7 text-rose-600 dark:text-rose-400" />;
    case 'TrendingUp':
      return <TrendingUp className="w-7 h-7 text-teal-600 dark:text-teal-400" />;
    case 'Cpu':
      return <Cpu className="w-7 h-7 text-blue-500 dark:text-cyan-400" />;
    case 'Server':
      return <Server className="w-7 h-7 text-indigo-500 dark:text-indigo-300" />;
    case 'Shield':
      return <Shield className="w-7 h-7 text-emerald-500 dark:text-emerald-300" />;
    case 'Zap':
      return <Zap className="w-7 h-7 text-amber-500 dark:text-amber-300" />;
    case 'Database':
      return <Database className="w-7 h-7 text-cyan-500 dark:text-cyan-300" />;
    case 'Sparkles':
      return <Sparkles className="w-7 h-7 text-purple-500 dark:text-purple-300" />;
    case 'Box':
      return <Box className="w-7 h-7 text-slate-600 dark:text-slate-300" />;
    case 'Award':
      return <Award className="w-7 h-7 text-amber-600 dark:text-amber-400" />;
    case 'Terminal':
      return <Terminal className="w-7 h-7 text-emerald-600 dark:text-emerald-300" />;
    case 'Cloud':
      return <Cloud className="w-7 h-7 text-sky-500 dark:text-sky-300" />;
    case 'Lock':
      return <LockIcon className="w-7 h-7 text-rose-500 dark:text-rose-300" />;
    case 'Code2':
    case 'Code':
    default:
      return <Code2 className="w-7 h-7 text-blue-600 dark:text-cyan-400" />;
  }
};

export const ServicesPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch Services dynamic data from backend API & local storage sync
  useEffect(() => {
    const fetchServices = async () => {
      let rawData: any[] = [];

      try {
        const res = await apiFetch('/services?enabled=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          rawData = data.data;
        }
      } catch (_error) {
        // network notice
      }

      // Check local storage sync
      const stored = localStorage.getItem('dezo_services_cms');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawData = parsed.filter((item: any) => item.isEnabled ?? item.status === 'active');
          }
        } catch (_e) {}
      }

      if (rawData.length > 0) {
        const mapped: ServiceCategory[] = rawData.map((item: any, idx: number) => {
          const fallback = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length] || DEFAULT_CATEGORIES[0];
          return {
            id: item.id || `srv-${idx}`,
            title: item.title || fallback.title,
            category: item.category || fallback.category,
            badge: item.badge || fallback.badge || 'ENTERPRISE SOLUTION',
            description: item.description || fallback.description,
            iconName: item.icon || fallback.iconName || 'Code2',
            bgColor: fallback.bgColor || 'bg-blue-50 dark:bg-cyan-500/10',
            borderColor: fallback.borderColor || 'border-blue-200 dark:border-cyan-500/30',
            glowColor: fallback.glowColor || 'hover:shadow-[0_12px_36px_-10px_rgba(56,189,248,0.3)]',
            services: Array.isArray(item.services) && item.services.length > 0 ? item.services : ['Custom Solution'],
            ctaText: item.ctaText || 'Explore Services',
            ctaLink: item.ctaLink || '/contact-sales',
            status: item.status || 'active',
            isEnabled: item.isEnabled ?? true,
          };
        });
        setCategories(mapped);
      }
    };

    fetchServices();
    window.addEventListener('dezo_services_updated', fetchServices);
    return () => {
      window.removeEventListener('dezo_services_updated', fetchServices);
    };
  }, []);

  const scrollToCategories = () => {
    const el = document.getElementById('service-categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 lg:py-24 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      
      {/* ── Background Ambient Radial Lighting ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-500/15 via-cyan-500/10 dark:from-blue-600/20 dark:via-cyan-500/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 blur-[150px] pointer-events-none -z-10" />
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ============================================================ */}
        {/* ── HERO SECTION ── */}
        {/* ============================================================ */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-6 shadow-sm"
          >
            <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>CUSTOM TECHNOLOGY & IT SERVICES</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6 font-['Plus_Jakarta_Sans']"
          >
            Technology Solutions for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
              Every Business
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            From a simple business website to a complete enterprise management system, we build customized technology solutions according to your business requirements.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => navigateTo('/contact-sales')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 dark:shadow-cyan-500/20 hover:shadow-2xl transition duration-300 cursor-pointer flex items-center gap-2 border-none"
            >
              <span>Get a Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToCategories}
              className="px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-300 shadow-sm cursor-pointer"
            >
              Explore All Services
            </button>
          </motion.div>

          {/* Key Value Badges Strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              <span>Tailored Specifications</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Enterprise Grade Security</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Agile Development & Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>24/7 Dedicated Support</span>
            </div>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* ── SERVICE CATEGORIES GRID (DYNAMIC CMS API) ── */}
        {/* ============================================================ */}
        <div id="service-categories" className="scroll-mt-28 mb-24">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase font-['Plus_Jakarta_Sans']">
              OUR CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-3">
              Explore Our Core Service Offerings
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              End-to-end technology solutions crafted for modern startups, mid-market businesses, and global enterprises.
            </p>
          </div>

          {/* 8 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id || index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.28, ease: 'easeOut', delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white/95 dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-cyan-500/50 p-6 flex flex-col justify-between shadow-xs hover:shadow-[0_14px_36px_-10px_rgba(37,99,235,0.16)] dark:hover:shadow-[0_14px_36px_-10px_rgba(34,211,238,0.12)] transition-all duration-300 ease-out backdrop-blur-xl text-left overflow-hidden cursor-pointer"
              >
                {/* Top Border Accent Glow on Hover */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />

                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3.5 rounded-2xl ${cat.bgColor || 'bg-blue-50/80 dark:bg-cyan-500/10'} border ${cat.borderColor || 'border-blue-200/80 dark:border-cyan-500/30'} group-hover:bg-blue-100/90 dark:group-hover:bg-cyan-500/20 group-hover:border-blue-300 dark:group-hover:border-cyan-400/50 group-hover:-translate-y-0.5 group-hover:scale-[1.05] transition-all duration-300 ease-out`}>
                      {renderServiceIcon(cat.iconName)}
                    </div>
                    {cat.badge && (
                      <span className="text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors duration-300 ease-out">
                    {cat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Service Bullets List */}
                  <div className="space-y-2.5 mb-8 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                      KEY DELIVERABLES
                    </span>
                    {cat.services.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer CTA Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => navigateTo((cat.ctaLink as any) || '/contact-sales')}
                    className="w-full py-3 px-4 rounded-xl border border-blue-600/60 dark:border-cyan-400/50 bg-slate-50 dark:bg-slate-800/80 group-hover:bg-white group-hover:border-blue-600 dark:group-hover:bg-slate-800 dark:group-hover:border-cyan-400 hover:!bg-blue-600 hover:!border-blue-600 dark:hover:!bg-cyan-500 text-slate-900 dark:text-slate-100 hover:!text-white dark:hover:!text-slate-950 font-extrabold text-xs transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-2 group/btn shadow-xs hover:shadow-md hover:shadow-blue-500/25"
                  >
                    <span className="font-extrabold transition-colors duration-300">{cat.ctaText || 'Explore Services'}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 dark:text-cyan-400 group-hover/btn:!text-white dark:group-hover/btn:!text-slate-950 group-hover:translate-x-0.75 group-hover/btn:translate-x-1 transition-all duration-300 ease-out shrink-0" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* ============================================================ */}
        {/* ── OUR WORK PROCESS (HOW WE DELIVER) ── */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 mb-24 shadow-xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              AGILE METHODOLOGY
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              How We Build & Deliver Your Project
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              A transparent, structured engineering process from initial concept to deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Requirement Discovery', desc: 'In-depth audit of your business workflows, goals, and technical specs.' },
              { step: '02', title: 'Architecture & UI/UX', desc: 'Crafting scalable system blueprints, wireframes, and interactive prototypes.' },
              { step: '03', title: 'Agile Sprint Dev', desc: 'Iterative coding with continuous testing, security audits, and client feedback.' },
              { step: '04', title: 'Launch & Support', desc: 'Seamless cloud deployment, team onboarding, and 24/7 ongoing maintenance.' },
            ].map((p, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 relative">
                <div className="text-2xl font-black text-blue-600 dark:text-cyan-400 mb-2">
                  {p.step}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{p.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ── FINAL CONSULTATION CONVERSION BANNER ── */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Build Your Custom Technology Solution?
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Connect with our solution architects today to discuss your software, web, mobile, or digital transformation goals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('/contact-sales')}
              className="px-8 py-4 rounded-full bg-white text-blue-600 hover:bg-slate-100 font-extrabold text-sm shadow-xl transition cursor-pointer flex items-center gap-2 border-none"
            >
              <span>Schedule Free Consultation</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
            
            <button
              onClick={() => navigateTo('/book-demo')}
              className="px-8 py-4 rounded-full bg-blue-700/60 hover:bg-blue-700 text-white border border-white/30 font-bold text-sm transition cursor-pointer"
            >
              Book Product Walkthrough
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServicesPage;
