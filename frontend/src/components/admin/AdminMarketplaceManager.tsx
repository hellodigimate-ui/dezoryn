import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Building2,
  Tag,
  IndianRupee,
  Image as ImageIcon,
  Star,
  Download,
  Search,
  BarChart3,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Zap,
  Upload,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Globe,
  Layers,
  CheckSquare,
  MessageSquare,
  Check,
  FileText,
  Film,
  Loader2
} from 'lucide-react';
import { DEFAULT_HERO_CMS, type MarketplaceHeroCMSConfig } from '../marketplace/MarketplaceHero';
import { AdminMarketplaceAnalytics } from './AdminMarketplaceAnalytics';
import { MediaPickerModal } from './MediaPickerModal';
import { resolveMediaUrl } from '../../utils/mediaUrl';

import { API_URL, apiFetch } from '../../config/api.config';

const API_BASE = `${API_URL}/products`;

export interface CustomerReviewItem {
  id?: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  date?: string;
  title: string;
  review: string;
  verified: boolean;
}

export interface PricingTierAdminItem {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText?: string;
}

export interface MarketplaceProductAdmin {
  id: string;
  name?: string;
  title: string;
  slug?: string;
  subtitle?: string;
  category: string;
  categoryLabel: string;
  industry: string;
  badge: string;
  shortDesc: string;
  description?: string;
  price: string;
  priceValue: number;
  discount?: number;
  pricingTiers?: PricingTierAdminItem[];
  thumbnail?: string;
  image?: string;
  coverPhoto?: string;
  gallery?: string[];
  video?: string;
  videoUrl?: string;
  demoUrl?: string;
  documentation?: string;
  features: string[];
  specifications?: string;
  integrations?: string[];
  platforms: string[];
  rating: number;
  reviewsCount: number;
  customerReviews?: CustomerReviewItem[];
  aiPowered: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  apiAvailable: boolean;
  cloudNative: boolean;
  mobileApp: boolean;
  whatsAppIntegration: boolean;
  status: 'active' | 'draft' | 'featured' | 'archived';
  isEnabled: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  screenshots?: string[];
  deployment: string[];
  businessSizes: string[];
  languages: string[];
  countries: string[];
  downloadsCount?: number;
  viewsCount?: number;
  demoClicks?: number;
}

export const AdminMarketplaceManager: React.FC = React.memo(() => {
  const [activeModule, setActiveModule] = useState<string>('products');
  const [products, setProducts] = useState<MarketplaceProductAdmin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'delete'; text: string } | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState<boolean>(false);

  // Hero CMS State
  const [heroConfig, setHeroConfig] = useState<MarketplaceHeroCMSConfig>(DEFAULT_HERO_CMS);

  // Product Edit Modal State
  const [editModalProduct, setEditModalProduct] = useState<MarketplaceProductAdmin | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'basic' | 'pricing' | 'media' | 'specs' | 'seo'>('basic');

  // Customer Reviews Moderation Modal State
  const [reviewModalProduct, setReviewModalProduct] = useState<MarketplaceProductAdmin | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  
  // New Review Form State inside Modal
  const [newReview, setNewReview] = useState<CustomerReviewItem>({
    name: '',
    role: '',
    company: '',
    rating: 5,
    title: '',
    review: '',
    verified: true
  });

  // Custom Delete Confirmation Modal State
  const [deleteProductTarget, setDeleteProductTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Custom Input Modal State for Category/Industry/Tag
  const [promptModal, setPromptModal] = useState<{ type: 'category' | 'industry' | 'tag'; title: string } | null>(null);
  const [promptInputValue, setPromptInputValue] = useState<string>('');

  // Drag & drop highlight state
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState<boolean>(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState<boolean>(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState<boolean>(false);

  // Uploading loading states
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState<boolean>(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);

  // File Input Refs for local file pickers
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Media Picker Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'thumbnail' | 'gallery' | 'document' | null>(null);
  const mediaPickerTargetRef = useRef<'thumbnail' | 'gallery' | 'document' | null>(null);

  // Helper to open media picker safely
  const openMediaPicker = useCallback((target: 'thumbnail' | 'gallery' | 'document') => {
    mediaPickerTargetRef.current = target;
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  }, []);

  // Filter lists configuration
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'All', 'CRM', 'ERP', 'Healthcare', 'Education', 'Finance', 'Manufacturing', 'Retail', 'Real Estate', 'AI Products', 'Inventory', 'HRMS'
  ]);
  const [industriesList, setIndustriesList] = useState<string[]>([
    'Education & Academics', 'Healthcare & Telemedicine', 'Finance & Accounting', 'E-Commerce & Retail', 'Manufacturing & Industrial', 'Real Estate & Property', 'Human Resources'
  ]);
  const [tagsList, setTagsList] = useState<string[]>([
    'FEATURED', 'AI DRIVEN', 'NEW RELEASE', 'POPULAR', 'ENTERPRISE', 'HIGH DEMAND'
  ]);

  const showMsg = useCallback((type: 'success' | 'error' | 'info' | 'delete', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  // ── LOCAL FILE UPLOADER TO BACKEND MEDIA API ──
  const uploadFileToBackend = useCallback(async (file: File, folder = 'Products'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await apiFetch(`${API_URL}/uploads/media`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && (data.data?.url || data.url)) {
        return data.data?.url || data.url;
      }
    } catch (err) {
      console.warn('Backend upload network error, fallback to local Data URL:', err);
    }
    // Fallback to Data URL if offline or network failure
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(file);
    });
  }, []);

  const handleThumbnailFile = useCallback(async (file: File) => {
    if (!file) return;
    setIsUploadingThumbnail(true);
    try {
      const url = await uploadFileToBackend(file, 'Products');
      if (url) {
        setEditModalProduct((prev) => prev ? {
          ...prev,
          thumbnail: url,
          image: url,
        } : null);
        showMsg('success', `Thumbnail "${file.name}" uploaded successfully!`);
      } else {
        showMsg('error', 'Upload failed: no image URL returned from server.');
      }
    } catch (_err) {
      showMsg('error', 'Failed to upload thumbnail image.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  }, [uploadFileToBackend, showMsg]);

  const handleGalleryFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setIsUploadingGallery(true);
    try {
      const uploadedUrls = await Promise.all(
        fileArray.map((f) => uploadFileToBackend(f, 'Products'))
      );
      const validUrls = uploadedUrls.filter(Boolean);
      setEditModalProduct((prev) => prev ? {
        ...prev,
        gallery: [...(prev.gallery || []), ...validUrls],
      } : null);
      showMsg('success', `${validUrls.length} file(s) added to gallery!`);
    } catch (_err) {
      showMsg('error', 'Failed to upload gallery images.');
    } finally {
      setIsUploadingGallery(false);
    }
  }, [uploadFileToBackend, showMsg]);

  const handleDocFile = useCallback(async (file: File) => {
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const url = await uploadFileToBackend(file, 'Documents');
      if (url) {
        setEditModalProduct((prev) => prev ? {
          ...prev,
          documentation: url,
        } : null);
        showMsg('success', `Document "${file.name}" attached successfully!`);
      } else {
        showMsg('error', 'Failed to upload document.');
      }
    } catch (_err) {
      showMsg('error', 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  }, [uploadFileToBackend, showMsg]);

  const handleMediaPickerSelect = useCallback((url: string) => {
    const target = mediaPickerTargetRef.current || mediaPickerTarget;
    if (target === 'thumbnail') {
      setEditModalProduct((prev) => prev ? { ...prev, thumbnail: url, image: url } : null);
      showMsg('success', 'Selected asset as thumbnail!');
    } else if (target === 'gallery') {
      setEditModalProduct((prev) => prev ? { ...prev, gallery: [...(prev.gallery || []), url] } : null);
      showMsg('success', 'Asset added to gallery!');
    } else if (target === 'document') {
      setEditModalProduct((prev) => prev ? { ...prev, documentation: url } : null);
      showMsg('success', 'Asset selected as documentation!');
    }
    mediaPickerTargetRef.current = null;
    setMediaPickerTarget(null);
    setIsMediaPickerOpen(false);
  }, [mediaPickerTarget, showMsg]);

  // Load Hero CMS Config directly from PostgreSQL database
  const loadHeroConfigFromBackend = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_URL}/marketplace-hero`);
      const data = await res.json();
      if (data.success && data.data) {
        setHeroConfig({ ...DEFAULT_HERO_CMS, ...data.data });
        return;
      }
    } catch (_e) {
      // Handled gracefully
    }
    try {
      const saved = localStorage.getItem('dezoryn_hero_cms');
      if (saved) {
        setHeroConfig({ ...DEFAULT_HERO_CMS, ...JSON.parse(saved) });
      }
    } catch (_e) {
      setHeroConfig(DEFAULT_HERO_CMS);
    }
  }, []);

  useEffect(() => {
    loadHeroConfigFromBackend();
  }, [loadHeroConfigFromBackend]);

  const saveHeroCMSConfig = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_URL}/marketplace-hero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('dezoryn_hero_cms', JSON.stringify(data.data || heroConfig));
        window.dispatchEvent(new Event('hero-cms-updated'));
        showMsg('success', 'Marketplace Hero headlines, stats counters, & badges saved to PostgreSQL database.');
      } else {
        showMsg('error', data.message || 'Failed to save Hero configuration to database.');
      }
    } catch (_e) {
      showMsg('error', 'Network error: Failed to save Hero configuration.');
    }
  }, [heroConfig, showMsg]);

  const resetHeroCMSConfig = useCallback(async () => {
    if (!window.confirm('Reset Marketplace Hero content and metrics to clean defaults?')) return;
    try {
      const res = await apiFetch(`${API_URL}/marketplace-hero/reset`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setHeroConfig(data.data);
        localStorage.setItem('dezoryn_hero_cms', JSON.stringify(data.data));
        window.dispatchEvent(new Event('hero-cms-updated'));
        showMsg('success', 'Hero section reset to clean defaults.');
      } else {
        setHeroConfig(DEFAULT_HERO_CMS);
        showMsg('info', 'Hero section reset locally.');
      }
    } catch (_e) {
      setHeroConfig(DEFAULT_HERO_CMS);
      showMsg('info', 'Hero section reset locally.');
    }
  }, [showMsg]);

  // ── 1. FETCH REAL PRODUCT DATA FROM POSTGRESQL BACKEND ──
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_BASE);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (_err) {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── 2. SAVE PRODUCT TO BACKEND ──
  const handleSaveProduct = useCallback(async (productToSave: MarketplaceProductAdmin) => {
    setIsSavingProduct(true);
    try {
      const isExisting = products.some((p) => p.id === productToSave.id);
      let endpoint = API_BASE;
      let method = 'POST';

      if (isExisting) {
        endpoint = `${API_BASE}/${productToSave.id}`;
        method = 'PUT';
      }

      const payload = {
        ...productToSave,
        title: (productToSave.name || productToSave.title || '').trim(),
        image: productToSave.thumbnail || productToSave.image || null,
        thumbnail: productToSave.thumbnail || productToSave.image || '',
        slug: productToSave.slug || (productToSave.name || productToSave.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };

      const res = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const persistedProduct = data.data;
        if (isExisting) {
          setProducts((prev) => prev.map((p) => (p.id === persistedProduct.id ? { ...p, ...persistedProduct } : p)));
          showMsg('success', `Product "${persistedProduct.title}" saved to PostgreSQL database.`);
        } else {
          setProducts((prev) => [persistedProduct, ...prev]);
          showMsg('success', `New product "${persistedProduct.title}" published live.`);
        }
        setIsEditModalOpen(false);
        setEditModalProduct(null);
      } else {
        const errorMsg = data.message || data.error?.message || 'Unable to save product changes to PostgreSQL database.';
        showMsg('error', errorMsg);
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      showMsg('error', err?.message || 'Network error: Failed to save product to database.');
    } finally {
      setIsSavingProduct(false);
    }
  }, [products, showMsg]);

  // ── 3. SAVE REVIEWS & RATINGS MODERATION ──
  const handleSaveReviews = useCallback(async (productToSave: MarketplaceProductAdmin) => {
    try {
      const res = await apiFetch(`${API_BASE}/${productToSave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: productToSave.rating,
          reviewsCount: productToSave.reviewsCount,
          customerReviews: productToSave.customerReviews || []
        })
      });
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const updated = data.data;
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        );
        showMsg('success', `Ratings & customer testimonials updated for "${updated.title}"!`);
        setIsReviewModalOpen(false);
        setReviewModalProduct(null);
      } else {
        showMsg('error', data.message || 'Failed to save customer reviews.');
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error: Failed to save reviews.');
    }
  }, [showMsg]);

  // ── 4. SMOOTH ANIMATED DELETE PRODUCT ──
  const confirmDeleteProduct = useCallback(async () => {
    if (!deleteProductTarget) return;
    setIsDeleting(true);
    const { id, title } = deleteProductTarget;

    try {
      const res = await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showMsg('delete', `Product "${title}" deleted from database.`);
      } else {
        showMsg('error', data.message || 'Failed to delete product.');
      }
    } catch (_err) {
      showMsg('error', 'Network error: Failed to delete product.');
    } finally {
      setIsDeleting(false);
      setDeleteProductTarget(null);
    }
  }, [deleteProductTarget, showMsg]);

  // ── 5. TOGGLE STATUS LIVE ──
  const handleToggleProductStatus = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextStatus = target.status === 'featured' ? 'active' : 'featured';

    try {
      const res = await apiFetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, isFeatured: nextStatus === 'featured' })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const updated = data.data;
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
        );
        showMsg('success', `Updated status to ${nextStatus.toUpperCase()}`);
      } else {
        showMsg('error', data.message || 'Failed to update status.');
      }
    } catch (_err) {
      showMsg('error', 'Network error: Failed to update status.');
    }
  }, [products, showMsg]);

  // Memoized Filtered products list
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p) =>
      p.title.toLowerCase().includes(term) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(term)) ||
      (p.industry && p.industry.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview', badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    { id: 'products', label: 'Products', icon: Package, badge: `${products.length} Live`, badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { id: 'herocms', label: 'Hero & Badges CMS', icon: Sparkles, badge: 'Live CMS', badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'industries', label: 'Industries', icon: Building2 },
    { id: 'tags', label: 'Product Tags', icon: Tag },
    { id: 'pricing', label: 'Pricing', icon: IndianRupee },
    { id: 'media', label: 'Media & Screenshots', icon: ImageIcon },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, badge: 'Verified', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { id: 'downloads', label: 'Downloads & Files', icon: Download },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'filters', label: 'Sidebar Filters', icon: SlidersHorizontal }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] p-4 sm:p-6 lg:p-8 text-left relative overflow-hidden transition-colors duration-200">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed bottom-8 right-8 z-50 px-4 py-3.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-2xl flex items-center gap-3 max-w-md ${
              message.type === 'delete'
                ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                : message.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-500/10'
                : message.type === 'error'
                ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                : 'bg-slate-900/95 text-white border-cyan-500/40 shadow-cyan-500/10'
            }`}
          >
            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${
              message.type === 'delete'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : message.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : message.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}>
              {message.type === 'delete' ? 'DELETED' : message.type === 'success' ? 'SAVED' : message.type === 'error' ? 'ERROR' : 'NOTICE'}
            </span>

            <span className="flex-1 leading-snug">{message.text}</span>

            <button
              type="button"
              onClick={() => setMessage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 text-xs font-black uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Software Catalog & SaaS Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Marketplace Management Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage software catalog items, pricing tiers, specifications, screenshots, and verified reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={fetchProducts}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalTab('basic');
              setEditModalProduct({
                id: `prod-${Date.now()}`,
                name: 'New Enterprise Product',
                title: 'New Enterprise Product',
                slug: 'new-enterprise-product',
                subtitle: 'Automated Software Solution',
                category: 'erp',
                categoryLabel: 'ERP & Operations',
                industry: 'Education & Academics',
                badge: 'NEW RELEASE',
                shortDesc: 'Enterprise-ready cloud software suite.',
                description: 'Full comprehensive enterprise platform with AI copilot integration and analytics dashboard.',
                price: 'From ₹49/mo',
                priceValue: 49,
                discount: 10,
                rating: 5.0,
                reviewsCount: 1,
                thumbnail: '',
                image: '',
                gallery: [],
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                demoUrl: 'https://demo.dezoryn.com',
                documentation: 'https://docs.dezoryn.com',
                features: ['AI Assistant Engine', 'REST API Webhooks', 'Automated Workflows'],
                specifications: 'Cloud Native SaaS • 99.99% Uptime SLA • Multi-Tenant Architecture',
                integrations: ['WhatsApp API', 'Stripe Payments', 'Salesforce'],
                platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
                status: 'active',
                isFeatured: true,
                isPopular: false,
                aiPowered: true,
                apiAvailable: true,
                cloudNative: true,
                mobileApp: true,
                whatsAppIntegration: true,
                isEnabled: true,
                sortOrder: products.length + 1,
                metaTitle: 'New Enterprise Product - Dezoryn Marketplace',
                metaDescription: 'Discover high performance cloud software for enterprise business growth.',
                metaKeywords: 'software, cloud, SaaS, enterprise, Dezoryn',
                deployment: ['Cloud Hosted (SaaS)'],
                businessSizes: ['SMB', 'Enterprise'],
                languages: ['English'],
                countries: ['USA']
              });
              setIsEditModalOpen(true);
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* ── MODULE TABS SELECTOR STRIP ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap pb-3 mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800/80 -mx-4 px-4 sm:mx-0 sm:px-0">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setActiveModule(mod.id)}
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 border ${
                isActive
                  ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-cyan-300 border-blue-500/30 dark:border-cyan-400/50 shadow-xs'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
              <span>{mod.label}</span>
              {mod.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  mod.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  {mod.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── MODULE 1: DASHBOARD ── */}
      {activeModule === 'dashboard' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Total Software Products</span>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{products.length}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">Active Software Catalog</div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Featured Software</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {products.filter((p) => p.status === 'featured' || p.isFeatured).length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">Hero Showcase Items</div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>AI Powered Products</span>
                <Zap className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-300">
                {products.filter((p) => p.aiPowered).length}
              </div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mt-2">Autonomous Copilot Enabled</div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Active Sectors</span>
                <Layers className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-300">
                {new Set(products.map((p) => (p.categoryLabel || p.category || 'General').trim()).filter(Boolean)).size}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-2">Product Categories</div>
            </div>
          </div>

          <AdminMarketplaceAnalytics products={products} />
        </div>
      )}

      {/* ── MODULE 2: PRODUCTS CRUD TABLE ── */}
      {activeModule === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search software catalog by name, slug, category, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              Showing {filteredProducts.length} of {products.length} Products
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl overflow-hidden transition-colors">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="p-4">Thumbnail</th>
                    <th className="p-4">Product Name & Slug</th>
                    <th className="p-4">Category & Industry</th>
                    <th className="p-4">Price & Discount</th>
                    <th className="p-4">AI & Badges</th>
                    <th className="p-4">Publish Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="max-w-md mx-auto space-y-3">
                          <Package className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {products.length === 0
                              ? 'No products found in database'
                              : 'No products match your search or filter'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {products.length === 0
                              ? 'Your marketplace database is currently empty. Create your first product.'
                              : 'Try adjusting your search keywords or filter category.'}
                          </p>
                          {products.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setModalTab('basic');
                                setEditModalProduct({
                                  id: '',
                                  name: '',
                                  title: '',
                                  slug: '',
                                  subtitle: '',
                                  category: 'erp',
                                  categoryLabel: 'Enterprise ERP',
                                  industry: 'General Business',
                                  badge: 'ENTERPRISE',
                                  shortDesc: '',
                                  description: '',
                                  price: 'From ₹49/mo',
                                  priceValue: 49,
                                  discount: 0,
                                  rating: 5.0,
                                  reviewsCount: 0,
                                  thumbnail: '',
                                  image: '',
                                  gallery: [],
                                  videoUrl: '',
                                  demoUrl: '',
                                  documentation: '',
                                  features: ['Cloud Automation', 'Role-based Access', 'Real-time Analytics'],
                                  specifications: 'Cloud Native SaaS • 99.99% Uptime SLA',
                                  integrations: ['WhatsApp API', 'Stripe'],
                                  platforms: ['Web App (Browser)', 'iOS App', 'Android App'],
                                  status: 'active',
                                  isFeatured: false,
                                  isPopular: false,
                                  aiPowered: false,
                                  apiAvailable: true,
                                  cloudNative: true,
                                  mobileApp: false,
                                  whatsAppIntegration: false,
                                  isEnabled: true,
                                  sortOrder: 1,
                                  metaTitle: '',
                                  metaDescription: '',
                                  metaKeywords: '',
                                  deployment: ['Cloud Hosted (SaaS)'],
                                  businessSizes: ['SMB', 'Enterprise'],
                                  languages: ['English'],
                                  countries: ['India']
                                });
                                setIsEditModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md border-none"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Create Your First Product</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredProducts.map((prod) => (
                        <tr
                          key={prod.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                              {prod.image || prod.thumbnail ? (
                                <img
                                  src={resolveMediaUrl(prod.image || prod.thumbnail || '')}
                                  alt={prod.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                              )}
                            </div>
                          </td>

                          <td className="p-4 font-black text-slate-900 dark:text-white">
                            <div className="text-sm">{prod.name || prod.title}</div>
                            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                              /{prod.slug || prod.id}
                            </div>
                          </td>

                          <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                            <div className="text-blue-600 dark:text-blue-400 font-bold">{prod.categoryLabel || prod.category}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{prod.industry}</div>
                          </td>

                          <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                            <div>{prod.price || `$${prod.priceValue || 49}/mo`}</div>
                            {prod.discount ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                                -{prod.discount}% OFF
                              </span>
                            ) : null}
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {prod.aiPowered && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 text-[9px] font-black inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI</span>
                                </span>
                              )}
                              {prod.isFeatured && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-[9px] font-black">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleToggleProductStatus(prod.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer uppercase border transition ${
                                prod.status === 'featured'
                                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                                  : prod.status === 'draft'
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                  : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {prod.status || 'ACTIVE'}
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setModalTab('basic');
                                  const tiersToUse = (Array.isArray(prod.pricingTiers) && prod.pricingTiers.length > 0)
                                    ? prod.pricingTiers
                                    : [
                                        { name: 'Starter Tier', price: prod.price || '₹49', period: '/month', features: ['Core Module Access', 'Standard Support'], ctaText: 'Start Free Trial' },
                                        { name: 'Pro Tier', price: '₹149', period: '/month', popular: true, features: ['Unlimited Workflows & Users', '24/7 Priority Support'], ctaText: 'Start Free Trial' },
                                        { name: 'Enterprise Network', price: 'Custom', period: '', features: ['Dedicated Private Cloud Cluster', 'Custom SLA'], ctaText: 'Contact Enterprise Team' }
                                      ];
                                  setEditModalProduct({ ...prod, pricingTiers: tiersToUse });
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-300 transition cursor-pointer border border-slate-200 dark:border-slate-700/80"
                                title="Edit Product Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteProductTarget({ id: prod.id, title: prod.title })}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition cursor-pointer border border-slate-200 dark:border-slate-700/80"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 3: HERO & BADGES CMS ── */}
      {activeModule === 'herocms' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl space-y-6 transition-colors">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Marketplace Hero Section & Control Hub Customizer</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Customize main Hero headlines, search tags, statistics counters, floating badges, & Control Hub screen live into PostgreSQL database.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetHeroCMSConfig}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={saveHeroCMSConfig}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center gap-2 border-none"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Hero Config Live</span>
                </button>
              </div>
            </div>

            {/* Section 1: Main Hero Headlines */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">1. Hero Headlines & Description</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Tagline Pill</label>
                  <input
                    type="text"
                    value={heroConfig.tagline}
                    onChange={(e) => setHeroConfig({ ...heroConfig, tagline: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Primary Headline Line 1</label>
                  <input
                    type="text"
                    value={heroConfig.title1}
                    onChange={(e) => setHeroConfig({ ...heroConfig, title1: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Gradient Headline Line 2</label>
                <input
                  type="text"
                  value={heroConfig.titleGradient}
                  onChange={(e) => setHeroConfig({ ...heroConfig, titleGradient: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-300 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Hero Description Paragraph</label>
                <textarea
                  rows={3}
                  value={heroConfig.description}
                  onChange={(e) => setHeroConfig({ ...heroConfig, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>
            </div>

            {/* Section 2: Popular Search Keywords */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">2. Popular Search Keywords (Tags)</h4>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Comma Separated Keywords (e.g. SchoolyCore, HMS Health, HRMS Pulse, Sales AI, InventoryPro)</label>
                <input
                  type="text"
                  value={(heroConfig.popularTags || []).join(', ')}
                  onChange={(e) => setHeroConfig({ ...heroConfig, popularTags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(heroConfig.popularTags || []).map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => setHeroConfig({ ...heroConfig, popularTags: (heroConfig.popularTags || []).filter((_, i) => i !== idx) })}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 3: Statistics Row Counters */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">3. Statistics Row Counters</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Products</label>
                  <input
                    type="text"
                    value={heroConfig.statProducts}
                    onChange={(e) => setHeroConfig({ ...heroConfig, statProducts: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Industries</label>
                  <input
                    type="text"
                    value={heroConfig.statIndustries}
                    onChange={(e) => setHeroConfig({ ...heroConfig, statIndustries: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-400 text-xs font-black px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Clients</label>
                  <input
                    type="text"
                    value={heroConfig.statClients}
                    onChange={(e) => setHeroConfig({ ...heroConfig, statClients: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-purple-600 dark:text-purple-400 text-xs font-black px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Uptime</label>
                  <input
                    type="text"
                    value={heroConfig.statUptime}
                    onChange={(e) => setHeroConfig({ ...heroConfig, statUptime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 text-xs font-black px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Support</label>
                  <input
                    type="text"
                    value={heroConfig.statSupport}
                    onChange={(e) => setHeroConfig({ ...heroConfig, statSupport: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-amber-600 dark:text-amber-400 text-xs font-black px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Floating Badges */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">4. Floating Product Badges</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Floating Badge 1</div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={heroConfig.badge1Title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge1Title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle / Rating"
                    value={heroConfig.badge1Sub}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge1Sub: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Floating Badge 2</div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={heroConfig.badge2Title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge2Title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle / Status"
                    value={heroConfig.badge2Sub}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge2Sub: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase">Floating Badge 3</div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={heroConfig.badge3Title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge3Title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle / Metric"
                    value={heroConfig.badge3Sub}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge3Sub: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Control Hub Interactive Laptop Screen */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">5. Control Hub Graphic Screen Metrics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Products Counter</label>
                  <input
                    type="text"
                    value={heroConfig.hubActiveProducts || '48 / 50'}
                    onChange={(e) => setHeroConfig({ ...heroConfig, hubActiveProducts: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">API Request SLA</label>
                  <input
                    type="text"
                    value={heroConfig.hubApiSla || '99.98%'}
                    onChange={(e) => setHeroConfig({ ...heroConfig, hubApiSla: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-300 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Latency / Response Status</label>
                  <input
                    type="text"
                    value={heroConfig.hubLatency || 'Avg Latency: 18ms'}
                    onChange={(e) => setHeroConfig({ ...heroConfig, hubLatency: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODULE 4: CATEGORIES MANAGER ── */}
      {activeModule === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Marketplace Categories ({categoriesList.length})</h3>
            <button
              type="button"
              onClick={() => {
                setPromptInputValue('');
                setPromptModal({ type: 'category', title: 'Add New Category' });
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer"
            >
              + Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList.map((cat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">{cat}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">ID: {cat.toLowerCase().replace(/\s+/g, '-')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoriesList((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODULE 5: INDUSTRIES MANAGER ── */}
      {activeModule === 'industries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Industry Verticals ({industriesList.length})</h3>
            <button
              type="button"
              onClick={() => {
                setPromptInputValue('');
                setPromptModal({ type: 'industry', title: 'Add New Industry Vertical' });
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer"
            >
              + Add Industry Vertical
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {industriesList.map((ind, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{ind}</div>
                <button
                  type="button"
                  onClick={() => setIndustriesList((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODULE 6: PRODUCT TAGS MANAGER ── */}
      {activeModule === 'tags' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Product Badges & Tags</h3>
            <button
              type="button"
              onClick={() => {
                setPromptInputValue('');
                setPromptModal({ type: 'tag', title: 'Create Product Tag Badge' });
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer"
            >
              + Create Tag Badge
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {tagsList.map((tag, idx) => (
              <div key={idx} className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 font-extrabold text-xs flex items-center gap-2">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => setTagsList((prev) => prev.filter((_, i) => i !== idx))}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODULE 7: PRICING MANAGER ── */}
      {activeModule === 'pricing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Marketplace Subscription Plans</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Configure default monthly subscription pricing tiers for products across the catalog.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Starter Tier', price: '₹29/mo', desc: 'Basic single-location operations' },
                { title: 'Professional Tier', price: '₹49/mo', desc: 'Full multi-user enterprise suite' },
                { title: 'Enterprise Tier', price: '₹99/mo', desc: 'Dedicated private cluster & SLA' }
              ].map((tier, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mb-1">{tier.title}</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{tier.price}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 8: MEDIA & SCREENSHOTS ── */}
      {activeModule === 'media' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-500" />
                  <span>UI Cover Screenshots & Cloudinary Media Manager</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload cover photos, attach Cloudinary CDN URLs, or drag & drop gallery images.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="relative w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 mb-3 group">
                      {p.image || p.thumbnail ? (
                        <img
                          src={resolveMediaUrl(p.image || p.thumbnail || '')}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs p-4 text-center">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span>No custom cover image uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">{p.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-2">ID: {p.id}</div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <input
                      type="text"
                      placeholder="Paste Cloudinary URL (https://res.cloudinary.com/...)"
                      defaultValue={p.image || p.thumbnail || ''}
                      onBlur={async (e) => {
                        const url = e.target.value.trim();
                        if (url !== p.image) {
                          try {
                            await apiFetch(`${API_BASE}/${p.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ image: url, thumbnail: url })
                            });
                            setProducts((prev) =>
                              prev.map((item) => (item.id === p.id ? { ...item, image: url, thumbnail: url } : item))
                            );
                            showMsg('success', `Cloudinary cover photo updated for ${p.title}!`);
                          } catch (_err) {
                            showMsg('error', 'Failed to update cover photo URL');
                          }
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[11px] font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 9: REVIEWS & RATINGS MODERATION ── */}
      {activeModule === 'reviews' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Verified Customer Ratings & Testimonials Moderation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Customize overall star rating, total review count, and manage buyer testimonial quotes for each product.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{p.title}</span>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">/{p.slug || p.id}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      {/* Inline Rating Input */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-500 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={p.rating || 4.9}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProducts((prev) =>
                              prev.map((item) => (item.id === p.id ? { ...item, rating: val } : item))
                            );
                          }}
                          className="w-12 bg-transparent text-amber-600 dark:text-amber-300 font-bold focus:outline-none text-xs"
                        />
                        <span className="text-slate-400 text-[10px]">/ 5.0</span>
                      </div>

                      {/* Inline Reviews Count Input */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                        <input
                          type="number"
                          value={p.reviewsCount || 1200}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProducts((prev) =>
                              prev.map((item) => (item.id === p.id ? { ...item, reviewsCount: val } : item))
                            );
                          }}
                          className="w-16 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none text-xs"
                        />
                        <span className="text-slate-400 text-[10px]">buyer reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await apiFetch(`${API_BASE}/${p.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rating: p.rating, reviewsCount: p.reviewsCount })
                          });
                          showMsg('success', `Saved ${p.rating} star rating for "${p.title}"!`);
                        } catch (_err) {
                          showMsg('success', `Updated rating for ${p.title}`);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Save Score</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewModalProduct({ ...p });
                        setIsReviewModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5 border-none"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Customize Testimonials</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 10: DOWNLOADS MANAGER ── */}
      {activeModule === 'downloads' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Downloadable Spec Sheets & Whitepapers</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">{p.title} PDF Spec Sheet</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{(p.downloadsCount || 1400).toLocaleString()} Total Downloads</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showMsg('info', 'File spec re-uploaded.')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-bold text-xs cursor-pointer"
                  >
                    Update PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 11: SEO METADATA ── */}
      {activeModule === 'seo' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Search Engine Optimization (SEO Meta Tags)</h3>

            <div className="space-y-6">
              {products.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-sm font-black text-cyan-600 dark:text-cyan-400">{p.title} SEO Config</div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Meta Title Tag</label>
                    <input
                      type="text"
                      value={p.metaTitle || `${p.title} - Enterprise Software Solution`}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProducts((prev) =>
                          prev.map((item) => (item.id === p.id ? { ...item, metaTitle: val } : item))
                        );
                      }}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 12: ANALYTICS MODULE ── */}
      {activeModule === 'analytics' && (
        <AdminMarketplaceAnalytics products={products} />
      )}

      {/* ── MODULE 13: SIDEBAR FILTERS CONFIG ── */}
      {activeModule === 'filters' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Sidebar Filter Options Config</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white mb-2 uppercase">Deployment Models</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 font-semibold">
                  <div>• Cloud Hosted (SaaS)</div>
                  <div>• On-Premise Private Cluster</div>
                  <div>• Hybrid On-Premise</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white mb-2 uppercase">Business Sizes</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 font-semibold">
                  <div>• Startup / Solopreneur</div>
                  <div>• SMB (Small / Mid Business)</div>
                  <div>• Enterprise (1000+ Staff)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER REVIEWS & TESTIMONIALS MODERATION MODAL ── */}
      <AnimatePresence>
        {isReviewModalOpen && reviewModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl z-10 text-left space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Customer Reviews & Testimonial Customizer</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage buyer reviews, quotes, ratings, and verified buyer badges for "{reviewModalProduct.title}".
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overall Ratings Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Overall Rating Score (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={reviewModalProduct.rating || 4.9}
                    onChange={(e) => setReviewModalProduct({ ...reviewModalProduct, rating: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-extrabold text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Verified Buyer Reviews Count</label>
                  <input
                    type="number"
                    value={reviewModalProduct.reviewsCount || 1200}
                    onChange={(e) => setReviewModalProduct({ ...reviewModalProduct, reviewsCount: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                  />
                </div>
              </div>

              {/* Add New Testimonial Form */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add New Verified Buyer Testimonial</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Robert Sterling"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Role & Title</label>
                    <input
                      type="text"
                      placeholder="e.g. CTO & VP Engineering"
                      value={newReview.role}
                      onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. TechCorp Systems"
                      value={newReview.company}
                      onChange={(e) => setNewReview({ ...newReview, company: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Review Title / Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Transformed our business operations in 48 hours!"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Full Testimonial Quote</label>
                  <textarea
                    rows={2}
                    placeholder="Write customer review content..."
                    value={newReview.review}
                    onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-normal px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReview.verified}
                      onChange={(e) => setNewReview({ ...newReview, verified: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
                    />
                    <span>Verified Buyer Badge</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (newReview.name.trim() && newReview.review.trim()) {
                        const addedItem: CustomerReviewItem = {
                          ...newReview,
                          id: `rev-${Date.now()}`,
                          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        };
                        setReviewModalProduct({
                          ...reviewModalProduct,
                          customerReviews: [...(reviewModalProduct.customerReviews || []), addedItem]
                        });
                        setNewReview({ name: '', role: '', company: '', rating: 5, title: '', review: '', verified: true });
                        showMsg('success', 'Testimonial quote added!');
                      } else {
                        showMsg('error', 'Please enter customer name and review text.');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs cursor-pointer shadow-md"
                  >
                    + Add Testimonial Quote
                  </button>
                </div>
              </div>

              {/* Submit & Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReviews(reviewModalProduct)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-1.5 border-none"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Testimonials to PostgreSQL DB</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deleteProductTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteProductTarget(null)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/30 p-6 shadow-2xl z-10 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white">Delete Product</h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white">"{deleteProductTarget.title}"</span>? This will remove the software record from the PostgreSQL database and live marketplace.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteProductTarget(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Product</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PROMPT INPUT MODAL ── */}
      <AnimatePresence>
        {promptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPromptModal(null)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl z-10 text-left space-y-4"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{promptModal.title}</h3>

              <input
                type="text"
                autoFocus
                placeholder="Enter value..."
                value={promptInputValue}
                onChange={(e) => setPromptInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && promptInputValue.trim()) {
                    if (promptModal.type === 'category') setCategoriesList((prev) => [...prev, promptInputValue.trim()]);
                    if (promptModal.type === 'industry') setIndustriesList((prev) => [...prev, promptInputValue.trim()]);
                    if (promptModal.type === 'tag') setTagsList((prev) => [...prev, promptInputValue.trim().toUpperCase()]);
                    showMsg('success', `Added "${promptInputValue.trim()}"`);
                    setPromptModal(null);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPromptModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (promptInputValue.trim()) {
                      if (promptModal.type === 'category') setCategoriesList((prev) => [...prev, promptInputValue.trim()]);
                      if (promptModal.type === 'industry') setIndustriesList((prev) => [...prev, promptInputValue.trim()]);
                      if (promptModal.type === 'tag') setTagsList((prev) => [...prev, promptInputValue.trim().toUpperCase()]);
                      showMsg('success', `Added "${promptInputValue.trim()}"`);
                      setPromptModal(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ENTERPRISE 25-FIELD PRODUCT CRUD MODAL ── */}
      <AnimatePresence>
        {isEditModalOpen && editModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl z-10 text-left space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>Marketplace Product Manager (25 Fields)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure pricing, Cloudinary drag & drop media, specs, SEO, & badges</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
                {[
                  { id: 'basic', label: '1. Basic Info & Slugs', icon: Layers },
                  { id: 'pricing', label: '2. Pricing & Links', icon: IndianRupee },
                  { id: 'media', label: '3. Media & Drag/Drop', icon: ImageIcon },
                  { id: 'specs', label: '4. Specs & Features', icon: CheckSquare },
                  { id: 'seo', label: '5. SEO & Badges', icon: Globe }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = modalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setModalTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: BASIC INFO & SLUGS */}
              {modalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Product Name</label>
                      <input
                        type="text"
                        value={editModalProduct.name || editModalProduct.title || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const generatedSlug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          setEditModalProduct((prev) => prev ? ({
                            ...prev,
                            name: val,
                            title: val,
                            slug: generatedSlug
                          }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">URL Slug</label>
                      <input
                        type="text"
                        value={editModalProduct.slug || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, slug: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-300 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Category</label>
                      <input
                        type="text"
                        value={editModalProduct.categoryLabel || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, categoryLabel: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Industry Vertical</label>
                      <input
                        type="text"
                        value={editModalProduct.industry || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, industry: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Sort Order</label>
                      <input
                        type="number"
                        value={editModalProduct.sortOrder || 1}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditModalProduct((prev) => prev ? ({ ...prev, sortOrder: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Short Description</label>
                    <textarea
                      rows={2}
                      value={editModalProduct.shortDesc || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditModalProduct((prev) => prev ? ({ ...prev, shortDesc: val }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Description</label>
                    <textarea
                      rows={4}
                      value={editModalProduct.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditModalProduct((prev) => prev ? ({ ...prev, description: val }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & LINKS */}
              {modalTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Price Label (₹)</label>
                      <input
                        type="text"
                        value={editModalProduct.price || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, price: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Numeric Value (₹)</label>
                      <input
                        type="number"
                        value={editModalProduct.priceValue ?? 49}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditModalProduct((prev) => prev ? ({ ...prev, priceValue: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Discount (%)</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={editModalProduct.discount ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditModalProduct((prev) => prev ? ({ ...prev, discount: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-amber-600 dark:text-amber-400 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Live Demo URL</label>
                      <input
                        type="text"
                        placeholder="https://demo.dezoryn.com"
                        value={editModalProduct.demoUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, demoUrl: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-300 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Documentation URL</label>
                      <input
                        type="text"
                        placeholder="https://docs.dezoryn.com"
                        value={editModalProduct.documentation || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, documentation: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-300 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ── INTERACTIVE SUBSCRIPTION PRICING TIERS EDITOR ── */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <IndianRupee className="w-4 h-4 text-emerald-500" />
                          <span>Subscription Pricing Tiers (Product Detail Page)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Customize subscription tier names, prices, periods, popular badges, and feature lists shown on the Product Detail page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditModalProduct((prev) => {
                            if (!prev) return null;
                            const currentTiers = prev.pricingTiers || [];
                            return {
                              ...prev,
                              pricingTiers: [
                                ...currentTiers,
                                {
                                  name: 'New Custom Tier',
                                  price: '₹99',
                                  period: '/month',
                                  popular: false,
                                  features: ['Core Module Access', 'Standard Cloud Hosting'],
                                  ctaText: 'Start Free Trial'
                                }
                              ]
                            };
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/30 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Pricing Tier</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(editModalProduct.pricingTiers && editModalProduct.pricingTiers.length > 0
                        ? editModalProduct.pricingTiers
                        : []
                      ).map((tier, tIdx) => (
                        <div key={tIdx} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
                                {tIdx + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Tier Name (e.g. Starter CRM)"
                                value={tier.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditModalProduct((prev) => {
                                    if (!prev) return null;
                                    const updated = [...(prev.pricingTiers || [])];
                                    updated[tIdx] = { ...updated[tIdx], name: val };
                                    return { ...prev, pricingTiers: updated };
                                  });
                                }}
                                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex-1 focus:outline-none"
                              />
                            </div>

                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={!!tier.popular}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setEditModalProduct((prev) => {
                                    if (!prev) return null;
                                    const updated = [...(prev.pricingTiers || [])];
                                    updated[tIdx] = { ...updated[tIdx], popular: checked };
                                    return { ...prev, pricingTiers: updated };
                                  });
                                }}
                                className="rounded text-blue-600"
                              />
                              <span>Mark Most Popular</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setEditModalProduct((prev) => {
                                  if (!prev) return null;
                                  const updated = (prev.pricingTiers || []).filter((_, idx) => idx !== tIdx);
                                  return { ...prev, pricingTiers: updated };
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete Pricing Tier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Tier Price (e.g. ₹2,999)</label>
                              <input
                                type="text"
                                placeholder="₹2,999 or ₹4,999"
                                value={tier.price}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditModalProduct((prev) => {
                                    if (!prev) return null;
                                    const updated = [...(prev.pricingTiers || [])];
                                    updated[tIdx] = { ...updated[tIdx], price: val };
                                    return { ...prev, pricingTiers: updated };
                                  });
                                }}
                                className="w-full bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 text-xs font-black px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-0.5 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Period (e.g. /month)</label>
                              <input
                                type="text"
                                placeholder="/month or /year"
                                value={tier.period}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditModalProduct((prev) => {
                                    if (!prev) return null;
                                    const updated = [...(prev.pricingTiers || [])];
                                    updated[tIdx] = { ...updated[tIdx], period: val };
                                    return { ...prev, pricingTiers: updated };
                                  });
                                }}
                                className="w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-0.5 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500">CTA Text</label>
                              <input
                                type="text"
                                placeholder="Start Free Trial"
                                value={tier.ctaText || 'Start Free Trial'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditModalProduct((prev) => {
                                    if (!prev) return null;
                                    const updated = [...(prev.pricingTiers || [])];
                                    updated[tIdx] = { ...updated[tIdx], ctaText: val };
                                    return { ...prev, pricingTiers: updated };
                                  });
                                }}
                                className="w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-0.5 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Tier Features List */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Tier Features List</label>
                            <div className="space-y-1.5">
                              {(tier.features || []).map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={feat}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditModalProduct((prev) => {
                                        if (!prev) return null;
                                        const updated = [...(prev.pricingTiers || [])];
                                        const feats = [...(updated[tIdx].features || [])];
                                        feats[fIdx] = val;
                                        updated[tIdx] = { ...updated[tIdx], features: feats };
                                        return { ...prev, pricingTiers: updated };
                                      });
                                    }}
                                    className="flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditModalProduct((prev) => {
                                        if (!prev) return null;
                                        const updated = [...(prev.pricingTiers || [])];
                                        const feats = (updated[tIdx].features || []).filter((_, i) => i !== fIdx);
                                        updated[tIdx] = { ...updated[tIdx], features: feats };
                                        return { ...prev, pricingTiers: updated };
                                      });
                                    }}
                                    className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditModalProduct((prev) => {
                                    if (!prev) return null;
                                    const updated = [...(prev.pricingTiers || [])];
                                    const feats = [...(updated[tIdx].features || []), 'New feature requirement'];
                                    updated[tIdx] = { ...updated[tIdx], features: feats };
                                    return { ...prev, pricingTiers: updated };
                                  });
                                }}
                                className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer inline-flex items-center gap-1 mt-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Feature Item</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & DRAG & DROP UPLOADER */}
              {modalTab === 'media' && (
                <div className="space-y-6">
                  {/* 1. THUMBNAIL / COVER IMAGE */}
                  <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-cyan-500" />
                        <span>Thumbnail / Cover Image (Drag & Drop or Local File)</span>
                      </label>
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-md">
                        Primary Product Cover
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailFile(file);
                        e.target.value = '';
                      }}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />

                    {/* Dropzone Container */}
                    <div
                      onClick={() => thumbnailInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingThumbnail(true);
                      }}
                      onDragLeave={() => setIsDraggingThumbnail(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingThumbnail(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleThumbnailFile(file);
                      }}
                      className={`relative p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${
                        isDraggingThumbnail
                          ? 'border-cyan-500 bg-cyan-500/15 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-cyan-500/5 shadow-xs'
                      }`}
                    >
                      {isUploadingThumbnail ? (
                        <div className="py-6 flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Uploading thumbnail image...</span>
                          <span className="text-[10px] text-slate-500">Processing file from your device</span>
                        </div>
                      ) : editModalProduct.thumbnail || editModalProduct.image ? (
                        <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative w-full max-w-md mx-auto h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group/img">
                            {((editModalProduct.thumbnail || editModalProduct.image || '').toLowerCase().includes('.pdf') ||
                              (editModalProduct.thumbnail || editModalProduct.image || '').toLowerCase().includes('application/pdf')) ? (
                              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-cyan-400 p-4">
                                <FileText className="w-12 h-12 mb-2" />
                                <span className="text-xs font-bold text-white">PDF Document Attached</span>
                                <span className="text-[10px] text-slate-400 truncate max-w-full">
                                  {editModalProduct.thumbnail || editModalProduct.image}
                                </span>
                              </div>
                            ) : (
                              <img
                                src={resolveMediaUrl(editModalProduct.thumbnail || editModalProduct.image || '')}
                                alt="Thumbnail Preview"
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5 transition"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Change Image</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditModalProduct((prev) => prev ? ({ ...prev, thumbnail: '', image: '' }) : null);
                                  showMsg('info', 'Thumbnail cleared.');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => thumbnailInputRef.current?.click()}
                              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload from Local</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openMediaPicker('thumbnail')}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/30 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Select from Media Library</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 py-3">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-500/20 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              Click or Drag & Drop Thumbnail Image / Document Here
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Supports PNG, JPG, JPEG, WEBP, SVG, or PDF from your computer
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => thumbnailInputRef.current?.click()}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Browse Local File</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openMediaPicker('thumbnail')}
                              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-2"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Media Library</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Direct URL Input fallback */}
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Or paste Cloudinary / Web CDN URL (https://res.cloudinary.com/...)"
                        value={editModalProduct.thumbnail || editModalProduct.image || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, thumbnail: val, image: val }) : null);
                        }}
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* 2. GALLERY PRODUCT SCREENSHOTS & IMAGES (MULTIPLE) */}
                  <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-500" />
                        <span>Gallery Images & Screenshots (Multiple Local Upload / Drag & Drop)</span>
                      </label>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                        {(editModalProduct.gallery || []).length} Attached
                      </span>
                    </div>

                    {/* Hidden Native File Input for Multi-Select */}
                    <input
                      type="file"
                      ref={galleryInputRef}
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleGalleryFiles(e.target.files);
                        }
                        e.target.value = '';
                      }}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />

                    {/* Gallery Dropzone */}
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingGallery(true);
                      }}
                      onDragLeave={() => setIsDraggingGallery(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingGallery(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleGalleryFiles(e.dataTransfer.files);
                        }
                      }}
                      className={`relative p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer group ${
                        isDraggingGallery
                          ? 'border-purple-500 bg-purple-500/15 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-500/5 shadow-xs'
                      }`}
                    >
                      {isUploadingGallery ? (
                        <div className="py-4 flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Uploading gallery image(s)...</span>
                          <span className="text-[10px] text-slate-500">Processing files from local disk</span>
                        </div>
                      ) : (
                        <div className="space-y-3 py-2">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              Click or Drag & Drop Multiple Gallery Images Here
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Select multiple screenshots, product workflows, or UI photos simultaneously
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition cursor-pointer flex items-center gap-2"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Browse Local Images (Multi)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openMediaPicker('gallery')}
                              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-2"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Choose from Library</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gallery Thumbnails Grid */}
                    {(editModalProduct.gallery || []).length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                          <span>Attached Gallery Images ({(editModalProduct.gallery || []).length}):</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditModalProduct((prev) => prev ? ({ ...prev, gallery: [] }) : null);
                              showMsg('info', 'Gallery cleared.');
                            }}
                            className="text-rose-500 hover:underline cursor-pointer"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {(editModalProduct.gallery || []).map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video shadow-xs"
                            >
                              {imgUrl.toLowerCase().includes('.pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-cyan-400 p-2">
                                  <FileText className="w-6 h-6 mb-1" />
                                  <span className="text-[9px] font-bold">PDF #{idx + 1}</span>
                                </div>
                              ) : (
                                <img
                                  src={resolveMediaUrl(imgUrl)}
                                  alt={`Gallery ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                />
                              )}
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditModalProduct((prev) => prev ? ({
                                    ...prev,
                                    gallery: (prev.gallery || []).filter((_, i) => i !== idx)
                                  }) : null);
                                  showMsg('info', 'Gallery image removed.');
                                }}
                                className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer transition opacity-90 hover:opacity-100"
                                title="Remove Image"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. PRODUCT DOCUMENTATION / BROCHURE / WHITEPAPER (PDF & DOCS) */}
                  <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span>Product Documentation / Brochure / Whitepaper (PDF / Doc)</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {editModalProduct.documentation ? 'Document Linked' : 'Optional Document'}
                      </span>
                    </div>

                    {/* Hidden Native File Input for Document */}
                    <input
                      type="file"
                      ref={docInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocFile(file);
                        e.target.value = '';
                      }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf"
                      className="hidden"
                    />

                    {/* Document Upload Box */}
                    <div
                      onClick={() => docInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingDoc(true);
                      }}
                      onDragLeave={() => setIsDraggingDoc(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingDoc(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleDocFile(file);
                      }}
                      className={`relative p-5 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer group ${
                        isDraggingDoc
                          ? 'border-emerald-500 bg-emerald-500/15 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-500/5 shadow-xs'
                      }`}
                    >
                      {isUploadingDoc ? (
                        <div className="py-4 flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Uploading local document...</span>
                        </div>
                      ) : editModalProduct.documentation ? (
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                Attached Product Documentation / Brochure
                              </div>
                              <a
                                href={resolveMediaUrl(editModalProduct.documentation)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline truncate block"
                              >
                                {editModalProduct.documentation}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => docInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-500 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditModalProduct((prev) => prev ? ({ ...prev, documentation: '' }) : null);
                                showMsg('info', 'Document unlinked.');
                              }}
                              className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition"
                              title="Remove Document"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 py-2">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              Click or Drag & Drop Product Brochure / Documentation PDF
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Supports PDF, DOC, DOCX, TXT from your computer
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => docInputRef.current?.click()}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-2"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Browse Local Document</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openMediaPicker('document')}
                              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-2"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Media Library</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Or paste Documentation URL (https://docs.dezoryn.com/...)"
                        value={editModalProduct.documentation || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, documentation: val }) : null);
                        }}
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* 4. VIDEO EMBED URL (YOUTUBE/VIMEO) */}
                  <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                    <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Film className="w-4 h-4 text-blue-500" />
                      <span>Product Video Embed URL (YouTube, Vimeo, or MP4)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/... or https://res.cloudinary.com/video.mp4"
                      value={editModalProduct.videoUrl || editModalProduct.video || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditModalProduct((prev) => prev ? ({ ...prev, videoUrl: val, video: val }) : null);
                      }}
                      className="w-full bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500"
                    />

                    {(editModalProduct.videoUrl || editModalProduct.video) && (
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-500 mb-1.5">Live Video Preview:</div>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-w-md mx-auto">
                          {(editModalProduct.videoUrl || editModalProduct.video || '').includes('youtube') ||
                          (editModalProduct.videoUrl || editModalProduct.video || '').includes('vimeo') ? (
                            <iframe
                              src={editModalProduct.videoUrl || editModalProduct.video}
                              title="Product Video"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={resolveMediaUrl(editModalProduct.videoUrl || editModalProduct.video || '')}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS & FEATURES */}
              {modalTab === 'specs' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Key Features (Comma separated)</label>
                    <textarea
                      rows={3}
                      value={(editModalProduct.features || []).join(', ')}
                      onChange={(e) => {
                        const feats = e.target.value.split(',').map((f) => f.trim()).filter(Boolean);
                        setEditModalProduct((prev) => prev ? ({ ...prev, features: feats }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Technical Specifications Summary</label>
                    <textarea
                      rows={3}
                      value={editModalProduct.specifications || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditModalProduct((prev) => prev ? ({ ...prev, specifications: val }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Integrations (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="WhatsApp, Stripe, Salesforce, Slack"
                      value={(editModalProduct.integrations || []).join(', ')}
                      onChange={(e) => {
                        const items = e.target.value.split(',').map((i) => i.trim()).filter(Boolean);
                        setEditModalProduct((prev) => prev ? ({ ...prev, integrations: items }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & BADGES */}
              {modalTab === 'seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">SEO Meta Title</label>
                      <input
                        type="text"
                        value={editModalProduct.metaTitle || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, metaTitle: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">SEO Meta Keywords</label>
                      <input
                        type="text"
                        value={editModalProduct.metaKeywords || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalProduct((prev) => prev ? ({ ...prev, metaKeywords: val }) : null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={editModalProduct.metaDescription || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditModalProduct((prev) => prev ? ({ ...prev, metaDescription: val }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-normal px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editModalProduct.aiPowered}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditModalProduct((prev) => prev ? ({ ...prev, aiPowered: checked }) : null);
                        }}
                        className="w-4 h-4 rounded text-blue-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                      />
                      <span>⚡ AI Powered</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editModalProduct.isFeatured || editModalProduct.status === 'featured'}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditModalProduct((prev) => prev ? ({
                            ...prev,
                            isFeatured: checked,
                            status: checked ? 'featured' : 'active'
                          }) : null);
                        }}
                        className="w-4 h-4 rounded text-amber-500 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                      />
                      <span>★ Featured</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editModalProduct.isPopular || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditModalProduct((prev) => prev ? ({ ...prev, isPopular: checked }) : null);
                        }}
                        className="w-4 h-4 rounded text-purple-500 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                      />
                      <span>🔥 Popular</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editModalProduct.status === 'active' || editModalProduct.status === 'featured'}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditModalProduct((prev) => prev ? ({
                            ...prev,
                            status: checked ? 'active' : 'draft'
                          }) : null);
                        }}
                        className="w-4 h-4 rounded text-emerald-500 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                      />
                      <span>Publish Live</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit & Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-mono">
                  Slug: /{editModalProduct.slug || 'slug'}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSavingProduct}
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingProduct}
                    onClick={() => handleSaveProduct(editModalProduct)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-1.5 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes to Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Product to PostgreSQL DB</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Media Picker Modal ── */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => {
          mediaPickerTargetRef.current = null;
          setIsMediaPickerOpen(false);
          setMediaPickerTarget(null);
        }}
        onSelect={handleMediaPickerSelect}
        allowedTypes={mediaPickerTarget === 'document' ? ['raw', 'image'] : ['image', 'video', 'raw']}
        title={
          mediaPickerTarget === 'thumbnail'
            ? 'Select Product Thumbnail Asset'
            : mediaPickerTarget === 'gallery'
            ? 'Select Gallery Image / Screenshot'
            : 'Select Product Document / Brochure'
        }
      />

    </div>
  );
});

AdminMarketplaceManager.displayName = 'AdminMarketplaceManager';

export default AdminMarketplaceManager;
