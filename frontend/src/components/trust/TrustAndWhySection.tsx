import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  CheckCircle2, 
  Shield, 
  Cross, 
  Star, 
  Activity, 
  Hexagon, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  Sparkles, 
  Zap, 
  Building2, 
  Cpu, 
  Globe, 
  Lock, 
  Layers, 
  TrendingUp,
  User
} from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  photo: string | null;
  industry: string;
  metric: string;
  icon: React.ReactNode;
}

interface ClientLogo {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  accent: string;
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const TrustAndWhySection: React.FC = () => {
  const [activeWhyIdx, setActiveWhyIdx] = useState<number>(0);
  const [isWhyHovered, setIsWhyHovered] = useState<boolean>(false);

  // ── CARD 1: WHY CHOOSE DEZORYN (PROGRESSIVE FEATURE REVEAL) ──
  const whyPoints = [
    {
      title: 'Innovative & Scalable AI Solutions',
      desc: 'High-throughput multi-tenant SaaS & predictive AI engines.',
      icon: Cpu,
      color: 'text-cyan-500 dark:text-cyan-400',
      border: 'border-cyan-500/40'
    },
    {
      title: 'Enterprise Grade Security',
      desc: '256-bit AES encryption, SOC-2 Type II & automated RBAC.',
      icon: Lock,
      color: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-500/40'
    },
    {
      title: 'User Friendly & Modern Glass UI',
      desc: 'Intuitive reactive dashboards with zero learning curve.',
      icon: Layers,
      color: 'text-purple-500 dark:text-purple-400',
      border: 'border-purple-500/40'
    },
    {
      title: 'Real-Time Enterprise Analytics',
      desc: 'Instant reporting, predictive forecasting & AI insights.',
      icon: Activity,
      color: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500/40'
    },
    {
      title: '24/7 Dedicated Priority Support',
      desc: 'Direct SLA guarantees & dedicated customer success manager.',
      icon: Shield,
      color: 'text-pink-500 dark:text-pink-400',
      border: 'border-pink-500/40'
    },
    {
      title: 'Automated Multi-Cloud Sync',
      desc: 'Continuous zero-downtime CI/CD deployment pipelines.',
      icon: Zap,
      color: 'text-amber-500 dark:text-amber-400',
      border: 'border-amber-500/40'
    }
  ];

  useEffect(() => {
    if (isWhyHovered) return;
    const interval = setInterval(() => {
      setActiveWhyIdx((prev) => (prev + 1) % whyPoints.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isWhyHovered, whyPoints.length]);

  // ── CARD 2: CLIENT SUCCESS STORIES (DYNAMIC DATABASE SYNC) ──
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState<boolean>(false);

  const fetchLiveTestimonials = async () => {
    try {
      const res = await apiFetch(`${API_URL}/testimonials?enabled=true`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: Testimonial[] = data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.designation || 'Client Executive',
          company: item.company || 'Enterprise Partner',
          quote: item.review,
          photo: item.photo ? resolveMediaUrl(item.photo) : null,
          industry: item.company ? item.company.toUpperCase() : 'VERIFIED CLIENT',
          metric: `${item.rating || 5}.0 ★ Verified Review`,
          icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        }));
        setTestimonials(mapped);
        setCurrentSlide(0);
      }
    } catch {
      setTestimonials([]);
    }
  };

  useEffect(() => {
    fetchLiveTestimonials();
    window.addEventListener('dezoryn-testimonials-updated', fetchLiveTestimonials);
    return () => {
      window.removeEventListener('dezoryn-testimonials-updated', fetchLiveTestimonials);
    };
  }, []);

  useEffect(() => {
    if (isTestimonialHovered || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isTestimonialHovered, testimonials.length]);

  const handleNextSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // ── CARD 3: OUR TRUSTED CLIENTS (INTERACTIVE LOGO MARQUEE) ──
  const [isClientsHovered, setIsClientsHovered] = useState<boolean>(false);

  const trustedClients: ClientLogo[] = [
    { id: '1', name: 'Apex Hospital', category: 'Healthcare', icon: <Cross className="w-4 h-4" />, accent: 'text-purple-400' },
    { id: '2', name: 'Wisdom Academy', category: 'Education', icon: <Star className="w-4 h-4" />, accent: 'text-amber-400' },
    { id: '3', name: 'Greenfield B2B', category: 'Enterprise', icon: <Building2 className="w-4 h-4" />, accent: 'text-blue-400' },
    { id: '4', name: 'Maxwell Corp', category: 'Logistics', icon: <Hexagon className="w-4 h-4" />, accent: 'text-emerald-400' },
    { id: '5', name: 'St. Jude Health', category: 'Medical', icon: <Shield className="w-4 h-4" />, accent: 'text-rose-400' },
    { id: '6', name: 'Horizon Tech', category: 'Cloud AI', icon: <Globe className="w-4 h-4" />, accent: 'text-cyan-400' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const activeTestimonial = testimonials[currentSlide] || null;

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      {/* Background Ambient Glow Lights */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 dark:bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

        {/* Section Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-cyan-400 text-xs font-black uppercase tracking-wider mb-4 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 animate-pulse" />
            <span>ENTERPRISE EXCELLENCE & TRUST</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]"
          >
            Why Industry Leaders Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Dezoryn Technologies
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-4 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Proven scalability, automated compliance, and predictive AI engineered for modern hospitals, schools, logistics, and B2B enterprises.
          </motion.p>
        </div>

        {/* 3 Interactive Grid Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch"
        >

          {/* ============================================================ */}
          {/* CARD 1: WHY CHOOSE DEZORYN (PROGRESSIVE FEATURE REVEAL)      */}
          {/* ============================================================ */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => setIsWhyHovered(true)}
            onMouseLeave={() => setIsWhyHovered(false)}
            className="lg:col-span-4 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 text-left shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group/card1 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-400/60"
          >
            {/* Hover Moving Gradient Highlight Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 opacity-0 group-hover/card1:opacity-100 transition-opacity duration-500" />

            {/* Glowing Corner Ambient Dot */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex-1">
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20 group-hover/card1:border-blue-400/40 transition-colors">
                  WHY CHOOSE DEZORYN
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-cyan-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                  LIVE REVEAL
                </span>
              </div>

              {/* Feature Items List */}
              <div className="space-y-2.5 mt-3">
                {whyPoints.map((point, idx) => {
                  const IconComp = point.icon;
                  const isActive = idx === activeWhyIdx;
                  const isPassed = idx <= activeWhyIdx;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ 
                        opacity: isPassed ? 1 : 0.45, 
                        x: 0,
                        scale: isActive ? 1.01 : 1 
                      }}
                      transition={{ duration: 0.35 }}
                      className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-start gap-3 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 border-blue-500 dark:bg-none dark:bg-slate-950/90 dark:border-cyan-500/40 dark:shadow-cyan-500/10 ring-1 ring-blue-400/40 dark:ring-cyan-500/30' 
                          : isPassed
                            ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/40 text-slate-400 opacity-50'
                      }`}
                    >
                      {/* Icon with soft pulse */}
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white dark:bg-slate-800 dark:text-cyan-400' : 'bg-slate-100 dark:bg-slate-800 ' + point.color} shrink-0 mt-0.5 relative`}>
                        <IconComp className="w-3.5 h-3.5" />
                        {isActive && (
                          <motion.span 
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-lg bg-white/30 dark:bg-cyan-400/30"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-extrabold ${isActive ? 'text-white dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                            {point.title}
                          </h4>
                          {isActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-cyan-400 shrink-0 ml-1" />
                          )}
                        </div>
                        <p className={`text-[10px] font-medium leading-tight mt-0.5 line-clamp-1 ${isActive ? 'text-blue-100 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {point.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Progress Rotation Indicator */}
            <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                <span>FEATURE 0{activeWhyIdx + 1} / 06</span>
                <span>{isWhyHovered ? 'PAUSED' : 'AUTO ROTATING (2.5s)'}</span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  key={activeWhyIdx}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: isWhyHovered ? 0 : 2.5, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>

          </motion.div>

          {/* ============================================================ */}
          {/* CARD 2: CLIENT SUCCESS STORIES (TESTIMONIAL CAROUSEL)        */}
          {/* ============================================================ */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => setIsTestimonialHovered(true)}
            onMouseLeave={() => setIsTestimonialHovered(false)}
            className="lg:col-span-4 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 text-left shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group/card2 transition-all duration-300 hover:border-purple-500/50 dark:hover:border-purple-400/60"
          >
            {/* Hover Moving Gradient Highlight Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 opacity-0 group-hover/card2:opacity-100 transition-opacity duration-500" />

            {/* Soft Glowing Quotation Mark Background Watermark */}
            <div className="absolute top-2 right-2 text-blue-500/10 dark:text-cyan-500/10 pointer-events-none">
              <Quote className="w-28 h-28 rotate-12" />
            </div>

            {testimonials.length === 0 ? (
              <div className="flex-1 flex flex-col justify-between">
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/20">
                    CLIENT SUCCESS STORIES
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-extrabold text-[10px]">
                    LIVE CMS SYNC
                  </span>
                </div>

                {/* Empty State */}
                <div className="relative flex-1 flex flex-col items-center justify-center text-center p-4 z-10 space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Quote className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Customer Reviews</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    Add new customer feedback in the Admin Testimonials CMS to display them live here.
                  </p>
                </div>

                {/* Footer status */}
                <div className="pt-3 mt-3 border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 relative z-10">
                  <span>0 active reviews</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">Instant Update</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/20 group-hover/card2:border-purple-400/40 transition-colors">
                    CLIENT SUCCESS STORIES
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-transparent">
                    {activeTestimonial?.industry}
                  </span>
                </div>

                {/* Animated Testimonial Content */}
                <div className="relative flex-1 flex flex-col justify-center my-2 z-10">
                  <AnimatePresence mode="wait">
                    {activeTestimonial && (
                      <motion.div
                        key={activeTestimonial.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="space-y-3"
                      >
                        {/* Executive Avatar + Name Header */}
                        <div className="flex items-center gap-3">
                          {activeTestimonial.photo ? (
                            <img 
                              src={activeTestimonial.photo} 
                              alt={activeTestimonial.name} 
                              className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500/40 dark:border-cyan-500/40 shadow-lg shadow-blue-500/15 dark:shadow-cyan-500/20 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                              {activeTestimonial.name ? getInitials(activeTestimonial.name) : <User className="w-5 h-5" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                {activeTestimonial.name}
                              </h3>
                              {activeTestimonial.icon}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                              {activeTestimonial.role}, <span className="text-blue-600 dark:text-cyan-400 font-bold">{activeTestimonial.company}</span>
                            </span>
                          </div>
                        </div>

                        {/* Testimonial Quote Body */}
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed line-clamp-4">
                          "{activeTestimonial.quote}"
                        </p>

                        {/* Key Impact Metric Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/20 text-blue-700 dark:text-cyan-300 font-extrabold text-[10px]">
                          <TrendingUp className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                          <span>{activeTestimonial.metric}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Controls: Carousel Indicators + Prev/Next Hover Arrows */}
                <div className="pt-3 mt-3 border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                    0{currentSlide + 1} / 0{testimonials.length}
                  </span>

                  {/* Slide Pill Segment Indicators */}
                  <div className="flex items-center gap-1.5">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentSlide
                            ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next Click Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Previous testimonial"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Next testimonial"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>

          {/* ============================================================ */}
          {/* CARD 3: OUR TRUSTED CLIENTS (INTERACTIVE LOGO MARQUEE)       */}
          {/* ============================================================ */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => setIsClientsHovered(true)}
            onMouseLeave={() => setIsClientsHovered(false)}
            className="lg:col-span-3 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 text-left shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/20 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group/card3 transition-all duration-300 hover:border-cyan-500/50 dark:hover:border-cyan-400/60"
          >
            {/* Hover Moving Gradient Highlight Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-0 group-hover/card3:opacity-100 transition-opacity duration-500" />

            <div className="flex-1">
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-cyan-500/20 group-hover/card3:border-cyan-400/40 transition-colors">
                  OUR TRUSTED CLIENTS
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-400">
                  {isClientsHovered ? 'PAUSED' : 'AUTO SCROLL'}
                </span>
              </div>

              {/* Mini Clients Grid / Vertical Marquee Effect */}
              <div className="relative overflow-hidden py-1 h-[215px]">
                <motion.div
                  animate={{ y: isClientsHovered ? 0 : [0, -130] }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: 'reverse', 
                    duration: 9, 
                    ease: 'easeInOut' 
                  }}
                  className="space-y-2"
                >
                  {[...trustedClients, ...trustedClients].map((client, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03, x: 3 }}
                      className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 hover:border-cyan-400/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 ${client.accent} shrink-0`}>
                          {client.icon}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {client.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

            </div>

            {/* Bottom Status */}
            <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                Global Deployment
              </span>
              <span className="text-blue-600 dark:text-cyan-400 font-extrabold">100% Uptime SLA</span>
            </div>

          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
