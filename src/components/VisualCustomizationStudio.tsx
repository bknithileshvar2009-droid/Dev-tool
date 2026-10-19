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
  Minus,
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
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Target,
  Award,
  Video,
  Grid,
  Move,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Download,
  FileJson,
  Volume2,
  VolumeX,
  Shuffle,
} from 'lucide-react';
import {
  STUDIO_THEMES,
  STUDIO_CLOCK_DESIGNS,
  STUDIO_FONTS,
  STUDIO_WALLPAPERS,
  STUDIO_BACKGROUND_EFFECTS,
  STUDIO_WIDGET_STYLES,
  STUDIO_PALETTES,
  INITIAL_PRESETS,
  ThemeOption,
  ClockDesignOption,
  FontOption,
  WallpaperCategoryItem,
  WallpaperCategoryKey,
  BackgroundEffectOption,
  WidgetStyleOption,
  ColorPaletteOption,
  SavedPreset,
  DEFAULT_STUDIO_CONFIG,
  CustomTextItem,
  ElementTypographyConfig,
  DashboardTypographyConfig,
  DEFAULT_ELEMENT_TYPOGRAPHY,
  N0T0StyleOption,
  N0T0_TYPOGRAPHY_STYLES,
  CanvasThemeType,
  WidgetSpecificStyle,
  DashboardWidgetStyles,
  AnimationControlsConfig,
} from '../utils/visualStudioData';
import {
  STUDIO_LAYOUT_ARRANGEMENTS,
  computePresetWidgetCoordinates,
  LayoutPresetOption,
  DashboardWidgetKey,
} from '../utils/layoutPresetsData';

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

// 6 Organized Primary Studio Sections
export type StudioSection =
  | 'appearance'
  | 'widget-styles'
  | 'arrange-layout'
  | 'freeform-editor'
  | 'typography'
  | 'advanced';

const ALL_WIDGET_KEYS: { id: DashboardWidgetKey; label: string; icon: any }[] = [
  { id: 'clock', label: 'Master Clock', icon: ClockIcon },
  { id: 'countdown', label: 'Exam Countdown', icon: Target },
  { id: 'nameWidget', label: 'Centum Student Title', icon: Award },
  { id: 'tasks', label: 'Target Checklist', icon: CheckCircle2 },
  { id: 'notification', label: 'Routine Schedule', icon: Calendar },
  { id: 'calendar', label: 'Monthly Calendar', icon: Calendar },
  { id: 'motivation', label: 'Daily Motivation', icon: Sparkles },
  { id: 'pomodoro', label: 'Pomodoro Focus Timer', icon: Zap },
  { id: 'scratchpad', label: 'Daily Register & Notes', icon: StickyNote },
];

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
  // Primary Reorganized Tab Navigation
  const [activeTab, setActiveTab] = useState<StudioSection>('appearance');
  const [searchQuery, setSearchQuery] = useState('');

  // Sub-navigation inside Appearance tab
  const [appearanceSubTab, setAppearanceSubTab] = useState<'themes' | 'animation' | 'wallpapers' | 'clocks'>('themes');
  const [themeFilter, setThemeFilter] = useState<'all' | 'dark' | 'light' | 'cinematic' | 'nature' | 'space' | 'minimal'>('all');
  const [clockCategoryFilter, setClockCategoryFilter] = useState<'all' | 'shapes' | 'retro' | 'flip' | 'digital' | 'analog' | 'specialized'>('all');
  const [layoutCategoryFilter, setLayoutCategoryFilter] = useState<string>('all');

  // Widget Styles State
  const [selectedStyleWidget, setSelectedStyleWidget] = useState<string>('global'); // 'global' or widget key

  // Freeform Editor State
  const [selectedFreeformWidget, setSelectedFreeformWidget] = useState<DashboardWidgetKey>('clock');

  // Confirmation Modal State (for removing / hiding widgets or resetting)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Wallpaper Gallery State
  const [wallpaperCategory, setWallpaperCategory] = useState<WallpaperCategoryKey>('all');
  const [wallpaperSearch, setWallpaperSearch] = useState<string>('');
  const [wallpaperPage, setWallpaperPage] = useState<number>(1);
  const [showAllWallpapers, setShowAllWallpapers] = useState<boolean>(false);
  const [favoriteWallpaperIds, setFavoriteWallpaperIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flocus_favorite_wallpapers');
      return saved ? JSON.parse(saved) : ['jp-tokyo-cyberpunk', 'art-anime-cherry-blossom', 'kr-seoul-night', 'cn-misty-mountains'];
    } catch {
      return ['jp-tokyo-cyberpunk', 'art-anime-cherry-blossom', 'kr-seoul-night', 'cn-misty-mountains'];
    }
  });
  const [uploadedWallpapers, setUploadedWallpapers] = useState<WallpaperCategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('flocus_custom_uploaded_wallpapers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Staging State (Preview Before Commit)
  const [stagedThemeId, setStagedThemeId] = useState<string>(
    currentConfig.activeThemeId || currentConfig.activeWallpaper || 'obsidian-glass'
  );
  const [stagedWallpaperUrl, setStagedWallpaperUrl] = useState<string>(
    currentConfig.wallpaperUrl || '/wallpapers/jp_tokyo_cyberpunk.jpg'
  );
  const [stagedVideoUrl, setStagedVideoUrl] = useState<string>(currentConfig.videoUrl || '');
  const [stagedCanvasTheme, setStagedCanvasTheme] = useState<CanvasThemeType>(currentConfig.canvasTheme || 'minimal');
  const [stagedBgDimmer, setStagedBgDimmer] = useState<number>(currentConfig.bgDimmer ?? 35);
  const [stagedBgBlur, setStagedBgBlur] = useState<number>(currentConfig.bgBlur ?? 0);
  const [stagedBgSaturation, setStagedBgSaturation] = useState<number>(currentConfig.bgSaturation ?? 100);
  const [stagedBgBrightness, setStagedBgBrightness] = useState<number>(currentConfig.bgBrightness ?? 100);
  const [stagedScaling, setStagedScaling] = useState<'cover' | 'contain' | 'fill'>(currentConfig.wallpaperScaling || 'cover');

  // Animation Controls Staging
  const [stagedAnimEnabled, setStagedAnimEnabled] = useState<boolean>(
    currentConfig.animationControls?.enabled !== false && !currentConfig.isWallpaperStatic
  );
  const [stagedAnimIntensity, setStagedAnimIntensity] = useState<'low' | 'medium' | 'high'>(
    currentConfig.animationControls?.intensity || 'medium'
  );
  const [stagedAnimSpeed, setStagedAnimSpeed] = useState<number>(currentConfig.animationControls?.speed ?? 1.0);
  const [stagedEnergyColor, setStagedEnergyColor] = useState<string>(
    currentConfig.animationControls?.energyColor || '#06b6d4'
  );
  const [stagedEnergyIntensity, setStagedEnergyIntensity] = useState<number>(
    currentConfig.animationControls?.energyIntensity ?? 70
  );

  // Widget Dynamic Styles Staging
  const initialGlobalStyle: WidgetSpecificStyle = {
    bgColor: currentConfig.widgetStyles?.global?.bgColor || currentConfig.customColors?.surface || '#0c1a14',
    bgOpacity: currentConfig.widgetStyles?.global?.bgOpacity ?? 82,
    blur: currentConfig.widgetStyles?.global?.blur ?? 18,
    borderColor: currentConfig.widgetStyles?.global?.borderColor || currentConfig.customColors?.accent || '#10b981',
    borderWidth: currentConfig.widgetStyles?.global?.borderWidth ?? 1,
    borderRadius: currentConfig.widgetStyles?.global?.borderRadius ?? 20,
    shadowColor: currentConfig.widgetStyles?.global?.shadowColor || 'rgba(0,0,0,0.6)',
    shadowBlur: currentConfig.widgetStyles?.global?.shadowBlur ?? 25,
    glowColor: currentConfig.widgetStyles?.global?.glowColor || '#10b981',
    glowIntensity: currentConfig.widgetStyles?.global?.glowIntensity ?? 30,
    textColor: currentConfig.widgetStyles?.global?.textColor || '#ffffff',
    accentColor: currentConfig.widgetStyles?.global?.accentColor || '#10b981',
    padding: currentConfig.widgetStyles?.global?.padding ?? 16,
  };

  const [stagedGlobalStyle, setStagedGlobalStyle] = useState<WidgetSpecificStyle>(initialGlobalStyle);
  const [stagedWidgetOverrides, setStagedWidgetOverrides] = useState<Record<string, WidgetSpecificStyle>>(
    currentConfig.widgetStyles?.overrides || {}
  );

  // Layout & Freeform Staging
  const [stagedLayoutMode, setStagedLayoutMode] = useState<'grid' | 'freeform'>(currentConfig.layoutMode || 'grid');
  const [stagedGridPresetId, setStagedGridPresetId] = useState<string>(
    currentConfig.selectedGridPresetId || 'preset-grid-1'
  );
  const [stagedGridGap, setStagedGridGap] = useState<number>(currentConfig.gridGaps ?? 16);
  const [stagedGridMargin, setStagedGridMargin] = useState<number>(currentConfig.gridMargins ?? 24);
  const [stagedGridAlignment, setStagedGridAlignment] = useState<'center' | 'top' | 'stretch'>(
    currentConfig.gridAlignment || 'center'
  );

  // Freeform Staged Positions & Dimensions
  const [stagedFreeformLayout, setStagedFreeformLayout] = useState<
    Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }>
  >(() => {
    if (currentConfig.freeformLayout && Object.keys(currentConfig.freeformLayout).length > 0) {
      return currentConfig.freeformLayout;
    }
    const layout: Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }> = {};
    ALL_WIDGET_KEYS.forEach(k => {
      const w = (currentConfig as any)[k.id];
      layout[k.id] = {
        x: w?.x ?? 50,
        y: w?.y ?? 50,
        width: w?.width ?? 360,
        height: w?.height ?? 160,
        zIndex: w?.zIndex ?? 20,
      };
    });
    return layout;
  });

  const [stagedSnapToGrid, setStagedSnapToGrid] = useState<boolean>(currentConfig.snapToGrid ?? false);
  const [stagedSnapSize, setStagedSnapSize] = useState<number>(currentConfig.snapGridSize ?? 20);

  // Widget Visibility Staging
  const [stagedVisibility, setStagedVisibility] = useState<Record<string, boolean>>({
    clock: currentConfig.clock?.visible !== false,
    countdown: currentConfig.countdown?.visible !== false,
    nameWidget: currentConfig.nameWidget?.visible !== false,
    tasks: currentConfig.tasks?.visible !== false,
    notification: currentConfig.notification?.visible !== false,
    calendar: currentConfig.calendar?.visible !== false,
    motivation: currentConfig.motivation?.visible !== false,
    pomodoro: currentConfig.pomodoro?.visible !== false,
    scratchpad: (currentConfig as any).scratchpad?.visible !== false,
  });

  // Typography Staging
  const [stagedTypography, setStagedTypography] = useState<DashboardTypographyConfig>(
    currentConfig.typography || {
      globalScale: 1.0,
      elements: DEFAULT_ELEMENT_TYPOGRAPHY,
      fontClock: 'orbitron',
      fontHeading: 'orbitron',
      fontBody: 'rajdhani',
      fontCountdown: 'orbitron',
      fontLabels: 'inter',
    }
  );
  const [selectedTypoElement, setSelectedTypoElement] = useState<string>('clockMain');

  // Clock Architecture Staging
  const [stagedClockArch, setStagedClockArch] = useState<string>(currentConfig.clock?.architecture || 'minimal');

  // History Stack for Undo / Redo
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Preset Creation Modal
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Search Filtering for Themes and Presets
  const filteredThemes = useMemo(() => {
    return STUDIO_THEMES.filter(theme => {
      const matchesSearch =
        searchQuery === '' ||
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = themeFilter === 'all' || theme.category === themeFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, themeFilter]);

  const filteredGridPresets = useMemo(() => {
    return STUDIO_LAYOUT_ARRANGEMENTS.filter(preset => {
      const matchesSearch =
        searchQuery === '' ||
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.badge.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = layoutCategoryFilter === 'all' || preset.category === layoutCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, layoutCategoryFilter]);

  // Handle Theme Selection with Instant Dynamic Overhaul
  const handleSelectTheme = (theme: ThemeOption) => {
    setStagedThemeId(theme.id);
    setStagedWallpaperUrl(theme.wallpaperUrl);
    setStagedCanvasTheme(theme.canvasTheme);
    setStagedBgDimmer(theme.bgDimmer);
    setStagedBgBlur(theme.bgBlur);
    setStagedBgSaturation(theme.bgSaturation);
    setStagedBgBrightness(theme.bgBrightness);
    setStagedClockArch(theme.clockArchitecture);
    setStagedAnimEnabled(theme.isAnimated ?? true);
    setStagedAnimIntensity(theme.animationIntensity ? (theme.animationIntensity > 1.2 ? 'high' : theme.animationIntensity < 0.8 ? 'low' : 'medium') : 'medium');
    setStagedAnimSpeed(theme.animationSpeed ?? 1.0);
    setStagedEnergyColor(theme.energyColor || theme.accentColor);

    // Apply coordinated global widget styling default
    if (theme.defaultWidgetStyle) {
      setStagedGlobalStyle({
        ...stagedGlobalStyle,
        ...theme.defaultWidgetStyle,
      });
    } else {
      setStagedGlobalStyle({
        ...stagedGlobalStyle,
        bgColor: theme.surfaceColor,
        borderColor: theme.accentColor,
        glowColor: theme.accentColor,
        accentColor: theme.accentColor,
      });
    }

    setStagedTypography(prev => ({
      ...prev,
      fontClock: theme.fontClock,
      fontHeading: theme.fontHeading,
      fontBody: theme.fontBody,
    }));
  };

  const filteredClocks = useMemo(() => {
    return STUDIO_CLOCK_DESIGNS.filter(clock => {
      const matchesSearch =
        searchQuery === '' ||
        clock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clock.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clock.badge.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = clockCategoryFilter === 'all' || clock.category === clockCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, clockCategoryFilter]);

  // Filtered Wallpapers Computation
  const allWallpapersPool = useMemo(() => {
    return [...uploadedWallpapers, ...STUDIO_WALLPAPERS];
  }, [uploadedWallpapers]);

  const filteredWallpapers = useMemo(() => {
    return allWallpapersPool.filter(wp => {
      // Category filter
      if (wallpaperCategory === 'favorites') {
        if (!favoriteWallpaperIds.includes(wp.id)) return false;
      } else if (wallpaperCategory === 'uploads') {
        if (!wp.id.startsWith('upload-')) return false;
      } else if (wallpaperCategory === 'local') {
        if (!wp.isLocal) return false;
      } else if (wallpaperCategory !== 'all') {
        if (wp.category !== wallpaperCategory) return false;
      }

      // Search filter
      if (wallpaperSearch.trim() !== '') {
        const query = wallpaperSearch.toLowerCase().trim();
        const matchesTitle = wp.title.toLowerCase().includes(query);
        const matchesCategory = wp.category.toLowerCase().includes(query);
        const matchesSub = wp.subCategory ? wp.subCategory.toLowerCase().includes(query) : false;
        const matchesTag = wp.tags.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesCategory || matchesSub || matchesTag;
      }

      return true;
    });
  }, [allWallpapersPool, wallpaperCategory, wallpaperSearch, favoriteWallpaperIds]);

  // Immediate Wallpaper Application handler
  const handleApplyWallpaperImmediate = (item: { fullUrl: string; id: string; title: string }) => {
    setStagedWallpaperUrl(item.fullUrl);
    setStagedVideoUrl('');
    // Immediately apply to parent dashboard and persist!
    onApply({
      wallpaperUrl: item.fullUrl,
      activeWallpaper: item.id,
      videoUrl: '',
    });
  };

  const handleToggleFavoriteWallpaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteWallpaperIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('flocus_favorite_wallpapers', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleShuffleWallpaper = () => {
    const pool = filteredWallpapers.length > 0 ? filteredWallpapers : allWallpapersPool;
    if (pool.length === 0) return;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    handleApplyWallpaperImmediate(randomItem);
  };

  const handleUploadWallpaperFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      const newUpload: WallpaperCategoryItem = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: 'study',
        subCategory: 'User Device Upload',
        tags: ['custom', 'upload', 'device', 'my'],
        thumbUrl: dataUrl,
        fullUrl: dataUrl,
        isLocal: true,
        resolution: 'User Device Image',
        aspectRatio: 'Custom',
        format: 'png',
      };
      const nextUploads = [newUpload, ...uploadedWallpapers];
      setUploadedWallpapers(nextUploads);
      try {
        localStorage.setItem('flocus_custom_uploaded_wallpapers', JSON.stringify(nextUploads.slice(0, 10)));
      } catch {}
      handleApplyWallpaperImmediate(newUpload);
    };
    reader.readAsDataURL(file);
  };

  // Helper to get active editing style (global or per-widget override)
  const currentEditingStyle = useMemo(() => {
    if (selectedStyleWidget === 'global') {
      return stagedGlobalStyle;
    }
    return stagedWidgetOverrides[selectedStyleWidget] || stagedGlobalStyle;
  }, [selectedStyleWidget, stagedGlobalStyle, stagedWidgetOverrides]);

  // Update style property for current target
  const updateCurrentStyle = (patch: Partial<WidgetSpecificStyle>) => {
    if (selectedStyleWidget === 'global') {
      setStagedGlobalStyle(prev => ({ ...prev, ...patch }));
    } else {
      setStagedWidgetOverrides(prev => ({
        ...prev,
        [selectedStyleWidget]: {
          ...(prev[selectedStyleWidget] || stagedGlobalStyle),
          ...patch,
        },
      }));
    }
  };

  // Reset selected widget to global theme default
  const handleResetWidgetToDefault = (widgetKey: string) => {
    setStagedWidgetOverrides(prev => {
      const next = { ...prev };
      delete next[widgetKey];
      return next;
    });
  };

  // Apply current widget override to all widgets
  const handleApplyCurrentStyleToAll = () => {
    setStagedGlobalStyle(currentEditingStyle);
    setStagedWidgetOverrides({});
  };

  // Save changes and commit to live dashboard
  const handleSaveAndApply = () => {
    const computedGridCoordinates = computePresetWidgetCoordinates(
      STUDIO_LAYOUT_ARRANGEMENTS.find(p => p.id === stagedGridPresetId) || STUDIO_LAYOUT_ARRANGEMENTS[0],
      window.innerWidth,
      window.innerHeight,
      stagedGridGap,
      stagedGridMargin
    );

    const updates: any = {
      activeThemeId: stagedThemeId,
      wallpaperUrl: stagedWallpaperUrl,
      videoUrl: stagedVideoUrl,
      canvasTheme: stagedCanvasTheme,
      bgDimmer: stagedBgDimmer,
      bgBlur: stagedBgBlur,
      bgSaturation: stagedBgSaturation,
      bgBrightness: stagedBgBrightness,
      wallpaperScaling: stagedScaling,
      layoutMode: stagedLayoutMode,
      selectedGridPresetId: stagedGridPresetId,
      gridGaps: stagedGridGap,
      gridMargins: stagedGridMargin,
      gridAlignment: stagedGridAlignment,
      snapToGrid: stagedSnapToGrid,
      snapGridSize: stagedSnapSize,
      freeformLayout: stagedFreeformLayout,
      gridLayout: computedGridCoordinates,
      animationControls: {
        enabled: stagedAnimEnabled,
        intensity: stagedAnimIntensity,
        speed: stagedAnimSpeed,
        energyColor: stagedEnergyColor,
        focalPosition: 'center',
        characterScale: 100,
        dimmer: stagedBgDimmer,
        overlayOpacity: 70,
      },
      widgetStyles: {
        global: stagedGlobalStyle,
        overrides: stagedWidgetOverrides,
      },
      clock: {
        ...currentConfig.clock,
        architecture: stagedClockArch,
        visible: stagedVisibility.clock,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.clock
          ? computedGridCoordinates.clock
          : stagedFreeformLayout.clock || {}),
      },
      countdown: {
        ...currentConfig.countdown,
        visible: stagedVisibility.countdown,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.countdown
          ? computedGridCoordinates.countdown
          : stagedFreeformLayout.countdown || {}),
      },
      nameWidget: {
        ...currentConfig.nameWidget,
        visible: stagedVisibility.nameWidget,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.nameWidget
          ? computedGridCoordinates.nameWidget
          : stagedFreeformLayout.nameWidget || {}),
      },
      tasks: {
        ...currentConfig.tasks,
        visible: stagedVisibility.tasks,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.tasks
          ? computedGridCoordinates.tasks
          : stagedFreeformLayout.tasks || {}),
      },
      notification: {
        ...currentConfig.notification,
        visible: stagedVisibility.notification,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.notification
          ? computedGridCoordinates.notification
          : stagedFreeformLayout.notification || {}),
      },
      calendar: {
        ...currentConfig.calendar,
        visible: stagedVisibility.calendar,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.calendar
          ? computedGridCoordinates.calendar
          : stagedFreeformLayout.calendar || {}),
      },
      motivation: {
        ...currentConfig.motivation,
        visible: stagedVisibility.motivation,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.motivation
          ? computedGridCoordinates.motivation
          : stagedFreeformLayout.motivation || {}),
      },
      pomodoro: {
        ...currentConfig.pomodoro,
        visible: stagedVisibility.pomodoro,
        ...(stagedLayoutMode === 'grid' && computedGridCoordinates.pomodoro
          ? computedGridCoordinates.pomodoro
          : stagedFreeformLayout.pomodoro || {}),
      },
      scratchpad: {
        ...(currentConfig as any).scratchpad,
        visible: stagedVisibility.scratchpad,
        ...(stagedLayoutMode === 'grid' && (computedGridCoordinates as any).scratchpad
          ? (computedGridCoordinates as any).scratchpad
          : (stagedFreeformLayout as any).scratchpad || {}),
      },
      typography: stagedTypography,
      customColors: {
        accent: stagedGlobalStyle.accentColor || '#10b981',
        primaryText: stagedGlobalStyle.textColor || '#ffffff',
        secondaryText: '#cbd5e1',
        surface: stagedGlobalStyle.bgColor || '#0c1a14',
      },
    };

    onApply(updates);
    onClose();
  };

  // Revert / Cancel without saving
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-5 overflow-hidden select-none">
      <div className="w-full max-w-7xl h-[94vh] rounded-3xl bg-[#060911] border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* ================= STUDIO TOP BAR ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white font-['Plus_Jakarta_Sans']">
                  Dashboard Studio & Visual Architect
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Doctor Doom & Iron Man Ready
                </span>
                <span className="hidden sm:inline-block text-[10px] text-white/50 font-mono">
                  (50 Grid Arrangements)
                </span>
              </div>
              <p className="text-xs text-white/50 line-clamp-1">
                Cinematic animated character themes, 50 numbered layout presets, dynamic widget styler & freeform precision
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
                placeholder="Search themes, 50 presets, fonts..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition w-56 lg:w-64"
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

            {/* Cancel & Save Action Buttons */}
            <button
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>

        {/* ================= 6 CLEAR PRIMARY TABS ================= */}
        <div className="flex items-center justify-between px-6 border-b border-white/10 bg-black/40 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-2.5">
            {[
              { id: 'appearance', label: '1. Appearance & Animated Themes', icon: Shield },
              { id: 'widget-styles', label: '2. Widget Styles', icon: Layers },
              { id: 'arrange-layout', label: '3. Arrange Layout (50 Presets)', icon: Grid },
              { id: 'freeform-editor', label: '4. Freeform Editor', icon: Move },
              { id: 'typography', label: '5. Typography Studio', icon: Type },
              { id: 'advanced', label: '6. Advanced Settings', icon: SlidersHorizontal },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as StudioSection)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.18)]'
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

        {/* ================= MAIN STUDIO BODY (SPLIT VIEW) ================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Options & Studio Controls */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* ================= TAB 1: APPEARANCE & ANIMATED THEMES ================= */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* Sub-Tabs for Appearance */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                    {[
                      { id: 'themes', label: 'Themes' },
                      { id: 'animation', label: 'Atmosphere & Glow' },
                      { id: 'wallpapers', label: 'Wallpapers & Video' },
                      { id: 'clocks', label: 'Clock Designs (58+ Styles)' },
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setAppearanceSubTab(st.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                          appearanceSubTab === st.id
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {appearanceSubTab === 'themes' && (
                    <div className="flex items-center gap-1 overflow-x-auto text-xs">
                      {(['all', 'dark', 'light', 'cinematic', 'nature', 'space', 'minimal'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setThemeFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                            themeFilter === cat
                              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                              : 'bg-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-Tab Content: Themes Gallery */}
                {appearanceSubTab === 'themes' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredThemes.map(theme => {
                        const isSelected = stagedThemeId === theme.id;
                        const isSpecialHero =
                          theme.id === 'hero-doctor-doom' ||
                          theme.id === 'hero-iron-man' ||
                          theme.id === 'hero-doom-vs-ironman' ||
                          theme.id === 'hero-civil-war';

                        return (
                          <div
                            key={theme.id}
                            onClick={() => handleSelectTheme(theme)}
                            className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${
                              isSelected
                                ? 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                                : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                                    {theme.name}
                                  </h4>
                                  {isSpecialHero && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                      ANIMATED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                                  {theme.tagline}
                                </p>
                              </div>
                              <div
                                className="w-5 h-5 rounded-full border border-white/20 shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: theme.accentColor }}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </div>
                            </div>

                            {/* Theme Palette Swatch Preview */}
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                              <span className="text-[10px] text-white/40 font-mono">Palette:</span>
                              <div className="flex items-center gap-1">
                                <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: theme.surfaceColor }} />
                                <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: theme.accentColor }} />
                                <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: theme.secondaryTextColor }} />
                              </div>
                              <span className="ml-auto text-[10px] text-white/40 font-mono capitalize">
                                {theme.canvasTheme}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Tab Content: Animation & Atmospheric Controls */}
                {appearanceSubTab === 'animation' && (
                  <div className="space-y-6 max-w-3xl">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Atmospheric Background Animation
                          </h4>
                          <p className="text-xs text-white/50">
                            Controls real-time canvas energy, embers, sparks, and character lighting
                          </p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stagedAnimEnabled}
                            onChange={e => setStagedAnimEnabled(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-emerald-300">
                            {stagedAnimEnabled ? 'Animation ON' : 'Animation OFF'}
                          </span>
                        </label>
                      </div>

                      {/* Animation Intensity & Speed */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-white/70">
                            Particle Intensity:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as const).map(lvl => (
                              <button
                                key={lvl}
                                onClick={() => setStagedAnimIntensity(lvl)}
                                className={`py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer border ${
                                  stagedAnimIntensity === lvl
                                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-white/70">
                            <span>Animation Speed:</span>
                            <span className="font-mono text-emerald-300 font-bold">{stagedAnimSpeed}x</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[0.5, 1.0, 1.5, 2.0].map(spd => (
                              <button
                                key={spd}
                                onClick={() => setStagedAnimSpeed(spd)}
                                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                                  stagedAnimSpeed === spd
                                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Energy Color & Character Position */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-white/70">
                            <span>Energy Rune & Arc Color:</span>
                            <span className="font-mono text-emerald-300">{stagedEnergyColor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={stagedEnergyColor}
                              onChange={e => setStagedEnergyColor(e.target.value)}
                              className="w-9 h-9 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                            />
                            <div className="flex items-center gap-1.5">
                              {['#10b981', '#00f0ff', '#ef4444', '#fbbf24', '#a855f7', '#ffffff'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => setStagedEnergyColor(c)}
                                  className="w-6 h-6 rounded-lg border border-white/20 transition cursor-pointer hover:scale-110"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-white/70">
                            Atmospheric Flow Intensity:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['low', 'medium', 'high'] as const).map(lvl => (
                              <button
                                key={lvl}
                                onClick={() => setStagedAnimIntensity(lvl)}
                                className={`py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer border ${
                                  stagedAnimIntensity === lvl
                                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Background Dimming & Blur Sliders */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Canvas Visibility & Legibility Scrim
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-white/70">
                            <span>Background Dimmer:</span>
                            <span className="font-mono text-emerald-300 font-bold">{stagedBgDimmer}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={stagedBgDimmer}
                            onChange={e => setStagedBgDimmer(Number(e.target.value))}
                            className="w-full accent-emerald-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-white/70">
                            <span>Background Blur:</span>
                            <span className="font-mono text-emerald-300 font-bold">{stagedBgBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={stagedBgBlur}
                            onChange={e => setStagedBgBlur(Number(e.target.value))}
                            className="w-full accent-emerald-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab Content: Wallpapers & Video — Comprehensive 5,000+ Ready Gallery */}
                {appearanceSubTab === 'wallpapers' && (
                  <div className="space-y-4">
                    {/* Top Action & Search Bar */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Asian Aesthetic & Study Wallpaper Gallery
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {filteredWallpapers.length} Wallpapers Available
                          </span>
                        </div>

                        {/* Top Quick Actions: Random & Upload */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleShuffleWallpaper}
                            title="Shuffle & Apply Random Wallpaper"
                            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span>Random Wallpaper</span>
                          </button>

                          <label
                            title="Upload Wallpaper Image from your Device"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadWallpaperFile}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={wallpaperSearch}
                          onChange={e => {
                            setWallpaperSearch(e.target.value);
                            setWallpaperPage(1);
                          }}
                          placeholder="Search wallpapers (e.g., Tokyo, Seoul, Lantern, Rain, Fuji, Study Desk, Cyberpunk)..."
                          className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                        />
                        {wallpaperSearch && (
                          <button
                            onClick={() => setWallpaperSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                        {[
                          { id: 'all', label: `All (${allWallpapersPool.length})` },
                          { id: 'japanese', label: 'Japanese Aesthetic' },
                          { id: 'korean', label: 'Korean Aesthetic' },
                          { id: 'chinese', label: 'Chinese Aesthetic' },
                          { id: 'anime', label: 'Anime & Vector' },
                          { id: 'cyberpunk', label: 'Cyberpunk' },
                          { id: 'study', label: 'Cozy Study' },
                          { id: 'nature', label: 'Nature' },
                          { id: 'space', label: 'Space' },
                          { id: 'local', label: '⚡ Offline Local' },
                          { id: 'favorites', label: `★ Favorites (${favoriteWallpaperIds.length})` },
                          { id: 'uploads', label: `Uploads (${uploadedWallpapers.length})` },
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setWallpaperCategory(cat.id as any);
                              setWallpaperPage(1);
                            }}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition cursor-pointer ${
                              wallpaperCategory === cat.id
                                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-white/5 text-white/50 hover:text-white border border-white/5 hover:border-white/10'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Responsive Wallpaper Thumbnail Grid */}
                    {filteredWallpapers.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/10">
                        <p className="text-xs text-white/60">No wallpapers found matching your filter or search query.</p>
                        <button
                          onClick={() => {
                            setWallpaperCategory('all');
                            setWallpaperSearch('');
                          }}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                          {(showAllWallpapers ? filteredWallpapers : filteredWallpapers.slice((wallpaperPage - 1) * 12, wallpaperPage * 12)).map(item => {
                            const isCurrentActive =
                              stagedWallpaperUrl === item.fullUrl || currentConfig.wallpaperUrl === item.fullUrl;
                            const isFav = favoriteWallpaperIds.includes(item.id);

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleApplyWallpaperImmediate(item)}
                                title={`Click to Apply: ${item.title}`}
                                className={`group relative rounded-2xl overflow-hidden border aspect-video cursor-pointer transition-all duration-300 select-none ${
                                  isCurrentActive
                                    ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                                    : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                                }`}
                              >
                                <img
                                  src={item.thumbUrl || item.fullUrl}
                                  alt={item.title}
                                  loading="lazy"
                                  onError={e => {
                                    // Graceful fallback to local SVG if thumbnail ever has network issue
                                    (e.target as HTMLImageElement).src = '/wallpapers/art_anime_cherry_blossom.svg';
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2.5 pointer-events-none">
                                  {/* Top Badges: Active & Favorite */}
                                  <div className="flex items-center justify-between pointer-events-auto">
                                    {isCurrentActive ? (
                                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        <span>ACTIVE</span>
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white/70 uppercase">
                                        {item.format || 'HD'}
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={e => handleToggleFavoriteWallpaper(item.id, e)}
                                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                      className={`p-1 rounded-lg backdrop-blur-sm transition cursor-pointer ${
                                        isFav
                                          ? 'bg-amber-400/30 text-amber-300 border border-amber-400/40'
                                          : 'bg-black/50 text-white/40 hover:text-white border border-white/10'
                                      }`}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                                    </button>
                                  </div>

                                  {/* Bottom Title & Tags */}
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 text-white/90 uppercase font-semibold">
                                        {item.category}
                                      </span>
                                      {item.isLocal && (
                                        <span className="text-[9px] text-cyan-300 font-mono font-medium">⚡ Offline</span>
                                      )}
                                    </div>
                                    <span className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition">
                                      {item.title}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination & Show All Controls */}
                        {filteredWallpapers.length > 12 && (
                          <div className="flex items-center justify-between pt-2 px-1 text-xs">
                            <span className="text-white/50 text-[11px]">
                              Showing {showAllWallpapers ? filteredWallpapers.length : Math.min(filteredWallpapers.length, 12)} of {filteredWallpapers.length} wallpapers
                            </span>

                            <div className="flex items-center gap-2">
                              {!showAllWallpapers && Math.ceil(filteredWallpapers.length / 12) > 1 && (
                                <div className="flex items-center gap-1">
                                  <button
                                    disabled={wallpaperPage === 1}
                                    onClick={() => setWallpaperPage(p => Math.max(1, p - 1))}
                                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white text-[11px]"
                                  >
                                    Previous
                                  </button>
                                  <span className="px-2 font-mono text-[11px] text-emerald-300">
                                    {wallpaperPage} / {Math.ceil(filteredWallpapers.length / 12)}
                                  </span>
                                  <button
                                    disabled={wallpaperPage >= Math.ceil(filteredWallpapers.length / 12)}
                                    onClick={() => setWallpaperPage(p => p + 1)}
                                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white text-[11px]"
                                  >
                                    Next
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => setShowAllWallpapers(p => !p)}
                                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                              >
                                {showAllWallpapers ? 'Show Paginated' : 'Show All Wallpapers'}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Custom Direct URL & Video Input Section */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 mt-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                        <span>Direct Custom Wallpaper or Video Loop URL</span>
                        <span className="text-[10px] text-white/40 lowercase font-normal">supports .jpg, .png, .webp, .mp4</span>
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={stagedVideoUrl || stagedWallpaperUrl}
                          onChange={e => {
                            const val = e.target.value;
                            if (val.endsWith('.mp4') || val.endsWith('.webm')) {
                              setStagedVideoUrl(val);
                            } else {
                              setStagedWallpaperUrl(val);
                            }
                          }}
                          placeholder="Paste direct image or loopable .mp4 / .webm video URL..."
                          className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (stagedVideoUrl) {
                              onApply({ videoUrl: stagedVideoUrl });
                            } else if (stagedWallpaperUrl) {
                              onApply({ wallpaperUrl: stagedWallpaperUrl, videoUrl: '' });
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition cursor-pointer"
                        >
                          Apply URL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab Content: Clock Architecture (58+ Designs) */}
                {appearanceSubTab === 'clocks' && (
                  <div className="space-y-4">
                    {/* Clock Category Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                      {[
                        { id: 'all', label: 'All 58+ Designs' },
                        { id: 'shapes', label: 'Shapes (Hex, Round, Box)' },
                        { id: 'retro', label: 'Retro & 80s' },
                        { id: 'flip', label: 'Flip & Mechanical' },
                        { id: 'digital', label: 'Digital Modern' },
                        { id: 'analog', label: 'Analog Dials' },
                        { id: 'specialized', label: 'Specialized & Gauges' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setClockCategoryFilter(cat.id as any)}
                          className={`px-3 py-1.5 rounded-xl uppercase tracking-wider text-[10px] font-bold transition shrink-0 cursor-pointer ${
                            clockCategoryFilter === cat.id
                              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredClocks.map(arch => (
                        <div
                          key={arch.id}
                          onClick={() => setStagedClockArch(arch.id)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between group ${
                            stagedClockArch === arch.id
                              ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                              : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                                {arch.name}
                              </h4>
                              <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5">
                                {arch.description}
                              </p>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase shrink-0 ml-2">
                              {arch.badge}
                            </span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-white/40">Preview:</span>
                            <span className="text-xs font-bold font-mono text-emerald-300">
                              {arch.previewTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: WIDGET STYLES (DYNAMIC OVERHAUL) ================= */}
            {activeTab === 'widget-styles' && (
              <div className="space-y-6 max-w-4xl">
                {/* Target Widget Selector */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Widget Styling Target</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                        {selectedStyleWidget === 'global' ? 'Global Default' : 'Single Widget Override'}
                      </span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Customize individual widgets independently, or edit global defaults for all widgets
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStyleWidget}
                      onChange={e => setSelectedStyleWidget(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-medium focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value="global">All Widgets (Global Default)</option>
                      {ALL_WIDGET_KEYS.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.label} {stagedWidgetOverrides[w.id] ? '★ [Customized]' : ''}
                        </option>
                      ))}
                    </select>

                    {selectedStyleWidget !== 'global' && (
                      <button
                        onClick={() => handleResetWidgetToDefault(selectedStyleWidget)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 text-[11px] font-semibold border border-amber-400/30 transition cursor-pointer"
                        title="Restore Global Theme Default for this widget"
                      >
                        Reset to Theme Default
                      </button>
                    )}
                    <button
                      onClick={handleApplyCurrentStyleToAll}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-400/40 transition cursor-pointer"
                      title="Copy these styling rules to all widgets"
                    >
                      Apply to All Widgets
                    </button>
                  </div>
                </div>

                {/* Surface Material Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Surface Material & Preset Armor
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'latverian-titanium', name: 'Latverian Titanium', bg: '#0c1a14', border: '#059669', blur: 18, radius: 20 },
                      { id: 'stark-gold-crimson', name: 'Stark Hot-Rod Gold', bg: '#18080c', border: '#ef4444', blur: 20, radius: 22 },
                      { id: 'vibranium-silver', name: 'Vibranium Silver Plate', bg: '#0a1020', border: '#3b82f6', blur: 16, radius: 18 },
                      { id: 'obsidian-stealth', name: 'Obsidian Matte Stealth', bg: '#08080c', border: 'rgba(255,255,255,0.15)', blur: 24, radius: 24 },
                      { id: 'frosted-glass', name: 'Nordic Frosted Glass', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.22)', blur: 28, radius: 24 },
                      { id: 'pure-transparent', name: 'Frameless Minimal', bg: 'transparent', border: 'transparent', blur: 0, radius: 16 },
                      { id: 'arc-hologram', name: 'Arc Reactor Hologram', bg: 'rgba(6,182,212,0.1)', border: '#00f0ff', blur: 16, radius: 20 },
                      { id: 'oled-high-contrast', name: 'OLED High Contrast', bg: '#000000', border: '#fbbf24', blur: 0, radius: 12 },
                    ].map(mat => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          updateCurrentStyle({
                            bgColor: mat.bg,
                            borderColor: mat.border,
                            blur: mat.blur,
                            borderRadius: mat.radius,
                          });
                        }}
                        className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-400/40 text-left transition cursor-pointer group"
                      >
                        <span className="block text-xs font-bold text-white group-hover:text-emerald-300">
                          {mat.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: mat.bg === 'transparent' ? '#333' : mat.bg }} />
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: mat.border === 'transparent' ? '#333' : mat.border }} />
                          <span className="text-[10px] text-white/40 font-mono">{mat.blur}px blur</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fine-Tuning Sliders: Background, Opacity, Blur, Border */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  {/* Background Color & Opacity */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Background Color:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.bgColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentEditingStyle.bgColor?.startsWith('#') ? currentEditingStyle.bgColor : '#0c1a14'}
                        onChange={e => updateCurrentStyle({ bgColor: e.target.value })}
                        className="w-9 h-9 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentEditingStyle.bgColor}
                        onChange={e => updateCurrentStyle({ bgColor: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="flex justify-between text-xs text-white/70 pt-2">
                      <span>Surface Opacity:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentEditingStyle.bgOpacity ?? 80}
                      onChange={e => updateCurrentStyle({ bgOpacity: Number(e.target.value) })}
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  {/* Backdrop Blur & Corner Radius */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Backdrop Blur:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={currentEditingStyle.blur ?? 16}
                      onChange={e => updateCurrentStyle({ blur: Number(e.target.value) })}
                      className="w-full accent-emerald-400"
                    />

                    <div className="flex justify-between text-xs text-white/70 pt-2">
                      <span>Corner Radius:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={currentEditingStyle.borderRadius ?? 20}
                      onChange={e => updateCurrentStyle({ borderRadius: Number(e.target.value) })}
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  {/* Border Color & Width */}
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Border Color:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.borderColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentEditingStyle.borderColor?.startsWith('#') ? currentEditingStyle.borderColor : '#10b981'}
                        onChange={e => updateCurrentStyle({ borderColor: e.target.value })}
                        className="w-9 h-9 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentEditingStyle.borderColor}
                        onChange={e => updateCurrentStyle({ borderColor: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/70 pt-2">
                      <span>Border Thickness:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="0.5"
                      value={currentEditingStyle.borderWidth ?? 1}
                      onChange={e => updateCurrentStyle({ borderWidth: Number(e.target.value) })}
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  {/* Glow Color & Intensity */}
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Glow Color:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.glowColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentEditingStyle.glowColor?.startsWith('#') ? currentEditingStyle.glowColor : '#10b981'}
                        onChange={e => updateCurrentStyle({ glowColor: e.target.value })}
                        className="w-9 h-9 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentEditingStyle.glowColor}
                        onChange={e => updateCurrentStyle({ glowColor: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/70 pt-2">
                      <span>Glow Intensity:</span>
                      <span className="font-mono text-emerald-300">{currentEditingStyle.glowIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentEditingStyle.glowIntensity ?? 30}
                      onChange={e => updateCurrentStyle({ glowIntensity: Number(e.target.value) })}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: ARRANGE LAYOUT (50 PRESETS) ================= */}
            {activeTab === 'arrange-layout' && (
              <div className="space-y-6">
                {/* Header with Mode Switcher & Category Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>50 Visual Grid Arrangement Designs</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        {filteredGridPresets.length} / 50 Available
                      </span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Each preset features distinct geometric proportions designed for clock, countdown, and study tools
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {(['all', 'bento', 'asymmetrical', 'symmetrical', 'magazine', 'sidebar', 'split', 'masonry', 'minimal'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setLayoutCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          layoutCategoryFilter === cat
                            ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing & Gap Adjustment Sliders */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/60 font-medium">Grid Gaps:</span>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={stagedGridGap}
                      onChange={e => setStagedGridGap(Number(e.target.value))}
                      className="w-28 accent-emerald-400"
                    />
                    <span className="font-mono text-emerald-300 font-bold">{stagedGridGap}px</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/60 font-medium">Canvas Margin:</span>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={stagedGridMargin}
                      onChange={e => setStagedGridMargin(Number(e.target.value))}
                      className="w-28 accent-emerald-400"
                    />
                    <span className="font-mono text-emerald-300 font-bold">{stagedGridMargin}px</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/60 font-medium">Alignment:</span>
                    {(['center', 'top', 'stretch'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => setStagedGridAlignment(align)}
                        className={`px-2.5 py-1 rounded-lg uppercase font-bold text-[10px] transition cursor-pointer border ${
                          stagedGridAlignment === align
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 50 Presets Visual Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredGridPresets.map(preset => {
                    const isSelected = stagedGridPresetId === preset.id;

                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setStagedGridPresetId(preset.id);
                          setStagedLayoutMode('grid');
                        }}
                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Interactive Geometric Thumbnail Representation */}
                        <div className="relative w-full aspect-[16/10] bg-black/60 rounded-xl border border-white/10 overflow-hidden p-1.5 mb-2.5 flex flex-col justify-between">
                          <div className="relative w-full h-full">
                            {preset.slots.map((slot, idx) => {
                              const isHero = slot.isPrimary || slot.widgetKey === 'clock';
                              return (
                                <div
                                  key={idx}
                                  className={`absolute rounded transition-all text-[8px] flex items-center justify-center font-mono font-bold truncate px-0.5 border ${
                                    isHero
                                      ? 'bg-emerald-500/25 border-emerald-400/70 text-emerald-200'
                                      : 'bg-white/5 border-white/10 text-white/50 group-hover:border-white/20'
                                  }`}
                                  style={{
                                    left: `${slot.xPercent}%`,
                                    top: `${slot.yPercent}%`,
                                    width: `${slot.wPercent}%`,
                                    height: `${slot.hPercent}%`,
                                  }}
                                  title={`${slot.widgetKey}: ${slot.label}`}
                                >
                                  {slot.widgetKey === 'clock'
                                    ? 'CLOCK'
                                    : slot.widgetKey === 'countdown'
                                    ? 'EXAM'
                                    : slot.widgetKey === 'nameWidget'
                                    ? 'TITLE'
                                    : slot.widgetKey === 'tasks'
                                    ? 'TASKS'
                                    : slot.widgetKey === 'notification'
                                    ? 'ROUTINE'
                                    : slot.widgetKey === 'calendar'
                                    ? 'CAL'
                                    : slot.widgetKey === 'pomodoro'
                                    ? 'TIMER'
                                    : 'QUOTE'}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Preset Metadata */}
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition truncate">
                              {preset.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-emerald-400 font-mono uppercase shrink-0 border border-white/10">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/50 line-clamp-1">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 4: FREEFORM EDITOR ================= */}
            {activeTab === 'freeform-editor' && (
              <div className="space-y-6 max-w-4xl">
                {/* Freeform Mode Switch Banner */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Canvas Freeform Mode</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                        stagedLayoutMode === 'freeform'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-white/50 border-white/10'
                      }`}>
                        {stagedLayoutMode === 'freeform' ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Drag, resize, position, and layer widgets anywhere with pixel-level precision
                    </p>
                  </div>

                  <button
                    onClick={() => setStagedLayoutMode('freeform')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      stagedLayoutMode === 'freeform'
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span>Enable Freeform Mode</span>
                  </button>
                </div>

                {/* Target Widget Coordinate Controls */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Selected Widget Geometry
                    </span>
                    <select
                      value={selectedFreeformWidget}
                      onChange={e => setSelectedFreeformWidget(e.target.value as DashboardWidgetKey)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-medium focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      {ALL_WIDGET_KEYS.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4 Coordinate Inputs: X, Y, Width, Height */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 font-mono">X Position (px):</label>
                      <input
                        type="number"
                        value={stagedFreeformLayout[selectedFreeformWidget]?.x ?? 100}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { y: 100, width: 360, height: 160 }),
                              x: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 font-mono">Y Position (px):</label>
                      <input
                        type="number"
                        value={stagedFreeformLayout[selectedFreeformWidget]?.y ?? 100}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { x: 100, width: 360, height: 160 }),
                              y: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 font-mono">Width (px):</label>
                      <input
                        type="number"
                        value={stagedFreeformLayout[selectedFreeformWidget]?.width ?? 360}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { x: 100, y: 100, height: 160 }),
                              width: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 font-mono">Height (px):</label>
                      <input
                        type="number"
                        value={stagedFreeformLayout[selectedFreeformWidget]?.height ?? 160}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { x: 100, y: 100, width: 360 }),
                              height: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Alignment & Layering Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-white/60 font-medium">Align on Canvas:</span>
                      <button
                        onClick={() => {
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { y: 100, width: 360, height: 160 }),
                              x: 30,
                            },
                          }));
                        }}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-semibold transition"
                      >
                        Left
                      </button>
                      <button
                        onClick={() => {
                          const w = stagedFreeformLayout[selectedFreeformWidget]?.width ?? 360;
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { y: 100, width: 360, height: 160 }),
                              x: Math.max(10, (window.innerWidth - w) / 2),
                            },
                          }));
                        }}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-semibold transition"
                      >
                        Center
                      </button>
                      <button
                        onClick={() => {
                          const w = stagedFreeformLayout[selectedFreeformWidget]?.width ?? 360;
                          setStagedFreeformLayout(prev => ({
                            ...prev,
                            [selectedFreeformWidget]: {
                              ...(prev[selectedFreeformWidget] || { y: 100, width: 360, height: 160 }),
                              x: Math.max(10, window.innerWidth - w - 30),
                            },
                          }));
                        }}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-semibold transition"
                      >
                        Right
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stagedSnapToGrid}
                          onChange={e => setStagedSnapToGrid(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-emerald-500 cursor-pointer"
                        />
                        <span className="text-white/70">Grid Snapping ({stagedSnapSize}px)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Widget Visibility & Replacement of Negative/Positive Controls */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Active Widgets on Dashboard
                      </h4>
                      <p className="text-xs text-white/50">
                        Use (+) to add widgets or (−) to hide. Data is never deleted upon removal.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ALL_WIDGET_KEYS.map(w => {
                      const isVis = stagedVisibility[w.id] !== false;
                      const Icon = w.icon;

                      return (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isVis ? 'text-emerald-400' : 'text-white/30'}`} />
                            <span className={`text-xs font-medium ${isVis ? 'text-white' : 'text-white/40 line-through'}`}>
                              {w.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isVis ? (
                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    title: `Hide ${w.label}?`,
                                    description: `Your tasks, routines, and configuration are safely preserved. You can re-enable this widget anytime with the (+) button.`,
                                    onConfirm: () => {
                                      setStagedVisibility(prev => ({ ...prev, [w.id]: false }));
                                      setConfirmDialog(null);
                                    },
                                  });
                                }}
                                className="w-7 h-7 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 flex items-center justify-center transition cursor-pointer"
                                title="Remove / Hide widget (−)"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setStagedVisibility(prev => ({ ...prev, [w.id]: true }));
                                }}
                                className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center transition cursor-pointer"
                                title="Add widget (+)"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 5: TYPOGRAPHY STUDIO ================= */}
            {activeTab === 'typography' && (
              <div className="space-y-6 max-w-4xl">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Typography Scale & Font Architecture
                    </h3>
                    <p className="text-xs text-white/50">
                      Configure font families, scale ratios, and precision weights for clocks, countdowns, and widgets
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Global Scale:</span>
                    <button
                      onClick={() => {
                        setStagedTypography(prev => ({
                          ...prev,
                          globalScale: Math.max(0.7, (prev.globalScale ?? 1.0) - 0.05),
                        }));
                      }}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                      title="Decrease Scale"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-emerald-300 font-bold min-w-[38px] text-center text-xs">
                      {Math.round((stagedTypography.globalScale ?? 1.0) * 100)}%
                    </span>
                    <button
                      onClick={() => {
                        setStagedTypography(prev => ({
                          ...prev,
                          globalScale: Math.min(1.6, (prev.globalScale ?? 1.0) + 0.05),
                        }));
                      }}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                      title="Increase Scale"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Viewable Font Families Grid with Real Rendering */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Clock & Typography Font Family ({STUDIO_FONTS.length} Viewable Fonts)
                    </label>
                    <span className="text-[11px] text-white/50 font-mono">Click to preview in live font style</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {STUDIO_FONTS.map(f => {
                      const isSelected = stagedTypography.fontClock === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => {
                            setStagedTypography(prev => ({
                              ...prev,
                              fontClock: f.id,
                              fontHeading: f.id,
                              fontCountdown: f.id,
                            }));
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                              : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/25 text-white/85'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">{f.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-emerald-400 font-mono uppercase border border-white/10">
                              {f.category}
                            </span>
                          </div>

                          {/* Viewable live sample rendered in its actual font typography */}
                          <div
                            className="py-2 px-2.5 rounded-xl bg-black/40 border border-white/5 text-sm sm:text-base text-white tracking-wide truncate"
                            style={{ fontFamily: f.fontFamily }}
                          >
                            {f.samplePreview}
                          </div>

                          <p className="text-[10px] text-white/45 mt-2 line-clamp-1">
                            {f.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Styling & Glow Controls */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Text Glow & Architectural Text Styling
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Glow Preset Color */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-white/60">Luminescent Glow:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'none', label: 'None', color: 'transparent' },
                          { id: '#00f0ff', label: 'Cyan', color: '#00f0ff' },
                          { id: '#10b981', label: 'Emerald', color: '#10b981' },
                          { id: '#f59e0b', label: 'Amber', color: '#f59e0b' },
                          { id: '#ec4899', label: 'Magenta', color: '#ec4899' },
                          { id: '#a855f7', label: 'Purple', color: '#a855f7' },
                        ].map(g => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              updateCurrentStyle({
                                glowColor: g.color === 'transparent' ? undefined : g.color,
                                glowIntensity: g.color === 'transparent' ? 0 : 40,
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 hover:border-white/30 transition cursor-pointer flex items-center gap-1 bg-white/5"
                          >
                            {g.color !== 'transparent' && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                            )}
                            <span>{g.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Letter Spacing */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-white/60">Letter Tracking / Spacing:</label>
                      <div className="flex gap-1.5">
                        {[
                          { val: -1, label: 'Tight (-1)' },
                          { val: 0, label: 'Normal' },
                          { val: 2, label: 'Spaced (+2)' },
                          { val: 4, label: 'Wide (+4)' },
                        ].map(ls => (
                          <button
                            key={ls.val}
                            type="button"
                            onClick={() => {
                              setStagedTypography(prev => ({
                                ...prev,
                                elements: {
                                  ...prev.elements,
                                  clockMain: {
                                    ...prev.elements.clockMain,
                                    letterSpacing: ls.val,
                                  },
                                },
                              }));
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/15 text-white border border-white/10 transition cursor-pointer"
                          >
                            {ls.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Transform Case */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-white/60">Text Letter Case:</label>
                      <div className="flex gap-1.5">
                        {[
                          { val: 'none', label: 'Normal' },
                          { val: 'uppercase', label: 'ALL CAPS' },
                          { val: 'lowercase', label: 'lowercase' },
                        ].map(tc => (
                          <button
                            key={tc.val}
                            type="button"
                            onClick={() => {
                              setStagedTypography(prev => ({
                                ...prev,
                                elements: {
                                  ...prev.elements,
                                  clockMain: {
                                    ...prev.elements.clockMain,
                                    textTransform: tc.val as any,
                                  },
                                },
                              }));
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/15 text-white border border-white/10 transition cursor-pointer"
                          >
                            {tc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 6: ADVANCED SETTINGS ================= */}
            {activeTab === 'advanced' && (
              <div className="space-y-6 max-w-4xl">
                {/* Backup & Restore JSON */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-emerald-400" />
                    <span>Configuration Backup & Export</span>
                  </h4>
                  <p className="text-xs text-white/50">
                    Export your complete dashboard configuration to a JSON file or restore from a backup
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentConfig, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute('href', dataStr);
                        downloadAnchor.setAttribute('download', `flocus_dashboard_backup_${Date.now()}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON Backup</span>
                    </button>
                  </div>
                </div>

                {/* Reset to Factory Defaults */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Factory Reset</span>
                  </h4>
                  <p className="text-xs text-white/60">
                    Reverts all widget styles, 50 presets, freeform coordinates, and appearance settings to initial defaults.
                  </p>
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Restore Factory Defaults?',
                        description: 'This will reset all your widget arrangements, customized styles, and themes back to factory defaults.',
                        onConfirm: () => {
                          localStorage.removeItem('flocus_dashboard_config_v2');
                          window.location.reload();
                        },
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/40 transition cursor-pointer"
                  >
                    Reset All Dashboard Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Interactive Preview Card */}
          <div className="hidden lg:flex w-96 border-l border-white/10 bg-black/50 p-5 flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Sandbox Preview</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 capitalize">
                  {stagedThemeId}
                </span>
              </div>

              {/* Sandbox Widget Box Demonstrating Staged Dynamic Styling */}
              <div
                className="relative rounded-2xl p-4 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                style={{
                  backgroundColor: currentEditingStyle.bgColor || '#0c1a14',
                  opacity: (currentEditingStyle.bgOpacity ?? 82) / 100,
                  backdropFilter: `blur(${currentEditingStyle.blur ?? 18}px)`,
                  WebkitBackdropFilter: `blur(${currentEditingStyle.blur ?? 18}px)`,
                  border: `${currentEditingStyle.borderWidth ?? 1}px solid ${currentEditingStyle.borderColor || '#059669'}`,
                  borderRadius: `${currentEditingStyle.borderRadius ?? 20}px`,
                  boxShadow: `0 15px 35px ${currentEditingStyle.shadowColor || 'rgba(0,0,0,0.6)'}, 0 0 ${Math.round((currentEditingStyle.glowIntensity ?? 30) / 3)}px ${currentEditingStyle.glowColor || '#10b981'}`,
                  color: currentEditingStyle.textColor || '#ffffff',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentEditingStyle.accentColor || '#10b981' }} />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">
                      {selectedStyleWidget === 'global' ? 'PREVIEW WIDGET' : selectedStyleWidget.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">TARGET 100%</span>
                </div>

                <div className="my-4 text-center">
                  <span className="text-3xl font-extrabold tracking-tight font-mono block">
                    10:18:59
                  </span>
                  <span className="text-[11px] opacity-70 tracking-widest uppercase font-mono mt-1 block">
                    PUBLIC EXAM COUNTDOWN
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono opacity-60">
                  <span>LATVERIAN TITANIUM</span>
                  <span>ARC CORE STARK</span>
                </div>
              </div>

              {/* Staged Configuration Overview */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px] font-mono text-white/60">
                <div className="flex justify-between">
                  <span>Layout Mode:</span>
                  <span className="text-emerald-300 capitalize">{stagedLayoutMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Preset:</span>
                  <span className="text-white truncate max-w-[140px]">{stagedGridPresetId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Animation:</span>
                  <span className={stagedAnimEnabled ? 'text-emerald-300' : 'text-white/40'}>
                    {stagedAnimEnabled ? `ON (${stagedAnimIntensity})` : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atmosphere:</span>
                  <span className="text-white capitalize">{stagedCanvasTheme}</span>
                </div>
              </div>
            </div>

            {/* Direct Commit Action */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleSaveAndApply}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= GENUINE CONFIRMATION MODAL ================= */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c101d] border border-white/20 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{confirmDialog.title}</span>
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
