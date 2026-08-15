import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Cross,
  Users2,
  Boxes,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  features: string[];
  isMore?: boolean;
}

const marketplaceCards: CardItem[] = [
  {
    id: 'schoolycore',
    title: 'SchoolyCore',
    subtitle: 'School ERP',
    icon: <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    iconBg: 'bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600',
    features: [
      'Student Management',
      'Attendance',
      'Fees Management',
      'Exams & Reports'
    ]
  },

  {
    id: 'hms-health',
    title: 'HMS',
    subtitle: 'Hospital Management',
    icon: <Cross className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600',
    features: [
      'OPD / IPD',
      'Billing & Invoicing',
      'Pharmacy',
      'Reports & Analytics'
    ]
  },
  {
    id: 'dezoryn-hrms',
    title: 'HRMS',
    subtitle: 'Human Resource Management',
    icon: <Users2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    iconBg: 'bg-purple-100 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600',
    features: [
      'Employee Management',
      'Payroll',
      'Leave & Attendance',
      'Performance'
    ]
  },
  {
    id: 'inventory-pro',
    title: 'InventoryPro',
    subtitle: 'Inventory Management',
    icon: <Boxes className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600',
    features: [
      'Stock Management',
      'Sales & Purchase',
      'Warehouse',
      'Reports'
    ]
  },
  {
    id: 'more',
    title: 'More Products',
    subtitle: 'And Many More...',
    icon: <LayoutGrid className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
    iconBg: 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-200 dark:border-cyan-800',
    iconColor: 'text-cyan-600',
    isMore: true,
    features: [
      'Transport Management',
      'Library Management',
      'POS & Billing',
      'Custom Solutions'
    ]
  }
];

export const MarketplaceSection: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const iconRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  // Weighty Mouse LERP Coordinates (-0.5 to 0.5)
  const targetMouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });

  // 60 FPS ZERO RE-RENDER LERP PARALLAX LOOP
  useEffect(() => {
    let animId: number;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const loop = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(loop);
        return;
      }

      currentMouse.current.x = lerp(currentMouse.current.x, targetMouse.current.x, 0.015);
      currentMouse.current.y = lerp(currentMouse.current.y, targetMouse.current.y, 0.015);

      const mx = currentMouse.current.x;
      const my = currentMouse.current.y;

      // Layer 1: Background Grid & Glow (Move 2px opposite)
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${-mx * 2}px, ${-my * 2}px, 0)`;
      }

      // Layer 2: Section Heading (Move 3px)
      if (headingRef.current) {
        headingRef.current.style.transform = `translate3d(${mx * 3}px, ${my * 3}px, 0)`;
      }

      // Layer 3, 4, 5: Cards (6px max), Icons (10px max), Buttons (3.5px max)
      marketplaceCards.forEach((card, index) => {
        const colIndex = index % 3;
        const rowIndex = Math.floor(index / 3);
        const cardCenterX = (colIndex - 1) * 0.4;
        const cardCenterY = (rowIndex - 0.5) * 0.4;

        const dist = Math.hypot(mx - cardCenterX, my - cardCenterY);
        const proximity = Math.max(0.7, 1.3 - dist);

        // Layer 3: Card Translation (Max 8px) & 3D Tilt (Max 2° rotateX, 3° rotateY)
        const cardEl = cardRefs.current[card.id];
        if (cardEl) {
          const cardX = mx * 6 * proximity;
          const cardY = my * 6 * proximity;
          const rotX = Math.max(-2, Math.min(2, -my * 2 * proximity));
          const rotY = Math.max(-3, Math.min(3, mx * 3 * proximity));
          cardEl.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }

        // Layer 4: Icons (Move 10px inside container, max 12px)
        const iconEl = iconRefs.current[card.id];
        if (iconEl) {
          const iconX = mx * 10 * proximity;
          const iconY = my * 10 * proximity;
          iconEl.style.transform = `translate3d(${iconX}px, ${iconY}px, 0)`;
        }

        // Layer 5: Buttons (Move 3.5px, translation only, never rotate)
        const btnEl = buttonRefs.current[card.id];
        if (btnEl) {
          const btnX = mx * 3.5;
          const btnY = my * 3.5;
          btnEl.style.transform = `translate3d(${btnX}px, ${btnY}px, 0)`;
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    targetMouse.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    targetMouse.current.y = (e.clientY - rect.top) / rect.height - 0.5;
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetMouse.current.x = 0;
    targetMouse.current.y = 0;
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id="marketplace"
      style={{ perspective: '1200px' }}
      className="relative py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 overflow-hidden font-sans select-none"
    >
      {/* ── LAYER 1: Background Grid & Subtle Glow ── */}
      <div
        ref={bgRef}
        style={{ willChange: 'transform' }}
        className="absolute inset-0 pointer-events-none -z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-cyan-400/10 to-indigo-400/5 dark:from-blue-600/10 dark:via-cyan-500/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── LAYER 2: Section Header (Move 3px) ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center justify-between mb-10"
        >
          <div
            ref={headingRef}
            style={{ willChange: 'transform' }}
            className="flex flex-col text-left transition-transform duration-100 ease-out"
          >
            {/* "MARKETPLACE" badge */}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-['Plus_Jakarta_Sans'] flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              MARKETPLACE
            </motion.span>

            {/* Heading "Explore our SaaS Products" */}
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans']"
            >
              Explore our SaaS Products
            </motion.h2>
          </div>

          {/* Navigation Arrows */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1 }
            }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-2"
          >
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>

        {/* ── LAYER 3, 4, 5: Product Cards Grid with Premium Floating Glass Panels ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
        >
          {marketplaceCards.map((card, index) => (
            <motion.div
              key={card.id}
              ref={(el) => {
                cardRefs.current[card.id] = el;
              }}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 32,
                  scale: 0.96,
                  filter: 'blur(6px)',
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                },
              }}
              transition={{
                duration: 0.65,
                delay: 0.22 + index * 0.08,
                type: 'spring',
                stiffness: 180,
                damping: 22,
                mass: 0.7,
              }}
              whileHover={{
                y: -10,
                scale: 1.025,
              }}
              style={{ willChange: 'transform, opacity, filter', transformStyle: 'preserve-3d' }}
              className="group relative bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-[0_12px_36px_-10px_rgba(56,189,248,0.25),0_0_12px_rgba(56,189,248,0.35)] backdrop-blur-xl transition-all duration-300 text-left overflow-hidden"
            >
              {/* Animated Gradient Border Overlay */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/60 dark:group-hover:border-cyan-400/60 transition-colors duration-500 pointer-events-none" />

              {/* Diagonal Glass Reflection Shimmer Pass (1.0s light sweep) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 dark:via-cyan-400/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              <div>
                {/* Header Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  {/* LAYER 4: Product Icon (Elevates, scale 1.08, lifts 2px, rotates 3°, increased glow) */}
                  <div
                    ref={(el) => {
                      iconRefs.current[card.id] = el;
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, rotate: 0 }}
                      whileInView={{ scale: 1, rotate: 3 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.35 + index * 0.08, ease: 'easeOut' }}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} transition-all duration-300 ease-out group-hover:scale-108 group-hover:-translate-y-0.5 group-hover:rotate-3 group-hover:shadow-[0_0_14px_rgba(56,189,248,0.4)]`}
                    >
                      {card.icon}
                    </motion.div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    {/* Title: Increases brightness, lifts 2px, subtle letter spacing */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate font-['Plus_Jakarta_Sans'] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-blue-600 dark:group-hover:text-cyan-300 group-hover:tracking-wide">
                      {card.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {card.subtitle}
                    </span>
                  </div>
                </div>

                {/* Bullets: Sequential Stagger (40ms), text shifts right 4px, bullet glows */}
                <ul className="space-y-2 mb-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  {card.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-300 group-hover:translate-x-1"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 transition-shadow duration-300 group-hover:shadow-[0_0_8px_#38bdf8]" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* LAYER 5: Buttons Container (Lift 3px, increase contrast, border brightens, arrow slides 4px, blue glow) */}
              <div
                ref={(el) => {
                  buttonRefs.current[card.id] = el;
                }}
                style={{ willChange: 'transform' }}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                {card.isMore ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.45 + index * 0.08 }}
                    onClick={() => navigateTo('/marketplace')}
                    className="w-full py-2 px-3 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-1 group/btn"
                  >
                    <span>Explore All</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                  </motion.button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* View Details button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.45 + index * 0.08 }}
                      onClick={() => navigateTo(`/product-detail?id=${card.id}`)}
                      className="py-2 px-2.5 rounded-lg border border-blue-600 bg-transparent dark:bg-transparent text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
                    >
                      View Details
                    </motion.button>

                    {/* Watch Demo button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.51 + index * 0.08 }}
                      onClick={() => navigateTo('/book-demo')}
                      className="py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-transparent text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
                    >
                      Watch Demo
                    </motion.button>
                  </div>
                )}
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
});
