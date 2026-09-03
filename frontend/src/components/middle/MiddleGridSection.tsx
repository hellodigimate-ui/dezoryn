import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Cross,
  Hotel,
  Building2,
  ShoppingBag,
  Factory,
  Truck,
  Landmark,
  Play,
  Monitor,
  Eye,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Rocket,
  Check,
  ArrowRight,
  ChevronDown,
  Tv
} from 'lucide-react';

import { useNavigation } from '../../utils/NavigationContext';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';


export interface ProductDemo {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  rating?: string;
  views?: string;
  duration?: string;
}

const DEFAULT_DEMOS: ProductDemo[] = [
  {
    id: 'demo-1',
    title: 'Hospital ERP Suite',
    subtitle: 'Next-Gen EHR, OPD Billing & Clinical Workflow',
    description: 'Automate inpatient admissions, doctor round charts, and pharmacy inventory in real time.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=75&w=500&fm=webp&auto=format&fit=crop',
    category: 'Healthcare',
    rating: '4.9',
    views: '18,500+',
    duration: '03:45'
  },
  {
    id: 'demo-2',
    title: 'SchoolyCore ERP',
    subtitle: 'Campus Operations & Automated Fee Billing',
    description: 'Complete 12,000-student campus automation, parent mobile apps & RFID attendance.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=75&w=500&fm=webp&auto=format&fit=crop',
    category: 'Education',
    rating: '4.9',
    views: '24,200+',
    duration: '04:15'
  },
  {
    id: 'demo-3',
    title: 'CRM AI Copilot',
    subtitle: 'Predictive B2B Sales & Automated Leads Pipeline',
    description: 'AI-driven lead scoring, automated WhatsApp outreach & real-time deal revenue forecasting.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=75&w=500&fm=webp&auto=format&fit=crop',
    category: 'Sales SaaS',
    rating: '4.8',
    views: '15,800+',
    duration: '02:50'
  },
  {
    id: 'demo-4',
    title: 'HRMS & Payroll Suite',
    subtitle: 'Biometric Attendance & Automated Statutory Tax',
    description: '1-click payroll disbursement, employee performance appraisal reviews & leave management.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=75&w=500&fm=webp&auto=format&fit=crop',
    category: 'Enterprise HR',
    rating: '4.9',
    views: '21,100+',
    duration: '03:10'
  }
];

// Resolve relative /uploads/ URLs to the backend server
const getVideoUrl = (url: string) => resolveMediaUrl(url);

export const MiddleGridSection: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();

  const [demos, setDemos] = useState<ProductDemo[]>([]);
  const [activeDemoIdx, setActiveDemoIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Spotlight mouse tracking state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const safeIdx = demos.length > 0 ? Math.min(activeDemoIdx, Math.max(0, demos.length - 1)) : 0;
  const activeDemo = demos[safeIdx] || DEFAULT_DEMOS[0];

  // Auto-changing demos every 7.0 seconds when not playing and not hovered
  useEffect(() => {
    if (isPlaying || isHovered || demos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveDemoIdx((prev) => (prev + 1) % demos.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, demos.length]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    product: 'SchoolyCore ERP',
    organization: '',
    usersCount: '',
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const res = await apiFetch(`${API_URL}/demos?active=true`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDemos(data.data);
        }
      } catch {
        // network fallback
      }
    };

    fetchDemos();
    window.addEventListener('focus', fetchDemos);
    window.addEventListener('dezoryn-demos-updated', fetchDemos);
    return () => {
      window.removeEventListener('focus', fetchDemos);
      window.removeEventListener('dezoryn-demos-updated', fetchDemos);
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch(API_URL + '/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name || 'Anonymous Demo Applicant',
          email: form.email,
          phone: form.mobile,
          company: form.organization,
          productInterest: form.product,
          message: `[Homepage Live Demo Request]: Product ${form.product} requested for organization ${form.organization || 'N/A'}.`,
        }),
      });
    } catch (_err) {}
    setIsSubmitting(false);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
    setForm({
      name: '',
      mobile: '',
      email: '',
      product: 'SchoolyCore ERP',
      organization: '',
      usersCount: '',
    });
  };

  return (
    <section
      id="solutions"
      onMouseMove={handleMouseMove}
      className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-white/5 transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden text-slate-900 dark:text-slate-100 group/section"
    >
      {/* ── 1. SVG FAINT NOISE TEXTURE OVERLAY ── */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay z-0">
        <filter id="enterpriseNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#enterpriseNoise)" />
      </svg>

      {/* ── 2. SPOTLIGHT CURSOR FOLLOWER ── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover/section:opacity-100 z-0"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 65%)`,
        }}
      />

      {/* ── 3. VIEWPORT-GATED AMBIENT RADIAL GLOWS ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-emerald-500/10 rounded-full blur-2xl pointer-events-none -z-10 transform-gpu" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1, scale: [1, 1.05, 1] }}
        viewport={{ amount: 0.1 }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-emerald-500/15 blur-2xl pointer-events-none -z-10 transform-gpu"
      />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{
          opacity: 0.25,
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        viewport={{ amount: 0.1 }}
        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-2xl pointer-events-none -z-10 transform-gpu"
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{
          opacity: 0.25,
          x: [0, -35, 0],
          y: [0, 30, 0],
        }}
        viewport={{ amount: 0.1 }}
        transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-2xl pointer-events-none -z-10 transform-gpu"
      />

      {/* ── 4. FLOATING MICRO PARTICLES ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {[
          { top: '15%', left: '8%', size: 'w-2 h-2', dur: 14, delay: 0 },
          { top: '65%', left: '20%', size: 'w-1.5 h-1.5', dur: 18, delay: 2 },
          { top: '30%', left: '45%', size: 'w-2.5 h-2.5', dur: 15, delay: 1 },
          { top: '80%', left: '62%', size: 'w-2 h-2', dur: 20, delay: 3 },
          { top: '22%', left: '85%', size: 'w-1.5 h-1.5', dur: 16, delay: 0.5 },
          { top: '55%', left: '92%', size: 'w-2.5 h-2.5', dur: 22, delay: 4 },
        ].map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -35, 0],
              x: [0, 12, 0],
              opacity: [0.03, 0.12, 0.03],
              scale: [1, 1.25, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: p.dur,
              delay: p.delay,
              ease: 'easeInOut'
            }}
            style={{ top: p.top, left: p.left }}
            className={`absolute ${p.size} rounded-full bg-blue-400 blur-[1px] opacity-10`}
          />
        ))}
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

        {/* ============================================================ */}
        {/* ── 2. STEP PROGRESS BAR BANNER (Vercel / Raycast Style) ── */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 backdrop-blur-2xl shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden group/banner"
        >
          {/* Shimmer highlight on header top border */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 via-purple-500/50 to-transparent" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">

            {/* Step 1 */}
            <div className="flex items-center gap-3.5">
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  boxShadow: ['0 0 12px rgba(59,130,246,0.25)', '0 0 24px rgba(59,130,246,0.5)', '0 0 12px rgba(59,130,246,0.25)']
                }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md"
              >
                01
              </motion.div>
              <div className="text-left">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">STEP ONE</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                  <span>Choose Industry</span>
                </h4>
              </div>
            </div>

            {/* Glowing Animated Connector Line 1 */}
            <div className="hidden md:flex flex-1 items-center px-6 relative">
              <div className="w-full h-1 bg-slate-800/80 relative overflow-hidden rounded-full border border-white/5">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-500 to-cyan-400 shadow-[0_0_15px_#3b82f6]"
                />
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 ml-2 animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3.5">
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  boxShadow: ['0 0 12px rgba(139,92,246,0.25)', '0 0 24px rgba(139,92,246,0.5)', '0 0 12px rgba(139,92,246,0.25)']
                }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
                className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md"
              >
                02
              </motion.div>
              <div className="text-left">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">STEP TWO</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                  <span>Watch Product Demo</span>
                </h4>
              </div>
            </div>

            {/* Glowing Animated Connector Line 2 */}
            <div className="hidden md:flex flex-1 items-center px-6 relative">
              <div className="w-full h-1 bg-slate-800/80 relative overflow-hidden rounded-full border border-white/5">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 1.2 }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500 to-emerald-400 shadow-[0_0_15px_#8b5cf6]"
                />
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2 animate-pulse drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3.5">
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  boxShadow: ['0 0 12px rgba(16,185,129,0.25)', '0 0 24px rgba(16,185,129,0.5)', '0 0 12px rgba(16,185,129,0.25)']
                }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 2 }}
                className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md"
              >
                03
              </motion.div>
              <div className="text-left">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">STEP THREE</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                  <span>Book Live Demo</span>
                  <Rocket className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                </h4>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* ── 3-COLUMN LAYOUT GRID ── */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">

          {/* ============================================================ */}
          {/* COLUMN 1: INTERACTIVE INDUSTRY EXPLORER (Step 01)            */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-white/95 dark:bg-slate-900/80 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 text-left shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden group/explorer"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  STEP 01 · INDUSTRY EXPLORER
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  8 VERTICALS
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-4 leading-relaxed">
                Select a vertical to explore tailored software & ERP suites.
              </p>

              {/* Industry Grid with Category Glow & Lift */}
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                {[
                  {
                    name: 'Healthcare',
                    icon: Cross,
                    count: '12 Products',
                    preview: ['Hospital ERP', 'EHR OPD Suite'],
                    accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                    border: 'hover:border-cyan-500/40 hover:shadow-[0_8px_25px_-5px_rgba(6,182,212,0.3)]',
                    route: '/product-detail?id=hms-health'
                  },
                  {
                    name: 'Education',
                    icon: GraduationCap,
                    count: '15 Products',
                    preview: ['SchoolyCore ERP', 'Campus App'],
                    accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    border: 'hover:border-blue-500/40 hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.3)]',
                    route: '/product-detail?id=schoolycore-erp'
                  },
                  {
                    name: 'Hospitality',
                    icon: Hotel,
                    count: '8 Solutions',
                    preview: ['Hotel PMS', 'Restaurant POS'],
                    accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    border: 'hover:border-emerald-500/40 hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.3)]',
                    route: '/marketplace?category=industry&search=hospitality'
                  },
                  {
                    name: 'Real Estate',
                    icon: Building2,
                    count: '10 Solutions',
                    preview: ['Property CRM', 'Leasing Suite'],
                    accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                    border: 'hover:border-purple-500/40 hover:shadow-[0_8px_25px_-5px_rgba(139,92,246,0.3)]',
                    route: '/marketplace?category=industry&search=real%20estate'
                  },
                  {
                    name: 'Retail',
                    icon: ShoppingBag,
                    count: '14 Products',
                    preview: ['Omnichannel POS', 'Inventory Core'],
                    accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    border: 'hover:border-amber-500/40 hover:shadow-[0_8px_25px_-5px_rgba(245,158,11,0.3)]',
                    route: '/product-detail?id=dezo-commerce-engine'
                  },
                  {
                    name: 'Manufacturing',
                    icon: Factory,
                    count: '11 Solutions',
                    preview: ['MRP Production', 'IoT Assembly'],
                    accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                    border: 'hover:border-indigo-500/40 hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.3)]',
                    route: '/marketplace?category=industry&search=manufacturing'
                  },
                  {
                    name: 'Logistics',
                    icon: Truck,
                    count: '9 Products',
                    preview: ['WMS Warehouse', 'Fleet Dispatch'],
                    accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                    border: 'hover:border-rose-500/40 hover:shadow-[0_8px_25px_-5px_rgba(244,63,94,0.3)]',
                    route: '/product-detail?id=inventory-pro'
                  },
                  {
                    name: 'Government',
                    icon: Landmark,
                    count: '7 Solutions',
                    preview: ['Public Portal', 'Citizen Services'],
                    accent: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
                    border: 'hover:border-teal-500/40 hover:shadow-[0_8px_25px_-5px_rgba(20,184,166,0.3)]',
                    route: '/marketplace?category=industry&search=government'
                  }
                ].map((ind, idx) => {
                  const IconComp = ind.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, y: -6 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      onClick={() => navigateTo(ind.route)}
                      className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 ${ind.border} hover:bg-blue-50/80 dark:hover:bg-gradient-to-b dark:hover:from-white/10 dark:hover:to-white/5 transition-all duration-300 cursor-pointer flex flex-col justify-between group/ind relative overflow-hidden backdrop-blur-md`}
                    >
                      {/* Floating Icon Header */}
                      <div className="flex items-center justify-between mb-2">
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: idx * 0.3 }}
                          className={`p-1.5 rounded-xl border ${ind.accent} group-hover/ind:scale-110 transition-transform shadow-sm`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </motion.div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {ind.count}
                        </span>
                      </div>

                      {/* Title & Micro Hover Preview */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover/ind:text-blue-600 dark:group-hover/ind:text-blue-400 transition-colors">
                          {ind.name}
                        </h4>

                        {/* Hover Preview Tooltip Bar */}
                        <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-slate-400 group-hover/ind:text-slate-200 transition-colors">
                          <span className="truncate">{ind.preview[0]}</span>
                          <ChevronRight className="w-3 h-3 group-hover/ind:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3.5 mt-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">
                85+ Enterprise Apps
              </span>
              <button
                type="button"
                onClick={() => navigateTo('/marketplace')}
                className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 transition-colors"
              >
                <span>View Solutions</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* ============================================================ */}
          {/* COLUMN 2: PREMIUM VIDEO SHOWCASE (Step 02 - PRIMARY FOCUS)    */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="lg:col-span-5 bg-white/95 dark:bg-slate-900/80 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 text-left shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-purple-500/40 group/showcase z-10"
          >
            {/* Soft Purple Glow Overlay inside primary focus card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    STEP 02 · WATCH PRODUCT DEMO
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {demos.length} {demos.length === 1 ? 'DEMO' : 'DEMOS'}
                </span>
              </div>

              {demos.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-100/60 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-3 my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">No Live Demos Configured</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Add and publish product demos in the Admin Demo CMS to showcase videos here.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* HD Large Video Player Container */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl aspect-video group/player">
                    {/* LIVE Badge Top Left */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/80 text-white font-black text-[10px] uppercase tracking-wider backdrop-blur-xl border border-red-400/30 shadow-lg shadow-red-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE DEMO
                    </div>

                    {/* Duration Badge Top Right */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 text-cyan-300 font-extrabold text-[10px] backdrop-blur-xl border border-white/15">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{(activeDemo as any).duration || '03:10'} HD</span>
                    </div>

                    <AnimatePresence mode="wait">
                      {isPlaying ? (
                        <motion.div
                          key="playing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full"
                        >
                          <video
                            key={activeDemo.id}
                            src={getVideoUrl(activeDemo.videoUrl)}
                            controls
                            autoPlay
                            preload="auto"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={activeDemo.id}
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4 }}
                          className="relative w-full h-full flex items-center justify-center cursor-pointer"
                          onClick={() => setIsPlaying(true)}
                        >
                          {/* Thumbnail Image */}
                          <img
                            src={getVideoUrl(activeDemo.thumbnailUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80')}
                            alt={activeDemo.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover/player:scale-105 transition-transform duration-700"
                          />

                          {/* Dark Layered Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                          {/* Glassmorphic Floating Play Button with Pulse Wave */}
                          <div className="relative z-20 flex items-center justify-center">
                            <span className="absolute w-20 h-20 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                            <span className="absolute w-24 h-24 rounded-full bg-purple-500/20 animate-pulse pointer-events-none" />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.95 }}
                              className="relative z-20 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.6)] backdrop-blur-xl border border-white/40 group-hover/player:border-white transition-all duration-300 cursor-pointer"
                            >
                              <Play className="w-7 h-7 fill-white text-white ml-1" />
                            </motion.button>
                          </div>

                          {/* Overlay Title on Video */}
                          <div className="absolute bottom-3 inset-x-4 z-20 text-left pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 bg-slate-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1 backdrop-blur-md">
                              {activeDemo.category || 'ENTERPRISE'}
                            </span>
                            <h3 className="text-sm font-black text-white truncate drop-shadow-md tracking-tight">
                              {activeDemo.title}
                            </h3>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Animated Auto-Rotation Progress Line */}
                    {!isPlaying && demos.length > 1 && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900 z-30 overflow-hidden">
                        <motion.div
                          key={activeDemoIdx}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: isHovered ? 0 : 7.0, ease: 'linear' }}
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Demo Metadata Details */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/50 border border-slate-200/90 dark:border-white/5 flex items-center justify-between gap-3 backdrop-blur-md">
                    <div className="min-w-0 text-left">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {activeDemo.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {activeDemo.subtitle || activeDemo.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        {(activeDemo as any).viewsText || (activeDemo.views ? (activeDemo.views.includes('Views') ? activeDemo.views : `${activeDemo.views} Views`) : '18,500+ Views')}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Carousel Selector Tabs */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {demos.map((demo, idx) => {
                      const isSelected = activeDemoIdx === idx;
                      return (
                        <button
                          key={demo.id}
                          type="button"
                          onClick={() => {
                            setActiveDemoIdx(idx);
                            setIsPlaying(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md'
                              : 'bg-slate-100/80 dark:bg-slate-950/40 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/5 backdrop-blur-md'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[10px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                              {demo.title.replace(' Demo', '').replace(' Suite', '')}
                            </span>
                            <Monitor className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                          </div>
                          <span className={`text-[9px] font-semibold block truncate mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {demo.category || 'SaaS'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Bottom CTA Buttons */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-white/5 flex items-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                disabled={demos.length === 0}
                onClick={() => setIsPlaying(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] hover:bg-right disabled:opacity-40 text-white font-extrabold text-xs shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-500 cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Live Demo</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigateTo('/book-demo')}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all duration-300 cursor-pointer border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 backdrop-blur-md flex items-center gap-1.5 shrink-0"
              >
                <span>Book Walkthrough</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>

          {/* ============================================================ */}
          {/* COLUMN 3: ENTERPRISE DEMO BOOKING FORM (Step 03)             */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 bg-white/95 dark:bg-slate-900/80 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 text-left shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden group/form"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                  STEP 03 · BOOK LIVE DEMO
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  500+ DEMOS
                </span>
              </div>

              {/* Enterprise Guarantee Perks Banner */}
              <div className="grid grid-cols-2 gap-2 p-3 mb-4 rounded-2xl bg-slate-100/90 dark:bg-slate-950/50 border border-slate-200/90 dark:border-white/10 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  30 Minute Demo
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Check className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  Personalized Consult
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Check className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  No Credit Card
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Check className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  2-Hour Response
                </span>
              </div>

              <AnimatePresence mode="wait">
                {formSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="p-6 my-4 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, ease: 'backOut' }}
                      className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40"
                    >
                      <Check className="w-8 h-8 stroke-[3]" />
                    </motion.div>

                    <div>
                      <h4 className="text-base font-black text-white">
                        🎉 Enterprise Demo Scheduled!
                      </h4>
                      <p className="text-xs font-semibold text-emerald-300 mt-1 leading-relaxed">
                        Our Senior Solution Architect will connect with you within 2 hours at <span className="font-extrabold underline text-white">{form.email || form.mobile || 'your contact'}</span>.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Priority Queue Confirmed</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleFormSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={form.mobile}
                          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@company.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                          Target Software *
                        </label>
                        <div className="relative">
                          <select
                            value={form.product}
                            onChange={(e) => setForm({ ...form, product: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white shadow-xs focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 cursor-pointer appearance-none pr-8"
                          >
                            <option value="Hospital ERP Suite" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hospital ERP Suite</option>
                            <option value="SchoolyCore ERP" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">SchoolyCore ERP</option>
                            <option value="CRM AI Copilot" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">CRM AI Copilot</option>
                            <option value="HRMS Suite" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">HRMS Suite</option>
                            <option value="Custom Enterprise SaaS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Custom Enterprise SaaS</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                          Org / Company *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Hospital"
                          value={form.organization}
                          onChange={(e) => setForm({ ...form, organization: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Schedule My Demo Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_100%] hover:bg-right text-white font-black text-xs shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-500 cursor-pointer flex items-center justify-center gap-2 border-none disabled:opacity-50 group/btn"
                    >
                      <span>{isSubmitting ? 'Securing Priority Slot...' : 'Schedule My Demo'}</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-3.5 mt-4 border-t border-white/10 dark:border-white/5 text-[10px] font-semibold text-slate-400 text-center flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" />
                SOC-2 & GDPR Compliant
              </span>
              <span className="text-slate-400">Instant 1-on-1 Walkthrough</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
});

