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
  ElementTypographyConfig,
  DashboardTypographyConfig,
  DEFAULT_ELEMENT_TYPOGRAPHY,
  N0T0StyleOption,
  N0T0_TYPOGRAPHY_STYLES,
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
  | 'typography'
  | 'n0t0'
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
  // Active studio tab
  const [activeTab, setActiveTab] = useState<StudioTab>('themes');
  const [searchQuery, setSearchQuery] = useState('');

  // Sub-category filters
  const [themeFilter, setThemeFilter] = useState<'all' | 'superhero' | 'dark' | 'light' | 'cinematic' | 'nature' | 'space'>('all');
  const [clockFilter, setClockFilter] = useState<'all' | 'digital' | 'superhero' | 'classic' | 'specialized' | 'minimal'>('all');
  const [n0t0Category, setN0t0Category] = useState<'all' | 'minimal' | 'editorial' | 'terminal' | 'cyber' | 'brutalist'>('all');
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

  // Widget Transparency Staging (Transparent vs Glass Cards)
  const [stagedWidgetTransparency, setStagedWidgetTransparency] = useState<{
    clock: boolean;
    countdown: boolean;
    notification: boolean;
    calendar: boolean;
    tasks: boolean;
    motivation: boolean;
    pomodoro: boolean;
    nameWidget: boolean;
  }>(() => ({
    clock: !currentConfig.clock.glassBg,
    countdown: !currentConfig.countdown.glassBg,
    notification: !currentConfig.notification.glassBg,
    calendar: !currentConfig.calendar.glassBg,
    tasks: !currentConfig.tasks.glassBg,
    motivation: !currentConfig.motivation.glassBg,
    pomodoro: !(currentConfig.pomodoro?.glassBg ?? true),
    nameWidget: !currentConfig.nameWidget.glassBg,
  }));

  const setAllStagedTransparency = (transparent: boolean) => {
    setStagedWidgetTransparency({
      clock: transparent,
      countdown: transparent,
      notification: transparent,
      calendar: transparent,
      tasks: transparent,
      motivation: transparent,
      pomodoro: transparent,
      nameWidget: transparent,
    });
    if (transparent) {
      setStagedWidgetStyle('transparent');
    } else if (stagedWidgetStyle === 'transparent') {
      setStagedWidgetStyle('subtle-dark-glass');
    }
  };

  // Clock architecture
  const [stagedClockArch, setStagedClockArch] = useState<string>(currentConfig.clock?.architecture || 'minimal');

  // Advanced Element Typography System Staging
  const [stagedTypography, setStagedTypography] = useState<DashboardTypographyConfig>(() => ({
    globalScale: currentConfig.typography?.globalScale ?? 1.0,
    elements: {
      ...DEFAULT_ELEMENT_TYPOGRAPHY,
      ...(currentConfig.typography?.elements || {}),
    },
    fontClock: currentConfig.typography?.fontClock || 'inter',
    fontHeading: currentConfig.typography?.fontHeading || 'inter',
    fontBody: currentConfig.typography?.fontBody || 'inter',
    fontCountdown: currentConfig.typography?.fontCountdown || 'inter',
    fontLabels: currentConfig.typography?.fontLabels || 'inter',
    activeN0T0StyleId: currentConfig.typography?.activeN0T0StyleId,
  }));

  const [selectedTypographyElement, setSelectedTypographyElement] =
    useState<keyof DashboardTypographyConfig['elements']>('clockMain');
  const [undoStack, setUndoStack] = useState<DashboardTypographyConfig[]>([]);
  const [redoStack, setRedoStack] = useState<DashboardTypographyConfig[]>([]);

  // Interactive sample testing text
  const [sampleHeadingText, setSampleHeadingText] = useState('CHEMISTRY CENTUM TARGET');
  const [sampleWidgetTitle, setSampleWidgetTitle] = useState("TODAY'S STUDY GOALS");
  const [sampleQuoteText, setSampleQuoteText] = useState('Excellence is an art won by training and habituation.');
  const [sampleCustomText, setSampleCustomText] = useState('Solve 2026 Model Paper Line-by-Line');
  const [sampleClockTime, setSampleClockTime] = useState('10:42:00');
  const [sampleCountdownDays, setSampleCountdownDays] = useState('137');
  const [previewMode, setPreviewMode] = useState<'dashboard' | 'clock' | 'countdown' | 'timetable' | 'sandbox'>('dashboard');

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

  // Active element config helper
  const activeElementConfig: ElementTypographyConfig = useMemo(() => {
    return stagedTypography.elements[selectedTypographyElement] || DEFAULT_ELEMENT_TYPOGRAPHY[selectedTypographyElement] || {};
  }, [stagedTypography, selectedTypographyElement]);

  const updateSelectedElement = (updates: Partial<ElementTypographyConfig>) => {
    setStagedTypography(prev => {
      setUndoStack(u => [...u.slice(-20), prev]);
      setRedoStack([]);
      const cur = prev.elements[selectedTypographyElement] || DEFAULT_ELEMENT_TYPOGRAPHY[selectedTypographyElement] || {};
      const newEl = { ...cur, ...updates };
      const newElements = { ...prev.elements, [selectedTypographyElement]: newEl };

      let fontClock = prev.fontClock;
      let fontHeading = prev.fontHeading;
      let fontBody = prev.fontBody;
      let fontCountdown = prev.fontCountdown;
      let fontLabels = prev.fontLabels;

      if (selectedTypographyElement === 'clockMain' && updates.fontFamily) {
        fontClock = updates.fontFamily;
        setStagedFontClock(updates.fontFamily);
      } else if (selectedTypographyElement === 'widgetTitle' && updates.fontFamily) {
        fontHeading = updates.fontFamily;
        setStagedFontHeading(updates.fontFamily);
      } else if (selectedTypographyElement === 'widgetBody' && updates.fontFamily) {
        fontBody = updates.fontFamily;
        setStagedFontBody(updates.fontFamily);
      } else if (selectedTypographyElement === 'countdownNumber' && updates.fontFamily) {
        fontCountdown = updates.fontFamily;
        setStagedFontCountdown(updates.fontFamily);
      } else if (selectedTypographyElement === 'countdownLabel' && updates.fontFamily) {
        fontLabels = updates.fontFamily;
        setStagedFontLabels(updates.fontFamily);
      }

      return {
        ...prev,
        fontClock,
        fontHeading,
        fontBody,
        fontCountdown,
        fontLabels,
        elements: newElements,
      };
    });
  };

  const handleGlobalScaleChange = (scale: number) => {
    setStagedTypography(prev => {
      setUndoStack(u => [...u.slice(-20), prev]);
      setRedoStack([]);
      return {
        ...prev,
        globalScale: Math.round(scale * 100) / 100,
      };
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(u => u.slice(0, -1));
    setRedoStack(r => [...r, stagedTypography]);
    setStagedTypography(prev);
    if (prev.fontClock) setStagedFontClock(prev.fontClock);
    if (prev.fontHeading) setStagedFontHeading(prev.fontHeading);
    if (prev.fontBody) setStagedFontBody(prev.fontBody);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, -1));
    setUndoStack(u => [...u, stagedTypography]);
    setStagedTypography(next);
    if (next.fontClock) setStagedFontClock(next.fontClock);
    if (next.fontHeading) setStagedFontHeading(next.fontHeading);
    if (next.fontBody) setStagedFontBody(next.fontBody);
  };

  const handleResetElement = () => {
    const def = DEFAULT_ELEMENT_TYPOGRAPHY[selectedTypographyElement];
    if (def) {
      updateSelectedElement({ ...def });
    }
  };

  const handleResetTypographyOnly = () => {
    setStagedTypography(prev => {
      setUndoStack(u => [...u.slice(-20), prev]);
      setRedoStack([]);
      return {
        globalScale: 1.0,
        elements: { ...DEFAULT_ELEMENT_TYPOGRAPHY },
        fontClock: 'inter',
        fontHeading: 'inter',
        fontBody: 'inter',
        fontCountdown: 'inter',
        fontLabels: 'inter',
        activeN0T0StyleId: undefined,
      };
    });
    setStagedFontClock('inter');
    setStagedFontHeading('inter');
    setStagedFontBody('inter');
    setStagedFontCountdown('inter');
    setStagedFontLabels('inter');
  };

  const handleApplyN0T0Style = (style: N0T0StyleOption) => {
    setStagedTypography(prev => {
      setUndoStack(u => [...u.slice(-20), prev]);
      setRedoStack([]);
      const cfg = style.config;
      const updated = { ...prev.elements };

      Object.keys(updated).forEach(k => {
        const key = k as keyof DashboardTypographyConfig['elements'];
        updated[key] = {
          ...updated[key],
          fontFamily: cfg.fontFamily,
          fontWeight: cfg.fontWeight,
          letterSpacing: Math.min(cfg.letterSpacing, 4),
          lineHeight: cfg.lineHeight,
          textShadow: cfg.textShadow || 'none',
          textGlow: cfg.textGlow,
          glowColor: cfg.glowColor,
          glowIntensity: cfg.glowIntensity,
        };
      });

      if (updated.clockMain) {
        updated.clockMain = {
          ...updated.clockMain,
          fontSize: cfg.clockSize || 64,
          letterSpacing: cfg.letterSpacing,
          textTransform: cfg.textTransform || 'none',
        };
      }
      if (updated.clockDate) {
        updated.clockDate = {
          ...updated.clockDate,
          fontSize: cfg.dateSize || 13,
        };
      }
      if (updated.countdownNumber) {
        updated.countdownNumber = {
          ...updated.countdownNumber,
          fontSize: cfg.countdownSize || 48,
        };
      }
      if (updated.countdownLabel) {
        updated.countdownLabel = {
          ...updated.countdownLabel,
          fontSize: cfg.labelSize || 11,
          textTransform: 'uppercase',
        };
      }

      if (cfg.elementOverrides) {
        Object.entries(cfg.elementOverrides).forEach(([k, ov]) => {
          const key = k as keyof DashboardTypographyConfig['elements'];
          if (updated[key]) {
            updated[key] = { ...updated[key], ...ov };
          }
        });
      }

      return {
        ...prev,
        activeN0T0StyleId: style.id,
        fontClock: cfg.fontFamily,
        fontHeading: cfg.fontFamily,
        fontBody: cfg.fontFamily,
        fontCountdown: cfg.fontFamily,
        fontLabels: cfg.fontFamily,
        elements: updated,
      };
    });

    setStagedFontClock(style.config.fontFamily);
    setStagedFontHeading(style.config.fontFamily);
    setStagedFontBody(style.config.fontFamily);
    recordRecent(style.id);
  };

  const getInlineFontStyle = (cfg?: ElementTypographyConfig): React.CSSProperties => {
    if (!cfg) return {};
    const globalScale = stagedTypography.globalScale ?? 1.0;
    const style: React.CSSProperties = {};

    const fontId = cfg.fontFamily || stagedFontClock || 'inter';
    const familyMap: Record<string, string> = {
      inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      roboto: "'Roboto', sans-serif",
      poppins: "'Poppins', sans-serif",
      montserrat: "'Montserrat', sans-serif",
      outfit: "'Outfit', sans-serif",
      space: "'Space Grotesk', sans-serif",
      orbitron: "'Orbitron', sans-serif",
      rajdhani: "'Rajdhani', sans-serif",
      oxanium: "'Oxanium', sans-serif",
      'exo-2': "'Exo 2', sans-serif",
      sora: "'Sora', sans-serif",
      manrope: "'Manrope', sans-serif",
      'dm-sans': "'DM Sans', sans-serif",
      'plus-jakarta': "'Plus Jakarta Sans', sans-serif",
      'ibm-plex-sans': "'IBM Plex Sans', sans-serif",
      'mono-jb': "'JetBrains Mono', monospace",
      'mono-ibm': "'IBM Plex Mono', monospace",
      'space-mono': "'Space Mono', monospace",
      'fira-code': "'Fira Code', monospace",
      'source-code': "'Source Code Pro', monospace",
      'bebas-neue': "'Bebas Neue', sans-serif",
      oswald: "'Oswald', sans-serif",
      archivo: "'Archivo', sans-serif",
      lato: "'Lato', sans-serif",
      anton: "'Anton', sans-serif",
      audiowide: "'Audiowide', cursive",
      vt323: "'VT323', monospace",
      doto: "'Doto', sans-serif",
      'courier-prime': "'Courier Prime', monospace",
      system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      monospace: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    };
    if (familyMap[fontId]) style.fontFamily = familyMap[fontId];

    if (cfg.fontSize) {
      style.fontSize = `${Math.round(cfg.fontSize * globalScale)}px`;
    }
    if (cfg.fontWeight) style.fontWeight = cfg.fontWeight;
    if (cfg.letterSpacing !== undefined) style.letterSpacing = `${cfg.letterSpacing}px`;
    if (cfg.lineHeight !== undefined) style.lineHeight = cfg.lineHeight;
    if (cfg.textAlign) style.textAlign = cfg.textAlign;
    if (cfg.color) style.color = cfg.color;
    if (cfg.opacity !== undefined) style.opacity = cfg.opacity;
    if (cfg.textTransform) style.textTransform = cfg.textTransform;
    if (cfg.isItalic) style.fontStyle = 'italic';
    if (cfg.isUnderline) style.textDecoration = 'underline';

    const shadows: string[] = [];
    if (cfg.textShadow === 'soft') {
      shadows.push('0 2px 8px rgba(0, 0, 0, 0.6)');
    } else if (cfg.textShadow === 'crisp') {
      shadows.push('0 2px 0 rgba(0, 0, 0, 0.9)');
    } else if (cfg.textShadow === 'deep') {
      shadows.push('0 8px 24px rgba(0, 0, 0, 0.85)');
    } else if (cfg.textShadow === 'outline') {
      shadows.push('-1px -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9)');
    }

    if (cfg.textGlow) {
      const glowColor = cfg.glowColor || cfg.color || stagedAccentColor || '#06b6d4';
      const intensity = cfg.glowIntensity || 12;
      shadows.push(`0 0 ${intensity}px ${glowColor}`);
    }

    if (shadows.length > 0) style.textShadow = shadows.join(', ');

    return style;
  };

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
        glassBg: !stagedWidgetTransparency.clock,
        color: stagedAccentColor,
        architecture: stagedClockArch,
      },
      countdown: {
        ...currentConfig.countdown,
        glassBg: !stagedWidgetTransparency.countdown,
      },
      notification: {
        ...currentConfig.notification,
        glassBg: !stagedWidgetTransparency.notification,
      },
      calendar: {
        ...currentConfig.calendar,
        glassBg: !stagedWidgetTransparency.calendar,
      },
      tasks: {
        ...currentConfig.tasks,
        glassBg: !stagedWidgetTransparency.tasks,
      },
      motivation: {
        ...currentConfig.motivation,
        glassBg: !stagedWidgetTransparency.motivation,
      },
      pomodoro: {
        ...currentConfig.pomodoro,
        glassBg: !stagedWidgetTransparency.pomodoro,
      },
      nameWidget: {
        ...currentConfig.nameWidget,
        glassBg: !stagedWidgetTransparency.nameWidget,
      },
      typography: {
        ...stagedTypography,
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

  if (!isOpen) return null;

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
              { id: 'typography', label: 'Advanced Typography Studio', icon: Type },
              { id: 'n0t0', label: '15 N0T0 Minimalist Styles', icon: Sparkles },
              { id: 'fonts', label: 'Typography Fonts (27)', icon: SlidersHorizontal },
              { id: 'text-styles', label: 'Text & Font Stylers', icon: Sliders },
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

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= ADVANCED TYPOGRAPHY STUDIO ================= */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                {/* Header & Global Toolbar */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Type className="w-4 h-4 text-cyan-400" />
                          <span>Advanced Typography & Font Studio</span>
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          Independent Element Tuning
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        Customize font family, sizing, weights, tracking, letter-casing, shadows, and glows for each dashboard element independently.
                      </p>
                    </div>

                    {/* Global Scale & History Controls */}
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                        <span className="text-white/60 text-[11px] font-medium">Global Scale:</span>
                        <button
                          type="button"
                          onClick={() => handleGlobalScaleChange(Math.max(0.7, (stagedTypography.globalScale ?? 1.0) - 0.05))}
                          className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
                          title="Decrease Global Scale"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-cyan-300 font-bold min-w-[38px] text-center">
                          {Math.round((stagedTypography.globalScale ?? 1.0) * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleGlobalScaleChange(Math.min(1.6, (stagedTypography.globalScale ?? 1.0) + 0.05))}
                          className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
                          title="Increase Global Scale"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <div className="hidden sm:flex items-center gap-1 ml-1 border-l border-white/10 pl-1.5">
                          {[0.85, 1.0, 1.15, 1.3].map(scale => (
                            <button
                              key={scale}
                              type="button"
                              onClick={() => handleGlobalScaleChange(scale)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                                Math.abs((stagedTypography.globalScale ?? 1.0) - scale) < 0.02
                                  ? 'bg-cyan-500 text-black font-bold'
                                  : 'text-white/40 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {scale}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Undo / Redo */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleUndo}
                          disabled={undoStack.length === 0}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 hover:text-white border border-white/10 transition cursor-pointer flex items-center gap-1 text-xs"
                          title="Undo Typography Change"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Undo</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRedo}
                          disabled={redoStack.length === 0}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 hover:text-white border border-white/10 transition cursor-pointer flex items-center gap-1 text-xs"
                          title="Redo Typography Change"
                        >
                          <Redo className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Redo</span>
                        </button>
                      </div>

                      {/* Reset Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleResetElement}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition cursor-pointer text-[11px] flex items-center gap-1"
                          title="Reset Selected Element"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Reset Element</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetTypographyOnly}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition cursor-pointer text-[11px]"
                          title="Reset Entire Dashboard Typography"
                        >
                          Reset All
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Element Selector Tabs (12 Distinct Elements) */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2 block">
                      Select Dashboard Element to Style:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                      {[
                        { key: 'clockMain', label: 'Main Clock', sub: 'Hours & Minutes' },
                        { key: 'clockDate', label: 'Date & Day', sub: 'Calendar Header' },
                        { key: 'countdownNumber', label: 'Exam Countdown', sub: 'Days & Numbers' },
                        { key: 'countdownLabel', label: 'Countdown Label', sub: 'Exam Badge' },
                        { key: 'widgetTitle', label: 'Widget Title', sub: 'Card Headings' },
                        { key: 'widgetBody', label: 'Widget Body', sub: 'Descriptions' },
                        { key: 'timetableSubject', label: 'Timetable Subject', sub: 'Routine Classes' },
                        { key: 'timetableTime', label: 'Timetable Time', sub: 'Period Intervals' },
                        { key: 'taskText', label: 'Quick Task Text', sub: 'Checklist Items' },
                        { key: 'motivationText', label: 'Motivational Quote', sub: 'Daily Affirmation' },
                        { key: 'customText', label: 'Sticky Notes', sub: 'Custom Elements' },
                        { key: 'buttonLabel', label: 'Buttons & Badges', sub: 'Interactive Tags' },
                      ].map(el => {
                        const isSelected = selectedTypographyElement === el.key;
                        const elCfg = stagedTypography.elements[el.key as keyof DashboardTypographyConfig['elements']] || {};
                        const currentSize = elCfg.fontSize || DEFAULT_ELEMENT_TYPOGRAPHY[el.key]?.fontSize || 14;

                        return (
                          <button
                            key={el.key}
                            type="button"
                            onClick={() => setSelectedTypographyElement(el.key as keyof DashboardTypographyConfig['elements'])}
                            className={`p-2 rounded-xl text-left transition cursor-pointer border flex flex-col justify-between ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                                : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold truncate">{el.label}</span>
                              <span className="text-[10px] font-mono text-cyan-300">
                                {currentSize}px
                              </span>
                            </div>
                            <span className="text-[10px] text-white/40 truncate mt-0.5">{el.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main Controls Grid for Selected Element */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Card 1: Font Family, Weight, Casing & Alignment */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5" />
                        <span>Font Family & Typography Style</span>
                      </h4>
                      <span className="text-[10px] font-mono text-white/40 capitalize">
                        Target: {selectedTypographyElement}
                      </span>
                    </div>

                    {/* Font Family Selector with 27 Fonts */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-white/70 font-medium">Font Family</label>
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {activeElementConfig.fontFamily || 'inter'}
                        </span>
                      </div>
                      <select
                        value={activeElementConfig.fontFamily || 'inter'}
                        onChange={e => updateSelectedElement({ fontFamily: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {STUDIO_FONTS.map(f => (
                          <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                            {f.name} — {f.category} ({f.description})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-white/70 font-medium">Font Weight</label>
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {activeElementConfig.fontWeight || '400'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-9 gap-1 text-[11px] font-mono">
                        {[
                          { val: '100', label: '100' },
                          { val: '200', label: '200' },
                          { val: '300', label: '300' },
                          { val: '400', label: '400' },
                          { val: '500', label: '500' },
                          { val: '600', label: '600' },
                          { val: '700', label: '700' },
                          { val: '800', label: '800' },
                          { val: '900', label: '900' },
                        ].map(w => {
                          const isW = (activeElementConfig.fontWeight || '400') === w.val;
                          return (
                            <button
                              key={w.val}
                              type="button"
                              onClick={() => updateSelectedElement({ fontWeight: w.val })}
                              className={`py-1 rounded-lg transition cursor-pointer text-center ${
                                isW
                                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                  : 'bg-black/40 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                              }`}
                            >
                              {w.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Text Casing & Alignment & Styles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                      {/* Text Casing */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-white/70 font-medium block">Text Casing</label>
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                          {[
                            { val: 'none', label: 'Normal' },
                            { val: 'uppercase', label: 'UPPER' },
                            { val: 'lowercase', label: 'lower' },
                            { val: 'capitalize', label: 'Title' },
                          ].map(c => {
                            const isC = (activeElementConfig.textTransform || 'none') === c.val;
                            return (
                              <button
                                key={c.val}
                                type="button"
                                onClick={() => updateSelectedElement({ textTransform: c.val as any })}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                                  isC
                                    ? 'bg-cyan-500 text-black shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-white/70 font-medium block">Text Alignment</label>
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                          {[
                            { val: 'left', icon: AlignLeft, label: 'Left' },
                            { val: 'center', icon: AlignCenter, label: 'Center' },
                            { val: 'right', icon: AlignRight, label: 'Right' },
                            { val: 'justify', icon: AlignJustify, label: 'Justify' },
                          ].map(a => {
                            const Icon = a.icon;
                            const isA = (activeElementConfig.textAlign || 'left') === a.val;
                            return (
                              <button
                                key={a.val}
                                type="button"
                                onClick={() => updateSelectedElement({ textAlign: a.val as any })}
                                className={`flex-1 py-1 rounded-lg text-xs flex items-center justify-center transition cursor-pointer ${
                                  isA
                                    ? 'bg-cyan-500 text-black shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                                title={a.label}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Italic & Underline Toggles */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateSelectedElement({ isItalic: !activeElementConfig.isItalic })}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          activeElementConfig.isItalic
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
                        }`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                        <span>Italic Style</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateSelectedElement({ isUnderline: !activeElementConfig.isUnderline })}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          activeElementConfig.isUnderline
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
                        }`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                        <span>Underline Style</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Font Sizing, Letter Spacing & Line Height */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Font Size & Geometry Spacing</span>
                      </h4>
                      <span className="text-[10px] text-amber-300/80 font-mono">
                        Global Scale: {stagedTypography.globalScale ?? 1.0}x
                      </span>
                    </div>

                    {/* Font Size with Slider, Numeric Input & (-) / (+) Buttons */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-white/70 font-medium">Font Size</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/40 text-[10px]">Computed:</span>
                          <span className="text-amber-300 font-mono font-bold text-xs">
                            {Math.round((activeElementConfig.fontSize || 14) * (stagedTypography.globalScale ?? 1.0))}px
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Minus Button */}
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({ fontSize: Math.max(8, (activeElementConfig.fontSize || 14) - 1) })}
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center border border-white/10 transition cursor-pointer shrink-0"
                          title="Decrease Font Size (−)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* Slider */}
                        <input
                          type="range"
                          min={selectedTypographyElement === 'clockMain' ? '20' : '8'}
                          max={selectedTypographyElement === 'clockMain' ? '140' : selectedTypographyElement === 'countdownNumber' ? '96' : '48'}
                          value={activeElementConfig.fontSize || DEFAULT_ELEMENT_TYPOGRAPHY[selectedTypographyElement]?.fontSize || 14}
                          onChange={e => updateSelectedElement({ fontSize: parseInt(e.target.value) || 14 })}
                          className="flex-1 accent-amber-400"
                        />

                        {/* Plus Button */}
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({
                            fontSize: Math.min(
                              selectedTypographyElement === 'clockMain' ? 140 : selectedTypographyElement === 'countdownNumber' ? 96 : 48,
                              (activeElementConfig.fontSize || 14) + 1
                            )
                          })}
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center border border-white/10 transition cursor-pointer shrink-0"
                          title="Increase Font Size (+)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct Numeric Input */}
                        <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl px-2 py-1 w-20 shrink-0">
                          <input
                            type="number"
                            min="8"
                            max="160"
                            value={activeElementConfig.fontSize || 14}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 8 && val <= 160) {
                                updateSelectedElement({ fontSize: val });
                              }
                            }}
                            className="w-full bg-transparent text-xs font-mono text-white text-right focus:outline-none"
                          />
                          <span className="text-[10px] text-white/40 font-mono">px</span>
                        </div>
                      </div>
                    </div>

                    {/* Letter Spacing (Tracking) */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-white/70 font-medium">Letter Spacing (Tracking)</label>
                        <span className="text-amber-300 font-mono text-xs">
                          {activeElementConfig.letterSpacing ?? 0}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-3"
                          max="16"
                          step="0.5"
                          value={activeElementConfig.letterSpacing ?? 0}
                          onChange={e => updateSelectedElement({ letterSpacing: parseFloat(e.target.value) })}
                          className="flex-1 accent-amber-400"
                        />
                        <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl px-2 py-1 w-20 shrink-0">
                          <input
                            type="number"
                            min="-3"
                            max="16"
                            step="0.5"
                            value={activeElementConfig.letterSpacing ?? 0}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) updateSelectedElement({ letterSpacing: val });
                            }}
                            className="w-full bg-transparent text-xs font-mono text-white text-right focus:outline-none"
                          />
                          <span className="text-[10px] text-white/40 font-mono">px</span>
                        </div>
                      </div>
                    </div>

                    {/* Line Height */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-white/70 font-medium">Line Height</label>
                        <span className="text-amber-300 font-mono text-xs">
                          {activeElementConfig.lineHeight ?? 1.2}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.8"
                          max="2.5"
                          step="0.1"
                          value={activeElementConfig.lineHeight ?? 1.2}
                          onChange={e => updateSelectedElement({ lineHeight: parseFloat(e.target.value) })}
                          className="flex-1 accent-amber-400"
                        />
                        <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl px-2 py-1 w-20 shrink-0">
                          <input
                            type="number"
                            min="0.8"
                            max="2.5"
                            step="0.1"
                            value={activeElementConfig.lineHeight ?? 1.2}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) updateSelectedElement({ lineHeight: val });
                            }}
                            className="w-full bg-transparent text-xs font-mono text-white text-right focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Color, Opacity, Text Shadow & Glow */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Text Color, Shadows & Glow Effects</span>
                    </h4>
                    <span className="text-[10px] text-white/40 font-mono">
                      Specular Luminescence
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Text Color Picker + Swatches */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 block">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeElementConfig.color || '#ffffff'}
                          onChange={e => updateSelectedElement({ color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={activeElementConfig.color || '#ffffff'}
                          onChange={e => updateSelectedElement({ color: e.target.value })}
                          className="flex-1 bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        {['#ffffff', '#06b6d4', '#f59e0b', '#10b981', '#a855f7', '#f43f5e', '#38bdf8', '#94a3b8'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateSelectedElement({ color: c })}
                            className="w-5 h-5 rounded-full border border-white/20 transition cursor-pointer hover:scale-110"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Opacity */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-white/70 font-medium">Text Opacity</label>
                        <span className="text-purple-300 font-mono font-bold text-xs">
                          {Math.round((activeElementConfig.opacity ?? 1.0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={activeElementConfig.opacity ?? 1.0}
                        onChange={e => updateSelectedElement({ opacity: parseFloat(e.target.value) })}
                        className="w-full accent-purple-400"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 font-mono">
                        <span>10% Faint</span>
                        <span>100% Solid</span>
                      </div>
                    </div>

                    {/* Text Shadow Presets */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 block">Text Shadow</label>
                      <select
                        value={activeElementConfig.textShadow || 'none'}
                        onChange={e => updateSelectedElement({ textShadow: e.target.value as any })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="none">None (Clean Flat)</option>
                        <option value="soft">Soft Ambient Shadow</option>
                        <option value="crisp">Crisp High-Contrast</option>
                        <option value="deep">Deep Cinematic Shadow</option>
                        <option value="outline">Architectural Outline</option>
                        <option value="neon-glow">Neon Glow Luminescence</option>
                      </select>
                    </div>

                    {/* Text Glow Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/70">Text Glow Aura</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!activeElementConfig.textGlow}
                            onChange={e => updateSelectedElement({ textGlow: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>

                      {activeElementConfig.textGlow ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={activeElementConfig.glowColor || activeElementConfig.color || stagedAccentColor || '#06b6d4'}
                              onChange={e => updateSelectedElement({ glowColor: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                            />
                            <div className="flex-1">
                              <input
                                type="range"
                                min="4"
                                max="36"
                                value={activeElementConfig.glowIntensity || 14}
                                onChange={e => updateSelectedElement({ glowIntensity: parseInt(e.target.value) })}
                                className="w-full accent-cyan-400"
                              />
                            </div>
                            <span className="text-[10px] font-mono text-cyan-300 w-8 text-right">
                              {activeElementConfig.glowIntensity || 14}px
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/40 pt-1">
                          Enable to render a luminous neon bloom behind letters
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 4: Live Interactive Sample Text Sandbox */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Sample Text Sandbox & Real-Time Preview</span>
                      </h4>
                      <p className="text-[11px] text-white/50">
                        Enter customized student subject titles, exam dates, or motivational affirmations to test typography live.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-white/60 text-[11px] mb-1 block">Sample Heading</label>
                      <input
                        type="text"
                        value={sampleHeadingText}
                        onChange={e => setSampleHeadingText(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-[11px] mb-1 block">Sample Widget Title</label>
                      <input
                        type="text"
                        value={sampleWidgetTitle}
                        onChange={e => setSampleWidgetTitle(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-[11px] mb-1 block">Sample Clock Digits</label>
                      <input
                        type="text"
                        value={sampleClockTime}
                        onChange={e => setSampleClockTime(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-[11px] mb-1 block">Sample Countdown Days</label>
                      <input
                        type="text"
                        value={sampleCountdownDays}
                        onChange={e => setSampleCountdownDays(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Sandbox Live Display Frame */}
                  <div
                    className="p-6 rounded-2xl border border-white/15 bg-black/60 shadow-xl overflow-hidden min-h-[140px] flex flex-col justify-center items-center text-center transition-all"
                  >
                    <div style={getInlineFontStyle(activeElementConfig)}>
                      {selectedTypographyElement === 'clockMain'
                        ? sampleClockTime
                        : selectedTypographyElement === 'clockDate'
                        ? 'WEDNESDAY, 17 OCTOBER 2026'
                        : selectedTypographyElement === 'countdownNumber'
                        ? `${sampleCountdownDays} DAYS`
                        : selectedTypographyElement === 'countdownLabel'
                        ? 'PUBLIC EXAM COUNTDOWN'
                        : selectedTypographyElement === 'widgetTitle'
                        ? sampleWidgetTitle
                        : selectedTypographyElement === 'motivationText'
                        ? `"${sampleQuoteText}"`
                        : selectedTypographyElement === 'timetableSubject'
                        ? 'PHYSICS & MATHEMATICS REVISION'
                        : selectedTypographyElement === 'timetableTime'
                        ? '08:30 AM – 10:15 AM'
                        : selectedTypographyElement === 'taskText'
                        ? 'Solve 2026 Model Paper Line-by-Line'
                        : sampleHeadingText}
                    </div>
                    <span className="mt-3 text-[10px] font-mono text-white/40 tracking-widest uppercase">
                      Element: {selectedTypographyElement} • Font: {activeElementConfig.fontFamily || 'inter'} ({activeElementConfig.fontWeight || '400'}) • Size: {activeElementConfig.fontSize || 14}px
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 15 N0T0 MINIMALIST TYPOGRAPHY STYLES ================= */}
            {activeTab === 'n0t0' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>15 N0T0-Inspired Minimalist Typography Collection</span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Original minimalist productivity typography featuring editorial whitespace, crisp terminals, and high-legibility clock numerals.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {(['all', 'minimal', 'editorial', 'terminal', 'cyber', 'brutalist'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setN0t0Category(cat)}
                        className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                          n0t0Category === cat
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {N0T0_TYPOGRAPHY_STYLES.filter(s => n0t0Category === 'all' || s.category === n0t0Category).map(style => {
                    const isSelected = stagedTypography.activeN0T0StyleId === style.id;

                    return (
                      <div
                        key={style.id}
                        onClick={() => handleApplyN0T0Style(style)}
                        className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                              {style.badge}
                            </span>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-cyan-400 text-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          {/* Live Clock Digits in this Typography Style */}
                          <div
                            className="p-3 rounded-xl bg-black/50 border border-white/5 mb-3 text-center"
                          >
                            <div
                              className="text-2xl tracking-tight text-white transition leading-none py-1"
                              style={{
                                fontFamily: style.config.fontFamily ? `'${style.config.fontFamily}', sans-serif` : undefined,
                                fontWeight: style.config.fontWeight,
                                letterSpacing: `${style.config.letterSpacing}px`,
                                textTransform: (style.config.textTransform as any) || 'none',
                                color: stagedAccentColor,
                              }}
                            >
                              {style.previewClock}
                            </div>
                            <div
                              className="text-[11px] text-white/70 line-clamp-1 mt-1.5"
                              style={{
                                fontFamily: style.config.fontFamily ? `'${style.config.fontFamily}', sans-serif` : undefined,
                                fontStyle: 'italic',
                              }}
                            >
                              "{style.previewSample}"
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white mb-0.5">{style.name}</h4>
                          <p className="text-[10px] text-cyan-300/80 font-medium mb-1 line-clamp-1">{style.tagline}</p>
                          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
                            {style.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                          <span className="capitalize">{style.category}</span>
                          <span className="text-cyan-400 font-mono group-hover:underline">Apply Typography</span>
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
                {/* Transparency Quick Controls */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Widget Transparency & Glass Material</span>
                      </h4>
                      <p className="text-[11px] text-white/50">
                        Choose whether widgets render with blurred glass backgrounds or pure seamless transparency.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllStagedTransparency(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          Object.values(stagedWidgetTransparency).every(Boolean)
                            ? 'bg-amber-400/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                        }`}
                      >
                        <span>Make All Transparent</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllStagedTransparency(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          Object.values(stagedWidgetTransparency).every(v => !v)
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                        }`}
                      >
                        <span>Make All Glass</span>
                      </button>
                    </div>
                  </div>

                  {/* Individual widget transparency chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { key: 'clock', label: 'Flocus Clock' },
                      { key: 'countdown', label: 'Countdown' },
                      { key: 'notification', label: 'Routine Alert' },
                      { key: 'tasks', label: 'Quick Tasks' },
                      { key: 'calendar', label: 'Calendar' },
                      { key: 'motivation', label: 'Motivation' },
                      { key: 'nameWidget', label: 'Centum Badge' },
                      { key: 'pomodoro', label: 'Pomodoro' },
                    ].map(item => {
                      const isTrans = stagedWidgetTransparency[item.key as keyof typeof stagedWidgetTransparency];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setStagedWidgetTransparency(prev => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof typeof stagedWidgetTransparency],
                            }));
                          }}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isTrans
                              ? 'bg-amber-400/15 border-amber-400/50 text-white'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-[11px] font-medium truncate">{item.label}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isTrans ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
                          }`}>
                            {isTrans ? 'Transp' : 'Glass'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Viewport Preview</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                1:1 Typography Scale
              </span>
            </div>

            {/* Preview Mode Selector Pills */}
            <div className="grid grid-cols-5 gap-1 mb-3 text-[10px] font-mono">
              {[
                { id: 'dashboard', label: 'All' },
                { id: 'clock', label: 'Clock' },
                { id: 'countdown', label: 'Exam' },
                { id: 'timetable', label: 'Routine' },
                { id: 'sandbox', label: 'Sandbox' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPreviewMode(m.id as any)}
                  className={`py-1 rounded-lg transition cursor-pointer text-center ${
                    previewMode === m.id
                      ? 'bg-cyan-500 text-black font-bold shadow-sm'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {m.label}
                </button>
              ))}
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

              {/* View 1: Complete Dashboard */}
              {previewMode === 'dashboard' && (
                <>
                  {/* Simulated Central Clock */}
                  <div className="relative z-10 my-auto text-center">
                    <div
                      style={getInlineFontStyle(stagedTypography.elements.clockMain)}
                      className="transition-all"
                    >
                      {previewHoursStr}:{previewMinutesStr}
                    </div>
                    <div
                      style={getInlineFontStyle(stagedTypography.elements.clockDate)}
                      className="mt-1 transition-all"
                    >
                      {stagedClockArch} • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Simulated Widgets Row */}
                  <div className="relative z-10 grid grid-cols-2 gap-2 mt-auto">
                    <div
                      className={`p-2.5 rounded-xl border text-[10px] text-white/90 overflow-hidden ${stagedWidgetStyle}`}
                    >
                      <div
                        style={getInlineFontStyle(stagedTypography.elements.widgetTitle)}
                        className="truncate text-cyan-300"
                      >
                        PUBLIC EXAM
                      </div>
                      <div
                        style={getInlineFontStyle(stagedTypography.elements.countdownNumber)}
                        className="truncate"
                      >
                        137 Days
                      </div>
                      <div
                        style={getInlineFontStyle(stagedTypography.elements.countdownLabel)}
                        className="truncate text-white/50 text-[9px]"
                      >
                        REMAINING
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border text-[10px] text-white/90 overflow-hidden ${stagedWidgetStyle}`}
                    >
                      <div
                        style={getInlineFontStyle(stagedTypography.elements.widgetTitle)}
                        className="truncate text-emerald-300"
                      >
                        STUDY TASKS
                      </div>
                      <div
                        style={getInlineFontStyle(stagedTypography.elements.taskText)}
                        className="truncate"
                      >
                        Complete physics test
                      </div>
                      <div
                        style={getInlineFontStyle(stagedTypography.elements.buttonLabel)}
                        className="truncate text-[9px] text-cyan-400 mt-0.5"
                      >
                        2 / 3 COMPLETED
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* View 2: Clock Close-up */}
              {previewMode === 'clock' && (
                <div className="relative z-10 m-auto text-center w-full px-2">
                  <div
                    style={getInlineFontStyle(stagedTypography.elements.clockMain)}
                    className="leading-none transition-all drop-shadow-lg"
                  >
                    {previewHoursStr}:{previewMinutesStr}:{previewSecondsStr}
                  </div>
                  <div
                    style={getInlineFontStyle(stagedTypography.elements.clockDate)}
                    className="mt-3 opacity-90 transition-all"
                  >
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
                    Arch: {stagedClockArch} • Font: {stagedTypography.elements.clockMain?.fontFamily || stagedFontClock}
                  </div>
                </div>
              )}

              {/* View 3: Exam Countdown Close-up */}
              {previewMode === 'countdown' && (
                <div className="relative z-10 m-auto text-center w-full px-4 py-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
                  <div
                    style={getInlineFontStyle(stagedTypography.elements.countdownLabel)}
                    className="mb-1 text-cyan-300 font-bold"
                  >
                    PUBLIC EXAMS BEGIN
                  </div>
                  <div
                    style={getInlineFontStyle(stagedTypography.elements.countdownNumber)}
                    className="leading-none py-1"
                  >
                    {sampleCountdownDays} DAYS
                  </div>
                  <div
                    style={getInlineFontStyle(stagedTypography.elements.widgetBody)}
                    className="mt-2 text-white/70 text-xs"
                  >
                    Target: Chemistry Centum & Advanced Mathematics
                  </div>
                </div>
              )}

              {/* View 4: Routine & Timetable Close-up */}
              {previewMode === 'timetable' && (
                <div className="relative z-10 m-auto w-full p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-2">
                  <div
                    style={getInlineFontStyle(stagedTypography.elements.widgetTitle)}
                    className="text-amber-300 font-bold"
                  >
                    TODAY'S STUDY TIMETABLE
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <span style={getInlineFontStyle(stagedTypography.elements.timetableSubject)}>
                        Mathematics Calculus
                      </span>
                      <span style={getInlineFontStyle(stagedTypography.elements.timetableTime)} className="text-cyan-300">
                        08:00 – 09:30
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <span style={getInlineFontStyle(stagedTypography.elements.timetableSubject)}>
                        Physics Optics Lab
                      </span>
                      <span style={getInlineFontStyle(stagedTypography.elements.timetableTime)} className="text-amber-300">
                        10:00 – 11:30
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* View 5: Selected Element Sandbox */}
              {previewMode === 'sandbox' && (
                <div className="relative z-10 m-auto text-center w-full p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-2">
                    Active Element: {selectedTypographyElement}
                  </div>
                  <div style={getInlineFontStyle(activeElementConfig)}>
                    {selectedTypographyElement === 'clockMain'
                      ? sampleClockTime
                      : selectedTypographyElement === 'clockDate'
                      ? 'WEDNESDAY, 17 OCTOBER 2026'
                      : selectedTypographyElement === 'countdownNumber'
                      ? `${sampleCountdownDays} DAYS`
                      : selectedTypographyElement === 'countdownLabel'
                      ? 'PUBLIC EXAM COUNTDOWN'
                      : selectedTypographyElement === 'widgetTitle'
                      ? sampleWidgetTitle
                      : selectedTypographyElement === 'motivationText'
                      ? `"${sampleQuoteText}"`
                      : sampleHeadingText}
                  </div>
                </div>
              )}
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
