import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Package,
  Eye,
  MousePointer,
  CalendarCheck,
  Download,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { MarketplaceProductAdmin } from './AdminMarketplaceManager';

interface AdminMarketplaceAnalyticsProps {
  products: MarketplaceProductAdmin[];
}

// Timeseries Data
const MONTHLY_TRAFFIC_DATA = [
  { month: 'Jan', views: 18400, clicks: 5200, demos: 310, downloads: 1200 },
  { month: 'Feb', views: 22100, clicks: 6400, demos: 410, downloads: 1540 },
  { month: 'Mar', views: 26800, clicks: 7800, demos: 520, downloads: 1980 },
  { month: 'Apr', views: 31200, clicks: 9100, demos: 630, downloads: 2410 },
  { month: 'May', views: 39500, clicks: 11400, demos: 790, downloads: 3150 },
  { month: 'Jun', views: 48250, clicks: 14200, demos: 980, downloads: 4100 }
];

const CATEGORY_DISTRIBUTION = [
  { name: 'CRM & Sales', value: 35, color: '#3b82f6' },
  { name: 'ERP & Operations', value: 25, color: '#06b6d4' },
  { name: 'Industry Vertical', value: 20, color: '#10b981' },
  { name: 'AI Suite', value: 12, color: '#a855f7' },
  { name: 'Security & Tools', value: 8, color: '#f59e0b' }
];

const TRAFFIC_SOURCES_DATA = [
  { source: 'Direct Web', visitors: 48200, color: '#3b82f6' },
  { source: 'Organic Search', visitors: 39400, color: '#06b6d4' },
  { source: 'Partner Network', visitors: 22100, color: '#10b981' },
  { source: 'Social Campaign', visitors: 16500, color: '#a855f7' },
  { source: 'Referral Links', visitors: 9800, color: '#f59e0b' }
];

const RECENT_ACTIVITY_LOGS = [
  { id: 1, text: 'Enterprise Demo Requested for "SchoolyCore ERP"', time: '2 mins ago', icon: CalendarCheck, color: 'text-cyan-500 bg-cyan-500/10' },
  { id: 2, text: 'Whitepaper PDF downloaded for "Dezo Care HMS"', time: '14 mins ago', icon: Download, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 3, text: '5-Star Verified Review submitted for "FinTrack ERP"', time: '38 mins ago', icon: Sparkles, color: 'text-amber-500 bg-amber-500/10' },
  { id: 4, text: '50+ Batch Views logged for "DezoAI Sales Copilot"', time: '1 hour ago', icon: Eye, color: 'text-purple-500 bg-purple-500/10' },
  { id: 5, text: 'Product "MfgPro Factory Suite" updated by Admin', time: '2 hours ago', icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' }
];

export const AdminMarketplaceAnalytics: React.FC<AdminMarketplaceAnalyticsProps> = React.memo(({ products }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Memoized Metric totals calculation for low-end devices
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalViews = 148250;
    const totalClicks = 42910;
    const totalDemos = 2530;
    const totalDownloads = 14890;
    const conversionRate = ((totalDemos / totalClicks) * 100).toFixed(2);

    return {
      totalProducts,
      totalViews,
      totalClicks,
      totalDemos,
      totalDownloads,
      conversionRate
    };
  }, [products]);

  const CARDS = [
    { label: 'Total Products', value: metrics.totalProducts.toString(), change: '+14% MoM', icon: Package, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' },
    { label: 'Catalog Views', value: metrics.totalViews.toLocaleString(), change: '+28.4%', icon: Eye, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30' },
    { label: 'Product Clicks', value: metrics.totalClicks.toLocaleString(), change: '+19.1%', icon: MousePointer, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30' },
    { label: 'Demo Requests', value: metrics.totalDemos.toLocaleString(), change: '+34.2%', icon: CalendarCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' },
    { label: 'Spec Downloads', value: metrics.totalDownloads.toLocaleString(), change: '+22.5%', icon: Download, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' },
    { label: 'Conversion Rate', value: `${metrics.conversionRate}%`, change: '+1.4% MoM', icon: TrendingUp, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 text-left font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ── HEADER & TIME RANGE SELECTOR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Marketplace Analytics & Traffic Intelligence</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time buyer engagement, conversion funnels, & product popularity leaderboard</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-stretch sm:self-auto justify-center">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. 6 METRIC OVERVIEW CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl flex flex-col justify-between transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400">{card.label}</span>
                <div className={`p-1.5 sm:p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{card.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 2. RECHARTS CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Traffic & Demo Requests Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">Catalog Views & Buyer Demo Funnel</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly traffic growth vs demo requests conversion</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Catalog Views
              </span>
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Demo Requests
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDemos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" isAnimationActive={false} />
                <Area type="monotone" dataKey="demos" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorDemos)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">Top Category Breakdown</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Share of total catalog inquiries</p>
          </div>

          <div className="h-48 sm:h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {CATEGORY_DISTRIBUTION.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 3. TRAFFIC SOURCES & RECENT ACTIVITY LOGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Traffic Sources Bar Chart (6 cols) */}
        <div className="lg:col-span-6 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
          <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">Traffic Channels & Referral Sources</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Total monthly visitors by acquisition channel</p>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRAFFIC_SOURCES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="source" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="visitors" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                  {TRAFFIC_SOURCES_DATA.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Stream (6 cols) */}
        <div className="lg:col-span-6 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-black text-slate-900 dark:text-white">Live Marketplace Activity Stream</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {RECENT_ACTIVITY_LOGS.map((log) => {
                const Icon = log.icon;
                return (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 ${log.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{log.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {log.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── 4. MOST VIEWED PRODUCTS LEADERBOARD TABLE ── */}
      <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl overflow-hidden p-4 sm:p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-black text-slate-900 dark:text-white">Most Viewed Products Leaderboard</h4>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Top Performing Software</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <th className="p-3.5">Rank & Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Total Views</th>
                <th className="p-3.5">Demo Clicks</th>
                <th className="p-3.5">Conversion %</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {products.slice(0, 5).map((prod, idx) => (
                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold">{prod.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">/{prod.slug || prod.id}</div>
                    </div>
                  </td>

                  <td className="p-3.5 text-blue-600 dark:text-blue-400 font-bold">
                    {prod.categoryLabel || prod.category}
                  </td>

                  <td className="p-3.5 font-bold text-cyan-600 dark:text-cyan-300">
                    {(prod.viewsCount || 12400 - idx * 1500).toLocaleString()}
                  </td>

                  <td className="p-3.5 font-bold text-purple-600 dark:text-purple-300">
                    {(prod.demoClicks || 850 - idx * 110).toLocaleString()}
                  </td>

                  <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                    {(6.8 - idx * 0.4).toFixed(2)}%
                  </td>

                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
});

AdminMarketplaceAnalytics.displayName = 'AdminMarketplaceAnalytics';
