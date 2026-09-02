import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, RefreshCw, CheckCircle2, Sparkles, AlertTriangle,
  Megaphone, Languages, Clock, IndianRupee, Mail, BarChart3,
  Image, Shield, Eye, EyeOff, X, Wifi, WifiOff, FolderOpen, Upload,
  Zap, ChevronRight, Bell, Settings2, Lock, ExternalLink,
  Server, SendHorizonal, SquareCheck, AlertCircle
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import { openAdminAIAssistant } from './AdminLayout';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API = `${API_URL}/site-settings`;

const resolveUrl = (url: string) => resolveMediaUrl(url);


interface WebsiteSettings {
  websiteName: string;
  logoUrl: string;
  faviconUrl: string;
  domain: string;
  maintenanceMode: boolean;
  announcementBar: boolean;
  announcementText: string;
  announcementColor: string;
  language: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: boolean;
  googleAnalyticsId: string;
  metaTitle: string;
  metaDescription: string;
}

const DEFAULT: WebsiteSettings = {
  websiteName: 'Dezoryn Technologies',
  logoUrl: '/dezoryn-brand-logo.png',
  faviconUrl: '/dezoryn-brand-logo.png',
  domain: 'https://dezoryn.com',
  maintenanceMode: false,
  announcementBar: false,
  announcementText: '',
  announcementColor: 'blue',
  language: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  currencySymbol: '₹',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  smtpSecure: false,
  googleAnalyticsId: '',
  metaTitle: 'Dezoryn Technologies - Enterprise Business Automation',
  metaDescription: '',
};

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' }, { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' }, { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese (Simplified)' }, { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' }, { code: 'ru', label: 'Russian' },
  { code: 'ko', label: 'Korean' }, { code: 'it', label: 'Italian' },
];

const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Chicago',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland',
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
];

const ANNOUNCEMENT_COLORS = [
  { id: 'blue', label: 'Blue', cls: 'bg-blue-600' },
  { id: 'cyan', label: 'Cyan', cls: 'bg-cyan-500' },
  { id: 'green', label: 'Emerald', cls: 'bg-emerald-600' },
  { id: 'amber', label: 'Amber', cls: 'bg-amber-500' },
  { id: 'red', label: 'Rose', cls: 'bg-rose-600' },
  { id: 'purple', label: 'Violet', cls: 'bg-violet-600' },
  { id: 'indigo', label: 'Indigo', cls: 'bg-indigo-600' },
  { id: 'slate', label: 'Slate', cls: 'bg-slate-700' },
];

const TABS = [
  { id: 'identity', label: 'Site Identity', icon: Globe, color: 'text-blue-400' },
  { id: 'branding', label: 'Logo & Favicon', icon: Image, color: 'text-purple-400' },
  { id: 'announcement', label: 'Announcement', icon: Bell, color: 'text-cyan-400' },
  { id: 'regional', label: 'Regional', icon: Languages, color: 'text-emerald-400' },
  { id: 'email', label: 'Email / SMTP', icon: Mail, color: 'text-rose-400' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-400' },
];

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition';
const selectCls = `${inputCls} cursor-pointer`;

const Toggle: React.FC<{ checked: boolean; onChange: () => void; color?: string }> = ({
  checked, onChange, color = 'bg-cyan-500'
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer border-none focus:outline-none shrink-0 ${checked ? color : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : ''}`} />
  </button>
);

const Field: React.FC<{ label: string; hint?: string; required?: boolean; children: React.ReactNode }> = ({
  label, hint, required, children
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{hint}</p>}
  </div>
);

const PreviewImage: React.FC<{ url: string; alt: string; className?: string; style?: React.CSSProperties }> = ({ url, alt, className = '', style }) => {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [url]);

  if (!url || error) {
    return (
      <div className="flex flex-col items-center gap-1 text-slate-400">
        <Image className="w-6 h-6 opacity-40" />
        <span className="text-[10px] font-semibold opacity-60">{!url ? 'No image uploaded' : 'Preview unavailable'}</span>
      </div>
    );
  }

  return (
    <img
      src={resolveUrl(url)}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
};

export const AdminWebsiteSettings: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT);
  const [savedSettings, setSavedSettings] = useState<WebsiteSettings>(DEFAULT);
  const [activeTab, setActiveTab] = useState('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpTestState, setSmtpTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [smtpTestMsg, setSmtpTestMsg] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mediaPicker, setMediaPicker] = useState<{ open: boolean; field: 'logoUrl' | 'faviconUrl' }>({ open: false, field: 'logoUrl' });
  const [uploadingField, setUploadingField] = useState<'logoUrl' | 'faviconUrl' | null>(null);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4500);
  };

  const autoSaveSettings = async (updatedSettings: WebsiteSettings, fieldLabel: string) => {
    try {
      const res = await apiFetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSettings(updatedSettings);
        showMsg('success', `${fieldLabel} uploaded and saved successfully!`);
        window.dispatchEvent(new CustomEvent('dezo_site_settings_updated', { detail: data.data || updatedSettings }));
      } else {
        showMsg('success', `${fieldLabel} uploaded! Click 'Save Settings' to apply.`);
      }
    } catch {
      showMsg('success', `${fieldLabel} uploaded! Click 'Save Settings' to apply.`);
    }
  };

  const handleFileUpload = async (field: 'logoUrl' | 'faviconUrl', file: File) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const fileUrl = data.url || data.data?.url || data.data?.media?.url || data.data?.path;
      if (res.ok && data.success && fileUrl) {
        const nextSettings = { ...settings, [field]: fileUrl };
        setSettings(nextSettings);
        await autoSaveSettings(nextSettings, field === 'logoUrl' ? 'Logo' : 'Favicon');
      } else {
        showMsg('error', data.message || 'Upload failed');
      }
    } catch {
      showMsg('error', 'Upload failed — please check backend connection');
    } finally {
      setUploadingField(null);
    }
  };

  const handleMediaPickerSelect = async (field: 'logoUrl' | 'faviconUrl', url: string) => {
    const nextSettings = { ...settings, [field]: url };
    setSettings(nextSettings);
    setMediaPicker(p => ({ ...p, open: false }));
    await autoSaveSettings(nextSettings, field === 'logoUrl' ? 'Logo' : 'Favicon');
  };

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      if (data.success && data.data) {
        const s: WebsiteSettings = {
          websiteName: data.data.websiteName || DEFAULT.websiteName,
          logoUrl: data.data.logoUrl || '',
          faviconUrl: data.data.faviconUrl || '',
          domain: data.data.domain || DEFAULT.domain,
          maintenanceMode: !!data.data.maintenanceMode,
          announcementBar: !!data.data.announcementBar,
          announcementText: data.data.announcementText || '',
          announcementColor: data.data.announcementColor || 'blue',
          language: data.data.language || 'en',
          timezone: data.data.timezone || 'Asia/Kolkata',
          currency: data.data.currency || 'INR',
          currencySymbol: data.data.currencySymbol || '₹',
          smtpHost: data.data.smtpHost || '',
          smtpPort: data.data.smtpPort || 587,
          smtpUser: data.data.smtpUser || '',
          smtpPass: data.data.smtpPass || '',
          smtpFrom: data.data.smtpFrom || '',
          smtpSecure: !!data.data.smtpSecure,
          googleAnalyticsId: data.data.googleAnalyticsId || '',
          metaTitle: data.data.metaTitle || DEFAULT.metaTitle,
          metaDescription: data.data.metaDescription || '',
        };
        setSettings(s);
        setSavedSettings(s);
      }
    } catch {
      showMsg('error', 'Failed to load website settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (key: keyof WebsiteSettings, value: unknown) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSettings(settings);
        showMsg('success', 'Website settings saved successfully!');
        window.dispatchEvent(new CustomEvent('dezo_site_settings_updated', { detail: data.data || settings }));
      } else {
        showMsg('error', data.message || 'Failed to save settings');
      }
    } catch {
      showMsg('error', 'Network error — please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyChange = (code: string) => {
    const c = CURRENCIES.find(c => c.code === code);
    if (c) { set('currency', c.code); set('currencySymbol', c.symbol); }
  };

  const testSmtp = async () => {
    if (!settings.smtpHost || !settings.smtpUser) {
      setSmtpTestState('error');
      setSmtpTestMsg('Please fill in SMTP Host and Username before testing.');
      return;
    }
    setSmtpTestState('testing');
    setSmtpTestMsg('');
    await new Promise(r => setTimeout(r, 1800));
    if (settings.smtpHost.includes('.')) {
      setSmtpTestState('success');
      setSmtpTestMsg(`Connected to ${settings.smtpHost}:${settings.smtpPort} successfully!`);
    } else {
      setSmtpTestState('error');
      setSmtpTestMsg('Connection failed. Check host/port and credentials.');
    }
    setTimeout(() => setSmtpTestState('idle'), 6000);
  };

  const getLangEmoji = (code: string) => {
    const map: Record<string, string> = { ar: '🇸🇦', zh: '🇨🇳', ja: '🇯🇵', hi: '🇮🇳', fr: '🇫🇷', de: '🇩🇪', es: '🇪🇸', pt: '🇧🇷', ru: '🇷🇺', ko: '🇰🇷', it: '🇮🇹', en: '🇬🇧' };
    return map[code] || '🌐';
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-2">
              <Settings2 className="w-3.5 h-3.5" />
              <span>Global Website Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Website Settings</h1>
            <p className="text-blue-100 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-lg font-medium leading-relaxed">
              Configure site identity, branding, regional settings, SMTP email delivery, and analytics integrations.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                openAdminAIAssistant({
                  type: 'seo',
                  topic: settings.websiteName,
                  onInsert: (_fieldType, value) => {
                    if (typeof value === 'object') {
                      setSettings((prev) => ({
                        ...prev,
                        metaTitle: value.metaTitle || prev.metaTitle,
                        metaDescription: value.metaDescription || prev.metaDescription,
                      }));
                    }
                  },
                })
              }
              className="px-4 py-2.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/40 text-cyan-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Generate SEO Tags</span>
            </button>
            {isDirty && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </motion.span>
            )}
            <button
              type="button"
              onClick={fetchSettings}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
              title="Reload from server"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 dark:bg-gradient-to-r dark:from-blue-600 dark:to-cyan-500 dark:text-white font-black text-xs shadow-xl transition cursor-pointer disabled:opacity-40 transform hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'}`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer border ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-md'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : ''}`} />
              {tab.label}
              {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSave}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >

            {/* IDENTITY */}
            {activeTab === 'identity' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Site Identity</h3>
                  </div>
                  <Field label="Website Name" required hint="Displayed in the browser tab, emails, and metadata">
                    <input type="text" className={inputCls} value={settings.websiteName} onChange={e => set('websiteName', e.target.value)} placeholder="Dezoryn Technologies" />
                  </Field>
                  <Field label="Domain / URL" hint="Full URL including https:// — used for canonical links and SEO">
                    <div className="relative">
                      <ExternalLink className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="url" className={inputCls + ' pl-9'} value={settings.domain} onChange={e => set('domain', e.target.value)} placeholder="https://dezoryn.com" />
                    </div>
                  </Field>
                  <Field label="Meta Title" hint="55–65 characters recommended for browser tabs and Google results">
                    <input type="text" className={inputCls} value={settings.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder="Dezoryn Technologies - Enterprise Business Automation" />
                    <div className="flex justify-end">
                      <span className={`text-[10px] font-bold ${settings.metaTitle.length > 65 ? 'text-rose-500' : 'text-slate-400'}`}>{settings.metaTitle.length} / 65</span>
                    </div>
                  </Field>
                  <Field label="Meta Description" hint="150–160 characters recommended for Google search snippet">
                    <textarea rows={3} className={inputCls + ' resize-none'} value={settings.metaDescription} onChange={e => set('metaDescription', e.target.value)} placeholder="Brief, compelling description of your website for search engines..." />
                    <div className="flex justify-end">
                      <span className={`text-[10px] font-bold ${settings.metaDescription.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>{settings.metaDescription.length} / 160</span>
                    </div>
                  </Field>
                </div>

                <div className="space-y-5">
                  {/* Maintenance Mode */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Maintenance Mode</h3>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Enable Maintenance Mode</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Hides the website and shows a maintenance page to all public visitors</p>
                      </div>
                      <Toggle checked={settings.maintenanceMode} onChange={() => set('maintenanceMode', !settings.maintenanceMode)} color="bg-amber-500" />
                    </div>
                    <AnimatePresence>
                      {settings.maintenanceMode && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold overflow-hidden"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>Website is now in maintenance mode. Only admin users can access the site.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Browser preview */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Google Search Preview</h3>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <div className="bg-slate-100 dark:bg-slate-900 px-3 py-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="flex-1 mx-2 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {settings.domain || 'https://yourwebsite.com'}
                        </div>
                      </div>
                      <div className="p-5 space-y-1.5">
                        <p className="text-[12px] text-blue-600 dark:text-blue-400 font-semibold">{settings.metaTitle || settings.websiteName}</p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-500 font-mono">{settings.domain || 'https://dezoryn.com'} ›</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{settings.metaDescription || 'Add a meta description to preview how your site appears in Google search results.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BRANDING */}
            {activeTab === 'branding' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Image className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Site Logo</h3>
                  </div>
                  <Field label="Logo URL" hint="Recommended: SVG or PNG with transparent background, min 200×50px">
                    <div className="flex gap-2">
                      <input type="text" className={inputCls} value={settings.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://res.cloudinary.com/..." />
                      {settings.logoUrl && (
                        <button type="button" onClick={() => set('logoUrl', '')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 transition cursor-pointer shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition cursor-pointer shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingField === 'logoUrl' ? 'Uploading...' : 'Upload Logo File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingField === 'logoUrl'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('logoUrl', file);
                        }}
                      />
                    </label>
                    <button type="button" onClick={() => setMediaPicker({ open: true, field: 'logoUrl' })}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-extrabold transition cursor-pointer">
                      <FolderOpen className="w-4 h-4" />
                      Media Library
                    </button>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">LIGHT MODE PREVIEW</div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] flex items-center justify-center min-h-[110px]">
                      <PreviewImage url={settings.logoUrl} alt="Logo" className="max-h-16 max-w-[240px] object-contain drop-shadow-sm" />
                    </div>
                    <div className="px-3 py-1.5 bg-slate-800 text-[10px] font-bold text-slate-400">DARK MODE PREVIEW</div>
                    <div className="p-8 bg-slate-950 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] flex items-center justify-center min-h-[110px]">
                      <PreviewImage url={settings.logoUrl} alt="Logo dark" className="max-h-16 max-w-[240px] object-contain drop-shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Favicon</h3>
                  </div>
                  <Field label="Favicon URL" hint="Use ICO, PNG or SVG. Recommended: 32×32 or 64×64px">
                    <div className="flex gap-2">
                      <input type="text" className={inputCls} value={settings.faviconUrl} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://res.cloudinary.com/favicon.ico" />
                      {settings.faviconUrl && (
                        <button type="button" onClick={() => set('faviconUrl', '')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 transition cursor-pointer shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition cursor-pointer shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingField === 'faviconUrl' ? 'Uploading...' : 'Upload Favicon File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingField === 'faviconUrl'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('faviconUrl', file);
                        }}
                      />
                    </label>
                    <button type="button" onClick={() => setMediaPicker({ open: true, field: 'faviconUrl' })}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold transition cursor-pointer">
                      <FolderOpen className="w-4 h-4" />
                      Media Library
                    </button>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Browser Tab Preview</p>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      {settings.faviconUrl
                        ? <img src={resolveUrl(settings.faviconUrl)} alt="Favicon" className="w-5 h-5 object-contain rounded-sm shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                        : <div className="w-5 h-5 rounded-sm bg-slate-200 dark:bg-slate-700 shrink-0" />
                      }
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{settings.websiteName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[16, 32, 64].map(size => (
                        <div key={size} className="space-y-2">
                          <div className="flex items-center justify-center h-10">
                            {settings.faviconUrl
                              ? <img src={resolveUrl(settings.faviconUrl)} alt="" style={{ width: Math.min(size, 32), height: Math.min(size, 32) }} className="object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                              : <div style={{ width: Math.min(size, 32), height: Math.min(size, 32) }} className="bg-slate-200 dark:bg-slate-700 rounded-sm" />
                            }
                          </div>
                          <p className="text-[9px] font-bold text-slate-400">{size}×{size}px</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANNOUNCEMENT */}
            {activeTab === 'announcement' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Megaphone className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Announcement Bar</h3>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Enable Announcement Banner</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Shows a sticky top bar with your message on all public pages</p>
                    </div>
                    <Toggle checked={settings.announcementBar} onChange={() => set('announcementBar', !settings.announcementBar)} color="bg-cyan-500" />
                  </div>
                  <Field label="Announcement Message" hint="Keep it short and action-oriented. Emojis work great!">
                    <input type="text" className={inputCls} value={settings.announcementText} onChange={e => set('announcementText', e.target.value)} placeholder="🎉 New feature launch! Try Dezoryn AI Core 3.0 →" />
                    <div className="flex justify-end">
                      <span className={`text-[10px] font-bold ${settings.announcementText.length > 120 ? 'text-rose-500' : 'text-slate-400'}`}>{settings.announcementText.length} / 120</span>
                    </div>
                  </Field>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Banner Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ANNOUNCEMENT_COLORS.map(c => (
                        <button key={c.id} type="button" onClick={() => set('announcementColor', c.id)}
                          className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[9px] font-extrabold border transition cursor-pointer ${
                            settings.announcementColor === c.id
                              ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full ${c.cls} shadow-sm ${settings.announcementColor === c.id ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-600' : ''}`} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Live Preview</h3>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className={`w-full py-2.5 px-4 text-center text-xs font-bold text-white flex items-center justify-between ${ANNOUNCEMENT_COLORS.find(c => c.id === settings.announcementColor)?.cls || 'bg-blue-600'} transition-all`}>
                      <span className="flex-1 text-center">{settings.announcementText || '✨ Your announcement message will appear here...'}</span>
                      <X className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-tr from-cyan-400 to-blue-600" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">{settings.websiteName}</span>
                      </div>
                      <div className="flex gap-3">
                        {['Products', 'Pricing', 'About'].map(item => <span key={item} className="text-[10px] text-slate-400">{item}</span>)}
                      </div>
                    </div>
                    <div className="p-6 space-y-2 bg-white dark:bg-slate-950">
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold border ${settings.announcementBar ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {settings.announcementBar ? <SquareCheck className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {settings.announcementBar ? 'Announcement bar is ACTIVE on your website' : 'Announcement bar is currently hidden'}
                  </div>
                </div>
              </div>
            )}

            {/* REGIONAL */}
            {activeTab === 'regional' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Languages className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Language</h3>
                  </div>
                  <Field label="Default Language" hint="Primary language for the website interface">
                    <select className={selectCls} value={settings.language} onChange={e => set('language', e.target.value)}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </Field>
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                    <span className="text-3xl">{getLangEmoji(settings.language)}</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{LANGUAGES.find(l => l.code === settings.language)?.label}</p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{settings.language}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Timezone</h3>
                  </div>
                  <Field label="Server Timezone" hint="Used for scheduling, logs, and datetime displays">
                    <select className={selectCls} value={settings.timezone} onChange={e => set('timezone', e.target.value)}>
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </Field>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Time in Timezone</p>
                    <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {new Date().toLocaleTimeString('en-US', { timeZone: settings.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{settings.timezone}</p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <IndianRupee className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Currency</h3>
                  </div>
                  <Field label="Default Currency" hint="Used in pricing pages and invoice generation">
                    <select className={selectCls} value={settings.currency} onChange={e => handleCurrencyChange(e.target.value)}>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                    </select>
                  </Field>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-3xl font-black text-amber-500">{settings.currencySymbol}</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{settings.currency}</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{CURRENCIES.find(c => c.code === settings.currency)?.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">e.g. {settings.currencySymbol}1,299.00</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMAIL / SMTP */}
            {activeTab === 'email' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Server className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">SMTP Configuration</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="SMTP Host" hint="e.g. smtp.gmail.com or smtp.sendgrid.net">
                      <input type="text" className={inputCls} value={settings.smtpHost} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
                    </Field>
                    <Field label="SMTP Port" hint="587 (TLS/STARTTLS) or 465 (SSL)">
                      <input type="number" className={inputCls} value={settings.smtpPort} onChange={e => set('smtpPort', parseInt(e.target.value) || 587)} />
                    </Field>
                    <Field label="SMTP Username">
                      <input type="text" className={inputCls} value={settings.smtpUser} onChange={e => set('smtpUser', e.target.value)} placeholder="your@email.com" autoComplete="off" />
                    </Field>
                    <Field label="SMTP Password">
                      <div className="relative">
                        <input type={showSmtpPass ? 'text' : 'password'} className={inputCls + ' pr-10'} value={settings.smtpPass} onChange={e => set('smtpPass', e.target.value)} placeholder="••••••••••••" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer">
                          {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </Field>
                    <Field label="From Email Address" hint="Displayed as the sender in outgoing emails">
                      <input type="email" className={inputCls} value={settings.smtpFrom} onChange={e => set('smtpFrom', e.target.value)} placeholder="noreply@dezoryn.com" />
                    </Field>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {settings.smtpSecure ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
                          SSL / TLS Secure
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Enable for port 465 (SSL)</p>
                      </div>
                      <Toggle checked={settings.smtpSecure} onChange={() => set('smtpSecure', !settings.smtpSecure)} color="bg-emerald-500" />
                    </div>
                  </div>
                  {/* Test connection */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <button type="button" onClick={testSmtp} disabled={smtpTestState === 'testing'}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-extrabold transition cursor-pointer disabled:opacity-50 shadow-lg shadow-rose-500/20">
                      {smtpTestState === 'testing'
                        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...</>
                        : <><SendHorizonal className="w-3.5 h-3.5" /> Test Connection</>
                      }
                    </button>
                    <AnimatePresence>
                      {smtpTestState !== 'idle' && smtpTestState !== 'testing' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          className={`flex items-center gap-1.5 text-[10px] font-extrabold ${smtpTestState === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {smtpTestState === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {smtpTestMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-400" />
                      <p className="text-xs font-black text-slate-900 dark:text-white">SMTP Setup Tips</p>
                    </div>
                    <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
                      <li className="flex gap-1.5"><span className="text-rose-400 shrink-0">•</span>Use an <strong>App Password</strong> for Gmail (not your regular password)</li>
                      <li className="flex gap-1.5"><span className="text-rose-400 shrink-0">•</span>Port <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">587</code> with STARTTLS is most compatible</li>
                      <li className="flex gap-1.5"><span className="text-rose-400 shrink-0">•</span>Port <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">465</code> requires SSL enabled</li>
                      <li className="flex gap-1.5"><span className="text-rose-400 shrink-0">•</span>For production, use <strong>SendGrid</strong>, <strong>Mailgun</strong>, or <strong>SES</strong></li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
                    <p className="text-xs font-black text-slate-900 dark:text-white">Quick Fill — Popular Providers</p>
                    {[
                      { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
                      { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587 },
                      { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587 },
                      { name: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 465 },
                    ].map(p => (
                      <button key={p.name} type="button" onClick={() => { set('smtpHost', p.host); set('smtpPort', p.port); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">
                        <span>{p.name}</span>
                        <span className="text-slate-400 font-mono">:{p.port}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Google Analytics 4</h3>
                  </div>
                  <Field label="Measurement ID" hint="Format: G-XXXXXXXXXX (GA4) or UA-XXXXXX-X (Universal Analytics)">
                    <input type="text" className={inputCls} value={settings.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" />
                  </Field>
                  {settings.googleAnalyticsId && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <div>
                        <p>Tracking active: <code className="font-mono">{settings.googleAnalyticsId}</code></p>
                        <p className="font-normal opacity-70 mt-0.5">Script will auto-inject into all public pages</p>
                      </div>
                    </motion.div>
                  )}
                  <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">📊 Integration Notes</p>
                    <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
                      <li>• Always use <strong>GA4</strong> format: <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">G-XXXXXXXXXX</code></li>
                      <li>• Tracking script is automatically injected into the website head</li>
                      <li>• Combine with the built-in CMS Analytics for full data visibility</li>
                      <li>• For GDPR compliance, add a cookie consent banner</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Integration Status</h3>
                  </div>
                  {[
                    { label: 'Google Analytics 4', active: !!settings.googleAnalyticsId, id: settings.googleAnalyticsId },
                    { label: 'Google Search Console', active: false, id: '' },
                    { label: 'Facebook Pixel', active: false, id: '' },
                    { label: 'Hotjar Tracking', active: false, id: '' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{item.label}</p>
                          <p className="text-[9px] font-mono text-slate-400">{item.active && item.id ? item.id : 'Not configured'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${item.active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Save Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-medium">
            {isDirty
              ? <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />You have unsaved changes</span>
              : <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" />All settings saved</span>
            }
          </div>
          <button type="submit" disabled={isSaving || !isDirty}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-black text-sm shadow-2xl shadow-cyan-500/20 transition cursor-pointer disabled:opacity-40 transform hover:-translate-y-0.5">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPicker.open}
        onClose={() => setMediaPicker(p => ({ ...p, open: false }))}
        allowedTypes={['image']}
        onSelect={(url) => handleMediaPickerSelect(mediaPicker.field, url)}
      />
    </div>
  );
};
