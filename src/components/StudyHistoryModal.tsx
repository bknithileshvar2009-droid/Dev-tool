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
  TrendingUp,
  BarChart3,
  BookOpen,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FocusSessionRecord } from '../utils/firebase';
import { exportStudyHistoryToPDF } from '../utils/PdfExporter';

interface StudyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: FocusSessionRecord[];
  userName?: string;
}

export default function StudyHistoryModal({
  isOpen,
  onClose,
  sessions = [],
  userName = 'APES AI Student',
}: StudyHistoryModalProps) {
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
      const sessionTime = session.startTimestamp || new Date(session.createdAt || 0).getTime();
      if (dateRange === 'today' && sessionTime < startOfToday) return false;
      if (dateRange === 'week' && sessionTime < sevenDaysAgo) return false;
      if (dateRange === 'month' && sessionTime < thirtyDaysAgo) return false;

      if (statusFilter !== 'all' && session.status !== statusFilter) return false;

      if (selectedSubject !== 'all' && session.subject?.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSubject = session.subject?.toLowerCase().includes(query);
        const matchesTask = session.task?.toLowerCase().includes(query);
        const matchesGoal = session.goal?.toLowerCase().includes(query);
        if (!matchesSubject && !matchesTask && !matchesGoal) return false;
      }

      return true;
    });
  }, [sessions, searchTerm, selectedSubject, statusFilter, dateRange]);

  // Aggregate Metrics (Daily, Weekly, Monthly based on YYYY-MM-DD date key)
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;

    let todayMinutes = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;
    let completedCount = 0;

    const dailyMap: Record<string, number> = {};

    sessions.forEach(s => {
      const sTime = s.startTimestamp || new Date(s.createdAt || 0).getTime();
      const elapsed = s.actualElapsedMinutes || s.plannedDurationMinutes || 0;
      const dateKey = new Date(sTime).toISOString().slice(0, 10);

      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + elapsed;

      if (s.status === 'completed') {
        completedCount++;
      }

      if (sTime >= startOfToday) {
        todayMinutes += elapsed;
      }
      if (sTime >= sevenDaysAgo) {
        weekMinutes += elapsed;
      }
      if (sTime >= thirtyDaysAgo) {
        monthMinutes += elapsed;
      }
    });

    const sortedDays = Object.entries(dailyMap).sort((a, b) => b[0].localeCompare(a[0]));

    return {
      todayMinutes,
      weekMinutes,
      monthMinutes,
      completedCount,
      totalSessions: sessions.length,
      sortedDays,
    };
  }, [sessions]);

  const uniqueSubjects = useMemo(() => {
    const subs = new Set<string>();
    sessions.forEach(s => {
      if (s.subject) subs.add(s.subject);
    });
    return Array.from(subs);
  }, [sessions]);

  const handleExportPDF = () => {
    const rangeLabel = dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Last 7 Days' : dateRange === 'month' ? 'Last 30 Days' : 'All Available History';
    exportStudyHistoryToPDF({
      sessions: filteredSessions.length > 0 ? filteredSessions : sessions,
      rangeLabel,
      userName,
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-3xl bg-[#0b1120] border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-[#0b1120] to-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white">Permanent Study Session History</h2>
              <p className="text-xs text-white/50">
                Aggregated daily, weekly, and monthly study records synced from Firebase
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              className="py-2 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              title="Export study records to professional PDF report"
            >
              <Download className="w-4 h-4" />
              <span>Export to PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="text-[10px] text-white/50 uppercase font-mono">Today's Study Time</div>
            <div className="text-xl font-black text-cyan-300">
              {Math.floor(metrics.todayMinutes / 60)}h {metrics.todayMinutes % 60}m
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Active tracking</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="text-[10px] text-white/50 uppercase font-mono">Weekly Total (7d)</div>
            <div className="text-xl font-black text-emerald-300">
              {Math.floor(metrics.weekMinutes / 60)}h {metrics.weekMinutes % 60}m
            </div>
            <div className="text-[10px] text-white/40 font-mono">Past 7 days</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="text-[10px] text-white/50 uppercase font-mono">Monthly Total (30d)</div>
            <div className="text-xl font-black text-amber-300">
              {Math.floor(metrics.monthMinutes / 60)}h {metrics.monthMinutes % 60}m
            </div>
            <div className="text-[10px] text-white/40 font-mono">Past 30 days</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="text-[10px] text-white/50 uppercase font-mono">Completed Sessions</div>
            <div className="text-xl font-black text-purple-300">
              {metrics.completedCount} / {metrics.totalSessions}
            </div>
            <div className="text-[10px] text-purple-400/80 font-mono">Verified records</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 px-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/30">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search subjects, tasks, goals..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-500 outline-none"
              />
            </div>

            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="bg-black/50 border border-white/10 text-cyan-300 font-mono text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">All History</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-black/50 border border-white/10 text-cyan-300 font-mono text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sessions Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Study Sessions Found</h3>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  No genuine recorded study sessions match your current filter. Start a study sprint using the Study Time Tracker widget to log your academic progress.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSessions.map(session => {
                const dateStr = new Date(session.startTimestamp).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                const startTime = new Date(session.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = session.endTimestamp ? new Date(session.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active';
                const durationMins = session.actualElapsedMinutes || Math.round(((session.endTimestamp || Date.now()) - session.startTimestamp) / 60000);

                return (
                  <div
                    key={session.sessionId}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {session.subject || 'General Study'}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{session.task || 'Focus Sprint'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono flex-wrap">
                        <span>📅 {dateStr}</span>
                        <span>⏰ {startTime} - {endTime}</span>
                        {session.goal && <span>🎯 {session.goal}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {Math.floor(durationMins / 60)}h {durationMins % 60}m
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        session.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {session.status || 'Completed'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/50">
          <span>Showing {filteredSessions.length} of {sessions.length} total sessions</span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
