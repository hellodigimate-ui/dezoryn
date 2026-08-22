import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageSquare,
  Sparkles,
  Clock,
  LifeBuoy
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { CompanyTimeline } from './CompanyTimeline';
import { PremiumSocialButtons } from '../common/PremiumSocialButtons';
import { AnimatedDivider } from '../common/AnimatedDivider';
import { FooterNewsletter } from './FooterNewsletter';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { getNormalizedWhatsAppUrl } from '../../utils/contactUtils';

import { API_URL, cachedApiFetch } from '../../config/api.config';

const API_CONTACT = `${API_URL}/contact`;
const API_FOOTER = `${API_URL}/footer`;

/* ─── Stagger container variants ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

/* ─────────────────────────────────────────────
   Shimmer gradient CSS injected once
───────────────────────────────────────────── */
const SHIMMER_STYLE = `
@keyframes dezo-ripple {
  to { transform: scale(2.5); opacity: 0; }
}
@keyframes dezo-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes dezo-breathe {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.04); }
}
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('dezo-footer-anims')) return;
  const s = document.createElement('style');
  s.id = 'dezo-footer-anims';
  s.textContent = SHIMMER_STYLE;
  document.head.appendChild(s);
}

const DEFAULT_SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/dezoryn',
  github: 'https://github.com/dezoryn',
  twitter: 'https://twitter.com/dezoryn',
  instagram: 'https://instagram.com/dezoryn',
  youtube: 'https://youtube.com/@dezoryn',
  facebook: 'https://facebook.com/dezoryn',
};

export const Footer: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const { settings: siteSettings } = useSiteSettings();
  const [logoError, setLogoError] = useState(false);
  const mouse = useMouseParallax(0.3);
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-80px' });

  injectStyles();

  const [contact, setContact] = useState({
    phone: '+91 77778 04850',
    email: 'support@dezoryn.com',
    address: 'Indore, Madhya Pradesh, India',
    whatsApp: '+917777804850',
    businessHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
  });

  const [footer, setFooter] = useState({
    companyDescription: 'Dezoryn Technologies Pvt. Ltd. is a global IT solutions provider committed to delivering innovative, reliable and future-ready software products.',
    footerLogo: 'Dezoryn Technologies',
    footerLinks: [
      {
        title: 'COMPANY',
        links: [
          { label: 'About Us', url: '/about' },
          { label: 'Our Leadership', url: '/leadership' },
          { label: 'Careers & Hiring', url: '/careers' },
          { label: 'Engineering Blog', url: '/blog' },
          { label: 'Contact Us', url: '/contact-sales' },
        ],
      },
      {
        title: 'SOLUTIONS',
        links: [
          { label: 'Technology Services', url: '/services' },
          { label: 'DezoAI Platform', url: '/products' },
          { label: 'CRM & ERP Suite', url: '/products' },
          { label: 'School ERP', url: '/products' },
          { label: 'Hospital Management', url: '/products' },
          { label: 'Pricing Plans', url: '/pricing' },
          { label: 'Book Live Demo', url: '/book-demo' },
        ],
      },
      {
        title: 'RESOURCES',
        links: [
          { label: '24/7 Support Desk', url: '/support' },
          { label: 'Help & Support', url: '/support' },
          { label: 'Product FAQs', url: '/faq' },
          { label: 'API & Documentation', url: '/api-docs' },
          { label: 'System Status', url: '/status' },
          { label: 'Sitemap', url: '/sitemap' },
        ],
      },
    ],
    socialLinks: DEFAULT_SOCIAL_LINKS,
    copyrightText: 'Dezoryn Technologies Pvt. Ltd. All Rights Reserved.',
    legalLinks: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms & Conditions', url: '/terms' },
      { label: 'Cookie Policy', url: '/cookies' },
      { label: 'Sitemap', url: '/sitemap' },
      { label: 'Status Page', url: '/status' },
    ],
  });

  const [effects, setEffects] = useState({
    animatedMeshGradient: true,
    auroraEffect: true,
    floatingBlurredCircles: true,
    noiseOverlay: true,
    softMovingLights: true,
    layeredRadialGradients: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, footerRes, siteRes, themeRes] = await Promise.all([
          cachedApiFetch(API_CONTACT),
          cachedApiFetch(API_FOOTER),
          cachedApiFetch('/site-settings'),
          cachedApiFetch('/theme'),
        ]);

        const contactData = await contactRes.json();
        const footerData = await footerRes.json();
        const siteData = await siteRes.json();
        const themeData = await themeRes.json();
        const contactObj = contactData?.success && contactData?.data ? contactData.data : {};
        const footerObj = footerData?.success && footerData?.data ? footerData.data : {};

        const siteName = siteData?.data?.websiteName || 'Dezoryn Technologies';

        setContact({
          phone: contactObj.phone || '+91 77778 04850',
          email: contactObj.email || 'support@dezoryn.com',
          address: contactObj.address || 'Indore, Madhya Pradesh, India',
          whatsApp: contactObj.whatsApp !== undefined ? contactObj.whatsApp : '+917777804850',
          businessHours: contactObj.businessHours || 'Mon - Sat: 9:00 AM - 7:00 PM IST',
        });

        const rawSocials = {
          ...DEFAULT_SOCIAL_LINKS,
          ...(typeof contactObj.socialLinks === 'object' && contactObj.socialLinks ? contactObj.socialLinks : {}),
          ...(typeof footerObj.socialLinks === 'object' && footerObj.socialLinks ? footerObj.socialLinks : {}),
        };

        // Clean empty values to keep reliable fallbacks
        const mergedSocialLinks: typeof DEFAULT_SOCIAL_LINKS = {
          linkedin: (typeof rawSocials.linkedin === 'string' && rawSocials.linkedin.trim()) ? rawSocials.linkedin.trim() : DEFAULT_SOCIAL_LINKS.linkedin,
          github: (typeof rawSocials.github === 'string' && rawSocials.github.trim()) ? rawSocials.github.trim() : DEFAULT_SOCIAL_LINKS.github,
          twitter: (typeof rawSocials.twitter === 'string' && rawSocials.twitter.trim()) ? rawSocials.twitter.trim() : DEFAULT_SOCIAL_LINKS.twitter,
          instagram: (typeof rawSocials.instagram === 'string' && rawSocials.instagram.trim()) ? rawSocials.instagram.trim() : DEFAULT_SOCIAL_LINKS.instagram,
          youtube: (typeof rawSocials.youtube === 'string' && rawSocials.youtube.trim()) ? rawSocials.youtube.trim() : DEFAULT_SOCIAL_LINKS.youtube,
          facebook: (typeof rawSocials.facebook === 'string' && rawSocials.facebook.trim()) ? rawSocials.facebook.trim() : DEFAULT_SOCIAL_LINKS.facebook,
        };

        const rawCategories = Array.isArray(footerObj.footerLinks) && footerObj.footerLinks.length > 0 ? footerObj.footerLinks : footer.footerLinks;
        const sanitizedCategories = rawCategories.map((cat: any) => ({
          ...cat,
          links: (cat.links || []).map((l: any) => {
            const label = String(l.label || '').toLowerCase();
            if (label.includes('support') || label.includes('help desk') || label.includes('ticket')) {
              return { ...l, url: '/support' };
            }
            return l;
          }),
        }));

        setFooter({
          companyDescription: footerObj.companyDescription || `${siteName} is a global IT solutions provider committed to delivering innovative, reliable and future-ready software products.`,
          footerLogo: footerObj.footerLogo || siteName,
          footerLinks: sanitizedCategories,
          socialLinks: mergedSocialLinks,
          copyrightText: footerObj.copyrightText || `${siteName}. All Rights Reserved.`,
          legalLinks: Array.isArray(footerObj.legalLinks) && footerObj.legalLinks.length > 0 ? footerObj.legalLinks : footer.legalLinks,
        });

        if (themeData.success && themeData.data && themeData.data.footerEffects) {
          setEffects((prev) => ({ ...prev, ...themeData.data.footerEffects }));
        }
      } catch {
        // fallback
      }
    };

    fetchData();

    const handleThemeUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && detail.footerEffects) {
        setEffects((prev) => ({ ...prev, ...detail.footerEffects }));
      }
    };

    window.addEventListener('dezo-theme-updated', handleThemeUpdate);
    window.addEventListener('focus', fetchData);
    return () => {
      window.removeEventListener('dezo-theme-updated', handleThemeUpdate);
      window.removeEventListener('focus', fetchData);
    };
  }, []);

  const whatsAppUrl = getNormalizedWhatsAppUrl(contact.whatsApp);

  const colIcons = [
    { icon: '🏢', hoverColor: 'group-hover/card:text-blue-600 dark:group-hover/card:text-cyan-400' },
    { icon: '⚡', hoverColor: 'group-hover/card:text-blue-600 dark:group-hover/card:text-cyan-400' },
    { icon: '📚', hoverColor: 'group-hover/card:text-blue-600 dark:group-hover/card:text-cyan-400' },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 pt-20 pb-10 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 border-t border-slate-200/80 dark:border-slate-800/80"
    >

      {/* 1. Smooth Fade Transition from Previous Section */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-transparent via-slate-200/40 dark:via-slate-950/40 to-slate-50 dark:to-slate-950 pointer-events-none z-10" />

      {/* 2. Top Border Glow — gradient shimmer sweep */}
      <motion.div
        className="absolute top-0 inset-x-0 h-[1.5px] z-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--accent-color, #06b6d4) 50%, transparent 100%)',
          boxShadow: '0 0 15px var(--accent-color, #06b6d4)',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 3. Layered Radial Gradients */}
      {effects.layeredRadialGradients && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none z-0" />
      )}

      {/* 4. Floating Blurred Circles — mouse parallax */}
      {effects.floatingBlurredCircles && (
        <>
          <motion.div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-cyan-500/10 dark:from-blue-600/15 dark:via-indigo-600/15 dark:to-cyan-500/15 blur-[140px] pointer-events-none z-0"
            animate={{ x: mouse.x * 20, y: mouse.y * 12 }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none z-0"
            animate={{ x: mouse.x * -15, y: mouse.y * -10 }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          />
        </>
      )}

      {/* 5. Aurora Glow — soft breathing */}
      {effects.auroraEffect && (
        <motion.div
          className="absolute top-10 left-1/4 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 blur-[100px] pointer-events-none z-0"
          animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6], x: mouse.x * 25 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* 6. Animated Mesh Background */}
      {effects.animatedMeshGradient && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 35%, #06b6d4 0%, transparent 50%),
                              radial-gradient(circle at 75% 65%, #2563eb 0%, transparent 50%)`,
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* 7. Soft Moving Lights */}
      {effects.softMovingLights && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[
            { left: '15%', top: '25%', delay: 0 },
            { left: '40%', top: '70%', delay: 1.5 },
            { left: '65%', top: '35%', delay: 0.8 },
            { left: '85%', top: '60%', delay: 2.2 },
          ].map((pt, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-500/50 dark:bg-cyan-400/50 blur-[0.5px]"
              style={{ left: pt.left, top: pt.top }}
              animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: pt.delay }}
            />
          ))}
        </div>
      )}

      {/* 8. Noise Texture Overlay */}
      {effects.noiseOverlay && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.025] mix-blend-overlay z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* Animated Company Journey Timeline */}
        <CompanyTimeline />

        {/* Animated Divider */}
        <AnimatedDivider />

        {/* ── Cards Grid — stagger scroll-reveal ── */}
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6 mb-10 pt-4"
          >

            {/* ── Card 1: Brand ── */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
              className="lg:col-span-1 group/card relative overflow-hidden p-6 rounded-3xl
                bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl
                border border-slate-200/80 dark:border-slate-800/80
                shadow-md hover:shadow-xl hover:shadow-cyan-500/15 hover:border-cyan-500/40
                transition-all duration-300 flex flex-col justify-between items-start text-left cursor-pointer"
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 via-blue-600/0 to-indigo-500/0 group-hover/card:from-cyan-500/5 group-hover/card:via-blue-600/5 group-hover/card:to-indigo-500/5 transition-all duration-500 pointer-events-none" />

              <div>
                {/* Floating logo & title */}
                <button
                  type="button"
                  onClick={() => navigateTo('/')}
                  className="flex items-center gap-3 mb-4 border-none bg-transparent cursor-pointer p-0 relative z-10 text-left"
                >
                  <img
                    src={logoError ? '/dezoryn-brand-logo.png' : (siteSettings.logoUrl || '/dezoryn-brand-logo.png')}
                    alt={siteSettings.websiteName || footer.footerLogo || 'Dezoryn Technologies'}
                    className="h-10 w-auto max-w-[150px] object-contain rounded-xl shrink-0"
                    onError={() => {
                      if (!logoError) setLogoError(true);
                    }}
                  />
                  {/* High contrast crisp brand text */}
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-cyan-400 transition-colors duration-300 leading-tight">
                    {siteSettings.websiteName || footer.footerLogo}
                  </span>
                </button>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5 relative z-10 font-normal">
                  {footer.companyDescription}
                </p>
              </div>

              <div className="space-y-2.5 relative z-10 w-full pt-2">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  </motion.span>
                  <span>Connect With Us</span>
                </span>
                <PremiumSocialButtons socialLinks={footer.socialLinks} />
              </div>
            </motion.div>

            {/* ── Link Cards ── */}
            {footer.footerLinks.map((col, colIdx) => (
              <motion.div
                key={colIdx}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className="group/card relative overflow-hidden p-6 rounded-3xl
                  bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl
                  border border-slate-200/80 dark:border-slate-800/80
                  shadow-md hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-500/40
                  transition-all duration-300 flex flex-col items-start text-left"
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover/card:from-blue-500/5 group-hover/card:to-cyan-500/5 transition-all duration-500 pointer-events-none" />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <motion.span
                    className="text-base"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, delay: colIdx * 0.5 }}
                  >
                    {colIcons[colIdx % colIcons.length].icon}
                  </motion.span>
                  <h4 className={`text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider transition-colors duration-300 ${colIcons[colIdx % colIcons.length].hoverColor}`}>
                    {col.title}
                  </h4>
                </div>

                <ul className="flex flex-col gap-2.5 text-xs relative z-10 w-full">
                  {col.links?.map((link, linkIdx) => (
                    <li key={linkIdx} className="overflow-hidden">
                      <motion.button
                        type="button"
                        onClick={() => navigateTo((link.url || '/') as any)}
                        whileHover={{ x: 3 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="relative group/link cursor-pointer bg-transparent border-none p-0 text-left text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-200 font-medium flex items-center gap-1.5"
                      >
                        <motion.span
                          className="text-cyan-500 text-[8px] opacity-0 group-hover/link:opacity-100 transition-opacity duration-200"
                          initial={{ x: -4 }}
                          whileHover={{ x: 0 }}
                        >▶</motion.span>
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover/link:w-full transition-all duration-300 rounded-full" />
                        </span>
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* ── Contact Card ── */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
              className="group/card relative overflow-hidden p-6 rounded-3xl
                bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl
                border border-slate-200/80 dark:border-slate-800/80
                shadow-md hover:shadow-xl hover:shadow-emerald-500/15 hover:border-emerald-500/40
                transition-all duration-300 flex flex-col items-start text-left"
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover/card:from-emerald-500/5 group-hover/card:to-cyan-500/5 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center gap-2 mb-4 relative z-10">
                <motion.span
                  className="text-base"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  📞
                </motion.span>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors duration-300">CONTACT US</h4>
              </div>

              <ul className="flex flex-col gap-3 text-xs relative z-10 w-full">
                {/* Phone */}
                <li className="flex items-center gap-2.5">
                  <motion.div whileHover={{ scale: 1.25, rotate: -5 }} transition={{ type: 'spring', stiffness: 400 }} className="shrink-0">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  </motion.div>
                  <a href={`tel:${contact.phone?.replace(/[^0-9+]/g, '')}`} className="relative hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-slate-600 dark:text-slate-400 group/link">
                    {contact.phone}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover/link:w-full transition-all duration-300 rounded-full" />
                  </a>
                </li>
                {/* Email */}
                <li className="flex items-center gap-2.5">
                  <motion.div whileHover={{ scale: 1.25, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }} className="shrink-0">
                    <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  </motion.div>
                  <a href={`mailto:${contact.email}`} className="relative hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-slate-600 dark:text-slate-400 group/link">
                    {contact.email}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover/link:w-full transition-all duration-300 rounded-full" />
                  </a>
                </li>
                {/* WhatsApp */}
                {whatsAppUrl && (
                  <li className="flex items-center gap-2.5">
                    <motion.div whileHover={{ scale: 1.25, rotate: 10 }} transition={{ type: 'spring', stiffness: 400 }} className="shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    </motion.div>
                    <a href={whatsAppUrl} target="_blank" rel="noreferrer" className="relative hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors duration-200 text-emerald-600 dark:text-emerald-400 font-bold group/link">
                      WhatsApp Chat
                      <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-emerald-400 group-hover/link:w-full transition-all duration-300 rounded-full" />
                    </a>
                  </li>
                )}
                {/* Website */}
                <li className="flex items-center gap-2.5">
                  <motion.div whileHover={{ scale: 1.25, rotate: -10 }} transition={{ type: 'spring', stiffness: 400 }} className="shrink-0">
                    <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  </motion.div>
                  <button type="button" onClick={() => navigateTo('/')} className="relative hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-slate-600 dark:text-slate-400 bg-transparent border-none p-0 cursor-pointer text-xs group/link">
                    www.dezoryn.com
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover/link:w-full transition-all duration-300 rounded-full" />
                  </button>
                </li>
                {/* Address */}
                <li className="flex items-start gap-2.5">
                  <motion.div whileHover={{ scale: 1.25 }} transition={{ type: 'spring', stiffness: 400 }} className="shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  </motion.div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-slate-600 dark:text-slate-400 group/link"
                  >
                    {contact.address}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover/link:w-full transition-all duration-300 rounded-full" />
                  </a>
                </li>
                {/* Business Hours */}
                <li className="flex items-start gap-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 mt-1">
                  <motion.div whileHover={{ scale: 1.25 }} transition={{ type: 'spring', stiffness: 400 }} className="shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  </motion.div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {contact.businessHours || 'Mon - Sat: 9:00 AM - 7:00 PM IST'}
                  </span>
                </li>
              </ul>
            </motion.div>

          </motion.div>
        </AnimatePresence>

        {/* Newsletter Subscription Widget */}
        <FooterNewsletter />

        {/* ── Featured Support Desk Banner below Newsletter ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mx-auto sm:mx-0">
              <LifeBuoy className="w-6 h-6 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                  24/7 ENTERPRISE SUPPORT DESK
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs text-slate-300 font-bold">Fast Response Guarantee</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white mt-1">
                Need Technical Assistance or Have a Product Question?
              </h4>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => navigateTo('/support')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800/90 hover:bg-cyan-950/60 text-slate-100 font-extrabold text-xs shadow-md border border-cyan-500/30 hover:border-cyan-400/60 transition duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 group"
          >
            <LifeBuoy className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
            <span>24/7 Support Desk & Ticket →</span>
          </motion.button>
        </motion.div>

        {/* Animated Divider */}
        <AnimatedDivider />

        {/* ── Bottom bar — fade-up on scroll ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4"
        >
          <p>© {new Date().getFullYear()} {footer.copyrightText}</p>
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Featured Support Badge Button */}
            <motion.button
              type="button"
              onClick={() => navigateTo('/support')}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-cyan-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Submit Support Request</span>
            </motion.button>

            {footer.legalLinks.map((link, idx) => (
              <React.Fragment key={idx}>
                <span>|</span>
                <motion.button
                  type="button"
                  onClick={() => navigateTo((link.url || '/') as any)}
                  whileHover={{ y: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative hover:text-slate-800 dark:hover:text-slate-200 transition bg-transparent border-none p-0 cursor-pointer text-xs text-slate-500 dark:text-slate-400 group/legal"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover/legal:w-full transition-all duration-300 rounded-full" />
                </motion.button>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
});

export default Footer;
