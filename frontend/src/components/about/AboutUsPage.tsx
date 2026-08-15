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
  TrendingUp
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';

const DEFAULT_MILESTONES = [
  { year: '2020', title: 'Company Founded', desc: 'Started with a vision to eliminate manual sales data entry with predictive AI.' },
  { year: '2023', title: 'Product Suite Expansion', desc: 'Launched SchoolyCore ERP and Hospitality HMS modules serving 200+ clients.' },
  { year: '2025', title: 'SOC2 & Global Compliance', desc: 'Achieved bank-grade SOC2 Type II certification and expanded offices to London & Singapore.' },
  { year: '2026', title: 'Enterprise AI Core', desc: 'Released the Dezoryn Technologies 3.0 Real-Time AI Lead Intelligence & Cadence Engine.' }
];

export const AboutUsPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);

  useEffect(() => {
    apiFetch('/timeline')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data
            .filter((i: any) => i.enabled !== false)
            .map((i: any) => ({
              year: i.year || '2020',
              title: i.title || 'Milestone',
              desc: i.description || ''
            }));
          if (mapped.length > 0) setMilestones(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const coreValues = [
    {
      title: 'Customer-Centric Innovation',
      desc: 'We engineer tools around real operational challenges to deliver 10x ROI for revenue and management teams.',
      icon: <Zap className="w-6 h-6 text-blue-600 dark:text-cyan-400" />,
      style: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
    },
    {
      title: 'Uncompromised Security',
      desc: 'SOC2 Type II, GDPR compliance, and 256-bit encryption are baked into every layer of our architecture.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      style: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
    },
    {
      title: 'Predictive Intelligence',
      desc: 'Moving from reactive record-keeping to proactive, ML-driven funnel and operational recommendations.',
      icon: <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      style: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30'
    },
    {
      title: 'Global Scale & Reliability',
      desc: 'Financially backed 99.99% uptime SLA across multi-region cloud infrastructure worldwide.',
      icon: <Globe className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      style: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
    }
  ];

  const leadership = [
    {
      name: 'David Vance',
      role: 'Co-Founder & CEO',
      bio: 'Former VP of Product at Salesforce with 15+ years experience building enterprise SaaS platforms.',
      avatar: 'DV'
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Chief AI Architect',
      bio: 'Ph.D. in Machine Learning from MIT, leading our proprietary lead scoring & forecasting algorithms.',
      avatar: 'ER'
    },
    {
      name: 'Marcus Thorne',
      role: 'Head of Global Sales',
      bio: 'Scales high-performing sales engineering teams across North America, Europe, and Asia-Pacific.',
      avatar: 'MT'
    },
    {
      name: 'Priya Sharma',
      role: 'VP of Customer Success',
      bio: 'Ensures seamless onboarding, custom integrations, and 15-minute SLA support for global accounts.',
      avatar: 'PS'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-cyan-500/10 dark:from-blue-600/15 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── HERO BANNER ── */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-4"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-pulse" />
            <span>THE DEZORYN TECHNOLOGIES STORY & MISSION</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            Building the Future of <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-blue-500 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">Enterprise Software Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 font-normal"
          >
            Dezoryn Technologies delivers next-generation predictive CRM, SchoolyCore ERP, Hospitality HMS, and Inventory management software designed for international scale.
          </motion.p>

          {/* Related Pages Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('/products')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <span>Explore Products Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('/book-demo')}
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-cyan-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
            >
              Book a Live Demo
            </button>
            <button
              onClick={() => navigateTo('/contact-sales')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-sm"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* ── MISSION & VISION CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              To empower modern revenue, education, and healthcare institutions with autonomous AI workflows that automate routine administration, score opportunities in real time, and eliminate operational bottlenecks.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400">
              <CheckCircle2 className="w-4 h-4" /> 10x Operational Efficiency Target
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-6">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              To build a single, unified global software cloud where sales intelligence, ERP resource planning, and multi-location management operate seamlessly with bank-grade security and zero latency.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Global 24/7 Unified Cloud Infrastructure
            </div>
          </div>
        </div>

        {/* ── CORE VALUES GRID ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">WHAT DRIVES US</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Our Core Principles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${val.style} flex items-center justify-center mb-4`}>
                    {val.icon}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{val.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPANY MILESTONES TIMELINE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 mb-20 shadow-xl relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">OUR JOURNEY</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Company Milestones</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                <span className="text-2xl font-black text-blue-600 dark:text-cyan-400">{m.year}</span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2 mb-1">{m.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── LEADERSHIP TEAM ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">EXECUTIVE LEADERSHIP</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Meet the Minds Behind Dezoryn Technologies</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((person, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-600/30">
                  {person.avatar}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{person.name}</h4>
                <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 mb-2">{person.role}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RELATED PAGES CROSS-PROMOTION BANNER ── */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Explore Our Enterprise Products?
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal">
            Take a personalized tour of Dezoryn Technologies, SchoolyCore, HMS, and InventoryPro with our engineering team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('/products')}
              className="px-8 py-4 rounded-full bg-white text-blue-600 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => navigateTo('/book-demo')}
              className="px-8 py-4 rounded-full bg-slate-900 text-white font-extrabold text-sm shadow-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Book a Live Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
