import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ChevronDown,
  GraduationCap,
  Building,
  Hotel,
  CheckCircle2,
  Calendar,
  Store,
  Cross,
  Boxes,
  ShieldCheck,
  BadgeDollarSign,
  BarChart3,
  ShoppingBag,
  DollarSign,
  X,
  Star,
  Layers
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';
import { useNavigation } from '../../utils/NavigationContext';

export interface GlobalPricingPlan {
  id: string;
  name: string;
  price: string;
  monthlyPrice?: number;
  annualPrice?: number;
  currency?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
  isHighlight?: boolean;
  ribbon?: string | null;
  colorTheme?: string;
  isEnabled?: boolean;
}

export interface SolutionModule {
  id: string;
  name: string;
  badge: string;
  subtitle: string;
  description: string;
  price?: string;
  priceValue?: number;
  icon: React.ReactNode;
  accentBg: string;
  glowColor: string;
  features: string[];
  metrics: { label: string; value: string }[];
  marketSearchTerm: string;
  pricingTiers?: { name: string; price: string; period: string; popular?: boolean; features: string[]; ctaText: string }[];
}

const renderModuleIcon = (iconName?: string, category?: string) => {
  const cat = String(category || '').toLowerCase();
  const icon = String(iconName || '').toLowerCase();

  if (icon.includes('graduation') || cat.includes('education')) {
    return <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
  }
  if (icon.includes('hotel') || icon.includes('home') || cat.includes('estate') || cat.includes('property')) {
    return <Hotel className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
  }
  if (icon.includes('building') || icon.includes('lite')) {
    return <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (icon.includes('cross') || cat.includes('health')) {
    return <Cross className="w-5 h-5 text-emerald-500" />;
  }
  if (icon.includes('boxes') || cat.includes('inventory') || cat.includes('erp')) {
    return <Boxes className="w-5 h-5 text-amber-500" />;
  }
  if (icon.includes('shield') || cat.includes('security')) {
    return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
  }
  if (icon.includes('dollar') || cat.includes('finance')) {
    return <BadgeDollarSign className="w-5 h-5 text-emerald-600" />;
  }
  if (icon.includes('chart') || cat.includes('analytics')) {
    return <BarChart3 className="w-5 h-5 text-teal-500" />;
  }
  if (icon.includes('bag') || cat.includes('retail') || cat.includes('commerce')) {
    return <ShoppingBag className="w-5 h-5 text-pink-500" />;
  }
  return <Zap className="w-5 h-5 text-blue-600 dark:text-cyan-400" />;
};

const FALLBACK_PLANS: GlobalPricingPlan[] = [
  {
    id: 'starter-plan',
    name: 'Starter',
    price: '29',
    monthlyPrice: 29,
    annualPrice: 24,
    currency: '₹',
    description: 'Essential pipeline management & basic lead scoring for small sales teams.',
    features: ['Up to 10 Sales Rep Seats', 'Basic AI Lead Scoring', 'Email & SMS Cadences', 'Kanban Deal Pipelines', '99.5% SLA Uptime'],
    buttonText: 'Start Free Trial',
    buttonUrl: '/book-demo',
    isHighlight: false,
    colorTheme: 'slate'
  },
  {
    id: 'professional-plan',
    name: 'Professional',
    price: '79',
    monthlyPrice: 79,
    annualPrice: 64,
    currency: '₹',
    description: 'Advanced predictive intelligence, multi-channel cadences & AI forecasting.',
    features: ['Unlimited Sales Seats', '50+ Intent Signals', 'Multi-Channel Automation', 'AI Revenue Forecasting', 'Multi-Currency Support', 'Dedicated Onboarding'],
    buttonText: 'Schedule Walkthrough',
    buttonUrl: '/book-demo',
    isHighlight: true,
    ribbon: 'Most Popular',
    colorTheme: 'blue'
  },
  {
    id: 'enterprise-plan',
    name: 'Enterprise',
    price: 'Custom',
    currency: '₹',
    description: 'Dedicated cloud cluster, custom AI model training & SOC2 compliance.',
    features: ['Isolated Cloud Cluster', 'SOC2 Type II & GDPR', 'Custom AI Fine-Tuning', '24/7 Priority Support', 'Technical Account Manager', 'Custom SSO Integration'],
    buttonText: 'Contact Us',
    buttonUrl: '/contact-sales',
    isHighlight: false,
    colorTheme: 'violet'
  }
];

const FALLBACK_MODULES: SolutionModule[] = [
  {
    id: 'schoolycore',
    name: 'SchoolyCore ERP',
    badge: 'CAMPUS SUITE',
    subtitle: 'K-12 & Higher Education Operations OS',
    description: 'Academic management suite powering admissions, fee billing, attendance, report card transcripts, and parent mobile apps.',
    price: 'From ₹49/mo',
    icon: <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
    accentBg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-400/30',
    glowColor: 'from-violet-600/20 via-purple-500/10 to-transparent',
    features: [
      'Digital Admissions & Student Records',
      'Auto Fee Billing & Payment Links',
      'Biometric & Geo-Fenced Mobile Attendance',
      'Custom Board Report Cards Generator'
    ],
    metrics: [
      { value: '4.9/5', label: 'Parent Rating' },
      { value: '+45%', label: 'Time Saved' }
    ],
    marketSearchTerm: 'schoolycore'
  },
  {
    id: 'dezo-crm-suite',
    name: 'Dezoryn CRM 360',
    badge: 'CRM PLATFORM',
    subtitle: 'AI-Powered Lead Scoring & Sales OS',
    description: 'Autonomous sales pipeline intelligence with lead scoring across 50+ intent signals and multi-channel email/SMS cadences.',
    price: 'From ₹29/mo',
    icon: <Zap className="w-5 h-5 text-blue-600 dark:text-cyan-400" />,
    accentBg: 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-400/30',
    glowColor: 'from-blue-600/20 via-cyan-500/10 to-transparent',
    features: [
      '50+ Real-Time Buyer Intent Signals',
      'Automated Round-Robin Lead Assignment',
      'Multi-Channel Cadences (Email, SMS, WhatsApp)',
      'Quarterly Quota & Velocity Predictions'
    ],
    metrics: [
      { value: '3.4x', label: 'Win Rate Lift' },
      { value: '94%', label: 'Scoring Accuracy' }
    ],
    marketSearchTerm: 'crm'
  },
  {
    id: 'prop360-estate',
    name: 'Real Estate OS',
    badge: 'PROPERTY ERP',
    subtitle: 'Portfolio, Tenant & Operations Engine',
    description: 'Comprehensive real estate management suite for residential and commercial assets with automated rent invoicing.',
    price: 'From ₹55/mo',
    icon: <Hotel className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    accentBg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-400/30',
    glowColor: 'from-rose-600/20 via-pink-500/10 to-transparent',
    features: [
      'Automated Monthly Rent Invoicing',
      'Tenant Portal & Maintenance Desk',
      'Lease Expiration & Auto-Renewal Alerts',
      'Multi-Property Ledger Reconciliation'
    ],
    metrics: [
      { value: '99.4%', label: 'Rent Recovery' },
      { value: '-60%', label: 'Admin Hours' }
    ],
    marketSearchTerm: 'estate'
  },
  {
    id: 'schoolycore-lite',
    name: 'SchoolyCore Lite',
    badge: 'LITE MODULE',
    subtitle: 'Essential Single-Campus Suite',
    description: 'Lightweight institute management focused on core attendance, basic fee billing, parent alerts, and student records.',
    price: 'From ₹24/mo',
    icon: <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    accentBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-400/30',
    glowColor: 'from-emerald-600/20 via-teal-500/10 to-transparent',
    features: [
      'Core Student Roster & Contact Directory',
      'Basic Fee Receipt Generator & Payment Tracking',
      'Daily Attendance Logging & SMS Parent Alerts',
      '1-Click CSV Student Data Import / Export'
    ],
    metrics: [
      { value: '< 24h', label: 'Deploy Time' },
      { value: '100%', label: 'Cloud Native' }
    ],
    marketSearchTerm: 'schoolycore-lite'
  },
  {
    id: 'hms-health',
    name: 'Dezo Care HMS',
    badge: 'HEALTHCARE OS',
    subtitle: 'Hospital OPD/IPD & EHR Management',
    description: 'NABH ready Hospital Management System covering digital doctor prescriptions, pharmacy inventory, and lab billing.',
    price: 'From ₹89/mo',
    icon: <Cross className="w-5 h-5 text-emerald-500" />,
    accentBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-400/30',
    glowColor: 'from-emerald-600/20 via-teal-500/10 to-transparent',
    features: [
      'OPD / IPD Patient & Bed Management',
      'EHR & Digital Doctor Prescriptions Engine',
      'Pharmacy & Pathology Lab Sync',
      'NABH Compliance Audit Logging'
    ],
    metrics: [
      { value: '-40%', label: 'Wait Time' },
      { value: '99.5%', label: 'OPD Billing' }
    ],
    marketSearchTerm: 'hms-health'
  },
  {
    id: 'sales-ai-copilot',
    name: 'DezoAI Sales Copilot',
    badge: 'AI COPILOT',
    subtitle: 'Predictive Sales Agent & Lead Scoring',
    description: 'Autonomous AI agent to score leads, generate personalized multi-channel outreach, and predict pipeline deal win rates.',
    price: 'From ₹79/mo',
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    accentBg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-400/30',
    glowColor: 'from-cyan-600/20 via-blue-500/10 to-transparent',
    features: [
      'Predictive Intent Signal Scoring',
      'Autonomous Multi-Channel Cadences',
      'Deal Win Rate Predictive Forecasting',
      'Bi-Directional 1-Click CRM Sync'
    ],
    metrics: [
      { value: '4.8x', label: 'Win Rate Boost' },
      { value: '18h/wk', label: 'Time Saved' }
    ],
    marketSearchTerm: 'sales-ai-copilot'
  }
];

export const PricingPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [plans, setPlans] = useState<GlobalPricingPlan[]>(FALLBACK_PLANS);
  const [modules, setModules] = useState<SolutionModule[]>(FALLBACK_MODULES);
  const [selectedModuleForTiers, setSelectedModuleForTiers] = useState<SolutionModule | null>(null);

  useEffect(() => {
    // 1. Fetch Global Pricing Plans (Admin Pricing Manager sync)
    const fetchGlobalPlans = async () => {
      try {
        const res = await apiFetch('/pricing');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const activeOnly = data.data.filter((p: any) => p.isEnabled !== false);
          if (activeOnly.length > 0) {
            setPlans(activeOnly);
          }
        }
      } catch (_e) {
        // Retain FALLBACK_PLANS
      }
    };

    // 2. Fetch Marketplace Product Modules (Admin Marketplace Manager sync)
    const fetchBackendProducts = async () => {
      try {
        const res = await apiFetch('/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: SolutionModule[] = data.data.map((p: any) => ({
            id: p.id,
            name: p.title || p.name,
            badge: (p.badge || p.categoryLabel || 'SOFTWARE MODULE').toUpperCase(),
            subtitle: p.subtitle || `${p.categoryLabel || 'Enterprise'} Automation Suite`,
            description: p.description || p.shortDesc || `Enterprise platform engineered for ${p.title}.`,
            price: p.price || 'From ₹49/mo',
            priceValue: p.priceValue,
            icon: renderModuleIcon(p.icon, p.category),
            accentBg: 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-400/30',
            glowColor: 'from-blue-600/20 via-cyan-500/10 to-transparent',
            features: (Array.isArray(p.features) && p.features.length > 0)
              ? p.features.slice(0, 4)
              : ['Workflow Automation', 'Real-Time Analytics & Logs', 'Enterprise RBAC Security', '24/7 Priority Support'],
            metrics: [
              { value: `${p.rating || 4.9}★`, label: `${(p.reviewsCount || 850).toLocaleString()} Verified` },
              { value: p.price || 'From ₹49/mo', label: 'Starting Price' }
            ],
            marketSearchTerm: p.id,
            pricingTiers: Array.isArray(p.pricingTiers) ? p.pricingTiers : []
          }));
          setModules(mapped);
        }
      } catch (_e) {
        // Retain FALLBACK_MODULES
      }
    };

    fetchGlobalPlans();
    fetchBackendProducts();
  }, []);

  const getPlanTheme = (colorTheme?: string, isHighlight?: boolean) => {
    if (isHighlight || colorTheme === 'blue' || colorTheme === 'cyan') {
      return {
        cardBg: 'bg-white dark:bg-slate-900',
        border: 'border-2 border-blue-500 dark:border-cyan-400 shadow-xl shadow-blue-500/15',
        badgeBg: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
        priceColor: 'text-blue-600 dark:text-cyan-400',
        btn: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 border-none',
        checkColor: 'text-cyan-500'
      };
    }
    if (colorTheme === 'violet' || colorTheme === 'purple') {
      return {
        cardBg: 'bg-white dark:bg-slate-900',
        border: 'border border-purple-200 dark:border-purple-500/30 hover:border-purple-500',
        badgeBg: 'bg-purple-600 text-white',
        priceColor: 'text-purple-600 dark:text-purple-400',
        btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 border-none',
        checkColor: 'text-purple-500'
      };
    }
    return {
      cardBg: 'bg-white dark:bg-slate-900/90',
      border: 'border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
      badgeBg: 'bg-slate-700 text-white',
      priceColor: 'text-slate-900 dark:text-white',
      btn: 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-200 dark:border-slate-700',
      checkColor: 'text-emerald-500'
    };
  };

  const faqs = [
    {
      q: 'Are these pricing plans directly synced with the Admin Panel?',
      a: 'Yes! All global subscription plans and marketplace product prices are fully connected with the Admin Portal. Any pricing update made by an admin goes live instantly on the Pricing page, Marketplace, and Product pages.',
    },
    {
      q: 'Where do I view detailed pricing and subscription tiers?',
      a: 'All detailed pricing tiers, tier comparisons, and purchasing options are available on both the Pricing page and Marketplace catalog.',
    },
    {
      q: 'Can I switch products or add extra modules later?',
      a: 'Yes! You can add extra modules or upgrade subscription tiers anytime directly through the Marketplace catalog or admin portal.',
    },
    {
      q: 'Is there a free trial available for each software module?',
      a: 'Yes, we offer a 14-day risk-free trial across all enterprise software modules with no credit card required.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      
      {/* Radial Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-500/15 via-cyan-500/10 dark:from-blue-600/20 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b05_1px,transparent_1px),linear-gradient(to_bottom,#1e293b05_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── HERO HEADER BANNER ── */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-3 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 animate-pulse" />
            <span>ENTERPRISE SUBSCRIPTION PLANS & MARKETPLACE PRICING</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3"
          >
            Flexible Plans & Transparent <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-blue-500 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
              Platform Pricing
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-6"
          >
            Explore central subscription plans and software solution modules. Fully synchronized in real-time with the Admin Portal.
          </motion.p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* ── SECTION 1: GLOBAL SUBSCRIPTION PLANS (ADMIN PRICING MANAGER SYNC) ── */}
        <div className="mb-20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Main Platform Subscriptions</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core platform license tiers managed directly from Admin Portal Pricing Manager
              </p>
            </div>
            <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase tracking-wider bg-blue-50 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-cyan-400/30">
              Admin Synced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
              const theme = getPlanTheme(plan.colorTheme, plan.isHighlight);
              const isCustom = String(plan.price).toLowerCase().includes('custom') || plan.price === 'Custom';
              
              let displayPrice = plan.price;
              if (!isCustom) {
                if (billingCycle === 'annual' && plan.annualPrice) {
                  displayPrice = `${plan.currency || '₹'}${plan.annualPrice}`;
                } else if (plan.monthlyPrice) {
                  displayPrice = `${plan.currency || '₹'}${plan.monthlyPrice}`;
                } else if (!displayPrice.startsWith('₹') && !displayPrice.startsWith('$')) {
                  displayPrice = `${plan.currency || '₹'}${displayPrice}`;
                }
              }

              return (
                <motion.div
                  key={plan.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${theme.cardBg} ${theme.border}`}
                >
                  {/* Ribbon Badge */}
                  {plan.ribbon && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badgeBg}`}>
                      {plan.ribbon}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mb-4 min-h-[32px] line-clamp-2">
                      {plan.description}
                    </p>

                    {/* Price Header */}
                    <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                      {isCustom ? (
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                          Custom Pricing
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black ${theme.priceColor}`}>
                            {displayPrice}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            /month {billingCycle === 'annual' ? '(billed annually)' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features Bullet List */}
                    <div className="space-y-2.5 mb-6">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                        Included Capabilities
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${theme.checkColor}`} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => navigateTo(plan.buttonUrl || '/book-demo')}
                    className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${theme.btn}`}
                  >
                    <span>{plan.buttonText || 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: MARKETPLACE SOFTWARE SOLUTIONS (ADMIN MARKETPLACE MANAGER SYNC) ── */}
        <div className="mb-20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <span>Marketplace Software Solutions</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turnkey software modules & industry vertical solutions managed in Marketplace Admin
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/marketplace')}
              className="text-xs font-black text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Explore Marketplace Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-lg backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Card Ambient Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${module.glowColor} blur-3xl pointer-events-none -z-10`} />

                <div>
                  {/* Compact Header Row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${module.accentBg} shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                        {module.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/20">
                          {module.badge}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                          {module.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-blue-600 dark:text-cyan-300 mb-2 line-clamp-1">
                    {module.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-3 line-clamp-2">
                    {module.description}
                  </p>

                  {/* Starting Price Pill */}
                  {module.price && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-3">
                      <BadgeDollarSign className="w-3.5 h-3.5" />
                      <span>{module.price}</span>
                    </div>
                  )}

                  {/* Key Features List */}
                  <div className="space-y-1.5 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Core Capabilities
                    </span>
                    {module.features.slice(0, 4).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Impact Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {module.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left">
                        <div className="text-sm font-black text-blue-600 dark:text-cyan-300">{m.value}</div>
                        <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTONS STACK */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {Array.isArray(module.pricingTiers) && module.pricingTiers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedModuleForTiers(module)}
                      className="py-2.5 px-3 rounded-xl bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1 border border-violet-200 dark:border-violet-800"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View Plans ({module.pricingTiers.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateTo(`/marketplace?product=${encodeURIComponent(module.marketSearchTerm)}`)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo(`/product-detail?id=${module.id}`)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <span>Specs</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── MARKETPLACE PRICING RESPONSIBILITY BANNER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 mb-16 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto">
            <span className="text-[10px] font-black tracking-wider text-cyan-400 uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/30">
              CENTRAL MARKETPLACE CATALOG
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">
              Need Detailed Subscription Pricing & Custom Plans?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6">
              All subscription tiers, pricing calculations, feature comparisons, and instant checkout flows are managed directly by our Marketplace catalog.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigateTo('/marketplace')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl transition cursor-pointer flex items-center gap-2 border-none"
              >
                <Store className="w-4 h-4" />
                <span>Open Full Marketplace Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/book-demo')}
                className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-cyan-300" />
                <span>Schedule Architecture Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── FAQ ACCORDION ── */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Solutions & Pricing FAQs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Common questions about modules, trials, and marketplace billing</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer border-none bg-transparent"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-blue-600 dark:text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CRM PRODUCT TIER COMPARISON MODAL ── */}
        <AnimatePresence>
          {selectedModuleForTiers && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-cyan-400/20">
                      {selectedModuleForTiers.badge} SUBSCRIPTION PLANS
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedModuleForTiers.name} - Pricing Tiers
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedModuleForTiers.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedModuleForTiers(null)}
                    className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(selectedModuleForTiers.pricingTiers || []).map((tier, tIdx) => (
                    <div
                      key={tIdx}
                      className={`rounded-2xl p-5 flex flex-col justify-between border relative ${
                        tier.popular
                          ? 'border-blue-500 dark:border-cyan-400 bg-blue-50/20 dark:bg-slate-800/80 shadow-lg shadow-blue-500/10'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" /> Most Popular
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                          {tier.name}
                        </h3>

                        <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                          <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">
                            {tier.price}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {tier.period || '/month'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-6">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Tier Capabilities
                          </span>
                          {(tier.features || []).map((f, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModuleForTiers(null);
                          navigateTo(`/marketplace?product=${encodeURIComponent(selectedModuleForTiers.marketSearchTerm)}`);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md border-none"
                      >
                        <span>{tier.ctaText || 'Select Plan'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PricingPage;
