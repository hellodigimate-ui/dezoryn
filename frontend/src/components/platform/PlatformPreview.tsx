import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Bot, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface FeatureTab {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  highlights: string[];
  metric: string;
  metricLabel: string;
}

const tabs: FeatureTab[] = [
  {
    id: 'predictive-ai',
    title: 'Predictive Sales AI',
    subtitle: 'Lead scoring & deal velocity',
    icon: <Zap className="w-5 h-5" />,
    tag: 'INTELLIGENCE',
    description: 'Dezoryn Technologies analyzes millions of historical sales signals to accurately predict conversion rates, prioritize high-value leads, and identify win-chance bottlenecks in real time.',
    highlights: [
      'Automated Lead Qualification & Opportunity Scoring',
      'AI Win Probability & Risk Detection',
      'Recommended Next Best Actions for Reps'
    ],
    metric: '94.8%',
    metricLabel: 'AI Prediction Accuracy'
  },
  {
    id: 'automated-workflows',
    title: 'Automated Workflows',
    subtitle: 'Smart email & task automation',
    icon: <Bot className="w-5 h-5" />,
    tag: 'AUTOMATION',
    description: 'Eliminate manual data entry. Trigger custom automated follow-up sequences, task assignments, and calendar bookings seamlessly across teams.',
    highlights: [
      'Multi-channel Cadence Automation',
      'Instant CRM Sync & Lead Routing',
      'Custom Trigger & Action Builder'
    ],
    metric: '18 hrs/wk',
    metricLabel: 'Saved per Sales Rep'
  },
  {
    id: 'revenue-analytics',
    title: 'Revenue Analytics',
    subtitle: 'Real-time pipeline & forecasting',
    icon: <TrendingUp className="w-5 h-5" />,
    tag: 'ANALYTICS',
    description: 'Gain complete visibility into your sales funnel with real-time revenue dashboards, quota tracking, and multi-scenario forecast models.',
    highlights: [
      'Interactive Pipeline Funnel Analysis',
      'Quarterly Revenue & Quota Forecasting',
      'Rep Performance & Velocity Leaderboards'
    ],
    metric: '3.4x',
    metricLabel: 'Faster Deal Close Rate'
  },
  {
    id: 'enterprise-security',
    title: 'Enterprise Security',
    subtitle: 'Bank-grade compliance & RBAC',
    icon: <ShieldCheck className="w-5 h-5" />,
    tag: 'ENTERPRISE',
    description: 'Built for high-growth enterprises with granular role-based permissions, SOC2 Type II compliance, and end-to-end data encryption.',
    highlights: [
      'SOC2 Type II & GDPR Compliant Architecture',
      'Single Sign-On (SSO) & SCIM Provisioning',
      'Audit Logging & Advanced Access Controls'
    ],
    metric: '99.99%',
    metricLabel: 'Guaranteed Uptime SLA'
  }
];

export const PlatformPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const activeData = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="products" className="py-24 bg-slate-50/70 dark:bg-slate-900/60 relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/80 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">

        <div className="max-w-[1280px] mx-auto">
          
          {/* Centered Large Title with Generous Whitespace */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4"
            >
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Explore the Platform</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6"
            >
              Everything You Need to Scale <br className="hidden sm:inline" />
              <span className="text-blue-600 dark:text-blue-500">Enterprise Revenue</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-300"
            >
              Empower your sales team with AI-driven insights, automated deal tracking, and intuitive pipeline management built for modern high-performance organizations.
            </motion.p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-5 rounded-2xl transition-all duration-300 border flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xl shadow-blue-600/10 scale-[1.02]'
                      : 'bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {tab.icon}
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${isActive ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {tab.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {tab.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {tab.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Tab Preview Showcase Card */}
          <motion.div
            key={activeData.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/5 dark:shadow-slate-950/40 p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                <span>{activeData.tag} MODULE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                {activeData.title}
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {activeData.description}
              </p>

              <div className="space-y-3 mb-8">
                {activeData.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div>
                <a
                  href="#book-demo"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
                >
                  <span>Explore {activeData.title} features</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>


            {/* Right Metric Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col justify-between min-h-[260px] shadow-xl shadow-blue-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">PROVEN IMPACT</span>
                <div className="text-4xl sm:text-5xl font-black mt-4 mb-2 tracking-tight">
                  {activeData.metric}
                </div>
                <p className="text-sm font-medium text-blue-100">
                  {activeData.metricLabel}
                </p>
              </div>
              <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs text-blue-100 font-semibold">
                <span>Dezoryn Technologies Benchmark</span>
                <span className="flex items-center gap-1 text-white">
                  Live Enterprise Data
                </span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
