import React, { useState, useMemo } from 'react';
import {
  Flame,
  X,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Maximize2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { FocusSessionRecord } from '../utils/firebase';

interface FocusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: FocusSessionRecord[];
  activeStreak: number;
}

export default function FocusHistoryModal({
  isOpen,
  onClose,
  sessions = [],
  activeStreak = 0,
}: FocusHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'interrupted'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  if (!isOpen) return null;

  // Filter sessions by search, subject, status, and date range
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;

    return sessions.filter(session => {
      // Date filter
      const sessionTime = session.startTimestamp || new Date(session.createdAt || 0).getTime();
      if (dateRange === 'today' && sessionTime < startOfToday) return false;
      if (dateRange === 'week' && sessionTime < sevenDaysAgo) return false;
      if (dateRange === 'month' && sessionTime < thirtyDaysAgo) return false;

      // Status filter
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;

      // Subject filter
      if (selectedSubject !== 'all' && session.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSubject = session.subject?.toLowerCase().includes(query);
        const matchesTask = session.task?.toLowerCase().includes(query);
        const matchesGoal = session.goal?.toLowerCase().includes(query);
        const matchesReflection = session.userReflection?.toLowerCase().includes(query);
        if (!matchesSubject && !matchesTask && !matchesGoal && !matchesReflection) return false;
      }

      return true;
    });
  }, [sessions, searchTerm, selectedSubject, statusFilter, dateRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;

    let todayMinutes = 0;
    let weekMinutes = 0;
    let completedCount = 0;
    let totalBreaks = 0;
    let totalBreakMinutes = 0;
    let totalFullscreenExits = 0;

    const subjectMap: Record<string, number> = {};
    const dailyTrendMap: Record<string, number> = {};

    // Initialize past 7 days for trend map
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyTrendMap[key] = 0;
    }

    sessions.forEach(s => {
      const sTime = s.startTimestamp || new Date(s.createdAt || 0).getTime();
      const elapsed = s.actualElapsedMinutes || s.plannedDurationMinutes || 0;

      if (s.status === 'completed') {
        completedCount++;
      }

      totalBreaks += s.approvedBreaksCount || 0;
      totalBreakMinutes += s.totalBreakMinutes || (s.approvedBreaksCount ? s.approvedBreaksCount * 5 : 0);
      totalFullscreenExits += s.fullscreenExitsCount || 0;

      if (sTime >= startOfToday) {
        todayMinutes += elapsed;
      }
      if (sTime >= sevenDaysAgo) {
        weekMinutes += elapsed;
      }

      // Subject map
      const sub = s.subject || 'General Study';
      subjectMap[sub] = (subjectMap[sub] || 0) + elapsed;

      // Daily trend map (past 7 days)
      const dayKey = new Date(sTime).toISOString().slice(0, 10);
      if (dailyTrendMap[dayKey] !== undefined) {
        dailyTrendMap[dayKey] += elapsed;
      }
    });

    const completionRate = sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 100;

    // Subjects sorted by study time
    const sortedSubjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);

    return {
      todayMinutes,
      weekMinutes,
      completedCount,
      totalSessions: sessions.length,
      completionRate,
      totalBreaks,
      totalBreakMinutes,
      totalFullscreenExits,
      sortedSubjects,
      dailyTrends: Object.entries(dailyTrendMap).map(([date, mins]) => ({
        date,
        dayLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: mins,
      })),
    };
  }, [sessions]);

  // Unique list of subjects for filter dropdown
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      if (s.subject?.trim()) set.add(s.subject.trim());
    });
    return Array.from(set);
  }, [sessions]);

  const maxTrendMin = Math.max(30, ...metrics.dailyTrends.map(t => t.minutes));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#080d19] border border-amber-500/30 p-5 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col text-white animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Focus History & Study Analytics
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  FIREBASE CLOUD SYNCED
                </span>
              </div>
              <p className="text-xs text-white/50">
                Authoritative chronological record of deep focus sprints, goals, breaks, and session discipline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-4">
          {/* Top KPI Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Today Study Time */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
                <span>Today's Study</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 mt-2 tabular-digits font-mono">
                {Math.floor(metrics.todayMinutes / 60)}h {metrics.todayMinutes % 60}m
              </div>
              <span className="text-[10px] text-white/40 mt-1">Deep focus today</span>
            </div>

            {/* 2. Weekly Study Time */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
                <span>Weekly Study</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-2 tabular-digits font-mono">
                {Math.floor(metrics.weekMinutes / 60)}h {metrics.weekMinutes % 60}m
              </div>
              <span className="text-[10px] text-white/40 mt-1">Last 7 days cumulative</span>
            </div>

            {/* 3. Completed Sessions & Completion Rate */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
                <span>Sessions & Rate</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-300 tabular-digits font-mono">
                  {metrics.completedCount}
                </span>
                <span className="text-xs text-white/60 font-semibold">
                  / {metrics.totalSessions} ({metrics.completionRate}%)
                </span>
              </div>
              <span className="text-[10px] text-white/40 mt-1">Discipline adherence</span>
            </div>

            {/* 4. Verified Breaks & Streak */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
                <span>Breaks & Streak</span>
                <Award className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-rose-300 tabular-digits font-mono">
                  {metrics.totalBreaks}
                </span>
                <span className="text-xs text-white/60 font-semibold">
                  ({metrics.totalBreakMinutes}m) • 🔥 {activeStreak}
                </span>
              </div>
              <span className="text-[10px] text-white/40 mt-1">Brevo verified recovery</span>
            </div>
          </div>

          {/* Weekly Daily Trends Bar Chart */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  7-Day Study Distribution Trend
                </span>
              </div>
              <span className="text-[11px] text-white/50">
                Peak day: {Math.max(...metrics.dailyTrends.map(t => t.minutes))} mins
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-3 px-1">
              {metrics.dailyTrends.map(day => {
                const heightPercent = maxTrendMin > 0 ? Math.round((day.minutes / maxTrendMin) * 100) : 0;
                const isToday = day.date === new Date().toISOString().slice(0, 10);

                return (
                  <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono font-semibold text-white/60 opacity-0 group-hover:opacity-100 transition">
                      {day.minutes}m
                    </span>
                    <div className="w-full max-w-[34px] bg-white/5 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : day.minutes > 0
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                            : 'bg-white/10'
                        }`}
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isToday ? 'text-amber-300' : 'text-white/50'}`}>
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject-Wise Study Totals */}
          {metrics.sortedSubjects.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Subject-Wise Breakdown
                  </span>
                </div>
                <span className="text-[11px] text-white/50 font-mono">
                  {metrics.sortedSubjects.length} subjects logged
                </span>
              </div>

              <div className="space-y-2.5">
                {metrics.sortedSubjects.map(([subject, mins]) => {
                  const percentOfTotal = metrics.weekMinutes > 0 ? Math.round((mins / metrics.weekMinutes) * 100) : 100;
                  return (
                    <div key={subject} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-white font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>{subject}</span>
                        </span>
                        <span className="font-mono text-white/70">
                          {Math.floor(mins / 60)}h {mins % 60}m ({percentOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, percentOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject, task, goal, reflection..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Subject Dropdown */}
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none cursor-pointer focus:border-amber-400"
              >
                <option value="all">All Subjects</option>
                {allSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none cursor-pointer focus:border-amber-400"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed Only</option>
                <option value="interrupted">Interrupted / Early Exit</option>
              </select>

              {/* Date Filter */}
              <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px] font-medium">
                {(['all', 'today', 'week', 'month'] as const).map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDateRange(range)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                      dateRange === range
                        ? 'bg-amber-500 text-black font-bold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session Cards List */}
          <div className="space-y-2.5">
            {filteredSessions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-white/50">
                <Flame className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white/80">No focus sessions found</p>
                <p className="text-xs text-white/40 mt-1">
                  Start a Deep Focus Session using the Focus Mode button on your dashboard to log study history!
                </p>
              </div>
            ) : (
              filteredSessions.map(session => {
                const dateStr = new Date(session.startTimestamp || session.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={session.sessionId}
                    className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{session.subject || 'General Study'}</span>
                        <span className="text-white/40 text-[10px]">•</span>
                        <span className="text-xs text-white/80">{session.task || 'Focus Session'}</span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                            session.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>

                      {session.goal && (
                        <div className="text-[11px] text-amber-300/80 flex items-center gap-1">
                          <span>🎯 Target Goal:</span>
                          <span className="italic">{session.goal}</span>
                        </div>
                      )}

                      {session.userReflection && (
                        <div className="text-[11px] text-white/60 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                          💬 "{session.userReflection}"
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-white/40 pt-0.5 flex-wrap">
                        <span>📅 {dateStr}</span>
                        {session.fullscreenExitsCount > 0 && (
                          <span className="text-amber-400/90">
                            ⚡ {session.fullscreenExitsCount} fullscreen exit{session.fullscreenExitsCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {session.approvedBreaksCount > 0 && (
                          <span className="text-cyan-400">
                            ☕ {session.approvedBreaksCount} break ({session.totalBreakMinutes || session.approvedBreaksCount * 5}m)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      <span className="text-lg font-mono font-bold text-white tabular-digits">
                        {session.actualElapsedMinutes || session.plannedDurationMinutes}m
                      </span>
                      <span className="text-[10px] text-white/40">
                        Planned {session.plannedDurationMinutes}m
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span className="font-mono text-[11px]">
            Showing {filteredSessions.length} of {sessions.length} records • Private to your authenticated Firebase UID
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
