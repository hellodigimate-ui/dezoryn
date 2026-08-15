import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Layout,
  Package,
  HelpCircle,
  FolderOpen,
  Globe,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Zap,
  Sliders,
  Mail,
  ShieldCheck,
  Star
} from 'lucide-react';
import { openAdminAIAssistant } from './AdminLayout';

interface AdminOverviewProps {
  setActiveTab: (tab: string) => void;
  userRole?: string;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ setActiveTab, userRole = 'ADMIN' }) => {
  const websiteStats = [
    {
      id: 'pages',
      title: 'Published CMS Sections',
      value: '7 Sections',
      change: 'Hero, Products, FAQs, Footer',
      isPositive: true,
      icon: Layout,
      color: 'from-blue-600 to-cyan-500',
      badge: 'Live',
    },
    {
      id: 'products',
      title: 'Active Products & Services',
      value: '12 Items',
      change: '+3 added this week',
      isPositive: true,
      icon: Package,
      color: 'from-cyan-500 to-teal-500',
      badge: 'Catalog Active',
    },
    {
      id: 'leads',
      title: 'Customer Leads & Inquiries',
      value: '48 Submissions',
      change: '12 new this week',
      isPositive: true,
      icon: Mail,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Form Active',
    },
    {
      id: 'media',
      title: 'Media Assets & Banners',
      value: '142 Files',
      change: '1.2 GB Storage Used',
      isPositive: true,
      icon: FolderOpen,
      color: 'from-purple-600 to-pink-600',
      badge: 'Library Ready',
    },
  ];

  const recentContentUpdates = [
    { id: '1', action: 'Hero Section Updated', detail: 'Main headline and CTA buttons updated', time: '10 mins ago', user: 'Admin' },
    { id: '2', action: 'New Contact Inquiry', detail: 'Sarah Jenkins (CTO, Aetheria Cloud) submitted lead form', time: '25 mins ago', user: 'Customer' },
    { id: '3', action: 'SEO Meta Tags Generated', detail: 'AI Copilot generated meta description & keywords', time: '1 hour ago', user: 'AI Assistant' },
    { id: '4', action: 'Product Catalog Edited', detail: 'Sales Intelligence Suite description updated', time: '3 hours ago', user: 'Admin' },
  ];

  const websiteCMSModules = [
    {
      id: 'pages',
      title: 'Hero & Page Builder',
      desc: 'Customize hero titles, gradient text, badge labels & CTA action buttons.',
      icon: Layout,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      tab: 'pages',
    },
    {
      id: 'products',
      title: 'Products & Solutions',
      desc: 'Manage enterprise software products, features, metrics & pricing tiers.',
      icon: Package,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      tab: 'products',
    },
    {
      id: 'testimonials',
      title: 'Testimonials & Reviews',
      desc: 'Add client reviews, customer ratings, executive quotes & case studies.',
      icon: Star,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      tab: 'testimonials',
    },
    {
      id: 'faqs',
      title: 'FAQ Manager',
      desc: 'Create, organize & publish customer FAQs by product category.',
      icon: HelpCircle,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      tab: 'faqs',
    },
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 p-6 md:p-8 border border-blue-500/30 dark:border-slate-800 shadow-xl shadow-blue-500/10 text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 dark:bg-cyan-500/10 border border-white/30 dark:border-cyan-500/30 text-white dark:text-cyan-400 text-xs font-black">
              <Globe className="w-3.5 h-3.5" />
              Website CMS Control Hub
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome back, <span className="text-cyan-200 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-400">{userRole}</span>
            </h2>
            <p className="text-xs md:text-sm text-blue-50 dark:text-slate-300 max-w-xl leading-relaxed">
              Manage website content, landing pages, product catalog, customer inquiries, and AI copy generation from your centralized CMS hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openAdminAIAssistant({ type: 'hero' })}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 dark:text-white font-black text-xs transition shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Assistant
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pages')}
              className="px-4 py-2.5 rounded-xl bg-blue-700/60 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-white/20 dark:border-slate-700 text-white dark:text-slate-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Layout className="w-4 h-4" />
              Edit Hero Page
            </button>
          </div>
        </div>
      </div>

      {/* Website KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {websiteStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-slate-800 text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-slate-700">
                  {stat.badge}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{stat.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Website CMS Quick Management Modules Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-500" />
          Quick Website CMS Managers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {websiteCMSModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveTab(mod.tab)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-cyan-500/50 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <span>Open Manager</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Split: Recent Content Activity & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Website Activity List (2 Columns) */}
        <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recent Website Activity & Updates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live audit trail of website copy changes, lead submissions, and AI content updates
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full History <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentContentUpdates.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                        {log.user}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {log.detail}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Website Status Panel (1 Column) */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Live Website Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Website Deployment</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">Published</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Lead Contact Forms</span>
              </div>
              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-500 font-bold bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 px-2 py-0.5 rounded-md">Receiving</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-700 dark:text-slate-300">AI Copy Generator</span>
              </div>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md">GPT-4 Engine</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-cyan-50/80 dark:bg-gradient-to-br dark:from-blue-900/30 dark:to-cyan-900/30 border border-cyan-200 dark:border-cyan-500/30 text-cyan-950 dark:text-cyan-300 text-xs font-semibold space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Website Settings Quick Access
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Update global website name, brand logo, favicon, maintenance mode, and SEO metadata tags anytime.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('site-settings')}
                className="mt-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[11px] transition cursor-pointer"
              >
                Open Site Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
