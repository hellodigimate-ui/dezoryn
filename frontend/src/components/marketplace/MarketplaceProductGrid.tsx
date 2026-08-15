import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Search,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import type { MarketplaceProduct } from './MarketplacePage';
import { MarketplaceProductCard } from './MarketplaceProductCard';

interface MarketplaceProductGridProps {
  products: MarketplaceProduct[];
  isLoading: boolean;
  searchQuery?: string;
  onDemoClick?: (product: MarketplaceProduct) => void;
  onViewDetailsClick?: (product: MarketplaceProduct) => void;
  onResetAllFilters?: () => void;
  compareProductIds?: string[];
  onToggleCompare?: (product: MarketplaceProduct) => void;
}

export type SortOption = 'featured' | 'rating_desc' | 'price_asc' | 'price_desc' | 'newest';

// ── SKELETON LOADER CARD FOR LAZY LOADING ──
const MarketplaceCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs animate-pulse space-y-5 text-left relative overflow-hidden">
    <div className="w-full h-44 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700/80 dark:to-slate-800 rounded-2xl animate-shimmer" />
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="w-14 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="w-4/5 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    </div>
    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
      <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
    </div>
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
      <div className="flex-1 h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="flex-1 h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

// Staggered motion container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

export const MarketplaceProductGrid: React.FC<MarketplaceProductGridProps> = ({
  products,
  isLoading,
  searchQuery = '',
  onDemoClick,
  onViewDetailsClick,
  onResetAllFilters,
  compareProductIds = [],
  onToggleCompare
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);

  // 1. SORTING LOGIC
  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortOption) {
      case 'rating_desc':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price_asc':
        return list.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
      case 'price_desc':
        return list.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
      case 'newest':
        return list.sort((_a, b) => (b.id === 'mfg-pro' ? 1 : -1));
      case 'featured':
      default:
        return list.sort((_a, b) => (b.badge === 'FEATURED' ? 1 : -1));
    }
  }, [products, sortOption]);

  // Reset to page 1 whenever sort option or product list length changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products.length, sortOption]);

  // 2. PAGINATION CALCULATIONS
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const gridElem = document.getElementById('catalog-grid-top');
      if (gridElem) {
        gridElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div id="catalog-grid-top" className="w-full space-y-6">
      
      {/* ── SORTING, PAGINATION SIZE & STATUS BAR ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Showing {sortedProducts.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} Software
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Items Per Page Selector */}
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={4}>4 per page</option>
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={16}>16 per page</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs px-3 py-1.5 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="featured">Featured & Popular</option>
              <option value="rating_desc">Highest Rated (5.0 ★)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── SPACIOUS RESPONSIVE GRID (DESKTOP: 3 COLS WITH SIDEBAR, TABLET: 2 COLS, MOBILE: 1 COL) ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <MarketplaceCardSkeleton key={idx} />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="text-center py-16 px-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No matching software products found</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              We couldn't find any software matching <span className="font-bold text-slate-800 dark:text-slate-200">"{searchQuery}"</span>. Try adjusting your sort options or resetting category filters.
            </p>

            {onResetAllFilters && (
              <button
                type="button"
                onClick={onResetAllFilters}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Search Filters</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`page-${currentPage}-${sortOption}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {paginatedProducts.map((product) => (
              <MarketplaceProductCard
                key={product.id}
                product={product}
                onDemoClick={onDemoClick}
                onViewDetailsClick={onViewDetailsClick}
                onToggleCompare={onToggleCompare}
                isCompared={compareProductIds ? compareProductIds.includes(product.id) : false}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGINATION CONTROLS FOOTER ── */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex-wrap gap-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;

                return (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-600 shadow-md shadow-blue-500/25'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketplaceProductGrid;
