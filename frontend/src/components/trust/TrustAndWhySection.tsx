import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  CheckCircle2, 
  Shield, 
  Cross, 
  Award, 
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
  TrendingUp
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  photo: string;
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

export const TrustAndWhySection: React.FC = React.memo(() => {
  // ── CARD 1: WHY CHOOSE DEZORYN (PROGRESSIVE FEATURE REVEAL) ──
  const whyPoints = [
    {
      title: 'Innovative & Scalable AI Solutions',
      desc: 'High-throughput multi-tenant SaaS & predictive AI engines.',
      icon: Cpu,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40'
    },
    {
      title: 'Enterprise Grade Security',
      desc: '256-bit AES encryption, SOC-2 Type II & automated RBAC.',
      icon: Lock,
      color: 'text-blue-400',
      border: 'border-blue-500/40'
    },
    {
      title: 'User Friendly & Modern Glass UI',
      desc: 'Intuitive reactive dashboards with zero learning curve.',
      icon: Layers,
      color: 'text-purple-400',
      border: 'border-purple-500/40'
    },
    {
      title: 'Real-Time Enterprise Analytics',
      desc: 'Instant reporting, predictive forecasting & AI insights.',
      icon: Activity,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40'
    },
    {
      title: '24/7 Dedicated Priority Support',
      desc: 'Direct SLA guarantees & dedicated customer success manager.',
      icon: Shield,
      color: 'text-pink-400',
      border: 'border-pink-500/40'
    },
    {
      title: 'Automated Multi-Cloud Sync',
      desc: 'Continuous zero-downtime CI/CD deployment pipelines.',
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-500/40'
    }
  ];

  const [activeWhyIdx, setActiveWhyIdx] = useState<number>(0);
  const [isWhyHovered, setIsWhyHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isWhyHovered) return;
    const interval = setInterval(() => {
      setActiveWhyIdx((prev) => (prev + 1) % whyPoints.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isWhyHovered, whyPoints.length]);

  // ── CARD 2: CLIENT SUCCESS STORIES (TESTIMONIAL CAROUSEL) ──
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Mr. Rajesh Sharma',
      role: 'Director',
      company: 'Wisdom Public School',
      quote: "SchoolyCore completely transformed our 12,000-student campus operations. Automated fee billing and parent updates saved 300+ staff hours monthly.",
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      industry: 'EDUCATION ERP',
      metric: '300+ Hours Saved Monthly',
      icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
    },
    {
      id: '2',
      name: 'Dr. Ananya Roy',
      role: 'Chief Medical Officer',
      company: 'Apex Multi-Specialty Hospital',
      quote: "Dezo HealthCare OS eliminated OPD queue bottlenecks across 4 branches. Doctor scheduling and EHR records sync seamlessly with 0ms latency.",
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      industry: 'HEALTHCARE OS',
      metric: '0ms Patient Data Latency',
      icon: <Cross className="w-4 h-4 text-purple-400" />
    },
    {
      id: '3',
      name: 'Vikramaditya Verma',
      role: 'CTO',
      company: 'Greenfield International',
      quote: "Dezoryn's predictive CRM & AI Copilot streamlined our global B2B sales pipeline. We closed complex enterprise contracts 40% faster.",
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      industry: 'ENTERPRISE SAAS',
      metric: '40% Faster Deal Velocity',
      icon: <Award className="w-4 h-4 text-blue-400" />
    },
    {
      id: '4',
      name: 'Sophia Chen',
      role: 'Head of Operations',
      company: 'Maxwell Industries',
      quote: "The real-time inventory webhooks and biometric attendance integrations are flawless. Best software investment our leadership made.",
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      industry: 'MANUFACTURING',
      metric: '99.99% Operational Uptime',
      icon: <Hexagon className="w-4 h-4 text-purple-400" />
    }
  ];

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isTestimonialHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isTestimonialHovered, testimonials.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 35, 
      scale: 0.96 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring' as const, 
        stiffness: 110, 
        damping: 16, 
        mass: 0.85 
      }
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── 1. VERY FAINT GRID PATTERN (OPACITY < 10%) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.04] dark:opacity-[0.07] pointer-events-none -z-10" />

      {/* ── 2. VIEWPORT-GATED MOVING GRADIENT BLOBS (OPACITY < 10%) ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3, x: [0, 30, 0], y: [0, -20, 0] }}
        viewport={{ amount: 0.1 }}
        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-80 h-80 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none -z-10 transform-gpu" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3, x: [0, -40, 0], y: [0, 30, 0] }}
        viewport={{ amount: 0.1 }}
        transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-2xl pointer-events-none -z-10 transform-gpu" 
      />

      {/* ── 3. ANIMATED LIGHT STREAK (DIAGONAL SWEEP) ── */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'linear', repeatDelay: 6 }}
        className="absolute -top-40 left-0 w-[500px] h-[800px] bg-gradient-to-r from-transparent via-cyan-400/[0.04] to-transparent transform -rotate-45 pointer-events-none -z-10"
      />

      {/* ── 4. FLOATING AMBIENT PARTICLES (OPACITY < 10%) ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {[
          { top: '15%', left: '8%', size: 'w-2 h-2', dur: 12, delay: 0 },
          { top: '75%', left: '18%', size: 'w-1.5 h-1.5', dur: 16, delay: 2 },
          { top: '30%', left: '42%', size: 'w-2.5 h-2.5', dur: 14, delay: 1 },
          { top: '80%', left: '55%', size: 'w-2 h-2', dur: 18, delay: 3 },
          { top: '20%', left: '78%', size: 'w-1.5 h-1.5', dur: 15, delay: 0.5 },
          { top: '65%', left: '88%', size: 'w-2.5 h-2.5', dur: 20, delay: 4 },
        ].map((p, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -35, 0], 
              x: [0, 12, 0], 
              opacity: [0.03, 0.08, 0.03],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: p.dur, 
              delay: p.delay,
              ease: 'easeInOut' 
            }}
            style={{ top: p.top, left: p.left }}
            className={`absolute ${p.size} rounded-full bg-cyan-400 blur-[1px] opacity-[0.06]`}
          />
        ))}
      </div>

      {/* ── 5. SLOW GLOWING LIGHT NODES ── */}
      <motion.div
        animate={{ opacity: [0.03, 0.07, 0.03], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-cyan-400 blur-md pointer-events-none opacity-[0.06] -z-10"
      />
      <motion.div
        animate={{ opacity: [0.02, 0.06, 0.02], scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-1/4 right-1/3 w-4 h-4 rounded-full bg-blue-500 blur-md pointer-events-none opacity-[0.06] -z-10"
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          
          {/* ============================================================ */}
          {/* CARD 1: WHY CHOOSE DEZORYN (PROGRESSIVE FEATURE HIGHLIGHT)   */}
          {/* ============================================================ */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => setIsWhyHovered(true)}
            onMouseLeave={() => setIsWhyHovered(false)}
            className="lg:col-span-4 bg-white/95 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 text-left shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/20 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-cyan-500/50 dark:hover:border-cyan-400/60 group/card1"
          >
            {/* Hover Moving Gradient Highlight Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 opacity-0 group-hover/card1:opacity-100 transition-opacity duration-500" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-cyan-500/20 group-hover/card1:border-cyan-400/40 transition-colors">
                  WHY CHOOSE DEZORYN
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
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
                <span>FEATURE 0{activeWhyIdx + 1} / 05</span>
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

            <div className="flex-1 flex flex-col justify-between">
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/20 group-hover/card2:border-purple-400/40 transition-colors">
                  CLIENT SUCCESS STORIES
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-transparent">
                  {testimonials[currentSlide].industry}
                </span>
              </div>

              {/* Animated Testimonial Content */}
              <div className="relative flex-1 flex flex-col justify-center my-2 z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonials[currentSlide].id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="space-y-3"
                  >
                    {/* Executive Avatar + Name Header */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonials[currentSlide].photo} 
                        alt={testimonials[currentSlide].name} 
                        className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500/40 dark:border-cyan-500/40 shadow-lg shadow-blue-500/15 dark:shadow-cyan-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {testimonials[currentSlide].name}
                          </h3>
                          {testimonials[currentSlide].icon}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                          {testimonials[currentSlide].role}, <span className="text-blue-600 dark:text-cyan-400 font-bold">{testimonials[currentSlide].company}</span>
                        </span>
                      </div>
                    </div>

                    {/* Testimonial Quote Body */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">
                      "{testimonials[currentSlide].quote}"
                    </p>

                    {/* Key Impact Metric Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/20 text-blue-700 dark:text-cyan-300 font-extrabold text-[10px]">
                      <TrendingUp className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                      <span>{testimonials[currentSlide].metric}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
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
                        ? 'w-5 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 shadow-md shadow-blue-500/30' 
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Navigation Arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-slate-200/90 dark:border-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-slate-200/90 dark:border-slate-700"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </motion.div>

          {/* ============================================================ */}
          {/* CARD 3: OUR TRUSTED CLIENTS (CONTINUOUS INFINITE AUTO-MARQUEE)*/}
          {/* ============================================================ */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => setIsClientsHovered(true)}
            onMouseLeave={() => setIsClientsHovered(false)}
            className="lg:col-span-4 bg-white/95 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 text-left shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-400/60 group/card3"
          >
            {/* Hover Moving Gradient Highlight Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-0 group-hover/card3:opacity-100 transition-opacity duration-500" />

            <div className="flex-1 flex flex-col justify-between">
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 group-hover/card3:border-emerald-400/40 transition-colors">
                  OUR TRUSTED CLIENTS
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {isClientsHovered ? 'PAUSED' : '20+ INSTITUTIONS'}
                </span>
              </div>

              {/* Vertical Auto-Scrolling Logo Container (Flex-1 to perfectly fill card height) */}
              <div className="flex-1 min-h-[280px] max-h-[300px] overflow-hidden relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 p-2">
                {/* Fade Mask Gradients (Top & Bottom) */}
                <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                <motion.div
                  animate={{ y: isClientsHovered ? 0 : [0, -320] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 18, 
                    ease: 'linear' 
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  {/* Render Trusted Clients twice for seamless looping marquee */}
                  {[...trustedClients, ...trustedClients].map((client, idx) => (
                    <motion.div
                      key={`${client.id}-${idx}`}
                      whileHover={{ scale: 1.04, y: -1 }}
                      className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-500/50 dark:hover:border-cyan-400/50 hover:shadow-md hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-1 group/client"
                    >
                      <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${client.accent} group-hover/client:scale-110 transition-transform`}>
                        {client.icon}
                      </div>
                      <div className="w-full min-w-0">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 tracking-tight leading-tight uppercase block truncate font-['Plus_Jakarta_Sans']">
                          {client.name}
                        </span>
                        <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-widest block mt-0.5">
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
});
