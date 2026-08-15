import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, GripVertical,
  Copy, Search, Filter, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Tag, Layers, Sparkles, AlertCircle, AlertTriangle
} from 'lucide-react';
import { openAdminAIAssistant } from './AdminLayout';

import { API_URL, apiFetch } from '../../config/api.config';

const API = `${API_URL}/faqs`;


export interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: string; // 'active' | 'inactive' | 'draft'
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = ['General', 'Platform', 'Pricing', 'Security', 'Integration', 'Billing', 'Enterprise'];
const STATUSES = ['active', 'inactive', 'draft'];

const EMPTY_FAQ: Omit<FAQData, 'id'> = {
  question: '',
  answer: '',
  category: 'General',
  order: 0,
  status: 'active',
  isEnabled: true,
};

export const AdminFAQManager: React.FC = () => {
  const [items, setItems] = useState<FAQData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; item?: FAQData } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; question: string } | null>(null);

  const [form, setForm] = useState<Omit<FAQData, 'id'>>(EMPTY_FAQ);
  const [customCategory, setCustomCategory] = useState('');

  // Drag and drop reordering
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.sort((a: FAQData, b: FAQData) => a.order - b.order));
      }
    } catch {
      showMsg('error', 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FAQ, order: items.length });
    setCustomCategory('');
    setModal({ mode: 'create' });
  };

  const openEdit = (item: FAQData) => {
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order,
      status: item.status,
      isEnabled: item.isEnabled,
    });
    if (!CATEGORIES.includes(item.category)) {
      setCustomCategory(item.category);
    } else {
      setCustomCategory('');
    }
    setModal({ mode: 'edit', item });
  };

  const closeModal = () => {
    setModal(null);
    setCustomCategory('');
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      showMsg('error', 'Question and Answer are required');
      return;
    }

    const finalCategory = customCategory.trim() || form.category || 'General';

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        category: finalCategory,
      };

      let res;
      if (modal?.mode === 'edit' && modal.item) {
        res = await apiFetch(`${API}/${modal.item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        showMsg('success', modal?.mode === 'edit' ? 'FAQ updated successfully' : 'FAQ created successfully');
        closeModal();
        fetchItems();
      } else {
        showMsg('error', data.message || 'Operation failed');
      }
    } catch {
      showMsg('error', 'Network error occurred while saving FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: string, qText: string) => {
    setDeleteConfirm({ id, question: qText });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await apiFetch(`${API}/${deleteConfirm.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'FAQ deleted successfully');
        setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
      } else {
        showMsg('error', data.message || 'Failed to delete');
      }
    } catch {
      showMsg('error', 'Error deleting FAQ');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = async (item: FAQData) => {
    try {
      const res = await apiFetch(`${API}/${item.id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showMsg('info', `FAQ status updated to ${data.data.status}`);
        setItems(prev => prev.map(i => i.id === item.id ? data.data : i));
      }
    } catch {
      showMsg('error', 'Failed to toggle status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await apiFetch(`${API}/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'FAQ duplicated');
        fetchItems();
      }
    } catch {
      showMsg('error', 'Failed to duplicate FAQ');
    }
  };

  // Move up/down accordion ordering
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);

    const reordered = newItems.map((item, idx) => ({ ...item, order: idx }));
    setItems(reordered);
    saveOrder(reordered);
  };

  const saveOrder = async (orderedList: FAQData[]) => {
    try {
      const orderedIds = orderedList.map(i => i.id);
      await apiFetch(`${API}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      showMsg('success', 'Accordion order saved');
    } catch {
      showMsg('error', 'Failed to save reorder');
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number) => {
    dragOver.current = index;
    setDropIdx(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
      const newItems = [...items];
      const [dragged] = newItems.splice(dragItem.current, 1);
      newItems.splice(dragOver.current, 0, dragged);
      const reordered = newItems.map((item, idx) => ({ ...item, order: idx }));
      setItems(reordered);
      saveOrder(reordered);
    }
    dragItem.current = null;
    dragOver.current = null;
    setDraggedIdx(null);
    setDropIdx(null);
  };

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesSearch = !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const categoriesList = Array.from(new Set(['All', ...CATEGORIES, ...items.map(i => i.category)]));

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Interactive CMS Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FAQ & Accordion Management
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Create, categorize, edit, and reorder public FAQs. Control display sequence for landing page accordions in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() =>
              openAdminAIAssistant({
                type: 'faq',
                onInsert: (_fieldType, value) => {
                  if (value && value.question && value.answer) {
                    setForm({
                      question: value.question,
                      answer: value.answer,
                      category: value.category || 'General',
                      order: items.length,
                      status: 'active',
                      isEnabled: true,
                    });
                    setModal({ mode: 'create' });
                  }
                },
              })
            }
            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-extrabold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Generate FAQs with AI</span>
          </button>
          <button
            type="button"
            onClick={fetchItems}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Refresh FAQs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-lg ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : message.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{items.length}</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total FAQs</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.status === 'active').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Accordions</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {new Set(items.map(i => i.category)).size}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.status !== 'active').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inactive / Draft</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs by question, answer, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/60 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Accordion FAQ Drag-and-Drop Management List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <span>FAQ Items & Accordion Ordering ({filteredItems.length})</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 font-semibold">Drag handle or use arrows to reorder</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading FAQ dataset...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No FAQs found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try adjusting your category or search query filter.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isExpanded = expandedFaqId === item.id;
            const isDragging = draggedIdx === index;
            const isDropTarget = dropIdx === index;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={e => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={`group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border transition-all duration-200 ${
                  isDragging ? 'opacity-40 scale-[0.99] border-dashed border-cyan-500' : ''
                } ${
                  isDropTarget ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left drag handle + order badge + question */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      className="p-1 text-slate-600 group-hover:text-slate-500 dark:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 mt-1 transition"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black text-cyan-400 shrink-0 mt-0.5 shadow-inner">
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {item.category}
                        </span>

                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          item.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <h3
                        onClick={() => setExpandedFaqId(isExpanded ? null : item.id)}
                        className="text-base font-black text-slate-900 dark:text-white cursor-pointer hover:text-cyan-400 transition"
                      >
                        {item.question}
                      </h3>
                    </div>
                  </div>

                  {/* Right Actions Toolbar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Move Up / Down */}
                    <div className="flex items-center bg-white dark:bg-slate-950 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white disabled:opacity-20 transition cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white disabled:opacity-20 transition cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Expand/Collapse preview */}
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : item.id)}
                      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Toggle status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        item.status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                      }`}
                      title={item.status === 'active' ? 'Deactivate FAQ' : 'Activate FAQ'}
                    >
                      {item.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(item.id)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
                      title="Duplicate FAQ"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => confirmDelete(item.id, item.question)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Answer Preview Accordion Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs leading-relaxed text-slate-600 dark:text-slate-300 pl-10">
                        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 font-medium text-slate-600 dark:text-slate-300">
                          {item.answer}
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-500 flex items-center justify-between font-semibold">
                          <span>Display Order Index: {item.order}</span>
                          <span>Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Sleek Custom Glassmorphic Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete FAQ Item?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white">"{deleteConfirm.question}"</span>? This will remove it from the landing page accordions.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-slate-900 dark:text-white font-black text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Dialog for Create & Edit */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {modal.mode === 'create' ? 'Add New FAQ' : 'Edit FAQ Item'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configure question, answer, category, and display order</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Question */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    Question <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. How does Dezoryn AI lead scoring work?"
                    value={form.question}
                    onChange={e => setForm({ ...form, question: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                  />
                </div>

                {/* Answer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    Answer <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide a clear, helpful answer for prospective enterprise customers..."
                    value={form.answer}
                    onChange={e => setForm({ ...form, answer: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition resize-none"
                  />
                </div>

                {/* Category & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Category</span>
                    </label>
                    <select
                      value={CATEGORIES.includes(form.category) ? form.category : 'custom'}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setForm({ ...form, category: customCategory || 'Custom' });
                        } else {
                          setForm({ ...form, category: val });
                          setCustomCategory('');
                        }
                      }}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Custom Category</option>
                    </select>

                    {(!CATEGORIES.includes(form.category) || customCategory) && (
                      <input
                        type="text"
                        placeholder="Enter custom category name..."
                        value={customCategory}
                        onChange={e => {
                          setCustomCategory(e.target.value);
                          setForm({ ...form, category: e.target.value });
                        }}
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-cyan-500/50 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      />
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value, isEnabled: e.target.value === 'active' })}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer capitalize"
                    >
                      {STATUSES.map(st => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)} {st === 'active' ? '(Visible on Landing Page)' : st === 'inactive' ? '(Hidden)' : '(Work in Progress)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-500">Lower numbers appear first in the landing page accordion list.</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 dark:text-white font-black text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save FAQ'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
