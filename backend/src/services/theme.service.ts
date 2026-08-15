import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

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

export interface SavedPalette {
  id: string;
  name: string;
  colors: AdvancedColorSettings;
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
  fontSizes: {
    display: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    body: string;
    smallText: string;
    caption: string;
    buttons: string;
  };
}

export interface FooterEffectsSettings {
  animatedMeshGradient: boolean;
  auroraEffect: boolean;
  floatingBlurredCircles: boolean;
  noiseOverlay: boolean;
  softMovingLights: boolean;
  layeredRadialGradients: boolean;
}

export interface SingleThemeConfig {
  colorSettings: AdvancedColorSettings;
  typographySettings: TypographySettings;
}

export interface ThemeSettingsPayload {
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
  colorSettings?: AdvancedColorSettings;
  savedPalettes?: SavedPalette[];
  typographySettings?: TypographySettings;
  footerEffects?: FooterEffectsSettings;
}

export const DEFAULT_FOOTER_EFFECTS: FooterEffectsSettings = {
  animatedMeshGradient: true,
  auroraEffect: true,
  floatingBlurredCircles: true,
  noiseOverlay: true,
  softMovingLights: true,
  layeredRadialGradients: true,
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

export const DEFAULT_LIGHT_COLORS: AdvancedColorSettings = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  accent: '#0284c7',
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#f1f5f9',
  border: '#e2e8f0',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  link: '#2563eb',
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

const DEFAULT_THEME = {
  id: 'default',
  primaryColor: '#2563eb',
  secondaryColor: '#4f46e5',
  accentColor: '#06b6d4',
  fontFamily: 'Plus Jakarta Sans',
  borderRadius: '1rem',
  buttonStyle: 'gradient',
  defaultMode: 'dark',
  activeMode: 'dark',
  lightTheme: {
    colorSettings: DEFAULT_LIGHT_COLORS,
    typographySettings: DEFAULT_TYPOGRAPHY,
  },
  darkTheme: {
    colorSettings: DEFAULT_DARK_COLORS,
    typographySettings: DEFAULT_TYPOGRAPHY,
  },
  colorSettings: DEFAULT_DARK_COLORS,
  savedPalettes: [
    { id: 'p-1', name: 'Dezoryn Cyber Blue', colors: DEFAULT_DARK_COLORS },
    {
      id: 'p-2',
      name: 'Midnight Emerald',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        background: '#022c22',
        surface: '#064e3b',
        card: '#065f46',
        border: '#047857',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa',
        textPrimary: '#ecfdf5',
        textSecondary: '#a7f3d0',
        link: '#34d399',
      },
    },
    {
      id: 'p-3',
      name: 'Clean Light Corporate',
      colors: DEFAULT_LIGHT_COLORS,
    },
  ],
  typographySettings: DEFAULT_TYPOGRAPHY,
  footerEffects: DEFAULT_FOOTER_EFFECTS,
};

let memoryTheme = { ...DEFAULT_THEME };

export class ThemeService {
  static async get() {
    try {
      if (db.themeSettings) {
        let settings = await db.themeSettings.findUnique({ where: { id: 'default' } });
        if (!settings) {
          settings = await db.themeSettings.create({ data: DEFAULT_THEME });
        }
        return settings;
      }
    } catch {
      // Fall through
    }
    return memoryTheme;
  }

  static async update(payload: ThemeSettingsPayload) {
    const existing = await ThemeService.get();

    const updatedData = {
      primaryColor: payload.colorSettings?.primary ?? payload.primaryColor ?? existing.primaryColor ?? DEFAULT_THEME.primaryColor,
      secondaryColor: payload.colorSettings?.secondary ?? payload.secondaryColor ?? existing.secondaryColor ?? DEFAULT_THEME.secondaryColor,
      accentColor: payload.colorSettings?.accent ?? payload.accentColor ?? existing.accentColor ?? DEFAULT_THEME.accentColor,
      fontFamily: payload.fontFamily ?? existing.fontFamily ?? DEFAULT_THEME.fontFamily,
      borderRadius: payload.borderRadius ?? existing.borderRadius ?? DEFAULT_THEME.borderRadius,
      buttonStyle: payload.buttonStyle ?? existing.buttonStyle ?? DEFAULT_THEME.buttonStyle,
      defaultMode: payload.defaultMode ?? payload.activeMode ?? existing.defaultMode ?? DEFAULT_THEME.defaultMode,
      activeMode: payload.activeMode ?? payload.defaultMode ?? existing.activeMode ?? DEFAULT_THEME.activeMode,
      lightTheme: payload.lightTheme || existing.lightTheme || DEFAULT_THEME.lightTheme,
      darkTheme: payload.darkTheme || existing.darkTheme || DEFAULT_THEME.darkTheme,
      colorSettings: payload.colorSettings
        ? { ...DEFAULT_DARK_COLORS, ...existing.colorSettings, ...payload.colorSettings }
        : existing.colorSettings || DEFAULT_DARK_COLORS,
      savedPalettes: payload.savedPalettes || existing.savedPalettes || DEFAULT_THEME.savedPalettes,
      typographySettings: payload.typographySettings
        ? { ...DEFAULT_TYPOGRAPHY, ...existing.typographySettings, ...payload.typographySettings }
        : existing.typographySettings || DEFAULT_TYPOGRAPHY,
      footerEffects: payload.footerEffects
        ? { ...DEFAULT_FOOTER_EFFECTS, ...existing.footerEffects, ...payload.footerEffects }
        : existing.footerEffects || DEFAULT_FOOTER_EFFECTS,
    };

    memoryTheme = { ...memoryTheme, ...updatedData };

    try {
      if (db.themeSettings) {
        return await db.themeSettings.upsert({
          where: { id: 'default' },
          update: updatedData,
          create: { id: 'default', ...updatedData },
        });
      }
    } catch {
      // Fall through
    }

    return memoryTheme;
  }
}
