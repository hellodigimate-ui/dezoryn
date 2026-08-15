import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import type { MarketplaceProduct } from './MarketplacePage';

interface MarketplaceCompareBarProps {
  selectedProducts: MarketplaceProduct[];
  onOpenCompareModal: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export const MarketplaceCompareBar: React.FC<MarketplaceCompareBarProps> = ({
  selectedProducts,
  onOpenCompareModal,
  onRemoveProduct,
  onClearAll
}) => {
  if (selectedProducts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-3xl p-3.5 sm:p-4 backdrop-blur-xl flex items-center justify-between gap-4 text-white text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-cyan-300 shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-2xl shrink-0 text-xs font-bold"
              >
                <span className="truncate max-w-[120px] text-white">{p.title}</span>
                <button
                  type="button"
                  onClick={() => onRemoveProduct(p.id)}
                  className="text-slate-400 hover:text-rose-400 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="hidden sm:inline-block text-xs font-bold text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onOpenCompareModal}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center gap-1.5 border-none shrink-0"
          >
            <span>Compare Now ({selectedProducts.length}/3)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketplaceCompareBar;
