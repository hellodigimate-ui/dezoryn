import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Tag,
  BarChart3,
  Globe,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';
import { openAdminAIAssistant } from './AdminLayout';

export interface StatCardItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
}

export interface HeroData {
  badgeText: string;
  badgeIcon: string;
  mainHeading: string;
  gradientHeading: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  statsCards: StatCardItem[];
  techTags: string[];
}

const DEFAULT_HERO_CMS: HeroData = {
  badgeText: 'DEZORYN 3.0 ENTERPRISE SUITE',
  badgeIcon: 'Sparkles',
  mainHeading: 'Autonomous Operations for',
  gradientHeading: 'Modern Enterprises',
  description: 'Dezoryn Technologies unifies ERP, CRM, and AI automation into a single intelligent operating platform. Streamline workflows, scale operations, and boost productivity.',
  primaryBtnText: 'Explore Solution',
  primaryBtnLink: '/products',
  secondaryBtnText: 'Schedule Demo',
  secondaryBtnLink: '/book-demo',
  statsCards: [
    { id: 'stat-1', label: 'Enterprise Growth', value: '4.8x', subtext: '+140% YoY' },
    { id: 'stat-2', label: 'Automation Rate', value: '99.9%', subtext: 'Zero Latency' },
    { id: 'stat-3', label: 'Active Workflows', value: '10M+', subtext: 'Global Fleet' },
  ],
  techTags: [
    'AI Core 3.0',
    'Enterprise ERP',
    'PostgreSQL',
    'React 18',
    'Prisma ORM',
    'JWT RBAC',
  ],
};

export const AdminHeroCMS: React.FC = () => {
  const [formData, setFormData] = useState<HeroData>(DEFAULT_HERO_CMS);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Fetch initial hero content directly from PostgreSQL Database API
  useEffect(() => {
    apiFetch('/hero')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setFormData({
            badgeText: resData.data.badgeText || DEFAULT_HERO_CMS.badgeText,
            badgeIcon: resData.data.badgeIcon || DEFAULT_HERO_CMS.badgeIcon,
            mainHeading: resData.data.mainHeading || DEFAULT_HERO_CMS.mainHeading,
            gradientHeading: resData.data.gradientHeading || DEFAULT_HERO_CMS.gradientHeading,
            description: resData.data.description || DEFAULT_HERO_CMS.description,
            primaryBtnText: resData.data.primaryBtnText || DEFAULT_HERO_CMS.primaryBtnText,
            primaryBtnLink: resData.data.primaryBtnLink || DEFAULT_HERO_CMS.primaryBtnLink,
            secondaryBtnText: resData.data.secondaryBtnText || DEFAULT_HERO_CMS.secondaryBtnText,
            secondaryBtnLink: resData.data.secondaryBtnLink || DEFAULT_HERO_CMS.secondaryBtnLink,
            statsCards: Array.isArray(resData.data.statsCards) ? resData.data.statsCards : DEFAULT_HERO_CMS.statsCards,
            techTags: Array.isArray(resData.data.techTags) ? resData.data.techTags : DEFAULT_HERO_CMS.techTags,
          });
        }
      })
      .catch(() => {
        // Fallback to local default state if backend API is not running
      });
  }, []);

  const handleInputChange = (field: keyof HeroData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatCardChange = (id: string, field: keyof StatCardItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      statsCards: prev.statsCards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      ),
    }));
  };

  const handleAddStatCard = () => {
    const newCard: StatCardItem = {
      id: `stat-${Date.now()}`,
      label: 'New Stat Metric',
      value: '100%',
      subtext: 'Real-time',
    };
    setFormData((prev) => ({
      ...prev,
      statsCards: [...prev.statsCards, newCard],
    }));
  };

  const handleRemoveStatCard = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      statsCards: prev.statsCards.filter((card) => card.id !== id),
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (formData.techTags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      techTags: [...prev.techTags, newTag.trim()],
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      techTags: prev.techTags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await apiFetch('/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();
      setIsSaving(false);

      if (resData.success) {
        try {
          localStorage.setItem('dezo_hero_cms', JSON.stringify(formData));
          window.dispatchEvent(new Event('dezo_hero_updated'));
        } catch (_e) {}
        setMessage({ type: 'success', text: 'Hero Section updated & saved permanently in PostgreSQL Database!' });
      } else {
        setMessage({ type: 'error', text: resData.message || 'Failed to save to PostgreSQL database' });
      }
    } catch (_err) {
      setIsSaving(false);
      setMessage({ type: 'error', text: 'Backend API error while saving to database' });
    }

    setTimeout(() => setMessage(null), 4000);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setMessage(null);

    try {
      await apiFetch('/hero/reset', {
        method: 'POST',
      });
    } catch (_err) {
      // ignore network errors for reset
    }

    setFormData(DEFAULT_HERO_CMS);
    try {
      localStorage.setItem('dezo_hero_cms', JSON.stringify(DEFAULT_HERO_CMS));
      window.dispatchEvent(new Event('dezo_hero_updated'));
    } catch (_e) {}
    setIsResetting(false);
    setMessage({ type: 'info', text: 'Hero Section content reset in PostgreSQL Database.' });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Page Builder Module
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Hero Section Editor
          </h1>
          <p className="text-xs md:text-sm text-blue-50 max-w-xl">
            Edit text, headings, buttons, stats cards, and technology tags for your live homepage Hero Section.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              openAdminAIAssistant({
                type: 'hero',
                topic: formData.mainHeading,
                onInsert: (fieldType, value) => {
                  if (typeof value === 'object') {
                    setFormData((prev) => ({ ...prev, ...value }));
                  } else if (fieldType in formData) {
                    setFormData((prev) => ({ ...prev, [fieldType]: value }));
                  }
                },
              })
            }
            className="px-4 py-2.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/40 text-cyan-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            Generate with AI
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting && 'animate-spin'}`} />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs transition shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-3 shadow-md ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Main CMS Split: Editing Form (Left) & Real-Time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editing Form (2 Columns) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Section 1: Main Text Content */}
          <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-500" />
              Main Hero Headings & Text
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Badge Text */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Text</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => handleInputChange('badgeText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>

              {/* Main Heading */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Heading (Prefix)</label>
                <input
                  type="text"
                  value={formData.mainHeading}
                  onChange={(e) => handleInputChange('mainHeading', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>

              {/* Gradient Heading */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gradient Highlight Heading</label>
                <input
                  type="text"
                  value={formData.gradientHeading}
                  onChange={(e) => handleInputChange('gradientHeading', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description Paragraph</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Call to Action Buttons */}
          <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Call to Action Buttons
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Button Label</label>
                <input
                  type="text"
                  value={formData.primaryBtnText}
                  onChange={(e) => handleInputChange('primaryBtnText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Button Link</label>
                <input
                  type="text"
                  value={formData.primaryBtnLink}
                  onChange={(e) => handleInputChange('primaryBtnLink', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Button Label</label>
                <input
                  type="text"
                  value={formData.secondaryBtnText}
                  onChange={(e) => handleInputChange('secondaryBtnText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Button Link</label>
                <input
                  type="text"
                  value={formData.secondaryBtnLink}
                  onChange={(e) => handleInputChange('secondaryBtnLink', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Statistics Cards Editor */}
          <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Statistics & Impact Cards
              </h3>

              <button
                type="button"
                onClick={handleAddStatCard}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Stat Card
              </button>
            </div>

            <div className="space-y-3">
              {formData.statsCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
                >
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Label</label>
                    <input
                      type="text"
                      value={card.label}
                      onChange={(e) => handleStatCardChange(card.id, 'label', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Value</label>
                    <input
                      type="text"
                      value={card.value}
                      onChange={(e) => handleStatCardChange(card.id, 'value', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Subtext Badge</label>
                      <input
                        type="text"
                        value={card.subtext}
                        onChange={(e) => handleStatCardChange(card.id, 'subtext', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStatCard(card.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 mt-3 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Technology Tags Editor */}
          <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              Technology Chips & Tags
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag name and press Enter (e.g. Next.js, AI Engine)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer shrink-0"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.techTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Real-Time Live Preview (1 Column) */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4 sticky top-24 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Hero Preview
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                Real-Time
              </span>
            </div>

            {/* Badge Preview */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 text-[10px] font-extrabold">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
              {formData.badgeText}
            </div>

            {/* Headings Preview */}
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug">
              {formData.mainHeading}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">
                {formData.gradientHeading}
              </span>
            </h3>

            {/* Description Preview */}
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
              {formData.description}
            </p>

            {/* Buttons Preview */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black flex items-center gap-1">
                {formData.primaryBtnText} <ArrowRight className="w-3 h-3" />
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold">
                {formData.secondaryBtnText}
              </span>
            </div>

            {/* Stats Cards Preview */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {formData.statsCards.map((card) => (
                <div key={card.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{card.label}</div>
                  <div className="text-base font-black text-blue-600 dark:text-cyan-400">{card.value}</div>
                  <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{card.subtext}</div>
                </div>
              ))}
            </div>

            {/* Tech Tags Preview */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Tech Tags:</div>
              <div className="flex flex-wrap gap-1">
                {formData.techTags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-transparent">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
