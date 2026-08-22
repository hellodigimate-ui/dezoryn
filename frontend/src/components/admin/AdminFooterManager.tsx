import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, RefreshCw, CheckCircle2, Sparkles, Share2,
  Plus, Trash2, Globe, LayoutGrid, ShieldCheck,
  Headphones, ChevronRight
} from 'lucide-react';



import { API_URL, apiFetch } from '../../config/api.config';

const API_FOOTER = `${API_URL}/footer`;


export interface FooterLinkItem {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

export interface FooterData {
  companyDescription: string;
  footerLogo: string;
  footerLinks: FooterColumn[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  copyrightText: string;
  legalLinks: FooterLinkItem[];
  supportLinks: FooterLinkItem[];
}

const DEFAULT_FOOTER: FooterData = {
  companyDescription: 'Dezoryn Technologies Pvt. Ltd. is a global IT solutions provider committed to delivering innovative, reliable and future-ready software products.',
  footerLogo: 'Dezoryn Technologies',
  footerLinks: [
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Our Leadership', url: '/leadership' },
        { label: 'Careers & Hiring', url: '/careers' },
        { label: 'Contact Us', url: '/contact-sales' },
      ],
    },
    {
      title: 'SOLUTIONS',
      links: [
        { label: 'Technology Services', url: '/services' },
        { label: 'DezoAI Platform', url: '/products' },
        { label: 'CRM & ERP Suite', url: '/products' },
        { label: 'Pricing Plans', url: '/pricing' },
        { label: 'Book Live Demo', url: '/book-demo' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: '24/7 Support Desk', url: '/support' },
        { label: 'Submit Support Ticket', url: '/support' },
        { label: 'Product FAQs', url: '/faq' },
        { label: 'API & Documentation', url: '/api-docs' },
        { label: 'System Status', url: '/status' },
      ],
    },
  ],
  socialLinks: {
    twitter: 'https://twitter.com/dezoryn',
    linkedin: 'https://linkedin.com/company/dezoryn',
    github: 'https://github.com/dezoryn',
    facebook: 'https://facebook.com/dezoryn',
    instagram: 'https://instagram.com/dezoryn',
    youtube: 'https://youtube.com/dezoryn',
  },
  copyrightText: 'Dezoryn Technologies Pvt. Ltd. All Rights Reserved.',
  legalLinks: [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Cookie Policy', url: '/cookies' },
  ],
  supportLinks: [
    { label: '24/7 Enterprise Support Desk', url: '/support' },
    { label: 'Submit Support Ticket', url: '/support' },
    { label: 'System Status Monitor', url: '/status' },
  ],
};

export const AdminFooterManager: React.FC = () => {
  const [form, setForm] = useState<FooterData>(DEFAULT_FOOTER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchFooter = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_FOOTER);
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          companyDescription: data.data.companyDescription || DEFAULT_FOOTER.companyDescription,
          footerLogo: data.data.footerLogo || DEFAULT_FOOTER.footerLogo,
          footerLinks: Array.isArray(data.data.footerLinks) ? data.data.footerLinks : DEFAULT_FOOTER.footerLinks,
          socialLinks: typeof data.data.socialLinks === 'object' && data.data.socialLinks ? data.data.socialLinks : DEFAULT_FOOTER.socialLinks,
          copyrightText: data.data.copyrightText || DEFAULT_FOOTER.copyrightText,
          legalLinks: Array.isArray(data.data.legalLinks) ? data.data.legalLinks : DEFAULT_FOOTER.legalLinks,
          supportLinks: Array.isArray(data.data.supportLinks) ? data.data.supportLinks : DEFAULT_FOOTER.supportLinks,
        });
      }
    } catch {
      showMsg('error', 'Failed to fetch footer settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch(API_FOOTER, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Footer settings updated successfully! Landing page footer updated.');
      } else {
        showMsg('error', data.message || 'Failed to save footer settings');
      }
    } catch {
      showMsg('error', 'Network error occurred while saving footer settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions for dynamic links array editing
  const updateSocial = (key: keyof FooterData['socialLinks'], val: string) => {
    setForm(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: val,
      },
    }));
  };

  const addLegalLink = () => {


    setForm(prev => ({
      ...prev,
      legalLinks: [...prev.legalLinks, { label: 'New Legal Link', url: '/privacy' }]
    }));
  };

  const removeLegalLink = (index: number) => {
    setForm(prev => ({
      ...prev,
      legalLinks: prev.legalLinks.filter((_, i) => i !== index)
    }));
  };

  const updateLegalLink = (index: number, field: 'label' | 'url', val: string) => {
    const updated = [...form.legalLinks];
    updated[index][field] = val;
    setForm(prev => ({ ...prev, legalLinks: updated }));
  };

  const addSupportLink = () => {
    setForm(prev => ({
      ...prev,
      supportLinks: [...prev.supportLinks, { label: 'New Support Link', url: '/support' }]
    }));
  };

  const removeSupportLink = (index: number) => {
    setForm(prev => ({
      ...prev,
      supportLinks: prev.supportLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSupportLink = (index: number, field: 'label' | 'url', val: string) => {
    const updated = [...form.supportLinks];
    updated[index][field] = val;
    setForm(prev => ({ ...prev, supportLinks: updated }));
  };

  // Column links handlers
  const addColumn = () => {
    setForm(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { title: 'NEW SECTION', links: [{ label: 'Sample Link', url: '/' }] }]
    }));
  };

  const removeColumn = (colIdx: number) => {
    setForm(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== colIdx)
    }));
  };

  const updateColumnTitle = (colIdx: number, title: string) => {
    const updated = [...form.footerLinks];
    updated[colIdx].title = title;
    setForm(prev => ({ ...prev, footerLinks: updated }));
  };

  const addColumnLink = (colIdx: number) => {
    const updated = [...form.footerLinks];
    updated[colIdx].links.push({ label: 'New Link', url: '/' });
    setForm(prev => ({ ...prev, footerLinks: updated }));
  };

  const removeColumnLink = (colIdx: number, linkIdx: number) => {
    const updated = [...form.footerLinks];
    updated[colIdx].links = updated[colIdx].links.filter((_, i) => i !== linkIdx);
    setForm(prev => ({ ...prev, footerLinks: updated }));
  };

  const updateColumnLink = (colIdx: number, linkIdx: number, field: 'label' | 'url', val: string) => {
    const updated = [...form.footerLinks];
    updated[colIdx].links[linkIdx][field] = val;
    setForm(prev => ({ ...prev, footerLinks: updated }));
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Footer & Global Navigation CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Footer Management
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Configure company branding, logo text, mission description, column links, social profiles, copyright statement, and legal links.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={fetchFooter}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Refresh footer settings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Footer Settings'}</span>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Form Controls (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Logo & Description Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Brand Identity & Mission Overview</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Footer Brand Logo Text
              </label>
              <input
                type="text"
                placeholder="Dezoryn Technologies"
                value={form.footerLogo}
                onChange={e => setForm({ ...form, footerLogo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Company Overview / Mission Description
              </label>
              <textarea
                rows={3}
                placeholder="Dezoryn Technologies Pvt. Ltd. is a global IT solutions provider..."
                value={form.companyDescription}
                onChange={e => setForm({ ...form, companyDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Social Media Links Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Social Media Channels & Profiles</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">LinkedIn URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/company/..."
                  value={form.socialLinks?.linkedin || ''}
                  onChange={e => updateSocial('linkedin', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Twitter / X URL</label>
                <input
                  type="text"
                  placeholder="https://twitter.com/..."
                  value={form.socialLinks?.twitter || ''}
                  onChange={e => updateSocial('twitter', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">GitHub Repository URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  value={form.socialLinks?.github || ''}
                  onChange={e => updateSocial('github', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">YouTube Channel URL</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/..."
                  value={form.socialLinks?.youtube || ''}
                  onChange={e => updateSocial('youtube', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Instagram Handle URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/..."
                  value={form.socialLinks?.instagram || ''}
                  onChange={e => updateSocial('instagram', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Facebook Page URL</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/..."
                  value={form.socialLinks?.facebook || ''}
                  onChange={e => updateSocial('facebook', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Copyright & Legal Links Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">

            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Copyright & Legal Footer Links</span>
              </span>
              <button
                type="button"
                onClick={addLegalLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-extrabold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Legal Link</span>
              </button>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Copyright Statement Text
              </label>
              <input
                type="text"
                placeholder="Dezoryn Technologies Pvt. Ltd. All Rights Reserved."
                value={form.copyrightText}
                onChange={e => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
              />
            </div>

            {/* Legal Links List */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Managed Legal Links ({form.legalLinks.length})</div>
              {form.legalLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Link Label (e.g. Privacy Policy)"
                    value={link.label}
                    onChange={e => updateLegalLink(idx, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Route URL (e.g. /privacy)"
                    value={link.url}
                    onChange={e => updateLegalLink(idx, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeLegalLink(idx)}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Support Links Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-400" />
                <span>Support & Resource Quick Links</span>
              </span>
              <button
                type="button"
                onClick={addSupportLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-purple-400 hover:text-purple-300 text-xs font-extrabold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Support Link</span>
              </button>
            </h2>

            <div className="space-y-3">
              {form.supportLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Label (e.g. 24/7 SLA Support)"
                    value={link.label}
                    onChange={e => updateSupportLink(idx, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Route URL (e.g. /support)"
                    value={link.url}
                    onChange={e => updateSupportLink(idx, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-purple-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSupportLink(idx)}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Footer Columns Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <span className="text-base font-black text-slate-900 dark:text-white">Custom Navigation Columns ({form.footerLinks.length})</span>
              </div>
              <button
                type="button"
                onClick={addColumn}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Column</span>
              </button>
            </div>

            <div className="space-y-6">
              {form.footerLinks.map((col, colIdx) => (
                <div key={colIdx} className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      value={col.title}
                      onChange={e => updateColumnTitle(colIdx, e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase text-cyan-400 outline-none tracking-wider"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addColumnLink(colIdx)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                      >
                        + Add Sub-Link
                      </button>
                      <button
                        type="button"
                        onClick={() => removeColumn(colIdx)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-links */}
                  <div className="space-y-2 pl-2">
                    {col.links.map((link, linkIdx) => (
                      <div key={linkIdx} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <input
                          type="text"
                          placeholder="Label"
                          value={link.label}
                          onChange={e => updateColumnLink(colIdx, linkIdx, 'label', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={link.url}
                          onChange={e => updateColumnLink(colIdx, linkIdx, 'url', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeColumnLink(colIdx, linkIdx)}
                          className="p-1.5 text-slate-500 dark:text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Card (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5 sticky top-8">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Live Footer Preview</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Preview
              </span>
            </h2>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              {/* Brand logo preview */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-slate-900 dark:text-white font-black text-base flex items-center justify-center shadow-md">
                  D
                </div>
                <div className="text-sm font-extrabold text-white tracking-tight">
                  {form.footerLogo}
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {form.companyDescription}
              </p>

              {/* Columns preview */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                {form.footerLinks.map((col, i) => (
                  <div key={i} className="text-xs">
                    <div className="font-extrabold text-cyan-400 uppercase tracking-wider text-[10px] mb-1">{col.title}</div>
                    <div className="flex flex-wrap gap-2 text-slate-500 dark:text-slate-400 font-medium">
                      {col.links.map((l, j) => (
                        <span key={j} className="hover:text-slate-900 dark:text-white">• {l.label}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Copyright preview */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-500 flex items-center justify-between">
                <span>• {new Date().getFullYear()} {form.copyrightText}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 dark:text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Publish Footer Settings'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
