import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  GripVertical,
  Save,
  RefreshCw,
  CheckCircle2,
  Edit3,
  X,
  Link,
  Type,
} from 'lucide-react';

export interface NavItemData {
  id: string;
  label: string;
  route: string;
  order: number;
  isVisible: boolean;
  isHighlight: boolean;
}

import { API_URL, apiFetch } from '../../config/api.config';

const API_BASE = `${API_URL}/nav`;


const DEFAULT_NAV: NavItemData[] = [
  { id: 'nav-1', label: 'Home', route: '/', order: 0, isVisible: true, isHighlight: false },
  { id: 'nav-2', label: 'Ecosystem', route: '/products', order: 1, isVisible: true, isHighlight: false },
  { id: 'nav-3', label: 'Marketplace', route: '/marketplace', order: 2, isVisible: true, isHighlight: false },
  { id: 'nav-4', label: 'Services', route: '/services', order: 3, isVisible: true, isHighlight: false },
  { id: 'nav-5', label: 'Careers', route: '/careers', order: 4, isVisible: true, isHighlight: false },
  { id: 'nav-6', label: 'Pricing', route: '/pricing', order: 5, isVisible: true, isHighlight: false },
  { id: 'nav-7', label: 'About Us', route: '/about', order: 6, isVisible: true, isHighlight: false },
  { id: 'nav-8', label: 'Contact', route: '/contact-sales', order: 7, isVisible: true, isHighlight: false },
];

const PRESET_ROUTES = [
  { label: 'Services', route: '/services' },
  { label: 'Ecosystem', route: '/products' },
  { label: 'Marketplace', route: '/marketplace' },
  { label: 'Careers', route: '/careers' },
  { label: 'Pricing', route: '/pricing' },
  { label: 'About Us', route: '/about' },
  { label: 'Contact', route: '/contact-sales' },
  { label: 'Book Demo', route: '/book-demo' },
  { label: 'Blog', route: '/blog' },
];

export const AdminNavCMS: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItemData[]>(DEFAULT_NAV);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editRoute, setEditRoute] = useState('');

  // New item form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newRoute, setNewRoute] = useState('');

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // ── Fetch from backend ──────────────────────────────────────
  useEffect(() => {
    apiFetch(API_BASE)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const uniqueMap = new Map<string, NavItemData>();
          data.data.forEach((item: NavItemData) => {
            const key = (item.route || '').toLowerCase().trim();
            if (key && !uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          });
          setNavItems(Array.from(uniqueMap.values()).sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleRestoreDefaults = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNavItems(data.data);
        showMessage('success', 'Navigation reset to system defaults including Services!');
      }
    } catch (_e) {
      setNavItems(DEFAULT_NAV);
      showMessage('info', 'Restored default navigation including Services.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save reorder to API ─────────────────────────────────────
  const saveReorder = async (items: NavItemData[]) => {
    try {
      await apiFetch(`${API_BASE}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
      });
    } catch (_e) {}
  };

  // ── Drag & Drop ─────────────────────────────────────────────
  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDropTargetIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const updated = [...navItems];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, removed);
    const reordered = updated.map((item, idx) => ({ ...item, order: idx }));

    setNavItems(reordered);
    saveReorder(reordered);
    showMessage('success', 'Menu order saved!');

    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // ── Add Item ────────────────────────────────────────────────
  const handleAddItem = async () => {
    if (!newLabel.trim() || !newRoute.trim()) return;

    try {
      const res = await apiFetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim(), route: newRoute.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNavItems((prev) => [...prev, data.data].sort((a, b) => a.order - b.order));
        showMessage('success', `"${newLabel}" added to navigation!`);
      }
    } catch (_e) {
      // Optimistic fallback
      const newItem: NavItemData = {
        id: `local-${Date.now()}`,
        label: newLabel.trim(),
        route: newRoute.trim(),
        order: navItems.length,
        isVisible: true,
        isHighlight: false,
      };
      setNavItems((prev) => [...prev, newItem]);
      showMessage('success', `"${newLabel}" added!`);
    }

    setNewLabel('');
    setNewRoute('');
    setShowAddForm(false);
  };

  // ── Delete Item ─────────────────────────────────────────────
  const handleDelete = async (id: string, label: string) => {
    setNavItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch (_e) {}
    showMessage('info', `"${label}" removed from navigation.`);
  };

  // ── Toggle Visibility ───────────────────────────────────────
  const handleToggleVisibility = async (id: string) => {
    const item = navItems.find((i) => i.id === id);
    if (!item) return;

    setNavItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isVisible: !i.isVisible } : i))
    );

    try {
      await apiFetch(`${API_BASE}/${id}/toggle-visibility`, { method: 'PATCH' });
    } catch (_e) {}

    showMessage('success', `"${item.label}" is now ${!item.isVisible ? 'visible' : 'hidden'}.`);
  };

  // ── Toggle Highlight ────────────────────────────────────────
  const handleToggleHighlight = async (id: string) => {
    const item = navItems.find((i) => i.id === id);
    if (!item) return;
    const newHighlight = !item.isHighlight;

    setNavItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isHighlight: newHighlight } : i))
    );

    try {
      await apiFetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHighlight: newHighlight }),
      });
    } catch (_e) {}

    showMessage('success', `"${item.label}" highlight ${newHighlight ? 'enabled' : 'disabled'}.`);
  };

  // ── Inline Edit ─────────────────────────────────────────────
  const startEdit = (item: NavItemData) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditRoute(item.route);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editLabel.trim() || !editRoute.trim()) return;

    setNavItems((prev) =>
      prev.map((i) => (i.id === editingId ? { ...i, label: editLabel.trim(), route: editRoute.trim() } : i))
    );

    setIsSaving(true);
    try {
      await apiFetch(`${API_BASE}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editLabel.trim(), route: editRoute.trim() }),
      });
    } catch (_e) {}
    setIsSaving(false);
    setEditingId(null);
    showMessage('success', 'Menu item updated!');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditRoute('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Loading navigation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <Navigation className="w-3.5 h-3.5" />
            Page Builder Module
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Navigation Manager
          </h1>
          <p className="text-xs md:text-sm text-purple-100 max-w-xl">
            Add, delete, hide, highlight and reorder navigation links. Drag to rearrange. Changes reflect live on the landing page.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition border border-white/20 flex items-center gap-2 cursor-pointer"
            title="Reset navigation menu to default system routes including Services"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restore Defaults
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-black text-xs transition shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Toast */}
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
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-500" />
                Add New Menu Item
              </h3>
              <button type="button" onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Quick Picker */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Quick Select System Route Preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROUTES.map((p) => (
                  <button
                    key={p.route}
                    type="button"
                    onClick={() => {
                      setNewLabel(p.label);
                      setNewRoute(p.route);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold transition cursor-pointer"
                  >
                    + {p.label} ({p.route})
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" /> Menu Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Blog"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-hidden"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5" /> Route / Path
                </label>
                <input
                  type="text"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  placeholder="e.g. /blog"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-hidden"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!newLabel.trim() || !newRoute.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                Add to Navigation
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewLabel(''); setNewRoute(''); }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-extrabold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Items List */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-purple-500" />
            Menu Items
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
            <GripVertical className="w-3.5 h-3.5" />
            Drag to reorder
          </div>
        </div>

        <div className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`group relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                draggedIndex === index
                  ? 'opacity-40 scale-[0.98] border-purple-400 bg-purple-50 dark:bg-purple-950/30'
                  : dropTargetIndex === index && draggedIndex !== index
                  ? 'border-purple-400 bg-purple-50/60 dark:bg-purple-950/20 shadow-md shadow-purple-500/10'
                  : item.isVisible
                  ? 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              {/* Drag Handle */}
              <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Order Badge */}
              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 shrink-0">
                {index + 1}
              </div>

              {/* Label & Route — Inline Edit or Display */}
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-400 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={editRoute}
                      onChange={(e) => setEditRoute(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-400 text-xs font-mono font-bold text-purple-600 dark:text-purple-400 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={saveEdit} disabled={isSaving} className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1">
                        {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-extrabold truncate ${!item.isVisible ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                          {item.label}
                        </span>
                        {item.isHighlight && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold border border-amber-200 dark:border-amber-800">
                            Highlighted
                          </span>
                        )}
                        {!item.isVisible && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 truncate block">
                        {item.route}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingId !== item.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    title="Edit label & route"
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(item.id)}
                    title={item.isVisible ? 'Hide from navbar' : 'Show in navbar'}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                  >
                    {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Toggle Highlight */}
                  <button
                    type="button"
                    onClick={() => handleToggleHighlight(item.id)}
                    title={item.isHighlight ? 'Remove highlight' : 'Highlight this item'}
                    className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                  >
                    {item.isHighlight ? <Star className="w-3.5 h-3.5 text-amber-500" /> : <StarOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.label)}
                    title="Delete from navigation"
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {navItems.length === 0 && (
            <div className="py-12 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
              No navigation items yet. Click "Add Menu Item" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="p-5 md:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Navigation className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Live Navbar Preview
          </h4>
          <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold">
            Real-Time
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm">
          {navItems
            .filter((i) => i.isVisible)
            .map((item) => (
              <span
                key={item.id}
                className={`font-medium transition-all cursor-default ${
                  item.isHighlight
                    ? 'text-amber-400 font-black underline decoration-amber-400 underline-offset-4'
                    : 'text-slate-300'
                }`}
              >
                {item.label}
              </span>
            ))}
        </div>

        {navItems.filter((i) => !i.isVisible).length > 0 && (
          <p className="text-[10px] font-bold text-slate-500">
            Hidden items: {navItems.filter((i) => !i.isVisible).map((i) => i.label).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};
