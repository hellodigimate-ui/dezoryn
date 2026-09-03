export interface AdvancedColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  link: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  buttonFont: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
  textTransform: string;
  fontScale: string;
  fontSizes?: {
    display?: string;
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
    body?: string;
    smallText?: string;
    caption?: string;
    buttons?: string;
  };
}

export interface SingleThemeConfig {
  colorSettings?: Partial<AdvancedColorSettings>;
  typographySettings?: Partial<TypographySettings>;
}

export interface ThemeSettingsData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  buttonStyle?: string;
  defaultMode?: 'light' | 'dark' | 'system';
  activeMode?: 'light' | 'dark' | 'system';
  lightTheme?: SingleThemeConfig;
  darkTheme?: SingleThemeConfig;
  colorSettings?: Partial<AdvancedColorSettings>;
  typographySettings?: Partial<TypographySettings>;
  footerEffects?: any;
}

export const DEFAULT_LIGHT_COLORS: AdvancedColorSettings = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  accent: '#0284c7',
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  link: '#2563eb',
};

export const DEFAULT_DARK_COLORS: AdvancedColorSettings = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  accent: '#06b6d4',
  background: '#020617',
  surface: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  link: '#38bdf8',
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Inter',
  buttonFont: 'Outfit',
  fontWeight: '600',
  letterSpacing: '0em',
  lineHeight: '1.5',
  textTransform: 'none',
  fontScale: '1.0',
  fontSizes: {
    display: '3.5rem',
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.5rem',
    h4: '1.25rem',
    h5: '1.125rem',
    h6: '1rem',
    body: '1rem',
    smallText: '0.875rem',
    caption: '0.75rem',
    buttons: '0.875rem',
  },
};

/**
 * Resolves current theme mode based on explicit preference or system
 */
export const resolveEffectiveMode = (
  preferredMode?: 'light' | 'dark' | 'system' | null
): 'light' | 'dark' => {
  if (preferredMode === 'light' || preferredMode === 'dark') {
    return preferredMode;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Applies CSS variables and `.dark` class globally to <html> and <body>
 */
let isBroadcastingTheme = false;

export const applyGlobalTheme = (
  targetMode: 'light' | 'dark' | 'system',
  themeData?: ThemeSettingsData | null,
  persistToStorage = true,
  broadcastEvent = true
): 'light' | 'dark' => {
  if (typeof document === 'undefined') return 'light';

  const effectiveMode = resolveEffectiveMode(targetMode);
  const root = document.documentElement;
  const body = document.body;

  // 1. Toggle Tailwind dark class
  if (effectiveMode === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Resolve colors and typography
  let colors: AdvancedColorSettings =
    effectiveMode === 'light' ? { ...DEFAULT_LIGHT_COLORS } : { ...DEFAULT_DARK_COLORS };
  let typo: TypographySettings = { ...DEFAULT_TYPOGRAPHY };

  if (themeData) {
    const configObj = effectiveMode === 'light' ? themeData.lightTheme : themeData.darkTheme;
    if (configObj?.colorSettings) {
      colors = { ...colors, ...configObj.colorSettings };
    } else if (themeData.colorSettings) {
      colors = { ...colors, ...themeData.colorSettings };
    }

    if (configObj?.typographySettings) {
      typo = {
        ...typo,
        ...configObj.typographySettings,
        fontSizes: {
          ...typo.fontSizes,
          ...(configObj.typographySettings.fontSizes || {}),
        },
      };
    } else if (themeData.typographySettings) {
      typo = {
        ...typo,
        ...themeData.typographySettings,
        fontSizes: {
          ...typo.fontSizes,
          ...(themeData.typographySettings.fontSizes || {}),
        },
      };
    }
  }

  // 3. Set CSS properties on root
  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--secondary-color', colors.secondary);
  root.style.setProperty('--accent-color', colors.accent);
  root.style.setProperty('--bg-color', colors.background);
  root.style.setProperty('--surface-color', colors.surface);
  root.style.setProperty('--card-color', colors.card);
  root.style.setProperty('--border-color', colors.border);
  root.style.setProperty('--success-color', colors.success);
  root.style.setProperty('--warning-color', colors.warning);
  root.style.setProperty('--error-color', colors.error);
  root.style.setProperty('--info-color', colors.info);
  root.style.setProperty('--text-primary-color', colors.textPrimary);
  root.style.setProperty('--text-secondary-color', colors.textSecondary);
  root.style.setProperty('--link-color', colors.link);

  if (typo.headingFont) {
    root.style.setProperty('--font-heading', `'${typo.headingFont}', sans-serif`);
    root.style.setProperty('--font-family', `'${typo.headingFont}', sans-serif`);
  }
  if (typo.bodyFont) root.style.setProperty('--font-body', `'${typo.bodyFont}', sans-serif`);
  if (typo.buttonFont) root.style.setProperty('--font-button', `'${typo.buttonFont}', sans-serif`);
  if (typo.fontWeight) root.style.setProperty('--font-weight', typo.fontWeight);
  if (typo.letterSpacing) root.style.setProperty('--letter-spacing', typo.letterSpacing);
  if (typo.lineHeight) root.style.setProperty('--line-height', typo.lineHeight);
  if (typo.textTransform) root.style.setProperty('--text-transform', typo.textTransform);
  if (typo.fontScale) root.style.setProperty('--font-scale', typo.fontScale);

  if (typo.fontSizes) {
    Object.entries(typo.fontSizes).forEach(([k, v]) => {
      if (v) root.style.setProperty(`--font-size-${k}`, v);
    });
  }

  if (themeData?.borderRadius) {
    root.style.setProperty('--border-radius', themeData.borderRadius);
  }

  // 4. Synchronize localStorage
  if (persistToStorage && typeof window !== 'undefined') {
    try {
      localStorage.setItem('user_theme_preference', effectiveMode);
      localStorage.setItem('admin-theme', effectiveMode);
      if (themeData) {
        localStorage.setItem('dezo-theme-settings', JSON.stringify(themeData));
      }
    } catch (_e) {}
  }

  // 5. Broadcast synchronized theme update event (re-entrancy protected)
  if (broadcastEvent && !isBroadcastingTheme && typeof window !== 'undefined') {
    try {
      isBroadcastingTheme = true;
      window.dispatchEvent(
        new CustomEvent('dezo-theme-updated', {
          detail: {
            effectiveMode,
            themeData,
          },
        })
      );
    } finally {
      isBroadcastingTheme = false;
    }
  }

  return effectiveMode;
};
