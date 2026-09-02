import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Trash2, Edit3, Eye, EyeOff,
  Save, X, RefreshCw, CheckCircle2, GripVertical,
  Copy, Search, MapPin, IndianRupee, Clock, Sparkles,
  AlertTriangle, Image, Globe, Brain,
  FolderOpen, Users,
  TrendingUp, RotateCcw
} from 'lucide-react';
import { DEFAULT_CAREERS_CMS, type CareersCMSConfig } from '../careers/CareersSection';
import { MediaPickerModal } from './MediaPickerModal';
import { API_URL, apiFetch } from '../../config/api.config';

const API = `${API_URL}/jobs`;
const API_CAREERS_CMS = `${API_URL}/careers/cms`;

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

const ICON_OPTIONS = [
  'Globe', 'Brain', 'GraduationCap', 'IndianRupee', 'HeartPulse',
  'TrendingUp', 'Laptop', 'Palmtree', 'Code2', 'Layers',
  'Palette', 'Briefcase', 'Megaphone', 'Headphones', 'Settings', 'Sparkles'
];

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
  const [cmsSubTab, setCmsSubTab] = useState<'hero' | 'benefits' | 'teams' | 'gallery'>('hero');

  const [cmsState, setCmsState] = useState<CareersCMSConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dezoryn_careers_cms');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...DEFAULT_CAREERS_CMS, ...parsed };
          }
        } catch {}
      }
    }
    return DEFAULT_CAREERS_CMS;
  });

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    type: 'gallery' | 'employee1' | 'employee2';
    index?: number;
  } | null>(null);

  const [items, setItems] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

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

  // Fetch Jobs from PostgreSQL
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data.sort((a: JobData, b: JobData) => a.order - b.order));
      }
    } catch {
      showMsg('error', 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Careers CMS from PostgreSQL
  const fetchCmsConfig = async () => {
    try {
      const res = await apiFetch(API_CAREERS_CMS, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        const fullConfig: CareersCMSConfig = {
          hero: { ...DEFAULT_CAREERS_CMS.hero, ...(data.data.hero || {}) },
          whyJoin: { ...DEFAULT_CAREERS_CMS.whyJoin, ...(data.data.whyJoin || {}) },
          teamsSection: { ...DEFAULT_CAREERS_CMS.teamsSection, ...(data.data.teamsSection || {}) },
          gallerySection: { ...DEFAULT_CAREERS_CMS.gallerySection, ...(data.data.gallerySection || {}) },
        };
        setCmsState(fullConfig);
        try {
          localStorage.setItem('dezoryn_careers_cms', JSON.stringify(fullConfig));
        } catch (_e) {}
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCmsConfig();

    window.addEventListener('focus', () => {
      fetchItems();
      fetchCmsConfig();
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchItems();
        fetchCmsConfig();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Save Careers CMS to PostgreSQL Database
  const saveCmsConfig = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(API_CAREERS_CMS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsState),
      });
      const data = await res.json();
      if (data.success) {
        setCmsState(data.data);
        try {
          localStorage.setItem('dezoryn_careers_cms', JSON.stringify(data.data));
        } catch (_e) {}
        window.dispatchEvent(new CustomEvent('dezoryn-careers-cms-update', { detail: data.data }));
        showMsg('success', 'Careers CMS saved permanently in PostgreSQL Database!');
      } else {
        showMsg('error', data.message || 'Failed to save Careers CMS');
      }
    } catch {
      showMsg('error', 'Error connecting to backend server');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Careers CMS to Factory Defaults
  const resetCmsConfig = async () => {
    if (!window.confirm('Are you sure you want to reset all Careers CMS content back to factory defaults?')) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`${API_CAREERS_CMS}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCmsState(data.data);
        try {
          localStorage.setItem('dezoryn_careers_cms', JSON.stringify(data.data));
        } catch (_e) {}
        window.dispatchEvent(new CustomEvent('dezoryn-careers-cms-update', { detail: data.data }));
        showMsg('info', 'Careers CMS reset to defaults in PostgreSQL.');
      } else {
        showMsg('error', data.message || 'Failed to reset CMS');
      }
    } catch {
      showMsg('error', 'Network error during reset');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Media Picker Select
  const handleMediaSelect = (url: string) => {
    if (!mediaPickerTarget) return;

    if (mediaPickerTarget.type === 'employee1') {
      setCmsState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          employeeBadge1: {
            name: prev.hero.employeeBadge1?.name || 'Anya Sharma',
            role: prev.hero.employeeBadge1?.role || 'Principal AI Architect',
            location: prev.hero.employeeBadge1?.location || 'San Francisco 🇺🇸',
            avatar: url,
          },
        },
      }));
    } else if (mediaPickerTarget.type === 'employee2') {
      setCmsState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          employeeBadge2: {
            name: prev.hero.employeeBadge2?.name || 'David Chen',
            role: prev.hero.employeeBadge2?.role || 'Lead Systems Engineer',
            location: prev.hero.employeeBadge2?.location || 'London 🇬🇧',
            avatar: url,
          },
        },
      }));
    } else if (mediaPickerTarget.type === 'gallery' && mediaPickerTarget.index !== undefined) {
      const idx = mediaPickerTarget.index;
      setCmsState((prev) => {
        const updated = [...prev.gallerySection.items];
        if (updated[idx]) {
          updated[idx] = { ...updated[idx], img: url };
        }
        return {
          ...prev,
          gallerySection: { ...prev.gallerySection, items: updated },
        };
      });
    }

    setMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  // Benefit card CRUD
  const handleAddBenefit = () => {
    const newB = {
      id: `b-${Date.now()}`,
      title: 'New Benefit Title',
      desc: 'Describe this company perk or benefit in detail here.',
      gradient: 'from-blue-600 to-cyan-500',
      badge: 'PERK',
      iconName: 'Sparkles',
    };
    setCmsState((prev) => ({
      ...prev,
      whyJoin: {
        ...prev.whyJoin,
        benefits: [...prev.whyJoin.benefits, newB],
      },
    }));
  };

  const handleDeleteBenefit = (idx: number) => {
    setCmsState((prev) => ({
      ...prev,
      whyJoin: {
        ...prev.whyJoin,
        benefits: prev.whyJoin.benefits.filter((_, i) => i !== idx),
      },
    }));
  };

  // Team department CRUD
  const handleAddTeam = () => {
    const newT = {
      id: `team-${Date.now()}`,
      name: 'New Department',
      desc: 'Describe the team mission, projects, and impact here.',
      teamSize: '10+ Members',
      openings: 2,
      gradient: 'from-blue-600 to-cyan-500',
      color: 'text-cyan-400',
      borderColor: 'hover:border-cyan-500/50',
      iconName: 'Code2',
    };
    setCmsState((prev) => ({
      ...prev,
      teamsSection: {
        ...prev.teamsSection,
        teams: [...prev.teamsSection.teams, newT],
      },
    }));
  };

  const handleDeleteTeam = (idx: number) => {
    setCmsState((prev) => ({
      ...prev,
      teamsSection: {
        ...prev.teamsSection,
        teams: prev.teamsSection.teams.filter((_, i) => i !== idx),
      },
    }));
  };

  // Gallery moment CRUD
  const handleAddGalleryMoment = () => {
    const newG = {
      id: `moment-${Date.now()}`,
      title: 'New Culture Moment',
      category: 'CULTURE & TEAM',
      tag: 'Team',
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      desc: 'Describe this team milestone, event, retreat, or workshop.',
    };
    setCmsState((prev) => ({
      ...prev,
      gallerySection: {
        ...prev.gallerySection,
        items: [...prev.gallerySection.items, newG],
      },
    }));
  };

  const handleDeleteGalleryMoment = (idx: number) => {
    setCmsState((prev) => ({
      ...prev,
      gallerySection: {
        ...prev.gallerySection,
        items: prev.gallerySection.items.filter((_, i) => i !== idx),
      },
    }));
  };

  // Open Job Creation Modal
  const openCreate = () => {
    setForm({ ...EMPTY_JOB, order: items.length });
    setReqsText('');
    setRespsText('');
    setCustomDept('');
    setModal({ mode: 'create' });
  };

  // Open Job Edit Modal
  const openEdit = (item: JobData) => {
    setForm({
      title: item.title,
      department: item.department,
      location: item.location,
      salary: item.salary,
      experience: item.experience,
      employmentType: item.employmentType,
      description: item.description,
      requirements: Array.isArray(item.requirements) ? item.requirements : [],
      responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
      status: item.status || 'active',
      closingDate: item.closingDate ? new Date(item.closingDate).toISOString().split('T')[0] : '',
      order: item.order,
      isEnabled: item.isEnabled,
    });
    setReqsText(Array.isArray(item.requirements) ? item.requirements.join('\n') : '');
    setRespsText(Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : '');
    setCustomDept(DEPARTMENTS.includes(item.department) ? '' : item.department);
    setModal({ mode: 'edit', item });
  };

  // Handle Save Job
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showMsg('error', 'Job Title is required');
      return;
    }
    if (!form.description.trim()) {
      showMsg('error', 'Job Description is required');
      return;
    }

    setIsSaving(true);
    const departmentToSave = customDept.trim() || form.department;
    const reqsArray = reqsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const respsArray = respsText.split('\n').map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...form,
      department: departmentToSave,
      requirements: reqsArray,
      responsibilities: respsArray,
      closingDate: form.closingDate ? new Date(form.closingDate) : null,
    };

    try {
      if (modal?.mode === 'create') {
        const res = await apiFetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showMsg('success', 'Job opening posted to PostgreSQL database!');
          setModal(null);
          fetchItems();
          window.dispatchEvent(new Event('dezoryn-jobs-updated'));
        } else {
          showMsg('error', data.message || 'Failed to create job');
        }
      } else if (modal?.mode === 'edit' && modal.item) {
        const res = await apiFetch(`${API}/${modal.item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showMsg('success', 'Job opening updated in PostgreSQL database!');
          setModal(null);
          fetchItems();
          window.dispatchEvent(new Event('dezoryn-jobs-updated'));
        } else {
          showMsg('error', data.message || 'Failed to update job');
        }
      }
    } catch {
      showMsg('error', 'Network error while saving job');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Job
  const handleDeleteJob = async (id: string) => {
    try {
      const res = await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMsg('delete', 'Job opening deleted from database');
        setDeleteConfirm(null);
        fetchItems();
        window.dispatchEvent(new Event('dezoryn-jobs-updated'));
      } else {
        showMsg('error', data.message || 'Failed to delete job');
      }
    } catch {
      showMsg('error', 'Network error while deleting job');
    }
  };

  // Handle Toggle Job Status
  const handleToggleStatus = async (item: JobData) => {
    try {
      const res = await apiFetch(`${API}/${item.id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showMsg('info', `Job status updated to ${data.data?.status || 'updated'}`);
        fetchItems();
        window.dispatchEvent(new Event('dezoryn-jobs-updated'));
      }
    } catch {
      showMsg('error', 'Failed to toggle status');
    }
  };

  // Handle Duplicate Job
  const handleDuplicateJob = async (id: string) => {
    try {
      const res = await apiFetch(`${API}/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Job opening duplicated');
        fetchItems();
        window.dispatchEvent(new Event('dezoryn-jobs-updated'));
      }
    } catch {
      showMsg('error', 'Failed to duplicate job');
    }
  };

  // Reordering handlers
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    setDraggedIdx(idx);
  };

  const handleDragEnter = (idx: number) => {
    dragOver.current = idx;
    setDropIdx(idx);
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      dragItem.current = null;
      dragOver.current = null;
      setDraggedIdx(null);
      setDropIdx(null);
      return;
    }

    const copy = [...items];
    const draggedItemContent = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOver.current, 0, draggedItemContent);

    const reorderedList = copy.map((item, index) => ({ ...item, order: index }));
    setItems(reorderedList);
    dragItem.current = null;
    dragOver.current = null;
    setDraggedIdx(null);
    setDropIdx(null);

    try {
      await apiFetch(`${API}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reorderedList.map((j) => j.id) }),
      });
      showMsg('success', 'Job list reordered and saved in PostgreSQL');
      window.dispatchEvent(new Event('dezoryn-jobs-updated'));
    } catch {
      showMsg('error', 'Failed to save new order');
    }
  };

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || item.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Toast Message Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-xs font-bold ${
              message.type === 'success'
                ? 'bg-emerald-500/90 text-white border-emerald-400'
                : message.type === 'error'
                ? 'bg-rose-500/90 text-white border-rose-400'
                : message.type === 'delete'
                ? 'bg-amber-500/90 text-white border-amber-400'
                : 'bg-blue-500/90 text-white border-blue-400'
            }`}
          >
            {message.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {message.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {message.type === 'delete' && <Trash2 className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Careers & Culture Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              100% dynamic, database-driven careers CMS and active job postings manager.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchItems();
              fetchCmsConfig();
              showMsg('info', 'Refreshed latest data from PostgreSQL database.');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {activeTab === 'jobs' ? (
            <button
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={resetCmsConfig}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={saveCmsConfig}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'jobs'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Postings ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'cms'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Careers Page CMS (Hero, Culture, Teams, Moments)</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CMS EDITOR TAB                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cms' ? (
        <div className="space-y-6 text-left">
          {/* Sub Tab Switcher */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-fit">
            <button
              onClick={() => setCmsSubTab('hero')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                cmsSubTab === 'hero'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Hero & Live Telemetry</span>
            </button>

            <button
              onClick={() => setCmsSubTab('benefits')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                cmsSubTab === 'benefits'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>2. Culture & Benefits ({cmsState.whyJoin.benefits.length})</span>
            </button>

            <button
              onClick={() => setCmsSubTab('teams')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                cmsSubTab === 'teams'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. Departments & Teams ({cmsState.teamsSection.teams.length})</span>
            </button>

            <button
              onClick={() => setCmsSubTab('gallery')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                cmsSubTab === 'gallery'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>4. Culture Moments Gallery ({cmsState.gallerySection.items.length})</span>
            </button>
          </div>

          {/* SUBTAB 1: HERO & TELEMETRY */}
          {cmsSubTab === 'hero' && (
            <div className="space-y-6">
              {/* Main Hero Copy Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Main Hero Content & Headings
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Badge Pill Text</label>
                    <input
                      type="text"
                      value={cmsState.hero.badgeText}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, badgeText: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Headline Prefix Text</label>
                    <input
                      type="text"
                      value={cmsState.hero.headlinePrefix}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, headlinePrefix: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Gradient Headline Words</label>
                    <input
                      type="text"
                      value={cmsState.hero.gradientWords}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, gradientWords: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Mission Description Paragraph</label>
                    <textarea
                      rows={3}
                      value={cmsState.hero.description}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, description: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={cmsState.hero.viewPositionsBtnText}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, viewPositionsBtnText: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={cmsState.hero.lifeAtDezorynBtnText}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, lifeAtDezorynBtnText: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Stat Counter Metrics */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Hero 4 Key Metric Counters
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {cmsState.hero.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-black text-cyan-500 uppercase">Stat #{sIdx + 1}</span>
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const updated = [...cmsState.hero.stats];
                            updated[sIdx].label = e.target.value;
                            setCmsState({ ...cmsState, hero: { ...cmsState.hero, stats: updated } });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Target Value</label>
                          <input
                            type="number"
                            step="any"
                            value={stat.target}
                            onChange={(e) => {
                              const updated = [...cmsState.hero.stats];
                              updated[sIdx].target = Number(e.target.value);
                              setCmsState({ ...cmsState, hero: { ...cmsState.hero, stats: updated } });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400 font-extrabold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Suffix (e.g. +, %)</label>
                          <input
                            type="text"
                            value={stat.suffix}
                            onChange={(e) => {
                              const updated = [...cmsState.hero.stats];
                              updated[sIdx].suffix = e.target.value;
                              setCmsState({ ...cmsState, hero: { ...cmsState.hero, stats: updated } });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D Right Column Telemetry & Floating Employee Profiles */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Hero Interactive AI Telemetry & Floating Team Badges
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Engine Name / Version</label>
                    <input
                      type="text"
                      value={cmsState.hero.engineVersion}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, engineVersion: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Engine Status Pill</label>
                    <input
                      type="text"
                      value={cmsState.hero.engineStatus}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, engineStatus: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Latency SLA Badge</label>
                    <input
                      type="text"
                      value={cmsState.hero.engineLatency}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, engineLatency: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-cyan-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Vector Embeddings Metric</label>
                    <input
                      type="text"
                      value={cmsState.hero.vectorQPS}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, vectorQPS: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Accuracy Score SLA</label>
                    <input
                      type="text"
                      value={cmsState.hero.accuracySLA}
                      onChange={(e) => setCmsState({ ...cmsState, hero: { ...cmsState.hero, accuracySLA: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-400 font-semibold"
                    />
                  </div>
                </div>

                {/* Floating Employee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {/* Employee 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/30 space-y-3">
                    <span className="text-[11px] font-black text-cyan-400 uppercase">Floating Profile Card 1 (Top Left)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Employee Name"
                        value={cmsState.hero.employeeBadge1?.name || ''}
                        onChange={(e) =>
                          setCmsState({
                            ...cmsState,
                            hero: {
                              ...cmsState.hero,
                              employeeBadge1: { ...cmsState.hero.employeeBadge1!, name: e.target.value },
                            },
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Role Title"
                        value={cmsState.hero.employeeBadge1?.role || ''}
                        onChange={(e) =>
                          setCmsState({
                            ...cmsState,
                            hero: {
                              ...cmsState.hero,
                              employeeBadge1: { ...cmsState.hero.employeeBadge1!, role: e.target.value },
                            },
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400 font-bold"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Location"
                        value={cmsState.hero.employeeBadge1?.location || ''}
                        onChange={(e) =>
                          setCmsState({
                            ...cmsState,
                            hero: {
                              ...cmsState.hero,
                              employeeBadge1: { ...cmsState.hero.employeeBadge1!, location: e.target.value },
                            },
                          })
                        }
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget({ type: 'employee1' });
                          setMediaPickerOpen(true);
                        }}
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 font-bold border border-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Pick Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Employee 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-purple-500/30 space-y-3">
                    <span className="text-[11px] font-black text-purple-400 uppercase">Floating Profile Card 2 (Bottom Right)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Employee Name"
                        value={cmsState.hero.employeeBadge2?.name || ''}
                        onChange={(e) =>
                          setCmsState({
                            ...cmsState,
                            hero: {
                              ...cmsState.hero,
                              employeeBadge2: { ...cmsState.hero.employeeBadge2!, name: e.target.value },
                            },
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Role Title"
                        value={cmsState.hero.employeeBadge2?.role || ''}
                        onChange={(e) =>
                          setCmsState({
                            ...cmsState,
                            hero: {
                              ...cmsState.hero,
                              employeeBadge2: { ...cmsState.hero.employeeBadge2!, role: e.target.value },
                            },
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-purple-400 font-bold"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Location"
                        value={cmsState.hero.employeeBadge2?.location || ''}
                        onChange={(e) =>
                          setCmsState({
                            ...cmsState,
                            hero: {
                              ...cmsState.hero,
                              employeeBadge2: { ...cmsState.hero.employeeBadge2!, location: e.target.value },
                            },
                          })
                        }
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget({ type: 'employee2' });
                          setMediaPickerOpen(true);
                        }}
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Pick Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: CULTURE & BENEFITS */}
          {cmsSubTab === 'benefits' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Culture & Benefits Section Content
                </span>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Benefit Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={cmsState.whyJoin.badgeText}
                    onChange={(e) => setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, badgeText: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={cmsState.whyJoin.title}
                    onChange={(e) => setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, title: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={cmsState.whyJoin.subtitle}
                    onChange={(e) => setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, subtitle: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Benefit Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3">
                {cmsState.whyJoin.benefits.map((b, bIdx) => (
                  <div key={b.id || bIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs relative group">
                    <button
                      type="button"
                      onClick={() => handleDeleteBenefit(bIdx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Delete Benefit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Benefit Title</label>
                      <input
                        type="text"
                        value={b.title}
                        onChange={(e) => {
                          const updated = [...cmsState.whyJoin.benefits];
                          updated[bIdx].title = e.target.value;
                          setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Pill Badge</label>
                        <input
                          type="text"
                          value={b.badge}
                          onChange={(e) => {
                            const updated = [...cmsState.whyJoin.benefits];
                            updated[bIdx].badge = e.target.value;
                            setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-purple-400 font-bold text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Icon</label>
                        <select
                          value={b.iconName}
                          onChange={(e) => {
                            const updated = [...cmsState.whyJoin.benefits];
                            updated[bIdx].iconName = e.target.value;
                            setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-[10px]"
                        >
                          {ICON_OPTIONS.map((ic) => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Description</label>
                      <textarea
                        rows={2}
                        value={b.desc}
                        onChange={(e) => {
                          const updated = [...cmsState.whyJoin.benefits];
                          updated[bIdx].desc = e.target.value;
                          setCmsState({ ...cmsState, whyJoin: { ...cmsState.whyJoin, benefits: updated } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 3: DEPARTMENTS & TEAMS */}
          {cmsSubTab === 'teams' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Organization & Department Teams Content
                </span>
                <button
                  type="button"
                  onClick={handleAddTeam}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Department Team</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={cmsState.teamsSection.title}
                    onChange={(e) => setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, title: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={cmsState.teamsSection.subtitle}
                    onChange={(e) => setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, subtitle: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Team Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3">
                {cmsState.teamsSection.teams.map((t, tIdx) => (
                  <div key={t.id || tIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs relative group">
                    <button
                      type="button"
                      onClick={() => handleDeleteTeam(tIdx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Department Name</label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => {
                          const updated = [...cmsState.teamsSection.teams];
                          updated[tIdx].name = e.target.value;
                          setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Team Size</label>
                        <input
                          type="text"
                          value={t.teamSize}
                          onChange={(e) => {
                            const updated = [...cmsState.teamsSection.teams];
                            updated[tIdx].teamSize = e.target.value;
                            setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400 font-extrabold text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Open Positions</label>
                        <input
                          type="number"
                          value={t.openings}
                          onChange={(e) => {
                            const updated = [...cmsState.teamsSection.teams];
                            updated[tIdx].openings = Number(e.target.value);
                            setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-400 font-extrabold text-[10px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Description</label>
                      <textarea
                        rows={2}
                        value={t.desc}
                        onChange={(e) => {
                          const updated = [...cmsState.teamsSection.teams];
                          updated[tIdx].desc = e.target.value;
                          setCmsState({ ...cmsState, teamsSection: { ...cmsState.teamsSection, teams: updated } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 4: CULTURE MOMENTS GALLERY */}
          {cmsSubTab === 'gallery' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Life at Dezoryn Gallery Moments
                </span>
                <button
                  type="button"
                  onClick={handleAddGalleryMoment}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Culture Photo Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={cmsState.gallerySection.title}
                    onChange={(e) => setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, title: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={cmsState.gallerySection.subtitle}
                    onChange={(e) => setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, subtitle: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Gallery Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                {cmsState.gallerySection.items.map((g, gIdx) => (
                  <div key={g.id || gIdx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs relative group">
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryMoment(gIdx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer z-10"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-28 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800 bg-slate-900">
                      <img src={g.img || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'} alt={g.title} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 text-cyan-300 text-[9px] font-extrabold border border-cyan-500/30 backdrop-blur-md">
                        {g.tag || 'Moment'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget({ type: 'gallery', index: gIdx });
                          setMediaPickerOpen(true);
                        }}
                        className="absolute bottom-1.5 right-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-600 text-white text-[10px] font-bold border border-white/20 transition cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Moment Title</label>
                      <input
                        type="text"
                        value={g.title}
                        onChange={(e) => {
                          const updated = [...cmsState.gallerySection.items];
                          updated[gIdx].title = e.target.value;
                          setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, items: updated } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Tag Filter</label>
                        <input
                          type="text"
                          value={g.tag}
                          onChange={(e) => {
                            const updated = [...cmsState.gallerySection.items];
                            updated[gIdx].tag = e.target.value;
                            setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, items: updated } });
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-400 font-bold text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Category</label>
                        <input
                          type="text"
                          value={g.category}
                          onChange={(e) => {
                            const updated = [...cmsState.gallerySection.items];
                            updated[gIdx].category = e.target.value;
                            setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, items: updated } });
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 text-[10px] block mb-0.5">Description</label>
                      <textarea
                        rows={2}
                        value={g.desc}
                        onChange={(e) => {
                          const updated = [...cmsState.gallerySection.items];
                          updated[gIdx].desc = e.target.value;
                          setCmsState({ ...cmsState, gallerySection: { ...cmsState.gallerySection, items: updated } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <span className="text-xs text-slate-500 font-medium">
              Save your changes to publish immediately across all live Careers visitors.
            </span>
            <button
              type="button"
              onClick={saveCmsConfig}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Save All Careers CMS Changes'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* ACTIVE JOBS LISTING TAB                                       */
        /* ───────────────────────────────────────────────────────────── */
        <div className="space-y-6 text-left">
          {/* KPI Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{items.length}</div>
                <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Postings</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-500">{items.filter((j) => j.status === 'active' && j.isEnabled).length}</div>
                <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Openings</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-500">{items.filter((j) => j.status === 'draft').length}</div>
                <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Drafts</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <X className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-rose-500">{items.filter((j) => j.status === 'closed' || !j.isEnabled).length}</div>
                <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Closed / Disabled</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, department, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Job Postings List */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-bold text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
              Loading job postings from PostgreSQL database...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-base font-black text-slate-800 dark:text-slate-200">No Job Postings Found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active openings match your current search or filters. Click below to publish your first position.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                + Post Job Opening
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((job, idx) => (
                <div
                  key={job.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    draggedIdx === idx
                      ? 'opacity-40 border-cyan-500 scale-[0.98]'
                      : dropIdx === idx
                      ? 'border-cyan-400 bg-cyan-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-1">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {job.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {job.department}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            job.status === 'active' && job.isEnabled
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : job.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {job.status === 'active' && job.isEnabled ? 'Active' : job.status === 'draft' ? 'Draft' : 'Closed'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {job.employmentType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {job.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title={job.isEnabled ? 'Disable Posting' : 'Enable Posting'}
                    >
                      {job.isEnabled ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>

                    <button
                      onClick={() => handleDuplicateJob(job.id)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Duplicate Posting"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openEdit(job)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 hover:text-blue-600 transition cursor-pointer"
                      title="Edit Job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirm({ id: job.id, title: job.title })}
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* JOB POSTING CREATE / EDIT MODAL                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {modal.mode === 'create' ? 'Create New Job Opening' : 'Edit Job Opening'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Syncs directly with PostgreSQL and reflects immediately on /careers.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Systems AI Engineer"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="Custom">Custom Department...</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote (US / EU / APAC)"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Salary Range</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹15,00,000 - ₹22,00,000"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Employment Type</label>
                    <select
                      value={form.employmentType}
                      onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Experience Level</label>
                    <input
                      type="text"
                      placeholder="e.g. 3-5 Years"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Role Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the mission, day-to-day impact, and team context..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                      Key Responsibilities (One per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Architect distributed backend pipelines&#10;Lead core code reviews&#10;Deploy on AWS ECS"
                      value={respsText}
                      onChange={(e) => setRespsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                      Requirements & Skills (One per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Proficiency in Node.js & TypeScript&#10;Experience with PostgreSQL & Prisma&#10;Strong communication skills"
                      value={reqsText}
                      onChange={(e) => setReqsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value, isEnabled: e.target.value === 'active' })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Application Closing Date</label>
                    <input
                      type="date"
                      value={form.closingDate || ''}
                      onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : modal.mode === 'create' ? 'Publish Job' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white">Delete Job Opening?</h4>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-slate-200">"{deleteConfirm.title}"</strong> from PostgreSQL?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteJob(deleteConfirm.id)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setMediaPickerTarget(null);
        }}
        onSelect={handleMediaSelect}
        title="Select Media Asset from Library"
      />
    </div>
  );
};
export default AdminJobManager;
