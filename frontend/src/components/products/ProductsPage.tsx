import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Bot, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check,
  ChevronDown
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

interface ProductModule {
  id: string;
  category: 'core' | 'automation' | 'analytics' | 'security';
  title: string;
  badge: string;
  shortDesc: string;
  longDesc: string;
  icon: React.ReactNode;
  color: string;
  accentBg: string;
  features: string[];
  metrics: { value: string; label: string }[];
}

const productModules: ProductModule[] = [
  {
    id: 'sales-intelligence',
    category: 'core',
    title: 'AI Predictive Lead Intelligence',
    badge: 'CORE MODULE',
    shortDesc: 'Automatically score, prioritize, and route high-intent leads using machine learning.',
    longDesc: 'Dezoryn Technologies Sales Intelligence evaluates over 50+ real-time behavioral signals, buyer intent data, and firmographics to score leads with unmatched precision.',
    icon: <Zap className="w-6 h-6 text-blue-600 dark:text-cyan-400" />,
    color: 'text-blue-600 dark:text-cyan-400',
    accentBg: 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/30',
    features: [
      'Real-time Intent & Lead Quality Scoring (0-100)',
      'Automated Round-Robin Rep Lead Assignment',
      'AI Deal Win Probability & Risk Alerts',
      'Enriched Contact Profiles from 200M+ Sources'
    ],
    metrics: [
      { value: '3.4x', label: 'Increased Win Rates' },
      { value: '94%', label: 'Prediction Accuracy' }
    ]
  },
  {
    id: 'automated-cadence',
    category: 'automation',
    title: 'Automated Follow-Up & Cadence Engine',
    badge: 'AUTOMATION',
    shortDesc: 'Multi-channel automated outreach sequences across email, WhatsApp, and SMS.',
    longDesc: 'Create personalized, multi-step sales cadences that pause automatically when prospects reply. Never let another hot deal slip through the cracks.',
    icon: <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
    features: [
      'Multi-Channel Email, SMS & Phone Outreach',
      'Dynamic Merge Tag Personalization',
      'Auto-Pause on Prospect Reply or Meeting Booked',
      'A/B Sequence Testing & Template Optimization'
    ],
    metrics: [
      { value: '18 hrs', label: 'Saved per Rep/Week' },
      { value: '4.8x', label: 'Higher Reply Rate' }
    ]
  },
  {
    id: 'revenue-forecasting',
    category: 'analytics',
    title: 'Predictive Revenue & Funnel Analytics',
    badge: 'ANALYTICS',
    shortDesc: '360-degree pipeline visibility with AI-driven quarterly revenue predictions.',
    longDesc: 'Stop relying on guesswork. Dezoryn Technologies provides real-time pipeline health tracking, quota attainment forecasts, and stage conversion analytics.',
    icon: <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
    features: [
      'AI Quarter-End Revenue Forecasting Models',
      'Pipeline Drag-and-Drop Kanban Board',
      'Stage Velocity & Bottleneck Analysis',
      'Rep Quota Attainment Leaderboards'
    ],
    metrics: [
      { value: '₹4.2M', label: 'Avg Pipeline Tracked' },
      { value: '99.1%', label: 'Forecast Accuracy' }
    ]
  },
  {
    id: 'enterprise-platform',
    category: 'security',
    title: 'Global Multi-Currency & Security Suite',
    badge: 'ENTERPRISE',
    shortDesc: 'Bank-grade 256-bit encryption, SOC2 compliance, and multi-region currency support.',
    longDesc: 'Designed for international scale. Seamlessly manage global subsidiaries, auto-convert multi-currency deals, and enforce strict role-based access control.',
    icon: <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
    color: 'text-sky-600 dark:text-sky-400',
    accentBg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30',
    features: [
      'SOC2 Type II & GDPR Compliant Security',
      'Automatic Multi-Currency & FX Exchange Rates',
      'Granular Role-Based Access Control (RBAC)',
      'Immutable Audit Logs & Data Retention'
    ],
    metrics: [
      { value: '99.99%', label: 'Guaranteed SLA' },
      { value: '256-bit', label: 'AES Encryption' }
    ]
  }
];

export const ProductsPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>(productModules[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredModules = selectedCategory === 'all' 
    ? productModules 
    : productModules.filter(m => m.category === selectedCategory);

  const pricingPlans = [
    {
      name: 'Starter',
      desc: 'Ideal for small sales teams getting started with CRM automation.',
      price: '₹29',
      period: '/user/month',
      isPopular: false,
      features: [
        'Up to 10 Sales Reps',
        'Basic AI Lead Scoring',
        'Email & SMS Cadences',
        'Standard Kanban Pipelines',
        '99.5% SLA Uptime Guarantee'
      ]
    },
    {
      name: 'Professional',
      desc: 'For growing revenue teams needing predictive AI intelligence.',
      price: '₹79',
      period: '/user/month',
      isPopular: true,
      features: [
        'Unlimited Sales Reps',
        'Advanced 50+ Signal Lead Scoring',
        'Multi-Channel Automated Cadences',
        'Quarterly Revenue Forecasting',
        'Multi-Currency & Custom Fields',
        'Dedicated Support & Onboarding'
      ]
    },
    {
      name: 'Enterprise',
      desc: 'Custom infrastructure & SOC2 security for global organizations.',
      price: 'Custom',
      period: 'Billed Annually',
      isPopular: false,
      features: [
        'Dedicated Enterprise Cloud Cluster',
        'SOC2, GDPR & HIPAA Compliance',
        'Custom AI Model Training',
        '24/7 Priority Support & 15 Min SLA',
        'Dedicated Technical Account Manager',
        'Custom SSO (SAML, Okta, Azure AD)'
      ]
    }
  ];

  const faqs = [
    {
      q: 'Can Dezoryn Technologies integrate with our existing stack (Salesforce, HubSpot)?',
      a: 'Yes! Dezoryn Technologies offers 1-click bi-directional synchronization with Salesforce, HubSpot, Zendesk, Slack, PostgreSQL, and 2,000+ apps via Zapier and custom webhooks.'
    },
    {
      q: 'How does Dezoryn Technologies AI train on our lead data?',
      a: 'Dezoryn Technologies uses privacy-first, isolated ML models. Your customer data is never shared across tenants or used to train global public LLMs.'
    },
    {
      q: 'What is the deployment timeline for enterprise teams?',
      a: 'Standard deployment takes under 48 hours. Our solutions engineering team provides full migration assistance from legacy systems with zero downtime.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* Radial Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-cyan-500/10 dark:from-blue-600/15 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── HERO BANNER ── */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-4"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-pulse" />
            <span>DEZORYN TECHNOLOGIES ENTERPRISE PRODUCT SUITE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            Unified AI Infrastructure for <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-blue-500 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">Modern Revenue Operations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 font-normal"
          >
            Explore our modular product ecosystem engineered to predict win rates, automate multi-channel cadences, and scale global sales pipelines.
          </motion.p>

          {/* Quick Nav CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('/book-demo')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <span>Book Product Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('/contact-sales')}
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-cyan-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* ── CATEGORY FILTER TABS ── */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-12 flex-wrap">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'core', label: 'Lead Intelligence' },
            { id: 'automation', label: 'Cadence Engine' },
            { id: 'analytics', label: 'Predictive Analytics' },
            { id: 'security', label: 'Enterprise Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 dark:bg-cyan-500/20 border border-blue-600 dark:border-cyan-400 text-white dark:text-cyan-300 shadow-md shadow-blue-500/20 dark:shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCT MODULE CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filteredModules.map((module) => {
            const isSelected = selectedModule === module.id;
            return (
              <motion.div
                key={module.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedModule(module.id)}
                className={`p-6 sm:p-8 rounded-3xl border transition duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-cyan-400/80 shadow-xl dark:shadow-2xl shadow-blue-500/10 dark:shadow-cyan-500/20'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${module.accentBg}`}>
                      {module.icon}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {module.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{module.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{module.longDesc}</p>

                  <div className="space-y-2 mb-6">
                    {module.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex gap-4">
                    {module.metrics.map((m, idx) => (
                      <div key={idx}>
                        <div className="text-base font-black text-slate-900 dark:text-white">{m.value}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigateTo('/book-demo')}
                    className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 hover:bg-blue-100 dark:hover:bg-cyan-500/20 border border-blue-200 dark:border-cyan-400/40 text-blue-600 dark:text-cyan-300 font-bold text-xs transition"
                  >
                    Demo Module &rarr;
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── MOCK INTERACTIVE DASHBOARD PREVIEW ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 mb-20 shadow-xl dark:shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 text-left">
              <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">REAL-TIME INTERFACE</span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">Enterprise Control Center</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Monitor deal velocity, lead scores, rep performance, and multi-currency pipelines from a single high-performance dashboard.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-cyan-400">
                  ⚡ 50ms Real-Time Data Sync
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                  📊 Predictive AI Funnel Models
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 p-4 shadow-xl aspect-video relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                  alt="Dezoryn Technologies Predictive Dashboard"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-900/90 border border-slate-700 backdrop-blur-md px-4 py-2 rounded-xl text-xs text-white">
                  <span className="font-bold">Active Pipeline: ₹14.8M</span>
                  <span className="text-cyan-400 font-extrabold">98.4% Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ENTERPRISE PRICING PREVIEW ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">TRANSPARENT ENTERPRISE PRICING</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Flexible Plans for Every Stage</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl border flex flex-col justify-between relative transition duration-300 ${
                  plan.isPopular
                    ? 'bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-blue-600 dark:border-cyan-400 shadow-xl dark:shadow-2xl shadow-blue-500/10 dark:shadow-cyan-500/25 scale-105'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    MOST POPULAR
                  </span>
                )}
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{plan.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{plan.desc}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{plan.period}</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigateTo(plan.name === 'Enterprise' ? '/contact-sales' : '/book-demo')}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-600 dark:to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Enterprise Sales' : 'Get Started Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Product FAQs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Common questions about Dezoryn Technologies deployment</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-blue-600 dark:text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM CONVERSION BANNER ── */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Accelerate Your Sales Revenue Engine
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal">
            Join hundreds of enterprise sales teams using Dezoryn Technologies to score leads, automate cadences, and close deals faster.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('/book-demo')}
              className="px-8 py-4 rounded-full bg-white text-blue-600 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2"
            >
              <span>Book a Live Demo</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
