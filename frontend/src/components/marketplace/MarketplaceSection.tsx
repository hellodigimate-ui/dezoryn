import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  GraduationCap,
  Cross,
  Users2,
  Boxes,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Code2,
  Building2,
  Zap,
  Globe,
  Layers,
  Sparkles,
  Package
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { cachedApiFetch } from '../../config/api.config';

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

const renderProductIcon = (iconName?: string) => {
  switch (iconName) {
    case 'GraduationCap':
      return <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    case 'Cross':
      return <Cross className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    case 'Users2':
    case 'Users':
      return <Users2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    case 'Boxes':
      return <Boxes className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
    case 'Globe':
      return <Globe className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
    case 'Building2':
      return <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    case 'Zap':
      return <Zap className="w-6 h-6 text-amber-500" />;
    case 'Layers':
      return <Layers className="w-6 h-6 text-purple-500" />;
    case 'Sparkles':
      return <Sparkles className="w-6 h-6 text-cyan-500" />;
    case 'Code2':
      return <Code2 className="w-6 h-6 text-blue-500" />;
    default:
      return <Package className="w-6 h-6 text-blue-600 dark:text-cyan-400" />;
  }
};

export const MarketplaceSection: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const iconRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    setIsLoading(true);
    cachedApiFetch('/products')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const enabledProducts = resData.data.filter((p: any) => p.isEnabled !== false);
          if (enabledProducts.length > 0) {
            const mapped: CardItem[] = enabledProducts.slice(0, 4).map((p: any, idx: number) => {
              const bgColors = [
                'bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800',
                'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800',
                'bg-purple-100 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800',
                'bg-amber-100 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
              ];
              return {
                id: p.id || `prod-${idx}`,
                title: p.title || p.name || 'SaaS Product',
                subtitle: p.subtitle || p.categoryLabel || p.category || 'Enterprise Solution',
                icon: renderProductIcon(p.icon),
                iconBg: bgColors[idx % bgColors.length],
                iconColor: 'text-blue-600',
                features: Array.isArray(p.features) && p.features.length > 0
                  ? p.features.slice(0, 4)
                  : ['Custom Workflow', 'Cloud Automation', 'Analytics', '24/7 Support'],
              };
            });

            // Append "Explore Catalog" card
            mapped.push({
              id: 'more',
              title: 'Explore Catalog',
              subtitle: 'View All Software Modules',
              icon: <LayoutGrid className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
              iconBg: 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-200 dark:border-cyan-800',
              iconColor: 'text-cyan-600',
              isMore: true,
              features: [
                'Enterprise ERP Modules',
                'CRM & Sales Automation',
                'Healthcare & Academic Suites',
                'AI Copilots & Integrations'
              ]
            });

            setCards(mapped);
          } else {
            setCards([]);
          }
        } else {
          setCards([]);
        }
      })
      .catch(() => {
        setCards([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Responsive Mouse LERP Coordinates (-0.5 to 0.5)
  const isInView = useInView(sectionRef, { amount: 0.05 });
  const isInViewRef = useRef(isInView);

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  const targetMouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });

  // 60 FPS ZERO RE-RENDER HIGH-PERFORMANCE LERP PARALLAX LOOP (Pauses when off-screen or idle)
  useEffect(() => {
    let animId: number;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    let isIdle = false;

    const loop = () => {
      // Immediately yield CPU when section is off-screen or tab is hidden
      if (!isInViewRef.current || document.hidden) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const dx = Math.abs(currentMouse.current.x - targetMouse.current.x);
      const dy = Math.abs(currentMouse.current.y - targetMouse.current.y);

      if (dx > 0.001 || dy > 0.001) {
        isIdle = false;
        currentMouse.current.x = lerp(currentMouse.current.x, targetMouse.current.x, 0.055);
        currentMouse.current.y = lerp(currentMouse.current.y, targetMouse.current.y, 0.055);

        const mx = currentMouse.current.x;
        const my = currentMouse.current.y;

        // Layer 1: Background Grid & Glow (Move 3px opposite)
        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(${-mx * 6}px, ${-my * 6}px, 0)`;
        }

        // Layer 2: Section Heading (Move 5px)
        if (headingRef.current) {
          headingRef.current.style.transform = `translate3d(${mx * 6}px, ${my * 6}px, 0)`;
        }

        // Layer 3, 4, 5: Cards, Icons, Buttons
        cardsRef.current.forEach((card, index) => {
          const colIndex = index % 5;
          const cardCenterX = (colIndex - 2) * 0.25;
          const dist = Math.abs(mx - cardCenterX);
          const proximity = Math.max(0.8, 1.2 - dist);

          // Layer 3: Card 3D Parallax Tilt
          const cardEl = cardRefs.current[card.id];
          if (cardEl) {
            const cardX = mx * 8 * proximity;
            const cardY = my * 8 * proximity;
            const rotX = Math.max(-3, Math.min(3, -my * 3 * proximity));
            const rotY = Math.max(-4, Math.min(4, mx * 4 * proximity));
            cardEl.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          }

          // Layer 4: Icon Depth (Move 10px)
          const iconEl = iconRefs.current[card.id];
          if (iconEl) {
            const iconX = mx * 10 * proximity;
            const iconY = my * 10 * proximity;
            iconEl.style.transform = `translate3d(${iconX}px, ${iconY}px, 0)`;
          }

          // Layer 5: Buttons Depth (Move 5px)
          const btnEl = buttonRefs.current[card.id];
          if (btnEl) {
            const btnX = mx * 5;
            const btnY = my * 5;
            btnEl.style.transform = `translate3d(${btnX}px, ${btnY}px, 0)`;
          }
        });
      } else if (!isIdle) {
        isIdle = true;
      }

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
        className="absolute inset-0 pointer-events-none -z-10 transform-gpu"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-cyan-400/10 to-indigo-400/5 dark:from-blue-600/10 dark:via-cyan-500/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── LAYER 2: Section Header ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center justify-between mb-10"
        >
          <div
            ref={headingRef}
            style={{ willChange: 'transform' }}
            className="flex flex-col text-left transform-gpu"
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

        {/* ── LAYER 3, 4, 5: Product Cards Grid with Ultra-Smooth Floating Panel Architecture ── */}
        {cards.length === 0 && !isLoading ? (
          <div className="text-center py-12 px-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl max-w-xl mx-auto">
            <Package className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">
              Marketplace Catalog
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed font-normal">
              Explore our full ecosystem of enterprise software solutions, CRM modules, and AI copilots.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('/marketplace')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              Open Marketplace Catalog
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 28,
                    scale: 0.96,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  },
                }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.07,
                  type: 'spring',
                  stiffness: 160,
                  damping: 22,
                  mass: 0.7,
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="transform-gpu h-full"
              >
                <div
                  ref={(el) => {
                    cardRefs.current[card.id] = el;
                  }}
                  style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                  className="group relative h-full bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-[0_16px_40px_-10px_rgba(56,189,248,0.3),0_0_16px_rgba(56,189,248,0.25)] backdrop-blur-xl transition-shadow transition-colors duration-300 text-left overflow-hidden transform-gpu"
                >
                  {/* Animated Gradient Border Overlay */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/60 dark:group-hover:border-cyan-400/60 transition-colors duration-300 pointer-events-none" />

                  {/* Diagonal Glass Reflection Shimmer Pass */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 dark:via-cyan-400/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

                  <div>
                    {/* Header Icon + Title */}
                    <div className="flex items-center gap-3 mb-4">
                      {/* LAYER 4: Product Icon */}
                      <div
                        ref={(el) => {
                          iconRefs.current[card.id] = el;
                        }}
                        style={{ willChange: 'transform' }}
                        className="transform-gpu"
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} transition-all duration-300 ease-out group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-[0_0_14px_rgba(56,189,248,0.4)]`}>
                          {card.icon}
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0">
                        {/* Title */}
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate font-['Plus_Jakarta_Sans'] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                          {card.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                          {card.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Bullets */}
                    <ul className="space-y-2 mb-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      {card.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-transform duration-200 group-hover:translate-x-1"
                          style={{ transitionDelay: `${i * 30}ms` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 transition-shadow duration-200 group-hover:shadow-[0_0_8px_#38bdf8]" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* LAYER 5: Buttons Container */}
                  <div
                    ref={(el) => {
                      buttonRefs.current[card.id] = el;
                    }}
                    style={{ willChange: 'transform' }}
                    className="transform-gpu"
                  >
                    {card.isMore ? (
                      <button
                        onClick={() => navigateTo('/marketplace')}
                        className="w-full py-2 px-3 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors duration-200 shadow-xs cursor-pointer flex items-center justify-center gap-1 group/btn"
                      >
                        <span>Explore All</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {/* View Details button */}
                        <button
                          onClick={() => navigateTo(`/product-detail?id=${card.id}`)}
                          className="py-2 px-2.5 rounded-lg border border-blue-600 bg-transparent dark:bg-transparent text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors duration-200 shadow-xs cursor-pointer"
                        >
                          View Details
                        </button>

                        {/* Watch Demo button */}
                        <button
                          onClick={() => navigateTo('/book-demo')}
                          className="py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-transparent text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
                        >
                          Watch Demo
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
});
