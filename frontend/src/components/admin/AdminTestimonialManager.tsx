import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareQuote, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, Star, Upload,
  User, Building2, Briefcase, GripVertical, Sparkles, Image, Link as LinkIcon,
  AlertTriangle, Quote
} from 'lucide-react';
import { openAdminAIAssistant } from './AdminLayout';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API = `${API_URL}/testimonials`;

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
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        type="button"
        disabled={readonly}
        onClick={() => onChange?.(s)}
        className={`transition p-0.5 cursor-pointer ${readonly ? 'cursor-default' : 'hover:scale-125'}`}
      >
        <Star className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
      </button>
    ))}
  </div>
);

export const AdminTestimonialManager: React.FC = () => {
  const [items, setItems] = useState<TestimonialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; item?: TestimonialData } | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<Omit<TestimonialData, 'id'>>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchItems = async () => {
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data.sort((a: TestimonialData, b: TestimonialData) => a.order - b.order));
      }
    } catch {
      showMsg('error', 'Failed to load testimonials from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY, order: items.length });
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoInputMode('upload');
    setModal({ mode: 'create' });
  };

  const openEdit = (item: TestimonialData) => {
    setForm({
      name: item.name,
      company: item.company || '',
      designation: item.designation || '',
      review: item.review,
      rating: item.rating || 5,
      photo: item.photo,
      order: item.order || 0,
      isEnabled: item.isEnabled !== false,
    });
    setPhotoFile(null);
    setPhotoPreview(item.photo ? resolveMediaUrl(item.photo) : null);
    setPhotoInputMode(item.photo && !item.photo.startsWith('/uploads/') ? 'url' : 'upload');
    setModal({ mode: 'edit', item });
  };

  const closeModal = () => {
    setModal(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showMsg('error', 'Photo file size exceeds 10MB limit.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm(f => ({ ...f, photo: null }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showMsg('error', 'Customer Name is required.');
      return;
    }
    if (!form.review.trim()) {
      showMsg('error', 'Customer Review / Quote is required.');
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('company', form.company.trim());
      fd.append('designation', form.designation.trim());
      fd.append('review', form.review.trim());
      fd.append('rating', String(form.rating || 5));
      fd.append('order', String(form.order ?? 0));
      fd.append('isEnabled', String(form.isEnabled));

      if (photoFile) {
        fd.append('photo', photoFile);
      } else if (form.photo && form.photo.trim()) {
        fd.append('photo', form.photo.trim());
      } else {
        fd.append('photo', '');
      }

      const url = modal?.mode === 'create' ? API : `${API}/${modal?.item?.id}`;
      const method = modal?.mode === 'create' ? 'POST' : 'PUT';
      const res = await apiFetch(url, { method, body: fd });
      const data = await res.json();

      if (res.ok && data.success) {
        await fetchItems();
        closeModal();
        showMsg('success', modal?.mode === 'create' ? 'Testimonial added successfully!' : 'Testimonial updated successfully!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dezoryn-testimonials-updated'));
        }
      } else {
        showMsg('error', data.message || 'Failed to save testimonial.');
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Error occurred while saving testimonial.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const { id, name } = deleteConfirmItem;
    setIsDeleting(true);

    try {
      const res = await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(i => i.id !== id));
        showMsg('info', `Testimonial from "${name}" deleted.`);
        setDeleteConfirmItem(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dezoryn-testimonials-updated'));
        }
      } else {
        showMsg('error', data.message || 'Failed to delete testimonial.');
      }
    } catch {
      showMsg('error', 'Failed to delete testimonial.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (id: string, name: string, cur: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isEnabled: !i.isEnabled } : i));
    try {
      await apiFetch(`${API}/${id}/toggle-enabled`, { method: 'PATCH' });
      showMsg('success', `"${name}" ${!cur ? 'is now visible on landing page' : 'is now hidden from landing page'}.`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dezoryn-testimonials-updated'));
      }
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, isEnabled: cur } : i));
      showMsg('error', 'Failed to toggle visibility.');
    }
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
      showMsg('success', 'New testimonial display order saved!');
    } catch { /* silent */ }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
        <span className="text-sm font-semibold">Loading testimonials...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Testimonial CMS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-emerald-100 max-w-xl mt-1">
            Add, edit, upload customer photos and reorder testimonials. Changes go live on the landing page instantly.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
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
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setModal({ mode: 'create' });
                  }
                },
              })
            }
            className="px-4 py-2.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/40 text-cyan-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Generate with AI</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-extrabold border border-white/10">
            {items.filter(i => i.isEnabled).length} active / {items.length} total
          </span>
          <button
            type="button"
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs transition shadow-lg cursor-pointer flex items-center gap-2 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-3 shadow-md ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : message.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonials Grid */}
      {items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">No Testimonials Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Add customer feedback and reviews to build credibility on your landing page.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md inline-flex items-center gap-2 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Review</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className={`group p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg relative overflow-hidden ${
                item.isEnabled ? 'border-slate-200 dark:border-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
              } ${draggedIdx === idx ? 'opacity-40 scale-95' : ''} ${dropIdx === idx ? 'ring-2 ring-emerald-500' : ''}`}
            >
              {/* Watermark Quote */}
              <div className="absolute top-4 right-4 text-slate-100 dark:text-slate-800/40 pointer-events-none -z-0">
                <Quote className="w-16 h-16" />
              </div>

              <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 group-hover:text-slate-400" title="Drag to reorder">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <StarRating value={item.rating} readonly />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.name, item.isEnabled)}
                      title={item.isEnabled ? 'Hide from landing page' : 'Show on landing page'}
                      className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        item.isEnabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {item.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      title="Edit review"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmItem({ id: item.id, name: item.name })}
                      title="Delete review"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4 font-medium mb-6 italic">
                  "{item.review}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
                {item.photo ? (
                  <img
                    src={resolveMediaUrl(item.photo)}
                    alt={item.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
                    {getInitials(item.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.name}</h4>
                    {!item.isEnabled && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.designation}{item.designation && item.company ? ' · ' : ''}{item.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-emerald-500" />
                  <span>{modal.mode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}</span>
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Photo Upload & Preview Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Customer Photo</span>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPhotoInputMode('upload')}
                        className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          photoInputMode === 'upload' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Image className="w-3 h-3" />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoInputMode('url')}
                        className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          photoInputMode === 'url' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>URL</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                          {form.name ? getInitials(form.name) : <User className="w-6 h-6" />}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md cursor-pointer transition border-2 border-white dark:border-slate-900"
                        title="Upload new image"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      {photoInputMode === 'upload' ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {photoFile ? `Selected: ${photoFile.name}` : 'JPG, PNG, WebP · Max 10MB'}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                              Browse Image
                            </button>
                            {(photoPreview || photoFile) && (
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer transition"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="url"
                            value={form.photo || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm(f => ({ ...f, photo: val }));
                              setPhotoPreview(val.trim() || null);
                              setPhotoFile(null);
                            }}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 1: Name + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Customer Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. James Whitfield"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Company</span>
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="e.g. NovaTech Solutions"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                    />
                  </div>
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Designation / Title</span>
                  </label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                    placeholder="e.g. VP of Sales"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                  />
                </div>

                {/* Review Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Review *</label>
                  <textarea
                    required
                    value={form.review}
                    onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                    rows={4}
                    placeholder="What did the customer say about Dezoryn Technologies?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none resize-none"
                  />
                </div>

                {/* Rating + Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Rating</label>
                    <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Order</label>
                    <input
                      type="number"
                      min={0}
                      value={form.order}
                      onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                    />
                  </div>
                </div>

                {/* Enable / Disable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Visible on Landing Page</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">When disabled, this review won't show publicly</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isEnabled: !f.isEnabled }))}
                    className={`w-11 h-6 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 flex items-center ${
                      form.isEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-emerald-600/25 border-none"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{modal.mode === 'create' ? 'Add Testimonial' : 'Save Changes'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CUSTOM DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteConfirmItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 text-slate-900 dark:text-white shadow-2xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Top ambient glow */}
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
                    Delete Testimonial?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                    Are you sure you want to delete the testimonial from{' '}
                    <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirmItem.name}"</span>?
                    This will permanently remove it from the PostgreSQL database and public website.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 relative z-10">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
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
                      <span>Delete Review</span>
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
