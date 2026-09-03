import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Video as VideoIcon, FileText,
  Search, X, Upload, RefreshCw, CheckCircle2,
  AlertTriangle, Image as ImageIcon, Link as LinkIcon,
  Trash2, HardDriveUpload, ArrowLeft
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
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaItem?: MediaItem) => void;
  allowedTypes?: ('image' | 'video' | 'raw')[];
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['image', 'video', 'raw'],
  title = 'Select Asset from Media Library'
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFolder = selectedFolder === 'All' ? 'General' : selectedFolder;

  // Escape key handler (Acts like Back / Close button)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmItem) {
          setDeleteConfirmItem(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deleteConfirmItem, onClose]);

  const showToast = (type: 'success' | 'error', text: string) => {
    if (type === 'error') {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const getMediaUrl = (url: string) => resolveMediaUrl(url);

  const isVideoItem = (item: MediaItem) =>
    item.resourceType === 'video' || item.mimeType?.startsWith('video/');

  const isImageItem = (item: MediaItem) =>
    item.resourceType === 'image' || item.mimeType?.startsWith('image/');

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
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setErrorMsg(null);
      setSuccessMsg(null);
      setCustomUrl('');
      setDeleteConfirmItem(null);
    }
  }, [isOpen]);

  const processFileUpload = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);
    const maxBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      showToast('error', `File size exceeds ${isVideo ? '100MB' : '25MB'} limit.`);
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadFolder);

    try {
      const res = await apiFetch(API_MEDIA, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        showToast('success', `Uploaded "${file.name}" successfully!`);
        invalidateApiCache();
        window.dispatchEvent(new CustomEvent('dezoryn-media-updated'));
        onSelect(data.data.url, data.data);
        onClose();
      } else {
        showToast('error', data.message || 'File upload failed. Please try again.');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Network error while uploading file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleSelectCustomUrl = () => {
    if (!customUrl.trim()) {
      showToast('error', 'Please enter a valid image URL.');
      return;
    }
    onSelect(customUrl.trim());
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const targetId = deleteConfirmItem.id;
    setIsDeleting(true);

    try {
      const res = await apiFetch(`${API_MEDIA}/${targetId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({ success: res.ok }));

      if (res.ok || data.success) {
        setItems((prev) => prev.filter((i) => i.id !== targetId));
        invalidateApiCache();
        window.dispatchEvent(new CustomEvent('dezoryn-media-updated'));
        showToast('success', `Deleted "${deleteConfirmItem.originalName || deleteConfirmItem.filename}" successfully.`);
        setDeleteConfirmItem(null);
      } else {
        showToast('error', data.message || 'Failed to delete asset from database.');
      }
    } catch (err: any) {
      // Even if network fails, optimistically remove from UI state
      setItems((prev) => prev.filter((i) => i.id !== targetId));
      showToast('success', 'Asset removed from library.');
      setDeleteConfirmItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFolder = selectedFolder === 'All' || item.folder?.toLowerCase() === selectedFolder.toLowerCase();
    const matchesType = allowedTypes.includes(item.resourceType as any);
    const matchesSearch = !searchQuery ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.folder?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesType && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-colors relative ${
          isDragging ? 'border-cyan-400 ring-4 ring-cyan-500/20' : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/mp4,application/pdf"
          onChange={handleFileInputChange}
          disabled={uploading}
        />

        {/* Drag Over Active Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-cyan-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-300 pointer-events-none p-6 text-center">
            <HardDriveUpload className="w-16 h-16 animate-bounce mb-3" />
            <h3 className="text-xl font-black text-white">Drop File to Upload from PC</h3>
            <p className="text-xs text-cyan-200 mt-1 font-semibold">Supports Images (PNG, JPG, WebP), MP4 Videos & PDF</p>
          </div>
        )}

        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button with Escape badge */}
            <button
              type="button"
              onClick={onClose}
              title="Close modal (Esc)"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden sm:inline">Back</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-200 dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 text-slate-500">
                Esc
              </kbd>
            </button>

            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload photos directly from your PC or pick from library</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition border-none"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading from PC...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from PC</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 pb-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-3 text-xs font-black transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'library'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media Library ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs font-black transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'upload'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HardDriveUpload className="w-4 h-4" />
            <span>Upload from PC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-xs font-black transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'url'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Paste Image URL</span>
          </button>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="m-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="m-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB 1: MEDIA LIBRARY ── */}
        {activeTab === 'library' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search filename or folder..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Folder Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {folders.map(folder => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setSelectedFolder(folder)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                      selectedFolder === folder
                        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-16 text-center">
                  <RefreshCw className="w-7 h-7 animate-spin text-cyan-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Loading media library...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-3xl cursor-pointer bg-slate-50 dark:bg-slate-950/40 hover:bg-cyan-500/5 transition space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mx-auto">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Photos from your PC</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Click here or drag & drop JPG, PNG, WebP, MP4, or PDF files from your computer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md inline-flex items-center gap-2 cursor-pointer border-none"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose File from PC</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(getMediaUrl(item.url), item);
                        onClose();
                      }}
                      className="group relative p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-500/10 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="w-full h-32 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center relative mb-2">
                        {isImageItem(item) ? (
                          <img
                            src={getMediaUrl(item.url)}
                            alt={item.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        ) : isVideoItem(item) ? (
                          <div className="flex flex-col items-center gap-1 text-purple-400">
                            <VideoIcon className="w-8 h-8" />
                            <span className="text-[10px] font-bold uppercase">MP4 Video</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-emerald-400">
                            <FileText className="w-8 h-8" />
                            <span className="text-[10px] font-bold uppercase">PDF Document</span>
                          </div>
                        )}

                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-950/80 text-cyan-300 border border-slate-700">
                          {item.folder || 'General'}
                        </span>

                        {/* Delete Trigger Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirmItem(item);
                          }}
                          title="Delete asset permanently"
                          className="absolute top-2 right-2 z-30 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition opacity-0 group-hover:opacity-100 cursor-pointer border-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition">
                          {item.originalName || item.filename}
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">
                          {(item.size / 1024).toFixed(0)} KB • {item.resourceType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: UPLOAD DIRECTLY FROM PC ── */}
        {activeTab === 'upload' && (
          <div className="p-8 flex flex-col items-center justify-center flex-1 text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-lg p-10 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 bg-slate-50 dark:bg-slate-950/50 hover:bg-cyan-500/5 transition cursor-pointer flex flex-col items-center justify-center space-y-4 shadow-sm"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <HardDriveUpload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {uploading ? 'Uploading your asset...' : 'Choose a file or drag & drop'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any PNG, JPG, WebP, GIF, SVG, MP4, or PDF up to 25MB
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer border-none flex items-center gap-2"
                >
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploading ? 'Processing...' : 'Browse PC Files'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DIRECT IMAGE URL ── */}
        {activeTab === 'url' && (
          <div className="p-8 flex flex-col items-center justify-center flex-1 max-w-lg mx-auto w-full text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mx-auto">
              <LinkIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Use External Image URL</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Paste any direct image URL (Unsplash, CDN, or Cloudinary link)
              </p>
            </div>

            <div className="w-full space-y-3">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
              />

              {customUrl && (
                <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="button"
                  onClick={handleSelectCustomUrl}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md shadow-cyan-600/20 cursor-pointer border-none"
                >
                  Use This Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOM DELETE CONFIRMATION DIALOG MODAL ── */}
        <AnimatePresence>
          {deleteConfirmItem && (
            <div
              className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setDeleteConfirmItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 text-slate-900 dark:text-white relative"
              >
                {/* Warning Icon Badge */}
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <Trash2 className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black">Delete Media Asset?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Are you sure you want to permanently delete this asset from PostgreSQL and server disk?
                  </p>
                </div>

                {/* Item Card Details Preview */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {isImageItem(deleteConfirmItem) ? (
                      <img src={getMediaUrl(deleteConfirmItem.url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black truncate">{deleteConfirmItem.originalName || deleteConfirmItem.filename}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">
                      {(deleteConfirmItem.size / 1024).toFixed(0)} KB • {deleteConfirmItem.folder || 'General'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeleteConfirmItem(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel (Esc)
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 cursor-pointer border-none"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
