import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';

import { MarketplaceHero } from './MarketplaceHero';
import { MarketplaceCategoryNav } from './MarketplaceCategoryNav';
import { MarketplaceFilterSidebar, type MarketplaceFilterState, INITIAL_FILTER_STATE } from './MarketplaceFilterSidebar';
import { MarketplaceProductGrid } from './MarketplaceProductGrid';
import { ProductCompareModal } from './ProductCompareModal';
import { MarketplaceCompareBar } from './MarketplaceCompareBar';
import { MarketplaceCTASection } from './MarketplaceCTASection';

export interface MarketplaceProduct {
  id: string;
  title: string;
  category: 'erp' | 'crm' | 'ai' | 'industry' | 'utility' | 'finance' | 'security';
  categoryLabel: string;
  industry: string;
  badge: string;
  shortDesc: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  coverPhoto?: string;
  gallery?: string[];
  icon: string | React.ReactNode;
  tag: string;
  tags: string[];
  status: 'Available' | 'Featured' | 'Coming Soon';
  rating: number;
  reviewsCount: number;
  price: string;
  priceValue: number;
  pricingType: string;
  features: string[];
  businessSizes: string[];
  deployment: string[];
  platforms: string[];
  aiPowered: boolean;
  apiAvailable: boolean;
  cloudNative: boolean;
  mobileApp: boolean;
  whatsAppIntegration: boolean;
  languages: string[];
  countries: string[];
  demoUrl?: string;
  documentation?: string;
}

export const MarketplacePage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localSearchInput, setLocalSearchInput] = useState<string>('');
  const [sidebarFilters, setSidebarFilters] = useState<MarketplaceFilterState>(INITIAL_FILTER_STATE);
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState<boolean>(false);

  // Backend integration states
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Comparison engine state
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const handleToggleCompare = useCallback((product: MarketplaceProduct) => {
    setCompareProductIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 products at a time.');
        return prev;
      }
      return [...prev, product.id];
    });
  }, []);

  const selectedCompareProducts = useMemo(() => {
    return products.filter((p) => compareProductIds.includes(p.id));
  }, [products, compareProductIds]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    const productParam = urlParams.get('product') || urlParams.get('id');

    if (categoryParam) setActiveCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
    else if (productParam) setSearchQuery(productParam.trim());

    if (searchParam || productParam) {
      setTimeout(() => {
        const catalogElem = document.getElementById('marketplace-catalog');
        if (catalogElem) {
          catalogElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }, []);

  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  // Compute active sidebar filter count
  const activeSidebarFilterCount = useMemo(() => {
    let count = 0;
    if (sidebarFilters.industries.length > 0) count += sidebarFilters.industries.length;
    if (sidebarFilters.businessSizes.length > 0) count += sidebarFilters.businessSizes.length;
    if (sidebarFilters.deployments.length > 0) count += sidebarFilters.deployments.length;
    if (sidebarFilters.maxPrice < 150) count += 1;
    if (sidebarFilters.pricingTypes.length > 0) count += sidebarFilters.pricingTypes.length;
    if (sidebarFilters.platforms.length > 0) count += sidebarFilters.platforms.length;
    if (sidebarFilters.features.length > 0) count += sidebarFilters.features.length;
    if (sidebarFilters.aiPoweredOnly) count += 1;
    if (sidebarFilters.apiAvailableOnly) count += 1;
    if (sidebarFilters.cloudNativeOnly) count += 1;
    if (sidebarFilters.mobileAppOnly) count += 1;
    if (sidebarFilters.whatsAppIntegrationOnly) count += 1;
    if (sidebarFilters.languages.length > 0) count += sidebarFilters.languages.length;
    if (sidebarFilters.countries.length > 0) count += sidebarFilters.countries.length;
    return count;
  }, [sidebarFilters]);

  // ── REAL BACKEND DATA FETCHING WITH QUERY FILTRATION ──
  const fetchProductsFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sidebarFilters.maxPrice < 150) params.append('maxPrice', String(sidebarFilters.maxPrice));
      if (sidebarFilters.aiPoweredOnly) params.append('aiPowered', 'true');
      if (sidebarFilters.apiAvailableOnly) params.append('apiAvailable', 'true');
      if (sidebarFilters.cloudNativeOnly) params.append('cloudNative', 'true');
      if (sidebarFilters.mobileAppOnly) params.append('mobileApp', 'true');
      if (sidebarFilters.whatsAppIntegrationOnly) params.append('whatsAppIntegration', 'true');

      if (sidebarFilters.industries.length > 0) params.append('industries', sidebarFilters.industries.join(','));
      if (sidebarFilters.businessSizes.length > 0) params.append('businessSizes', sidebarFilters.businessSizes.join(','));
      if (sidebarFilters.deployments.length > 0) params.append('deployments', sidebarFilters.deployments.join(','));
      if (sidebarFilters.pricingTypes.length > 0) params.append('pricingTypes', sidebarFilters.pricingTypes.join(','));
      if (sidebarFilters.platforms.length > 0) params.append('platforms', sidebarFilters.platforms.join(','));
      if (sidebarFilters.features.length > 0) params.append('features', sidebarFilters.features.join(','));
      if (sidebarFilters.languages.length > 0) params.append('languages', sidebarFilters.languages.join(','));
      if (sidebarFilters.countries.length > 0) params.append('countries', sidebarFilters.countries.join(','));

      const response = await apiFetch(`/products?${params.toString()}`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
      }
    } catch (_err) {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery, sidebarFilters]);

  // Fetch real data on filter/search state changes
  useEffect(() => {
    fetchProductsFromBackend();
  }, [fetchProductsFromBackend]);

  // Debounce searchQuery for backend API requests (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchInput]);

  const handleSearchChange = (query: string) => {
    setLocalSearchInput(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLocalSearchInput('');
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setLocalSearchInput('');
    setActiveCategory('all');
    setSidebarFilters(INITIAL_FILTER_STATE);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Lighting & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-500/10 via-cyan-500/10 dark:from-blue-600/15 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b05_1px,transparent_1px),linear-gradient(to_bottom,#1e293b05_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-4"
      >
        
        {/* ── 1. PREMIUM MARKETPLACE HERO SECTION ── */}
        <MarketplaceHero
          searchQuery={searchQuery}
          onSearch={handleSearchChange}
          products={products}
          onSelectProduct={(product) => {
            handleSearchChange(product.title);
            const gridElem = document.getElementById('catalog-grid-top');
            if (gridElem) gridElem.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ── 2. HORIZONTAL CATEGORY NAVIGATION & INLINE SEARCH BAR ── */}
        <section id="catalog-grid" className="mb-8 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          
          {/* Horizontal Category Navigation */}
          <MarketplaceCategoryNav
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Inline Catalog Search Bar */}
          <div className="max-w-3xl mx-auto flex items-center gap-3 mt-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Instant search by product name, category, industry, tags, or features..."
                value={localSearchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-cyan-400/50 text-xs shadow-md transition-all font-medium"
              />
              {localSearchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                  <Filter className="w-3 h-3" />
                  <span>Backend Sync</span>
                </div>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs shadow-md shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Filters</span>
              {activeSidebarFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px]">
                  {activeSidebarFilterCount}
                </span>
              )}
            </button>
          </div>

        </section>

        {/* ── 3. MAIN CATALOG CONTENT (REAL BACKEND DATA FILTRATION GRID) ── */}
        <section id="marketplace-catalog" className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT DESKTOP STICKY FILTER SIDEBAR ── */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24 z-20 self-start">
              <MarketplaceFilterSidebar
                filters={sidebarFilters}
                onFilterChange={setSidebarFilters}
                onResetFilters={() => setSidebarFilters(INITIAL_FILTER_STATE)}
                activeCount={activeSidebarFilterCount}
              />
            </div>

            {/* ── RIGHT PRODUCTS CATALOG GRID ── */}
            <div className="lg:col-span-9">

              {/* Status Header Bar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <span>Catalog Products</span>
                  </h2>
                  
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-extrabold text-xs">
                    {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                  </span>
                </div>

                {/* Active Filters Summary Pills */}
                {(searchQuery || activeSidebarFilterCount > 0 || activeCategory !== 'all') && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {activeCategory !== 'all' && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-300 font-bold flex items-center gap-1">
                        Category: {activeCategory}
                        <button type="button" onClick={() => setActiveCategory('all')} className="hover:text-rose-500 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {searchQuery && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-400/30 text-purple-600 dark:text-purple-300 font-bold flex items-center gap-1">
                        "{searchQuery}"
                        <button type="button" onClick={clearSearch} className="hover:text-rose-500 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {activeSidebarFilterCount > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-300 font-bold">
                        {activeSidebarFilterCount} Sidebar {activeSidebarFilterCount === 1 ? 'Filter' : 'Filters'} Active
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline cursor-pointer ml-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset All</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── RESPONSIVE MARKETPLACE PRODUCT GRID WITH SORTING & PAGINATION ── */}
              <MarketplaceProductGrid
                products={products}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onDemoClick={(product) => {
                  if (product?.demoUrl) {
                    const targetUrl = product.demoUrl.startsWith('http') ? product.demoUrl : `https://${product.demoUrl}`;
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    navigateTo('/book-demo');
                  }
                }}
                onViewDetailsClick={(product) => navigateTo(`/product-detail?id=${product.id}`)}
                onResetAllFilters={resetAllFilters}
                compareProductIds={compareProductIds}
                onToggleCompare={handleToggleCompare}
              />
            </div>

          </div>
        </section>

        {/* ── FLOATING COMPARE BAR & COMPARISON MATRIX MODAL ── */}
        <MarketplaceCompareBar
          selectedProducts={selectedCompareProducts}
          onOpenCompareModal={() => setIsCompareModalOpen(true)}
          onRemoveProduct={(id) => setCompareProductIds((prev) => prev.filter((pId) => pId !== id))}
          onClearAll={() => setCompareProductIds([])}
        />

        <ProductCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          selectedProducts={selectedCompareProducts}
          allProducts={products}
          onRemoveProduct={(id) => setCompareProductIds((prev) => prev.filter((pId) => pId !== id))}
          onAddProduct={(prod) => {
            if (compareProductIds.length < 3) {
              setCompareProductIds((prev) => [...prev, prod.id]);
            }
          }}
          onClearAll={() => setCompareProductIds([])}
        />

        {/* ── MOBILE FILTER DRAWER OVERLAY ── */}
        <AnimatePresence>
          {mobileFilterDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xs h-full bg-white dark:bg-slate-900 p-4 overflow-y-auto shadow-2xl z-10"
              >
                <MarketplaceFilterSidebar
                  filters={sidebarFilters}
                  onFilterChange={setSidebarFilters}
                  onResetFilters={() => setSidebarFilters(INITIAL_FILTER_STATE)}
                  onCloseMobile={() => setMobileFilterDrawerOpen(false)}
                  activeCount={activeSidebarFilterCount}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 4. PREMIUM MARKETPLACE CATALOG CTA SECTION ── */}
        <MarketplaceCTASection />

      </motion.main>
    </div>
  );
};

export default MarketplacePage;
