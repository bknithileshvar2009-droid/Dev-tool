/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  LayoutDashboard,
  Play,
  Pause,
  Square,
  Plus,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Download,
  Trash2,
  Edit2,
  Copy,
  Sparkles,
  Search,
  Filter,
  PieChart as PieIcon,
  Layers,
  Flag,
  Target,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  Printer,
} from 'lucide-react';
import {
  ActivityRecord,
  ActivityCategory,
  DailyGoal,
  DailyReflection,
  ActiveTimerState,
  DayInReviewSettings,
  DEFAULT_ACTIVITY_CATEGORIES,
  getTodayDateString,
  formatTime24to12,
  formatDurationMinutes,
  formatTimerMs,
  calculateUniqueLoggedMinutes,
  detectOverlappingActivities,
} from '../../utils/dayInReviewTypes';
import {
  saveActivityRecordToFirebase,
  deleteActivityRecordFromFirebase,
  loadUserActivityRecordsFromFirebase,
  saveCategoryToFirebase,
  loadUserCategoriesFromFirebase,
  saveGoalToFirebase,
  deleteGoalFromFirebase,
  loadUserGoalsFromFirebase,
  saveReflectionToFirebase,
  loadUserReflectionsFromFirebase,
  saveActiveTimerStateToFirebase,
  loadActiveTimerStateFromFirebase,
} from '../../utils/dayInReviewFirebase';
import { generateDailyReportPDF, generateCombinedMultiDayReportPDF, CombinedDaySummaryItem } from '../../utils/pdfGenerator';
import { DayDashboardView } from './DayDashboardView';

export interface DayInReviewHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string | null;
  userEmail: string | null;
}

export const DayInReviewHubModal: React.FC<DayInReviewHubModalProps> = ({
  isOpen,
  onClose,
  uid,
  userEmail,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'tracker'
    | 'timeline'
    | 'goals'
    | 'review'
    | 'history'
    | 'analytics'
    | 'reports'
    | 'categories'
    | 'settings'
  >('dashboard');

  // Selected Date State
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Data States
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>(DEFAULT_ACTIVITY_CATEGORIES);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [reflectionsMap, setReflectionsMap] = useState<Record<string, DailyReflection>>({});
  const [settings, setSettings] = useState<DayInReviewSettings>({
    preferredReviewTime: '21:00',
    enableNotifications: true,
    defaultCategoryId: 'study',
  });

  // Active Timer State
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);
  const [liveTimerMs, setLiveTimerMs] = useState<number>(0);
  const timerIntervalRef = useRef<any>(null);


  // Multi-day combined export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportRangeType, setExportRangeType] = useState<
    "today" | "last7" | "last14" | "last30" | "thisMonth" | "all" | "custom"
  >("last14");
  const [customExportStart, setCustomExportStart] = useState("");
  const [customExportEnd, setCustomExportEnd] = useState("");

  const handleExportCombinedMultiDayPDF = (autoPrint = false) => {
    // Unique list of dates from activities & reflections
    const activityDates = activities.map(a => a.date);
    const reflectionDates = Object.keys(reflectionsMap);
    const allDatesSet = new Set<string>([...activityDates, ...reflectionDates]);
    const allDates = Array.from(allDatesSet).sort();

    if (allDates.length === 0) {
      allDates.push(getTodayDateString());
    }

    const todayStr = getTodayDateString();
    let filteredDates = [...allDates];
    let rangeLabel = "All Available History";

    if (exportRangeType === "today") {
      filteredDates = allDates.filter(d => d === todayStr);
      rangeLabel = `Today (${todayStr})`;
    } else if (exportRangeType === "last7") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      filteredDates = allDates.filter(d => d >= cutoffStr);
      rangeLabel = `Last 7 Days (${cutoffStr} to ${todayStr})`;
    } else if (exportRangeType === "last14") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      filteredDates = allDates.filter(d => d >= cutoffStr);
      rangeLabel = `Last 14 Days (${cutoffStr} to ${todayStr})`;
    } else if (exportRangeType === "last30") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      filteredDates = allDates.filter(d => d >= cutoffStr);
      rangeLabel = `Last 30 Days (${cutoffStr} to ${todayStr})`;
    } else if (exportRangeType === "thisMonth") {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      filteredDates = allDates.filter(d => d >= monthStart);
      rangeLabel = `This Month (${monthStart} to ${todayStr})`;
    } else if (exportRangeType === "custom" && customExportStart && customExportEnd) {
      filteredDates = allDates.filter(d => d >= customExportStart && d <= customExportEnd);
      rangeLabel = `Custom Range (${customExportStart} to ${customExportEnd})`;
    }

    const summaries: CombinedDaySummaryItem[] = filteredDates.map(dateKey => {
      const dayActivities = activities.filter(a => a.date === dateKey);
      const dayGoals = goals.filter(g => !g.startDate || g.startDate === dateKey);
      const reflection = reflectionsMap[dateKey];

      let fullDateStr = dateKey;
      try {
        const dObj = new Date(dateKey + "T12:00:00");
        fullDateStr = dObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {}

      return {
        date: dateKey,
        fullDateStr,
        activities: dayActivities,
        goals: dayGoals,
        reflection,
        dailySummaryNotes: reflection?.whatWentWell ? `Went Well: ${reflection.whatWentWell} | Priority: ${reflection.topPriorityTomorrow || "None"}` : undefined,
      };
    });

    generateCombinedMultiDayReportPDF({
      dateRangeLabel: rangeLabel,
      summaries,
      categories,
      userName: userEmail || (uid ? `User ${uid.slice(0, 8)}` : "APESFLOW Student"),
      autoPrint,
    });

    setIsExportModalOpen(false);
  };

  // UI Modals & Form States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isStartTimerModalOpen, setIsStartTimerModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields - Start Timer / Manual Activity
  const [activityTitle, setActivityTitle] = useState('');
  const [activityCatId, setActivityCatId] = useState('study');
  const [activityDate, setActivityDate] = useState(getTodayDateString());
  const [activityStartTime, setActivityStartTime] = useState('09:00');
  const [activityEndTime, setActivityEndTime] = useState('10:00');
  const [activityNotes, setActivityNotes] = useState('');
  const [activityTagsStr, setActivityTagsStr] = useState('');
  const [activityGoalId, setActivityGoalId] = useState('');

  // Form Fields - Category
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#3b82f6');
  const [catIcon, setCatIcon] = useState('📌');

  // Form Fields - Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState<'target_duration' | 'activity_count'>('target_duration');
  const [goalTargetVal, setGoalTargetVal] = useState(60);
  const [goalCatId, setGoalCatId] = useState('study');

  // Search & Filters in Activity Tracker
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCatId, setFilterCatId] = useState('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'timer' | 'manual'>('all');

  // Reflection Form State
  const currentReflection = reflectionsMap[selectedDate] || {
    date: selectedDate,
    userId: uid || 'guest',
    whatWentWell: '',
    whatToImprove: '',
    topPriorityTomorrow: '',
    additionalNotes: '',
    updatedAt: Date.now(),
  };

  const [reflectionForm, setReflectionForm] = useState<DailyReflection>(currentReflection);

  useEffect(() => {
    setReflectionForm(
      reflectionsMap[selectedDate] || {
        date: selectedDate,
        userId: uid || 'guest',
        whatWentWell: '',
        whatToImprove: '',
        topPriorityTomorrow: '',
        additionalNotes: '',
        updatedAt: Date.now(),
      }
    );
  }, [selectedDate, reflectionsMap, uid]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data on Mount & UID Change
  useEffect(() => {
    if (!isOpen) return;

    const loadAll = async () => {
      const effectiveUid = uid || 'guest_user_demo';
      try {
        const [acts, cats, gls, refs, tmr] = await Promise.all([
          loadUserActivityRecordsFromFirebase(effectiveUid),
          loadUserCategoriesFromFirebase(effectiveUid),
          loadUserGoalsFromFirebase(effectiveUid),
          loadUserReflectionsFromFirebase(effectiveUid),
          loadActiveTimerStateFromFirebase(effectiveUid),
        ]);

        setActivities(acts);
        setCategories(cats);
        setGoals(gls);
        setReflectionsMap(refs);
        setActiveTimer(tmr);
      } catch (err) {
        console.warn('[DayInReviewHub] Load error:', err);
      }
    };

    loadAll();
  }, [isOpen, uid]);

  // Timer Tick Effect
  useEffect(() => {
    if (activeTimer && !activeTimer.isPaused) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentStretch = now - activeTimer.startTimestamp;
        setLiveTimerMs(activeTimer.accumulatedMs + currentStretch);
      }, 1000);
    } else if (activeTimer && activeTimer.isPaused) {
      setLiveTimerMs(activeTimer.accumulatedMs);
    } else {
      setLiveTimerMs(0);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTimer]);

  if (!isOpen) return null;

  const effectiveUid = uid || 'guest_user_demo';
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Date Filtered Activities
  const dateActivities = activities.filter(a => a.date === selectedDate);

  // Quick Timer Actions
  const handleStartTimerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      showToast('Please enter an activity title');
      return;
    }

    if (activeTimer) {
      if (!window.confirm('You currently have an active activity timer running. Stop it and start this new activity?')) {
        return;
      }
      await handleStopTimer();
    }

    const newTimer: ActiveTimerState = {
      activityId: `timer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: effectiveUid,
      title: activityTitle.trim(),
      categoryId: activityCatId,
      goalId: activityGoalId || '',
      notes: activityNotes || '',
      tags: activityTagsStr ? activityTagsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      startTimestamp: Date.now(),
      accumulatedMs: 0,
      isPaused: false,
      date: getTodayDateString(),
      createdAt: Date.now(),
    };

    setActiveTimer(newTimer);
    await saveActiveTimerStateToFirebase(effectiveUid, newTimer);
    setIsStartTimerModalOpen(false);
    setActivityTitle('');
    setActivityNotes('');
    setActivityTagsStr('');
    showToast(`Timer started for "${newTimer.title}"`);
  };

  const handlePauseTimer = async () => {
    if (!activeTimer || activeTimer.isPaused) return;

    const now = Date.now();
    const additionalMs = now - activeTimer.startTimestamp;
    const updated: ActiveTimerState = {
      ...activeTimer,
      accumulatedMs: activeTimer.accumulatedMs + additionalMs,
      isPaused: true,
      lastPausedTimestamp: now,
    };

    setActiveTimer(updated);
    await saveActiveTimerStateToFirebase(effectiveUid, updated);
    showToast('Timer paused');
  };

  const handleResumeTimer = async () => {
    if (!activeTimer || !activeTimer.isPaused) return;

    const updated: ActiveTimerState = {
      ...activeTimer,
      startTimestamp: Date.now(),
      isPaused: false,
      lastPausedTimestamp: undefined,
    };

    setActiveTimer(updated);
    await saveActiveTimerStateToFirebase(effectiveUid, updated);
    showToast('Timer resumed');
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    const currentTimer = { ...activeTimer };
    setActiveTimer(null); // Clear timer immediately from UI so user feels instantaneous response

    const now = Date.now();
    const finalMs = currentTimer.isPaused
      ? currentTimer.accumulatedMs
      : currentTimer.accumulatedMs + (now - currentTimer.startTimestamp);

    const durationMins = Math.max(1, Math.round(finalMs / 60000));
    const startDate = new Date(currentTimer.createdAt);
    const startHH = String(startDate.getHours()).padStart(2, '0');
    const startMM = String(startDate.getMinutes()).padStart(2, '0');

    const endDate = new Date(now);
    const endHH = String(endDate.getHours()).padStart(2, '0');
    const endMM = String(endDate.getMinutes()).padStart(2, '0');

    const record: ActivityRecord = {
      id: currentTimer.activityId,
      userId: effectiveUid,
      title: currentTimer.title,
      categoryId: currentTimer.categoryId,
      date: currentTimer.date,
      startTime: `${startHH}:${startMM}`,
      endTime: `${endHH}:${endMM}`,
      startTimestamp: currentTimer.createdAt,
      endTimestamp: now,
      durationMinutes: durationMins,
      notes: currentTimer.notes || '',
      tags: currentTimer.tags || [],
      trackingMethod: 'timer',
      status: 'completed',
      goalId: currentTimer.goalId || '',
      createdAt: currentTimer.createdAt,
      updatedAt: now,
    };

    // Prepend record to activities list immediately
    setActivities(prev => [record, ...prev.filter(a => a.id !== record.id)]);
    showToast(`Stopped timer. Logged ${formatDurationMinutes(durationMins)} for "${record.title}"`);

    // Async save to cloud & clear active timer in Firebase
    try {
      await Promise.all([
        saveActivityRecordToFirebase(effectiveUid, record),
        saveActiveTimerStateToFirebase(effectiveUid, null),
      ]);
    } catch (err) {
      console.warn('Firebase save on stop timer error:', err);
    }
  };

  const handleCancelTimer = async () => {
    if (!activeTimer) return;
    if (!window.confirm('Discard active timer without saving?')) return;
    setActiveTimer(null);
    try {
      await saveActiveTimerStateToFirebase(effectiveUid, null);
    } catch {}
    showToast('Active timer discarded');
  };

  // Manual Activity Create / Edit
  const handleSaveManualActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      showToast('Please enter an activity title');
      return;
    }

    const [sH, sM] = activityStartTime.split(':').map(Number);
    const [eH, eM] = activityEndTime.split(':').map(Number);

    let startMs = new Date(`${activityDate}T${activityStartTime}:00`).getTime();
    let endMs = new Date(`${activityDate}T${activityEndTime}:00`).getTime();

    if (endMs <= startMs) {
      // Over midnight
      endMs += 24 * 60 * 60 * 1000;
    }

    const durationMins = Math.max(1, Math.round((endMs - startMs) / 60000));

    const record: ActivityRecord = {
      id: editingActivity ? editingActivity.id : `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: effectiveUid,
      title: activityTitle.trim(),
      categoryId: activityCatId,
      date: activityDate,
      startTime: activityStartTime,
      endTime: activityEndTime,
      startTimestamp: startMs,
      endTimestamp: endMs,
      durationMinutes: durationMins,
      notes: activityNotes || '',
      tags: activityTagsStr ? activityTagsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      trackingMethod: editingActivity ? editingActivity.trackingMethod : 'manual',
      status: 'completed',
      goalId: activityGoalId || '',
      createdAt: editingActivity ? editingActivity.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await saveActivityRecordToFirebase(effectiveUid, record);
    setActivities(prev => {
      const filtered = prev.filter(a => a.id !== record.id);
      return [record, ...filtered];
    });

    setIsManualModalOpen(false);
    setEditingActivity(null);
    setActivityTitle('');
    setActivityNotes('');
    setActivityTagsStr('');
    showToast(`Saved activity "${record.title}" (${formatDurationMinutes(durationMins)})`);
  };

  const handleEditActivityClick = (act: ActivityRecord) => {
    setEditingActivity(act);
    setActivityTitle(act.title);
    setActivityCatId(act.categoryId);
    setActivityDate(act.date);
    setActivityStartTime(act.startTime);
    setActivityEndTime(act.endTime);
    setActivityNotes(act.notes || '');
    setActivityTagsStr(act.tags ? act.tags.join(', ') : '');
    setActivityGoalId(act.goalId || '');
    setIsManualModalOpen(true);
  };

  const handleDeleteActivityConfirm = async () => {
    if (!deletingActivityId) return;
    await deleteActivityRecordFromFirebase(effectiveUid, deletingActivityId);
    setActivities(prev => prev.filter(a => a.id !== deletingActivityId));
    setDeletingActivityId(null);
    showToast('Activity deleted');
  };

  const handleDuplicateActivity = async (act: ActivityRecord) => {
    const dup: ActivityRecord = {
      ...act,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${act.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveActivityRecordToFirebase(effectiveUid, dup);
    setActivities(prev => [dup, ...prev]);
    showToast(`Duplicated "${act.title}"`);
  };

  // Create Category
  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const newCat: ActivityCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: catName.trim(),
      color: catColor,
      icon: catIcon || '📌',
      isCustom: true,
    };

    await saveCategoryToFirebase(effectiveUid, newCat);
    setCategories(prev => [...prev, newCat]);
    setIsCategoryModalOpen(false);
    setCatName('');
    showToast(`Category "${newCat.name}" created`);
  };

  // Create Goal
  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: DailyGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: effectiveUid,
      title: goalTitle.trim(),
      goalType,
      targetValue: goalTargetVal,
      categoryId: goalCatId,
      startDate: getTodayDateString(),
      enabled: true,
      createdAt: Date.now(),
    };

    await saveGoalToFirebase(effectiveUid, newGoal);
    setGoals(prev => [...prev, newGoal]);
    setIsGoalModalOpen(false);
    setGoalTitle('');
    showToast(`Goal "${newGoal.title}" created`);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Delete this daily goal?')) return;
    await deleteGoalFromFirebase(effectiveUid, goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showToast('Goal deleted');
  };

  // Save Reflection
  const handleSaveReflection = async () => {
    const payload: DailyReflection = {
      ...reflectionForm,
      date: selectedDate,
      userId: effectiveUid,
      updatedAt: Date.now(),
    };

    await saveReflectionToFirebase(effectiveUid, payload);
    setReflectionsMap(prev => ({ ...prev, [selectedDate]: payload }));
    showToast('Daily reflection saved');
  };

  // PDF Export Action
  const handleExportPDF = () => {
    generateDailyReportPDF({
      date: selectedDate,
      activities: dateActivities,
      categories,
      goals,
      reflection: reflectionsMap[selectedDate],
      userName: userEmail || 'APESFLOW Student',
    });
    showToast(`Generated PDF Report for ${selectedDate}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] py-3 px-5 rounded-2xl bg-cyan-500 text-black font-bold text-xs shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-3xl bg-[#0b1120] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-purple-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  APESFLOW FEATURE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MY DAY IN REVIEW
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                Daily Activity & Time Review
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Live Active Timer Pill */}
            {activeTimer && (
              <div className="hidden md:flex items-center gap-3 py-1.5 px-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{activeTimer.title}</span>
                <span className="text-white font-black">{formatTimerMs(liveTimerMs)}</span>
                <button
                  onClick={handleStopTimer}
                  className="p-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black cursor-pointer transition"
                  title="Stop Activity Timer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-white/10 bg-black/40 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tracker', label: 'Activity Tracker', icon: Clock },
            { id: 'timeline', label: '24h Timeline', icon: Layers },
            { id: 'goals', label: 'Daily Goals', icon: Target },
            { id: 'review', label: 'Review My Day', icon: FileText },
            { id: 'history', label: 'History', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'reports', label: 'PDF Reports', icon: Download },
            { id: 'categories', label: 'Categories', icon: Tag },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <DayDashboardView
              selectedDate={selectedDate}
              activities={activities}
              categories={categories}
              goals={goals}
              activeTimer={activeTimer}
              liveTimerMs={liveTimerMs}
              onStartActivityClick={() => setIsStartTimerModalOpen(true)}
              onAddManualClick={() => {
                setEditingActivity(null);
                setActivityTitle('');
                setActivityDate(selectedDate);
                setIsManualModalOpen(true);
              }}
              onStopTimerClick={handleStopTimer}
              onNavigateTab={tab => setActiveTab(tab as any)}
              onDownloadPDF={handleExportPDF}
              onDateChange={setSelectedDate}
            />
          )}

          {/* 2. ACTIVITY TRACKER VIEW */}
          {activeTab === 'tracker' && (
            <div className="space-y-6">
              {/* Active Timer Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>Live Activity Timer</span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Record real start & end timestamps accurately in real-time
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!activeTimer ? (
                      <button
                        onClick={() => setIsStartTimerModalOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start New Timer</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {activeTimer.isPaused ? (
                          <button
                            onClick={handleResumeTimer}
                            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Resume</span>
                          </button>
                        ) : (
                          <button
                            onClick={handlePauseTimer}
                            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause</span>
                          </button>
                        )}
                        <button
                          onClick={handleStopTimer}
                          className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span>Stop & Save</span>
                        </button>
                        <button
                          onClick={handleCancelTimer}
                          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                          title="Discard timer without saving"
                        >
                          <X className="w-4 h-4" />
                          <span>Discard</span>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setEditingActivity(null);
                        setActivityTitle('');
                        setActivityDate(selectedDate);
                        setIsManualModalOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-white/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Manually</span>
                    </button>
                  </div>
                </div>

                {activeTimer && (
                  <div className="p-4 rounded-2xl bg-black/50 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                          {categoryMap.get(activeTimer.categoryId)?.name || 'Activity'}
                        </span>
                        <h4 className="font-extrabold text-base text-white">{activeTimer.title}</h4>
                      </div>
                      {activeTimer.notes && (
                        <p className="text-xs text-white/50">{activeTimer.notes}</p>
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                      {formatTimerMs(liveTimerMs)}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterCatId}
                    onChange={e => setFilterCatId(e.target.value)}
                    className="bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterMethod}
                    onChange={e => setFilterMethod(e.target.value as any)}
                    className="bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Methods</option>
                    <option value="timer">Timer Only</option>
                    <option value="manual">Manual Entry Only</option>
                  </select>
                </div>
              </div>

              {/* Activity Records Table / Cards */}
              <div className="space-y-3">
                {dateActivities.filter(a => {
                  const matchSearch =
                    !searchQuery ||
                    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchCat = filterCatId === 'all' || a.categoryId === filterCatId;
                  const matchMethod = filterMethod === 'all' || a.trackingMethod === filterMethod;
                  return matchSearch && matchCat && matchMethod;
                }).length === 0 ? (
                  <div className="text-center py-16 space-y-3 text-white/40 bg-white/[0.02] rounded-3xl border border-white/10">
                    <Clock className="w-12 h-12 mx-auto text-white/20" />
                    <div className="text-sm font-semibold text-white/60">No activity records found for this date</div>
                    <p className="text-xs max-w-sm mx-auto">
                      Start an activity timer or add manual activity entries to populate your daily record history.
                    </p>
                  </div>
                ) : (
                  dateActivities
                    .filter(a => {
                      const matchSearch =
                        !searchQuery ||
                        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
                      const matchCat = filterCatId === 'all' || a.categoryId === filterCatId;
                      const matchMethod = filterMethod === 'all' || a.trackingMethod === filterMethod;
                      return matchSearch && matchCat && matchMethod;
                    })
                    .map(act => {
                      const cat = categoryMap.get(act.categoryId);
                      return (
                        <div
                          key={act.id}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                              style={{ backgroundColor: `${cat?.color || '#3b82f6'}20`, color: cat?.color || '#3b82f6' }}
                            >
                              {cat?.icon || '📌'}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-white">{act.title}</h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80">
                                  {cat?.name || 'Category'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                                  {act.trackingMethod === 'timer' ? '⏱️ Timer' : '✍️ Manual'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-white/50 font-mono">
                                <span>
                                  {formatTime24to12(act.startTime)} - {formatTime24to12(act.endTime)}
                                </span>
                                <span>•</span>
                                <span className="text-cyan-400 font-bold">
                                  {formatDurationMinutes(act.durationMinutes)}
                                </span>
                              </div>

                              {act.notes && (
                                <p className="text-xs text-white/60 italic leading-relaxed">{act.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => handleDuplicateActivity(act)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer"
                              title="Duplicate Activity"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditActivityClick(act)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                              title="Edit Activity"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingActivityId(act.id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* 3. DAILY TIMELINE VIEW */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <span>24-Hour Day Timeline Grid ({selectedDate})</span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Visual breakdown of activities across 24 hours (00:00 to 23:59)
                    </p>
                  </div>
                </div>

                {/* 24-Hour Hour Blocks */}
                <div className="space-y-2 pt-2">
                  {Array.from({ length: 24 }).map((_, hourIndex) => {
                    const hourStr = String(hourIndex).padStart(2, '0');
                    const hourLabel = formatTime24to12(`${hourStr}:00`);

                    // Find activities covering this hour
                    const hourActs = dateActivities.filter(a => {
                      const [sH] = a.startTime.split(':').map(Number);
                      const [eH] = a.endTime.split(':').map(Number);
                      return hourIndex >= sH && hourIndex <= eH;
                    });

                    return (
                      <div key={hourIndex} className="flex items-center gap-3 text-xs">
                        <div className="w-16 font-mono text-white/40 shrink-0 text-right">{hourLabel}</div>
                        <div className="flex-1 h-8 rounded-xl bg-white/[0.03] border border-white/10 p-1 flex items-center gap-1 overflow-hidden relative">
                          {hourActs.length === 0 ? (
                            <span className="text-[10px] text-white/20 pl-2">Untracked</span>
                          ) : (
                            hourActs.map(a => {
                              const cat = categoryMap.get(a.categoryId);
                              return (
                                <div
                                  key={a.id}
                                  className="h-full px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-white truncate"
                                  style={{
                                    backgroundColor: cat?.color || '#3b82f6',
                                    opacity: 0.85,
                                  }}
                                  title={`${a.title} (${a.startTime} - ${a.endTime})`}
                                >
                                  <span>{cat?.icon || '📌'}</span>
                                  <span className="truncate">{a.title}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. DAILY GOALS VIEW */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span>Daily Performance Goals</span>
                  </h3>
                  <p className="text-xs text-white/50">Set target hours or activity counts for each category</p>
                </div>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Daily Goal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-white/40 bg-white/[0.02] rounded-3xl border border-white/10">
                    No daily goals created yet. Click "Create Daily Goal" to set targets.
                  </div>
                ) : (
                  goals.map(g => {
                    const cat = categoryMap.get(g.categoryId || '');
                    const catLoggedMins = dateActivities
                      .filter(a => a.categoryId === g.categoryId)
                      .reduce((sum, a) => sum + (a.durationMinutes || 0), 0);

                    const progressPct =
                      g.goalType === 'target_duration'
                        ? Math.min(100, Math.round((catLoggedMins / g.targetValue) * 100))
                        : Math.min(100, Math.round((dateActivities.length / g.targetValue) * 100));

                    return (
                      <div key={g.id} className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                              {cat?.name || 'General Goal'}
                            </span>
                            <h4 className="font-extrabold text-base text-white">{g.title}</h4>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-white/60">
                              {g.goalType === 'target_duration'
                                ? `${formatDurationMinutes(catLoggedMins)} / ${formatDurationMinutes(g.targetValue)}`
                                : `${dateActivities.length} / ${g.targetValue} activities`}
                            </span>
                            <span className="font-bold text-cyan-300">{progressPct}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 5. REVIEW MY DAY VIEW */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <span>Daily Reflection & Summary ({selectedDate})</span>
                    </h3>
                    <p className="text-xs text-white/50">
                      Record achievements, improvement points, and priorities for tomorrow
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-purple-300 font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                      title="Generate and download a professional PDF report using jsPDF and jspdf-autotable"
                    >
                      <Download className="w-4 h-4 text-purple-300" />
                      <span>Download Daily PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveReflection}
                      className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Reflection</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                      🌟 What Went Well Today?
                    </label>
                    <textarea
                      rows={4}
                      value={reflectionForm.whatWentWell}
                      onChange={e => setReflectionForm({ ...reflectionForm, whatWentWell: e.target.value })}
                      placeholder="Highlights, completed tasks, good habits..."
                      className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-2xl p-3 outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      💡 What To Improve Tomorrow?
                    </label>
                    <textarea
                      rows={4}
                      value={reflectionForm.whatToImprove}
                      onChange={e => setReflectionForm({ ...reflectionForm, whatToImprove: e.target.value })}
                      placeholder="Distractions to avoid, time gaps to fix..."
                      className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-2xl p-3 outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                      🎯 Top Priorities For Tomorrow
                    </label>
                    <textarea
                      rows={3}
                      value={reflectionForm.topPriorityTomorrow}
                      onChange={e => setReflectionForm({ ...reflectionForm, topPriorityTomorrow: e.target.value })}
                      placeholder="Top 3 essential tasks or focus sessions..."
                      className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-2xl p-3 outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                      📝 Additional Daily Notes
                    </label>
                    <textarea
                      rows={3}
                      value={reflectionForm.additionalNotes}
                      onChange={e => setReflectionForm({ ...reflectionForm, additionalNotes: e.target.value })}
                      placeholder="General journal thoughts or energy levels..."
                      className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-2xl p-3 outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. HISTORY VIEW */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Historical Activity Log Calendar</span>
                  </h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="bg-black/50 border border-white/10 text-cyan-300 font-mono text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                  />
                </div>

                <p className="text-xs text-white/50">
                  Select a historical date to view recorded activities, goals, and reflections.
                </p>
              </div>
            </div>
          )}

          {/* 7. ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span>Category Distribution & Statistics ({selectedDate})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map(cat => {
                    const catMins = dateActivities
                      .filter(a => a.categoryId === cat.id)
                      .reduce((sum, a) => sum + (a.durationMinutes || 0), 0);

                    if (catMins === 0) return null;

                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 flex items-center gap-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white/70">{cat.name}</div>
                          <div className="text-lg font-black text-cyan-300 font-mono">
                            {formatDurationMinutes(catMins)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 8. PDF REPORTS VIEW */}
          {activeTab === 'reports' && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/30 text-center space-y-6">
              <Download className="w-12 h-12 text-cyan-400 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-white">Daily PDF Performance Reports</h3>
                <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed mt-1">
                  Export single-day reports or generate ONE combined multi-day PDF report for all daily summaries in chronological order.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleExportPDF}
                  className="py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Selected Day ({selectedDate})</span>
                </button>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <FileText className="w-4 h-4" />
                  <span>EXPORT ALL DAILY SUMMARIES (MULTI-DAY)</span>
                </button>

                <button
                  onClick={() => handleExportCombinedMultiDayPDF(true)}
                  className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          )}


          {/* 9. CATEGORIES VIEW */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-400" />
                    <span>Activity Categories</span>
                  </h3>
                  <p className="text-xs text-white/50">Custom colors & icons for activity tagging</p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map(c => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${c.color}25`, color: c.color }}
                    >
                      {c.icon}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate">{c.name}</div>
                      <div className="text-[10px] text-white/40 font-mono">{c.color}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-cyan-400" />
                <span>Day In Review Preferences</span>
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Configure default activity categories, preferred review times, and notification settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* START TIMER MODAL */}
      {isStartTimerModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1120] border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-current" />
                <span>Start Activity Timer</span>
              </h3>
              <button
                onClick={() => setIsStartTimerModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartTimerSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solving Physics Problems, Coding React App..."
                  value={activityTitle}
                  onChange={e => setActivityTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Category</label>
                <select
                  value={activityCatId}
                  onChange={e => setActivityCatId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={activityNotes}
                  onChange={e => setActivityNotes(e.target.value)}
                  placeholder="Brief notes..."
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Timer Now</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ENTRY MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1120] border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>{editingActivity ? 'Edit Activity Record' : 'Add Manual Activity'}</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualActivity} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="Activity name..."
                  value={activityTitle}
                  onChange={e => setActivityTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Category</label>
                  <select
                    value={activityCatId}
                    onChange={e => setActivityCatId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Date</label>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={e => setActivityDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-cyan-300 font-mono text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Start Time</label>
                  <input
                    type="time"
                    value={activityStartTime}
                    onChange={e => setActivityStartTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">End Time</label>
                  <input
                    type="time"
                    value={activityEndTime}
                    onChange={e => setActivityEndTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={activityNotes}
                  onChange={e => setActivityNotes(e.target.value)}
                  placeholder="Notes..."
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer"
              >
                Save Activity Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0b1120] border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>New Activity Category</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Music Practice, Gardening..."
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Icon Emoji</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={catIcon}
                    onChange={e => setCatIcon(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white text-center text-base rounded-xl p-2.5 outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Color</label>
                  <input
                    type="color"
                    value={catColor}
                    onChange={e => setCatColor(e.target.value)}
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-xl p-1 cursor-pointer outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0b1120] border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Create Daily Goal</span>
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study 2 Hours Daily"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Category</label>
                <select
                  value={goalCatId}
                  onChange={e => setGoalCatId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Goal Type</label>
                  <select
                    value={goalType}
                    onChange={e => setGoalType(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                  >
                    <option value="target_duration">Duration (Mins)</option>
                    <option value="activity_count">Activity Count</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70">Target Value</label>
                  <input
                    type="number"
                    min={1}
                    value={goalTargetVal}
                    onChange={e => setGoalTargetVal(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingActivityId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0b1120] border border-rose-500/30 space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Activity Record?</h3>
            <p className="text-xs text-white/60">
              Are you sure you want to delete this activity record? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingActivityId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteActivityConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MULTI-DAY COMBINED PDF EXPORT MODAL ================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0b1120] border border-cyan-500/40 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">EXPORT ALL DAILY SUMMARIES</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Select a date range to generate ONE combined downloadable PDF containing every selected daily summary in chronological order.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-cyan-300 block">Select Date Range Preset:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "today", label: "Today Only" },
                  { id: "last7", label: "Last 7 Days" },
                  { id: "last14", label: "Last 14 Days" },
                  { id: "last30", label: "Last 30 Days" },
                  { id: "thisMonth", label: "This Month" },
                  { id: "all", label: "All Available History" },
                  { id: "custom", label: "Custom Date Range" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExportRangeType(opt.id as any)}
                    className={`p-3 rounded-xl border text-left font-semibold transition cursor-pointer ${
                      exportRangeType === opt.id
                        ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {exportRangeType === "custom" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customExportStart}
                    onChange={e => setCustomExportStart(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-cyan-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={customExportEnd}
                    onChange={e => setCustomExportEnd(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-cyan-300"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleExportCombinedMultiDayPDF(false)}
                className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Combined PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportCombinedMultiDayPDF(true)}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Print Report"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DayInReviewHubModal;
