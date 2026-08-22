import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Sparkles,
  Search,
  ArrowRight,
  GraduationCap,
  Cross,
  Zap,
  ShieldCheck,
  Activity,
  Star,
  X
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';
import type { MarketplaceProduct } from './MarketplacePage';

export interface MarketplaceHeroCMSConfig {
  tagline: string;
  title1: string;
  titleGradient: string;
  description: string;
  popularTags: string[];
  statProducts: string;
  statIndustries: string;
  statClients: string;
  statUptime: string;
  statSupport: string;
  hubActiveProducts: string;
  hubApiSla: string;
  hubLatency: string;
  badge1Title: string;
  badge1Sub: string;
  badge2Title: string;
  badge2Sub: string;
  badge3Title: string;
  badge3Sub: string;
}

export const DEFAULT_HERO_CMS: MarketplaceHeroCMSConfig = {
  tagline: 'DEZORYN SOFTWARE ECOSYSTEM',
  title1: 'Discover, Deploy & Scale',
  titleGradient: 'Next-Gen SaaS Products',
  description: 'Dezoryn Software Marketplace is the primary enterprise hub for AI copilots, intelligent ERPs, hospital management systems, and automated CRMs. Engineered for high availability and bank-grade security.',
  popularTags: ['SchoolyCore', 'HMS Health', 'HRMS Pulse', 'Sales AI', 'InventoryPro'],
  statProducts: '50+',
  statIndustries: '15+',
  statClients: '1000+',
  statUptime: '99.9%',
  statSupport: '24x7',
  hubActiveProducts: '48 / 50',
  hubApiSla: '99.98%',
  hubLatency: 'Avg Latency: 18ms',
  badge1Title: 'SchoolyCore ERP',
  badge1Sub: '★ 4.9 (12k Students)',
  badge2Title: 'HMS Care',
  badge2Sub: 'NABH Ready',
  badge3Title: 'DezoAI Sales Copilot',
  badge3Sub: '99.4% Accuracy'
};

interface MarketplaceHeroProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
  products?: MarketplaceProduct[];
  onSelectProduct?: (product: MarketplaceProduct) => void;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  searchQuery = '',
  onSearch,
  products = [],
  onSelectProduct
}) => {
  const { navigateTo } = useNavigation();
  const [searchVal, setSearchVal] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [heroConfig, setHeroConfig] = useState<MarketplaceHeroCMSConfig>(DEFAULT_HERO_CMS);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mouse Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 35;
    const y = (e.clientY - rect.top - rect.height / 2) / 35;
    setMousePos({ x, y });
  };

  // Read hero CMS config from API / fallback to localStorage
  const loadHeroConfig = async () => {
    try {
      const res = await apiFetch('/hero');
      const data = await res.json();
      if (data.success && data.data) {
        setHeroConfig({ ...DEFAULT_HERO_CMS, ...data.data });
        return;
      }
    } catch (_e) {}

    try {
      const saved = localStorage.getItem('dezoryn_hero_cms');
      if (saved) {
        setHeroConfig({ ...DEFAULT_HERO_CMS, ...JSON.parse(saved) });
      }
    } catch (_e) {
      setHeroConfig(DEFAULT_HERO_CMS);
    }
  };

  useEffect(() => {
    loadHeroConfig();
    const handleUpdate = () => loadHeroConfig();
    window.addEventListener('hero-cms-updated', handleUpdate);
    return () => window.removeEventListener('hero-cms-updated', handleUpdate);
  }, []);

  // Keep local search value synced with parent state
  useEffect(() => {
    setSearchVal(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  const handleClear = () => {
    setSearchVal('');
    if (onSearch) onSearch('');
  };

  const handleTagClick = (tag: string) => {
    setSearchVal(tag);
    setIsDropdownOpen(true);
    if (onSearch) onSearch(tag);
  };

  const filteredProducts = useMemo(() => {
    if (!searchVal || !searchVal.trim()) return [];
    const q = searchVal.trim().toLowerCase();
    const list = Array.isArray(products) && products.length > 0 ? products : [];
    return list.filter((p) => {
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const tagMatch = (p.tag || '').toLowerCase().includes(q);
      const catMatch = (p.categoryLabel || p.category || '').toLowerCase().includes(q);
      const descMatch = (p.shortDesc || p.description || '').toLowerCase().includes(q);
      const indMatch = (p.industry || '').toLowerCase().includes(q);
      const tagsMatch = Array.isArray(p.tags) && p.tags.some((t) => (t || '').toLowerCase().includes(q));
      return titleMatch || tagMatch || catMatch || descMatch || indMatch || tagsMatch;
    });
  }, [searchVal, products]);

  // Stagger animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemFadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Dynamic statistics data from CMS
  const statsData = [
    { value: heroConfig.statProducts, label: 'Products', color: 'from-blue-600 to-cyan-500' },
    { value: heroConfig.statIndustries, label: 'Industries', color: 'from-cyan-500 to-emerald-500' },
    { value: heroConfig.statClients, label: 'Clients', color: 'from-purple-600 to-indigo-500' },
    { value: heroConfig.statUptime, label: 'Uptime', color: 'from-emerald-500 to-teal-400' },
    { value: heroConfig.statSupport, label: 'Support', color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative py-12 lg:py-20 overflow-hidden select-none"
    >
      {/* ── 1. ANIMATED GRADIENT & PARALLAX GLOW ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
            x: mousePos.x * -1.5,
            y: mousePos.y * -1.5
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-indigo-600/10 dark:from-blue-600/30 dark:via-cyan-400/20 rounded-full blur-[140px]"
        />

        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.25, 0.5, 0.25],
            x: mousePos.x * 1.5,
            y: mousePos.y * 1.5
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-cyan-500/10 dark:from-indigo-600/25 dark:via-purple-500/20 rounded-full blur-[130px]"
        />

        {/* Floating background glowing particles */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-10 w-2 h-2 rounded-full bg-blue-500/60 blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, -25, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-cyan-400/60 blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-20 left-1/3 w-2.5 h-2.5 rounded-full bg-indigo-500/60 blur-[1px]"
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 text-left space-y-6">

            {/* 1. Small Tagline Badge */}
            <motion.div variants={itemFadeUp} className="inline-flex">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200/90 dark:border-cyan-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 shadow-sm shadow-blue-500/10">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 animate-pulse" />
                <span className="uppercase tracking-wider">{heroConfig.tagline}</span>
              </span>
            </motion.div>

            {/* 2. Customizable Large Heading */}
            <motion.h1
              variants={itemFadeUp}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]"
            >
              {heroConfig.title1} <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
                {heroConfig.titleGradient}
              </span>
            </motion.h1>

            {/* 3. Customizable Supporting Paragraph */}
            <motion.p
              variants={itemFadeUp}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed"
            >
              {heroConfig.description}
            </motion.p>

            {/* 4. Search Bar */}
            <motion.div variants={itemFadeUp} className="max-w-xl">
              <div ref={searchWrapperRef} className="relative group">
                <form onSubmit={handleSearchSubmit}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.995 }}
                    className={`relative flex items-center bg-white dark:bg-slate-900/90 border rounded-2xl p-2 transition-all duration-300 shadow-lg ${
                      isFocused || isDropdownOpen
                        ? 'border-blue-600 dark:border-cyan-400 ring-4 ring-blue-500/20 dark:ring-cyan-400/20 shadow-blue-500/15'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Search className={`w-5 h-5 ml-3 transition-colors duration-200 ${isFocused || isDropdownOpen ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />

                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => {
                        setSearchVal(e.target.value);
                        setIsDropdownOpen(true);
                        if (onSearch) onSearch(e.target.value);
                      }}
                      onFocus={() => {
                        setIsFocused(true);
                        setIsDropdownOpen(true);
                      }}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Search software catalog (e.g. SchoolyCore, HMS, HRMS, AI Copilot)..."
                      className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                    />

                    {searchVal && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 mr-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <span>Search</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                </form>

                {/* Live Interactive Search Results Dropdown Overlay */}
                {isDropdownOpen && searchVal.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl max-h-96 overflow-y-auto p-2">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Matching Solutions ({filteredProducts.length})</span>
                      {filteredProducts.length > 0 && <span className="text-blue-500 dark:text-cyan-400">Click result to view</span>}
                    </div>

                    {filteredProducts.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredProducts.map((prod) => (
                          <div
                            key={prod.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (onSelectProduct) {
                                onSelectProduct(prod);
                              } else if (onSearch) {
                                onSearch(prod.title);
                              }
                            }}
                            className="p-3 hover:bg-blue-50/80 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 group text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-400/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-black text-sm shrink-0">
                                {(prod.title || 'S')[0]}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                    {prod.title}
                                  </h4>
                                  {prod.tag && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300">
                                      {prod.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {prod.shortDesc || prod.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-black text-slate-900 dark:text-white">
                                {prod.price}
                              </div>
                              <div className="text-[10px] font-bold text-amber-500 flex items-center justify-end gap-0.5 mt-0.5">
                                <Star className="w-3 h-3 fill-amber-500" />
                                <span>{prod.rating || 4.9}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-500">
                          <Search className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                          No solutions found
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                          No software or solutions matching <span className="font-bold text-slate-700 dark:text-slate-200">"{searchVal}"</span> were found.
                        </p>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleClear}
                          className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Customizable Popular Tags */}
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-400">Popular:</span>
                  {(heroConfig.popularTags || []).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-cyan-500/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-slate-700/80 font-medium transition cursor-pointer text-[11px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 5. Statistics Row */}
            <motion.div variants={itemFadeUp} className="pt-2">
              <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs">
                {statsData.map((stat, idx) => (
                  <div key={idx} className="text-center px-1">
                    <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                      <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 6. CTA Buttons with Ripple & Spring */}
            <motion.div variants={itemFadeUp} className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  const catalogEl = document.getElementById('catalog-grid');
                  if (catalogEl) {
                    catalogEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigateTo('/marketplace');
                  }
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2 border-none"
              >
                <span>Explore Products Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigateTo('/book-demo')}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-cyan-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                Schedule Live Demo
              </motion.button>
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN: MOUSE PARALLAX LAPTOP & FLOATING BADGES ── */}
          <div className="lg:col-span-5 relative flex items-center justify-center">

            {/* Laptop / Browser Container with Parallax Translation */}
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px, 0)`
              }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[540px] rounded-3xl bg-slate-950 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.6)] overflow-hidden"
            >
              {/* Laptop Top Browser Window Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-[10px] text-slate-400 w-52 truncate">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">https://dezoryn.com/marketplace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* Dashboard Inner Screen Mock */}
              <div className="p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 space-y-4">

                {/* Dashboard Header Bar */}
                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      DZ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Dezoryn Control Hub</div>
                      <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Multi-Tenant Cluster
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                    v3.4 Enterprise
                  </span>
                </div>

                {/* Grid Widgets Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Active Products</div>
                    <div className="text-lg font-black text-white mt-1">{heroConfig.hubActiveProducts}</div>
                    <div className="text-[9px] text-emerald-400 font-semibold mt-1">↑ +12% this month</div>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">API Request SLA</div>
                    <div className="text-lg font-black text-cyan-300 mt-1">{heroConfig.hubApiSla}</div>
                    <div className="text-[9px] text-slate-400 font-semibold mt-1">{heroConfig.hubLatency}</div>
                  </div>
                </div>

                {/* Product Usage Bar */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>PRODUCT USAGE METRICS</span>
                    <span className="text-cyan-400">REAL-TIME SYNC</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '84%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 h-full rounded-full"
                    />
                  </div>
                </div>

              </div>
            </motion.div>

            {/* FLOATING BADGE 1 (Top Left) with Parallax */}
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px, 0)`
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-4 sm:-left-8 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl backdrop-blur-md z-20 flex items-center gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">{heroConfig.badge1Title}</div>
                <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{heroConfig.badge1Sub}</span>
                </div>
              </div>
            </motion.div>

            {/* FLOATING BADGE 2 (Top Right) with Parallax */}
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * 1.4}px, ${mousePos.y * 1.4}px, 0)`
              }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              className="absolute top-16 -right-4 sm:-right-8 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl backdrop-blur-md z-20 flex items-center gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Cross className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">{heroConfig.badge2Title}</div>
                <div className="text-[10px] text-emerald-400 font-bold">{heroConfig.badge2Sub}</div>
              </div>
            </motion.div>

            {/* FLOATING BADGE 3 (Bottom Right) with Parallax */}
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * -0.9}px, ${mousePos.y * -0.9}px, 0)`
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute -bottom-6 right-4 bg-slate-900/90 border border-cyan-500/40 p-3 rounded-2xl shadow-xl backdrop-blur-md z-20 flex items-center gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">{heroConfig.badge3Title}</div>
                <div className="text-[10px] text-cyan-300 font-bold">{heroConfig.badge3Sub}</div>
              </div>
            </motion.div>

          </div>

        </motion.div>
      </div>
    </section>
  );
};
