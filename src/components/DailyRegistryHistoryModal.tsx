/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ListFilter,
  Edit3,
  Cloud,
  Sparkles,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Filter,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Download,
  Printer,
  FileText,
} from 'lucide-react';
import { generateCombinedMultiDayReportPDF, CombinedDaySummaryItem } from "../utils/pdfGenerator";
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
  onSaveDayNotes: (date: string, notes: string, aiSummary?: string) => Promise<boolean>;
  onAddManualEntry?: (date: string, entryData: Omit<DailyRegistryEntryItem, 'id' | 'createdAt'>) => Promise<boolean>;
  onDeleteEntry?: (date: string, entryId: string) => Promise<boolean>;
  activeTasks?: any[];
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
}) => {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'reflection' | 'history'>('reflection');

  // Animation state to ensure immediate smooth slide-up from translateY(100%) to translateY(0)
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isSlideUpActive, setIsSlideUpActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const frame = requestAnimationFrame(() => {
        setIsSlideUpActive(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsSlideUpActive(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const currentRecord = historyMap[selectedDate];
  const [reflectionText, setReflectionText] = useState(
    currentRecord?.dailySummaryNotes || localStorage.getItem(`flocus_reflection_${selectedDate}`) || ''
  );
  const [aiSummary, setAiSummary] = useState(
    currentRecord?.aiSummary || localStorage.getItem(`flocus_ai_summary_${selectedDate}`) || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual entry modal form state
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const [entryTopic, setEntryTopic] = useState('');
  const [entryDuration, setEntryDuration] = useState(30);
  const [entryNotes, setEntryNotes] = useState('');
  const [entrySubject, setEntrySubject] = useState('Mathematics');


  // Combined PDF Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportRangeType, setExportRangeType] = useState<
    "today" | "last7" | "last14" | "last30" | "thisMonth" | "all" | "custom"
  >("last14");
  const [customExportStart, setCustomExportStart] = useState("");
  const [customExportEnd, setCustomExportEnd] = useState("");

  const handleExportCombinedPDF = (autoPrint = false) => {
    const allDates = Object.keys(historyMap).sort();
    if (allDates.length === 0) return;

    const todayStr = getLocalDateString();
    let filteredDates = [...allDates];
    let rangeLabel = "All Available History";

    if (exportRangeType === "today") {
      filteredDates = allDates.filter(d => d === todayStr);
      rangeLabel = `Today (${todayStr})`;
    } else if (exportRangeType === "last7") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = getLocalDateString(cutoff);
      filteredDates = allDates.filter(d => d >= cutoffStr);
      rangeLabel = `Last 7 Days (${cutoffStr} to ${todayStr})`;
    } else if (exportRangeType === "last14") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      const cutoffStr = getLocalDateString(cutoff);
      filteredDates = allDates.filter(d => d >= cutoffStr);
      rangeLabel = `Last 14 Days (${cutoffStr} to ${todayStr})`;
    } else if (exportRangeType === "last30") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = getLocalDateString(cutoff);
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
      const rec = historyMap[dateKey];
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
        weekday: rec.dayOfWeek || getDayOfWeekName(new Date(dateKey + "T12:00:00")),
        fullDateStr,
        dailySummaryNotes: rec.dailySummaryNotes,
        aiSummary: rec.aiSummary,
        entries: rec.entries || [],
        totalStudyMins: rec.totalStudyMinutes,
      };
    });

    generateCombinedMultiDayReportPDF({
      dateRangeLabel: rangeLabel,
      summaries,
      userName: userEmail || (uid ? `User ${uid.slice(0, 8)}` : "APESFLOW Student"),
      autoPrint,
    });

    setIsExportModalOpen(false);
  };

  // Advanced Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Extract all unique subjects across history records
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    Object.values(historyMap).forEach(rec => {
      if (Array.isArray(rec.subjectsStudied)) {
        rec.subjectsStudied.forEach(s => set.add(s));
      }
      if (rec.entries) {
        Object.values(rec.entries).forEach((e: any) => {
          if (e.subject) set.add(e.subject);
          if (e.topic) set.add(e.topic);
        });
      }
    });
    return Array.from(set).sort();
  }, [historyMap]);

  const [lastLoadedDate, setLastLoadedDate] = useState(selectedDate);

  // Sync state when selectedDate changes
  useEffect(() => {
    if (selectedDate !== lastLoadedDate) {
      const rec = historyMap[selectedDate];
      const localNotes = localStorage.getItem(`flocus_reflection_${selectedDate}`) || '';
      const localAi = localStorage.getItem(`flocus_ai_summary_${selectedDate}`) || '';
      setReflectionText(rec?.dailySummaryNotes || localNotes);
      setAiSummary(rec?.aiSummary || localAi);
      setLastLoadedDate(selectedDate);
      setSaveStatus('idle');
      setAiError(null);
    }
  }, [selectedDate, historyMap, lastLoadedDate]);

  // Populate fields if historyMap arrives after mount
  useEffect(() => {
    const rec = historyMap[selectedDate];
    if (rec) {
      if (!reflectionText && rec.dailySummaryNotes) {
        setReflectionText(rec.dailySummaryNotes);
      }
      if (!aiSummary && rec.aiSummary) {
        setAiSummary(rec.aiSummary);
      }
    }
  }, [historyMap, selectedDate]);

  const handleSaveReflection = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      localStorage.setItem(`flocus_reflection_${selectedDate}`, reflectionText);
      if (aiSummary) {
        localStorage.setItem(`flocus_ai_summary_${selectedDate}`, aiSummary);
      }
      const success = await onSaveDayNotes(selectedDate, reflectionText, aiSummary);
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Save reflection error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!reflectionText.trim()) {
      setAiError('Please write your daily reflection first before generating an AI summary.');
      return;
    }
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/summarize-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflectionText }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI summary.');
      }
      setAiSummary(data.summary);
      localStorage.setItem(`flocus_ai_summary_${selectedDate}`, data.summary);
      await onSaveDayNotes(selectedDate, reflectionText, data.summary);
    } catch (err: any) {
      console.error('AI summary generation error:', err);
      setAiError(err.message || 'Failed to connect to AI summarization service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTopic.trim()) return;

    if (onAddManualEntry) {
      await onAddManualEntry(selectedDate, {
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventType: 'manual_log',
        description: `${entrySubject}: ${entryTopic.trim()}`,
        topic: entryTopic.trim(),
        durationMinutes: entryDuration,
        notes: entryNotes.trim() || undefined,
        status: 'completed',
        rating: 5,
      });
    }

    setEntryTopic('');
    setEntryNotes('');
    setShowAddEntryForm(false);
  };

  const handleShiftDate = (offsetDays: number) => {
    const cur = new Date(selectedDate + 'T12:00:00');
    cur.setDate(cur.getDate() + offsetDays);
    setSelectedDate(getLocalDateString(cur));
  };

  const sortedDates = useMemo(() => {
    return Object.keys(historyMap).sort().reverse();
  }, [historyMap]);

  // Filtered History Dates
  const filteredHistoryDates = useMemo(() => {
    return sortedDates.filter(d => {
      const rec = historyMap[d];

      // Date range filter
      if (startDateFilter && d < startDateFilter) return false;
      if (endDateFilter && d > endDateFilter) return false;

      // Subject filter
      if (subjectFilter !== 'ALL') {
        const hasSubject =
          (Array.isArray(rec.subjectsStudied) && rec.subjectsStudied.includes(subjectFilter)) ||
          (rec.entries &&
            Object.values(rec.entries).some((e: any) => e.subject === subjectFilter || e.topic === subjectFilter));
        if (!hasSubject) return false;
      }

      // Keyword query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDate = d.includes(query);
        const matchNotes = rec?.dailySummaryNotes?.toLowerCase().includes(query);
        const matchSummary = rec?.aiSummary?.toLowerCase().includes(query);
        const matchSubject =
          Array.isArray(rec.subjectsStudied) &&
          rec.subjectsStudied.some(s => s.toLowerCase().includes(query));
        const matchEntries =
          rec.entries &&
          Object.values(rec.entries).some(
            (e: any) =>
              e.topic?.toLowerCase().includes(query) ||
              e.notes?.toLowerCase().includes(query) ||
              e.description?.toLowerCase().includes(query) ||
              e.subject?.toLowerCase().includes(query)
          );

        if (!matchDate && !matchNotes && !matchSummary && !matchSubject && !matchEntries) {
          return false;
        }
      }

      return true;
    });
  }, [sortedDates, historyMap, searchQuery, startDateFilter, endDateFilter, subjectFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDateFilter('');
    setEndDateFilter('');
    setSubjectFilter('ALL');
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 transition-opacity duration-300 ${
        isSlideUpActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[90vh] max-h-[850px] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white"
        style={{
          transform: isSlideUpActive ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Daily Registry & Personal History
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>{uid ? `UID: ${uid.slice(0, 8)}...` : 'Local Guest Account'}</span>
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Universal daily check-in, AI reflection summary, and verified study archive
              </p>
            </div>
          </div>

          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 hover:text-white font-bold text-xs border border-cyan-500/40 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Export All Daily Summaries to Combined PDF Report"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT ALL DAILY SUMMARIES</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportCombinedPDF(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Print Daily Summary Report"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
              title="Close Registry Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Date Selector */}
        <div className="px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('reflection')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reflection'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Daily Check-in & Logs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>History Archive ({Object.keys(historyMap).length})</span>
            </button>
          </div>

          {/* Date Navigation */}
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


        {/* ================= EXPORT COMBINED PDF RANGE MODAL ================= */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0b1120] border border-cyan-500/40 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Combined Daily Summary Export</h3>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                Select a date range to generate ONE combined downloadable PDF containing every selected daily summary in chronological order, formatted with full date and weekday headings.
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
                    { id: "all", label: `All History (${Object.keys(historyMap).length} Days)` },
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
                  onClick={() => handleExportCombinedPDF(false)}
                  className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Combined PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportCombinedPDF(true)}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'reflection' ? (
            <div className="space-y-6">
              {/* Welcoming Banner & Prompt */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-black/60 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white font-mono">{selectedDate}</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {getDayOfWeekName(new Date(selectedDate + 'T12:00:00'))}
                    </span>
                    {selectedDate === todayStr && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {saveStatus === 'saved' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved to Cloud & History</span>
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Saved Locally (Offline Backup)</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-cyan-200 mt-2">
                  What did you accomplish today?
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Describe your day naturally. Include what you completed, worked on, learned, achievements, challenges faced, tasks left unfinished, and goals for tomorrow.
                </p>
              </div>

              {/* Reflection Textarea */}
              <div className="space-y-3">
                <textarea
                  rows={7}
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="Today I worked on... I successfully completed... One challenge I faced was... Tomorrow I plan to..."
                  className="w-full bg-black/60 border border-cyan-500/40 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 font-sans leading-relaxed shadow-inner"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveReflection}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2 border border-cyan-500/40 shadow-sm"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Save className="w-4 h-4 text-cyan-400" />}
                      <span>{isSaving ? 'Saving...' : 'Save Reflection'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddEntryForm(prev => !prev)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 border border-white/10"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Log Session Entry</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isGeneratingAi || !reflectionText.trim()}
                    onClick={handleGenerateAiSummary}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    {isGeneratingAi ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-black" />
                    )}
                    <span>{isGeneratingAi ? 'Analyzing with Gemini...' : '✨ Generate AI Summary'}</span>
                  </button>
                </div>

                {aiError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>

              {/* Add Manual Session Entry Form */}
              {showAddEntryForm && (
                <form
                  onSubmit={handleCreateManualEntry}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Log Study Session / Activity for {selectedDate}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddEntryForm(false)}
                      className="text-white/40 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">Subject</label>
                      <select
                        value={entrySubject}
                        onChange={e => setEntrySubject(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Language', 'General Focus'].map(
                          s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">Topic / Description</label>
                      <input
                        type="text"
                        value={entryTopic}
                        onChange={e => setEntryTopic(e.target.value)}
                        placeholder="e.g. Calculus Derivatives"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-white/50 block mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="360"
                        value={entryDuration}
                        onChange={e => setEntryDuration(Number(e.target.value))}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={entryNotes}
                      onChange={e => setEntryNotes(e.target.value)}
                      placeholder="Optional notes or key concepts covered..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!entryTopic.trim()}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 cursor-pointer transition disabled:opacity-50"
                  >
                    Save Activity Record
                  </button>
                </form>
              )}

              {/* Day's Recorded Activity Entries List */}
              {currentRecord?.entries && Object.keys(currentRecord.entries).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recorded Study Activities ({Object.keys(currentRecord.entries).length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {Object.values(currentRecord.entries).map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-cyan-300">{item.description || item.topic}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                              {item.durationMinutes}m
                            </span>
                            {item.time && <span className="text-[10px] text-white/40">{item.time}</span>}
                          </div>
                          {item.notes && <p className="text-[11px] text-white/60">{item.notes}</p>}
                        </div>

                        {onDeleteEntry && (
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(selectedDate, item.id)}
                            className="p-1.5 text-white/40 hover:text-rose-400 transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary Display Card */}
              {aiSummary && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/80 to-black/90 border border-cyan-500/30 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        AI-Generated Daily Summary & Insights (Gemini)
                      </h4>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">Based on your reflection</span>
                  </div>

                  <div className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-white/5">
                    {aiSummary}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Advanced Search & Filtering Toolbar */}
              <div className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Advanced History Search & Filters</span>
                  </div>
                  {(searchQuery || startDateFilter || endDateFilter || subjectFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Keyword Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search notes, topics, or AI summary..."
                      className="w-full bg-black/60 border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <select
                      value={subjectFilter}
                      onChange={e => setSubjectFilter(e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="ALL">All Subjects / Topics</option>
                      {allSubjects.map(subj => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDateFilter}
                      onChange={e => setStartDateFilter(e.target.value)}
                      title="Start Date"
                      className="w-full bg-black/60 border border-cyan-500/30 rounded-xl px-2 py-2 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    />
                    <span className="text-white/40 text-xs">to</span>
                    <input
                      type="date"
                      value={endDateFilter}
                      onChange={e => setEndDateFilter(e.target.value)}
                      title="End Date"
                      className="w-full bg-black/60 border border-cyan-500/30 rounded-xl px-2 py-2 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Results Count */}
              <div className="flex items-center justify-between text-xs text-white/50 px-1">
                <span>
                  Showing <strong className="text-cyan-300">{filteredHistoryDates.length}</strong> of{' '}
                  {sortedDates.length} recorded dates
                </span>
              </div>

              {filteredHistoryDates.length === 0 ? (
                <div className="py-16 text-center text-white/40 space-y-2">
                  <div className="text-3xl">📭</div>
                  <div className="text-xs font-semibold">No matching history records found.</div>
                  <p className="text-[11px] text-white/30">
                    Try adjusting your search query, or write a reflection in the Daily Check-in tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistoryDates.map(dateStr => {
                    const rec = historyMap[dateStr];
                    const isSelected = dateStr === selectedDate;
                    const entriesCount = rec.entries ? Object.keys(rec.entries).length : 0;
                    return (
                      <div
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setActiveTab('reflection');
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-300">📅 {dateStr}</span>
                            <span className="text-[10px] text-white/50 px-2 py-0.5 rounded bg-white/5">
                              {rec.dayOfWeek || getDayOfWeekName(new Date(dateStr + 'T12:00:00'))}
                            </span>
                            {entriesCount > 0 && (
                              <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                                {entriesCount} session{entriesCount > 1 ? 's' : ''} logged
                              </span>
                            )}
                            {rec.aiSummary && (
                              <span className="text-[10px] text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                <span>AI Summary</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40 font-mono">
                            {rec.updatedAt
                              ? `Updated: ${new Date(rec.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : ''}
                          </span>
                        </div>

                        {rec.dailySummaryNotes ? (
                          <p className="text-xs text-white/80 line-clamp-2 bg-black/30 p-2.5 rounded-xl border border-white/5 font-sans">
                            {rec.dailySummaryNotes}
                          </p>
                        ) : entriesCount > 0 ? (
                          <div className="text-[11px] text-white/60 italic bg-black/20 p-2 rounded-xl">
                            {entriesCount} study activity records logged for this day. Click to view.
                          </div>
                        ) : (
                          <p className="text-xs text-white/30 italic">No reflection written for this date.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60 bg-white/[0.01]">
          <div className="flex items-center gap-2 text-[11px]">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Cloud Sync Active • {userEmail ? `Signed in as ${userEmail}` : uid ? `UID: ${uid.slice(0, 8)}...` : 'Local Storage Active'}
            </span>
          </div>

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
};

export default DailyRegistryHistoryModal;
