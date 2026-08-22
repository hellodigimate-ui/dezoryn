/**
 * Normalizes a WhatsApp input (phone number or URL) into a valid https://wa.me/<digits> URL.
 * Returns null if missing, empty, or cannot be safely converted into a valid WhatsApp number.
 */
export function getNormalizedWhatsAppUrl(whatsAppInput?: string | null): string | null {
  if (!whatsAppInput || typeof whatsAppInput !== 'string') return null;
  const raw = whatsAppInput.trim();
  if (!raw) return null;

  // If input is already a URL (e.g., https://wa.me/917777804850 or https://api.whatsapp.com/send?phone=...)
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const parsed = new URL(raw);
      // Reject generic whatsapp homepages
      if (parsed.hostname.includes('whatsapp.com') && (parsed.pathname === '/' || parsed.pathname === '')) {
        return null;
      }
      const phoneParam = parsed.searchParams.get('phone');
      const targetStr = phoneParam || parsed.pathname;
      const digits = targetStr.replace(/[^0-9]/g, '');
      if (digits.length >= 7 && digits.length <= 15) {
        return `https://wa.me/${digits}`;
      }
    } catch {
      // Fall through to digit extraction
    }
  }

  // Handle phone numbers (e.g., +91 77778 04850, +1 (415) 890-2100, 00917777804850)
  let digits = raw.replace(/[^0-9]/g, '');

  // Handle leading zeros
  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  } else if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.substring(1);
  }

  // International phone numbers with country code must be between 7 and 15 digits (E.164 standard)
  if (digits.length < 7 || digits.length > 15) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

const DEFAULT_SOCIAL_URLS: Record<string, string> = {
  linkedin: 'https://linkedin.com/company/dezoryn',
  github: 'https://github.com/dezoryn',
  twitter: 'https://twitter.com/dezoryn',
  instagram: 'https://instagram.com/dezoryn',
  youtube: 'https://youtube.com/@dezoryn',
  facebook: 'https://facebook.com/dezoryn',
};

/**
 * Validates a social media profile URL for a specific platform.
 * Returns the validated HTTPS profile URL string, or fallback if missing/invalid/homepage.
 */
export function getValidSocialUrl(urlInput?: string | null, platformKey?: string): string | null {
  const key = (platformKey || '').toLowerCase();
  const defaultUrl = DEFAULT_SOCIAL_URLS[key] || null;

  if (!urlInput || typeof urlInput !== 'string') return defaultUrl;
  let trimmed = urlInput.trim();
  if (!trimmed) return defaultUrl;

  // Handle @handle or raw handles (e.g. @dezoryn or dezoryn)
  if (!trimmed.includes('.') && !trimmed.startsWith('http')) {
    const handle = trimmed.replace(/^@/, '');
    if (!handle) return defaultUrl;
    switch (key) {
      case 'linkedin': return `https://linkedin.com/company/${handle}`;
      case 'github': return `https://github.com/${handle}`;
      case 'twitter': return `https://twitter.com/${handle}`;
      case 'instagram': return `https://instagram.com/${handle}`;
      case 'youtube': return `https://youtube.com/@${handle}`;
      case 'facebook': return `https://facebook.com/${handle}`;
      default: return `https://social.com/${handle}`;
    }
  }

  // Ensure protocol
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed.replace(/^\/\//, '')}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return defaultUrl;

    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.trim();

    // If generic platform homepage without specific profile path (e.g., https://linkedin.com/)
    if (!pathname || pathname === '/' || pathname === '/home' || pathname === '/index.html') {
      return defaultUrl;
    }

    // Platform domain validation (if platformKey specified)
    if (key) {
      if (key === 'linkedin' && !hostname.includes('linkedin.com')) return defaultUrl;
      if (key === 'github' && !hostname.includes('github.com')) return defaultUrl;
      if (key === 'twitter' && !hostname.includes('twitter.com') && !hostname.includes('x.com')) return defaultUrl;
      if (key === 'instagram' && !hostname.includes('instagram.com')) return defaultUrl;
      if (key === 'youtube' && !hostname.includes('youtube.com') && !hostname.includes('youtu.be')) return defaultUrl;
      if (key === 'facebook' && !hostname.includes('facebook.com') && !hostname.includes('fb.com')) return defaultUrl;
    }

    return parsed.href;
  } catch {
    return defaultUrl;
  }
}
