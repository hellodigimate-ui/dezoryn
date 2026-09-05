import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  GraduationCap,
  Cross,
  Users,
  Boxes,
  LayoutDashboard,
  Layers,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

// ─────────────────────────────────────────────────────────────
// 1. EXACT FIXED BUSINESS MODULES DATA & 660px × 500px STAGE COORDINATES
// Stage Dimension: 660px width × 500px height (Prominent, High-Impact Scale)
// Center (AI Core): (X: 330px, Y: 250px)
// Left Column: X = 16px (W: 195px, H: 64px) -> right edge = 211px
// Right Column: X = 449px (W: 195px, H: 64px) -> left edge = 449px
// AI Core: X = 245px, Y = 165px (W: 170px, H: 170px) -> left edge = 245px, right edge = 415px
// Gaps: 34px between Left Cards and AI Core; 34px between AI Core and Right Cards!
// ─────────────────────────────────────────────────────────────
interface PCBModule {
  id: string;
  slot: 'top-left' | 'middle-left' | 'bottom-left' | 'top-right' | 'middle-right' | 'bottom-right';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  accentColor: string;
  glowRgb: string;
  statusText: string;
  route: string;
  // Stage Pixel Positions
  cardX: number;
  cardY: number;
  // Orthogonal PCB Connector Path
  tracePath: string;
  dockViaX: number;
  dockViaY: number;
  chipPinY: number;
}

const PCB_MODULES: PCBModule[] = [
  // ── LEFT SIDE (3 Symmetrical Modules) ──
  {
    id: 'crm-platform',
    slot: 'top-left',
    title: 'CRM Platform',
    subtitle: 'Predictive Sales AI',
    icon: <LayoutDashboard className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md shadow-sky-500/20',
    borderColor: 'rgba(56, 189, 248, 0.6)',
    accentColor: '#38bdf8',
    glowRgb: '56, 189, 248',
    statusText: 'Sales AI • Active 99.9%',
    route: '/product-detail?id=sales-ai-copilot',
    cardX: 16,
    cardY: 48,
    // AI Core Pin (245, 210) -> Elbow (228, 210) -> Elbow (228, 80) -> Card Dock (211, 80)
    tracePath: 'M 245 210 L 228 210 L 228 80 L 211 80',
    dockViaX: 211,
    dockViaY: 80,
    chipPinY: 210,
  },
  {
    id: 'enterprise-erp',
    slot: 'middle-left',
    title: 'Enterprise ERP',
    subtitle: 'Cloud Operations',
    icon: <Layers className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-indigo-500 to-cyan-500 shadow-md shadow-indigo-500/20',
    borderColor: 'rgba(99, 102, 241, 0.6)',
    accentColor: '#818cf8',
    glowRgb: '129, 140, 248',
    statusText: 'Core ERP • Synced',
    route: '/products',
    cardX: 16,
    cardY: 218,
    // AI Core Pin (245, 250) -> Card Dock (211, 250)
    tracePath: 'M 245 250 L 211 250',
    dockViaX: 211,
    dockViaY: 250,
    chipPinY: 250,
  },
  {
    id: 'hrms',
    slot: 'bottom-left',
    title: 'HRMS Pulse',
    subtitle: 'People & Payroll',
    icon: <Users className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20',
    borderColor: 'rgba(16, 185, 129, 0.6)',
    accentColor: '#10b981',
    glowRgb: '16, 185, 129',
    statusText: 'HR Suite • 0ms Latency',
    route: '/product-detail?id=dezoryn-hrms',
    cardX: 16,
    cardY: 388,
    // AI Core Pin (245, 290) -> Elbow (228, 290) -> Elbow (228, 420) -> Card Dock (211, 420)
    tracePath: 'M 245 290 L 228 290 L 228 420 L 211 420',
    dockViaX: 211,
    dockViaY: 420,
    chipPinY: 290,
  },

  // ── RIGHT SIDE (3 Symmetrical Modules) ──
  {
    id: 'school-erp',
    slot: 'top-right',
    title: 'SchoolyCore ERP',
    subtitle: 'Campus Intelligence',
    icon: <GraduationCap className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20',
    borderColor: 'rgba(59, 130, 246, 0.6)',
    accentColor: '#3b82f6',
    glowRgb: '59, 130, 246',
    statusText: 'Campus OS • Live',
    route: '/product-detail?id=schoolycore-erp',
    cardX: 449,
    cardY: 48,
    // AI Core Pin (415, 210) -> Elbow (432, 210) -> Elbow (432, 80) -> Card Dock (449, 80)
    tracePath: 'M 415 210 L 432 210 L 432 80 L 449 80',
    dockViaX: 449,
    dockViaY: 80,
    chipPinY: 210,
  },
  {
    id: 'hospital-management',
    slot: 'middle-right',
    title: 'Dezo Care HMS',
    subtitle: 'Hospital & Health OS',
    icon: <Cross className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-purple-600 to-fuchsia-500 shadow-md shadow-purple-500/20',
    borderColor: 'rgba(168, 85, 247, 0.6)',
    accentColor: '#a855f7',
    glowRgb: '168, 85, 247',
    statusText: 'Health OS • High Availability',
    route: '/product-detail?id=hms-health',
    cardX: 449,
    cardY: 218,
    // AI Core Pin (415, 250) -> Card Dock (449, 250)
    tracePath: 'M 415 250 L 449 250',
    dockViaX: 449,
    dockViaY: 250,
    chipPinY: 250,
  },
  {
    id: 'inventory-management',
    slot: 'bottom-right',
    title: 'Inventory Matrix',
    subtitle: 'Supply Chain & Stock',
    icon: <Boxes className="w-4 h-4 text-white" />,
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-md shadow-amber-500/20',
    borderColor: 'rgba(245, 158, 11, 0.6)',
    accentColor: '#f59e0b',
    glowRgb: '245, 158, 11',
    statusText: 'Supply Chain • Realtime',
    route: '/product-detail?id=inventory-pro',
    cardX: 449,
    cardY: 388,
    // AI Core Pin (415, 290) -> Elbow (432, 290) -> Elbow (432, 420) -> Card Dock (449, 420)
    tracePath: 'M 415 290 L 432 290 L 432 420 L 449 420',
    dockViaX: 449,
    dockViaY: 420,
    chipPinY: 290,
  },
];

// ─────────────────────────────────────────────────────────────
// 2. STAGE BACKGROUND SUITE (Ambient Glow, Grid & Blinking LEDs)
// ─────────────────────────────────────────────────────────────
const StageAmbientBackground: React.FC<{ isProcessorHovered: boolean }> = React.memo(({ isProcessorHovered }) => {
  const leds = useMemo(() => {
    return [
      { cx: 70, cy: 160, color: '#38bdf8', delay: '0s' },
      { cx: 590, cy: 160, color: '#3b82f6', delay: '0.4s' },
      { cx: 100, cy: 340, color: '#10b981', delay: '0.8s' },
      { cx: 560, cy: 340, color: '#a855f7', delay: '1.2s' },
      { cx: 330, cy: 30, color: '#00f0ff', delay: '1.6s' },
      { cx: 330, cy: 470, color: '#f59e0b', delay: '2.0s' },
    ];
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Subtle Radial Glow behind Center AI Core (Brightens on hover) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isProcessorHovered
            ? 'bg-gradient-to-tr from-cyan-500/25 via-purple-600/20 to-blue-600/25 opacity-100'
            : 'bg-gradient-to-tr from-cyan-500/15 via-purple-600/12 to-blue-600/15 opacity-80'
        }`}
      />

      {/* 2. Micro Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />

      {/* 3. Subtle Holographic Scan Bar */}
      <motion.div
        animate={{ y: [-40, 540] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        className="w-full h-[40px] bg-gradient-to-b from-transparent via-cyan-400/8 to-transparent pointer-events-none"
      />

      {/* 4. Decorative Background Traces & Blinking LEDs */}
      <svg viewBox="0 0 660 500" className="absolute inset-0 w-full h-full pointer-events-none">
        <g stroke="rgba(0, 240, 255, 0.15)" strokeWidth="0.8" fill="none">
          <path d="M 16 145 L 80 145 L 100 165" />
          <path d="M 644 145 L 580 145 L 560 165" />
          <path d="M 16 355 L 80 355 L 100 335" />
          <path d="M 644 355 L 580 355 L 560 335" />
        </g>

        {leds.map((led, idx) => (
          <circle
            key={idx}
            cx={led.cx}
            cy={led.cy}
            r="1.8"
            fill={led.color}
            className="animate-pulse"
            style={{ animationDelay: led.delay, animationDuration: '2.4s' }}
          />
        ))}
      </svg>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// 3. MAIN ENTERPRISE AI ARCHITECTURE VISUALIZATION STAGE
// ─────────────────────────────────────────────────────────────
export const HeroEarth3D: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.05 });
  const isInViewRef = useRef(isInView);

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  // Dynamic proportional scale factor (Target: 660px width for prominent visual size)
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const availableWidth = Math.max(300, width - 4);
      const computedScale = Math.min(1.10, availableWidth / 660);
      setScale(computedScale);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(containerRef.current);
    window.addEventListener('resize', updateScale, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);
  const [isProcessorHovered, setIsProcessorHovered] = useState(false);

  // Auto-pulse idle highlight every 4 seconds
  const cycleIndex = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!hoveredModuleId && !isProcessorHovered && isInViewRef.current) {
        cycleIndex.current = (cycleIndex.current + 1) % PCB_MODULES.length;
        const nextId = PCB_MODULES[cycleIndex.current].id;
        setActiveModuleId(nextId);

        setTimeout(() => {
          setActiveModuleId((curr) => (curr === nextId ? null : curr));
        }, 2200);
      }
    }, 4200);

    return () => clearInterval(timer);
  }, [hoveredModuleId, isProcessorHovered]);

  const currentHighlightedId = hoveredModuleId || activeModuleId;

  return (
    <div
      ref={containerRef}
      style={{
        height: Math.round(500 * scale),
      }}
      className="w-full relative flex items-center justify-center select-none font-sans overflow-hidden transition-[height] duration-200"
    >
      {/* ── Keyframe Animations for Hardware Pin Wave & PCB Pulse ── */}
      <style>{`
        @keyframes pcbFlow {
          0% {
            stroke-dashoffset: 48;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-pcb-flow {
          stroke-dasharray: 8 16;
          animation: pcbFlow 2.0s linear infinite;
        }
        .animate-pcb-flow-fast {
          stroke-dasharray: 10 14;
          animation: pcbFlow 0.8s linear infinite;
        }
      `}</style>

      {/* ── 660px × 500px PROPORTIONALLY SCALED STAGE (PROMINENT IMPACT) ── */}
      <div
        style={{
          width: 660,
          height: 500,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="relative shrink-0 rounded-[26px] overflow-hidden bg-gradient-to-br from-[#0a122c]/95 via-[#060d24]/98 to-[#020512] border border-blue-500/30 dark:border-cyan-500/30 shadow-2xl shadow-cyan-950/40"
      >
        {/* ── 1. AMBIENT BACKGROUND LAYER ── */}
        <StageAmbientBackground isProcessorHovered={isProcessorHovered} />

        {/* ── 2. SVG HIGH-PRECISION PCB CIRCUIT BUS TRACES ── */}
        <svg
          viewBox="0 0 660 500"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          {PCB_MODULES.map((mod) => {
            const isHighlighted = isProcessorHovered || currentHighlightedId === mod.id;
            const traceColor = isHighlighted ? mod.accentColor : '#0284c7';

            return (
              <g key={`trace-${mod.id}`}>
                {/* Static Bus Path */}
                <path
                  d={mod.tracePath}
                  fill="none"
                  stroke={traceColor}
                  strokeWidth={isHighlighted ? 2.0 : 1.2}
                  strokeOpacity={isHighlighted ? 1 : 0.45}
                  className="transition-all duration-300"
                  style={{
                    filter: isHighlighted ? `drop-shadow(0 0 5px ${mod.accentColor})` : undefined,
                  }}
                />

                {/* Animated Light Data Packet (GPU CSS Dash Flow) */}
                <path
                  d={mod.tracePath}
                  fill="none"
                  stroke={isHighlighted ? '#ffffff' : mod.accentColor}
                  strokeWidth={isHighlighted ? 2.6 : 1.8}
                  strokeOpacity={isHighlighted ? 1 : 0.85}
                  className={isHighlighted ? 'animate-pcb-flow-fast' : 'animate-pcb-flow'}
                  style={{
                    filter: `drop-shadow(0 0 4px ${mod.accentColor})`,
                    willChange: 'stroke-dashoffset',
                  }}
                />

                {/* Card Docking Contact Via */}
                <circle
                  cx={mod.dockViaX}
                  cy={mod.dockViaY}
                  r={isHighlighted ? 3.5 : 2.5}
                  fill={traceColor}
                  className="transition-all duration-300"
                  style={{
                    filter: isHighlighted ? `drop-shadow(0 0 6px ${mod.accentColor})` : undefined,
                  }}
                />

                {/* AI Core Processor Pin Terminal Via */}
                <circle
                  cx={mod.slot.includes('left') ? 245 : 415}
                  cy={mod.chipPinY}
                  r={isHighlighted ? 3.2 : 2.2}
                  fill={isHighlighted ? '#00f0ff' : '#38bdf8'}
                  style={{
                    filter: isHighlighted ? 'drop-shadow(0 0 6px #00f0ff)' : undefined,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* ── 3. CENTERPIECE: DEAD-CENTER 3D AI CORE (X: 245, Y: 165, W: 170, H: 170) ── */}
        <div
          style={{
            position: 'absolute',
            left: 245,
            top: 165,
            width: 170,
            height: 170,
          }}
          className="z-30 pointer-events-auto flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setIsProcessorHovered(true)}
          onMouseLeave={() => setIsProcessorHovered(false)}
        >
          {/* Outer Rotating Dual Holographic Neon Rings */}
          <div className="absolute -inset-4 pointer-events-none rounded-full overflow-visible z-0 flex items-center justify-center">
            {/* Outer Cyan Ring (Clockwise) */}
            <div
              className={`absolute inset-0 rounded-full border border-dashed border-cyan-400/50 ${
                isProcessorHovered ? 'animate-[spin_12s_linear_infinite] border-cyan-300' : 'animate-[spin_28s_linear_infinite]'
              }`}
              style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))' }}
            />

            {/* Inner Purple Ring (Counter-Clockwise) */}
            <div
              className={`absolute inset-2.5 rounded-full border border-dashed border-purple-500/50 ${
                isProcessorHovered ? 'animate-[spin_10s_linear_infinite_reverse] border-purple-400' : 'animate-[spin_22s_linear_infinite_reverse]'
              }`}
              style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.4))' }}
            />

            {/* Pulsing Aura Wave */}
            <motion.div
              animate={{
                scale: isProcessorHovered ? [1, 1.12, 1] : [1, 1.06, 1],
                opacity: isProcessorHovered ? [0.2, 0.45, 0.2] : [0.1, 0.25, 0.1],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-1 rounded-full bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-blue-500/15 blur-md pointer-events-none"
            />
          </div>

          {/* Left Metallic Terminal Pins (Aligned precisely to 210, 250, 290) */}
          <div className="absolute -left-3 inset-y-0 flex flex-col justify-around py-8 pointer-events-none z-10">
            {[0, 1, 2].map((i) => (
              <div
                key={`pin-l-${i}`}
                className={`w-3 h-1.5 rounded-l transition-all duration-300 ${
                  isProcessorHovered ? 'bg-cyan-300 shadow-[0_0_8px_#00f0ff]' : 'bg-cyan-500/70'
                }`}
              />
            ))}
          </div>

          {/* Right Metallic Terminal Pins (Aligned precisely to 210, 250, 290) */}
          <div className="absolute -right-3 inset-y-0 flex flex-col justify-around py-8 pointer-events-none z-10">
            {[0, 1, 2].map((i) => (
              <div
                key={`pin-r-${i}`}
                className={`w-3 h-1.5 rounded-r transition-all duration-300 ${
                  isProcessorHovered ? 'bg-cyan-300 shadow-[0_0_8px_#00f0ff]' : 'bg-cyan-500/70'
                }`}
              />
            ))}
          </div>

          {/* Glassmorphic Outer Core Frame with Dual Neon Cyan + Purple Glow */}
          <motion.div
            animate={{
              scale: isProcessorHovered ? 1.04 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`w-full h-full rounded-[30px] p-2.5 bg-gradient-to-br from-[#0e1b3e]/95 via-[#08132c]/95 to-[#030616]/98 border-2 relative overflow-hidden backdrop-blur-md transform-gpu flex items-center justify-center transition-all duration-400 ease-out shadow-2xl ${
              isProcessorHovered
                ? 'border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.45),0_0_20px_rgba(168,85,247,0.35)]'
                : 'border-cyan-400/60 shadow-[0_8px_25px_rgba(0,240,255,0.2),0_0_15px_rgba(168,85,247,0.15)]'
            }`}
          >
            {/* Dynamic Slow Light Sheen Reflection */}
            <motion.div
              animate={{ x: ['-150%', '250%'] }}
              transition={{ repeat: Infinity, duration: 8.0, ease: 'easeInOut', repeatDelay: 3.0 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent skew-x-12 pointer-events-none z-20"
            />

            {/* Inner Quantum Circuit Matrix Casing */}
            <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-slate-900 via-blue-950/90 to-purple-950 dark:from-[#061029] dark:via-[#040a1c] dark:to-[#02040b] border border-cyan-500/40 flex flex-col items-center justify-center relative overflow-hidden p-2">
              {/* Corner Quantum Brackets */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-cyan-400/80 drop-shadow-[0_0_4px_#00f0ff]" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-purple-400/80 drop-shadow-[0_0_4px_#a855f7]" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-purple-400/80 drop-shadow-[0_0_4px_#a855f7]" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-cyan-400/80 drop-shadow-[0_0_4px_#00f0ff]" />

              {/* Sub-surface Micro Grid */}
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
                className={`w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/30 border border-cyan-400/70 flex items-center justify-center relative transition-all duration-500 ${
                  isProcessorHovered
                    ? 'shadow-[0_0_24px_#00f0ff,0_0_14px_#a855f7]'
                    : 'shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                }`}
              >
                <Cpu className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]" />
              </motion.div>

              {/* AI CORE Label */}
              <div className="text-center mt-1 z-10">
                <span className="text-base font-black tracking-widest text-white block drop-shadow-[0_0_8px_#00f0ff]">
                  AI CORE
                </span>
                <span className="text-[7.5px] font-extrabold text-cyan-300 tracking-widest uppercase block mt-0.5 opacity-95">
                  ENTERPRISE NEURAL ENGINE
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 4. FIXED BUSINESS MODULE CARDS (EXACT RELATIVE PIXEL POSITIONING) ── */}
        {PCB_MODULES.map((mod) => {
          const isHovered = hoveredModuleId === mod.id;
          const isHighlighted = isProcessorHovered || currentHighlightedId === mod.id;

          return (
            <div
              key={mod.id}
              style={{
                position: 'absolute',
                left: mod.cardX,
                top: mod.cardY,
                width: 195,
                height: 64,
              }}
              className="z-20 pointer-events-auto"
            >
              {/* Active Hover Status Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.92 }}
                    animate={{ opacity: 1, y: -26, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 -translate-x-1/2 top-0 px-2.5 py-1 rounded-xl bg-slate-950/95 border border-cyan-400/80 text-[10px] font-extrabold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap flex items-center gap-1.5 pointer-events-none z-40"
                  >
                    <CheckCircle className="w-3 h-3 text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]" />
                    <span className="tracking-wide uppercase">{mod.statusText}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Holographic Glass Card Container */}
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onMouseEnter={() => {
                  setHoveredModuleId(mod.id);
                  setActiveModuleId(mod.id);
                }}
                onMouseLeave={() => setHoveredModuleId(null)}
                onClick={() => navigateTo(mod.route as any)}
                className="w-full h-full px-3 py-2 rounded-2xl bg-gradient-to-br from-[#0c1838]/95 via-[#07112a]/95 to-[#020616]/98 border backdrop-blur-md transform-gpu flex items-center gap-2.5 cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-lg"
                style={{
                  borderColor: isHovered
                    ? '#00f0ff'
                    : isHighlighted
                    ? mod.accentColor
                    : 'rgba(56, 189, 248, 0.3)',
                  boxShadow: isHovered
                    ? `0 0 28px rgba(${mod.glowRgb}, 0.7), 0 0 12px rgba(0, 240, 255, 0.4)`
                    : isHighlighted
                    ? `0 0 18px rgba(${mod.glowRgb}, 0.35)`
                    : '0 4px 16px rgba(0, 0, 0, 0.35)',
                }}
              >
                {/* Micro Corner Brackets */}
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-cyan-400/80 pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-cyan-400/80 pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-cyan-400/80 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-cyan-400/80 pointer-events-none" />

                {/* Product Icon Badge */}
                <div
                  className={`w-8.5 h-8.5 rounded-xl ${mod.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-md`}
                >
                  {mod.icon}
                </div>

                {/* Title & Subtitle without Clipping */}
                <div className="flex flex-col text-left min-w-0 flex-1 z-10">
                  <span className="text-[13px] font-black text-white leading-tight truncate tracking-tight group-hover:text-cyan-400 transition-colors">
                    {mod.title}
                  </span>
                  <span
                    className="text-[10px] font-bold mt-0.5 truncate tracking-wide"
                    style={{ color: mod.accentColor }}
                  >
                    {mod.subtitle}
                  </span>
                </div>

                {/* Status Ping Dot */}
                <div className="shrink-0 pl-0.5 z-10">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-80"
                      style={{ backgroundColor: mod.accentColor }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2 shadow-[0_0_6px_currentColor]"
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
  );
});

export const HeroMotherboard = HeroEarth3D;
export default HeroEarth3D;
