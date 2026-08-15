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
  const duration = anim.duration ?? 0.6;
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
    if (url === '') return '';
    if (!url) return DEFAULT_ABOUT_DATA.mediaUrl!;
    return resolveMediaUrl(url);
  };

  const mediaSrc = resolveMedia(data.mediaUrl);
  const isVideo = data.mediaType === 'VIDEO' || (typeof mediaSrc === 'string' && (mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.webm')));

  const textColumnContent = (
    <motion.div
      key="text-col"
      initial={textVariants.initial}
      whileInView={textVariants.whileInView}
      viewport={{ once: true }}
      transition={{ duration, delay: anim.slideEnabled ? 0 : delay }}
      className="lg:col-span-6 flex flex-col items-start text-left"
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer"
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
      viewport={{ once: true }}
      transition={{ duration, delay }}
      className="lg:col-span-6 relative"
    >
      <div
        className="relative w-full h-[320px] sm:h-[400px] rounded-tl-[120px] rounded-br-[40px] rounded-tr-3xl rounded-bl-3xl overflow-hidden shadow-2xl shadow-blue-900/10 dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-800"
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
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
        )}

        {/* Ambient Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-transparent to-transparent pointer-events-none"
          style={{ opacity: data.styleSettings?.overlayOpacity ?? 0.2 }}
        />

        {/* Floating Information Card Overlay */}
        {data.cardEnabled && (
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white shadow-lg">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400">
                <CardIconComponent className="w-4 h-4" />
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                  {data.cardTitle}
                </span>
                {data.cardSubtitle && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {data.cardSubtitle}
                  </span>
                )}
              </div>
            </div>
            {data.cardLocation && (
              <span className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-slate-800">
                {data.cardLocation}
              </span>
            )}
          </div>
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
