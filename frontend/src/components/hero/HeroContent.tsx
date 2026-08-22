import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';


const DEFAULT_HERO_DATA = {
  badgeText: 'DEZORYN 3.0 ENTERPRISE SUITE',
  badgeIcon: 'Sparkles',
  mainHeading: 'Autonomous Operations for',
  gradientHeading: 'Modern Enterprises',
  description: 'Dezoryn Technologies unifies ERP, CRM, and AI automation into a single intelligent operating platform. Streamline workflows, scale operations, and boost productivity.',
  primaryBtnText: 'Explore Solution',
  primaryBtnLink: '/products',
  secondaryBtnText: 'Schedule Demo',
  secondaryBtnLink: '/book-demo',
  statsCards: [
    { id: '1', label: 'Enterprise Growth', value: '4.8x', subtext: '+140% YoY' },
    { id: '2', label: 'Automation Rate', value: '99.9%', subtext: 'Zero Latency' },
    { id: '3', label: 'Active Workflows', value: '10M+', subtext: 'Global Fleet' },
  ],
  techTags: ['AI Core 3.0', 'Enterprise ERP', 'PostgreSQL', 'React 18', 'Prisma ORM', 'JWT RBAC'],
};

// ─────────────────────────────────────────────────────────────
// STATS COUNTER COMPONENT (Counts up smoothly from 0)
// ─────────────────────────────────────────────────────────────
interface StatItemProps {
  value: string;
  label: string;
  subtext?: string;
  delay: number;
}

const StatCounterItem: React.FC<StatItemProps> = ({ value, label, subtext, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay + 0.4 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="group relative flex flex-col p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md cursor-pointer transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-400/60 dark:hover:border-cyan-500/60"
    >
      <div className="flex items-center gap-1.5 justify-between">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
          {value}
        </span>
        {subtext && (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {subtext}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
        {label}
      </span>

      {/* Tiny Animated Underline on Hover */}
      <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-violet-500 rounded-full transition-all duration-300 mt-2" />
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────
// ENTERPRISE HERO CTA BUTTON COMPONENT
// ─────────────────────────────────────────────────────────────
interface EnterpriseCTAButtonProps {
  href?: string;
  variant: 'primary' | 'demo' | 'contact';
  children: React.ReactNode;
  icon?: React.ReactNode;
  showHoverArrow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const EnterpriseCTAButton: React.FC<EnterpriseCTAButtonProps> = ({
  href: _href,
  variant,
  children,
  icon,
  showHoverArrow = false,
  onClick,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [shineKey, setShineKey] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const maxTiltDeg = variant === 'primary' ? 2 : 1.5;
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTiltDeg, -maxTiltDeg]), { stiffness: 400, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTiltDeg, maxTiltDeg]), { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);

    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(120px circle at ${mouseX}px ${mouseY}px, ${variant === 'primary' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(6, 182, 212, 0.25)'
        }, transparent 80%)`;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShineKey((prev) => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    x.set(0);
    y.set(0);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white border-blue-400/40 shadow-lg shadow-blue-600/30 dark:shadow-cyan-500/20',
          arrowOffset: 4,
        };
      case 'demo':
        return {
          button: 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-cyan-400 dark:hover:border-cyan-500',
          arrowOffset: 3,
        };
      case 'contact':
        return {
          button: 'bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800',
          arrowOffset: 0,
        };
    }
  };

  const styleConfig = getVariantStyles();

  return (
    <div className="perspective-1000 w-full sm:w-auto inline-block">
      <motion.button
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isPressed ? 0.96 : isHovered ? 1.02 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
          mass: 0.6,
        }}
        className={`relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-sm select-none cursor-pointer border ${styleConfig.button}`}
      >
        {/* CURSOR SPOTLIGHT LAYER */}
        <div
          ref={spotlightRef}
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* GLASS SHINE SWEEP ON HOVER */}
        {isHovered && (
          <motion.div
            key={shineKey}
            initial={{ x: '-150%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 dark:via-white/25 to-transparent skew-x-[-20deg] pointer-events-none z-20"
          />
        )}

        {/* BUTTON TEXT & ARROW */}
        <span className="relative z-10 flex items-center gap-2 tracking-tight">
          {children}
          {icon && (
            <motion.span
              animate={{
                x: isHovered ? styleConfig.arrowOffset : 0,
                opacity: showHoverArrow ? (isHovered ? 1 : 0) : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              className="inline-block"
            >
              {icon}
            </motion.span>
          )}
        </span>
      </motion.button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// HERO CONTENT COMPONENT (Direct PostgreSQL Database Fetch)
// ─────────────────────────────────────────────────────────────
export const HeroContent: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();

  const [heroData, setHeroData] = useState(DEFAULT_HERO_DATA);

  // Fetch Hero Section content directly from PostgreSQL Database API on mount
  useEffect(() => {
    apiFetch('/hero')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const fetched = {
            badgeText: data.data.badgeText || DEFAULT_HERO_DATA.badgeText,
            badgeIcon: data.data.badgeIcon || DEFAULT_HERO_DATA.badgeIcon,
            mainHeading: data.data.mainHeading || DEFAULT_HERO_DATA.mainHeading,
            gradientHeading: data.data.gradientHeading || DEFAULT_HERO_DATA.gradientHeading,
            description: data.data.description || DEFAULT_HERO_DATA.description,
            primaryBtnText: data.data.primaryBtnText || DEFAULT_HERO_DATA.primaryBtnText,
            primaryBtnLink: data.data.primaryBtnLink || DEFAULT_HERO_DATA.primaryBtnLink,
            secondaryBtnText: data.data.secondaryBtnText || DEFAULT_HERO_DATA.secondaryBtnText,
            secondaryBtnLink: data.data.secondaryBtnLink || DEFAULT_HERO_DATA.secondaryBtnLink,
            statsCards: Array.isArray(data.data.statsCards) && data.data.statsCards.length > 0 ? data.data.statsCards : DEFAULT_HERO_DATA.statsCards,
            techTags: Array.isArray(data.data.techTags) && data.data.techTags.length > 0 ? data.data.techTags : DEFAULT_HERO_DATA.techTags,
          };
          if (JSON.stringify(fetched) !== JSON.stringify(DEFAULT_HERO_DATA)) {
            setHeroData(fetched);
          }
        }
      })
      .catch(() => {
        // Fallback silently if API is offline
      });
  }, []);

  const tagIcons = [Zap, CheckCircle2, ShieldCheck, TrendingUp];

  return (
    <div className="flex flex-col items-start text-left max-w-xl xl:max-w-2xl py-2 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Category Subtitle Badge */}
      <span className="text-xs sm:text-sm font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        {heroData.badgeText}
      </span>

      {/* Main Heading (Instant Paint for Optimal LCP) */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-4 select-none">
        <motion.span
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-block hover:text-slate-800 dark:hover:text-cyan-100 transition-colors duration-300"
        >
          {heroData.mainHeading}
        </motion.span>{' '}
        <br />
        <motion.span
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-block bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 bg-clip-text text-transparent drop-shadow-xs hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300"
        >
          {heroData.gradientHeading}
        </motion.span>
      </h1>

      {/* Product Tag Chips Strip */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {heroData.techTags.map((tagName, idx) => {
          const TagIcon = tagIcons[idx % tagIcons.length];
          const getTagRoute = (tag: string) => {
            const lower = tag.toLowerCase();
            if (lower.includes('ai')) return '/product-detail?id=sales-ai-copilot';
            if (lower.includes('erp')) return '/product-detail?id=schoolycore';
            if (lower.includes('react') || lower.includes('web')) return '/services#web-dev';
            if (lower.includes('postgres') || lower.includes('prisma') || lower.includes('sql')) return '/api-docs';
            if (lower.includes('jwt') || lower.includes('rbac') || lower.includes('auth')) return '/admin';
            return '/products';
          };
          return (
            <motion.div
              key={tagName}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 4 + idx * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idx * 0.2,
              }}
              whileHover={{ y: -4, rotate: 1, scale: 1.03 }}
              onClick={() => navigateTo(getTagRoute(tagName) as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-cyan-500/20 dark:border-cyan-500/30 text-xs font-extrabold text-slate-800 dark:text-slate-200 shadow-xs backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300"
            >
              <TagIcon className="w-3.5 h-3.5 text-cyan-500" />
              <span>{tagName}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Description Paragraph */}
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-lg font-normal">
        {heroData.description}
      </p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-10"
      >
        {/* Primary CTA */}
        <EnterpriseCTAButton
          href={heroData.primaryBtnLink}
          variant="primary"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={(e) => {
            e.preventDefault();
            navigateTo(heroData.primaryBtnLink as any);
          }}
        >
          {heroData.primaryBtnText}
        </EnterpriseCTAButton>

        {/* Secondary CTA */}
        <EnterpriseCTAButton
          href={heroData.secondaryBtnLink}
          variant="demo"
          icon={<ArrowRight className="w-4 h-4" />}
          showHoverArrow={true}
          onClick={(e) => {
            e.preventDefault();
            navigateTo(heroData.secondaryBtnLink as any);
          }}
        >
          {heroData.secondaryBtnText}
        </EnterpriseCTAButton>
      </motion.div>

      {/* Enterprise Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
        {heroData.statsCards.map((stat, idx) => (
          <StatCounterItem
            key={stat.id || idx}
            value={stat.value}
            label={stat.label}
            subtext={stat.subtext}
            delay={0.4 + idx * 0.1}
          />
        ))}
      </div>
    </div>
  );
});
