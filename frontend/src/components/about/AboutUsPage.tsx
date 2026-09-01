import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Award,
  Building2,
  Rocket,
  Users
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export interface AboutUsPageConfig {
  storyBadge: string;
  storyHeading: string;
  storyDescription: string;
  storyCtaPrimaryText: string;
  storyCtaPrimaryLink: string;
  storyCtaSecondaryText: string;
  storyCtaSecondaryLink: string;
  storyCtaContactText: string;
  storyCtaContactLink: string;

  missionTitle: string;
  missionDesc: string;
  missionHighlight: string;

  visionTitle: string;
  visionDesc: string;
  visionHighlight: string;

  coreValuesBadge: string;
  coreValuesTitle: string;
  coreValues: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    style?: string;
  }>;

  milestonesBadge: string;
  milestonesTitle: string;
  milestones: Array<{
    id: string;
    year: string;
    title: string;
    desc: string;
    icon?: string;
    enabled?: boolean;
  }>;

  leadershipBadge: string;
  leadershipTitle: string;
  leadership: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
    image?: string;
  }>;

  ctaHeading: string;
  ctaDescription: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

export const DEFAULT_ABOUT_PAGE: AboutUsPageConfig = {
  storyBadge: 'THE DEZORYN TECHNOLOGIES STORY & MISSION',
  storyHeading: 'Building the Future of Enterprise Software Intelligence',
  storyDescription: 'Dezoryn Technologies delivers next-generation predictive CRM, SchoolyCore ERP, Hospitality HMS, and Inventory management software designed for international scale.',
  storyCtaPrimaryText: 'Explore Products Suite',
  storyCtaPrimaryLink: '/products',
  storyCtaSecondaryText: 'Book a Live Demo',
  storyCtaSecondaryLink: '/book-demo',
  storyCtaContactText: 'Contact Us',
  storyCtaContactLink: '/contact-sales',

  missionTitle: 'Our Mission',
  missionDesc: 'To empower modern revenue, education, and healthcare institutions with autonomous AI workflows that automate routine administration, score opportunities in real time, and eliminate operational bottlenecks.',
  missionHighlight: '10x Operational Efficiency Target',

  visionTitle: 'Our Vision',
  visionDesc: 'To build a single, unified global software cloud where sales intelligence, ERP resource planning, and multi-location management operate seamlessly with bank-grade security and zero latency.',
  visionHighlight: 'Global 24/7 Unified Cloud Infrastructure',

  coreValuesBadge: 'WHAT DRIVES US',
  coreValuesTitle: 'Our Core Principles',
  coreValues: [
    {
      id: 'val-1',
      title: 'Customer-Centric Innovation',
      desc: 'We engineer tools around real operational challenges to deliver 10x ROI for revenue and management teams.',
      icon: 'Zap',
      style: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
    },
    {
      id: 'val-2',
      title: 'Uncompromised Security',
      desc: 'SOC2 Type II, GDPR compliance, and 256-bit encryption are baked into every layer of our architecture.',
      icon: 'ShieldCheck',
      style: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
    },
    {
      id: 'val-3',
      title: 'Predictive Intelligence',
      desc: 'Moving from reactive record-keeping to proactive, ML-driven funnel and operational recommendations.',
      icon: 'TrendingUp',
      style: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30'
    },
    {
      id: 'val-4',
      title: 'Global Scale & Reliability',
      desc: 'Financially backed 99.99% uptime SLA across multi-region cloud infrastructure worldwide.',
      icon: 'Globe',
      style: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
    }
  ],

  milestonesBadge: 'OUR JOURNEY',
  milestonesTitle: 'Company Milestones',
  milestones: [
    {
      id: 'mile-1',
      year: '2023',
      title: 'Founded',
      desc: 'Started with a vision to unify ERP, CRM, and AI operations into a single intelligent platform.',
      icon: 'Sparkles',
      enabled: true
    },
    {
      id: 'mile-2',
      year: '2024',
      title: 'First Enterprise Client',
      desc: 'Onboarded Fortune 500 partners and launched multi-tenant data pipelines.',
      icon: 'Building2',
      enabled: true
    },
    {
      id: 'mile-3',
      year: '2025',
      title: 'AI Platform Launch',
      desc: 'Unveiled DezoAI Predictive Sales Engine with autonomous copilot workflows.',
      icon: 'Zap',
      enabled: true
    },
    {
      id: 'mile-4',
      year: '2026',
      title: 'Global Expansion',
      desc: 'Scaled to 10M+ active workflows across global enterprise fleets.',
      icon: 'Globe',
      enabled: true
    }
  ],

  leadershipBadge: 'EXECUTIVE LEADERSHIP',
  leadershipTitle: 'Meet the Minds Behind Dezoryn Technologies',
  leadership: [
    {
      id: 'lead-1',
      name: 'David Vance',
      role: 'Co-Founder & CEO',
      bio: 'Former VP of Product at Salesforce with 15+ years experience building enterprise SaaS platforms.',
      avatar: 'DV',
      image: ''
    },
    {
      id: 'lead-2',
      name: 'Dr. Elena Rostova',
      role: 'Chief AI Architect',
      bio: 'Ph.D. in Machine Learning from MIT, leading our proprietary lead scoring & forecasting algorithms.',
      avatar: 'ER',
      image: ''
    },
    {
      id: 'lead-3',
      name: 'Marcus Thorne',
      role: 'Head of Global Sales',
      bio: 'Scales high-performing sales engineering teams across North America, Europe, and Asia-Pacific.',
      avatar: 'MT',
      image: ''
    },
    {
      id: 'lead-4',
      name: 'Priya Sharma',
      role: 'VP of Customer Success',
      bio: 'Ensures seamless onboarding, custom integrations, and 15-minute SLA support for global accounts.',
      avatar: 'PS',
      image: ''
    }
  ],

  ctaHeading: 'Ready to Explore Our Enterprise Products?',
  ctaDescription: 'Take a personalized tour of Dezoryn Technologies, SchoolyCore, HMS, and InventoryPro with our engineering team.',
  ctaPrimaryText: 'Explore Products',
  ctaPrimaryLink: '/products',
  ctaSecondaryText: 'Book a Live Demo',
  ctaSecondaryLink: '/book-demo'
};

const renderIcon = (name?: string, className = 'w-6 h-6') => {
  switch (name?.toLowerCase()) {
    case 'zap':
    case 'lightning':
      return <Zap className={className} />;
    case 'shieldcheck':
    case 'shield':
    case 'security':
      return <ShieldCheck className={className} />;
    case 'trendingup':
    case 'chart':
    case 'growth':
      return <TrendingUp className={className} />;
    case 'globe':
    case 'world':
      return <Globe className={className} />;
    case 'target':
    case 'mission':
      return <Target className={className} />;
    case 'eye':
    case 'vision':
      return <Eye className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'sparkles':
    case 'ai':
      return <Sparkles className={className} />;
    case 'building2':
    case 'building':
      return <Building2 className={className} />;
    case 'rocket':
      return <Rocket className={className} />;
    case 'users':
    case 'team':
      return <Users className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
};

export const AboutUsPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [config, setConfig] = useState<AboutUsPageConfig>(DEFAULT_ABOUT_PAGE);

  const fetchAboutPageData = async () => {
    try {
      const res = await apiFetch(`${API_URL}/about`);
      const data = await res.json();
      if (data.success && data.data?.aboutPage) {
        setConfig({
          ...DEFAULT_ABOUT_PAGE,
          ...data.data.aboutPage,
          coreValues: Array.isArray(data.data.aboutPage.coreValues)
            ? data.data.aboutPage.coreValues
            : DEFAULT_ABOUT_PAGE.coreValues,
          milestones: Array.isArray(data.data.aboutPage.milestones)
            ? data.data.aboutPage.milestones
            : DEFAULT_ABOUT_PAGE.milestones,
          leadership: Array.isArray(data.data.aboutPage.leadership)
            ? data.data.aboutPage.leadership
            : DEFAULT_ABOUT_PAGE.leadership,
        });
      }
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    fetchAboutPageData();
    window.addEventListener('focus', fetchAboutPageData);
    window.addEventListener('dezoryn-about-updated', fetchAboutPageData);
    return () => {
      window.removeEventListener('focus', fetchAboutPageData);
      window.removeEventListener('dezoryn-about-updated', fetchAboutPageData);
    };
  }, []);

  const activeMilestones = config.milestones.filter(m => m.enabled !== false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-cyan-500/10 dark:from-blue-600/15 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── 1. HERO STORY & MISSION ── */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {config.storyBadge && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider"
            >
              <span>{config.storyBadge}</span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            {config.storyHeading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 font-normal"
          >
            {config.storyDescription}
          </motion.p>

          {/* Related Pages Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {config.storyCtaPrimaryText && (
              <button
                type="button"
                onClick={() => navigateTo(config.storyCtaPrimaryLink || '/products')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
              >
                <span>{config.storyCtaPrimaryText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {config.storyCtaSecondaryText && (
              <button
                type="button"
                onClick={() => navigateTo(config.storyCtaSecondaryLink || '/book-demo')}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-cyan-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                {config.storyCtaSecondaryText}
              </button>
            )}
            {config.storyCtaContactText && (
              <button
                type="button"
                onClick={() => navigateTo(config.storyCtaContactLink || '/contact-sales')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                {config.storyCtaContactText}
              </button>
            )}
          </div>
        </div>

        {/* ── 2. MISSION & VISION CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">{config.missionTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {config.missionDesc}
              </p>
            </div>
            {config.missionHighlight && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{config.missionHighlight}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">{config.visionTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {config.visionDesc}
              </p>
            </div>
            {config.visionHighlight && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{config.visionHighlight}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. CORE PRINCIPLES & VALUES ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            {config.coreValuesBadge && (
              <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">{config.coreValuesBadge}</span>
            )}
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{config.coreValuesTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.coreValues.map((val, idx) => (
              <div
                key={val.id || idx}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${val.style || 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'} flex items-center justify-center mb-4 text-blue-600 dark:text-cyan-400`}>
                    {renderIcon(val.icon, 'w-6 h-6')}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{val.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. COMPANY MILESTONES TIMELINE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 mb-20 shadow-xl relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            {config.milestonesBadge && (
              <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">{config.milestonesBadge}</span>
            )}
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{config.milestonesTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {activeMilestones.map((m, idx) => (
              <div key={m.id || idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                <span className="text-2xl font-black text-blue-600 dark:text-cyan-400">{m.year}</span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2 mb-1">{m.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. EXECUTIVE LEADERSHIP TEAM ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            {config.leadershipBadge && (
              <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">{config.leadershipBadge}</span>
            )}
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{config.leadershipTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.leadership.map((person, idx) => (
              <div key={person.id || idx} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
                {person.image ? (
                  <img
                    src={resolveMediaUrl(person.image)}
                    alt={person.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border border-blue-500/30 shadow-md shadow-blue-600/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-600/30">
                    {person.avatar || person.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{person.name}</h4>
                <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 mb-2">{person.role}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. PRE-FOOTER CROSS-PROMOTION CTA BANNER (TILL FOOTER) ── */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            {config.ctaHeading}
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal">
            {config.ctaDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {config.ctaPrimaryText && (
              <button
                type="button"
                onClick={() => navigateTo(config.ctaPrimaryLink || '/products')}
                className="px-8 py-4 rounded-full bg-white text-blue-600 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2"
              >
                <span>{config.ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            )}
            {config.ctaSecondaryText && (
              <button
                type="button"
                onClick={() => navigateTo(config.ctaSecondaryLink || '/book-demo')}
                className="px-8 py-4 rounded-full bg-slate-900 text-white font-extrabold text-sm shadow-xl hover:bg-slate-800 transition cursor-pointer"
              >
                {config.ctaSecondaryText}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

