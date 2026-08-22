import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Tv,
  Sparkles
} from 'lucide-react';
import { API_URL, apiFetch } from '../../config/api.config';

const API_SUBMISSIONS = `${API_URL}/contact/submissions`;

export interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  employees?: string;
  budget?: string;
  productInterest?: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED' | string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminInquiryManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  const fetchInquiries = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let url = API_SUBMISSIONS;
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await apiFetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setInquiries(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to load inquiries');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to connect to the backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  // Filtered List based on source tab selection and search query
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Source filter
      if (sourceFilter === 'CONTACT') {
        if (item.source && item.source !== 'Contact Form') return false;
      } else if (sourceFilter === 'DEMO') {
        if (item.source !== 'Demo Booking') return false;
      } else if (sourceFilter === 'NEWSLETTER') {
        if (item.source !== 'Newsletter Subscription') return false;
      }

      // Local search filter for instant responsiveness
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.fullName && item.fullName.toLowerCase().includes(q);
        const matchEmail = item.email && item.email.toLowerCase().includes(q);
        const matchCompany = item.company && item.company.toLowerCase().includes(q);
        const matchPhone = item.phone && item.phone.toLowerCase().includes(q);
        const matchMsg = item.message && item.message.toLowerCase().includes(q);
        const matchProduct = item.productInterest && item.productInterest.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCompany && !matchPhone && !matchMsg && !matchProduct) {
          return false;
        }
      }

      return true;
    });
  }, [inquiries, sourceFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInquiries.length / pageSize) || 1;
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(start, start + pageSize);
  }, [filteredInquiries, currentPage, pageSize]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`${API_SUBMISSIONS}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(`Inquiry status updated to ${newStatus}`, 'success');
      }
    } catch (_err) {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`${API_SUBMISSIONS}/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data.success) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        setDeleteConfirmId(null);
        showToast('Inquiry record permanently removed from database.', 'success');
      } else {
        showToast(data.message || 'Failed to delete inquiry record', 'error');
        setDeleteConfirmId(null);
      }
    } catch (err: any) {
      showToast(err?.message || 'Error deleting inquiry record', 'error');
      setDeleteConfirmId(null);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      case 'CONTACTED':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'CLOSED':
        return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  // Stats calculation
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => (i.status || 'NEW').toUpperCase() === 'NEW').length;
  const inProgressCount = inquiries.filter((i) => ['IN_PROGRESS', 'CONTACTED'].includes((i.status || '').toUpperCase())).length;
  const closedCount = inquiries.filter((i) => (i.status || '').toUpperCase() === 'CLOSED').length;
  const contactFormCount = inquiries.filter((i) => !i.source || i.source === 'Contact Form').length;
  const demoBookingCount = inquiries.filter((i) => i.source === 'Demo Booking').length;
  const newsletterCount = inquiries.filter((i) => i.source === 'Newsletter Subscription').length;

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── HEADER & STATS BANNER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Inbox className="w-3.5 h-3.5" />
            <span>Lead & Inquiry Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Inquiries & Leads
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl">
            Review, search, and manage incoming enterprise inquiries, newsletter subscriptions, and scheduled product demo requests from PostgreSQL.
          </p>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10">
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-center min-w-[100px] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Leads</span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-center min-w-[100px] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">New Leads</span>
            <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{newCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-center min-w-[100px] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">In Progress</span>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-center min-w-[100px] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">Closed</span>
            <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-0.5">{closedCount}</div>
          </div>
        </div>
      </div>

      {/* ── SOURCE FILTER TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => { setSourceFilter('ALL'); setCurrentPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 border whitespace-nowrap shadow-xs ${
            sourceFilter === 'ALL'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Leads ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSourceFilter('CONTACT'); setCurrentPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 border whitespace-nowrap shadow-xs ${
            sourceFilter === 'CONTACT'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-md shadow-cyan-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Contact Sales Form ({contactFormCount})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSourceFilter('DEMO'); setCurrentPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 border whitespace-nowrap shadow-xs ${
            sourceFilter === 'DEMO'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Tv className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Demo Bookings ({demoBookingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSourceFilter('NEWSLETTER'); setCurrentPage(1); }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 border whitespace-nowrap shadow-xs ${
            sourceFilter === 'NEWSLETTER'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Newsletter Subscriptions ({newsletterCount})</span>
        </button>
      </div>

      {/* ── TOOLBAR: SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm shadow-slate-200/40 dark:shadow-none">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, company, phone, or keyword..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none px-4 py-2.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={fetchInquiries}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── INQUIRIES DATA TABLE & CARDS ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm shadow-slate-200/40 dark:shadow-none overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-600 dark:text-cyan-400" />
            <span>Fetching database records from PostgreSQL...</span>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No Inquiries Found</h3>
            <p className="text-xs max-w-sm mx-auto text-slate-500 dark:text-slate-400">
              No lead records matched your selected filters or search query.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5">Source</th>
                    <th className="py-4 px-5">Contact Info</th>
                    <th className="py-4 px-5">Company & Industry</th>
                    <th className="py-4 px-5">Product Interest</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm font-medium">
                  {paginatedInquiries.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono text-xs font-semibold">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 w-fit ${
                          item.source === 'Demo Booking'
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                            : item.source === 'Newsletter Subscription'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20'
                        }`}>
                          {item.source === 'Demo Booking' ? <Tv className="w-3.5 h-3.5" /> : item.source === 'Newsletter Subscription' ? <Sparkles className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                          <span>{item.source || 'Contact Form'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <span>{item.fullName}</span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-cyan-400 font-bold flex items-center gap-1.5 mt-0.5">
                          <span>{item.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.email, `email-${item.id}`)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Copy email address"
                          >
                            {copiedField === `email-${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {item.phone && <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.phone}</div>}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.company || '—'}</div>
                        {item.industry && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.industry}</div>}
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300 max-w-[260px] truncate font-medium">
                        {item.productInterest || 'General Inquiry'}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <select
                          value={item.status || 'NEW'}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border cursor-pointer focus:outline-none ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(item)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 transition cursor-pointer"
                            title="View Inquiry Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`mailto:${item.email}?subject=Regarding your inquiry with Dezoryn Technologies`}
                            className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 transition cursor-pointer"
                            title="Reply via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {paginatedInquiries.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                      item.source === 'Demo Booking'
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                        : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20'
                    }`}>
                      {item.source || 'Contact Form'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{formatDate(item.createdAt)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.fullName}</h4>
                    <div className="text-xs text-blue-600 dark:text-cyan-400 font-bold">{item.email}</div>
                    {item.company && <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-semibold">🏢 {item.company}</div>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <select
                      value={item.status || 'NEW'}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border focus:outline-none ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(item)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">
                  Showing <span className="font-extrabold text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span>–
                  <span className="font-extrabold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredInquiries.length)}</span> of{' '}
                  <span className="font-extrabold text-slate-900 dark:text-white">{filteredInquiries.length}</span> leads
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── DETAIL SLIDE-OVER MODAL ── */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Inquiry Details
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                      selectedInquiry.source === 'Demo Booking'
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                        : selectedInquiry.source === 'Newsletter Subscription'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20'
                    }`}>
                      {selectedInquiry.source || 'Contact Form'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ID: <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">{selectedInquiry.id}</span> • Submitted {formatDate(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Contact Details</span>
                  <div className="font-black text-slate-900 dark:text-white text-sm">{selectedInquiry.fullName}</div>
                  <div className="text-blue-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                    <span>{selectedInquiry.email}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedInquiry.email, 'modal-email')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {copiedField === 'modal-email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {selectedInquiry.phone && <div className="text-slate-600 dark:text-slate-400 font-mono">📞 {selectedInquiry.phone}</div>}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Company Information</span>
                  <div className="font-black text-slate-900 dark:text-white text-sm">{selectedInquiry.company || 'Not Specified'}</div>
                  {selectedInquiry.industry && <div className="text-slate-600 dark:text-slate-400">Industry: {selectedInquiry.industry}</div>}
                  {selectedInquiry.employees && <div className="text-slate-600 dark:text-slate-400">Team Size: {selectedInquiry.employees}</div>}
                </div>
              </div>

              {(selectedInquiry.productInterest || selectedInquiry.budget) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
                    <span className="text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400 uppercase">Product Interest</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedInquiry.productInterest || 'General Solution'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20">
                    <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-400 uppercase">Budget Bracket</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedInquiry.budget || 'Unspecified'}</div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Message & Requirements</span>
                <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedInquiry.message || 'No additional message text provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding your inquiry with Dezoryn Technologies`}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Inquiry Record?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to permanently delete this inquiry? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOASTER NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl flex items-center gap-3 text-xs font-black shadow-2xl border backdrop-blur-xl ${
              toastMessage.type === 'success'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40 shadow-slate-200/50 dark:shadow-emerald-500/10'
                : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/40 shadow-slate-200/50 dark:shadow-rose-500/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              toastMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5 pr-2">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                {toastMessage.type === 'success' ? 'Operation Completed' : 'Operation Error'}
              </div>
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {toastMessage.text}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
