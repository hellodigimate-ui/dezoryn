import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Save,
  RotateCcw,
  Upload,
  FolderOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Palette,
  Layout,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { AboutSection } from '../about/AboutSection';
import type { AboutSectionData } from '../about/AboutSection';
import { openAdminAIAssistant } from './AdminLayout';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API_ABOUT = `${API_URL}/about`;
const API_MEDIA = `${API_URL}/uploads`;


const DEFAULT_FORM: AboutSectionData = {
  badge: 'ABOUT DEZORYN TECHNOLOGIES ENTERPRISE',
  heading: 'Pioneering Predictive AI Workflows for Modern Enterprise',
  descriptionOne: 'Dezoryn Technologies Enterprise is an innovation-driven platform delivering next-generation intelligent automation software for Education, Healthcare, Business and Enterprises.',
  descriptionTwo: 'We are committed to digital transformation through technology, AI workflows, and operational excellence across global markets.',
  buttonText: 'Learn More About Our Mission',
  buttonUrl: '/about',
  buttonEnabled: true,
  mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  mediaType: 'IMAGE',
  cardEnabled: true,
  cardTitle: 'Global Enterprise HQ',
  cardSubtitle: 'Innovation Center',
  cardLocation: 'San Francisco, CA',
  cardIcon: 'ShieldCheck',
  layoutSettings: {
    imagePosition: 'right',
    imageWidth: '100%',
    imageHeight: '380px',
    borderRadius: '1.5rem',
    padding: '5rem 1rem',
    columnGap: '2.5rem',
    verticalAlign: 'center',
  },
  styleSettings: {
    bgColor: 'transparent',
    accentColor: '#2563eb',
    headingColor: '#0f172a',
    paragraphColor: '#475569',
    overlayOpacity: 0.2,
  },
  animationSettings: {
    fadeEnabled: true,
    slideEnabled: true,
    scaleEnabled: false,
    duration: 0.6,
    delay: 0.2,
  },
};

export const AdminAboutCMS: React.FC = () => {
  const [formData, setFormData] = useState<AboutSectionData>(DEFAULT_FORM);
  const [savedData, setSavedData] = useState<AboutSectionData>(DEFAULT_FORM);
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'card' | 'layout' | 'style' | 'preview'>('content');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Media Library Picker Modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchAbout = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_ABOUT);
      const json = await res.json();
      if (json.success && json.data) {
        const merged = {
          ...DEFAULT_FORM,
          ...json.data,
          layoutSettings: { ...DEFAULT_FORM.layoutSettings, ...json.data.layoutSettings },
          styleSettings: { ...DEFAULT_FORM.styleSettings, ...json.data.styleSettings },
          animationSettings: { ...DEFAULT_FORM.animationSettings, ...json.data.animationSettings },
        };
        setFormData(merged);
        setSavedData(merged);
      }
    } catch {
      // keep default
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('dezo-about-data', JSON.stringify(formData));
    window.dispatchEvent(new CustomEvent('dezo-about-updated', { detail: formData }));

    try {
      const res = await apiFetch(API_ABOUT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setSavedData(formData);
        showStatus('success', 'About section saved and published successfully!');
      } else {
        showStatus('error', json.message || 'Failed to save About section.');
      }
    } catch {
      showStatus('error', 'Saved locally and broadcasted to website.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(savedData);
    showStatus('success', 'Changes reset to last saved state.');
  };

  // Upload File Handler (JPG, PNG, WEBP, SVG, MP4, WEBM)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'AboutSection');

    try {
      const res = await apiFetch(API_MEDIA, {
        method: 'POST',
        body,
      });
      const json = await res.json();
      const uploadedUrl = json.data?.url || json.data?.media?.url;
      if (json.success && uploadedUrl) {
        const isVid = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');
        const finalUrl = resolveMediaUrl(uploadedUrl);
        const updated = {
          ...formData,
          mediaUrl: finalUrl,
          mediaType: isVid ? 'VIDEO' : 'IMAGE',
        };
        setFormData(updated);
        localStorage.setItem('dezo-about-data', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dezo-about-updated', { detail: updated }));
        showStatus('success', `Uploaded ${file.name} successfully!`);
      } else {
        showStatus('error', json.message || 'Failed to upload media file.');
      }
    } catch {
      showStatus('error', 'Error uploading media file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch Media Library list
  const openMediaPicker = async () => {
    setIsMediaModalOpen(true);
    try {
      const res = await apiFetch(API_MEDIA);
      const json = await res.json();
      if (json.success) {
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.media) ? json.data.media : []);
        setMediaList(list);
      }
    } catch {
      // fallback
    }
  };

  const selectMediaItem = (item: any) => {
    const isVid = item.mimeType?.startsWith('video/') || item.url?.endsWith('.mp4') || item.url?.endsWith('.webm');
    const fullUrl = resolveMediaUrl(item.url);
    const updated = {
      ...formData,
      mediaUrl: fullUrl,
      mediaType: isVid ? 'VIDEO' : 'IMAGE',
    };
    setFormData(updated);
    localStorage.setItem('dezo-about-data', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('dezo-about-updated', { detail: updated }));
    setIsMediaModalOpen(false);
    showStatus('success', 'Selected media asset from Library.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-cyan-500 font-bold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading About Section CMS Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-400 text-[10px] font-black uppercase tracking-wider">
              CMS Module
            </span>
            {isDirty && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                Unsaved Changes
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            About Section Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize content, media (image & video), floating card, layout positions, colors & Framer Motion animations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openAdminAIAssistant({ type: 'hero', topic: 'Dezoryn Enterprise About Section' })}
            className="px-3.5 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Copywriter</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition flex items-center gap-1.5 ${
              isDirty
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200'
                : 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Toast Notice */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
            <button type="button" onClick={() => setStatusMsg(null)} className="p-1 hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'content', label: '📝 Content & Copy', icon: Sparkles },
          { id: 'media', label: '🖼️ Media & Video', icon: ImageIcon },
          { id: 'card', label: '📌 Floating Info Card', icon: ShieldCheck },
          { id: 'layout', label: '📐 Layout & Spacing', icon: Layout },
          { id: 'style', label: '🎨 Colors & Animations', icon: Palette },
          { id: 'preview', label: '👁️ Live Preview', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main CMS Tab Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (8 cols if not full preview) */}
        <div className={activeTab === 'preview' ? 'lg:col-span-12' : 'lg:col-span-8'}>
          {activeTab === 'content' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                Text Copy & Primary Action Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Section Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    placeholder="ABOUT DEZORYN TECHNOLOGIES"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Main Heading
                  </label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Empowering Modern Enterprises with Intelligent Automation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description Paragraph 1 (Highlight Text)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionOne}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descriptionOne: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description Paragraph 2 (Secondary Subtext)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionTwo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descriptionTwo: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Primary Action Button
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.buttonEnabled}
                        onChange={(e) => setFormData((prev) => ({ ...prev, buttonEnabled: e.target.checked }))}
                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Enable Button
                      </span>
                    </label>
                  </div>

                  {formData.buttonEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={formData.buttonText}
                          onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Button Link URL
                        </label>
                        <input
                          type="text"
                          value={formData.buttonUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, buttonUrl: e.target.value }))}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Media Management (Images & Videos)
              </h3>

              <div className="space-y-5">
                {/* Active Media Card & Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Active Media Asset Preview</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400 text-[10px] uppercase font-black border border-blue-200 dark:border-cyan-800">
                      {formData.mediaType}
                    </span>
                  </div>

                  <div className="relative w-full h-[240px] rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                    {formData.mediaUrl ? (
                      formData.mediaType === 'VIDEO' || formData.mediaUrl.endsWith('.mp4') || formData.mediaUrl.endsWith('.webm') ? (
                        <video src={formData.mediaUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img src={formData.mediaUrl} alt="Active Media Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center text-xs font-semibold text-slate-400 space-y-2 p-6">
                        <ImageIcon className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                        <p className="font-bold text-slate-300">No media asset assigned.</p>
                        <p className="text-[11px] text-slate-500">Upload a file, pick from library, or restore default image below.</p>
                      </div>
                    )}
                  </div>

                  {/* Direct Media URL Input & Type Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Direct Media URL / File Path
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={formData.mediaUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isVid = val.endsWith('.mp4') || val.endsWith('.webm');
                          setFormData((prev) => ({
                            ...prev,
                            mediaUrl: val,
                            mediaType: isVid ? 'VIDEO' : prev.mediaType,
                          }));
                        }}
                        placeholder="https://images.unsplash.com/... or /uploads/..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                      <select
                        value={formData.mediaType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, mediaType: e.target.value as any }))}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="IMAGE">IMAGE</option>
                        <option value="VIDEO">VIDEO</option>
                      </select>
                    </div>
                  </div>

                  {/* Media Action Buttons: Delete / Remove & Restore Default */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
                          mediaType: 'IMAGE',
                        }));
                        showStatus('success', 'Restored default enterprise building image.');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-cyan-400 font-bold text-xs transition border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Image</span>
                    </button>

                    {formData.mediaUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          setFormData((prev) => ({
                            ...prev,
                            mediaUrl: '',
                            mediaType: 'IMAGE',
                          }));
                          try {
                            await apiFetch('/about/media', { method: 'DELETE' });
                          } catch {
                            // ignore
                          }
                          showStatus('success', 'Media asset deleted successfully.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs transition border border-rose-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete / Clear Media Asset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload & Select Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition text-center cursor-pointer space-y-2 block bg-slate-50/50 dark:bg-slate-950/50">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 mx-auto text-cyan-500" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {isUploading ? 'Uploading Media File...' : 'Upload File (Image/Video)'}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Supports JPG, PNG, WEBP, SVG, MP4, WEBM
                    </p>
                  </label>

                  <button
                    type="button"
                    onClick={openMediaPicker}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 transition text-center cursor-pointer space-y-2 block bg-slate-50/50 dark:bg-slate-950/50"
                  >
                    <FolderOpen className="w-6 h-6 mx-auto text-blue-500" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Select from Media Library
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Browse uploaded system assets
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Floating Information Card Settings
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cardEnabled}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cardEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enable Floating Card
                  </span>
                </label>
              </div>

              {formData.cardEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={formData.cardTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cardTitle: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white"
                      placeholder="Global Enterprise HQ"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Card Subtitle
                      </label>
                      <input
                        type="text"
                        value={formData.cardSubtitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cardSubtitle: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        placeholder="Innovation Center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Location Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.cardLocation}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cardLocation: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Card Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['ShieldCheck', 'Globe', 'Building', 'Award', 'CheckCircle2', 'Zap', 'Star', 'Layers'].map((iconName) => (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() => setFormData((prev) => ({ ...prev, cardIcon: iconName }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition cursor-pointer ${
                            formData.cardIcon === iconName
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                          }`}
                        >
                          <span>{iconName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Layout className="w-4 h-4 text-purple-500" />
                Layout & Spacing Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Image / Video Position
                  </label>
                  <select
                    value={formData.layoutSettings?.imagePosition || 'right'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, imagePosition: e.target.value as any },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="right">Right Column (Default)</option>
                    <option value="left">Left Column</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Border Radius
                  </label>
                  <input
                    type="text"
                    value={formData.layoutSettings?.borderRadius || '1.5rem'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, borderRadius: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    placeholder="1.5rem"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Palette className="w-4 h-4 text-amber-500" />
                Colors & Framer Motion Animations
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={formData.styleSettings?.accentColor || '#2563eb'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          styleSettings: { ...prev.styleSettings, accentColor: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Overlay Opacity ({formData.styleSettings?.overlayOpacity ?? 0.2})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formData.styleSettings?.overlayOpacity ?? 0.2}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          styleSettings: { ...prev.styleSettings, overlayOpacity: parseFloat(e.target.value) },
                        }))
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    Framer Motion Animation Settings
                  </span>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.animationSettings?.fadeEnabled ?? true}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            animationSettings: { ...prev.animationSettings, fadeEnabled: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded text-cyan-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fade In</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.animationSettings?.slideEnabled ?? true}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            animationSettings: { ...prev.animationSettings, slideEnabled: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded text-cyan-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Slide In</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.animationSettings?.scaleEnabled ?? false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            animationSettings: { ...prev.animationSettings, scaleEnabled: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded text-cyan-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scale Zoom</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Preview Panel (4 cols or 12 cols) */}
        <div className={activeTab === 'preview' ? 'lg:col-span-12' : 'lg:col-span-4'}>
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl sticky top-24 space-y-3 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live Interactive Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {formData.layoutSettings?.imagePosition === 'left' ? 'Left Image' : 'Right Image'}
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              <AboutSection initialData={formData} />
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Picker Modal */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  Select Media Asset from Library
                </h3>
                <button type="button" onClick={() => setIsMediaModalOpen(false)} className="p-1 hover:opacity-70">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectMediaItem(item)}
                    className="group relative h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer hover:border-cyan-500 transition"
                  >
                    {item.mimeType?.startsWith('video/') || item.url?.endsWith('.mp4') ? (
                      <video src={resolveMediaUrl(item.url)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={resolveMediaUrl(item.url)} alt={item.filename} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold text-cyan-300">
                      Select
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
