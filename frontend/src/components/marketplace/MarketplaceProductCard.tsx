import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  Zap,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building2,
  Boxes,
  GraduationCap,
  Cross,
  Users2,
  ShieldCheck,
  BadgeDollarSign,
  Factory,
  Home,
  Truck,
  MessageSquareText,
  BarChart3,
  ShoppingBag
} from 'lucide-react';
import type { MarketplaceProduct } from './MarketplacePage';

interface MarketplaceProductCardProps {
  product: MarketplaceProduct;
  onDemoClick?: (product: MarketplaceProduct) => void;
  onViewDetailsClick?: (product: MarketplaceProduct) => void;
  onToggleWishlist?: (productId: string, isWishlisted: boolean) => void;
  onToggleCompare?: (product: MarketplaceProduct) => void;
  isCompared?: boolean;
}

const renderCategoryIcon = (iconName: string | React.ReactNode) => {
  if (React.isValidElement(iconName)) return iconName;
  switch (iconName) {
    case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-blue-500" />;
    case 'Cross': return <Cross className="w-4 h-4 text-emerald-500" />;
    case 'Users2': return <Users2 className="w-4 h-4 text-purple-500" />;
    case 'Boxes': return <Boxes className="w-4 h-4 text-amber-500" />;
    case 'Zap': return <Zap className="w-4 h-4 text-cyan-500" />;
    case 'Building2': return <Building2 className="w-4 h-4 text-sky-500" />;
    case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
    case 'BadgeDollarSign': return <BadgeDollarSign className="w-4 h-4 text-emerald-600" />;
    case 'Factory': return <Factory className="w-4 h-4 text-indigo-600" />;
    case 'Home': return <Home className="w-4 h-4 text-teal-600" />;
    case 'Truck': return <Truck className="w-4 h-4 text-orange-500" />;
    case 'MessageSquareText': return <MessageSquareText className="w-4 h-4 text-violet-500" />;
    case 'BarChart3': return <BarChart3 className="w-4 h-4 text-teal-500" />;
    case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-pink-500" />;
    default: return <Zap className="w-4 h-4 text-blue-500" />;
  }
};

// Clean preview graphic for product card with Lazy Loading
const ProductScreenshotPreview: React.FC<{ product: MarketplaceProduct }> = ({ product }) => {
  const imageUrl = product.image || product.coverPhoto;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-44 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden rounded-t-3xl border-b border-slate-800/80 group">
      {imageUrl ? (
        <div className="relative w-full h-full overflow-hidden bg-slate-950">
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-800 animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white font-mono bg-slate-950/80 px-3 py-1 rounded-xl backdrop-blur-md border border-slate-700/60">
            <span className="truncate max-w-[150px]">dezoryn.com/{product.id}</span>
            <span className="text-cyan-300 font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/30">
              {product.badge || 'LIVE'}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/25 via-cyan-500/15 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]" />

          {/* Dashboard Preview Graphic */}
          <div className="absolute inset-x-5 bottom-0 top-5 rounded-t-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-3.5 transform group-hover:scale-102 transition-transform duration-500 ease-out flex flex-col justify-between overflow-hidden">
            
            {/* Mock Window Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/90">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-tight ml-1.5 truncate max-w-[140px]">
                  dezoryn.com/{product.id}
                </span>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wide">
                Enterprise v4
              </span>
            </div>

            {/* 2 Spacious Metric Widgets */}
            <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Uptime SLA</div>
                  <div className="text-xs font-black text-emerald-400 mt-0.5">99.99%</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Latency</div>
                  <div className="text-xs font-black text-cyan-300 mt-0.5">&lt; 12ms</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </div>

            {/* Bottom Banner inside Mockup */}
            <div className="flex items-center justify-between bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-bold mt-2">
              <div className="flex items-center gap-1.5 text-cyan-300 truncate">
                {renderCategoryIcon(product.icon)}
                <span className="font-extrabold text-white truncate">{product.title}</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-black shrink-0">
                {product.badge || 'ACTIVE'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const MarketplaceProductCard: React.FC<MarketplaceProductCardProps> = React.memo(({
  product,
  onDemoClick,
  onViewDetailsClick,
  onToggleWishlist,
  onToggleCompare,
  isCompared = false
}) => {
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = (centerY - y) / 22;
    const rotY = (x - centerX) / 22;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleCardMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (onToggleWishlist) {
      onToggleWishlist(product.id, nextState);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/60 dark:hover:border-cyan-400/60 shadow-md hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden relative text-left"
    >
      {/* Glow highlight overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-400/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />

      {/* ── 1. SCREENSHOT HEADER ── */}
      <div className="relative">
        <ProductScreenshotPreview product={product} />

        {/* Floating AI Powered Badge */}
        {product.aiPowered && (
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/50 text-cyan-300 font-extrabold text-[10px] shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI Powered</span>
          </div>
        )}

        {/* Floating Top Right Action Buttons: Compare & Wishlist */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
          {onToggleCompare && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1 ${
                isCompared
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                  : 'bg-slate-950/75 text-slate-300 border-slate-700/80 hover:text-white hover:bg-slate-900'
              }`}
              title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            >
              <span>{isCompared ? '✓ Compared' : '+ Compare'}</span>
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={handleWishlistClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 scale-110'
                : 'bg-slate-950/75 text-slate-300 border-slate-700/80 hover:text-rose-400 hover:bg-slate-900'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white animate-bounce' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* ── 2. CARD CONTENT BODY ── */}
      <div className="p-6 md:p-7 flex-1 flex flex-col justify-between space-y-5">
        <div>
          {/* Category Label & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase tracking-wider truncate">
              {product.industry || product.categoryLabel}
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || 4.9}</span>
              <span className="text-[10px] text-slate-400 font-semibold ml-0.5">
                ({(product.reviewsCount || 1200).toLocaleString()})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors mb-2.5 leading-snug">
            {product.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4 line-clamp-2">
            {product.description || product.shortDesc}
          </p>

          {/* Feature Bullets List */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {Array.isArray(product.features) && product.features.slice(0, 3).map((feat, fIdx) => (
              <div
                key={fIdx}
                className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Starting Price</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {product.price || '₹49/mo'}
            </span>
          </div>

          {/* Action Buttons with Spring Ripples */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onDemoClick ? onDemoClick(product) : undefined}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onViewDetailsClick ? onViewDetailsClick(product) : undefined}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default MarketplaceProductCard;
