import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, Star, Sparkles,
  GripVertical, ArrowRight, Check, Store, Search,
  Layers, Layers3, AlertTriangle
} from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';

const API_PRICING = `${API_URL}/pricing`;
const API_PRODUCTS = `${API_URL}/products`;

const COLOR_THEMES = [
  { label: 'Blue', value: 'blue', gradient: 'from-blue-600 to-cyan-500', ring: 'ring-blue-500', badge: 'bg-blue-600' },
  { label: 'Violet', value: 'violet', gradient: 'from-violet-600 to-purple-500', ring: 'ring-violet-500', badge: 'bg-violet-600' },
  { label: 'Emerald', value: 'emerald', gradient: 'from-emerald-600 to-teal-500', ring: 'ring-emerald-500', badge: 'bg-emerald-600' },
  { label: 'Rose', value: 'rose', gradient: 'from-rose-600 to-pink-500', ring: 'ring-rose-500', badge: 'bg-rose-600' },
  { label: 'Amber', value: 'amber', gradient: 'from-amber-500 to-orange-500', ring: 'ring-amber-500', badge: 'bg-amber-500' },
  { label: 'Slate', value: 'slate', gradient: 'from-slate-600 to-slate-700', ring: 'ring-slate-500', badge: 'bg-slate-600' },
  { label: 'Indigo', value: 'indigo', gradient: 'from-indigo-600 to-blue-600', ring: 'ring-indigo-500', badge: 'bg-indigo-600' },
  { label: 'Cyan', value: 'cyan', gradient: 'from-cyan-500 to-blue-500', ring: 'ring-cyan-500', badge: 'bg-cyan-500' },
];

const getTheme = (val: string) => COLOR_THEMES.find(t => t.value === val) || COLOR_THEMES[0];

export interface PricingPlanData {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
  isHighlight: boolean;
  ribbon: string | null;
  colorTheme: string;
  order: number;
  isEnabled: boolean;
}

export interface ProductPricingTier {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
}

export interface ProductAdminItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  categoryLabel?: string;
  badge?: string;
  icon?: string;
  price: string;
  priceValue?: number;
  pricingType?: string;
  pricingTiers?: ProductPricingTier[];
  isEnabled?: boolean;
}

const EMPTY_GLOBAL: Omit<PricingPlanData, 'id'> = {
  name: '', price: '', description: '', features: [''],
  buttonText: 'Get Started', buttonUrl: '/book-demo',
  isHighlight: false, ribbon: '', colorTheme: 'blue',
  order: 0, isEnabled: true,
};

export const AdminPricingManager: React.FC = () => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'global'>('products');

  // Global Plans State
  const [plans, setPlans] = useState<PricingPlanData[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<{ id: string; name: string } | null>(null);
  const [globalModal, setGlobalModal] = useState<{ mode: 'create' | 'edit'; plan?: PricingPlanData } | null>(null);
  const [globalForm, setGlobalForm] = useState<Omit<PricingPlanData, 'id'>>(EMPTY_GLOBAL);
  const [newGlobalFeature, setNewGlobalFeature] = useState('');

  // Products CRM Pricing State
  const [products, setProducts] = useState<ProductAdminItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editProductModal, setEditProductModal] = useState<ProductAdminItem | null>(null);
  const [activeProductTierTab, setActiveProductTierTab] = useState<number>(0);

  // Common UI State
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Drag state for global plans
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // ── Fetch Methods ──
  const fetchGlobalPlans = async () => {
    try {
      const res = await apiFetch(API_PRICING);
      const data = await res.json();
      if (data.success) setPlans(data.data.sort((a: PricingPlanData, b: PricingPlanData) => a.order - b.order));
    } catch { /* silent */ }
    finally { setIsLoadingPlans(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiFetch(API_PRODUCTS);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch { /* silent */ }
    finally { setIsLoadingProducts(false); }
  };

  useEffect(() => {
    fetchGlobalPlans();
    fetchProducts();
  }, []);

  // ── Global Plan Handlers ──
  const openCreateGlobal = () => { setGlobalForm({ ...EMPTY_GLOBAL, order: plans.length }); setGlobalModal({ mode: 'create' }); };
  const openEditGlobal = (p: PricingPlanData) => {
    setGlobalForm({
      name: p.name, price: p.price, description: p.description,
      features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [''],
      buttonText: p.buttonText, buttonUrl: p.buttonUrl,
      isHighlight: p.isHighlight, ribbon: p.ribbon || '',
      colorTheme: p.colorTheme, order: p.order, isEnabled: p.isEnabled,
    });
    setGlobalModal({ mode: 'edit', plan: p });
  };
  const closeGlobalModal = () => { setGlobalModal(null); setNewGlobalFeature(''); };

  const handleSaveGlobal = async () => {
    if (!globalForm.name.trim() || !globalForm.price.trim() || !globalForm.description.trim()) {
      showMsg('error', 'Name, price and description are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...globalForm,
        ribbon: globalForm.ribbon?.trim() || null,
        features: globalForm.features.filter(f => f.trim()),
      };
      const url = globalModal?.mode === 'create' ? API_PRICING : `${API_PRICING}/${globalModal?.plan?.id}`;
      const method = globalModal?.mode === 'create' ? 'POST' : 'PUT';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        await fetchGlobalPlans();
        closeGlobalModal();
        showMsg('success', globalModal?.mode === 'create' ? 'Platform plan created!' : 'Platform plan updated!');
      }
    } catch { showMsg('error', 'Failed to save platform plan.'); }
    finally { setIsSaving(false); }
  };

  const handleConfirmDeleteGlobal = async () => {
    if (!deleteConfirmPlan) return;
    const { id, name } = deleteConfirmPlan;
    setIsDeletingPlan(true);
    try {
      await apiFetch(`${API_PRICING}/${id}`, { method: 'DELETE' });
      setPlans(prev => prev.filter(p => p.id !== id));
      showMsg('info', `"${name}" deleted successfully.`);
      setDeleteConfirmPlan(null);
    } catch {
      showMsg('error', 'Failed to delete plan.');
    } finally {
      setIsDeletingPlan(false);
    }
  };

  const handleToggleGlobal = async (id: string, name: string, cur: boolean) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
    try { await apiFetch(`${API_PRICING}/${id}/toggle-enabled`, { method: 'PATCH' }); }
    catch { setPlans(prev => prev.map(p => p.id === id ? { ...p, isEnabled: cur } : p)); }
    showMsg('success', `"${name}" ${!cur ? 'enabled' : 'disabled'}.`);
  };

  // Drag reorder global plans
  const handleDragStart = (i: number) => { dragItem.current = i; setDraggedIdx(i); };
  const handleDragEnter = (i: number) => { dragOver.current = i; setDropIdx(i); };
  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      setDraggedIdx(null); setDropIdx(null); return;
    }
    const updated = [...plans];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOver.current, 0, removed);
    const reordered = updated.map((p, idx) => ({ ...p, order: idx }));
    setPlans(reordered);
    dragItem.current = null; dragOver.current = null;
    setDraggedIdx(null); setDropIdx(null);
    try {
      await apiFetch(`${API_PRICING}/reorder`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map(p => p.id) }),
      });
      showMsg('success', 'Order saved!');
    } catch { /* silent */ }
  };

  // Global plan features
  const addGlobalFeature = () => {
    if (!newGlobalFeature.trim()) return;
    setGlobalForm(f => ({ ...f, features: [...f.features, newGlobalFeature.trim()] }));
    setNewGlobalFeature('');
  };
  const removeGlobalFeature = (i: number) => setGlobalForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const updateGlobalFeature = (i: number, v: string) => setGlobalForm(f => ({ ...f, features: f.features.map((feat, idx) => idx === i ? v : feat) }));

  // ── CRM Product Pricing Handlers ──
  const openEditProductPricing = (prod: ProductAdminItem) => {
    const existingTiers = Array.isArray(prod.pricingTiers) && prod.pricingTiers.length > 0
      ? prod.pricingTiers
      : [
          { name: 'Starter Tier', price: prod.price || '₹29', period: '/month', features: ['Core Feature Access', 'Standard Support'], ctaText: 'Start Free Trial' },
          { name: 'Pro Tier', price: '₹79', period: '/month', popular: true, features: ['Unlimited Access', '24/7 Priority Support'], ctaText: 'Start Free Trial' }
        ];

    setEditProductModal({
      ...prod,
      pricingTiers: existingTiers,
    });
    setActiveProductTierTab(0);
  };

  const handleSaveProductPricing = async () => {
    if (!editProductModal) return;
    setIsSaving(true);

    try {
      const payload = {
        price: editProductModal.price,
        priceValue: editProductModal.priceValue,
        pricingType: editProductModal.pricingType,
        pricingTiers: editProductModal.pricingTiers || [],
      };

      const res = await apiFetch(`${API_PRODUCTS}/${editProductModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === editProductModal.id ? { ...p, ...payload } : p));
        setEditProductModal(null);
        showMsg('success', `Pricing updated for ${editProductModal.title}!`);
      } else {
        showMsg('error', data.message || 'Failed to update product pricing.');
      }
    } catch {
      showMsg('error', 'Error updating product pricing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProductTier = () => {
    if (!editProductModal) return;
    const currentTiers = editProductModal.pricingTiers || [];
    const newTier: ProductPricingTier = {
      name: `Tier ${currentTiers.length + 1}`,
      price: '₹49',
      period: '/month',
      popular: false,
      features: ['Automated Workflow Engine', 'Dedicated API Integrations', '24/7 Priority Support'],
      ctaText: 'Get Started'
    };
    const updated = [...currentTiers, newTier];
    setEditProductModal({ ...editProductModal, pricingTiers: updated });
    setActiveProductTierTab(updated.length - 1);
  };

  const handleDeleteProductTier = (index: number) => {
    if (!editProductModal) return;
    const currentTiers = editProductModal.pricingTiers || [];
    if (currentTiers.length <= 1) {
      showMsg('info', 'At least one pricing tier must remain.');
      return;
    }
    const updated = currentTiers.filter((_, i) => i !== index);
    setEditProductModal({ ...editProductModal, pricingTiers: updated });
    setActiveProductTierTab(Math.max(0, index - 1));
  };

  const handleUpdateTierField = (index: number, field: keyof ProductPricingTier, value: any) => {
    if (!editProductModal) return;
    const updated = [...(editProductModal.pricingTiers || [])];
    if (!updated[index]) return;

    if (field === 'popular' && value === true) {
      updated.forEach((t, i) => { t.popular = i === index; });
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditProductModal({ ...editProductModal, pricingTiers: updated });
  };

  const handleAddTierFeature = (tierIndex: number, featureText: string) => {
    if (!editProductModal || !featureText.trim()) return;
    const updated = [...(editProductModal.pricingTiers || [])];
    if (!updated[tierIndex]) return;
    const feats = [...(updated[tierIndex].features || []), featureText.trim()];
    updated[tierIndex] = { ...updated[tierIndex], features: feats };
    setEditProductModal({ ...editProductModal, pricingTiers: updated });
  };

  const handleRemoveTierFeature = (tierIndex: number, featIndex: number) => {
    if (!editProductModal) return;
    const updated = [...(editProductModal.pricingTiers || [])];
    if (!updated[tierIndex]) return;
    const feats = updated[tierIndex].features.filter((_, i) => i !== featIndex);
    updated[tierIndex] = { ...updated[tierIndex], features: feats };
    setEditProductModal({ ...editProductModal, pricingTiers: updated });
  };

  const categories = [
    { id: 'all', label: 'All Products & CRMs' },
    { id: 'crm', label: 'CRM & Sales OS' },
    { id: 'erp', label: 'ERP & Operations' },
    { id: 'industry', label: 'Industry Verticals' },
    { id: 'ai', label: 'AI Intelligence' },
    { id: 'security', label: 'Security & Infrastructure' },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = !productSearch ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(productSearch.toLowerCase());

    const catClean = (p.category || '').toLowerCase();
    const matchesCat = selectedCategoryFilter === 'all' ||
      (selectedCategoryFilter === 'crm' && (catClean.includes('crm') || p.id.includes('crm'))) ||
      (selectedCategoryFilter === 'erp' && (catClean.includes('erp') || p.id.includes('hrms') || p.id.includes('inventory'))) ||
      (selectedCategoryFilter === 'industry' && (catClean.includes('industry') || p.id.includes('school') || p.id.includes('health') || p.id.includes('estate'))) ||
      (selectedCategoryFilter === 'ai' && (catClean.includes('ai') || p.id.includes('ai'))) ||
      (selectedCategoryFilter === 'security' && (catClean.includes('security') || p.id.includes('sec')));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 text-white shadow-xl shadow-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <IndianRupee className="w-3.5 h-3.5" />Central Pricing Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Pricing & Subscription Manager</h1>
          <p className="text-xs text-purple-100 max-w-2xl mt-1 leading-relaxed">
            Set and update pricing for all CRMs, ERPs, and platform subscription plans from one central place. All updates sync live instantly.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-white text-violet-700 shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>CRM & Product Plans ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'global'
                ? 'bg-white text-violet-700 shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5" />
            <span>Platform Subscription Tiers ({plans.length})</span>
          </button>
        </div>
      </div>

      {/* ── TOAST MESSAGES ── */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-3 shadow-md ${
              message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : message.type === 'error' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'}`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />{message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TAB 1: CRM & PRODUCT PRICING MANAGEMENT ── */}
      {activeTab === 'products' && (
        <div className="space-y-6">

          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Filter CRMs by name, industry, or ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              {productSearch && (
                <button type="button" onClick={() => setProductSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-semibold">Loading CRM & Product Pricing...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(prod => {
                const tiers = Array.isArray(prod.pricingTiers) ? prod.pricingTiers : [];

                return (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                          {prod.badge || prod.categoryLabel || 'SOFTWARE SUITE'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {tiers.length} Pricing Tiers
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                        {prod.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                        {prod.description || `Enterprise CRM platform engineered for ${prod.title}`}
                      </p>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Starting Display Price
                          </span>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            {prod.price || `From ₹${prod.priceValue || 49}/mo`}
                          </span>
                        </div>
                        {prod.pricingType && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                            {prod.pricingType}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Configured Subscription Plans
                        </span>
                        {tiers.length > 0 ? (
                          tiers.slice(0, 3).map((t, tIdx) => (
                            <div key={tIdx} className="flex items-center justify-between text-xs font-semibold p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
                              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold truncate">
                                {t.popular && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                                {t.name}
                              </span>
                              <span className="text-violet-600 dark:text-violet-400 font-black shrink-0">
                                {t.price}
                                <span className="text-[10px] font-normal text-slate-400">{t.period || '/mo'}</span>
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 italic p-2">No custom tiers added yet</div>
                        )}
                        {tiers.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 pl-1">+{tiers.length - 3} more plans</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditProductPricing(prod)}
                      className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit CRM Pricing & Plans</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: GLOBAL PLATFORM SUBSCRIPTIONS MANAGEMENT ── */}
      {activeTab === 'global' && (
        <div className="space-y-6">

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 px-1">
              <GripVertical className="w-4 h-4" />
              <span>Drag the grip handle to reorder global subscription plans</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold">
                {plans.filter(p => p.isEnabled).length} active / {plans.length} total
              </span>
              <button
                type="button"
                onClick={openCreateGlobal}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />Add Platform Plan
              </button>
            </div>
          </div>

          {isLoadingPlans ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading platform plans...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {plans.map((plan, index) => {
                  const theme = getTheme(plan.colorTheme);
                  return (
                    <motion.div key={plan.id} layout
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                      className={`group relative flex flex-col rounded-2xl border overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                        !plan.isEnabled ? 'opacity-50' :
                        draggedIdx === index ? 'opacity-40 scale-[0.97]' :
                        dropIdx === index && draggedIdx !== index ? 'border-violet-400 shadow-lg shadow-violet-500/15' :
                        plan.isHighlight
                          ? 'border-transparent shadow-xl shadow-violet-500/20 bg-white dark:bg-slate-900'
                          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                      }`}>

                      {plan.isHighlight && (
                        <div className={`absolute inset-0 rounded-2xl ring-2 ${theme.ring} pointer-events-none`} />
                      )}

                      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                      {plan.ribbon && (
                        <div className={`absolute top-5 right-0 px-3 py-1 text-[10px] font-black text-white ${theme.badge} rounded-l-lg shadow-md`}>
                          {plan.ribbon}
                        </div>
                      )}

                      <div className="p-5 flex flex-col gap-4 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0`}>
                              <IndianRupee className="w-4 h-4 text-white" />
                            </div>
                            {plan.isHighlight && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition shrink-0 mt-0.5">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">{plan.name}</h3>
                          <div className={`text-2xl font-black bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                            {plan.price}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{plan.description}</p>
                        </div>

                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex-1">
                            {plan.features.slice(0, 4).map((f, i) => (
                              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                                <Check className={`w-3.5 h-3.5 shrink-0 bg-gradient-to-br ${theme.gradient} rounded-full p-0.5 text-white`} />
                                <span className="truncate">{f}</span>
                              </div>
                            ))}
                            {plan.features.length > 4 && (
                              <span className="text-[10px] font-bold text-slate-400">+{plan.features.length - 4} more</span>
                            )}
                          </div>
                        )}

                        <div className={`w-full py-2 rounded-xl text-[11px] font-extrabold text-center text-white bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-1.5`}>
                          {plan.buttonText}<ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 left-3 flex items-center gap-1.5">
                        <button type="button" onClick={() => openEditGlobal(plan)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50 cursor-pointer transition">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleToggleGlobal(plan.id, plan.name, plan.isEnabled)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 cursor-pointer transition">
                          {plan.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button type="button" onClick={() => setDeleteConfirmPlan({ id: plan.id, name: plan.name })}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 cursor-pointer transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!plan.isEnabled && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-extrabold">Hidden</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <motion.button type="button" onClick={openCreateGlobal} layout
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-700 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all min-h-[220px] cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold">Add Platform Plan</span>
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* ── CRM PRODUCT PRICING EDIT MODAL ── */}
      <AnimatePresence>
        {editProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">

              <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-violet-500" />
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Edit Pricing & Subscription Plans: {editProductModal.title}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set base starting prices and configure individual subscription plan tiers for this CRM.
                  </p>
                </div>
                <button type="button" onClick={() => setEditProductModal(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Section A: Base Display Price Settings */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                    Base CRM Display Price
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Display Label *</label>
                      <input
                        type="text"
                        value={editProductModal.price}
                        onChange={e => setEditProductModal({ ...editProductModal, price: e.target.value })}
                        placeholder="e.g. From ₹29/mo"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Numeric Value (₹)</label>
                      <input
                        type="number"
                        value={editProductModal.priceValue ?? 0}
                        onChange={e => setEditProductModal({ ...editProductModal, priceValue: parseFloat(e.target.value) || 0 })}
                        placeholder="29"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Billing Frequency</label>
                      <select
                        value={editProductModal.pricingType || 'Monthly'}
                        onChange={e => setEditProductModal({ ...editProductModal, pricingType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none cursor-pointer"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Annual">Annual</option>
                        <option value="Free Trial">Free Trial</option>
                        <option value="Custom">Custom Quote</option>
                        <option value="One-Time">One-Time License</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Multi-Tier Pricing Plans Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-violet-500" />
                        CRM Subscription Plan Tiers
                      </h3>
                      <p className="text-xs text-slate-500">Configure different pricing plans (e.g. Starter, Growth, Enterprise) for this CRM.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddProductTier}
                      className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pricing Tier</span>
                    </button>
                  </div>

                  {/* Tier Sub-Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
                    {(editProductModal.pricingTiers || []).map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveProductTierTab(idx)}
                        className={`px-4 py-2 rounded-t-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 border-b-2 ${
                          activeProductTierTab === idx
                            ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {t.popular && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        <span>{t.name || `Tier ${idx + 1}`}</span>
                        <span className="text-[10px] font-normal text-slate-400">({t.price})</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Tier Form Editor */}
                  {editProductModal.pricingTiers && editProductModal.pricingTiers[activeProductTierTab] && (() => {
                    const currentTier = editProductModal.pricingTiers[activeProductTierTab];
                    const tIdx = activeProductTierTab;

                    return (
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                            Editing Tier #{tIdx + 1}: {currentTier.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProductTier(tIdx)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Tier</span>
                          </button>
                        </div>

                        {/* Tier Name, Price, Period */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Plan Tier Name *</label>
                            <input
                              type="text"
                              value={currentTier.name}
                              onChange={e => handleUpdateTierField(tIdx, 'name', e.target.value)}
                              placeholder="e.g. Starter CRM"
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Price Display *</label>
                            <input
                              type="text"
                              value={currentTier.price}
                              onChange={e => handleUpdateTierField(tIdx, 'price', e.target.value)}
                              placeholder="e.g. ₹29 or Custom"
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Billing Period</label>
                            <input
                              type="text"
                              value={currentTier.period || '/month'}
                              onChange={e => handleUpdateTierField(tIdx, 'period', e.target.value)}
                              placeholder="e.g. /month"
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                            />
                          </div>
                        </div>

                        {/* CTA Text + Popular Toggle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Button CTA Label</label>
                            <input
                              type="text"
                              value={currentTier.ctaText || 'Get Started'}
                              onChange={e => handleUpdateTierField(tIdx, 'ctaText', e.target.value)}
                              placeholder="e.g. Start 14-Day Free Trial"
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 self-end">
                            <div>
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                Highlight / Popular Badge
                              </p>
                              <p className="text-[10px] text-slate-500">Show as featured tier for this CRM</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateTierField(tIdx, 'popular', !currentTier.popular)}
                              className={`w-11 h-6 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 flex items-center ${
                                currentTier.popular ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                              }`}
                            >
                              <motion.span
                                layout
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none"
                              />
                            </button>
                          </div>
                        </div>

                        {/* Feature Bullet List */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block">Plan Capabilities / Features List</label>
                          <div className="space-y-2">
                            {(currentTier.features || []).map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={feat}
                                  onChange={e => {
                                    const updated = [...(editProductModal.pricingTiers || [])];
                                    const feats = [...(updated[tIdx].features || [])];
                                    feats[fIdx] = e.target.value;
                                    updated[tIdx] = { ...updated[tIdx], features: feats };
                                    setEditProductModal({ ...editProductModal, pricingTiers: updated });
                                  }}
                                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTierFeature(tIdx, fIdx)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              id={`new-feature-input-${tIdx}`}
                              placeholder="Add feature item..."
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleAddTierFeature(tIdx, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(`new-feature-input-${tIdx}`) as HTMLInputElement;
                                if (el && el.value) {
                                  handleAddTierFeature(tIdx, el.value);
                                  el.value = '';
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />Add Feature
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setEditProductModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductPricing}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-violet-600/25"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save CRM Pricing Changes</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CREATE / EDIT GLOBAL PLATFORM PLAN MODAL ── */}
      <AnimatePresence>
        {globalModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">

              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-violet-500" />
                  {globalModal.mode === 'create' ? 'Create Platform Subscription Plan' : 'Edit Platform Subscription Plan'}
                </h2>
                <button type="button" onClick={closeGlobalModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Plan Name *</label>
                    <input type="text" value={globalForm.name} onChange={e => setGlobalForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Professional"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Price *</label>
                    <input type="text" value={globalForm.price} onChange={e => setGlobalForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. ₹5,999/mo or Custom"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Description *</label>
                  <textarea value={globalForm.description} onChange={e => setGlobalForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Plan description..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Button Text</label>
                    <input type="text" value={globalForm.buttonText} onChange={e => setGlobalForm(f => ({ ...f, buttonText: e.target.value }))}
                      placeholder="e.g. Get Started"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Button URL</label>
                    <input type="text" value={globalForm.buttonUrl} onChange={e => setGlobalForm(f => ({ ...f, buttonUrl: e.target.value }))}
                      placeholder="e.g. /book-demo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Ribbon Label</label>
                    <input type="text" value={globalForm.ribbon || ''} onChange={e => setGlobalForm(f => ({ ...f, ribbon: e.target.value }))}
                      placeholder="e.g. Most Popular"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Order</label>
                    <input type="number" min={0} value={globalForm.order} onChange={e => setGlobalForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_THEMES.map(t => (
                      <button key={t.value} type="button" onClick={() => setGlobalForm(f => ({ ...f, colorTheme: t.value }))}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black text-white bg-gradient-to-r ${t.gradient} transition cursor-pointer border-2 ${globalForm.colorTheme === t.value ? 'border-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Features</label>
                  <div className="space-y-2">
                    {globalForm.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="text" value={feat} onChange={e => updateGlobalFeature(idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}`}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
                        <button type="button" onClick={() => removeGlobalFeature(idx)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" value={newGlobalFeature} onChange={e => setNewGlobalFeature(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addGlobalFeature()}
                      placeholder="Add feature... (Enter)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
                    <button type="button" onClick={addGlobalFeature} className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />Highlight Plan
                      </p>
                      <p className="text-[11px] text-slate-500">Featured with ring & star badge</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGlobalForm(f => ({ ...f, isHighlight: !f.isHighlight }))}
                      className={`w-11 h-6 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 flex items-center ${
                        globalForm.isHighlight ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none"
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />Enabled
                      </p>
                      <p className="text-[11px] text-slate-500">Show on pricing page</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGlobalForm(f => ({ ...f, isEnabled: !f.isEnabled }))}
                      className={`w-11 h-6 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 flex items-center ${
                        globalForm.isEnabled ? 'bg-violet-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                <button type="button" onClick={closeGlobalModal} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveGlobal} disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-violet-600/25">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {globalModal.mode === 'create' ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Custom Delete Plan Confirmation Modal ── */}
      <AnimatePresence>
        {deleteConfirmPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingPlan && setDeleteConfirmPlan(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 text-slate-900 dark:text-white shadow-2xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[70px] pointer-events-none" />

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400">
                    PERMANENT DELETION
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    Delete Platform Plan?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                    Are you sure you want to delete platform plan <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirmPlan.name}"</span>?
                    This will permanently remove it from the pricing matrix.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 relative z-10">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmPlan(null)}
                  disabled={isDeletingPlan}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteGlobal}
                  disabled={isDeletingPlan}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-2 border-none"
                >
                  {isDeletingPlan ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Plan</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPricingManager;
