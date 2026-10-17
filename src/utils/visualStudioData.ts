/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  category: 'dark' | 'light' | 'cinematic' | 'nature' | 'space';
  previewBg: string;
  previewAccent: string;
  previewText: string;
  previewSecondary: string;
  previewWidgetBg: string;
  previewWidgetBorder: string;
  wallpaperUrl: string;
  canvasTheme: 'none' | 'aurora' | 'nebula' | 'cyberpunk' | 'matrix' | 'fireflies' | 'minimal';
  bgDimmer: number;
  bgBlur: number;
  bgSaturation: number;
  bgBrightness: number;
  accentColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  widgetStyle: 'transparent' | 'minimal-flat' | 'subtle-dark-glass' | 'frosted-glass' | 'thin-outlined' | 'soft-shadow' | 'compact-info';
  fontClock: string;
  fontHeading: string;
  fontBody: string;
  clockArchitecture: string;
}

export const STUDIO_THEMES: ThemeOption[] = [
  {
    id: 'midnight-monochrome',
    name: 'Midnight Monochrome',
    tagline: 'Pure black, crisp white typography & muted graphite accents',
    category: 'dark',
    previewBg: '#000000',
    previewAccent: '#e2e8f0',
    previewText: '#ffffff',
    previewSecondary: '#94a3b8',
    previewWidgetBg: 'rgba(20, 20, 24, 0.75)',
    previewWidgetBorder: 'rgba(255, 255, 255, 0.12)',
    wallpaperUrl: '',
    canvasTheme: 'minimal',
    bgDimmer: 40,
    bgBlur: 0,
    bgSaturation: 100,
    bgBrightness: 100,
    accentColor: '#ffffff',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#94a3b8',
    widgetStyle: 'minimal-flat',
    fontClock: 'mono-jb',
    fontHeading: 'inter',
    fontBody: 'inter',
    clockArchitecture: 'minimal',
  },
  {
    id: 'obsidian-glass',
    name: 'Obsidian Glass',
    tagline: 'Deep obsidian depth with high-translucency glass and cyan reflections',
    category: 'dark',
    previewBg: '#05070e',
    previewAccent: '#06b6d4',
    previewText: '#ffffff',
    previewSecondary: '#67e8f9',
    previewWidgetBg: 'rgba(12, 18, 30, 0.55)',
    previewWidgetBorder: 'rgba(6, 182, 212, 0.25)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 35,
    bgBlur: 8,
    bgSaturation: 110,
    bgBrightness: 95,
    accentColor: '#06b6d4',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#94a3b8',
    widgetStyle: 'frosted-glass',
    fontClock: 'inter',
    fontHeading: 'outfit',
    fontBody: 'inter',
    clockArchitecture: 'glass',
  },
  {
    id: 'arctic-focus',
    name: 'Arctic Focus',
    tagline: 'Charcoal alpine mist with chilling cyan and crystalline structure',
    category: 'cinematic',
    previewBg: '#090f15',
    previewAccent: '#38bdf8',
    previewText: '#f8fafc',
    previewSecondary: '#7dd3fc',
    previewWidgetBg: 'rgba(15, 23, 42, 0.65)',
    previewWidgetBorder: 'rgba(56, 189, 248, 0.2)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 30,
    bgBlur: 2,
    bgSaturation: 105,
    bgBrightness: 100,
    accentColor: '#38bdf8',
    primaryTextColor: '#f8fafc',
    secondaryTextColor: '#94a3b8',
    widgetStyle: 'subtle-dark-glass',
    fontClock: 'space',
    fontHeading: 'space',
    fontBody: 'inter',
    clockArchitecture: 'aurora',
  },
  {
    id: 'iron-armor',
    name: 'Iron Armor',
    tagline: 'Cinematic tactical black, metallic crimson red and golden highlights',
    category: 'cinematic',
    previewBg: '#0a0507',
    previewAccent: '#ef4444',
    previewText: '#ffffff',
    previewSecondary: '#f59e0b',
    previewWidgetBg: 'rgba(20, 10, 14, 0.7)',
    previewWidgetBorder: 'rgba(239, 68, 68, 0.3)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 45,
    bgBlur: 4,
    bgSaturation: 120,
    bgBrightness: 90,
    accentColor: '#ef4444',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fca5a5',
    widgetStyle: 'soft-shadow',
    fontClock: 'anton',
    fontHeading: 'montserrat',
    fontBody: 'roboto',
    clockArchitecture: 'giant',
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    tagline: 'Futuristic night metropolis with restrained neon cyan and cyberpunk violet',
    category: 'cinematic',
    previewBg: '#0d0718',
    previewAccent: '#a855f7',
    previewText: '#ffffff',
    previewSecondary: '#06b6d4',
    previewWidgetBg: 'rgba(18, 12, 34, 0.65)',
    previewWidgetBorder: 'rgba(168, 85, 247, 0.35)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 25,
    bgBlur: 0,
    bgSaturation: 135,
    bgBrightness: 100,
    accentColor: '#a855f7',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#c084fc',
    widgetStyle: 'compact-info',
    fontClock: 'orbitron',
    fontHeading: 'orbitron',
    fontBody: 'inter',
    clockArchitecture: 'cyber',
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    tagline: 'Crisp light gallery aesthetic, deep charcoal text and clean architectural lines',
    category: 'light',
    previewBg: '#f8fafc',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
    previewSecondary: '#475569',
    previewWidgetBg: 'rgba(255, 255, 255, 0.88)',
    previewWidgetBorder: 'rgba(15, 23, 42, 0.15)',
    wallpaperUrl: '',
    canvasTheme: 'none',
    bgDimmer: 0,
    bgBlur: 0,
    bgSaturation: 100,
    bgBrightness: 100,
    accentColor: '#0f172a',
    primaryTextColor: '#0f172a',
    secondaryTextColor: '#64748b',
    widgetStyle: 'thin-outlined',
    fontClock: 'inter',
    fontHeading: 'inter',
    fontBody: 'inter',
    clockArchitecture: 'minimal',
  },
  {
    id: 'forest-calm',
    name: 'Forest Calm',
    tagline: 'Organic dark pine canopy, tranquil mist and soothing emerald accents',
    category: 'nature',
    previewBg: '#051b11',
    previewAccent: '#10b981',
    previewText: '#ffffff',
    previewSecondary: '#6ee7b7',
    previewWidgetBg: 'rgba(6, 26, 17, 0.68)',
    previewWidgetBorder: 'rgba(16, 185, 129, 0.25)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 30,
    bgBlur: 0,
    bgSaturation: 110,
    bgBrightness: 95,
    accentColor: '#10b981',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#a7f3d0',
    widgetStyle: 'subtle-dark-glass',
    fontClock: 'poppins',
    fontHeading: 'poppins',
    fontBody: 'inter',
    clockArchitecture: 'minimal',
  },
  {
    id: 'rainy-night',
    name: 'Rainy Night',
    tagline: 'Atmospheric raindrops, amber cafe glow and quiet reflection',
    category: 'nature',
    previewBg: '#080c14',
    previewAccent: '#fbbf24',
    previewText: '#ffffff',
    previewSecondary: '#fde68a',
    previewWidgetBg: 'rgba(14, 20, 32, 0.62)',
    previewWidgetBorder: 'rgba(251, 191, 36, 0.25)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 35,
    bgBlur: 3,
    bgSaturation: 105,
    bgBrightness: 95,
    accentColor: '#fbbf24',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fde047',
    widgetStyle: 'frosted-glass',
    fontClock: 'mono-ibm',
    fontHeading: 'outfit',
    fontBody: 'inter',
    clockArchitecture: 'flip',
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer',
    tagline: 'Deep space cosmic nebula, stellar clusters and galactic starlight',
    category: 'space',
    previewBg: '#04040a',
    previewAccent: '#818cf8',
    previewText: '#ffffff',
    previewSecondary: '#c7d2fe',
    previewWidgetBg: 'rgba(12, 14, 30, 0.65)',
    previewWidgetBorder: 'rgba(129, 140, 248, 0.3)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'nebula',
    bgDimmer: 20,
    bgBlur: 0,
    bgSaturation: 125,
    bgBrightness: 100,
    accentColor: '#818cf8',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#a5b4fc',
    widgetStyle: 'soft-shadow',
    fontClock: 'audiowide',
    fontHeading: 'audiowide',
    fontBody: 'inter',
    clockArchitecture: 'morph',
  },
  {
    id: 'cinematic-street',
    name: 'Cinematic Street',
    tagline: 'Reflective Tokyo avenue, architectural geometry and warm neon bloom',
    category: 'cinematic',
    previewBg: '#0e0b12',
    previewAccent: '#f43f5e',
    previewText: '#ffffff',
    previewSecondary: '#fb7185',
    previewWidgetBg: 'rgba(22, 16, 28, 0.72)',
    previewWidgetBorder: 'rgba(244, 63, 94, 0.28)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
    canvasTheme: 'none',
    bgDimmer: 30,
    bgBlur: 2,
    bgSaturation: 120,
    bgBrightness: 95,
    accentColor: '#f43f5e',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fda4af',
    widgetStyle: 'subtle-dark-glass',
    fontClock: 'montserrat',
    fontHeading: 'montserrat',
    fontBody: 'inter',
    clockArchitecture: 'giant',
  },
];

export interface FontOption {
  id: string;
  name: string;
  description: string;
  category: 'Modern Sans' | 'Contemporary' | 'Monospace' | 'Futuristic' | 'System';
  cssClass: string;
}

export const STUDIO_FONTS: FontOption[] = [
  { id: 'inter', name: 'Inter', description: 'Clean, neutral and ultra-readable UI typography', category: 'Modern Sans', cssClass: 'font-inter' },
  { id: 'roboto', name: 'Roboto', description: 'Balanced neo-grotesque with natural reading cadence', category: 'Modern Sans', cssClass: 'font-roboto' },
  { id: 'poppins', name: 'Poppins', description: 'Geometric sans-serif with friendly rounded terminals', category: 'Contemporary', cssClass: 'font-poppins' },
  { id: 'montserrat', name: 'Montserrat', description: 'Bold, architectural and structured poster aesthetic', category: 'Contemporary', cssClass: 'font-montserrat' },
  { id: 'outfit', name: 'Outfit', description: 'Contemporary high-tech studio typeface for luxury dashboards', category: 'Contemporary', cssClass: 'font-outfit' },
  { id: 'space', name: 'Space Grotesk', description: 'Futuristic monospace-inspired proportional grotesque', category: 'Futuristic', cssClass: 'font-space' },
  { id: 'orbitron', name: 'Orbitron', description: 'Chiseled science-fiction geometric display font', category: 'Futuristic', cssClass: 'font-orbitron' },
  { id: 'mono-jb', name: 'JetBrains Mono', description: 'Precision code & engineering monospace with high x-height', category: 'Monospace', cssClass: 'font-mono-jb' },
  { id: 'mono-ibm', name: 'IBM Plex Mono', description: 'Restrained, authoritative industrial monospace', category: 'Monospace', cssClass: 'font-mono-ibm' },
  { id: 'system', name: 'System Default', description: 'Native OS font (San Francisco, Segoe UI, Roboto)', category: 'System', cssClass: 'font-system' },
];

export interface WallpaperCategoryItem {
  id: string;
  title: string;
  category: 'cinematic' | 'nature' | 'space' | 'minimal';
  thumbUrl: string;
  fullUrl: string;
  isAnimated?: boolean;
  animatedType?: 'aurora' | 'nebula' | 'cyberpunk' | 'matrix' | 'fireflies' | 'minimal';
}

export const STUDIO_WALLPAPERS: WallpaperCategoryItem[] = [
  // Cinematic
  {
    id: 'cine-futuristic-city',
    title: 'Futuristic City Street',
    category: 'cinematic',
    thumbUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'cine-rainy-neon',
    title: 'Rainy Neon Street',
    category: 'cinematic',
    thumbUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'cine-skyline-night',
    title: 'Skyline at Night',
    category: 'cinematic',
    thumbUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'cine-industrial-city',
    title: 'Atmospheric Industrial City',
    category: 'cinematic',
    thumbUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2400&q=85',
  },

  // Nature
  {
    id: 'nat-misty-forest',
    title: 'Misty Alpine Forest',
    category: 'nature',
    thumbUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'nat-mountain-sunrise',
    title: 'Mountain Sunrise',
    category: 'nature',
    thumbUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'nat-rain-window',
    title: 'Rain on a Window',
    category: 'nature',
    thumbUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'nat-quiet-lake',
    title: 'Quiet Lake Reflections',
    category: 'nature',
    thumbUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
  },

  // Space
  {
    id: 'spc-starfield',
    title: 'Milky Way Starfield',
    category: 'space',
    thumbUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'spc-nebula',
    title: 'Cosmic Orion Nebula',
    category: 'space',
    thumbUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'spc-earth-orbit',
    title: 'Earth from Orbit',
    category: 'space',
    thumbUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'spc-deep-space',
    title: 'Deep Space Horizon',
    category: 'space',
    thumbUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=85',
  },

  // Minimal
  {
    id: 'min-pure-black',
    title: 'Pure Black (OLED)',
    category: 'minimal',
    thumbUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23000000"/></svg>',
  },
  {
    id: 'min-grey-gradient',
    title: 'Dark Grey Slate Gradient',
    category: 'minimal',
    thumbUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'min-monochrome-texture',
    title: 'Monochrome Texture',
    category: 'minimal',
    thumbUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'min-soft-abstract',
    title: 'Soft Abstract Aura',
    category: 'minimal',
    thumbUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2400&q=85',
  },
];

export interface WidgetStyleOption {
  id: 'transparent' | 'minimal-flat' | 'subtle-dark-glass' | 'frosted-glass' | 'thin-outlined' | 'soft-shadow' | 'compact-info';
  name: string;
  tagline: string;
  cssClass: string;
}

export const STUDIO_WIDGET_STYLES: WidgetStyleOption[] = [
  { id: 'transparent', name: 'Transparent Floating', tagline: 'Raw typography floating over the wallpaper without card background', cssClass: 'widget-style-transparent' },
  { id: 'minimal-flat', name: 'Minimal Flat Widget', tagline: 'Clean matte slate surface with subtle edge separation', cssClass: 'widget-style-minimal-flat' },
  { id: 'subtle-dark-glass', name: 'Subtle Dark Glass', tagline: 'Translucent dark glass with smooth background blur', cssClass: 'widget-style-subtle-dark-glass' },
  { id: 'frosted-glass', name: 'Frosted Glass', tagline: 'Frosted crystal glass with bright edge illumination and depth', cssClass: 'widget-style-frosted-glass' },
  { id: 'thin-outlined', name: 'Thin Outlined Panel', tagline: 'Precise 1.5px border with translucent dark interior', cssClass: 'widget-style-thin-outlined' },
  { id: 'soft-shadow', name: 'Soft Shadow Card', tagline: 'Deep layered card with dramatic ambient drop shadow', cssClass: 'widget-style-soft-shadow' },
  { id: 'compact-info', name: 'Compact Information Panel', tagline: 'High-density border glow with focused contrast', cssClass: 'widget-style-compact-info' },
];

export interface ColorPaletteOption {
  id: string;
  name: string;
  accent: string;
  primaryText: string;
  secondaryText: string;
  surface: string;
}

export const STUDIO_PALETTES: ColorPaletteOption[] = [
  { id: 'pure-monochrome', name: 'Pure Monochrome', accent: '#ffffff', primaryText: '#ffffff', secondaryText: '#94a3b8', surface: '#0f172a' },
  { id: 'white-silver', name: 'White & Silver', accent: '#cbd5e1', primaryText: '#f8fafc', secondaryText: '#64748b', surface: '#1e293b' },
  { id: 'cyan-charcoal', name: 'Cyan & Charcoal', accent: '#06b6d4', primaryText: '#ffffff', secondaryText: '#67e8f9', surface: '#0b1320' },
  { id: 'crimson-black', name: 'Crimson & Black', accent: '#ef4444', primaryText: '#ffffff', secondaryText: '#fca5a5', surface: '#18090a' },
  { id: 'gold-charcoal', name: 'Gold & Charcoal', accent: '#fbbf24', primaryText: '#ffffff', secondaryText: '#fde68a', surface: '#1c1917' },
  { id: 'violet-midnight', name: 'Violet & Midnight', accent: '#a855f7', primaryText: '#ffffff', secondaryText: '#d8b4fe', surface: '#140c24' },
  { id: 'emerald-darkgrey', name: 'Emerald & Dark Grey', accent: '#10b981', primaryText: '#ffffff', secondaryText: '#6ee7b7', surface: '#061a12' },
];

export interface VisualStudioConfig {
  activeThemeId: string;
  accentColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  surfaceColor: string;
  fontClock: string;
  fontHeading: string;
  fontBody: string;
  fontCountdown: string;
  fontLabels: string;
  widgetStyle: 'transparent' | 'minimal-flat' | 'subtle-dark-glass' | 'frosted-glass' | 'thin-outlined' | 'soft-shadow' | 'compact-info';
  wallpaperScaling: 'cover' | 'contain' | 'fill';
  bgBrightness: number;
  bgSaturation: number;
  bgDimmer: number;
  bgBlur: number;
  isAnimated: boolean;
  animationIntensity: number;
}

export const DEFAULT_STUDIO_CONFIG: VisualStudioConfig = {
  activeThemeId: 'obsidian-glass',
  accentColor: '#06b6d4',
  primaryTextColor: '#ffffff',
  secondaryTextColor: '#94a3b8',
  surfaceColor: '#0c1220',
  fontClock: 'inter',
  fontHeading: 'inter',
  fontBody: 'inter',
  fontCountdown: 'inter',
  fontLabels: 'inter',
  widgetStyle: 'subtle-dark-glass',
  wallpaperScaling: 'cover',
  bgBrightness: 100,
  bgSaturation: 100,
  bgDimmer: 30,
  bgBlur: 0,
  isAnimated: false,
  animationIntensity: 1.0,
};

export interface SavedPreset {
  id: string;
  name: string;
  createdAt: number;
  config: VisualStudioConfig;
  wallpaperUrl: string;
  canvasTheme: 'none' | 'aurora' | 'nebula' | 'cyberpunk' | 'matrix' | 'fireflies' | 'minimal';
}

export const INITIAL_PRESETS: SavedPreset[] = [
  {
    id: 'preset-exam-focus',
    name: 'Exam Focus',
    createdAt: 1710000000000,
    wallpaperUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'none',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'obsidian-glass',
      accentColor: '#06b6d4',
      widgetStyle: 'subtle-dark-glass',
      fontClock: 'inter',
    },
  },
  {
    id: 'preset-iron-armor',
    name: 'Iron Armor',
    createdAt: 1710000001000,
    wallpaperUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'none',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'iron-armor',
      accentColor: '#ef4444',
      secondaryTextColor: '#fca5a5',
      widgetStyle: 'soft-shadow',
      fontClock: 'anton',
    },
  },
  {
    id: 'preset-night-study',
    name: 'Night Study',
    createdAt: 1710000002000,
    wallpaperUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'none',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'rainy-night',
      accentColor: '#fbbf24',
      secondaryTextColor: '#fde68a',
      widgetStyle: 'frosted-glass',
      fontClock: 'mono-ibm',
    },
  },
  {
    id: 'preset-pure-monochrome',
    name: 'Pure Monochrome',
    createdAt: 1710000003000,
    wallpaperUrl: '',
    canvasTheme: 'minimal',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'midnight-monochrome',
      accentColor: '#ffffff',
      secondaryTextColor: '#94a3b8',
      widgetStyle: 'minimal-flat',
      fontClock: 'mono-jb',
    },
  },
  {
    id: 'preset-calm-study',
    name: 'Calm Study',
    createdAt: 1710000004000,
    wallpaperUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'none',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'forest-calm',
      accentColor: '#10b981',
      secondaryTextColor: '#6ee7b7',
      widgetStyle: 'subtle-dark-glass',
      fontClock: 'poppins',
    },
  },
];
