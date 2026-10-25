/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Study Tracker Unified Storage & Synchronization Service
 * Bi-directionally syncs between:
 * 1. Standalone Chronos Study Tracker (https://nothing-mu-nine.vercel.app/)
 *    - IndexedDB: `ChronosStudyDB` (store: `sessions`)
 *    - LocalStorage: `chronos_study_sessions`, `chronos_active_session`, `chronos_user_settings`
 *    - Firebase Realtime Database: `users/${uid}/sessions` and `users/${uid}/settings`
 * 2. APES AI Study Command Center (https://apesai.vercel.app/)
 *    - Firebase Realtime Database: `users/${uid}/studySessions`, `users/${uid}/focusSessions`, `users/${uid}/dailyRegister`
 *    - LocalStorage: `flocus_user_focus_sessions`, `flocus_daily_registry_history`
 */

import { rtdb, auth } from './firebase';
import {
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
} from 'firebase/database';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PauseInterval {
  pausedAt: number;
  resumedAt: number | null;
}

export type StudyTimerMode = 'stopwatch' | 'countdown' | 'pomodoro';
export type StudySessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface ChronosStudySession {
  id: string; // matches sessionId
  subject: string;
  task?: string;
  chapter?: string;
  notes?: string;
  startTime: number;
  endTime: number | null;
  accumulatedActiveMs: number;
  status: StudySessionStatus;
  mode: StudyTimerMode;
  targetDurationMs?: number;
  pauseIntervals?: PauseInterval[];
  updatedAt: number;
  date: string; // YYYY-MM-DD local
  userId?: string;
  rating?: number; // 1-5
}

export interface ChronosUserSettings {
  studentName: string;
  dailyGoalHours: number;
  defaultSubject: string;
  subjectPresets: string[];
  soundEnabled: boolean;
  autoSaveCloud: boolean;
  themeAccent: string;
  examDate?: string;
  weeklyTargetHours?: number;
}

export const DEFAULT_CHRONOS_SETTINGS: ChronosUserSettings = {
  studentName: 'BK NITHILESHVAR',
  dailyGoalHours: 4,
  defaultSubject: 'General Study',
  subjectPresets: [
    'General Study',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Tamil',
    'English',
  ],
  soundEnabled: true,
  autoSaveCloud: true,
  themeAccent: 'crimson-gold',
  examDate: '2027-03-03',
  weeklyTargetHours: 28,
};

const DB_NAME = 'ChronosStudyDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_ACTIVE = 'active_session';
const STORE_SETTINGS = 'settings';

const LS_SESSIONS = 'chronos_study_sessions';
const LS_ACTIVE = 'chronos_active_session';
const LS_SETTINGS = 'chronos_user_settings';
const LS_APES_SESSIONS = 'flocus_user_focus_sessions';

class StudyTrackerStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  public isIndexedDBAvailable: boolean = false;
  private listeners: Set<(sessions: ChronosStudySession[]) => void> = new Set();
  private settingsListeners: Set<(settings: ChronosUserSettings) => void> = new Set();
  private cachedSessions: ChronosStudySession[] = [];
  private cachedSettings: ChronosUserSettings = DEFAULT_CHRONOS_SETTINGS;
  private rtdbUnsubs: (() => void)[] = [];
  public lastSyncTimestamp: number = 0;
  public syncStatus: 'idle' | 'syncing' | 'synced' | 'error' = 'idle';
  public syncError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.isIndexedDBAvailable = true;
      this.initDB().catch(e => {
        console.warn('[StudyStorage] IndexedDB init fallback:', e);
        this.isIndexedDBAvailable = false;
      });
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e: any) => {
          const db = e.target.result as IDBDatabase;
          if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
            const store = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('startTime', 'startTime', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('subject', 'subject', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_ACTIVE)) {
            db.createObjectStore(STORE_ACTIVE, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
            db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = err => {
          console.warn('[StudyStorage] IndexedDB open error, using localStorage:', err);
          this.isIndexedDBAvailable = false;
          reject(err);
        };
      } catch (err) {
        this.isIndexedDBAvailable = false;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // ================= LOCAL PERSISTENCE =================
  private getLocalSessions(): ChronosStudySession[] {
    if (typeof window === 'undefined') return [];
    try {
      // 1. Check chronos_study_sessions
      const raw = localStorage.getItem(LS_SESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // 2. Check flocus_user_focus_sessions
      const apesRaw = localStorage.getItem(LS_APES_SESSIONS);
      if (apesRaw) {
        const apesParsed = JSON.parse(apesRaw);
        if (Array.isArray(apesParsed) && apesParsed.length > 0) {
          return apesParsed.map(this.fromApesRecord);
        }
      }
    } catch {}
    return [];
  }

  private saveLocalSessions(sessions: ChronosStudySession[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
      // Keep APES AI format in sync too
      const apesFormat = sessions.map(this.toApesRecord);
      localStorage.setItem(LS_APES_SESSIONS, JSON.stringify(apesFormat));
    } catch {}
  }

  public async getAllSessions(): Promise<ChronosStudySession[]> {
    let sessions: ChronosStudySession[] = [];

    if (this.isIndexedDBAvailable) {
      try {
        const db = await this.initDB();
        sessions = await new Promise<ChronosStudySession[]>(resolve => {
          const tx = db.transaction(STORE_SESSIONS, 'readonly');
          const store = tx.objectStore(STORE_SESSIONS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.getLocalSessions());
        });
      } catch {
        sessions = this.getLocalSessions();
      }
    } else {
      sessions = this.getLocalSessions();
    }

    // Merge with any local sessions not yet in IndexedDB
    const fallback = this.getLocalSessions();
    const map = new Map<string, ChronosStudySession>();
    sessions.forEach(s => map.set(s.id, s));
    fallback.forEach(s => {
      if (!map.has(s.id)) map.set(s.id, s);
    });

    const merged = Array.from(map.values()).sort((a, b) => b.startTime - a.startTime);
    this.cachedSessions = merged;
    return merged;
  }

  public async saveSession(session: ChronosStudySession, uid?: string | null): Promise<boolean> {
    const activeUid = uid || auth.currentUser?.uid || 'BK_MASTER_STUDENT_CENTUM_2026';
    session.userId = activeUid;
    session.updatedAt = Date.now();

    // 1. Update in-memory cache
    const existingIdx = this.cachedSessions.findIndex(s => s.id === session.id);
    if (existingIdx >= 0) {
      this.cachedSessions[existingIdx] = session;
    } else {
      this.cachedSessions = [session, ...this.cachedSessions];
    }
    this.cachedSessions.sort((a, b) => b.startTime - a.startTime);

    // 2. Save to localStorage immediately
    this.saveLocalSessions(this.cachedSessions);

    // 3. Save to IndexedDB (matches Chronos Study)
    if (this.isIndexedDBAvailable) {
      try {
        const db = await this.initDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_SESSIONS, 'readwrite');
          const store = tx.objectStore(STORE_SESSIONS);
          const req = store.put(session);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('[StudyStorage] IndexedDB save fallback used:', err);
      }
    }

    // 4. Notify local UI listeners
    this.notifyListeners();

    // 5. Cloud Auto-Sync to Firebase RTDB in both Chronos Study path AND APES AI path
    if (activeUid) {
      this.saveSessionToCloud(session, activeUid).catch(() => {});
    }

    return true;
  }

  public async deleteSession(sessionId: string, uid?: string | null): Promise<boolean> {
    const activeUid = uid || auth.currentUser?.uid || 'BK_MASTER_STUDENT_CENTUM_2026';

    // 1. Update memory
    this.cachedSessions = this.cachedSessions.filter(s => s.id !== sessionId);

    // 2. LocalStorage
    this.saveLocalSessions(this.cachedSessions);

    // 3. IndexedDB
    if (this.isIndexedDBAvailable) {
      try {
        const db = await this.initDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_SESSIONS, 'readwrite');
          const store = tx.objectStore(STORE_SESSIONS);
          const req = store.delete(sessionId);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch {}
    }

    this.notifyListeners();

    // 4. Delete from Firebase RTDB in all paths
    if (activeUid) {
      try {
        await Promise.all([
          rtdbRemove(rtdbRef(rtdb, `users/${activeUid}/sessions/${sessionId}`)),
          rtdbRemove(rtdbRef(rtdb, `users/${activeUid}/studySessions/${sessionId}`)),
          rtdbRemove(rtdbRef(rtdb, `users/${activeUid}/focusSessions/${sessionId}`)),
        ]);
      } catch (err) {
        console.warn('[StudyStorage] Cloud deletion notice:', err);
      }
    }

    return true;
  }

  // ================= ACTIVE SESSION (RECOVERY ACROSS REFRESH) =================
  public async getActiveSession(): Promise<ChronosStudySession | null> {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LS_ACTIVE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  public async saveActiveSession(session: ChronosStudySession | null, uid?: string | null): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      if (session === null) {
        localStorage.removeItem(LS_ACTIVE);
      } else {
        localStorage.setItem(LS_ACTIVE, JSON.stringify(session));
      }
    } catch {}

    const activeUid = uid || auth.currentUser?.uid || 'BK_MASTER_STUDENT_CENTUM_2026';
    if (activeUid) {
      try {
        const targetRef = rtdbRef(rtdb, `users/${activeUid}/activeSession`);
        if (session === null) {
          await rtdbRemove(targetRef);
        } else {
          await rtdbSet(targetRef, session);
        }
      } catch {}
    }
  }

  // ================= USER SETTINGS =================
  public getSettings(): ChronosUserSettings {
    if (typeof window === 'undefined') return DEFAULT_CHRONOS_SETTINGS;
    try {
      const raw = localStorage.getItem(LS_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cachedSettings = { ...DEFAULT_CHRONOS_SETTINGS, ...parsed };
        return this.cachedSettings;
      }
    } catch {}
    return DEFAULT_CHRONOS_SETTINGS;
  }

  public async saveSettings(settings: ChronosUserSettings, uid?: string | null): Promise<void> {
    this.cachedSettings = { ...DEFAULT_CHRONOS_SETTINGS, ...settings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LS_SETTINGS, JSON.stringify(this.cachedSettings));
      } catch {}
    }

    this.settingsListeners.forEach(cb => cb(this.cachedSettings));

    const activeUid = uid || auth.currentUser?.uid || 'BK_MASTER_STUDENT_CENTUM_2026';
    if (activeUid) {
      try {
        await rtdbSet(rtdbRef(rtdb, `users/${activeUid}/settings`), this.cachedSettings);
      } catch {}
    }
  }

  // ================= FIREBASE CLOUD DUAL-SYNC =================
  public async saveSessionToCloud(session: ChronosStudySession, uid: string): Promise<boolean> {
    if (!uid || !session?.id) return false;
    this.syncStatus = 'syncing';
    this.syncError = null;

    try {
      const apesFormat = this.toApesRecord(session);

      // Save to Chronos Study RTDB path: users/${uid}/sessions/${id}
      const chronosRef = rtdbRef(rtdb, `users/${uid}/sessions/${session.id}`);
      // Save to APES AI RTDB paths
      const apesRef = rtdbRef(rtdb, `users/${uid}/studySessions/${session.id}`);
      const focusRef = rtdbRef(rtdb, `users/${uid}/focusSessions/${session.id}`);

      await Promise.all([
        rtdbSet(chronosRef, session),
        rtdbSet(apesRef, apesFormat),
        rtdbSet(focusRef, apesFormat),
      ]);

      this.lastSyncTimestamp = Date.now();
      this.syncStatus = 'synced';
      return true;
    } catch (err: any) {
      console.warn('[StudyStorage] Cloud sync error:', err);
      this.syncStatus = 'error';
      this.syncError = err?.message || 'Sync failed';
      return false;
    }
  }

  public async syncAllToCloud(uid: string): Promise<boolean> {
    if (!uid) return false;
    this.syncStatus = 'syncing';
    this.syncError = null;

    try {
      const sessions = await this.getAllSessions();
      const sessionsMap: Record<string, any> = {};
      const apesMap: Record<string, any> = {};

      sessions.forEach(s => {
        sessionsMap[s.id] = s;
        apesMap[s.id] = this.toApesRecord(s);
      });

      await Promise.all([
        rtdbSet(rtdbRef(rtdb, `users/${uid}/sessions`), sessionsMap),
        rtdbSet(rtdbRef(rtdb, `users/${uid}/studySessions`), apesMap),
        rtdbSet(rtdbRef(rtdb, `users/${uid}/settings`), this.cachedSettings),
      ]);

      this.lastSyncTimestamp = Date.now();
      this.syncStatus = 'synced';
      return true;
    } catch (err: any) {
      this.syncStatus = 'error';
      this.syncError = err?.message || 'Sync failed';
      return false;
    }
  }

  public async fetchSessionsFromCloud(uid: string): Promise<ChronosStudySession[]> {
    if (!uid) return [];
    this.syncStatus = 'syncing';

    const sessionMap = new Map<string, ChronosStudySession>();

    try {
      // 1. Fetch from Chronos Study path: users/${uid}/sessions
      const snapChronos = await rtdbGet(rtdbRef(rtdb, `users/${uid}/sessions`));
      if (snapChronos.exists()) {
        const val = snapChronos.val();
        if (val && typeof val === 'object') {
          Object.values(val).forEach((raw: any) => {
            if (raw && (raw.id || raw.sessionId)) {
              const normalized = this.normalizeSession(raw);
              sessionMap.set(normalized.id, normalized);
            }
          });
        }
      }

      // 2. Fetch from APES AI path: users/${uid}/studySessions
      const snapApes = await rtdbGet(rtdbRef(rtdb, `users/${uid}/studySessions`));
      if (snapApes.exists()) {
        const val = snapApes.val();
        if (val && typeof val === 'object') {
          Object.values(val).forEach((raw: any) => {
            if (raw && (raw.sessionId || raw.id)) {
              const normalized = this.normalizeSession(raw);
              if (!sessionMap.has(normalized.id)) {
                sessionMap.set(normalized.id, normalized);
              }
            }
          });
        }
      }

      // 3. Fetch settings
      const snapSettings = await rtdbGet(rtdbRef(rtdb, `users/${uid}/settings`));
      if (snapSettings.exists()) {
        const cloudSettings = snapSettings.val();
        if (cloudSettings) {
          this.cachedSettings = { ...DEFAULT_CHRONOS_SETTINGS, ...cloudSettings };
          try {
            localStorage.setItem(LS_SETTINGS, JSON.stringify(this.cachedSettings));
          } catch {}
          this.settingsListeners.forEach(cb => cb(this.cachedSettings));
        }
      }

      const list = Array.from(sessionMap.values()).sort((a, b) => b.startTime - a.startTime);

      // Merge with local sessions and save locally
      for (const s of list) {
        if (!this.cachedSessions.some(c => c.id === s.id)) {
          this.cachedSessions.push(s);
        }
      }
      this.cachedSessions.sort((a, b) => b.startTime - a.startTime);
      this.saveLocalSessions(this.cachedSessions);

      this.lastSyncTimestamp = Date.now();
      this.syncStatus = 'synced';
      this.notifyListeners();
      return this.cachedSessions;
    } catch (err: any) {
      console.warn('[StudyStorage] Fetch from cloud warning:', err);
      this.syncStatus = 'error';
      this.syncError = err?.message || 'Cloud fetch failed';
      return this.cachedSessions;
    }
  }

  /**
   * Listen to real-time changes from both Chronos Study and APES AI on Firebase RTDB
   */
  public bindRealtimeCloudSync(uid: string): () => void {
    if (!uid) return () => {};

    // Clear previous
    this.rtdbUnsubs.forEach(u => u());
    this.rtdbUnsubs = [];

    const refChronos = rtdbRef(rtdb, `users/${uid}/sessions`);
    const unsubChronos = rtdbOnValue(refChronos, snap => {
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === 'object') {
          let updated = false;
          Object.values(val).forEach((raw: any) => {
            if (raw && (raw.id || raw.sessionId)) {
              const norm = this.normalizeSession(raw);
              const idx = this.cachedSessions.findIndex(s => s.id === norm.id);
              if (idx < 0) {
                this.cachedSessions.push(norm);
                updated = true;
              } else if (norm.updatedAt > (this.cachedSessions[idx].updatedAt || 0)) {
                this.cachedSessions[idx] = norm;
                updated = true;
              }
            }
          });
          if (updated) {
            this.cachedSessions.sort((a, b) => b.startTime - a.startTime);
            this.saveLocalSessions(this.cachedSessions);
            this.notifyListeners();
          }
        }
      }
    });
    this.rtdbUnsubs.push(unsubChronos);

    return () => {
      this.rtdbUnsubs.forEach(u => u());
      this.rtdbUnsubs = [];
    };
  }

  // ================= FORMAT CONVERTERS =================
  private normalizeSession(raw: any): ChronosStudySession {
    const id = raw.id || raw.sessionId || `session_${Date.now()}`;
    const startTime = raw.startTime || raw.startTimestamp || (raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now());
    const endTime = raw.endTime || raw.endTimestamp || null;
    const accumulatedActiveMs = raw.accumulatedActiveMs ?? ((raw.actualElapsedMinutes || 0) * 60000);

    return {
      id,
      subject: raw.subject || 'General Study',
      task: raw.task || raw.topic || '',
      chapter: raw.chapter || '',
      notes: raw.notes || raw.userReflection || '',
      startTime,
      endTime,
      accumulatedActiveMs,
      status: raw.status || 'completed',
      mode: raw.mode || 'stopwatch',
      targetDurationMs: raw.targetDurationMs || ((raw.plannedDurationMinutes || 0) * 60000),
      pauseIntervals: raw.pauseIntervals || [],
      updatedAt: raw.updatedAt || Date.now(),
      date: raw.date || new Date(startTime).toISOString().slice(0, 10),
      userId: raw.userId,
      rating: raw.rating || 5,
    };
  }

  private toApesRecord(s: ChronosStudySession): any {
    const activeMins = Math.round(s.accumulatedActiveMs / 60000);
    return {
      sessionId: s.id,
      userId: s.userId || 'BK_MASTER_STUDENT_CENTUM_2026',
      subject: s.subject || 'General Study',
      task: s.task || '',
      chapter: s.chapter || '',
      goal: s.task || '',
      plannedDurationMinutes: Math.round((s.targetDurationMs || s.accumulatedActiveMs) / 60000),
      actualElapsedMinutes: activeMins,
      accumulatedActiveMs: s.accumulatedActiveMs,
      startTimestamp: s.startTime,
      endTimestamp: s.endTime,
      status: s.status,
      mode: s.mode,
      pauseIntervals: s.pauseIntervals || [],
      fullscreenExitsCount: 0,
      approvedBreaksCount: s.pauseIntervals?.length || 0,
      totalBreakMinutes: 0,
      userReflection: s.notes || '',
      rating: s.rating || 5,
      createdAt: new Date(s.startTime).toISOString(),
      updatedAt: s.updatedAt || Date.now(),
    };
  }

  private fromApesRecord(r: any): ChronosStudySession {
    const id = r.sessionId || r.id;
    const startTime = r.startTimestamp || (r.createdAt ? new Date(r.createdAt).getTime() : Date.now());
    const accumulatedActiveMs = r.accumulatedActiveMs || ((r.actualElapsedMinutes || 0) * 60000);

    return {
      id,
      subject: r.subject || 'General Study',
      task: r.task || r.goal || '',
      chapter: r.chapter || '',
      notes: r.userReflection || r.notes || '',
      startTime,
      endTime: r.endTimestamp || null,
      accumulatedActiveMs,
      status: r.status || 'completed',
      mode: r.mode || 'stopwatch',
      targetDurationMs: (r.plannedDurationMinutes || 0) * 60000,
      pauseIntervals: r.pauseIntervals || [],
      updatedAt: r.updatedAt || Date.now(),
      date: new Date(startTime).toISOString().slice(0, 10),
      userId: r.userId,
      rating: r.rating || 5,
    };
  }

  // ================= EVENT LISTENERS =================
  public subscribe(cb: (sessions: ChronosStudySession[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.cachedSessions);
    return () => this.listeners.delete(cb);
  }

  public subscribeSettings(cb: (settings: ChronosUserSettings) => void): () => void {
    this.settingsListeners.add(cb);
    cb(this.cachedSettings);
    return () => this.settingsListeners.delete(cb);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.cachedSessions));
  }

  // ================= EXPORTS & BACKUP =================
  public exportCSV(sessions?: ChronosStudySession[]): void {
    const list = sessions || this.cachedSessions;
    const headers = [
      'Session ID',
      'Date',
      'Start Time',
      'End Time',
      'Subject',
      'Topic / Task',
      'Chapter',
      'Active Minutes',
      'Status',
      'Mode',
      'Rating',
      'Notes',
    ];

    const rows = list.map(s => {
      const startDate = new Date(s.startTime).toLocaleDateString();
      const startTime = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const activeMins = Math.round(s.accumulatedActiveMs / 60000);
      return [
        s.id,
        startDate,
        startTime,
        endTime,
        `"${(s.subject || 'General Study').replace(/"/g, '""')}"`,
        `"${(s.task || '').replace(/"/g, '""')}"`,
        `"${(s.chapter || '').replace(/"/g, '""')}"`,
        activeMins,
        s.status,
        s.mode,
        s.rating || 5,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BK_NITHILESHVAR_Study_Sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportJSON(): void {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      studentName: 'BK NITHILESHVAR',
      settings: this.cachedSettings,
      sessions: this.cachedSessions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BK_NITHILESHVAR_Study_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public async importJSON(jsonString: string, mode: 'merge' | 'replace' = 'merge'): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const data = JSON.parse(jsonString);
      const incomingSessions: any[] = Array.isArray(data) ? data : data.sessions || [];
      if (!Array.isArray(incomingSessions)) {
        return { success: false, count: 0, error: 'Invalid backup format: missing sessions array' };
      }

      const normalized = incomingSessions.map(s => this.normalizeSession(s));

      if (mode === 'replace') {
        this.cachedSessions = normalized;
      } else {
        const map = new Map<string, ChronosStudySession>();
        this.cachedSessions.forEach(s => map.set(s.id, s));
        normalized.forEach(s => map.set(s.id, s));
        this.cachedSessions = Array.from(map.values());
      }

      this.cachedSessions.sort((a, b) => b.startTime - a.startTime);
      this.saveLocalSessions(this.cachedSessions);

      if (data.settings && typeof data.settings === 'object') {
        await this.saveSettings(data.settings);
      }

      if (this.isIndexedDBAvailable) {
        try {
          const db = await this.initDB();
          const tx = db.transaction(STORE_SESSIONS, 'readwrite');
          const store = tx.objectStore(STORE_SESSIONS);
          if (mode === 'replace') store.clear();
          normalized.forEach(s => store.put(s));
        } catch {}
      }

      this.notifyListeners();

      const uid = auth.currentUser?.uid || 'BK_MASTER_STUDENT_CENTUM_2026';
      if (uid) {
        this.syncAllToCloud(uid).catch(() => {});
      }

      return { success: true, count: normalized.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'JSON parsing failed' };
    }
  }

  public generatePDFReport(options: {
    sessions?: ChronosStudySession[];
    studentName?: string;
    dateRangeLabel?: string;
    dailyGoalHours?: number;
  }): void {
    const list = options.sessions || this.cachedSessions;
    const name = options.studentName || this.cachedSettings.studentName || 'BK NITHILESHVAR';
    const rangeLabel = options.dateRangeLabel || 'All Recorded History';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalActiveMs = list.reduce((acc, s) => acc + (s.accumulatedActiveMs || 0), 0);
    const totalHours = (totalActiveMs / 3600000).toFixed(1);
    const totalMinutes = Math.round(totalActiveMs / 60000);

    // Subject breakdown
    const subjectMap: Record<string, number> = {};
    list.forEach(s => {
      const sub = s.subject || 'General Study';
      subjectMap[sub] = (subjectMap[sub] || 0) + (s.accumulatedActiveMs || 0);
    });

    // Dark sleek theme for PDF matching APES AI
    // Header block
    doc.setFillColor(8, 12, 22);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212); // Cyan
    doc.setFontSize(16);
    doc.text('APES AI — STUDY COMMAND CENTER REPORT', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(10);
    doc.text(`Student: ${name}  |  Target Range: ${rangeLabel}`, 14, 24);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()}  |  Authoritative Persistent Cloud Records`, 14, 30);

    // Summary Metric Cards
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(14, 42, 58, 22, 2, 2, 'F');
    doc.roundedRect(76, 42, 58, 22, 2, 2, 'F');
    doc.roundedRect(138, 42, 58, 22, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('TOTAL STUDY TIME', 18, 48);
    doc.text('COMPLETED SESSIONS', 80, 48);
    doc.text('SUBJECTS STUDIED', 142, 48);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(6, 182, 212);
    doc.text(`${totalHours} Hours (${totalMinutes}m)`, 18, 58);

    doc.setTextColor(16, 185, 129);
    doc.text(`${list.length} Sessions`, 80, 58);

    doc.setTextColor(245, 158, 11);
    doc.text(`${Object.keys(subjectMap).length} Subjects`, 142, 58);

    // Subject Breakdown mini table
    const subjectRows = Object.entries(subjectMap)
      .sort(([, a], [, b]) => b - a)
      .map(([sub, ms]) => {
        const hrs = (ms / 3600000).toFixed(1);
        const mins = Math.round(ms / 60000);
        const pct = totalActiveMs > 0 ? `${Math.round((ms / totalActiveMs) * 100)}%` : '0%';
        return [sub, `${hrs} hrs (${mins}m)`, pct];
      });

    autoTable(doc, {
      startY: 70,
      head: [['Subject', 'Time Studied', 'Share of Total']],
      body: subjectRows,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 182, 212],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2,
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;

    // Detailed Sessions Table
    const tableRows = list.map(s => {
      const dateStr = new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const timeRange = `${new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${s.endTime ? ' - ' + new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`;
      const activeDuration = `${Math.round(s.accumulatedActiveMs / 60000)}m`;
      const topic = s.task ? `${s.task}${s.chapter ? ' (' + s.chapter + ')' : ''}` : '-';
      return [dateStr, timeRange, s.subject, topic, activeDuration, s.status];
    });

    autoTable(doc, {
      startY: finalY + 8,
      head: [['Date', 'Time Window', 'Subject', 'Topic / Chapter', 'Active Duration', 'Status']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [241, 245, 249],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 32 },
        2: { cellWidth: 34 },
        3: { cellWidth: 54 },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: data => {
        // Page numbers footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} — APES AI / Chronos Study Unified Command Center`,
          14,
          290
        );
      },
    });

    doc.save(`BK_NITHILESHVAR_Study_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}

export const studyStorage = new StudyTrackerStorageService();
