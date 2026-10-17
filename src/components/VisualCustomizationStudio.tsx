/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Sparkles,
  X,
  Search,
  Check,
  Eye,
  RotateCcw,
  Upload,
  Palette,
  Sliders,
  Type,
  Layout,
  Image as ImageIcon,
  Bookmark,
  Plus,
  Trash2,
  Copy,
  Edit2,
  AlertCircle,
  Play,
  Maximize2,
  Calendar,
  Clock as ClockIcon,
  CheckCircle2,
  Zap,
  Shield,
  Star,
  Activity,
  Flame,
  Layers,
  StickyNote,
  SlidersHorizontal,
  Compass,
  Contrast,
  ArrowUpDown,
  History,
} from 'lucide-react';
import {
  STUDIO_THEMES,
  STUDIO_CLOCK_DESIGNS,
  STUDIO_FONTS,
  STUDIO_WALLPAPERS,
  STUDIO_BACKGROUND_EFFECTS,
  STUDIO_WIDGET_STYLES,
  STUDIO_LAYOUT_ARRANGEMENTS,
  STUDIO_PALETTES,
  INITIAL_PRESETS,
  ThemeOption,
  ClockDesignOption,
  FontOption,
  WallpaperCategoryItem,
  BackgroundEffectOption,
  WidgetStyleOption,
  LayoutPresetOption,
  ColorPaletteOption,
  SavedPreset,
  DEFAULT_STUDIO_CONFIG,
  CustomTextItem,
} from '../utils/visualStudioData';

interface VisualCustomizationStudioProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: any;
  onApply: (updates: any) => void;
  savedPresets: SavedPreset[];
  onUpdatePresets: (presets: SavedPreset[]) => void;
  customNotes?: CustomTextItem[];
  onUpdateCustomNotes?: (notes: CustomTextItem[]) => void;
}

type StudioTab =
  | 'themes'
  | 'clocks'
  | 'fonts'
  | 'text-styles'
  | 'wallpapers'
  | 'effects'
  | 'widgets'
  | 'layouts'
  | 'colours'
  | 'presets'
  | 'notes';

export default function VisualCustomizationStudio({
  isOpen,
  onClose,
  currentConfig,
  onApply,
  savedPresets,
  onUpdatePresets,
  customNotes = [],
  onUpdateCustomNotes,
}: VisualCustomizationStudioProps) {
  if (!isOpen) return null;

  // Active studio tab
  const [activeTab, setActiveTab] = useState<StudioTab>('themes');
  const [searchQuery, setSearchQuery] = useState('');

  // Sub-category filters
  const [themeFilter, setThemeFilter] = useState<'all' | 'superhero' | 'dark' | 'light' | 'cinematic' | 'nature' | 'space'>('all');
  const [clockFilter, setClockFilter] = useState<'all' | 'digital' | 'superhero' | 'classic' | 'specialized' | 'minimal'>('all');
  const [fontFilter, setFontFilter] = useState<string>('all');
  const [wallpaperCategory, setWallpaperCategory] = useState<'all' | 'superhero' | 'cinematic' | 'nature' | 'minimal'>('all');
  const [layoutCategory, setLayoutCategory] = useState<string>('all');

  // Favorites & Recently Used
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flocus_design_favorites');
      return saved ? JSON.parse(saved) : ['hero-iron-man', 'preset-iron-armor-study', 'hero-captain-america', 'hud', 'orbitron'];
    } catch {
      return ['hero-iron-man', 'preset-iron-armor-study'];
    }
  });

  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flocus_design_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('flocus_design_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const recordRecent = (id: string) => {
    setRecentlyUsed(prev => {
      const filtered = prev.filter(x => x !== id);
      const next = [id, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('flocus_design_recents', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Staging state: modifications happen here first without dirtying actual dashboard
  const [stagedThemeId, setStagedThemeId] = useState<string>(
    currentConfig.activeThemeId || currentConfig.activeWallpaper || 'obsidian-glass'
  );
  const [stagedWallpaperUrl, setStagedWallpaperUrl] = useState<string>(
    currentConfig.wallpaperUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=85'
  );
  const [stagedCanvasTheme, setStagedCanvasTheme] = useState<string>(currentConfig.canvasTheme || 'none');
  const [stagedBgDimmer, setStagedBgDimmer] = useState<number>(currentConfig.bgDimmer ?? 30);
  const [stagedBgBlur, setStagedBgBlur] = useState<number>(currentConfig.bgBlur ?? 0);
  const [stagedBgSaturation, setStagedBgSaturation] = useState<number>(currentConfig.bgSaturation ?? 100);
  const [stagedBgBrightness, setStagedBgBrightness] = useState<number>(currentConfig.bgBrightness ?? 100);
  const [stagedScaling, setStagedScaling] = useState<'cover' | 'contain' | 'fill'>(currentConfig.wallpaperScaling || 'cover');
  const [stagedIsAnimated, setStagedIsAnimated] = useState<boolean>(!currentConfig.isWallpaperStatic);
  const [stagedAnimIntensity, setStagedAnimIntensity] = useState<number>(currentConfig.animationIntensity ?? 1.0);

  // Widget appearance
  const [stagedWidgetStyle, setStagedWidgetStyle] = useState<string>(currentConfig.widgetStyle || 'subtle-dark-glass');
  const [stagedWidgetRadius, setStagedWidgetRadius] = useState<string>(currentConfig.personalization?.widgetRadius || 'smooth');
  const [stagedWidgetOpacity, setStagedWidgetOpacity] = useState<number>(85);
  const [applyStyleTarget, setApplyStyleTarget] = useState<'all' | 'clock' | 'countdown' | 'tasks'>('all');

  // Clock architecture
  const [stagedClockArch, setStagedClockArch] = useState<string>(currentConfig.clock?.architecture || 'minimal');

  // Typography settings (independent for each element!)
  const [stagedFontClock, setStagedFontClock] = useState<string>(currentConfig.typography?.fontClock || 'inter');
  const [stagedFontHeading, setStagedFontHeading] = useState<string>(currentConfig.typography?.fontHeading || 'inter');
  const [stagedFontBody, setStagedFontBody] = useState<string>(currentConfig.typography?.fontBody || 'inter');
  const [stagedFontCountdown, setStagedFontCountdown] = useState<string>(currentConfig.typography?.fontCountdown || 'inter');
  const [stagedFontLabels, setStagedFontLabels] = useState<string>(currentConfig.typography?.fontLabels || 'inter');

  // Typography controls
  const [clockFontSizeOffset, setClockFontSizeOffset] = useState<number>(0);
  const [clockLetterSpacing, setClockLetterSpacing] = useState<number>(0);
  const [clockFontWeight, setClockFontWeight] = useState<string>('400');
  const [clockUppercase, setClockUppercase] = useState<boolean>(false);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState<number>(2);

  // Colours
  const [stagedAccentColor, setStagedAccentColor] = useState<string>(currentConfig.customColors?.accent || currentConfig.clock?.color || '#06b6d4');
  const [stagedPrimaryText, setStagedPrimaryText] = useState<string>(currentConfig.customColors?.primaryText || '#ffffff');
  const [stagedSecondaryText, setStagedSecondaryText] = useState<string>(currentConfig.customColors?.secondaryText || '#94a3b8');
  const [stagedSurfaceColor, setStagedSurfaceColor] = useState<string>(currentConfig.customColors?.surface || '#0c1220');

  // Layout arrangement
  const [stagedLayoutPreset, setStagedLayoutPreset] = useState<string>(currentConfig.personalization?.layoutPreset || 'balanced');

  // Custom Sticky Notes Staging
  const [stagedNotes, setStagedNotes] = useState<CustomTextItem[]>(customNotes);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('#fbbf24');

  // File Upload State
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset creation modal
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');

  // Live ticking time for studio clock preview
  const [previewTime, setPreviewTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setPreviewTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const previewHoursStr = String(previewTime.getHours()).padStart(2, '0');
  const previewMinutesStr = String(previewTime.getMinutes()).padStart(2, '0');
  const previewSecondsStr = String(previewTime.getSeconds()).padStart(2, '0');

  // Filtered Themes
  const filteredThemes = useMemo(() => {
    let list = STUDIO_THEMES;
    if (themeFilter !== 'all') {
      list = list.filter(t => t.category === themeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q));
    }
    return list;
  }, [themeFilter, searchQuery]);

  // Filtered Clock Designs
  const filteredClockDesigns = useMemo(() => {
    let list = STUDIO_CLOCK_DESIGNS;
    if (clockFilter !== 'all') {
      list = list.filter(c => c.category === clockFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.badge.toLowerCase().includes(q));
    }
    return list;
  }, [clockFilter, searchQuery]);

  // Filtered Fonts
  const filteredFonts = useMemo(() => {
    let list = STUDIO_FONTS;
    if (fontFilter !== 'all') {
      list = list.filter(f => f.category === fontFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    }
    return list;
  }, [fontFilter, searchQuery]);

  // Filtered Wallpapers
  const filteredWallpapers = useMemo(() => {
    let list = STUDIO_WALLPAPERS;
    if (wallpaperCategory !== 'all') {
      list = list.filter(w => w.category === wallpaperCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w => w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q));
    }
    return list;
  }, [wallpaperCategory, searchQuery]);

  // Filtered Widget Styles
  const filteredWidgetStyles = useMemo(() => {
    if (!searchQuery.trim()) return STUDIO_WIDGET_STYLES;
    const q = searchQuery.toLowerCase();
    return STUDIO_WIDGET_STYLES.filter(w => w.name.toLowerCase().includes(q) || w.tagline.toLowerCase().includes(q));
  }, [searchQuery]);

  // Filtered Layouts
  const filteredLayouts = useMemo(() => {
    let list = STUDIO_LAYOUT_ARRANGEMENTS;
    if (layoutCategory !== 'all') {
      list = list.filter(l => l.category === layoutCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    return list;
  }, [layoutCategory, searchQuery]);

  // Filtered Palettes
  const filteredPalettes = useMemo(() => {
    if (!searchQuery.trim()) return STUDIO_PALETTES;
    const q = searchQuery.toLowerCase();
    return STUDIO_PALETTES.filter(p => p.name.toLowerCase().includes(q));
  }, [searchQuery]);

  // Total Presets Count Across Library (>100!)
  const totalLibraryItemsCount =
    STUDIO_THEMES.length +
    STUDIO_CLOCK_DESIGNS.length +
    STUDIO_FONTS.length +
    STUDIO_WALLPAPERS.length +
    STUDIO_BACKGROUND_EFFECTS.length +
    STUDIO_WIDGET_STYLES.length +
    STUDIO_LAYOUT_ARRANGEMENTS.length +
    STUDIO_PALETTES.length +
    INITIAL_PRESETS.length;

  // Apply Theme Handler
  const handleSelectTheme = (theme: ThemeOption) => {
    setStagedThemeId(theme.id);
    setStagedWallpaperUrl(theme.wallpaperUrl);
    setStagedCanvasTheme(theme.canvasTheme);
    setStagedBgDimmer(theme.bgDimmer);
    setStagedBgBlur(theme.bgBlur);
    setStagedBgSaturation(theme.bgSaturation);
    setStagedBgBrightness(theme.bgBrightness);
    setStagedAccentColor(theme.accentColor);
    setStagedPrimaryText(theme.primaryTextColor);
    setStagedSecondaryText(theme.secondaryTextColor);
    setStagedSurfaceColor(theme.surfaceColor);
    setStagedWidgetStyle(theme.widgetStyle);
    setStagedFontClock(theme.fontClock);
    setStagedFontHeading(theme.fontHeading);
    setStagedFontBody(theme.fontBody);
    setStagedClockArch(theme.clockArchitecture);
    recordRecent(theme.id);
  };

  // Apply Clock Design Handler
  const handleSelectClockDesign = (clock: ClockDesignOption) => {
    setStagedClockArch(clock.id);
    recordRecent(clock.id);
  };

  // Apply Palette Handler
  const handleSelectPalette = (palette: ColorPaletteOption) => {
    setStagedAccentColor(palette.accent);
    setStagedPrimaryText(palette.primaryText);
    setStagedSecondaryText(palette.secondaryText);
    setStagedSurfaceColor(palette.surface);
    recordRecent(palette.id);
  };

  // Commit all staged modifications to the active dashboard
  const handleApplyAllChanges = () => {
    onApply({
      activeThemeId: stagedThemeId,
      wallpaperUrl: stagedWallpaperUrl,
      canvasTheme: stagedCanvasTheme,
      bgDimmer: stagedBgDimmer,
      bgBlur: stagedBgBlur,
      bgSaturation: stagedBgSaturation,
      bgBrightness: stagedBgBrightness,
      wallpaperScaling: stagedScaling,
      isWallpaperStatic: !stagedIsAnimated,
      animationIntensity: stagedAnimIntensity,
      widgetStyle: stagedWidgetStyle,
      clock: {
        ...currentConfig.clock,
        color: stagedAccentColor,
        architecture: stagedClockArch,
      },
      typography: {
        fontClock: stagedFontClock,
        fontHeading: stagedFontHeading,
        fontBody: stagedFontBody,
        fontCountdown: stagedFontCountdown,
        fontLabels: stagedFontLabels,
        clockFontSizeOffset,
        clockLetterSpacing,
        clockFontWeight,
        clockUppercase,
        headingLetterSpacing,
      },
      customColors: {
        accent: stagedAccentColor,
        primaryText: stagedPrimaryText,
        secondaryText: stagedSecondaryText,
        surface: stagedSurfaceColor,
      },
      personalization: {
        ...currentConfig.personalization,
        layoutPreset: stagedLayoutPreset,
        widgetRadius: stagedWidgetRadius,
      },
    });

    if (onUpdateCustomNotes) {
      onUpdateCustomNotes(stagedNotes);
    }

    onClose();
  };

  // Reset Staged Settings to Defaults
  const handleResetToDefaults = () => {
    setStagedThemeId('obsidian-glass');
    setStagedWallpaperUrl('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=85');
    setStagedCanvasTheme('none');
    setStagedBgDimmer(35);
    setStagedBgBlur(0);
    setStagedBgSaturation(100);
    setStagedBgBrightness(100);
    setStagedAccentColor('#06b6d4');
    setStagedPrimaryText('#ffffff');
    setStagedSecondaryText('#94a3b8');
    setStagedSurfaceColor('#0c1220');
    setStagedWidgetStyle('subtle-dark-glass');
    setStagedFontClock('inter');
    setStagedFontHeading('inter');
    setStagedFontBody('inter');
    setStagedClockArch('minimal');
    setStagedLayoutPreset('balanced');
  };

  // Preset Management
  const handleSaveNewPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: SavedPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      tagline: 'Custom student layout and visual combination',
      createdAt: Date.now(),
      wallpaperUrl: stagedWallpaperUrl,
      canvasTheme: stagedCanvasTheme as any,
      config: {
        activeThemeId: stagedThemeId,
        accentColor: stagedAccentColor,
        primaryTextColor: stagedPrimaryText,
        secondaryTextColor: stagedSecondaryText,
        surfaceColor: stagedSurfaceColor,
        fontClock: stagedFontClock,
        fontHeading: stagedFontHeading,
        fontBody: stagedFontBody,
        fontCountdown: stagedFontCountdown,
        fontLabels: stagedFontLabels,
        widgetStyle: stagedWidgetStyle,
        wallpaperScaling: stagedScaling,
        bgBrightness: stagedBgBrightness,
        bgSaturation: stagedBgSaturation,
        bgDimmer: stagedBgDimmer,
        bgBlur: stagedBgBlur,
        isAnimated: stagedIsAnimated,
        animationIntensity: stagedAnimIntensity,
        clockArchitecture: stagedClockArch,
        layoutPreset: stagedLayoutPreset,
      },
    };
    onUpdatePresets([newPreset, ...savedPresets]);
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  const handleApplyPreset = (preset: SavedPreset) => {
    const c = preset.config;
    setStagedThemeId(c.activeThemeId);
    setStagedWallpaperUrl(preset.wallpaperUrl);
    setStagedCanvasTheme(preset.canvasTheme);
    setStagedBgDimmer(c.bgDimmer);
    setStagedBgBlur(c.bgBlur);
    setStagedBgSaturation(c.bgSaturation);
    setStagedBgBrightness(c.bgBrightness);
    setStagedAccentColor(c.accentColor);
    setStagedPrimaryText(c.primaryTextColor);
    setStagedSecondaryText(c.secondaryTextColor);
    setStagedSurfaceColor(c.surfaceColor);
    setStagedWidgetStyle(c.widgetStyle);
    setStagedFontClock(c.fontClock);
    setStagedFontHeading(c.fontHeading);
    setStagedFontBody(c.fontBody);
    setStagedFontCountdown(c.fontCountdown);
    setStagedFontLabels(c.fontLabels);
    if (c.clockArchitecture) setStagedClockArch(c.clockArchitecture);
    if (c.layoutPreset) setStagedLayoutPreset(c.layoutPreset);
    recordRecent(preset.id);
  };

  // Font CSS helper
  const getFontClass = (id: string) => {
    const f = STUDIO_FONTS.find(x => x.id === id);
    return f ? f.cssClass : 'font-inter';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-5 overflow-hidden">
      <div className="w-full max-w-7xl h-[94vh] rounded-3xl bg-[#070a12] border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Studio Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white font-['Plus_Jakarta_Sans']">
                  Design Studio & 100+ Preset Library
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/30 to-amber-500/30 text-amber-300 border border-amber-500/40">
                  Avengers & Study HUD
                </span>
                <span className="hidden sm:inline-block text-[10px] text-white/50 font-mono">
                  ({totalLibraryItemsCount} Presets Available)
                </span>
              </div>
              <p className="text-xs text-white/50 line-clamp-1">
                Cinematic Marvel superhero aesthetics, 35+ architectural clocks, 26 fonts, 30 widget styles & custom sticky notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Avengers, clocks, fonts..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition w-56 lg:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={handleResetToDefaults}
              title="Reset studio staging to defaults"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/10 transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleApplyAllChanges}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Design</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Tabs Navigation (10 Searchable Galleries + Sticky Notes) */}
        <div className="flex items-center justify-between px-5 border-b border-white/10 bg-black/40 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-2">
            {[
              { id: 'themes', label: 'Avengers & Themes (30)', icon: Shield },
              { id: 'clocks', label: 'Clock Designs (35)', icon: ClockIcon },
              { id: 'fonts', label: 'Typography Fonts (26)', icon: Type },
              { id: 'text-styles', label: 'Text & Font Stylers', icon: SlidersHorizontal },
              { id: 'wallpapers', label: 'Wallpapers (36)', icon: ImageIcon },
              { id: 'effects', label: 'Background FX (12)', icon: Flame },
              { id: 'widgets', label: 'Widget Styles (30)', icon: Layers },
              { id: 'layouts', label: 'Widget Layouts (25)', icon: Layout },
              { id: 'colours', label: 'Color Palettes (19)', icon: Palette },
              { id: 'presets', label: 'Combination Presets (15)', icon: Bookmark },
              { id: 'notes', label: 'Custom Notes Studio', icon: StickyNote },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as StudioTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio Body: Split View (Options on Left, Live Preview on Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Options & Studio Controls */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* ================= 1. THEMES GALLERY (INC. 20 AVENGERS SUPERHERO THEMES) ================= */}
            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Cinematic Dashboard Themes</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        20 Avengers Themes
                      </span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Select character-inspired atmospheres with customized lighting, HUD elements, and typography
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {(['all', 'superhero', 'dark', 'light', 'cinematic', 'nature', 'space'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setThemeFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          themeFilter === cat
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredThemes.map(th => {
                    const isSelected = stagedThemeId === th.id;
                    const isFav = favorites.includes(th.id);

                    return (
                      <div
                        key={th.id}
                        onClick={() => handleSelectTheme(th)}
                        className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        {/* Card Background Subtle Tint */}
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none transition group-hover:opacity-25"
                          style={{ background: `linear-gradient(135deg, ${th.previewAccent} 0%, transparent 60%)` }}
                        />

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: th.accentColor }}
                              />
                              <h4 className="text-xs font-bold text-white truncate">{th.name}</h4>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={e => toggleFavorite(th.id, e)}
                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                className={`p-1 rounded-lg hover:bg-white/10 transition ${isFav ? 'text-amber-400' : 'text-white/30 hover:text-white'}`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                              {isSelected && (
                                <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed mb-3">
                            {th.tagline}
                          </p>

                          {/* Mini Visual Color Bar Preview */}
                          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 border border-white/5 text-[10px]">
                            <span className="text-white/40 font-mono text-[9px] uppercase">{th.category}</span>
                            <div className="ml-auto flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.previewBg }} title="Background" />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.previewWidgetBg }} title="Widget" />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.accentColor }} title="Accent" />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.secondaryTextColor }} title="Secondary" />
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                          <span className="capitalize">{th.clockArchitecture} Clock</span>
                          <span className="text-cyan-400/80 font-mono group-hover:underline">Click to Apply</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 2. 35+ CLOCK DESIGNS GALLERY ================= */}
            {activeTab === 'clocks' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      35+ Working Clock Designs
                    </h3>
                    <p className="text-xs text-white/50">
                      High-precision architectural digital, superhero HUD, split-flap, flip, dot-matrix, and analog clocks
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {(['all', 'digital', 'superhero', 'classic', 'specialized', 'minimal'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setClockFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          clockFilter === cat
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredClockDesigns.map(clk => {
                    const isSelected = stagedClockArch === clk.id;
                    const isFav = favorites.includes(clk.id);

                    return (
                      <div
                        key={clk.id}
                        onClick={() => handleSelectClockDesign(clk)}
                        className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                              {clk.badge}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={e => toggleFavorite(clk.id, e)}
                                className={`p-1 rounded-lg hover:bg-white/10 transition ${isFav ? 'text-amber-400' : 'text-white/30 hover:text-white'}`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                              {isSelected && (
                                <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Live Clock Visual Render Card */}
                          <div className="h-20 rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center p-2 mb-2.5 relative overflow-hidden">
                            <div
                              className="text-lg sm:text-xl font-bold tracking-wider font-mono tabular-digits transition"
                              style={{ color: stagedAccentColor }}
                            >
                              {previewHoursStr}:{previewMinutesStr}:{previewSecondsStr}
                            </div>
                            <span className="text-[9px] text-white/40 mt-1 uppercase tracking-widest">
                              {clk.previewTime}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white mb-1">{clk.name}</h4>
                          <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                            {clk.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                          <span className="capitalize">{clk.category}</span>
                          <span className="text-cyan-400 font-mono group-hover:underline">Preview & Apply</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 3. 26 FONTS GALLERY ================= */}
            {activeTab === 'fonts' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      26 Typography Fonts
                    </h3>
                    <p className="text-xs text-white/50">
                      Live font cards for Inter, Orbitron, Rajdhani, JetBrains Mono, Space Grotesk, Bebas Neue, and more
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['all', 'Modern Sans', 'Contemporary', 'Monospace', 'Futuristic', 'Display'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFontFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          fontFilter === cat
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredFonts.map(f => {
                    const isSelected = stagedFontClock === f.id;

                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          setStagedFontClock(f.id);
                          recordRecent(f.id);
                        }}
                        className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                              {f.category}
                            </span>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className={`text-2xl text-white mb-2 font-medium tracking-tight ${f.cssClass}`}>
                            10:42:00
                          </div>

                          <div className={`text-sm text-cyan-300 font-bold mb-1 ${f.cssClass}`}>
                            {f.name}
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {f.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setStagedFontClock(f.id);
                              setStagedFontHeading(f.id);
                              setStagedFontBody(f.id);
                            }}
                            className="text-white/40 hover:text-white underline cursor-pointer"
                          >
                            Apply to All Elements
                          </button>
                          <span className="text-cyan-400 group-hover:underline">Apply to Clock</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 4. TEXT & FONT STYLERS (INDEPENDENT SELECTION) ================= */}
            {activeTab === 'text-styles' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Independent Element Typography & Text Controls
                  </h3>
                  <p className="text-xs text-white/50">
                    Assign different typography fonts independently to Clock digits, Headings, Countdown, and Labels
                  </p>
                </div>

                {/* Independent Font Pickers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Clock Digits Font */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                      Clock Digits Font
                    </label>
                    <select
                      value={stagedFontClock}
                      onChange={e => setStagedFontClock(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {STUDIO_FONTS.map(f => (
                        <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                    <div className={`p-2.5 rounded-xl bg-black/40 text-center text-xl text-white font-mono ${getFontClass(stagedFontClock)}`}>
                      10:42:00
                    </div>
                  </div>

                  {/* Dashboard Headings Font */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                      Headings Font
                    </label>
                    <select
                      value={stagedFontHeading}
                      onChange={e => setStagedFontHeading(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {STUDIO_FONTS.map(f => (
                        <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                    <div className={`p-2.5 rounded-xl bg-black/40 text-center text-xs text-white font-bold tracking-wider uppercase ${getFontClass(stagedFontHeading)}`}>
                      STUDY DASHBOARD
                    </div>
                  </div>

                  {/* Countdown Numbers Font */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                      Countdown Digits Font
                    </label>
                    <select
                      value={stagedFontCountdown}
                      onChange={e => setStagedFontCountdown(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {STUDIO_FONTS.map(f => (
                        <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                    <div className={`p-2.5 rounded-xl bg-black/40 text-center text-xl text-white font-light ${getFontClass(stagedFontCountdown)}`}>
                      137 Days
                    </div>
                  </div>

                  {/* Body Text & Labels Font */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
                      Body & Timetable Font
                    </label>
                    <select
                      value={stagedFontBody}
                      onChange={e => setStagedFontBody(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {STUDIO_FONTS.map(f => (
                        <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                    <div className={`p-2.5 rounded-xl bg-black/40 text-center text-xs text-white/80 ${getFontClass(stagedFontBody)}`}>
                      Formula Mastery & Routine
                    </div>
                  </div>
                </div>

                {/* Micro-Adjustment Sliders */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between mb-1.5 text-white/70">
                      <span>Clock Size Offset</span>
                      <span className="text-cyan-400 font-mono">{clockFontSizeOffset > 0 ? `+${clockFontSizeOffset}` : clockFontSizeOffset}px</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      value={clockFontSizeOffset}
                      onChange={e => setClockFontSizeOffset(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5 text-white/70">
                      <span>Clock Letter Spacing</span>
                      <span className="text-cyan-400 font-mono">{clockLetterSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min="-4"
                      max="12"
                      value={clockLetterSpacing}
                      onChange={e => setClockLetterSpacing(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5 text-white/70">
                      <span>Headings Tracking</span>
                      <span className="text-cyan-400 font-mono">{headingLetterSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={headingLetterSpacing}
                      onChange={e => setHeadingLetterSpacing(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white py-1">
                      <input
                        type="checkbox"
                        checked={clockUppercase}
                        onChange={e => setClockUppercase(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500"
                      />
                      <span>Uppercase Digital Text</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 5. 36+ WALLPAPERS & CUSTOM UPLOAD ================= */}
            {activeTab === 'wallpapers' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      36+ Curated Wallpapers & Backgrounds
                    </h3>
                    <p className="text-xs text-white/50">
                      Superhero Marvel landscapes, Tokyo cyberpunk rain, misty forests, and OLED minimalist pure black
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {(['all', 'superhero', 'cinematic', 'nature', 'minimal'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setWallpaperCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          wallpaperCategory === cat
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallpapers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredWallpapers.map(wp => {
                    const isSelected = stagedWallpaperUrl === wp.fullUrl;

                    return (
                      <div
                        key={wp.id}
                        onClick={() => {
                          setStagedWallpaperUrl(wp.fullUrl);
                          recordRecent(wp.id);
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer h-28 sm:h-32 ${
                          isSelected
                            ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                            : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                        }`}
                      >
                        {wp.fullUrl ? (
                          <img
                            src={wp.thumbUrl}
                            alt={wp.title}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center text-white/40 text-xs">
                            Pure OLED Black
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                          <span className="text-[10px] font-bold text-white truncate drop-shadow">
                            {wp.title}
                          </span>
                          <span className="text-[8px] text-white/50 uppercase tracking-wider">
                            {wp.category}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="absolute top-2 right-2 p-1 rounded-full bg-cyan-400 text-black shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Wallpaper Upload & Sliders */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Upload Custom Background File
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => {
                              if (ev.target?.result) {
                                setStagedWallpaperUrl(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Local File...</span>
                      </button>
                    </div>
                  </div>

                  {/* Optical Adjustments */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/5 text-xs">
                    <div>
                      <div className="flex justify-between mb-1.5 text-white/70">
                        <span>Background Dimmer</span>
                        <span className="text-cyan-400 font-mono">{stagedBgDimmer}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="85"
                        value={stagedBgDimmer}
                        onChange={e => setStagedBgDimmer(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5 text-white/70">
                        <span>Wallpaper Blur</span>
                        <span className="text-cyan-400 font-mono">{stagedBgBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={stagedBgBlur}
                        onChange={e => setStagedBgBlur(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5 text-white/70">
                        <span>Saturation</span>
                        <span className="text-cyan-400 font-mono">{stagedBgSaturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={stagedBgSaturation}
                        onChange={e => setStagedBgSaturation(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5 text-white/70">
                        <span>Brightness</span>
                        <span className="text-cyan-400 font-mono">{stagedBgBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="140"
                        value={stagedBgBrightness}
                        onChange={e => setStagedBgBrightness(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 6. 12 BACKGROUND ATMOSPHERIC EFFECTS ================= */}
            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    12 Background Atmospheric Effects
                  </h3>
                  <p className="text-xs text-white/50">
                    Live dynamic canvas particle systems: Thor's thunder pulses, Stark digital streams, and cosmic nebulae
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STUDIO_BACKGROUND_EFFECTS.map(fx => {
                    const isSelected = stagedCanvasTheme === fx.id;

                    return (
                      <div
                        key={fx.id}
                        onClick={() => {
                          setStagedCanvasTheme(fx.id);
                          recordRecent(fx.id);
                        }}
                        className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                          {fx.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold text-white truncate">{fx.name}</h4>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {fx.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 7. 30 WIDGET APPEARANCE STYLES ================= */}
            {activeTab === 'widgets' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    30 Widget Appearance Styles
                  </h3>
                  <p className="text-xs text-white/50">
                    Fully transparent, frosted glass, HUD technical panels, brushed metallic, neon outlines, and brutalist shapes
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredWidgetStyles.map(ws => {
                    const isSelected = stagedWidgetStyle === ws.id;

                    return (
                      <div
                        key={ws.id}
                        onClick={() => {
                          setStagedWidgetStyle(ws.id);
                          recordRecent(ws.id);
                        }}
                        className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div>
                          {/* Mini Sample Widget Card with that style */}
                          <div
                            className={`p-3 rounded-xl mb-2.5 flex items-center justify-between transition ${ws.cssClass}`}
                            style={{ backgroundColor: ws.previewBg, borderColor: ws.previewBorder }}
                          >
                            <span className="text-xs font-bold text-white">Widget Preview</span>
                            <span className="text-[10px] font-mono text-cyan-400">10:42</span>
                          </div>

                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold text-white">{ws.name}</h4>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {ws.tagline}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                          <span className="font-mono">{ws.id}</span>
                          <span className="text-cyan-400 group-hover:underline">Select Style</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 8. 25 WIDGET LAYOUT ARRANGEMENTS ================= */}
            {activeTab === 'layouts' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      25 Drag & Drop Layout Arrangements
                    </h3>
                    <p className="text-xs text-white/50">
                      Preset geometric layouts for study focus, exam countdowns, laptop viewports, and superhero docks
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['all', 'focus', 'desktop', 'minimal', 'cinematic', 'specialized'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setLayoutCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          layoutCategory === cat
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredLayouts.map(lay => {
                    const isSelected = stagedLayoutPreset === lay.id;

                    return (
                      <div
                        key={lay.id}
                        onClick={() => {
                          setStagedLayoutPreset(lay.id);
                          recordRecent(lay.id);
                        }}
                        className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                              {lay.badge}
                            </span>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white mb-1">{lay.name}</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                            {lay.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                          <span className="capitalize">{lay.category}</span>
                          <span className="text-cyan-400 group-hover:underline">Apply Arrangement</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 9. 19 COLOR PALETTES ================= */}
            {activeTab === 'colours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    19 Color Palettes & Contrast Checker
                  </h3>
                  <p className="text-xs text-white/50">
                    High-contrast colorways inspired by Avengers superheroes, titanium monochrome, and midnight hues
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPalettes.map(pal => {
                    const isSelected = stagedAccentColor === pal.accent;

                    return (
                      <div
                        key={pal.id}
                        onClick={() => handleSelectPalette(pal)}
                        className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white">{pal.name}</span>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          {/* Palette Preview Swatches */}
                          <div className="h-8 rounded-xl overflow-hidden flex border border-white/10 shadow-sm mb-2">
                            <div className="flex-1" style={{ backgroundColor: pal.surface }} title="Surface" />
                            <div className="flex-1" style={{ backgroundColor: pal.accent }} title="Accent" />
                            <div className="flex-1" style={{ backgroundColor: pal.highlight }} title="Highlight" />
                            <div className="flex-1" style={{ backgroundColor: pal.secondaryText }} title="Secondary" />
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                          <span className="capitalize">{pal.category}</span>
                          <span className="text-cyan-400 font-mono group-hover:underline">Apply Palette</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Color Pickers */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Custom Hex Color Overrides
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-white/60 block mb-1">Accent Glow Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedAccentColor}
                          onChange={e => setStagedAccentColor(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-white/80">{stagedAccentColor}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/60 block mb-1">Primary Text</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedPrimaryText}
                          onChange={e => setStagedPrimaryText(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-white/80">{stagedPrimaryText}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/60 block mb-1">Secondary Text</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedSecondaryText}
                          onChange={e => setStagedSecondaryText(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-white/80">{stagedSecondaryText}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/60 block mb-1">Surface Card Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedSurfaceColor}
                          onChange={e => setStagedSurfaceColor(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-white/80">{stagedSurfaceColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 10. 15+ COMBINATION PRESETS ================= */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Ready-to-Use Combination Presets
                    </h3>
                    <p className="text-xs text-white/50">
                      Complete aesthetic combinations: wallpapers, fonts, clocks, colors, and layout arrangement
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSavingPreset(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Current as Preset</span>
                  </button>
                </div>

                {/* Save New Preset Modal */}
                {isSavingPreset && (
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 space-y-3">
                    <h4 className="text-xs font-bold text-white">Save Custom Dashboard Combination</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPresetName}
                        onChange={e => setNewPresetName(e.target.value)}
                        placeholder="e.g., Midnight Chemistry Sprint"
                        className="flex-1 bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={handleSaveNewPreset}
                        className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsSavingPreset(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 text-white/60 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedPresets.map(pre => (
                    <div
                      key={pre.id}
                      onClick={() => handleApplyPreset(pre)}
                      className="group p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/50 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-bold text-white">{pre.name}</h4>
                          <span className="p-1 rounded-lg text-white/40 group-hover:text-cyan-300 transition">
                            <Bookmark className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                          {pre.tagline || 'Saved customized configuration'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-white/40 font-mono">
                          {pre.config.clockArchitecture || 'minimal'}
                        </span>
                        <span className="text-cyan-400 group-hover:underline">Apply Combination</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 11. CUSTOM NOTES & STICKY TEXT STUDIO ================= */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Custom Study Notes & Motivational Sticky Reminders
                  </h3>
                  <p className="text-xs text-white/50">
                    Pin customized study notes, exam reminders, and formula cards directly to your dashboard
                  </p>
                </div>

                {/* Add New Note Card Form */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Create New Sticky Note</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={e => setNewNoteTitle(e.target.value)}
                      placeholder="Note Title (e.g. Physics Formula Goal)"
                      className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">Color:</span>
                      {['#fbbf24', '#f43f5e', '#38bdf8', '#4ade80', '#c084fc'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewNoteColor(c)}
                          className={`w-6 h-6 rounded-full cursor-pointer transition ${newNoteColor === c ? 'scale-110 border-2 border-white' : 'opacity-60'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Write your study intention, formula, or reminder..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!newNoteTitle.trim() && !newNoteContent.trim()}
                      onClick={() => {
                        const newNote: CustomTextItem = {
                          id: `note-${Date.now()}`,
                          title: newNoteTitle.trim() || 'Study Reminder',
                          content: newNoteContent.trim() || 'Deep focus in progress.',
                          fontFamily: stagedFontBody || 'inter',
                          fontSize: 13,
                          fontWeight: '500',
                          color: newNoteColor,
                          opacity: 1.0,
                          letterSpacing: 0,
                          textAlign: 'left',
                          hasGlow: true,
                          hasOutline: true,
                          hasBackground: true,
                          bgColor: 'rgba(15, 23, 42, 0.75)',
                          width: 320,
                          x: 100,
                          y: 520,
                          visible: true,
                        };
                        setStagedNotes(prev => [...prev, newNote]);
                        setNewNoteTitle('');
                        setNewNoteContent('');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer disabled:opacity-40"
                    >
                      Add Sticky Note to Dashboard
                    </button>
                  </div>
                </div>

                {/* Staged Notes List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Active Sticky Notes ({stagedNotes.length})</h4>
                  {stagedNotes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl">
                      No custom study notes yet. Create one above to pin it to your dashboard!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stagedNotes.map(note => (
                        <div
                          key={note.id}
                          className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold" style={{ color: note.color }}>
                              {note.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => setStagedNotes(prev => prev.filter(n => n.id !== note.id))}
                              className="text-white/40 hover:text-rose-400 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed font-sans">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Interactive Dashboard Studio Preview */}
          <div className="w-[340px] lg:w-[420px] border-l border-white/10 bg-black/60 hidden md:flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Viewport Preview</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                1:1 Scale Simulation
              </span>
            </div>

            {/* Simulated Desktop Preview Frame */}
            <div
              className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col justify-between p-4"
              style={{
                backgroundColor: '#030407',
                backgroundImage: stagedWallpaperUrl ? `url(${stagedWallpaperUrl})` : undefined,
                backgroundSize: stagedScaling,
                backgroundPosition: 'center',
              }}
            >
              {/* Wallpaper Dimmer Overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-all"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${stagedBgDimmer / 100})`,
                  backdropFilter: stagedBgBlur > 0 ? `blur(${stagedBgBlur}px)` : undefined,
                }}
              />

              {/* Simulated Central Clock */}
              <div className="relative z-10 my-auto text-center">
                <div
                  className={`text-3xl font-bold tracking-tight drop-shadow-md ${getFontClass(stagedFontClock)}`}
                  style={{ color: stagedAccentColor }}
                >
                  {previewHoursStr}:{previewMinutesStr}
                </div>
                <div
                  className={`text-[10px] uppercase tracking-widest mt-1 opacity-70 text-white ${getFontClass(stagedFontHeading)}`}
                >
                  {stagedClockArch} • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Simulated Widgets Row */}
              <div className="relative z-10 grid grid-cols-2 gap-2 mt-auto">
                <div
                  className={`p-2.5 rounded-xl border text-[10px] text-white/90 ${stagedWidgetStyle}`}
                >
                  <div className="font-bold text-cyan-300">PUBLIC EXAM</div>
                  <div className="text-xs font-mono">137 Days Left</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-[10px] text-white/90 ${stagedWidgetStyle}`}
                >
                  <div className="font-bold text-emerald-300">STUDY TASKS</div>
                  <div className="text-xs font-mono">2 / 3 Completed</div>
                </div>
              </div>
            </div>

            {/* Currently Staged Configuration Specs */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-[11px] text-white/60 font-mono">
              <div className="flex justify-between">
                <span>Theme:</span>
                <strong className="text-white capitalize">{stagedThemeId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Clock Style:</span>
                <strong className="text-white capitalize">{stagedClockArch}</strong>
              </div>
              <div className="flex justify-between">
                <span>Clock Font:</span>
                <strong className="text-white capitalize">{stagedFontClock}</strong>
              </div>
              <div className="flex justify-between">
                <span>Widget Style:</span>
                <strong className="text-white capitalize">{stagedWidgetStyle}</strong>
              </div>
              <div className="flex justify-between">
                <span>Layout:</span>
                <strong className="text-white capitalize">{stagedLayoutPreset}</strong>
              </div>
              <div className="flex justify-between">
                <span>Effect:</span>
                <strong className="text-white capitalize">{stagedCanvasTheme}</strong>
              </div>
            </div>

            {/* Fast Commit Button in Sidebar */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleApplyAllChanges}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply to Live Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
