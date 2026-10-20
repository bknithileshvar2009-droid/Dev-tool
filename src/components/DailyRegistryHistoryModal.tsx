/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  DailyRegistryDayRecord,
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
  onAddManualEntry?: any;
  onDeleteEntry?: any;
  activeTasks?: any[];
}

export const DailyRegistryHistoryModal: React.FC<DailyRegistryHistoryModalProps> = ({
  isOpen,
  onClose,
  uid,
  userEmail,
  historyMap,
  onSaveDayNotes,
}) => {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'reflection' | 'history'>('reflection');

  const currentRecord = historyMap[selectedDate];
  const [reflectionText, setReflectionText] = useState(currentRecord?.dailySummaryNotes || '');
  const [aiSummary, setAiSummary] = useState(currentRecord?.aiSummary || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Search in history
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state when selectedDate changes
  React.useEffect(() => {
    const rec = historyMap[selectedDate];
    setReflectionText(rec?.dailySummaryNotes || '');
    setAiSummary(rec?.aiSummary || '');
    setSaveStatus('idle');
    setAiError(null);
  }, [selectedDate, historyMap]);

  const handleSaveReflection = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      localStorage.setItem(`flocus_reflection_${selectedDate}`, reflectionText);
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
      await onSaveDayNotes(selectedDate, reflectionText, data.summary);
    } catch (err: any) {
      console.error('AI summary generation error:', err);
      setAiError(err.message || 'Failed to connect to AI summarization service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleShiftDate = (offsetDays: number) => {
    const cur = new Date(selectedDate + 'T12:00:00');
    cur.setDate(cur.getDate() + offsetDays);
    setSelectedDate(getLocalDateString(cur));
  };

  const sortedDates = useMemo(() => {
    return Object.keys(historyMap).sort().reverse();
  }, [historyMap]);

  const filteredHistoryDates = useMemo(() => {
    if (!searchQuery.trim()) return sortedDates;
    return sortedDates.filter(d => {
      const rec = historyMap[d];
      const matchDate = d.includes(searchQuery);
      const matchNotes = rec?.dailySummaryNotes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSummary = rec?.aiSummary?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate || matchNotes || matchSummary;
    });
  }, [sortedDates, historyMap, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[90vh] max-h-[850px] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
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
                  Daily Reflection & Activity Record
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>UID: {uid ? uid.slice(0, 8) + '...' : 'Guest'}</span>
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Universal daily check-in, AI-powered insights, and private reflection history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
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
              <span>Daily Check-in</span>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'reflection' ? (
            <div className="space-y-6 animate-in fade-in">
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
                        <span>Synced to Cloud</span>
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Sync Failed (Saved Locally)</span>
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
                  rows={8}
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="Today I worked on... I successfully completed... One challenge I faced was... Tomorrow I plan to..."
                  className="w-full bg-black/60 border border-cyan-500/40 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 font-sans leading-relaxed shadow-inner"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveReflection}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2 border border-white/10"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Save className="w-4 h-4 text-cyan-400" />}
                    <span>{isSaving ? 'Saving...' : 'Save Reflection'}</span>
                  </button>

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

              {/* AI Summary Display Card */}
              {aiSummary && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/80 to-black/90 border border-cyan-500/30 space-y-3 animate-in fade-in shadow-xl">
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
            <div className="space-y-4 animate-in fade-in">
              {/* History Search & Filter */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                <Search className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search past reflections, dates, or summaries..."
                  className="w-full bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              {filteredHistoryDates.length === 0 ? (
                <div className="py-16 text-center text-white/40 space-y-2">
                  <div className="text-3xl">📭</div>
                  <div className="text-xs font-semibold">No history records found.</div>
                  <p className="text-[11px] text-white/30">Complete your daily check-in to build your reflection archive.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistoryDates.map(dateStr => {
                    const rec = historyMap[dateStr];
                    const isSelected = dateStr === selectedDate;
                    return (
                      <div
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setActiveTab('reflection');
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
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
                          </div>
                          <span className="text-[10px] text-white/40 font-mono">
                            Last Updated: {rec.updatedAt ? new Date(rec.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>

                        {rec.dailySummaryNotes ? (
                          <p className="text-xs text-white/80 line-clamp-2 bg-black/30 p-2.5 rounded-xl border border-white/5 font-sans">
                            {rec.dailySummaryNotes}
                          </p>
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
              Cloud Sync Active • Logged in as <strong className="text-white">{userEmail || uid || 'Guest'}</strong>
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
