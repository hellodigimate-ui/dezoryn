import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Headphones,
  Mail,
  Phone,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';
import { useNavigation } from '../../utils/NavigationContext';

export interface SupportFormState {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  product: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
}

const CATEGORIES = [
  'General Support',
  'Technical Issue',
  'Account & Login',
  'Billing & Subscription',
  'Product Question',
  'Bug Report',
  'Demo / Sales Support',
  'Other',
];

const PRODUCTS = [
  'Dezoryn CRM 360',
  'Real Estate OS',
  'SchoolyCore ERP',
  'SchoolyCore Lite',
  'Dezo Care HMS',
  'Dezoryn HRMS Pulse',
  'InventoryPro Matrix',
  'DezoAI Sales Copilot',
  'Other',
  'Not Applicable',
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low - General Question' },
  { value: 'MEDIUM', label: 'Medium - Normal Issue' },
  { value: 'HIGH', label: 'High - System Impacted' },
  { value: 'URGENT', label: 'Urgent - System Outage' },
];

export const SupportPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  const [form, setForm] = useState<SupportFormState>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    product: 'Dezoryn CRM 360',
    category: 'General Support',
    priority: 'MEDIUM',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ ticketId: string; email: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    } else if (form.fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters.';
    }

    if (!form.email.trim()) {
      errs.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!form.subject.trim()) {
      errs.subject = 'Subject is required.';
    } else if (form.subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters.';
    }

    if (!form.category) {
      errs.category = 'Support Category is required.';
    }

    if (!form.message.trim()) {
      errs.message = 'Message is required.';
    } else if (form.message.trim().length < 10) {
      errs.message = 'Please provide a more detailed message (minimum 10 characters).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedTicket({
          ticketId: data.ticketId || data.data?.ticketId || 'SUP-0001',
          email: form.email,
        });
      } else {
        setServerError(data.message || 'Unable to submit your support request right now. Please try again.');
      }
    } catch (_err) {
      setServerError('Unable to submit your support request right now. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      product: 'Dezoryn CRM 360',
      category: 'General Support',
      priority: 'MEDIUM',
      subject: '',
      message: '',
    });
    setErrors({});
    setSubmittedTicket(null);
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs font-extrabold text-cyan-400 mb-4 shadow-sm"
          >
            <LifeBuoy className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>24/7 ENTERPRISE SUPPORT CENTER</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4"
          >
            How can we <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">help you?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed"
          >
            Submit a support request and our dedicated engineering team will get back to you as soon as possible.
          </motion.p>
        </div>

        {/* 2-Column Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Support Center Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Support Desk Info Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-600/20 to-transparent blur-2xl pointer-events-none" />

              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-cyan-400" />
                <span>Dedicated Support Desk</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Our support team handles technical inquiries, account configuration, billing requests, and bug reports 24/7.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white">Rapid SLA Response</h3>
                    <p className="text-[11px] text-slate-400">Critical issues addressed within 1-2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white">Bank-Grade Encryption</h3>
                    <p className="text-[11px] text-slate-400">Your customer data & logs remain strictly confidential</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <Mail className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white">Direct Support Email</h3>
                    <a href="mailto:support@dezoryn.com" className="text-[11px] text-cyan-400 hover:underline">
                      support@dezoryn.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <Phone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white">Phone Support Line</h3>
                    <p className="text-[11px] text-slate-300">+91 77778 04850</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-purple-950/30 border border-slate-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Self-Service Resources</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Looking for product manuals, developer APIs, or common setup questions?
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => navigateTo('/faq')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Frequently Asked Questions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/api-docs')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>API & Developer Documentation</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Support Form or Success View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative">
              <AnimatePresence mode="wait">
                {submittedTicket ? (
                  /* ── SUCCESS STATE ── */
                  <motion.div
                    key="success-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                        TICKET SUBMITTED SUCCESSFULLY
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                        Thank You! We Have Received Your Request.
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                        Our technical support team will evaluate your ticket and send updates directly to <strong className="text-white">{submittedTicket.email}</strong>.
                      </p>
                    </div>

                    {/* Reference Ticket Box */}
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        YOUR SUPPORT TICKET REFERENCE
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-wider">
                        {submittedTicket.ticketId}
                      </div>
                      <p className="text-[11px] text-slate-400">Please save this ticket ID for future reference.</p>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-4 justify-center">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Submit Another Request</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('/')}
                        className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
                      >
                        <span>Return to Home</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ── SUPPORT FORM STATE ── */
                  <motion.form
                    key="form-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="border-b border-slate-800 pb-4 mb-6">
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <span>Submit Support Ticket</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Fill out the details below. Required fields are marked with an asterisk (*).
                      </p>
                    </div>

                    {/* Server Error Alert */}
                    {serverError && (
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    {/* Row 1: Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Full Name *</label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
                            errors.fullName ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-800 focus:ring-cyan-500/40'
                          } text-xs font-bold text-white outline-none focus:ring-2`}
                        />
                        {errors.fullName && <p className="text-[11px] font-semibold text-rose-400">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Email Address *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="john@company.com"
                          className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
                            errors.email ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-800 focus:ring-cyan-500/40'
                          } text-xs font-bold text-white outline-none focus:ring-2`}
                        />
                        {errors.email && <p className="text-[11px] font-semibold text-rose-400">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Row 2: Phone & Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Phone Number (Optional)</label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Company (Optional)</label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
                        />
                      </div>
                    </div>

                    {/* Row 3: Category & Product */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Support Category *</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        {errors.category && <p className="text-[11px] font-semibold text-rose-400">{errors.category}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Product / Software (Optional)</label>
                        <select
                          value={form.product}
                          onChange={(e) => setForm({ ...form, product: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
                        >
                          {PRODUCTS.map((prod) => (
                            <option key={prod} value={prod}>
                              {prod}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Subject & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Subject *</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="e.g. Unable to access dashboard after login"
                          className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
                            errors.subject ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-800 focus:ring-cyan-500/40'
                          } text-xs font-bold text-white outline-none focus:ring-2`}
                        />
                        {errors.subject && <p className="text-[11px] font-semibold text-rose-400">{errors.subject}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-300">Priority Level</label>
                        <select
                          value={form.priority}
                          onChange={(e) => setForm({ ...form, priority: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 5: Detailed Message */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-300">Message / Issue Details *</label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Please describe the issue or inquiry in detail..."
                        className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
                          errors.message ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-800 focus:ring-cyan-500/40'
                        } text-xs font-bold text-white outline-none focus:ring-2 resize-none`}
                      />
                      {errors.message && <p className="text-[11px] font-semibold text-rose-400">{errors.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 border-none"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting Support Request...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Support Request</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
