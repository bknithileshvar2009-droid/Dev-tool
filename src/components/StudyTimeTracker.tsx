/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Flame,
  CheckCircle2,
  BookOpen,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import {
  FocusSessionRecord,
  saveStudySessionRecord,
  saveActiveStudySession,
  loadActiveStudySession,
  splitSessionByLocalCalendarDays,
  getLocalDateString,
} from '../utils/firebase';

interface StudyTimeTrackerProps {
  uid: string | null;
  activeSubject?: string;
  activeTask?: string;
  existingSessions?: FocusSessionRecord[];
  onSessionCompleted?: (record: FocusSessionRecord) => void;
  onOpenHistory?: () => void;
}

const ACTIVE_STORAGE_KEY = 'apesai_active_study_session';

export default function StudyTimeTracker({
  uid,
  activeSubject,
  activeTask,
  existingSessions = [],
  onSessionCompleted,
  onOpenHistory,
}: StudyTimeTrackerProps) {
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [accumulatedPausedMs, setAccumulatedPausedMs] = useState<number>(0);
  const [pauseStartTimestamp, setPauseStartTimestamp] = useState<number>(0);
  const [optionalNotes, setOptionalNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const transitionLockRef = useRef<boolean>(false);
  const isRecoveringRef = useRef<boolean>(false);

  // 1. RECOVERY: On mount or UID change, recover any active running/paused session
  useEffect(() => {
    isRecoveringRef.current = true;
    try {
      // First check local storage
      const savedRaw = localStorage.getItem(ACTIVE_STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved && saved.sessionId && (saved.status === 'running' || saved.status === 'paused')) {
          const now = Date.now();
          const start = saved.startTimestamp || now;
          const pausedMs = saved.accumulatedPausedMs || 0;
          setSessionId(saved.sessionId);
          setStartTimestamp(start);
          setAccumulatedPausedMs(pausedMs);
          setOptionalNotes(saved.notes || '');

          if (saved.status === 'running') {
            const currentActiveSec = Math.max(0, Math.floor((now - start - pausedMs) / 1000));
            setElapsedSeconds(currentActiveSec);
            setSessionState('running');
            console.log(`[StudyTimer Recovery] Restored running session ${saved.sessionId} (${currentActiveSec}s elapsed)`);
          } else if (saved.status === 'paused') {
            const pauseStart = saved.pauseStartTimestamp || now;
            setPauseStartTimestamp(pauseStart);
            const frozenSec = Math.max(0, Math.floor((pauseStart - start - pausedMs) / 1000));
            setElapsedSeconds(frozenSec);
            setSessionState('paused');
            console.log(`[StudyTimer Recovery] Restored paused session ${saved.sessionId} (${frozenSec}s active)`);
          }
          isRecoveringRef.current = false;
          return;
        }
      }

      // If nothing in localStorage and UID exists, check Firebase RTDB for active session
      if (uid) {
        loadActiveStudySession(uid).then(remoteActive => {
          if (remoteActive && remoteActive.sessionId && (remoteActive.status === 'running' || remoteActive.status === 'paused')) {
            const now = Date.now();
            const start = remoteActive.startTimestamp || now;
            const pausedMs = remoteActive.accumulatedPausedMs || 0;
            setSessionId(remoteActive.sessionId);
            setStartTimestamp(start);
            setAccumulatedPausedMs(pausedMs);
            setOptionalNotes(remoteActive.notes || '');

            if (remoteActive.status === 'running') {
              const currentActiveSec = Math.max(0, Math.floor((now - start - pausedMs) / 1000));
              setElapsedSeconds(currentActiveSec);
              setSessionState('running');
            } else {
              const pauseStart = remoteActive.pauseStartTimestamp || now;
              setPauseStartTimestamp(pauseStart);
              const frozenSec = Math.max(0, Math.floor((pauseStart - start - pausedMs) / 1000));
              setElapsedSeconds(frozenSec);
              setSessionState('paused');
            }
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('[StudyTimer Recovery] Error restoring session:', err);
    } finally {
      isRecoveringRef.current = false;
    }
  }, [uid]);

  // 2. PERSISTENCE: Save active state to localStorage & Firebase RTDB whenever running or paused
  useEffect(() => {
    if (isRecoveringRef.current) return;

    if (sessionState === 'idle' || sessionState === 'completed') {
      try {
        localStorage.removeItem(ACTIVE_STORAGE_KEY);
      } catch {}
      if (uid) {
        saveActiveStudySession(uid, null).catch(() => {});
      }
    } else if (sessionState === 'running' || sessionState === 'paused') {
      const activePayload = {
        sessionId,
        status: sessionState,
        startTimestamp,
        accumulatedPausedMs,
        pauseStartTimestamp: sessionState === 'paused' ? pauseStartTimestamp : null,
        notes: optionalNotes,
        updatedAt: Date.now(),
        userId: uid || 'guest',
      };
      try {
        localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(activePayload));
      } catch {}
      if (uid) {
        saveActiveStudySession(uid, activePayload).catch(() => {});
      }
    }
  }, [sessionState, sessionId, startTimestamp, accumulatedPausedMs, pauseStartTimestamp, optionalNotes, uid]);

  // 3. ACCURATE DRIFT-FREE INTERVAL & BACKGROUND TAB HANDLING
  useEffect(() => {
    if (sessionState !== 'running') return;

    const computeCurrentElapsed = () => {
      const now = Date.now();
      const activeDurationMs = Math.max(0, now - startTimestamp - accumulatedPausedMs);
      setElapsedSeconds(Math.floor(activeDurationMs / 1000));
    };

    computeCurrentElapsed();
    const intervalId = window.setInterval(computeCurrentElapsed, 500);

    // Visibility change / focus listener for zero-drift background recalculation
    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        computeCurrentElapsed();
      }
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [sessionState, startTimestamp, accumulatedPausedMs]);

  // 4. TODAY'S ACCUMULATED STUDY TIME & SESSION COUNT
  const todayStats = useMemo(() => {
    const todayStr = getLocalDateString();
    let totalSec = 0;
    let count = 0;

    existingSessions.forEach(s => {
      const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : 0);
      const sEnd = s.endTimestamp || (sStart + (s.actualElapsedMinutes || 0) * 60000);
      const activeSec = (s.actualElapsedMinutes || 0) * 60;

      // Use midnight split calculation to assign exact active seconds to today
      const split = splitSessionByLocalCalendarDays(sStart, sEnd, activeSec);
      if (split[todayStr]) {
        totalSec += split[todayStr];
        count += 1;
      }
    });

    // If a session is currently active, add its current elapsed seconds to today's count
    if (sessionState === 'running' || sessionState === 'paused') {
      totalSec += elapsedSeconds;
    }

    const totalHours = Math.floor(totalSec / 3600);
    const totalMinutes = Math.floor((totalSec % 3600) / 60);

    return {
      totalSeconds: totalSec,
      formatted: totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`,
      count,
    };
  }, [existingSessions, sessionState, elapsedSeconds]);

  // CONTROL 1: START STUDY
  // - Starts immediately, NO subject prompt, NO mandatory fields, unlimited sessions per day
  const handleStartStudy = useCallback(() => {
    if (transitionLockRef.current) return;
    if (sessionState === 'running' || sessionState === 'paused') {
      console.log('[StudyTimer] Session already active; showing existing session.');
      return;
    }
    transitionLockRef.current = true;

    const now = Date.now();
    const newSessionId = `study_${now}_${Math.random().toString(36).substring(2, 8)}`;

    setSessionId(newSessionId);
    setStartTimestamp(now);
    setAccumulatedPausedMs(0);
    setPauseStartTimestamp(0);
    setElapsedSeconds(0);
    setSessionState('running');
    setSyncNotice(null);

    console.log(`[StudyTimer] Started general study session ${newSessionId}`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [sessionState]);

  // CONTROL 2: PAUSE STUDY
  // - Freezes accumulated duration, preserves session, excludes paused time
  const handlePauseStudy = useCallback(() => {
    if (transitionLockRef.current || sessionState !== 'running') return;
    transitionLockRef.current = true;

    const now = Date.now();
    setPauseStartTimestamp(now);
    setSessionState('paused');

    // Calculate exact frozen seconds up to the pause moment
    const activeMs = Math.max(0, now - startTimestamp - accumulatedPausedMs);
    setElapsedSeconds(Math.floor(activeMs / 1000));

    console.log(`[StudyTimer] Paused session ${sessionId} at ${Math.floor(activeMs / 1000)}s`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [sessionState, sessionId, startTimestamp, accumulatedPausedMs]);

  // CONTROL 3: RESUME STUDY
  // - Continues same session from accumulated duration, doesn't count paused time
  const handleResumeStudy = useCallback(() => {
    if (transitionLockRef.current || sessionState !== 'paused') return;
    transitionLockRef.current = true;

    const now = Date.now();
    const pauseDurationMs = Math.max(0, now - pauseStartTimestamp);
    setAccumulatedPausedMs(prev => prev + pauseDurationMs);
    setPauseStartTimestamp(0);
    setSessionState('running');

    console.log(`[StudyTimer] Resumed session ${sessionId} (added ${Math.round(pauseDurationMs / 1000)}s to paused duration)`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [sessionState, sessionId, pauseStartTimestamp]);

  // CONTROL 4: STOP AND SAVE
  // - Finalizes session, persists actual accumulated duration, prevents duplicate writes on repeated clicks
  const handleStopAndSave = useCallback(async () => {
    if (transitionLockRef.current || sessionState === 'idle' || isSaving) return;
    transitionLockRef.current = true;
    setIsSaving(true);

    const now = Date.now();
    // Calculate final active seconds
    let finalActiveMs = 0;
    if (sessionState === 'paused' && pauseStartTimestamp > 0) {
      finalActiveMs = Math.max(0, pauseStartTimestamp - startTimestamp - accumulatedPausedMs);
    } else {
      finalActiveMs = Math.max(0, now - startTimestamp - accumulatedPausedMs);
    }

    const finalActiveSec = Math.max(1, Math.floor(finalActiveMs / 1000));
    const finalElapsedMins = Math.max(1, Math.round(finalActiveSec / 60));

    const finalSessionId = sessionId || `study_${now}_${Math.random().toString(36).substring(2, 8)}`;
    const finalStart = startTimestamp || (now - finalActiveMs);

    const record: FocusSessionRecord = {
      sessionId: finalSessionId,
      userId: uid || 'guest',
      subject: activeSubject || 'General Study',
      task: activeTask || 'General Study Session',
      goal: optionalNotes.trim() || undefined,
      plannedDurationMinutes: finalElapsedMins,
      actualElapsedMinutes: finalElapsedMins,
      startTimestamp: finalStart,
      endTimestamp: now,
      status: 'completed',
      fullscreenExitsCount: 0,
      approvedBreaksCount: 0,
      totalBreakMinutes: Math.round(accumulatedPausedMs / 60000),
      createdAt: new Date(now).toISOString(),
    };

    setSessionState('completed');

    // 1. Clear local active session storage
    try {
      localStorage.removeItem(ACTIVE_STORAGE_KEY);
    } catch {}

    // 2. Persist to Firebase Realtime Database and Cloud Firestore
    if (uid) {
      try {
        setSyncNotice('Saving to Firebase...');
        const success = await saveStudySessionRecord(uid, record);
        if (success) {
          setSyncNotice('Saved to Firebase');
          console.log(`[StudyTimer] Session ${finalSessionId} permanently saved to users/${uid}/studySessions`);
        } else {
          setSyncNotice('Saved locally (offline mode)');
        }
      } catch (err) {
        console.warn('[StudyTimer] Save error, retained locally:', err);
        setSyncNotice('Saved locally (network pending)');
      }
    } else {
      setSyncNotice('Saved locally');
    }

    if (onSessionCompleted) {
      onSessionCompleted(record);
    }

    // Reset timer to clean idle state
    setTimeout(() => {
      setSessionState('idle');
      setElapsedSeconds(0);
      setSessionId('');
      setStartTimestamp(0);
      setAccumulatedPausedMs(0);
      setPauseStartTimestamp(0);
      setOptionalNotes('');
      setIsSaving(false);
      transitionLockRef.current = false;
      setTimeout(() => setSyncNotice(null), 3000);
    }, 1200);
  }, [
    sessionState,
    isSaving,
    sessionId,
    startTimestamp,
    accumulatedPausedMs,
    pauseStartTimestamp,
    optionalNotes,
    uid,
    activeSubject,
    activeTask,
    onSessionCompleted,
  ]);

  // Format display as HH:MM:SS
  const formatHHMMSS = (totalSec: number) => {
    const hrs = Math.floor(Math.max(0, totalSec) / 3600);
    const mins = Math.floor((Math.max(0, totalSec) % 3600) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between text-white select-none relative overflow-hidden">
      {/* 3D Glassmorphism Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
      
      {/* Subtle Depth-giving inner highlight */}
      <div className="absolute inset-x-2 top-1 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      {/* Main Content (relative to stay above backdrop) */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 no-drag">
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
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-mono">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Study Time Tracker</span>
            </span>
          </div>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-[10px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer font-mono flex items-center gap-1 transition"
            >
              <BookOpen className="w-3 h-3" />
              <span>History & PDF →</span>
            </button>
          )}
        </div>

        {/* Today's Cumulative Study Total Pill */}
        <div className="pt-2 no-drag flex items-center justify-between text-[11px] text-white/70">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's Total:</span>
            <strong className="text-amber-300 font-bold">{todayStats.formatted}</strong>
          </div>
          <div className="text-[10px] text-white/50 font-mono">
            <span>{todayStats.count} session{todayStats.count !== 1 ? 's' : ''} today</span>
          </div>
        </div>

        {/* Main Digits Display (HH:MM:SS) */}
        <div className="py-2.5 text-center space-y-1 no-drag">
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] tabular-digits">
            {formatHHMMSS(elapsedSeconds)}
          </div>
          <div className="text-[10px] font-mono text-cyan-300/80 uppercase tracking-widest">
            {sessionState === 'running'
              ? '● ACCUMULATING STUDY TIME'
              : sessionState === 'paused'
              ? '❚❚ SESSION PAUSED (TIME FROZEN)'
              : sessionState === 'completed'
              ? '✓ SESSION FINALIZED & SAVED'
              : 'READY TO START (UNLIMITED SESSIONS)'}
          </div>
          {syncNotice && (
            <div className="text-[10px] font-mono text-emerald-400 animate-pulse">
              {syncNotice}
            </div>
          )}
        </div>

        {/* Action Controls: 4 Explicit Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 no-drag">
          {sessionState === 'idle' && (
            <button
              type="button"
              onClick={handleStartStudy}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/80 hover:bg-emerald-400 text-black font-black text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(16,185,129,0.3),inset_0_2px_1px_rgba(255,255,255,0.2)] active:scale-95"
              title="Start a new general study session immediately"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START STUDY</span>
            </button>
          )}

          {sessionState === 'running' && (
            <>
              <button
                type="button"
                onClick={handlePauseStudy}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 font-bold text-xs border border-amber-500/40 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                title="Pause study timer (freeze accumulated duration)"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </button>
              <button
                type="button"
                onClick={handleStopAndSave}
                disabled={isSaving}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500/80 hover:bg-rose-400 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_5px_15px_rgba(244,63,94,0.3),inset_0_2px_1px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50"
                title="Stop timer and save session to Firebase"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isSaving ? 'SAVING...' : 'STOP AND SAVE'}</span>
              </button>
            </>
          )}

          {sessionState === 'paused' && (
            <>
              <button
                type="button"
                onClick={handleResumeStudy}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_5px_15px_rgba(16,185,129,0.3),inset_0_2px_1px_rgba(255,255,255,0.2)] active:scale-95"
                title="Resume same study session without counting pause time"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RESUME</span>
              </button>
              <button
                type="button"
                onClick={handleStopAndSave}
                disabled={isSaving}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500/80 hover:bg-rose-400 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_5px_15px_rgba(244,63,94,0.3),inset_0_2px_1px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50"
                title="Stop and save session to Firebase"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isSaving ? 'SAVING...' : 'STOP AND SAVE'}</span>
              </button>
            </>
          )}

          {sessionState === 'completed' && (
            <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Study Session Finalized & Recorded!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
