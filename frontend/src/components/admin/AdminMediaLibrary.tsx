import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Image as ImageIcon, Video as VideoIcon, FileText,
  Search, Plus, Trash2, Edit3, Eye, Upload, RefreshCw, CheckCircle2,
  AlertTriangle, Sparkles, Copy, Check, Filter, X
} from 'lucide-react';


import { API_URL, apiFetch } from '../../config/api.config';
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

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null);
  const [replaceItem, setReplaceItem] = useState<MediaItem | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [targetFolder, setTargetFolder] = useState<string>('General');
  const [customFolder, setCustomFolder] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Resolve relative /uploads/ URLs to include the backend base URL
  const getMediaUrl = (url: string) => resolveMediaUrl(url);

  const isVideoItem = (item: MediaItem) =>
    item.resourceType === 'video' || item.mimeType?.startsWith('video/');

  const isImageItem = (item: MediaItem) =>
    item.resourceType === 'image' || item.mimeType?.startsWith('image/');

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
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
        showMsg('success', 'Media asset uploaded to Cloudinary successfully');
        setIsUploadOpen(false);
        setCustomFolder('');
        fetchMedia();
      } else {
        showMsg('error', data.message || 'Upload failed');
      }
    } catch {
      showMsg('error', 'Error uploading media file');
    } finally {
      setIsUploading(false);
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
        showMsg('success', 'Asset replaced in Cloudinary successfully');
        setReplaceItem(null);
        fetchMedia();
      } else {
        showMsg('error', data.message || 'Replacement failed');
      }
    } catch {
      showMsg('error', 'Error replacing file');
    } finally {
      setIsUploading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await apiFetch(`${API_MEDIA}/${deleteConfirm.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Asset deleted from Cloudinary');
        setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
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
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtering
  const filteredItems = items.filter(item => {
    const matchesFolder = selectedFolder === 'All' || item.folder?.toLowerCase() === selectedFolder.toLowerCase();
    const matchesType = selectedType === 'All' ||
      (selectedType === 'Image' && item.resourceType === 'image') ||
      (selectedType === 'Video' && item.resourceType === 'video') ||
      (selectedType === 'PDF' && item.resourceType === 'raw');
    const matchesSearch = !searchQuery ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.folder?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Cloudinary Asset Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Media Library & Assets
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Upload, categorize, search, preview, replace, and delete images, MP4 videos, and PDF documents hosted on Cloudinary.
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

      {/* Toast Alert Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-lg ${message.type === 'success'
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{items.length}</div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Assets</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.resourceType === 'image').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Images</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <VideoIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.resourceType === 'video').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Videos</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:border-slate-700 transition">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter(i => i.resourceType === 'raw').length}
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">PDFs & Docs</div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by filename, folder..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/60 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Folders & Type Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Folder:</span>
          </div>
          <select
            value={selectedFolder}
            onChange={e => setSelectedFolder(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            {folders.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
            <span>Type:</span>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {['All', 'Image', 'Video', 'PDF'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${selectedType === t
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div>
        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading Cloudinary assets...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No media assets match your query</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Upload new images, videos, or PDFs to populate the media library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 transition flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="w-full h-44 rounded-xl bg-white dark:bg-slate-950 overflow-hidden relative mb-3 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  {isImageItem(item) ? (
                    <img src={getMediaUrl(item.url)} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : isVideoItem(item) ? (
                    <video
                      src={getMediaUrl(item.url)}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                      onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                      onError={e => {
                        // Fallback: replace with icon if video fails to load
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

                  {/* Video fallback icon (hidden by default, shown on error) */}
                  {isVideoItem(item) && (
                    <div className="video-fallback flex-col items-center gap-2 text-purple-400 absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                      <VideoIcon className="w-10 h-10" />
                      <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">MP4 Video</span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-950/90 text-cyan-400 border border-slate-200 dark:border-slate-800 shadow-md">
                    {item.folder || 'General'}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate hover:text-cyan-400 transition" title={item.originalName || item.filename}>
                    {item.originalName || item.filename}
                  </h3>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase">
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                    <span>{item.resourceType}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-1">
                    {/* Preview button */}
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                      title="Preview Asset"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy URL */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Replace file button */}
                    <label
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-400 transition cursor-pointer"
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

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(item)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete from Cloudinary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Upload Asset to Cloudinary</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Supports Images (PNG, JPG, WebP), MP4 Videos, and PDFs</p>
                  </div>
                </div>
                <button onClick={() => setIsUploadOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Folder Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Target Folder</label>
                <select
                  value={targetFolder}
                  onChange={e => setTargetFolder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
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
                    className="w-full mt-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-cyan-500/50 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                )}
              </div>

              {/* Dropzone */}
              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 bg-slate-100/60 dark:bg-slate-950/60 transition cursor-pointer group">
                <Upload className="w-10 h-10 text-slate-600 group-hover:text-cyan-400 transition mb-2" />
                <span className="text-xs font-black text-slate-900 dark:text-white">Click or drag file to upload</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">Image, MP4 Video, or PDF up to 10MB</span>
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
                  <span>Processing and uploading asset to Cloudinary...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-md">
                  {previewItem.originalName || previewItem.filename}
                </h3>
                <button onClick={() => setPreviewItem(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="w-full h-80 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
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

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Cloudinary Public ID:</span>
                    <span className="text-cyan-400 font-mono font-bold">{previewItem.cloudinaryId || 'Local Storage'}</span>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition cursor-pointer"
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
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Asset from Cloudinary?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white">"{deleteConfirm.originalName || deleteConfirm.filename}"</span>? This asset will be permanently removed from Cloudinary storage.
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
