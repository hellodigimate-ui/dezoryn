import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Target,
  Eye,
  Zap,
  Rocket,
  Users,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  FolderOpen,
  Sparkles,
  ArrowRight,
  Layout
} from 'lucide-react';
import { AboutSection } from '../about/AboutSection';
import { AboutUsPage, DEFAULT_ABOUT_PAGE, type AboutUsPageConfig } from '../about/AboutUsPage';
import type { AboutSectionData } from '../about/AboutSection';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API_ABOUT = `${API_URL}/about`;
const API_MEDIA = `${API_URL}/uploads`;

const DEFAULT_HOMEPAGE_ABOUT: AboutSectionData = {
  badge: 'ABOUT DEZORYN TECHNOLOGIES',
  heading: 'Engineering Intelligent Systems for the Way Businesses Work',
  descriptionOne: 'Dezoryn Technologies builds intelligent digital platforms that connect people, processes, and data — helping organizations simplify complexity, improve operational visibility, and scale with confidence.',
  descriptionTwo: 'Our approach is simple: understand how your business works, engineer technology around it, and build solutions that are secure, scalable and ready for what comes next.',
  buttonText: 'Discover Our Solutions',
  buttonUrl: '/products',
  buttonEnabled: true,
  mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  mediaType: 'IMAGE',
  cardEnabled: true,
  cardTitle: 'Global Enterprise HQ',
  cardSubtitle: 'Innovation Center',
  cardLocation: 'San Francisco, CA',
  cardIcon: 'Building',
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

interface FullAboutState extends AboutSectionData {
  aboutPage: AboutUsPageConfig;
}

const AVAILABLE_ICONS = [
  'Zap', 'ShieldCheck', 'TrendingUp', 'Globe', 'Target', 'Eye', 'Award', 'Sparkles', 'Building2', 'Rocket', 'Users', 'Layers'
];

interface AdminAboutCMSProps {
  initialTab?: string;
}

export const AdminAboutCMS: React.FC<AdminAboutCMSProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'story');
  const [formData, setFormData] = useState<FullAboutState>({
    ...DEFAULT_HOMEPAGE_ABOUT,
    aboutPage: DEFAULT_ABOUT_PAGE,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'delete' | 'notice'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<'about-page' | 'homepage-section'>('about-page');

  // Media Library Picker Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'homepage-media' | 'leader-image' | null>(null);
  const [activeLeaderId, setActiveLeaderId] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const showStatus = (type: 'success' | 'error' | 'delete' | 'notice', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchAbout = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_ABOUT);
      const json = await res.json();
      if (json.success && json.data) {
        const rawData = json.data;
        const rawAboutPage = rawData.aboutPage || rawData.layoutSettings?.aboutPage;
        const aboutPageData: AboutUsPageConfig = {
          ...DEFAULT_ABOUT_PAGE,
          ...(rawAboutPage || {}),
          coreValues: Array.isArray(rawAboutPage?.coreValues)
            ? rawAboutPage.coreValues
            : DEFAULT_ABOUT_PAGE.coreValues,
          milestones: Array.isArray(rawAboutPage?.milestones)
            ? rawAboutPage.milestones
            : DEFAULT_ABOUT_PAGE.milestones,
          leadership: Array.isArray(rawAboutPage?.leadership)
            ? rawAboutPage.leadership
            : DEFAULT_ABOUT_PAGE.leadership,
        };

        const merged: FullAboutState = {
          ...DEFAULT_HOMEPAGE_ABOUT,
          ...rawData,
          layoutSettings: { ...DEFAULT_HOMEPAGE_ABOUT.layoutSettings, ...rawData.layoutSettings },
          styleSettings: { ...DEFAULT_HOMEPAGE_ABOUT.styleSettings, ...rawData.styleSettings },
          animationSettings: { ...DEFAULT_HOMEPAGE_ABOUT.animationSettings, ...rawData.animationSettings },
          aboutPage: aboutPageData,
        };

        setFormData(merged);
      }
    } catch {
      // Keep defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  // Handle saving full About CMS to PostgreSQL database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        badge: formData.badge,
        heading: formData.heading,
        descriptionOne: formData.descriptionOne,
        descriptionTwo: formData.descriptionTwo,
        buttonText: formData.buttonText,
        buttonUrl: formData.buttonUrl,
        buttonEnabled: formData.buttonEnabled,
        mediaUrl: formData.mediaUrl,
        mediaType: formData.mediaType,
        cardEnabled: formData.cardEnabled,
        cardTitle: formData.cardTitle,
        cardSubtitle: formData.cardSubtitle,
        cardLocation: formData.cardLocation,
        cardIcon: formData.cardIcon,
        layoutSettings: formData.layoutSettings,
        styleSettings: formData.styleSettings,
        animationSettings: formData.animationSettings,
        aboutPage: formData.aboutPage,
      };

      const res = await apiFetch(API_ABOUT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showStatus('success', 'About Page & Company CMS published to PostgreSQL');
        window.dispatchEvent(new CustomEvent('dezoryn-about-updated'));
        window.dispatchEvent(new CustomEvent('dezo-about-updated'));
      } else {
        showStatus('error', data.message || 'Failed to save changes');
      }
    } catch {
      showStatus('error', 'Network error occurred while saving to database');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update nested aboutPage fields
  const updateAboutPage = (fields: Partial<AboutUsPageConfig>) => {
    setFormData(prev => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        ...fields,
      },
    }));
  };

  // ── CORE VALUES CRUD ──
  const addCoreValue = () => {
    const newItem = {
      id: `val-${Date.now()}`,
      title: 'New Core Principle',
      desc: 'Describe what drives your enterprise and company culture.',
      icon: 'Zap',
      style: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    };
    updateAboutPage({
      coreValues: [...formData.aboutPage.coreValues, newItem],
    });
  };

  const updateCoreValueItem = (index: number, updated: Partial<typeof formData.aboutPage.coreValues[0]>) => {
    const list = [...formData.aboutPage.coreValues];
    list[index] = { ...list[index], ...updated };
    updateAboutPage({ coreValues: list });
  };

  const removeCoreValue = async (index: number) => {
    const itemToDelete = formData.aboutPage.coreValues[index];
    const newValues = formData.aboutPage.coreValues.filter((_, i) => i !== index);
    const newAboutPage = { ...formData.aboutPage, coreValues: newValues };
    
    setFormData(prev => ({ ...prev, aboutPage: newAboutPage }));

    try {
      await apiFetch(API_ABOUT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutPage: newAboutPage }),
      });
      showStatus('delete', `Deleted principle "${itemToDelete.title}" from database`);
      window.dispatchEvent(new CustomEvent('dezoryn-about-updated'));
    } catch {
      showStatus('error', 'Failed to delete principle from database');
    }
  };

  // ── MILESTONES CRUD ──
  const addMilestone = () => {
    const newItem = {
      id: `mile-${Date.now()}`,
      year: `${new Date().getFullYear()}`,
      title: 'New Company Milestone',
      desc: 'Key growth achievement driving our mission to transform enterprise software.',
      icon: 'Rocket',
      enabled: true,
    };
    updateAboutPage({
      milestones: [...formData.aboutPage.milestones, newItem],
    });
  };

  const updateMilestoneItem = (index: number, updated: Partial<typeof formData.aboutPage.milestones[0]>) => {
    const list = [...formData.aboutPage.milestones];
    list[index] = { ...list[index], ...updated };
    updateAboutPage({ milestones: list });
  };

  const removeMilestone = async (index: number) => {
    const itemToDelete = formData.aboutPage.milestones[index];
    const newMilestones = formData.aboutPage.milestones.filter((_, i) => i !== index);
    const newAboutPage = { ...formData.aboutPage, milestones: newMilestones };
    
    setFormData(prev => ({ ...prev, aboutPage: newAboutPage }));

    try {
      await apiFetch(API_ABOUT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutPage: newAboutPage }),
      });
      showStatus('delete', `Deleted milestone "${itemToDelete.year} ${itemToDelete.title}" from database`);
      window.dispatchEvent(new CustomEvent('dezoryn-about-updated'));
    } catch {
      showStatus('error', 'Failed to delete milestone from database');
    }
  };

  const moveMilestone = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.aboutPage.milestones.length) return;
    const list = [...formData.aboutPage.milestones];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateAboutPage({ milestones: list });
  };

  // ── LEADERSHIP CRUD ──
  const addLeader = () => {
    const newItem = {
      id: `lead-${Date.now()}`,
      name: 'Leader Name',
      role: 'Executive Title',
      bio: 'Executive background and expertise in scaling technology platforms.',
      avatar: 'LN',
      image: '',
    };
    updateAboutPage({
      leadership: [...formData.aboutPage.leadership, newItem],
    });
  };

  const updateLeaderItem = (index: number, updated: Partial<typeof formData.aboutPage.leadership[0]>) => {
    const list = [...formData.aboutPage.leadership];
    list[index] = { ...list[index], ...updated };
    updateAboutPage({ leadership: list });
  };

  const removeLeader = async (index: number) => {
    const itemToDelete = formData.aboutPage.leadership[index];
    const newLeadership = formData.aboutPage.leadership.filter((_, i) => i !== index);
    const newAboutPage = { ...formData.aboutPage, leadership: newLeadership };
    
    setFormData(prev => ({ ...prev, aboutPage: newAboutPage }));

    try {
      await apiFetch(API_ABOUT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutPage: newAboutPage }),
      });
      showStatus('delete', `Deleted team member "${itemToDelete.name}" from database`);
      window.dispatchEvent(new CustomEvent('dezoryn-about-updated'));
    } catch {
      showStatus('error', 'Failed to delete team member from database');
    }
  };

  // ── MEDIA PICKER ──
  const openMediaPicker = (target: 'homepage-media' | 'leader-image', leaderId?: string) => {
    setMediaTarget(target);
    if (leaderId) setActiveLeaderId(leaderId);
    setIsMediaModalOpen(true);
    fetchMediaFiles();
  };

  const fetchMediaFiles = async () => {
    try {
      const res = await apiFetch(API_MEDIA);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMediaList(data.data);
      }
    } catch {
      // Fallback
    }
  };

  const handleSelectMedia = (url: string) => {
    if (mediaTarget === 'homepage-media') {
      setFormData(prev => ({ ...prev, mediaUrl: url }));
    } else if (mediaTarget === 'leader-image' && activeLeaderId) {
      const list = formData.aboutPage.leadership.map(l => l.id === activeLeaderId ? { ...l, image: url } : l);
      updateAboutPage({ leadership: list });
    }
    setIsMediaModalOpen(false);
    setMediaTarget(null);
    setActiveLeaderId(null);
  };

  const handleUploadMedia = async (file: File) => {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'AboutPage');
      const res = await apiFetch(`${API_MEDIA}/upload`, { method: 'POST', body });
      const data = await res.json();
      if (data.success && data.data?.url) {
        handleSelectMedia(data.data.url);
        showStatus('success', 'File uploaded successfully');
      }
    } catch {
      showStatus('error', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const TABS = [
    { id: 'story', label: 'Company Story & Hero', icon: Sparkles },
    { id: 'mission', label: 'Mission & Vision', icon: Target },
    { id: 'values', label: 'Core Principles', icon: Zap, badge: `${formData.aboutPage.coreValues.length}` },
    { id: 'milestones', label: 'Milestones & Journey', icon: Rocket, badge: `${formData.aboutPage.milestones.length}` },
    { id: 'leadership', label: 'Meet the Minds (Team)', icon: Users, badge: `${formData.aboutPage.leadership.length}` },
    { id: 'cta', label: 'Pre-Footer CTA Banner', icon: ArrowRight },
    { id: 'homepage', label: 'Homepage Snippet', icon: Layout },
    { id: 'preview', label: 'Live Preview', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="w-full max-w-[1550px] mx-auto space-y-6">

        {/* Floating Status Toast */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`fixed bottom-8 right-8 z-50 px-4 py-3.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-2xl flex items-center gap-3 max-w-md ${
                statusMsg.type === 'delete'
                  ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                  : statusMsg.type === 'success'
                  ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-500/10'
                  : statusMsg.type === 'error'
                  ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                  : 'bg-slate-900/95 text-white border-cyan-500/40 shadow-cyan-500/10'
              }`}
            >
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                statusMsg.type === 'delete'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : statusMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {statusMsg.type === 'delete' ? 'DELETED' : statusMsg.type === 'success' ? 'SAVED' : statusMsg.type === 'error' ? 'ERROR' : 'NOTICE'}
              </span>
              <span className="flex-1 leading-snug">{statusMsg.text}</span>
              <button
                type="button"
                onClick={() => setStatusMsg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 text-xs font-black uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Company Brand, Story & Team CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              About Us & Company Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Fully customize the public /about page, company milestones, core principles, leadership team, and pre-footer CTA banner.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={fetchAbout}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition cursor-pointer flex items-center gap-2 border border-slate-200 dark:border-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish to DB'}</span>
            </button>
          </div>
        </div>

        {/* Tabs Selector Strip */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-cyan-300 border-blue-500/30 dark:border-cyan-400/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 text-[10px] font-black border border-blue-500/20 dark:border-cyan-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: COMPANY STORY & HERO ── */}
        {activeTab === 'story' && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Hero Story & Brand Mission (Top of /about)</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Top Story Pill Badge
                  </label>
                  <input
                    type="text"
                    value={formData.aboutPage.storyBadge}
                    onChange={(e) => updateAboutPage({ storyBadge: e.target.value })}
                    placeholder="e.g. THE DEZORYN TECHNOLOGIES STORY & MISSION"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={formData.aboutPage.storyHeading}
                    onChange={(e) => updateAboutPage({ storyHeading: e.target.value })}
                    placeholder="e.g. Building the Future of Enterprise Software Intelligence"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Story Description
                </label>
                <textarea
                  rows={4}
                  value={formData.aboutPage.storyDescription}
                  onChange={(e) => updateAboutPage({ storyDescription: e.target.value })}
                  placeholder="Explain your company's origin, philosophy, and international scale."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Quick Action Buttons
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase">Primary Button</span>
                  <input
                    type="text"
                    value={formData.aboutPage.storyCtaPrimaryText}
                    onChange={(e) => updateAboutPage({ storyCtaPrimaryText: e.target.value })}
                    placeholder="Button text"
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={formData.aboutPage.storyCtaPrimaryLink}
                    onChange={(e) => updateAboutPage({ storyCtaPrimaryLink: e.target.value })}
                    placeholder="Link URL e.g. /products"
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase">Secondary Button</span>
                  <input
                    type="text"
                    value={formData.aboutPage.storyCtaSecondaryText}
                    onChange={(e) => updateAboutPage({ storyCtaSecondaryText: e.target.value })}
                    placeholder="Button text"
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={formData.aboutPage.storyCtaSecondaryLink}
                    onChange={(e) => updateAboutPage({ storyCtaSecondaryLink: e.target.value })}
                    placeholder="Link URL e.g. /book-demo"
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase">Contact Button</span>
                  <input
                    type="text"
                    value={formData.aboutPage.storyCtaContactText}
                    onChange={(e) => updateAboutPage({ storyCtaContactText: e.target.value })}
                    placeholder="Button text"
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={formData.aboutPage.storyCtaContactLink}
                    onChange={(e) => updateAboutPage({ storyCtaContactLink: e.target.value })}
                    placeholder="Link URL e.g. /contact-sales"
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MISSION & VISION ── */}
        {activeTab === 'mission' && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Our Mission Card</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Card Title</label>
                  <input
                    type="text"
                    value={formData.aboutPage.missionTitle}
                    onChange={(e) => updateAboutPage({ missionTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={formData.aboutPage.missionDesc}
                    onChange={(e) => updateAboutPage({ missionDesc: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Key Highlight Metric</label>
                  <input
                    type="text"
                    value={formData.aboutPage.missionHighlight}
                    onChange={(e) => updateAboutPage({ missionHighlight: e.target.value })}
                    placeholder="e.g. 10x Operational Efficiency Target"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Our Vision Card</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Card Title</label>
                  <input
                    type="text"
                    value={formData.aboutPage.visionTitle}
                    onChange={(e) => updateAboutPage({ visionTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={formData.aboutPage.visionDesc}
                    onChange={(e) => updateAboutPage({ visionDesc: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Key Highlight Metric</label>
                  <input
                    type="text"
                    value={formData.aboutPage.visionHighlight}
                    onChange={(e) => updateAboutPage({ visionHighlight: e.target.value })}
                    placeholder="e.g. Global 24/7 Unified Cloud Infrastructure"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CORE PRINCIPLES & VALUES ── */}
        {activeTab === 'values' && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <span>Core Principles & Values</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Custom principles that showcase your culture, commitment, and engineering standards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCoreValue}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Principle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={formData.aboutPage.coreValuesBadge}
                    onChange={(e) => updateAboutPage({ coreValuesBadge: e.target.value })}
                    placeholder="e.g. WHAT DRIVES US"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={formData.aboutPage.coreValuesTitle}
                    onChange={(e) => updateAboutPage({ coreValuesTitle: e.target.value })}
                    placeholder="e.g. Our Core Principles"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                {formData.aboutPage.coreValues.map((val, idx) => (
                  <div
                    key={val.id || idx}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 dark:text-cyan-400">Principle #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCoreValue(idx)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Principle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Principle Title</label>
                        <input
                          type="text"
                          value={val.title}
                          onChange={(e) => updateCoreValueItem(idx, { title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Icon</label>
                        <select
                          value={val.icon}
                          onChange={(e) => updateCoreValueItem(idx, { icon: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                        >
                          {AVAILABLE_ICONS.map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={val.desc}
                        onChange={(e) => updateCoreValueItem(idx, { desc: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: COMPANY MILESTONES & JOURNEY ── */}
        {activeTab === 'milestones' && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <span>Company Milestones & Journey Timeline</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Key historical moments, funding, product launches, and expansion steps (appears on /about & pre-footer).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={formData.aboutPage.milestonesBadge}
                    onChange={(e) => updateAboutPage({ milestonesBadge: e.target.value })}
                    placeholder="e.g. OUR JOURNEY"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={formData.aboutPage.milestonesTitle}
                    onChange={(e) => updateAboutPage({ milestonesTitle: e.target.value })}
                    placeholder="e.g. Company Milestones"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                {formData.aboutPage.milestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-black">{m.year}</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">{m.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveMilestone(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded bg-white dark:bg-slate-900 border text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMilestone(idx, 'down')}
                          disabled={idx === formData.aboutPage.milestones.length - 1}
                          className="p-1.5 rounded bg-white dark:bg-slate-900 border text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer ml-1"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Year / Period</label>
                        <input
                          type="text"
                          value={m.year}
                          onChange={(e) => updateMilestoneItem(idx, { year: e.target.value })}
                          placeholder="e.g. 2023"
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Milestone Title</label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => updateMilestoneItem(idx, { title: e.target.value })}
                          placeholder="e.g. AI Platform Launch"
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={m.desc}
                        onChange={(e) => updateMilestoneItem(idx, { desc: e.target.value })}
                        placeholder="What was achieved or launched during this phase?"
                        className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: EXECUTIVE LEADERSHIP TEAM ── */}
        {activeTab === 'leadership' && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <span>Meet the Minds Behind Dezoryn (Executive Leadership)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage founders, directors, and department heads displayed on the About Us page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addLeader}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Leader</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={formData.aboutPage.leadershipBadge}
                    onChange={(e) => updateAboutPage({ leadershipBadge: e.target.value })}
                    placeholder="e.g. EXECUTIVE LEADERSHIP"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={formData.aboutPage.leadershipTitle}
                    onChange={(e) => updateAboutPage({ leadershipTitle: e.target.value })}
                    placeholder="e.g. Meet the Minds Behind Dezoryn Technologies"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                {formData.aboutPage.leadership.map((person, idx) => (
                  <div
                    key={person.id || idx}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {person.image ? (
                          <img
                            src={resolveMediaUrl(person.image)}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover border border-blue-500/30 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {person.avatar || person.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">{person.name}</h4>
                          <p className="text-xs font-bold text-blue-600 dark:text-cyan-400">{person.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openMediaPicker('leader-image', person.id)}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLeader(idx)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Leader"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updateLeaderItem(idx, { name: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Role / Executive Title</label>
                        <input
                          type="text"
                          value={person.role}
                          onChange={(e) => updateLeaderItem(idx, { role: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Initials / Avatar</label>
                        <input
                          type="text"
                          value={person.avatar}
                          onChange={(e) => updateLeaderItem(idx, { avatar: e.target.value })}
                          placeholder="e.g. DV"
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Executive Bio</label>
                      <textarea
                        rows={2}
                        value={person.bio}
                        onChange={(e) => updateLeaderItem(idx, { bio: e.target.value })}
                        placeholder="Brief background and career highlights..."
                        className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: PRE-FOOTER CTA BANNER ── */}
        {activeTab === 'cta' && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Pre-Footer Cross-Promotion CTA Banner (Till Footer)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The high-converting cross-promotion banner situated at the bottom of the /about page before the footer.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CTA Main Heading</label>
                  <input
                    type="text"
                    value={formData.aboutPage.ctaHeading}
                    onChange={(e) => updateAboutPage({ ctaHeading: e.target.value })}
                    placeholder="e.g. Ready to Explore Our Enterprise Products?"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CTA Subtext / Description</label>
                  <textarea
                    rows={3}
                    value={formData.aboutPage.ctaDescription}
                    onChange={(e) => updateAboutPage({ ctaDescription: e.target.value })}
                    placeholder="e.g. Take a personalized tour of Dezoryn Technologies, SchoolyCore, HMS, and InventoryPro with our engineering team."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase">Primary Action Button</span>
                    <input
                      type="text"
                      value={formData.aboutPage.ctaPrimaryText}
                      onChange={(e) => updateAboutPage({ ctaPrimaryText: e.target.value })}
                      placeholder="Button text"
                      className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={formData.aboutPage.ctaPrimaryLink}
                      onChange={(e) => updateAboutPage({ ctaPrimaryLink: e.target.value })}
                      placeholder="Link URL e.g. /products"
                      className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase">Secondary Action Button</span>
                    <input
                      type="text"
                      value={formData.aboutPage.ctaSecondaryText}
                      onChange={(e) => updateAboutPage({ ctaSecondaryText: e.target.value })}
                      placeholder="Button text"
                      className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={formData.aboutPage.ctaSecondaryLink}
                      onChange={(e) => updateAboutPage({ ctaSecondaryLink: e.target.value })}
                      placeholder="Link URL e.g. /book-demo"
                      className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: HOMEPAGE SNIPPET ── */}
        {activeTab === 'homepage' && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Homepage About Section Snippet</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Main Heading</label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => setFormData(prev => ({ ...prev, heading: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paragraph 1</label>
                  <textarea
                    rows={3}
                    value={formData.descriptionOne}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionOne: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paragraph 2</label>
                  <textarea
                    rows={3}
                    value={formData.descriptionTwo}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionTwo: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Button Route</label>
                  <input
                    type="text"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Media Image URL / Asset</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.mediaUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                    placeholder="https://... or /uploads/..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('homepage-media')}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-blue-500 shadow-sm shrink-0"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Media Library</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 8: LIVE INTERACTIVE PREVIEW ── */}
        {activeTab === 'preview' && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider">Live Preview Mode:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('about-page')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    previewMode === 'about-page'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Full /about Page
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('homepage-section')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    previewMode === 'homepage-section'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Homepage Snippet
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-2xl bg-white dark:bg-slate-950">
              {previewMode === 'about-page' ? (
                <AboutUsPage />
              ) : (
                <AboutSection initialData={formData} />
              )}
            </div>
          </div>
        )}

        {/* ── MEDIA PICKER MODAL ── */}
        <AnimatePresence>
          {isMediaModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <span>Choose Media Asset</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload Input */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 text-center">
                  <label className="cursor-pointer block text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadMedia(f);
                      }}
                      className="hidden"
                    />
                    <span>{isUploading ? 'Uploading file...' : '+ Upload new image to server'}</span>
                  </label>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                  {mediaList.map((m) => (
                    <button
                      key={m.id || m.url}
                      type="button"
                      onClick={() => handleSelectMedia(m.url)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-blue-500 aspect-square cursor-pointer bg-slate-100 dark:bg-slate-950"
                    >
                      <img
                        src={resolveMediaUrl(m.url)}
                        alt={m.filename || 'asset'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
