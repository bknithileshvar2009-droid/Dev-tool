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
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  FocusSessionRecord,
  saveStudySessionRecord,
  saveActiveStudySession,
  loadActiveStudySession,
  splitSessionByLocalCalendarDays,
  getLocalDateString,
  SINGLE_USER_MASTER_UID,
} from '../utils/firebase';
import MobileStudyHistoryView from './MobileStudyHistoryView';

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
  const activeUid = uid || SINGLE_USER_MASTER_UID;
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [accumulatedPausedMs, setAccumulatedPausedMs] = useState<number>(0);
  const [pauseStartTimestamp, setPauseStartTimestamp] = useState<number>(0);
  const [optionalNotes, setOptionalNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Mobile Screen Responsive Mode Detection
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState<'history' | 'timer'>(() => (typeof window !== 'undefined' && window.innerWidth < 768) ? 'history' : 'timer');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3D Tilt & Holographic Lighting State
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; gx: number; gy: number; isHover: boolean }>({
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 50,
    isHover: false,
  });

  const transitionLockRef = useRef<boolean>(false);
  const isRecoveringRef = useRef<boolean>(false);

  // 1. 3D POINTER TRACKING FOR IRON MAN HOLOGRAPHIC TILT
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    // Max rotation: -12deg to +12deg
    const ry = ((x - midX) / midX) * 11;
    const rx = -((y - midY) / midY) * 11;

    // Glare coordinates in percent
    const gx = Math.round((x / rect.width) * 100);
    const gy = Math.round((y / rect.height) * 100);

    setTilt({ rx, ry, gx, gy, isHover: true });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt(prev => ({ ...prev, rx: 0, ry: 0, isHover: false }));
  }, []);

  // 2. RECOVERY: On mount or UID change, recover any active running/paused session
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

      // Check Firebase RTDB for active session
      if (activeUid) {
        loadActiveStudySession(activeUid).then(remoteActive => {
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
  }, [activeUid]);

  // 3. PERSISTENCE: Save active state to localStorage & Firebase RTDB whenever running or paused
  useEffect(() => {
    if (isRecoveringRef.current) return;

    if (sessionState === 'idle' || sessionState === 'completed') {
      try {
        localStorage.removeItem(ACTIVE_STORAGE_KEY);
      } catch {}
      if (activeUid) {
        saveActiveStudySession(activeUid, null).catch(() => {});
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
        userId: activeUid,
      };
      try {
        localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(activePayload));
      } catch {}
      if (activeUid) {
        saveActiveStudySession(activeUid, activePayload).catch(() => {});
      }
    }
  }, [sessionState, sessionId, startTimestamp, accumulatedPausedMs, pauseStartTimestamp, optionalNotes, activeUid]);

  // 4. ACCURATE DRIFT-FREE INTERVAL & BACKGROUND TAB HANDLING
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

  // 5. TODAY'S ACCUMULATED STUDY TIME & SESSION COUNT
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

    const initialPayload = {
      sessionId: newSessionId,
      status: 'running' as const,
      startTimestamp: now,
      accumulatedPausedMs: 0,
      pauseStartTimestamp: null,
      notes: '',
      updatedAt: now,
      userId: activeUid,
    };

    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(initialPayload));
    } catch {}

    saveActiveStudySession(activeUid, initialPayload).catch(() => {});

    setSessionId(newSessionId);
    setStartTimestamp(now);
    setAccumulatedPausedMs(0);
    setPauseStartTimestamp(0);
    setElapsedSeconds(0);
    setSessionState('running');
    setSyncNotice('Session Active (Firebase Live)');

    console.log(`[StudyTimer] Started general study session ${newSessionId}`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [sessionState, activeUid]);

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

    const pausedPayload = {
      sessionId,
      status: 'paused' as const,
      startTimestamp,
      accumulatedPausedMs,
      pauseStartTimestamp: now,
      notes: optionalNotes,
      updatedAt: now,
      userId: activeUid,
    };

    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(pausedPayload));
    } catch {}

    saveActiveStudySession(activeUid, pausedPayload).catch(() => {});

    setSyncNotice('Session Paused');
    console.log(`[StudyTimer] Paused session ${sessionId} at ${Math.floor(activeMs / 1000)}s`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [sessionState, sessionId, startTimestamp, accumulatedPausedMs, optionalNotes, activeUid]);

  // CONTROL 3: RESUME STUDY
  // - Continues same session from accumulated duration, doesn't count paused time
  const handleResumeStudy = useCallback(() => {
    if (transitionLockRef.current || sessionState !== 'paused') return;
    transitionLockRef.current = true;

    const now = Date.now();
    const pauseDurationMs = Math.max(0, now - pauseStartTimestamp);
    const newAccumulatedPausedMs = accumulatedPausedMs + pauseDurationMs;

    setAccumulatedPausedMs(newAccumulatedPausedMs);
    setPauseStartTimestamp(0);
    setSessionState('running');

    const resumedPayload = {
      sessionId,
      status: 'running' as const,
      startTimestamp,
      accumulatedPausedMs: newAccumulatedPausedMs,
      pauseStartTimestamp: null,
      notes: optionalNotes,
      updatedAt: now,
      userId: activeUid,
    };

    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(resumedPayload));
    } catch {}

    saveActiveStudySession(activeUid, resumedPayload).catch(() => {});

    setSyncNotice('Session Resumed');
    console.log(`[StudyTimer] Resumed session ${sessionId} (added ${Math.round(pauseDurationMs / 1000)}s to paused duration)`);
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [sessionState, sessionId, pauseStartTimestamp, accumulatedPausedMs, startTimestamp, optionalNotes, activeUid]);

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
      userId: activeUid,
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

    // 1. Clear local active session storage and immediately update history state
    try {
      localStorage.removeItem(ACTIVE_STORAGE_KEY);
    } catch {}

    if (onSessionCompleted) {
      onSessionCompleted(record);
    }

    // 2. Persist to Firebase Realtime Database and Cloud Firestore
    try {
      setSyncNotice('Saving to Firebase...');
      const success = await saveStudySessionRecord(activeUid, record);
      if (success) {
        setSyncNotice('Saved to Firebase');
        console.log(`[StudyTimer] Session ${finalSessionId} permanently saved to users/${activeUid}/studySessions`);
      } else {
        setSyncNotice('Saved locally (Firebase auth/rules required)');
      }
    } catch (err) {
      console.warn('[StudyTimer] Save error, retained locally:', err);
      setSyncNotice('Saved locally (network pending)');
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

  if (isMobile && mobileTab === 'history') {
    return (
      <div className="w-full h-full flex flex-col overflow-y-auto">
        {/* Mobile View Mode Switcher Header */}
        <div className="sticky top-0 z-30 p-2 bg-[#060b17]/95 backdrop-blur-md border-b border-cyan-500/30 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setMobileTab('history')}
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)] transition cursor-pointer"
            >
              📊 Study History
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('timer')}
              className="px-3 py-1.5 rounded-lg font-bold text-xs text-white/70 hover:text-white transition cursor-pointer"
            >
              ⚡ Live Arc Timer
            </button>
          </div>

          {(sessionState === 'running' || sessionState === 'paused') && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] animate-pulse">
              <span>● Active: {formatHHMMSS(elapsedSeconds)}</span>
            </div>
          )}
        </div>

        <MobileStudyHistoryView
          uid={activeUid}
          sessions={existingSessions}
          onRetry={() => {
            if (activeUid) loadActiveStudySession(activeUid).catch(() => {});
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full select-none"
      style={{ perspective: '1100px' }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 3D Transform Container with dynamic tilt and preserve-3d */}
      <div
        ref={cardRef}
        className="w-full h-full relative rounded-2xl overflow-hidden text-white flex flex-col justify-between p-4 transition-transform duration-150 ease-out border border-cyan-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.2)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          background: 'linear-gradient(135deg, rgba(8, 14, 26, 0.94) 0%, rgba(4, 8, 16, 0.97) 100%)',
        }}
      >
        {/* Layer 0: Titanium Hexagon Matrix & Holographic Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6,182,212,0.15) 0%, transparent 70%),
              linear-gradient(rgba(6,182,212,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px',
            transform: 'translateZ(0px)',
          }}
        />

        {/* Dynamic Holographic Cursor Glare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 180px at ${tilt.gx}% ${tilt.gy}%, rgba(6,182,212,0.18), transparent 70%)`,
            opacity: tilt.isHover ? 1 : 0.4,
            transform: 'translateZ(10px)',
          }}
        />

        {/* Layer 1: Iron Man Arc Reactor Rotating HUD Reticles */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none flex items-center justify-center opacity-30"
          style={{ transform: 'translate(-50%, -50%) translateZ(15px)' }}
        >
          {/* Outer Segmented Arc Ring (Slow Clockwise Spin) */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 ${
              sessionState === 'running' ? 'animate-[spin_24s_linear_infinite]' : ''
            }`}
          />
          {/* Inner Counter-Rotating Reticle */}
          <div
            className={`absolute inset-4 rounded-full border border-cyan-300/30 ${
              sessionState === 'running' ? 'animate-[spin_14s_linear_infinite_reverse]' : ''
            }`}
            style={{ borderStyle: 'dotted' }}
          />
          {/* Core Glow Pulse */}
          <div
            className={`w-20 h-20 rounded-full blur-xl transition-all duration-500 ${
              sessionState === 'running'
                ? 'bg-cyan-400/35 animate-pulse'
                : sessionState === 'paused'
                ? 'bg-amber-400/30'
                : 'bg-cyan-500/15'
            }`}
          />
        </div>

        {/* Top Stark Chevrons & HUD Bar (translateZ: 25px) */}
        <div
          className="relative z-10 flex items-center justify-between pb-2 border-b border-cyan-500/20 no-drag"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-colors ${
                sessionState === 'running'
                  ? 'bg-emerald-400 text-emerald-400 animate-ping'
                  : sessionState === 'paused'
                  ? 'bg-amber-400 text-amber-400'
                  : 'bg-cyan-400 text-cyan-400'
              }`}
            />
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-black tracking-wider text-cyan-300 uppercase">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
              <span className="drop-shadow-[0_0_6px_#06b6d4]">STARK_ARC_HUD // MK-85</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncNotice && (
              <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {syncNotice}
              </span>
            )}
            {isMobile ? (
              <button
                type="button"
                onClick={() => setMobileTab('history')}
                className="text-[10px] bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/40 font-mono font-bold cursor-pointer transition flex items-center gap-1 active:scale-95"
              >
                <span>📊 History</span>
              </button>
            ) : onOpenHistory ? (
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-[10px] text-cyan-300 hover:text-white underline cursor-pointer font-mono flex items-center gap-1 transition drop-shadow-[0_0_5px_#06b6d4] active:scale-95"
                title="View full historical records & PDF export"
              >
                <BookOpen className="w-3 h-3" />
                <span>History →</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Today's Cumulative Study Total Strip */}
        <div
          className="relative z-10 pt-1 flex items-center justify-between text-[11px] font-mono text-white/70 no-drag"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/60">Today's Total:</span>
            <strong className="text-amber-300 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              {todayStats.formatted}
            </strong>
          </div>
          <span className="text-[10px] text-cyan-400/70 font-mono">
            {todayStats.count} {todayStats.count === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        {/* Central Holographic Digits Display (translateZ: 45px) */}
        <div
          className="relative z-10 py-2 text-center space-y-1.5 no-drag my-auto"
          style={{ transform: 'translateZ(45px)' }}
        >
          {/* Luminous HH:MM:SS Extruded Digits */}
          <div
            className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-digits select-none"
            style={{
              textShadow:
                '0 0 12px rgba(6,182,212,0.9), 0 0 25px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.3)',
            }}
          >
            {formatHHMMSS(elapsedSeconds)}
          </div>

          {/* Stark Status Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold tracking-widest uppercase">
            {sessionState === 'running' ? (
              <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)] flex items-center gap-1 animate-pulse">
                <span>●</span> ARC REACTOR ACTIVE // ZERO-DRIFT SYNC
              </span>
            ) : sessionState === 'paused' ? (
              <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] flex items-center gap-1">
                <span>❚❚</span> REPULSOR LOCK // DURATION FROZEN
              </span>
            ) : sessionState === 'completed' ? (
              <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.7)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>SESSION RECORDED TO FIREBASE</span>
              </span>
            ) : (
              <span className="text-cyan-300/80 tracking-widest">
                QUANTUM CORE STANDBY // READY TO INITIATE
              </span>
            )}
          </div>
        </div>

        {/* Tactile 3D Action Controls (translateZ: 35px) */}
        <div
          className="relative z-10 pt-2 border-t border-cyan-500/20 flex items-center justify-center gap-2 no-drag"
          style={{ transform: 'translateZ(35px)' }}
        >
          {sessionState === 'idle' && (
            <button
              type="button"
              onClick={handleStartStudy}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/40 hover:to-teal-500/40 text-emerald-300 border border-emerald-400/60 font-black text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95 active:translate-y-0.5"
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
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 font-bold text-xs border border-amber-400/50 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 active:translate-y-0.5"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </button>
              <button
                type="button"
                onClick={handleStopAndSave}
                disabled={isSaving}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500/25 to-red-500/25 hover:from-rose-500/45 hover:to-red-500/45 text-rose-200 font-black text-xs border border-rose-400/60 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(244,63,94,0.35)] active:scale-95 active:translate-y-0.5 disabled:opacity-50"
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
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/60 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] active:scale-95 active:translate-y-0.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RESUME</span>
              </button>
              <button
                type="button"
                onClick={handleStopAndSave}
                disabled={isSaving}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500/25 to-red-500/25 hover:from-rose-500/45 hover:to-red-500/45 text-rose-200 font-black text-xs border border-rose-400/60 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(244,63,94,0.35)] active:scale-95 active:translate-y-0.5 disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isSaving ? 'SAVING...' : 'STOP AND SAVE'}</span>
              </button>
            </>
          )}

          {sessionState === 'completed' && (
            <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>SAVED PERMANENTLY TO FIREBASE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
