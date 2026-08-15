import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Video as VideoIcon, FileText,
  Search, X, Upload, RefreshCw
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
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const uploadFolder = selectedFolder === 'All' ? 'General' : selectedFolder;

  // Resolve relative /uploads/ URLs to include the backend base URL
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
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadFolder);

    try {
      const res = await apiFetch(API_MEDIA, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        onSelect(data.data.url, data.data);
        onClose();
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select an existing Cloudinary asset or upload a new file</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Upload Button */}
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 dark:text-white font-extrabold text-xs shadow-lg cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/mp4,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search filename or folder..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            />
          </div>

          {/* Folder Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {folders.map(folder => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                  selectedFolder === folder
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:text-white'
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
            <div className="p-12 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Loading media library...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No media assets found</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Upload an image, MP4 video, or PDF document to get started.</p>
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
                  className="group relative p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/5 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-full h-32 rounded-xl bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center relative mb-2">
                    {isImageItem(item) ? (
                      <img src={getMediaUrl(item.url)} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : isVideoItem(item) ? (
                      <>
                        <video
                          src={getMediaUrl(item.url)}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover"
                          onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                          onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                          onError={e => {
                            const parent = (e.currentTarget as HTMLElement).parentElement;
                            if (parent) {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              const fb = parent.querySelector('.vid-fallback') as HTMLElement;
                              if (fb) fb.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="vid-fallback flex-col items-center gap-1 text-purple-400 absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                          <VideoIcon className="w-8 h-8" />
                          <span className="text-[10px] font-bold uppercase">MP4 Video</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-emerald-400">
                        <FileText className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase">PDF Document</span>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-slate-200 dark:border-slate-800">
                      {item.folder || 'General'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition">
                      {item.originalName || item.filename}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-semibold mt-0.5">
                      {(item.size / 1024).toFixed(0)} KB • {item.resourceType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
