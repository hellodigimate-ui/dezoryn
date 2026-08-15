import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, MapPin, Map, MessageSquare, Clock, Globe,
  Save, RefreshCw, CheckCircle2, Sparkles, Share2,
  ExternalLink
} from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';

const API_CONTACT = `${API_URL}/contact`;

export interface ContactData {
  phone: string;
  email: string;
  address: string;
  googleMap: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  whatsApp: string;
  businessHours: string;
}

const DEFAULT_FORM: ContactData = {
  phone: '+91 77778 04850',
  email: 'support@dezoryn.com',
  address: 'Indore, Madhya Pradesh, India',
  googleMap: 'https://maps.google.com/?q=Indore,Madhya+Pradesh,India',
  socialLinks: {
    twitter: 'https://twitter.com/dezoryn',
    linkedin: 'https://linkedin.com/company/dezoryn',
    github: 'https://github.com/dezoryn',
    facebook: 'https://facebook.com/dezoryn',
    instagram: 'https://instagram.com/dezoryn',
    youtube: 'https://youtube.com/dezoryn',
  },
  whatsApp: '+917777804850',
  businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM IST | Sat - Sun: Closed',
};

export const AdminContactManager: React.FC = () => {
  const [form, setForm] = useState<ContactData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchContact = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_CONTACT);
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          phone: data.data.phone || '',
          email: data.data.email || '',
          address: data.data.address || '',
          googleMap: data.data.googleMap || '',
          socialLinks: typeof data.data.socialLinks === 'object' && data.data.socialLinks ? data.data.socialLinks : DEFAULT_FORM.socialLinks,
          whatsApp: data.data.whatsApp || '',
          businessHours: data.data.businessHours || '',
        });
      }
    } catch {
      showMsg('error', 'Failed to fetch contact settings from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch(API_CONTACT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Contact information updated successfully! Landing page updated.');
      } else {
        showMsg('error', data.message || 'Failed to save changes');
      }
    } catch {
      showMsg('error', 'Network error occurred while saving contact settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSocial = (key: keyof ContactData['socialLinks'], value: string) => {
    setForm(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Global Contact & Outreach Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Contact Information Management
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
            Manage public phone numbers, emails, physical address, Google Maps embed, WhatsApp chat link, social links, and business hours.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={fetchContact}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Refresh settings"
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
            <span>{isSaving ? 'Saving...' : 'Save Contact Info'}</span>
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
        {/* Left Column: Editable Form Controls (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Direct Channels Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Primary Reach & Direct Channels</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Support Phone Number</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 77778 04850"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Primary Support Email</span>
                </label>
                <input
                  type="email"
                  placeholder="support@dezoryn.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Direct Number / Link</span>
                </label>
                <input
                  type="text"
                  placeholder="+917777804850 or https://wa.me/..."
                  value={form.whatsApp}
                  onChange={e => setForm({ ...form, whatsApp: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              {/* Business Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Business Working Hours</span>
                </label>
                <input
                  type="text"
                  placeholder="Mon - Fri: 9:00 AM - 6:00 PM IST"
                  value={form.businessHours}
                  onChange={e => setForm({ ...form, businessHours: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Physical Address & Map Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>Headquarters Address & Google Maps</span>
            </h2>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Official Corporate Address
              </label>
              <textarea
                rows={2}
                placeholder="Indore, Madhya Pradesh, India"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none transition resize-none"
              />
            </div>

            {/* Google Map URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Map Embed Link / URL</span>
              </label>
              <input
                type="text"
                placeholder="https://maps.google.com/?q=..."
                value={form.googleMap}
                onChange={e => setForm({ ...form, googleMap: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-900 dark:text-white outline-none transition"
              />
            </div>
          </div>

          {/* Social Links Box */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Social Media Channels & Profiles</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LinkedIn */}
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

              {/* Twitter / X */}
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

              {/* GitHub */}
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

              {/* Facebook */}
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

              {/* Instagram */}
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

              {/* YouTube */}
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
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Live Preview Card (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5 sticky top-8">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Live Landing Page Card</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live Preview
              </span>
            </h2>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              {/* Phone Card */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Phone Support</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{form.phone || 'Not set'}</div>
                </div>
              </div>

              {/* Email Card */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Primary Email</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{form.email || 'Not set'}</div>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">WhatsApp</div>
                  <div className="text-xs font-bold text-emerald-400">{form.whatsApp || 'Not set'}</div>
                </div>
              </div>

              {/* Address Card */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Headquarters</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{form.address || 'Not set'}</div>
                </div>
              </div>

              {/* Hours Card */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Business Hours</div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{form.businessHours || 'Not set'}</div>
                </div>
              </div>

              {/* Map Button */}
              {form.googleMap && (
                <a
                  href={form.googleMap}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400 hover:text-cyan-300 font-extrabold text-xs transition cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Open Google Map Location</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 dark:text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Publish to Website'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
