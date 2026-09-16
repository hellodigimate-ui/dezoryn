import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  Store,
  ChevronDown
} from 'lucide-react';
import type { MarketplaceProduct } from './MarketplacePage';
import { MarketplaceProductCard } from './MarketplaceProductCard';

interface MarketplaceProductGridProps {
  products: MarketplaceProduct[];
  isLoading: boolean;
  searchQuery?: string;
  selectedIndustry?: string;
  onDemoClick?: (product: MarketplaceProduct) => void;
  onViewDetailsClick?: (product: MarketplaceProduct) => void;
  onResetAllFilters?: () => void;
  compareProductIds?: string[];
  onToggleCompare?: (product: MarketplaceProduct) => void;
}

export type SortOption = 'alphabetical' | 'featured' | 'rating_desc' | 'price_asc' | 'price_desc' | 'newest';

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

export const MarketplaceProductGrid: React.FC<MarketplaceProductGridProps> = ({
  products,
  isLoading,
  searchQuery = '',
  selectedIndustry,
  onDemoClick,
  onViewDetailsClick,
  onResetAllFilters,
  compareProductIds = [],
  onToggleCompare
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical');

  // 1. SORTING & NEW RELEASE LAYOUT LOGIC
  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Find the single designated New Release product (marked with 'NEW RELEASE' or newest createdAt)
    const newReleaseCandidate = [...products]
      .filter(p => (p.badge || '').toUpperCase() === 'NEW RELEASE')
      .sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())[0]
      || [...products].sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())[0];

    const newReleaseId = newReleaseCandidate?.id;

    // Separate new release from all other products
    const otherProducts = products.filter(p => p.id !== newReleaseId);

    // Normalize badges: ONLY the top new release retains 'NEW RELEASE'. All others get normal badge.
    const cleanNewRelease: MarketplaceProduct | null = newReleaseCandidate
      ? { ...newReleaseCandidate, badge: 'NEW RELEASE' }
      : null;

    const cleanOthers: MarketplaceProduct[] = otherProducts.map(p => ({
      ...p,
      badge: (p.badge || '').toUpperCase() === 'NEW RELEASE' ? '' : p.badge,
    }));

    let sortedOthers = [...cleanOthers];

    switch (sortOption) {
      case 'rating_desc':
        sortedOthers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_asc':
        sortedOthers.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
        break;
      case 'price_desc':
        sortedOthers.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
        break;
      case 'newest':
        sortedOthers.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
        break;
      case 'featured':
        sortedOthers.sort((a, b) => (b.status === 'Featured' ? 1 : 0) - (a.status === 'Featured' ? 1 : 0));
        break;
      case 'alphabetical':
      default:
        // Strictly alphabetical (A-Z) by title
        sortedOthers.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
        break;
    }

    return cleanNewRelease ? [cleanNewRelease, ...sortedOthers] : sortedOthers;
  }, [products, sortOption]);

  return (
    <div id="catalog-grid-top" className="w-full space-y-6">
      
      {/* ── SORTING & STATUS BAR (ALL AT ONCE, NO PER-PAGE CONFUSION) ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>All Software Modules ({sortedProducts.length})</span>
          </span>
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
            <option value="alphabetical">Alphabetical (A–Z)</option>
            <option value="featured">Featured & Popular</option>
            <option value="newest">Newest Additions</option>
            <option value="rating_desc">Highest Rated (5.0 ★)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── RESPONSIVE GRID (ALL PRODUCTS DISPLAYED AT ONCE) ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <MarketplaceCardSkeleton key={idx} />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-cyan-400">
            {searchQuery ? <Search className="w-8 h-8" /> : <Store className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            {searchQuery
              ? 'No matching software products found'
              : selectedIndustry
              ? `No products available for ${selectedIndustry} yet`
              : 'No products available in catalog'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {searchQuery ? (
              <>We couldn't find any software matching <span className="font-bold text-slate-800 dark:text-slate-200">"{searchQuery}"</span>. Try adjusting your search query or resetting filters.</>
            ) : selectedIndustry ? (
              `We couldn't find any software products under ${selectedIndustry} in our catalog. Explore all products or select another industry vertical.`
            ) : (
              'There are currently no software products published in the marketplace catalog. Please check back soon!'
            )}
          </p>

          {(searchQuery || selectedIndustry) && onResetAllFilters && (
            <button
              type="button"
              onClick={onResetAllFilters}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{selectedIndustry ? 'Explore All Products' : 'Reset All Search Filters'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sortedProducts.map((product) => (
            <MarketplaceProductCard
              key={product.id}
              product={product}
              onDemoClick={onDemoClick}
              onViewDetailsClick={onViewDetailsClick}
              onToggleCompare={onToggleCompare}
              isCompared={compareProductIds ? compareProductIds.includes(product.id) : false}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default MarketplaceProductGrid;
