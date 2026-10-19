/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles,
  Shield,
  Cloud,
  X,
  Plus,
  RefreshCw,
  Edit3,
  Check,
  BarChart3,
  ListFilter,
  Flame,
} from 'lucide-react';
import {
  DailyRegistryDayRecord,
  DailyRegistryEntryItem,
  getLocalDateString,
  getDayOfWeekName,
} from '../utils/firebase';

interface DailyRegistryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string | null;
  userEmail: string | null;
  historyMap: Record<string, DailyRegistryDayRecord>;
  onSaveDayNotes: (date: string, notes: string) => Promise<boolean>;
  onAddManualEntry: (date: string, entry: Omit<DailyRegistryEntryItem, 'id' | 'createdAt'>) => Promise<boolean>;
  onDeleteEntry: (date: string, entryId: string) => Promise<boolean>;
  activeTasks: Array<{ id: string; text: string; completed: boolean; subject?: string; priority?: string }>;
}

export const DailyRegistryHistoryModal: React.FC<DailyRegistryHistoryModalProps> = ({
  isOpen,
  onClose,
  uid,
  userEmail,
  historyMap,
  onSaveDayNotes,
  onAddManualEntry,
  onDeleteEntry,
  activeTasks,
}) => {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'day' | 'weekly' | 'search' | 'summary'>('day');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');

  // End of Day editing state
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaveSuccess, setNotesSaveSuccess] = useState(false);

  // New manual entry form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newTopic, setNewTopic] = useState('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newNotes, setNewNotes] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

  // Current day record
  const currentDayRecord: DailyRegistryDayRecord | undefined = historyMap[selectedDate];

  // Convert entries object into sorted array
  const currentEntries: DailyRegistryEntryItem[] = useMemo(() => {
    if (!currentDayRecord?.entries) return [];
    return Object.values(currentDayRecord.entries).sort((a, b) => b.createdAt - a.createdAt);
  }, [currentDayRecord]);

  // Handle note editor init
  const currentDayNotes = currentDayRecord?.dailySummaryNotes || '';

  const handleStartEditNotes = () => {
    setEditingNotes(currentDayNotes);
  };

  const handleSaveNotes = async () => {
    if (editingNotes === null) return;
    setSavingNotes(true);
    try {
      await onSaveDayNotes(selectedDate, editingNotes);
      setNotesSaveSuccess(true);
      setTimeout(() => setNotesSaveSuccess(false), 2500);
      setEditingNotes(null);
    } finally {
      setSavingNotes(false);
    }
  };

  // Quick Date Navigation
  const handleShiftDate = (offsetDays: number) => {
    const cur = new Date(selectedDate + 'T12:00:00');
    cur.setDate(cur.getDate() + offsetDays);
    setSelectedDate(getLocalDateString(cur));
  };

  // Add manual log
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    setIsSubmittingEntry(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      await onAddManualEntry(selectedDate, {
        timestamp: now.toISOString(),
        time: timeStr,
        eventType: 'manual_log',
        description: newTopic.trim() ? `${newSubject} — ${newTopic.trim()}` : `${newSubject} study session`,
        subject: newSubject,
        topic: newTopic.trim() || undefined,
        durationMinutes: Number(newDuration) || 0,
        notes: newNotes.trim() || undefined,
        status: 'completed',
        rating: newRating,
      });
      setNewTopic('');
      setNewNotes('');
      setShowAddForm(false);
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  // All entries across all days for the Search tab
  const allHistoricalEntries = useMemo(() => {
    const list: Array<DailyRegistryEntryItem & { dayDate: string }> = [];
    Object.entries(historyMap).forEach(([dayDate, dayRec]) => {
      if (dayRec.entries) {
        Object.values(dayRec.entries).forEach(entry => {
          list.push({ ...entry, dayDate });
        });
      }
    });
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [historyMap]);

  // Filtered historical entries
  const filteredEntries = useMemo(() => {
    return allHistoricalEntries.filter(item => {
      const matchSubject = filterSubject === 'all' || item.subject.toLowerCase() === filterSubject.toLowerCase();
      const matchEvent = filterEventType === 'all' || item.eventType === filterEventType;
      const matchSearch =
        !searchQuery.trim() ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.topic && item.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dayDate.includes(searchQuery);

      return matchSubject && matchEvent && matchSearch;
    });
  }, [allHistoricalEntries, filterSubject, filterEventType, searchQuery]);

  // Aggregate weekly stats (last 7 recorded days)
  const weeklyAnalytics = useMemo(() => {
    const dates = Object.keys(historyMap).sort().reverse().slice(0, 7);
    let totalMinutes = 0;
    let totalCompletedTasks = 0;
    const subjectMap: Record<string, number> = {};

    dates.forEach(d => {
      const rec = historyMap[d];
      totalMinutes += rec.totalStudyMinutes || 0;
      totalCompletedTasks += Array.isArray(rec.completedTasks) ? rec.completedTasks.length : 0;
      if (Array.isArray(rec.subjectsStudied)) {
        rec.subjectsStudied.forEach(s => {
          subjectMap[s] = (subjectMap[s] || 0) + (rec.totalStudyMinutes ? Math.floor(rec.totalStudyMinutes / rec.subjectsStudied.length) : 30);
        });
      }
    });

    return {
      daysCount: dates.length,
      totalHours: (totalMinutes / 60).toFixed(1),
      totalCompletedTasks,
      subjectBreakdown: subjectMap,
    };
  }, [historyMap]);

  // Export current day as Markdown
  const handleExportMarkdown = () => {
    const rec = currentDayRecord;
    const date = selectedDate;
    const content = [
      `# Flocus Study Registry — ${date} (${rec?.dayOfWeek || getDayOfWeekName(new Date(date + 'T12:00:00'))})`,
      `User: ${userEmail || uid || 'Student'}`,
      `Total Study Duration: ${rec?.totalStudyMinutes || 0} minutes`,
      `Subjects: ${(rec?.subjectsStudied || []).join(', ') || 'None recorded'}`,
      '',
      '## End-of-Day Summary & Notes',
      rec?.dailySummaryNotes || 'No daily summary notes written yet.',
      '',
      '## Completed Tasks',
      ...(rec?.completedTasks && rec.completedTasks.length > 0
        ? rec.completedTasks.map(t => `- [x] ${t.text} (Completed at ${t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : 'N/A'})`)
        : ['- None completed on this date']),
      '',
      '## Activity Log Entries',
      ...currentEntries.map(e => `### [${e.time}] ${e.subject} — ${e.description}\n- Event: ${e.eventType} | Duration: ${e.durationMinutes}m | Rating: ${e.rating || 5}/5\n- Notes: ${e.notes || 'None'}\n`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_registry_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[92vh] max-h-[900px] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Daily Registry & Personal History
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Private to UID: {uid ? uid.slice(0, 8) + '...' : 'Guest'}</span>
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Persistent daily study log, subject progression, completed tasks, and revision history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMarkdown}
              title="Export this date to Markdown"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs border border-white/10 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Day</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= NAVIGATION TABS & DATE BAR ================= */}
        <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('day')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'day'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Day Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>End-of-Day Review</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'weekly'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Weekly & Monthly</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Activity Filter ({allHistoricalEntries.length})</span>
            </button>
          </div>

          {/* Date Picker & Jump Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-black/50 border border-cyan-500/30 rounded-xl px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* ================= TAB 1: DAY BREAKDOWN ================= */}
        {activeTab === 'day' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Day Header Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-black/60 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white font-mono">{selectedDate}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {currentDayRecord?.dayOfWeek || getDayOfWeekName(new Date(selectedDate + 'T12:00:00'))}
                  </span>
                  {selectedDate === todayStr && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      TODAY
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Database Path: <code className="text-cyan-300/80">users/{uid ? uid.slice(0, 10) + '...' : 'guest'}/dailyRegistry/{selectedDate}</code>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel Entry' : 'Add Study Record'}</span>
              </button>
            </div>

            {/* Quick Manual Add Form */}
            {showAddForm && (
              <form onSubmit={handleCreateEntry} className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Log Activity for {selectedDate}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1">Subject</label>
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Tuition Revision', 'Exam Preparation', 'General Study'].map(s => (
                        <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1">Topic / Chapter</label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      placeholder="e.g. Calculus Derivatives, Organic Mechanisms"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={newDuration}
                      onChange={e => setNewDuration(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 font-semibold block mb-1">Study Findings & Notes</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Key concepts mastered, formulas reviewed, problems solved, difficulty points..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/50 mr-1 font-semibold">Focus Rating:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`text-sm cursor-pointer ${star <= newRating ? 'text-amber-400' : 'text-white/20'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEntry}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingEntry ? 'Saving to Firebase...' : 'Save Activity Entry'}
                  </button>
                </div>
              </form>
            )}

            {/* KPI Cards for Selected Date */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Study Duration</span>
                <div className="text-xl sm:text-2xl font-black text-cyan-300">
                  {Math.floor((currentDayRecord?.totalStudyMinutes || 0) / 60)}h {(currentDayRecord?.totalStudyMinutes || 0) % 60}m
                </div>
                <div className="text-[10px] text-white/40">Total focus recorded</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Subjects Studied</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-300">
                  {currentDayRecord?.subjectsStudied?.length || 0}
                </div>
                <div className="text-[10px] text-white/40 truncate">
                  {(currentDayRecord?.subjectsStudied || []).join(', ') || 'None yet'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Completed Tasks</span>
                <div className="text-xl sm:text-2xl font-black text-rose-300">
                  {currentDayRecord?.completedTasks?.length || 0}
                </div>
                <div className="text-[10px] text-white/40">Tasks finished today</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Activity Logs</span>
                <div className="text-xl sm:text-2xl font-black text-amber-300">
                  {currentEntries.length}
                </div>
                <div className="text-[10px] text-white/40">Saved timeline events</div>
              </div>
            </div>

            {/* Completed Tasks & Pending Tasks Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Completed Tasks */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Tasks Completed on this Date ({currentDayRecord?.completedTasks?.length || 0})
                    </span>
                  </div>
                </div>

                {(!currentDayRecord?.completedTasks || currentDayRecord.completedTasks.length === 0) ? (
                  <div className="py-6 text-center text-xs text-white/40 space-y-1">
                    <p>No tasks completed on this date.</p>
                    <p className="text-[11px] text-white/30">Completing tasks in the Quick Tasks widget automatically logs them here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentDayRecord.completedTasks.map((task, idx) => (
                      <div key={task.id || idx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-emerald-200 truncate line-through">{task.text}</span>
                        </div>
                        {task.completedAt && (
                          <span className="text-[10px] text-emerald-300/60 font-mono shrink-0">
                            {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Sessions Recorded */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Study & Focus Sprints ({currentDayRecord?.studySessions?.length || 0})
                    </span>
                  </div>
                </div>

                {(!currentDayRecord?.studySessions || currentDayRecord.studySessions.length === 0) ? (
                  <div className="py-6 text-center text-xs text-white/40 space-y-1">
                    <p>No study timer sprints logged on this date.</p>
                    <p className="text-[11px] text-white/30">Completing Pomodoro sessions automatically writes study duration here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentDayRecord.studySessions.map((session, idx) => (
                      <div key={session.id || idx} className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold text-cyan-200 capitalize">{session.mode} Focus Session</span>
                          <span className="text-[11px] text-white/50">• {session.durationMinutes} mins</span>
                        </div>
                        {session.completedAt && (
                          <span className="text-[10px] text-cyan-300/60 font-mono">
                            {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline of Individual Saved Activity Entries */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Chronological Activity Timeline ({currentEntries.length})
                  </span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  Path: users/{'{uid}'}/dailyRegistry/{selectedDate}/entries
                </span>
              </div>

              {currentEntries.length === 0 ? (
                <div className="py-10 text-center text-white/40 space-y-2">
                  <div className="text-2xl">📖</div>
                  <div className="text-xs font-semibold">No activity entries recorded for this date yet.</div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer"
                  >
                    + Log First Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/30 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {entry.subject}
                            </span>
                            <h4 className="text-xs font-bold text-white">{entry.description}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-white/60 capitalize font-mono">
                              {entry.eventType.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
                            <span>⏰ {entry.time}</span>
                            <span>⏱ {entry.durationMinutes} mins</span>
                            {entry.rating && <span className="text-amber-400">{'★'.repeat(entry.rating)}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteEntry(selectedDate, entry.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/30 hover:text-rose-300 transition cursor-pointer"
                          title="Delete entry from Firebase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-white/70 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: END-OF-DAY REVIEW & SUMMARY ================= */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-black/60 border border-emerald-500/20 space-y-1">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>End-of-Day Review & Self-Reflection — {selectedDate}</span>
              </h3>
              <p className="text-xs text-white/50">
                Review your actual recorded achievements, unfinished tasks, and write your personal end-of-day summary.
              </p>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Total Study Time</span>
                <div className="text-2xl font-black text-emerald-300">
                  {Math.floor((currentDayRecord?.totalStudyMinutes || 0) / 60)}h {(currentDayRecord?.totalStudyMinutes || 0) % 60}m
                </div>
                <div className="text-[10px] text-white/40">Verified from recorded activities</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Completed Tasks</span>
                <div className="text-2xl font-black text-cyan-300">
                  {currentDayRecord?.completedTasks?.length || 0}
                </div>
                <div className="text-[10px] text-white/40">Checked off on {selectedDate}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Unfinished Tasks</span>
                <div className="text-2xl font-black text-amber-300">
                  {activeTasks.filter(t => !t.completed).length}
                </div>
                <div className="text-[10px] text-white/40">Pending in quick tasks</div>
              </div>
            </div>

            {/* User-Editable End of Day Reflection */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Student End-of-Day Notes & Reflection
                  </h4>
                  <p className="text-[11px] text-white/40">
                    Your personal thoughts, takeaways, revision targets for tomorrow, or tuition notes.
                  </p>
                </div>

                {notesSaveSuccess && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Saved to Firebase</span>
                  </span>
                )}
              </div>

              {editingNotes !== null ? (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={editingNotes}
                    onChange={e => setEditingNotes(e.target.value)}
                    placeholder="Reflect on today's study: What concepts did you conquer? What needs revision? What is your top goal for tomorrow?..."
                    className="w-full bg-black/60 border border-cyan-500/40 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 font-sans leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNotes(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingNotes}
                      onClick={handleSaveNotes}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingNotes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{savingNotes ? 'Saving...' : 'Save End-of-Day Notes'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {currentDayNotes ? (
                      currentDayNotes
                    ) : (
                      <span className="text-white/30 italic">
                        No end-of-day summary notes written for {selectedDate} yet. Click below to write your reflection.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleStartEditNotes}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{currentDayNotes ? 'Edit Notes' : 'Write End-of-Day Notes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: WEEKLY & MONTHLY PROGRESS ================= */}
        {activeTab === 'weekly' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-black/60 border border-cyan-500/20 space-y-1">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Weekly & Long-Term Study Analytics</span>
              </h3>
              <p className="text-xs text-white/50">
                Synthesized solely from your authenticated Firebase daily records.
              </p>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/50">Days with Activity</span>
                <div className="text-2xl font-black text-cyan-300">
                  {Object.keys(historyMap).length} Days
                </div>
                <div className="text-[10px] text-white/40">Recorded in personal history</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/50">Total Focus Hours</span>
                <div className="text-2xl font-black text-emerald-300">
                  {(Object.values(historyMap).reduce((acc, r) => acc + (r.totalStudyMinutes || 0), 0) / 60).toFixed(1)} hrs
                </div>
                <div className="text-[10px] text-white/40">Across all recorded dates</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/50">Total Tasks Finished</span>
                <div className="text-2xl font-black text-rose-300">
                  {Object.values(historyMap).reduce((acc, r) => acc + (Array.isArray(r.completedTasks) ? r.completedTasks.length : 0), 0)}
                </div>
                <div className="text-[10px] text-white/40">Logged completed tasks</div>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Subject Distribution (Last 7 Active Days)
              </h4>

              {Object.keys(weeklyAnalytics.subjectBreakdown).length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  No subject distribution recorded yet. Study sessions will show subject breakdown here.
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(weeklyAnalytics.subjectBreakdown).map(([subject, minutes]) => (
                    <div key={subject} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white/80">{subject}</span>
                        <span className="font-mono text-cyan-300">{Math.floor(minutes / 60)}h {minutes % 60}m</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(10, (minutes / (Number(weeklyAnalytics.totalHours) * 60 || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Days Calendar Table */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                All Logged Dates in Database
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Object.keys(historyMap).sort().reverse().map(d => {
                  const rec = historyMap[d];
                  const isCur = d === selectedDate;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d);
                        setActiveTab('day');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isCur
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{d}</div>
                      <div className="text-[10px] text-white/50 mt-1">
                        {rec.totalStudyMinutes ? `${rec.totalStudyMinutes}m` : '0m'} • {rec.entries ? Object.keys(rec.entries).length : 0} logs
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SEARCH & FILTER ALL ACTIVITY ================= */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Filter Bar */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search across all dates, topics, notes, or descriptions..."
                  className="w-full bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all" className="bg-slate-900">All Subjects</option>
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Tuition Revision', 'Exam Preparation'].map(s => (
                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                  ))}
                </select>

                <select
                  value={filterEventType}
                  onChange={e => setFilterEventType(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all" className="bg-slate-900">All Activity Types</option>
                  <option value="study_session" className="bg-slate-900">Study Sessions</option>
                  <option value="task_completed" className="bg-slate-900">Task Completions</option>
                  <option value="manual_log" className="bg-slate-900">Manual Logs</option>
                  <option value="revision" className="bg-slate-900">Revisions</option>
                  <option value="exam_prep" className="bg-slate-900">Exam Prep</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="text-[11px] text-white/50 px-1">
              Showing {filteredEntries.length} matching events across all dates
            </div>

            {/* Filtered List */}
            {filteredEntries.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-2">
                <div className="text-3xl">🔍</div>
                <div className="text-xs font-semibold">No records match your search criteria.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEntries.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(item.dayDate);
                            setActiveTab('day');
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 hover:underline cursor-pointer"
                        >
                          📅 {item.dayDate}
                        </button>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80">
                          {item.subject}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{item.description}</h4>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-white/60 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono shrink-0">
                      <span>⏰ {item.time}</span>
                      <span>⏱ {item.durationMinutes}m</span>
                      {item.rating && <span className="text-amber-400">{'★'.repeat(item.rating)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60 bg-white/[0.01]">
          <div className="flex items-center gap-2 text-[11px]">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Realtime Database & Firestore Active • Logged in as <strong className="text-white">{userEmail || uid || 'Guest'}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRegistryHistoryModal;
