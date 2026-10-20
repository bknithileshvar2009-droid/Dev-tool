/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Square,
  Plus,
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PieChart,
  Sparkles,
} from 'lucide-react';
import {
  ActivityRecord,
  ActivityCategory,
  DailyGoal,
  ActiveTimerState,
  formatDurationMinutes,
  formatTimerMs,
  calculateUniqueLoggedMinutes,
  detectOverlappingActivities,
} from '../../utils/dayInReviewTypes';

export interface DayDashboardViewProps {
  selectedDate: string;
  activities: ActivityRecord[];
  categories: ActivityCategory[];
  goals: DailyGoal[];
  activeTimer: ActiveTimerState | null;
  liveTimerMs: number;
  onStartActivityClick: () => void;
  onAddManualClick: () => void;
  onStopTimerClick: () => void;
  onNavigateTab: (tab: string) => void;
  onDownloadPDF: () => void;
  onDateChange: (date: string) => void;
}

export const DayDashboardView: React.FC<DayDashboardViewProps> = ({
  selectedDate,
  activities,
  categories,
  goals,
  activeTimer,
  liveTimerMs,
  onStartActivityClick,
  onAddManualClick,
  onStopTimerClick,
  onNavigateTab,
  onDownloadPDF,
  onDateChange,
}) => {
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Calculate Metrics for selected date
  const dateActivities = activities.filter(a => a.date === selectedDate);
  let totalMins = 0;
  let timerMins = 0;
  let manualMins = 0;

  const catMinsMap = new Map<string, number>();

  dateActivities.forEach(a => {
    const mins = a.durationMinutes || 0;
    totalMins += mins;
    if (a.trackingMethod === 'timer') {
      timerMins += mins;
    } else {
      manualMins += mins;
    }

    catMinsMap.set(a.categoryId, (catMinsMap.get(a.categoryId) || 0) + mins);
  });

  const uniqueMins = calculateUniqueLoggedMinutes(dateActivities);
  const overlaps = detectOverlappingActivities(dateActivities);

  // Most time-consuming category
  let topCatId: string | null = null;
  let topCatMins = 0;
  catMinsMap.forEach((mins, catId) => {
    if (mins > topCatMins) {
      topCatMins = mins;
      topCatId = catId;
    }
  });

  const topCategory = topCatId ? categoryMap.get(topCatId) : null;

  // Goals progress
  const enabledGoals = goals.filter(g => g.enabled);
  let completedGoalsCount = 0;
  enabledGoals.forEach(g => {
    if (g.goalType === 'target_duration' && g.categoryId) {
      const logged = catMinsMap.get(g.categoryId) || 0;
      if (logged >= g.targetValue) completedGoalsCount++;
    } else if (g.goalType === 'activity_count') {
      if (dateActivities.length >= g.targetValue) completedGoalsCount++;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Date Header & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                Selected Date
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="bg-black/50 border border-white/10 text-cyan-300 font-mono text-xs rounded-lg px-2 py-0.5 outline-none focus:border-cyan-400"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h2>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onStartActivityClick}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)] transition cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Activity Timer</span>
          </button>
          <button
            type="button"
            onClick={onAddManualClick}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Record</span>
          </button>
          <button
            type="button"
            onClick={onDownloadPDF}
            className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 transition cursor-pointer flex items-center gap-1.5"
            title="Download Daily PDF Report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Currently Running Activity Banner (If Active) */}
      {activeTimer && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-purple-950/80 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 text-2xl animate-pulse">
              ⏱️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-400/30">
                  {activeTimer.isPaused ? 'TIMER PAUSED' : 'LIVE TRACKING'}
                </span>
                <span className="text-xs text-white/60 font-medium">
                  {categoryMap.get(activeTimer.categoryId)?.name || 'General Activity'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeTimer.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center font-mono font-black text-3xl sm:text-4xl tracking-wider text-cyan-300 drop-shadow-md">
              {formatTimerMs(liveTimerMs)}
            </div>

            <button
              type="button"
              onClick={onStopTimerClick}
              className="py-3 px-5 rounded-2xl font-black text-xs bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] transition cursor-pointer flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop & Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Duration */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px]">Total Activity Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatDurationMinutes(totalMins)}
          </div>
          <p className="text-[11px] text-white/50">
            {dateActivities.length} recorded activity {dateActivities.length === 1 ? 'record' : 'records'}
          </p>
        </div>

        {/* Card 2: Unique Logged Time */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px]">Unique Logged Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {formatDurationMinutes(uniqueMins)}
          </div>
          <p className="text-[11px] text-emerald-300/80">
            {Math.round((uniqueMins / (24 * 60)) * 100)}% of 24h day covered
          </p>
        </div>

        {/* Card 3: Top Category */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px]">Top Category</span>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white truncate flex items-center gap-1.5">
            <span>{topCategory?.icon || '📌'}</span>
            <span className="truncate">{topCategory?.name || 'None'}</span>
          </div>
          <p className="text-[11px] text-amber-300/80 font-mono font-bold">
            {topCategory ? formatDurationMinutes(topCatMins) : '0m logged'}
          </p>
        </div>

        {/* Card 4: Daily Goals Progress */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px]">Daily Goals</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-tight">
            {completedGoalsCount}/{enabledGoals.length}
          </div>
          <p className="text-[11px] text-purple-200/80">
            {enabledGoals.length > 0 ? `${Math.round((completedGoalsCount / enabledGoals.length) * 100)}% Goals Achieved` : 'No goals configured'}
          </p>
        </div>
      </div>

      {/* Warnings Bar (If Overlaps Exist) */}
      {overlaps.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Overlapping Schedule Detected</span>
            <span>
              {overlaps.length} {overlaps.length === 1 ? 'activity pair overlaps' : 'activity pairs overlap'} in time. Unique logged time filters out double-counted minutes automatically.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('timeline')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-[11px] transition cursor-pointer hover:bg-amber-400 shrink-0"
          >
            View Timeline
          </button>
        </div>
      )}

      {/* Main Content Grid: Recent Activity Stream & Navigation Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Stream for Selected Date */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Recorded Activities</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-mono">
                {dateActivities.length}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('tracker')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              + Add / Track New →
            </button>
          </div>

          {dateActivities.length === 0 ? (
            <div className="py-16 px-6 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-white/50 space-y-3">
              <div className="text-4xl">📝</div>
              <h4 className="text-sm font-bold text-white">No Activities Recorded For This Date</h4>
              <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                Start an activity timer or manually record study, work, exercise, sleep, or personal tasks to see your daily review statistics.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onStartActivityClick}
                  className="py-2 px-4 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition cursor-pointer"
                >
                  Start Live Timer
                </button>
                <button
                  type="button"
                  onClick={onAddManualClick}
                  className="py-2 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  Add Manual Record
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dateActivities.map(act => {
                const cat = categoryMap.get(act.categoryId);
                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                        style={{
                          backgroundColor: `${cat?.color || '#3b82f6'}20`,
                          borderColor: `${cat?.color || '#3b82f6'}40`,
                        }}
                      >
                        {cat?.icon || '📌'}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-sm">{act.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                          <span className="text-cyan-300 font-medium">{cat?.name || 'Other'}</span>
                          <span>•</span>
                          <span>{act.startTime && act.endTime ? `${act.startTime} - ${act.endTime}` : 'Manual Entry'}</span>
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-white/70 uppercase">
                            {act.trackingMethod}
                          </span>
                        </div>
                        {act.notes && (
                          <p className="text-[11px] text-white/70 line-clamp-1 pt-0.5">{act.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-amber-400 font-mono block">
                        {formatDurationMinutes(act.durationMinutes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Access Submenu Shortcuts */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>My Day Sections</span>
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {[
              { id: 'timeline', name: '24-Hour Visual Timeline', desc: 'Midnight-to-midnight visual schedule & gaps', icon: '⏱️' },
              { id: 'review', name: 'Review My Day & Reflections', desc: 'Daily summary, takeaways & reflections', icon: '📋' },
              { id: 'goals', name: 'Daily Personal Goals', desc: 'Target study, exercise or habit limits', icon: '🎯' },
              { id: 'history', name: 'Weekly & Monthly History', desc: 'Calendar history & date picker search', icon: '📅' },
              { id: 'analytics', name: 'Analytics & Category Trends', desc: 'Detailed percentage charts & stats', icon: '📊' },
              { id: 'reports', name: 'PDF Reports & Download', desc: 'Download professional daily reports', icon: '📄' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateTab(item.id)}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition cursor-pointer flex items-center gap-3 group"
              >
                <div className="text-2xl group-hover:scale-110 transition">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white group-hover:text-cyan-300 transition truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-white/50 truncate">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
