/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Flame,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { FocusSessionRecord, saveStudySessionRecord } from '../utils/firebase';

interface StudyTimeTrackerProps {
  uid: string | null;
  activeSubject?: string;
  activeTask?: string;
  onSessionCompleted?: (record: FocusSessionRecord) => void;
  onOpenHistory?: () => void;
}

export default function StudyTimeTracker({
  uid,
  activeSubject = 'Mathematics',
  activeTask = 'Deep Study Sprint',
  onSessionCompleted,
  onOpenHistory,
}: StudyTimeTrackerProps) {
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [accumulatedPausedMs, setAccumulatedPausedMs] = useState<number>(0);
  const [pauseStartTimestamp, setPauseStartTimestamp] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>(activeSubject);
  const [taskName, setTaskName] = useState<string>(activeTask);

  const transitionLockRef = useRef<boolean>(false);

  // Keep subject & task synced if activeSubject changes while idle
  useEffect(() => {
    if (sessionState === 'idle') {
      setSubject(activeSubject);
      setTaskName(activeTask);
    }
  }, [activeSubject, activeTask, sessionState]);

  // Accurate timestamp-based timer to avoid drift
  useEffect(() => {
    let animId: number | null = null;
    let intervalId: number | null = null;

    if (sessionState === 'running') {
      const updateTimer = () => {
        const now = Date.now();
        const activeDurationMs = now - startTimestamp - accumulatedPausedMs;
        setElapsedSeconds(Math.max(0, Math.floor(activeDurationMs / 1000)));
      };

      updateTimer();
      intervalId = window.setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [sessionState, startTimestamp, accumulatedPausedMs]);

  // START STUDY
  const handleStartStudy = useCallback(() => {
    if (transitionLockRef.current || sessionState === 'running') return;
    transitionLockRef.current = true;

    const now = Date.now();
    const newSessionId = `study_${now}_${Math.random().toString(36).substring(2, 7)}`;

    setSessionId(newSessionId);
    setStartTimestamp(now);
    setAccumulatedPausedMs(0);
    setElapsedSeconds(0);
    setSessionState('running');

    console.log(`[StudyTimeTracker] Started study session ${newSessionId} for UID: ${uid || 'guest'}`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 400);
  }, [sessionState, uid]);

  // PAUSE STUDY
  const handlePauseStudy = useCallback(() => {
    if (transitionLockRef.current || sessionState !== 'running') return;
    transitionLockRef.current = true;

    setPauseStartTimestamp(Date.now());
    setSessionState('paused');

    console.log(`[StudyTimeTracker] Paused study session ${sessionId}`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 400);
  }, [sessionState, sessionId]);

  // RESUME STUDY
  const handleResumeStudy = useCallback(() => {
    if (transitionLockRef.current || sessionState !== 'paused') return;
    transitionLockRef.current = true;

    const pauseDurationMs = Date.now() - pauseStartTimestamp;
    setAccumulatedPausedMs(prev => prev + pauseDurationMs);
    setSessionState('running');

    console.log(`[StudyTimeTracker] Resumed study session ${sessionId}`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 400);
  }, [sessionState, sessionId, pauseStartTimestamp]);

  // STOP STUDY & PERSIST TO users/{uid}/studySessions
  const handleStopStudy = useCallback(async () => {
    if (transitionLockRef.current || sessionState === 'idle' || isSaving) return;
    transitionLockRef.current = true;

    const now = Date.now();
    const finalElapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const record: FocusSessionRecord = {
      sessionId: sessionId || `study_${now}`,
      userId: uid || 'guest',
      subject: subject || 'General Study',
      task: taskName || 'Focus Sprint',
      plannedDurationMinutes: finalElapsedMins,
      actualElapsedMinutes: finalElapsedMins,
      startTimestamp: startTimestamp || (now - elapsedSeconds * 1000),
      endTimestamp: now,
      status: 'completed',
      fullscreenExitsCount: 0,
      approvedBreaksCount: 0,
      totalBreakMinutes: Math.round(accumulatedPausedMs / 60000),
      createdAt: new Date(now).toISOString(),
    };

    setIsSaving(true);
    setSessionState('completed');

    if (uid) {
      try {
        console.log(`[Firebase StudyTime Write] Saving session to users/${uid}/studySessions/`, record);
        await saveStudySessionRecord(uid, record);
        if (onSessionCompleted) onSessionCompleted(record);
      } catch (err) {
        console.warn('Failed to persist study session to users/{uid}/studySessions:', err);
      }
    } else {
      console.log('[StudyTimeTracker] Session concluded locally (unauthenticated).');
      if (onSessionCompleted) onSessionCompleted(record);
    }

    setIsSaving(false);
    setTimeout(() => {
      setSessionState('idle');
      setElapsedSeconds(0);
      transitionLockRef.current = false;
    }, 1800);
  }, [
    sessionState,
    isSaving,
    elapsedSeconds,
    sessionId,
    uid,
    subject,
    taskName,
    startTimestamp,
    accumulatedPausedMs,
    onSessionCompleted,
  ]);

  const formatDisplay = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full p-5 flex flex-col justify-between text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 no-drag">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              sessionState === 'running'
                ? 'bg-emerald-400 animate-ping'
                : sessionState === 'paused'
                ? 'bg-amber-400'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300 flex items-center gap-1.5 font-mono">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Study Time Tracker</span>
          </span>
        </div>

        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="text-[10px] text-cyan-300/80 hover:text-cyan-200 underline cursor-pointer font-mono flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            <span>History & PDF</span>
          </button>
        )}
      </div>

      {/* Subject & Topic inputs / badges */}
      <div className="pt-2 no-drag flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/50 uppercase">Subject:</span>
        {sessionState === 'idle' ? (
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject name..."
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-0.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 outline-none flex-1 max-w-[140px]"
          />
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold text-[11px] border border-cyan-500/30 truncate max-w-[150px]">
            {subject}
          </span>
        )}
      </div>

      {/* Central Big Digits Counter */}
      <div className="py-3 text-center space-y-1 no-drag">
        <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] tabular-digits">
          {formatDisplay(elapsedSeconds)}
        </div>
        <div className="text-[11px] font-mono text-cyan-300/70">
          {sessionState === 'running'
            ? '● ACTIVE STUDY SPRINT'
            : sessionState === 'paused'
            ? '❚❚ SESSION PAUSED'
            : sessionState === 'completed'
            ? '✓ SAVED TO USERS/{UID}/STUDYSESSIONS'
            : 'READY TO STUDY'}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 no-drag">
        {sessionState === 'idle' && (
          <button
            type="button"
            onClick={handleStartStudy}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START STUDY</span>
          </button>
        )}

        {sessionState === 'running' && (
          <>
            <button
              type="button"
              onClick={handlePauseStudy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 font-bold text-xs border border-amber-500/40 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </button>
            <button
              type="button"
              onClick={handleStopStudy}
              disabled={isSaving}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{isSaving ? 'SAVING...' : 'STOP STUDY'}</span>
            </button>
          </>
        )}

        {sessionState === 'paused' && (
          <>
            <button
              type="button"
              onClick={handleResumeStudy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME</span>
            </button>
            <button
              type="button"
              onClick={handleStopStudy}
              disabled={isSaving}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP STUDY</span>
            </button>
          </>
        )}

        {sessionState === 'completed' && (
          <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Study Session Recorded!</span>
          </div>
        )}
      </div>
    </div>
  );
}
