import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, MessageSquare, Globe,
  Save, RefreshCw, CheckCircle2, Share2,
  ShieldCheck, Headphones, Plus, Trash2,
  Building, ChevronUp, ChevronDown, Copy, MapPin, Eye
} from 'lucide-react';

import { API_URL, apiFetch, invalidateApiCache } from '../../config/api.config';

const API_CONTACT = `${API_URL}/contact`;

export interface DirectChannelItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionUrl: string;
  icon: string;
  enabled: boolean;
}

export interface SecurityGuaranteeItem {
  id: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface OfficeLocationItem {
  id: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  hours: string;
  isHQ: boolean;
}

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
  heroBadge: string;
  heroTitle: string;
  heroGradientTitle: string;
  heroDescription: string;
  formTitle: string;
  responseSlaBadge: string;
  directChannelsTitle: string;
  directChannels: DirectChannelItem[];
  securityGuaranteesTitle: string;
  securityGuarantees: SecurityGuaranteeItem[];
  officeLocationsBadge: string;
  officeLocationsTitle: string;
  officeLocations: OfficeLocationItem[];
}

const DEFAULT_DIRECT_CHANNELS: DirectChannelItem[] = [
  {
    id: 'channel-1',
    type: 'phone',
    title: 'Direct Executive Line',
    subtitle: '+1 (415) 890-2100',
    actionText: 'Call Now →',
    actionUrl: 'tel:+14158902100',
    icon: 'Phone',
    enabled: true,
  },
  {
    id: 'channel-2',
    type: 'whatsapp',
    title: 'WhatsApp Enterprise Chat',
    subtitle: 'Instant response 24/7',
    actionText: 'Open Chat →',
    actionUrl: '+917777804850',
    icon: 'MessageSquare',
    enabled: true,
  },
  {
    id: 'channel-3',
    type: 'chat',
    title: 'In-Browser Live Advisor',
    subtitle: 'Available Mon-Fri',
    actionText: 'Start →',
    actionUrl: '#live-advisor',
    icon: 'Headphones',
    enabled: true,
  },
];

const DEFAULT_SECURITY_GUARANTEES: SecurityGuaranteeItem[] = [
  {
    id: 'sec-1',
    title: 'SOC2 Type II',
    subtitle: 'Audited Security Controls',
    color: 'blue',
  },
  {
    id: 'sec-2',
    title: 'GDPR & ISO27001',
    subtitle: 'Global Data Compliance',
    color: 'emerald',
  },
  {
    id: 'sec-3',
    title: '99.99% Uptime',
    subtitle: 'Financially Backed SLA',
    color: 'violet',
  },
  {
    id: 'sec-4',
    title: 'Dedicated TAM',
    subtitle: 'Technical Account Manager',
    color: 'amber',
  },
];

const DEFAULT_OFFICE_LOCATIONS: OfficeLocationItem[] = [
  {
    id: 'loc-1',
    city: 'Indore (Global HQ)',
    country: 'India',
    address: 'Indore, Madhya Pradesh, India',
    phone: '+91 77778 04850',
    hours: 'Mon - Fri: 9:00 AM - 6:00 PM IST',
    isHQ: true,
  },
  {
    id: 'loc-2',
    city: 'San Francisco',
    country: 'United States',
    address: '500 Howard Street, Suite 400, CA 94105',
    phone: '+1 (415) 890-2100',
    hours: '8:00 AM - 6:00 PM PST',
    isHQ: false,
  },
  {
    id: 'loc-3',
    city: 'London',
    country: 'United Kingdom',
    address: '30 St Mary Axe, City of London, EC3A 8EP',
    phone: '+44 20 7946 0912',
    hours: '8:30 AM - 5:30 PM GMT',
    isHQ: false,
  },
  {
    id: 'loc-4',
    city: 'Singapore',
    country: 'Singapore',
    address: '1 Raffles Place, #28-01, 048616',
    phone: '+65 6789 0123',
    hours: '9:00 AM - 6:00 PM SGT',
    isHQ: false,
  },
];

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
  heroBadge: 'ENTERPRISE & GLOBAL ADVISORY',
  heroTitle: 'Talk with Our',
  heroGradientTitle: 'Enterprise Team',
  heroDescription: 'Whether you need custom SLA guarantees, multi-region deployment, or dedicated volume licensing, our global sales engineers respond within 15 minutes.',
  formTitle: 'Enterprise Inquiry Form',
  responseSlaBadge: '15 Min SLA',
  directChannelsTitle: 'Direct Communication Channels',
  directChannels: DEFAULT_DIRECT_CHANNELS,
  securityGuaranteesTitle: 'Enterprise Security & Guarantees',
  securityGuarantees: DEFAULT_SECURITY_GUARANTEES,
  officeLocationsBadge: 'OUR GLOBAL FOOTPRINT',
  officeLocationsTitle: 'Worldwide Office Locations',
  officeLocations: DEFAULT_OFFICE_LOCATIONS,
};

interface AdminContactManagerProps {
  initialTab?: 'channels' | 'security' | 'hero' | 'offices' | 'reach';
}

export const AdminContactManager: React.FC<AdminContactManagerProps> = ({ initialTab = 'channels' }) => {
  const [form, setForm] = useState<ContactData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'security' | 'hero' | 'offices' | 'reach'>(initialTab);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchContact = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_CONTACT);
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setForm({
          phone: d.phone || '',
          email: d.email || '',
          address: d.address || '',
          googleMap: d.googleMap || '',
          socialLinks: typeof d.socialLinks === 'object' && d.socialLinks ? d.socialLinks : DEFAULT_FORM.socialLinks,
          whatsApp: d.whatsApp || '',
          businessHours: d.businessHours || '',
          heroBadge: d.heroBadge || DEFAULT_FORM.heroBadge,
          heroTitle: d.heroTitle || DEFAULT_FORM.heroTitle,
          heroGradientTitle: d.heroGradientTitle || DEFAULT_FORM.heroGradientTitle,
          heroDescription: d.heroDescription || DEFAULT_FORM.heroDescription,
          formTitle: d.formTitle || DEFAULT_FORM.formTitle,
          responseSlaBadge: d.responseSlaBadge || DEFAULT_FORM.responseSlaBadge,
          directChannelsTitle: d.directChannelsTitle || DEFAULT_FORM.directChannelsTitle,
          directChannels: Array.isArray(d.directChannels) && d.directChannels.length > 0 ? d.directChannels : DEFAULT_DIRECT_CHANNELS,
          securityGuaranteesTitle: d.securityGuaranteesTitle || DEFAULT_FORM.securityGuaranteesTitle,
          securityGuarantees: Array.isArray(d.securityGuarantees) && d.securityGuarantees.length > 0 ? d.securityGuarantees : DEFAULT_SECURITY_GUARANTEES,
          officeLocationsBadge: d.officeLocationsBadge || DEFAULT_FORM.officeLocationsBadge,
          officeLocationsTitle: d.officeLocationsTitle || DEFAULT_FORM.officeLocationsTitle,
          officeLocations: Array.isArray(d.officeLocations) && d.officeLocations.length > 0 ? d.officeLocations : DEFAULT_OFFICE_LOCATIONS,
        });
      }
    } catch {
      showMsg('error', 'Failed to fetch contact settings from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch(API_CONTACT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.data) {
        invalidateApiCache('/contact');
        invalidateApiCache();
        
        // Update form with the returned persisted database record
        const saved = data.data;
        setForm(prev => ({
          ...prev,
          ...saved,
          socialLinks: saved.socialLinks || prev.socialLinks,
          directChannels: saved.directChannels || prev.directChannels,
          securityGuarantees: saved.securityGuarantees || prev.securityGuarantees,
          officeLocations: saved.officeLocations || prev.officeLocations,
        }));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dezo-contact-updated', { detail: saved }));
        }

        showMsg('success', 'Contact settings saved and permanently synced to PostgreSQL database!');
      } else {
        showMsg('error', data.message || 'Failed to save changes to database');
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

  const updateChannel = (index: number, field: keyof DirectChannelItem, value: any) => {
    setForm(prev => {
      const updated = [...prev.directChannels];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, directChannels: updated };
    });
  };

  const addChannel = () => {
    setForm(prev => ({
      ...prev,
      directChannels: [
        ...prev.directChannels,
        {
          id: `channel-${Date.now()}`,
          type: 'custom',
          title: 'New Communication Channel',
          subtitle: 'Channel subtitle / description',
          actionText: 'Connect →',
          actionUrl: '#',
          icon: 'MessageSquare',
          enabled: true,
        },
      ],
    }));
  };

  const removeChannel = (index: number) => {
    setForm(prev => ({
      ...prev,
      directChannels: prev.directChannels.filter((_, i) => i !== index),
    }));
  };

  const updateGuarantee = (index: number, field: keyof SecurityGuaranteeItem, value: string) => {
    setForm(prev => {
      const updated = [...prev.securityGuarantees];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, securityGuarantees: updated };
    });
  };

  const addGuarantee = () => {
    setForm(prev => ({
      ...prev,
      securityGuarantees: [
        ...prev.securityGuarantees,
        {
          id: `sec-${Date.now()}`,
          title: 'New Guarantee / Compliance',
          subtitle: 'Certified Standards',
          color: 'blue',
        },
      ],
    }));
  };

  const removeGuarantee = (index: number) => {
    setForm(prev => ({
      ...prev,
      securityGuarantees: prev.securityGuarantees.filter((_, i) => i !== index),
    }));
  };

  const updateOffice = (index: number, field: keyof OfficeLocationItem, value: any) => {
    setForm(prev => {
      const updated = [...prev.officeLocations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, officeLocations: updated };
    });
  };

  const moveOfficeUp = (index: number) => {
    if (index === 0) return;
    setForm(prev => {
      const updated = [...prev.officeLocations];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return { ...prev, officeLocations: updated };
    });
  };

  const moveOfficeDown = (index: number) => {
    if (index >= form.officeLocations.length - 1) return;
    setForm(prev => {
      const updated = [...prev.officeLocations];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return { ...prev, officeLocations: updated };
    });
  };

  const duplicateOffice = (index: number) => {
    const target = form.officeLocations[index];
    if (!target) return;
    setForm(prev => {
      const updated = [...prev.officeLocations];
      updated.splice(index + 1, 0, {
        ...target,
        id: `loc-${Date.now()}`,
        city: `${target.city} (Copy)`,
        isHQ: false,
      });
      return { ...prev, officeLocations: updated };
    });
  };

  const addOffice = () => {
    setForm(prev => ({
      ...prev,
      officeLocations: [
        ...prev.officeLocations,
        {
          id: `loc-${Date.now()}`,
          city: 'New Global Office',
          country: 'Country',
          address: 'Office address line, Postal Code',
          phone: '+1 (000) 000-0000',
          hours: 'Mon - Fri: 9:00 AM - 6:00 PM',
          isHQ: false,
        },
      ],
    }));
  };

  const removeOffice = (index: number) => {
    setForm(prev => ({
      ...prev,
      officeLocations: prev.officeLocations.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-500/30 dark:border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Phone className="w-4 h-4" />
            <span>Direct Channels & Global Reach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Contact & Support CMS Manager
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-400 mt-1 max-w-2xl font-medium leading-relaxed">
            Manage all Direct Communication Channels, Enterprise Security Guarantees, Hero headers, SLA badges, Worldwide Offices, and Primary Reach channels.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={fetchContact}
            className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition cursor-pointer shadow-lg"
            title="Reload from PostgreSQL"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving to Database...' : 'Save & Publish to Database'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'channels'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Communication Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Guarantees</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Hero & Inquiry Form Header</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offices')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'offices'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Worldwide Office Locations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reach')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'reach'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Primary Reach & Socials</span>
        </button>
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
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => handleSave(e)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editable Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* TAB 1: DIRECT COMMUNICATION CHANNELS */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-500" />
                      <span>Direct Channels Section Header</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Section title displayed above the channel contact cards
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={form.directChannelsTitle}
                    onChange={e => setForm({ ...form, directChannelsTitle: e.target.value })}
                    placeholder="Direct Communication Channels"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Channels List */}
              <div className="space-y-4">
                {form.directChannels.map((channel, idx) => (
                  <div
                    key={channel.id || idx}
                    className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {channel.title || `Channel #${idx + 1}`}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={channel.enabled !== false}
                            onChange={e => updateChannel(idx, 'enabled', e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Enabled</span>
                        </label>
                        {form.directChannels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChannel(idx)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition cursor-pointer"
                            title="Remove channel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Channel Title / Name</label>
                        <input
                          type="text"
                          value={channel.title}
                          onChange={e => updateChannel(idx, 'title', e.target.value)}
                          placeholder="e.g. Direct Executive Line"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Subtitle / Phone / Description
                        </label>
                        <input
                          type="text"
                          value={channel.subtitle}
                          onChange={e => updateChannel(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. +1 (415) 890-2100 or Instant response 24/7"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Action Button Text</label>
                        <input
                          type="text"
                          value={channel.actionText}
                          onChange={e => updateChannel(idx, 'actionText', e.target.value)}
                          placeholder="e.g. Call Now → or Open Chat →"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Action Target / URL / Tel
                        </label>
                        <input
                          type="text"
                          value={channel.actionUrl}
                          onChange={e => updateChannel(idx, 'actionUrl', e.target.value)}
                          placeholder="tel:+14158902100 or https://wa.me/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Icon Type</label>
                        <select
                          value={channel.icon}
                          onChange={e => updateChannel(idx, 'icon', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="Phone">Phone</option>
                          <option value="MessageSquare">MessageSquare (WhatsApp/Chat)</option>
                          <option value="Headphones">Headphones (Live Advisor)</option>
                          <option value="Mail">Mail</option>
                          <option value="Globe">Globe</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addChannel}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-cyan-400 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Communication Channel</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ENTERPRISE SECURITY & GUARANTEES */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Security & Guarantees Section Header</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Section title displayed above the compliance & trust badges
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={form.securityGuaranteesTitle}
                    onChange={e => setForm({ ...form, securityGuaranteesTitle: e.target.value })}
                    placeholder="Enterprise Security & Guarantees"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Guarantees List */}
              <div className="space-y-4">
                {form.securityGuarantees.map((guarantee, idx) => (
                  <div
                    key={guarantee.id || idx}
                    className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {guarantee.title || `Guarantee #${idx + 1}`}
                        </h3>
                      </div>

                      {form.securityGuarantees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuarantee(idx)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition cursor-pointer"
                          title="Remove guarantee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Badge Title</label>
                        <input
                          type="text"
                          value={guarantee.title}
                          onChange={e => updateGuarantee(idx, 'title', e.target.value)}
                          placeholder="e.g. SOC2 Type II"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Description / Subtitle</label>
                        <input
                          type="text"
                          value={guarantee.subtitle}
                          onChange={e => updateGuarantee(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. Audited Security Controls"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Color Theme</label>
                        <select
                          value={guarantee.color}
                          onChange={e => updateGuarantee(idx, 'color', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="blue">Blue / Cyan</option>
                          <option value="emerald">Emerald / Green</option>
                          <option value="violet">Violet / Purple</option>
                          <option value="amber">Amber / Orange</option>
                          <option value="rose">Rose / Red</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGuarantee}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Security Guarantee Badge</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HERO & INQUIRY HEADER */}
          {activeTab === 'hero' && (
            <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span>Hero Banner & Inquiry Form Titles</span>
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Hero Pill Badge</label>
                  <input
                    type="text"
                    value={form.heroBadge}
                    onChange={e => setForm({ ...form, heroBadge: e.target.value })}
                    placeholder="ENTERPRISE & GLOBAL ADVISORY"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Main Heading (Prefix)</label>
                    <input
                      type="text"
                      value={form.heroTitle}
                      onChange={e => setForm({ ...form, heroTitle: e.target.value })}
                      placeholder="Talk with Our"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Gradient Heading (Suffix)</label>
                    <input
                      type="text"
                      value={form.heroGradientTitle}
                      onChange={e => setForm({ ...form, heroGradientTitle: e.target.value })}
                      placeholder="Enterprise Team"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Hero Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={form.heroDescription}
                    onChange={e => setForm({ ...form, heroDescription: e.target.value })}
                    placeholder="Whether you need custom SLA guarantees..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Inquiry Form Title</label>
                    <input
                      type="text"
                      value={form.formTitle}
                      onChange={e => setForm({ ...form, formTitle: e.target.value })}
                      placeholder="Enterprise Inquiry Form"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Response SLA Badge Text</label>
                    <input
                      type="text"
                      value={form.responseSlaBadge}
                      onChange={e => setForm({ ...form, responseSlaBadge: e.target.value })}
                      placeholder="15 Min SLA"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORLDWIDE OFFICE LOCATIONS */}
          {activeTab === 'offices' && (
            <div className="space-y-6">
              {/* Header Configuration */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-400" />
                    <span>Global Footprint Section Header</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes to Database'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Footprint Subheading / Badge</label>
                    <input
                      type="text"
                      value={form.officeLocationsBadge}
                      onChange={e => setForm({ ...form, officeLocationsBadge: e.target.value })}
                      placeholder="OUR GLOBAL FOOTPRINT"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Footprint Main Title</label>
                    <input
                      type="text"
                      value={form.officeLocationsTitle}
                      onChange={e => setForm({ ...form, officeLocationsTitle: e.target.value })}
                      placeholder="Worldwide Office Locations"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Live Frontend Preview on /contact-sales
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                    {form.officeLocations.length} Locations Configured
                  </span>
                </div>

                <div className="text-center py-4">
                  <span className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">
                    {form.officeLocationsBadge || 'OUR GLOBAL FOOTPRINT'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                    {form.officeLocationsTitle || 'Worldwide Office Locations'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {form.officeLocations.map((office, idx) => (
                    <div
                      key={office.id || idx}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition shadow-sm"
                    >
                      {office.isHQ && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[8px] font-extrabold text-cyan-300 uppercase">
                          GLOBAL HQ
                        </span>
                      )}
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 mb-3">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold text-white truncate">{office.city || 'Untitled City'}</h4>
                      <p className="text-[11px] font-semibold text-cyan-400 mb-2 truncate">{office.country || 'Country'}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mb-3 min-h-[32px]">{office.address || 'Address line'}</p>
                      <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-2">
                        <div className="truncate"><span className="text-slate-500">Phone:</span> {office.phone || 'N/A'}</div>
                        <div className="truncate"><span className="text-slate-500">Hours:</span> {office.hours || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offices Editor List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Configured Locations ({form.officeLocations.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addOffice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/60 text-purple-600 dark:text-purple-300 font-bold text-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Office</span>
                  </button>
                </div>

                {form.officeLocations.map((office, idx) => (
                  <div
                    key={office.id || idx}
                    className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {office.city || `Office #${idx + 1}`}
                        </h3>
                        {office.isHQ && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 border border-cyan-400/30">
                            Global HQ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveOfficeUp(idx)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 transition cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.officeLocations.length - 1}
                          onClick={() => moveOfficeDown(idx)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 transition cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateOffice(idx)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                          title="Duplicate Office"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer ml-2">
                          <input
                            type="checkbox"
                            checked={office.isHQ}
                            onChange={e => updateOffice(idx, 'isHQ', e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Global HQ</span>
                        </label>

                        {form.officeLocations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOffice(idx)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition cursor-pointer ml-1"
                            title="Remove office"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">City / Hub Name</label>
                        <input
                          type="text"
                          value={office.city}
                          onChange={e => updateOffice(idx, 'city', e.target.value)}
                          placeholder="e.g. Indore (Global HQ) or San Francisco"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Country</label>
                        <input
                          type="text"
                          value={office.country}
                          onChange={e => updateOffice(idx, 'country', e.target.value)}
                          placeholder="e.g. India or United States"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Physical Address</label>
                      <input
                        type="text"
                        value={office.address}
                        onChange={e => updateOffice(idx, 'address', e.target.value)}
                        placeholder="e.g. Indore, Madhya Pradesh, India or 500 Howard Street, Suite 400, CA 94105"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Direct Phone Number</label>
                        <input
                          type="text"
                          value={office.phone}
                          onChange={e => updateOffice(idx, 'phone', e.target.value)}
                          placeholder="+91 77778 04850 or +1 (415) 890-2100"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Operating Hours & Timezone</label>
                        <input
                          type="text"
                          value={office.hours}
                          onChange={e => updateOffice(idx, 'hours', e.target.value)}
                          placeholder="Mon - Fri: 9:00 AM - 6:00 PM IST"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOffice}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-purple-600 dark:text-purple-400 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Worldwide Office Location</span>
                </button>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs shadow-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Office Locations to PostgreSQL Database'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIMARY REACH & SOCIALS */}
          {activeTab === 'reach' && (
            <div className="space-y-6">
              {/* Main Reach */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>General Support & Headquarters</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Support Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 77778 04850"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Primary Support Email</label>
                    <input
                      type="email"
                      placeholder="support@dezoryn.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">WhatsApp Number / Link</label>
                    <input
                      type="text"
                      placeholder="+917777804850"
                      value={form.whatsApp}
                      onChange={e => setForm({ ...form, whatsApp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Business Working Hours</label>
                    <input
                      type="text"
                      placeholder="Mon - Fri: 9:00 AM - 6:00 PM IST"
                      value={form.businessHours}
                      onChange={e => setForm({ ...form, businessHours: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Official Corporate Address</label>
                  <textarea
                    rows={2}
                    placeholder="Headquarters Address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Google Map Embed Link / URL</label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/?q=..."
                    value={form.googleMap}
                    onChange={e => setForm({ ...form, googleMap: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Social Profiles */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Social Media Profiles</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/company/..."
                      value={form.socialLinks?.linkedin || ''}
                      onChange={e => updateSocial('linkedin', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Twitter / X URL</label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/..."
                      value={form.socialLinks?.twitter || ''}
                      onChange={e => updateSocial('twitter', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">GitHub URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={form.socialLinks?.github || ''}
                      onChange={e => updateSocial('github', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Facebook URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={form.socialLinks?.facebook || ''}
                      onChange={e => updateSocial('facebook', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Instagram URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={form.socialLinks?.instagram || ''}
                      onChange={e => updateSocial('instagram', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">YouTube Channel URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/..."
                      value={form.socialLinks?.youtube || ''}
                      onChange={e => updateSocial('youtube', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-time Live Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 sticky top-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Real-Time Public Page Preview</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Live Synced
              </span>
            </div>

            {/* Hero Live Preview Snippet */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-400/30 text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400">
                <Headphones className="w-3 h-3" />
                <span>{form.heroBadge || 'ENTERPRISE & GLOBAL ADVISORY'}</span>
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {form.heroTitle}{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-cyan-400 dark:via-blue-500 dark:to-violet-400 bg-clip-text text-transparent">
                  {form.heroGradientTitle}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {form.heroDescription}
              </p>
            </div>

            {/* Direct Communication Channels Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>{form.directChannelsTitle || 'Direct Communication Channels'}</span>
              </h4>

              <div className="space-y-2">
                {form.directChannels.filter(c => c.enabled !== false).map((channel, i) => (
                  <div
                    key={channel.id || i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-xs">
                        {channel.icon === 'Phone' ? <Phone className="w-3.5 h-3.5" /> : channel.icon === 'MessageSquare' ? <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> : <Headphones className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white">{channel.title}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">{channel.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-cyan-400">{channel.actionText}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Guarantees Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{form.securityGuaranteesTitle || 'Enterprise Security & Guarantees'}</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {form.securityGuarantees.map((guarantee, idx) => (
                  <div
                    key={guarantee.id || idx}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="font-extrabold text-blue-600 dark:text-cyan-400 truncate">{guarantee.title}</div>
                    <div className="text-[8px] text-slate-500 dark:text-slate-400 truncate">{guarantee.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Details Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-900 dark:text-white">{form.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{form.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Offices:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{form.officeLocations.length} Worldwide Locations</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Sync to Database'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
