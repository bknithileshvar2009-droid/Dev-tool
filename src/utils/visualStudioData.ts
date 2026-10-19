/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ================= 1. THEMES (AESTHETIC STUDY ENVIRONMENTS - NO CHARACTERS) =================
export type CanvasThemeType =
  | 'none'
  | 'aurora'
  | 'nebula'
  | 'cyberpunk'
  | 'matrix'
  | 'fireflies'
  | 'minimal'
  | 'starlight'
  | 'embers'
  | 'thunder'
  | 'digital-rain'
  | 'warp-speed';

export interface WidgetSpecificStyle {
  bgColor?: string;
  bgOpacity?: number; // 0 to 100
  blur?: number; // 0 to 32 (px)
  borderColor?: string;
  borderWidth?: number; // 0 to 4 (px)
  borderRadius?: number; // 0 to 40 (px)
  shadowColor?: string;
  shadowBlur?: number; // 0 to 40 (px)
  glowColor?: string;
  glowIntensity?: number; // 0 to 100 (%)
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  padding?: number; // 8 to 32 (px)
}

export interface DashboardWidgetStyles {
  global: WidgetSpecificStyle;
  overrides: Record<string, WidgetSpecificStyle>;
}

export interface AnimationControlsConfig {
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  speed: number; // 0.5, 1.0, 1.5, 2.0
  energyColor: string;
  energyIntensity: number; // 0 to 100
  dimmer: number; // 0 to 90 (%)
  overlayOpacity: number; // 0 to 100 (%)
  focalPosition?: string | { x: number; y: number };
  characterScale?: number;
}

export interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  category: 'dark' | 'light' | 'cinematic' | 'nature' | 'space' | 'minimal';
  previewBg: string;
  previewAccent: string;
  previewText: string;
  previewSecondary: string;
  previewWidgetBg: string;
  previewWidgetBorder: string;
  wallpaperUrl: string;
  canvasTheme: CanvasThemeType;
  bgDimmer: number;
  bgBlur: number;
  bgSaturation: number;
  bgBrightness: number;
  accentColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  surfaceColor: string;
  widgetStyle: string;
  fontClock: string;
  fontHeading: string;
  fontBody: string;
  clockArchitecture: string;
  isAnimated?: boolean;
  animationIntensity?: number;
  animationSpeed?: number;
  energyColor?: string;
  defaultWidgetStyle?: WidgetSpecificStyle;
}

export const STUDIO_THEMES: ThemeOption[] = [
  {
    id: 'obsidian-glass',
    name: 'Obsidian Glass Minimal',
    tagline: 'Deep dark obsidian glass with refined cyan accents & high legibility',
    category: 'dark',
    previewBg: '#05070e',
    previewAccent: '#06b6d4',
    previewText: '#ffffff',
    previewSecondary: '#94a3b8',
    previewWidgetBg: 'rgba(8, 12, 22, 0.72)',
    previewWidgetBorder: 'rgba(6, 182, 212, 0.25)',
    wallpaperUrl: '/wallpapers/focus_golden_sunset.jpg',
    canvasTheme: 'minimal',
    bgDimmer: 35,
    bgBlur: 0,
    bgSaturation: 100,
    bgBrightness: 95,
    accentColor: '#06b6d4',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#94a3b8',
    surfaceColor: '#0a1020',
    widgetStyle: 'frosted-glass',
    fontClock: 'plus-jakarta',
    fontHeading: 'plus-jakarta',
    fontBody: 'inter',
    clockArchitecture: 'glass',
  },
  {
    id: 'midnight-monochrome',
    name: 'Midnight Monochrome OLED',
    tagline: 'Pure OLED black, crisp white typography & muted graphite accents',
    category: 'dark',
    previewBg: '#000000',
    previewAccent: '#ffffff',
    previewText: '#ffffff',
    previewSecondary: '#94a3b8',
    previewWidgetBg: 'rgba(18, 18, 22, 0.85)',
    previewWidgetBorder: 'rgba(255, 255, 255, 0.15)',
    wallpaperUrl: '',
    canvasTheme: 'none',
    bgDimmer: 40,
    bgBlur: 0,
    bgSaturation: 100,
    bgBrightness: 100,
    accentColor: '#ffffff',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#94a3b8',
    surfaceColor: '#0f172a',
    widgetStyle: 'minimal-flat',
    fontClock: 'mono-jb',
    fontHeading: 'inter',
    fontBody: 'inter',
    clockArchitecture: 'minimal',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon City',
    tagline: 'Futuristic night metropolis with luminous cyan and magenta glow',
    category: 'cinematic',
    previewBg: '#0d0718',
    previewAccent: '#00f0ff',
    previewText: '#ffffff',
    previewSecondary: '#e879f9',
    previewWidgetBg: 'rgba(18, 12, 34, 0.72)',
    previewWidgetBorder: 'rgba(0, 240, 255, 0.35)',
    wallpaperUrl: '/wallpapers/jp_tokyo_cyberpunk.jpg',
    canvasTheme: 'cyberpunk',
    bgDimmer: 25,
    bgBlur: 0,
    bgSaturation: 135,
    bgBrightness: 100,
    accentColor: '#00f0ff',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#c084fc',
    surfaceColor: '#120a24',
    widgetStyle: 'compact-info',
    fontClock: 'orbitron',
    fontHeading: 'orbitron',
    fontBody: 'inter',
    clockArchitecture: 'hex-cyber',
  },
  {
    id: 'forest-calm',
    name: 'Alpine Pine Sanctuary',
    tagline: 'Organic dark pine canopy, tranquil mist and soothing emerald accents',
    category: 'nature',
    previewBg: '#051b11',
    previewAccent: '#10b981',
    previewText: '#ffffff',
    previewSecondary: '#6ee7b7',
    previewWidgetBg: 'rgba(6, 26, 17, 0.68)',
    previewWidgetBorder: 'rgba(16, 185, 129, 0.25)',
    wallpaperUrl: '/wallpapers/focus_alpine_pines.jpg',
    canvasTheme: 'fireflies',
    bgDimmer: 30,
    bgBlur: 0,
    bgSaturation: 110,
    bgBrightness: 95,
    accentColor: '#10b981',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#a7f3d0',
    surfaceColor: '#061c12',
    widgetStyle: 'subtle-dark-glass',
    fontClock: 'poppins',
    fontHeading: 'poppins',
    fontBody: 'inter',
    clockArchitecture: 'minimal',
  },
  {
    id: 'rainy-cafe',
    name: 'Rainy Cafe Study',
    tagline: 'Atmospheric raindrops, amber cafe glow and quiet studious reflection',
    category: 'nature',
    previewBg: '#080c14',
    previewAccent: '#fbbf24',
    previewText: '#ffffff',
    previewSecondary: '#fde68a',
    previewWidgetBg: 'rgba(14, 20, 32, 0.65)',
    previewWidgetBorder: 'rgba(251, 191, 36, 0.25)',
    wallpaperUrl: '/wallpapers/kr_rainy_cafe.jpg',
    canvasTheme: 'none',
    bgDimmer: 35,
    bgBlur: 2,
    bgSaturation: 105,
    bgBrightness: 95,
    accentColor: '#fbbf24',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fde047',
    surfaceColor: '#141c2c',
    widgetStyle: 'frosted-glass',
    fontClock: 'mono-ibm',
    fontHeading: 'outfit',
    fontBody: 'inter',
    clockArchitecture: 'flip-classic-black',
  },
  {
    id: 'space-nebula',
    name: 'Space Explorer Nebula',
    tagline: 'Deep space cosmic nebula, stellar clusters and galactic starlight',
    category: 'space',
    previewBg: '#04040a',
    previewAccent: '#818cf8',
    previewText: '#ffffff',
    previewSecondary: '#c7d2fe',
    previewWidgetBg: 'rgba(12, 14, 30, 0.65)',
    previewWidgetBorder: 'rgba(129, 140, 248, 0.3)',
    wallpaperUrl: '/wallpapers/focus_violet_nebula.jpg',
    canvasTheme: 'nebula',
    bgDimmer: 20,
    bgBlur: 0,
    bgSaturation: 125,
    bgBrightness: 100,
    accentColor: '#818cf8',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#a5b4fc',
    surfaceColor: '#0e1026',
    widgetStyle: 'soft-shadow',
    fontClock: 'audiowide',
    fontHeading: 'audiowide',
    fontBody: 'inter',
    clockArchitecture: 'round-concentric',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Glacial Frost',
    tagline: 'Glacial ice blue, pure mountain chill and razor-sharp typographic clarity',
    category: 'minimal',
    previewBg: '#050a14',
    previewAccent: '#38bdf8',
    previewText: '#f0f9ff',
    previewSecondary: '#7dd3fc',
    previewWidgetBg: 'rgba(8, 18, 36, 0.65)',
    previewWidgetBorder: 'rgba(56, 189, 248, 0.25)',
    wallpaperUrl: '/wallpapers/focus_milky_way.jpg',
    canvasTheme: 'starlight',
    bgDimmer: 30,
    bgBlur: 1,
    bgSaturation: 110,
    bgBrightness: 100,
    accentColor: '#38bdf8',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#bae6fd',
    surfaceColor: '#081426',
    widgetStyle: 'clear-glass',
    fontClock: 'inter',
    fontHeading: 'inter',
    fontBody: 'inter',
    clockArchitecture: 'thin-elegant',
  },
  {
    id: 'espresso-study',
    name: 'Dark Espresso Library',
    tagline: 'Warm roasted coffee tones, velvet cocoa shadows and cozy focus vibes',
    category: 'dark',
    previewBg: '#130c08',
    previewAccent: '#d97706',
    previewText: '#ffffff',
    previewSecondary: '#fed7aa',
    previewWidgetBg: 'rgba(26, 16, 12, 0.75)',
    previewWidgetBorder: 'rgba(217, 119, 6, 0.3)',
    wallpaperUrl: '/wallpapers/kr_cozy_desk.jpg',
    canvasTheme: 'none',
    bgDimmer: 35,
    bgBlur: 1,
    bgSaturation: 110,
    bgBrightness: 95,
    accentColor: '#d97706',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fde68a',
    surfaceColor: '#1c120c',
    widgetStyle: 'subtle-dark-glass',
    fontClock: 'dm-sans',
    fontHeading: 'dm-sans',
    fontBody: 'inter',
    clockArchitecture: 'retro-7seg-amber',
  },
  {
    id: 'tokyo-rain',
    name: 'Tokyo Cinematic Rain',
    tagline: 'Reflective metropolitan avenue, architectural geometry and warm neon bloom',
    category: 'cinematic',
    previewBg: '#0e0b12',
    previewAccent: '#f43f5e',
    previewText: '#ffffff',
    previewSecondary: '#fb7185',
    previewWidgetBg: 'rgba(22, 16, 28, 0.72)',
    previewWidgetBorder: 'rgba(244, 63, 94, 0.28)',
    wallpaperUrl: '/wallpapers/jp_rainy_alley.jpg',
    canvasTheme: 'none',
    bgDimmer: 30,
    bgBlur: 2,
    bgSaturation: 120,
    bgBrightness: 95,
    accentColor: '#f43f5e',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fda4af',
    surfaceColor: '#181220',
    widgetStyle: 'subtle-dark-glass',
    fontClock: 'montserrat',
    fontHeading: 'montserrat',
    fontBody: 'inter',
    clockArchitecture: 'giant',
  },
  {
    id: 'minimal-white',
    name: 'Clean Gallery Light',
    tagline: 'Crisp light gallery aesthetic, deep charcoal text and clean architectural lines',
    category: 'light',
    previewBg: '#f8fafc',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
    previewSecondary: '#475569',
    previewWidgetBg: 'rgba(255, 255, 255, 0.92)',
    previewWidgetBorder: 'rgba(15, 23, 42, 0.12)',
    wallpaperUrl: '',
    canvasTheme: 'none',
    bgDimmer: 0,
    bgBlur: 0,
    bgSaturation: 100,
    bgBrightness: 100,
    accentColor: '#0f172a',
    primaryTextColor: '#0f172a',
    secondaryTextColor: '#64748b',
    surfaceColor: '#f1f5f9',
    widgetStyle: 'thin-outlined',
    fontClock: 'inter',
    fontHeading: 'inter',
    fontBody: 'inter',
    clockArchitecture: 'square-bento',
  },
  {
    id: 'retro-terminal',
    name: 'Retro Terminal Green',
    tagline: 'Classic 1980s phosphor CRT green display and monospace certainty',
    category: 'dark',
    previewBg: '#030a05',
    previewAccent: '#22c55e',
    previewText: '#4ade80',
    previewSecondary: '#86efac',
    previewWidgetBg: 'rgba(4, 18, 8, 0.85)',
    previewWidgetBorder: 'rgba(34, 197, 94, 0.35)',
    wallpaperUrl: '',
    canvasTheme: 'matrix',
    bgDimmer: 35,
    bgBlur: 0,
    bgSaturation: 120,
    bgBrightness: 95,
    accentColor: '#22c55e',
    primaryTextColor: '#4ade80',
    secondaryTextColor: '#86efac',
    surfaceColor: '#051408',
    widgetStyle: 'terminal-panel',
    fontClock: 'fira-code',
    fontHeading: 'fira-code',
    fontBody: 'fira-code',
    clockArchitecture: 'retro-crt',
  },
  {
    id: 'sunset-calm',
    name: 'Sunset Gradient Horizon',
    tagline: 'Warm terracotta and calming rose dusk gradient for soothing focus',
    category: 'nature',
    previewBg: '#12080c',
    previewAccent: '#fb7185',
    previewText: '#ffffff',
    previewSecondary: '#fbcfe8',
    previewWidgetBg: 'rgba(24, 12, 18, 0.72)',
    previewWidgetBorder: 'rgba(251, 113, 133, 0.28)',
    wallpaperUrl: '/wallpapers/art_anime_cherry_blossom.svg',
    canvasTheme: 'embers',
    bgDimmer: 30,
    bgBlur: 0,
    bgSaturation: 120,
    bgBrightness: 100,
    accentColor: '#fb7185',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#fbcfe8',
    surfaceColor: '#1a0c14',
    widgetStyle: 'frosted-glass',
    fontClock: 'sora',
    fontHeading: 'sora',
    fontBody: 'inter',
    clockArchitecture: 'round-dial',
  },
];

// ================= 2. 58+ CLOCK DESIGNS (SHAPES, RETRO, FLIP, DIGITAL, ANALOG, HYBRID) =================
export interface ClockDesignOption {
  id: string;
  name: string;
  category: 'shapes' | 'retro' | 'flip' | 'digital' | 'analog' | 'specialized';
  description: string;
  badge: string;
  icon?: string;
  previewTime: string;
}

export const STUDIO_CLOCK_DESIGNS: ClockDesignOption[] = [
  // --- A. SHAPE GEOMETRY CLOCKS (1 - 12) ---
  { id: 'round-dial', name: 'Round Minimal Dial', category: 'shapes', description: 'Clean circular silhouette with smooth bezel and centered numerals', badge: 'Circle', previewTime: '10:42' },
  { id: 'round-concentric', name: 'Round Concentric Rings', category: 'shapes', description: 'Concentric circular rings with ticking second orbit', badge: 'Concentric', previewTime: '10:42' },
  { id: 'round-donut', name: 'Round Glowing Donut', category: 'shapes', description: 'Luminous neon perimeter ring with floating digital core', badge: 'Ring', previewTime: '10:42' },
  { id: 'round-compass', name: 'Round Modern Compass', category: 'shapes', description: 'Navigation crosshairs, cardinal ticks and high-precision dial', badge: 'Compass', previewTime: '10:42' },
  { id: 'round-bubble', name: 'Round Frosted Bubble', category: 'shapes', description: 'Soft organic translucent glass orb with soft ambient drop shadow', badge: 'Orb', previewTime: '10:42' },
  { id: 'hex-cyber', name: 'Hexagonal Cyber HUD', category: 'shapes', description: 'Six-sided high-tech polygon frame with illuminated cyan bevels', badge: 'Hexagon', previewTime: '10:42' },
  { id: 'hex-honeycomb', name: 'Hexagonal Honeycomb Tech', category: 'shapes', description: 'Beveled honeycomb matrix structure with sharp chamfered vertices', badge: 'Honey', previewTime: '10:42' },
  { id: 'hex-double', name: 'Hexagonal Double Border', category: 'shapes', description: 'Dual concentric hexagonal contours with technical corner telemetry', badge: 'Dual-Hex', previewTime: '10:42' },
  { id: 'square-brutalist', name: 'Square Brutalist Monolith', category: 'shapes', description: 'Sharp 90-degree industrial block with heavy architectural borders', badge: 'Square', previewTime: '10:42' },
  { id: 'square-bento', name: 'Square Swiss Bento Box', category: 'shapes', description: 'Balanced square ratio with generous negative space and micro-border', badge: 'Bento', previewTime: '10:42' },
  { id: 'square-split', name: 'Square Split Quad Tiles', category: 'shapes', description: 'Four distinct quadrant cells for hours, minutes, seconds, and date', badge: 'Quad', previewTime: '10:42' },
  { id: 'octagon-scifi', name: 'Octagonal Sci-Fi Port', category: 'shapes', description: 'Eight-sided chamfered spaceship observation airlock window', badge: 'Octagon', previewTime: '10:42' },
  { id: 'capsule-pill', name: 'Capsule Pill Horizontal', category: 'shapes', description: 'Smooth rounded-full stadium capsule geometry', badge: 'Capsule', previewTime: '10:42' },
  { id: 'diamond-lozenge', name: 'Diamond Slanted Lozenge', category: 'shapes', description: 'Rhombus diamond orientation with perfectly level time typography', badge: 'Diamond', previewTime: '10:42' },
  { id: 'parallelogram-track', name: 'Parallelogram Speed Track', category: 'shapes', description: 'Aggressively slanted 12-degree italic racing telemetry container', badge: 'Slant', previewTime: '10:42' },
  { id: 'asymmetric-bauhaus', name: 'Asymmetrical Bauhaus Block', category: 'shapes', description: 'Diagonal geometric block with varied corner radii and modernist contrast', badge: 'Bauhaus', previewTime: '10:42' },

  // --- B. RETRO & VINTAGE CLOCKS (13 - 24) ---
  { id: 'retro-7seg-amber', name: 'Retro 7-Segment Amber LED', category: 'retro', description: 'Authentic 1980s bedside alarm clock with glowing amber segments', badge: '80s LED', previewTime: '10:42' },
  { id: 'retro-7seg-green', name: 'Retro 7-Segment Green Quartz', category: 'retro', description: 'Crisp fluorescent green vacuum LED digits with subtle ghost segments', badge: 'Quartz', previewTime: '10:42' },
  { id: 'retro-7seg-red', name: 'Retro 7-Segment Crimson LED', category: 'retro', description: 'Classic red LED laboratory digital stopwatch and chronometer', badge: 'Red LED', previewTime: '10:42' },
  { id: 'retro-nixie', name: 'Vintage Nixie Glow Tube', category: 'retro', description: 'Warm orange-red glowing neon filament wire in blown glass tubes', badge: 'Nixie', previewTime: '10:42' },
  { id: 'retro-lcd', name: 'Retro 80s Cassette LCD', category: 'retro', description: 'Classic grey/green digital wristwatch display with dark liquid crystal', badge: 'LCD', previewTime: '10:42' },
  { id: 'retro-gameboy', name: 'Pixel Gameboy 8-Bit', category: 'retro', description: 'Nostalgic 4-shade greenish pixelated screen with retro gaming charm', badge: '8-Bit', previewTime: '10:42' },
  { id: 'retro-vcr', name: 'VCR VHS Blue OSD Timestamp', category: 'retro', description: 'Authentic 1990s VHS on-screen display with blinking colon and noise', badge: 'VHS', previewTime: 'PLAY 10:42' },
  { id: 'retro-neon-arcade', name: '90s Neon Arcade Sign', category: 'retro', description: 'Vibrant pulsing neon glass tubing with atmospheric glowing reflections', badge: 'Arcade', previewTime: '10:42' },
  { id: 'retro-synthwave', name: 'Synthwave Sunset Grid', category: 'retro', description: 'Outrun dusk magenta-orange horizon gradient with wireframe floor', badge: 'Outrun', previewTime: '10:42' },
  { id: 'retro-crt', name: 'Retro CRT Terminal Scanlines', category: 'retro', description: 'Curved cathode-ray tube with phosphor scanlines and green glow', badge: 'CRT', previewTime: '10:42' },
  { id: 'retro-braun', name: 'Braun Minimal Dieter Rams', category: 'retro', description: 'Classic German functionalist ivory dial with iconic orange second hand', badge: 'Braun', previewTime: '10:42' },
  { id: 'retro-cassette', name: '80s Tape Cassette Counter', category: 'retro', description: 'Vintage audio cassette tape reel counter with mechanical rollers', badge: 'Cassette', previewTime: 'A-10:42' },

  // --- C. FLIP CLOCK & MECHANICAL (25 - 30) ---
  { id: 'flip-classic-black', name: 'Classic Airport Split-Flap Black', category: 'flip', description: 'Dark matte split-flap cards with white stamped numerals and center seam', badge: 'Split-Flap', previewTime: '10 | 42' },
  { id: 'flip-airport-yellow', name: 'Airport Flip Board Yellow', category: 'flip', description: 'High-contrast canary yellow on black mechanical transit timetable', badge: 'Airport', previewTime: '10:42' },
  { id: 'flip-wood-desk', name: 'Retro Walnut Wood Desk Flip', category: 'flip', description: 'Solid dark wood desk case framing dual split mechanical numerals', badge: 'Walnut', previewTime: '10:42' },
  { id: 'flip-frosted-glass', name: 'Frosted Glass Split Tiles', category: 'flip', description: 'Modern translucent glass cards with specular highlight separation', badge: 'Glass-Flip', previewTime: '10:42' },
  { id: 'flip-dual-tile', name: 'Oversized Twin Flip Tiles', category: 'flip', description: 'Massive side-by-side folding card modules with center fold line', badge: 'Twin-Tile', previewTime: '10 : 42' },
  { id: 'flip-minimal-clean', name: 'Minimal Wireframe Split-Flap', category: 'flip', description: 'Clean hairline partition divider with modern neo-grotesque numbers', badge: 'Minimal-Flip', previewTime: '10:42' },

  // --- D. DIGITAL & MINIMAL ARCHITECTURAL (31 - 45) ---
  { id: 'minimal', name: 'Minimal Swiss Digital', category: 'digital', description: 'Clean, spacious sans-serif typography with optimal kerning', badge: 'Swiss', previewTime: '10:42' },
  { id: 'giant', name: 'Large Bold Poster Digital', category: 'digital', description: 'Massive high-impact editorial poster clock visible across the room', badge: 'Hero', previewTime: '10:42' },
  { id: 'thin-elegant', name: 'Thin Elegant Luxury Numerals', category: 'digital', description: 'Hairline lightweight precision geometry for refined desks', badge: 'Luxury', previewTime: '10:42' },
  { id: 'n0t0', name: 'N0T0 Lowercase Word Clock', category: 'digital', description: 'Ultra-minimalist lowercase text-flow clock ("ten:forty two")', badge: 'Aesthetic', previewTime: 'ten:forty two' },
  { id: 'grid', name: 'Monospaced Developer Terminal', category: 'digital', description: 'Fixed-width developer tabular display with millisecond precision', badge: 'Terminal', previewTime: '10:42:00' },
  { id: 'outline', name: 'Outline Hollow Typography', category: 'digital', description: 'Hollow stroke transparent core digits floating over wallpaper', badge: 'Outline', previewTime: '10:42' },
  { id: 'glass', name: 'Glassmorphism Specular Frost', category: 'digital', description: 'Specular frosted translucent card with refractive glass sheen', badge: 'Glass', previewTime: '10:42' },
  { id: 'transparent', name: 'Transparent Floating Canvas', category: 'digital', description: 'Raw numerals directly against wallpaper with zero background box', badge: 'Float', previewTime: '10:42' },
  { id: 'fullscreen', name: 'Extra-Large Fullscreen Clock', category: 'digital', description: 'Hero center clock filling 70% of the viewport for deep focus', badge: 'Fullscreen', previewTime: '10:42' },
  { id: 'stacked', name: 'Vertical Stacked Hour/Minute', category: 'digital', description: 'Hours stacked vertically over minutes with editorial proportions', badge: 'Stacked', previewTime: '10\n42' },
  { id: 'horizontal', name: 'Horizontal Time & Live Calendar', category: 'digital', description: 'Wide linear banner with live calendar day and month indicator', badge: 'Banner', previewTime: '10:42 • WED 17' },
  { id: 'with-seconds', name: 'Precision Second Counter', category: 'digital', description: 'Precision real-time second hand tracking alongside time', badge: 'Seconds', previewTime: '10:42:38' },
  { id: 'no-seconds', name: 'Distraction-Free Zen Calm', category: 'digital', description: 'Calm minute ticker without flashing seconds or motion', badge: 'Zen', previewTime: '10:42' },
  { id: 'weekday-badge', name: 'Clock with Weekday Badge', category: 'digital', description: 'Prominent full weekday pill badge and target milestone', badge: 'Daily', previewTime: 'WED • 10:42' },
  { id: 'greeting', name: 'Dynamic Study Sprint Greeting', category: 'digital', description: 'Contextual morning/night study sprint header with live time', badge: 'Focus', previewTime: 'Sprint • 10:42' },

  // --- E. ANALOG CLOCKS (46 - 50) ---
  { id: 'analog-dial', name: 'Minimal Analog Dial', category: 'analog', description: 'Smooth sweeping hour, minute, and second hands on a clean dial', badge: 'Analog', previewTime: '🕒 Dial' },
  { id: 'analog-bauhaus', name: 'Bauhaus Modern Analog', category: 'analog', description: 'Geometric Bauhaus dial with clean tick marks and primary red second hand', badge: 'Bauhaus', previewTime: '🕒 Bauhaus' },
  { id: 'analog-luxury-dark', name: 'Obsidian Luxury Chronograph', category: 'analog', description: 'Matte dark dial with gold-accented hands and subtle luminescent dots', badge: 'Chrono', previewTime: '🕒 Luxury' },
  { id: 'analog-station', name: 'Vintage Railway Station Dial', category: 'analog', description: 'Classic European train station wall clock with bold black hour markers', badge: 'Station', previewTime: '🕒 Station' },
  { id: 'analog-roman', name: 'Classic Roman Numerals Dial', category: 'analog', description: 'Traditional academic clock with serif Roman numerals around the dial', badge: 'Roman', previewTime: '🕒 Roman' },

  // --- F. SPECIALIZED & HYBRID CLOCKS (51 - 58) ---
  { id: 'circular-gauge', name: 'Radial 60-Second Arch Gauge', category: 'specialized', description: 'Radial perimeter progress sweep ticking through 60 seconds', badge: 'Gauge', previewTime: '⭕ 10:42' },
  { id: 'dual-timezone', name: 'Dual Time-Zone Split Clock', category: 'specialized', description: 'Local study time + UTC target clock for global synchrony', badge: 'Dual-Zone', previewTime: '10:42 | UTC 05:12' },
  { id: 'countdown-combo', name: 'Countdown-Integrated Clock', category: 'specialized', description: 'Live time flanked by Public Exam days left in a unified unit', badge: 'Exam', previewTime: '10:42 (-137d)' },
  { id: 'aurora', name: 'Prismatic Aurora Chroma Glow', category: 'specialized', description: 'Prismatic shifting gradient fill illuminating the digits', badge: 'Aurora', previewTime: '10:42' },
  { id: 'hud', name: 'Sci-Fi Targeting Reticle HUD', category: 'specialized', description: 'Corner reticles, micro-grid telemetry and coordinate brackets', badge: 'HUD', previewTime: '[10:42:00]' },
  { id: 'dotmatrix-amber', name: 'Amber LED Dot-Matrix Display', category: 'specialized', description: 'High-density luminous amber LED dot grid for industrial feel', badge: 'Amber-LED', previewTime: '10:42' },
  { id: 'dotmatrix-cyan', name: 'Cyan Starlight Dot-Matrix', category: 'specialized', description: 'Futuristic cyan starlight dot-matrix array with high visibility', badge: 'Cyan-LED', previewTime: '10:42' },
  { id: 'matrix-stream', name: 'Matrix Digital Rain Ticker', category: 'specialized', description: 'Falling green code glyph stream forming the central digits', badge: 'Matrix', previewTime: '10:42' },
];

// ================= 3. 32+ VIEWABLE CLOCK & TEXT FONTS =================
export interface FontOption {
  id: string;
  name: string;
  description: string;
  category: 'Modern Sans' | 'Contemporary' | 'Monospace' | 'Futuristic' | 'Luxury Serif' | 'Display' | 'Retro Pixel';
  cssClass: string;
  fontFamily: string;
  samplePreview: string;
}

export const STUDIO_FONTS: FontOption[] = [
  // --- Modern Sans ---
  { id: 'inter', name: 'Inter', description: 'Neutral, ultra-legible Swiss modern standard', category: 'Modern Sans', cssClass: 'font-inter', fontFamily: "'Inter', sans-serif", samplePreview: '10:42:00 Clean Swiss Precision' },
  { id: 'roboto', name: 'Roboto', description: 'Balanced geometric curves with high readability', category: 'Modern Sans', cssClass: 'font-roboto', fontFamily: "'Roboto', sans-serif", samplePreview: '10:42:00 Dual Geometric Balance' },
  { id: 'manrope', name: 'Manrope', description: 'Semi-condensed modern crossover grotesque', category: 'Modern Sans', cssClass: 'font-manrope', fontFamily: "'Manrope', sans-serif", samplePreview: '10:42:00 Modern Open Grotesque' },
  { id: 'dm-sans', name: 'DM Sans', description: 'Precision low-contrast sans for editorial layouts', category: 'Modern Sans', cssClass: 'font-dm-sans', fontFamily: "'DM Sans', sans-serif", samplePreview: '10:42:00 Precision Editorial Flow' },
  { id: 'lato', name: 'Lato', description: 'Warm transparent classical proportions with friendly curves', category: 'Modern Sans', cssClass: 'font-lato', fontFamily: "'Lato', sans-serif", samplePreview: '10:42:00 Warm Humanist Proportions' },
  { id: 'ibm-plex-sans', name: 'IBM Plex Sans', description: 'Authoritative industrial corporate standard', category: 'Modern Sans', cssClass: 'font-ibm-plex-sans', fontFamily: "'IBM Plex Sans', sans-serif", samplePreview: '10:42:00 Industrial Technical Tone' },

  // --- Contemporary ---
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', description: 'Sophisticated neo-grotesque with warm rhythm', category: 'Contemporary', cssClass: 'font-plus-jakarta', fontFamily: "'Plus Jakarta Sans', sans-serif", samplePreview: '10:42:00 Sophisticated Warm Flow' },
  { id: 'poppins', name: 'Poppins', description: 'Friendly geometric sans with round terminals', category: 'Contemporary', cssClass: 'font-poppins', fontFamily: "'Poppins', sans-serif", samplePreview: '10:42:00 Pure Geometric Geometry' },
  { id: 'outfit', name: 'Outfit', description: 'Luxury tech-studio typeface with clean presence', category: 'Contemporary', cssClass: 'font-outfit', fontFamily: "'Outfit', sans-serif", samplePreview: '10:42:00 Tech Studio Modernism' },
  { id: 'montserrat', name: 'Montserrat', description: 'Structured, confident urban poster typography', category: 'Contemporary', cssClass: 'font-montserrat', fontFamily: "'Montserrat', sans-serif", samplePreview: '10:42:00 Urban Architectural Force' },
  { id: 'sora', name: 'Sora', description: 'Crisp low-contrast typography for cybernetics & UI', category: 'Contemporary', cssClass: 'font-sora', fontFamily: "'Sora', sans-serif", samplePreview: '10:42:00 Cybernetic Micro Geometry' },
  { id: 'syne', name: 'Syne', description: 'Avant-garde artistic sans with bold creative character', category: 'Contemporary', cssClass: 'font-syne', fontFamily: "'Syne', sans-serif", samplePreview: '10:42:00 Avant-Garde Expression' },

  // --- Monospace ---
  { id: 'mono-jb', name: 'JetBrains Mono', description: 'Highest developer ergonomics & code legibility', category: 'Monospace', cssClass: 'font-mono-jb', fontFamily: "'JetBrains Mono', monospace", samplePreview: '10:42:00 Developer Ergonomics' },
  { id: 'fira-code', name: 'Fira Code', description: 'Modern programming monospace with distinct ligatures', category: 'Monospace', cssClass: 'font-fira-code', fontFamily: "'Fira Code', monospace", samplePreview: '10:42:00 Code Monospace True' },
  { id: 'mono-ibm', name: 'IBM Plex Mono', description: 'Masterful engineer monospace with true balance', category: 'Monospace', cssClass: 'font-mono-ibm', fontFamily: "'IBM Plex Mono', monospace", samplePreview: '10:42:00 Engineer Matrix Standard' },
  { id: 'space-mono', name: 'Space Mono', description: 'Eccentric geometric retro-scientific monospace', category: 'Monospace', cssClass: 'font-space-mono', fontFamily: "'Space Mono', monospace", samplePreview: '10:42:00 Scientific Space Telemetry' },
  { id: 'source-code', name: 'Source Code Pro', description: 'Clean Adobe monospaced text for tabular data', category: 'Monospace', cssClass: 'font-source-code', fontFamily: "'Source Code Pro', monospace", samplePreview: '10:42:00 Tabular Precision Clean' },
  { id: 'courier-prime', name: 'Courier Prime', description: 'Vintage mechanical typewriter monospace standard', category: 'Monospace', cssClass: 'font-courier-prime', fontFamily: "'Courier Prime', monospace", samplePreview: '10:42:00 Literary Ribbon Typewriter' },
  { id: 'share-tech-mono', name: 'Share Tech Mono', description: 'Aerospace HUD and military terminal telemetry', category: 'Monospace', cssClass: 'font-share-tech', fontFamily: "'Share Tech Mono', monospace", samplePreview: '10:42:00 Aerospace Flight Telemetry' },

  // --- Futuristic ---
  { id: 'orbitron', name: 'Orbitron', description: 'Chiseled sci-fi HUD display font with geometric bevels', category: 'Futuristic', cssClass: 'font-orbitron', fontFamily: "'Orbitron', sans-serif", samplePreview: '10:42:00 CHISELED SCI-FI HUD' },
  { id: 'rajdhani', name: 'Rajdhani', description: 'Squared tactical condensed techno-display', category: 'Futuristic', cssClass: 'font-rajdhani', fontFamily: "'Rajdhani', sans-serif", samplePreview: '10:42:00 SQUARED TECHNO TACTICAL' },
  { id: 'oxanium', name: 'Oxanium', description: 'Distinct octagonal gaming & aerospace typeface', category: 'Futuristic', cssClass: 'font-oxanium', fontFamily: "'Oxanium', sans-serif", samplePreview: '10:42:00 OCTAGONAL AEROSPACE' },
  { id: 'exo-2', name: 'Exo 2', description: 'Sleek, aerodynamic futuristic geometric sans', category: 'Futuristic', cssClass: 'font-exo-2', fontFamily: "'Exo 2', sans-serif", samplePreview: '10:42:00 Aerodynamic Streamline' },
  { id: 'audiowide', name: 'Audiowide', description: 'High-tech galactic sci-fi curved headline font', category: 'Futuristic', cssClass: 'font-audiowide', fontFamily: "'Audiowide', cursive", samplePreview: '10:42:00 GALACTIC AUDIO MATRIX' },
  { id: 'space', name: 'Space Grotesk', description: 'Monospace-proportional hybrid for tech dashboards', category: 'Futuristic', cssClass: 'font-space', fontFamily: "'Space Grotesk', sans-serif", samplePreview: '10:42:00 Space Grotesk Hybrid' },

  // --- Luxury Serif ---
  { id: 'cinzel', name: 'Cinzel', description: 'Classical Roman imperial stone-carved serif', category: 'Luxury Serif', cssClass: 'font-cinzel', fontFamily: "'Cinzel', serif", samplePreview: '10:42:00 IMPERIAL ARCHITECTURAL' },
  { id: 'playfair', name: 'Playfair Display', description: 'High-contrast luxury editorial transitional serif', category: 'Luxury Serif', cssClass: 'font-playfair', fontFamily: "'Playfair Display', serif", samplePreview: '10:42:00 High Elegance Editorial' },

  // --- Display & Poster ---
  { id: 'anton', name: 'Anton', description: 'Monumental condensed display font with huge vertical presence', category: 'Display', cssClass: 'font-anton', fontFamily: "'Anton', sans-serif", samplePreview: '10:42:00 MONUMENTAL HEAVY' },
  { id: 'bebas-neue', name: 'Bebas Neue', description: 'Tall, massive all-caps poster titan for hero clocks', category: 'Display', cssClass: 'font-bebas-neue', fontFamily: "'Bebas Neue', sans-serif", samplePreview: '10:42:00 TALL HERO TITAN' },
  { id: 'oswald', name: 'Oswald', description: 'Re-imagined gothic headline font for impactful numbers', category: 'Display', cssClass: 'font-oswald', fontFamily: "'Oswald', sans-serif", samplePreview: '10:42:00 GOTHIC HEADLINE FORCE' },
  { id: 'archivo', name: 'Archivo', description: 'High-density architectural grotesque display', category: 'Display', cssClass: 'font-archivo', fontFamily: "'Archivo', sans-serif", samplePreview: '10:42:00 High Density Grotesque' },

  // --- Retro Pixel ---
  { id: 'vt323', name: 'VT323 Terminal', description: 'Authentic 1980s DEC terminal green phosphor glyphs', category: 'Retro Pixel', cssClass: 'font-vt323', fontFamily: "'VT323', monospace", samplePreview: '10:42:00 80s DEC TERMINAL' },
  { id: 'doto', name: 'Doto Dot-Matrix', description: 'Ultra-dense circular dot-matrix LED ticker typography', category: 'Retro Pixel', cssClass: 'font-doto', fontFamily: "'Doto', sans-serif", samplePreview: '10:42:00 LED DOT MATRIX' },
  { id: 'silkscreen', name: 'Silkscreen Pixel', description: 'Crisp 8-bit arcade handheld pixel typography', category: 'Retro Pixel', cssClass: 'font-silkscreen', fontFamily: "'Silkscreen', monospace", samplePreview: '10:42:00 8-BIT RETRO PIXEL' },
];

// ================= 4. WALLPAPERS (VERIFIED REAL ASSETS — 5,000+ SCALABLE CATALOG) =================
import { wallpaperProvider, WallpaperItem, WallpaperCategoryKey } from './wallpaperProvider';

export type { WallpaperCategoryKey };
export type WallpaperCategoryItem = WallpaperItem;

export const STUDIO_WALLPAPERS: WallpaperCategoryItem[] = wallpaperProvider.getAllWallpapers();
const _LEGACY_STUDIO_WALLPAPERS: any[] = [
  // --- JAPANESE AESTHETIC ---
  {
    id: 'jp-tokyo-cyberpunk',
    title: 'Tokyo Cyberpunk Neon Rain',
    category: 'japanese',
    subCategory: 'Tokyo Streets & Cyberpunk',
    tags: ['tokyo', 'neon', 'rain', 'night', 'japan', 'cyberpunk'],
    thumbUrl: '/wallpapers/jp_tokyo_cyberpunk.jpg',
    fullUrl: '/wallpapers/jp_tokyo_cyberpunk.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'jp-kyoto-fuji',
    title: 'Kyoto Temple & Mount Fuji Twilight',
    category: 'japanese',
    subCategory: 'Gardens & Twilight Countryside',
    tags: ['kyoto', 'fuji', 'pagoda', 'japan', 'twilight', 'mountain'],
    thumbUrl: '/wallpapers/jp_kyoto_fuji.jpg',
    fullUrl: '/wallpapers/jp_kyoto_fuji.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'jp-osaka-neon',
    title: 'Osaka Dotonbori Neon Reflections',
    category: 'japanese',
    subCategory: 'Neon Districts & Night Canals',
    tags: ['osaka', 'dotonbori', 'neon', 'night', 'japan', 'reflections'],
    thumbUrl: '/wallpapers/jp_osaka_neon.jpg',
    fullUrl: '/wallpapers/jp_osaka_neon.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'jp-shibuya-night',
    title: 'Shibuya Crossing Luminous Flow',
    category: 'japanese',
    subCategory: 'Tokyo Night Metropolis',
    tags: ['shibuya', 'crossing', 'tokyo', 'lights', 'japan'],
    thumbUrl: '/wallpapers/jp_shibuya_night.jpg',
    fullUrl: '/wallpapers/jp_shibuya_night.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'jp-rainy-alley',
    title: 'Tokyo Rainy Lantern Alley',
    category: 'japanese',
    subCategory: 'Quiet Night Study & Cafes',
    tags: ['alley', 'lanterns', 'rain', 'tokyo', 'cozy', 'japan'],
    thumbUrl: '/wallpapers/jp_rainy_alley.jpg',
    fullUrl: '/wallpapers/jp_rainy_alley.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'jp-anime-clouds',
    title: 'Pastel Anime Clouds & Twilight Skies',
    category: 'japanese',
    subCategory: 'Anime-Inspired Scenery',
    tags: ['anime', 'clouds', 'sunset', 'skies', 'pastel', 'japan'],
    thumbUrl: '/wallpapers/jp_anime_clouds.jpg',
    fullUrl: '/wallpapers/jp_anime_clouds.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },

  // --- KOREAN AESTHETIC ---
  {
    id: 'kr-seoul-night',
    title: 'Seoul Cityscape & Han River Lights',
    category: 'korean',
    subCategory: 'Seoul Neon Streets & Cityscapes',
    tags: ['seoul', 'han river', 'skyline', 'korea', 'night', 'bridges'],
    thumbUrl: '/wallpapers/kr_seoul_night.jpg',
    fullUrl: '/wallpapers/kr_seoul_night.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'kr-cozy-desk',
    title: 'Warm Korean Study Desk & Bookshelf',
    category: 'korean',
    subCategory: 'Cozy Study Rooms & Bedroom Desks',
    tags: ['study', 'desk', 'books', 'warm', 'korea', 'minimal'],
    thumbUrl: '/wallpapers/kr_cozy_desk.jpg',
    fullUrl: '/wallpapers/kr_cozy_desk.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'kr-rainy-cafe',
    title: 'Rain Drops on Seoul Cafe Window',
    category: 'korean',
    subCategory: 'Korean Cafes & Rainy Windows',
    tags: ['rain', 'cafe', 'coffee', 'window', 'seoul', 'cozy'],
    thumbUrl: '/wallpapers/kr_rainy_cafe.jpg',
    fullUrl: '/wallpapers/kr_rainy_cafe.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'kr-namsan-tower',
    title: 'Namsan Seoul Tower Sunset Glow',
    category: 'korean',
    subCategory: 'Seoul City Landmarks',
    tags: ['namsan', 'tower', 'seoul', 'sunset', 'korea'],
    thumbUrl: '/wallpapers/kr_namsan_tower.jpg',
    fullUrl: '/wallpapers/kr_namsan_tower.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'kr-gangnam-lights',
    title: 'Gangnam Cyber Avenue at Midnight',
    category: 'korean',
    subCategory: 'Cyberpunk & Futuristic Seoul',
    tags: ['gangnam', 'seoul', 'neon', 'cyberpunk', 'metropolis'],
    thumbUrl: '/wallpapers/kr_gangnam_lights.jpg',
    fullUrl: '/wallpapers/kr_gangnam_lights.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'kr-minimal-interior',
    title: 'Minimalist Korean Wood & Ceramic Desk',
    category: 'korean',
    subCategory: 'Minimalist Korean Interior',
    tags: ['minimal', 'wood', 'desk', 'zen', 'study', 'korea'],
    thumbUrl: '/wallpapers/kr_minimal_interior.jpg',
    fullUrl: '/wallpapers/kr_minimal_interior.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },

  // --- CHINESE AESTHETIC ---
  {
    id: 'cn-traditional-lanterns',
    title: 'Traditional Chinese Red Lantern Avenue',
    category: 'chinese',
    subCategory: 'Traditional Streets & Illuminated Lanterns',
    tags: ['lanterns', 'china', 'traditional', 'red', 'night', 'festival'],
    thumbUrl: '/wallpapers/cn_traditional_lanterns.jpg',
    fullUrl: '/wallpapers/cn_traditional_lanterns.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'cn-misty-mountains',
    title: 'Guilin Karst Misty Mountains & River',
    category: 'chinese',
    subCategory: 'Mountain Mist & Sunset Landscapes',
    tags: ['guilin', 'mountains', 'mist', 'river', 'ink wash', 'china'],
    thumbUrl: '/wallpapers/cn_misty_mountains.jpg',
    fullUrl: '/wallpapers/cn_misty_mountains.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'cn-shanghai-skyline',
    title: 'Shanghai Bund Futuristic Night Skyline',
    category: 'chinese',
    subCategory: 'Modern Chinese City Skylines',
    tags: ['shanghai', 'bund', 'skyline', 'pudong', 'neon', 'china'],
    thumbUrl: '/wallpapers/cn_shanghai_skyline.jpg',
    fullUrl: '/wallpapers/cn_shanghai_skyline.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'cn-ancient-town',
    title: 'Fenghuang Ancient Water Town Reflections',
    category: 'chinese',
    subCategory: 'Ancient Towns & Architecture',
    tags: ['fenghuang', 'water town', 'ancient', 'bridges', 'traditional'],
    thumbUrl: '/wallpapers/cn_ancient_town.jpg',
    fullUrl: '/wallpapers/cn_ancient_town.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'cn-traditional-temple',
    title: 'Dynasty Temple Garden & Lotus Pond',
    category: 'chinese',
    subCategory: 'Traditional Architecture & Serenity',
    tags: ['temple', 'garden', 'china', 'peaceful', 'architecture'],
    thumbUrl: '/wallpapers/cn_traditional_temple.jpg',
    fullUrl: '/wallpapers/cn_traditional_temple.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'cn-chongqing-bridges',
    title: 'Cyberpunk Chongqing Illuminated Bridges',
    category: 'chinese',
    subCategory: 'Cyberpunk Metropolis',
    tags: ['chongqing', 'bridges', 'neon', 'cyberpunk', 'metropolis'],
    thumbUrl: '/wallpapers/cn_chongqing_bridges.jpg',
    fullUrl: '/wallpapers/cn_chongqing_bridges.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },

  // --- ANIME & ARTISTIC VECTOR (100% OFFLINE ZERO LATENCY) ---
  {
    id: 'art-anime-cherry-blossom',
    title: 'Sunset Mount Fuji & Cherry Blossom Silhouette',
    category: 'anime',
    subCategory: 'Anime-Inspired Scenery',
    tags: ['anime', 'cherry blossom', 'fuji', 'sunset', 'vector', 'sakura'],
    thumbUrl: '/wallpapers/art_anime_cherry_blossom.svg',
    fullUrl: '/wallpapers/art_anime_cherry_blossom.svg',
    isLocal: true,
    resolution: 'Vector SVG (Crisp 4K)',
    aspectRatio: '16:9',
    format: 'svg',
  },
  {
    id: 'art-lofi-cyberpunk-neon',
    title: 'Cyberpunk Rainy Grid Avenue & Japanese Signs',
    category: 'cyberpunk',
    subCategory: 'Cyberpunk Cities',
    tags: ['cyberpunk', 'grid', 'rain', 'neon', 'synthwave', 'vector'],
    thumbUrl: '/wallpapers/art_lofi_cyberpunk_neon.svg',
    fullUrl: '/wallpapers/art_lofi_cyberpunk_neon.svg',
    isLocal: true,
    resolution: 'Vector SVG (Crisp 4K)',
    aspectRatio: '16:9',
    format: 'svg',
  },
  {
    id: 'art-traditional-chinese-mist',
    title: 'Traditional Chinese Ink Wash Misty Mountains',
    category: 'chinese',
    subCategory: 'Chinese Ink Painting Aesthetic',
    tags: ['ink wash', 'mist', 'mountains', 'moon', 'vector', 'traditional'],
    thumbUrl: '/wallpapers/art_traditional_chinese_mist.svg',
    fullUrl: '/wallpapers/art_traditional_chinese_mist.svg',
    isLocal: true,
    resolution: 'Vector SVG (Crisp 4K)',
    aspectRatio: '16:9',
    format: 'svg',
  },
  {
    id: 'art-cozy-korean-study-desk',
    title: 'Cozy Korean Night Study Desk & Seoul Window',
    category: 'study',
    subCategory: 'Cozy Study Rooms',
    tags: ['study', 'lamp', 'laptop', 'coffee', 'notebook', 'seoul', 'vector'],
    thumbUrl: '/wallpapers/art_cozy_korean_study_desk.svg',
    fullUrl: '/wallpapers/art_cozy_korean_study_desk.svg',
    isLocal: true,
    resolution: 'Vector SVG (Crisp 4K)',
    aspectRatio: '16:9',
    format: 'svg',
  },

  // --- STUDY, NATURE & COSMIC FOCUS ---
  {
    id: 'focus-alpine-pines',
    title: 'Misty Alpine Pines & Emerald Fog',
    category: 'nature',
    subCategory: 'Atmospheric Nature',
    tags: ['forest', 'fog', 'pine', 'nature', 'calm', 'emerald'],
    thumbUrl: '/wallpapers/focus_alpine_pines.jpg',
    fullUrl: '/wallpapers/focus_alpine_pines.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'focus-golden-sunset',
    title: 'Golden Sunset Horizon & Calm Water',
    category: 'minimal',
    subCategory: 'Minimalist Horizons',
    tags: ['sunset', 'golden', 'calm', 'horizon', 'minimal'],
    thumbUrl: '/wallpapers/focus_golden_sunset.jpg',
    fullUrl: '/wallpapers/focus_golden_sunset.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'focus-milky-way',
    title: 'Deep Observatory Milky Way Galaxy',
    category: 'space',
    subCategory: 'Cosmic Observatories',
    tags: ['space', 'milky way', 'stars', 'galaxy', 'observatory'],
    thumbUrl: '/wallpapers/focus_milky_way.jpg',
    fullUrl: '/wallpapers/focus_milky_way.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'focus-violet-nebula',
    title: 'Deep Violet Stellar Nebula',
    category: 'space',
    subCategory: 'Deep Space',
    tags: ['nebula', 'violet', 'stars', 'cosmic', 'space'],
    thumbUrl: '/wallpapers/focus_violet_nebula.jpg',
    fullUrl: '/wallpapers/focus_violet_nebula.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'focus-starry-night',
    title: 'Snowy Alpine Peak Under Starry Sky',
    category: 'space',
    subCategory: 'Night Peaks',
    tags: ['snow', 'mountain', 'stars', 'night', 'nature'],
    thumbUrl: '/wallpapers/focus_starry_night.jpg',
    fullUrl: '/wallpapers/focus_starry_night.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'focus-deep-ocean',
    title: 'Tranquil Deep Ocean Sunset Horizon',
    category: 'minimal',
    subCategory: 'Coastal Calm',
    tags: ['ocean', 'sea', 'sunset', 'waves', 'peaceful'],
    thumbUrl: '/wallpapers/focus_deep_ocean.jpg',
    fullUrl: '/wallpapers/focus_deep_ocean.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'focus-cozy-coffee',
    title: 'Warm Espresso & Wooden Library Focus',
    category: 'study',
    subCategory: 'Quiet Library Study',
    tags: ['coffee', 'espresso', 'library', 'wood', 'focus'],
    thumbUrl: '/wallpapers/focus_cozy_coffee.jpg',
    fullUrl: '/wallpapers/focus_cozy_coffee.jpg',
    isLocal: true,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'jpg',
  },
  {
    id: 'min-oled-black',
    title: 'Pure OLED Pitch Black',
    category: 'minimal',
    subCategory: 'Minimalist Monochromes',
    tags: ['black', 'oled', 'minimal', 'pure', 'dark'],
    thumbUrl: '/wallpapers/art_lofi_cyberpunk_neon.svg',
    fullUrl: '',
    isLocal: true,
    resolution: 'Universal OLED',
    aspectRatio: 'Universal',
    format: 'png',
  },
];

// ================= 5. BACKGROUND ATMOSPHERIC EFFECTS =================
export interface BackgroundEffectOption {
  id: 'none' | 'aurora' | 'nebula' | 'cyberpunk' | 'matrix' | 'fireflies' | 'minimal' | 'starlight' | 'embers' | 'thunder' | 'digital-rain' | 'warp-speed';
  name: string;
  description: string;
  icon: string;
}

export const STUDIO_BACKGROUND_EFFECTS: BackgroundEffectOption[] = [
  { id: 'none', name: 'None (Clean & Fast)', description: 'Static wallpaper without canvas overhead', icon: '⛔' },
  { id: 'minimal', name: 'Zen Subtle Wave', description: 'Ultra-low contrast breathing ambient pulse', icon: '🌊' },
  { id: 'aurora', name: 'Northern Lights Aurora', description: 'Silky undulating emerald & cyan atmospheric waves', icon: '🌌' },
  { id: 'nebula', name: 'Cosmic Stellar Nebula', description: 'Deep space drifting purple star gas clusters', icon: '✨' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon Dust', description: 'Reflective violet and cyan floating embers', icon: '🌆' },
  { id: 'matrix', name: 'Matrix Digital Glyph Stream', description: 'Cascading vertical phosphor data streams', icon: '🟢' },
  { id: 'fireflies', name: 'Tranquil Forest Fireflies', description: 'Gently glowing organic particles rising upward', icon: '🪲' },
  { id: 'starlight', name: 'Twinkling Deep Starfield', description: 'Subtle twinkling distant stellar field', icon: '⭐' },
  { id: 'embers', name: 'Warm Amber Forge Embers', description: 'Gentle rising amber energy motes', icon: '🔥' },
  { id: 'thunder', name: 'Thunder Atmospheric Pulse', description: 'Occasional cinematic lightning illumination', icon: '⚡' },
  { id: 'digital-rain', name: 'Cybernetic Telemetry Rain', description: 'High-tech binary rain and scanline pulses', icon: '📡' },
  { id: 'warp-speed', name: 'Warp Speed Hyperspace', description: 'Radial hyper-drive streak lines from the center', icon: '🚀' },
];

// ================= 6. WIDGET APPEARANCE STYLES =================
export interface WidgetStyleOption {
  id: string;
  name: string;
  tagline: string;
  cssClass: string;
  previewBg: string;
  previewBorder: string;
}

export const STUDIO_WIDGET_STYLES: WidgetStyleOption[] = [
  { id: 'transparent', name: 'Fully Transparent', tagline: 'Raw typography floating over wallpaper without background', cssClass: 'widget-style-transparent', previewBg: 'transparent', previewBorder: 'transparent' },
  { id: 'subtle-dark-glass', name: 'Dark Glass', tagline: 'Translucent dark glass with smooth background blur', cssClass: 'widget-style-subtle-dark-glass', previewBg: 'rgba(8, 12, 20, 0.65)', previewBorder: 'rgba(255, 255, 255, 0.12)' },
  { id: 'frosted-glass', name: 'Frosted Glass Card', tagline: 'Frosted crystal glass with bright edge illumination and depth', cssClass: 'widget-style-frosted-glass', previewBg: 'rgba(255, 255, 255, 0.08)', previewBorder: 'rgba(255, 255, 255, 0.22)' },
  { id: 'clear-glass', name: 'Clear Specular Glass', tagline: 'High-transmission glass with sharp highlight borders', cssClass: 'widget-style-clear-glass', previewBg: 'rgba(255, 255, 255, 0.04)', previewBorder: 'rgba(255, 255, 255, 0.28)' },
  { id: 'minimal-flat', name: 'Flat Minimal', tagline: 'Clean matte slate surface with subtle edge separation', cssClass: 'widget-style-minimal-flat', previewBg: 'rgba(12, 16, 24, 0.75)', previewBorder: 'rgba(255, 255, 255, 0.08)' },
  { id: 'thin-outlined', name: 'Thin Outlined Panel', tagline: 'Precise 1.5px border with translucent dark interior', cssClass: 'widget-style-thin-outlined', previewBg: 'rgba(0, 0, 0, 0.25)', previewBorder: 'rgba(255, 255, 255, 0.3)' },
  { id: 'soft-shadow', name: 'Soft Shadow Card', tagline: 'Deep layered card with dramatic ambient drop shadow', cssClass: 'widget-style-soft-shadow', previewBg: 'rgba(14, 18, 28, 0.88)', previewBorder: 'rgba(255, 255, 255, 0.07)' },
  { id: 'compact-info', name: 'Compact Information Panel', tagline: 'High-density border glow with focused contrast', cssClass: 'widget-style-compact-info', previewBg: 'rgba(15, 23, 42, 0.82)', previewBorder: 'rgba(6, 182, 212, 0.35)' },
  { id: 'neon-outline', name: 'Neon Outline Bezel', tagline: 'High-intensity colored glow rim framing the widget', cssClass: 'widget-style-neon-outline', previewBg: 'rgba(10, 10, 16, 0.75)', previewBorder: 'rgba(6, 182, 212, 0.6)' },
  { id: 'metallic-panel', name: 'Metallic Brushed Titanium', tagline: 'Industrial brushed metal panel with dual specular bevels', cssClass: 'widget-style-metallic-panel', previewBg: 'rgba(28, 30, 36, 0.82)', previewBorder: 'rgba(203, 213, 225, 0.3)' },
  { id: 'square-card', name: 'Square-Corner Brutalist', tagline: 'Zero border-radius architectural block design', cssClass: 'widget-style-square-card', previewBg: 'rgba(15, 17, 23, 0.9)', previewBorder: 'rgba(255, 255, 255, 0.15)' },
  { id: 'pill-widget', name: 'Pill-Shaped Widget', tagline: 'Concentric stadium capsule borders for compact chips', cssClass: 'widget-style-pill-widget', previewBg: 'rgba(255, 255, 255, 0.1)', previewBorder: 'rgba(255, 255, 255, 0.25)' },
  { id: 'terminal-panel', name: 'Retro CRT Terminal Panel', tagline: 'Dark phosphor green edge with subtle scanline overlay', cssClass: 'widget-style-terminal-panel', previewBg: '#061208', previewBorder: 'rgba(34, 197, 94, 0.4)' },
];

// ================= 7. COLOR PALETTES =================
export interface ColorPaletteOption {
  id: string;
  name: string;
  category: 'classic' | 'minimal' | 'cinematic';
  accent: string;
  primaryText: string;
  secondaryText: string;
  surface: string;
  highlight: string;
}

export const STUDIO_PALETTES: ColorPaletteOption[] = [
  { id: 'pure-monochrome', name: 'Pure Monochrome', category: 'minimal', accent: '#ffffff', primaryText: '#ffffff', secondaryText: '#94a3b8', surface: '#0f172a', highlight: '#f8fafc' },
  { id: 'neon-cyan', name: 'Neon Cyan Horizon', category: 'cinematic', accent: '#00f0ff', primaryText: '#ffffff', secondaryText: '#a5f3fc', surface: '#061220', highlight: '#38bdf8' },
  { id: 'arctic-blue', name: 'Arctic Ice Blue', category: 'classic', accent: '#38bdf8', primaryText: '#f8fafc', secondaryText: '#7dd3fc', surface: '#0f172a', highlight: '#0284c7' },
  { id: 'emerald-zen', name: 'Emerald Forest Zen', category: 'classic', accent: '#10b981', primaryText: '#ffffff', secondaryText: '#a7f3d0', surface: '#061a12', highlight: '#4ade80' },
  { id: 'amber-focus', name: 'Warm Amber Lamp', category: 'classic', accent: '#f59e0b', primaryText: '#ffffff', secondaryText: '#fde68a', surface: '#1c1408', highlight: '#fbbf24' },
  { id: 'amethyst-violet', name: 'Amethyst Cosmic Violet', category: 'cinematic', accent: '#a855f7', primaryText: '#ffffff', secondaryText: '#e9d5ff', surface: '#120a24', highlight: '#c084fc' },
  { id: 'sunset-rose', name: 'Sunset Rose Dusk', category: 'cinematic', accent: '#fb7185', primaryText: '#ffffff', secondaryText: '#fbcfe8', surface: '#180c14', highlight: '#f43f5e' },
  { id: 'warm-sand', name: 'Warm Linen & Sand', category: 'minimal', accent: '#d97706', primaryText: '#1e293b', secondaryText: '#64748b', surface: '#f8fafc', highlight: '#b45309' },
  { id: 'high-contrast-oled', name: 'High Contrast OLED', category: 'minimal', accent: '#facc15', primaryText: '#ffffff', secondaryText: '#e2e8f0', surface: '#000000', highlight: '#fbbf24' },
];

// ================= 8. VISUAL STUDIO CONFIGURATION =================
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
  widgetStyle: string;
  wallpaperScaling: 'cover' | 'contain' | 'fill';
  bgBrightness: number;
  bgSaturation: number;
  bgDimmer: number;
  bgBlur: number;
  isAnimated: boolean;
  animationIntensity: number;
  animationSpeed?: number;
  energyColor?: string;
  clockArchitecture: string;
  layoutPreset: string;
  widgetStyles?: DashboardWidgetStyles;
}

export const DEFAULT_STUDIO_CONFIG: VisualStudioConfig = {
  activeThemeId: 'obsidian-glass',
  accentColor: '#06b6d4',
  primaryTextColor: '#ffffff',
  secondaryTextColor: '#94a3b8',
  surfaceColor: '#0c1220',
  fontClock: 'plus-jakarta',
  fontHeading: 'plus-jakarta',
  fontBody: 'inter',
  fontCountdown: 'plus-jakarta',
  fontLabels: 'inter',
  widgetStyle: 'subtle-dark-glass',
  wallpaperScaling: 'cover',
  bgBrightness: 100,
  bgSaturation: 100,
  bgDimmer: 30,
  bgBlur: 0,
  isAnimated: false,
  animationIntensity: 1.0,
  animationSpeed: 1.0,
  energyColor: '#06b6d4',
  clockArchitecture: 'glass',
  layoutPreset: 'preset-grid-1',
};

// ================= 9. DAILY REGISTER DATA MODELS =================
export interface DailyRegisterEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  subject: string; // Mathematics, Physics, Chemistry, etc.
  topic: string; // Chapter / Concept / Problem set
  notes: string; // Detailed findings, formulas, takeaways
  durationMinutes: number; // e.g., 25, 45, 60
  status: 'completed' | 'in-progress' | 'review-needed';
  rating: number; // 1 to 5 focus score
  createdAt: number;
}

export const DEFAULT_DAILY_REGISTER_ENTRIES: DailyRegisterEntry[] = [
  {
    id: 'entry-1',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    subject: 'Mathematics',
    topic: 'Calculus — Differential Equations & Integrals',
    notes: 'Solved 15 high-order integration by parts problems. Key formula: ∫u v dx = u∫v dx - ∫(u\' ∫v dx) dx. Speed improving!',
    durationMinutes: 60,
    status: 'completed',
    rating: 5,
    createdAt: Date.now() - 1000 * 60 * 180,
  },
  {
    id: 'entry-2',
    date: new Date().toISOString().slice(0, 10),
    time: '11:15',
    subject: 'Physics',
    topic: 'Electromagnetic Induction & Faraday Laws',
    notes: 'Reviewed Lenz law sign conventions. Lenz law reflects conservation of energy. Need to re-solve 3 problem questions tonight.',
    durationMinutes: 45,
    status: 'completed',
    rating: 4,
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 'entry-3',
    date: new Date().toISOString().slice(0, 10),
    time: '14:30',
    subject: 'Chemistry',
    topic: 'Organic Reaction Mechanisms — Aldol Condensation',
    notes: 'Enolate ion attack on carbonyl carbon. Key catalyst: dilute NaOH. Underwent dehydration upon heating to form α,β-unsaturated aldehydes.',
    durationMinutes: 50,
    status: 'completed',
    rating: 5,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

// ================= 10. SAVED PRESETS =================
export interface SavedPreset {
  id: string;
  name: string;
  tagline: string;
  createdAt: number;
  isFavorite?: boolean;
  config: VisualStudioConfig;
  wallpaperUrl: string;
  canvasTheme: CanvasThemeType;
}

export const INITIAL_PRESETS: SavedPreset[] = [
  {
    id: 'preset-obsidian-minimal',
    name: 'Obsidian Minimalist',
    tagline: 'Deep dark obsidian glass with refined cyan accents & high legibility',
    createdAt: 1710000000001,
    isFavorite: true,
    wallpaperUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'minimal',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'obsidian-glass',
      accentColor: '#06b6d4',
      secondaryTextColor: '#94a3b8',
      surfaceColor: '#0a1020',
      widgetStyle: 'frosted-glass',
      fontClock: 'plus-jakarta',
      clockArchitecture: 'glass',
      layoutPreset: 'preset-grid-1',
    },
  },
  {
    id: 'preset-cyberpunk-neon',
    name: 'Cyberpunk Neon Matrix',
    tagline: 'Futuristic night metropolis with luminous cyan and magenta glow',
    createdAt: 1710000000002,
    isFavorite: true,
    wallpaperUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'cyberpunk',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'cyberpunk-neon',
      accentColor: '#00f0ff',
      secondaryTextColor: '#c084fc',
      surfaceColor: '#120a24',
      widgetStyle: 'compact-info',
      fontClock: 'orbitron',
      clockArchitecture: 'hex-cyber',
      layoutPreset: 'preset-grid-2',
    },
  },
  {
    id: 'preset-retro-terminal',
    name: 'Retro 80s Terminal',
    tagline: 'Classic 1980s phosphor CRT green display and monospace certainty',
    createdAt: 1710000000003,
    isFavorite: true,
    wallpaperUrl: '',
    canvasTheme: 'matrix',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'retro-terminal',
      accentColor: '#22c55e',
      secondaryTextColor: '#86efac',
      surfaceColor: '#051408',
      widgetStyle: 'terminal-panel',
      fontClock: 'fira-code',
      clockArchitecture: 'retro-crt',
      layoutPreset: 'preset-grid-3',
    },
  },
  {
    id: 'preset-flip-cafe',
    name: 'Vintage Cafe Split-Flap',
    tagline: 'Warm cafe ambiance with mechanical split-flap transit clock',
    createdAt: 1710000000004,
    isFavorite: true,
    wallpaperUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2400&q=85',
    canvasTheme: 'none',
    config: {
      ...DEFAULT_STUDIO_CONFIG,
      activeThemeId: 'rainy-cafe',
      accentColor: '#fbbf24',
      secondaryTextColor: '#fde047',
      surfaceColor: '#141c2c',
      widgetStyle: 'frosted-glass',
      fontClock: 'mono-ibm',
      clockArchitecture: 'flip-classic-black',
      layoutPreset: 'preset-grid-1',
    },
  },
];

// ================= 11. TYPOGRAPHY CONFIGURATION =================
export interface ElementTypographyConfig {
  fontFamily: string;
  fontSize?: number; // px
  fontWeight?: string; // '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  letterSpacing?: number; // px
  lineHeight?: number; // e.g. 1.1, 1.25
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  opacity?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: 'none' | 'soft' | 'crisp' | 'deep' | 'neon-glow' | 'outline' | 'custom';
  textGlow?: boolean;
  glowColor?: string;
  glowIntensity?: number; // 0 to 100
  isItalic?: boolean;
  isUnderline?: boolean;
  outlineColor?: string;
  outlineWidth?: number; // px
}

export interface DashboardTypographyConfig {
  globalScale: number;
  globalFontFamily?: string;
  fontClock?: string;
  fontHeading?: string;
  fontBody?: string;
  fontCountdown?: string;
  fontLabels?: string;
  elements: {
    clockMain: ElementTypographyConfig;
    clockSeconds: ElementTypographyConfig;
    clockAmPm: ElementTypographyConfig;
    clockDate: ElementTypographyConfig;
    countdownNumber: ElementTypographyConfig;
    countdownLabel: ElementTypographyConfig;
    countdownUnit: ElementTypographyConfig;
    widgetTitle: ElementTypographyConfig;
    widgetSubtitle: ElementTypographyConfig;
    timetableSubject: ElementTypographyConfig;
    timetableTime: ElementTypographyConfig;
    taskText: ElementTypographyConfig;
    motivationText: ElementTypographyConfig;
    customText: ElementTypographyConfig;
    buttonLabel: ElementTypographyConfig;
  };
}

export interface N0T0StyleOption {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow: 'none' | 'soft' | 'crisp' | 'deep' | 'neon-glow' | 'outline' | 'custom';
  fontWeight: string;
}

export const N0T0_TYPOGRAPHY_STYLES: N0T0StyleOption[] = [
  { id: 'noto-architect', name: 'Architectural Blueprint', fontFamily: 'plus-jakarta', description: 'Clean wide geometric sans for structural HUDs', letterSpacing: 2, textTransform: 'uppercase', textShadow: 'soft', fontWeight: '700' },
  { id: 'noto-monolith', name: 'Brutalist Monolith', fontFamily: 'anton', description: 'Dense, compressed titan characters with heavy presence', letterSpacing: 0, textTransform: 'uppercase', textShadow: 'crisp', fontWeight: '900' },
  { id: 'noto-cyber', name: 'Cyberpunk Luminescence', fontFamily: 'orbitron', description: 'High-tech display with futuristic terminal glow', letterSpacing: 3, textTransform: 'uppercase', textShadow: 'neon-glow', fontWeight: '800' },
  { id: 'noto-terminal', name: '80s Phosphor Terminal', fontFamily: 'mono-jb', description: 'Pixel-perfect ergonomics with fixed monospace cadence', letterSpacing: 1, textTransform: 'none', textShadow: 'soft', fontWeight: '600' },
  { id: 'noto-editorial', name: 'Editorial Luxury', fontFamily: 'playfair', description: 'High contrast neoclassical serif with dignified proportion', letterSpacing: 1, textTransform: 'none', textShadow: 'none', fontWeight: '700' },
  { id: 'noto-minimal', name: 'Zen Swiss Minimal', fontFamily: 'inter', description: 'Pure clarity with neutral geometric balance', letterSpacing: 0.5, textTransform: 'none', textShadow: 'none', fontWeight: '400' },
];

export const DEFAULT_ELEMENT_TYPOGRAPHY: DashboardTypographyConfig['elements'] = {
  clockMain: { fontFamily: 'plus-jakarta', fontSize: 72, fontWeight: '700', letterSpacing: -1, lineHeight: 1, textAlign: 'center', opacity: 1, textTransform: 'none' },
  clockSeconds: { fontFamily: 'plus-jakarta', fontSize: 32, fontWeight: '500', letterSpacing: 0, lineHeight: 1, textAlign: 'center', opacity: 0.8, textTransform: 'none' },
  clockAmPm: { fontFamily: 'plus-jakarta', fontSize: 18, fontWeight: '600', letterSpacing: 1, lineHeight: 1, textAlign: 'center', opacity: 0.7, textTransform: 'uppercase' },
  clockDate: { fontFamily: 'inter', fontSize: 13, fontWeight: '500', letterSpacing: 1, lineHeight: 1.2, textAlign: 'center', opacity: 0.85, textTransform: 'none' },
  countdownNumber: { fontFamily: 'plus-jakarta', fontSize: 64, fontWeight: '700', letterSpacing: -1, lineHeight: 1, textAlign: 'center', opacity: 1, textTransform: 'none' },
  countdownLabel: { fontFamily: 'inter', fontSize: 11, fontWeight: '600', letterSpacing: 2, lineHeight: 1.2, textAlign: 'center', opacity: 0.9, textTransform: 'uppercase' },
  countdownUnit: { fontFamily: 'inter', fontSize: 10, fontWeight: '500', letterSpacing: 1, lineHeight: 1, textAlign: 'center', opacity: 0.7, textTransform: 'uppercase' },
  widgetTitle: { fontFamily: 'plus-jakarta', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, lineHeight: 1.2, textAlign: 'left', opacity: 0.95, textTransform: 'uppercase' },
  widgetSubtitle: { fontFamily: 'inter', fontSize: 11, fontWeight: '400', letterSpacing: 0, lineHeight: 1.3, textAlign: 'left', opacity: 0.7, textTransform: 'none' },
  timetableSubject: { fontFamily: 'inter', fontSize: 13, fontWeight: '600', letterSpacing: 0, lineHeight: 1.3, textAlign: 'left', opacity: 0.95, textTransform: 'none' },
  timetableTime: { fontFamily: 'mono-jb', fontSize: 11, fontWeight: '500', letterSpacing: 0.5, lineHeight: 1.2, textAlign: 'left', opacity: 0.75, textTransform: 'none' },
  taskText: { fontFamily: 'inter', fontSize: 12, fontWeight: '400', letterSpacing: 0, lineHeight: 1.3, textAlign: 'left', opacity: 0.9, textTransform: 'none' },
  motivationText: { fontFamily: 'inter', fontSize: 13, fontWeight: '500', letterSpacing: 0.2, lineHeight: 1.4, textAlign: 'center', opacity: 0.9, isItalic: true, textTransform: 'none' },
  customText: { fontFamily: 'inter', fontSize: 13, fontWeight: '400', letterSpacing: 0, lineHeight: 1.4, textAlign: 'left', opacity: 0.9, textTransform: 'none' },
  buttonLabel: { fontFamily: 'inter', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, lineHeight: 1.2, textAlign: 'center', opacity: 0.85, textTransform: 'none' },
};

export interface CustomTextItem {
  id: string;
  title: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
