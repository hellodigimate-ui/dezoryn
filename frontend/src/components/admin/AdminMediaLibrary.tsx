import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Image as ImageIcon, Video as VideoIcon, FileText,
  Search, Plus, Trash2, Edit3, Eye, Upload, RefreshCw, CheckCircle2,
  AlertTriangle, Sparkles, Copy, Check, Filter, X
} from 'lucide-react';

import { API_URL, apiFetch, invalidateApiCache } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API_MEDIA = `${API_URL}/uploads/media`;
const API_FOLDERS = `${API_URL}/uploads/folders`;

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folder: string;
  cloudinaryId?: string;
  resourceType: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminMediaLibrary: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'delete'; text: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null);
  const [replaceItem, setReplaceItem] = useState<MediaItem | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [targetFolder, setTargetFolder] = useState<string>('General');
  const [customFolder, setCustomFolder] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirm) setDeleteConfirm(null);
        else if (previewItem) setPreviewItem(null);
        else if (isUploadOpen) setIsUploadOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirm, previewItem, isUploadOpen]);

  // Resolve relative /uploads/ URLs to include the backend base URL
  const getMediaUrl = (url: string) => resolveMediaUrl(url);

  const isVideoItem = (item: MediaItem) =>
    item.resourceType === 'video' || item.mimeType?.startsWith('video/');

  const isImageItem = (item: MediaItem) =>
    item.resourceType === 'image' || item.mimeType?.startsWith('image/');

  const showMsg = (type: 'success' | 'error' | 'delete', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const notifyMediaUpdates = () => {
    invalidateApiCache();
    window.dispatchEvent(new CustomEvent('dezoryn-media-updated'));
  };

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const [mediaRes, folderRes] = await Promise.all([
        apiFetch(API_MEDIA),
        apiFetch(API_FOLDERS)
      ]);
      const mediaData = await mediaRes.json();
      const folderData = await folderRes.json();

      if (mediaData.success && Array.isArray(mediaData.data)) {
        setItems(mediaData.data);
      }
      if (folderData.success && Array.isArray(folderData.data)) {
        setFolders(folderData.data);
      }
    } catch {
      showMsg('error', 'Failed to connect to backend media service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const finalFolder = customFolder.trim() || targetFolder || 'General';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', finalFolder);

    try {
      const res = await apiFetch(API_MEDIA, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Media asset uploaded successfully');
        setIsUploadOpen(false);
        setCustomFolder('');
        notifyMediaUpdates();
        fetchMedia();
      } else {
        showMsg('error', data.message || 'Upload failed');
      }
    } catch {
      showMsg('error', 'Error uploading media file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleReplaceSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replaceItem) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch(`${API_MEDIA}/${replaceItem.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Asset replaced successfully');
        setReplaceItem(null);
        notifyMediaUpdates();
        fetchMedia();
      } else {
        showMsg('error', data.message || 'Replacement failed');
      }
    } catch {
      showMsg('error', 'Error replacing file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const deletedName = deleteConfirm.originalName || deleteConfirm.filename;
    try {
      const res = await apiFetch(`${API_MEDIA}/${deleteConfirm.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMsg('delete', `"${deletedName}" has been deleted`);
        setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
        notifyMediaUpdates();
      } else {
        showMsg('error', data.message || 'Delete failed');
      }
    } catch {
      showMsg('error', 'Error deleting asset');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = getMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showMsg('success', 'Asset URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtering
  const filteredItems = items.filter(item => {
    const matchesFolder = selectedFolder === 'All' || item.folder?.toLowerCase() === selectedFolder.toLowerCase();
    const matchesType = selectedType === 'All' ||
      (selectedType === 'image' && isImageItem(item)) ||
      (selectedType === 'video' && isVideoItem(item)) ||
      (selectedType === 'document' && item.mimeType?.includes('pdf'));
    const matchesSearch = !searchQuery ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.folder?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesType && matchesSearch;
  });

  const totalStorageBytes = items.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Sleek Floating Toast Notification - Minimal & Compact */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-5 right-5 z-[100] px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold border shadow-xl backdrop-blur-md ${
              message.type === 'delete' || message.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/30 text-slate-200 shadow-black/50'
                : 'bg-slate-900/95 border-emerald-500/30 text-slate-200 shadow-black/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'delete' ? (
                <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : message.type === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="text-xs text-slate-200 max-w-xs truncate">{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Cloudinary Asset CDN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Media & Asset Manager
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Upload, organize, inspect, and manage high-resolution images, videos, and documents synced live across your site.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={fetchMedia}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Refresh assets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{items.length}</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Assets</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{items.filter(isImageItem).length}</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Images</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <VideoIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{items.filter(isVideoItem).length}</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Videos</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalStorageMB} MB</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Storage Used</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by name or folder..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {['All', 'image', 'video', 'document'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition cursor-pointer ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {type === 'image' ? 'Images' : type === 'video' ? 'Videos' : type === 'document' ? 'Docs' : 'All Types'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="All">All Folders</option>
              {folders.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <div className="col-span-full p-16 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading media library assets...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full p-16 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <FolderOpen className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">No media assets found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload images, videos, or documents to store them on your secure CDN.
            </p>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer border-none shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Asset</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition space-y-3 group flex flex-col justify-between"
            >
              {/* Preview Box */}
              <div
                onClick={() => setPreviewItem(item)}
                className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative cursor-pointer flex items-center justify-center group-hover:border-cyan-500/50 transition"
              >
                {isImageItem(item) ? (
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : isVideoItem(item) ? (
                  <video
                    src={getMediaUrl(item.url)}
                    className="w-full h-full object-cover"
                    onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                    onError={e => {
                      const parent = (e.currentTarget as HTMLElement).parentElement;
                      if (parent) {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        const fallback = parent.querySelector('.video-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-emerald-400">
                    <FileText className="w-10 h-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      PDF Document
                    </span>
                  </div>
                )}

                {/* Video fallback icon */}
                {isVideoItem(item) && (
                  <div className="video-fallback flex-col items-center gap-2 text-purple-400 absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                    <VideoIcon className="w-10 h-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">MP4 Video</span>
                  </div>
                )}

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/90 dark:bg-slate-950/90 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800 shadow-md">
                  {item.folder || 'General'}
                </span>
              </div>

              {/* Info & Actions */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate hover:text-cyan-400 transition" title={item.originalName || item.filename}>
                  {item.originalName || item.filename}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>{(item.size / 1024).toFixed(0)} KB</span>
                  <span>{item.resourceType}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                    title="Preview Asset"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy URL */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                    title="Copy Public URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Replace file button */}
                  <label
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                    title="Replace file"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => {
                        setReplaceItem(item);
                        handleReplaceSubmit(e);
                      }}
                    />
                  </label>

                  {/* Red Delete button */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(item)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 hover:border-red-600 transition cursor-pointer shadow-sm"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <span>Upload Media Asset</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Folder Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Target Folder</label>
                <select
                  value={targetFolder}
                  onChange={e => setTargetFolder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {folders.filter(f => f !== 'All').map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  <option value="custom">+ Create New Folder</option>
                </select>

                {targetFolder === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter new folder name (e.g. Products, Hero)..."
                    value={customFolder}
                    onChange={e => setCustomFolder(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/50 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                )}
              </div>

              {/* Dropzone */}
              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-500/60 bg-slate-50 dark:bg-slate-950/60 transition cursor-pointer group">
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-cyan-400 transition mb-2" />
                <span className="text-xs font-black text-slate-900 dark:text-white">Click or drag file to upload</span>
                <span className="text-[10px] text-slate-500 mt-1">Image, MP4 Video, or PDF up to 25MB</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4,application/pdf"
                  onChange={handleUploadSubmit}
                  disabled={isUploading}
                />
              </label>

              {isUploading && (
                <div className="p-3 text-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing and uploading asset...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
            >
              <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-md">
                  {previewItem.originalName || previewItem.filename}
                </h3>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="w-full h-80 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  {isImageItem(previewItem) ? (
                    <img src={getMediaUrl(previewItem.url)} alt={previewItem.filename} className="max-w-full max-h-full object-contain" />
                  ) : isVideoItem(previewItem) ? (
                    <video
                      key={previewItem.id}
                      src={getMediaUrl(previewItem.url)}
                      controls
                      autoPlay
                      preload="auto"
                      className="max-w-full max-h-full rounded-xl"
                      style={{ maxHeight: '320px' }}
                    >
                      <source src={getMediaUrl(previewItem.url)} type={previewItem.mimeType || 'video/mp4'} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe src={getMediaUrl(previewItem.url)} className="w-full h-full border-none" title="PDF Preview" />
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Cloudinary Public ID:</span>
                    <span className="text-cyan-500 font-mono font-bold">{previewItem.cloudinaryId || 'Local Storage'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">MIME Type:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{previewItem.mimeType}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">File Size:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{(previewItem.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Public URL:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(previewItem.url, previewItem.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 hover:underline border border-slate-200 dark:border-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === previewItem.id ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal - Rich Red Theme & Escape Support */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-500/50 p-6 shadow-2xl shadow-red-950/40 space-y-5 text-center relative overflow-hidden text-slate-900 dark:text-white"
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Asset Preview Thumbnail */}
              <div className="w-24 h-24 rounded-2xl mx-auto bg-slate-100 dark:bg-slate-950 border-2 border-red-500/40 overflow-hidden flex items-center justify-center relative shadow-inner">
                {isImageItem(deleteConfirm) ? (
                  <img src={getMediaUrl(deleteConfirm.url)} alt={deleteConfirm.filename} className="w-full h-full object-cover" />
                ) : isVideoItem(deleteConfirm) ? (
                  <VideoIcon className="w-10 h-10 text-purple-400" />
                ) : (
                  <FileText className="w-10 h-10 text-emerald-400" />
                )}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white shadow-md">
                  DELETE
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Permanent Deletion</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Media Asset?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-red-500 dark:text-red-400">"{deleteConfirm.originalName || deleteConfirm.filename}"</span>?
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span>Folder: {deleteConfirm.folder || 'General'}</span>
                  <span>•</span>
                  <span>{(deleteConfirm.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition cursor-pointer"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-xl shadow-red-600/40 transition cursor-pointer border-none"
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

export default AdminMediaLibrary;
