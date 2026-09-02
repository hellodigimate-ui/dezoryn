import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Save, RotateCcw, Plus, Trash2, CheckCircle2,
  AlertTriangle, Sparkles, ChevronUp, ChevronDown, Calendar,
  Users, Building2, Layers, Headphones, ShieldCheck, Activity,
  TrendingUp, Bot, Zap, Globe, Award, Clock, Lock,
  Eye, RefreshCw
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';

export interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
  displayOrder: number;
  enabled: boolean;
  route?: string;
}

export interface HomepageStatsData {
  statsEnabled: boolean;
  aiAssistantEnabled: boolean;
  aiAssistantTitle: string;
  aiAssistantGreeting: string;
  aiAssistantButtonLabel: string;
  aiAssistantButtonLink: string;
  stats: StatItem[];
}

const DEFAULT_DATA: HomepageStatsData = {
  statsEnabled: true,
  aiAssistantEnabled: true,
  aiAssistantTitle: 'AI Assistant',
  aiAssistantGreeting: 'Hello! How can I help you today?',
  aiAssistantButtonLabel: 'Chat Now',
  aiAssistantButtonLink: '/chat',
  stats: [
    { id: 'stat-1', label: 'Year Established', value: '2023', icon: 'Calendar', displayOrder: 0, enabled: true, route: '/about' },
    { id: 'stat-2', label: 'Happy Users', value: '10,000+', icon: 'Users', displayOrder: 1, enabled: true, route: '/about' },
    { id: 'stat-3', label: 'Clients', value: '100+', icon: 'Building2', displayOrder: 2, enabled: true, route: '/about' },
    { id: 'stat-4', label: 'Products', value: '15+', icon: 'Layers', displayOrder: 3, enabled: true, route: '/marketplace' },
    { id: 'stat-5', label: 'Support', value: '24/7', icon: 'Headphones', displayOrder: 4, enabled: true, route: '/contact-sales' },
    { id: 'stat-6', label: 'Uptime', value: '99.9%', icon: 'ShieldCheck', displayOrder: 5, enabled: true, route: '/about' },
  ],
};

const AVAILABLE_ICONS = [
  { name: 'Calendar', icon: Calendar },
  { name: 'Users', icon: Users },
  { name: 'Building2', icon: Building2 },
  { name: 'Layers', icon: Layers },
  { name: 'Headphones', icon: Headphones },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Activity', icon: Activity },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Bot', icon: Bot },
  { name: 'Zap', icon: Zap },
  { name: 'Globe', icon: Globe },
  { name: 'Award', icon: Award },
  { name: 'Clock', icon: Clock },
  { name: 'Lock', icon: Lock },
];

const renderStatIcon = (iconName: string) => {
  const found = AVAILABLE_ICONS.find(i => i.name === iconName);
  const IconComp = found ? found.icon : BarChart3;
  return <IconComp className="w-5 h-5 text-cyan-500 dark:text-cyan-400 shrink-0" />;
};

const inputCls = "w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition";
const selectCls = `${inputCls} cursor-pointer`;

export const AdminHomepageStatsCMS: React.FC = () => {
  const [formData, setFormData] = useState<HomepageStatsData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/homepage-stats');
      const resData = await res.json();
      if (resData.success && resData.data) {
        const raw = resData.data;
        setFormData({
          statsEnabled: raw.statsEnabled ?? DEFAULT_DATA.statsEnabled,
          aiAssistantEnabled: raw.aiAssistantEnabled ?? DEFAULT_DATA.aiAssistantEnabled,
          aiAssistantTitle: raw.aiAssistantTitle || DEFAULT_DATA.aiAssistantTitle,
          aiAssistantGreeting: raw.aiAssistantGreeting || DEFAULT_DATA.aiAssistantGreeting,
          aiAssistantButtonLabel: raw.aiAssistantButtonLabel || DEFAULT_DATA.aiAssistantButtonLabel,
          aiAssistantButtonLink: raw.aiAssistantButtonLink || DEFAULT_DATA.aiAssistantButtonLink,
          stats: Array.isArray(raw.stats) && raw.stats.length > 0 ? raw.stats : DEFAULT_DATA.stats,
        });
      }
    } catch (_e) {
      // Keep default data fallback
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4500);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    formData.stats.forEach((s) => {
      if (!s.label || !s.label.trim()) {
        errors[`stat_label_${s.id}`] = 'Label is required';
      }
      if (s.value === undefined || s.value === null || String(s.value).trim() === '') {
        errors[`stat_value_${s.id}`] = 'Value is required';
      }
    });

    if (formData.aiAssistantEnabled) {
      if (!formData.aiAssistantTitle.trim()) {
        errors['aiAssistantTitle'] = 'Title is required when AI Assistant is enabled';
      }
      if (!formData.aiAssistantGreeting.trim()) {
        errors['aiAssistantGreeting'] = 'Greeting is required when AI Assistant is enabled';
      }
      if (!formData.aiAssistantButtonLabel.trim()) {
        errors['aiAssistantButtonLabel'] = 'Button label is required when AI Assistant is enabled';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Please correct the validation errors before saving.');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/homepage-stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      setIsSaving(false);

      if (resData.success) {
        showToast('success', 'Homepage statistics updated successfully.');
        if (resData.data) {
          setFormData({
            statsEnabled: resData.data.statsEnabled ?? formData.statsEnabled,
            aiAssistantEnabled: resData.data.aiAssistantEnabled ?? formData.aiAssistantEnabled,
            aiAssistantTitle: resData.data.aiAssistantTitle || formData.aiAssistantTitle,
            aiAssistantGreeting: resData.data.aiAssistantGreeting || formData.aiAssistantGreeting,
            aiAssistantButtonLabel: resData.data.aiAssistantButtonLabel || formData.aiAssistantButtonLabel,
            aiAssistantButtonLink: resData.data.aiAssistantButtonLink || formData.aiAssistantButtonLink,
            stats: Array.isArray(resData.data.stats) ? resData.data.stats : formData.stats,
          });
        }
      } else {
        showToast('error', resData.message || 'Unable to save homepage statistics. Please try again.');
      }
    } catch (_err) {
      setIsSaving(false);
      showToast('error', 'Unable to save homepage statistics. Please try again.');
    }
  };

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    setIsResetting(true);
    setMessage(null);

    try {
      const res = await apiFetch('/homepage-stats/reset', {
        method: 'POST',
      });
      const resData = await res.json();
      setIsResetting(false);

      if (resData.success && resData.data) {
        setFormData(resData.data);
      } else {
        setFormData(DEFAULT_DATA);
      }
      showToast('success', 'Homepage statistics reset to default values.');
    } catch (_err) {
      setIsResetting(false);
      setFormData(DEFAULT_DATA);
      showToast('success', 'Homepage statistics reset to default values.');
    }
  };

  const handleStatChange = (id: string, field: keyof StatItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleMoveStat = (index: number, direction: 'up' | 'down') => {
    const newStats = [...formData.stats];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStats.length) return;

    const temp = newStats[index];
    newStats[index] = newStats[targetIndex];
    newStats[targetIndex] = temp;

    // Update display orders
    const reordered = newStats.map((item, idx) => ({ ...item, displayOrder: idx }));
    setFormData((prev) => ({ ...prev, stats: reordered }));
  };

  const handleAddStat = () => {
    const newStat: StatItem = {
      id: `stat-${Date.now()}`,
      label: 'New Statistic',
      value: '100+',
      icon: 'Sparkles',
      displayOrder: formData.stats.length,
      enabled: true,
      route: '/about',
    };
    setFormData((prev) => ({ ...prev, stats: [...prev.stats, newStat] }));
  };

  const handleRemoveStat = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((s) => s.id !== id).map((s, idx) => ({ ...s, displayOrder: idx })),
    }));
  };

  const sortedStats = [...formData.stats].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const activeStatsForPreview = sortedStats.filter(s => s.enabled);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading Homepage Stats CMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-bold ${
              message.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800 backdrop-blur-xl'
                : 'bg-rose-950/90 text-rose-300 border-rose-800 backdrop-blur-xl'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Reset */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-extrabold">Reset Homepage Statistics?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reset homepage statistics to the default values?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetConfirm}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Homepage CMS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Stats & AI Assistant
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xl">
            Manage the statistics, trust indicators, support information, and AI Assistant CTA displayed on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={isSaving || isResetting}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving || isResetting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editors (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Homepage Statistics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-500" />
                  <span>Homepage Statistics</span>
                </h2>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage the key business statistics displayed below the homepage hero section.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Enabled</span>
                <input
                  type="checkbox"
                  checked={formData.statsEnabled}
                  onChange={(e) => setFormData((p) => ({ ...p, statsEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Statistics Cards List */}
            <div className="space-y-4">
              {sortedStats.map((stat, idx) => (
                <div
                  key={stat.id}
                  className={`p-4 rounded-xl border transition-all ${
                    stat.enabled
                      ? 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-100/50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                        {renderStatIcon(stat.icon)}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        STAT {idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStat(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStat(idx, 'down')}
                        disabled={idx === sortedStats.length - 1}
                        title="Move Down"
                        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 cursor-pointer text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={stat.enabled}
                          onChange={(e) => handleStatChange(stat.id, 'enabled', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>Active</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveStat(stat.id)}
                        title="Remove Stat"
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Label <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                        placeholder="e.g. Happy Users"
                        className={inputCls}
                      />
                      {validationErrors[`stat_label_${stat.id}`] && (
                        <p className="text-[10px] font-bold text-rose-400 mt-1">
                          {validationErrors[`stat_label_${stat.id}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Value <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                        placeholder="e.g. 10,000+"
                        className={inputCls}
                      />
                      {validationErrors[`stat_value_${stat.id}`] && (
                        <p className="text-[10px] font-bold text-rose-400 mt-1">
                          {validationErrors[`stat_value_${stat.id}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Icon
                      </label>
                      <select
                        value={stat.icon}
                        onChange={(e) => handleStatChange(stat.id, 'icon', e.target.value)}
                        className={selectCls}
                      >
                        {AVAILABLE_ICONS.map((i) => (
                          <option key={i.name} value={i.name}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={stat.displayOrder}
                        onChange={(e) => handleStatChange(stat.id, 'displayOrder', parseInt(e.target.value, 10) || 0)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStat}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Statistic</span>
            </button>
          </div>

          {/* Card 2: AI Assistant CTA */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <span>AI Assistant CTA</span>
                </h2>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure the AI Assistant badge and chat call-to-action block.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Enabled</span>
                <input
                  type="checkbox"
                  checked={formData.aiAssistantEnabled}
                  onChange={(e) => setFormData((p) => ({ ...p, aiAssistantEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assistant Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.aiAssistantTitle}
                  onChange={(e) => setFormData((p) => ({ ...p, aiAssistantTitle: e.target.value }))}
                  placeholder="e.g. AI Assistant"
                  className={inputCls}
                />
                {validationErrors['aiAssistantTitle'] && (
                  <p className="text-[10px] font-bold text-rose-400 mt-1">
                    {validationErrors['aiAssistantTitle']}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Greeting Message <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.aiAssistantGreeting}
                  onChange={(e) => setFormData((p) => ({ ...p, aiAssistantGreeting: e.target.value }))}
                  placeholder="e.g. Hello! How can I help you today?"
                  className={inputCls}
                />
                {validationErrors['aiAssistantGreeting'] && (
                  <p className="text-[10px] font-bold text-rose-400 mt-1">
                    {validationErrors['aiAssistantGreeting']}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Button Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.aiAssistantButtonLabel}
                  onChange={(e) => setFormData((p) => ({ ...p, aiAssistantButtonLabel: e.target.value }))}
                  placeholder="e.g. Chat Now"
                  className={inputCls}
                />
                {validationErrors['aiAssistantButtonLabel'] && (
                  <p className="text-[10px] font-bold text-rose-400 mt-1">
                    {validationErrors['aiAssistantButtonLabel']}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Button Link / Action
                </label>
                <input
                  type="text"
                  value={formData.aiAssistantButtonLink}
                  onChange={(e) => setFormData((p) => ({ ...p, aiAssistantButtonLink: e.target.value }))}
                  placeholder="e.g. /chat"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  LIVE PREVIEW
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                Real-Time
              </span>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Visual preview of how the stats bar will appear on the public Dezoryn homepage.
            </p>

            {/* Simulated Homepage Section Container */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-6 overflow-hidden">
              {/* Statistics Grid */}
              {formData.statsEnabled && activeStatsForPreview.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {activeStatsForPreview.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                        {renderStatIcon(stat.icon)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                          {stat.value || '0'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                          {stat.label || 'Label'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs font-semibold text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  {formData.statsEnabled ? 'No active statistics' : 'Statistics section disabled'}
                </div>
              )}

              {/* AI Assistant CTA Block */}
              {formData.aiAssistantEnabled ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md relative shrink-0">
                      <Bot className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {formData.aiAssistantTitle || 'AI Assistant'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {formData.aiAssistantGreeting || 'Greeting'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
                  >
                    {formData.aiAssistantButtonLabel || 'Chat Now'}
                  </button>
                </div>
              ) : (
                <div className="p-3 text-center text-xs font-semibold text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  AI Assistant Widget Disabled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
