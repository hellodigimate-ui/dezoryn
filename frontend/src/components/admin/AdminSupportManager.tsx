import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  Save,
  User,
  Layers,
  MessageSquare
} from 'lucide-react';
import { API_URL, apiFetch } from '../../config/api.config';

const API_SUPPORT = `${API_URL}/support`;

export interface SupportTicketItem {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  product?: string;
  category?: string;
  priority?: string;
  subject: string;
  message: string;
  status: string;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminSupportManager: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Detail Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [editForm, setEditForm] = useState<{
    status: string;
    priority: string;
    assignedTo: string;
    adminNotes: string;
  }>({
    status: 'OPEN',
    priority: 'MEDIUM',
    assignedTo: '',
    adminNotes: '',
  });

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (statusFilter !== 'ALL') query.set('status', statusFilter);
      if (priorityFilter !== 'ALL') query.set('priority', priorityFilter);
      if (categoryFilter !== 'ALL') query.set('category', categoryFilter);
      if (sortBy) query.set('sortBy', sortBy);

      const res = await apiFetch(`${API_SUPPORT}?${query.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
      }
    } catch {
      showMsg('error', 'Failed to load support tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const openDetailModal = (ticket: SupportTicketItem) => {
    setSelectedTicket(ticket);
    setEditForm({
      status: ticket.status || 'OPEN',
      priority: ticket.priority || 'MEDIUM',
      assignedTo: ticket.assignedTo || '',
      adminNotes: ticket.adminNotes || '',
    });
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setIsSaving(true);

    try {
      const res = await apiFetch(`${API_SUPPORT}/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...editForm, updatedAt: new Date().toISOString() } : t))
        );
        setSelectedTicket((prev) => (prev ? { ...prev, ...editForm } : null));
        showMsg('success', `Ticket ${selectedTicket.ticketId} updated successfully.`);
      } else {
        showMsg('error', data.message || 'Failed to update ticket.');
      }
    } catch {
      showMsg('error', 'Error updating ticket.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTicket = async (id: string, ticketId: string) => {
    if (!confirm(`Are you sure you want to delete ticket ${ticketId}?`)) return;

    try {
      const res = await apiFetch(`${API_SUPPORT}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        if (selectedTicket?.id === id) setSelectedTicket(null);
        showMsg('info', `Ticket ${ticketId} deleted.`);
      }
    } catch {
      showMsg('error', 'Failed to delete ticket.');
    }
  };

  // Helper formatting badges
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CLOSED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return 'bg-slate-800 text-slate-300';
      case 'MEDIUM':
        return 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black animate-pulse';
      default:
        return 'bg-blue-600/20 text-blue-400';
    }
  };

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-800 text-white shadow-xl shadow-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />Support Operations Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Support Requests & Tickets</h1>
          <p className="text-xs text-cyan-100 max-w-2xl mt-1 leading-relaxed">
            Manage customer support inquiries, track SLA progress, assign team members, and add internal resolution notes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black">
            <span className="text-cyan-200">{openCount} Open</span>
            <span className="text-white/40">•</span>
            <span className="text-amber-200">{inProgressCount} In Progress</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-200">{resolvedCount} Resolved</span>
          </div>

          <button
            type="button"
            onClick={fetchTickets}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── TOAST MESSAGES ── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-3 shadow-md ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : message.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, name, email, or subject..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Status: OPEN</option>
            <option value="IN_PROGRESS">Status: IN PROGRESS</option>
            <option value="WAITING_FOR_CUSTOMER">Status: WAITING FOR CUSTOMER</option>
            <option value="RESOLVED">Status: RESOLVED</option>
            <option value="CLOSED">Status: CLOSED</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Priority: LOW</option>
            <option value="MEDIUM">Priority: MEDIUM</option>
            <option value="HIGH">Priority: HIGH</option>
            <option value="URGENT">Priority: URGENT</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="General Support">General Support</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Account & Login">Account & Login</option>
            <option value="Billing & Subscription">Billing & Subscription</option>
            <option value="Bug Report">Bug Report</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* ── TICKETS TABLE ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Loading support tickets...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <LifeBuoy className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Support Tickets Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no support requests matching your filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Ticket ID */}
                    <td className="py-4 px-4 font-black text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {t.ticketId}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {t.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{t.email}</div>
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[220px]">
                        {t.subject}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                        {t.message}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {t.category || 'General'}
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      {t.product || 'Dezoryn CRM'}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider ${getPriorityBadge(t.priority || 'MEDIUM')}`}>
                        {t.priority || 'MEDIUM'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(t.status || 'OPEN')}`}>
                        {t.status ? t.status.replace(/_/g, ' ') : 'OPEN'}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetailModal(t)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 font-extrabold transition cursor-pointer flex items-center gap-1 border border-cyan-200 dark:border-cyan-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View & Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTicket(t.id, t.ticketId)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 cursor-pointer transition"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TICKET DETAIL & MANAGEMENT MODAL ── */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-black">
                      {selectedTicket.ticketId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(editForm.status)}`}>
                      {editForm.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {selectedTicket.subject}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 1. Customer Info Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-500" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold">Full Name</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{selectedTicket.fullName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold">Email Address</span>
                      <a href={`mailto:${selectedTicket.email}`} className="font-extrabold text-cyan-600 dark:text-cyan-400 hover:underline">
                        {selectedTicket.email}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold">Phone Number</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{selectedTicket.phone || 'N/A'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold">Company</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{selectedTicket.company || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Customer Message */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-500" />
                    Customer Support Message
                  </label>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* 3. Request Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold">Support Category</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{selectedTicket.category || 'General Support'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold">Product / Suite</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{selectedTicket.product || 'Dezoryn CRM'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold">Created Date</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 4. Admin Management Controls */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-500" />
                    Admin Ticket Operations & Status
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Status Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Ticket Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="WAITING_FOR_CUSTOMER">WAITING FOR CUSTOMER</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    {/* Priority Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Priority Level</label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </div>

                    {/* Assigned To */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Assigned To</label>
                      <input
                        type="text"
                        value={editForm.assignedTo}
                        onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                        placeholder="e.g. Alex Tech Lead"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
                      />
                    </div>
                  </div>

                  {/* Internal Admin Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Internal Admin Notes</label>
                    <textarea
                      rows={3}
                      value={editForm.adminNotes}
                      onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                      placeholder="Add internal investigation notes, logs, or resolution steps..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => handleDeleteTicket(selectedTicket.id, selectedTicket.ticketId)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Ticket</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateTicket}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs cursor-pointer transition flex items-center gap-2 shadow-lg shadow-cyan-600/25"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSupportManager;
