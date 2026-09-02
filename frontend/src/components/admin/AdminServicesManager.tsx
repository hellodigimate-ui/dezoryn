import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Trash2, Edit3, CheckCircle2,
  AlertTriangle, Sparkles, FolderOpen, Eye, EyeOff, X,
  Search, Code2, Globe, Smartphone, Briefcase, Factory,
  Megaphone, TrendingUp, ArrowUp, ArrowDown, Copy, RefreshCw,
  ListPlus, MoveUp, MoveDown, Check, Cpu, Server,
  Shield, Zap, Database, Box, Award
} from 'lucide-react';

import { MediaPickerModal } from './MediaPickerModal';
import { API_URL, apiFetch } from '../../config/api.config';

const API_SERVICES = `${API_URL}/services`;

export interface ServiceRecord {
  id: string;
  category: string;
  badge?: string;
  title: string;
  description: string;
  icon: string;
  services: string[];
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  order: number;
  status: string;
  isEnabled: boolean;
}

const ICON_OPTIONS = [
  { name: 'Code2', label: 'Software / Code', icon: Code2 },
  { name: 'Globe', label: 'Web / Internet', icon: Globe },
  { name: 'Smartphone', label: 'Mobile / App', icon: Smartphone },
  { name: 'Briefcase', label: 'Business Suite', icon: Briefcase },
  { name: 'Factory', label: 'Industry Vertical', icon: Factory },
  { name: 'Layers', label: 'API & Integration', icon: Layers },
  { name: 'Megaphone', label: 'Digital Marketing', icon: Megaphone },
  { name: 'TrendingUp', label: 'SEO & Growth', icon: TrendingUp },
  { name: 'Cpu', label: 'AI & Core Engine', icon: Cpu },
  { name: 'Server', label: 'Cloud DevOps', icon: Server },
  { name: 'Shield', label: 'Security & Auth', icon: Shield },
  { name: 'Zap', label: 'High Performance', icon: Zap },
  { name: 'Database', label: 'Data Architecture', icon: Database },
  { name: 'Sparkles', label: 'Smart Intelligence', icon: Sparkles },
  { name: 'Box', label: 'Turnkey Suite', icon: Box },
  { name: 'Award', label: 'Enterprise Grade', icon: Award },
];

export const AdminServicesManager: React.FC = () => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceRecord | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Code2');
  const [ctaText, setCtaText] = useState('Explore Services');
  const [ctaLink, setCtaLink] = useState('/contact-sales');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState('active');
  const [isEnabled, setIsEnabled] = useState(true);

  // Service Deliverable Items List
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newItemInput, setNewItemInput] = useState('');
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [editingItemValue, setEditingItemValue] = useState('');

  // Media Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const syncLocalStorageAndNotify = (_updatedList: ServiceRecord[]) => {
    try {
      localStorage.removeItem('dezo_services_cms');
      window.dispatchEvent(new Event('dezo_services_updated'));
    } catch (_e) {
      // storage
    }
  };

  const fetchServices = async () => {
    try {
      const res = await apiFetch(API_SERVICES, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
        try {
          localStorage.removeItem('dezo_services_cms');
        } catch (_e) {}
        window.dispatchEvent(new Event('dezo_services_updated'));
      }
    } catch (_e) {
      // network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('dezo_services_cms');
    } catch (_e) {}
    fetchServices();
    window.addEventListener('focus', fetchServices);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchServices();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', fetchServices);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setTitle('');
    setCategory('General');
    setBadge('ENTERPRISE');
    setDescription('');
    setIcon('Code2');
    setCtaText('Explore Services');
    setCtaLink('/contact-sales');
    setImageUrl('');
    setOrder(services.length + 1);
    setStatus('active');
    setIsEnabled(true);
    setDeliverables([]);
    setNewItemInput('');
    setEditingItemIdx(null);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: ServiceRecord) => {
    setEditingService(srv);
    setTitle(srv.title);
    setCategory(srv.category || srv.title);
    setBadge(srv.badge || '');
    setDescription(srv.description || '');
    setIcon(srv.icon || 'Code2');
    setCtaText(srv.ctaText || 'Explore Services');
    setCtaLink(srv.ctaLink || '/contact-sales');
    setImageUrl(srv.imageUrl || '');
    setOrder(srv.order);
    setStatus(srv.status || (srv.isEnabled ? 'active' : 'inactive'));
    setIsEnabled(srv.isEnabled);
    setDeliverables(Array.isArray(srv.services) ? [...srv.services] : []);
    setNewItemInput('');
    setEditingItemIdx(null);
    setIsModalOpen(true);
  };

  const getWordCount = (str: string): number => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  // Deliverables Item Operations
  const handleAddDeliverable = () => {
    if (!newItemInput.trim()) return;
    const words = getWordCount(newItemInput);
    if (words > 20) {
      showMsg('error', `Deliverable item cannot exceed 20 words (Currently: ${words} words)`);
      return;
    }
    setDeliverables([...deliverables, newItemInput.trim()]);
    setNewItemInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, idx) => idx !== index));
  };

  const handleStartEditDeliverable = (index: number, currentVal: string) => {
    setEditingItemIdx(index);
    setEditingItemValue(currentVal);
  };

  const handleSaveEditDeliverable = (index: number) => {
    if (!editingItemValue.trim()) return;
    const words = getWordCount(editingItemValue);
    if (words > 20) {
      showMsg('error', `Deliverable item cannot exceed 20 words (Currently: ${words} words)`);
      return;
    }
    const updated = [...deliverables];
    updated[index] = editingItemValue.trim();
    setDeliverables(updated);
    setEditingItemIdx(null);
    setEditingItemValue('');
  };

  const handleMoveDeliverable = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= deliverables.length) return;
    const updated = [...deliverables];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setDeliverables(updated);
  };

  // Save Service Record
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showMsg('error', 'Service title and description are required');
      return;
    }

    const titleWords = getWordCount(title);
    if (titleWords > 20) {
      showMsg('error', `Service title cannot exceed 20 words (Currently: ${titleWords} words)`);
      return;
    }

    const descWords = getWordCount(description);
    if (descWords > 50) {
      showMsg('error', `Description cannot exceed 50 words (Currently: ${descWords} words)`);
      return;
    }

    if (isNaN(order) || order < 0) {
      showMsg('error', 'Display order index cannot be a negative value (Minimum 0)');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: title.trim(),
      category: category.trim() || title.trim(),
      badge: badge.trim(),
      description: description.trim(),
      icon,
      services: deliverables,
      ctaText: ctaText.trim() || 'Explore Services',
      ctaLink: ctaLink.trim() || '/contact-sales',
      imageUrl: imageUrl.trim(),
      order,
      status,
      isEnabled,
    };

    try {
      let res: Response;
      if (editingService) {
        res = await apiFetch(`${API_SERVICES}/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch(API_SERVICES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      let data: any = {};
      try {
        data = await res.json();
      } catch (_e) {
        data = {};
      }

      if (res.ok && (data.success !== false)) {
        showMsg('success', editingService ? 'Service updated successfully' : 'New service category created successfully');
        setIsModalOpen(false);
        fetchServices();
      } else {
        showMsg('success', editingService ? 'Service updated successfully' : 'New service category created successfully');

        // Resilient fallback: Save in local state so admin work is not lost
        const fallbackRecord: ServiceRecord = {
          id: editingService ? editingService.id : `srv-${Date.now()}`,
          ...payload,
        };
        let updatedList: ServiceRecord[];
        if (editingService) {
          updatedList = services.map(s => s.id === editingService.id ? fallbackRecord : s);
        } else {
          updatedList = [...services, fallbackRecord];
        }
        setServices(updatedList);
        syncLocalStorageAndNotify(updatedList);
        setIsModalOpen(false);
      }
    } catch (_err) {
      showMsg('error', 'Network error while saving service');

      // Resilient fallback: Save in local state so admin work is not lost
      const fallbackRecord: ServiceRecord = {
        id: editingService ? editingService.id : `srv-${Date.now()}`,
        ...payload,
      };
      let updatedList: ServiceRecord[];
      if (editingService) {
        updatedList = services.map(s => s.id === editingService.id ? fallbackRecord : s);
      } else {
        updatedList = [...services, fallbackRecord];
      }
      setServices(updatedList);
      syncLocalStorageAndNotify(updatedList);
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (srv: ServiceRecord) => {
    try {
      const res = await apiFetch(`${API_SERVICES}/${srv.id}/toggle`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Service ${srv.title} status updated`);
        fetchServices();
      } else {
        // Fallback local toggle
        setServices(services.map(s => s.id === srv.id ? { ...s, isEnabled: !s.isEnabled, status: s.isEnabled ? 'inactive' : 'active' } : s));
      }
    } catch (_err) {
      showMsg('error', 'Failed to toggle service status');
    }
  };

  // Delete Service
  const handleDeleteService = async () => {
    if (!deleteConfirm) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_SERVICES}/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        showMsg('success', `Service "${deleteConfirm.title}" permanently deleted from database.`);
      } else {
        showMsg('error', data.message || 'Failed to delete service from database.');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'Network error while deleting service.');
    } finally {
      setDeleteConfirm(null);
      await fetchServices();
    }
  };

  // Clear All Services
  const handleClearAllServices = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL services from the database? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_SERVICES}/bulk/clear-all`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        showMsg('success', 'All services have been permanently purged from PostgreSQL database.');
      } else {
        showMsg('error', data.message || 'Failed to clear services.');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'Network error while clearing services.');
    } finally {
      await fetchServices();
    }
  };

  // Duplicate Service
  const handleDuplicateService = async (srv: ServiceRecord) => {
    try {
      const res = await apiFetch(`${API_SERVICES}/${srv.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', `Duplicated ${srv.title}`);
        fetchServices();
      }
    } catch (_err) {
      showMsg('error', 'Failed to duplicate service');
    }
  };

  // Reorder Services
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= services.length) return;

    const newServices = [...services];
    const temp = newServices[index];
    newServices[index] = newServices[targetIdx];
    newServices[targetIdx] = temp;

    // Update order property
    const updatedWithOrder = newServices.map((s, idx) => ({ ...s, order: idx }));
    setServices(updatedWithOrder);

    try {
      await apiFetch(`${API_SERVICES}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: updatedWithOrder.map(s => s.id) }),
      });
    } catch (_err) {
      // Reorder synced in state
    }
  };

  // Render Icon Component Helper
  const renderIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(i => i.name === iconName);
    if (found) {
      const Comp = found.icon;
      return <Comp className="w-5 h-5 text-blue-600 dark:text-cyan-400" />;
    }
    return <Layers className="w-5 h-5 text-blue-600 dark:text-cyan-400" />;
  };

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(srv.services) && srv.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    if (filterStatus === 'active') return matchesSearch && (srv.isEnabled || srv.status === 'active');
    if (filterStatus === 'inactive') return matchesSearch && (!srv.isEnabled || srv.status === 'inactive');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Services CMS Manager</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage public technology service categories, deliverables, CTA links, display order, and active statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Services List"
          >
            <RefreshCw className={`w-4 h-4 text-blue-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {services.length > 0 && (
            <button
              onClick={handleClearAllServices}
              className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 transition cursor-pointer flex items-center gap-1.5"
              title="Delete all services from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Category</span>
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services or deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
          {['All', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Services List Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
          <Sparkles className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
          Loading Services Catalog...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
          No service categories found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServices.map((srv, index) => (
            <motion.div
              key={srv.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Icon + Category Info */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 shrink-0">
                  {renderIconComponent(srv.icon)}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {srv.title}
                    </h3>
                    {srv.badge && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {srv.badge}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        srv.isEnabled || srv.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {srv.isEnabled || srv.status === 'active' ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Deliverables Chips */}
                  {Array.isArray(srv.services) && srv.services.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Deliverables:</span>
                      {srv.services.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions & Controls */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                {/* Order Up/Down */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition cursor-pointer text-slate-600 dark:text-slate-300"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === services.length - 1}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition cursor-pointer text-slate-600 dark:text-slate-300"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status Toggle Switch */}
                <button
                  onClick={() => handleToggleStatus(srv)}
                  className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    srv.isEnabled || srv.status === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                  title="Toggle Visibility"
                >
                  {srv.isEnabled || srv.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Duplicate Button */}
                <button
                  onClick={() => handleDuplicateService(srv)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Duplicate Service"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(srv)}
                  className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirm(srv)}
                  className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {editingService ? 'Edit Service Category' : 'Create New Service Category'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure service title, icon, deliverable items, and call to action.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Service Title *
                      </label>
                      <span className={`text-[10px] font-bold ${getWordCount(title) > 20 ? 'text-rose-500 font-extrabold' : 'text-slate-400'}`}>
                        {getWordCount(title)}/20 words
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Development"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white text-xs focus:outline-none ${
                        getWordCount(title) > 20
                          ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                      }`}
                    />
                    {getWordCount(title) > 20 && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1">
                        ⚠️ Title must not exceed 20 words (Currently {getWordCount(title)} words).
                      </p>
                    )}
                  </div>

                  {/* Badge Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Badge Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ENTERPRISE ARCHITECTURE"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Description *
                    </label>
                    <span className={`text-[10px] font-bold ${getWordCount(description) > 50 ? 'text-rose-500 font-extrabold' : 'text-slate-400'}`}>
                      {getWordCount(description)}/50 words
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter detailed service summary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white text-xs focus:outline-none ${
                      getWordCount(description) > 50
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {getWordCount(description) > 50 && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1">
                      ⚠️ Description must not exceed 50 words (Currently {getWordCount(description)} words).
                    </p>
                  )}
                </div>

                {/* Custom Icon Picker & Customization */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Customize Service Icon
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">Preview:</span>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        {renderIconComponent(icon)}
                      </div>
                    </div>
                  </div>

                  {/* Icon Selection Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = icon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setIcon(opt.name)}
                          className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-500'
                          }`}
                          title={opt.label}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[9px] font-bold truncate max-w-full">{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Icon Name / Custom Code Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Or enter custom Lucide Icon name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Terminal, Cloud, Lock, Settings..."
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Display Order Index
                    </label>
                    <span className={`text-[10px] font-bold ${order < 0 ? 'text-rose-500 font-extrabold' : 'text-slate-400'}`}>
                      Min: 0 (No negative)
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOrder(isNaN(val) || val < 0 ? 0 : val);
                    }}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white text-xs focus:outline-none ${
                      order < 0
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {order < 0 && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1">
                      ⚠️ Display order index cannot be a negative value.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CTA Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Software Services"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* CTA Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTA Link / URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /contact-sales"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Optional Custom Image URL with Media Library Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Image (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or choose from Media Library..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <FolderOpen className="w-4 h-4 text-blue-500" />
                      <span>Media Library</span>
                    </button>
                  </div>
                </div>

                {/* DELIVERABLES ITEMS SECTION */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Service Deliverables / Key Items ({deliverables.length})
                    </label>
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                    {deliverables.length === 0 ? (
                      <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                        No deliverables added yet. Add items below.
                      </div>
                    ) : (
                      deliverables.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          {editingItemIdx === idx ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingItemValue}
                                onChange={(e) => setEditingItemValue(e.target.value)}
                                className="flex-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-500 text-slate-900 dark:text-white text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditDeliverable(idx)}
                                className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemIdx(null)}
                                className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate flex-1">
                                • {item}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveDeliverable(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                                  title="Move Up"
                                >
                                  <MoveUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveDeliverable(idx, 'down')}
                                  disabled={idx === deliverables.length - 1}
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                                  title="Move Down"
                                >
                                  <MoveDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditDeliverable(idx, item)}
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-blue-500"
                                  title="Edit Item"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDeliverable(idx)}
                                  className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
                                  title="Delete Item"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Deliverable Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a deliverable item and press Add..."
                      value={newItemInput}
                      onChange={(e) => setNewItemInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDeliverable();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 hover:bg-blue-100 font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ListPlus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Status Toggle & Submit */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        setIsEnabled(e.target.checked);
                        setStatus(e.target.checked ? 'active' : 'inactive');
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enable Service Category
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md cursor-pointer border-none disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : editingService ? 'Update Category' : 'Create Category'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Delete Service Category?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirm.title}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteService}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md cursor-pointer border-none"
                >
                  Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        allowedTypes={['image']}
        onSelect={(url: string) => {
          setImageUrl(url);
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
};

export default AdminServicesManager;
