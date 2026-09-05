import React, { useEffect, useRef, useCallback, Suspense } from "react";
import { useInView } from "framer-motion";
import { HeroContent } from "./HeroContent";
import { HeroEarth3D } from "./HeroEarth3D";

// Fallback loader
const PCBFallback: React.FC = () => (
  <div className="w-full h-[520px] flex items-center justify-center bg-[#030712] rounded-[24px]">
    <div className="w-44 h-44 rounded-2xl bg-slate-900 border border-cyan-500/30 animate-pulse flex items-center justify-center">
      <div className="w-28 h-28 rounded-xl border-2 border-dashed border-cyan-400/40 animate-spin" />
    </div>
  </div>
);

export const HeroSection: React.FC = React.memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.05 });
  const isInViewRef = useRef(isInView);

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  const spotlightRef = useRef<HTMLDivElement>(null);
  const ambientLayerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const targetSpotlight = useRef({ x: 50, y: 50 });
  const currentSpotlight = useRef({ x: 50, y: 50 });
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current || !isInViewRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    targetSpotlight.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetSpotlight.current = { x: 50, y: 50 };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const lerp = (start: number, end: number, amount: number) =>
      start + (end - start) * amount;

    let isIdle = false;

    const updateMotion = () => {
      // Yield CPU when section is off-screen or tab is hidden
      if (!isInViewRef.current || document.hidden) {
        frameId = window.requestAnimationFrame(updateMotion);
        return;
      }

      const dx = Math.abs(currentSpotlight.current.x - targetSpotlight.current.x);
      const dy = Math.abs(currentSpotlight.current.y - targetSpotlight.current.y);
      const ds = Math.abs(currentScroll.current - targetScroll.current);

      // Only perform DOM updates when values are changing (Idle Sleep)
      if (dx > 0.05 || dy > 0.05 || ds > 0.002) {
        isIdle = false;
        currentSpotlight.current.x = lerp(
          currentSpotlight.current.x,
          targetSpotlight.current.x,
          0.12,
        );
        currentSpotlight.current.y = lerp(
          currentSpotlight.current.y,
          targetSpotlight.current.y,
          0.12,
        );
        currentScroll.current = lerp(
          currentScroll.current,
          targetScroll.current,
          0.14,
        );

        if (spotlightRef.current) {
          spotlightRef.current.style.background = `radial-gradient(600px circle at ${currentSpotlight.current.x}% ${currentSpotlight.current.y}%, rgba(0, 240, 255, 0.07), transparent 80%)`;
        }

        if (ambientLayerRef.current) {
          ambientLayerRef.current.style.transform = `translate3d(0, ${currentScroll.current * 25}px, 0)`;
        }

        if (leftColumnRef.current) {
          leftColumnRef.current.style.transform = `translate3d(0, ${currentScroll.current * 15}px, 0)`;
        }

        if (rightColumnRef.current) {
          rightColumnRef.current.style.transform = `translate3d(0, ${currentScroll.current * 10}px, 0)`;
        }
      } else if (!isIdle) {
        isIdle = true;
      }

      frameId = window.requestAnimationFrame(updateMotion);
    };

    const handleScroll = () => {
      if (!isInViewRef.current) return;
      const scrollY = window.scrollY;
      targetScroll.current = Math.min(scrollY / 500, 1);
    };

    frameId = window.requestAnimationFrame(updateMotion);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden min-h-[700px] flex items-center justify-center bg-gradient-to-b from-blue-50/60 via-slate-50/40 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 font-sans"
    >
      {/* ── Soft Interactive Cursor Spotlight Glow ── */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 -z-10"
        style={{
          willChange: "background-position",
          backfaceVisibility: "hidden",
        }}
      />

      {/* ── GPU Accelerated Background Grid & Parallax Ambient Backdrops ── */}
      <div
        ref={ambientLayerRef}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)",
        }}
        className="absolute inset-0 pointer-events-none -z-10"
      >
        <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/15 via-sky-300/15 to-indigo-300/10 dark:from-blue-600/15 dark:via-sky-500/10 dark:to-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-10 left-10 w-[320px] h-[320px] bg-blue-200/15 dark:bg-blue-600/10 blur-[90px] rounded-full" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[640px]">
          {/* Left Column: Hero Copy & CTAs */}
          <div
            ref={leftColumnRef}
            className="lg:col-span-6 z-10"
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            <HeroContent />
          </div>

          {/* Right Column: Enterprise AI Motherboard Interface Container */}
          <div
            ref={rightColumnRef}
            className="lg:col-span-6 z-10 w-full flex items-center justify-center"
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            <div className="w-full relative flex items-center justify-center">
              <Suspense fallback={<PCBFallback />}>
                <HeroEarth3D />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
