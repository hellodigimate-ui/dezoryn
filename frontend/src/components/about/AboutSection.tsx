import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Building,
  Award,
  CheckCircle2,
  Zap,
  Star,
  Layers
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API_ABOUT = `${API_URL}/about`;


const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  Globe,
  Building,
  Award,
  CheckCircle2,
  Zap,
  Star,
  Layers,
  Sparkles,
};

export interface AboutSectionData {
  badge: string;
  heading: string;
  descriptionOne: string;
  descriptionTwo: string;
  buttonText: string;
  buttonUrl: string;
  buttonEnabled: boolean;
  mediaUrl: string | null;
  mediaType: 'IMAGE' | 'VIDEO' | string;
  cardEnabled: boolean;
  cardTitle: string;
  cardSubtitle: string;
  cardLocation: string;
  cardIcon: string;
  layoutSettings?: {
    imagePosition?: 'left' | 'right';
    imageWidth?: string;
    imageHeight?: string;
    borderRadius?: string;
    padding?: string;
    columnGap?: string;
    verticalAlign?: 'center' | 'top' | 'bottom';
  };
  styleSettings?: {
    bgColor?: string;
    accentColor?: string;
    headingColor?: string;
    paragraphColor?: string;
    overlayOpacity?: number;
  };
  animationSettings?: {
    fadeEnabled?: boolean;
    slideEnabled?: boolean;
    scaleEnabled?: boolean;
    duration?: number;
    delay?: number;
  };
}

const DEFAULT_ABOUT_DATA: AboutSectionData = {
  badge: 'ABOUT DEZORYN TECHNOLOGIES ENTERPRISE',
  heading: 'Pioneering Predictive AI Workflows for Modern Enterprise',
  descriptionOne: 'Dezoryn Technologies Enterprise is an innovation-driven platform delivering next-generation intelligent automation software for Education, Healthcare, Business and Enterprises.',
  descriptionTwo: 'We are committed to digital transformation through technology, AI workflows, and operational excellence across global markets.',
  buttonText: 'Learn More About Our Mission',
  buttonUrl: '/about',
  buttonEnabled: true,
  mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&fm=webp&q=75',
  mediaType: 'IMAGE',
  cardEnabled: true,
  cardTitle: 'Global Enterprise HQ',
  cardSubtitle: 'Innovation Center',
  cardLocation: 'San Francisco, CA',
  cardIcon: 'ShieldCheck',
  layoutSettings: {
    imagePosition: 'right',
    imageWidth: '100%',
    imageHeight: '380px',
    borderRadius: '1.5rem',
    padding: '5rem 1rem',
    columnGap: '2.5rem',
    verticalAlign: 'center',
  },
  styleSettings: {
    bgColor: 'transparent',
    accentColor: '#2563eb',
    headingColor: '#0f172a',
    paragraphColor: '#475569',
    overlayOpacity: 0.2,
  },
  animationSettings: {
    fadeEnabled: true,
    slideEnabled: true,
    scaleEnabled: false,
    duration: 0.6,
    delay: 0.2,
  },
};

export const AboutSection: React.FC<{ initialData?: AboutSectionData }> = React.memo(({ initialData }) => {
  const { navigateTo } = useNavigation();
  const [data, setData] = useState<AboutSectionData>(initialData || DEFAULT_ABOUT_DATA);

  const fetchAboutData = async () => {
    try {
      const res = await apiFetch(API_ABOUT);
      const json = await res.json();
      if (json.success && json.data) {
        setData({
          ...DEFAULT_ABOUT_DATA,
          ...json.data,
          layoutSettings: { ...DEFAULT_ABOUT_DATA.layoutSettings, ...json.data.layoutSettings },
          styleSettings: { ...DEFAULT_ABOUT_DATA.styleSettings, ...json.data.styleSettings },
          animationSettings: { ...DEFAULT_ABOUT_DATA.animationSettings, ...json.data.animationSettings },
        });
      }
    } catch {
      const local = localStorage.getItem('dezo-about-data');
      if (local) {
        try {
          setData(JSON.parse(local));
        } catch {
          // ignore
        }
      }
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchAboutData();

      const handleUpdate = (e: Event) => {
        const detail = (e as CustomEvent)?.detail;
        if (detail) {
          setData((prev) => ({
            ...prev,
            ...detail,
          }));
        } else {
          fetchAboutData();
        }
      };

      window.addEventListener('dezo-about-updated', handleUpdate);
      window.addEventListener('focus', fetchAboutData);
      return () => {
        window.removeEventListener('dezo-about-updated', handleUpdate);
        window.removeEventListener('focus', fetchAboutData);
      };
    } else {
      setData(initialData);
    }
  }, [initialData]);

  const CardIconComponent = ICON_MAP[data.cardIcon] || ShieldCheck;
  const isRightImage = data.layoutSettings?.imagePosition !== 'left';

  // Animation variants
  const anim = data.animationSettings || {};
  const delay = anim.delay ?? 0.2;

  const textVariants = {
    initial: {
      opacity: anim.fadeEnabled ? 0 : 1,
      x: anim.slideEnabled ? (isRightImage ? -30 : 30) : 0,
      scale: anim.scaleEnabled ? 0.95 : 1,
    },
    whileInView: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
  };

  const mediaVariants = {
    initial: {
      opacity: anim.fadeEnabled ? 0 : 1,
      x: anim.slideEnabled ? (isRightImage ? 30 : -30) : 0,
      scale: anim.scaleEnabled ? 0.95 : 1,
    },
    whileInView: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
  };

  const resolveMedia = (url: string | null | undefined): string => {
    if (!url || !url.trim()) return DEFAULT_ABOUT_DATA.mediaUrl!;
    return resolveMediaUrl(url);
  };

  const mediaSrc = resolveMedia(data.mediaUrl);
  const isVideo = data.mediaType === 'VIDEO' || (typeof mediaSrc === 'string' && (mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.webm')));

  const textColumnContent = (
    <motion.div
      key="text-col"
      initial={textVariants.initial}
      whileInView={textVariants.whileInView}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: 'spring',
        stiffness: 110,
        damping: 20,
        mass: 0.8,
        delay: anim.slideEnabled ? 0 : delay,
      }}
      className="lg:col-span-6 flex flex-col items-start text-left transform-gpu"
    >
      {data.badge && (
        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-3 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          {data.badge}
        </span>
      )}

      {data.heading && (
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          {data.heading}
        </h2>
      )}

      {data.descriptionOne && (
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-semibold mb-4">
          {data.descriptionOne}
        </p>
      )}

      {data.descriptionTwo && (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6">
          {data.descriptionTwo}
        </p>
      )}

      {data.buttonEnabled && data.buttonText && (
        <button
          type="button"
          onClick={() => {
            if (data.buttonUrl.startsWith('http')) {
              window.open(data.buttonUrl, '_blank');
            } else {
              navigateTo(data.buttonUrl as any);
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer transform-gpu hover:-translate-y-0.5"
        >
          <span>{data.buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );

  const mediaColumnContent = (
    <motion.div
      key="media-col"
      initial={mediaVariants.initial}
      whileInView={mediaVariants.whileInView}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: 'spring',
        stiffness: 110,
        damping: 20,
        mass: 0.8,
        delay,
      }}
      className="lg:col-span-6 relative transform-gpu"
    >
      <div
        className="relative w-full h-[320px] sm:h-[400px] rounded-tl-[120px] rounded-br-[40px] rounded-tr-3xl rounded-bl-3xl overflow-hidden shadow-2xl shadow-blue-900/10 dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-800 transform-gpu"
        style={{
          borderRadius: data.layoutSettings?.borderRadius || '1.5rem',
        }}
      >
        {isVideo ? (
          <video
            src={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={mediaSrc}
            alt={data.heading || 'Dezoryn Technologies Enterprise'}
            className="w-full h-full object-cover transform-gpu hover:scale-105 transition-transform duration-700 ease-out"
          />
        )}

        {/* Ambient Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-transparent to-transparent pointer-events-none"
          style={{ opacity: data.styleSettings?.overlayOpacity ?? 0.2 }}
        />

        {/* Buttery Smooth Floating Information Card Overlay */}
        {data.cardEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 24,
              delay: delay + 0.2,
            }}
            whileHover={{
              y: -5,
              scale: 1.02,
              transition: { type: 'spring', stiffness: 350, damping: 22 },
            }}
            className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 p-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/20 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white shadow-2xl shadow-slate-950/40 transition-shadow transition-colors duration-300 cursor-pointer group transform-gpu"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/15 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-400 border border-blue-500/20 dark:border-cyan-500/20 shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-200">
                <CardIconComponent className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-tight tracking-wide">
                  {data.cardTitle}
                </span>
                {data.cardSubtitle && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    {data.cardSubtitle}
                  </span>
                )}
              </div>
            </div>
            {data.cardLocation && (
              <span className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-400 px-3 py-1 rounded-xl bg-blue-500/10 dark:bg-slate-800/90 border border-blue-500/20 dark:border-cyan-500/20 shrink-0">
                {data.cardLocation}
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <section
      id="about"
      className="py-16 sm:py-20 bg-white dark:bg-slate-950 relative transition-colors duration-300"
      style={{
        backgroundColor: data.styleSettings?.bgColor && data.styleSettings.bgColor !== 'transparent' ? data.styleSettings.bgColor : undefined,
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {isRightImage ? [textColumnContent, mediaColumnContent] : [mediaColumnContent, textColumnContent]}
        </div>
      </div>
    </section>
  );
});
