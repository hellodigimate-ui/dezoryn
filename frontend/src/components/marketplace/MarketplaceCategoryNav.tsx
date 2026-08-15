import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Building2,
  Boxes,
  Cross,
  GraduationCap,
  BadgeDollarSign,
  Factory,
  ShoppingBag,
  Home,
  Zap,
  Package,
  Users2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface MarketplaceCategoryNavProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CATEGORIES_LIST: CategoryItem[] = [
  { id: 'all', label: 'All', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'crm', label: 'CRM', icon: <Building2 className="w-4 h-4" /> },
  { id: 'erp', label: 'ERP', icon: <Boxes className="w-4 h-4" /> },
  { id: 'healthcare', label: 'Healthcare', icon: <Cross className="w-4 h-4" /> },
  { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'finance', label: 'Finance', icon: <BadgeDollarSign className="w-4 h-4" /> },
  { id: 'manufacturing', label: 'Manufacturing', icon: <Factory className="w-4 h-4" /> },
  { id: 'retail', label: 'Retail', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'realestate', label: 'Real Estate', icon: <Home className="w-4 h-4" /> },
  { id: 'ai', label: 'AI Products', icon: <Zap className="w-4 h-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
  { id: 'hrms', label: 'HRMS', icon: <Users2 className="w-4 h-4" /> },
  { id: 'more', label: 'More', icon: <MoreHorizontal className="w-4 h-4" /> },
];

export const MarketplaceCategoryNav: React.FC<MarketplaceCategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative max-w-full my-6 select-none group/nav">
      
      {/* Desktop Scroll Left Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 items-center justify-center transition opacity-0 group-hover/nav:opacity-100 cursor-pointer"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Desktop Scroll Right Button */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 items-center justify-center transition opacity-0 group-hover/nav:opacity-100 cursor-pointer"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Edge Gradient Mask for Horizontal Scroll (Mobile & Desktop) */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10" />

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES_LIST.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = categoryCounts ? categoryCounts[cat.id] : undefined;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 snap-start cursor-pointer border shrink-0 ${
                isActive
                  ? 'text-white dark:text-cyan-300 border-blue-600 dark:border-cyan-400 shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-cyan-400/60 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
              }`}
            >
              {/* Active Sliding Background Pill (Framer Motion layoutId) */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-600/90 dark:to-cyan-500/30 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className={`transition-transform duration-200 ${isActive ? 'scale-110 text-white dark:text-cyan-300' : 'text-slate-400'}`}>
                {cat.icon}
              </span>

              <span>{cat.label}</span>

              {typeof count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white dark:text-cyan-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceCategoryNav;
