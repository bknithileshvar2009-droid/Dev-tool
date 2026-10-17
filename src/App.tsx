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
} from 'lucide-react';
import { MOTIVATION_QUOTES, MotivationQuote } from './utils/quotes';
import {
  auth,
  saveUserDashboard,
  loadUserDashboard,
  signInWithGoogle,
  logOutUser,
  onAuthStateChanged,
  User,
  SyncStatus,
} from './utils/firebase';
import VisualCustomizationStudio from './components/VisualCustomizationStudio';
import AnimatedCharacterBackdrop from './components/AnimatedCharacterBackdrop';
import {
  STUDIO_LAYOUT_ARRANGEMENTS,
  computePresetWidgetCoordinates,
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
    id: 'lofi-tokyo',
    title: 'Cyber Tokyo Night',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'misty-forest',
    title: 'Misty Alpine Pines',
    thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'space-stars',
    title: 'Milky Way Observatory',
    thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'minimal-gradient',
    title: 'Sunset Gradient Calm',
    thumb: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'lofi-rain',
    title: 'Cozy Rain Cafe',
    thumb: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2400&q=85',
  },
  {
    id: 'fuji-dawn',
    title: 'Mount Fuji Twilight',
    thumb: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2400&q=85',
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
  activeWallpaper: 'hero-doctor-doom',
  wallpaperUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2400&q=85',
  canvasTheme: 'doom-animated',
  bgDimmer: 35,
  bgBlur: 1,
  bgSaturation: 115,
  bgBrightness: 95,
  animationIntensity: 1.0,
  isWallpaperStatic: false,
  wallpaperScaling: 'cover',
  widgetStyle: 'metallic-panel',
  activeThemeId: 'hero-doctor-doom',
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
    energyColor: '#10b981',
    energyIntensity: 75,
    focalPosition: 'left',
    characterScale: 100,
    dimmer: 35,
    overlayOpacity: 88,
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
  const [activeTab, setActiveTab] = useState<'features' | 'timetable' | 'routine' | 'tasks' | 'clock' | 'countdown' | 'wallpaper' | 'widgets' | 'personalization' | 'backup' | 'cloud'>('features');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusedWidget, setFocusedWidget] = useState<'nameWidget' | 'clock' | 'countdown' | 'tasks' | 'notification' | 'calendar' | 'motivation' | 'pomodoro' | null>(null);
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
  const [authLoading, setAuthLoading] = useState(false);

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

  // Interaction tracking (drag/resize)
  const dragResizeState = useRef<{
    type: 'drag' | 'resize' | null;
    widget: 'nameWidget' | 'clock' | 'countdown' | 'tasks' | 'notification' | 'calendar' | 'motivation' | 'pomodoro' | null;
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

  // Right-Click Context Menu State & Widget Management
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    const menuWidth = 300;
    const menuHeight = 480;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setContextMenu({ x: Math.max(10, x), y: Math.max(10, y), visible: true });
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Transparency Controls (Per-Widget & Global)
  const toggleWidgetTransparency = useCallback((widgetKey: 'clock' | 'countdown' | 'notification' | 'calendar' | 'tasks' | 'motivation' | 'pomodoro' | 'nameWidget') => {
    updateConfig(p => ({
      ...p,
      [widgetKey]: {
        ...p[widgetKey],
        glassBg: !p[widgetKey]?.glassBg,
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
      !config.pomodoro?.glassBg
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

    const isDoom = config.activeThemeId === 'hero-doctor-doom' || config.canvasTheme === 'doom-animated';
    const isIronMan = config.activeThemeId === 'hero-iron-man' || config.canvasTheme === 'ironman-animated';
    const isStandoff = config.activeThemeId === 'hero-doom-vs-ironman' || config.canvasTheme === 'doom-vs-ironman-animated';

    const defaultBg = isDoom
      ? 'rgba(12, 26, 20, 0.84)'
      : isIronMan
      ? 'rgba(24, 8, 12, 0.82)'
      : isStandoff
      ? 'rgba(14, 20, 26, 0.85)'
      : 'rgba(15, 23, 42, 0.78)';

    const defaultBorder = isDoom
      ? 'rgba(16, 185, 129, 0.45)'
      : isIronMan
      ? 'rgba(239, 68, 68, 0.48)'
      : isStandoff
      ? 'rgba(16, 185, 129, 0.45)'
      : 'rgba(255, 255, 255, 0.12)';

    const defaultGlow = isDoom
      ? 'rgba(16, 185, 129, 0.35)'
      : isIronMan
      ? 'rgba(239, 68, 68, 0.35)'
      : isStandoff
      ? 'rgba(6, 182, 212, 0.3)'
      : 'transparent';

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
      target.closest('.resize-handle')
    ) {
      return;
    }

    setContextMenu(null);

    const rect = dashboardRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const clickX = Math.round(e.clientX - rect.left);
    const clickY = Math.round(e.clientY - rect.top);

    let occupiedId: DashboardWidgetKey | null = null;
    let occupiedLabel: string | null = null;

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

    setPlacementModal({
      isOpen: true,
      x: clickX,
      y: clickY,
      occupiedBy: occupiedId,
      occupiedWidgetLabel: occupiedLabel,
      nearestGridSlot: nearestSlot ? { name: nearestSlot.label, cellX: Math.round(nearestSlot.xPercent), cellY: Math.round(nearestSlot.yPercent) } : undefined,
    });
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

  // ================= 5. FIREBASE AUTH & REALTIME DATABASE SYNC =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      if (user) {
        setSyncStatus('saving');
        try {
          const cloudData = await loadUserDashboard(user.uid);
          if (cloudData && cloudData.config) {
            setConfig(prev => ({
              ...prev,
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
            }));
            if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
              setTasks(cloudData.tasks);
              localStorage.setItem('flocus_quick_tasks', JSON.stringify(cloudData.tasks));
            }
          } else {
            // First time cloud user: save local state to cloud!
            await saveUserDashboard(user.uid, {
              config,
              tasks,
              updatedAt: new Date().toISOString(),
            });
          }
          setSyncStatus('saved');
        } catch (err) {
          console.warn('Error syncing with Firebase:', err);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-sync debounce to Firebase when authenticated
  const syncTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (!currentUser) return;

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    setSyncStatus('saving');
    syncTimeoutRef.current = window.setTimeout(async () => {
      try {
        await saveUserDashboard(currentUser.uid, {
          config,
          tasks,
          updatedAt: new Date().toISOString(),
        });
        setSyncStatus('saved');
      } catch (err) {
        console.warn('Cloud sync error:', err);
        setSyncStatus('error');
      }
    }, 800);

    return () => {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    };
  }, [config, tasks, currentUser]);

  const handleManualSyncNow = async () => {
    if (!currentUser) {
      setActiveTab('cloud');
      setDrawerOpen(true);
      return;
    }
    setSyncStatus('saving');
    try {
      await saveUserDashboard(currentUser.uid, {
        config,
        tasks,
        updatedAt: new Date().toISOString(),
      });
      setSyncStatus('saved');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      const cloudData = await loadUserDashboard(currentUser.uid);
      if (cloudData && cloudData.config) {
        setConfig(prev => ({
          ...prev,
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
        }));
        if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
          setTasks(cloudData.tasks);
          localStorage.setItem('flocus_quick_tasks', JSON.stringify(cloudData.tasks));
        }
        setSyncStatus('saved');
      }
    } catch (err) {
      console.warn('Load from cloud error:', err);
      setSyncStatus('error');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOutUser();
      setSyncStatus('offline');
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  // ================= 1. DAILY MOTIVATION =================
  const currentQuote = MOTIVATION_QUOTES[config.motivation.quoteIndex % MOTIVATION_QUOTES.length];

  const handleNextQuote = () => {
    updateConfig(prev => ({
      ...prev,
      motivation: {
        ...prev.motivation,
        quoteIndex: (prev.motivation.quoteIndex + 1) % MOTIVATION_QUOTES.length,
      },
    }));
  };

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

    if (willBeCompleted) {
      playWebAudioChime('task');
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
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMode, pomoSoundEnabled]);

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

    if (sw >= 1400) {
      const nameX = Math.max(10, (sw - nameW) / 2);
      const nameY = 24;

      const clockX = Math.max(10, (sw - clockW) / 2);
      const clockY = nameY + nameH + 16;

      const bottomY = clockY + clockH + 20;
      const cdX = Math.max(20, (sw / 2) - cdW - 15);
      const notifX = Math.min(sw - notifW - 20, (sw / 2) + 15);

      const tasksX = Math.max(20, sw - tasksW - 30);
      const tasksY = bottomY;
      const pomoX = Math.max(20, sw - pomoW - 30);
      const pomoY = 24;
      const calX = 30;
      const motX = 30;
      const motY = 24;

      updateConfig(prev => ({
        ...prev,
        nameWidget: { ...prev.nameWidget, x: nameX, y: nameY },
        clock: { ...prev.clock, x: clockX, y: clockY },
        countdown: { ...prev.countdown, x: cdX, y: bottomY },
        notification: { ...prev.notification, x: notifX, y: bottomY },
        tasks: { ...prev.tasks, x: tasksX, y: tasksY },
        calendar: { ...prev.calendar, x: calX, y: bottomY },
        motivation: { ...prev.motivation, x: motX, y: motY },
        pomodoro: { ...prev.pomodoro, x: pomoX, y: pomoY },
      }));
    } else {
      const nameX = Math.max(10, (sw - nameW) / 2);
      const nameY = 15;
      const clockX = Math.max(10, (sw - clockW) / 2);
      const clockY = nameY + nameH + 12;
      const cdX = Math.max(10, (sw - cdW) / 2);
      const cdY = clockY + clockH + 14;
      const notifX = Math.max(10, (sw - notifW) / 2);
      const notifY = cdY + cdH + 14;
      const tasksX = Math.max(10, (sw - tasksW) / 2);
      const tasksY = notifY + notifH + 14;
      const pomoX = Math.max(10, (sw - pomoW) / 2);
      const pomoY = tasksY + tasksH + 14;
      const calX = Math.max(10, (sw - calW) / 2);
      const calY = pomoY + pomoH + 14;
      const motX = Math.max(10, (sw - motW) / 2);
      const motY = calY + calH + 14;

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
      }));
    }
  }, [
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
      config.pomodoro?.y === null
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
    recenterWidgets,
  ]);

  // Sync fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull) {
        document.body.classList.add('fullscreen-locked');
        setDrawerOpen(false);
      } else {
        document.body.classList.remove('fullscreen-locked');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (zenMode) {
      document.body.classList.add('zen-mode');
      setDrawerOpen(false);
    } else {
      document.body.classList.remove('zen-mode');
    }
  }, [zenMode]);

  // ================= 2. KEYBOARD SHORTCUTS (INCLUDING CMD+K / CTRL+K) =================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        setZenMode(false);
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
  const getWidgetRef = (widgetName: 'nameWidget' | 'clock' | 'countdown' | 'tasks' | 'notification' | 'calendar' | 'motivation' | 'pomodoro') => {
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
    }
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    widgetName: 'nameWidget' | 'clock' | 'countdown' | 'tasks' | 'notification' | 'calendar' | 'motivation' | 'pomodoro'
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
    widget: 'nameWidget' | 'clock' | 'countdown' | 'tasks' | 'notification' | 'calendar' | 'motivation' | 'pomodoro'
  ) => {
    if (!config.optionalFeatures.widgetCustomization) return;
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const minW = widget === 'nameWidget' ? 280 : widget === 'tasks' ? 260 : 260;
    const minH = widget === 'nameWidget' ? 70 : widget === 'tasks' ? 200 : 100;
    updateConfig(prev => {
      const current = prev[widget];
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
        label: 'Show Another Motivational Quote',
        category: 'Motivation',
        action: () => { handleNextQuote(); setCommandMenuOpen(false); },
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
  }, [commandSearch, isFocusModeActive, isPomoRunning, config.optionalFeatures, config.routineMode, config.calendar.visible, recenterWidgets, handleToggleFocusMode, toggleRoutineMode, handleNextQuote, updateConfig, togglePomodoro, resetPomodoro]);

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
      onContextMenu={handleContextMenu}
      onClick={handleDashboardClick}
      className={`relative w-screen h-screen overflow-hidden select-none bg-[#030407] text-slate-100 ${
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
      />

      {/* ================= FLOATING ACTION CONTROLS (TOP RIGHT CORNER) ================= */}
      <div
        id="floating-hud"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center gap-2 transition-all duration-300"
      >
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

      {/* ================= LAPTOP KEYBOARD SHORTCUTS BAR ================= */}
      <div
        id="laptop-shortcut-bar"
        className="absolute bottom-4 left-6 z-40 hidden md:flex items-center gap-3 py-1.5 px-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-white/60 transition-opacity duration-300"
      >
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-cyan-300 text-[10px]">V</kbd> Studio
        </span>
        <span className="opacity-30">•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">⌘K</kbd> Quick Search
        </span>
        <span className="opacity-30">•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">F</kbd> Fullscreen
        </span>
        <span className="opacity-30">•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">M</kbd> Menu
        </span>
        <span className="opacity-30">•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">C</kbd> Center
        </span>
        <span className="opacity-30">•</span>
        {currentUser ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Cloud Synced</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>Local Storage</span>
          </span>
        )}
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
            width: config.motivation.width || 440,
            height: config.motivation.height || 140,
            left: config.motivation.x ?? 30,
            top: config.motivation.y ?? 24,
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

          <div className="flex items-center justify-between no-drag">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-300/90 font-['Plus_Jakarta_Sans']">
              <Quote className="w-3 h-3 text-amber-400" />
              <span>DAILY MOTIVATION</span>
            </div>
            <button
              onClick={handleNextQuote}
              title="Show another quote"
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="my-1 text-center no-drag">
            <p className="text-xs sm:text-[13px] font-medium text-white/90 leading-snug italic">
              "{currentQuote.quote}"
            </p>
            <span className="block mt-1 text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase">
              — {currentQuote.author}
            </span>
          </div>

          <div className="pt-1 border-t border-white/5 no-drag flex items-center justify-between text-[10px]">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Firebase Cloud Firestore Storage</h3>
              <p className="text-[11px] text-white/50">Private cloud persistence under users/{'{uid}'}/dashboard/data</p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {authError}
              </div>
            )}

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
                  {syncStatus === 'saved' ? '● Synced to Firestore' : syncStatus === 'saving' ? '⟳ Syncing...' : 'Local Storage Only'}
                </span>
              </div>

              {currentUser ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                          {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">
                          {currentUser.displayName || currentUser.email || 'Authenticated User'}
                        </div>
                        <div className="text-[10px] text-white/40 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 text-[10px] text-cyan-300/80 font-mono truncate">
                      Firestore Path: users/{currentUser.uid}/dashboard/data
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
                      <span>Load from Cloud</span>
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
                    Sign in with your Google account to automatically synchronize your timetable, study routine, quick tasks, daily motivation intentions, and widget layouts to your private Cloud Firestore database across devices.
                  </p>

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
                    <span>{authLoading ? 'Signing in...' : 'Sign In with Google'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Zero-Trust Firestore Security</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Your study data is encrypted and isolated under Cloud Firestore path <code>users/{'{uid}'}/dashboard/data</code>. Hardened ABAC security rules verify that only your authenticated Google account can read or write your personal preparation files.
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
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Curated Wallpapers</label>
                <span className="text-[10px] text-cyan-400 font-medium">Click to Apply</span>
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
                    <img src={wp.thumb} alt={wp.title} className="w-full h-20 object-cover pointer-events-none" />
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
                      activeWallpaper: 'lofi-tokyo',
                      wallpaperUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=85',
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
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Occupied by {placementModal.occupiedWidgetLabel}</span>
                </div>
                <p className="text-[10px] text-white/70 leading-relaxed">
                  Choose how to place your widget without deleting or duplicating existing content:
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
              <span>Select Widget to Place Here</span>
              <span>8 Available</span>
            </div>

            {/* List of 8 Widgets */}
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
                          {isVisible ? 'Active on dashboard' : 'Hidden • Ready to add'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isVisible && !isCurrentOccupier ? (
                        <button
                          type="button"
                          onClick={() => handlePlaceWidgetAtSelectedPosition(widget.id, 'exact')}
                          className="px-2 py-1 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-[10px] font-semibold text-cyan-200 transition cursor-pointer"
                          title="Move this widget to the clicked location"
                        >
                          Move Here
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePlaceWidgetAtSelectedPosition(widget.id, 'exact')}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isCurrentOccupier
                              ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                              : 'bg-emerald-500/30 hover:bg-emerald-500/45 text-emerald-200 border-emerald-400/50'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isCurrentOccupier ? 'Reposition' : 'Add Here'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
