import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Save, RefreshCw, CheckCircle2, Sparkles, Sun, Moon, Laptop,
  Type, Eye, Sliders, Heading, Type as FontIcon, AlignLeft,
  Plus, Trash2, Check,
  Wand2
} from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';
import { applyGlobalTheme } from '../../utils/themeUtils';

const API_THEME = `${API_URL}/theme`;


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

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  defaultMode: 'light' | 'dark' | 'system';
  activeMode: 'light' | 'dark' | 'system';
  lightTheme: SingleThemeConfig;
  darkTheme: SingleThemeConfig;
  colorSettings: AdvancedColorSettings;
  savedPalettes: SavedPalette[];
  typographySettings: TypographySettings;
  footerEffects: FooterEffectsSettings;
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

const DEFAULT_SAVED_PALETTES: SavedPalette[] = [
  {
    id: 'p-default',
    name: 'Dezoryn Cyber Blue (Default Dark)',
    colors: DEFAULT_DARK_COLORS,
  },
  {
    id: 'p-emerald',
    name: 'Midnight Emerald (Dark)',
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
    id: 'p-corporate',
    name: 'Clean Light Corporate',
    colors: DEFAULT_LIGHT_COLORS,
  },
  {
    id: 'p-sunset',
    name: 'Sunset Amber & Gold',
    colors: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#f59e0b',
      background: '#1c1917',
      surface: '#292524',
      card: '#44403c',
      border: '#57534e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      textPrimary: '#fafaf9',
      textSecondary: '#d6d3d1',
      link: '#fbbf24',
    },
  },
];

const DEFAULT_THEME: ThemeSettings = {
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
  savedPalettes: DEFAULT_SAVED_PALETTES,
  typographySettings: DEFAULT_TYPOGRAPHY,
  footerEffects: DEFAULT_FOOTER_EFFECTS,
};

const GOOGLE_FONTS = [
  'Plus Jakarta Sans',
  'Inter',
  'Outfit',
  'Roboto',
  'Poppins',
  'Space Grotesk',
  'Lora',
  'Cinzel',
  'Montserrat',
  'Playfair Display',
  'Fira Code',
  'JetBrains Mono',
];



export const hexToRgb = (hex: string): string => {
  if (!hex) return 'rgb(0, 0, 0)';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return 'rgb(0, 0, 0)';
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

export const applyCSSVariables = (theme: ThemeSettings) => {
  applyGlobalTheme(theme.activeMode || theme.defaultMode || 'dark', theme, true);
};

export const AdminThemeManager: React.FC = () => {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [editingTarget, setEditingTarget] = useState<'light' | 'dark'>('dark');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('dark');
  const [newPaletteName, setNewPaletteName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchTheme = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(API_THEME);
      const data = await res.json();
      if (data.success && data.data) {
        const merged: ThemeSettings = {
          primaryColor: data.data.primaryColor || DEFAULT_THEME.primaryColor,
          secondaryColor: data.data.secondaryColor || DEFAULT_THEME.secondaryColor,
          accentColor: data.data.accentColor || DEFAULT_THEME.accentColor,
          fontFamily: data.data.fontFamily || DEFAULT_THEME.fontFamily,
          borderRadius: data.data.borderRadius || DEFAULT_THEME.borderRadius,
          buttonStyle: data.data.buttonStyle || DEFAULT_THEME.buttonStyle,
          defaultMode: data.data.defaultMode || data.data.activeMode || 'dark',
          activeMode: data.data.activeMode || data.data.defaultMode || 'dark',
          lightTheme: {
            colorSettings: {
              ...DEFAULT_LIGHT_COLORS,
              ...((data.data.lightTheme && data.data.lightTheme.colorSettings) || {}),
            },
            typographySettings: {
              ...DEFAULT_TYPOGRAPHY,
              ...((data.data.lightTheme && data.data.lightTheme.typographySettings) || {}),
              fontSizes: {
                ...DEFAULT_TYPOGRAPHY.fontSizes,
                ...((data.data.lightTheme && data.data.lightTheme.typographySettings && data.data.lightTheme.typographySettings.fontSizes) || {}),
              },
            },
          },
          darkTheme: {
            colorSettings: {
              ...DEFAULT_DARK_COLORS,
              ...((data.data.darkTheme && data.data.darkTheme.colorSettings) || (data.data.colorSettings || {})),
            },
            typographySettings: {
              ...DEFAULT_TYPOGRAPHY,
              ...((data.data.darkTheme && data.data.darkTheme.typographySettings) || (data.data.typographySettings || {})),
              fontSizes: {
                ...DEFAULT_TYPOGRAPHY.fontSizes,
                ...((data.data.darkTheme && data.data.darkTheme.typographySettings && data.data.darkTheme.typographySettings.fontSizes) || {}),
              },
            },
          },
          colorSettings: data.data.colorSettings || DEFAULT_DARK_COLORS,
          savedPalettes:
            data.data.savedPalettes && Array.isArray(data.data.savedPalettes) && data.data.savedPalettes.length > 0
              ? data.data.savedPalettes
              : DEFAULT_SAVED_PALETTES,
          typographySettings: data.data.typographySettings || DEFAULT_TYPOGRAPHY,
          footerEffects: data.data.footerEffects || DEFAULT_FOOTER_EFFECTS,
        };

        setTheme(merged);
        setPreviewMode(merged.activeMode === 'light' ? 'light' : 'dark');
        applyCSSVariables(merged);
      }
    } catch {
      showMsg('error', 'Failed to load theme settings from server. Using defaults.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(API_THEME, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });

      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Theme & Typography settings saved and applied globally!');
        applyCSSVariables(theme);
      } else {
        showMsg('error', data.message || 'Failed to save theme settings.');
      }
    } catch {
      showMsg('error', 'Error connecting to theme server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    applyCSSVariables(DEFAULT_THEME);
    showMsg('success', 'Reset to factory default theme settings.');
  };

  const updateActiveMode = (mode: 'light' | 'dark' | 'system') => {
    const updated = { ...theme, activeMode: mode, defaultMode: mode };
    setTheme(updated);
    setPreviewMode(mode === 'light' ? 'light' : 'dark');
    applyCSSVariables(updated);
  };

  const updateColorRole = (role: keyof AdvancedColorSettings, value: string) => {
    const isLight = editingTarget === 'light';
    const targetTheme = isLight ? theme.lightTheme : theme.darkTheme;

    const updatedTarget: SingleThemeConfig = {
      ...targetTheme,
      colorSettings: {
        ...targetTheme.colorSettings,
        [role]: value,
      },
    };

    const updated: ThemeSettings = {
      ...theme,
      ...(isLight ? { lightTheme: updatedTarget } : { darkTheme: updatedTarget }),
      ...(editingTarget === (theme.activeMode === 'light' ? 'light' : 'dark')
        ? {
            primaryColor: role === 'primary' ? value : theme.primaryColor,
            secondaryColor: role === 'secondary' ? value : theme.secondaryColor,
            accentColor: role === 'accent' ? value : theme.accentColor,
          }
        : {}),
    };

    setTheme(updated);
    applyCSSVariables(updated);
  };

  const updateTypo = (field: keyof TypographySettings, value: any) => {
    const isLight = editingTarget === 'light';
    const targetTheme = isLight ? theme.lightTheme : theme.darkTheme;

    const updatedTarget: SingleThemeConfig = {
      ...targetTheme,
      typographySettings: {
        ...targetTheme.typographySettings,
        [field]: value,
      },
    };

    const updated: ThemeSettings = {
      ...theme,
      ...(isLight ? { lightTheme: updatedTarget } : { darkTheme: updatedTarget }),
    };

    setTheme(updated);
    applyCSSVariables(updated);
  };

  const updateFontSize = (key: keyof TypographySettings['fontSizes'], value: string) => {
    const isLight = editingTarget === 'light';
    const targetTheme = isLight ? theme.lightTheme : theme.darkTheme;

    const updatedTarget: SingleThemeConfig = {
      ...targetTheme,
      typographySettings: {
        ...targetTheme.typographySettings,
        fontSizes: {
          ...targetTheme.typographySettings.fontSizes,
          [key]: value,
        },
      },
    };

    const updated: ThemeSettings = {
      ...theme,
      ...(isLight ? { lightTheme: updatedTarget } : { darkTheme: updatedTarget }),
    };

    setTheme(updated);
    applyCSSVariables(updated);
  };

  const updateFooterEffect = (key: keyof FooterEffectsSettings, value: boolean) => {
    const updated: ThemeSettings = {
      ...theme,
      footerEffects: {
        ...theme.footerEffects,
        [key]: value,
      },
    };
    setTheme(updated);
    applyCSSVariables(updated);
  };

  const applyPaletteToTarget = (palette: SavedPalette) => {
    const isLight = editingTarget === 'light';
    const targetTheme = isLight ? theme.lightTheme : theme.darkTheme;

    const updatedTarget: SingleThemeConfig = {
      ...targetTheme,
      colorSettings: { ...palette.colors },
    };

    const updated: ThemeSettings = {
      ...theme,
      ...(isLight ? { lightTheme: updatedTarget } : { darkTheme: updatedTarget }),
    };

    setTheme(updated);
    applyCSSVariables(updated);
    showMsg('success', `Applied palette "${palette.name}" to ${editingTarget.toUpperCase()} Mode!`);
  };

  const saveCurrentPalette = () => {
    if (!newPaletteName.trim()) {
      showMsg('error', 'Please enter a name for the new palette.');
      return;
    }
    const currentColors = editingTarget === 'light' ? theme.lightTheme.colorSettings : theme.darkTheme.colorSettings;
    const newPal: SavedPalette = {
      id: `p-${Date.now()}`,
      name: newPaletteName.trim(),
      colors: { ...currentColors },
    };

    const updated: ThemeSettings = {
      ...theme,
      savedPalettes: [...theme.savedPalettes, newPal],
    };

    setTheme(updated);
    setNewPaletteName('');
    showMsg('success', `Saved palette "${newPal.name}" successfully!`);
  };

  const deletePalette = (id: string) => {
    const updated: ThemeSettings = {
      ...theme,
      savedPalettes: theme.savedPalettes.filter((p) => p.id !== id),
    };
    setTheme(updated);
    showMsg('success', 'Palette deleted.');
  };

  const activeEditingColors =
    editingTarget === 'light' ? theme.lightTheme.colorSettings : theme.darkTheme.colorSettings;
  const activeEditingTypo =
    editingTarget === 'light' ? theme.lightTheme.typographySettings : theme.darkTheme.typographySettings;

  const livePreviewColors = previewMode === 'light' ? theme.lightTheme.colorSettings : theme.darkTheme.colorSettings;
  const livePreviewTypo = previewMode === 'light' ? theme.lightTheme.typographySettings : theme.darkTheme.typographySettings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="admin-scope space-y-8 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 dark:text-white">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/30">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Theme & Appearance CMS
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Independent Dark & Light Mode Color Systems, Typography Engine, and Background Effects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Theme Settings</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Theme Mode Mode Selector (Prompt 11 Requirements) */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Global Active Mode Strategy</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Always enforce crisp Light Mode globally' },
            { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Always enforce sleek Dark Mode globally' },
            { id: 'system', label: 'System Mode', icon: Laptop, desc: 'Automatically match device color scheme' },
          ].map((mode) => {
            const IconComp = mode.icon;
            const isSelected = theme.activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateActiveMode(mode.id as any)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500/10 dark:bg-cyan-500/10 border-blue-500 dark:border-cyan-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`} />
                    <span>{mode.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-500" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editing Target Theme Tab Switcher */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <span className="px-3 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
          Currently Editing Config:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingTarget('light')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              editingTarget === 'light'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Editing Light Theme</span>
          </button>
          <button
            type="button"
            onClick={() => setEditingTarget('dark')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              editingTarget === 'dark'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Editing Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left CMS Editors (2 Cols) | Right Live Interactive Preview (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: CMS Controls */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Advanced 14-Role Color System */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>14-Role Color Architecture ({editingTarget.toUpperCase()} MODE)</span>
              </h2>
              <span className="text-xs font-bold text-slate-400">HEX Input + Color Picker + RGB Calculation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { role: 'primary', label: 'Primary Brand' },
                { role: 'secondary', label: 'Secondary Accent' },
                { role: 'accent', label: 'Cyan Highlight Accent' },
                { role: 'background', label: 'Page Base Background' },
                { role: 'surface', label: 'Surface Container' },
                { role: 'card', label: 'Card Component' },
                { role: 'border', label: 'Border Lines' },
                { role: 'textPrimary', label: 'Primary Text' },
                { role: 'textSecondary', label: 'Secondary Text' },
                { role: 'link', label: 'Hyperlinks' },
                { role: 'success', label: 'Success Green' },
                { role: 'warning', label: 'Warning Amber' },
                { role: 'error', label: 'Error Rose' },
                { role: 'info', label: 'Info Blue' },
              ].map(({ role, label }) => {
                const hexVal = activeEditingColors[role as keyof AdvancedColorSettings] || '#000000';
                const rgbVal = hexToRgb(hexVal);
                return (
                  <div
                    key={role}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={hexVal.startsWith('#') ? hexVal : '#2563eb'}
                          onChange={(e) => updateColorRole(role as any, e.target.value)}
                          className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-slate-900 dark:text-white">{label}</span>
                        <span className="block text-[10px] font-mono text-slate-400">{rgbVal}</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={hexVal}
                      onChange={(e) => updateColorRole(role as any, e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold text-center"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Palette Presets Manager */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Saved Color Palettes Manager</span>
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter new palette name..."
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={saveCurrentPalette}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Save Palette</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {theme.savedPalettes.map((pal) => (
                <div
                  key={pal.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="block text-xs font-black text-slate-900 dark:text-white truncate">{pal.name}</span>
                    <div className="flex items-center gap-1">
                      {['primary', 'secondary', 'accent', 'background', 'surface'].map((r) => (
                        <div
                          key={r}
                          className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10"
                          style={{ backgroundColor: pal.colors[r as keyof AdvancedColorSettings] }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyPaletteToTarget(pal)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400 hover:bg-blue-500 hover:text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      Apply
                    </button>
                    {pal.id.startsWith('p-') && !pal.id.includes('default') && (
                      <button
                        type="button"
                        onClick={() => deletePalette(pal.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Advanced Typography Management (Prompt 1 Requirements) */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Advanced Typography Management ({editingTarget.toUpperCase()} MODE)</span>
            </h2>

            {/* Font Family Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Heading className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Heading Font</span>
                </label>
                <select
                  value={activeEditingTypo.headingFont}
                  onChange={(e) => updateTypo('headingFont', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Body Font</span>
                </label>
                <select
                  value={activeEditingTypo.bodyFont}
                  onChange={(e) => updateTypo('bodyFont', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <FontIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Button Font</span>
                </label>
                <select
                  value={activeEditingTypo.buttonFont}
                  onChange={(e) => updateTypo('buttonFont', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hierarchical Font Sizes Scale */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                11-Level Font Hierarchy Scale
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'display', label: 'Display Hero' },
                  { key: 'h1', label: 'Heading 1 (H1)' },
                  { key: 'h2', label: 'Heading 2 (H2)' },
                  { key: 'h3', label: 'Heading 3 (H3)' },
                  { key: 'h4', label: 'Heading 4 (H4)' },
                  { key: 'h5', label: 'Heading 5 (H5)' },
                  { key: 'h6', label: 'Heading 6 (H6)' },
                  { key: 'body', label: 'Body Text' },
                  { key: 'smallText', label: 'Small Text' },
                  { key: 'caption', label: 'Caption' },
                  { key: 'buttons', label: 'Button Text' },
                ].map((item) => (
                  <div key={item.key} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </label>
                    <input
                      type="text"
                      value={activeEditingTypo.fontSizes[item.key as keyof TypographySettings['fontSizes']] || ''}
                      onChange={(e) => updateFontSize(item.key as any, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Footer Background Effects Controls (New Feature Request) */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Footer Background Ambient Effects Engine</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'animatedMeshGradient', label: 'Animated Mesh Gradient', desc: 'Flowing radial mesh dot grid layer' },
                { key: 'auroraEffect', label: 'Aurora Effect', desc: 'Glowing multi-color aurora ribbon spotlight' },
                { key: 'floatingBlurredCircles', label: 'Floating Blurred Circles', desc: 'Large 140px ambient glow spotlights' },
                { key: 'noiseOverlay', label: 'Noise Texture Overlay', desc: 'Low-opacity fractal noise filter texture' },
                { key: 'softMovingLights', label: 'Soft Moving Lights', desc: 'Floating micro-light particle beam' },
                { key: 'layeredRadialGradients', label: 'Layered Radial Gradients', desc: 'Deep background radial gradient masks' },
              ].map((effect) => {
                const isEnabled = theme.footerEffects?.[effect.key as keyof FooterEffectsSettings] ?? true;
                return (
                  <div
                    key={effect.key}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900 dark:text-white">{effect.label}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{effect.desc}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateFooterEffect(effect.key as any, !isEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        isEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                          isEnabled ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Interactive Preview Panel with Mode Toggle Switch */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-5 sticky top-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Live Theme Preview</span>
              </span>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode('light')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    previewMode === 'light' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Preview Light Mode"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('dark')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    previewMode === 'dark' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Preview Dark Mode"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Box styled dynamically with previewMode colors & typography */}
            <div
              className="p-6 rounded-2xl space-y-4 shadow-xl transition-all"
              style={{
                backgroundColor: livePreviewColors.background,
                borderColor: livePreviewColors.border,
                borderWidth: '1px',
                borderStyle: 'solid',
                fontFamily: `'${livePreviewTypo.bodyFont}', sans-serif`,
                fontWeight: livePreviewTypo.fontWeight,
                letterSpacing: livePreviewTypo.letterSpacing,
                lineHeight: livePreviewTypo.lineHeight,
                textTransform: livePreviewTypo.textTransform as any,
              }}
            >
              <h3
                className="text-xl font-extrabold tracking-tight"
                style={{
                  color: livePreviewColors.textPrimary,
                  fontFamily: `'${livePreviewTypo.headingFont}', sans-serif`,
                }}
              >
                Modern Enterprise Hub
              </h3>

              <p className="text-xs leading-relaxed" style={{ color: livePreviewColors.textSecondary }}>
                Real-time live rendering preview reflecting all color roles, typography attributes, and mode switches.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition"
                  style={{
                    backgroundColor: livePreviewColors.primary,
                    borderRadius: theme.borderRadius,
                    fontFamily: `'${livePreviewTypo.buttonFont}', sans-serif`,
                  }}
                >
                  Primary Action
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold transition border"
                  style={{
                    backgroundColor: livePreviewColors.card,
                    borderColor: livePreviewColors.border,
                    color: livePreviewColors.textPrimary,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  Secondary Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminThemeManager;
