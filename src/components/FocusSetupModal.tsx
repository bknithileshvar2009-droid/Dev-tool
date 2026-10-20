import React, { useState } from 'react';
import {
  Flame,
  X,
  Clock,
  BookOpen,
  Target,
  Coffee,
  Maximize,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface FocusSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: {
    subject: string;
    task: string;
    goal?: string;
    durationMinutes: number;
    plannedBreak: boolean;
  }) => void;
  availableTasks?: { id: string; text: string }[];
  defaultDuration?: number;
}

const COMMON_SUBJECTS = [
  'Chemistry',
  'Physics',
  'Mathematics',
  'Biology',
  'Computer Science',
  'English Literature',
  'General Revision',
];

export default function FocusSetupModal({
  isOpen,
  onClose,
  onStartSession,
  availableTasks = [],
  defaultDuration = 25,
}: FocusSetupModalProps) {
  const [step, setStep] = useState<'configure' | 'confirm'>('configure');
  const [subject, setSubject] = useState<string>('Chemistry');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(defaultDuration);
  const [customDurationInput, setCustomDurationInput] = useState<string>('');
  const [plannedBreak, setPlannedBreak] = useState<boolean>(true);

  if (!isOpen) return null;

  const finalSubject = subject === 'custom' ? (customSubject.trim() || 'General Study') : subject;
  const finalTask = task.trim() || 'Deep Focus Sprint';

  const handlePresetDuration = (mins: number) => {
    setDurationMinutes(mins);
    setCustomDurationInput('');
  };

  const handleCustomDurationChange = (val: string) => {
    setCustomDurationInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 360) {
      setDurationMinutes(parsed);
    }
  };

  const plannedEndTime = new Date(Date.now() + durationMinutes * 60 * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLaunch = () => {
    onStartSession({
      subject: finalSubject,
      task: finalTask,
      goal: goal.trim() || undefined,
      durationMinutes,
      plannedBreak,
    });
    setStep('configure');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#090e1a] border border-amber-500/40 p-6 sm:p-7 shadow-[0_30px_90px_rgba(245,158,11,0.25)] flex flex-col text-white animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{step === 'configure' ? 'Focus Session Setup' : 'Confirm Study Sprint'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                  PHASE 2
                </span>
              </h3>
              <p className="text-[11px] text-white/50">
                {step === 'configure'
                  ? 'Define your subject, study goal, and duration'
                  : 'Review session parameters before entering fullscreen'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CONFIGURE */}
        {step === 'configure' && (
          <div className="space-y-4">
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Subject / Discipline</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {COMMON_SUBJECTS.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left truncate ${
                      subject === sub
                        ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSubject('custom')}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    subject === 'custom'
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  + Custom Subject
                </button>
              </div>

              {subject === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom subject (e.g., Organic Synthesis)"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white outline-none focus:border-cyan-400"
                />
              )}
            </div>

            {/* Task Input & Quick Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Specific Study Task</span>
                </label>
                {availableTasks.length > 0 && (
                  <span className="text-[10px] text-white/40">From active sprint</span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g., Solve 20 electrochemistry practice problems"
                value={task}
                onChange={e => setTask(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white outline-none focus:border-amber-400"
              />

              {availableTasks.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px]">
                  <span className="text-white/40 text-[10px] shrink-0">Quick picks:</span>
                  {availableTasks.slice(0, 3).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTask(t.text)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 truncate max-w-[160px] shrink-0"
                    >
                      {t.text}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Session Goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Session Goal (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Complete Chapter 5 summary notes without distractions"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            {/* Duration Presets + Custom */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Session Duration</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[25, 45, 60, 90].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handlePresetDuration(mins)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                      durationMinutes === mins && !customDurationInput
                        ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={240}
                    placeholder="Custom"
                    value={customDurationInput}
                    onChange={e => handleCustomDurationChange(e.target.value)}
                    className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold outline-none border transition ${
                      customDurationInput
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-white/5 text-white/70 border-white/10'
                    }`}
                  />
                  {customDurationInput && (
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-black pointer-events-none">
                      m
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Planned Break Setting */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coffee className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">5-Minute Recovery Break</div>
                  <div className="text-[10px] text-white/50">Authorized via Brevo transactional email approval</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={plannedBreak}
                onChange={e => setPlannedBreak(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMATION SCREEN */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                <Maximize className="w-4 h-4" />
                <span>Distraction-Free Fullscreen Study Session</span>
              </div>
              <p className="text-white/80 leading-relaxed text-[11px]">
                Upon starting, APESFLOW will request browser fullscreen mode. Normal in-app exit buttons are hidden during the session to foster unwavering focus.
              </p>
            </div>

            {/* Summary Details */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white/50">Subject</span>
                <span className="font-bold text-cyan-300">{finalSubject}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white/50">Specific Task</span>
                <span className="font-semibold text-white truncate max-w-[220px]">{finalTask}</span>
              </div>

              {goal && (
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-white/50">Target Goal</span>
                  <span className="font-semibold text-emerald-300 truncate max-w-[220px]">{goal}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white/50">Duration & End Time</span>
                <span className="font-mono font-bold text-amber-300">
                  {durationMinutes} mins • Ends at {plannedEndTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/50">Break Authorization</span>
                <span className="text-white/80 font-medium">
                  {plannedBreak ? '5m Brevo Email Code Available' : 'No planned pause'}
                </span>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleLaunch}
                className="flex-1 py-3.5 px-4 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>Confirm & Launch Focus Session</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="py-3 px-4 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 transition cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
