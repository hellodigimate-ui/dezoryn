import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Zap,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Trash2,
  Building2,
  DollarSign,
  Cloud,
  Smartphone,
  ShieldCheck,
  Database,
  Headphones,
  Code2,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { MarketplaceProduct } from './MarketplacePage';
import { useNavigation } from '../../utils/NavigationContext';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: MarketplaceProduct[];
  allProducts: MarketplaceProduct[];
  onRemoveProduct: (productId: string) => void;
  onAddProduct: (product: MarketplaceProduct) => void;
  onClearAll: () => void;
}

interface ComparisonRow {
  key: string;
  label: string;
  icon: React.ReactNode;
  getValue: (p: MarketplaceProduct) => string | React.ReactNode;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  onRemoveProduct,
  onAddProduct,
  onClearAll
}) => {
  const { navigateTo } = useNavigation();
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);
  const [addingSlotIdx, setAddingSlotIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  // Comparison Criteria Rows Definition
  const COMPARISON_ROWS: ComparisonRow[] = [
    {
      key: 'pricing',
      label: 'Starting Price',
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
      getValue: (p) => (
        <div className="font-extrabold text-slate-900 dark:text-white text-base">
          {p.price || '₹3,999/mo'}
          <div className="text-[10px] text-slate-400 font-medium">Billed Monthly</div>
        </div>
      )
    },
    {
      key: 'industry',
      label: 'Industry Vertical',
      icon: <Building2 className="w-4 h-4 text-blue-500" />,
      getValue: (p) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {p.industry || p.categoryLabel}
        </span>
      )
    },
    {
      key: 'deployment',
      label: 'Deployment Model',
      icon: <Cloud className="w-4 h-4 text-sky-400" />,
      getValue: (p) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {Array.isArray(p.deployment) ? p.deployment.join(', ') : 'Cloud Hosted (SaaS)'}
        </span>
      )
    },
    {
      key: 'aiFeatures',
      label: 'AI Capabilities',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      getValue: (p) => (
        <div className="flex items-center gap-1.5 font-bold">
          {p.aiPowered ? (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Autonomous AI Agents & Copilot</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs font-medium">Standard Automation</span>
          )}
        </div>
      )
    },
    {
      key: 'integrations',
      label: 'Integrations & API',
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
      getValue: (p) => (
        <div className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {p.apiAvailable && (
            <div className="flex items-center gap-1 text-purple-400">
              <Check className="w-3.5 h-3.5" /> REST & GraphQL API
            </div>
          )}
          {p.whatsAppIntegration && (
            <div className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3.5 h-3.5" /> WhatsApp Business API
            </div>
          )}
          <div className="text-[11px] text-slate-400">Webhooks, SAML 2.0, Okta SSO</div>
        </div>
      )
    },
    {
      key: 'mobileApp',
      label: 'Mobile Companion Apps',
      icon: <Smartphone className="w-4 h-4 text-emerald-500" />,
      getValue: (p) => (
        <div className="flex items-center gap-1 font-bold text-xs">
          {p.mobileApp ? (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              iOS & Android Mobile Apps
            </span>
          ) : (
            <span className="text-slate-400">Web Browser Responsive Only</span>
          )}
        </div>
      )
    },
    {
      key: 'support',
      label: 'Support SLA',
      icon: <Headphones className="w-4 h-4 text-amber-500" />,
      getValue: () => (
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="font-extrabold text-slate-900 dark:text-white">24x7 Enterprise Support</div>
          <div className="text-[10px] text-slate-400">15-Min Response Guarantee & Dedicated Account Lead</div>
        </div>
      )
    },
    {
      key: 'storage',
      label: 'Cloud Storage & Backups',
      icon: <Database className="w-4 h-4 text-indigo-400" />,
      getValue: (p) => (
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {p.id === 'dezo-sec-vault' ? 'Unlimited Encrypted Audit Vault' : '500 GB Encrypted Storage / tenant'}
        </span>
      )
    },
    {
      key: 'security',
      label: 'Security & Compliance',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      getValue: () => (
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 space-y-0.5">
          <div className="text-emerald-500 font-extrabold">SOC 2 Type II Certified</div>
          <div className="text-[11px] text-slate-400">GDPR Compliant • AES-256 Encryption</div>
        </div>
      )
    },
    {
      key: 'features',
      label: 'Core Capabilities',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      getValue: (p) => (
        <div className="space-y-1.5 text-xs text-left">
          {Array.isArray(p.features) && p.features.slice(0, 4).map((f, fIdx) => (
            <div key={fIdx} className="flex items-start gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      )
    }
  ];

  // Helper to check if a row differs across selected products
  const isRowDifferent = (row: ComparisonRow): boolean => {
    if (selectedProducts.length <= 1) return false;
    const values = selectedProducts.map((p) => {
      if (row.key === 'pricing') return p.price;
      if (row.key === 'industry') return p.industry || p.categoryLabel;
      if (row.key === 'aiFeatures') return p.aiPowered;
      if (row.key === 'mobileApp') return p.mobileApp;
      if (row.key === 'deployment') return (p.deployment || []).join(',');
      return p.id;
    });
    return new Set(values).size > 1;
  };

  // Products available to add into empty slots
  const availableToAdd = allProducts.filter(
    (p) => !selectedProducts.some((sp) => sp.id === p.id)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10 text-left"
        >
          {/* ── MODAL HEADER ── */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-300">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Product Comparison Engine</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-extrabold">
                    {selectedProducts.length} / 3 Selected
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Side-by-side feature matrix & specification comparison
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Highlight Differences Toggle */}
              <button
                type="button"
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 border ${
                  highlightDifferences
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${highlightDifferences ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Highlight Differences</span>
              </button>

              {selectedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-3 py-2 rounded-xl text-xs font-extrabold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                >
                  Clear All
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── COMPARISON MATRIX TABLE CONTAINER ── */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6 custom-scrollbar">
            
            {selectedProducts.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-cyan-300">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Products Selected for Comparison</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Select up to 3 software products from the marketplace catalog to compare pricing, features, deployment, and security specs side by side.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Browse Marketplace Products
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse min-w-[700px]">
                {/* ── TABLE HEADER (PRODUCT CARDS SLOTS) ── */}
                <thead>
                  <tr>
                    {/* Sticky Label Header Column */}
                    <th className="sticky left-0 bg-white dark:bg-slate-900 z-20 p-4 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-400 uppercase tracking-wider w-56 text-left">
                      Comparison Criteria
                    </th>

                    {/* 3 Product Slot Columns */}
                    {[0, 1, 2].map((slotIdx) => {
                      const prod = selectedProducts[slotIdx];

                      return (
                        <th key={slotIdx} className="p-4 border-b border-slate-200 dark:border-slate-800 text-left align-top min-w-[240px]">
                          {prod ? (
                            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 relative group">
                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => onRemoveProduct(prod.id)}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-500 transition cursor-pointer"
                                title="Remove from comparison"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <span className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                                {prod.tag || prod.category}
                              </span>

                              <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 mb-1 line-clamp-1">
                                {prod.title}
                              </h4>

                              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mb-3">
                                {prod.price}
                              </div>

                              <button
                                type="button"
                                onClick={() => { onClose(); navigateTo('/book-demo'); }}
                                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1 border-none"
                              >
                                <span>Book Demo</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setAddingSlotIdx(addingSlotIdx === slotIdx ? null : slotIdx)}
                                className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 flex flex-col items-center justify-center p-4 text-center text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 transition cursor-pointer"
                              >
                                <Plus className="w-6 h-6 mb-1" />
                                <span className="text-xs font-extrabold">Add Product to Slot {slotIdx + 1}</span>
                              </button>

                              {/* Slot Selector Dropdown */}
                              {addingSlotIdx === slotIdx && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-30 p-2 max-h-56 overflow-y-auto">
                                  {availableToAdd.length === 0 ? (
                                    <div className="p-3 text-xs text-slate-400 font-semibold">No more products to add</div>
                                  ) : (
                                    availableToAdd.map((avail) => (
                                      <button
                                        key={avail.id}
                                        type="button"
                                        onClick={() => {
                                          onAddProduct(avail);
                                          setAddingSlotIdx(null);
                                        }}
                                        className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700/80 transition cursor-pointer flex items-center justify-between text-xs"
                                      >
                                        <span className="font-bold text-slate-900 dark:text-white truncate">{avail.title}</span>
                                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-300 shrink-0 ml-2">{avail.price}</span>
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* ── TABLE BODY (COMPARISON ROWS) ── */}
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {COMPARISON_ROWS.map((row) => {
                    const isDifferent = isRowDifferent(row);
                    const isHighlighted = highlightDifferences && isDifferent;

                    return (
                      <tr
                        key={row.key}
                        className={`transition-colors ${
                          isHighlighted
                            ? 'bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-l-amber-400'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Sticky Left Criteria Title */}
                        <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 font-extrabold text-slate-900 dark:text-white text-xs border-r border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            {row.icon}
                            <span>{row.label}</span>
                            {isHighlighted && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                                Differs
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3 Product Values */}
                        {[0, 1, 2].map((slotIdx) => {
                          const prod = selectedProducts[slotIdx];
                          return (
                            <td key={slotIdx} className="p-4 text-xs align-top">
                              {prod ? row.getValue(prod) : <span className="text-slate-400 font-mono text-[10px]">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

          </div>

          {/* ── MODAL FOOTER ── */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Dezoryn Software EcoSystem • Side-by-Side Comparison</span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold transition cursor-pointer"
            >
              Done Comparing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductCompareModal;
