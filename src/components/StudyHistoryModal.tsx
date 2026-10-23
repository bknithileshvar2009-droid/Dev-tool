/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  Download,
  Printer,
  Flame,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import {
  FocusSessionRecord,
  splitSessionByLocalCalendarDays,
  getLocalDateString,
} from '../utils/firebase';
import { exportStudyHistoryToPDF, formatTotalDurationHours } from '../utils/PdfExporter';

interface StudyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: FocusSessionRecord[];
  userName?: string;
  uid?: string | null;
}

type DateRangeOption =
  | 'today'
  | 'last7'
  | 'last14'
  | 'last30'
  | 'thisMonth'
  | 'all'
  | 'custom';

export default function StudyHistoryModal({
  isOpen,
  onClose,
  sessions = [],
  userName = 'BK NITHILESHVAR',
  uid,
}: StudyHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'interrupted'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => getLocalDateString());
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Calculate Timestamps for Filtering
  const now = new Date();
  const todayStr = getLocalDateString(now);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = startOfToday - 13 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // 2. Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sStart = session.startTimestamp || (session.createdAt ? new Date(session.createdAt).getTime() : 0);

      // Date Range Filter
      if (dateRange === 'today') {
        if (sStart < startOfToday || sStart > endOfToday) return false;
      } else if (dateRange === 'last7') {
        if (sStart < sevenDaysAgo) return false;
      } else if (dateRange === 'last14') {
        if (sStart < fourteenDaysAgo) return false;
      } else if (dateRange === 'last30') {
        if (sStart < thirtyDaysAgo) return false;
      } else if (dateRange === 'thisMonth') {
        if (sStart < startOfThisMonth) return false;
      } else if (dateRange === 'custom') {
        const startCustomMs = new Date(customStartDate + 'T00:00:00').getTime();
        const endCustomMs = new Date(customEndDate + 'T23:59:59').getTime();
        if (sStart < startCustomMs || sStart > endCustomMs) return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        if ((session.status || 'completed') !== statusFilter) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const sub = (session.subject || '').toLowerCase();
        const task = (session.task || '').toLowerCase();
        const goal = (session.goal || '').toLowerCase();
        const id = (session.sessionId || '').toLowerCase();
        if (!sub.includes(q) && !task.includes(q) && !goal.includes(q) && !id.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    sessions,
    dateRange,
    statusFilter,
    searchTerm,
    startOfToday,
    endOfToday,
    sevenDaysAgo,
    fourteenDaysAgo,
    thirtyDaysAgo,
    startOfThisMonth,
    customStartDate,
    customEndDate,
  ]);

  // 3. Aggregate Metrics with Midnight Spans Attribution
  const metrics = useMemo(() => {
    let todayMinutes = 0;
    let todaySessionCount = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;
    let totalAllMinutes = 0;
    const dailyMap: Record<string, { activeMinutes: number; sessionCount: number }> = {};

    sessions.forEach(s => {
      const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : 0);
      const sEnd = s.endTimestamp || (sStart + (s.actualElapsedMinutes || 0) * 60000);
      const activeSec = (s.actualElapsedMinutes || Math.round((sEnd - sStart) / 60000)) * 60;
      const activeMins = Math.round(activeSec / 60);

      totalAllMinutes += activeMins;

      // Midnight split calculation
      const split = splitSessionByLocalCalendarDays(sStart, sEnd, activeSec);
      Object.entries(split).forEach(([dayKey, sliceSec]) => {
        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = { activeMinutes: 0, sessionCount: 0 };
        }
        dailyMap[dayKey].activeMinutes += Math.round(sliceSec / 60);
      });

      const startDayKey = getLocalDateString(new Date(sStart));
      if (dailyMap[startDayKey]) {
        dailyMap[startDayKey].sessionCount += 1;
      }

      if (sStart >= startOfToday && sStart <= endOfToday) {
        todayMinutes += activeMins;
        todaySessionCount += 1;
      }
      if (sStart >= sevenDaysAgo) {
        weekMinutes += activeMins;
      }
      if (sStart >= thirtyDaysAgo) {
        monthMinutes += activeMins;
      }
    });

    const sortedDays = Object.entries(dailyMap).sort((a, b) => b[0].localeCompare(a[0]));

    return {
      todayMinutes,
      todaySessionCount,
      weekMinutes,
      monthMinutes,
      totalAllMinutes,
      totalSessions: sessions.length,
      sortedDays,
    };
  }, [sessions, startOfToday, endOfToday, sevenDaysAgo, thirtyDaysAgo]);

  const rangeDisplayLabel = useMemo(() => {
    switch (dateRange) {
      case 'today':
        return 'Today';
      case 'last7':
        return 'Last 7 Days';
      case 'last14':
        return 'Last 14 Days';
      case 'last30':
        return 'Last 30 Days';
      case 'thisMonth':
        return 'This Month';
      case 'custom':
        return `${customStartDate} to ${customEndDate}`;
      case 'all':
      default:
        return 'All Available History';
    }
  }, [dateRange, customStartDate, customEndDate]);

  const handleExportPDF = (isPrint: boolean = false, forceAll: boolean = false) => {
    const sessionsToExport =
      forceAll || dateRange === 'all' ? sessions : filteredSessions;

    exportStudyHistoryToPDF({
      sessions: sessionsToExport,
      rangeLabel: forceAll ? 'Complete All-History Archive' : rangeDisplayLabel,
      userName: userName || 'BK NITHILESHVAR',
      isPrint,
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] rounded-3xl bg-[#0b1120] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-[#0b1120] to-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Study Session History & Analytics
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  {sessions.length} Recorded
                </span>
              </div>
              <p className="text-xs text-white/50">
                Permanent records stored under Firebase UID • Student: {userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportPDF(false, false)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95"
              title="Download PDF report for the selected date range"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportPDF(false, true)}
              className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Download complete all-time study history PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">All History PDF</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await import('../utils/firebase').then(m => (m as any).seedFourHourStudySession(uid || 'bk_nithileshvar_master'));
                setSeedNotice(ok ? 'Oct 22 (4h) synced to Firebase' : 'Saved locally');
                setTimeout(() => setSeedNotice(null), 3500);
              }}
              className="py-2 px-3 sm:px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs transition cursor-pointer"
            >
              <span>{seedNotice || 'Seed Oct 22'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Print study history report directly"
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline">Print View</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider">
              Today's Study Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono mt-0.5">
              {formatTotalDurationHours(metrics.todayMinutes)}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              {metrics.todaySessionCount} session{metrics.todaySessionCount !== 1 ? 's' : ''} today
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider">
              Last 7 Days Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5">
              {formatTotalDurationHours(metrics.weekMinutes)}
            </div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">
              Rolling 7-day volume
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider">
              Last 30 Days Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">
              {formatTotalDurationHours(metrics.monthMinutes)}
            </div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">
              Rolling 30-day volume
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider">
              All-Time Study Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono mt-0.5">
              {formatTotalDurationHours(metrics.totalAllMinutes)}
            </div>
            <div className="text-[10px] text-purple-400 font-mono mt-0.5">
              Across {metrics.totalSessions} sessions
            </div>
          </div>
        </div>

        {/* Date Filters & Range Toolbar */}
        <div className="p-4 px-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40 text-xs">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filter study sessions by ID or notes..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Date Range Options */}
            <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-xl p-0.5 overflow-x-auto text-[11px]">
              {[
                { id: 'today', label: 'Today' },
                { id: 'last7', label: '7 Days' },
                { id: 'last14', label: '14 Days' },
                { id: 'last30', label: '30 Days' },
                { id: 'thisMonth', label: 'This Month' },
                { id: 'all', label: 'All History' },
                { id: 'custom', label: 'Custom' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDateRange(opt.id as DateRangeOption)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                    dateRange === opt.id
                      ? 'bg-cyan-500 text-black font-bold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-black/50 border border-white/10 text-cyan-300 font-mono text-xs rounded-xl px-2.5 py-1.5 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="interrupted">Interrupted Only</option>
            </select>
          </div>

          {/* Custom Date Inputs (when 'custom' selected) */}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 pt-1 sm:pt-0 w-full sm:w-auto">
              <span className="text-[10px] text-white/50 font-mono uppercase">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
              />
              <span className="text-[10px] text-white/50 font-mono uppercase">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
              />
            </div>
          )}
        </div>

        {/* Sessions Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-2xl">
                ⏳
              </div>
              <h4 className="text-base font-bold text-white">No study sessions found</h4>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                No study records match your selected range ({rangeDisplayLabel}). Start a session with the Study Time Tracker widget on your dashboard to record hours!
              </p>
            </div>
          ) : (
            filteredSessions.map((s, idx) => {
              const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : 0);
              const sEnd = s.endTimestamp || (sStart + (s.actualElapsedMinutes || 0) * 60000);
              const activeMins = s.actualElapsedMinutes || Math.round((sEnd - sStart) / 60000);
              const dateStr = new Date(sStart).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const startTimeStr = new Date(sStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTimeStr = s.endTimestamp ? new Date(s.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active';

              return (
                <div
                  key={s.sessionId || idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {s.subject || 'General Study'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          (s.status || 'completed') === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {s.status || 'completed'}
                      </span>
                      {s.totalBreakMinutes && s.totalBreakMinutes > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[9px] font-mono">
                          ❚❚ {s.totalBreakMinutes}m paused
                        </span>
                      ) : null}
                    </div>

                    <div className="text-white/60 text-[11px] font-mono flex items-center gap-2 flex-wrap">
                      <span>📅 {dateStr}</span>
                      <span>⏰ {startTimeStr} → {endTimeStr}</span>
                      <span className="text-white/30">ID: {s.sessionId.replace(/^study_/, '').slice(0, 10)}</span>
                    </div>

                    {s.goal && (
                      <p className="text-[11px] text-amber-300/80 italic mt-0.5">
                        Notes: {s.goal}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <div>
                      <span className="text-base sm:text-lg font-black text-cyan-300 font-mono">
                        {formatTotalDurationHours(activeMins)}
                      </span>
                      <span className="text-[10px] text-white/40 block font-mono">
                        active study duration
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/50">
          <span className="font-mono text-[11px]">
            Showing {filteredSessions.length} of {sessions.length} sessions ({rangeDisplayLabel})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
