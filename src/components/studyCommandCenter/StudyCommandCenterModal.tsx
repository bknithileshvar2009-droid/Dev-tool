/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Study Command Center Modal — Complete 18-Widget Integrated Suite
 * Integrates standalone Chronos Study Tracker (https://nothing-mu-nine.vercel.app/)
 * with APES AI (https://apesai.vercel.app/)
 * Student Display Name: BK NITHILESHVAR
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Calendar,
  Flame,
  Award,
  BookOpen,
  BarChart3,
  Download,
  FileText,
  Database,
  RefreshCw,
  Sparkles,
  Search,
  Trash2,
  CheckCircle2,
  Filter,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Sliders,
  ExternalLink,
  Volume2,
  VolumeX,
  AlertCircle,
  TrendingUp,
  Target,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import {
  studyStorage,
  ChronosStudySession,
  ChronosUserSettings,
  StudyTimerMode,
  DEFAULT_CHRONOS_SETTINGS,
} from '../../utils/studyTrackerStorage';

interface StudyCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid?: string | null;
  activeSubject?: string;
  activeTask?: string;
}

export type CommandCenterTab =
  | 'overview'
  | 'timer'
  | 'history'
  | 'analytics'
  | 'reports'
  | 'settings';

export default function StudyCommandCenterModal({
  isOpen,
  onClose,
  uid = 'BK_MASTER_STUDENT_CENTUM_2026',
  activeSubject = 'Mathematics',
  activeTask = '',
}: StudyCommandCenterModalProps) {
  const activeUid = uid || 'BK_MASTER_STUDENT_CENTUM_2026';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<CommandCenterTab>('overview');

  // Authoritative State from Unified Storage Service
  const [sessions, setSessions] = useState<ChronosStudySession[]>([]);
  const [settings, setSettings] = useState<ChronosUserSettings>(DEFAULT_CHRONOS_SETTINGS);
  const [activeSession, setActiveSession] = useState<ChronosStudySession | null>(null);

  // Timer Local Runtime State
  const [timerMode, setTimerMode] = useState<StudyTimerMode>('stopwatch');
  const [timerSubject, setTimerSubject] = useState<string>(activeSubject || 'Mathematics');
  const [timerTopic, setTimerTopic] = useState<string>(activeTask || '');
  const [timerChapter, setTimerChapter] = useState<string>('');
  const [timerNotes, setTimerNotes] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [countdownMinutes, setCountdownMinutes] = useState<number>(45);
  const [pomodoroWorkMin, setPomodoroWorkMin] = useState<number>(25);
  const [pomodoroBreakMin, setPomodoroBreakMin] = useState<number>(5);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroCycles, setPomodoroCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Widget Expansion / Visibility toggles
  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('scc_collapsed_widgets');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historySubjectFilter, setHistorySubjectFilter] = useState('all');
  const [historyRange, setHistoryRange] = useState<'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Daily Review & Notes
  const [dailyNotesInput, setDailyNotesInput] = useState('');
  const [dailyEnergyRating, setDailyEnergyRating] = useState<number>(5);
  const [dailyReviewSaved, setDailyReviewSaved] = useState(false);

  // Import JSON Feedback
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const timerIntervalRef = useRef<number | null>(null);
  const timerStartMsRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const pauseIntervalsRef = useRef<{ pausedAt: number; resumedAt: number | null }[]>([]);

  // 1. Initial Load & Realtime Sync Subscription
  useEffect(() => {
    if (!isOpen) return;

    // Load initial from storage service
    studyStorage.getAllSessions().then(list => setSessions(list));
    setSettings(studyStorage.getSettings());
    studyStorage.getActiveSession().then(act => {
      if (act && act.status === 'active') {
        resumeRestoredActiveSession(act);
      }
    });

    // Realtime listener
    const unsubSessions = studyStorage.subscribe(list => setSessions(list));
    const unsubSettings = studyStorage.subscribeSettings(s => setSettings(s));
    const unsubCloud = studyStorage.bindRealtimeCloudSync(activeUid);

    // Initial fetch from Firebase RTDB in background
    studyStorage.fetchSessionsFromCloud(activeUid).then(list => {
      if (list && list.length > 0) setSessions(list);
    });

    return () => {
      unsubSessions();
      unsubSettings();
      unsubCloud();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, activeUid]);

  const resumeRestoredActiveSession = (act: ChronosStudySession) => {
    setActiveSession(act);
    setTimerSubject(act.subject);
    setTimerTopic(act.task || '');
    setTimerChapter(act.chapter || '');
    setTimerMode(act.mode);
    accumulatedMsRef.current = act.accumulatedActiveMs || 0;
    pauseIntervalsRef.current = act.pauseIntervals || [];
    timerStartMsRef.current = act.startTime || Date.now();
    setTimerStatus('running');

    // Run active ticker
    startTicker(act.mode);
  };

  const toggleCollapse = (widgetId: string) => {
    setCollapsedWidgets(prev => {
      const next = { ...prev, [widgetId]: !prev[widgetId] };
      try {
        localStorage.setItem('scc_collapsed_widgets', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Sound chime synthesizer using Web Audio API (₹0 budget, no external audio assets needed)
  const playSoundAlert = useCallback((type: 'start' | 'pause' | 'finish' = 'finish') => {
    if (!soundEnabled && !settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'pause') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(349.23, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        // Complete chime: C5 -> G5 -> C6
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {}
  }, [soundEnabled, settings.soundEnabled]);

  // ================= TIMER ENGINE =================
  const startTicker = (mode: StudyTimerMode) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsedSinceStart = now - timerStartMsRef.current;
      const currentActiveMs = accumulatedMsRef.current + elapsedSinceStart;

      if (mode === 'stopwatch') {
        setTimerSeconds(Math.floor(currentActiveMs / 1000));
      } else if (mode === 'countdown') {
        const totalTargetMs = countdownMinutes * 60000;
        const remainingMs = Math.max(0, totalTargetMs - currentActiveMs);
        setTimerSeconds(Math.ceil(remainingMs / 1000));
        if (remainingMs <= 0) {
          handleStopTimer(true);
        }
      } else if (mode === 'pomodoro') {
        const targetMs = (pomodoroPhase === 'work' ? pomodoroWorkMin : pomodoroBreakMin) * 60000;
        const remainingMs = Math.max(0, targetMs - currentActiveMs);
        setTimerSeconds(Math.ceil(remainingMs / 1000));
        if (remainingMs <= 0) {
          handlePomodoroIntervalComplete();
        }
      }
    }, 1000);
  };

  const handleStartTimer = () => {
    const now = Date.now();
    timerStartMsRef.current = now;
    accumulatedMsRef.current = 0;
    pauseIntervalsRef.current = [];
    setTimerStatus('running');

    const newActive: ChronosStudySession = {
      id: `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
      subject: timerSubject || 'General Study',
      task: timerTopic || '',
      chapter: timerChapter || '',
      notes: timerNotes || '',
      startTime: now,
      endTime: null,
      accumulatedActiveMs: 0,
      status: 'active',
      mode: timerMode,
      targetDurationMs: timerMode === 'countdown' ? countdownMinutes * 60000 : timerMode === 'pomodoro' ? pomodoroWorkMin * 60000 : undefined,
      pauseIntervals: [],
      updatedAt: now,
      date: new Date(now).toISOString().slice(0, 10),
      userId: activeUid,
      rating: 5,
    };

    setActiveSession(newActive);
    studyStorage.saveActiveSession(newActive, activeUid);
    playSoundAlert('start');
    startTicker(timerMode);
  };

  const handlePauseTimer = () => {
    if (timerStatus !== 'running') return;
    const now = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    accumulatedMsRef.current += (now - timerStartMsRef.current);
    pauseIntervalsRef.current.push({ pausedAt: now, resumedAt: null });
    setTimerStatus('paused');

    if (activeSession) {
      const updated: ChronosStudySession = {
        ...activeSession,
        status: 'paused',
        accumulatedActiveMs: accumulatedMsRef.current,
        pauseIntervals: [...pauseIntervalsRef.current],
        updatedAt: now,
      };
      setActiveSession(updated);
      studyStorage.saveActiveSession(updated, activeUid);
    }
    playSoundAlert('pause');
  };

  const handleResumeTimer = () => {
    if (timerStatus !== 'paused') return;
    const now = Date.now();
    timerStartMsRef.current = now;

    if (pauseIntervalsRef.current.length > 0) {
      const last = pauseIntervalsRef.current[pauseIntervalsRef.current.length - 1];
      if (last.resumedAt === null) {
        last.resumedAt = now;
      }
    }
    setTimerStatus('running');

    if (activeSession) {
      const updated: ChronosStudySession = {
        ...activeSession,
        status: 'active',
        pauseIntervals: [...pauseIntervalsRef.current],
        updatedAt: now,
      };
      setActiveSession(updated);
      studyStorage.saveActiveSession(updated, activeUid);
    }
    playSoundAlert('start');
    startTicker(timerMode);
  };

  const handleStopTimer = async (autoFinish = false) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const now = Date.now();

    let finalActiveMs = accumulatedMsRef.current;
    if (timerStatus === 'running') {
      finalActiveMs += (now - timerStartMsRef.current);
    } else if (timerStatus === 'paused' && pauseIntervalsRef.current.length > 0) {
      const last = pauseIntervalsRef.current[pauseIntervalsRef.current.length - 1];
      if (last.resumedAt === null) last.resumedAt = now;
    }

    // Minimum 10 seconds to record as valid study session
    if (finalActiveMs >= 10000 && activeSession) {
      const completed: ChronosStudySession = {
        ...activeSession,
        endTime: now,
        accumulatedActiveMs: finalActiveMs,
        status: 'completed',
        pauseIntervals: [...pauseIntervalsRef.current],
        notes: timerNotes || activeSession.notes || '',
        updatedAt: now,
      };

      await studyStorage.saveSession(completed, activeUid);
      playSoundAlert('finish');
    }

    setTimerStatus('idle');
    setTimerSeconds(0);
    setActiveSession(null);
    accumulatedMsRef.current = 0;
    pauseIntervalsRef.current = [];
    await studyStorage.saveActiveSession(null, activeUid);
  };

  const handleCancelTimer = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerStatus('idle');
    setTimerSeconds(0);
    setActiveSession(null);
    accumulatedMsRef.current = 0;
    pauseIntervalsRef.current = [];
    await studyStorage.saveActiveSession(null, activeUid);
  };

  const handlePomodoroIntervalComplete = () => {
    playSoundAlert('finish');
    if (pomodoroPhase === 'work') {
      setPomodoroPhase('break');
      setPomodoroCycles(prev => prev + 1);
      timerStartMsRef.current = Date.now();
      accumulatedMsRef.current = 0;
      startTicker('pomodoro');
    } else {
      setPomodoroPhase('work');
      timerStartMsRef.current = Date.now();
      accumulatedMsRef.current = 0;
      startTicker('pomodoro');
    }
  };

  // ================= METRICS & ANALYTICS CALCULATIONS =================
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todaySessions = useMemo(() => {
    return sessions.filter(s => s.date === todayStr);
  }, [sessions, todayStr]);

  const todayActiveMs = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0);
  }, [todaySessions]);

  const todayActiveHours = (todayActiveMs / 3600000).toFixed(1);
  const todayGoalHours = settings.dailyGoalHours || 4;
  const todayGoalPercent = Math.min(100, Math.round((todayActiveMs / (todayGoalHours * 3600000)) * 100));

  // 7-Day Weekly Breakdown
  const weeklyData = useMemo(() => {
    const days: { dateStr: string; label: string; activeMs: number; hours: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const daySessions = sessions.filter(s => s.date === ds);
      const activeMs = daySessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0);
      days.push({
        dateStr: ds,
        label: d.toLocaleDateString([], { weekday: 'short' }),
        activeMs,
        hours: +(activeMs / 3600000).toFixed(1),
      });
    }
    return days;
  }, [sessions]);

  const weeklyTotalHours = weeklyData.reduce((acc, d) => acc + d.hours, 0).toFixed(1);
  const weeklyDailyAvgHours = (parseFloat(weeklyTotalHours) / 7).toFixed(1);

  // Monthly Overview
  const monthlyData = useMemo(() => {
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    const mSessions = sessions.filter(s => s.date.startsWith(currentYearMonth));
    const totalMs = mSessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0);
    const daysStudied = new Set(mSessions.map(s => s.date)).size;
    return {
      hours: (totalMs / 3600000).toFixed(1),
      sessionsCount: mSessions.length,
      daysStudied,
    };
  }, [sessions]);

  // Subject-Wise Breakdown
  const subjectBreakdown = useMemo(() => {
    const map: Record<string, { activeMs: number; count: number }> = {};
    const totalMs = sessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0);

    sessions.forEach(s => {
      const sub = s.subject || 'General Study';
      if (!map[sub]) map[sub] = { activeMs: 0, count: 0 };
      map[sub].activeMs += (s.accumulatedActiveMs || 0);
      map[sub].count += 1;
    });

    return Object.entries(map)
      .map(([subject, data]) => ({
        subject,
        hours: (data.activeMs / 3600000).toFixed(1),
        minutes: Math.round(data.activeMs / 60000),
        count: data.count,
        percent: totalMs > 0 ? Math.round((data.activeMs / totalMs) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  // Streak Calculation
  const studyStreak = useMemo(() => {
    if (sessions.length === 0) return { current: 0, longest: 0 };
    const dateSet = new Set(sessions.map(s => s.date));
    let current = 0;
    let longest = 0;
    let temp = 0;

    const checkDate = new Date();
    // If studied today
    const todayChecked = dateSet.has(checkDate.toISOString().slice(0, 10));
    if (todayChecked) current++;

    // Check consecutive past days
    for (let i = 1; i <= 365; i++) {
      const d = new Date();
      d.setDate(checkDate.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      if (dateSet.has(ds)) {
        if (i === current) current++;
        temp++;
      } else {
        if (temp > longest) longest = temp;
        temp = 0;
        if (i <= current) break;
      }
    }
    if (temp > longest) longest = temp;
    if (current > longest) longest = current;

    return { current, longest };
  }, [sessions]);

  // Filtered History
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // 1. Search filter
      const q = historySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.subject.toLowerCase().includes(q) ||
        (s.task && s.task.toLowerCase().includes(q)) ||
        (s.chapter && s.chapter.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q));

      // 2. Subject filter
      const matchSubject = historySubjectFilter === 'all' || s.subject === historySubjectFilter;

      // 3. Date Range filter
      let matchRange = true;
      const today = new Date().toISOString().slice(0, 10);
      if (historyRange === 'today') {
        matchRange = s.date === today;
      } else if (historyRange === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        matchRange = s.date === y.toISOString().slice(0, 10);
      } else if (historyRange === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        matchRange = s.date >= d.toISOString().slice(0, 10);
      } else if (historyRange === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        matchRange = s.date >= d.toISOString().slice(0, 10);
      } else if (historyRange === 'month') {
        matchRange = s.date.startsWith(today.slice(0, 7));
      } else if (historyRange === 'custom') {
        if (customStart && s.date < customStart) matchRange = false;
        if (customEnd && s.date > customEnd) matchRange = false;
      }

      return matchSearch && matchSubject && matchRange;
    });
  }, [sessions, historySearch, historySubjectFilter, historyRange, customStart, customEnd]);

  // Calendar Heatmap dates
  const calendarStudyDates = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach(s => {
      map.set(s.date, (map.get(s.date) || 0) + (s.accumulatedActiveMs || 0));
    });
    return map;
  }, [sessions]);

  // Manual Trigger: Force Dual-Sync
  const handleForceSync = async () => {
    setSyncFeedback('Synchronizing with Chronos Study & Firebase RTDB...');
    const ok = await studyStorage.syncAllToCloud(activeUid);
    await studyStorage.fetchSessionsFromCloud(activeUid);
    if (ok) {
      setSyncFeedback('100% Synced across Chronos Study and APES AI!');
    } else {
      setSyncFeedback('Sync saved locally (offline mode enabled)');
    }
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Format Helper: Seconds to HH:MM:SS or MM:SS
  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#090b14] border border-cyan-500/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
        
        {/* ================= HEADER BAR ================= */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Study Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  BK NITHILESHVAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unified Study Suite · Connected to Chronos Study (nothing-mu-nine) & Firebase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Realtime Dual-Sync Status Pill */}
            <button
              onClick={handleForceSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-[11px] font-mono text-cyan-300 transition cursor-pointer shadow-sm"
              title="Click to force instant two-way synchronization"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${studyStorage.syncStatus === 'syncing' ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">
                {studyStorage.syncStatus === 'syncing' ? 'Syncing...' : 'Dual-Synced'}
              </span>
            </button>

            {/* Standalone Tracker Link */}
            <a
              href="https://nothing-mu-nine.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/10 transition"
              title="Open standalone Chronos Study Tracker in new tab"
            >
              <span>Chronos App</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="bg-cyan-950/80 border-b border-cyan-500/40 px-4 py-1.5 text-center text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* ================= PRIMARY NAVIGATION TABS ================= */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-white/10 overflow-x-auto no-scrollbar bg-slate-900/40 text-xs font-semibold">
          {[
            { id: 'overview', label: '18-Widget Overview', icon: Sliders },
            { id: 'timer', label: 'Live Study Timer', icon: Clock },
            { id: 'history', label: `Session History (${sessions.length})`, icon: BookOpen },
            { id: 'analytics', label: 'Analytics & Streaks', icon: BarChart3 },
            { id: 'reports', label: 'PDF Reports & CSV', icon: FileText },
            { id: 'settings', label: 'Storage & Settings', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CommandCenterTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-cyan-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ================= TAB 1: 18-WIDGET COMMAND OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Row 1: Live Timer Widget (#1) + Today Summary (#2) + Goal Progress (#3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* WIDGET 1: LIVE STUDY TIMER */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">1. Live Study Timer</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      timerStatus === 'running' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' :
                      timerStatus === 'paused' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      {timerStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/40 text-[10px] font-medium text-center">
                    {(['stopwatch', 'countdown', 'pomodoro'] as StudyTimerMode[]).map(m => (
                      <button
                        key={m}
                        disabled={timerStatus !== 'idle'}
                        onClick={() => setTimerMode(m)}
                        className={`py-1 rounded-lg transition capitalize ${
                          timerMode === m ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Large Digital Timer Display */}
                  <div className="text-center py-2 bg-black/30 rounded-2xl border border-white/5">
                    <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-cyan-400">
                      {formatSeconds(timerSeconds)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {timerSubject} · {timerTopic || 'Open Study'}
                    </div>
                  </div>

                  {/* Subject & Topic Inputs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Subject</label>
                      <select
                        value={timerSubject}
                        disabled={timerStatus !== 'idle'}
                        onChange={e => setTimerSubject(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        {settings.subjectPresets.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Topic / Chapter</label>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 4 Calculus"
                        value={timerTopic}
                        disabled={timerStatus !== 'idle'}
                        onChange={e => setTimerTopic(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    {timerStatus === 'idle' && (
                      <button
                        onClick={handleStartTimer}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Session</span>
                      </button>
                    )}
                    {timerStatus === 'running' && (
                      <>
                        <button
                          onClick={handlePauseTimer}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause</span>
                        </button>
                        <button
                          onClick={() => handleStopTimer(false)}
                          className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Finish & Save</span>
                        </button>
                      </>
                    )}
                    {timerStatus === 'paused' && (
                      <>
                        <button
                          onClick={handleResumeTimer}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Resume</span>
                        </button>
                        <button
                          onClick={() => handleStopTimer(false)}
                          className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Finish & Save</span>
                        </button>
                        <button
                          onClick={handleCancelTimer}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                          title="Discard Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* WIDGET 2: TODAY'S STUDY SUMMARY */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">2. Today's Summary</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{todayStr}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center py-2">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] text-slate-400">Time Studied</div>
                      <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                        {todayActiveHours}h
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {Math.round(todayActiveMs / 60000)} minutes active
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] text-slate-400">Sessions</div>
                      <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                        {todaySessions.length}
                      </div>
                      <div className="text-[9px] text-slate-500">completed today</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Subjects Studied Today:</span>
                      <span className="text-white font-semibold">
                        {new Set(todaySessions.map(s => s.subject)).size} Subjects
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(todaySessions.map(s => s.subject))).map(sub => (
                        <span key={sub} className="px-2 py-0.5 rounded-md text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {sub}
                        </span>
                      ))}
                      {todaySessions.length === 0 && (
                        <span className="text-[10px] text-slate-500 italic">No study sessions logged today yet.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* WIDGET 3: DAILY GOAL PROGRESS */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">3. Daily Goal Progress</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 font-mono">{todayGoalPercent}%</span>
                  </div>

                  {/* Progress Bar & Goal Value */}
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{todayActiveHours}h Studied</span>
                      <span className="text-white font-bold">{todayGoalHours}h Target</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-500"
                        style={{ width: `${todayGoalPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-center">
                      {Number(todayActiveHours) >= todayGoalHours
                        ? '🎉 Goal achieved for today! Outstanding discipline.'
                        : `${((todayGoalHours * 3600000 - todayActiveMs) / 3600000).toFixed(1)}h remaining to hit your target`}
                    </div>
                  </div>

                  {/* Interactive Target Adjuster */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                    <span className="text-slate-400">Target Goal:</span>
                    <div className="flex items-center gap-1">
                      {[2, 4, 6, 8].map(h => (
                        <button
                          key={h}
                          onClick={() => studyStorage.saveSettings({ ...settings, dailyGoalHours: h }, activeUid)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                            settings.dailyGoalHours === h ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Weekly Overview (#4) + Monthly Overview (#5) + Subject-Wise Time (#6) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* WIDGET 4: WEEKLY STUDY OVERVIEW */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">4. Weekly Overview</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">{weeklyTotalHours}h total</span>
                  </div>

                  {/* 7-Day Bar Chart */}
                  <div className="h-32 flex items-end justify-between gap-1.5 pt-4 pb-2 px-1">
                    {weeklyData.map(day => {
                      const maxH = Math.max(...weeklyData.map(d => d.hours), 4);
                      const heightPercent = maxH > 0 ? Math.min(100, Math.round((day.hours / maxH) * 100)) : 0;
                      const isToday = day.dateStr === todayStr;

                      return (
                        <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[9px] font-mono text-slate-400">{day.hours > 0 ? `${day.hours}h` : ''}</span>
                          <div
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              isToday ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : day.hours > 0 ? 'bg-indigo-500' : 'bg-white/5'
                            }`}
                            style={{ height: `${Math.max(4, heightPercent)}%` }}
                          />
                          <span className={`text-[10px] font-medium ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2 font-mono">
                    <span>Daily Avg: {weeklyDailyAvgHours}h</span>
                    <span>Weekly Target: {settings.weeklyTargetHours || 28}h</span>
                  </div>
                </div>

                {/* WIDGET 5: MONTHLY STUDY OVERVIEW */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">5. Monthly Overview</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Month-to-Date</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-2">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[9px] text-slate-400">Total Hours</div>
                      <div className="text-xl font-mono font-bold text-indigo-400 mt-1">{monthlyData.hours}h</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[9px] text-slate-400">Active Days</div>
                      <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{monthlyData.daysStudied}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[9px] text-slate-400">Sessions</div>
                      <div className="text-xl font-mono font-bold text-amber-400 mt-1">{monthlyData.sessionsCount}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
                    <span className="font-semibold">Consistency Score: </span>
                    <span>{Math.round((monthlyData.daysStudied / Math.max(1, new Date().getDate())) * 100)}% active days this month</span>
                  </div>
                </div>

                {/* WIDGET 6: SUBJECT-WISE STUDY TIME */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">6. Subject-Wise Breakdown</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{subjectBreakdown.length} Subjects</span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {subjectBreakdown.map((item, idx) => {
                      const colors = ['bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-indigo-400', 'bg-rose-400', 'bg-purple-400'];
                      const barColor = colors[idx % colors.length];

                      return (
                        <div key={item.subject} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white font-medium truncate max-w-[140px]">{item.subject}</span>
                            <span className="font-mono text-slate-400 text-[10px]">
                              {item.hours}h ({item.percent}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {subjectBreakdown.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-4 text-center">No subject sessions logged yet.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Row 3: Recent Sessions (#7) + Study Calendar (#8) + Streaks (#9) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* WIDGET 7: RECENT STUDY SESSIONS */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">7. Recent Sessions</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {sessions.slice(0, 5).map(s => {
                      const mins = Math.round(s.accumulatedActiveMs / 60000);
                      const timeStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={s.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-white truncate max-w-[130px]">{s.subject}</span>
                              <span className="text-[10px] text-cyan-400 font-mono font-bold">{mins}m</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {s.task || s.date} · {timeStr}
                            </div>
                          </div>
                          <button
                            onClick={() => studyStorage.deleteSession(s.id, activeUid)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                    {sessions.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-6 text-center">No study records logged yet.</p>
                    )}
                  </div>
                </div>

                {/* WIDGET 8: STUDY CALENDAR */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">8. Study Calendar</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Current Month</span>
                  </div>

                  {/* Calendar Heatmap Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-slate-500 font-bold py-0.5">{day}</div>
                    ))}
                    {Array.from({ length: 31 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const monthStr = new Date().toISOString().slice(0, 7);
                      const fullDate = `${monthStr}-${dayNum < 10 ? '0' : ''}${dayNum}`;
                      const hasStudied = calendarStudyDates.has(fullDate);
                      const isCurrentDay = fullDate === todayStr;

                      return (
                        <div
                          key={dayNum}
                          className={`p-1.5 rounded-lg border text-[10px] font-mono transition ${
                            hasStudied
                              ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 font-bold'
                              : isCurrentDay
                              ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                              : 'bg-white/[0.02] border-white/5 text-slate-500'
                          }`}
                          title={hasStudied ? `Studied on ${fullDate}` : fullDate}
                        >
                          {dayNum}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Study Day
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Today
                    </span>
                  </div>
                </div>

                {/* WIDGET 9: STUDY STREAKS */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">9. Study Streaks</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-6 py-3">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-1 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                        🔥
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono">{studyStreak.current}</div>
                      <div className="text-[10px] text-slate-400">Current Days</div>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-1 text-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                        🏆
                      </div>
                      <div className="text-2xl font-black text-cyan-400 font-mono">{studyStreak.longest}</div>
                      <div className="text-[10px] text-slate-400">Best Streak</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center italic border-t border-white/5 pt-2">
                    "Success is the sum of small efforts, repeated day in and day out."
                  </div>
                </div>

              </div>

              {/* Row 4: Quick Action Hub: PDF (#15) + CSV (#16) + Backup (#17) + Sync (#18) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => studyStorage.generatePDFReport({ sessions, studentName: 'BK NITHILESHVAR' })}
                  className="p-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-left transition cursor-pointer group"
                >
                  <FileText className="w-5 h-5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-white">15. Generate PDF</div>
                  <div className="text-[10px] text-slate-400">Printable A4 Report</div>
                </button>

                <button
                  onClick={() => studyStorage.exportCSV(sessions)}
                  className="p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-left transition cursor-pointer group"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-white">16. Export CSV</div>
                  <div className="text-[10px] text-slate-400">Spreadsheet Data</div>
                </button>

                <button
                  onClick={() => studyStorage.exportJSON()}
                  className="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-left transition cursor-pointer group"
                >
                  <Download className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-white">17. Backup Data</div>
                  <div className="text-[10px] text-slate-400">JSON Archive</div>
                </button>

                <button
                  onClick={handleForceSync}
                  className="p-3.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-left transition cursor-pointer group"
                >
                  <RefreshCw className="w-5 h-5 text-indigo-400 mb-1 group-hover:rotate-180 transition-transform" />
                  <div className="text-xs font-bold text-white">18. Sync Status</div>
                  <div className="text-[10px] text-slate-400">Dual-Cloud Sync</div>
                </button>
              </div>

            </div>
          )}

          {/* ================= TAB 2: LIVE STUDY TIMER (FOCUSED) ================= */}
          {activeTab === 'timer' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-5 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                
                {/* Mode Selector */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Timer Controls</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSoundEnabled(prev => !prev)}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        soundEnabled ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                      title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/50 text-xs font-medium text-center">
                  {(['stopwatch', 'countdown', 'pomodoro'] as StudyTimerMode[]).map(m => (
                    <button
                      key={m}
                      disabled={timerStatus !== 'idle'}
                      onClick={() => setTimerMode(m)}
                      className={`py-2 rounded-xl transition capitalize ${
                        timerMode === m ? 'bg-cyan-500 text-black font-bold shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Big Timer Face */}
                <div className="text-center py-8 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                  <div className="text-5xl sm:text-7xl font-mono font-black text-cyan-400 tracking-wider">
                    {formatSeconds(timerSeconds)}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {timerStatus === 'running' ? 'Active study session in progress' : timerStatus === 'paused' ? 'Paused (active duration strictly tracked)' : 'Ready to start'}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">Subject</label>
                      <select
                        value={timerSubject}
                        disabled={timerStatus !== 'idle'}
                        onChange={e => setTimerSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        {settings.subjectPresets.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">Topic / Chapter</label>
                      <input
                        type="text"
                        placeholder="e.g. Mechanics & Waves"
                        value={timerTopic}
                        disabled={timerStatus !== 'idle'}
                        onChange={e => setTimerTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Session Notes & Objectives</label>
                    <textarea
                      rows={2}
                      placeholder="Notes, key formulas, or questions solved..."
                      value={timerNotes}
                      onChange={e => setTimerNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {timerStatus === 'idle' && (
                    <button
                      onClick={handleStartTimer}
                      className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Study Timer</span>
                    </button>
                  )}
                  {timerStatus === 'running' && (
                    <>
                      <button
                        onClick={handlePauseTimer}
                        className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause Session</span>
                      </button>
                      <button
                        onClick={() => handleStopTimer(false)}
                        className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Save & Complete</span>
                      </button>
                    </>
                  )}
                  {timerStatus === 'paused' && (
                    <>
                      <button
                        onClick={handleResumeTimer}
                        className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Resume</span>
                      </button>
                      <button
                        onClick={() => handleStopTimer(false)}
                        className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Save & Complete</span>
                      </button>
                      <button
                        onClick={handleCancelTimer}
                        className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ================= TAB 3: SESSION HISTORY (#11) ================= */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search subject, topic, chapter, or notes..."
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={historySubjectFilter}
                      onChange={e => setHistorySubjectFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">All Subjects</option>
                      {settings.subjectPresets.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => studyStorage.exportCSV(filteredSessions)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => studyStorage.generatePDFReport({ sessions: filteredSessions, studentName: 'BK NITHILESHVAR' })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                {/* Range Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'All History' },
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: 'month', label: 'This Month' },
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setHistoryRange(r.id as any)}
                      className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                        historyRange === r.id ? 'bg-cyan-500 text-black font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Showing {filteredSessions.length} recorded sessions</span>
                  <span>IndexedDB & RTDB Synced</span>
                </div>

                {filteredSessions.map(s => {
                  const activeMins = Math.round(s.accumulatedActiveMs / 60000);
                  const dateStr = new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeRangeStr = `${new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${s.endTime ? ' - ' + new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`;

                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-white">{s.subject}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                            {activeMins} mins active
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
                        </div>
                        {s.task && (
                          <div className="text-xs text-slate-300">
                            {s.task}{s.chapter ? ` · Chapter: ${s.chapter}` : ''}
                          </div>
                        )}
                        {s.notes && (
                          <div className="text-[11px] text-slate-400 italic">
                            "{s.notes}"
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          {timeRangeStr} · Mode: {s.mode} · Pauses: {s.pauseIntervals?.length || 0}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {s.status}
                        </span>
                        <button
                          onClick={() => studyStorage.deleteSession(s.id, activeUid)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredSessions.length === 0 && (
                  <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-2">
                    <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-sm font-semibold text-white">No sessions found matching filters</p>
                    <p className="text-xs text-slate-500">Start a new session from the Live Timer tab above!</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 4: ANALYTICS & DAILY REVIEW (#12, #13) ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Analytics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[10px] text-slate-400">Total Lifetime Study</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                    {(sessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0) / 3600000).toFixed(1)}h
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[10px] text-slate-400">Avg Session Length</div>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                    {sessions.length > 0 ? Math.round((sessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0) / 60000) / sessions.length) : 0}m
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[10px] text-slate-400">Completion Rate</div>
                  <div className="text-2xl font-mono font-bold text-indigo-400 mt-1">
                    {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) : 100}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[10px] text-slate-400">Total Pauses Handled</div>
                  <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                    {sessions.reduce((acc, s) => acc + (s.pauseIntervals?.length || 0), 0)}
                  </div>
                </div>
              </div>

              {/* WIDGET 13: DAILY REVIEW & REFLECTION */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">13. Daily Review & Reflection</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{todayStr}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">How was your focus and study energy today?</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setDailyEnergyRating(star)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition ${
                            dailyEnergyRating >= star ? 'bg-amber-400 text-black shadow-md' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-slate-400 ml-2">Rating: {dailyEnergyRating}/5</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Key Accomplishments & Daily Notes</label>
                    <textarea
                      rows={3}
                      placeholder="What topics did you master today? What will you study tomorrow?"
                      value={dailyNotesInput}
                      onChange={e => setDailyNotesInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setDailyReviewSaved(true);
                        setTimeout(() => setDailyReviewSaved(false), 2500);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Daily Review</span>
                    </button>
                    {dailyReviewSaved && (
                      <span className="text-xs text-emerald-400 font-mono">Daily review saved to persistent records!</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 5: REPORTS & BACKUP (#15, #16, #17) ================= */}
          {activeTab === 'reports' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* PDF Generator Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">15. Professional A4 PDF Report</h4>
                      <p className="text-xs text-slate-400">Generate formatted study report for BK NITHILESHVAR</p>
                    </div>
                  </div>
                  <button
                    onClick={() => studyStorage.generatePDFReport({ sessions, studentName: 'BK NITHILESHVAR' })}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-black/40 text-xs text-slate-400 font-mono">
                  Includes total hours, subject breakdown, chronological sessions table, start/end timestamps, active durations, and pagination.
                </div>
              </div>

              {/* CSV Export Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">16. Full CSV Spreadsheet Export</h4>
                      <p className="text-xs text-slate-400">Export all records to Excel / Google Sheets format</p>
                    </div>
                  </div>
                  <button
                    onClick={() => studyStorage.exportCSV(sessions)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Backup & Restore JSON */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">17. Backup & Restore (JSON Archive)</h4>
                    <p className="text-xs text-slate-400">Safely backup all sessions and restore to any device</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => studyStorage.exportJSON()}
                    className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON Backup</span>
                  </button>

                  <label className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer text-center">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Import JSON Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async event => {
                            const text = event.target?.result as string;
                            const res = await studyStorage.importJSON(text, 'merge');
                            if (res.success) {
                              setImportNotice(`Successfully imported ${res.count} sessions!`);
                            } else {
                              setImportNotice(`Import failed: ${res.error}`);
                            }
                            setTimeout(() => setImportNotice(null), 4000);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {importNotice && (
                  <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500 text-xs text-cyan-300 font-mono text-center">
                    {importNotice}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 6: STORAGE & SETTINGS (#18) ================= */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">18. Storage & Synchronization Status</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span>IndexedDB (ChronosStudyDB)</span>
                    <span className={studyStorage.isIndexedDBAvailable ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {studyStorage.isIndexedDBAvailable ? 'Available & Active' : 'Fallback to LocalStorage'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span>LocalStorage (chronos_study_sessions)</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span>Firebase RTDB (users/{activeUid.slice(0, 10)}.../sessions)</span>
                    <span className="text-emerald-400 font-bold">Connected (Dual-Sync)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span>Last Synced Timestamp</span>
                    <span className="text-slate-400">
                      {studyStorage.lastSyncTimestamp ? new Date(studyStorage.lastSyncTimestamp).toLocaleTimeString() : 'Current Session'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleForceSync}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Force Complete Cloud Re-Sync</span>
                  </button>
                </div>
              </div>

              {/* User Settings Form */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Preferences</h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Student Display Name</label>
                    <input
                      type="text"
                      value={settings.studentName}
                      onChange={e => {
                        const next = { ...settings, studentName: e.target.value };
                        setSettings(next);
                        studyStorage.saveSettings(next, activeUid);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Daily Study Target (Hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={settings.dailyGoalHours}
                      onChange={e => {
                        const next = { ...settings, dailyGoalHours: +e.target.value || 4 };
                        setSettings(next);
                        studyStorage.saveSettings(next, activeUid);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span>Timer Sound Alerts</span>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={e => {
                        const next = { ...settings, soundEnabled: e.target.checked };
                        setSettings(next);
                        setSoundEnabled(e.target.checked);
                        studyStorage.saveSettings(next, activeUid);
                      }}
                      className="w-4 h-4 rounded text-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
