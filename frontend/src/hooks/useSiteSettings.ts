import { useState, useEffect } from 'react';
import { API_URL, cachedApiFetch } from '../config/api.config';
import { resolveMediaUrl } from '../utils/mediaUrl';


const API = `${API_URL}/site-settings`;


export interface SiteSettings {
  websiteName: string;
  logoUrl: string;
  faviconUrl: string;
  domain: string;
  maintenanceMode: boolean;
  announcementBar: boolean;
  announcementText: string;
  announcementColor: string;
  language: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  googleAnalyticsId: string;
  metaTitle: string;
  metaDescription: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  websiteName: 'Dezoryn Technologies',
  logoUrl: '/uploads/dezoryn-brand-logo.jpg',
  faviconUrl: '/uploads/dezoryn-brand-logo.jpg',
  domain: 'https://dezoryn.com',
  maintenanceMode: false,
  announcementBar: false,
  announcementText: '',
  announcementColor: 'blue',
  language: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  currencySymbol: '₹',
  googleAnalyticsId: '',
  metaTitle: 'Dezoryn Technologies - Enterprise Business Automation',
  metaDescription: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cached = localStorage.getItem('dezo_site_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          logoUrl: resolveMediaUrl(parsed.logoUrl || ''),
          faviconUrl: resolveMediaUrl(parsed.faviconUrl || ''),
        };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });
  const [loaded, setLoaded] = useState(false);

  const fetchAndApply = async () => {
    try {
      const res = await cachedApiFetch(API);
      const data = await res.json();
      if (data.success && data.data) {
        const s: SiteSettings = {
          ...DEFAULT_SETTINGS,
          ...data.data,
          logoUrl: resolveMediaUrl(data.data.logoUrl || ''),
          faviconUrl: resolveMediaUrl(data.data.faviconUrl || ''),
        };
        setSettings(s);
        try {
          localStorage.setItem('dezo_site_settings', JSON.stringify(s));
        } catch {}
        applyToDOM(s);
      }
    } catch {
      // keep defaults silently
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchAndApply();
    const handleSettingsUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        const s: SiteSettings = {
          ...DEFAULT_SETTINGS,
          ...detail,
          logoUrl: resolveMediaUrl(detail.logoUrl || ''),
          faviconUrl: resolveMediaUrl(detail.faviconUrl || ''),
        };
        setSettings(s);
        try {
          localStorage.setItem('dezo_site_settings', JSON.stringify(s));
        } catch {}
        applyToDOM(s);
      } else {
        fetchAndApply();
      }
    };
    window.addEventListener('dezo_site_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('dezo_site_settings_updated', handleSettingsUpdated);
    };
  }, []);

  return { settings, siteSettings: settings, loaded };
}

function applyToDOM(s: SiteSettings) {
  const domain = s.domain || 'https://dezoryn.com';
  const title = s.metaTitle || s.websiteName || 'Dezoryn Technologies - Enterprise Business Automation & Intelligent Platform';
  const description = s.metaDescription || 'A unified enterprise CRM platform delivering intelligent automation, seamless integrations, AI-powered workflows, and real-time business insights.';

  // Determine absolute HTTPS image URL
  let imageUrl = s.logoUrl || '/dezoryn-logo.jpg';
  if (imageUrl.startsWith('/')) {
    const cleanDomain = domain.replace(/\/$/, '');
    imageUrl = `${cleanDomain}${imageUrl}`;
  } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    imageUrl = `https://${imageUrl}`;
  }
  imageUrl = imageUrl.replace(/^http:\/\//, 'https://');

  // 1. Page title
  document.title = title;

  // Helper to set/update meta tag
  const setMetaTag = (attributeName: 'name' | 'property', attributeValue: string, contentValue: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attributeName, attributeValue);
      document.head.appendChild(el);
    }
    el.content = contentValue;
  };

  // 2. Meta description
  setMetaTag('name', 'description', description);

  // 3. Open Graph Metadata
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:url', domain);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);

  // 4. Twitter / X Card Metadata
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:url', domain);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);

  // 5. Favicon
  if (s.faviconUrl) {
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = resolveMediaUrl(s.faviconUrl);
  }

  // 6. Language attribute
  if (s.language) {
    document.documentElement.lang = s.language;
  }

  // 7. Google Analytics injection (only once per ID)
  if (s.googleAnalyticsId && !document.getElementById(`ga-script-${s.googleAnalyticsId}`)) {
    const existingGa = document.getElementById('ga-main-script');
    if (!existingGa) {
      const scriptSrc = document.createElement('script');
      scriptSrc.id = `ga-script-${s.googleAnalyticsId}`;
      scriptSrc.async = true;
      scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${s.googleAnalyticsId}`;
      document.head.appendChild(scriptSrc);

      const scriptInline = document.createElement('script');
      scriptInline.id = 'ga-main-script';
      scriptInline.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${s.googleAnalyticsId}');
      `;
      document.head.appendChild(scriptInline);
    }
  }
}
