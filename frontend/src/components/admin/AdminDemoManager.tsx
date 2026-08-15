import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv, Plus, Trash2, Edit3, RefreshCw, CheckCircle2,
  AlertTriangle, Sparkles, FolderOpen, Video as VideoIcon, Play,
  Eye, EyeOff, X
} from 'lucide-react';

import { MediaPickerModal } from './MediaPickerModal';

import { API_URL, apiFetch } from '../../config/api.config';

const API_DEMOS = `${API_URL}/demos`;


export interface ProductDemo {
  id: string;
  title: string;
  description?: string;
  viewsText?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  order: number;
  isActive: boolean;
}

export const AdminDemoManager: React.FC = () => {
  const [demos, setDemos] = useState<ProductDemo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live preview interactive tab state
  const [activeTabPreview, setActiveTabPreview] = useState<string>('schoolycore');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDemo, setEditingDemo] = useState<ProductDemo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductDemo | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [viewsText, setViewsText] = useState('18,500+ Views');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('Education');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Media picker state
  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    isOpen: boolean;
    targetField: 'videoUrl' | 'thumbnailUrl';
    allowedTypes: ('image' | 'video' | 'raw')[];
  }>({
    isOpen: false,
    targetField: 'videoUrl',
    allowedTypes: ['video'],
  });

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchDemos = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_DEMOS);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDemos(data.data);
      }
    } catch {
      showMsg('error', 'Failed to fetch product demos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, []);

  const openCreateModal = () => {
    setEditingDemo(null);
    setTitle('');
    setDescription('');
    setViewsText('18,500+ Views');
    setVideoUrl('');
    setThumbnailUrl('');
    setCategory('Education');
    setOrder(demos.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (demo: ProductDemo) => {
    setEditingDemo(demo);
    setTitle(demo.title);
    setDescription(demo.description || '');
    setViewsText(demo.viewsText || '18,500+ Views');
    setVideoUrl(demo.videoUrl);
    setThumbnailUrl(demo.thumbnailUrl || '');
    setCategory(demo.category || 'Education');
    setOrder(demo.order);
    setIsActive(demo.isActive);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      showMsg('error', 'Title and Video URL are required');
      return;
    }

    setIsSaving(true);
    const payload = {
      title,
      description,
      viewsText,
      videoUrl,
      thumbnailUrl,
      category,
      order,
      isActive,
    };

    try {
      const isEdit = !!editingDemo;
      const url = isEdit ? `${API_DEMOS}/${editingDemo.id}` : API_DEMOS;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showMsg('success', isEdit ? 'Product demo updated successfully' : 'New product demo created');
        setIsModalOpen(false);
        fetchDemos();
      } else {
        showMsg('error', data.message || 'Failed to save product demo');
      }
    } catch {
      showMsg('error', 'Network error saving product demo');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (demo: ProductDemo) => {
    try {
      const res = await apiFetch(`${API_DEMOS}/${demo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !demo.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setDemos(prev => prev.map(d => (d.id === demo.id ? { ...d, isActive: !d.isActive } : d)));
        showMsg('success', `Demo status updated to ${!demo.isActive ? 'Active' : 'Inactive'}`);
      }
    } catch {
      showMsg('error', 'Failed to toggle status');
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await apiFetch(`${API_DEMOS}/${deleteConfirm.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Product demo deleted');
        setDemos(prev => prev.filter(d => d.id !== deleteConfirm.id));
      } else {
        showMsg('error', data.message || 'Failed to delete demo');
      }
    } catch {
      showMsg('error', 'Network error deleting product demo');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Demo Center CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Product Demo Management
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Manage product demo videos, thumbnails, titles, and categories rendered live in the landing page Demo Center section.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={fetchDemos}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Refresh product demos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product Demo</span>
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
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-lg ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview Widget matching screenshot media__1786688895742.png */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-400 tracking-wider">
            <Tv className="w-4 h-4" />
            <span>Demo Center Live Preview</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
            Interactive Widget
          </span>
        </div>

        {/* Live Preview Banner matching exact screenshot media__1786688895742.png */}
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl space-y-6">
          
          {/* Header block: Title + Subtitle + Views Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-700/60 border border-slate-600/50">
            <div>
              <h3 className="text-xl font-black text-white">
                {(demos.find(d => d.id.toLowerCase().includes(activeTabPreview)) || demos[0])?.title || 'SchoolyCore Demo'}
              </h3>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                {(demos.find(d => d.id.toLowerCase().includes(activeTabPreview)) || demos[0])?.description || 'Next-Gen EHR, OPD Billing & Clinical Workflow'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-600 text-xs font-extrabold text-cyan-300 shadow-sm shrink-0">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{(demos.find(d => d.id.toLowerCase().includes(activeTabPreview)) || demos[0])?.viewsText || '18,500+ Views'}</span>
            </div>
          </div>

          {/* Solution Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'schoolycore', name: 'SCHOOLYCORE', tag: 'Education', active: activeTabPreview === 'schoolycore' },
              { id: 'hospital', name: 'HOSPITAL MANA...', tag: 'Healthcare', active: activeTabPreview === 'hospital' },
              { id: 'hrms', name: 'HRMS', tag: 'Enterprise', active: activeTabPreview === 'hrms' },
              { id: 'inventory', name: 'INVENTORYPRO', tag: 'Logistics', active: activeTabPreview === 'inventory' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabPreview(tab.id)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  tab.active
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-xs font-black uppercase tracking-wider truncate flex items-center justify-between">
                  <span>{tab.name}</span>
                  <Tv className="w-3.5 h-3.5 opacity-70" />
                </div>
                <div className="text-[10px] font-bold mt-1 text-slate-300 opacity-90 truncate">
                  {tab.tag}
                </div>
              </button>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Live Demo</span>
            </button>

            <button
              type="button"
              className="py-3.5 px-6 rounded-2xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Book Walkthrough</span>
              <span className="text-slate-400 font-bold">&gt;</span>
            </button>
          </div>

        </div>
      </div>

      {/* Demos Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading product demos...</p>
          </div>
        ) : demos.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <Tv className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No product demos configured</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Click "Add Product Demo" to configure videos for the Demo Center.</p>
          </div>
        ) : (
          demos.map(demo => (
            <div
              key={demo.id}
              className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-4 relative flex flex-col justify-between"
            >
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    <VideoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-950 text-cyan-400 border border-slate-200 dark:border-slate-800 mb-1 inline-block">
                      {demo.category || 'General'}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{demo.title}</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive(demo)}
                  className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    demo.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                  }`}
                  title={demo.isActive ? 'Active on Landing Page' : 'Hidden'}
                >
                  {demo.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {demo.description || 'No description provided.'}
              </p>

              {/* Video URL box */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-400 truncate flex items-center justify-between">
                <span className="truncate">{demo.videoUrl}</span>
                <a href={demo.videoUrl} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:text-white ml-2">
                  <Play className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase">Order #{demo.order}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(demo)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(demo)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingDemo ? 'Edit Product Demo' : 'Configure New Product Demo'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Demo Title</label>
                  <input
                    type="text"
                    placeholder="e.g. SchoolyCore Demo, HRMS Demo..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Description / Subtitle</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Next-Gen EHR, OPD Billing & Clinical Workflow..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Views Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 18,500+ Views"
                    value={viewsText}
                    onChange={e => setViewsText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                {/* Video URL + Media Library Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Video Source URL (MP4 / Cloudinary)</label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerConfig({ isOpen: true, targetField: 'videoUrl', allowedTypes: ['video'] })}
                      className="text-xs font-black text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Pick from Media Library</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://commondatastorage.googleapis.com/... or Cloudinary video URL"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-cyan-400 outline-none"
                  />
                </div>

                {/* Thumbnail Image + Media Library Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Thumbnail Cover Image URL</label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerConfig({ isOpen: true, targetField: 'thumbnailUrl', allowedTypes: ['image'] })}
                      className="text-xs font-black text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Pick Image from Library</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or Cloudinary image URL"
                    value={thumbnailUrl}
                    onChange={e => setThumbnailUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Category Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Education, Healthcare"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Display Order</label>
                    <input
                      type="number"
                      value={order}
                      onChange={e => setOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 dark:text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingDemo ? 'Update Demo' : 'Save Demo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerConfig.isOpen}
        onClose={() => setMediaPickerConfig({ ...mediaPickerConfig, isOpen: false })}
        allowedTypes={mediaPickerConfig.allowedTypes}
        onSelect={(url) => {
          if (mediaPickerConfig.targetField === 'videoUrl') setVideoUrl(url);
          if (mediaPickerConfig.targetField === 'thumbnailUrl') setThumbnailUrl(url);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Product Demo?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white">"{deleteConfirm.title}"</span>? This video demo will no longer appear on the landing page.
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
    </div>
  );
};
