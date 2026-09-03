import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Trash2, Edit3, Copy, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, Star,
  LayoutGrid, List, Search, ChevronDown,
  Zap, Bot, TrendingUp, ShieldCheck, Globe, Layers,
  BarChart3, Lock, Database, Cpu, Wifi, Cloud, Sparkles, AlertTriangle, Upload
} from 'lucide-react';
import { openAdminAIAssistant } from './AdminLayout';

import { API_URL, apiFetch } from '../../config/api.config';

const API = `${API_URL}/products`;


const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Bot, TrendingUp, ShieldCheck, Globe, Layers,
  BarChart3, Lock, Database, Cpu, Wifi, Cloud, Package, Star,
};

const GRADIENT_PRESETS = [
  { label: 'Blue → Cyan', value: 'from-blue-600 to-cyan-500' },
  { label: 'Indigo → Purple', value: 'from-indigo-600 to-purple-500' },
  { label: 'Emerald → Teal', value: 'from-emerald-600 to-teal-500' },
  { label: 'Rose → Pink', value: 'from-rose-600 to-pink-500' },
  { label: 'Amber → Orange', value: 'from-amber-500 to-orange-500' },
  { label: 'Violet → Fuchsia', value: 'from-violet-600 to-fuchsia-500' },
  { label: 'Slate → Blue', value: 'from-slate-600 to-blue-600' },
  { label: 'Cyan → Blue', value: 'from-cyan-500 to-blue-600' },
];

const CATEGORIES = ['core', 'automation', 'analytics', 'security', 'integration', 'platform'];

export interface ProductData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  features: string[];
  image: string | null;
  order: number;
  status: string;
  category: string;
  isEnabled: boolean;
  createdAt: string;
}

const EMPTY_PRODUCT: Omit<ProductData, 'id' | 'createdAt'> = {
  title: '', subtitle: '', description: '',
  icon: 'Zap', gradient: 'from-blue-600 to-cyan-500',
  features: [''], image: null, order: 0,
  status: 'active', category: 'core', isEnabled: true,
};

export const AdminProductManager: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<{ id: string; title: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modal state
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; product?: ProductData } | null>(null);
  const [form, setForm] = useState<Omit<ProductData, 'id' | 'createdAt'>>(EMPTY_PRODUCT);
  const [newFeature, setNewFeature] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // ── Fetch ────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success) setProducts(data.data.sort((a: ProductData, b: ProductData) => a.order - b.order));
    } catch { /* fallback */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Open Modal ───────────────────────────────
  const openCreate = () => {
    setForm({ ...EMPTY_PRODUCT, order: products.length });
    setNewFeature('');
    setModal({ mode: 'create' });
  };

  const openEdit = (product: ProductData) => {
    setForm({
      title: product.title,
      subtitle: product.subtitle || '',
      description: product.description,
      icon: product.icon || 'Zap',
      gradient: product.gradient || 'from-blue-600 to-cyan-500',
      features: product.features.length ? product.features : [''],
      image: product.image,
      order: product.order,
      status: product.status,
      category: product.category,
      isEnabled: product.isEnabled,
    });
    setNewFeature('');
    setModal({ mode: 'edit', product });
  };

  const closeModal = () => { setModal(null); setNewFeature(''); };

  // ── Save ─────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showMsg('error', 'Title and description are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features.filter(f => f.trim() !== ''),
      };
      const url = modal?.mode === 'create' ? API : `${API}/${modal?.product?.id}`;
      const method = modal?.mode === 'create' ? 'POST' : 'PUT';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        closeModal();
        showMsg('success', modal?.mode === 'create' ? 'Product created!' : 'Product updated!');
      } else {
        showMsg('error', data.message || 'Failed to save product.');
      }
    } catch { showMsg('error', 'Failed to save product.'); }
    finally { setIsSaving(false); }
  };

  // ── Delete ───────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProduct) return;
    const { id, title } = deleteConfirmProduct;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showMsg('info', `"${title}" deleted successfully.`);
        setDeleteConfirmProduct(null);
      } else {
        showMsg('error', data.message || 'Failed to delete product.');
      }
    } catch {
      showMsg('error', 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Duplicate ────────────────────────────────
  const handleDuplicate = async (id: string, title: string) => {
    try {
      const res = await apiFetch(`${API}/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        showMsg('success', `"${title}" duplicated!`);
      }
    } catch { showMsg('error', 'Failed to duplicate.'); }
  };

  // ── Toggle Enable ─────────────────────────────
  const handleToggleEnabled = async (id: string, title: string, current: boolean) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
    try {
      await apiFetch(`${API}/${id}/toggle-enabled`, { method: 'PATCH' });
      showMsg('success', `"${title}" ${!current ? 'enabled' : 'disabled'}.`);
    } catch { setProducts(prev => prev.map(p => p.id === id ? { ...p, isEnabled: current } : p)); }
  };

  // ── Feature list helpers ──────────────────────
  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] }));
    setNewFeature('');
  };
  const removeFeature = (idx: number) => setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  const updateFeature = (idx: number, val: string) => setForm(f => ({
    ...f, features: f.features.map((feat, i) => i === idx ? val : feat),
  }));

  // ── Filtered list ─────────────────────────────
  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'enabled' ? p.isEnabled : !p.isEnabled);
    return matchSearch && matchCat && matchStatus;
  });

  // ── Icon renderer ─────────────────────────────
  const IconComp = ({ name, className }: { name: string; className?: string }) => {
    const Comp = ICON_MAP[name] || Package;
    return <Comp className={className || 'w-5 h-5'} />;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Loading products...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Header Banner ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white shadow-xl border border-slate-700/50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black mb-2">
            <Package className="w-3.5 h-3.5" />
            Product Manager
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Products</h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Create, edit, duplicate, enable and disable products. Changes reflect live on the landing page.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              openAdminAIAssistant({
                type: 'product',
                onInsert: (_fieldType, value) => {
                  if (typeof value === 'object') {
                    setForm((prev) => ({
                      ...prev,
                      title: value.title || prev.title,
                      subtitle: value.subtitle || prev.subtitle,
                      description: value.description || prev.description,
                      features: Array.isArray(value.features) ? value.features : prev.features,
                    }));
                  }
                },
              })
            }
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            AI Generator
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-extrabold border border-white/10">
            {products.filter(p => p.isEnabled).length} active / {products.length} total
          </span>
          <button
            type="button" onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />Add Product
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
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

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
        </div>
        {/* Category filter */}
        <div className="relative">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/40">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        {/* Status filter */}
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/40">
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        {/* View toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button type="button" onClick={() => setViewMode('grid')} className={`p-2 cursor-pointer transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setViewMode('list')} className={`p-2 cursor-pointer transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Product Grid / List ── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((product) => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${
                  product.isEnabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 opacity-65'
                }`}>
                {/* Gradient Top Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${product.gradient}`} />

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white shadow-md shrink-0`}>
                      <IconComp name={product.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => openEdit(product)} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDuplicate(product.id, product.title)} title="Duplicate" className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleToggleEnabled(product.id, product.title, product.isEnabled)} title={product.isEnabled ? 'Disable' : 'Enable'} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition">
                        {product.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button type="button" onClick={() => setDeleteConfirmProduct({ id: product.id, title: product.title })} title="Delete" className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wide">
                        {product.category}
                      </span>
                      {product.subtitle && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold border border-blue-100 dark:border-blue-900">
                          {product.subtitle}
                        </span>
                      )}
                      {!product.isEnabled && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/30 text-red-500 text-[10px] font-extrabold">Disabled</span>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{product.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{product.description}</p>
                  </div>

                  {/* Features preview */}
                  {Array.isArray(product.features) && product.features.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {product.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${product.gradient} shrink-0`} />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      {product.features.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">+{product.features.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── List View ── */
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((product) => (
              <div key={product.id} className={`flex items-center gap-4 p-4 transition ${!product.isEnabled ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-950/60'}`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white shrink-0`}>
                  <IconComp name={product.icon} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{product.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase shrink-0">{product.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{product.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 cursor-pointer transition">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDuplicate(product.id, product.title)} className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-400 hover:text-violet-600 cursor-pointer transition">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleToggleEnabled(product.id, product.title, product.isEnabled)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition">
                    {product.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" onClick={() => setDeleteConfirmProduct({ id: product.id, title: product.title })} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
          {search || filterCategory !== 'all' || filterStatus !== 'all'
            ? 'No products match your filters.' : 'No products yet. Click "Add Product" to get started.'}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">

              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  {modal.mode === 'create' ? 'Create New Product' : 'Edit Product'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Title + Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. AI Predictive Engine"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Subtitle / Badge</label>
                    <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                      placeholder="e.g. CORE MODULE"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Product description..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
                </div>

                {/* Category + Status + Order */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Order</label>
                    <input type="number" min={0} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none" />
                  </div>
                </div>

                {/* Icon + Gradient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Icon</label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Object.keys(ICON_MAP).map(iconName => {
                        const IC = ICON_MAP[iconName];
                        return (
                          <button key={iconName} type="button" onClick={() => setForm(f => ({ ...f, icon: iconName }))}
                            title={iconName}
                            className={`p-2 rounded-lg flex items-center justify-center transition cursor-pointer ${form.icon === iconName ? `bg-gradient-to-br ${form.gradient} text-white shadow-md` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <IC className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Gradient Color</label>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADIENT_PRESETS.map(g => (
                        <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, gradient: g.value }))}
                          className={`px-2 py-2 rounded-lg text-[10px] font-extrabold text-white bg-gradient-to-r ${g.value} transition cursor-pointer border-2 ${form.gradient === g.value ? 'border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Features</label>
                  <div className="space-y-2">
                    {form.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="text" value={feat} onChange={e => updateFeature(idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}`}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40" />
                        <button type="button" onClick={() => removeFeature(idx)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFeature()}
                      placeholder="Add a feature... (press Enter)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40" />
                    <button type="button" onClick={addFeature} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold cursor-pointer transition flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />Add
                    </button>
                  </div>
                </div>

                {/* Image URL & Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Image URL (optional)</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingImage(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('folder', 'products');
                          const res = await apiFetch(`${API_URL}/uploads/media`, {
                            method: 'POST',
                            body: formData,
                          });
                          const data = await res.json();
                          const url = data.url || data.data?.url;
                          if (res.ok && data.success && url) {
                            setForm(prev => ({ ...prev, image: url }));
                            showMsg('success', `Image "${file.name}" uploaded successfully!`);
                          } else {
                            showMsg('error', data.message || 'Image upload failed');
                          }
                        } catch {
                          showMsg('error', 'Image upload failed');
                        } finally {
                          setIsUploadingImage(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                    >
                      {isUploadingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Upload Local Image</span>
                    </button>
                  </div>
                  <input type="text" value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value || null }))}
                    placeholder="https://example.com/product-image.png or click Upload Local Image above"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>

                {/* Enable toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Enabled on Landing Page</p>
                    <p className="text-[11px] text-slate-500">When disabled, this product won't appear on the live site</p>
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, isEnabled: !f.isEnabled }))}
                    className={`w-11 h-6 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 flex items-center ${form.isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                    <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-blue-600/25">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {modal.mode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Custom Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteConfirmProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteConfirmProduct(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 text-slate-900 dark:text-white shadow-2xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Ambient Glow */}
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
                    Delete Product?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirmProduct.title}"</span>?
                    This action will remove the product from the ecosystem and landing page.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 relative z-10">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProduct(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-2 border-none"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
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
