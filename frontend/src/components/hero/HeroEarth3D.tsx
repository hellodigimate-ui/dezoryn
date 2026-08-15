import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  GraduationCap,
  Cross,
  Users,
  Boxes,
  LayoutDashboard,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

// ─────────────────────────────────────────────────────────────
// 1. EXACT FIXED BUSINESS MODULES (Physical PCB Mounts)
// ─────────────────────────────────────────────────────────────
interface PCBModule {
  id: string;
  slot: 'top-left' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-right';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  accentColor: string;
  glowRgb: string;
  positionClasses: string;
  parallaxMultiplier: number;
  floatDelay: number;
  floatDuration: number;
  mainPath: string;
  secondaryPath: string;
  statusText: string;
  /** Route to navigate to when the user clicks this module card */
  route: string;
}

const PCB_MODULES: PCBModule[] = [
  {
    id: 'crm-platform',
    slot: 'top-left',
    title: 'CRM Platform',
    subtitle: 'Predictive Sales Engine',
    icon: <LayoutDashboard className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md shadow-sky-500/20',
    borderColor: 'rgba(56, 189, 248, 0.6)',
    accentColor: '#38bdf8',
    glowRgb: '56, 189, 248',
    positionClasses: 'top-[7%] left-[4%]',
    parallaxMultiplier: 0.8,
    floatDelay: 0.0,
    floatDuration: 2.8,
    mainPath: 'M 40 35 L 40 18 L 18 18 L 18 13',
    secondaryPath: 'M 40 18 L 6 18 L 6 32 L 2 32',
    statusText: 'AI Engine • Active 99.9%',
    route: '/product-detail?id=sales-ai-copilot',
  },
  {
    id: 'school-erp',
    slot: 'top-right',
    title: 'School ERP',
    subtitle: 'Campus Intelligence',
    icon: <GraduationCap className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20',
    borderColor: 'rgba(59, 130, 246, 0.6)',
    accentColor: '#3b82f6',
    glowRgb: '59, 130, 246',
    positionClasses: 'top-[7%] right-[4%]',
    parallaxMultiplier: 1.1,
    floatDelay: 0.4,
    floatDuration: 3.2,
    mainPath: 'M 60 35 L 60 18 L 82 18 L 82 13',
    secondaryPath: 'M 60 18 L 94 18 L 94 32 L 98 32',
    statusText: 'Campus OS • Synced',
    route: '/product-detail?id=schoolycore',
  },
  {
    id: 'hospital-management',
    slot: 'middle-right',
    title: 'Hospital Management',
    subtitle: 'Healthcare OS',
    icon: <Cross className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-purple-600 to-fuchsia-500 shadow-md shadow-purple-500/20',
    borderColor: 'rgba(168, 85, 247, 0.6)',
    accentColor: '#a855f7',
    glowRgb: '168, 85, 247',
    positionClasses: 'top-[44%] right-[2%]',
    parallaxMultiplier: 1.0,
    floatDelay: 1.0,
    floatDuration: 3.4,
    mainPath: 'M 65 50 L 84 50',
    secondaryPath: 'M 75 50 L 75 36 L 96 36',
    statusText: 'Healthcare • 0ms Latency',
    route: '/product-detail?id=hms-health',
  },
  {
    id: 'hrms',
    slot: 'bottom-left',
    title: 'HRMS',
    subtitle: 'Human Resource Suite',
    icon: <Users className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20',
    borderColor: 'rgba(16, 185, 129, 0.6)',
    accentColor: '#10b981',
    glowRgb: '16, 185, 129',
    positionClasses: 'bottom-[9%] left-[4%]',
    parallaxMultiplier: 1.2,
    floatDelay: 1.4,
    floatDuration: 3.0,
    mainPath: 'M 40 65 L 40 82 L 18 82 L 18 88',
    secondaryPath: 'M 40 82 L 6 82 L 6 68 L 2 68',
    statusText: 'HR Suite • Secure',
    route: '/product-detail?id=hrms-payroll',
  },
  {
    id: 'inventory-management',
    slot: 'bottom-right',
    title: 'Inventory Management',
    subtitle: 'Stock & Supply Chain',
    icon: <Boxes className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-md shadow-amber-500/20',
    borderColor: 'rgba(245, 158, 11, 0.6)',
    accentColor: '#f59e0b',
    glowRgb: '245, 158, 11',
    positionClasses: 'bottom-[9%] right-[4%]',
    parallaxMultiplier: 0.75,
    floatDelay: 1.8,
    floatDuration: 3.5,
    mainPath: 'M 60 65 L 60 82 L 82 82 L 82 88',
    secondaryPath: 'M 60 82 L 94 82 L 94 68 L 98 68',
    statusText: 'Stock Engine • Live',
    route: '/product-detail?id=inventory-pro',
  },
];

// ─────────────────────────────────────────────────────────────
// 2. REFINED SUBTLE PCB HARDWARE BACKGROUND TRACES & LEDS
// ─────────────────────────────────────────────────────────────
const SprawlingMotherboardTraces: React.FC = () => {
  const leds = useMemo(() => {
    return [
      { cx: '12%', cy: '25%', color: '#38bdf8', delay: '0s' },
      { cx: '88%', cy: '25%', color: '#3b82f6', delay: '0.4s' },
      { cx: '32%', cy: '65%', color: '#ec4899', delay: '0.8s' },
      { cx: '68%', cy: '65%', color: '#a855f7', delay: '1.2s' },
      { cx: '50%', cy: '10%', color: '#10b981', delay: '1.6s' },
      { cx: '50%', cy: '90%', color: '#f59e0b', delay: '2.0s' },
    ];
  }, []);

  return (
    <g className="opacity-45 dark:opacity-25 stroke-emerald-600/50 dark:stroke-cyan-400/30" strokeWidth="0.5" fill="none">
      <path d="M 2 5 L 98 5 M 2 8 L 98 8" />
      <path d="M 2 92 L 98 92 M 2 95 L 98 95" />
      <path d="M 4 2 L 4 98 M 96 2 L 96 98" />
      <path d="M 12 25 L 32 25 L 32 35 M 68 25 L 88 25 L 88 35" />
      <path d="M 12 75 L 32 75 L 32 65 M 68 75 L 88 75 L 88 65" />

      {/* Tiny Blinking Hardware LEDs */}
      {leds.map((led, idx) => (
        <circle
          key={idx}
          cx={led.cx}
          cy={led.cy}
          r="0.8"
          fill={led.color}
          className="animate-pulse"
          style={{ animationDelay: led.delay, animationDuration: '2s' }}
        />
      ))}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. SEQUENTIAL CLOCKWISE PROCESSOR PINS COMPONENT
// ─────────────────────────────────────────────────────────────
const ProcessorPins: React.FC<{ isHovered: boolean }> = React.memo(({ isHovered }) => {
  const pinsPerSide = 8;

  return (
    <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
      {/* Top Side Pins */}
      <div className="absolute top-0 left-5 right-5 h-3 flex justify-between px-1">
        {Array.from({ length: pinsPerSide }).map((_, i) => {
          const pinIndex = i;
          return (
            <div
              key={i}
              className={`w-1.5 h-3 rounded-sm transition-all duration-300 ${isHovered
                ? 'animate-pin-sequential-pulse bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
                : 'bg-gradient-to-b from-cyan-400/80 via-slate-400 to-slate-800'
                }`}
              style={{
                animationDelay: isHovered ? `${(pinIndex / 32) * 1.5}s` : '0s',
              }}
            />
          );
        })}
      </div>

      {/* Right Side Pins */}
      <div className="absolute top-5 bottom-5 right-0 w-3 flex flex-col justify-between py-1">
        {Array.from({ length: pinsPerSide }).map((_, i) => {
          const pinIndex = 8 + i;
          return (
            <div
              key={i}
              className={`h-1.5 w-3 rounded-sm transition-all duration-300 ${isHovered
                ? 'animate-pin-sequential-pulse bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
                : 'bg-gradient-to-r from-slate-800 via-slate-400 to-cyan-400/80'
                }`}
              style={{
                animationDelay: isHovered ? `${(pinIndex / 32) * 1.5}s` : '0s',
              }}
            />
          );
        })}
      </div>

      {/* Bottom Side Pins */}
      <div className="absolute bottom-0 left-5 right-5 h-3 flex justify-between px-1">
        {Array.from({ length: pinsPerSide }).map((_, i) => {
          const pinIndex = 23 - i;
          return (
            <div
              key={i}
              className={`w-1.5 h-3 rounded-sm transition-all duration-300 ${isHovered
                ? 'animate-pin-sequential-pulse bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
                : 'bg-gradient-to-t from-cyan-400/80 via-slate-400 to-slate-800'
                }`}
              style={{
                animationDelay: isHovered ? `${(pinIndex / 32) * 1.5}s` : '0s',
              }}
            />
          );
        })}
      </div>

      {/* Left Side Pins */}
      <div className="absolute top-5 bottom-5 left-0 w-3 flex flex-col justify-between py-1">
        {Array.from({ length: pinsPerSide }).map((_, i) => {
          const pinIndex = 31 - i;
          return (
            <div
              key={i}
              className={`h-1.5 w-3.5 rounded-sm transition-all duration-300 ${isHovered
                ? 'animate-pin-sequential-pulse bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
                : 'bg-gradient-to-r from-cyan-400/80 via-slate-400 to-slate-800'
                }`}
              style={{
                animationDelay: isHovered ? `${(pinIndex / 32) * 1.5}s` : '0s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// 5. DYNAMIC ULTRA-SUBTLE BACKGROUND (7-LAYER ATMOSPHERIC SUITE)
// ─────────────────────────────────────────────────────────────
const DynamicReactorBackground: React.FC<{ isProcessorHovered: boolean }> = React.memo(({ isProcessorHovered }) => {
  // Tiny Twinkling Stars Matrix
  const stars = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 19 + 7) % 92}%`,
      top: `${(i * 23 + 11) % 88}%`,
      size: i % 3 === 0 ? '2px' : '1px',
      dur: 2.5 + (i % 5) * 0.8,
      delay: i * 0.35,
    }));
  }, []);

  // Floating Micro Energy Particles
  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 5) % 90}%`,
      top: `${(i * 29 + 13) % 85}%`,
      size: i % 2 === 0 ? 3 : 2,
      dur: 6 + (i % 4) * 2.0,
      delay: i * 0.45,
    }));
  }, []);

  // Grid Junction Glowing Dots
  const glowingDots = useMemo(() => {
    return [
      { top: '15%', left: '20%', color: '#00f0ff', delay: '0s' },
      { top: '15%', left: '80%', color: '#c084fc', delay: '0.6s' },
      { top: '50%', left: '10%', color: '#38bdf8', delay: '1.2s' },
      { top: '50%', left: '90%', color: '#a855f7', delay: '1.8s' },
      { top: '85%', left: '25%', color: '#10b981', delay: '2.4s' },
      { top: '85%', left: '75%', color: '#f59e0b', delay: '3.0s' },
    ];
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Aurora Gradient Sweep (Subtle 6% Opacity) */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          opacity: isProcessorHovered ? [0.08, 0.14, 0.08] : [0.04, 0.07, 0.04],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
        className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-600/15 to-blue-600/20 blur-3xl pointer-events-none"
      />

      {/* 2. Moving Light Fog Layer (Subtle Ambient Motion) */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-15, 15, -15],
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.3),transparent_70%)] blur-2xl pointer-events-none"
      />

      {/* 3. Animated Grid Layer */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-70 pointer-events-none"
      />

      {/* 4. Holographic Scan Lines (Top to Bottom Sweep) */}
      <motion.div
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 9.0,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="w-full h-[50px] bg-gradient-to-b from-transparent via-cyan-400/10 dark:via-cyan-400/08 to-transparent blur-sm pointer-events-none"
      />

      {/* 5. Tiny Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [0.1, 0.6, 0.1],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.dur,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          className="absolute rounded-full bg-white dark:bg-cyan-200 shadow-[0_0_4px_#00f0ff] pointer-events-none"
        />
      ))}

      {/* 6. Floating Energy Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -18, 0],
            opacity: isProcessorHovered ? [0.15, 0.45, 0.15] : [0.06, 0.2, 0.06],
            scale: isProcessorHovered ? [1, 1.3, 1] : [1, 1, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          className={`absolute rounded-full pointer-events-none transition-colors duration-700 ${isProcessorHovered ? 'bg-cyan-300 shadow-[0_0_8px_#00f0ff]' : 'bg-cyan-400/40 blur-[0.4px]'
            }`}
        />
      ))}

      {/* 7. Glowing Junction Dots */}
      {glowingDots.map((dot, idx) => (
        <div
          key={idx}
          style={{ top: dot.top, left: dot.left }}
          className="absolute pointer-events-none"
        >
          <span
            className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-40"
            style={{ backgroundColor: dot.color, animationDuration: '3s', animationDelay: dot.delay }}
          />
          <span
            className="relative inline-flex rounded-full h-1 w-1 opacity-70 shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: dot.color, color: dot.color }}
          />
        </div>
      ))}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// 6. MAIN ENTERPRISE AI MOTHERBOARD VISUALIZATION
// ─────────────────────────────────────────────────────────────
export const HeroEarth3D: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.05 });
  const isInViewRef = useRef(isInView);

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  const parallaxLayerRef = useRef<HTMLDivElement>(null);
  const processorRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  // LERP Mouse Values
  const targetMouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });

  // Processor 3D Tilt Values (±1° max rotation toward cursor)
  const procRotX = useRef(0);
  const procRotY = useRef(0);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);
  const [isProcessorHovered, setIsProcessorHovered] = useState(false);
  const isProcessorHoveredRef = useRef(false);
  const [cardPulseActive, setCardPulseActive] = useState(false);
  const cycleIndex = useRef(0);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkTheme(
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        Boolean(document.querySelector('.dark'))
      );
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Keep ref in sync with state for zero-rerender rAF loop
  useEffect(() => {
    isProcessorHoveredRef.current = isProcessorHovered;
  }, [isProcessorHovered]);

  // Periodic Card Wave Reaction every 2 seconds while hovering processor
  useEffect(() => {
    if (!isProcessorHovered) {
      setCardPulseActive(false);
      return;
    }

    setCardPulseActive(true);
    const initialOffTimer = setTimeout(() => setCardPulseActive(false), 350);

    const interval = setInterval(() => {
      setCardPulseActive(true);
      setTimeout(() => setCardPulseActive(false), 350);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialOffTimer);
    };
  }, [isProcessorHovered]);

  // ZERO RE-RENDER LERP LOOP (Direct DOM Mutation in rAF for 60 FPS)
  useEffect(() => {
    let animId: number;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const loop = () => {
      if (!isInViewRef.current || document.hidden) {
        animId = requestAnimationFrame(loop);
        return;
      }
      currentMouse.current.x = lerp(currentMouse.current.x, targetMouse.current.x, 0.035);
      currentMouse.current.y = lerp(currentMouse.current.y, targetMouse.current.y, 0.035);

      const mx = currentMouse.current.x;
      const my = currentMouse.current.y;

      // 1. Container 3D Tilt (Max 4px shift)
      if (parallaxLayerRef.current) {
        parallaxLayerRef.current.style.transform = `rotateX(${-my * 6}deg) rotateY(${mx * 6}deg) translate3d(${mx * 4}px, ${my * 4}px, 0)`;
      }

      // 2. AI Processor Depth + Precise Mouse Follow Tilt (±1° max rotation)
      const isHovered = isProcessorHoveredRef.current;
      const targetRotX = isHovered ? Math.max(-1, Math.min(1, -my * 2.5)) : 0;
      const targetRotY = isHovered ? Math.max(-1, Math.min(1, mx * 2.5)) : 0;
      procRotX.current = lerp(procRotX.current, targetRotX, 0.08);
      procRotY.current = lerp(procRotY.current, targetRotY, 0.08);

      if (processorRef.current) {
        processorRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${mx * 8}px, ${my * 8}px, 15px) rotateX(${procRotX.current}deg) rotateY(${procRotY.current}deg)`;
      }

      // 3. Card Parallax (Max 10px shift)
      PCB_MODULES.forEach((mod) => {
        const el = cardRefs.current[mod.id];
        if (el) {
          const cardX = mx * 10 * mod.parallaxMultiplier;
          const cardY = my * 10 * mod.parallaxMultiplier;
          el.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`;
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Idle Auto-Pulse Highlight Every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      if (!hoveredModuleId && !isProcessorHovered) {
        cycleIndex.current = (cycleIndex.current + 1) % PCB_MODULES.length;
        const nextId = PCB_MODULES[cycleIndex.current].id;
        setActiveModuleId(nextId);

        setTimeout(() => {
          setActiveModuleId((curr) => (curr === nextId ? null : curr));
        }, 2000);
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [hoveredModuleId, isProcessorHovered]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetMouse.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    targetMouse.current.y = (e.clientY - rect.top) / rect.height - 0.5;
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetMouse.current.x = 0;
    targetMouse.current.y = 0;
    setHoveredModuleId(null);
    setIsProcessorHovered(false);
  }, []);

  const currentHighlightedId = hoveredModuleId || activeModuleId;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px',
        willChange: 'transform',
      }}
      className="w-full h-[420px] sm:h-[520px] lg:h-[600px] relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/60 dark:from-[#020612] dark:via-[#050d24] dark:to-[#020612] rounded-[24px] border border-slate-200/90 dark:border-blue-950/80 shadow-2xl shadow-blue-900/5 dark:shadow-cyan-950/40 select-none font-sans flex items-center justify-center cursor-default transition-colors duration-500"
    >
      {/* ── Keyframe Animations for Clockwise Pin Wave ── */}
      <style>{`
        @keyframes pinSequentialPulse {
          0%, 100% {
            background-color: rgba(37, 99, 235, 0.3);
            box-shadow: none;
            opacity: 0.5;
          }
          15%, 35% {
            background-color: #2563eb;
            box-shadow: 0 0 10px #2563eb, 0 0 4px #60a5fa;
            opacity: 1;
          }
          50% {
            background-color: rgba(37, 99, 235, 0.3);
            box-shadow: none;
            opacity: 0.5;
          }
        }
        .animate-pin-sequential-pulse {
          animation: pinSequentialPulse 1.5s linear infinite;
        }
      `}</style>

      {/* ── 3D PARALLAX CONTAINER LAYER (Direct Ref Mutation) ── */}
      <div
        ref={parallaxLayerRef}
        className="w-full h-full relative flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* ── 7-LAYER DYNAMIC ATMOSPHERIC BACKGROUND ── */}
        <DynamicReactorBackground isProcessorHovered={isProcessorHovered} />

        {/* ── LUMINOUS ENERGY REACTOR BEAMS & PLASMA LIGHT PARTICLES LAYER ── */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            {/* Luminous Energy Beam Laser Glow Filter */}
            <filter id="beamLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <SprawlingMotherboardTraces />

          {/* ── PERMANENT NEON SVG PCB TRACES WITH MOVING ENERGY PACKETS ── */}
          {PCB_MODULES.map((mod) => {
            const isHighlighted = isProcessorHovered || currentHighlightedId === mod.id;
            const baseTraceColor = isDarkTheme ? '#00f0ff' : '#2563eb';

            return (
              <g key={mod.id}>
                {/* 1. Permanent Main Circuit Path */}
                <path
                  d={mod.mainPath}
                  fill="none"
                  stroke={isHighlighted ? mod.accentColor : baseTraceColor}
                  strokeWidth={isProcessorHovered ? '1.8' : isHighlighted ? '1.4' : '0.8'}
                  strokeOpacity={isHighlighted ? '1' : '0.75'}
                  className="transition-colors duration-500"
                  style={{
                    filter: isProcessorHovered
                      ? `drop-shadow(0 0 8px ${baseTraceColor})`
                      : isHighlighted
                        ? `drop-shadow(0 0 5px ${mod.accentColor})`
                        : `drop-shadow(0 0 2px ${baseTraceColor})`,
                  }}
                />

                {/* 2. Secondary Branch Circuit Path */}
                <path
                  d={mod.secondaryPath}
                  fill="none"
                  stroke={isHighlighted ? mod.accentColor : baseTraceColor}
                  strokeWidth="0.5"
                  strokeOpacity={isHighlighted ? '0.85' : '0.45'}
                  className="transition-colors duration-500"
                />

                {/* 3. Moving Data Packets (Accelerates & Brightens Outward on Processor Hover) */}
                <path
                  d={mod.mainPath}
                  fill="none"
                  stroke={isProcessorHovered ? '#ffffff' : isHighlighted ? mod.accentColor : baseTraceColor}
                  strokeWidth={isProcessorHovered ? '2.2' : '1.2'}
                  strokeDasharray={isProcessorHovered ? '4 12' : '2 7'}
                  filter="url(#pcbGlow)"
                  className="opacity-95"
                  style={{ willChange: 'stroke-dashoffset' }}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="18"
                    to="0"
                    dur={isProcessorHovered ? '0.5s' : isHighlighted ? '0.8s' : '2.2s'}
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}
        </svg>

        {/* ── CENTERPIECE: FUTURISTIC 3D AI CORE (200px × 200px) ⭐⭐⭐⭐⭐ ── */}
        <div
          ref={processorRef}
          style={{
            willChange: 'transform',
            transformStyle: 'preserve-3d',
          }}
          className="absolute top-1/2 left-1/2 w-[200px] h-[200px] z-30 pointer-events-auto"
          onMouseEnter={() => setIsProcessorHovered(true)}
          onMouseLeave={() => setIsProcessorHovered(false)}
        >
          {/* Subtle 3px Floating Levitation & Breathing Animation */}
          <motion.div
            animate={{
              y: [0, -3, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 5.0,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full relative"
            style={{ willChange: 'transform' }}
          >
            {/* 32 Metallic Pins with Clockwise Sequential Lighting */}
            <ProcessorPins isHovered={isProcessorHovered} />

            {/* Outer Rotating Dual Holographic Rings (Calm Slow Motion) */}
            <div className="absolute -inset-4 pointer-events-none rounded-full overflow-visible z-0">
              {/* Outer Cyan Ring (Clockwise) */}
              <div
                className={`absolute inset-0 rounded-full border border-dashed border-cyan-400/50 dark:border-cyan-400/60 ${
                  isProcessorHovered ? 'animate-[spin_18s_linear_infinite] border-cyan-400' : 'animate-[spin_36s_linear_infinite]'
                }`}
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.3))' }}
              />

              {/* Inner Purple Ring (Counter-Clockwise) */}
              <div
                className={`absolute inset-2 rounded-full border border-dashed border-purple-500/50 dark:border-purple-400/60 ${
                  isProcessorHovered ? 'animate-[spin_14s_linear_infinite_reverse] border-purple-400' : 'animate-[spin_28s_linear_infinite_reverse]'
                }`}
                style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.3))' }}
              />

              {/* Subtle Pulsing Energy Aura Wave */}
              <motion.div
                animate={{
                  scale: isProcessorHovered ? [1, 1.12, 1] : [1, 1.06, 1],
                  opacity: isProcessorHovered ? [0.2, 0.45, 0.2] : [0.1, 0.25, 0.1],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-1 rounded-full bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-blue-500/15 blur-md pointer-events-none"
              />
            </div>

            {/* Glassmorphism Outer Core Frame with Dual Neon Cyan + Purple Glow */}
            <div
              className={`w-full h-full rounded-[34px] p-3 bg-gradient-to-br from-white/95 via-slate-100/90 to-purple-50/80 dark:from-[#0d1b3e]/90 dark:via-[#08122a]/95 dark:to-[#030715]/98 border-2 relative overflow-hidden backdrop-blur-md transform-gpu flex items-center justify-center cursor-pointer group transition-all duration-500 ease-out ${
                isProcessorHovered
                  ? 'border-cyan-400 dark:border-cyan-400 shadow-[0_0_45px_rgba(0,240,255,0.5),0_0_22px_rgba(168,85,247,0.4),inset_0_0_18px_rgba(0,240,255,0.3)]'
                  : 'border-cyan-400/60 dark:border-cyan-400/50 shadow-[0_8px_30px_rgba(0,240,255,0.2),0_0_18px_rgba(168,85,247,0.15),inset_0_0_12px_rgba(0,240,255,0.12)]'
              }`}
            >
              {/* Dynamic Slow Animated Light Sheen Reflection */}
              <motion.div
                animate={{
                  x: ['-150%', '250%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8.0,
                  ease: 'easeInOut',
                  repeatDelay: 3.0,
                }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-cyan-300/15 to-transparent skew-x-12 pointer-events-none z-20"
              />

              {/* Inner Quantum Circuit Matrix Casing */}
              <div className="w-full h-full rounded-[26px] bg-gradient-to-br from-slate-900 via-blue-950/90 to-purple-950 dark:from-[#061029] dark:via-[#040a1c] dark:to-[#02040b] border border-cyan-500/40 dark:border-cyan-400/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.015] transition-transform duration-500 ease-out shadow-2xl">

                {/* Glowing Futuristic Corner Quantum Brackets */}
                <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/80 drop-shadow-[0_0_4px_#00f0ff]" />
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-400/80 drop-shadow-[0_0_4px_#a855f7]" />
                <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-400/80 drop-shadow-[0_0_4px_#a855f7]" />
                <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/80 drop-shadow-[0_0_4px_#00f0ff]" />

                {/* Sub-surface Glowing Micro Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff12_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff12_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-50" />

                {/* Center 3D AI Core Orb Container */}
                <motion.div
                  animate={{
                    rotate: isProcessorHovered ? 360 : 0,
                    scale: isProcessorHovered ? 1.05 : 1,
                  }}
                  transition={{
                    rotate: isProcessorHovered
                      ? { duration: 12, repeat: Infinity, ease: 'linear' }
                      : { duration: 0.6, ease: 'easeOut' },
                    scale: { type: 'spring', stiffness: 300, damping: 24 },
                  }}
                  className={`w-15 h-15 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/30 border border-cyan-400/70 dark:border-cyan-400/60 flex items-center justify-center relative transition-all duration-500 ${
                    isProcessorHovered
                      ? 'shadow-[0_0_28px_#00f0ff,0_0_16px_#a855f7,inset_0_0_12px_#00f0ff]'
                      : 'shadow-[0_0_18px_rgba(0,240,255,0.6),0_0_10px_rgba(168,85,247,0.3)]'
                  }`}
                >
                  {/* Central Glowing Processor Icon */}
                  <Cpu className="w-8 h-8 text-cyan-300 dark:text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]" />

                  {/* Pulsing Core Halo Ring */}
                  <span className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping opacity-25 pointer-events-none" style={{ animationDuration: '3s' }} />
                </motion.div>

                {/* AI CORE Label */}
                <div className="text-center mt-1.5 z-10">
                  <span className="text-xl font-black tracking-widest text-white block drop-shadow-[0_0_10px_#00f0ff]">
                    AI CORE
                  </span>
                  <span className="text-[8px] font-extrabold text-cyan-300 dark:text-cyan-400 tracking-widest uppercase block mt-0.5 opacity-90 drop-shadow-[0_0_3px_#00f0ff]">
                    ENTERPRISE NEURAL ENGINE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FIXED BUSINESS MODULE CARDS (PREMIUM FLOATING HOLOGRAPHIC GLASS CARDS) ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {PCB_MODULES.map((mod) => {
            const isHovered = hoveredModuleId === mod.id;
            const isHighlighted = isProcessorHovered || currentHighlightedId === mod.id;

            return (
              <div
                key={mod.id}
                ref={(el) => {
                  cardRefs.current[mod.id] = el;
                }}
                style={{
                  willChange: 'transform',
                }}
                className={`absolute pointer-events-auto ${mod.positionClasses}`}
              >
                {/* Active Hover Status Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.92 }}
                      animate={{ opacity: 1, y: -26, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.92 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 -translate-x-1/2 top-0 px-2.5 py-1 rounded-xl bg-slate-950/95 dark:bg-slate-950/95 border border-cyan-400/80 text-[10px] font-extrabold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap flex items-center gap-1.5 pointer-events-none z-40"
                    >
                      <CheckCircle className="w-3 h-3 text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]" />
                      <span className="tracking-wide uppercase">{mod.statusText}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Holographic Glass Card Container */}
                <motion.div
                  animate={{
                    y: isHovered ? -10 : [0, -8, 0],
                    scale: isHovered ? 1.06 : 1,
                  }}
                  transition={{
                    y: isHovered
                      ? { type: 'spring', stiffness: 400, damping: 22, mass: 0.7 }
                      : { duration: mod.floatDuration, repeat: Infinity, ease: 'easeInOut', delay: mod.floatDelay },
                    scale: { type: 'spring', stiffness: 400, damping: 22, mass: 0.7 },
                  }}
                  onMouseEnter={() => {
                    setHoveredModuleId(mod.id);
                    setActiveModuleId(mod.id);
                  }}
                  onMouseLeave={() => setHoveredModuleId(null)}
                  onClick={() => navigateTo(mod.route as any)}
                  className="w-[190px] sm:w-[205px] h-[68px] px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/80 dark:from-[#0a1638]/90 dark:via-[#06102a]/95 dark:to-[#030718]/98 border backdrop-blur-md backdrop-saturate-150 transform-gpu flex items-center gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden group"
                  style={{
                    borderColor: isHovered
                      ? '#00f0ff'
                      : isProcessorHovered && cardPulseActive
                        ? 'rgba(0, 240, 255, 0.9)'
                        : isHighlighted
                          ? mod.accentColor
                          : 'rgba(56, 189, 248, 0.35)',
                    boxShadow: isHovered
                      ? `0 0 35px rgba(${mod.glowRgb}, 0.75), 0 0 15px rgba(0, 240, 255, 0.5), inset 0 0 12px rgba(${mod.glowRgb}, 0.25)`
                      : isProcessorHovered && cardPulseActive
                        ? '0 0 28px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.3)'
                        : isHighlighted
                          ? `0 0 22px rgba(${mod.glowRgb}, 0.4)`
                          : `0 8px 24px -6px rgba(0, 0, 0, 0.15), 0 0 15px rgba(${mod.glowRgb}, 0.15)`,
                    willChange: 'transform, border-color, box-shadow',
                  }}
                >
                  {/* Holographic Dynamic Light Sheen Sweep on Hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ x: '-120%' }}
                      animate={{ x: '220%' }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent skew-x-12 pointer-events-none"
                    />
                  )}

                  {/* Micro Corner Holographic Brackets */}
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-cyan-400/80 pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-cyan-400/80 pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-cyan-400/80 pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-cyan-400/80 pointer-events-none" />

                  {/* Product Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl ${mod.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 shadow-md`}
                    style={{
                      boxShadow: isHovered ? `0 0 15px ${mod.accentColor}` : undefined,
                    }}
                  >
                    {mod.icon}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex flex-col text-left min-w-0 flex-1 z-10">
                    <span className="text-[13px] font-black text-slate-900 dark:text-white leading-tight truncate tracking-tight group-hover:text-cyan-400 transition-colors">
                      {mod.title}
                    </span>
                    <span
                      className="text-[10px] font-bold mt-0.5 truncate tracking-wide"
                      style={{ color: mod.accentColor }}
                    >
                      {mod.subtitle}
                    </span>
                  </div>

                  {/* Tiny Status Pulse Indicator */}
                  <div className="shrink-0 pl-0.5 z-10">
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-80"
                        style={{ backgroundColor: mod.accentColor }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: mod.accentColor, color: mod.accentColor }}
                      />
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
});

export const HeroMotherboard = HeroEarth3D;
export default HeroEarth3D;
