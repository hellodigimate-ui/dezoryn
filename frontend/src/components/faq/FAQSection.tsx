import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ChevronDown, Sparkles, Search, MessageSquare, ArrowRight,
  RefreshCw
} from 'lucide-react';

import { useNavigation } from '../../utils/NavigationContext';

import { API_URL, apiFetch } from '../../config/api.config';

const API = `${API_URL}/faqs`;


export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: string;
  isEnabled: boolean;
}

const FALLBACK_FAQS: FAQItem[] = [
  {
    id: 'f1',
    question: 'What is Dezoryn Autonomous CRM & ERP?',
    answer: 'Dezoryn is an enterprise-grade AI operating system unifying CRM, lead scoring, workflow automation, and predictive analytics into a single high-performance platform.',
    category: 'Platform',
    order: 0,
    status: 'active',
    isEnabled: true,
  },
  {
    id: 'f2',
    question: 'How fast can we integrate Dezoryn with our existing workflow?',
    answer: 'Deployment typically takes under 48 hours. Dezoryn features 100+ native connectors for Salesforce, HubSpot, SAP, WhatsApp API, and custom REST/GraphQL endpoints.',
    category: 'Integration',
    order: 1,
    status: 'active',
    isEnabled: true,
  },
  {
    id: 'f3',
    question: 'Is enterprise customer data secure and compliant?',
    answer: 'Yes. Dezoryn complies with SOC 2 Type II, GDPR, CCPA, and HIPAA requirements. All data is encrypted at rest (AES-256) and in transit (TLS 1.3) with full RBAC audit logs.',
    category: 'Security',
    order: 2,
    status: 'active',
    isEnabled: true,
  },
  {
    id: 'f4',
    question: 'Can we customize our subscription tier or request custom SLA?',
    answer: 'Absolutely. We offer tailored Enterprise plans with dedicated SLA guarantees, custom cloud VPC isolation, hardware acceleration, and dedicated solutions engineering.',
    category: 'Pricing',
    order: 3,
    status: 'active',
    isEnabled: true,
  },
  {
    id: 'f5',
    question: 'Does Dezoryn provide 24/7 technical support?',
    answer: 'Yes. Enterprise accounts receive dedicated account managers, 24/7/365 priority email & phone support, and 15-minute response SLA guarantees.',
    category: 'General',
    order: 4,
    status: 'active',
    isEnabled: true,
  },
];

export const FAQSection: React.FC = () => {
  const { navigateTo } = useNavigation();

  const [faqs, setFaqs] = useState<FAQItem[]>(FALLBACK_FAQS);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const sorted = data.data.sort((a: FAQItem, b: FAQItem) => a.order - b.order);
        setFaqs(sorted);
        if (sorted.length > 0) {
          setOpenId(sorted[0].id);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
    window.addEventListener('focus', fetchFaqs);
    return () => window.removeEventListener('focus', fetchFaqs);
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map(item => item.category)))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCat = activeCategory === 'All' || faq.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="faq" className="py-20 md:py-28 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      {/* Background Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Badge & Titles */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-xs font-black tracking-widest uppercase shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Knowledge Base & Support</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">Questions</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Have questions about Dezoryn CRM, AI automation, pricing, or custom integrations? Find instant answers below or reach out to our team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions (e.g. security, pricing, API)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Accordions List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {loading ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Fetching latest FAQs...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-cyan-500/60" />
              <p className="text-base font-black text-slate-900 dark:text-slate-200">No FAQs available till now</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Please check back further for future updates or contact technical support!</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No matching questions found</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try clearing your search query or switching categories.</p>
            </div>
          ) : (
            filteredFaqs.map(faq => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-slate-900 border-cyan-500/50 dark:border-cyan-500/40 shadow-xl shadow-cyan-500/5'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Question Header */}
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`p-2 rounded-xl border transition-transform duration-300 shrink-0 ${
                      isOpen
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 rotate-180'
                        : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expandable Answer Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium border-t border-slate-100 dark:border-slate-800/50">
                          <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Support Callout Box */}
        <div className="mt-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Still have questions?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Can't find the answer you're looking for? Speak directly with our solution architects.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('/contact-sales')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer border-none"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/book-demo')}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer border-none"
            >
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
