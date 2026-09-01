import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, GripVertical,
  Copy, Search, Filter, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  MapPin, DollarSign, Clock, Calendar, Sparkles, Building2,
  CheckSquare, ListChecks, AlertTriangle, Image, Globe, Brain
} from 'lucide-react';
import { DEFAULT_CAREERS_CMS, type CareersCMSConfig } from '../careers/CareersSection';

import { API_URL, apiFetch } from '../../config/api.config';

const API = `${API_URL}/jobs`;


export interface JobData {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  experience: string;
  employmentType: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  status: string; // 'active' | 'draft' | 'closed'
  closingDate?: string | null;
  order: number;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const DEPARTMENTS = [
  'Engineering & AI',
  'Product & Design',
  'Sales & Marketing',
  'Customer Success',
  'Finance & Operations',
  'Human Resources'
];

const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Hybrid', 'Remote', 'Internship'];
const STATUSES = ['active', 'draft', 'closed'];

const EMPTY_JOB: Omit<JobData, 'id'> = {
  title: '',
  department: 'Engineering & AI',
  location: 'Remote (US/EU/APAC)',
  salary: '₹12,00,000 - ₹16,00,000 / yr',
  experience: '3+ Years',
  employmentType: 'Full-Time',
  description: '',
  requirements: [],
  responsibilities: [],
  status: 'active',
  closingDate: '',
  order: 0,
  isEnabled: true,
};

export const AdminJobManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'cms'>('jobs');
  const [cmsState, setCmsState] = useState<CareersCMSConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dezoryn_careers_cms');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_CAREERS_CMS;
  });

  const saveCmsConfig = () => {
    localStorage.setItem('dezoryn_careers_cms', JSON.stringify(cmsState));
    window.dispatchEvent(new CustomEvent('dezoryn-careers-cms-update', { detail: cmsState }));
    showMsg('success', 'Careers Page CMS updated live!');
  };

  const [items, setItems] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'delete'; text: string } | null>(null);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; item?: JobData } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const [form, setForm] = useState<Omit<JobData, 'id'>>(EMPTY_JOB);
  const [reqsText, setReqsText] = useState('');
  const [respsText, setRespsText] = useState('');
  const [customDept, setCustomDept] = useState('');

  // Drag and drop reordering
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showMsg = (type: 'success' | 'error' | 'info' | 'delete', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.sort((a: JobData, b: JobData) => a.order - b.order));
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
    setForm({ ...EMPTY_JOB, order: items.length });
    setReqsText('');
    setRespsText('');
    setCustomDept('');
    setModal({ mode: 'create' });
  };

  const openEdit = (item: JobData) => {
    setForm({
      title: item.title,
      department: item.department,
      location: item.location,
      salary: item.salary,
      experience: item.experience,
      employmentType: item.employmentType,
      description: item.description,
      requirements: item.requirements || [],
      responsibilities: item.responsibilities || [],
      status: item.status,
      closingDate: item.closingDate ? new Date(item.closingDate).toISOString().split('T')[0] : '',
      order: item.order,
      isEnabled: item.isEnabled,
    });

    setReqsText(Array.isArray(item.requirements) ? item.requirements.join('\n') : '');
    setRespsText(Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : '');

    if (!DEPARTMENTS.includes(item.department)) {
      setCustomDept(item.department);
    } else {
      setCustomDept('');
    }

    setModal({ mode: 'edit', item });
  };

  const closeModal = () => {
    setModal(null);
    setCustomDept('');
    setReqsText('');
    setRespsText('');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      showMsg('error', 'Job Title, Location, and Description are required');
      return;
    }

    const finalDept = customDept.trim() || form.department || 'Engineering & AI';
    const reqsArray = reqsText.split('\n').map(s => s.trim()).filter(Boolean);
    const respsArray = respsText.split('\n').map(s => s.trim()).filter(Boolean);

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        department: finalDept,
        requirements: reqsArray,
        responsibilities: respsArray,
        closingDate: form.closingDate ? new Date(form.closingDate).toISOString() : null,
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
        showMsg('success', modal?.mode === 'edit' ? 'Job posting updated' : 'Job posting published');
        closeModal();
        fetchItems();
        window.dispatchEvent(new CustomEvent('dezoryn-jobs-updated'));
      } else {
        showMsg('error', data.message || 'Operation failed');
      }
    } catch {
      showMsg('error', 'Network error occurred while saving job');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: string, titleText: string) => {
    setDeleteConfirm({ id, title: titleText });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await apiFetch(`${API}/${deleteConfirm.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMsg('delete', `Job "${deleteConfirm.title}" successfully deleted from PostgreSQL database`);
        setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
        window.dispatchEvent(new CustomEvent('dezoryn-jobs-updated'));
      } else {
        showMsg('error', data.message || 'Failed to delete');
      }
    } catch {
      showMsg('error', 'Error deleting job opening');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = async (item: JobData) => {
    try {
      const res = await apiFetch(`${API}/${item.id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showMsg('info', `Status toggled to ${data.data.status}`);
        setItems(prev => prev.map(i => i.id === item.id ? data.data : i));
        window.dispatchEvent(new CustomEvent('dezoryn-jobs-updated'));
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
        showMsg('success', 'Job posting duplicated');
        fetchItems();
        window.dispatchEvent(new CustomEvent('dezoryn-jobs-updated'));
      }
    } catch {
      showMsg('error', 'Failed to duplicate job');
    }
  };

  // Move up/down ordering
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

  const saveOrder = async (orderedList: JobData[]) => {
    try {
      const orderedIds = orderedList.map(i => i.id);
      await apiFetch(`${API}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      showMsg('success', 'Display order updated');
    } catch {
      showMsg('error', 'Failed to save order');
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
    const matchesDept = selectedDept === 'All' || item.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const departmentList = Array.from(new Set(['All', ...DEPARTMENTS, ...items.map(i => i.department)]));

  const getDeptStyle = (dept: string) => {
    const d = dept.toLowerCase();
    if (d.includes('engineering') || d.includes('ai')) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
    if (d.includes('product') || d.includes('design')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
    if (d.includes('sales') || d.includes('marketing')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (d.includes('customer') || d.includes('success')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-40 h-40 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Briefcase className="w-4 h-4" />
            <span>Talent Acquisition & Open Positions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Careers & Job Openings
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Manage active job postings, custom departments, remote tiers, salaries, requirements, and closing dates in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={fetchItems}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Refresh Jobs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed bottom-8 right-8 z-50 px-4 py-3.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-2xl flex items-center gap-3 max-w-md ${
              message.type === 'delete'
                ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                : message.type === 'error'
                ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                : message.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-slate-900/95 text-white border-cyan-500/40 shadow-cyan-500/10'
            }`}
          >
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${
              message.type === 'delete'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : message.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : message.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}>
              {message.type === 'delete' ? 'DELETED' : message.type === 'success' ? 'SUCCESS' : message.type === 'error' ? 'ERROR' : 'NOTICE'}
            </span>

            <span className="flex-1 leading-snug">{message.text}</span>

            <button
              type="button"
              onClick={() => setMessage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION TAB NAVIGATION */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Active Job Postings ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cms')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'cms'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Careers Page CMS Customizer</span>
        </button>
      </div>

      {activeTab === 'cms' ? (
        /* CAREERS PAGE CMS EDITOR TAB */
        <div className="space-y-8 text-left">
          
          {/* Header Action Strip */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Live Careers CMS Page Customizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Customize hero headlines, benefit cards, department details, and culture gallery photos without touching code.
              </p>
            </div>

            <button
              type="button"
              onClick={saveCmsConfig}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>
          </div>

          {/* 1. HERO SECTION CMS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-500 font-black text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Hero Section CMS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Badge Text</label>
                <input
                  type="text"
                  value={cmsState.hero.badgeText}
                  onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, badgeText: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Headline Prefix</label>
                <input
                  type="text"
                  value={cmsState.hero.headlinePrefix}
                  onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, headlinePrefix: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Gradient Words</label>
                <input
                  type="text"
                  value={cmsState.hero.gradientWords}
                  onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, gradientWords: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Mission Description</label>
                <textarea
                  rows={2}
                  value={cmsState.hero.description}
                  onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, description: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 2. WHY JOIN BENEFITS CMS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-500 font-black text-sm uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>Why Join Dezoryn (Benefits Grid CMS)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Badge</label>
                <input
                  type="text"
                  value={cmsState.whyJoin.badgeText}
                  onChange={(e) => setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, badgeText: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={cmsState.whyJoin.title}
                  onChange={(e) => setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, title: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={cmsState.whyJoin.subtitle}
                  onChange={(e) => setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, subtitle: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {cmsState.whyJoin.benefits.map((b, idx) => (
                <div key={b.id || idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => {
                      const updated = [...cmsState.whyJoin.benefits];
                      updated[idx].title = e.target.value;
                      setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black"
                  />
                  <input
                    type="text"
                    value={b.badge}
                    onChange={(e) => {
                      const updated = [...cmsState.whyJoin.benefits];
                      updated[idx].badge = e.target.value;
                      setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-500 font-bold text-[10px]"
                  />
                  <textarea
                    rows={2}
                    value={b.desc}
                    onChange={(e) => {
                      const updated = [...cmsState.whyJoin.benefits];
                      updated[idx].desc = e.target.value;
                      setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. MEET OUR TEAMS CMS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-500 font-black text-sm uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Meet Our Teams CMS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={cmsState.teamsSection.title}
                  onChange={(e) => setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, title: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={cmsState.teamsSection.subtitle}
                  onChange={(e) => setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, subtitle: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {cmsState.teamsSection.teams.map((t, idx) => (
                <div key={t.id || idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const updated = [...cmsState.teamsSection.teams];
                      updated[idx].name = e.target.value;
                      setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={t.teamSize}
                      onChange={(e) => {
                        const updated = [...cmsState.teamsSection.teams];
                        updated[idx].teamSize = e.target.value;
                        setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                      }}
                      className="w-1/2 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400 font-extrabold text-[10px]"
                    />
                    <input
                      type="number"
                      value={t.openings}
                      onChange={(e) => {
                        const updated = [...cmsState.teamsSection.teams];
                        updated[idx].openings = Number(e.target.value);
                        setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                      }}
                      className="w-1/2 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-400 font-extrabold text-[10px]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={t.desc}
                    onChange={(e) => {
                      const updated = [...cmsState.teamsSection.teams];
                      updated[idx].desc = e.target.value;
                      setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4. LIFE AT DEZORYN GALLERY CMS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 font-black text-sm uppercase tracking-wider">
              <Image className="w-4 h-4" />
              <span>Life at Dezoryn Gallery CMS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={cmsState.gallerySection.title}
                  onChange={(e) => setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, title: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={cmsState.gallerySection.subtitle}
                  onChange={(e) => setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, subtitle: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {cmsState.gallerySection.items.map((g, idx) => (
                <div key={g.id || idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="h-20 rounded-xl overflow-hidden relative">
                    <img src={g.img} alt={g.title} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                      {g.tag}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={g.title}
                    onChange={(e) => {
                      const updated = [...cmsState.gallerySection.items];
                      updated[idx].title = e.target.value;
                      setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, items: updated } });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black"
                  />

                  <input
                    type="text"
                    value={g.img}
                    onChange={(e) => {
                      const updated = [...cmsState.gallerySection.items];
                      updated[idx].img = e.target.value;
                      setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, items: updated } });
                    }}
                    placeholder="Image URL..."
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400 text-[10px] font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={saveCmsConfig}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs shadow-lg transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save All Careers CMS Changes</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ACTIVE JOBS LISTING TAB */
        <>
          {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-400 dark:hover:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{items.length}</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Postings</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-400 dark:hover:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.status === 'active').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Openings</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-400 dark:hover:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {new Set(items.map(i => i.department)).size}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Departments</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-400 dark:hover:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.status === 'draft' || i.status === 'closed').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Closed / Drafts</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs by title, dept, location..."
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
            <span>Dept:</span>
          </div>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            {departmentList.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer capitalize"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Managed Jobs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <span>Active & Managed Job Postings ({filteredItems.length})</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 font-semibold">Drag handle or use arrows to reorder display sequence</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading job postings...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No job postings found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try creating a new job opening or adjusting filters.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isExpanded = expandedJobId === item.id;
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
                className={`group p-5 rounded-2xl bg-white dark:bg-slate-900/80 border transition-all duration-200 ${
                  isDragging ? 'opacity-40 scale-[0.99] border-dashed border-cyan-500' : ''
                } ${
                  isDropTarget ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-300 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left drag handle + order badge + job info */}
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
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getDeptStyle(item.department)}`}>
                          {item.department}
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

                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                          {item.employmentType}
                        </span>
                      </div>

                      <h3
                        onClick={() => setExpandedJobId(isExpanded ? null : item.id)}
                        className="text-base font-black text-slate-900 dark:text-white cursor-pointer hover:text-cyan-400 transition"
                      >
                        {item.title}
                      </h3>

                      {/* Details pills */}
                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{item.salary}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-purple-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Exp: {item.experience}</span>
                        </div>

                        {item.closingDate && (
                          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Calendar className="w-3 h-3" />
                            <span>Closes: {new Date(item.closingDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
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
                      onClick={() => setExpandedJobId(isExpanded ? null : item.id)}
                      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand preview'}
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
                      title={item.status === 'active' ? 'Close Posting' : 'Activate Posting'}
                    >
                      {item.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(item.id)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
                      title="Duplicate Posting"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition cursor-pointer"
                      title="Edit Posting"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => confirmDelete(item.id, item.title)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4 text-xs text-slate-600 dark:text-slate-300 pl-10">
                        {/* Description */}
                        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Job Description</div>
                          <p className="leading-relaxed font-medium text-slate-600 dark:text-slate-300">{item.description}</p>
                        </div>

                        {/* Responsibilities & Requirements Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Responsibilities */}
                          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80">
                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-1.5">
                              <ListChecks className="w-3.5 h-3.5" />
                              <span>Key Responsibilities ({item.responsibilities?.length || 0})</span>
                            </div>
                            <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300 font-medium">
                              {item.responsibilities?.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Requirements */}
                          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Job Requirements ({item.requirements?.length || 0})</span>
                            </div>
                            <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300 font-medium">
                              {item.requirements?.map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>
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
      </>
      )}

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
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Job Opening?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white">"{deleteConfirm.title}"</span>? This job posting will be removed from your careers portal.
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
              className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {modal.mode === 'create' ? 'Post New Job Opening' : 'Edit Job Posting'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configure title, department, salary, requirements, and closing date</p>
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
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack AI Engineer"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                  />
                </div>

                {/* Department, Location & Employment Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Department
                    </label>
                    <select
                      value={DEPARTMENTS.includes(form.department) ? form.department : 'custom'}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setForm({ ...form, department: customDept || 'Custom' });
                        } else {
                          setForm({ ...form, department: val });
                          setCustomDept('');
                        }
                      }}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                      <option value="custom">+ Custom Department</option>
                    </select>

                    {(!DEPARTMENTS.includes(form.department) || customDept) && (
                      <input
                        type="text"
                        placeholder="Custom dept name..."
                        value={customDept}
                        onChange={e => {
                          setCustomDept(e.target.value);
                          setForm({ ...form, department: e.target.value });
                        }}
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-cyan-500/50 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      />
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Location <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Remote (US/EU) or Hybrid (NY)"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  {/* Employment Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Employment Type
                    </label>
                    <select
                      value={form.employmentType}
                      onChange={e => setForm({ ...form, employmentType: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {EMPLOYMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary, Experience & Closing Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Salary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹13,00,000 - ₹17,00,000 / yr"
                      value={form.salary}
                      onChange={e => setForm({ ...form, salary: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Required Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4+ Years"
                      value={form.experience}
                      onChange={e => setForm({ ...form, experience: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  {/* Closing Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Closing Date</span>
                    </label>
                    <input
                      type="date"
                      value={form.closingDate || ''}
                      onChange={e => setForm({ ...form, closingDate: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide role summary and team overview..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition resize-none"
                  />
                </div>

                {/* Responsibilities */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Responsibilities (One per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Architect scalable workflows&#10;Develop reactive front-end dashboards&#10;Optimize API latencies"
                    value={respsText}
                    onChange={e => setRespsText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-900 dark:text-white outline-none transition resize-none"
                  />
                </div>

                {/* Requirements */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Requirements (One per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Strong proficiency in TypeScript, React, Node.js&#10;3+ years SaaS experience&#10;PostgreSQL database experience"
                    value={reqsText}
                    onChange={e => setReqsText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-900 dark:text-white outline-none transition resize-none"
                  />
                </div>

                {/* Status & Display Order Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          {st.charAt(0).toUpperCase() + st.slice(1)} {st === 'active' ? '(Visible on Landing Page)' : st === 'draft' ? '(Draft Posting)' : '(Closed Position)'}
                        </option>
                      ))}
                    </select>
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
                  </div>
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
                  <span>{isSaving ? 'Saving...' : 'Save Job Posting'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
