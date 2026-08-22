import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareQuote, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, Star, Upload,
  User, Building2, Briefcase, GripVertical, Sparkles
} from 'lucide-react';
import { openAdminAIAssistant } from './AdminLayout';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API = `${API_URL}/testimonials`;
const UPLOADS_BASE = API_URL.replace('/api/v1', '');


export interface TestimonialData {
  id: string;
  name: string;
  company: string;
  designation: string;
  review: string;
  rating: number;
  photo: string | null;
  order: number;
  isEnabled: boolean;
}

const EMPTY: Omit<TestimonialData, 'id'> = {
  name: '', company: '', designation: '', review: '',
  rating: 5, photo: null, order: 0, isEnabled: true,
};

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({ value, onChange, readonly }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} type="button" disabled={readonly}
        onClick={() => onChange?.(s)}
        className={`transition cursor-pointer ${readonly ? 'cursor-default' : 'hover:scale-110'}`}>
        <Star className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
      </button>
    ))}
  </div>
);

export const AdminTestimonialManager: React.FC = () => {
  const [items, setItems] = useState<TestimonialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; item?: TestimonialData } | null>(null);
  const [form, setForm] = useState<Omit<TestimonialData, 'id'>>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchItems = async () => {
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success) setItems(data.data.sort((a: TestimonialData, b: TestimonialData) => a.order - b.order));
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY, order: items.length });
    setPhotoFile(null); setPhotoPreview(null);
    setModal({ mode: 'create' });
  };

  const openEdit = (item: TestimonialData) => {
    setForm({
      name: item.name, company: item.company, designation: item.designation,
      review: item.review, rating: item.rating, photo: item.photo,
      order: item.order, isEnabled: item.isEnabled,
    });
    setPhotoFile(null);
    setPhotoPreview(item.photo ? resolveMediaUrl(item.photo) : null);
    setModal({ mode: 'edit', item });
  };

  const closeModal = () => { setModal(null); setPhotoFile(null); setPhotoPreview(null); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.review.trim()) {
      showMsg('error', 'Name and review are required.');
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('company', form.company);
      fd.append('designation', form.designation);
      fd.append('review', form.review);
      fd.append('rating', String(form.rating));
      fd.append('order', String(form.order));
      fd.append('isEnabled', String(form.isEnabled));
      if (photoFile) fd.append('photo', photoFile);
      else if (form.photo) fd.append('photo', form.photo);

      const url = modal?.mode === 'create' ? API : `${API}/${modal?.item?.id}`;
      const method = modal?.mode === 'create' ? 'POST' : 'PUT';
      const res = await apiFetch(url, { method, body: fd });
      const data = await res.json();
      if (data.success) {
        await fetchItems();
        closeModal();
        showMsg('success', modal?.mode === 'create' ? 'Testimonial added!' : 'Testimonial updated!');
      }
    } catch { showMsg('error', 'Failed to save.'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
      showMsg('info', `Testimonial deleted.`);
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const handleToggle = async (id: string, name: string, cur: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isEnabled: !i.isEnabled } : i));
    try { await apiFetch(`${API}/${id}/toggle-enabled`, { method: 'PATCH' }); }
    catch { setItems(prev => prev.map(i => i.id === id ? { ...i, isEnabled: cur } : i)); }
    showMsg('success', `"${name}" ${!cur ? 'enabled' : 'hidden'}.`);
  };

  // Drag reorder
  const handleDragStart = (i: number) => { dragItem.current = i; setDraggedIdx(i); };
  const handleDragEnter = (i: number) => { dragOver.current = i; setDropIdx(i); };
  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      setDraggedIdx(null); setDropIdx(null); return;
    }
    const updated = [...items];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOver.current, 0, removed);
    const reordered = updated.map((t, idx) => ({ ...t, order: idx }));
    setItems(reordered);
    dragItem.current = null; dragOver.current = null;
    setDraggedIdx(null); setDropIdx(null);
    try {
      await apiFetch(`${API}/reorder`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map(t => t.id) }),
      });
      showMsg('success', 'Order saved!');
    } catch { /* silent */ }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading testimonials...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5" />Testimonial Manager
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-emerald-100 max-w-xl mt-1">
            Add, edit, upload photos and reorder customer testimonials. Drag to rearrange. Changes go live on the landing page instantly.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              openAdminAIAssistant({
                type: 'testimonial',
                onInsert: (_fieldType, value) => {
                  if (typeof value === 'object') {
                    setForm({
                      name: value.name || '',
                      company: value.company || '',
                      designation: value.designation || '',
                      review: value.review || '',
                      rating: value.rating || 5,
                      photo: null,
                      order: items.length,
                      isEnabled: true,
                    });
                    setModal({ mode: 'create' });
                  }
                },
              })
            }
            className="px-4 py-2.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/40 text-cyan-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            Generate Review with AI
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-extrabold border border-white/10">
            {items.filter(i => i.isEnabled).length} active / {items.length} total
          </span>
          <button type="button" onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs transition shadow-lg cursor-pointer flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Review
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

      {/* Drag hint */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 px-1">
        <GripVertical className="w-4 h-4" /><span>Drag to reorder testimonials</span>
      </div>

      {/* Testimonial Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div key={item.id} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
              className={`group relative flex items-start gap-4 p-5 rounded-2xl border cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
                !item.isEnabled ? 'opacity-50 bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/50'
                : draggedIdx === index ? 'opacity-40 scale-[0.98] border-emerald-400'
                : dropIdx === index && draggedIdx !== index ? 'border-emerald-400 shadow-lg shadow-emerald-500/10 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
              }`}>

              {/* Drag handle */}
              <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition mt-1 shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Order badge */}
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                {index + 1}
              </div>

              {/* Avatar */}
              <div className="shrink-0">
                {item.photo ? (
                  <img src={`${UPLOADS_BASE}${item.photo}`} alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 dark:border-slate-800" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm">
                    {getInitials(item.name || '?')}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{item.name}</span>
                  {item.designation && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.designation}</span>
                  )}
                  {item.company && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-100 dark:border-emerald-900">
                      {item.company}
                    </span>
                  )}
                  {!item.isEnabled && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-extrabold">Hidden</span>
                  )}
                </div>
                <StarRating value={item.rating} readonly />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">"{item.review}"</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button type="button" onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleToggle(item.id, item.name, item.isEnabled)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition">
                  {item.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button type="button" onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="py-16 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
            No testimonials yet. Click "Add Review" to get started.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">

              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-emerald-500" />
                  {modal.mode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Photo Upload */}
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                        {form.name ? getInitials(form.name) : <User className="w-8 h-8" />}
                      </div>
                    )}
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Customer Photo</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WebP · Max 5MB</p>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                      Upload Photo
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                </div>

                {/* Name + Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />Customer Name *
                    </label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. James Whitfield"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />Company
                    </label>
                    <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="e.g. NovaTech Solutions"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none" />
                  </div>
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />Designation / Title
                  </label>
                  <input type="text" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                    placeholder="e.g. VP of Sales"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none" />
                </div>

                {/* Review */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Review *</label>
                  <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                    rows={4} placeholder="What did the customer say about Dezoryn?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none resize-none" />
                </div>

                {/* Rating + Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Rating</label>
                    <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Order</label>
                    <input type="number" min={0} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none" />
                  </div>
                </div>

                {/* Enable toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Visible on Landing Page</p>
                    <p className="text-[11px] text-slate-500">When disabled, this review won't show publicly</p>
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, isEnabled: !f.isEnabled }))}
                    className={`w-11 h-6 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 flex items-center ${form.isEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                    <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-emerald-600/25">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {modal.mode === 'create' ? 'Add Testimonial' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
