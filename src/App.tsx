/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  LayoutGrid,
  Eye,
  Maximize,
  Menu as MenuIcon,
  X,
  Upload,
  RotateCcw,
  Sliders,
  Check,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Bell,
  Sparkles,
  School,
  Coffee,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Target,
  Award,
  Zap,
  Lock,
  Unlock,
  Settings2,
  Flame,
  Search,
  Quote,
  RefreshCw,
  Download,
  FileJson,
  Palette,
  Cloud,
  CloudCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  Shield,
  AlertTriangle,
  Timer,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Minimize,
  Crosshair,
  Grid,
  Move,
  MousePointerClick,
  Layers,
  ArrowRight,
  CornerDownRight,
  Pin,
  Copy,
  Minimize2,
  ChevronUp,
  ChevronDown,
  FileText,
  Heart,
  Bookmark,
  Smartphone,
  Laptop,
  Image as ImageIcon,
  Shuffle,
  Mail,
  Key,
  CheckCheck,
  BookOpen,
} from 'lucide-react';
import { wallpaperProvider } from './utils/wallpaperProvider';
import {
  DAILY_MOTIVATION_QUOTES,
  DAILY_MOTIVATION_MAP,
  MOTIVATION_QUOTES,
  DailyMotivationQuote,
  getTodayLocalDateString,
  getQuoteForDate,
  getAdjacentQuoteDate,
} from './utils/quotes';
import {
  auth,
  saveUserDashboard,
  loadUserDashboard,
  subscribeToUserDashboard,
  signInWithGoogle,
  signInAsGuest,
  signInWithEmail,
  signUpWithEmail,
  logOutUser,
  onAuthStateChanged,
  User,
  SyncStatus,
  UserDashboardPayload,
  DailyRegistryEntryItem,
  DailyRegistryDayRecord,
  saveDailyRegistryDay,
  saveDailyRegistryEntryItem,
  loadDailyRegistryDay,
  loadUserDailyRegistryAll,
  subscribeToUserDailyRegistry,
  updateDailySummaryNotes,
  deleteDailyRegistryEntry,
  verifyWritePermission,
  getLocalDateString,
  getDayOfWeekName,
} from './utils/firebase';
import VisualCustomizationStudio from './components/VisualCustomizationStudio';
import AnimatedCharacterBackdrop from './components/AnimatedCharacterBackdrop';
import DailyRegistryHistoryModal from './components/DailyRegistryHistoryModal';
import {
  STUDIO_LAYOUT_ARRANGEMENTS,
  computePresetWidgetCoordinates,
  computeLaptopFitCoordinates,
  computeMobileFitCoordinates,
  DashboardWidgetKey,
} from './utils/layoutPresetsData';
import {
  STUDIO_THEMES,
  STUDIO_FONTS,
  STUDIO_PALETTES,
  INITIAL_PRESETS,
  SavedPreset,
  ElementTypographyConfig,
  DashboardTypographyConfig,
  DEFAULT_ELEMENT_TYPOGRAPHY,
  N0T0_TYPOGRAPHY_STYLES,
  N0T0StyleOption,
  CustomTextItem,
  CanvasThemeType,
  WidgetSpecificStyle,
  DashboardWidgetStyles,
  AnimationControlsConfig,
  DailyRegisterEntry,
  DEFAULT_DAILY_REGISTER_ENTRIES,
} from './utils/visualStudioData';

// Web Audio API Synthesizer for study alerts & task completions
function playWebAudioChime(type: 'task' | 'pomoEnd' | 'pomoStart') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (type === 'task') {
      // Pleasant light chime (E6 -> G#6)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'pomoEnd') {
      // Harmonic 4-bell alert chime (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.16;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.95);
      });
    } else if (type === 'pomoStart') {
      // Subtle start focus beep
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  } catch {
    // Audio Context restriction handled gracefully
  }
}

interface CuratedWallpaper {
  id: string;
  title: string;
  thumb: string;
  url: string;
}

const CURATED_WALLPAPERS: CuratedWallpaper[] = [
  {
    id: 'jp-tokyo-cyberpunk',
    title: 'Cyber Tokyo Night',
    thumb: '/wallpapers/jp_tokyo_cyberpunk.jpg',
    url: '/wallpapers/jp_tokyo_cyberpunk.jpg',
  },
  {
    id: 'art-anime-cherry-blossom',
    title: 'Mount Fuji & Cherry Blossoms (Vector)',
    thumb: '/wallpapers/art_anime_cherry_blossom.svg',
    url: '/wallpapers/art_anime_cherry_blossom.svg',
  },
  {
    id: 'kr-seoul-night',
    title: 'Seoul Han River Skyline',
    thumb: '/wallpapers/kr_seoul_night.jpg',
    url: '/wallpapers/kr_seoul_night.jpg',
  },
  {
    id: 'kr-cozy-desk',
    title: 'Korean Warm Study Desk',
    thumb: '/wallpapers/kr_cozy_desk.jpg',
    url: '/wallpapers/kr_cozy_desk.jpg',
  },
  {
    id: 'cn-misty-mountains',
    title: 'Guilin Karst Mountains & Mist',
    thumb: '/wallpapers/cn_misty_mountains.jpg',
    url: '/wallpapers/cn_misty_mountains.jpg',
  },
  {
    id: 'cn-traditional-lanterns',
    title: 'Traditional Chinese Lanterns',
    thumb: '/wallpapers/cn_traditional_lanterns.jpg',
    url: '/wallpapers/cn_traditional_lanterns.jpg',
  },
  {
    id: 'art-lofi-cyberpunk-neon',
    title: 'Lofi Cyberpunk Neon Grid (Vector)',
    thumb: '/wallpapers/art_lofi_cyberpunk_neon.svg',
    url: '/wallpapers/art_lofi_cyberpunk_neon.svg',
  },
  {
    id: 'focus-alpine-pines',
    title: 'Misty Alpine Pines & Fog',
    thumb: '/wallpapers/focus_alpine_pines.jpg',
    url: '/wallpapers/focus_alpine_pines.jpg',
  },
  {
    id: 'focus-milky-way',
    title: 'Milky Way Observatory',
    thumb: '/wallpapers/focus_milky_way.jpg',
    url: '/wallpapers/focus_milky_way.jpg',
  },
  {
    id: 'focus-golden-sunset',
    title: 'Sunset Gradient Calm Horizon',
    thumb: '/wallpapers/focus_golden_sunset.jpg',
    url: '/wallpapers/focus_golden_sunset.jpg',
  },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ================= PUBLIC EXAM TIMETABLE =================
export interface ExamScheduleItem {
  id: string;
  dateStr: string;
  dayOfWeek: string;
  subject: string;
  icon: string;
  isCentumTarget: boolean;
  targetYearMonthDay: string; // YYYY-MM-DD
}

export const PUBLIC_EXAM_TIMETABLE: ExamScheduleItem[] = [
  { id: 'exam-1', dateStr: '03 Mar', dayOfWeek: 'Wed', subject: 'Tamil', icon: '📝', isCentumTarget: false, targetYearMonthDay: '2027-03-03' },
  { id: 'exam-2', dateStr: '08 Mar', dayOfWeek: 'Mon', subject: 'English', icon: '📝', isCentumTarget: false, targetYearMonthDay: '2027-03-08' },
  { id: 'exam-3', dateStr: '12 Mar', dayOfWeek: 'Fri', subject: 'Chemistry', icon: '🧪', isCentumTarget: true, targetYearMonthDay: '2027-03-12' },
  { id: 'exam-4', dateStr: '19 Mar', dayOfWeek: 'Fri', subject: 'Biology', icon: '🧬', isCentumTarget: false, targetYearMonthDay: '2027-03-19' },
  { id: 'exam-5', dateStr: '23 Mar', dayOfWeek: 'Tue', subject: 'Physics', icon: '⚡', isCentumTarget: true, targetYearMonthDay: '2027-03-23' },
  { id: 'exam-6', dateStr: '29 Mar', dayOfWeek: 'Mon', subject: 'Mathematics', icon: '📐', isCentumTarget: true, targetYearMonthDay: '2027-03-29' },
];

// ================= STUDY ROUTINES =================
export interface RoutineSlot {
  startMin: number;
  endMin: number;
  timeLabel: string;
  activity: string;
  category: 'tuition' | 'study' | 'school' | 'personal' | 'sleep' | 'test';
}

function parseTimeToMinutes(h: number, m: number): number {
  return h * 60 + m;
}

export const SCHOOL_DAYS_ROUTINE: RoutineSlot[] = [
  { startMin: parseTimeToMinutes(4, 30), endMin: parseTimeToMinutes(5, 0), timeLabel: '04:30 AM - 05:00 AM', activity: 'Wake Up & Fresh Up', category: 'personal' },
  { startMin: parseTimeToMinutes(5, 0), endMin: parseTimeToMinutes(6, 0), timeLabel: '05:00 AM - 06:00 AM', activity: 'Morning Tuition', category: 'tuition' },
  { startMin: parseTimeToMinutes(6, 0), endMin: parseTimeToMinutes(7, 0), timeLabel: '06:00 AM - 07:00 AM', activity: 'Mathematics (Formula Mastery & Drills)', category: 'study' },
  { startMin: parseTimeToMinutes(7, 0), endMin: parseTimeToMinutes(8, 0), timeLabel: '07:00 AM - 08:00 AM', activity: 'Breakfast & Commute to School', category: 'personal' },
  { startMin: parseTimeToMinutes(8, 0), endMin: parseTimeToMinutes(17, 0), timeLabel: '08:00 AM - 05:00 PM', activity: 'School Hours (Strategic Revision & Free Periods)', category: 'school' },
  { startMin: parseTimeToMinutes(17, 0), endMin: parseTimeToMinutes(18, 30), timeLabel: '05:00 PM - 06:30 PM', activity: 'Commute Back, Snack & Mental Reset', category: 'personal' },
  { startMin: parseTimeToMinutes(18, 30), endMin: parseTimeToMinutes(20, 0), timeLabel: '06:30 PM - 08:00 PM', activity: 'Evening Tuition', category: 'tuition' },
  { startMin: parseTimeToMinutes(20, 0), endMin: parseTimeToMinutes(20, 45), timeLabel: '08:00 PM - 08:45 PM', activity: 'Dinner & Rest', category: 'personal' },
  { startMin: parseTimeToMinutes(20, 45), endMin: parseTimeToMinutes(22, 0), timeLabel: '08:45 PM - 10:00 PM', activity: 'Physics (Board 5-Markers & Core Derivations)', category: 'study' },
  { startMin: parseTimeToMinutes(22, 0), endMin: parseTimeToMinutes(23, 15), timeLabel: '10:00 PM - 11:15 PM', activity: 'Chemistry (Organic Reactions & Theory Lines)', category: 'study' },
  { startMin: parseTimeToMinutes(23, 15), endMin: parseTimeToMinutes(23, 45), timeLabel: '11:15 PM - 11:45 PM', activity: 'CUET / BITSAT Speed MCQs (Timed Drill)', category: 'test' },
  { startMin: parseTimeToMinutes(23, 45), endMin: parseTimeToMinutes(28, 30), timeLabel: '11:45 PM - 04:30 AM', activity: 'Deep Sleep & Recovery', category: 'sleep' },
];

export const LEAVE_DAYS_ROUTINE: RoutineSlot[] = [
  { startMin: parseTimeToMinutes(5, 0), endMin: parseTimeToMinutes(6, 0), timeLabel: '05:00 AM - 06:00 AM', activity: 'Morning Tuition / Early Review', category: 'tuition' },
  { startMin: parseTimeToMinutes(6, 0), endMin: parseTimeToMinutes(8, 30), timeLabel: '06:00 AM - 08:30 AM', activity: 'Mathematics (5-Markers & Problem Sets)', category: 'study' },
  { startMin: parseTimeToMinutes(8, 30), endMin: parseTimeToMinutes(9, 15), timeLabel: '08:30 AM - 09:15 AM', activity: 'Breakfast & Walk', category: 'personal' },
  { startMin: parseTimeToMinutes(9, 15), endMin: parseTimeToMinutes(11, 45), timeLabel: '09:15 AM - 11:45 AM', activity: 'Physics (Derivations & Problem Workouts)', category: 'study' },
  { startMin: parseTimeToMinutes(11, 45), endMin: parseTimeToMinutes(13, 0), timeLabel: '11:45 AM - 01:00 PM', activity: 'Biology (Theory Core & Diagrams)', category: 'study' },
  { startMin: parseTimeToMinutes(13, 0), endMin: parseTimeToMinutes(14, 15), timeLabel: '01:00 PM - 02:15 PM', activity: 'Lunch & Mandatory Power Nap', category: 'personal' },
  { startMin: parseTimeToMinutes(14, 15), endMin: parseTimeToMinutes(16, 15), timeLabel: '02:15 PM - 04:15 PM', activity: 'Robotics & AI Project (Deep Focus Sprint)', category: 'study' },
  { startMin: parseTimeToMinutes(16, 15), endMin: parseTimeToMinutes(18, 30), timeLabel: '04:15 PM - 06:30 PM', activity: 'Chemistry (Named Reactions & Physical)', category: 'study' },
  { startMin: parseTimeToMinutes(18, 30), endMin: parseTimeToMinutes(20, 0), timeLabel: '06:30 PM - 08:00 PM', activity: 'Evening Tuition / Homework Wrap', category: 'tuition' },
  { startMin: parseTimeToMinutes(20, 0), endMin: parseTimeToMinutes(20, 45), timeLabel: '08:00 PM - 08:45 PM', activity: 'Dinner & Family Reset', category: 'personal' },
  { startMin: parseTimeToMinutes(20, 45), endMin: parseTimeToMinutes(22, 15), timeLabel: '08:45 PM - 10:15 PM', activity: 'CUET / BITSAT Full Mock Test Drill', category: 'test' },
  { startMin: parseTimeToMinutes(22, 15), endMin: parseTimeToMinutes(23, 15), timeLabel: '10:15 PM - 11:15 PM', activity: 'State Board Speed Answer Rehearsal (2m, 3m, 5m)', category: 'study' },
  { startMin: parseTimeToMinutes(23, 15), endMin: parseTimeToMinutes(29, 0), timeLabel: '11:15 PM - 05:00 AM', activity: 'Solid Overnight Sleep', category: 'sleep' },
];

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const DEFAULT_TASKS: TaskItem[] = [
  { id: '1', text: 'Review Chapter 4 calculus & formula sheet', completed: false, createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Solve 2026 public exam model paper', completed: false, createdAt: Date.now() - 1800000 },
  { id: '3', text: 'Revise chemistry periodic table trends', completed: true, createdAt: Date.now() - 900000 },
];

// ================= OPTIONAL FEATURES INTERFACE =================
export interface OptionalFeaturesConfig {
  focusMode: boolean;
  calendarWidget: boolean;
  wallpaperCustomization: boolean;
  widgetCustomization: boolean;
  dailyMotivation: boolean;
}

export const DEFAULT_OPTIONAL_FEATURES: OptionalFeaturesConfig = {
  focusMode: true,
  calendarWidget: true,
  wallpaperCustomization: true,
  widgetCustomization: true,
  dailyMotivation: true,
};

// ================= PERSONALIZATION CENTER INTERFACE =================
export interface PersonalizationConfig {
  themeMode: 'midnight' | 'cyber' | 'espresso';
  accentColor: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'sky';
  fontFamily: 'inter' | 'jakarta' | 'mono' | 'anton';
  widgetRadius: 'normal' | 'smooth' | 'pill';
  layoutPreset: 'compact' | 'balanced' | 'spacious';
  reducedMotion: boolean;
}

export const DEFAULT_PERSONALIZATION: PersonalizationConfig = {
  themeMode: 'midnight',
  accentColor: 'cyan',
  fontFamily: 'inter',
  widgetRadius: 'smooth',
  layoutPreset: 'balanced',
  reducedMotion: false,
};

interface DashboardConfig {
  activeWallpaper: string;
  wallpaperUrl: string;
  videoUrl?: string;
  canvasTheme: CanvasThemeType;
  bgDimmer: number;
  bgBlur: number;
  animationIntensity: number;
  isWallpaperStatic: boolean;
  routineMode: 'school' | 'leave';
  optionalFeatures: OptionalFeaturesConfig;
  personalization: PersonalizationConfig;
  layoutMode?: 'grid' | 'freeform';
  selectedGridPresetId?: string;
  gridGaps?: number;
  gridMargins?: number;
  gridAlignment?: 'center' | 'top' | 'stretch';
  snapToGrid?: boolean;
  snapGridSize?: number;
  freeformLayout?: Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }>;
  gridLayout?: Record<string, { x: number; y: number; width: number; height: number }>;
  animationControls?: AnimationControlsConfig;
  widgetStyles?: DashboardWidgetStyles;
  motivation: {
    visible: boolean;
    glassBg: boolean;
    quoteIndex: number;
    personalIntention: string;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  nameWidget: {
    title: string;
    visible: boolean;
    glassBg: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  clock: {
    architecture: string;
    color: string;
    glow: number;
    is12h: boolean;
    showSeconds: boolean;
    showMs: boolean;
    showDate: boolean;
    showDay: boolean;
    glassBg: boolean;
    visible?: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  countdown: {
    title: string;
    targetDate: string;
    showSeconds: boolean;
    glassBg: boolean;
    visible?: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  tasks: {
    title: string;
    visible: boolean;
    glassBg: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  notification: {
    visible: boolean;
    glassBg: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  calendar: {
    visible: boolean;
    glassBg: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  pomodoro: {
    visible: boolean;
    glassBg: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  scratchpad: {
    visible: boolean;
    glassBg: boolean;
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
  activeThemeId?: string;
  bgSaturation?: number;
  bgBrightness?: number;
  wallpaperScaling?: 'cover' | 'contain' | 'fill';
  widgetStyle?: string;
  typography?: DashboardTypographyConfig;
  customColors?: {
    accent: string;
    primaryText: string;
    secondaryText: string;
    surface: string;
  };
}

const DEFAULT_CONFIG: DashboardConfig = {
  activeWallpaper: 'jp-tokyo-cyberpunk',
  wallpaperUrl: '/wallpapers/jp_tokyo_cyberpunk.jpg',
  canvasTheme: 'minimal',
  bgDimmer: 35,
  bgBlur: 0,
  bgSaturation: 100,
  bgBrightness: 95,
  animationIntensity: 1.0,
  isWallpaperStatic: false,
  wallpaperScaling: 'cover',
  widgetStyle: 'frosted-glass',
  activeThemeId: 'obsidian-glass',
  layoutMode: 'grid',
  selectedGridPresetId: 'preset-grid-1',
  gridGaps: 16,
  gridMargins: 24,
  gridAlignment: 'center',
  snapToGrid: true,
  snapGridSize: 20,
  animationControls: {
    enabled: true,
    intensity: 'medium',
    speed: 1.0,
    energyColor: '#06b6d4',
    energyIntensity: 60,
    focalPosition: 'center',
    characterScale: 100,
    dimmer: 35,
    overlayOpacity: 70,
  },
  widgetStyles: {
    global: {
      bgColor: '#0c1a14',
      bgOpacity: 82,
      blur: 18,
      borderColor: '#059669',
      borderWidth: 1,
      borderRadius: 20,
      shadowColor: 'rgba(0,0,0,0.65)',
      shadowBlur: 25,
      glowColor: '#10b981',
      glowIntensity: 35,
      textColor: '#ffffff',
      accentColor: '#10b981',
      padding: 16,
    },
    overrides: {},
  },
  typography: {
    globalScale: 1.0,
    elements: DEFAULT_ELEMENT_TYPOGRAPHY,
    fontClock: 'orbitron',
    fontHeading: 'orbitron',
    fontBody: 'rajdhani',
    fontCountdown: 'orbitron',
    fontLabels: 'rajdhani',
  },
  customColors: {
    accent: '#10b981',
    primaryText: '#ffffff',
    secondaryText: '#cbd5e1',
    surface: '#0c1a14',
  },
  routineMode: 'school',
  optionalFeatures: DEFAULT_OPTIONAL_FEATURES,
  personalization: DEFAULT_PERSONALIZATION,
  motivation: {
    visible: true,
    glassBg: true,
    quoteIndex: 0,
    personalIntention: 'Target: Centum in Chemistry, Physics & Mathematics',
    x: null,
    y: null,
    width: 440,
    height: 140,
  },
  nameWidget: {
    title: 'BK NITHILESHVAR',
    visible: true,
    glassBg: true,
    x: null,
    y: null,
    width: 480,
    height: 100,
  },
  clock: {
    architecture: 'minimal',
    color: '#ffffff',
    glow: 0,
    is12h: false,
    showSeconds: true,
    showMs: true,
    showDate: true,
    showDay: true,
    glassBg: false,
    visible: true,
    x: null,
    y: null,
    width: 580,
    height: 180,
  },
  countdown: {
    title: 'PUBLIC EXAM COUNTDOWN',
    targetDate: '2027-03-03T00:00:00',
    showSeconds: true,
    glassBg: false,
    visible: true,
    x: null,
    y: null,
    width: 460,
    height: 170,
  },
  tasks: {
    title: 'QUICK TASKS',
    visible: true,
    glassBg: true,
    x: null,
    y: null,
    width: 360,
    height: 340,
  },
  notification: {
    visible: true,
    glassBg: true,
    x: null,
    y: null,
    width: 460,
    height: 170,
  },
  calendar: {
    visible: true,
    glassBg: true,
    x: null,
    y: null,
    width: 380,
    height: 340,
  },
  pomodoro: {
    visible: true,
    glassBg: true,
    x: null,
    y: null,
    width: 360,
    height: 240,
  },
  scratchpad: {
    visible: true,
    glassBg: true,
    x: null,
    y: null,
    width: 380,
    height: 300,
  },
};

export default function App() {
  // Load configuration with robust fallbacks
  const [config, setConfig] = useState<DashboardConfig>(() => {
    try {
      const saved = localStorage.getItem('flocus_dashboard_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          scratchpad: parsed.scratchpad ? { ...DEFAULT_CONFIG.scratchpad, ...parsed.scratchpad } : DEFAULT_CONFIG.scratchpad,
          routineMode: parsed.routineMode || 'school',
          animationIntensity: parsed.animationIntensity ?? 1.0,
          isWallpaperStatic: parsed.isWallpaperStatic ?? false,
          optionalFeatures: { ...DEFAULT_OPTIONAL_FEATURES, ...(parsed.optionalFeatures || {}) },
          personalization: { ...DEFAULT_PERSONALIZATION, ...(parsed.personalization || {}) },
          typography: {
            ...DEFAULT_CONFIG.typography,
            ...(parsed.typography || {}),
            elements: {
              ...DEFAULT_ELEMENT_TYPOGRAPHY,
              ...(parsed.typography?.elements || {}),
            },
          },
          customColors: { ...DEFAULT_CONFIG.customColors, ...(parsed.customColors || {}) },
          widgetStyle: parsed.widgetStyle || DEFAULT_CONFIG.widgetStyle,
          activeThemeId: parsed.activeThemeId || DEFAULT_CONFIG.activeThemeId,
          layoutMode: parsed.layoutMode || DEFAULT_CONFIG.layoutMode,
          selectedGridPresetId: parsed.selectedGridPresetId || DEFAULT_CONFIG.selectedGridPresetId,
          gridGaps: parsed.gridGaps ?? DEFAULT_CONFIG.gridGaps,
          gridMargins: parsed.gridMargins ?? DEFAULT_CONFIG.gridMargins,
          gridAlignment: parsed.gridAlignment || DEFAULT_CONFIG.gridAlignment,
          snapToGrid: parsed.snapToGrid ?? DEFAULT_CONFIG.snapToGrid,
          snapGridSize: parsed.snapGridSize ?? DEFAULT_CONFIG.snapGridSize,
          freeformLayout: parsed.freeformLayout || {},
          gridLayout: parsed.gridLayout || {},
          animationControls: { ...DEFAULT_CONFIG.animationControls, ...(parsed.animationControls || {}) },
          widgetStyles: {
            global: { ...DEFAULT_CONFIG.widgetStyles?.global, ...(parsed.widgetStyles?.global || {}) },
            overrides: parsed.widgetStyles?.overrides || {},
          },
          bgBrightness: parsed.bgBrightness ?? 100,
          bgSaturation: parsed.bgSaturation ?? 100,
          wallpaperScaling: parsed.wallpaperScaling || 'cover',
          motivation: { ...DEFAULT_CONFIG.motivation, ...(parsed.motivation || {}) },
          nameWidget: { ...DEFAULT_CONFIG.nameWidget, ...(parsed.nameWidget || {}) },
          clock: { ...DEFAULT_CONFIG.clock, ...(parsed.clock || {}) },
          countdown: { ...DEFAULT_CONFIG.countdown, ...(parsed.countdown || {}) },
          tasks: { ...DEFAULT_CONFIG.tasks, ...(parsed.tasks || {}) },
          notification: { ...DEFAULT_CONFIG.notification, ...(parsed.notification || {}) },
          calendar: { ...DEFAULT_CONFIG.calendar, ...(parsed.calendar || {}) },
          pomodoro: { ...DEFAULT_CONFIG.pomodoro, ...(parsed.pomodoro || {}) },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  // Persistent Quick Tasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const savedTasks = localStorage.getItem('flocus_quick_tasks');
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
    } catch {
      // ignore
    }
    return DEFAULT_TASKS;
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'timetable' | 'routine' | 'tasks' | 'clock' | 'countdown' | 'wallpaper' | 'widgets' | 'personalization' | 'backup' | 'cloud' | 'registry'>('features');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusedWidget, setFocusedWidget] = useState<DashboardWidgetKey | null>(null);
  const [urlInput, setUrlInput] = useState('');

  // Task Completion Animation State
  const [justCompletedTaskId, setJustCompletedTaskId] = useState<string | null>(null);

  // Focus-Enhancing Pomodoro Timer State
  const [pomoMode, setPomoMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(25 * 60);
  const [pomoTotalSeconds, setPomoTotalSeconds] = useState<number>(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState<boolean>(false);
  const [pomoStreak, setPomoStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('flocus_pomo_streak');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [pomoAlertActive, setPomoAlertActive] = useState<boolean>(false);
  const [pomoSoundEnabled, setPomoSoundEnabled] = useState<boolean>(true);

  // Visual Customization Studio State
  const [studioOpen, setStudioOpen] = useState(false);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => {
    try {
      const raw = localStorage.getItem('flocus_saved_presets');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return INITIAL_PRESETS;
  });

  const handleUpdatePresets = useCallback((newPresets: SavedPreset[]) => {
    setSavedPresets(newPresets);
    try {
      localStorage.setItem('flocus_saved_presets', JSON.stringify(newPresets));
    } catch {
      // ignore
    }
  }, []);

  // Quick Access Command Menu State
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // Firebase Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthSignUp, setIsAuthSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('flocus_auto_sync');
    return saved !== null ? saved === 'true' : true;
  });
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const isRemoteUpdateRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const isRestoringRef = useRef<boolean>(false);
  const restoredUserUidRef = useRef<string | null>(null);
  const lastSyncedPayloadRef = useRef<string | null>(null);
  const pendingSavePromiseRef = useRef<Promise<any> | null>(null);

  // Firebase Daily Registry + Personal History State
  const [dailyRegistryHistory, setDailyRegistryHistory] = useState<Record<string, DailyRegistryDayRecord>>({});
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const dailyRegistryUnsubRef = useRef<(() => void) | null>(null);

  // Backup & Restore State
  const [backupPreview, setBackupPreview] = useState<{
    version: string;
    exportedAt: string;
    tasksCount: number;
    clockArch: string;
    examDate: string;
    rawPayload: any;
  } | null>(null);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calendar State (Viewing month/year)
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());

  // Live Time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Scratchpad / Quick Notes Widget State
  const [scratchpadCollapsed, setScratchpadCollapsed] = useState(false);
  const [scratchpadText, setScratchpadText] = useState<string>(() => {
    try {
      return localStorage.getItem('flocus_scratchpad_notes') || '';
    } catch {
      return '';
    }
  });
  const [scratchpadSavedPulse, setScratchpadSavedPulse] = useState(false);
  const [scratchpadCopyFeedback, setScratchpadCopyFeedback] = useState(false);
  const scratchpadSaveTimeoutRef = useRef<any>(null);

  const handleScratchpadChange = useCallback((newText: string) => {
    setScratchpadText(newText);
    try {
      localStorage.setItem('flocus_scratchpad_notes', newText);
      setScratchpadSavedPulse(true);
      if (scratchpadSaveTimeoutRef.current) clearTimeout(scratchpadSaveTimeoutRef.current);
      scratchpadSaveTimeoutRef.current = setTimeout(() => {
        setScratchpadSavedPulse(false);
      }, 1200);
    } catch {
      // ignore
    }
  }, []);

  const handleCopyScratchpad = useCallback(() => {
    if (!scratchpadText) return;
    navigator.clipboard.writeText(scratchpadText);
    setScratchpadCopyFeedback(true);
    setTimeout(() => setScratchpadCopyFeedback(false), 2000);
  }, [scratchpadText]);

  const handleClearScratchpad = useCallback(() => {
    handleScratchpadChange('');
  }, [handleScratchpadChange]);

  // Daily Register & Study Summary State
  const [dailyRegisterEntries, setDailyRegisterEntries] = useState<DailyRegisterEntry[]>(() => {
    try {
      const saved = localStorage.getItem('flocus_daily_register_entries');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_DAILY_REGISTER_ENTRIES;
  });

  // Persisted Favourite Quotes (stored in localStorage and synced to cloud)
  const [favouriteQuotes, setFavouriteQuotes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flocus_favourite_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailySummaryOpen, setDailySummaryOpen] = useState(false);
  const [dailyRegViewMode, setDailyRegViewMode] = useState<'log' | 'notes'>('log');
  const [newRegSubject, setNewRegSubject] = useState('Mathematics');
  const [newRegTopic, setNewRegTopic] = useState('');
  const [newRegNotes, setNewRegNotes] = useState('');
  const [newRegDuration, setNewRegDuration] = useState(45);
  const [newRegRating, setNewRegRating] = useState(5);
  const [dailySummaryFilterSubject, setDailySummaryFilterSubject] = useState('all');
  const [dailySummarySearch, setDailySummarySearch] = useState('');
  const [registerSuccessPulse, setRegisterSuccessPulse] = useState(false);

  // Screen responsiveness detector (Laptop vs Mobile)
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [viewportWidth, setViewportWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1280);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      setIsMobileScreen(w < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Widget DOM refs
  const nameWidgetRef = useRef<HTMLDivElement | null>(null);
  const clockRef = useRef<HTMLDivElement | null>(null);
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const tasksRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const motivationRef = useRef<HTMLDivElement | null>(null);
  const pomodoroRef = useRef<HTMLDivElement | null>(null);
  const scratchpadRef = useRef<HTMLDivElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const [placementModal, setPlacementModal] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    occupiedBy: DashboardWidgetKey | null;
    occupiedWidgetLabel: string | null;
    nearestGridSlot?: { name: string; cellX: number; cellY: number };
  } | null>(null);
  const [isPlacementModeActive, setIsPlacementModeActive] = useState<boolean>(false);

  // Right-Click Gesture Detector Ref (Double-click 300ms threshold timer)
  const rightClickDetectorRef = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    lastTime: number;
    clickX: number;
    clickY: number;
  }>({
    timer: null,
    lastTime: 0,
    clickX: 0,
    clickY: 0,
  });

  // Interaction tracking (drag/resize)
  const dragResizeState = useRef<{
    type: 'drag' | 'resize' | null;
    widget: DashboardWidgetKey | null;
    handle?: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
  }>({
    type: null,
    widget: null,
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    initW: 0,
    initH: 0,
  });

  // Save config helper
  const updateConfig = useCallback((updater: (prev: DashboardConfig) => DashboardConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('flocus_dashboard_config', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Save Tasks Helper
  const saveTasksList = useCallback((updater: (prev: TaskItem[]) => TaskItem[]) => {
    setTasks(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('flocus_quick_tasks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Save Daily Register entries with local storage and Firebase auto-sync
  const saveDailyRegisterList = useCallback((updater: (prev: DailyRegisterEntry[]) => DailyRegisterEntry[]) => {
    setDailyRegisterEntries(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('flocus_daily_register_entries', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Helper: Safely add an activity entry to Firebase Daily Registry under users/{uid}/dailyRegistry/{date}/entries/{id}
  const recordDailyRegistryActivity = useCallback(async (
    entryData: Omit<DailyRegistryEntryItem, 'id' | 'createdAt'>,
    targetDate: string = getLocalDateString()
  ) => {
    if (!currentUser) {
      console.log('[DailyRegistry Local] Activity noted (unauthenticated):', entryData.description);
      return;
    }

    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: DailyRegistryEntryItem = {
      ...entryData,
      id: entryId,
      createdAt: Date.now(),
    };

    try {
      // Common registry: ignore subject-wise logic, update day-level totals only
      const currentDay = dailyRegistryHistory[targetDate];
      const prevEntries = currentDay?.entries ? Object.values(currentDay.entries) : [];
      const updatedEntriesList = [...prevEntries, fullEntry];
      const totalMinutes = updatedEntriesList.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);

      const fullPath = `users/${currentUser.uid}/dailyRegistry/${targetDate}/entries/${entryId}`;
      console.debug(`[DailyRegistry] Writing activity to path: ${fullPath}`);

      await saveDailyRegistryEntryItem(currentUser.uid, targetDate, fullEntry, {
        totalStudyMinutes: totalMinutes,
      });

      console.log(`[DailyRegistry] Successfully recorded activity for ${targetDate}: ${entryData.description}`);
      
      // Force-sync state from database
      const updatedHistory = await loadUserDailyRegistryAll(currentUser.uid);
      setDailyRegistryHistory(updatedHistory || {});
    } catch (err: any) {
      console.error(`[DailyRegistry Critical Error] Failed to save entry for UID ${currentUser.uid} at ${targetDate}:`, err);
      console.error(`Error Code: ${err.code || 'N/A'}, Message: ${err.message || 'No message provided'}`);
      setSyncStatus('error');
    }
  }, [currentUser, dailyRegistryHistory]);

  const handleAddDailyRegisterEntry = useCallback(() => {
    if (!newRegTopic.trim() && !newRegNotes.trim()) return;

    const localDate = getLocalDateString();
    const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: DailyRegisterEntry = {
      id: `entry-${Date.now()}`,
      date: localDate,
      time: localTime,
      subject: newRegSubject,
      topic: newRegTopic.trim() || `${newRegSubject} Session`,
      notes: newRegNotes.trim() || 'Logged via Daily Register.',
      durationMinutes: newRegDuration,
      status: 'completed',
      rating: newRegRating,
      createdAt: Date.now(),
    };

    saveDailyRegisterList(prev => [newEntry, ...prev]);

    // Automatically record to persistent Firebase Daily Registry under users/{uid}/dailyRegistry/{date}/entries
    if (currentUser) {
        recordDailyRegistryActivity({
          timestamp: new Date().toISOString(),
          time: localTime,
          eventType: 'manual_log',
          description: `${newRegTopic.trim() || 'Study Session'}`,
          topic: newRegTopic.trim() || undefined,
          durationMinutes: newRegDuration,
          notes: newRegNotes.trim() || undefined,
          status: 'completed',
          rating: newRegRating,
        }, localDate);
    }

    setNewRegTopic('');
    setNewRegNotes('');
    setRegisterSuccessPulse(true);
    playWebAudioChime('task');
    setTimeout(() => setRegisterSuccessPulse(false), 2000);
  }, [newRegSubject, newRegTopic, newRegNotes, newRegDuration, newRegRating, saveDailyRegisterList, currentUser, recordDailyRegistryActivity]);

  const handleSaveDayNotes = useCallback(async (date: string, notes: string) => {
    if (!currentUser) return false;
    return await updateDailySummaryNotes(currentUser.uid, date, notes);
  }, [currentUser]);

  const handleAddManualEntryModal = useCallback(async (
    date: string,
    entryData: Omit<DailyRegistryEntryItem, 'id' | 'createdAt'>
  ) => {
    if (!currentUser) return false;
    await recordDailyRegistryActivity(entryData, date);
    return true;
  }, [currentUser, recordDailyRegistryActivity]);

  const handleDeleteEntryModal = useCallback(async (date: string, entryId: string) => {
    if (!currentUser) return false;
    return await deleteDailyRegistryEntry(currentUser.uid, date, entryId);
  }, [currentUser]);

  // Responsive Layout: Fit all widgets for Laptop screens
  const applyLaptopFitLayout = useCallback(() => {
    const coords = computeLaptopFitCoordinates(window.innerWidth, window.innerHeight);
    updateConfig(prev => {
      const next = { ...prev };
      (Object.keys(coords) as DashboardWidgetKey[]).forEach(k => {
        if ((next as any)[k]) {
          (next as any)[k] = {
            ...(next as any)[k],
            x: coords[k].x,
            y: coords[k].y,
            width: coords[k].width,
            height: coords[k].height,
            visible: true,
          };
        }
      });
      return {
        ...next,
        layoutMode: 'freeform',
        freeformLayout: coords,
      };
    });
    setPlacementModal(null);
  }, [updateConfig]);

  // Responsive Layout: Fit all widgets for Mobile screens
  const applyMobileFitLayout = useCallback(() => {
    const coords = computeMobileFitCoordinates(window.innerWidth, window.innerHeight);
    updateConfig(prev => {
      const next = { ...prev };
      (Object.keys(coords) as DashboardWidgetKey[]).forEach(k => {
        if ((next as any)[k]) {
          (next as any)[k] = {
            ...(next as any)[k],
            x: coords[k].x,
            y: coords[k].y,
            width: coords[k].width,
            height: coords[k].height,
            visible: true,
          };
        }
      });
      return {
        ...next,
        layoutMode: 'freeform',
        freeformLayout: coords,
      };
    });
    setPlacementModal(null);
  }, [updateConfig]);

  // Right-Click Context Menu State & Widget Management
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setPlacementModal(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Transparency Controls (Per-Widget & Global)
  const toggleWidgetTransparency = useCallback((widgetKey: DashboardWidgetKey) => {
    updateConfig(p => ({
      ...p,
      [widgetKey]: {
        ...(p as any)[widgetKey],
        glassBg: !(p as any)[widgetKey]?.glassBg,
      },
    }));
  }, [updateConfig]);

  const setAllWidgetsTransparency = useCallback((transparent: boolean) => {
    updateConfig(p => ({
      ...p,
      widgetStyle: transparent ? 'transparent' : (p.widgetStyle === 'transparent' ? 'subtle-dark-glass' : p.widgetStyle),
      clock: { ...p.clock, glassBg: !transparent },
      countdown: { ...p.countdown, glassBg: !transparent },
      notification: { ...p.notification, glassBg: !transparent },
      calendar: { ...p.calendar, glassBg: !transparent },
      tasks: { ...p.tasks, glassBg: !transparent },
      motivation: { ...p.motivation, glassBg: !transparent },
      pomodoro: { ...p.pomodoro, glassBg: !transparent },
      nameWidget: { ...p.nameWidget, glassBg: !transparent },
      scratchpad: { ...p.scratchpad, glassBg: !transparent },
    }));
  }, [updateConfig]);

  const areAllWidgetsTransparent = useMemo(() => {
    return (
      !config.clock.glassBg &&
      !config.countdown.glassBg &&
      !config.notification.glassBg &&
      !config.calendar.glassBg &&
      !config.tasks.glassBg &&
      !config.motivation.glassBg &&
      !config.nameWidget.glassBg &&
      !config.pomodoro?.glassBg &&
      !config.scratchpad?.glassBg
    );
  }, [config]);

  // ================= EXACT CLICK-TO-ADD WIDGET PLACEMENT & STYLING =================
  const ALL_WIDGET_REGISTRY = useMemo<{
    id: DashboardWidgetKey;
    label: string;
    defaultW: number;
    defaultH: number;
    icon: any;
    category: string;
  }[]>(() => [
    { id: 'clock', label: 'Master Architectural Clock', defaultW: 580, defaultH: 180, icon: ClockIcon, category: 'Time' },
    { id: 'countdown', label: 'Public Exam Countdown', defaultW: 460, defaultH: 170, icon: Target, category: 'Exam' },
    { id: 'nameWidget', label: 'Centum Student Title Banner', defaultW: 480, defaultH: 100, icon: Award, category: 'Profile' },
    { id: 'tasks', label: 'Target Checklist / Sprint', defaultW: 360, defaultH: 340, icon: CheckCircle2, category: 'Sprint' },
    { id: 'notification', label: 'Routine Alert & Schedule', defaultW: 460, defaultH: 170, icon: CalendarIcon, category: 'Routine' },
    { id: 'calendar', label: 'Exam Study Calendar', defaultW: 380, defaultH: 340, icon: CalendarIcon, category: 'Calendar' },
    { id: 'motivation', label: 'Daily Intention & Motivation', defaultW: 440, defaultH: 140, icon: Sparkles, category: 'Mindset' },
    { id: 'pomodoro', label: 'Pomodoro Focus Timer', defaultW: 360, defaultH: 240, icon: Zap, category: 'Focus' },
    { id: 'scratchpad', label: 'Daily Register (Study Notes & Summary)', defaultW: 400, defaultH: 340, icon: FileText, category: 'Register' },
  ], []);

  const hexToRgba = useCallback((hex: string, alpha: number): string => {
    if (!hex) return `rgba(12, 26, 20, ${alpha})`;
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return `rgba(12, 26, 20, ${alpha})`;
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }, []);

  const getWidgetComputedStyle = useCallback((widgetKey: DashboardWidgetKey): React.CSSProperties => {
    const wConfig = (config as any)[widgetKey];
    const glassBg = wConfig?.glassBg ?? true;
    const customOverrides = config.widgetStyles?.overrides?.[widgetKey];
    const globalStyle = config.widgetStyles?.global;
    const style = customOverrides || globalStyle;

    const activeTheme = STUDIO_THEMES.find(t => t.id === config.activeThemeId);
    const defaultBg = activeTheme ? activeTheme.previewWidgetBg : 'rgba(15, 23, 42, 0.78)';
    const defaultBorder = activeTheme ? activeTheme.previewWidgetBorder : 'rgba(255, 255, 255, 0.12)';
    const defaultGlow = activeTheme?.accentColor ? `${activeTheme.accentColor}33` : 'transparent';

    if (!glassBg) {
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      };
    }

    const base: React.CSSProperties = {};

    if (style) {
      if (style.bgColor) {
        const opacity = (style.bgOpacity ?? 82) / 100;
        base.backgroundColor = style.bgColor.startsWith('#')
          ? hexToRgba(style.bgColor, opacity)
          : style.bgColor;
      } else {
        base.backgroundColor = defaultBg;
      }

      if (style.blur !== undefined) {
        base.backdropFilter = `blur(${style.blur}px)`;
        base.WebkitBackdropFilter = `blur(${style.blur}px)`;
      } else {
        base.backdropFilter = 'blur(18px)';
        base.WebkitBackdropFilter = 'blur(18px)';
      }

      base.borderColor = style.borderColor || defaultBorder;
      base.borderWidth = `${style.borderWidth ?? 1}px`;
      base.borderRadius = `${style.borderRadius ?? 20}px`;

      const shadowBlur = style.shadowBlur ?? 25;
      const shadowCol = style.shadowColor || 'rgba(0,0,0,0.65)';
      const glowCol = style.glowColor || defaultGlow;
      const glowInt = (style.glowIntensity ?? 30) / 100;
      base.boxShadow = `0 ${shadowBlur}px ${shadowBlur * 1.5}px ${shadowCol}, 0 0 ${Math.round(20 * glowInt)}px ${glowCol}`;

      if (style.textColor) base.color = style.textColor;
      if (style.padding !== undefined) base.padding = `${style.padding}px`;
      if (style.fontFamily) base.fontFamily = style.fontFamily;
    } else {
      base.backgroundColor = defaultBg;
      base.borderColor = defaultBorder;
      base.boxShadow = `0 20px 40px rgba(0,0,0,0.65), 0 0 16px ${defaultGlow}`;
      base.backdropFilter = 'blur(18px)';
      base.WebkitBackdropFilter = 'blur(18px)';
    }

    return base;
  }, [config, hexToRgba]);

  // 1. Regular Left-Clicks: Never accidentally pop up widget placement modals; dismiss open menus smoothly
  const handleDashboardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('#floating-hud') ||
      target.closest('.widget-placement-popover') ||
      target.closest('.context-menu-container') ||
      target.closest('.no-canvas-click') ||
      target.closest('.task-item-action') ||
      target.closest('.resize-handle') ||
      target.closest('#scratchpad-widget')
    ) {
      return;
    }

    setPlacementModal(null);
    setContextMenu(null);
  }, []);

  // 2. Right-Click Gesture Detector:
  // - Single Right-Click on empty space: Open "ADD WIDGET AT POSITION" at cursor coordinates
  // - Double Right-Click (or Single Right-Click directly on an occupied widget/card): Open "POSITION OCCUPIED" menu
  // - Suppresses native browser context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Suppress native browser context menu on the dashboard canvas
    e.preventDefault();

    const rect = dashboardRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const clickX = Math.round(e.clientX - rect.left);
    const clickY = Math.round(e.clientY - rect.top);

    // Check if clicked directly on an occupied widget/card
    let occupiedId: DashboardWidgetKey | null = null;
    let occupiedLabel: string | null = null;

    // Check DOM hierarchy for data-widget-id or specific widget container id
    const widgetDom = target.closest(
      '#motivation-widget, #name-widget, #clock-widget, #countdown-widget, #notification-widget, #calendar-widget, #tasks-widget, #pomodoro-widget, #scratchpad-widget, [data-widget-id], .dashboard-widget'
    ) as HTMLElement | null;

    if (widgetDom) {
      const explicitId = widgetDom.dataset?.widgetId;
      if (explicitId) {
        const found = ALL_WIDGET_REGISTRY.find(w => w.id === explicitId);
        if (found) {
          occupiedId = found.id;
          occupiedLabel = found.label;
        }
      } else {
        const domId = widgetDom.id;
        const mappedId: DashboardWidgetKey | null =
          domId === 'name-widget' ? 'nameWidget' :
          domId === 'clock-widget' ? 'clock' :
          domId === 'countdown-widget' ? 'countdown' :
          domId === 'tasks-widget' ? 'tasks' :
          domId === 'notification-widget' ? 'notification' :
          domId === 'calendar-widget' ? 'calendar' :
          domId === 'motivation-widget' ? 'motivation' :
          domId === 'pomodoro-widget' ? 'pomodoro' :
          domId === 'scratchpad-widget' ? 'scratchpad' : null;

        if (mappedId) {
          const found = ALL_WIDGET_REGISTRY.find(w => w.id === mappedId);
          if (found) {
            occupiedId = found.id;
            occupiedLabel = found.label;
          }
        }
      }
    }

    // Also check bounding coordinates of all visible widgets
    if (!occupiedId) {
      for (const item of ALL_WIDGET_REGISTRY) {
        const wConfig = (config as any)[item.id];
        if (wConfig && wConfig.visible !== false) {
          const wx = wConfig.x ?? 50;
          const wy = wConfig.y ?? 50;
          const ww = wConfig.width || item.defaultW;
          const wh = wConfig.height || item.defaultH;
          if (clickX >= wx && clickX <= wx + ww && clickY >= wy && clickY <= wy + wh) {
            occupiedId = item.id;
            occupiedLabel = item.label;
            break;
          }
        }
      }
    }

    // Calculate nearest grid slot for layout presets
    const currentPreset = STUDIO_LAYOUT_ARRANGEMENTS.find(p => p.id === (config.selectedGridPresetId || 'preset-grid-1')) || STUDIO_LAYOUT_ARRANGEMENTS[0];
    const usableW = Math.max(600, window.innerWidth - (config.gridMargins ?? 24) * 2);
    const usableH = Math.max(500, window.innerHeight - (config.gridMargins ?? 24) * 2);

    let nearestSlot = currentPreset.slots.find(s => {
      const sx = (config.gridMargins ?? 24) + (s.xPercent / 100) * usableW;
      const sy = (config.gridMargins ?? 24) + (s.yPercent / 100) * usableH;
      const sw = (s.wPercent / 100) * usableW;
      const sh = (s.hPercent / 100) * usableH;
      return clickX >= sx && clickX <= sx + sw && clickY >= sy && clickY <= sy + sh;
    });

    if (!nearestSlot && currentPreset.slots.length > 0) {
      let minDist = Infinity;
      currentPreset.slots.forEach(s => {
        const sx = (config.gridMargins ?? 24) + (s.xPercent / 100) * usableW + (s.wPercent / 200) * usableW;
        const sy = (config.gridMargins ?? 24) + (s.yPercent / 100) * usableH + (s.hPercent / 200) * usableH;
        const dist = Math.hypot(clickX - sx, clickY - sy);
        if (dist < minDist) {
          minDist = dist;
          nearestSlot = s;
        }
      });
    }

    const nearestGridSlotInfo = nearestSlot
      ? { name: nearestSlot.label, cellX: Math.round(nearestSlot.xPercent), cellY: Math.round(nearestSlot.yPercent) }
      : undefined;

    // Helper to find the nearest occupied widget if double right-clicking on empty canvas
    const getNearestOccupiedWidget = (): { id: DashboardWidgetKey; label: string } => {
      let closestId: DashboardWidgetKey = 'clock';
      let closestLabel = 'Master Architectural Clock';
      let minDist = Infinity;
      for (const item of ALL_WIDGET_REGISTRY) {
        const wConfig = (config as any)[item.id];
        if (wConfig && wConfig.visible !== false) {
          const wx = (wConfig.x ?? 50) + (wConfig.width || item.defaultW) / 2;
          const wy = (wConfig.y ?? 50) + (wConfig.height || item.defaultH) / 2;
          const dist = Math.hypot(clickX - wx, clickY - wy);
          if (dist < minDist) {
            minDist = dist;
            closestId = item.id;
            closestLabel = item.label;
          }
        }
      }
      return { id: closestId, label: closestLabel };
    };

    // Case 1: Single Right-Click DIRECTLY on an occupied widget/card -> Open "POSITION OCCUPIED" menu
    if (occupiedId) {
      if (rightClickDetectorRef.current.timer) {
        clearTimeout(rightClickDetectorRef.current.timer);
        rightClickDetectorRef.current.timer = null;
      }
      setContextMenu(null);
      setPlacementModal({
        isOpen: true,
        x: clickX,
        y: clickY,
        occupiedBy: occupiedId,
        occupiedWidgetLabel: occupiedLabel,
        nearestGridSlot: nearestGridSlotInfo,
      });
      return;
    }

    // Case 2: Right-Click on empty space -> 300ms double-click detector
    const now = Date.now();
    const prev = rightClickDetectorRef.current;
    const isDoubleRightClick =
      now - prev.lastTime <= 300 &&
      Math.hypot(clickX - prev.clickX, clickY - prev.clickY) < 60;

    if (isDoubleRightClick) {
      // Double Right-Click on empty space -> Open "POSITION OCCUPIED" menu
      if (prev.timer) {
        clearTimeout(prev.timer);
        prev.timer = null;
      }
      prev.lastTime = 0;
      setContextMenu(null);
      const fallback = getNearestOccupiedWidget();
      setPlacementModal({
        isOpen: true,
        x: clickX,
        y: clickY,
        occupiedBy: fallback.id,
        occupiedWidgetLabel: fallback.label,
        nearestGridSlot: nearestGridSlotInfo,
      });
    } else {
      // First Right-Click on empty space -> start 300ms timer
      if (prev.timer) {
        clearTimeout(prev.timer);
      }
      prev.lastTime = now;
      prev.clickX = clickX;
      prev.clickY = clickY;

      prev.timer = setTimeout(() => {
        // Single Right-Click on empty space -> Open "ADD WIDGET AT POSITION" menu positioned at cursor
        setContextMenu(null);
        setPlacementModal({
          isOpen: true,
          x: clickX,
          y: clickY,
          occupiedBy: null, // Signals "ADD WIDGET AT POSITION"
          occupiedWidgetLabel: null,
          nearestGridSlot: nearestGridSlotInfo,
        });
        prev.timer = null;
      }, 300);
    }
  }, [config, ALL_WIDGET_REGISTRY]);

  const handlePlaceWidgetAtSelectedPosition = useCallback((
    widgetKey: DashboardWidgetKey,
    mode: 'exact' | 'nearby' | 'swap' = 'exact'
  ) => {
    if (!placementModal) return;

    const def = ALL_WIDGET_REGISTRY.find(w => w.id === widgetKey);
    const existingW = (config as any)[widgetKey];
    const targetW = existingW?.width || def?.defaultW || 360;
    const targetH = existingW?.height || def?.defaultH || 180;

    let finalX = placementModal.x;
    let finalY = placementModal.y;

    if (mode === 'nearby' && placementModal.occupiedBy) {
      const occW = (config as any)[placementModal.occupiedBy];
      const ow = occW?.width || 360;
      const oh = occW?.height || 180;
      const ox = occW?.x ?? placementModal.x;
      const oy = occW?.y ?? placementModal.y;

      if (ox + ow + targetW + 24 <= window.innerWidth) {
        finalX = ox + ow + 20;
        finalY = oy;
      } else if (oy + oh + targetH + 24 <= window.innerHeight) {
        finalX = ox;
        finalY = oy + oh + 20;
      } else {
        finalX = Math.max(20, ox - targetW - 20);
        finalY = oy;
      }
    } else if (config.layoutMode === 'grid') {
      const usableW = Math.max(600, window.innerWidth - (config.gridMargins ?? 24) * 2);
      const usableH = Math.max(500, window.innerHeight - (config.gridMargins ?? 24) * 2);
      const currentPreset = STUDIO_LAYOUT_ARRANGEMENTS.find(p => p.id === (config.selectedGridPresetId || 'preset-grid-1')) || STUDIO_LAYOUT_ARRANGEMENTS[0];
      const matchSlot = currentPreset.slots.find(s => s.widgetKey === widgetKey) || currentPreset.slots[0];
      if (matchSlot && mode === 'exact') {
        finalX = Math.round((config.gridMargins ?? 24) + (matchSlot.xPercent / 100) * usableW);
        finalY = Math.round((config.gridMargins ?? 24) + (matchSlot.yPercent / 100) * usableH);
      }
    } else if (config.snapToGrid) {
      const snap = config.snapGridSize || 20;
      finalX = Math.round(finalX / snap) * snap;
      finalY = Math.round(finalY / snap) * snap;
    }

    finalX = Math.round(Math.max(10, Math.min(window.innerWidth - targetW - 10, finalX)));
    finalY = Math.round(Math.max(10, Math.min(window.innerHeight - targetH - 10, finalY)));

    if (mode === 'swap' && placementModal.occupiedBy) {
      const occKey = placementModal.occupiedBy;
      const occOld = (config as any)[occKey];
      const selfOld = (config as any)[widgetKey];

      updateConfig(prev => ({
        ...prev,
        [widgetKey]: {
          ...prev[widgetKey],
          visible: true,
          x: occOld?.x ?? finalX,
          y: occOld?.y ?? finalY,
        },
        [occKey]: {
          ...prev[occKey],
          x: selfOld?.x ?? 50,
          y: selfOld?.y ?? 50,
        },
        freeformLayout: {
          ...(prev.freeformLayout || {}),
          [widgetKey]: { x: occOld?.x ?? finalX, y: occOld?.y ?? finalY, width: targetW, height: targetH },
          [occKey]: { x: selfOld?.x ?? 50, y: selfOld?.y ?? 50, width: occOld?.width || 360, height: occOld?.height || 180 },
        },
      }));
    } else {
      updateConfig(prev => ({
        ...prev,
        [widgetKey]: {
          ...prev[widgetKey],
          visible: true,
          x: finalX,
          y: finalY,
        },
        freeformLayout: {
          ...(prev.freeformLayout || {}),
          [widgetKey]: {
            x: finalX,
            y: finalY,
            width: targetW,
            height: targetH,
          },
        },
      }));
    }

    setPlacementModal(null);
  }, [placementModal, config, updateConfig, ALL_WIDGET_REGISTRY]);

  // ================= 5. FIREBASE AUTH & REALTIME DATABASE AUTO-SYNC =================

  // Helper: Compile complete user dashboard payload covering all user-customizable preferences
  const buildCurrentDashboardPayload = useCallback((uid: string): UserDashboardPayload => {
    return {
      userId: uid,
      config,
      tasks,
      dailyRegister: dailyRegisterEntries,
      scratchpad: scratchpadText,
      presets: savedPresets,
      wallpaperFavorites: wallpaperProvider.getFavoriteIds(),
      wallpaperRecent: wallpaperProvider.getRecentIds(),
      favouriteQuotes,
      studyStreak: pomoStreak,
      updatedAt: new Date().toISOString(),
    };
  }, [config, tasks, dailyRegisterEntries, scratchpadText, savedPresets, favouriteQuotes, pomoStreak]);

  // Helper: Safely restore complete state from Firebase without race condition overwrites
  const restoreDashboardFromCloudData = useCallback((cloudData: any): boolean => {
    if (!cloudData) return false;
    isRemoteUpdateRef.current = true;

    console.log('[Firebase Restore] Restoring full dashboard state from cloud payload...', {
      updatedAt: cloudData.updatedAt,
      hasConfig: !!cloudData.config,
      tasksCount: Array.isArray(cloudData.tasks) ? cloudData.tasks.length : 0,
      dailyCount: Array.isArray(cloudData.dailyRegister) ? cloudData.dailyRegister.length : 0,
    });

    // 1. Restore Config (Widgets, positions, sizes, titles, layouts, wallpapers, themes, typography, etc.)
    if (cloudData.config && typeof cloudData.config === 'object') {
      setConfig(prev => ({
        ...DEFAULT_CONFIG,
        ...cloudData.config,
        optionalFeatures: { ...DEFAULT_OPTIONAL_FEATURES, ...(cloudData.config.optionalFeatures || {}) },
        personalization: { ...DEFAULT_PERSONALIZATION, ...(cloudData.config.personalization || {}) },
        typography: {
          ...DEFAULT_CONFIG.typography,
          ...(cloudData.config.typography || {}),
          elements: {
            ...DEFAULT_ELEMENT_TYPOGRAPHY,
            ...(cloudData.config.typography?.elements || {}),
          },
        },
        widgetStyles: {
          global: {
            ...(DEFAULT_CONFIG.widgetStyles?.global || {}),
            ...(cloudData.config.widgetStyles?.global || {}),
          },
          overrides: {
            ...(DEFAULT_CONFIG.widgetStyles?.overrides || {}),
            ...(cloudData.config.widgetStyles?.overrides || {}),
          },
        },
      }));
      try {
        localStorage.setItem('flocus_dashboard_config', JSON.stringify(cloudData.config));
      } catch {}
    }

    // 2. Restore Quick Tasks
    if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
      setTasks(cloudData.tasks);
      try {
        localStorage.setItem('flocus_quick_tasks', JSON.stringify(cloudData.tasks));
      } catch {}
    }

    // 3. Restore Daily Register Entries
    if (cloudData.dailyRegister && Array.isArray(cloudData.dailyRegister)) {
      setDailyRegisterEntries(cloudData.dailyRegister);
      try {
        localStorage.setItem('flocus_daily_register_entries', JSON.stringify(cloudData.dailyRegister));
      } catch {}
    }

    // 4. Restore Scratchpad Notes
    if (typeof cloudData.scratchpad === 'string') {
      setScratchpadText(cloudData.scratchpad);
      try {
        localStorage.setItem('flocus_scratchpad_notes', cloudData.scratchpad);
      } catch {}
    }

    // 5. Restore Studio Presets
    if (cloudData.presets && Array.isArray(cloudData.presets) && cloudData.presets.length > 0) {
      setSavedPresets(cloudData.presets);
      try {
        localStorage.setItem('flocus_saved_presets', JSON.stringify(cloudData.presets));
      } catch {}
    }

    // 6. Restore Wallpaper Favorites & Recent
    if (cloudData.wallpaperFavorites && Array.isArray(cloudData.wallpaperFavorites)) {
      wallpaperProvider.setFavoriteIds(cloudData.wallpaperFavorites);
    }
    if (cloudData.wallpaperRecent && Array.isArray(cloudData.wallpaperRecent)) {
      wallpaperProvider.setRecentIds(cloudData.wallpaperRecent);
    }

    // 7. Restore Favourite Quotes
    if (cloudData.favouriteQuotes && Array.isArray(cloudData.favouriteQuotes)) {
      setFavouriteQuotes(cloudData.favouriteQuotes);
      try {
        localStorage.setItem('flocus_favourite_quotes', JSON.stringify(cloudData.favouriteQuotes));
      } catch {}
    }

    // 8. Restore Study / Pomodoro Streak
    if (typeof cloudData.studyStreak === 'number' || typeof cloudData.pomoStreak === 'number') {
      const streakVal = cloudData.studyStreak ?? cloudData.pomoStreak ?? 0;
      setPomoStreak(streakVal);
      try {
        localStorage.setItem('flocus_pomo_streak', String(streakVal));
      } catch {}
    }

    if (cloudData.updatedAt) {
      lastSyncedPayloadRef.current = cloudData.updatedAt;
      setLastSyncedTime(new Date(cloudData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }

    return true;
  }, []);

  // Primary Auth Listener: Loads and restores saved user dashboard on login
  useEffect(() => {
    let isCancelled = false;

    if (!auth) {
      console.warn('[Firebase Auth] Auth service not initialized, skipping listener.');
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (isCancelled) return;

      if (user) {
        console.log(`[Firebase Auth] Authenticated user confirmed: ${user.email} (UID: ${user.uid})`);
        setSyncStatus('saving');
        isRestoringRef.current = true;
        setCurrentUser(user);

        try {
          // Read that user's saved dashboard data from Realtime Database (with Firestore fallback)
          console.log(`[Firebase Auth] Reading previous dashboard state for UID: ${user.uid}`);
          const cloudData = await loadUserDashboard(user.uid);

          if (isCancelled) return;

          if (cloudData && (cloudData.config || cloudData.tasks)) {
            console.log(`[Firebase Auth] Existing dashboard record found for UID: ${user.uid}. Restoring all widgets, wallpapers, and settings...`);
            restoreDashboardFromCloudData(cloudData);
            setSyncStatus('saved');
            console.log(`[Firebase Auth] User dashboard restored completely for UID: ${user.uid}`);
            verifyWritePermission(user.uid).catch(() => {});
          } else {
            console.log(`[Firebase Auth] No previous cloud record found for UID: ${user.uid}. Initializing new account template...`);
            const initialPayload = buildCurrentDashboardPayload(user.uid);
            await saveUserDashboard(user.uid, initialPayload);
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setSyncStatus('saved');
          }

          // Load user's Daily Registry History
          console.log(`[Firebase Auth] Loading Daily Registry & Personal History for UID: ${user.uid}`);
          const historyAll = await loadUserDailyRegistryAll(user.uid);
          if (!isCancelled) {
            setDailyRegistryHistory(historyAll || {});
          }

          // Real-time listener for Daily Registry
          if (dailyRegistryUnsubRef.current) {
            dailyRegistryUnsubRef.current();
          }
          dailyRegistryUnsubRef.current = subscribeToUserDailyRegistry(user.uid, data => {
            if (!isCancelled) {
              setDailyRegistryHistory(data && typeof data === 'object' ? data : {});
            }
          });

          // Ensure today's registry record exists without overwriting existing entries
          const today = getLocalDateString();
          if (!historyAll || !historyAll[today]) {
            console.log(`[DailyRegistry] Initializing today's record for ${today}`);
            saveDailyRegistryDay(user.uid, today, {
              userId: user.uid,
              date: today,
              dayOfWeek: getDayOfWeekName(),
              subjectsStudied: [],
              plannedTasks: [],
              completedTasks: [],
              studySessions: [],
              totalStudyMinutes: 0,
              tuitionRevisionProgress: '',
              dailyGoals: [],
              dailySummaryNotes: '',
              examPrepProgress: '',
              entries: {},
            }).catch(() => {});
          }
        } catch (err) {
          console.error(`[Firebase Auth Error] Failed during dashboard restoration for UID: ${user.uid}:`, err);
          setSyncStatus('error');
        } finally {
          // Complete restoration lock after React state cycle settles
          setTimeout(() => {
            if (!isCancelled) {
              isRestoringRef.current = false;
              restoredUserUidRef.current = user.uid;
              console.log(`[Firebase Auth] Auto-sync gate opened for UID: ${user.uid}`);
            }
          }, 350);
        }
      } else {
        console.log('[Firebase Auth] User signed out or unauthenticated.');
        restoredUserUidRef.current = null;
        isRestoringRef.current = false;
        setCurrentUser(null);
        setSyncStatus('offline');
        if (dailyRegistryUnsubRef.current) {
          dailyRegistryUnsubRef.current();
          dailyRegistryUnsubRef.current = null;
        }
        setDailyRegistryHistory({});
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
      if (dailyRegistryUnsubRef.current) {
        dailyRegistryUnsubRef.current();
        dailyRegistryUnsubRef.current = null;
      }
    };
  }, [restoreDashboardFromCloudData, buildCurrentDashboardPayload]);

  // Real-time bi-directional auto-sync listener (Active only after initial restoration is safely completed)
  useEffect(() => {
    if (!currentUser || !autoSyncEnabled) return;
    if (isRestoringRef.current || restoredUserUidRef.current !== currentUser.uid) return;

    console.log(`[Firebase Sync] Binding real-time change listener for UID: ${currentUser.uid}`);
    const unsubscribe = subscribeToUserDashboard(
      currentUser.uid,
      cloudData => {
        if (!cloudData || !cloudData.config || isSavingRef.current) return;
        // Ignore echo of our own last saved payload
        if (cloudData.updatedAt && lastSyncedPayloadRef.current === cloudData.updatedAt) {
          return;
        }

        console.log(`[Firebase Sync] Incoming remote update detected for UID: ${currentUser.uid}`);
        restoreDashboardFromCloudData(cloudData);
        setSyncStatus('saved');
      },
      err => {
        console.warn(`[Firebase Sync Notice] Real-time listener notice for UID: ${currentUser.uid}:`, err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser, autoSyncEnabled, restoreDashboardFromCloudData]);

  // Debounced Auto-Sync to Firebase when user modifies anything on dashboard
  const syncTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (!currentUser || !autoSyncEnabled) return;

    // Critical guard: do not save while initial restoration is in progress or if user hasn't finished initial restore
    if (isRestoringRef.current || restoredUserUidRef.current !== currentUser.uid) {
      return;
    }

    // Skip if state update was triggered by remote incoming snapshot
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    setSyncStatus('saving');
    syncTimeoutRef.current = window.setTimeout(async () => {
      const payload = buildCurrentDashboardPayload(currentUser.uid);
      lastSyncedPayloadRef.current = payload.updatedAt;

      try {
        isSavingRef.current = true;
        const savePromise = saveUserDashboard(currentUser.uid, payload);
        pendingSavePromiseRef.current = savePromise;
        await savePromise;
        setSyncStatus('saved');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        console.log(`[Firebase Auto-Sync] Changes successfully saved to Firebase for UID: ${currentUser.uid} (updatedAt: ${payload.updatedAt})`);
      } catch (err) {
        console.error(`[Firebase Auto-Sync Error] Failed saving changes for UID: ${currentUser.uid}:`, err);
        setSyncStatus('error');
      } finally {
        isSavingRef.current = false;
        pendingSavePromiseRef.current = null;
      }
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    };
  }, [
    config,
    tasks,
    dailyRegisterEntries,
    scratchpadText,
    savedPresets,
    favouriteQuotes,
    pomoStreak,
    currentUser,
    autoSyncEnabled,
    buildCurrentDashboardPayload,
  ]);

  // Online network reconnect auto-sync trigger
  useEffect(() => {
    const handleOnline = () => {
      if (currentUser && autoSyncEnabled && !isRestoringRef.current) {
        handleManualSyncNow();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [currentUser, autoSyncEnabled]);

  const handleManualSyncNow = async () => {
    if (!currentUser) {
      setActiveTab('cloud');
      setDrawerOpen(true);
      return;
    }
    setSyncStatus('saving');
    try {
      const payload = buildCurrentDashboardPayload(currentUser.uid);
      lastSyncedPayloadRef.current = payload.updatedAt;
      const savePromise = saveUserDashboard(currentUser.uid, payload);
      pendingSavePromiseRef.current = savePromise;
      await savePromise;
      setSyncStatus('saved');
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      console.log(`[Firebase Manual Sync] Dashboard saved to Firebase for UID: ${currentUser.uid}`);
    } catch (err) {
      console.error(`[Firebase Manual Sync Error] Failed for UID: ${currentUser.uid}:`, err);
      setSyncStatus('error');
    } finally {
      pendingSavePromiseRef.current = null;
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    setUnauthorizedDomain(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        setUnauthorizedDomain(hostname);
        setAuthError(`Domain authorization required: "${hostname}" has not been added to Firebase Authorized Domains yet.`);
      } else {
        setAuthError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    setUnauthorizedDomain(null);
    try {
      await signInAsGuest();
      setAuthSuccessMsg('Signed in as Guest! Full Firebase cloud sync is active.');
    } catch (err: any) {
      console.warn('Guest sign-in error:', err);
      setAuthError(err.message || 'Guest sign-in failed. Please check Firebase settings.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    setUnauthorizedDomain(null);
    try {
      if (isAuthSignUp) {
        await signUpWithEmail(authEmail, authPassword);
        setAuthSuccessMsg(`Account created and signed in as ${authEmail}`);
      } else {
        await signInWithEmail(authEmail, authPassword);
        setAuthSuccessMsg(`Signed in as ${authEmail}`);
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      console.warn('Email auth error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. If you do not have an account yet, switch to "Create Account" below.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setAuthError('This email is already in use. Switch to "Sign In" or try another email.');
      } else if (err?.code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setAuthError('Email/Password provider is not enabled in Firebase Console. Please use Guest Sign In below!');
      } else {
        setAuthError(err.message || 'Authentication failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!currentUser) return;
    setSyncStatus('saving');
    isRestoringRef.current = true;
    try {
      const cloudData = await loadUserDashboard(currentUser.uid);
      if (cloudData && (cloudData.config || cloudData.tasks)) {
        restoreDashboardFromCloudData(cloudData);
        setSyncStatus('saved');
        console.log(`[Firebase Manual Load] Dashboard successfully reloaded from cloud for UID: ${currentUser.uid}`);
      } else {
        console.log(`[Firebase Manual Load] No cloud data found for UID: ${currentUser.uid}`);
        setSyncStatus('saved');
      }
    } catch (err) {
      console.error(`[Firebase Manual Load Error] Failed for UID: ${currentUser.uid}:`, err);
      setSyncStatus('error');
    } finally {
      setTimeout(() => {
        isRestoringRef.current = false;
        restoredUserUidRef.current = currentUser.uid;
      }, 350);
    }
  };

  const handleSignOut = async () => {
    try {
      if (pendingSavePromiseRef.current) {
        console.log('[Firebase Auth] Awaiting pending save before logging out...');
        await pendingSavePromiseRef.current;
      }
      await logOutUser();
      restoredUserUidRef.current = null;
      setSyncStatus('offline');
      if (dailyRegistryUnsubRef.current) {
        dailyRegistryUnsubRef.current();
        dailyRegistryUnsubRef.current = null;
      }
      setDailyRegistryHistory({});
      console.log('[Firebase Auth] Logged out successfully. Daily registry state cleared.');
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  // ================= 1. UNIQUE DAILY MOTIVATIONAL QUOTE SYSTEM =================
  // 1. Device's local calendar date in unambiguous YYYY-MM-DD format
  const todayLocalDateStr = useMemo(() => getTodayLocalDateString(currentTime), [currentTime]);

  // 2. Currently viewed quote date (strictly defaults to today's local date)
  const [selectedQuoteDate, setSelectedQuoteDate] = useState<string>(() => getTodayLocalDateString());

  // 3. Automatically update displayed quote when device's local calendar date changes (e.g. crossing midnight)
  const prevTodayDateRef = useRef(todayLocalDateStr);
  useEffect(() => {
    if (prevTodayDateRef.current !== todayLocalDateStr) {
      if (selectedQuoteDate === prevTodayDateRef.current) {
        setSelectedQuoteDate(todayLocalDateStr);
      }
      prevTodayDateRef.current = todayLocalDateStr;
    }
  }, [todayLocalDateStr, selectedQuoteDate]);

  // 4. Retrieve unique daily quote for the selected date
  const activeQuote: DailyMotivationQuote = useMemo(() => {
    return getQuoteForDate(selectedQuoteDate);
  }, [selectedQuoteDate]);

  const isViewingToday = selectedQuoteDate === todayLocalDateStr;

  const isCurrentQuoteFavorited = favouriteQuotes.includes(selectedQuoteDate);

  const handleToggleFavouriteQuote = useCallback((dateStr: string) => {
    setFavouriteQuotes(prev => {
      const isFav = prev.includes(dateStr);
      const next = isFav ? prev.filter(d => d !== dateStr) : [...prev, dateStr];
      try {
        localStorage.setItem('flocus_favourite_quotes', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // 6. Date Navigation Handlers
  const handlePrevQuoteDate = useCallback(() => {
    setSelectedQuoteDate(prev => getAdjacentQuoteDate(prev, -1));
  }, []);

  const handleNextQuoteDate = useCallback(() => {
    setSelectedQuoteDate(prev => getAdjacentQuoteDate(prev, 1));
  }, []);

  const handleResetQuoteToToday = useCallback(() => {
    setSelectedQuoteDate(todayLocalDateStr);
  }, [todayLocalDateStr]);

  // Backward compatibility alias for command menu
  const handleNextQuote = handleNextQuoteDate;

  // 7. Copy quote text to clipboard with feedback
  const [quoteCopied, setQuoteCopied] = useState(false);
  const handleCopyQuote = useCallback(() => {
    if (!activeQuote) return;
    const formatted = `"${activeQuote.quote}"\n— [${activeQuote.category} • ${activeQuote.date}]`;
    navigator.clipboard.writeText(formatted).catch(() => {});
    setQuoteCopied(true);
    setTimeout(() => setQuoteCopied(false), 2000);
  }, [activeQuote]);

  // ================= 3. BACKUP & RESTORE =================
  const handleExportBackup = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'Flocus Dashboard — Clock & Public Exam Suite',
      dashboardConfig: config,
      tasks,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flocus-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBackupMessage({ type: 'success', text: 'Dashboard data successfully exported to JSON.' });
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed || !parsed.dashboardConfig) {
          setBackupMessage({ type: 'error', text: 'Invalid backup file: missing dashboard configuration.' });
          return;
        }

        setBackupPreview({
          version: parsed.version || '1.0',
          exportedAt: parsed.exportedAt || 'Unknown Date',
          tasksCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : 0,
          clockArch: parsed.dashboardConfig?.clock?.architecture || 'minimal',
          examDate: parsed.dashboardConfig?.countdown?.targetDate || '2027-03-03',
          rawPayload: parsed,
        });
        setBackupMessage(null);
      } catch {
        setBackupMessage({ type: 'error', text: 'Failed to read JSON backup file. Please ensure it is valid JSON.' });
      }
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = (mode: 'replace' | 'merge') => {
    if (!backupPreview || !backupPreview.rawPayload) return;
    const { dashboardConfig, tasks: importedTasks } = backupPreview.rawPayload;

    if (mode === 'replace') {
      setConfig({
        ...DEFAULT_CONFIG,
        ...dashboardConfig,
        optionalFeatures: { ...DEFAULT_OPTIONAL_FEATURES, ...(dashboardConfig.optionalFeatures || {}) },
        personalization: { ...DEFAULT_PERSONALIZATION, ...(dashboardConfig.personalization || {}) },
      });
      if (Array.isArray(importedTasks)) {
        setTasks(importedTasks);
        localStorage.setItem('flocus_quick_tasks', JSON.stringify(importedTasks));
      }
    } else {
      if (Array.isArray(importedTasks)) {
        const merged = [...tasks];
        importedTasks.forEach((t: TaskItem) => {
          if (!merged.some(existing => existing.id === t.id)) {
            merged.push(t);
          }
        });
        setTasks(merged);
        localStorage.setItem('flocus_quick_tasks', JSON.stringify(merged));
      }
    }

    setBackupPreview(null);
    setBackupMessage({ type: 'success', text: `Backup successfully ${mode === 'replace' ? 'restored' : 'merged'}!` });
  };

  // ================= 4. PERSONALIZATION PRESETS =================
  const applyLayoutPreset = (preset: 'compact' | 'balanced' | 'spacious') => {
    const sw = window.innerWidth;
    const sh = window.innerHeight;

    updateConfig(prev => {
      let spacing = preset === 'compact' ? 10 : preset === 'spacious' ? 36 : 20;

      const clockW = prev.clock.width || 580;
      const clockH = prev.clock.height || 180;
      const clockX = Math.max(10, (sw - clockW) / 2);
      const clockY = preset === 'compact' ? 20 : preset === 'spacious' ? 40 : 25;

      const nameW = prev.nameWidget.width || 480;
      const nameH = prev.nameWidget.height || 100;
      const nameX = Math.max(10, (sw - nameW) / 2);
      const nameY = clockY + clockH + spacing;

      const cdW = prev.countdown.width || 460;
      const notifW = prev.notification.width || 460;
      const bottomY = nameY + nameH + spacing;
      const cdX = Math.max(15, (sw / 2) - cdW - (spacing / 2));
      const notifX = Math.min(sw - notifW - 15, (sw / 2) + (spacing / 2));

      return {
        ...prev,
        personalization: { ...prev.personalization, layoutPreset: preset },
        clock: { ...prev.clock, x: clockX, y: clockY },
        nameWidget: { ...prev.nameWidget, x: nameX, y: nameY },
        countdown: { ...prev.countdown, x: cdX, y: bottomY },
        notification: { ...prev.notification, x: notifX, y: bottomY },
      };
    });
  };

  // ================= OPTIONAL FEATURES TOGGLE =================
  const toggleFeature = (featureKey: keyof OptionalFeaturesConfig) => {
    updateConfig(prev => {
      const currentVal = prev.optionalFeatures[featureKey];
      const newVal = !currentVal;

      if (featureKey === 'focusMode' && !newVal && isFocusModeActive) {
        setIsFocusModeActive(false);
      }

      return {
        ...prev,
        optionalFeatures: {
          ...prev.optionalFeatures,
          [featureKey]: newVal,
        },
      };
    });
  };

  const handleRestoreFeatureDefaults = () => {
    updateConfig(prev => ({
      ...prev,
      optionalFeatures: { ...DEFAULT_OPTIONAL_FEATURES },
      animationIntensity: 1.0,
      isWallpaperStatic: false,
    }));
  };

  // ================= FOCUS MODE =================
  const handleToggleFocusMode = () => {
    if (!config.optionalFeatures.focusMode) return;
    setIsFocusModeActive(prev => !prev);
    setDrawerOpen(false);
  };

  // ================= CALENDAR CALCULATIONS =================
  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNum: number | null; dateString: string | null; isToday: boolean; exam: ExamScheduleItem | null }> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNum: null, dateString: null, isToday: false, exam: null });
    }

    const todayStr = currentTime.toISOString().slice(0, 10);

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateString = `${year}-${mStr}-${dStr}`;
      const isToday = dateString === todayStr;
      const exam = PUBLIC_EXAM_TIMETABLE.find(e => e.targetYearMonthDay === dateString) || null;
      days.push({ dayNum: d, dateString, isToday, exam });
    }

    return days;
  }, [calendarViewDate, currentTime]);

  const examsInViewedMonth = useMemo(() => {
    const y = calendarViewDate.getFullYear();
    const m = calendarViewDate.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    return PUBLIC_EXAM_TIMETABLE.filter(e => e.targetYearMonthDay.startsWith(prefix));
  }, [calendarViewDate]);

  // ================= QUICK TASK ACTIONS =================
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;
    const newTask: TaskItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    saveTasksList(prev => [newTask, ...prev]);
    setNewTaskText('');
  };

  const handleToggleTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    const willBeCompleted = !target?.completed;

    setJustCompletedTaskId(id);
    setTimeout(() => {
      setJustCompletedTaskId(prev => (prev === id ? null : prev));
    }, 750);

    if (willBeCompleted && target) {
      playWebAudioChime('task');
      if (currentUser) {
        const today = getLocalDateString();
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        recordDailyRegistryActivity({
          timestamp: now.toISOString(),
          time: timeStr,
          eventType: 'task_completed',
          description: `Completed task: ${target.text}`,
          durationMinutes: 15,
          status: 'completed',
        }, today);

        const currentDay = dailyRegistryHistory[today];
        const existingCompleted = currentDay?.completedTasks || [];
        const nextCompleted = [
          ...existingCompleted.filter(t => t.id !== target.id),
          {
            id: target.id,
            text: target.text,
            completedAt: now.toISOString(),
            subject: (target as any).subject || 'General',
          },
        ];

        saveDailyRegistryDay(currentUser.uid, today, {
          completedTasks: nextCompleted,
          updatedAt: now.toISOString(),
        }).catch(() => {});
      }
    }

    saveTasksList(prev => {
      const current = prev.find(t => t.id === id);
      if (!current) return prev;
      const updated = { ...current, completed: !current.completed };
      const others = prev.filter(t => t.id !== id);

      if (updated.completed) {
        // Move newly completed task to the bottom of the list
        const uncompleted = others.filter(t => !t.completed);
        const completed = others.filter(t => t.completed);
        return [...uncompleted, ...completed, updated];
      } else {
        // Re-opened task moves back to the top of active tasks
        const uncompleted = others.filter(t => !t.completed);
        const completed = others.filter(t => t.completed);
        return [updated, ...uncompleted, ...completed];
      }
    });
  };

  // ================= POMODORO TIMER CONTROLS =================
  const handleSwitchPomoMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setPomoMode(mode);
    setIsPomoRunning(false);
    const secs = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    setPomoSecondsLeft(secs);
    setPomoTotalSeconds(secs);
  };

  const togglePomodoro = () => {
    if (!isPomoRunning) {
      if (pomoSecondsLeft === 0) {
        resetPomodoro(pomoMode);
      }
      setIsPomoRunning(true);
      if (pomoSoundEnabled) {
        playWebAudioChime('pomoStart');
      }
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } else {
      setIsPomoRunning(false);
    }
  };

  const resetPomodoro = (mode = pomoMode) => {
    setIsPomoRunning(false);
    const secs = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    setPomoSecondsLeft(secs);
    setPomoTotalSeconds(secs);
  };

  const formatMinutesSeconds = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Pomodoro Countdown Interval Effect
  useEffect(() => {
    if (!isPomoRunning) return;

    const interval = setInterval(() => {
      setPomoSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPomoRunning(false);
          setPomoAlertActive(true);

          if (pomoSoundEnabled) {
            playWebAudioChime('pomoEnd');
          }

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(
                pomoMode === 'focus' ? '🍅 Pomodoro Focus Complete!' : '☕ Break Finished!',
                {
                  body: pomoMode === 'focus'
                    ? 'Great work completing 25 minutes of deep focus! Take a 5-minute break.'
                    : 'Break time is over. Ready for your next study sprint?',
                }
              );
            } catch {
              // ignore
            }
          }

          if (pomoMode === 'focus') {
            setPomoStreak(s => {
              const next = s + 1;
              try {
                localStorage.setItem('flocus_pomo_streak', String(next));
              } catch {
                // ignore
              }
              return next;
            });

            // Automatically record study session into Firebase Daily Registry
            if (currentUser) {
              const today = getLocalDateString();
              const now = new Date();
              const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              const sessionMins = Math.round(pomoTotalSeconds / 60) || 25;

              recordDailyRegistryActivity({
                timestamp: now.toISOString(),
                time: timeStr,
                eventType: 'study_session',
                description: `Completed ${sessionMins}m Pomodoro Focus Sprint`,
                durationMinutes: sessionMins,
                status: 'completed',
                rating: 5,
              }, today);

              const currentDay = dailyRegistryHistory[today];
              const existingSessions = currentDay?.studySessions || [];
              const nextSessions = [
                ...existingSessions,
                {
                  id: `session_${Date.now()}`,
                  mode: 'focus',
                  durationMinutes: sessionMins,
                  completedAt: now.toISOString(),
                  subject: 'Focus Sprint',
                },
              ];
              const totalMins = (currentDay?.totalStudyMinutes || 0) + sessionMins;

              saveDailyRegistryDay(currentUser.uid, today, {
                studySessions: nextSessions,
                totalStudyMinutes: totalMins,
                updatedAt: now.toISOString(),
              }).catch(() => {});
            }
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMode, pomoSoundEnabled, currentUser, pomoTotalSeconds, recordDailyRegistryActivity, dailyRegistryHistory]);

  const handleDeleteTask = (id: string) => {
    saveTasksList(prev => prev.filter(task => task.id !== id));
  };

  const handleClearCompleted = () => {
    saveTasksList(prev => prev.filter(task => !task.completed));
  };

  const handleResetTasks = () => {
    saveTasksList(() => DEFAULT_TASKS);
  };

  const toggleRoutineMode = (mode?: 'school' | 'leave') => {
    updateConfig(prev => {
      const nextMode = mode || (prev.routineMode === 'school' ? 'leave' : 'school');
      return { ...prev, routineMode: nextMode };
    });
  };

  // Time loop
  useEffect(() => {
    let animId: number;
    const updateTime = () => {
      setCurrentTime(new Date());
      animId = requestAnimationFrame(updateTime);
    };
    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, []);

  const currentSlotInfo = useMemo(() => {
    const curMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const routineList = config.routineMode === 'school' ? SCHOOL_DAYS_ROUTINE : LEAVE_DAYS_ROUTINE;

    let activeSlot: RoutineSlot | null = null;
    let nextSlot: RoutineSlot | null = null;
    let slotProgress = 0;

    for (let i = 0; i < routineList.length; i++) {
      const slot = routineList[i];
      let s = slot.startMin;
      let e = slot.endMin;

      if (curMin >= s && curMin < e) {
        activeSlot = slot;
        nextSlot = routineList[(i + 1) % routineList.length];
        slotProgress = Math.min(100, Math.max(0, ((curMin - s) / (e - s)) * 100));
        break;
      }
    }

    if (!activeSlot) {
      const nightSlot = routineList[routineList.length - 1];
      activeSlot = nightSlot;
      nextSlot = routineList[0];
      slotProgress = 50;
    }

    return { activeSlot, nextSlot, slotProgress };
  }, [currentTime, config.routineMode]);

  // Recenter widgets intelligently
  const recenterWidgets = useCallback(() => {
    const sw = window.innerWidth;
    const sh = window.innerHeight;

    // Responsive dynamic gap: clamp(1rem, 2.5vh, 2.5rem)
    const gapY = Math.max(16, Math.min(40, Math.round(sh * 0.025)));
    const gapX = Math.max(16, Math.min(32, Math.round(sw * 0.015)));
    const bottomReserved = Math.max(52, Math.round(sh * 0.065));

    // If active layout mode is Grid with a selected 50-grid arrangement preset:
    if (config.layoutMode === 'grid') {
      const currentPreset =
        STUDIO_LAYOUT_ARRANGEMENTS.find(p => p.id === (config.selectedGridPresetId || 'preset-grid-1')) ||
        STUDIO_LAYOUT_ARRANGEMENTS[0];
      const coords = computePresetWidgetCoordinates(
        currentPreset,
        sw,
        sh,
        gapY,
        Math.round(Math.max(16, sw * 0.02))
      );
      updateConfig(prev => ({
        ...prev,
        clock: { ...prev.clock, ...coords.clock },
        countdown: { ...prev.countdown, ...coords.countdown },
        nameWidget: { ...prev.nameWidget, ...coords.nameWidget },
        tasks: { ...prev.tasks, ...coords.tasks },
        notification: { ...prev.notification, ...coords.notification },
        calendar: { ...prev.calendar, ...coords.calendar },
        motivation: { ...prev.motivation, ...coords.motivation },
        pomodoro: { ...prev.pomodoro, ...coords.pomodoro },
        scratchpad: prev.scratchpad ? { ...prev.scratchpad, ...coords.scratchpad } : {
          visible: true,
          glassBg: true,
          x: coords.scratchpad?.x ?? 50,
          y: coords.scratchpad?.y ?? 550,
          width: 380,
          height: 300,
        },
      }));
      return;
    }

    const nameW = config.nameWidget.width || 480;
    const nameH = config.nameWidget.height || 100;
    const clockW = config.clock.width || 580;
    const clockH = config.clock.height || 180;
    const cdW = config.countdown.width || 460;
    const cdH = config.countdown.height || 170;
    const notifW = config.notification.width || 460;
    const notifH = config.notification.height || 170;
    const tasksW = config.tasks.width || 360;
    const tasksH = config.tasks.height || 340;
    const calW = config.calendar.width || 380;
    const calH = config.calendar.height || 340;
    const motW = config.motivation.width || 440;
    const motH = config.motivation.height || 140;
    const pomoW = config.pomodoro?.width || 360;
    const pomoH = config.pomodoro?.height || 240;
    const spW = config.scratchpad?.width || 380;
    const spH = config.scratchpad?.height || 300;

    if (sw >= 1400) {
      // 1. Top section: Title header and Clock hero
      const nameX = Math.max(10, Math.round((sw - nameW) / 2));
      const nameY = Math.max(16, Math.round(sh * 0.025));

      const clockX = Math.max(10, Math.round((sw - clockW) / 2));
      const clockY = nameY + nameH + gapY;

      const topEnd = clockY + clockH;
      const availableMiddleH = sh - topEnd - bottomReserved - gapY;

      // 2. Middle section center-line balancing
      const middleY = topEnd + gapY + Math.max(0, Math.round((availableMiddleH - Math.max(cdH, notifH)) / 2));
      const cdX = Math.max(20, Math.round((sw / 2) - cdW - gapX / 2));
      const notifX = Math.min(sw - notifW - 20, Math.round((sw / 2) + gapX / 2));

      // 3. Side columns expanding vertically to balance the viewport
      const pomoX = Math.max(20, sw - pomoW - 30);
      const pomoY = nameY;
      const tasksX = Math.max(20, sw - tasksW - 30);
      const availableRight = sh - pomoY - pomoH - bottomReserved - gapY;
      const tasksY = Math.min(sh - tasksH - bottomReserved, pomoY + pomoH + gapY + Math.max(0, Math.round((availableRight - tasksH) / 2)));

      const motX = 30;
      const motY = nameY;
      const calX = 30;
      const availableLeft = sh - motY - motH - bottomReserved - gapY;
      const calY = Math.min(sh - calH - bottomReserved, motY + motH + gapY + Math.max(0, Math.round((availableLeft - calH) / 2)));

      const spX = Math.max(20, Math.round((sw - spW) / 2));
      const spY = Math.min(sh - spH - 20, Math.max(topEnd + gapY, sh - spH - 30));

      updateConfig(prev => ({
        ...prev,
        nameWidget: { ...prev.nameWidget, x: nameX, y: nameY },
        clock: { ...prev.clock, x: clockX, y: clockY },
        countdown: { ...prev.countdown, x: cdX, y: middleY },
        notification: { ...prev.notification, x: notifX, y: middleY },
        tasks: { ...prev.tasks, x: tasksX, y: tasksY },
        calendar: { ...prev.calendar, x: calX, y: calY },
        motivation: { ...prev.motivation, x: motX, y: motY },
        pomodoro: { ...prev.pomodoro, x: pomoX, y: pomoY },
        scratchpad: { ...prev.scratchpad, x: prev.scratchpad?.x ?? spX, y: prev.scratchpad?.y ?? spY, width: spW, height: spH },
      }));
    } else {
      const nameX = Math.max(10, Math.round((sw - nameW) / 2));
      const nameY = Math.max(12, Math.round(sh * 0.015));
      const stepGap = Math.max(8, Math.min(18, Math.round(gapY * 0.65)));

      const clockX = Math.max(10, Math.round((sw - clockW) / 2));
      const clockY = nameY + nameH + stepGap;
      const cdX = Math.max(10, Math.round((sw - cdW) / 2));
      const cdY = clockY + clockH + stepGap;
      const notifX = Math.max(10, Math.round((sw - notifW) / 2));
      const notifY = cdY + cdH + stepGap;
      const tasksX = Math.max(10, Math.round((sw - tasksW) / 2));
      const tasksY = notifY + notifH + stepGap;
      const pomoX = Math.max(10, Math.round((sw - pomoW) / 2));
      const pomoY = tasksY + tasksH + stepGap;
      const calX = Math.max(10, Math.round((sw - calW) / 2));
      const calY = pomoY + pomoH + stepGap;
      const motX = Math.max(10, Math.round((sw - motW) / 2));
      const motY = calY + calH + stepGap;
      const spX = Math.max(10, Math.round((sw - spW) / 2));
      const spY = motY + motH + stepGap;

      updateConfig(prev => ({
        ...prev,
        nameWidget: { ...prev.nameWidget, x: nameX, y: nameY },
        clock: { ...prev.clock, x: clockX, y: clockY },
        countdown: { ...prev.countdown, x: cdX, y: cdY },
        notification: { ...prev.notification, x: notifX, y: notifY },
        tasks: { ...prev.tasks, x: tasksX, y: tasksY },
        calendar: { ...prev.calendar, x: calX, y: calY },
        motivation: { ...prev.motivation, x: motX, y: motY },
        pomodoro: { ...prev.pomodoro, x: pomoX, y: pomoY },
        scratchpad: { ...prev.scratchpad, x: prev.scratchpad?.x ?? spX, y: prev.scratchpad?.y ?? spY, width: spW, height: spH },
      }));
    }
  }, [
    config.layoutMode,
    config.selectedGridPresetId,
    config.nameWidget.width,
    config.nameWidget.height,
    config.clock.width,
    config.clock.height,
    config.countdown.width,
    config.countdown.height,
    config.notification.width,
    config.notification.height,
    config.tasks.width,
    config.tasks.height,
    config.calendar.width,
    config.calendar.height,
    config.motivation.width,
    config.motivation.height,
    config.pomodoro?.width,
    config.pomodoro?.height,
    config.scratchpad?.width,
    config.scratchpad?.height,
    updateConfig,
  ]);

  useEffect(() => {
    if (
      config.clock.x === null ||
      config.clock.y === null ||
      config.nameWidget.x === null ||
      config.notification.x === null ||
      config.countdown.x === null ||
      config.tasks.x === null ||
      config.calendar.x === null ||
      config.motivation.x === null ||
      config.pomodoro?.x === null ||
      config.pomodoro?.y === null ||
      config.scratchpad?.x === null ||
      config.scratchpad?.y === null
    ) {
      recenterWidgets();
    }
  }, [
    config.clock.x,
    config.clock.y,
    config.nameWidget.x,
    config.notification.x,
    config.countdown.x,
    config.tasks.x,
    config.calendar.x,
    config.motivation.x,
    config.pomodoro?.x,
    config.pomodoro?.y,
    config.scratchpad?.x,
    config.scratchpad?.y,
    recenterWidgets,
  ]);

  // Sync fullscreen change & window resize with dynamic layout rebalancing
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFull);
      const hudEl = document.getElementById('floating-hud');
      if (isFull) {
        document.body.classList.add('fullscreen-locked');
        setDrawerOpen(false);
        if (hudEl) {
          hudEl.style.display = 'none';
        }
      } else {
        document.body.classList.remove('fullscreen-locked');
        if (hudEl) {
          hudEl.style.display = 'flex';
        }
      }
      recenterWidgets();
    };

    const handleResize = () => {
      recenterWidgets();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [recenterWidgets]);

  useEffect(() => {
    if (zenMode) {
      document.body.classList.add('zen-mode');
      setDrawerOpen(false);
    } else {
      document.body.classList.remove('zen-mode');
    }
  }, [zenMode]);

  // ================= 2. KEYBOARD SHORTCUTS (INCLUDING CMD+K / CTRL+K & ALT+N) =================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut for Scratchpad (Alt+N)
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setScratchpadCollapsed(prev => !prev);
        const textarea = scratchpadRef.current?.querySelector('textarea');
        if (textarea) textarea.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandMenuOpen(prev => !prev);
        return;
      }

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (key === 'm') {
        e.preventDefault();
        setDrawerOpen(prev => !prev);
      } else if (key === 'v') {
        e.preventDefault();
        setStudioOpen(prev => !prev);
      } else if (key === 'd') {
        e.preventDefault();
        setHistoryModalOpen(prev => !prev);
      } else if (key === 'c') {
        e.preventDefault();
        recenterWidgets();
      } else if (key === 'h') {
        e.preventDefault();
        if (config.optionalFeatures.focusMode) {
          handleToggleFocusMode();
        } else {
          setZenMode(prev => !prev);
        }
      } else if (key === 'escape') {
        setCommandMenuOpen(false);
        setDrawerOpen(false);
        setHistoryModalOpen(false);
        setZenMode(false);
        setPlacementModal(null);
        setContextMenu(null);
        if (isFocusModeActive) {
          setIsFocusModeActive(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recenterWidgets, config.optionalFeatures.focusMode, isFocusModeActive]);

  // Canvas Atmosphere Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number; y: number; radius: number; dx: number; dy: number; alpha: number }> = [];
    let matrixCols: number[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (config.canvasTheme === 'nebula' || config.canvasTheme === 'fireflies') {
        const count = Math.round((config.canvasTheme === 'nebula' ? 90 : 50) * config.animationIntensity);
        particles = [];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * (config.canvasTheme === 'nebula' ? 2 : 4) + 0.5,
            dx: (Math.random() - 0.5) * 0.4 * config.animationIntensity,
            dy: (Math.random() - 0.5) * 0.4 * config.animationIntensity,
            alpha: Math.random() * 0.8 + 0.2,
          });
        }
      } else if (config.canvasTheme === 'matrix') {
        const cols = Math.floor(canvas.width / 20);
        matrixCols = [];
        for (let i = 0; i < cols; i++) {
          matrixCols[i] = Math.random() * -100;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (config.personalization.reducedMotion || config.isWallpaperStatic || config.canvasTheme === 'none' || config.wallpaperUrl) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (config.canvasTheme === 'aurora') {
        const t = performance.now() * 0.0008 * config.animationIntensity;
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.4, '#064e3b');
        grad.addColorStop(0.7, '#022c22');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height * 0.5);
          for (let x = 0; x <= canvas.width; x += 40) {
            const y = Math.sin(x * 0.003 + t + i) * 80 + Math.sin(x * 0.007 - t) * 40 + (canvas.height * 0.4 + i * 50);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          ctx.fillStyle = i === 0 ? 'rgba(52, 211, 153, 0.08)' : i === 1 ? 'rgba(56, 189, 248, 0.06)' : 'rgba(168, 85, 247, 0.05)';
          ctx.fill();
        }
      } else if (config.canvasTheme === 'nebula') {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.dx;
          p.y += p.dy;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();
        });
      } else if (config.canvasTheme === 'cyberpunk') {
        ctx.fillStyle = '#090514';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.lineWidth = 1;
        const horizon = canvas.height * 0.65;
        for (let x = -canvas.width; x < canvas.width * 2; x += 60) {
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.5, horizon);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = horizon; y < canvas.height; y += (y - horizon) * 0.25 + 12) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      } else if (config.canvasTheme === 'matrix') {
        ctx.fillStyle = 'rgba(3, 4, 7, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#22c55e';
        ctx.font = '14px monospace';
        matrixCols.forEach((y, i) => {
          const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
          ctx.fillText(char, i * 20, y);
          if (y > canvas.height && Math.random() > 0.975) {
            matrixCols[i] = 0;
          } else {
            matrixCols[i] = y + 16 * config.animationIntensity;
          }
        });
      } else if (config.canvasTheme === 'fireflies') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += Math.sin(performance.now() * 0.001 * config.animationIntensity + p.radius) * 0.4;
          p.y += p.dy;
          if (p.y < 0) p.y = canvas.height;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${Math.sin(performance.now() * 0.003 + p.x) * 0.4 + 0.5})`;
          ctx.fill();
        });
      } else {
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [config.canvasTheme, config.wallpaperUrl, config.animationIntensity, config.isWallpaperStatic, config.personalization.reducedMotion]);

  // Pointer event listeners for Drag & Corner Resize
  const getWidgetRef = (widgetName: DashboardWidgetKey) => {
    switch (widgetName) {
      case 'nameWidget':
        return nameWidgetRef.current;
      case 'clock':
        return clockRef.current;
      case 'countdown':
        return countdownRef.current;
      case 'tasks':
        return tasksRef.current;
      case 'notification':
        return notifRef.current;
      case 'calendar':
        return calendarRef.current;
      case 'motivation':
        return motivationRef.current;
      case 'pomodoro':
        return pomodoroRef.current;
      case 'scratchpad':
        return scratchpadRef.current;
    }
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    widgetName: DashboardWidgetKey
  ) => {
    setFocusedWidget(widgetName);
    if (!config.optionalFeatures.widgetCustomization) return;
    if (isFullscreen || zenMode || isFocusModeActive) return;

    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('.task-item-action') ||
      target.closest('.no-drag')
    ) {
      return;
    }

    const handle = target.closest('.resize-handle') as HTMLElement | null;
    const el = getWidgetRef(widgetName);
    if (!el) return;

    if (handle) {
      dragResizeState.current = {
        type: 'resize',
        widget: widgetName,
        handle: handle.dataset.handle,
        startX: e.clientX,
        startY: e.clientY,
        initX: el.offsetLeft,
        initY: el.offsetTop,
        initW: el.offsetWidth,
        initH: el.offsetHeight,
      };
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    if (target.closest('.dashboard-widget')) {
      dragResizeState.current = {
        type: 'drag',
        widget: widgetName,
        startX: e.clientX - el.offsetLeft,
        startY: e.clientY - el.offsetTop,
        initX: el.offsetLeft,
        initY: el.offsetTop,
        initW: el.offsetWidth,
        initH: el.offsetHeight,
      };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const state = dragResizeState.current;
      if (!state.type || !state.widget || !config.optionalFeatures.widgetCustomization) return;

      const el = getWidgetRef(state.widget);
      if (!el) return;

      if (state.type === 'drag') {
        let nx = e.clientX - state.startX;
        let ny = e.clientY - state.startY;

        nx = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, nx));
        ny = Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, ny));

        el.style.left = `${nx}px`;
        el.style.top = `${ny}px`;

        updateConfig(prev => ({
          ...prev,
          [state.widget!]: {
            ...prev[state.widget!],
            x: nx,
            y: ny,
          },
        }));
      } else if (state.type === 'resize' && state.handle) {
        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        let newW = state.initW;
        let newH = state.initH;
        let newLeft = state.initX;
        let newTop = state.initY;

        const minW = state.widget === 'nameWidget' ? 280 : state.widget === 'tasks' ? 260 : 260;
        const minH = state.widget === 'nameWidget' ? 70 : state.widget === 'tasks' ? 200 : 100;

        if (state.handle.includes('e')) newW = Math.max(minW, state.initW + dx);
        if (state.handle.includes('s')) newH = Math.max(minH, state.initH + dy);
        if (state.handle.includes('w')) {
          newW = Math.max(minW, state.initW - dx);
          newLeft = state.initX + (state.initW - newW);
        }
        if (state.handle.includes('n')) {
          newH = Math.max(minH, state.initH - dy);
          newTop = state.initY + (state.initH - newH);
        }

        el.style.width = `${newW}px`;
        el.style.height = `${newH}px`;
        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;

        updateConfig(prev => ({
          ...prev,
          [state.widget!]: {
            ...prev[state.widget!],
            width: newW,
            height: newH,
            x: newLeft,
            y: newTop,
          },
        }));
      }
    };

    const onPointerUp = () => {
      dragResizeState.current = {
        type: null,
        widget: null,
        startX: 0,
        startY: 0,
        initX: 0,
        initY: 0,
        initW: 0,
        initH: 0,
      };
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [updateConfig, config.optionalFeatures.widgetCustomization]);

  const handleWheelZoom = (
    e: React.WheelEvent<HTMLDivElement>,
    widget: DashboardWidgetKey
  ) => {
    if (!config.optionalFeatures.widgetCustomization) return;
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const minW = widget === 'nameWidget' ? 280 : widget === 'tasks' ? 260 : 260;
    const minH = widget === 'nameWidget' ? 70 : widget === 'tasks' ? 200 : 100;
    updateConfig(prev => {
      const current = (prev as any)[widget];
      const newW = Math.max(minW, Math.min(window.innerWidth * 0.9, Math.round(current.width * factor)));
      const newH = Math.max(minH, Math.min(window.innerHeight * 0.8, Math.round(current.height * factor)));
      return {
        ...prev,
        [widget]: {
          ...current,
          width: newW,
          height: newH,
        },
      };
    });
  };

  // Clock dynamic values
  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const milliseconds = String(Math.floor(currentTime.getMilliseconds())).padStart(3, '0');

  const displayHours = config.clock.is12h ? hours % 12 || 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHoursStr = String(displayHours).padStart(2, '0');

  const dayOfWeekStr = config.clock.showDay ? `${DAYS[currentTime.getDay()]}, ` : '';
  const dateFormatted = `${dayOfWeekStr}${currentTime.getDate()} ${MONTHS[currentTime.getMonth()]} ${currentTime.getFullYear()}`;

  const clockScaleFactor = Math.min((config.clock.width || 580) / 460, (config.clock.height || 180) / 130);
  const clockFontSize = Math.max(28, Math.min(130, Math.round(clockScaleFactor * 56)));
  const dateFontSize = Math.max(11, Math.round(clockFontSize * 0.18));

  const countdownScaleFactor = Math.min((config.countdown.width || 460) / 440, (config.countdown.height || 170) / 130);
  const cdDayFontSize = Math.max(32, Math.min(95, Math.round(countdownScaleFactor * 52)));

  const targetTime = new Date(config.countdown.targetDate).getTime();
  const nowTime = currentTime.getTime();
  const diffTime = targetTime - nowTime;
  const isExamToday = nowTime >= targetTime && nowTime <= targetTime + 86400000;
  const isExamPassed = diffTime < 0;

  const cdDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const cdHours = Math.max(0, Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const cdMinutes = Math.max(0, Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60)));
  const cdSeconds = Math.max(0, Math.floor((diffTime % (1000 * 60)) / 1000));

  const targetDateObj = new Date(config.countdown.targetDate);
  const examDateLabel = `Public Exams Begin — ${targetDateObj.getDate()} ${MONTHS[targetDateObj.getMonth()]} ${targetDateObj.getFullYear()}`;

  const nextExam = useMemo(() => {
    const todayStr = currentTime.toISOString().slice(0, 10);
    return PUBLIC_EXAM_TIMETABLE.find(e => e.targetYearMonthDay >= todayStr) || PUBLIC_EXAM_TIMETABLE[0];
  }, [currentTime]);

  const daysToNextExam = useMemo(() => {
    if (!nextExam) return 0;
    const diff = new Date(nextExam.targetYearMonthDay).getTime() - currentTime.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [nextExam, currentTime]);

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;

  const getClockArchClass = () => {
    const arch = config.clock.architecture;
    if (arch && arch !== 'minimal') {
      return `clock-style-${arch}`;
    }
    return '';
  };

  const getWidgetMaterialClass = (glassBg: boolean) => {
    if (!glassBg) {
      return 'widget-transparent';
    }
    if (config.widgetStyle && config.widgetStyle !== 'transparent') {
      return `widget-style-${config.widgetStyle}`;
    }
    return 'widget-glass-card';
  };

  const getElementTypographyStyle = (
    elementKey: keyof DashboardTypographyConfig['elements'],
    baseStyles?: React.CSSProperties
  ): React.CSSProperties => {
    const typo = config.typography;
    const globalScale = typo?.globalScale ?? 1.0;
    const elConfig = typo?.elements?.[elementKey] || DEFAULT_ELEMENT_TYPOGRAPHY[elementKey];
    if (!elConfig) return baseStyles || {};

    const style: React.CSSProperties = { ...baseStyles };

    if (elConfig.fontSize) {
      style.fontSize = `${Math.round(elConfig.fontSize * globalScale)}px`;
    }
    if (elConfig.fontWeight) {
      style.fontWeight = elConfig.fontWeight;
    }
    if (elConfig.letterSpacing !== undefined) {
      style.letterSpacing = `${elConfig.letterSpacing}px`;
    }
    if (elConfig.lineHeight) {
      style.lineHeight = elConfig.lineHeight;
    }
    if (elConfig.textAlign) {
      style.textAlign = elConfig.textAlign;
    }
    if (elConfig.color) {
      style.color = elConfig.color;
    }
    if (elConfig.opacity !== undefined) {
      style.opacity = elConfig.opacity;
    }
    if (elConfig.textTransform) {
      style.textTransform = elConfig.textTransform;
    }
    if (elConfig.isItalic) {
      style.fontStyle = 'italic';
    }
    if (elConfig.isUnderline) {
      style.textDecoration = 'underline';
    }

    const shadows: string[] = [];
    if (elConfig.textShadow === 'soft') {
      shadows.push('0 2px 8px rgba(0,0,0,0.6)');
    } else if (elConfig.textShadow === 'crisp') {
      shadows.push('0 2px 0 rgba(0,0,0,0.9)');
    } else if (elConfig.textShadow === 'deep') {
      shadows.push('0 6px 20px rgba(0,0,0,0.9)');
    } else if (elConfig.textShadow === 'outline') {
      shadows.push('-1px -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9)');
    } else if (elConfig.textShadow === 'neon-glow' || elConfig.textGlow) {
      const glowC = elConfig.glowColor || config.clock.color || '#06b6d4';
      const intensity = elConfig.glowIntensity || 14;
      shadows.push(`0 0 ${intensity}px ${glowC}`);
    }

    if (shadows.length > 0) {
      style.textShadow = shadows.join(', ');
    }

    return style;
  };

  const getElementFontClass = (elementKey: keyof DashboardTypographyConfig['elements']) => {
    const typo = config.typography;
    const elConfig = typo?.elements?.[elementKey] || DEFAULT_ELEMENT_TYPOGRAPHY[elementKey];
    const fontId = elConfig?.fontFamily || (
      elementKey === 'clockMain' ? typo?.fontClock :
      elementKey === 'clockDate' ? typo?.fontHeading :
      elementKey === 'countdownNumber' ? (typo?.fontCountdown || typo?.fontClock) :
      elementKey === 'countdownLabel' ? typo?.fontLabels :
      elementKey === 'widgetTitle' ? typo?.fontHeading :
      elementKey === 'buttonLabel' ? typo?.fontLabels :
      typo?.fontBody
    ) || 'inter';

    const found = STUDIO_FONTS.find(f => f.id === fontId);
    return found ? found.cssClass : 'font-inter';
  };

  const getFontFamilyClass = (element: 'clock' | 'heading' | 'body' | 'countdown' | 'labels') => {
    const typo = config.typography;
    if (!typo) return 'font-inter';
    const fontId = element === 'clock' ? typo.fontClock :
                   element === 'heading' ? typo.fontHeading :
                   element === 'countdown' ? (typo.fontCountdown || typo.fontClock) :
                   element === 'labels' ? typo.fontLabels : typo.fontBody;
    const found = STUDIO_FONTS.find(f => f.id === fontId);
    return found ? found.cssClass : 'font-inter';
  };

  const glowStyle = config.clock.glow > 0 ? { textShadow: `0 0 ${config.clock.glow}px ${config.clock.color}` } : {};
  const showHandles = config.optionalFeatures.widgetCustomization && !isFullscreen && !zenMode && !isFocusModeActive;

  // ================= 2. QUICK ACCESS COMMANDS LIST =================
  const commandActions = useMemo(() => {
    const list: Array<{ id: string; label: string; category: string; shortcut?: string; action: () => void; available: boolean }> = [
      {
        id: 'visual-studio',
        label: 'Open Visual Customization Studio (Themes, Fonts, Wallpapers, Styles)',
        category: 'Studio',
        shortcut: 'V',
        action: () => { setStudioOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'home',
        label: 'Go to Home (Recenter & Align)',
        category: 'Navigation',
        shortcut: 'C',
        action: () => { recenterWidgets(); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'focus-mode',
        label: isFocusModeActive ? 'Exit Focus Mode' : 'Enter Focus Mode (Distraction-Free)',
        category: 'Focus',
        shortcut: 'H',
        action: () => { handleToggleFocusMode(); setCommandMenuOpen(false); },
        available: config.optionalFeatures.focusMode,
      },
      {
        id: 'daily-registry',
        label: 'Open Daily Registry & Personal History',
        category: 'Study',
        shortcut: 'D',
        action: () => { setHistoryModalOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'timetable',
        label: 'Open Public Exam Timetable',
        category: 'Study',
        action: () => { setActiveTab('timetable'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'routine',
        label: 'Open Personal Study Routine (School vs Leave)',
        category: 'Study',
        action: () => { setActiveTab('routine'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'toggle-mode',
        label: `Switch Timetable Mode to ${config.routineMode === 'school' ? 'Leave Day & Sundays' : 'School Day'}`,
        category: 'Study',
        action: () => { toggleRoutineMode(); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'countdown',
        label: 'Open Public Exam Countdown Settings',
        category: 'Widgets',
        action: () => { setActiveTab('countdown'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'tasks',
        label: 'Open Quick Tasks Manager',
        category: 'Widgets',
        action: () => { setActiveTab('tasks'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'calendar',
        label: 'Open Calendar View & Schedule',
        category: 'Widgets',
        action: () => {
          if (!config.calendar.visible) {
            updateConfig(p => ({ ...p, calendar: { ...p.calendar, visible: true } }));
          }
          setCommandMenuOpen(false);
        },
        available: config.optionalFeatures.calendarWidget,
      },
      {
        id: 'next-quote',
        label: "Browse Next Day's Motivational Quote",
        category: 'Motivation',
        action: () => { handleNextQuoteDate(); setCommandMenuOpen(false); },
        available: config.optionalFeatures.dailyMotivation,
      },
      {
        id: 'prev-quote',
        label: "Browse Previous Day's Motivational Quote",
        category: 'Motivation',
        action: () => { handlePrevQuoteDate(); setCommandMenuOpen(false); },
        available: config.optionalFeatures.dailyMotivation,
      },
      {
        id: 'today-quote',
        label: "Return to Today's Motivational Quote",
        category: 'Motivation',
        action: () => { handleResetQuoteToToday(); setCommandMenuOpen(false); },
        available: config.optionalFeatures.dailyMotivation,
      },
      {
        id: 'personalization',
        label: 'Open Personalization Center (Themes & Layouts)',
        category: 'Settings',
        action: () => { setActiveTab('personalization'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'backup-restore',
        label: 'Open Backup & Restore (Export/Import JSON)',
        category: 'Settings',
        action: () => { setActiveTab('backup'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'cloud-sync',
        label: 'Open Firebase Cloud Sync & Account',
        category: 'Settings',
        action: () => { setActiveTab('cloud'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'pomodoro-toggle',
        label: isPomoRunning ? 'Pause Pomodoro Timer' : 'Start 25-min Pomodoro Study Session',
        category: 'Pomodoro',
        shortcut: 'P',
        action: () => { togglePomodoro(); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'pomodoro-break',
        label: 'Switch Pomodoro to 5-min Short Break',
        category: 'Pomodoro',
        action: () => { handleSwitchPomoMode('shortBreak'); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'pomodoro-reset',
        label: 'Reset Pomodoro Timer',
        category: 'Pomodoro',
        action: () => { resetPomodoro(); setCommandMenuOpen(false); },
        available: true,
      },
      {
        id: 'features-menu',
        label: 'Open Optional Features Switches Menu',
        category: 'Settings',
        shortcut: 'M',
        action: () => { setActiveTab('features'); setDrawerOpen(true); setCommandMenuOpen(false); },
        available: true,
      },
    ];

    if (!commandSearch.trim()) return list;
    const q = commandSearch.toLowerCase();
    return list.filter(item => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [commandSearch, isFocusModeActive, isPomoRunning, config.optionalFeatures, config.routineMode, config.calendar.visible, recenterWidgets, handleToggleFocusMode, toggleRoutineMode, handleNextQuoteDate, handlePrevQuoteDate, handleResetQuoteToToday, updateConfig, togglePomodoro, resetPomodoro]);

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommandIndex(prev => (prev + 1) % commandActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommandIndex(prev => (prev - 1 + commandActions.length) % commandActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = commandActions[selectedCommandIndex];
      if (item && item.available) {
        item.action();
      }
    }
  };

  const radiusClass = config.personalization.widgetRadius === 'normal' ? 'rounded-2xl' : config.personalization.widgetRadius === 'pill' ? 'rounded-[32px]' : 'rounded-[24px]';

  return (
    <div
      ref={dashboardRef}
      id="app"
      onContextMenu={handleContextMenu}
      onClick={handleDashboardClick}
      className={`relative w-screen h-screen min-h-screen h-[100dvh] ${
        isMobileScreen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
      } select-none bg-[#030407] text-slate-100 ${
        isFullscreen ? 'is-fullscreen' : ''
      } ${
        isPlacementModeActive ? 'cursor-crosshair' : !config.optionalFeatures.widgetCustomization ? 'cursor-default' : ''
      }`}
    >
      {/* ================= CINEMATIC ANIMATED BACKDROP & WALLPAPER LAYER ================= */}
      <AnimatedCharacterBackdrop
        canvasTheme={config.canvasTheme}
        wallpaperUrl={config.wallpaperUrl}
        videoUrl={config.videoUrl}
        isStatic={config.isWallpaperStatic}
        reducedMotion={config.personalization.reducedMotion}
        dimmer={isFocusModeActive ? Math.max(75, config.bgDimmer) : config.bgDimmer}
        blur={config.bgBlur}
        brightness={config.bgBrightness}
        saturation={config.bgSaturation}
        scaling={config.wallpaperScaling || 'cover'}
        controls={config.animationControls}
        activeThemeId={config.activeThemeId}
        onWallpaperFallback={fallbackUrl => {
          updateConfig(prev => ({
            ...prev,
            wallpaperUrl: fallbackUrl,
            activeWallpaper: 'jp-tokyo-cyberpunk',
          }));
        }}
      />

      {/* ================= FLOATING ACTION CONTROLS (TOP RIGHT CORNER) ================= */}
      <div
        id="floating-hud"
        style={{ display: isFullscreen ? 'none' : 'flex' }}
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-40 items-center gap-2 transition-all duration-300 ${
          isFullscreen ? 'hidden pointer-events-none opacity-0' : 'flex'
        }`}
      >
        {/* Responsive Screen Auto-Fit Button (Laptop / Mobile) */}
        <button
          onClick={() => {
            if (isMobileScreen) {
              applyMobileFitLayout();
            } else {
              applyLaptopFitLayout();
            }
          }}
          title={isMobileScreen ? 'Fit all widgets perfectly for Mobile Screen' : 'Fit all widgets perfectly for Laptop Screen'}
          aria-label="Responsive Layout Auto-Fit"
          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl hud-btn cursor-pointer flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/10 text-cyan-300 hover:text-white transition shadow-sm"
        >
          {isMobileScreen ? <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />}
        </button>

        {/* Click-to-Add Placement Mode Button */}
        <button
          onClick={() => {
            setIsPlacementModeActive(prev => !prev);
            if (!isPlacementModeActive) {
              setPlacementModal({
                isOpen: true,
                x: Math.round(window.innerWidth / 2 - 190),
                y: Math.round(window.innerHeight / 2 - 160),
                occupiedBy: null,
                occupiedWidgetLabel: null,
              });
            } else {
              setPlacementModal(null);
            }
          }}
          title={isPlacementModeActive ? 'Exit Widget Placement Mode' : 'Click to Add / Place Widget At Selected Location'}
          aria-label="Toggle Widget Placement Mode"
          className={`p-2.5 sm:p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl hud-btn cursor-pointer flex items-center justify-center border transition shadow-sm ${
            isPlacementModeActive
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400'
              : 'bg-black/40 hover:bg-black/60 border-white/10 text-white/80 hover:text-white'
          }`}
        >
          <Crosshair className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlacementModeActive ? 'animate-spin' : ''}`} />
        </button>

        {/* Visual Customization Studio Button (Themes, Wallpapers, 50 Presets) */}
        <button
          onClick={() => setStudioOpen(true)}
          title="Studio (Themes, Wallpapers & 50 Grid Layouts) [Press V]"
          aria-label="Open Studio Customization"
          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl hud-btn cursor-pointer flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/10 text-emerald-300 hover:text-emerald-200 transition shadow-sm"
        >
          <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Daily Registry & Personal History Button */}
        <button
          onClick={() => setHistoryModalOpen(true)}
          title="Daily Registry & Personal History (Firebase Persistent Study Records)"
          aria-label="Open Daily Registry & Personal History"
          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl hud-btn cursor-pointer flex items-center justify-center bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.2)] relative"
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
          {Object.keys(dailyRegistryHistory).length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>

        {/* Fullscreen Mode Icon */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          title={isFullscreen ? 'Exit Full Screen (Press F)' : 'Full Screen Pure View (Press F)'}
          aria-label="Toggle Full Screen"
          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl hud-btn cursor-pointer flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white transition shadow-sm"
        >
          {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />}
        </button>

        {/* Menu Bar Icon */}
        <button
          onClick={() => setDrawerOpen(true)}
          title="Menu & Settings (Press M)"
          aria-label="Open Settings and Features Menu"
          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl hud-btn cursor-pointer relative flex items-center justify-center bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          {syncStatus === 'saving' ? (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          ) : syncStatus === 'saved' ? (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>
      </div>



      {/* ================= FOCUS MODE OVERLAY BANNER ================= */}
      {isFocusModeActive && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-xl border border-amber-400/40 text-xs shadow-[0_0_30px_rgba(251,191,36,0.2)] animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold tracking-widest text-amber-300 uppercase font-['Plus_Jakarta_Sans']">
              FOCUS MODE ACTIVE
            </span>
          </div>
          <span className="opacity-40">•</span>
          <span className="text-white/80 font-medium">
            {currentSlotInfo.activeSlot?.activity}
          </span>
          <button
            onClick={handleToggleFocusMode}
            className="ml-2 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Exit Focus</span>
          </button>
        </div>
      )}

      {/* ================= 1. DAILY MOTIVATION WIDGET (FEATURE 1) ================= */}
      {config.optionalFeatures.dailyMotivation && config.motivation.visible && !isFocusModeActive && (
        <div
          ref={motivationRef}
          id="motivation-widget"
          onPointerDown={e => handlePointerDown(e, 'motivation')}
          onWheel={e => handleWheelZoom(e, 'motivation')}
          className={`dashboard-widget z-20 px-5 py-4 flex flex-col justify-between ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.motivation.glassBg)} ${focusedWidget === 'motivation' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: isMobileScreen ? Math.min(viewportWidth - 24, config.motivation.width || 480) : (config.motivation.width || 480),
            height: isMobileScreen ? 'auto' : (config.motivation.height || 165),
            minHeight: isMobileScreen ? 140 : 155,
            left: isMobileScreen ? 12 : (config.motivation.x ?? 30),
            top: isMobileScreen ? (config.motivation.y ?? 24) : (config.motivation.y ?? 24),
            ...getWidgetComputedStyle('motivation'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-amber-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('motivation');
                }}
                title={config.motivation.glassBg ? 'Switch Motivation to Transparent' : 'Switch Motivation to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.motivation.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.motivation.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          {/* Top Bar with Date, Category, and Navigation Controls */}
          <div className="flex items-center justify-between no-drag pb-2 border-b border-white/10 gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-300 font-['Plus_Jakarta_Sans'] shrink-0">
                <Quote className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">DAILY QUOTE</span>
              </div>

              {/* Exact Calendar Date Pill */}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide font-medium flex items-center gap-1 shrink-0 ${
                  isViewingToday
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/35'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/35'
                }`}
                title={`Calendar Date: ${selectedQuoteDate}`}
              >
                <span>{selectedQuoteDate}</span>
                {isViewingToday ? (
                  <span className="text-[9px] uppercase font-bold text-amber-400">• Today</span>
                ) : (
                  <span className="text-[9px] uppercase font-bold text-cyan-400">• Browsing</span>
                )}
              </span>

              {/* Category Pill */}
              <span
                className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-white/90 border border-white/10 truncate max-w-[130px]"
                title={`Category: ${activeQuote.category} (${activeQuote.theme})`}
              >
                {activeQuote.category}
              </span>
            </div>

            {/* Action Buttons: Return to Today, Prev, Next, Copy, Favorite */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Return to Today Button (Visible if navigated away) */}
              {!isViewingToday && (
                <button
                  type="button"
                  onClick={handleResetQuoteToToday}
                  title="Return to Today's Quote"
                  className="px-2 py-0.5 rounded-md bg-amber-400/25 hover:bg-amber-400/40 text-amber-300 border border-amber-400/45 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Today</span>
                </button>
              )}

              {/* Previous Day Date Button */}
              <button
                type="button"
                onClick={handlePrevQuoteDate}
                title="View Previous Day's Quote"
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Next Day Date Button */}
              <button
                type="button"
                onClick={handleNextQuoteDate}
                title="View Next Day's Quote"
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Copy Quote Button */}
              <button
                type="button"
                onClick={handleCopyQuote}
                title={quoteCopied ? 'Quote copied to clipboard!' : 'Copy this quote'}
                className={`p-1 rounded-lg transition cursor-pointer border ${
                  quoteCopied
                    ? 'text-emerald-400 bg-emerald-500/20 border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                }`}
              >
                {quoteCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Favorite Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggleFavouriteQuote(selectedQuoteDate)}
                title={isCurrentQuoteFavorited ? 'Remove from favourite quotes' : 'Add to favourite quotes'}
                className={`p-1 rounded-lg transition cursor-pointer border ${
                  isCurrentQuoteFavorited
                    ? 'text-rose-400 bg-rose-500/20 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'text-white/60 hover:text-rose-300 hover:bg-white/10 border-transparent hover:border-white/10'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isCurrentQuoteFavorited ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Central Unique Daily Quote with Smooth Text Animation & High Legibility */}
          <div
            key={activeQuote.date}
            className="my-2.5 text-center no-drag px-1 animate-in fade-in zoom-in-95 duration-200"
          >
            <p className="text-xs sm:text-[13.5px] font-medium text-white/95 leading-relaxed italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-['DM_Sans']">
              "{activeQuote.quote}"
            </p>
            <div className="flex items-center justify-center gap-2 mt-1.5 text-[10px] font-semibold tracking-wider text-amber-300/90 uppercase flex-wrap">
              <span>— {activeQuote.category}</span>
              <span className="opacity-40">•</span>
              <span className="text-white/60 font-mono text-[9px]">
                Day {activeQuote.dayNumber} of 137 ({activeQuote.daysRemaining}d to Exam)
              </span>
              {isCurrentQuoteFavorited && (
                <span className="text-rose-400 text-[10px] font-bold">♥ Favorited</span>
              )}
            </div>
          </div>

          {/* Bottom Intention / Target Input Bar */}
          <div className="pt-1.5 border-t border-white/5 no-drag flex items-center justify-between text-[10px]">
            <input
              type="text"
              value={config.motivation.personalIntention}
              onChange={e => updateConfig(p => ({ ...p, motivation: { ...p.motivation, personalIntention: e.target.value } }))}
              placeholder="Set personal study goal/intention..."
              className="bg-transparent border-0 text-white/60 focus:text-white focus:outline-none w-full truncate placeholder-white/30 text-[10px]"
            />
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-amber-400" data-handle="se" />
              <div className="resize-handle resize-sw text-amber-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-amber-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-amber-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 0: CUSTOM NAME WIDGET (BK NITHILESHVAR) ================= */}
      {config.nameWidget.visible && !isFocusModeActive && (
        <div
          ref={nameWidgetRef}
          id="name-widget"
          onPointerDown={e => handlePointerDown(e, 'nameWidget')}
          onWheel={e => handleWheelZoom(e, 'nameWidget')}
          className={`dashboard-widget z-20 px-6 py-4 flex flex-col justify-center items-center ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } text-center ${getWidgetMaterialClass(config.nameWidget.glassBg)} ${focusedWidget === 'nameWidget' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.nameWidget.width || 480,
            height: config.nameWidget.height || 100,
            left: config.nameWidget.x ?? 100,
            top: config.nameWidget.y ?? 20,
            ...getWidgetComputedStyle('nameWidget'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('nameWidget');
                }}
                title={config.nameWidget.glassBg ? 'Switch Name Banner to Transparent' : 'Switch Name Banner to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.nameWidget.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.nameWidget.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          <div className="w-full flex flex-col items-center pointer-events-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black tracking-[0.18em] uppercase text-white font-['Anton'] drop-shadow-md">
                {config.nameWidget.title || 'BK NITHILESHVAR'}
              </h1>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-300" />
                <span>Centum Aspirant (Chemistry • Physics • Maths)</span>
              </span>
              <button
                type="button"
                onClick={() => toggleRoutineMode()}
                className="no-drag pointer-events-auto px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 cursor-pointer transition flex items-center gap-1"
                title="Click to switch between School Day and Leave Day schedule"
              >
                {config.routineMode === 'school' ? <School className="w-2.5 h-2.5" /> : <Coffee className="w-2.5 h-2.5" />}
                <span>{config.routineMode === 'school' ? 'School Day' : 'Leave Day'}</span>
                <span className="text-[9px] opacity-60 underline ml-0.5">Change</span>
              </button>
            </div>
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-amber-400" data-handle="se" />
              <div className="resize-handle resize-sw text-amber-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-amber-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-amber-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 1: FLOCUS CLOCK WIDGET ================= */}
      {config.clock.visible !== false && (
        <div
          ref={clockRef}
          id="clock-widget"
          onPointerDown={e => handlePointerDown(e, 'clock')}
          onWheel={e => handleWheelZoom(e, 'clock')}
          className={`dashboard-widget z-20 px-6 sm:px-8 py-5 sm:py-6 flex flex-col justify-center ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getClockArchClass()} ${getWidgetMaterialClass(config.clock.glassBg)} ${focusedWidget === 'clock' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.clock.width || 580,
            height: config.clock.height || 180,
            left: config.clock.x ?? 100,
            top: config.clock.y ?? 130,
            ...getWidgetComputedStyle('clock'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('clock');
                }}
                title={config.clock.glassBg ? 'Switch Clock to Transparent' : 'Switch Clock to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.clock.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.clock.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

        <div id="clock-container" className="w-full flex flex-col items-center justify-center text-center pointer-events-none">
          <div
            id="digits-row"
            className="flex items-baseline justify-center tracking-tight leading-none tabular-digits"
            style={{ color: config.clock.color, ...glowStyle }}
          >
            <span id="time-main" className="leading-none tabular-digits font-normal" style={{ fontSize: `${clockFontSize}px` }}>
              {displayHoursStr}:{minutes}
            </span>

            {config.clock.showSeconds && (
              <>
                <span id="time-colon-sec" className="opacity-50 px-1 leading-none" style={{ fontSize: `${clockFontSize}px` }}>
                  :
                </span>
                <span id="time-seconds" className="leading-none tabular-digits font-normal" style={{ fontSize: `${clockFontSize}px` }}>
                  {seconds}
                </span>
              </>
            )}

            {config.clock.showSeconds && config.clock.showMs && (
              <>
                <span id="time-colon-ms" className="opacity-35 px-1 leading-none text-[0.65em]" style={{ fontSize: `${clockFontSize}px` }}>
                  :
                </span>
                <span id="time-ms" className="text-[0.65em] opacity-75 leading-none tabular-digits font-normal" style={{ fontSize: `${clockFontSize}px` }}>
                  {milliseconds}
                </span>
              </>
            )}

            {config.clock.is12h && (
              <span id="time-ampm" className="ml-2.5 text-[0.32em] font-bold tracking-wider uppercase opacity-60 leading-none" style={{ fontSize: `${clockFontSize}px` }}>
                {ampm}
              </span>
            )}
          </div>

          {config.clock.showDate && (
            <div
              id="date-display"
              className="mt-3 font-medium tracking-wide opacity-75"
              style={{ fontSize: `${dateFontSize}px`, color: config.clock.color }}
            >
              <span id="date-text">{dateFormatted}</span>
            </div>
          )}
        </div>

        {showHandles && (
          <>
            <div className="resize-handle resize-se" data-handle="se" />
            <div className="resize-handle resize-sw" data-handle="sw" />
            <div className="resize-handle resize-ne" data-handle="ne" />
            <div className="resize-handle resize-nw" data-handle="nw" />
          </>
        )}
      </div>
      )}

      {/* ================= WIDGET 2: PUBLIC EXAM COUNTDOWN WIDGET ================= */}
      {!isFocusModeActive && config.countdown.visible !== false && (
        <div
          ref={countdownRef}
          id="countdown-widget"
          onPointerDown={e => handlePointerDown(e, 'countdown')}
          onWheel={e => handleWheelZoom(e, 'countdown')}
          className={`dashboard-widget z-20 px-6 sm:px-8 py-6 flex flex-col justify-center ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.countdown.glassBg)} ${focusedWidget === 'countdown' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.countdown.width || 460,
            height: config.countdown.height || 170,
            left: config.countdown.x ?? 100,
            top: config.countdown.y ?? 340,
            ...getWidgetComputedStyle('countdown'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('countdown');
                }}
                title={config.countdown.glassBg ? 'Switch Countdown to Transparent' : 'Switch Countdown to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.countdown.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.countdown.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          <div id="countdown-container" className="w-full flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3
                id="countdown-title"
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400/90 font-['Plus_Jakarta_Sans']"
              >
                {config.countdown.title || 'PUBLIC EXAM COUNTDOWN'}
              </h3>
            </div>

            {isExamToday ? (
              <div className="py-2 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold tracking-wider text-xs sm:text-sm uppercase my-2">
                PUBLIC EXAMS START TODAY
              </div>
            ) : isExamPassed ? (
              <div className="py-2 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold tracking-wider text-xs sm:text-sm uppercase my-2">
                PUBLIC EXAMS HAVE STARTED
              </div>
            ) : (
              <div id="countdown-active-view" className="flex flex-col items-center justify-center">
                <div className="flex items-baseline justify-center tracking-tight leading-none tabular-digits">
                  <span
                    id="cd-days-val"
                    className="font-['Plus_Jakarta_Sans'] font-extralight text-white leading-none tabular-digits"
                    style={{ fontSize: `${cdDayFontSize}px` }}
                  >
                    {cdDays}
                  </span>
                  <span id="cd-days-label" className="ml-2 sm:ml-3 text-xs sm:text-sm font-light text-slate-400 uppercase tracking-widest leading-none">
                    Days
                  </span>
                </div>

                <div id="cd-subgrid" className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-slate-300">
                  <div className="flex flex-col items-center">
                    <span className="text-sm sm:text-lg font-medium tabular-digits text-white font-['Plus_Jakarta_Sans']">
                      {String(cdHours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-normal">
                      Hours
                    </span>
                  </div>

                  <span className="text-slate-600 font-light text-xs -mt-3.5">:</span>

                  <div className="flex flex-col items-center">
                    <span className="text-sm sm:text-lg font-medium tabular-digits text-white font-['Plus_Jakarta_Sans']">
                      {String(cdMinutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-normal">
                      Mins
                    </span>
                  </div>

                  {config.countdown.showSeconds && (
                    <>
                      <span className="text-slate-600 font-light text-xs -mt-3.5">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-sm sm:text-lg font-medium tabular-digits text-cyan-400 font-['Plus_Jakarta_Sans']">
                          {String(cdSeconds).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-cyan-400/70 font-normal">
                          Secs
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 sm:mt-3.5 text-[10px] sm:text-xs font-normal tracking-wider text-slate-400 opacity-80">
              <span>{examDateLabel}</span>
            </div>
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-cyan-400" data-handle="se" />
              <div className="resize-handle resize-sw text-cyan-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-cyan-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-cyan-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 3: LIVE ROUTINE NOTIFICATION WIDGET ================= */}
      {config.notification.visible && (
        <div
          ref={notifRef}
          id="notification-widget"
          onPointerDown={e => handlePointerDown(e, 'notification')}
          onWheel={e => handleWheelZoom(e, 'notification')}
          className={`dashboard-widget z-20 px-5 sm:px-6 py-4 flex flex-col justify-between ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.notification.glassBg)} ${focusedWidget === 'notification' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.notification.width || 460,
            height: config.notification.height || 170,
            left: config.notification.x ?? 580,
            top: config.notification.y ?? 340,
            ...getWidgetComputedStyle('notification'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-amber-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('notification');
                }}
                title={config.notification.glassBg ? 'Switch Routine Alert to Transparent' : 'Switch Routine Alert to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.notification.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.notification.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          <div className="flex items-center justify-between no-drag">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 font-['Plus_Jakarta_Sans']">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>ROUTINE ALERT</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleRoutineMode()}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 transition cursor-pointer flex items-center gap-1"
                title="Switch between School Day and Leave Day schedule"
              >
                {config.routineMode === 'school' ? (
                  <>
                    <School className="w-3 h-3 text-cyan-400" />
                    <span>School Day</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-3 h-3 text-emerald-400" />
                    <span>Leave Day</span>
                  </>
                )}
                <span className="text-[9px] text-cyan-300 font-bold ml-0.5">⇄</span>
              </button>
            </div>
          </div>

          <div className="my-1.5 p-2.5 rounded-xl bg-black/40 border border-white/5 no-drag flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-400" /> NOW ACTIVE
              </span>
              <span className="font-mono text-[10px] text-white/60">{currentSlotInfo.activeSlot?.timeLabel}</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
              {currentSlotInfo.activeSlot?.activity}
            </div>

            <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${currentSlotInfo.slotProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/70 border-t border-white/5 pt-1.5 no-drag">
            <div className="flex items-center gap-1 truncate max-w-[55%]">
              <span className="text-white/40">NEXT:</span>
              <span className="truncate text-white/80 font-medium">{currentSlotInfo.nextSlot?.activity}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-300 font-medium shrink-0">
              <span>{nextExam.icon}</span>
              <span>{nextExam.subject} in {daysToNextExam}d</span>
            </div>
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-amber-400" data-handle="se" />
              <div className="resize-handle resize-sw text-amber-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-amber-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-amber-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 4: CALENDAR WIDGET (OPTIONAL) ================= */}
      {config.optionalFeatures.calendarWidget && config.calendar.visible && !isFocusModeActive && (
        <div
          ref={calendarRef}
          id="calendar-widget"
          onPointerDown={e => handlePointerDown(e, 'calendar')}
          onWheel={e => handleWheelZoom(e, 'calendar')}
          className={`dashboard-widget z-20 px-5 py-4 flex flex-col justify-between ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.calendar.glassBg)} ${focusedWidget === 'calendar' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.calendar.width || 380,
            height: config.calendar.height || 340,
            left: config.calendar.x ?? 30,
            top: config.countdown.y ? config.countdown.y : 340,
            ...getWidgetComputedStyle('calendar'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-sky-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('calendar');
                }}
                title={config.calendar.glassBg ? 'Switch Calendar to Transparent' : 'Switch Calendar to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.calendar.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.calendar.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          <div className="flex items-center justify-between mb-2 no-drag">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">
                {MONTHS[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewDate(new Date())}
                className="px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-[10px] text-white/70 transition cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-white/40 mb-1 no-drag">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs no-drag flex-1 items-center">
            {calendarDays.map((slot, idx) => {
              if (slot.dayNum === null) {
                return <div key={idx} className="h-6" />;
              }

              const hasExam = !!slot.exam;
              const isCentum = slot.exam?.isCentumTarget;

              return (
                <div
                  key={idx}
                  className={`relative h-6 flex items-center justify-center rounded-lg text-[11px] transition ${
                    slot.isToday
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/50'
                      : hasExam
                      ? isCentum
                        ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40'
                        : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                  title={slot.exam ? `${slot.exam.subject} Exam (${slot.dateString})` : undefined}
                >
                  <span>{slot.dayNum}</span>
                  {hasExam && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-white/5 no-drag text-[10px]">
            {examsInViewedMonth.length > 0 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-white/40 font-semibold uppercase text-[9px] shrink-0">Exams:</span>
                {examsInViewedMonth.map(ex => (
                  <span
                    key={ex.id}
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0 flex items-center gap-1 ${
                      ex.isCentumTarget ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    <span>{ex.dateStr}:</span>
                    <span>{ex.subject}</span>
                    {ex.isCentumTarget && <span>⭐</span>}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-white/40 text-[10px] text-center">
                Synchronized with 2027 Public Exam Schedule
              </div>
            )}
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-sky-400" data-handle="se" />
              <div className="resize-handle resize-sw text-sky-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-sky-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-sky-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 5: QUICK TASKS WIDGET ================= */}
      {config.tasks.visible && !isFocusModeActive && (
        <div
          ref={tasksRef}
          id="tasks-widget"
          onPointerDown={e => handlePointerDown(e, 'tasks')}
          onWheel={e => handleWheelZoom(e, 'tasks')}
          className={`dashboard-widget z-20 px-5 sm:px-6 py-5 flex flex-col ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.tasks.glassBg)} ${focusedWidget === 'tasks' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.tasks.width || 360,
            height: config.tasks.height || 340,
            left: config.tasks.x ?? 1060,
            top: config.tasks.y ?? 340,
            ...getWidgetComputedStyle('tasks'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('tasks');
                }}
                title={config.tasks.glassBg ? 'Switch Tasks to Transparent' : 'Switch Tasks to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.tasks.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.tasks.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          <div className="flex items-center justify-between mb-3 no-drag">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400/90 font-['Plus_Jakarta_Sans']">
                {config.tasks.title || 'QUICK TASKS'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {completedTasksCount}/{totalTasksCount} done
              </span>
              {completedTasksCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  title="Clear completed tasks"
                  className="text-[10px] text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                >
                  Clear Done
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleAddTask} className="flex items-center gap-1.5 mb-3 no-drag">
            <input
              type="text"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              placeholder="Add study task... (Press Enter)"
              className="flex-1 bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-white/10 focus:border-emerald-500/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              title="Add task"
              className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-drag">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/40">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-50 text-emerald-400" />
                <p className="text-xs font-medium text-white/60">All tasks completed!</p>
                <p className="text-[10px] text-white/40 mt-0.5">Type above to add your next focus goal.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`task-item-animated group flex items-start gap-2.5 p-2 rounded-xl transition-all duration-300 border border-transparent ${
                    task.completed
                      ? 'bg-white/[0.02] opacity-60'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/10'
                  } ${justCompletedTaskId === task.id ? 'task-just-completed' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                    className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 active:scale-90 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'border-white/30 hover:border-emerald-400 hover:scale-105 bg-transparent'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3] task-check-spring" />}
                  </button>
                  <span
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex-1 text-xs leading-snug cursor-pointer select-none transition-all duration-200 ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-100 font-normal hover:text-white'
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                    className="task-item-action opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-emerald-400" data-handle="se" />
              <div className="resize-handle resize-sw text-emerald-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-emerald-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-emerald-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 6: POMODORO FOCUS TIMER WIDGET ================= */}
      {config.pomodoro?.visible && (
        <div
          ref={pomodoroRef}
          id="pomodoro-widget"
          onPointerDown={e => handlePointerDown(e, 'pomodoro')}
          onWheel={e => handleWheelZoom(e, 'pomodoro')}
          className={`dashboard-widget z-20 px-5 sm:px-6 py-4 flex flex-col justify-between ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.pomodoro?.glassBg ?? true)} ${focusedWidget === 'pomodoro' ? 'widget-focused' : ''} ${radiusClass} ${
            isPomoRunning ? (pomoMode === 'focus' ? 'pomo-glow-active' : 'pomo-break-active') : ''
          }`}
          style={{
            width: config.pomodoro?.width || 360,
            height: config.pomodoro?.height || 240,
            left: config.pomodoro?.x ?? 580,
            top: config.pomodoro?.y ?? 530,
            ...getWidgetComputedStyle('pomodoro'),
          }}
        >
          {showHandles && (
            <>
              <div
                className={`drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                  pomoMode === 'focus' ? 'bg-rose-400/40' : 'bg-emerald-400/40'
                } pointer-events-none`}
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('pomodoro');
                }}
                title={config.pomodoro?.glassBg ? 'Switch Pomodoro to Transparent' : 'Switch Pomodoro to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.pomodoro?.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.pomodoro?.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          {/* Widget Header */}
          <div className="flex items-center justify-between no-drag">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPomoRunning
                    ? pomoMode === 'focus'
                      ? 'bg-rose-500 animate-ping'
                      : 'bg-emerald-500 animate-ping'
                    : 'bg-white/40'
                }`}
              />
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                <Timer className={`w-3.5 h-3.5 ${pomoMode === 'focus' ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span>{pomoMode === 'focus' ? 'Pomodoro Focus' : pomoMode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-rose-300 border border-white/10" title="Completed Focus Sessions">
                🍅 {pomoStreak}
              </span>
              <button
                type="button"
                onClick={() => setPomoSoundEnabled(prev => !prev)}
                className={`p-1 rounded-lg text-white/60 hover:text-white transition cursor-pointer ${pomoSoundEnabled ? 'text-rose-300' : 'opacity-40'}`}
                title={pomoSoundEnabled ? 'Sound alerts enabled' : 'Sound alerts muted'}
              >
                {pomoSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/40 border border-white/5 my-2 no-drag text-[10px] font-medium text-center">
            <button
              type="button"
              onClick={() => handleSwitchPomoMode('focus')}
              className={`py-1 rounded-lg transition cursor-pointer font-semibold ${
                pomoMode === 'focus'
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              25m Focus
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPomoMode('shortBreak')}
              className={`py-1 rounded-lg transition cursor-pointer font-semibold ${
                pomoMode === 'shortBreak'
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              5m Break
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPomoMode('longBreak')}
              className={`py-1 rounded-lg transition cursor-pointer font-semibold ${
                pomoMode === 'longBreak'
                  ? 'bg-sky-500 text-black shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              15m Rest
            </button>
          </div>

          {/* Central Countdown Digits & Progress */}
          <div className="flex flex-col items-center justify-center my-1 no-drag">
            <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-digits text-white font-mono drop-shadow-md">
              {formatMinutesSeconds(pomoSecondsLeft)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  pomoMode === 'focus'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, ((pomoTotalSeconds - pomoSecondsLeft) / pomoTotalSeconds) * 100))}%` }}
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 no-drag">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={togglePomodoro}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                  isPomoRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : pomoMode === 'focus'
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                }`}
              >
                {isPomoRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => resetPomodoro(pomoMode)}
                title="Reset session timer"
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-white/50">
              <button
                type="button"
                onClick={() => setPomoSecondsLeft(prev => Math.max(60, prev - 300))}
                disabled={pomoSecondsLeft <= 300}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 text-[10px] cursor-pointer"
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => {
                  setPomoSecondsLeft(prev => prev + 300);
                  setPomoTotalSeconds(prev => Math.max(prev, pomoSecondsLeft + 300));
                }}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] cursor-pointer"
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>
          </div>

          {showHandles && (
            <>
              <div className="resize-handle resize-se text-rose-400" data-handle="se" />
              <div className="resize-handle resize-sw text-rose-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-rose-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-rose-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= WIDGET 7: DAILY REGISTER (STUDY NOTES & SUMMARY) ================= */}
      {config.scratchpad?.visible && (
        <div
          ref={scratchpadRef}
          id="scratchpad-widget"
          data-widget-id="scratchpad"
          onPointerDown={e => handlePointerDown(e, 'scratchpad')}
          onWheel={e => handleWheelZoom(e, 'scratchpad')}
          className={`dashboard-widget z-20 px-4 py-3.5 flex flex-col justify-between ${
            config.optionalFeatures.widgetCustomization ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${getWidgetMaterialClass(config.scratchpad?.glassBg ?? true)} ${focusedWidget === 'scratchpad' ? 'widget-focused' : ''} ${radiusClass}`}
          style={{
            width: config.scratchpad?.width || 420,
            height: scratchpadCollapsed ? 54 : (config.scratchpad?.height || 360),
            left: config.scratchpad?.x ?? 50,
            top: config.scratchpad?.y ?? 550,
            transition: 'height 0.2s ease, width 0.2s ease',
            ...getWidgetComputedStyle('scratchpad'),
          }}
        >
          {showHandles && (
            <>
              <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400/40 pointer-events-none" />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleWidgetTransparency('scratchpad');
                }}
                title={config.scratchpad?.glassBg ? 'Switch Daily Register to Transparent' : 'Switch Daily Register to Glass Card'}
                className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.scratchpad?.glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span>{config.scratchpad?.glassBg ? 'Glass' : 'Transp.'}</span>
              </button>
            </>
          )}

          {/* Widget Header */}
          <div className="flex items-center justify-between no-drag pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">📋</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white font-['Plus_Jakarta_Sans']">
                  <span>Daily Register</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[9px] text-white/50 font-mono">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Separate Section Trigger: View Daily Registry & Personal History */}
              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                title="Open Daily Registry & Personal History (Firebase Persistent)"
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 hover:text-white border border-cyan-500/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Daily Registry & History</span>
                <span className="ml-0.5 px-1 py-0.2 rounded-full bg-cyan-400/30 text-[9px]">
                  {Object.keys(dailyRegistryHistory).length > 0 ? Object.keys(dailyRegistryHistory).length : dailyRegisterEntries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDailyRegViewMode(prev => prev === 'log' ? 'notes' : 'log')}
                title={dailyRegViewMode === 'log' ? 'Switch to Quick Notes Textarea' : 'Switch to Structured Daily Register Log'}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[10px] font-medium border border-white/10 transition cursor-pointer"
              >
                {dailyRegViewMode === 'log' ? '📝 Notes' : '⚡ Log'}
              </button>

              <button
                type="button"
                onClick={() => setScratchpadCollapsed(prev => !prev)}
                title={scratchpadCollapsed ? 'Expand Daily Register' : 'Minimize Daily Register'}
                className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer ml-0.5"
              >
                {scratchpadCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5 text-white/70" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Content: Either Structured Register Log or Quick Notes Textarea */}
          {!scratchpadCollapsed && (
            <div className="flex-1 py-2 flex flex-col relative no-drag min-h-0 overflow-y-auto">
              {dailyRegViewMode === 'log' ? (
                /* Structured Daily Register Form */
                <div className="space-y-2.5 text-xs">
                  {/* Subject Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-medium">
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General'].map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setNewRegSubject(sub)}
                        className={`px-2 py-0.5 rounded-md whitespace-nowrap transition cursor-pointer border ${
                          newRegSubject === sub
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>

                  {/* Topic / Chapter Input */}
                  <input
                    type="text"
                    value={newRegTopic}
                    onChange={e => setNewRegTopic(e.target.value)}
                    placeholder="Topic / Chapter (e.g. Calculus Derivatives, Organic Reactions)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/60"
                  />

                  {/* Detailed Study Notes Textarea */}
                  <textarea
                    value={newRegNotes}
                    onChange={e => setNewRegNotes(e.target.value)}
                    placeholder="Key concepts mastered, formulas derived, problem sets completed, revision takeaways..."
                    className="w-full h-20 resize-none bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-sans"
                  />

                  {/* Controls: Duration & Focus Rating & Save Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    {/* Duration Buttons */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-white/50 text-[9px]">Time:</span>
                      {[25, 45, 60, 90].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setNewRegDuration(mins)}
                          className={`px-1.5 py-0.5 rounded transition cursor-pointer border ${
                            newRegDuration === mins
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    {/* Focus Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRegRating(star)}
                          className={`text-xs transition cursor-pointer hover:scale-125 ${
                            star <= newRegRating ? 'text-amber-400' : 'text-white/20'
                          }`}
                          title={`Focus rating: ${star} of 5`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    {/* Save Entry Button */}
                    <button
                      type="button"
                      onClick={handleAddDailyRegisterEntry}
                      disabled={!newRegTopic.trim() && !newRegNotes.trim()}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-md ${
                        registerSuccessPulse
                          ? 'bg-emerald-400 text-black'
                          : (!newRegTopic.trim() && !newRegNotes.trim())
                          ? 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black border border-emerald-400/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{registerSuccessPulse ? 'Saved!' : 'Save Entry'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Freeform Quick Notes / Scratchpad Textarea */
                <div className="flex-1 flex flex-col h-full min-h-[120px]">
                  <textarea
                    value={scratchpadText}
                    onChange={e => handleScratchpadChange(e.target.value)}
                    placeholder="Type temporary notes, rough math calculations, problem steps, or equations here... Auto-saves with every keystroke."
                    className="w-full h-full min-h-[130px] resize-none bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-cyan-100 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 selection:bg-cyan-500/30 leading-relaxed overflow-y-auto"
                  />
                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono mt-1">
                    <span>Auto-saved to storage</span>
                    <span>{scratchpadText.length} chars</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Footer Strip */}
          <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono no-drag">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{currentUser ? 'Firebase Cloud Synced' : 'Saved Locally'}</span>
            </span>
            <button
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              className="text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
            >
              Open Daily Registry & History ({Object.keys(dailyRegistryHistory).length || dailyRegisterEntries.length} Days) →
            </button>
          </div>

          {showHandles && !scratchpadCollapsed && (
            <>
              <div className="resize-handle resize-se text-cyan-400" data-handle="se" />
              <div className="resize-handle resize-sw text-cyan-400" data-handle="sw" />
              <div className="resize-handle resize-ne text-cyan-400" data-handle="ne" />
              <div className="resize-handle resize-nw text-cyan-400" data-handle="nw" />
            </>
          )}
        </div>
      )}

      {/* ================= POMODORO SESSION COMPLETION ALERT MODAL ================= */}
      {pomoAlertActive && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0d121f] border border-rose-500/40 p-6 shadow-[0_25px_70px_rgba(244,63,94,0.35)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <span className="text-3xl animate-bounce">🍅</span>
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              SESSION COMPLETED
            </span>

            <h3 className="text-xl font-bold text-white mb-2">
              {pomoMode === 'focus' ? '25-Minute Focus Sprint Finished!' : 'Break Completed!'}
            </h3>

            <p className="text-xs text-white/70 leading-relaxed mb-6 max-w-sm">
              {pomoMode === 'focus'
                ? 'Outstanding work! You maintained deep focus for 25 minutes. Take a 5-minute break to rest your mind, hydrate, and stretch.'
                : 'Break time is over. You are refreshed and ready for your next study sprint!'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              {pomoMode === 'focus' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setPomoAlertActive(false);
                      handleSwitchPomoMode('shortBreak');
                      setIsPomoRunning(true);
                      if (pomoSoundEnabled) playWebAudioChime('pomoStart');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Start 5m Break</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPomoAlertActive(false);
                      handleSwitchPomoMode('focus');
                      setIsPomoRunning(true);
                      if (pomoSoundEnabled) playWebAudioChime('pomoStart');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 transition cursor-pointer"
                  >
                    Another 25m Focus
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPomoAlertActive(false);
                    handleSwitchPomoMode('focus');
                    setIsPomoRunning(true);
                    if (pomoSoundEnabled) playWebAudioChime('pomoStart');
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start 25m Focus Sprint</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPomoAlertActive(false)}
              className="mt-3 text-xs text-white/50 hover:text-white transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ================= SEPARATE SECTION: DAILY REGISTER SUMMARY & STUDY LOGS ================= */}
      {dailySummaryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setDailySummaryOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#090e18] border border-emerald-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  📋
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      Daily Register & Study Summary
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {dailyRegisterEntries.length} Total Logs
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Comprehensive chronological record of daily study sessions, revisions, and focus scores
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-300">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>{currentUser ? 'Stored in Firebase Firestore' : 'Stored in Local Storage'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDailySummaryOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-black/30 border-b border-white/10">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Total Sessions</span>
                <span className="text-2xl font-black text-cyan-300 mt-1">{dailyRegisterEntries.length}</span>
                <span className="text-[10px] text-white/40 mt-0.5">Entries recorded</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Study Duration</span>
                <span className="text-2xl font-black text-emerald-300 mt-1">
                  {Math.floor(dailyRegisterEntries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 60)}h{' '}
                  {dailyRegisterEntries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0) % 60}m
                </span>
                <span className="text-[10px] text-white/40 mt-0.5">Total focus hours logged</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Average Rating</span>
                <span className="text-2xl font-black text-amber-300 mt-1">
                  {(dailyRegisterEntries.reduce((acc, e) => acc + (e.rating || 5), 0) / Math.max(1, dailyRegisterEntries.length)).toFixed(1)} ★
                </span>
                <span className="text-[10px] text-white/40 mt-0.5">Focus quality index</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Today's Logs</span>
                <span className="text-2xl font-black text-rose-300 mt-1">
                  {dailyRegisterEntries.filter(e => e.date === new Date().toISOString().slice(0, 10)).length}
                </span>
                <span className="text-[10px] text-white/40 mt-0.5">Completed today</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDailySummaryFilterSubject(s)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      dailySummaryFilterSubject === s
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {s === 'all' ? 'All Subjects' : s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dailySummarySearch}
                  onChange={e => setDailySummarySearch(e.target.value)}
                  placeholder="Search notes or topics..."
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 w-44 sm:w-56"
                />

                <button
                  type="button"
                  onClick={() => {
                    const textContent = dailyRegisterEntries
                      .map(
                        e =>
                          `# [${e.date} ${e.time}] ${e.subject} - ${e.topic}\nDuration: ${e.durationMinutes} mins | Focus: ${e.rating}/5\n${e.notes}\n---`
                      )
                      .join('\n\n');
                    const blob = new Blob([textContent], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `daily_register_summary_${new Date().toISOString().slice(0, 10)}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  title="Export summary as Markdown document"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-[300px]">
              {dailyRegisterEntries.filter(e => {
                const matchesSub = dailySummaryFilterSubject === 'all' || e.subject.toLowerCase() === dailySummaryFilterSubject.toLowerCase();
                const matchesSearch =
                  !dailySummarySearch ||
                  e.topic.toLowerCase().includes(dailySummarySearch.toLowerCase()) ||
                  e.notes.toLowerCase().includes(dailySummarySearch.toLowerCase()) ||
                  e.subject.toLowerCase().includes(dailySummarySearch.toLowerCase());
                return matchesSub && matchesSearch;
              }).length === 0 ? (
                <div className="text-center py-16 space-y-2 text-white/40">
                  <div className="text-3xl">📭</div>
                  <div className="text-sm font-semibold">No daily register entries found</div>
                  <div className="text-xs">Use the Daily Register widget on your dashboard to log study notes!</div>
                </div>
              ) : (
                dailyRegisterEntries
                  .filter(e => {
                    const matchesSub = dailySummaryFilterSubject === 'all' || e.subject.toLowerCase() === dailySummaryFilterSubject.toLowerCase();
                    const matchesSearch =
                      !dailySummarySearch ||
                      e.topic.toLowerCase().includes(dailySummarySearch.toLowerCase()) ||
                      e.notes.toLowerCase().includes(dailySummarySearch.toLowerCase()) ||
                      e.subject.toLowerCase().includes(dailySummarySearch.toLowerCase());
                    return matchesSub && matchesSearch;
                  })
                  .map(entry => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {entry.subject}
                            </span>
                            <h4 className="font-bold text-sm text-white">{entry.topic}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono">
                            <span>📅 {entry.date}</span>
                            <span>⏰ {entry.time}</span>
                            <span>⏱ {entry.durationMinutes} mins</span>
                            <span className="text-amber-400">{'★'.repeat(entry.rating || 5)}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            saveDailyRegisterList(prev => prev.filter(e => e.id !== entry.id));
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-white/80 leading-relaxed font-sans whitespace-pre-wrap bg-black/25 p-3 rounded-xl border border-white/5">
                        {entry.notes}
                      </p>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between text-xs text-white/60 bg-white/[0.02]">
              <span className="font-mono text-[11px]">
                Showing {dailyRegisterEntries.length} entries • Stored persistently with Firebase cloud fallback
              </span>
              <button
                type="button"
                onClick={() => setDailySummaryOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. QUICK ACCESS SEARCH MODAL (FEATURE 2) ================= */}
      {commandMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          onClick={() => setCommandMenuOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-[#090d16] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandSearch}
                onChange={e => {
                  setCommandSearch(e.target.value);
                  setSelectedCommandIndex(0);
                }}
                onKeyDown={handleCommandKeyDown}
                placeholder="Search study actions, timers, widgets or commands... (Esc to close)"
                className="flex-1 bg-transparent border-0 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none"
              />
              <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                ESC
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {commandActions.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40">
                  No matching study actions found.
                </div>
              ) : (
                commandActions.map((cmd, idx) => {
                  const isSelected = idx === selectedCommandIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => {
                        if (cmd.available) cmd.action();
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition ${
                        isSelected
                          ? 'bg-cyan-500/20 text-white border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : cmd.available
                          ? 'hover:bg-white/5 text-white/80'
                          : 'opacity-40 cursor-not-allowed text-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                          {cmd.category}
                        </span>
                        <span className="font-medium text-white">{cmd.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/60">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {!cmd.available && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] text-white/40">
              <div className="flex items-center gap-3">
                <span><kbd className="text-white/60">↑</kbd> <kbd className="text-white/60">↓</kbd> Navigate</span>
                <span><kbd className="text-white/60">Enter</kbd> Select</span>
              </div>
              <span>Flocus Study Suite</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= CENTRAL FEATURES & SETTINGS MENU / HAMBURGER DRAWER ================= */}
      <div
        id="drawer-menu"
        className={`fixed top-0 right-0 h-full w-full sm:w-[540px] drawer-glass z-50 transform transition-transform duration-300 ease-out flex flex-col p-5 sm:p-6 overflow-y-auto ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">Study Dashboard Central</h2>
              <div className="flex items-center gap-2 text-[11px] text-white/50">
                <span>BK NITHILESHVAR</span>
                <span>•</span>
                {currentUser ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CloudCheck className="w-3 h-3" />
                    <span>Cloud Active</span>
                  </span>
                ) : (
                  <span className="text-white/40">Local Storage</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Controls Hub (Relocated from Top Bar) */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/70 uppercase tracking-wider px-1">
            <span>Quick Controls</span>
            <span className="text-[10px] text-cyan-400 font-mono">Dashboard Hub</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* 1. Visual Studio */}
            <button
              type="button"
              onClick={() => { setStudioOpen(true); setDrawerOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition cursor-pointer text-left shadow-sm min-h-[48px]"
              title="Visual Customization Studio (V)"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <div className="truncate">
                <div className="font-semibold text-white text-xs">Studio</div>
                <div className="text-[10px] text-cyan-300/80">Themes & Fonts (V)</div>
              </div>
            </button>

            {/* 2. Quick Search */}
            <button
              type="button"
              onClick={() => { setCommandMenuOpen(true); setDrawerOpen(false); setCommandSearch(''); setSelectedCommandIndex(0); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition cursor-pointer text-left min-h-[48px]"
              title="Quick Access Search (⌘K)"
            >
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-white text-xs">Search</div>
                <div className="text-[10px] text-white/50">Palette (⌘K)</div>
              </div>
            </button>

            {/* 3. Focus Mode */}
            <button
              type="button"
              onClick={() => handleToggleFocusMode()}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left min-h-[48px] ${
                isFocusModeActive
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title="Focus Mode (Distraction-Free)"
            >
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-white text-xs">{isFocusModeActive ? 'Exit Focus' : 'Focus Mode'}</div>
                <div className="text-[10px] text-white/50">Distraction-free</div>
              </div>
            </button>

            {/* 4. Center & Align */}
            <button
              type="button"
              onClick={() => recenterWidgets()}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition cursor-pointer text-left min-h-[48px]"
              title="Center & Align All Widgets (C)"
            >
              <LayoutGrid className="w-4 h-4 text-white/80 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-white text-xs">Center & Align</div>
                <div className="text-[10px] text-white/50">Auto-grid (C)</div>
              </div>
            </button>

            {/* 5. Zen Pure View */}
            <button
              type="button"
              onClick={() => setZenMode(prev => !prev)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left min-h-[48px] ${
                zenMode
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title="Zen Pure View (H)"
            >
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-white text-xs">{zenMode ? 'Exit Zen' : 'Zen View'}</div>
                <div className="text-[10px] text-white/50">Pure clock (H)</div>
              </div>
            </button>

            {/* 6. Pomodoro Quick Action */}
            <button
              type="button"
              onClick={togglePomodoro}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left min-h-[48px] ${
                isPomoRunning
                  ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title="Start or pause 25-minute Pomodoro focus session"
            >
              <Timer className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-white text-xs">{isPomoRunning ? 'Pause Pomo' : 'Start Pomo'}</div>
                <div className="text-[10px] text-white/50">{formatMinutesSeconds(pomoSecondsLeft)}</div>
              </div>
            </button>

            {/* 7. Daily Registry & History Quick Button */}
            <button
              type="button"
              onClick={() => { setHistoryModalOpen(true); setDrawerOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition cursor-pointer text-left col-span-2 sm:col-span-3 min-h-[44px]"
              title="Open Daily Registry & Personal History"
            >
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-xs">Daily Registry & Personal History</span>
                  <span className="text-[10px] text-cyan-300/80 block">Firebase Persistent Daily Study Records</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {Object.keys(dailyRegistryHistory).length} Days Logged
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation with All Sections */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 p-1 rounded-xl bg-black/50 border border-white/5 mt-4 mb-5 text-[10px] font-medium text-center">
          <button
            onClick={() => setActiveTab('features')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'features' ? 'text-white bg-cyan-500/25 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-cyan-400/80 hover:text-cyan-300 font-semibold'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('personalization')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'personalization' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Personalize
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'timetable' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Exam
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'routine' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Routine
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'tasks' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'backup' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Backup
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'cloud' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Firebase
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'registry' ? 'text-white bg-cyan-500/25 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-cyan-400/80 hover:text-cyan-300 font-semibold'
            }`}
          >
            Registry
          </button>
          <button
            onClick={() => setActiveTab('clock')}
            className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
              activeTab === 'clock' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Clock
          </button>
          {config.optionalFeatures.wallpaperCustomization && (
            <button
              onClick={() => setActiveTab('wallpaper')}
              className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
                activeTab === 'wallpaper' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
              }`}
            >
              Wallpaper
            </button>
          )}
          {config.optionalFeatures.widgetCustomization && (
            <button
              onClick={() => setActiveTab('widgets')}
              className={`py-1.5 rounded-lg transition cursor-pointer truncate px-0.5 ${
                activeTab === 'widgets' ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
              }`}
            >
              Widgets
            </button>
          )}
        </div>

        {/* ================= TAB 1: OPTIONAL FEATURES MENU ================= */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Optional Features Switches</h3>
                <p className="text-[11px] text-white/50">Turn modules on or off without deleting saved settings</p>
              </div>
              <button
                onClick={handleRestoreFeatureDefaults}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[11px] font-medium border border-white/10 transition cursor-pointer flex items-center gap-1"
                title="Restore all features to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Defaults</span>
              </button>
            </div>

            {/* Feature 1: Focus Mode */}
            <div className={`p-4 rounded-2xl border transition ${config.optionalFeatures.focusMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.optionalFeatures.focusMode ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/40'}`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">1. Focus Mode</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${config.optionalFeatures.focusMode ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/40'}`}>
                        {config.optionalFeatures.focusMode ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                      One-click distraction-free view. Dims wallpaper, isolates active routine subject and clock with clear exit button.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFeature('focusMode')}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 cursor-pointer ${config.optionalFeatures.focusMode ? 'bg-amber-500' : 'bg-white/20'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1 ${config.optionalFeatures.focusMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {config.optionalFeatures.focusMode && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/70">Current State:</span>
                  <button
                    onClick={handleToggleFocusMode}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isFocusModeActive ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/90 hover:bg-white/20'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{isFocusModeActive ? 'Exit Focus Mode' : 'Enter Focus Mode Now'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Feature 2: Calendar Widget */}
            <div className={`p-4 rounded-2xl border transition ${config.optionalFeatures.calendarWidget ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.optionalFeatures.calendarWidget ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-white/40'}`}>
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">2. Calendar Widget</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${config.optionalFeatures.calendarWidget ? 'bg-sky-400 text-black' : 'bg-white/10 text-white/40'}`}>
                        {config.optionalFeatures.calendarWidget ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                      Monthly calendar with date navigation, today highlight, and integrated 2027 Public Exam markers.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFeature('calendarWidget')}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 cursor-pointer ${config.optionalFeatures.calendarWidget ? 'bg-sky-500' : 'bg-white/20'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1 ${config.optionalFeatures.calendarWidget ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {config.optionalFeatures.calendarWidget && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/70">Show on Dashboard:</span>
                  <input
                    type="checkbox"
                    checked={config.calendar.visible}
                    onChange={e => updateConfig(p => ({ ...p, calendar: { ...p.calendar, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-sky-500"
                  />
                </div>
              )}
            </div>

            {/* Feature 3: Wallpaper Customization */}
            <div className={`p-4 rounded-2xl border transition ${config.optionalFeatures.wallpaperCustomization ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.optionalFeatures.wallpaperCustomization ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/40'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">3. Wallpaper Customization</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${config.optionalFeatures.wallpaperCustomization ? 'bg-purple-400 text-black' : 'bg-white/10 text-white/40'}`}>
                        {config.optionalFeatures.wallpaperCustomization ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                      Unlocks curated wallpapers, custom uploads/URLs, procedural animated themes, and dimmer/blur sliders.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFeature('wallpaperCustomization')}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 cursor-pointer ${config.optionalFeatures.wallpaperCustomization ? 'bg-purple-500' : 'bg-white/20'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1 ${config.optionalFeatures.wallpaperCustomization ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {config.optionalFeatures.wallpaperCustomization && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/70">Customization Controls:</span>
                  <button
                    onClick={() => setActiveTab('wallpaper')}
                    className="text-purple-300 hover:text-purple-200 font-semibold underline text-xs cursor-pointer"
                  >
                    Open Wallpaper Settings →
                  </button>
                </div>
              )}
            </div>

            {/* Feature 4: Widget Customization */}
            <div className={`p-4 rounded-2xl border transition ${config.optionalFeatures.widgetCustomization ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.optionalFeatures.widgetCustomization ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/40'}`}>
                    {config.optionalFeatures.widgetCustomization ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">4. Widget Customization</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${config.optionalFeatures.widgetCustomization ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white/40'}`}>
                        {config.optionalFeatures.widgetCustomization ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                      When enabled, allows dragging, resizing, hiding, title edits and transparency tweaks. When disabled, locks current dashboard layout securely.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFeature('widgetCustomization')}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 cursor-pointer ${config.optionalFeatures.widgetCustomization ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1 ${config.optionalFeatures.widgetCustomization ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {config.optionalFeatures.widgetCustomization && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/70">Widget Edit Suite:</span>
                  <button
                    onClick={() => setActiveTab('widgets')}
                    className="text-emerald-300 hover:text-emerald-200 font-semibold underline text-xs cursor-pointer"
                  >
                    Manage Widget Layouts & Titles →
                  </button>
                </div>
              )}
            </div>

            {/* Feature 5: Daily Motivation */}
            <div className={`p-4 rounded-2xl border transition ${config.optionalFeatures.dailyMotivation ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.optionalFeatures.dailyMotivation ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/40'}`}>
                    <Quote className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">5. Daily Motivation Widget</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${config.optionalFeatures.dailyMotivation ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/40'}`}>
                        {config.optionalFeatures.dailyMotivation ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                      Shows inspirational study & Centum quotes with personal intention note on the dashboard.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFeature('dailyMotivation')}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 cursor-pointer ${config.optionalFeatures.dailyMotivation ? 'bg-amber-500' : 'bg-white/20'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1 ${config.optionalFeatures.dailyMotivation ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {config.optionalFeatures.dailyMotivation && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/70">Show on Dashboard:</span>
                  <input
                    type="checkbox"
                    checked={config.motivation.visible}
                    onChange={e => updateConfig(p => ({ ...p, motivation: { ...p.motivation, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PERSONALIZATION CENTER ================= */}
        {activeTab === 'personalization' && (
          <div className="space-y-6">
            <div className="pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Personalization Center</h3>
              <p className="text-[11px] text-white/50">Custom styling, typography, presets & motion behavior</p>
            </div>

            {/* HERO: Visual Customization Studio Launchpad */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-transparent border border-cyan-400/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Visual Customization Studio</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-black font-bold">PRO STUDIO</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Experience the full interactive Flocus studio with 10 live dashboard themes, 10 font specimens, high-res atmospheric wallpapers, 7 widget card materials, lighting sliders, and custom presets.
              </p>
              <button
                type="button"
                onClick={() => { setStudioOpen(true); setDrawerOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Visual Customization Studio (V)</span>
              </button>
            </div>

            {/* Quick Themes Mini Gallery */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                  Quick Live Themes
                </label>
                <button
                  type="button"
                  onClick={() => { setStudioOpen(true); setDrawerOpen(false); }}
                  className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-semibold"
                >
                  View All 10 Themes →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {STUDIO_THEMES.slice(0, 6).map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      updateConfig(prev => ({
                        ...prev,
                        activeThemeId: theme.id,
                        wallpaperUrl: theme.wallpaperUrl || prev.wallpaperUrl,
                        canvasTheme: theme.canvasTheme,
                        bgDimmer: theme.bgDimmer,
                        bgBlur: theme.bgBlur,
                        bgSaturation: theme.bgSaturation,
                        bgBrightness: theme.bgBrightness,
                        widgetStyle: theme.widgetStyle,
                        typography: {
                          globalScale: prev.typography?.globalScale ?? 1.0,
                          elements: prev.typography?.elements ?? DEFAULT_ELEMENT_TYPOGRAPHY,
                          fontClock: theme.fontClock,
                          fontHeading: theme.fontHeading,
                          fontBody: theme.fontBody,
                          fontCountdown: theme.fontClock,
                          fontLabels: theme.fontBody,
                        },
                        customColors: {
                          accent: theme.accentColor,
                          primaryText: theme.primaryTextColor,
                          secondaryText: theme.secondaryTextColor,
                          surface: theme.previewWidgetBg,
                        },
                        clock: {
                          ...prev.clock,
                          architecture: theme.clockArchitecture,
                          color: theme.accentColor,
                        },
                      }));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                      config.activeThemeId === theme.id
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-white truncate">{theme.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                    </div>
                    <div className="text-[9px] text-white/40 line-clamp-1">{theme.tagline}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Presets */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Dashboard Layout Presets
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'Compact', desc: 'Tight focus grouping' },
                  { id: 'balanced', label: 'Balanced', desc: 'Optimal laptop view' },
                  { id: 'spacious', label: 'Spacious', desc: 'Airy breathing room' },
                ].map(pre => (
                  <button
                    key={pre.id}
                    onClick={() => applyLayoutPreset(pre.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                      config.personalization.layoutPreset === pre.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{pre.label}</div>
                    <div className="text-[9px] opacity-60">{pre.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance Preferences */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Widget Appearance & Geometry
              </label>

              <div>
                <span className="text-[11px] text-white/60 block mb-1">Widget Corner Radius</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'normal', label: '16px (Clean)' },
                    { id: 'smooth', label: '24px (Smooth)' },
                    { id: 'pill', label: '32px (Pill)' },
                  ].map(rad => (
                    <button
                      key={rad.id}
                      onClick={() => updateConfig(p => ({ ...p, personalization: { ...p.personalization, widgetRadius: rad.id as any } }))}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        config.personalization.widgetRadius === rad.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {rad.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-white/60 block mb-1">Dashboard Theme Atmosphere</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'midnight', label: 'Midnight Black' },
                    { id: 'cyber', label: 'Deep Cyber Slate' },
                    { id: 'espresso', label: 'Warm Dark Espresso' },
                  ].map(th => (
                    <button
                      key={th.id}
                      onClick={() => updateConfig(p => ({ ...p, personalization: { ...p.personalization, themeMode: th.id as any } }))}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        config.personalization.themeMode === th.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Behavior & Accessibility */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Accessibility & Behavior
              </label>

              <div className="flex items-center justify-between text-xs text-white/80">
                <div>
                  <div className="font-medium text-white">Reduced Motion</div>
                  <div className="text-[10px] text-white/50">Disables canvas particle movement & heavy animations</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.personalization.reducedMotion}
                  onChange={e => updateConfig(p => ({ ...p, personalization: { ...p.personalization, reducedMotion: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/5">
                <div>
                  <div className="font-medium text-white">12-Hour Clock Format</div>
                  <div className="text-[10px] text-white/50">Show AM/PM instead of 24h digital time</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.clock.is12h}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, is12h: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BACKUP AND RESTORE ================= */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Backup & Restore</h3>
              <p className="text-[11px] text-white/50">Export dashboard data or restore previous configurations</p>
            </div>

            {backupMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  backupMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {backupMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{backupMessage.text}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                  Export Dashboard Data
                </label>
              </div>
              <p className="text-xs text-white/60">
                Downloads a versioned JSON file containing all widget placements, study tasks, countdown targets, timetable routines, and personalization preferences.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export flocus-study-backup.json</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                  Import & Restore Backup
                </label>
              </div>
              <p className="text-xs text-white/60">
                Select a previously exported JSON backup file to preview and restore your study dashboard.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelected}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                <span>Choose Backup JSON File...</span>
              </button>

              {backupPreview && (
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/15 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10 font-bold text-white">
                    <span>Backup File Preview</span>
                    <span className="text-[10px] text-cyan-400 font-mono">v{backupPreview.version}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                    <div>Exported Date: <strong className="text-white">{backupPreview.exportedAt.slice(0, 10)}</strong></div>
                    <div>Saved Tasks: <strong className="text-white">{backupPreview.tasksCount} items</strong></div>
                    <div>Clock Architecture: <strong className="text-white capitalize">{backupPreview.clockArch}</strong></div>
                    <div>Exam Target: <strong className="text-white">{backupPreview.examDate.slice(0, 10)}</strong></div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleApplyRestore('replace')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40 text-[11px] transition cursor-pointer"
                    >
                      Replace All Data
                    </button>
                    <button
                      onClick={() => handleApplyRestore('merge')}
                      className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition cursor-pointer"
                    >
                      Merge Tasks
                    </button>
                    <button
                      onClick={() => setBackupPreview(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: FIREBASE CLOUD SYNC & AUTH ================= */}
        {activeTab === 'cloud' && (
          <div className="space-y-6">
            <div className="pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Firebase Realtime & Cloud Storage</h3>
              <p className="text-[11px] text-white/50">Primary: users/{'{uid}'}/dashboard • Redundancy: users/{'{uid}'}/dashboard/data</p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {authError}
              </div>
            )}

            {/* Live Auto-Sync Controller Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${syncStatus === 'saving' ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
                    <span className="text-xs font-semibold text-white">Live Firebase Auto-Sync</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Automatically saves and syncs widget layouts, wallpapers, themes, notes, and tasks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoSyncEnabled;
                    setAutoSyncEnabled(next);
                    localStorage.setItem('flocus_auto_sync', String(next));
                    if (next && currentUser) {
                      handleManualSyncNow();
                    }
                  }}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 cursor-pointer ${
                    autoSyncEnabled ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                  aria-label="Toggle Auto Sync to Firebase"
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out mt-1 ml-1 ${
                      autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-white/40">Sync Engine:</span>
                <span className="font-mono text-emerald-300">
                  {autoSyncEnabled ? 'Real-Time Bi-Directional Snapshot' : 'Paused'}
                </span>
              </div>

              {lastSyncedTime && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Last Auto-Synced:</span>
                  <span className="font-mono text-cyan-300">{lastSyncedTime}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Authentication & Sync Status</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    syncStatus === 'saved'
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : syncStatus === 'saving'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {syncStatus === 'saved' ? '● Synced to Firebase' : syncStatus === 'saving' ? '⟳ Syncing...' : 'Local Storage Only'}
                </span>
              </div>

              {authSuccessMsg && (
                <div className="p-3 rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              {unauthorizedDomain && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-200">Firebase OAuth Domain Setup Needed</div>
                      <div className="text-[11px] text-amber-300/70 mt-0.5">
                        Google Sign-In requires your preview domain to be authorized in Firebase Console.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10 font-mono text-[11px] text-white/90">
                    <span className="truncate flex-1 select-all">{unauthorizedDomain}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(unauthorizedDomain);
                        setCopiedDomain(true);
                        setTimeout(() => setCopiedDomain(false), 2000);
                      }}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-sans text-[10px] font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-white/60 space-y-1">
                    <p><strong>To enable Google Sign-In:</strong> Go to <em>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains &gt; Add domain</em> and paste the preview hostname above.</p>
                    <p className="text-emerald-300"><strong>Or test immediately:</strong> Use the <em>Guest Sign-In</em> below to test full Realtime Database saves, restores, and refreshes right now with no domain setup required!</p>
                  </div>
                </div>
              )}

              {currentUser ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                          {currentUser.isAnonymous ? 'G' : currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate flex items-center gap-1.5">
                          <span>{currentUser.isAnonymous ? 'Guest Account (Authenticated)' : (currentUser.displayName || currentUser.email || 'Authenticated User')}</span>
                          {currentUser.isAnonymous && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-normal">Guest</span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/40 truncate">
                          {currentUser.isAnonymous ? `Cloud UID: ${currentUser.uid}` : currentUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 text-[10px] text-cyan-300/90 font-mono truncate">
                      RTDB: users/{currentUser.uid}/dashboard
                    </div>
                    <div className="text-[10px] text-white/40 font-mono truncate">
                      Firestore: users/{currentUser.uid}/dashboard/data
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleManualSyncNow}
                      className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs border border-cyan-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Save to Cloud</span>
                    </button>
                    <button
                      onClick={handleLoadFromCloud}
                      className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Restore from Cloud</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs border border-rose-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-white/60 leading-relaxed">
                    Sign in to your Firebase account to automatically save and restore widget layouts, wallpapers, custom studio themes, study timetables, tasks, and notes across sessions.
                  </p>

                  {/* 1. Google Sign-In */}
                  <button
                    disabled={authLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{authLoading ? 'Connecting...' : 'Sign In with Google'}</span>
                  </button>

                  {/* 2. Instant Guest Sign-In */}
                  <button
                    disabled={authLoading}
                    onClick={handleGuestSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>{authLoading ? 'Connecting...' : '⚡ Quick Guest Sign-In (Instant Cloud Persistence)'}</span>
                  </button>

                  {/* 3. Email & Password Toggle Form */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailAuth(!showEmailAuth)}
                      className="text-[11px] text-white/50 hover:text-white/80 transition flex items-center gap-1 mx-auto"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{showEmailAuth ? 'Hide Email / Password Options' : 'Or Sign In with Email / Password'}</span>
                      {showEmailAuth ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showEmailAuth && (
                      <form onSubmit={handleEmailAuth} className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                        <div className="text-[11px] font-semibold text-white/80">
                          {isAuthSignUp ? 'Create New Firebase Account' : 'Sign In with Existing Account'}
                        </div>

                        <div className="space-y-2">
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                            <input
                              type="email"
                              value={authEmail}
                              onChange={e => setAuthEmail(e.target.value)}
                              placeholder="student@example.com"
                              required
                              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                          <div className="relative">
                            <Key className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                            <input
                              type="password"
                              value={authPassword}
                              onChange={e => setAuthPassword(e.target.value)}
                              placeholder="Password (min 6 chars)"
                              required
                              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAuthSignUp(!isAuthSignUp)}
                            className="text-[10px] text-cyan-300 hover:underline"
                          >
                            {isAuthSignUp ? 'Already have account? Sign in' : 'Need account? Create new'}
                          </button>
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs transition disabled:opacity-50"
                          >
                            {authLoading ? 'Working...' : isAuthSignUp ? 'Create Account' : 'Sign In'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Zero-Trust Firebase Security</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Your study data is encrypted and isolated under path <code>users/{'{uid}'}/dashboard</code>. Hardened ABAC security rules verify that only your authenticated account can read or write your personal dashboard state.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB: FIREBASE DAILY REGISTRY & PERSONAL HISTORY ================= */}
        {activeTab === 'registry' && (
          <div className="space-y-5">
            <div className="pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Daily Registry & Personal History</span>
              </h3>
              <p className="text-[11px] text-white/50">
                Primary: users/{'{uid}'}/dailyRegistry/{'{YYYY-MM-DD}'}
              </p>
            </div>

            {/* Launch Full Modal Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-black/60 border border-cyan-500/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Full Registry & History Page</h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Calendar browser, date picker, weekly/monthly analytics, end-of-day summary, and search filters
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {Object.keys(dailyRegistryHistory).length} Days Logged
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Full History & Calendar Viewer</span>
              </button>
            </div>

            {/* Today's Snapshot Card */}
            {(() => {
              const todayStr = getLocalDateString();
              const todayRec = dailyRegistryHistory[todayStr];
              const entriesCount = todayRec?.entries ? Object.keys(todayRec.entries).length : 0;
              return (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Today's Registry</span>
                        <span className="text-[10px] font-mono text-cyan-300">({todayStr})</span>
                      </div>
                      <div className="text-[10px] text-white/40">{todayRec?.dayOfWeek || getDayOfWeekName()}</div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {Math.floor((todayRec?.totalStudyMinutes || 0) / 60)}h {(todayRec?.totalStudyMinutes || 0) % 60}m Studied
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-white/40 block">Completed Tasks</span>
                      <span className="font-bold text-emerald-300">{todayRec?.completedTasks?.length || 0} Finished</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-white/40 block">Timeline Logs</span>
                      <span className="font-bold text-cyan-300">{entriesCount} Recorded</span>
                    </div>
                  </div>

                  {todayRec?.dailySummaryNotes && (
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-white/70">
                      <span className="text-[10px] font-bold text-white/40 block mb-0.5 uppercase tracking-wider">End-of-Day Notes:</span>
                      <p className="line-clamp-2">{todayRec.dailySummaryNotes}</p>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHistoryModalOpen(true)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition cursor-pointer text-center"
                    >
                      View or Edit Today's Notes
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Zero-Trust Security info */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Strict User Ownership & Isolation</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Daily records are stored under <code>users/{currentUser?.uid ? currentUser.uid.slice(0, 8) + '...' : '{uid}'}/dailyRegistry/{'{date}'}</code>. Firebase rules prevent any other user from accessing or modifying your personal registry.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PUBLIC EXAM TIMETABLE ================= */}
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Class 12 Public Exam Timetable</span>
                </div>
                <div className="text-[11px] text-cyan-200/70 mt-0.5">
                  Official Board Schedule • Target Centum Subjects
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                6 EXAMS
              </span>
            </div>

            <div className="space-y-2">
              {PUBLIC_EXAM_TIMETABLE.map(item => {
                const isNext = nextExam.id === item.id;
                const examDate = new Date(item.targetYearMonthDay);
                const daysLeft = Math.max(0, Math.ceil((examDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)));

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition ${
                      isNext
                        ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : item.isCentumTarget
                        ? 'bg-amber-500/10 border-amber-400/30'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{item.subject}</span>
                            {item.isCentumTarget && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black uppercase tracking-wider flex items-center gap-1">
                                <Award className="w-2.5 h-2.5" /> GOING FOR CENTUM!
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/50 font-mono mt-0.5">
                            {item.dateStr} ({item.dayOfWeek}) • 2027
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-cyan-300">
                          {daysLeft}d left
                        </span>
                        {isNext && (
                          <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-semibold mt-0.5">
                            NEXT EXAM
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 6: STUDY PLANNER & DAILY ROUTINE ================= */}
        {activeTab === 'routine' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  Select Timetable Mode
                </label>
                <span className="text-[10px] text-cyan-300">
                  Active: <strong className="uppercase">{config.routineMode} DAY</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toggleRoutineMode('school')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    config.routineMode === 'school'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <School className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">School Days</div>
                    <div className="text-[10px] opacity-70">Tuitions + School + Night Drills</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleRoutineMode('leave')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    config.routineMode === 'leave'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Leave Days & Sundays</div>
                    <div className="text-[10px] opacity-70">Full mocks + Robotics sprint</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {(config.routineMode === 'school' ? SCHOOL_DAYS_ROUTINE : LEAVE_DAYS_ROUTINE).map((slot, idx) => {
                const isCurrent = currentSlotInfo.activeSlot?.timeLabel === slot.timeLabel;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-white/20'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{slot.activity}</div>
                        <div className="text-[10px] text-white/50 font-mono">{slot.timeLabel}</div>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black uppercase tracking-wider shrink-0">
                        NOW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 7: QUICK TASKS ================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Widget Appearance
              </label>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Show Quick Tasks Widget</span>
                <input
                  type="checkbox"
                  checked={config.tasks.visible}
                  onChange={e => updateConfig(p => ({ ...p, tasks: { ...p.tasks, visible: e.target.checked } }))}
                  className="w-4 h-4 rounded text-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Translucent Glass Card</span>
                <input
                  type="checkbox"
                  checked={config.tasks.glassBg}
                  onChange={e => updateConfig(p => ({ ...p, tasks: { ...p.tasks, glassBg: e.target.checked } }))}
                  className="w-4 h-4 rounded text-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  Task Summary
                </label>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {completedTasksCount} / {totalTasksCount} Completed
                </span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {completedTasksCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear Completed Tasks ({completedTasksCount})</span>
                </button>
              )}
              <button
                onClick={handleResetTasks}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Sample Tasks</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 8: CLOCK DESIGN ARCHITECTURES ================= */}
        {activeTab === 'clock' && (
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block mb-2">
                10 Architectural Designs
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'minimal', title: 'Flocus Minimal', desc: 'Clean, pure & spacious' },
                  { id: 'giant', title: 'The Typography Giant', desc: 'Massive bold editorial' },
                  { id: 'grid', title: 'The Monospace Grid', desc: 'Tabular terminal style' },
                  { id: 'glass', title: 'The Glassmorphic Float', desc: 'Specular frosted card' },
                  { id: 'lcd', title: 'The 7-Segment LCD', desc: 'Retro digital bezel' },
                  { id: 'dotmatrix', title: 'The Dot Matrix Grid', desc: 'LED matrix clusters' },
                  { id: 'flip', title: 'The Vintage Flip Clock', desc: 'Mechanical split flap' },
                  { id: 'neon', title: 'The Cyberpunk Neon', desc: 'Luminescent pulsing tube' },
                  { id: 'morph', title: 'The Morphing Path', desc: 'Shifting border gradient' },
                  { id: 'aurora', title: 'The Dynamic Aurora', desc: 'Northern light digit fill' },
                ].map(arch => (
                  <button
                    key={arch.id}
                    onClick={() => updateConfig(p => ({ ...p, clock: { ...p.clock, architecture: arch.id } }))}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      config.clock.architecture === arch.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/15'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{arch.title}</div>
                    <div className="text-[10px] text-white/50">{arch.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Clock Color Palette
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {['#ffffff', '#38bdf8', '#4ade80', '#fbbf24', '#f472b6', '#c084fc'].map(clr => (
                  <button
                    key={clr}
                    onClick={() => updateConfig(p => ({ ...p, clock: { ...p.clock, color: clr } }))}
                    className={`w-7 h-7 rounded-full transition cursor-pointer ${
                      config.clock.color === clr ? 'border-2 border-white scale-110' : 'border border-white/20'
                    }`}
                    style={{ background: clr }}
                  />
                ))}
                <div className="relative ml-auto flex items-center gap-2">
                  <span className="text-xs text-white/60">Custom:</span>
                  <input
                    type="color"
                    value={config.clock.color}
                    onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, color: e.target.value } }))}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Display Options
              </label>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>12-Hour Format (AM/PM)</span>
                <input
                  type="checkbox"
                  checked={config.clock.is12h}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, is12h: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Show Seconds (:SS)</span>
                <input
                  type="checkbox"
                  checked={config.clock.showSeconds}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, showSeconds: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Show Milliseconds (:MS)</span>
                <input
                  type="checkbox"
                  checked={config.clock.showMs}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, showMs: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Show Date Month Year</span>
                <input
                  type="checkbox"
                  checked={config.clock.showDate}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, showDate: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Include Day of Week</span>
                <input
                  type="checkbox"
                  checked={config.clock.showDay}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, showDay: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Translucent Glass Background</span>
                <input
                  type="checkbox"
                  checked={config.clock.glassBg}
                  onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, glassBg: e.target.checked } }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/70">Digit Glow Intensity</span>
                <span className="text-cyan-400 font-mono">{config.clock.glow}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={config.clock.glow}
                onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, glow: parseInt(e.target.value) } }))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* ================= TAB 9: WALLPAPER CUSTOMIZATION ================= */}
        {activeTab === 'wallpaper' && config.optionalFeatures.wallpaperCustomization && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Animation & Movement Control
              </label>

              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Freeze Animation (Static Background)</span>
                <input
                  type="checkbox"
                  checked={config.isWallpaperStatic}
                  onChange={e => updateConfig(p => ({ ...p, isWallpaperStatic: e.target.checked }))}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/70">Animation Intensity / Speed</span>
                  <span className="text-cyan-400 font-mono">{config.animationIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={config.animationIntensity}
                  onChange={e => updateConfig(p => ({ ...p, animationIntensity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">Wallpaper Gallery</label>
                  <span className="text-[10px] text-emerald-400 font-mono">5,000+ Library</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const randomWp = wallpaperProvider.getRandomWallpaper();
                      if (randomWp) {
                        updateConfig(prev => ({
                          ...prev,
                          activeWallpaper: randomWp.id,
                          wallpaperUrl: randomWp.fullUrl,
                          canvasTheme: 'none',
                        }));
                      }
                    }}
                    title="Apply Random Wallpaper"
                    className="p-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Shuffle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setStudioOpen(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Open Studio</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {CURATED_WALLPAPERS.map(wp => (
                  <div
                    key={wp.id}
                    onClick={() => {
                      updateConfig(prev => ({
                        ...prev,
                        activeWallpaper: wp.id,
                        wallpaperUrl: wp.url,
                        canvasTheme: 'none',
                      }));
                    }}
                    className={`custom-img-card ${config.activeWallpaper === wp.id ? 'active-wallpaper' : ''}`}
                  >
                    <img src={wp.thumb} alt={wp.title} className="w-full h-20 object-cover pointer-events-none" onError={e => { (e.target as HTMLImageElement).src = '/wallpapers/art_anime_cherry_blossom.svg'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 pointer-events-none">
                      <span className="text-[10px] font-medium text-white truncate">{wp.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Custom Wallpaper Source
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="Paste direct image URL..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => {
                    if (urlInput.trim()) {
                      updateConfig(prev => ({
                        ...prev,
                        activeWallpaper: 'custom-url',
                        wallpaperUrl: urlInput.trim(),
                        canvasTheme: 'none',
                      }));
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 cursor-pointer transition flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          if (ev.target?.result) {
                            updateConfig(prev => ({
                              ...prev,
                              activeWallpaper: 'custom-upload',
                              wallpaperUrl: ev.target!.result as string,
                              canvasTheme: 'none',
                            }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <button
                  onClick={() => {
                    updateConfig(prev => ({
                      ...prev,
                      activeWallpaper: 'jp-tokyo-cyberpunk',
                      wallpaperUrl: '/wallpapers/jp_tokyo_cyberpunk.jpg',
                      canvasTheme: 'none',
                      bgDimmer: 30,
                      bgBlur: 0,
                    }));
                  }}
                  className="text-xs text-rose-400/80 hover:text-rose-400 transition cursor-pointer"
                >
                  Restore Default Wallpaper
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block mb-2">
                Animated Atmospheres (No Image)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'aurora', label: 'Aurora', desc: 'Sinusoidal glow', dot: 'bg-emerald-400' },
                  { id: 'nebula', label: 'Deep Space', desc: 'Shooting stars', dot: 'bg-indigo-400' },
                  { id: 'cyberpunk', label: 'Neon Rain', desc: 'Perspective floor', dot: 'bg-pink-500' },
                  { id: 'matrix', label: 'Matrix', desc: 'Digital glyphs', dot: 'bg-green-400' },
                  { id: 'fireflies', label: 'Fireflies', desc: 'Mystic bokeh', dot: 'bg-amber-400' },
                  { id: 'minimal', label: 'Pure Slate', desc: 'Calm gradient', dot: 'bg-slate-500' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      updateConfig(prev => ({
                        ...prev,
                        canvasTheme: item.id as any,
                        wallpaperUrl: '',
                        activeWallpaper: '',
                      }));
                    }}
                    className={`p-2 rounded-xl text-xs bg-white/5 border text-left transition cursor-pointer ${
                      config.canvasTheme === item.id && !config.wallpaperUrl
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${item.dot} mb-1`} />
                    <div className="font-medium text-white">{item.label}</div>
                    <div className="text-[9px] text-white/40">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/70">Wallpaper Dimmer / Darkness</span>
                  <span className="text-cyan-400 font-mono">{config.bgDimmer}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={config.bgDimmer}
                  onChange={e => updateConfig(p => ({ ...p, bgDimmer: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/70">Wallpaper Blur</span>
                  <span className="text-cyan-400 font-mono">{config.bgBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={config.bgBlur}
                  onChange={e => updateConfig(p => ({ ...p, bgBlur: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 10: WIDGET CUSTOMIZATION ================= */}
        {activeTab === 'widgets' && config.optionalFeatures.widgetCustomization && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                  Widget Visibility & Appearance
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllWidgetsTransparency(true)}
                    className="px-2 py-0.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[10px] font-medium transition cursor-pointer"
                  >
                    All Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllWidgetsTransparency(false)}
                    className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium transition cursor-pointer"
                  >
                    All Glass
                  </button>
                </div>
              </div>

              {/* Flocus Central Clock */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>Flocus Central Clock</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, clock: { ...p.clock, glassBg: !p.clock.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.clock.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.clock.visible !== false}
                    onChange={e => updateConfig(p => ({ ...p, clock: { ...p.clock, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* Public Exam Countdown */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>Public Exam Countdown</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, countdown: { ...p.countdown, glassBg: !p.countdown.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.countdown.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.countdown.visible !== false}
                    onChange={e => updateConfig(p => ({ ...p, countdown: { ...p.countdown, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* BK Nithileshvar Badge */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>BK NITHILESHVAR Badge</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, nameWidget: { ...p.nameWidget, glassBg: !p.nameWidget.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.nameWidget.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.nameWidget.visible}
                    onChange={e => updateConfig(p => ({ ...p, nameWidget: { ...p.nameWidget, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* Daily Motivation Widget */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>Daily Motivation Quote</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, motivation: { ...p.motivation, glassBg: !p.motivation.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.motivation.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.motivation.visible}
                    onChange={e => updateConfig(p => ({ ...p, motivation: { ...p.motivation, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* Routine Alert Widget */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>Live Routine Alert</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, notification: { ...p.notification, glassBg: !p.notification.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.notification.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.notification.visible}
                    onChange={e => updateConfig(p => ({ ...p, notification: { ...p.notification, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* Calendar Widget */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>Monthly Calendar</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, calendar: { ...p.calendar, glassBg: !p.calendar.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.calendar.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.calendar.visible}
                    onChange={e => updateConfig(p => ({ ...p, calendar: { ...p.calendar, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* Quick Tasks */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1 border-b border-white/5">
                <span>Quick Tasks</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, tasks: { ...p.tasks, glassBg: !p.tasks.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.tasks.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.tasks.visible}
                    onChange={e => updateConfig(p => ({ ...p, tasks: { ...p.tasks, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>

              {/* Pomodoro Focus Timer */}
              <div className="flex items-center justify-between text-xs text-white/80 py-1">
                <span>Pomodoro Focus Timer (25m)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig(p => ({ ...p, pomodoro: { ...p.pomodoro, glassBg: !p.pomodoro.glassBg } }))}
                    className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {config.pomodoro?.glassBg ? 'Glass' : 'Transparent'}
                  </button>
                  <input
                    type="checkbox"
                    checked={config.pomodoro?.visible}
                    onChange={e => updateConfig(p => ({ ...p, pomodoro: { ...p.pomodoro, visible: e.target.checked } }))}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">
                Custom Widget Titles
              </label>

              <div>
                <span className="text-[11px] text-white/60 block mb-1">Name Banner Title</span>
                <input
                  type="text"
                  value={config.nameWidget.title}
                  onChange={e => updateConfig(p => ({ ...p, nameWidget: { ...p.nameWidget, title: e.target.value } }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <span className="text-[11px] text-white/60 block mb-1">Countdown Title</span>
                <input
                  type="text"
                  value={config.countdown.title}
                  onChange={e => updateConfig(p => ({ ...p, countdown: { ...p.countdown, title: e.target.value } }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={recenterWidgets}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-align & Center All Widgets (Press C)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= CLICK-TO-ADD WIDGET PLACEMENT MODAL & TARGET PREVIEW ================= */}
      {placementModal && placementModal.isOpen && (
        <>
          {/* Transparent Backdrop Dismiss Overlay: Clicking anywhere outside smoothly closes the modal */}
          <div
            onClick={() => setPlacementModal(null)}
            className="fixed inset-0 z-40 bg-transparent"
          />

          {/* Target Reticle Anchor at Exact Clicked Coordinates */}
          <div
            className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-150"
            style={{ left: placementModal.x, top: placementModal.y }}
          >
            <div className="w-12 h-12 rounded-full border border-emerald-400/60 animate-ping absolute" />
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 flex items-center justify-center bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Crosshair className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="absolute top-7 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[9px] font-mono text-emerald-300 whitespace-nowrap shadow-md">
              {placementModal.x}px, {placementModal.y}px
            </div>
          </div>

          {/* Placement Popover Card */}
          <div
            className="fixed z-50 w-80 sm:w-96 rounded-2xl bg-[#090d16]/95 backdrop-blur-2xl border border-white/20 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-white text-xs space-y-3 widget-placement-popover animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: Math.max(10, Math.min(window.innerWidth - 390, placementModal.x - 20)),
              top: Math.max(10, Math.min(window.innerHeight - 490, placementModal.y + 20)),
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Coordinates & Indicator */}
            <div className="flex items-start justify-between pb-2.5 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="font-bold tracking-wide uppercase text-xs text-white">
                    {placementModal.occupiedBy ? 'Position Occupied' : 'Add Widget At Position'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/60 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">
                    X: {placementModal.x}px • Y: {placementModal.y}px
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                    {config.layoutMode === 'freeform' ? 'Freeform Canvas' : `Grid: ${placementModal.nearestGridSlot?.name || 'Nearest Slot'}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlacementModal(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Occupied Warning & Collision Resolution Choices */}
            {placementModal.occupiedBy && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-semibold text-[11px] flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[160px]">Occupied: {placementModal.occupiedWidgetLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const occKey = placementModal.occupiedBy!;
                      updateConfig(p => ({
                        ...p,
                        [occKey]: { ...(p as any)[occKey], visible: false },
                      }));
                      setPlacementModal(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                    title="Remove this widget from dashboard"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Remove Widget</span>
                  </button>
                </div>
                <p className="text-[10px] text-white/70 leading-relaxed">
                  Choose an action below to reposition, swap, or remove any widget:
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const other = ALL_WIDGET_REGISTRY.find(w => w.id !== placementModal.occupiedBy);
                      if (other) handlePlaceWidgetAtSelectedPosition(other.id, 'swap');
                    }}
                    className="py-1.5 px-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 text-[10px] font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Swap Position</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstHidden = ALL_WIDGET_REGISTRY.find(w => !(config as any)[w.id]?.visible) || ALL_WIDGET_REGISTRY[0];
                      handlePlaceWidgetAtSelectedPosition(firstHidden.id, 'nearby');
                    }}
                    className="py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[10px] font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Place Nearby (+Offset)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Widget Selection Header */}
            <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold tracking-wider">
              <span>Right-Click Widget Controls</span>
              <span>{ALL_WIDGET_REGISTRY.length} Widgets</span>
            </div>

            {/* List of All Widgets with Direct Add / Remove */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {ALL_WIDGET_REGISTRY.map(widget => {
                const Icon = widget.icon;
                const isVisible = (config as any)[widget.id]?.visible !== false;
                const isCurrentOccupier = placementModal.occupiedBy === widget.id;

                return (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition ${
                      isCurrentOccupier
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : isVisible
                        ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isVisible ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate text-[11px]">
                          {widget.label}
                        </div>
                        <div className="text-[9px] text-white/50">
                          {isVisible ? 'Active on dashboard' : 'Hidden • Click Add to show'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isVisible ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              updateConfig(p => ({
                                ...p,
                                [widget.id]: { ...(p as any)[widget.id], visible: false },
                              }));
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-[10px] font-semibold text-rose-300 transition cursor-pointer flex items-center gap-0.5"
                            title="Remove this widget from the screen"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Remove</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePlaceWidgetAtSelectedPosition(widget.id, 'exact')}
                            className="px-2 py-1 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-[10px] font-semibold text-cyan-200 transition cursor-pointer"
                            title="Move this widget to the clicked location"
                          >
                            Move
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePlaceWidgetAtSelectedPosition(widget.id, 'exact')}
                          className="px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 bg-emerald-500/30 hover:bg-emerald-500/45 text-emerald-200 border-emerald-400/50"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Responsive Layout Fit Controls */}
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 block">
                Responsive Viewport Fit
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={applyLaptopFitLayout}
                  className="py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-[10px] font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  💻 Fit for Laptop
                </button>
                <button
                  type="button"
                  onClick={applyMobileFitLayout}
                  className="py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[10px] font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  📱 Fit for Mobile
                </button>
              </div>
            </div>

            {/* Mode & Grid Snapping Quick Controls */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
              <button
                type="button"
                onClick={() => updateConfig(p => ({ ...p, layoutMode: p.layoutMode === 'grid' ? 'freeform' : 'grid' }))}
                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer flex items-center gap-1"
              >
                {config.layoutMode === 'freeform' ? <Move className="w-2.5 h-2.5 text-cyan-300" /> : <Grid className="w-2.5 h-2.5 text-emerald-300" />}
                <span>Mode: {config.layoutMode === 'freeform' ? 'Freeform' : '50 Grid Layouts'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlacementModal(null);
                  setStudioOpen(true);
                }}
                className="text-emerald-300 hover:text-emerald-200 underline font-medium cursor-pointer"
              >
                Open 50 Layouts Gallery
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= RIGHT-CLICK CONTEXT MENU ================= */}
      {contextMenu && contextMenu.visible && (
        <div
          className="fixed z-50 w-72 rounded-2xl bg-[#090d16]/95 backdrop-blur-2xl border border-white/15 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold tracking-wide uppercase text-[11px] text-white">Widget Manager</span>
            </div>
            <button
              type="button"
              onClick={() => setContextMenu(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Global Transparency Switch */}
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-white/60 uppercase font-semibold">
              <span>All Widgets Transparency</span>
              <span className={areAllWidgetsTransparent ? 'text-amber-400' : 'text-cyan-400'}>
                {areAllWidgetsTransparent ? 'Transparent' : 'Glass Cards'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setAllWidgetsTransparency(true)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition cursor-pointer flex items-center justify-center gap-1 ${
                  areAllWidgetsTransparent
                    ? 'bg-amber-400/25 border-amber-400 text-amber-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                }`}
              >
                <span>Transparent</span>
              </button>
              <button
                type="button"
                onClick={() => setAllWidgetsTransparency(false)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition cursor-pointer flex items-center justify-center gap-1 ${
                  !areAllWidgetsTransparent
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                }`}
              >
                <span>Glass Cards</span>
              </button>
            </div>
          </div>

          {/* Individual Widgets List */}
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {[
              { id: 'clock', label: 'Flocus Clock', visible: config.clock.visible !== false, glass: config.clock.glassBg },
              { id: 'countdown', label: 'Exam Countdown', visible: config.countdown.visible !== false, glass: config.countdown.glassBg },
              { id: 'notification', label: 'Routine Alert', visible: config.notification.visible, glass: config.notification.glassBg },
              { id: 'tasks', label: 'Quick Tasks', visible: config.tasks.visible, glass: config.tasks.glassBg },
              { id: 'calendar', label: 'Exam Calendar', visible: config.calendar.visible, glass: config.calendar.glassBg },
              { id: 'motivation', label: 'Daily Motivation', visible: config.motivation.visible, glass: config.motivation.glassBg },
              { id: 'nameWidget', label: 'Centum Badge', visible: config.nameWidget.visible, glass: config.nameWidget.glassBg },
              { id: 'pomodoro', label: 'Pomodoro Timer', visible: config.pomodoro?.visible ?? true, glass: config.pomodoro?.glassBg ?? true },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={e => {
                      const v = e.target.checked;
                      updateConfig(p => ({
                        ...p,
                        [item.id]: { ...(p as any)[item.id], visible: v },
                      }));
                    }}
                    className="w-3.5 h-3.5 rounded text-cyan-500 cursor-pointer"
                  />
                  <span className={item.visible ? 'text-white font-medium' : 'text-white/40 line-through'}>
                    {item.label}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => toggleWidgetTransparency(item.id as any)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer border ${
                    item.glass
                      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                      : 'bg-amber-400/15 border-amber-400/30 text-amber-300 hover:bg-amber-400/25'
                  }`}
                  title={item.glass ? 'Currently Glass (Click to make Transparent)' : 'Currently Transparent (Click to make Glass)'}
                >
                  {item.glass ? 'Glass' : 'Transp.'}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                setStudioOpen(true);
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-left text-[11px] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span>Design & Typography Studio</span>
              <kbd className="text-[9px] bg-white/10 px-1 rounded text-white/60">V</kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                recenterWidgets();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-left text-[11px] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span>Re-center All Widgets</span>
              <kbd className="text-[9px] bg-white/10 px-1 rounded text-white/60">C</kbd>
            </button>
          </div>
        </div>
      )}

      {/* ================= VISUAL CUSTOMIZATION STUDIO MODAL ================= */}
      {studioOpen && (
        <VisualCustomizationStudio
          isOpen={studioOpen}
          onClose={() => setStudioOpen(false)}
          currentConfig={config}
          onApply={updates => {
            updateConfig(prev => ({
              ...prev,
              ...updates,
            }));
          }}
          savedPresets={savedPresets}
          onUpdatePresets={handleUpdatePresets}
        />
      )}

      {/* ================= DAILY REGISTRY & PERSONAL HISTORY MODAL ================= */}
      {historyModalOpen && (
        <DailyRegistryHistoryModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          uid={currentUser?.uid || null}
          userEmail={currentUser?.email || (currentUser?.isAnonymous ? 'Guest Student' : null)}
          historyMap={dailyRegistryHistory}
          onSaveDayNotes={handleSaveDayNotes}
          onAddManualEntry={handleAddManualEntryModal}
          onDeleteEntry={handleDeleteEntryModal}
          activeTasks={tasks}
        />
      )}
    </div>
  );
}
