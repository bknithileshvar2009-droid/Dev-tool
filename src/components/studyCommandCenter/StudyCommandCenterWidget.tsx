/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Study Command Center Dashboard Widget
 * Compact, interactive draggable dashboard card for APES AI
 * Connects directly to studyStorage (Chronos Study & Firebase RTDB dual-sync)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Flame,
  Award,
  Maximize2,
  RefreshCw,
  ExternalLink,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  studyStorage,
  ChronosStudySession,
  ChronosUserSettings,
  DEFAULT_CHRONOS_SETTINGS,
} from '../../utils/studyTrackerStorage';

interface StudyCommandCenterWidgetProps {
  uid: string | null;
  activeSubject?: string;
  activeTask?: string;
  onOpenCommandCenter: () => void;
  glassBg?: boolean;
}

export default function StudyCommandCenterWidget({
  uid,
  activeSubject = 'Mathematics',
  activeTask = '',
  onOpenCommandCenter,
  glassBg = true,
}: StudyCommandCenterWidgetProps) {
  const activeUid = uid || 'BK_MASTER_STUDENT_CENTUM_2026';

  const [sessions, setSessions] = useState<ChronosStudySession[]>([]);
  const [settings, setSettings] = useState<ChronosUserSettings>(DEFAULT_CHRONOS_SETTINGS);
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [currentSubject, setCurrentSubject] = useState<string>(activeSubject || 'Mathematics');
  const [currentTopic, setCurrentTopic] = useState<string>(activeTask || '');

  const timerStartMsRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const activeSessionRef = useRef<ChronosStudySession | null>(null);

  useEffect(() => {
    studyStorage.getAllSessions().then(s => setSessions(s));
    setSettings(studyStorage.getSettings());

    const unsubSessions = studyStorage.subscribe(s => setSessions(s));
    const unsubSettings = studyStorage.subscribeSettings(s => setSettings(s));

    studyStorage.getActiveSession().then(act => {
      if (act && act.status === 'active') {
        activeSessionRef.current = act;
        setCurrentSubject(act.subject);
        setCurrentTopic(act.task || '');
        accumulatedMsRef.current = act.accumulatedActiveMs || 0;
        timerStartMsRef.current = act.startTime || Date.now();
        setTimerStatus('running');
        startTicker();
      }
    });

    return () => {
      unsubSessions();
      unsubSettings();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTicker = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const currentMs = accumulatedMsRef.current + (now - timerStartMsRef.current);
      setTimerSeconds(Math.floor(currentMs / 1000));
    }, 1000);
  };

  const handleStart = () => {
    const now = Date.now();
    timerStartMsRef.current = now;
    accumulatedMsRef.current = 0;
    setTimerStatus('running');

    const session: ChronosStudySession = {
      id: `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
      subject: currentSubject || 'General Study',
      task: currentTopic || '',
      startTime: now,
      endTime: null,
      accumulatedActiveMs: 0,
      status: 'active',
      mode: 'stopwatch',
      updatedAt: now,
      date: new Date(now).toISOString().slice(0, 10),
      userId: activeUid,
      rating: 5,
    };

    activeSessionRef.current = session;
    studyStorage.saveActiveSession(session, activeUid);
    startTicker();
  };

  const handlePause = () => {
    if (timerStatus !== 'running') return;
    const now = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedMsRef.current += (now - timerStartMsRef.current);
    setTimerStatus('paused');

    if (activeSessionRef.current) {
      activeSessionRef.current.accumulatedActiveMs = accumulatedMsRef.current;
      activeSessionRef.current.status = 'paused';
      studyStorage.saveActiveSession(activeSessionRef.current, activeUid);
    }
  };

  const handleResume = () => {
    if (timerStatus !== 'paused') return;
    const now = Date.now();
    timerStartMsRef.current = now;
    setTimerStatus('running');

    if (activeSessionRef.current) {
      activeSessionRef.current.status = 'active';
      studyStorage.saveActiveSession(activeSessionRef.current, activeUid);
    }
    startTicker();
  };

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const now = Date.now();
    let finalActiveMs = accumulatedMsRef.current;
    if (timerStatus === 'running') {
      finalActiveMs += (now - timerStartMsRef.current);
    }

    if (finalActiveMs >= 10000 && activeSessionRef.current) {
      const completed: ChronosStudySession = {
        ...activeSessionRef.current,
        endTime: now,
        accumulatedActiveMs: finalActiveMs,
        status: 'completed',
        updatedAt: now,
      };
      await studyStorage.saveSession(completed, activeUid);
    }

    setTimerStatus('idle');
    setTimerSeconds(0);
    accumulatedMsRef.current = 0;
    activeSessionRef.current = null;
    await studyStorage.saveActiveSession(null, activeUid);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMs = todaySessions.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0);
  const todayHours = (todayMs / 3600000).toFixed(1);
  const goalHours = settings.dailyGoalHours || 4;
  const goalPercent = Math.min(100, Math.round((todayMs / (goalHours * 3600000)) * 100));

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`w-full h-full p-4 flex flex-col justify-between ${
      glassBg ? 'card-glass' : 'bg-transparent border border-white/10'
    } rounded-2xl text-slate-100 select-none overflow-hidden relative`}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white uppercase tracking-wider">Study Command Center</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Chronos Study Dual-Sync
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCommandCenter}
          className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
          title="Open Full 18-Widget Study Command Center"
        >
          <Maximize2 className="w-3 h-3" />
          <span className="hidden sm:inline">Suite</span>
        </button>
      </div>

      {/* Center: Live Timer Display & Quick Metrics */}
      <div className="py-2 space-y-2">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">
              {timerStatus === 'running' ? 'Active Timer' : timerStatus === 'paused' ? 'Paused' : 'Study Timer'}
            </div>
            <div className="text-2xl font-mono font-black text-cyan-400 tracking-wider">
              {formatSec(timerSeconds)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-slate-400 font-mono">Today: {todayHours}h / {goalHours}h</div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{goalPercent}% Goal</div>
          </div>
        </div>

        {/* Subject & Topic Select */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <select
            value={currentSubject}
            disabled={timerStatus !== 'idle'}
            onChange={e => setCurrentSubject(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-white text-[11px] focus:outline-none"
          >
            {settings.subjectPresets.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Topic / Chapter..."
            value={currentTopic}
            disabled={timerStatus !== 'idle'}
            onChange={e => setCurrentTopic(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-white text-[11px] focus:outline-none"
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
        {timerStatus === 'idle' && (
          <button
            onClick={handleStart}
            className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start</span>
          </button>
        )}
        {timerStatus === 'running' && (
          <>
            <button
              onClick={handlePause}
              className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>Pause</span>
            </button>
            <button
              onClick={handleStop}
              className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Finish</span>
            </button>
          </>
        )}
        {timerStatus === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </button>
            <button
              onClick={handleStop}
              className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Finish</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenCommandCenter}
          className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition cursor-pointer font-medium"
          title="Open Full Study Command Center Suite"
        >
          More
        </button>
      </div>

    </div>
  );
}
