/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import {
  STUDIO_THEMES,
  STUDIO_FONTS,
  STUDIO_WALLPAPERS,
  STUDIO_WIDGET_STYLES,
  STUDIO_PALETTES,
  INITIAL_PRESETS,
  ThemeOption,
  FontOption,
  WallpaperCategoryItem,
  WidgetStyleOption,
  ColorPaletteOption,
  SavedPreset,
  DEFAULT_STUDIO_CONFIG,
} from '../utils/visualStudioData';

interface VisualCustomizationStudioProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: any;
  onApply: (updates: any) => void;
  savedPresets: SavedPreset[];
  onUpdatePresets: (presets: SavedPreset[]) => void;
}

export default function VisualCustomizationStudio({
  isOpen,
  onClose,
  currentConfig,
  onApply,
  savedPresets,
  onUpdatePresets,
}: VisualCustomizationStudioProps) {
  if (!isOpen) return null;

  // Active studio tab
  const [activeTab, setActiveTab] = useState<'themes' | 'fonts' | 'backgrounds' | 'widgets' | 'colours' | 'presets'>('themes');
  const [searchQuery, setSearchQuery] = useState('');
  const [wallpaperCategory, setWallpaperCategory] = useState<'all' | 'cinematic' | 'nature' | 'space' | 'minimal'>('all');

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
  const [applyStyleTarget, setApplyStyleTarget] = useState<'all' | 'clock' | 'countdown' | 'tasks'>('all');

  // Typography settings
  const [stagedFontClock, setStagedFontClock] = useState<string>(currentConfig.typography?.fontClock || 'inter');
  const [stagedFontHeading, setStagedFontHeading] = useState<string>(currentConfig.typography?.fontHeading || 'inter');
  const [stagedFontBody, setStagedFontBody] = useState<string>(currentConfig.typography?.fontBody || 'inter');
  const [stagedFontCountdown, setStagedFontCountdown] = useState<string>(currentConfig.typography?.fontCountdown || 'inter');
  const [stagedFontLabels, setStagedFontLabels] = useState<string>(currentConfig.typography?.fontLabels || 'inter');
  const [clockArch, setClockArch] = useState<string>(currentConfig.clock?.architecture || 'minimal');

  // Colours
  const [stagedAccentColor, setStagedAccentColor] = useState<string>(currentConfig.customColors?.accent || currentConfig.clock?.color || '#06b6d4');
  const [stagedPrimaryText, setStagedPrimaryText] = useState<string>(currentConfig.customColors?.primaryText || '#ffffff');
  const [stagedSecondaryText, setStagedSecondaryText] = useState<string>(currentConfig.customColors?.secondaryText || '#94a3b8');
  const [stagedSurfaceColor, setStagedSurfaceColor] = useState<string>(currentConfig.customColors?.surface || '#0c1220');

  // File Upload State
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset creation modal
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');

  // Search filtered items
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return STUDIO_THEMES;
    const q = searchQuery.toLowerCase();
    return STUDIO_THEMES.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredFonts = useMemo(() => {
    if (!searchQuery.trim()) return STUDIO_FONTS;
    const q = searchQuery.toLowerCase();
    return STUDIO_FONTS.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [searchQuery]);

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

  // Apply Theme Helper
  const handleSelectTheme = (theme: ThemeOption, immediateApply = false) => {
    setStagedThemeId(theme.id);
    if (theme.wallpaperUrl) setStagedWallpaperUrl(theme.wallpaperUrl);
    setStagedCanvasTheme(theme.canvasTheme);
    setStagedBgDimmer(theme.bgDimmer);
    setStagedBgBlur(theme.bgBlur);
    setStagedBgSaturation(theme.bgSaturation);
    setStagedBgBrightness(theme.bgBrightness);
    setStagedAccentColor(theme.accentColor);
    setStagedPrimaryText(theme.primaryTextColor);
    setStagedSecondaryText(theme.secondaryTextColor);
    setStagedWidgetStyle(theme.widgetStyle);
    setStagedFontClock(theme.fontClock);
    setStagedFontHeading(theme.fontHeading);
    setStagedFontBody(theme.fontBody);
    setClockArch(theme.clockArchitecture);

    if (immediateApply) {
      commitChanges({
        activeThemeId: theme.id,
        wallpaperUrl: theme.wallpaperUrl,
        canvasTheme: theme.canvasTheme,
        bgDimmer: theme.bgDimmer,
        bgBlur: theme.bgBlur,
        bgSaturation: theme.bgSaturation,
        bgBrightness: theme.bgBrightness,
        widgetStyle: theme.widgetStyle,
        customColors: {
          accent: theme.accentColor,
          primaryText: theme.primaryTextColor,
          secondaryText: theme.secondaryTextColor,
          surface: theme.previewWidgetBg,
        },
        typography: {
          fontClock: theme.fontClock,
          fontHeading: theme.fontHeading,
          fontBody: theme.fontBody,
          fontCountdown: theme.fontClock,
          fontLabels: theme.fontBody,
        },
        clock: {
          ...currentConfig.clock,
          architecture: theme.clockArchitecture,
          color: theme.accentColor,
        },
      });
    }
  };

  // Custom Wallpaper Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds 25MB limit. Please upload a smaller image or video.');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadError('Unsupported file type. Please upload PNG, JPG, WEBP, GIF, or MP4/WEBM.');
      return;
    }

    setUploadError(null);
    const localUrl = URL.createObjectURL(file);
    setStagedWallpaperUrl(localUrl);
    setStagedCanvasTheme('none');
  };

  // Commit Staging to Dashboard
  const commitChanges = (overrides?: any) => {
    const updates = {
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
      customColors: {
        accent: stagedAccentColor,
        primaryText: stagedPrimaryText,
        secondaryText: stagedSecondaryText,
        surface: stagedSurfaceColor,
      },
      typography: {
        fontClock: stagedFontClock,
        fontHeading: stagedFontHeading,
        fontBody: stagedFontBody,
        fontCountdown: stagedFontCountdown,
        fontLabels: stagedFontLabels,
      },
      clock: {
        ...currentConfig.clock,
        architecture: clockArch,
        color: stagedAccentColor,
        glassBg: stagedWidgetStyle === 'frosted-glass' || stagedWidgetStyle === 'subtle-dark-glass',
      },
      countdown: {
        ...currentConfig.countdown,
        glassBg: stagedWidgetStyle === 'frosted-glass' || stagedWidgetStyle === 'subtle-dark-glass',
      },
      tasks: {
        ...currentConfig.tasks,
        glassBg: stagedWidgetStyle === 'frosted-glass' || stagedWidgetStyle === 'subtle-dark-glass',
      },
      ...overrides,
    };

    onApply(updates);
    onClose();
  };

  // Save current staging as preset
  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: SavedPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
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
        widgetStyle: stagedWidgetStyle as any,
        wallpaperScaling: stagedScaling,
        bgBrightness: stagedBgBrightness,
        bgSaturation: stagedBgSaturation,
        bgDimmer: stagedBgDimmer,
        bgBlur: stagedBgBlur,
        isAnimated: stagedIsAnimated,
        animationIntensity: stagedAnimIntensity,
      },
    };

    const nextPresets = [newPreset, ...savedPresets];
    onUpdatePresets(nextPresets);
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  const handleDeletePreset = (id: string) => {
    onUpdatePresets(savedPresets.filter(p => p.id !== id));
  };

  const handleDuplicatePreset = (preset: SavedPreset) => {
    const dup: SavedPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      name: `${preset.name} (Copy)`,
      createdAt: Date.now(),
    };
    onUpdatePresets([dup, ...savedPresets]);
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
  };

  // Font CSS helper
  const getFontClass = (id: string) => {
    const f = STUDIO_FONTS.find(x => x.id === id);
    return f ? f.cssClass : 'font-inter';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-7xl h-[92vh] rounded-3xl bg-[#080b12] border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        {/* Studio Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white font-['Plus_Jakarta_Sans']">
                  Visual Customization Studio
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Flocus Studio Pro
                </span>
              </div>
              <p className="text-xs text-white/50">
                Interactive real-time previews for themes, architectural typography, atmospheric wallpapers, and widgets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search styles, fonts, themes..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition w-56"
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
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Tabs Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-white/10 bg-black/40 overflow-x-auto">
          <div className="flex items-center gap-1 py-2">
            {[
              { id: 'themes', label: 'Live Themes (10)', icon: Sparkles },
              { id: 'fonts', label: 'Font Studio (10)', icon: Type },
              { id: 'backgrounds', label: 'Wallpapers & FX', icon: ImageIcon },
              { id: 'widgets', label: 'Widget Styles (7)', icon: Layout },
              { id: 'colours', label: 'Colour Palette', icon: Palette },
              { id: 'presets', label: 'Saved Presets', icon: Bookmark },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
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

          <div className="hidden lg:flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Live Engine</span>
          </div>
        </div>

        {/* Studio Body: Split View (Options on Left, Live Preview on Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Options & Studio Controls */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* ================= 1. THEMES GALLERY ================= */}
            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Live Dashboard Themes
                    </h3>
                    <p className="text-xs text-white/50">
                      Curated visual environments with paired typography, clock styles, and atmospheric lighting
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">
                    {filteredThemes.length} Themes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredThemes.map(theme => {
                    const isSelected = stagedThemeId === theme.id;

                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme)}
                        className={`group relative rounded-2xl p-4 border transition duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                        }`}
                      >
                        {/* Miniature Preview Window */}
                        <div
                          className="relative h-28 rounded-xl overflow-hidden border border-white/10 p-2.5 flex flex-col justify-between"
                          style={{
                            backgroundColor: theme.previewBg,
                            backgroundImage: theme.wallpaperUrl ? `url(${theme.wallpaperUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {/* Dimmer overlay */}
                          <div
                            className="absolute inset-0"
                            style={{ backgroundColor: `rgba(0,0,0, ${theme.bgDimmer / 100})` }}
                          />

                          {/* Miniature Widgets in theme */}
                          <div className="relative z-10 flex items-start justify-between">
                            <div
                              className="px-2 py-1 rounded-lg border text-[9px] font-bold tracking-widest uppercase truncate max-w-[140px]"
                              style={{
                                backgroundColor: theme.previewWidgetBg,
                                borderColor: theme.previewWidgetBorder,
                                color: theme.previewText,
                              }}
                            >
                              BK NITHILESHVAR
                            </div>

                            <span
                              className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase"
                              style={{
                                backgroundColor: `${theme.previewAccent}25`,
                                color: theme.previewAccent,
                                border: `1px solid ${theme.previewAccent}40`,
                              }}
                            >
                              {theme.category}
                            </span>
                          </div>

                          <div className="relative z-10 flex items-end justify-between">
                            {/* Miniature Clock */}
                            <div
                              className="text-lg font-black tracking-tight"
                              style={{
                                color: theme.previewAccent,
                                fontFamily: theme.fontClock === 'inter' ? 'Inter' : theme.fontClock === 'anton' ? 'Anton' : 'JetBrains Mono',
                              }}
                            >
                              10:42:36
                            </div>

                            {/* Miniature Countdown Pill */}
                            <div
                              className="px-2 py-0.5 rounded-md border text-[9px] font-mono"
                              style={{
                                backgroundColor: theme.previewWidgetBg,
                                borderColor: theme.previewWidgetBorder,
                                color: theme.previewSecondary,
                              }}
                            >
                              3 Mar 2027 • 137d
                            </div>
                          </div>
                        </div>

                        {/* Theme Details & Actions */}
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{theme.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                            </div>
                            <div className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                              {theme.tagline}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleSelectTheme(theme, true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-[11px] border border-cyan-400/40 transition cursor-pointer"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 2. FONT STYLE GALLERY ================= */}
            {activeTab === 'fonts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Typography Studio & Font Gallery
                    </h3>
                    <p className="text-xs text-white/50">
                      Renders live specimens of clock digits, countdown dates, and study headings in all 10 typefaces
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">{STUDIO_FONTS.length} Typefaces</span>
                </div>

                {/* Specific Element Font Selectors */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Element-Specific Font Assignments</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Clock Digits Font</label>
                      <select
                        value={stagedFontClock}
                        onChange={e => setStagedFontClock(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400 text-xs"
                      >
                        {STUDIO_FONTS.map(f => (
                          <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                            {f.name} ({f.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Headings & Titles</label>
                      <select
                        value={stagedFontHeading}
                        onChange={e => setStagedFontHeading(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400 text-xs"
                      >
                        {STUDIO_FONTS.map(f => (
                          <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                            {f.name} ({f.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Body & Timetable Text</label>
                      <select
                        value={stagedFontBody}
                        onChange={e => setStagedFontBody(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400 text-xs"
                      >
                        {STUDIO_FONTS.map(f => (
                          <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                            {f.name} ({f.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Font Visual Specimen Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFonts.map(font => {
                    const isClockFont = stagedFontClock === font.id;
                    const isHeadingFont = stagedFontHeading === font.id;

                    return (
                      <div
                        key={font.id}
                        className={`p-4 rounded-2xl border transition duration-150 flex flex-col justify-between ${
                          isClockFont || isHeadingFont
                            ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div>
                            <span className="text-xs font-bold text-white">{font.name}</span>
                            <span className="ml-2 text-[10px] text-white/40">{font.category}</span>
                          </div>
                          {(isClockFont || isHeadingFont) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/30">
                              {isClockFont && isHeadingFont ? 'Clock & Headings' : isClockFont ? 'Clock' : 'Headings'}
                            </span>
                          )}
                        </div>

                        {/* Real Visual Specimen Rendered in the Font */}
                        <div className={`py-3 space-y-1.5 ${font.cssClass}`}>
                          <div className="text-2xl font-black tracking-tight text-white">
                            10:42:36
                          </div>
                          <div className="text-xs font-bold tracking-wider uppercase text-cyan-300">
                            PUBLIC EXAM COUNTDOWN
                          </div>
                          <div className="text-xs text-white/80 font-medium">
                            Physics — Study Session (5-Markers & Core Derivations)
                          </div>
                          <div className="text-[11px] text-white/50">
                            Wednesday, 3 March 2027 • Centum Target
                          </div>
                        </div>

                        {/* Quick Selection Buttons */}
                        <div className="pt-2 border-t border-white/5 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setStagedFontClock(font.id)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                              isClockFont
                                ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                            }`}
                          >
                            Set for Clock
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStagedFontHeading(font.id);
                              setStagedFontBody(font.id);
                            }}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                              isHeadingFont
                                ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                            }`}
                          >
                            Set for Headings
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 3. BACKGROUND WALLPAPER GALLERY & FX ================= */}
            {activeTab === 'backgrounds' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Atmospheric Wallpaper Gallery
                    </h3>
                    <p className="text-xs text-white/50">
                      High-resolution visual photography, procedural animation canvases, and live lighting controls
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">
                    {filteredWallpapers.length} Wallpapers
                  </span>
                </div>

                {/* Categories Bar */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 overflow-x-auto">
                  {(['all', 'cinematic', 'nature', 'space', 'minimal'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setWallpaperCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer shrink-0 ${
                        wallpaperCategory === cat
                          ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Wallpaper Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filteredWallpapers.map(wall => {
                    const isSelected = stagedWallpaperUrl === wall.fullUrl;

                    return (
                      <div
                        key={wall.id}
                        onClick={() => {
                          setStagedWallpaperUrl(wall.fullUrl);
                          setStagedCanvasTheme('none');
                        }}
                        className={`group relative aspect-[16/10] rounded-xl overflow-hidden border cursor-pointer transition duration-150 ${
                          isSelected
                            ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                            : 'border-white/10 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={wall.thumbUrl}
                          alt={wall.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[10px] font-semibold text-white truncate drop-shadow-md">
                            {wall.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-xs shadow-md">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Procedural Animated Canvas Options */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Procedural Animated Atmosphere
                      </h4>
                    </div>
                    <span className="text-[10px] text-white/50">Mathematical Live Shaders</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'none', label: 'Photo/None' },
                      { id: 'aurora', label: 'Aurora' },
                      { id: 'nebula', label: 'Cosmic Nebula' },
                      { id: 'cyberpunk', label: 'Cyber Neon' },
                      { id: 'matrix', label: 'Matrix Code' },
                      { id: 'fireflies', label: 'Fireflies' },
                    ].map(fx => (
                      <button
                        key={fx.id}
                        type="button"
                        onClick={() => setStagedCanvasTheme(fx.id as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                          stagedCanvasTheme === fx.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Wallpaper Upload Area */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Custom Wallpaper Upload
                      </h4>
                    </div>
                    <span className="text-[10px] text-white/40">Local Offline Privacy (Max 25MB)</span>
                  </div>

                  {uploadError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device (Image / Video)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStagedWallpaperUrl('');
                        setStagedCanvasTheme('none');
                      }}
                      className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Clear Background
                    </button>
                  </div>
                </div>

                {/* LIVE BACKGROUND ADJUSTMENT PANEL */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Live Lighting & Atmosphere Adjustments
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStagedBgDimmer(30);
                        setStagedBgBlur(0);
                        setStagedBgSaturation(100);
                        setStagedBgBrightness(100);
                        setStagedAnimIntensity(1.0);
                      }}
                      className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Lighting</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Dark Dimmer */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-white/60">Dark Overlay (Contrast)</span>
                        <span className="text-cyan-300 font-mono">{stagedBgDimmer}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={stagedBgDimmer}
                        onChange={e => setStagedBgDimmer(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Blur */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-white/60">Atmospheric Blur</span>
                        <span className="text-cyan-300 font-mono">{stagedBgBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={stagedBgBlur}
                        onChange={e => setStagedBgBlur(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Brightness */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-white/60">Brightness Level</span>
                        <span className="text-cyan-300 font-mono">{stagedBgBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={stagedBgBrightness}
                        onChange={e => setStagedBgBrightness(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-white/60">Color Saturation</span>
                        <span className="text-cyan-300 font-mono">{stagedBgSaturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={stagedBgSaturation}
                        onChange={e => setStagedBgSaturation(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-white/60 text-[11px]">Wallpaper Display Scaling:</span>
                    <div className="flex gap-1.5">
                      {(['cover', 'contain', 'fill'] as const).map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setStagedScaling(scale)}
                          className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition ${
                            stagedScaling === scale
                              ? 'bg-cyan-500 text-black'
                              : 'bg-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. WIDGET APPEARANCE GALLERY ================= */}
            {activeTab === 'widgets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Widget Appearance Gallery
                    </h3>
                    <p className="text-xs text-white/50">
                      7 distinct architectural card materials, glass opacities, and border styles
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">
                    {STUDIO_WIDGET_STYLES.length} Styles
                  </span>
                </div>

                {/* Target Scope Pill */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/60">Apply Selected Style To:</span>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'all', label: 'All Widgets' },
                      { id: 'clock', label: 'Clock Only' },
                      { id: 'countdown', label: 'Countdown Only' },
                      { id: 'tasks', label: 'Tasks Only' },
                    ].map(scope => (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setApplyStyleTarget(scope.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                          applyStyleTarget === scope.id
                            ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                        }`}
                      >
                        {scope.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7 Widget Styles Grid with Live Visual Mockups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STUDIO_WIDGET_STYLES.map(style => {
                    const isSelected = stagedWidgetStyle === style.id;

                    return (
                      <div
                        key={style.id}
                        onClick={() => setStagedWidgetStyle(style.id)}
                        className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Sample Widget Representation */}
                        <div
                          className={`p-3.5 rounded-2xl ${style.cssClass} transition duration-200 mb-3`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                              QUICK TASKS
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                              2/3 done
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2 text-white font-medium">
                              <span className="w-3.5 h-3.5 rounded border border-cyan-400 bg-cyan-400 text-black flex items-center justify-center text-[9px] font-bold">✓</span>
                              <span>Review Chemistry Periodic Trends</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <span className="w-3.5 h-3.5 rounded border border-white/30" />
                              <span>Solve 2026 Model Paper</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{style.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                            </div>
                            <div className="text-[11px] text-white/50">{style.tagline}</div>
                          </div>

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setStagedWidgetStyle(style.id);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              isSelected
                                ? 'bg-cyan-500 text-black'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 5. COLOUR PALETTE STUDIO ================= */}
            {activeTab === 'colours' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Colour Palette Studio
                    </h3>
                    <p className="text-xs text-white/50">
                      Curated color harmonies and independent control over accents, text contrast, and surface hues
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">
                    {STUDIO_PALETTES.length} Palettes
                  </span>
                </div>

                {/* Curated Swatch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STUDIO_PALETTES.map(pal => {
                    const isSelected = stagedAccentColor.toLowerCase() === pal.accent.toLowerCase();

                    return (
                      <div
                        key={pal.id}
                        onClick={() => {
                          setStagedAccentColor(pal.accent);
                          setStagedPrimaryText(pal.primaryText);
                          setStagedSecondaryText(pal.secondaryText);
                          setStagedSurfaceColor(pal.surface);
                        }}
                        className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Color Circles */}
                          <div className="flex items-center -space-x-1.5">
                            <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: pal.accent }} />
                            <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: pal.primaryText }} />
                            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.surface }} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{pal.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                            </div>
                            <div className="text-[10px] text-white/50 font-mono mt-0.5">
                              {pal.accent} • {pal.surface}
                            </div>
                          </div>
                        </div>

                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${pal.accent}20`,
                            color: pal.accent,
                            border: `1px solid ${pal.accent}40`,
                          }}
                        >
                          Preview
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Color Pickers */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Independent Custom Color Pickers</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1.5">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedAccentColor}
                          onChange={e => setStagedAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[11px] text-white/80">{stagedAccentColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/60 mb-1.5">Primary Text</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedPrimaryText}
                          onChange={e => setStagedPrimaryText(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[11px] text-white/80">{stagedPrimaryText}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/60 mb-1.5">Secondary Text</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedSecondaryText}
                          onChange={e => setStagedSecondaryText(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[11px] text-white/80">{stagedSecondaryText}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/60 mb-1.5">Surface Tint</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stagedSurfaceColor}
                          onChange={e => setStagedSurfaceColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[11px] text-white/80">{stagedSurfaceColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 6. SAVED PRESETS ================= */}
            {activeTab === 'presets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Saved Custom Presets
                    </h3>
                    <p className="text-xs text-white/50">
                      Save, duplicate, rename, or restore your customized dashboard visual layouts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSavingPreset(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Current as Preset</span>
                  </button>
                </div>

                {/* Save Prompt */}
                {isSavingPreset && (
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 space-y-3">
                    <h4 className="text-xs font-bold text-white">Save Current Styling as New Preset</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newPresetName}
                        onChange={e => setNewPresetName(e.target.value)}
                        placeholder="Preset Name (e.g. Exam Focus, Iron Armor, Deep Midnight)..."
                        className="flex-1 bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        disabled={!newPresetName.trim()}
                        onClick={handleSaveCurrentAsPreset}
                        className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs disabled:opacity-50 transition cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsSavingPreset(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Presets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedPresets.map(preset => (
                    <div
                      key={preset.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        {editingPresetId === preset.id ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingPresetName}
                              onChange={e => setEditingPresetName(e.target.value)}
                              className="bg-black/60 border border-cyan-400 rounded-lg px-2 py-0.5 text-xs text-white flex-1"
                            />
                            <button
                              onClick={() => {
                                onUpdatePresets(
                                  savedPresets.map(p =>
                                    p.id === preset.id ? { ...p, name: editingPresetName.trim() || p.name } : p
                                  )
                                );
                                setEditingPresetId(null);
                              }}
                              className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-bold"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white">{preset.name}</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            title="Rename preset"
                            onClick={() => {
                              setEditingPresetId(preset.id);
                              setEditingPresetName(preset.name);
                            }}
                            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Duplicate preset"
                            onClick={() => handleDuplicatePreset(preset)}
                            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete preset"
                            onClick={() => handleDeletePreset(preset.id)}
                            className="p-1 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5 text-[11px] text-white/50">
                          <div>Theme: {preset.config.activeThemeId}</div>
                          <div>Font: {preset.config.fontClock}</div>
                          <div>Material: {preset.config.widgetStyle}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs border border-cyan-400/40 transition cursor-pointer"
                        >
                          Apply Preset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE DASHBOARD MINIATURE PREVIEW AREA */}
          <div className="w-[380px] xl:w-[440px] border-l border-white/10 bg-black/60 p-5 flex flex-col justify-between hidden lg:flex">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Dashboard Preview
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Real-time Synchronized
                </span>
              </div>

              {/* Miniature Dashboard Canvas Container */}
              <div
                className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-4 flex flex-col justify-between select-none"
                style={{
                  backgroundColor: stagedThemeId === 'minimal-white' ? '#f8fafc' : '#030407',
                  backgroundImage: stagedWallpaperUrl ? `url(${stagedWallpaperUrl})` : undefined,
                  backgroundSize: stagedScaling,
                  backgroundPosition: 'center',
                }}
              >
                {/* Visual filter overlay for brightness, blur, and dark dimmer */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-200"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${stagedBgDimmer / 100})`,
                    backdropFilter: stagedBgBlur > 0 ? `blur(${stagedBgBlur}px)` : undefined,
                    filter: `brightness(${stagedBgBrightness}%) saturate(${stagedBgSaturation}%)`,
                  }}
                />

                {/* 1. Header Name Widget Mockup */}
                <div className="relative z-10 text-center">
                  <div
                    className={`inline-block px-3 py-1 rounded-xl text-center border ${
                      stagedWidgetStyle === 'frosted-glass'
                        ? 'widget-style-frosted-glass'
                        : stagedWidgetStyle === 'transparent'
                        ? 'widget-style-transparent'
                        : 'widget-style-subtle-dark-glass'
                    }`}
                  >
                    <div
                      className={`text-xs font-black tracking-widest uppercase ${getFontClass(stagedFontHeading)}`}
                      style={{ color: stagedPrimaryText }}
                    >
                      BK NITHILESHVAR
                    </div>
                    <div
                      className="text-[8px] font-semibold tracking-wider uppercase mt-0.5"
                      style={{ color: stagedAccentColor }}
                    >
                      Centum Aspirant • Tamil, Chem, Phys, Math
                    </div>
                  </div>
                </div>

                {/* 2. Clock Widget Mockup */}
                <div className="relative z-10 text-center my-auto py-2">
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      stagedWidgetStyle === 'frosted-glass'
                        ? 'widget-style-frosted-glass'
                        : stagedWidgetStyle === 'minimal-flat'
                        ? 'widget-style-minimal-flat'
                        : stagedWidgetStyle === 'transparent'
                        ? 'widget-style-transparent'
                        : 'widget-style-subtle-dark-glass'
                    }`}
                  >
                    <div
                      className={`text-4xl font-extrabold tracking-tight tabular-nums ${getFontClass(stagedFontClock)}`}
                      style={{ color: stagedAccentColor }}
                    >
                      10:42:36
                    </div>
                    <div
                      className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70"
                      style={{ color: stagedSecondaryText }}
                    >
                      WEDNESDAY, OCTOBER 14
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Row: Public Exam Countdown & Routine Alert */}
                <div className="relative z-10 grid grid-cols-2 gap-2 text-[10px]">
                  {/* Exam Countdown */}
                  <div
                    className={`p-2.5 rounded-xl border ${
                      stagedWidgetStyle === 'frosted-glass'
                        ? 'widget-style-frosted-glass'
                        : 'widget-style-subtle-dark-glass'
                    }`}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-white/50 mb-0.5">
                      PUBLIC EXAM
                    </div>
                    <div className="text-sm font-bold font-mono" style={{ color: stagedAccentColor }}>
                      137d Left
                    </div>
                    <div className="text-[9px] text-white/60 truncate">3 March 2027 • Tamil</div>
                  </div>

                  {/* Routine Alert */}
                  <div
                    className={`p-2.5 rounded-xl border ${
                      stagedWidgetStyle === 'frosted-glass'
                        ? 'widget-style-frosted-glass'
                        : 'widget-style-subtle-dark-glass'
                    }`}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400 mb-0.5 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> NOW ACTIVE
                    </div>
                    <div className="text-xs font-semibold text-white truncate">Physics (Derivations)</div>
                    <div className="text-[9px] text-white/60">08:45 PM - 10:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-white/50 space-y-1">
              <div className="flex justify-between">
                <span>Active Theme:</span>
                <span className="text-white font-semibold">{stagedThemeId}</span>
              </div>
              <div className="flex justify-between">
                <span>Clock Font:</span>
                <span className="text-white font-semibold">{stagedFontClock}</span>
              </div>
              <div className="flex justify-between">
                <span>Card Material:</span>
                <span className="text-white font-semibold">{stagedWidgetStyle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#06080e] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              // Reset to clean Flocus default
              handleSelectTheme(STUDIO_THEMES[1]); // Obsidian Glass
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => commitChanges()}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply & Save to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
