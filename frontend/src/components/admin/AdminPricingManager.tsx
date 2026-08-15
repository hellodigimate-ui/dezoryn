import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, Star, Sparkles,
  GripVertical, ArrowRight, Check
} from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';

const API = `${API_URL}/pricing`;


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

const EMPTY: Omit<PricingPlanData, 'id'> = {
  name: '', price: '', description: '', features: [''],
  buttonText: 'Get Started', buttonUrl: '/book-demo',
  isHighlight: false, ribbon: '', colorTheme: 'blue',
  order: 0, isEnabled: true,
};

export const AdminPricingManager: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; plan?: PricingPlanData } | null>(null);
  const [form, setForm] = useState<Omit<PricingPlanData, 'id'>>(EMPTY);
  const [newFeature, setNewFeature] = useState('');

  // Drag state
  const dragItem = React.useRef<number | null>(null);
  const dragOver = React.useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchPlans = async () => {
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success) setPlans(data.data.sort((a: PricingPlanData, b: PricingPlanData) => a.order - b.order));
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm({ ...EMPTY, order: plans.length }); setModal({ mode: 'create' }); };
  const openEdit = (p: PricingPlanData) => {
    setForm({
      name: p.name, price: p.price, description: p.description,
      features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [''],
      buttonText: p.buttonText, buttonUrl: p.buttonUrl,
      isHighlight: p.isHighlight, ribbon: p.ribbon || '',
      colorTheme: p.colorTheme, order: p.order, isEnabled: p.isEnabled,
    });
    setModal({ mode: 'edit', plan: p });
  };
  const closeModal = () => { setModal(null); setNewFeature(''); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.description.trim()) {
      showMsg('error', 'Name, price and description are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        ribbon: form.ribbon?.trim() || null,
        features: form.features.filter(f => f.trim()),
      };
      const url = modal?.mode === 'create' ? API : `${API}/${modal?.plan?.id}`;
      const method = modal?.mode === 'create' ? 'POST' : 'PUT';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        await fetchPlans();
        closeModal();
        showMsg('success', modal?.mode === 'create' ? 'Plan created!' : 'Plan updated!');
      }
    } catch { showMsg('error', 'Failed to save.'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      setPlans(prev => prev.filter(p => p.id !== id));
      showMsg('info', `"${name}" deleted.`);
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const handleToggle = async (id: string, name: string, cur: boolean) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
    try { await apiFetch(`${API}/${id}/toggle-enabled`, { method: 'PATCH' }); }
    catch { setPlans(prev => prev.map(p => p.id === id ? { ...p, isEnabled: cur } : p)); }
    showMsg('success', `"${name}" ${!cur ? 'enabled' : 'disabled'}.`);
  };

  // Drag reorder
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
      await apiFetch(`${API}/reorder`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map(p => p.id) }),
      });
      showMsg('success', 'Order saved!');
    } catch { /* silent */ }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] }));
    setNewFeature('');
  };
  const removeFeature = (i: number) => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const updateFeature = (i: number, v: string) => setForm(f => ({ ...f, features: f.features.map((feat, idx) => idx === i ? v : feat) }));

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading pricing...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 text-white shadow-xl shadow-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <DollarSign className="w-3.5 h-3.5" />Pricing Manager
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Pricing Plans</h1>
          <p className="text-xs text-purple-100 max-w-xl mt-1">
            Create, edit, highlight and reorder pricing tiers. Changes go live on the Pricing page instantly.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-extrabold border border-white/10">
            {plans.filter(p => p.isEnabled).length} active / {plans.length} total
          </span>
          <button type="button" onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-black text-xs transition shadow-lg cursor-pointer flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Plan
          </button>
        </div>
      </div>

      {/* Toast */}
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

      {/* Hint */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 px-1">
        <GripVertical className="w-4 h-4" />
        <span>Drag the grip handle to reorder plans</span>
      </div>

      {/* Plan Cards */}
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

                {/* Highlight ring */}
                {plan.isHighlight && (
                  <div className={`absolute inset-0 rounded-2xl ring-2 ${theme.ring} pointer-events-none`} />
                )}

                {/* Top gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                {/* Ribbon */}
                {plan.ribbon && (
                  <div className={`absolute top-5 right-0 px-3 py-1 text-[10px] font-black text-white ${theme.badge} rounded-l-lg shadow-md`}>
                    {plan.ribbon}
                  </div>
                )}

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0`}>
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      {plan.isHighlight && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    {/* Drag handle */}
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition shrink-0 mt-0.5">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Plan info */}
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    <div className={`text-2xl font-black bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{plan.description}</p>
                  </div>

                  {/* Features */}
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

                  {/* CTA preview */}
                  <div className={`w-full py-2 rounded-xl text-[11px] font-extrabold text-center text-white bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-1.5`}>
                    {plan.buttonText}<ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 left-3 flex items-center gap-1.5">
                  <button type="button" onClick={() => openEdit(plan)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50 cursor-pointer transition">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleToggle(plan.id, plan.name, plan.isEnabled)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 cursor-pointer transition">
                    {plan.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" onClick={() => handleDelete(plan.id, plan.name)}
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

        {/* Add Plan Card */}
        <motion.button type="button" onClick={openCreate} layout
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-700 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all min-h-[220px] cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold">Add Pricing Plan</span>
        </motion.button>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">

              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-violet-500" />
                  {modal.mode === 'create' ? 'Create Pricing Plan' : 'Edit Pricing Plan'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Name + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Plan Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Professional"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Price *</label>
                    <input type="text" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. ₹5,999/mo or Custom"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Plan description..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none resize-none" />
                </div>

                {/* Button Text + URL */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Button Text</label>
                    <input type="text" value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                      placeholder="e.g. Get Started"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Button URL</label>
                    <input type="text" value={form.buttonUrl} onChange={e => setForm(f => ({ ...f, buttonUrl: e.target.value }))}
                      placeholder="e.g. /book-demo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                </div>

                {/* Ribbon + Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Ribbon Label</label>
                    <input type="text" value={form.ribbon || ''} onChange={e => setForm(f => ({ ...f, ribbon: e.target.value }))}
                      placeholder="e.g. Most Popular"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Order</label>
                    <input type="number" min={0} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/40 outline-none" />
                  </div>
                </div>

                {/* Color Theme */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_THEMES.map(t => (
                      <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, colorTheme: t.value }))}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black text-white bg-gradient-to-r ${t.gradient} transition cursor-pointer border-2 ${form.colorTheme === t.value ? 'border-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                        {t.label}
                      </button>
                    ))}
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
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
                        <button type="button" onClick={() => removeFeature(idx)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFeature()}
                      placeholder="Add feature... (Enter)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
                    <button type="button" onClick={addFeature} className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />Add
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />Highlight Plan
                      </p>
                      <p className="text-[11px] text-slate-500">Featured with ring & star badge</p>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, isHighlight: !f.isHighlight }))}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${form.isHighlight ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.isHighlight ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />Enabled
                      </p>
                      <p className="text-[11px] text-slate-500">Show on pricing page</p>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, isEnabled: !f.isEnabled }))}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${form.isEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-violet-600/25">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {modal.mode === 'create' ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
