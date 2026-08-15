import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ChevronDown,
  GraduationCap,
  Building,
  Hotel,
  RefreshCw,
  AlertCircle,
  Info,
  InfoIcon
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import type { PricingPlan, PricingSource } from '../../types/pricing';
import { crmPricingApi, estatePricingApi, schoolycorePricingApi, schoolycoreLitePricingApi } from '../../services/pricing';
import { normalizeCrmPlan, normalizeEstatePlan, normalizeSchoolycorePlan, normalizeSchoolycoreLitePlan, formatPrice } from '../../utils/pricingAdapters';
import { PlanDetailsModal } from './PlanDetailsModal';

interface SourceOption {
  id: PricingSource;
  name: string;
  badge: string;
  icon: React.ReactNode;
  color: string;
  accentBg: string;
}

const PRICING_SOURCES: SourceOption[] = [
  {
    id: 'crm',
    name: 'Dezoryn CRM',
    badge: 'CRM PLATFORM',
    icon: <Zap className="w-5 h-5 text-blue-600 dark:text-cyan-400" />,
    color: 'text-blue-600 dark:text-cyan-400',
    accentBg: 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-400/30',
  },
  {
    id: 'estate',
    name: 'Real Estate OS',
    badge: 'PROPERTY ERP',
    icon: <Hotel className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    color: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-400/30',
  },
  {
    id: 'schoolycore',
    name: 'SchoolyCore ERP',
    badge: 'CAMPUS SUITE',
    icon: <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
    color: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-400/30',
  },
  {
    id: 'schoolycore-lite',
    name: 'SchoolyCore Lite',
    badge: 'LITE MODULE',
    icon: <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-400/30',
  },
];

export const PricingPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [pricingSource, setPricingSource] = useState<PricingSource>('crm');
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // API Data State
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Manual Retry Trigger State
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);
    setError(null);

    const loadPlans = async () => {
      try {
        let normalizedPlans: PricingPlan[] = [];

        if (pricingSource === 'crm') {
          const response = await crmPricingApi.getPlans(
            { isVisible: true },
            { signal: controller.signal }
          );
          if (response.data && Array.isArray(response.data)) {
            normalizedPlans = response.data.map(normalizeCrmPlan);
          }
        } else if (pricingSource === 'estate') {
          const response = await estatePricingApi.getPlans(
            { visibleOnWebsite: true, type: 'AGENT' },
            { signal: controller.signal }
          );
          if (response.data && Array.isArray(response.data)) {
            normalizedPlans = response.data.map(normalizeEstatePlan);
          }
        } else if (pricingSource === 'schoolycore') {
          const response = await schoolycorePricingApi.getPlans(
            { visibleOnWebsite: true, type: 'BUILDER' },
            { signal: controller.signal }
          );
          if (response.data && Array.isArray(response.data)) {
            normalizedPlans = response.data.map(normalizeSchoolycorePlan);
          }
        } else if (pricingSource === 'schoolycore-lite') {
          const response = await schoolycoreLitePricingApi.getPlans(
            {},
            { signal: controller.signal }
          );
          if (response.data && Array.isArray(response.data)) {
            normalizedPlans = response.data.map(normalizeSchoolycoreLitePlan);
          }
        }

        if (!controller.signal.aborted) {
          setPlans(normalizedPlans);
          setIsFetching(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (!controller.signal.aborted) {
          console.error(`Failed to fetch pricing plans for source [${pricingSource}]:`, err);
          setError(
            err instanceof Error
              ? err.message
              : `Failed to connect to ${pricingSource.toUpperCase()} backend pricing API.`
          );
          setIsFetching(false);
        }
      }
    };

    loadPlans();

    return () => {
      controller.abort();
    };
  }, [pricingSource, retryCount]);

  const activeSourceInfo = PRICING_SOURCES.find((s) => s.id === pricingSource) || PRICING_SOURCES[0];

  const faqs = [
    {
      q: 'Can I switch products or upgrade my plan later?',
      a: 'Yes! You can upgrade, downgrade, or add modules at any time. Prorated credits will be applied automatically to your invoice.',
    },
    {
      q: 'Is there a free trial available for each marketplace module?',
      a: 'Yes, we offer a 14-day full-featured free trial with no credit card required.',
    },
    {
      q: 'How does annual billing work?',
      a: 'Annual billing provides discounted yearly rates across configured pricing plans when paid upfront for a 12-month period.',
    },
    {
      q: 'Do you offer non-profit or educational institution discounts?',
      a: 'We offer special volume licensing and discounts for registered non-profits, schools, and healthcare institutions. Contact our sales team for details.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-cyan-500/10 dark:from-blue-600/15 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── HERO BANNER ── */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-4"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-pulse" />
            <span>TRANSPARENT MARKETPLACE PRICING</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            Simple, Predictable Plans for <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-blue-500 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
              Every Enterprise Module
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 font-normal"
          >
            Select a backend pricing source below to view live API pricing options.
          </motion.p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                !isAnnual
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                isAnnual
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
            </button>
          </div>
        </div>

        {/* ── BACKEND PRICING SOURCE SELECTOR TABS ── */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-14 flex-wrap">
          {PRICING_SOURCES.map((source) => {
            const isSelected = pricingSource === source.id;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => setPricingSource(source.id)}
                className={`px-5 py-3.5 rounded-2xl border flex items-center gap-3 transition duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-cyan-400 text-slate-900 dark:text-white shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/20 scale-105 font-extrabold'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${source.accentBg}`}>
                  {source.icon}
                </div>
                <div className="text-left">
                  <span className="text-xs block leading-snug">{source.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                    {source.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── PRICING CARDS / STATES ── */}
        {error && plans.length === 0 ? (
          /* API ERROR STATE */
          <div className="py-16 text-center bg-white dark:bg-slate-900/60 border border-red-200 dark:border-red-500/30 rounded-3xl p-8 sm:p-12 shadow-sm mb-20 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Unable to Load {activeSourceInfo.name} Plans
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Fetching</span>
            </button>
          </div>
        ) : plans.length === 0 && !isFetching ? (
          /* EMPTY STATE */
          <div className="py-16 text-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm mb-20 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Info className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Plans Available
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              There are currently no active plans returned by the {activeSourceInfo.name} service.
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          /* SUCCESSFUL DATA RENDERING (Always display cards continuously) */
          <div className={`grid grid-cols-1 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-8 mb-20 relative transition-opacity duration-300 ${isFetching ? 'opacity-75' : 'opacity-100'}`}>
            {plans.map((plan, idx) => {
              const rawPriceVal = isAnnual
                ? plan.yearlyPrice !== undefined
                  ? plan.yearlyPrice
                  : plan.monthlyPrice
                : plan.monthlyPrice;

              const priceDisplay = formatPrice(rawPriceVal, plan.currency || '₹');

              const periodDisplay = priceDisplay !== 'Custom'
                ? isAnnual
                  ? plan.yearlyPrice !== undefined
                    ? '/yr (billed annually)'
                    : '/month'
                  : '/month'
                : 'Billed Annually';

              return (
                <motion.div
                  key={plan.id || idx}
                  whileHover={{ y: -4 }}
                  className={`p-8 rounded-3xl border flex flex-col justify-between relative transition duration-300 ${
                    plan.isPopular
                      ? 'bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-blue-600 dark:border-cyan-400 shadow-xl dark:shadow-2xl shadow-blue-500/10 dark:shadow-cyan-500/25 scale-105'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                      MOST POPULAR
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
                        {activeSourceInfo.badge}
                      </span>
                    </div>

                    {plan.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        {plan.description}
                      </p>
                    )}

                    <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {priceDisplay}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                        {periodDisplay}
                      </span>
                    </div>

                    {/* Feature list */}
                    {plan.features.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                            <Check className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    {/* Main CTA */}
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo(plan.ctaAction === 'contact' ? '/contact-sales' : '/book-demo')
                      }
                      className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/30'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{plan.ctaLabel || 'Get Started'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* View Details API trigger */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className="w-full py-2 text-[11px] font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <InfoIcon className="w-3.5 h-3.5" />
                      <span>View Specifications</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── FEATURE MATRIX COMPARISON TABLE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 mb-20 shadow-xl overflow-x-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">
              FEATURE COMPARISON
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Full Module Capabilities
            </h3>
          </div>

          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">
                <th className="py-4 font-extrabold">Feature / Capability</th>
                <th className="py-4 font-extrabold text-center">Starter</th>
                <th className="py-4 font-extrabold text-center text-blue-600 dark:text-cyan-400">Professional</th>
                <th className="py-4 font-extrabold text-center text-violet-600 dark:text-violet-400">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-3.5 font-semibold">Real-Time Data Sync</td>
                <td className="py-3.5 text-center font-bold">Standard (5m)</td>
                <td className="py-3.5 text-center font-bold text-blue-600 dark:text-cyan-400">Instant (50ms)</td>
                <td className="py-3.5 text-center font-bold text-violet-600 dark:text-violet-400">Dedicated Stream</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">AI Lead & Demand Scoring</td>
                <td className="py-3.5 text-center">Basic</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ 50+ Signals</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ Custom Models</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">Multi-Currency & FX Sync</td>
                <td className="py-3.5 text-center text-slate-400">-</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ Included</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ Unlimited FX</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">SOC2 & GDPR Compliance</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ Included</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ Included</td>
                <td className="py-3.5 text-center text-emerald-600 font-bold">✓ Isolated Cluster</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">Guaranteed Support SLA</td>
                <td className="py-3.5 text-center">24 Hours</td>
                <td className="py-3.5 text-center font-bold">2 Hours</td>
                <td className="py-3.5 text-center font-bold text-emerald-600">&lt; 15 Minutes</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── PRICING FAQ ACCORDION ── */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Pricing FAQs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Common questions about licensing, trials, and billing</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer border-none bg-transparent"
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

        {/* ── CONVERSION CTA BANNER ── */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Need a Custom Enterprise Volume Quote?
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal">
            Our enterprise solutions team will build a tailored package with custom SLAs, dedicated infrastructure, and bulk seat discounts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('/contact-sales')}
              className="px-8 py-4 rounded-full bg-white text-blue-600 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2 border-none"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/book-demo')}
              className="px-8 py-4 rounded-full bg-slate-900 text-white font-extrabold text-sm shadow-xl hover:bg-slate-800 transition cursor-pointer border-none"
            >
              Book a Live Demo
            </button>
          </div>
        </div>

      </div>

      {/* Reusable Plan Detail Modal with Enforced 2.5s Loader */}
      <PlanDetailsModal
        planId={selectedPlanId}
        source={pricingSource}
        onClose={() => setSelectedPlanId(null)}
        onSelectPlan={(p) => {
          navigateTo(p.ctaAction === 'contact' ? '/contact-sales' : '/book-demo');
        }}
      />
    </div>
  );
};
