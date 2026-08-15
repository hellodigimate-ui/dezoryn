import React from 'react';
import { motion } from 'framer-motion';
import { getValidSocialUrl } from '../../utils/contactUtils';

export interface SocialLinksMap {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
}

interface PremiumSocialButtonsProps {
  socialLinks: SocialLinksMap;
}

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fillRule="evenodd" clipRule="evenodd" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface SocialConfig {
  key: string;
  name: string;
  rawUrl?: string;
  icon: React.FC<{ className?: string }>;
  brandColor: string;
  glowColor: string;
  gradientRing: string;
}

export const PremiumSocialButtons: React.FC<PremiumSocialButtonsProps> = ({ socialLinks }) => {
  const SOCIAL_ITEMS: SocialConfig[] = [
    {
      key: 'linkedin',
      name: 'LinkedIn',
      rawUrl: socialLinks.linkedin,
      icon: LinkedinIcon,
      brandColor: '#0A66C2',
      glowColor: 'rgba(10, 102, 194, 0.5)',
      gradientRing: 'from-blue-600 via-cyan-400 to-blue-400',
    },
    {
      key: 'github',
      name: 'GitHub',
      rawUrl: socialLinks.github,
      icon: GithubIcon,
      brandColor: '#24292e',
      glowColor: 'rgba(148, 163, 184, 0.4)',
      gradientRing: 'from-slate-400 via-slate-200 to-slate-500',
    },
    {
      key: 'twitter',
      name: 'Twitter / X',
      rawUrl: socialLinks.twitter,
      icon: TwitterIcon,
      brandColor: '#1DA1F2',
      glowColor: 'rgba(29, 161, 242, 0.5)',
      gradientRing: 'from-sky-400 via-blue-500 to-cyan-400',
    },
    {
      key: 'instagram',
      name: 'Instagram',
      rawUrl: socialLinks.instagram,
      icon: InstagramIcon,
      brandColor: '#E1306C',
      glowColor: 'rgba(225, 48, 108, 0.5)',
      gradientRing: 'from-amber-400 via-rose-500 to-purple-600',
    },
    {
      key: 'youtube',
      name: 'YouTube',
      rawUrl: socialLinks.youtube,
      icon: YoutubeIcon,
      brandColor: '#FF0000',
      glowColor: 'rgba(255, 0, 0, 0.5)',
      gradientRing: 'from-red-500 via-rose-600 to-amber-500',
    },
    {
      key: 'facebook',
      name: 'Facebook',
      rawUrl: socialLinks.facebook,
      icon: FacebookIcon,
      brandColor: '#1877F2',
      glowColor: 'rgba(24, 119, 242, 0.5)',
      gradientRing: 'from-blue-500 via-indigo-500 to-cyan-400',
    },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap pt-1 font-['Plus_Jakarta_Sans',sans-serif]">
      {SOCIAL_ITEMS.map((social) => {
        const validUrl = getValidSocialUrl(social.rawUrl, social.key);
        if (!validUrl) return null;
        const IconComponent = social.icon;

        return (
          <div key={social.key} className="relative group/btn">
            {/* Tooltip on Hover — scoped to group/btn only */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-all duration-300 shadow-xl pointer-events-none group-hover/btn:-translate-y-1 z-30">
              {social.name}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
            </div>

            <motion.a
              href={validUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={social.name}
              whileHover={{ y: -5, scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative flex items-center justify-center w-11 h-11 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-md text-slate-700 dark:text-slate-300 transition-all duration-300 cursor-pointer overflow-visible"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Rotating Gradient Ring on Hover — scoped to group/btn */}
              <div
                className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${social.gradientRing} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 animate-[spin_4s_linear_infinite] blur-[1px] z-0`}
              />

              {/* Frosted Glass Inner Container */}
              <div className="relative z-10 w-full h-full rounded-[14px] bg-white/90 dark:bg-slate-950/90 flex items-center justify-center transition-colors duration-300 group-hover/btn:bg-transparent group-hover/btn:text-white">
                <IconComponent className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" />
              </div>

              {/* Ripple Pulse Outer Ring */}
              <div
                className="absolute inset-0 rounded-2xl border border-current opacity-0 group-hover/btn:animate-ping pointer-events-none"
                style={{ color: social.brandColor }}
              />
            </motion.a>
          </div>
        );
      })}
    </div>
  );
};
