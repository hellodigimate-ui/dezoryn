import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Play,
  Zap,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Cpu,
  FileText,
  AlertTriangle,
  RefreshCw,
  BadgeDollarSign,
  Store,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';
import { useNavigation } from '../../utils/NavigationContext';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export interface ProductDetailData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryLabel: string;
  industry: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  price: string;
  priceValue: number;
  aiPowered: boolean;
  cloudNative: boolean;
  shortDesc: string;
  overviewText: string;
  impactMetrics: { label: string; value: string; desc: string }[];
  galleryScreenshots: { id: string; title: string; subtitle: string; tag: string; url?: string }[];
  videoTour?: { title: string; duration: string; thumbnail?: string; videoUrl?: string };
  featuresList: { title: string; desc: string; icon: string }[];
  pricingTiers: { name: string; price: string; period: string; popular?: boolean; features: string[]; ctaText: string }[];
  technicalSpecs: { category: string; specs: { name: string; value: string }[] }[];
  faqs: { question: string; answer: string }[];
  customerReviews: { name: string; role: string; company: string; rating: number; date: string; title: string; review: string; verified: boolean }[];
  relatedProducts: { id: string; title: string; category: string; price: string; rating: number; shortDesc: string }[];
}

export function normalizeProductId(rawId?: string): string {
  if (!rawId) return '';
  return String(rawId).trim();
}

export function formatTitleFromId(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function buildProductDetailFromDb(apiProd: any): ProductDetailData {
  const id = apiProd.id || '';
  const title = apiProd.title || apiProd.name || formatTitleFromId(id);
  const category = apiProd.category || 'erp';
  const categoryLabel = apiProd.categoryLabel || apiProd.category || 'Software Solution';
  const industry = apiProd.industry || categoryLabel;
  const badge = apiProd.badge || '';
  const rating = Number(apiProd.rating) || 5.0;
  const reviewsCount = Number(apiProd.reviewsCount) || 0;
  const price = apiProd.price || (apiProd.priceValue ? `From ₹${apiProd.priceValue}/mo` : '');
  const priceValue = Number(apiProd.priceValue) || 0;
  const aiPowered = Boolean(apiProd.aiPowered);
  const cloudNative = Boolean(apiProd.cloudNative);
  const shortDesc = apiProd.shortDesc || apiProd.description || '';
  const overviewText = apiProd.description || apiProd.shortDesc || '';

  // Gallery screenshots from real database records only
  const rawGallery = Array.isArray(apiProd.gallery) ? apiProd.gallery : [];
  const galleryScreenshots = rawGallery.map((imgUrl: string, idx: number) => ({
    id: String(idx + 1),
    title: `${title} - Screenshot ${idx + 1}`,
    subtitle: `Module and interface view for ${title}.`,
    tag: `VIEW ${idx + 1}`,
    url: imgUrl
  }));

  // Video Tour from real database records only
  const videoTour = (apiProd.videoUrl || apiProd.coverPhoto)
    ? {
        title: `Watch ${title} Guided Product Overview`,
        duration: 'Product Tour',
        thumbnail: apiProd.coverPhoto || apiProd.thumbnail || apiProd.image,
        videoUrl: apiProd.videoUrl
      }
    : undefined;

  // Features List from real database records only
  const rawFeatures = Array.isArray(apiProd.features) ? apiProd.features : [];
  const featuresList = rawFeatures.map((f: any) =>
    typeof f === 'string'
      ? { title: f, desc: `Capability module for ${f}.`, icon: 'Zap' }
      : f
  );

  // Pricing Tiers from real database records only
  const rawTiers = Array.isArray(apiProd.pricingTiers) ? apiProd.pricingTiers : [];
  const pricingTiers = rawTiers;

  // Technical Specs from real database records only
  let technicalSpecs: { category: string; specs: { name: string; value: string }[] }[] = [];
  if (typeof apiProd.specifications === 'string' && apiProd.specifications.trim()) {
    try {
      const parsed = JSON.parse(apiProd.specifications);
      if (Array.isArray(parsed)) technicalSpecs = parsed;
    } catch (_e) {
      technicalSpecs = [
        {
          category: 'Platform Specifications',
          specs: [
            { name: 'Specifications', value: apiProd.specifications },
            ...(Array.isArray(apiProd.deployment) && apiProd.deployment.length > 0 ? [{ name: 'Deployment', value: apiProd.deployment.join(', ') }] : []),
            ...(Array.isArray(apiProd.platforms) && apiProd.platforms.length > 0 ? [{ name: 'Supported Platforms', value: apiProd.platforms.join(', ') }] : [])
          ]
        }
      ];
    }
  } else if (Array.isArray(apiProd.specifications)) {
    technicalSpecs = apiProd.specifications;
  }

  // FAQs from real database records only
  const rawFaqs = Array.isArray(apiProd.faqs) ? apiProd.faqs : [];
  const faqs = rawFaqs;

  // Customer Reviews from real database records only
  const rawReviews = Array.isArray(apiProd.customerReviews) ? apiProd.customerReviews : [];
  const customerReviews = rawReviews;

  // Impact Metrics from real database records only
  const impactMetrics: { label: string; value: string; desc: string }[] = [];
  if (reviewsCount > 0) {
    impactMetrics.push({
      label: 'Verified Rating',
      value: `${rating}/5.0`,
      desc: `${reviewsCount.toLocaleString()} customer reviews`
    });
  }
  if (price) {
    impactMetrics.push({
      label: 'Starting Price',
      value: price,
      desc: 'Base subscription tier'
    });
  }
  if (apiProd.industry) {
    impactMetrics.push({
      label: 'Industry Domain',
      value: apiProd.industry,
      desc: 'Specialized enterprise vertical'
    });
  }

  return {
    id,
    title,
    subtitle: apiProd.subtitle || '',
    category,
    categoryLabel,
    industry,
    badge,
    rating,
    reviewsCount,
    price,
    priceValue,
    aiPowered,
    cloudNative,
    shortDesc,
    overviewText,
    impactMetrics,
    galleryScreenshots,
    videoTour,
    featuresList,
    pricingTiers,
    technicalSpecs,
    faqs,
    customerReviews,
    relatedProducts: []
  };
}

// ── HIGH PERFORMANCE HTML5 VIDEO PLAYER COMPONENT ──
const VideoPlayerContainer: React.FC<{
  videoUrl: string;
  posterUrl?: string;
  title: string;
  duration?: string;
}> = ({ videoUrl, posterUrl, title, duration }) => {
  const resolvedUrl = resolveMediaUrl(videoUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasError(false);
      }).catch(() => {
        setHasError(true);
      });
    }
  };

  return (
    <div className="relative w-full h-[240px] sm:h-[420px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group select-none">
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-bold text-slate-300">Loading video stream...</span>
        </div>
      )}

      {hasError ? (
        <div className="p-6 text-center space-y-3 z-20 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-extrabold text-white">Video Stream Unavailable</h4>
          <p className="text-xs text-slate-400">
            Unable to load video stream for <span className="text-white font-bold">{title}</span>. Please verify your connection or try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => setHasError(true));
              }
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-cyan-300 border border-slate-700 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={resolvedUrl}
            poster={posterUrl}
            controls
            autoPlay
            playsInline
            preload="auto"
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onPlaying={() => {
              setIsLoading(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className="w-full h-full object-contain bg-black"
          />

          {!isPlaying && !isLoading && (
            <div
              onClick={handlePlayClick}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-slate-950/30 transition"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 flex items-center justify-center shadow-2xl shadow-cyan-500/40 transition transform hover:scale-105">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
              </div>
              <div className="text-sm font-extrabold text-white mt-3">Click to Start Walkthrough</div>
              {duration && <div className="text-xs font-mono text-cyan-300 mt-1">Duration: {duration}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── SKELETON LOADER FOR PRODUCT DETAIL PAGE ──
const ProductDetailSkeleton: React.FC = () => (
  <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-8 animate-pulse space-y-8">
    <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    <div className="space-y-4 max-w-3xl">
      <div className="flex gap-3">
        <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="w-28 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="w-full h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-8">
        <div className="w-full h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
      <div className="lg:col-span-4">
        <div className="w-full h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    </div>
  </div>
);

export const ProductDetailPage: React.FC<{ productId?: string }> = ({ productId }) => {
  const { navigateTo } = useNavigation();

  const activeId = useMemo(() => {
    const raw = productId || new URLSearchParams(window.location.search).get('id') || new URLSearchParams(window.location.search).get('productId');
    return normalizeProductId(raw || '');
  }, [productId]);

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (product) {
      navigateTo(`/marketplace?product=${encodeURIComponent(product.id)}`);
    } else {
      navigateTo('/marketplace');
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (!activeId) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsNotFound(false);

    const fetchBackendProduct = async () => {
      try {
        const res = await apiFetch(`/products/${encodeURIComponent(activeId)}`);
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          const detail = buildProductDetailFromDb(result.data);
          setProduct(detail);
          setIsNotFound(false);
        } else {
          setProduct(null);
          setIsNotFound(true);
        }
      } catch (_err) {
        setProduct(null);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendProduct();
  }, [activeId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b05_1px,transparent_1px),linear-gradient(to_bottom,#1e293b05_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      {/* ── 1. LOADING STATE ── */}
      {isLoading && <ProductDetailSkeleton />}

      {/* ── 2. PRODUCT NOT FOUND (EMPTY/DELETED) STATE ── */}
      {!isLoading && (isNotFound || !product) && (
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="max-w-xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-500">
              <Store className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Marketplace Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4 mb-3 tracking-tight">
              Product Not Found
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed mb-8">
              The requested product <span className="font-bold text-slate-800 dark:text-slate-200">"{activeId}"</span> does not exist in the database or has been removed from the catalog.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo('/marketplace')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                <Store className="w-4 h-4" />
                <span>Browse Marketplace Catalog</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ── 3. PRODUCT FOUND & RENDERED FROM DATABASE ── */}
      {!isLoading && product && !isNotFound && (
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
          
          {/* ── BREADCRUMBS & BACK BUTTON ── */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigateTo('/marketplace');
                }
              }}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace Catalog</span>
            </button>

            <div className="flex items-center gap-2 text-slate-400">
              <span onClick={() => navigateTo('/marketplace')} className="hover:underline cursor-pointer">Marketplace</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300">{product.categoryLabel}</span>
              <span>/</span>
              <span className="text-blue-600 dark:text-cyan-400 font-black">{product.title}</span>
            </div>
          </div>

          {/* ── SECTION 1: HERO SECTION ── */}
          <section className="mb-12">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  {product.badge && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-black text-xs uppercase tracking-wider">
                      {product.badge}
                    </span>
                  )}

                  <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 border border-slate-700 text-slate-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verified Software</span>
                  </span>

                  {product.price && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                      <BadgeDollarSign className="w-3.5 h-3.5" />
                      <span>{product.price}</span>
                    </div>
                  )}

                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      {product.reviewsCount > 0 && (
                        <span className="text-slate-400 font-medium">({product.reviewsCount} verified reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">
                  {product.title}
                </h1>
                
                {product.subtitle && (
                  <p className="text-lg font-bold text-blue-600 dark:text-cyan-300 mb-4">
                    {product.subtitle}
                  </p>
                )}

                {product.shortDesc && (
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6">
                    {product.shortDesc}
                  </p>
                )}

                {/* Quick Highlight Pills */}
                <div className="flex flex-wrap gap-3">
                  {['Enterprise Ready', 'Cloud Deployment', 'RBAC Security', 'Direct Support'].map((pill) => (
                    <span key={pill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{pill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── MAIN CONTENT (2-COLUMN GRID WITH STICKY RIGHT SIDEBAR) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* ── LEFT MAIN SECTION COLUMN (8 COLS) ── */}
            <div className="lg:col-span-8 space-y-14">

              {/* ── SECTION 2 & 3: GALLERY & VIDEO TOUR ── */}
              {(product.galleryScreenshots.length > 0 || product.videoTour?.videoUrl) && (
                <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl backdrop-blur-xl">
                  
                  {/* Main Screenshot Stage */}
                  <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden mb-4 group">
                    {product.galleryScreenshots[activeScreenshotIdx]?.url || product.videoTour?.thumbnail ? (
                      <div className="relative w-full h-full">
                        <img
                          src={resolveMediaUrl(product.galleryScreenshots[activeScreenshotIdx]?.url || product.videoTour?.thumbnail || '')}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                          {product.videoTour?.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setIsVideoModalOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Watch Product Tour</span>
                            </button>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white font-mono bg-slate-950/80 px-4 py-2 rounded-xl backdrop-blur-md border border-slate-800">
                          <span className="font-extrabold text-cyan-300">{product.title}</span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {product.galleryScreenshots[activeScreenshotIdx]?.tag || 'PREVIEW'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="ml-2 text-xs font-mono text-slate-400">https://app.dezoryn.com/{product.id}/preview</span>
                          </div>

                          {product.videoTour?.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setIsVideoModalOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Watch Product Tour</span>
                            </button>
                          )}
                        </div>

                        <div className="my-auto text-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800/90 max-w-xl mx-auto backdrop-blur-md shadow-2xl">
                          <span className="px-2.5 py-1 rounded bg-blue-500/20 text-cyan-300 font-extrabold text-[10px] uppercase border border-cyan-400/30">
                            {product.galleryScreenshots[activeScreenshotIdx]?.tag || 'VIEW'}
                          </span>
                          <h3 className="text-xl font-black text-white mt-2 mb-1">
                            {product.galleryScreenshots[activeScreenshotIdx]?.title || product.title}
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">
                            {product.galleryScreenshots[activeScreenshotIdx]?.subtitle || product.shortDesc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                          <span>Live Production Cluster</span>
                          <span>Interface Preview</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gallery Thumbnails Selector */}
                  {product.galleryScreenshots.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {product.galleryScreenshots.map((shot, idx) => {
                        const isActive = idx === activeScreenshotIdx;
                        return (
                          <button
                            key={shot.id}
                            type="button"
                            onClick={() => setActiveScreenshotIdx(idx)}
                            className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer overflow-hidden ${
                              isActive
                                ? 'bg-blue-50 dark:bg-cyan-500/10 border-blue-600 dark:border-cyan-400 shadow-md'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {shot.url && (
                              <div className="w-full h-14 rounded-xl overflow-hidden mb-1.5 bg-slate-950">
                                <img
                                  src={resolveMediaUrl(shot.url)}
                                  alt={shot.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                              {shot.tag}
                            </div>
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {shot.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ── SECTION 4: OVERVIEW & IMPACT METRICS ── */}
              {product.overviewText && (
                <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                    <span>Executive Overview</span>
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-8">
                    {product.overviewText}
                  </p>

                  {/* Impact Metrics Cards */}
                  {product.impactMetrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {product.impactMetrics.map((metric, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left">
                          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-cyan-300 mb-1">
                            {metric.value}
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">
                            {metric.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
                            {metric.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── SECTION 5: FEATURES GRID ── */}
              {product.featuresList.length > 0 && (
                <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-cyan-400" />
                    <span>Core Capabilities & Features</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.featuresList.map((feat, idx) => (
                      <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition text-left flex items-start gap-5 group">
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-300 shrink-0 shadow-md transition-transform group-hover:scale-110">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">
                            {feat.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            {feat.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 6: PRICING TIERS & PLANS ── */}
              {product.pricingTiers.length > 0 && (
                <section id="pricing" className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative scroll-mt-24">
                  <div className="text-left mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                      <BadgeDollarSign className="w-4 h-4" />
                      <span>Subscription Plans</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      Transparent Pricing
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {product.pricingTiers.map((tier, idx) => {
                      const isPopular = tier.popular;
                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                            isPopular
                              ? 'bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-slate-900/50 dark:to-slate-900/90 border-2 border-blue-500 dark:border-cyan-400 shadow-xl shadow-cyan-500/10 scale-102'
                              : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {isPopular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                              Most Popular
                            </span>
                          )}

                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                              {tier.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-cyan-400">
                                {tier.price}
                              </span>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {tier.period}
                              </span>
                            </div>

                            <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300">
                              {tier.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="font-semibold">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigateTo(`/book-demo?product=${encodeURIComponent(product.id)}&plan=${encodeURIComponent(tier.name)}`)}
                            className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                              isPopular
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700'
                            }`}
                          >
                            <span>{tier.ctaText || 'Get Started'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── SECTION 7: TECHNICAL SPECIFICATIONS ── */}
              {product.technicalSpecs.length > 0 && (
                <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-purple-400" />
                    <span>Technical Specifications & Compliance</span>
                  </h2>

                  <div className="space-y-6">
                    {product.technicalSpecs.map((cat, idx) => (
                      <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {cat.category}
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {cat.specs.map((spec, sIdx) => (
                            <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-2 p-4 text-xs">
                              <span className="font-bold text-slate-500 dark:text-slate-400">{spec.name}</span>
                              <span className="font-extrabold text-slate-900 dark:text-white">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 8: PRODUCT FAQS ── */}
              {product.faqs.length > 0 && (
                <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-blue-500" />
                    <span>Frequently Asked Questions</span>
                  </h2>

                  <div className="space-y-3">
                    {product.faqs.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-left">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                            className="w-full p-4 flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
                              >
                                {faq.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── SECTION 9: CUSTOMER REVIEWS ── */}
              {product.customerReviews.length > 0 && (
                <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-amber-500" />
                        <span>Customer Reviews</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="text-xl font-black text-amber-500">{product.rating}</span>
                      <span className="text-xs font-bold text-slate-400">/ 5.0 Rating</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.customerReviews.map((rev, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1 text-amber-400">
                              {Array.from({ length: Math.min(5, Math.max(1, rev.rating || 5)) }).map((_, rIdx) => (
                                <Star key={rIdx} className="w-4 h-4 fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">{rev.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
                            "{rev.review}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{rev.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{rev.role} • {rev.company}</div>
                          </div>
                          {rev.verified && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase border border-emerald-500/20">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 10: PRODUCT CONVERSION CTA BANNER ── */}
              <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-12 text-white text-center shadow-2xl">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
                  Ready to explore {product.title}?
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
                  Discover the platform, explore available plans in the Marketplace, or schedule a live walkthrough with our team.
                </p>
                <div className="flex flex-wrap items-center gap-4 justify-center">
                  <button
                    type="button"
                    onClick={scrollToPricing}
                    className="px-7 py-4 rounded-full bg-white text-blue-600 font-extrabold text-xs shadow-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2 border-none"
                  >
                    <span>View Pricing & Plans</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(`/book-demo?product=${encodeURIComponent(product.id)}`)}
                    className="px-7 py-4 rounded-full bg-blue-900/60 hover:bg-blue-900 text-white font-extrabold text-xs border border-blue-400/40 transition cursor-pointer flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-cyan-300" />
                    <span>Schedule a Demo</span>
                  </button>
                </div>
              </section>

            </div>

            {/* ── RIGHT STICKY SIDEBAR (4 COLS) ── */}
            <div className="lg:col-span-4 sticky top-24 z-20 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xl backdrop-blur-xl text-left space-y-6">
                
                {/* Sidebar Header */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-extrabold text-[10px] uppercase tracking-wider">
                    {product.categoryLabel}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 mb-1">
                    {product.title}
                  </h3>
                  {product.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                      {product.subtitle}
                    </p>
                  )}
                </div>

                {/* Sidebar Pricing Callout */}
                {product.price && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-slate-700/80 text-left">
                    <div className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                      Starting Subscription
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {product.price}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons Stack */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={scrollToPricing}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 border-none"
                  >
                    <span>View Pricing & Plans</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo(`/book-demo?product=${encodeURIComponent(product.id)}`)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 border-none"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule a Demo</span>
                  </button>
                </div>

                {/* Quick Spec List */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instant Sandbox Access</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>14-Day Risk-Free Trial</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>SOC 2 Type II Certified</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </main>
      )}

      {/* ── DEMO VIDEO MODAL ── */}
      <AnimatePresence>
        {isVideoModalOpen && product?.videoTour?.videoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl z-10 text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="font-extrabold text-white text-base flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  <span>{product.title} Guided Interactive Tour</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <VideoPlayerContainer
                videoUrl={product.videoTour.videoUrl}
                posterUrl={product.videoTour?.thumbnail}
                title={product.title}
                duration={product.videoTour?.duration}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
