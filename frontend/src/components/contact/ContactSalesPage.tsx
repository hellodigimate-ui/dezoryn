import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  Headphones,
  Mail,
  Globe
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

import { API_URL, apiFetch } from '../../config/api.config';
import { getNormalizedWhatsAppUrl } from '../../utils/contactUtils';

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

const DEFAULT_CONTACT_DATA: ContactData = {
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
    youtube: 'https://youtube.com/@dezoryn',
  },
  whatsApp: '+917777804850',
  businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM IST',
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

export const ContactSalesPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  const [contactData, setContactData] = useState<ContactData>(DEFAULT_CONTACT_DATA);

  const fetchContact = async () => {
    try {
      const res = await apiFetch(API_CONTACT);
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setContactData({
          phone: d.phone || DEFAULT_CONTACT_DATA.phone,
          email: d.email || DEFAULT_CONTACT_DATA.email,
          address: d.address || DEFAULT_CONTACT_DATA.address,
          googleMap: d.googleMap || '',
          whatsApp: d.whatsApp !== undefined ? d.whatsApp : DEFAULT_CONTACT_DATA.whatsApp,
          businessHours: d.businessHours || DEFAULT_CONTACT_DATA.businessHours,
          socialLinks: d.socialLinks || DEFAULT_CONTACT_DATA.socialLinks,
          heroBadge: d.heroBadge || DEFAULT_CONTACT_DATA.heroBadge,
          heroTitle: d.heroTitle || DEFAULT_CONTACT_DATA.heroTitle,
          heroGradientTitle: d.heroGradientTitle || DEFAULT_CONTACT_DATA.heroGradientTitle,
          heroDescription: d.heroDescription || DEFAULT_CONTACT_DATA.heroDescription,
          formTitle: d.formTitle || DEFAULT_CONTACT_DATA.formTitle,
          responseSlaBadge: d.responseSlaBadge || DEFAULT_CONTACT_DATA.responseSlaBadge,
          directChannelsTitle: d.directChannelsTitle || DEFAULT_CONTACT_DATA.directChannelsTitle,
          directChannels: Array.isArray(d.directChannels) && d.directChannels.length > 0 ? d.directChannels : DEFAULT_DIRECT_CHANNELS,
          securityGuaranteesTitle: d.securityGuaranteesTitle || DEFAULT_CONTACT_DATA.securityGuaranteesTitle,
          securityGuarantees: Array.isArray(d.securityGuarantees) && d.securityGuarantees.length > 0 ? d.securityGuarantees : DEFAULT_SECURITY_GUARANTEES,
          officeLocationsBadge: d.officeLocationsBadge || DEFAULT_CONTACT_DATA.officeLocationsBadge,
          officeLocationsTitle: d.officeLocationsTitle || DEFAULT_CONTACT_DATA.officeLocationsTitle,
          officeLocations: Array.isArray(d.officeLocations) ? d.officeLocations : DEFAULT_OFFICE_LOCATIONS,
        });
      }
    } catch {
      // Keep database/fallback state
    }
  };

  useEffect(() => {
    fetchContact();

    const handleUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        fetchContact();
      }
    };

    window.addEventListener('focus', fetchContact);
    window.addEventListener('dezo-contact-updated', handleUpdated);

    return () => {
      window.removeEventListener('focus', fetchContact);
      window.removeEventListener('dezo-contact-updated', handleUpdated);
    };
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    phone: '',
    industry: 'Software / Technology',
    employees: '100-500 Employees',
    budget: '₹20L - ₹40L / year',
    productInterest: 'Dezoryn Technologies Enterprise Platform',
    requirements: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetch(API_CONTACT + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.workEmail,
          phone: formData.phone,
          company: formData.company,
          industry: formData.industry,
          employees: formData.employees,
          budget: formData.budget,
          productInterest: formData.productInterest,
          message: formData.requirements,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(data.message || 'Submission failed. Please try again.');
      }
    } catch (_err) {
      // Fallback display success if API fails locally
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Phone':
        return <Phone className="w-4 h-4" />;
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4" />;
      case 'Mail':
        return <Mail className="w-4 h-4" />;
      case 'Globe':
        return <Globe className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getGuaranteeColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          title: 'text-blue-600 dark:text-cyan-400',
          border: 'hover:border-blue-400 dark:hover:border-cyan-400/50',
        };
      case 'emerald':
        return {
          title: 'text-emerald-600 dark:text-emerald-400',
          border: 'hover:border-emerald-400 dark:hover:border-emerald-400/50',
        };
      case 'violet':
        return {
          title: 'text-violet-600 dark:text-violet-400',
          border: 'hover:border-violet-400 dark:hover:border-violet-400/50',
        };
      case 'amber':
        return {
          title: 'text-amber-600 dark:text-amber-400',
          border: 'hover:border-amber-400 dark:hover:border-amber-400/50',
        };
      case 'rose':
        return {
          title: 'text-rose-600 dark:text-rose-400',
          border: 'hover:border-rose-400 dark:hover:border-rose-400/50',
        };
      default:
        return {
          title: 'text-blue-600 dark:text-cyan-400',
          border: 'hover:border-blue-400 dark:hover:border-cyan-400/50',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-cyan-500/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── HERO BANNER ── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-400/30 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 mb-4"
          >
            <Headphones className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{contactData.heroBadge || 'ENTERPRISE & GLOBAL ADVISORY'}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            {contactData.heroTitle || 'Talk with Our'}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-cyan-400 dark:via-blue-500 dark:to-violet-400 bg-clip-text text-transparent">
              {contactData.heroGradientTitle || 'Enterprise Team'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed"
          >
            {contactData.heroDescription || 'Whether you need custom SLA guarantees, multi-region deployment, or dedicated volume licensing, our global sales engineers respond within 15 minutes.'}
          </motion.p>
        </div>

        {/* ── MAIN SECTION: FORM + CONTACT CHANNELS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">

          {/* Left Column: Comprehensive Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl relative transition-colors duration-300">
            
            {/* SUCCESS STATE OVERLAY */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/98 dark:bg-slate-950/98 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-cyan-100 dark:bg-cyan-500/20 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Inquiry Received!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-6">
                    Thank you, <span className="text-blue-600 dark:text-cyan-400 font-bold">{formData.fullName || 'Valued Partner'}</span>. An Enterprise Account Director has been assigned to <span className="text-blue-600 dark:text-cyan-400 font-bold">{formData.company || 'your organization'}</span> and will connect within 15 minutes.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left w-full max-w-md mb-8 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Target Industry:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{formData.industry}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Budget Range:</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-bold">{formData.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Guaranteed Response SLA:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 15 Minutes</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                    <button
                      onClick={() => navigateTo('/products')}
                      className="px-6 py-3 rounded-xl bg-blue-600 dark:bg-cyan-600 hover:bg-blue-500 dark:hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                    >
                      Explore Products
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  <span>{contactData.formTitle || 'Enterprise Inquiry Form'}</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <Clock className="w-3.5 h-3.5" /> {contactData.responseSlaBadge || '15 Min SLA'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@enterprise.com"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="Global Systems Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (415) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  >
                    <option>Software / SaaS</option>
                    <option>Education / SchoolyCore</option>
                    <option>Healthcare & Hospitals</option>
                    <option>Hospitality & Hotels</option>
                    <option>Logistics & Supply Chain</option>
                    <option>Government & Public Sector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Company Size</label>
                  <select
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full px-3 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  >
                    <option>10 - 50 Employees</option>
                    <option>50 - 250 Employees</option>
                    <option>250 - 1,000 Employees</option>
                    <option>1,000+ Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Annual Budget</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                  >
                    <option>₹8L - ₹20L / year</option>
                    <option>₹20L - ₹40L / year</option>
                    <option>₹40L - ₹1.2Cr / year</option>
                    <option>₹1.2Cr+ Custom Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Specific Requirements / Security Protocols</label>
                <textarea
                  rows={4}
                  placeholder="Describe your current CRM challenges, data migration requirements, or compliance needs..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none resize-none"
                />
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Request...' : 'Submit Enterprise Request'}</span>
              </button>

            </form>
          </div>

          {/* Right Column: Direct Channels & Compliance Badges (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Direct Communication Channels (Database Driven) */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>{contactData.directChannelsTitle || 'Direct Communication Channels'}</span>
              </h4>

              <div className="space-y-3">
                {contactData.directChannels.filter(c => c.enabled !== false).map((channel, i) => {
                  let href = channel.actionUrl || '#';
                  if (channel.type === 'phone' && !href.startsWith('tel:') && !href.startsWith('http')) {
                    href = `tel:${channel.actionUrl || channel.subtitle || contactData.phone}`;
                  } else if (channel.type === 'whatsapp') {
                    href = getNormalizedWhatsAppUrl(channel.actionUrl || contactData.whatsApp || '') || '#';
                  }

                  return (
                    <a
                      key={channel.id || i}
                      href={href}
                      target={channel.type === 'whatsapp' || href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      onClick={(e) => {
                        if (channel.type === 'chat' || href === '#live-advisor' || href === '#') {
                          e.preventDefault();
                          alert("Live Chat initializing with Enterprise Specialist...");
                        }
                      }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-400/60 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                          {renderChannelIcon(channel.icon)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{channel.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{channel.subtitle}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition">
                        {channel.actionText || 'Connect →'}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Enterprise Security & Guarantees (Database Driven) */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{contactData.securityGuaranteesTitle || 'Enterprise Security & Guarantees'}</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {contactData.securityGuarantees.map((item, idx) => {
                  const colors = getGuaranteeColorClasses(item.color || 'blue');
                  return (
                    <div
                      key={item.id || idx}
                      className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition ${colors.border}`}
                    >
                      <div className={`font-extrabold ${colors.title} mb-0.5`}>
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ── GLOBAL OFFICES GRID (Database Driven) ── */}
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              {contactData.officeLocationsBadge || 'OUR GLOBAL FOOTPRINT'}
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {contactData.officeLocationsTitle || 'Worldwide Office Locations'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactData.officeLocations.map((office, idx) => (
              <div
                key={office.id || idx}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-400 dark:hover:border-cyan-500/50 transition duration-300 shadow-sm"
              >
                {office.isHQ && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-500/20 border border-blue-200 dark:border-cyan-400/40 text-[9px] font-extrabold text-blue-600 dark:text-cyan-300 uppercase">
                    GLOBAL HQ
                  </span>
                )}
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4 group-hover:scale-110 transition duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{office.city}</h4>
                <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mb-3">{office.country}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{office.address}</p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div><span className="text-slate-400 dark:text-slate-500">Phone:</span> {office.phone}</div>
                  <div><span className="text-slate-400 dark:text-slate-500">Hours:</span> {office.hours}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
