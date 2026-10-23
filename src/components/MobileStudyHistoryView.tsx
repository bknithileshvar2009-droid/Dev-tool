/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Filter,
  Sparkles,
  WifiOff,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  FocusSessionRecord,
  splitSessionByLocalCalendarDays,
  getLocalDateString,
  loadUserStudySessions,
  loadUserFocusSessions,
  getUserProfile,
} from '../utils/firebase';
import { exportStudyHistoryToPDF, formatTotalDurationHours } from '../utils/PdfExporter';

interface MobileStudyHistoryViewProps {
  uid: string | null;
  userName?: string;
  sessions?: FocusSessionRecord[];
  isLoading?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
}

type DateRangeOption =
  | 'today'
  | 'last7'
  | 'last14'
  | 'last30'
  | 'thisMonth'
  | 'custom'
  | 'all';

export default function MobileStudyHistoryView({
  uid,
  userName = 'BK NITHILESHVAR',
  sessions = [],
  isLoading = false,
  isError = false,
  isOffline = false,
  onRetry,
}: MobileStudyHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'interrupted'>('all');
  
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => getLocalDateString());

  // Download & Export Status Feedback
  const [exportingState, setExportingState] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Local fetched sessions state to ensure completeness even if parent prop is partial
  const [fetchedSessions, setFetchedSessions] = useState<FocusSessionRecord[]>(sessions);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [internalError, setInternalError] = useState<boolean>(false);

  // Sync internal sessions with parent sessions prop or fetch on mount
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setFetchedSessions(sessions);
    }
  }, [sessions]);

  // Load all sessions from Firebase when UID is available
  const reloadSessionsFromFirebase = useCallback(async () => {
    if (!uid) return;
    setInternalLoading(true);
    setInternalError(false);
    try {
      const [studyRecs, focusRecs] = await Promise.all([
        loadUserStudySessions(uid),
        loadUserFocusSessions(uid),
      ]);
      const map: Record<string, FocusSessionRecord> = {};
      [...(studyRecs || []), ...(focusRecs || []), ...sessions].forEach(r => {
        if (r && r.sessionId) map[r.sessionId] = r;
      });
      const combined = Object.values(map);
      combined.sort((a, b) => (b.startTimestamp || 0) - (a.startTimestamp || 0));
      setFetchedSessions(combined);
    } catch (err) {
      console.warn('[MobileStudyHistory] Failed loading sessions:', err);
      setInternalError(true);
    } finally {
      setInternalLoading(false);
    }
  }, [uid, sessions]);

  useEffect(() => {
    if (uid) {
      reloadSessionsFromFirebase();
    }
  }, [uid, reloadSessionsFromFirebase]);

  // Date Range Calculation Anchors
  const now = new Date();
  const todayStr = getLocalDateString(now);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = startOfToday - 13 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Validate Custom Date Range
  const isCustomRangeInvalid = useMemo(() => {
    if (dateRange !== 'custom') return false;
    if (!customStartDate || !customEndDate) return true;
    return new Date(customStartDate).getTime() > new Date(customEndDate).getTime();
  }, [dateRange, customStartDate, customEndDate]);

  // Filtered Sessions for display
  const filteredSessions = useMemo(() => {
    return fetchedSessions.filter(session => {
      const sStart = session.startTimestamp || (session.createdAt ? new Date(session.createdAt).getTime() : 0);

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

      if (statusFilter !== 'all') {
        if ((session.status || 'completed') !== statusFilter) return false;
      }

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
    fetchedSessions,
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

  // Calculate Metrics & Daily Summaries
  const metrics = useMemo(() => {
    let todayMinutes = 0;
    let todaySessionCount = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;
    let totalAllMinutes = 0;
    const dailyMap: Record<string, { activeMinutes: number; sessionCount: number; sessionsList: FocusSessionRecord[] }> = {};

    fetchedSessions.forEach(s => {
      const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : 0);
      const sEnd = s.endTimestamp || (sStart + (s.actualElapsedMinutes || 0) * 60000);
      const activeSec = (s.actualElapsedMinutes || Math.round((sEnd - sStart) / 60000)) * 60;
      const activeMins = Math.round(activeSec / 60);

      totalAllMinutes += activeMins;

      // Midnight split calculation
      const split = splitSessionByLocalCalendarDays(sStart, sEnd, activeSec);
      Object.entries(split).forEach(([dayKey, sliceSec]) => {
        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = { activeMinutes: 0, sessionCount: 0, sessionsList: [] };
        }
        dailyMap[dayKey].activeMinutes += Math.round(sliceSec / 60);
      });

      const startDayKey = getLocalDateString(new Date(sStart));
      if (!dailyMap[startDayKey]) {
        dailyMap[startDayKey] = { activeMinutes: 0, sessionCount: 0, sessionsList: [] };
      }
      dailyMap[startDayKey].sessionCount += 1;
      dailyMap[startDayKey].sessionsList.push(s);

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

    const sortedDays = Object.entries(dailyMap)
      .sort((a, b) => b[0].localeCompare(a[0]));

    return {
      todayMinutes,
      todaySessionCount,
      weekMinutes,
      monthMinutes,
      totalAllMinutes,
      totalSessions: fetchedSessions.length,
      sortedDays,
    };
  }, [fetchedSessions, startOfToday, endOfToday, sevenDaysAgo, thirtyDaysAgo]);

  // Human Readable Selected Range Label
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

  // PDF Export Handler
  const handleExportPDF = async (exportAll: boolean = false) => {
    if (isCustomRangeInvalid) {
      setExportingState('error');
      setExportMessage('Invalid custom date range. Start date cannot be after end date.');
      return;
    }

    setExportingState('generating');
    setExportMessage('Fetching complete records and building PDF report...');

    try {
      let targetSessions = fetchedSessions;

      // If specific date range is selected and not exportAll
      if (!exportAll) {
        targetSessions = filteredSessions;
      }

      // If exportAll, ensure we load all records directly from Firebase first
      if (exportAll && uid) {
        const [studyRecs, focusRecs] = await Promise.all([
          loadUserStudySessions(uid),
          loadUserFocusSessions(uid),
        ]);
        const map: Record<string, FocusSessionRecord> = {};
        [...(studyRecs || []), ...(focusRecs || []), ...fetchedSessions].forEach(r => {
          if (r && r.sessionId) map[r.sessionId] = r;
        });
        targetSessions = Object.values(map);
        targetSessions.sort((a, b) => (b.startTimestamp || 0) - (a.startTimestamp || 0));
      }

      let studentDisplayName = userName;
      if (uid && (!studentDisplayName || studentDisplayName === 'APES AI Student')) {
        const profile = await getUserProfile(uid);
        studentDisplayName = profile?.displayName || 'BK NITHILESHVAR';
      }

      exportStudyHistoryToPDF({
        sessions: targetSessions,
        rangeLabel: exportAll ? 'All Available History' : rangeDisplayLabel,
        userName: studentDisplayName || 'BK NITHILESHVAR',
        isPrint: false,
      });

      setExportingState('success');
      setExportMessage(
        exportAll
          ? `All Available History PDF generated! (${targetSessions.length} total sessions)`
          : `${rangeDisplayLabel} PDF generated! (${targetSessions.length} sessions)`
      );

      setTimeout(() => {
        setExportingState('idle');
        setExportMessage(null);
      }, 4500);
    } catch (err: any) {
      console.error('[PDF Export Error]', err);
      setExportingState('error');
      setExportMessage(`PDF generation failed: ${err.message || 'Please check your connection and retry.'}`);
    }
  };

  const showLoading = isLoading || internalLoading;
  const showError = isError || internalError;

  return (
    <div className="w-full min-h-screen bg-[#03060d] text-slate-100 flex flex-col p-3 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ================= MOBILE HEADER BANNER ================= */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#0b1329] via-[#091024] to-[#040814] border border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.15)] mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-5 h-5 fill-cyan-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono">
                  APES AI
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold uppercase">
                  STARK_HUD // MOBILE
                </span>
              </div>
              <p className="text-[11px] text-cyan-300/80 font-medium">
                Study History & Verified Academic Reports
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>{userName}</span>
            </span>
            {isOffline ? (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" />
                <span>Offline Mode</span>
              </span>
            ) : (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firebase Synced</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= EXECUTIVE KPI STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="p-3.5 rounded-2xl bg-[#091224] border border-cyan-500/20 shadow-md">
          <div className="text-[10px] text-cyan-400/80 uppercase font-mono font-bold tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Today's Study</span>
          </div>
          <div className="text-xl font-black text-cyan-300 font-mono mt-1">
            {formatTotalDurationHours(metrics.todayMinutes)}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            {metrics.todaySessionCount} session{metrics.todaySessionCount !== 1 ? 's' : ''} today
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091224] border border-emerald-500/20 shadow-md">
          <div className="text-[10px] text-emerald-400/80 uppercase font-mono font-bold tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>Last 7 Days</span>
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono mt-1">
            {formatTotalDurationHours(metrics.weekMinutes)}
          </div>
          <div className="text-[10px] text-white/50 font-mono mt-0.5">
            Rolling weekly study
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091224] border border-amber-500/20 shadow-md">
          <div className="text-[10px] text-amber-400/80 uppercase font-mono font-bold tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Last 30 Days</span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono mt-1">
            {formatTotalDurationHours(metrics.monthMinutes)}
          </div>
          <div className="text-[10px] text-white/50 font-mono mt-0.5">
            Rolling monthly volume
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091224] border border-purple-500/20 shadow-md">
          <div className="text-[10px] text-purple-400/80 uppercase font-mono font-bold tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3 text-purple-400" />
            <span>All-Time Total</span>
          </div>
          <div className="text-xl font-black text-purple-300 font-mono mt-1">
            {formatTotalDurationHours(metrics.totalAllMinutes)}
          </div>
          <div className="text-[10px] text-purple-400/80 font-mono mt-0.5">
            {metrics.totalSessions} total sessions
          </div>
        </div>
      </div>

      {/* ================= PDF EXPORT & TOOLBAR ACTION CONTROLS ================= */}
      <div className="p-4 rounded-2xl bg-[#081020] border border-cyan-500/30 shadow-lg mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download PDF Report</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono font-semibold">
            {rangeDisplayLabel}
          </span>
        </div>

        {/* Primary Download Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleExportPDF(false)}
            disabled={exportingState === 'generating' || isCustomRangeInvalid}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95 disabled:opacity-50"
            title="Download PDF report for current selected date filter"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPDF(true)}
            disabled={exportingState === 'generating'}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-400/40 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.25)] active:scale-95 disabled:opacity-50"
            title="Export every available study session record in one combined PDF report"
          >
            <FileText className="w-3.5 h-3.5 text-purple-300" />
            <span>Export All History</span>
          </button>
        </div>

        {/* Status Messages */}
        {exportMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition ${
              exportingState === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : exportingState === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
            }`}
          >
            {exportingState === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : exportingState === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 text-cyan-400 animate-spin" />
            )}
            <span className="line-clamp-2">{exportMessage}</span>
          </div>
        )}
      </div>

      {/* ================= DATE RANGE FILTERS & SEARCH TOOLBAR ================= */}
      <div className="p-3.5 rounded-2xl bg-[#081020] border border-white/10 shadow-md mb-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 font-mono flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Date Range Filter</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">
            {filteredSessions.length} Matching
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {[
            { id: 'today', label: 'Today' },
            { id: 'last7', label: 'Last 7 Days' },
            { id: 'last14', label: 'Last 14 Days' },
            { id: 'last30', label: 'Last 30 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'all', label: 'All History' },
            { id: 'custom', label: 'Custom' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDateRange(opt.id as DateRangeOption)}
              className={`px-2.5 py-1.5 rounded-xl font-bold font-mono transition whitespace-nowrap cursor-pointer ${
                dateRange === opt.id
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 hover:bg-white/15 text-white/70 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        {dateRange === 'custom' && (
          <div className="p-3 rounded-xl bg-black/50 border border-cyan-500/30 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-[10px] font-mono text-cyan-300 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-cyan-300 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>
            {isCustomRangeInvalid && (
              <p className="text-[10px] text-rose-400 font-mono font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Start date cannot be after end date</span>
              </p>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by subject, task, goal, or ID..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* ================= STATES: LOADING / ERROR / EMPTY / DAILY LIST ================= */}
      {showLoading ? (
        <div className="flex-1 min-h-[220px] rounded-2xl bg-[#081020] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="text-sm font-bold text-white">Loading Study History...</div>
          <p className="text-xs text-white/50">Fetching verified records from Firebase database</p>
        </div>
      ) : showError ? (
        <div className="flex-1 min-h-[220px] rounded-2xl bg-[#081020] border border-rose-500/30 p-6 text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <div className="text-sm font-bold text-rose-300">Unable to Load Study History</div>
          <p className="text-xs text-white/60">Could not retrieve records from server. Check network connection.</p>
          <button
            type="button"
            onClick={onRetry || reloadSessionsFromFirebase}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : metrics.sortedDays.length === 0 ? (
        <div className="flex-1 min-h-[220px] rounded-2xl bg-[#081020] border border-white/10 p-6 text-center flex flex-col items-center justify-center space-y-2">
          <Clock className="w-8 h-8 text-white/30" />
          <div className="text-sm font-bold text-white">No Study Records Available</div>
          <p className="text-xs text-white/50">
            No study sessions recorded for {rangeDisplayLabel}. Start studying on desktop to log records!
          </p>
        </div>
      ) : (
        /* ================= DAILY STUDY RECORDS LIST ================= */
        <div className="flex-1 space-y-3 pb-8">
          <div className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Daily History Logs ({metrics.sortedDays.length} Days)</span>
            <span className="text-[10px] text-white/40">Descending Date Order</span>
          </div>

          {metrics.sortedDays.map(([dateKey, dayData]) => {
            const dateObj = new Date(dateKey + 'T12:00:00');
            const fullDateStr = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            // Filter matching sessions for this specific calendar date
            const daySessions = dayData.sessionsList.filter(s => {
              if (dateRange === 'all') return true;
              return filteredSessions.some(fs => fs.sessionId === s.sessionId);
            });

            if (daySessions.length === 0 && dateRange !== 'all') return null;

            return (
              <div
                key={dateKey}
                className="rounded-2xl bg-[#081020] border border-cyan-500/20 overflow-hidden shadow-md"
              >
                {/* Date Header */}
                <div className="p-3 sm:p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      {fullDateStr}
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-300/80">
                      {daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'} recorded
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-white/50 block uppercase">
                      Total Active
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-300">
                      {formatTotalDurationHours(dayData.activeMinutes)}
                    </span>
                  </div>
                </div>

                {/* Individual Sessions Breakdown */}
                <div className="divide-y divide-white/5">
                  {daySessions.map((session, idx) => {
                    const sStart = session.startTimestamp || (session.createdAt ? new Date(session.createdAt).getTime() : 0);
                    const startTimeStr = sStart ? new Date(sStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Started';
                    const endTimeStr = session.endTimestamp ? new Date(session.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Incomplete';
                    const activeMins = session.actualElapsedMinutes || 0;
                    const pausedMins = session.totalBreakMinutes || 0;

                    return (
                      <div key={session.sessionId || idx} className="p-3 sm:p-4 hover:bg-white/[0.02] transition space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {session.subject || 'General Study'}
                            </span>
                            <span className="text-[10px] font-mono text-white/50 block">
                              {session.task || 'Study Sprint'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              (session.status as string) === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : (session.status as string) === 'running'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {session.status || 'completed'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-white/70 pt-1">
                          <div className="flex items-center gap-1 text-cyan-300/80">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{startTimeStr} - {endTimeStr}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-emerald-300 font-bold">
                              {formatTotalDurationHours(activeMins)} active
                            </span>
                            {pausedMins > 0 && (
                              <span className="text-amber-400/80">
                                ({pausedMins}m paused)
                              </span>
                            )}
                          </div>
                        </div>

                        {session.goal && (
                          <p className="text-[10px] text-white/50 italic bg-black/40 rounded-lg p-1.5 mt-1 border border-white/5">
                            "{session.goal}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
