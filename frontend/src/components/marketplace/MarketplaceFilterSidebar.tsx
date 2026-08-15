import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Zap,
  Code2,
  Cloud,
  Smartphone,
  MessageSquare,
  Globe,
  Building2,
  DollarSign,
  Laptop,
  Check,
  MapPin,
  X
} from 'lucide-react';

export interface MarketplaceFilterState {
  industries: string[];
  businessSizes: string[];
  deployments: string[];
  maxPrice: number;
  pricingTypes: string[];
  platforms: string[];
  features: string[];
  aiPoweredOnly: boolean;
  apiAvailableOnly: boolean;
  cloudNativeOnly: boolean;
  mobileAppOnly: boolean;
  whatsAppIntegrationOnly: boolean;
  languages: string[];
  countries: string[];
}

export const INITIAL_FILTER_STATE: MarketplaceFilterState = {
  industries: [],
  businessSizes: [],
  deployments: [],
  maxPrice: 150,
  pricingTypes: [],
  platforms: [],
  features: [],
  aiPoweredOnly: false,
  apiAvailableOnly: false,
  cloudNativeOnly: false,
  mobileAppOnly: false,
  whatsAppIntegrationOnly: false,
  languages: [],
  countries: []
};

interface MarketplaceFilterSidebarProps {
  filters: MarketplaceFilterState;
  onFilterChange: (newFilters: MarketplaceFilterState) => void;
  onResetFilters: () => void;
  onCloseMobile?: () => void;
  activeCount: number;
}

export const MarketplaceFilterSidebar: React.FC<MarketplaceFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onCloseMobile,
  activeCount
}) => {
  // Accordion section collapse state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickToggles: true,
    price: true,
    industry: true,
    businessSize: false,
    deployment: false,
    platform: false,
    features: false,
    languages: false,
    country: false
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Helper for toggling item inside an array filter
  const toggleArrayFilter = (field: keyof MarketplaceFilterState, value: string) => {
    const currentList = (filters[field] as string[]) || [];
    const updated = currentList.includes(value)
      ? currentList.filter((v) => v !== value)
      : [...currentList, value];

    onFilterChange({ ...filters, [field]: updated });
  };

  const handleBooleanToggle = (field: keyof MarketplaceFilterState) => {
    onFilterChange({ ...filters, [field]: !filters[field] });
  };

  const handlePriceChange = (val: number) => {
    onFilterChange({ ...filters, maxPrice: val });
  };

  return (
    <aside className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 text-left select-none">
      
      {/* ── SIDEBAR HEADER & CLEAR BUTTON ── */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">Filters</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px]">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* ── 1. QUICK INTEGRATION TOGGLES (AI, API, Cloud, Mobile, WhatsApp) ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('quickToggles')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-500" /> Key Features & Tech
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.quickToggles ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.quickToggles && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 mt-3 overflow-hidden text-xs"
              >
                {/* AI Powered */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> AI Powered
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.aiPoweredOnly}
                    onChange={() => handleBooleanToggle('aiPoweredOnly')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                {/* API Available */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" /> API Available
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.apiAvailableOnly}
                    onChange={() => handleBooleanToggle('apiAvailableOnly')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                {/* Cloud Native */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <Cloud className="w-3.5 h-3.5 text-sky-400" /> Cloud Native
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.cloudNativeOnly}
                    onChange={() => handleBooleanToggle('cloudNativeOnly')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                {/* Mobile App */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Mobile App
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.mobileAppOnly}
                    onChange={() => handleBooleanToggle('mobileAppOnly')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                {/* WhatsApp Integration */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Integration
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.whatsAppIntegrationOnly}
                    onChange={() => handleBooleanToggle('whatsAppIntegrationOnly')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 2. PRICE RANGE SLIDER & PRICING TYPES ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Pricing & Budget
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.price && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Max Monthly Price:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{filters.maxPrice}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={filters.maxPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹0</span>
                    <span>₹75</span>
                    <span>₹150+</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {['Free Trial', 'Monthly', 'Annual Billed', 'Custom Enterprise'].map((type) => {
                    const isChecked = filters.pricingTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleArrayFilter('pricingTypes', type)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{type}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 3. INDUSTRY ACCORDION ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('industry')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" /> Industry Vertical
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.industry ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.industry && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {[
                  'Education & Academics',
                  'Healthcare & Telemedicine',
                  'HR & People Operations',
                  'Supply Chain & Logistics',
                  'Sales & Revenue Operations',
                  'Customer Relationship Management',
                  'Finance & Accounting',
                  'Manufacturing & Industrial',
                  'Real Estate & Property',
                  'Cybersecurity & Governance'
                ].map((ind) => {
                  const isChecked = filters.industries.includes(ind);
                  return (
                    <label
                      key={ind}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span className="truncate pr-2">{ind}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('industries', ind)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 4. BUSINESS SIZE ACCORDION ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('businessSize')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span>Business Size</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.businessSize ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.businessSize && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {['Startup (1-10)', 'SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'].map((size) => {
                  const isChecked = filters.businessSizes.includes(size);
                  return (
                    <label
                      key={size}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span>{size}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('businessSizes', size)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 5. DEPLOYMENT MODEL ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('deployment')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span>Deployment</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.deployment ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.deployment && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {['Cloud Hosted (SaaS)', 'On-Premise', 'Hybrid Cloud', 'Dedicated Private Cluster'].map((dep) => {
                  const isChecked = filters.deployments.includes(dep);
                  return (
                    <label
                      key={dep}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span>{dep}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('deployments', dep)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 6. PLATFORM ACCORDION ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('platform')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-cyan-500" /> Platform & OS
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.platform ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.platform && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App', 'Windows Desktop', 'macOS App'].map((plat) => {
                  const isChecked = filters.platforms.includes(plat);
                  return (
                    <label
                      key={plat}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span>{plat}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('platforms', plat)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 7. FEATURES ACCORDION ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span>Advanced Capabilities</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.features ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.features && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {[
                  'Single Sign-On (SSO)',
                  'Custom Webhooks & REST API',
                  'Multi-Currency & Tax Engine',
                  'Immutable Audit Trail Logs',
                  'Real-Time Telematics & GPS',
                  'Natural Language AI Query'
                ].map((feat) => {
                  const isChecked = filters.features.includes(feat);
                  return (
                    <label
                      key={feat}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span className="truncate pr-2">{feat}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('features', feat)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 8. LANGUAGES ACCORDION ── */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleSection('languages')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Languages
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.languages ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.languages && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {['English', 'Spanish', 'Hindi', 'German', 'French', 'Multi-Lingual'].map((lang) => {
                  const isChecked = filters.languages.includes(lang);
                  return (
                    <label
                      key={lang}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span>{lang}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('languages', lang)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 9. COUNTRY / REGION ACCORDION ── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('country')}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Country & Region
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections.country ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {openSections.country && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {['Global', 'India (GST Ready)', 'United States', 'European Union (GDPR)', 'Asia Pacific'].map((coun) => {
                  const isChecked = filters.countries.includes(coun);
                  return (
                    <label
                      key={coun}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <span className="truncate pr-2">{coun}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayFilter('countries', coun)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </aside>
  );
};

export default MarketplaceFilterSidebar;
