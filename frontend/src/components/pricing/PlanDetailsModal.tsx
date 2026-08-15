import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, Layers, Tag, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import type { PricingPlan, PricingSource } from '../../types/pricing';
import { crmPricingApi, estatePricingApi, schoolycorePricingApi, schoolycoreLitePricingApi } from '../../services/pricing';
import { normalizeCrmPlan, normalizeEstatePlan, normalizeSchoolycorePlan, normalizeSchoolycoreLitePlan, formatPrice } from '../../utils/pricingAdapters';

interface PlanDetailsModalProps {
  planId: string | null;
  source: PricingSource;
  onClose: () => void;
  onSelectPlan?: (plan: PricingPlan) => void;
}

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  planId,
  source,
  onClose,
  onSelectPlan,
}) => {
  const [detailPlan, setDetailPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setDetailPlan(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const startTime = Date.now();

    const fetchDetail = async () => {
      try {
        let normalized: PricingPlan;
        if (source === 'crm') {
          const res = await crmPricingApi.getPlanById(planId, { signal: controller.signal });
          normalized = normalizeCrmPlan(res.data);
        } else if (source === 'estate') {
          const res = await estatePricingApi.getPlanById(planId, { signal: controller.signal });
          normalized = normalizeEstatePlan(res.data);
        } else if (source === 'schoolycore') {
          const res = await schoolycorePricingApi.getPlanById(planId, { signal: controller.signal });
          normalized = normalizeSchoolycorePlan(res.data);
        } else {
          const res = await schoolycoreLitePricingApi.getPlanById(planId, { signal: controller.signal });
          normalized = normalizeSchoolycoreLitePlan(res.data);
        }

        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 4000 - elapsedTime); // 4.0 seconds loader timing

        setTimeout(() => {
          if (!controller.signal.aborted) {
            setDetailPlan(normalized);
            setLoading(false);
          }
        }, remainingDelay);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 4000 - elapsedTime);

        setTimeout(() => {
          if (!controller.signal.aborted) {
            setError(err instanceof Error ? err.message : 'Failed to fetch plan details');
            setLoading(false);
          }
        }, remainingDelay);
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [planId, source]);

  if (!planId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-xs font-black uppercase text-blue-600 dark:text-cyan-400">
                {source.toUpperCase()} DETAIL
              </span>
              {detailPlan?.type && (
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                  {detailPlan.type}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-blue-600 dark:text-cyan-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900 dark:text-white">Fetching Plan Specifications...</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading live data from {source.toUpperCase()} API service</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Unable to load details</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            ) : detailPlan ? (
              <>
                {/* Title & Description */}
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {detailPlan.name}
                  </h3>
                  {detailPlan.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {detailPlan.description}
                    </p>
                  )}
                </div>

                {/* Pricing summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Monthly Rate
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatPrice(detailPlan.monthlyPrice, detailPlan.currency || '₹')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Annual Rate
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatPrice(detailPlan.yearlyPrice, detailPlan.currency || '₹')}
                    </span>
                  </div>
                </div>

                {/* Plan Metadata Tags */}
                <div className="flex flex-wrap gap-3 pt-1">
                  {detailPlan.isActive !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Shield className="w-3.5 h-3.5" />
                      Status: {detailPlan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}

                  {detailPlan.isVisible !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Eye className="w-3.5 h-3.5" />
                      Visible: {detailPlan.isVisible ? 'Yes' : 'No'}
                    </span>
                  )}

                  {detailPlan.visibleOnWebsite !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      <Tag className="w-3.5 h-3.5" />
                      Website Display: {detailPlan.visibleOnWebsite ? 'Active' : 'Hidden'}
                    </span>
                  )}
                </div>

                {/* Features List */}
                {detailPlan.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Included Capabilities
                    </h4>
                    <div className="space-y-2">
                      {detailPlan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-blue-500/10 dark:bg-cyan-400/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SchoolyCore Lite Specific Fields */}
                {source === 'schoolycore-lite' && detailPlan.rolePermissions && detailPlan.rolePermissions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Role Permissions
                    </h4>
                    <div className="space-y-2">
                      {detailPlan.rolePermissions.map((rp, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="font-bold text-slate-900 dark:text-white">
                            Role: {rp.role || 'Default'}
                          </div>
                          {rp.permissions && rp.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 text-[11px]">
                              {rp.permissions.map((perm, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  {perm}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            {detailPlan && onSelectPlan && (
              <button
                type="button"
                onClick={() => {
                  onSelectPlan(detailPlan);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-extrabold shadow-md transition cursor-pointer"
              >
                {detailPlan.ctaLabel || 'Select Plan'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
