/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
  runTransaction as rtdbRunTransaction,
} from 'firebase/database';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const configAny = firebaseConfig as Record<string, any>;
const customDbId = (configAny.firestoreDatabaseId &&
  configAny.firestoreDatabaseId !== '(default)' &&
  typeof configAny.firestoreDatabaseId === 'string' &&
  configAny.firestoreDatabaseId.trim() !== '')
  ? configAny.firestoreDatabaseId
  : undefined;

// Initialize Firestore with experimentalForceLongPolling to avoid WebChannel connection timeouts
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, customDbId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on demand
 */
export async function testConnection(): Promise<boolean> {
  try {
    const probePromise = getDoc(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('the client is offline or timed out')), 3500)
    );
    await Promise.race([probePromise, timeoutPromise]);
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('timed out'))) {
      console.warn('Firestore operating in offline mode or awaiting initial server response.');
    } else {
      console.warn('Firestore probe notice:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

// In-memory access token cache for Google Workspace APIs (per security guidelines)
let cachedAccessToken: string | null = null;

export const getGmailAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setGmailAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

/**
 * Sign in using Google Auth Provider via Popup
 */
export async function signInWithGoogle(): Promise<{ user: User; accessToken: string | null }> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.error('Google Sign In failed:', err);
    throw err;
  }
}

/**
 * Sign in as Guest / Anonymous user
 * Allows immediate data testing without OAuth domain whitelisting
 */
export async function signInAsGuest(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err: any) {
    console.error('Guest Sign In failed:', err);
    throw err;
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (err: any) {
    console.error('Email Sign In failed:', err);
    throw err;
  }
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (err: any) {
    console.error('Email Sign Up failed:', err);
    throw err;
  }
}

/**
 * Sign out current user
 */
export async function logOutUser(): Promise<void> {
  cachedAccessToken = null;
  await signOut(auth);
}

export interface UserDashboardPayload {
  userId: string;
  config: any;
  tasks: any[];
  dailyRegister?: any[];
  scratchpad?: string;
  presets?: any[];
  wallpaperFavorites?: string[];
  wallpaperRecent?: string[];
  favouriteQuotes?: string[];
  studyStreak?: number;
  pomoStreak?: number;
  updatedAt: string;
}

/**
 * Save user dashboard data to Firebase
 * Primary: Realtime Database under users/{uid}/dashboard
 * Redundancy: Firestore under users/{uid}/dashboard/data
 */
export async function saveUserDashboard(uid: string, dashboardData: Partial<UserDashboardPayload> & { config?: any; tasks?: any[]; updatedAt?: string }): Promise<boolean> {
  if (!uid) return false;

  const payload: UserDashboardPayload = {
    userId: uid,
    config: dashboardData.config || {},
    tasks: Array.isArray(dashboardData.tasks) ? dashboardData.tasks : [],
    dailyRegister: Array.isArray(dashboardData.dailyRegister) ? dashboardData.dailyRegister : (dashboardData.config?.dailyRegister || []),
    scratchpad: typeof dashboardData.scratchpad === 'string' ? dashboardData.scratchpad : '',
    presets: Array.isArray(dashboardData.presets) ? dashboardData.presets : [],
    wallpaperFavorites: Array.isArray(dashboardData.wallpaperFavorites) ? dashboardData.wallpaperFavorites : [],
    wallpaperRecent: Array.isArray(dashboardData.wallpaperRecent) ? dashboardData.wallpaperRecent : [],
    favouriteQuotes: Array.isArray(dashboardData.favouriteQuotes) ? dashboardData.favouriteQuotes : [],
    studyStreak: typeof dashboardData.studyStreak === 'number' ? dashboardData.studyStreak : (typeof dashboardData.pomoStreak === 'number' ? dashboardData.pomoStreak : 0),
    updatedAt: dashboardData.updatedAt || new Date().toISOString(),
  };

  let firestoreSuccess = false;

  // 1. Primary Cloud Firestore write
  const fsPath = `users/${uid}/dashboard/data`;
  try {
    const docRef = doc(db, 'users', uid, 'dashboard', 'data');
    await setDoc(docRef, payload, { merge: true });
    firestoreSuccess = true;
    console.log(`[Firebase Firestore] Write succeeded for UID: ${uid} at path: ${fsPath}`);
  } catch (fsErr) {
    console.warn(`[Firebase Firestore Error] Write failed for UID: ${uid} at path ${fsPath}:`, fsErr);
  }

  // 2. Non-blocking RTDB mirror
  try {
    const rtdbTargetRef = rtdbRef(rtdb, `users/${uid}/dashboard`);
    rtdbSet(rtdbTargetRef, payload).catch(() => {});
  } catch {}

  if (firestoreSuccess) {
    return true;
  }

  throw new Error(`Failed to save dashboard for user ${uid} to Firestore.`);
}

/**
 * Load user dashboard data from Firebase
 * Queries Cloud Firestore (users/{uid}/dashboard/data) as primary.
 */
export async function loadUserDashboard(uid: string): Promise<UserDashboardPayload | null> {
  if (!uid) return null;

  console.log(`[Firebase] Starting dashboard restoration query for UID: ${uid}`);

  // 1. Try Cloud Firestore (Primary path: users/{uid}/dashboard/data)
  const fsPath = `users/${uid}/dashboard/data`;
  try {
    const docRef = doc(db, 'users', uid, 'dashboard', 'data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const val = snap.data();
      if (val && (val.config || val.tasks)) {
        console.log(`[Firebase Firestore] Found saved dashboard for UID: ${uid} at path ${fsPath}`);
        return val as UserDashboardPayload;
      }
    }
  } catch (fsErr) {
    console.warn(`[Firebase Firestore Notice] Read failed for UID: ${uid}:`, fsErr);
  }

  // 2. Optional RTDB fallback
  try {
    const rtdbTargetRef = rtdbRef(rtdb, `users/${uid}/dashboard`);
    const snap = await rtdbGet(rtdbTargetRef);
    if (snap.exists()) {
      const val = snap.val();
      if (val && (val.config || val.tasks)) {
        return val as UserDashboardPayload;
      }
    }
  } catch {}

  return null;
}

/**
 * Real-time Auto-Sync Listener for User Dashboard
 * Listens to Realtime Database changes under users/{uid}/dashboard,
 * with Firestore onSnapshot fallback.
 */
export function subscribeToUserDashboard(
  uid: string,
  onData: (data: UserDashboardPayload) => void,
  onError?: (error: unknown) => void
): () => void {
  if (!uid) return () => {};

  let activeUnsubscribe: (() => void) | null = null;

  try {
    const rtdbTargetRef = rtdbRef(rtdb, `users/${uid}/dashboard`);
    const unsubscribeRtdb = rtdbOnValue(
      rtdbTargetRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && (val.config || val.tasks)) {
            onData(val as UserDashboardPayload);
          }
        }
      },
      (err) => {
        console.warn(`[Firebase RTDB Sync Error] Listener notice for UID: ${uid}:`, err);
        if (onError) onError(err);
      }
    );
    activeUnsubscribe = unsubscribeRtdb;
  } catch (err) {
    console.warn(`[Firebase RTDB] Failed to bind onValue listener for UID: ${uid}:`, err);
  }

  // Also bind Firestore onSnapshot as secondary channel
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const docRef = doc(db, 'users', uid, 'dashboard', 'data');
    unsubscribeFirestore = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const val = snap.data();
          if (val && (val.config || val.tasks)) {
            onData(val as UserDashboardPayload);
          }
        }
      },
      (err) => {
        // Secondary channel notice - RTDB remains the primary channel
        console.warn(`[Firestore Secondary Sync Notice] UID: ${uid}:`, err?.message || err);
      }
    );
  } catch {
    // ignore
  }

  return () => {
    if (activeUnsubscribe) activeUnsubscribe();
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

export {
  signOut,
  onAuthStateChanged,
  type User,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbRunTransaction,
};

/**
 * Format local date as YYYY-MM-DD
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Record Daily Study Attendance Check-in
 */
export async function recordDailyCheckin(
  userId?: string,
  userName?: string
): Promise<{ streak: number; date: string; alreadyCheckedIn: boolean }> {
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const storedDate = localStorage.getItem('flocus_last_checkin_date');
  const storedStreak = parseInt(localStorage.getItem('flocus_study_streak') || '0', 10);

  if (storedDate === todayStr) {
    return {
      streak: Math.max(1, storedStreak),
      date: todayStr,
      alreadyCheckedIn: true,
    };
  }

  let newStreak = 1;
  if (storedDate === yesterdayStr) {
    newStreak = (storedStreak > 0 ? storedStreak : 0) + 1;
  } else {
    // If first time or missed day, start at 1
    newStreak = storedStreak > 0 && !storedDate ? storedStreak + 1 : 1;
  }

  // Update local storage immediately for zero-lag UI
  localStorage.setItem('flocus_last_checkin_date', todayStr);
  localStorage.setItem('flocus_study_streak', String(newStreak));

  // Sync to Firebase Realtime Database under daily_checkins/
  try {
    const cleanUid = userId ? userId.replace(/[.#$[\]]/g, '_') : 'guest_student';
    const checkinRef = rtdbRef(rtdb, `daily_checkins/${cleanUid}/${todayStr}`);
    await rtdbSet(checkinRef, {
      date: todayStr,
      timestamp: Date.now(),
      streak: newStreak,
      userId: userId || 'guest',
      userName: userName || 'Student',
    });

    // Also update global checkin index for live telemetry
    const globalSummaryRef = rtdbRef(rtdb, `daily_checkins/summary/${cleanUid}`);
    await rtdbSet(globalSummaryRef, {
      lastCheckinDate: todayStr,
      streak: newStreak,
      lastActive: Date.now(),
    });
  } catch (err) {
    console.warn('Realtime Database daily_checkin notice (using local storage fallback):', err);
  }

  return { streak: newStreak, date: todayStr, alreadyCheckedIn: false };
}

/**
 * Read Initial Study Check-in Status
 */
export function getInitialCheckinStatus(): {
  isCheckedInToday: boolean;
  streak: number;
  lastDate: string | null;
} {
  const todayStr = getLocalDateString();
  const storedDate = localStorage.getItem('flocus_last_checkin_date');
  const storedStreak = parseInt(localStorage.getItem('flocus_study_streak') || '0', 10);

  const isCheckedInToday = storedDate === todayStr;
  return {
    isCheckedInToday,
    streak: storedStreak > 0 ? storedStreak : 0,
    lastDate: storedDate,
  };
}

/**
 * Increment and listen for live site visitors/views in Firebase Realtime Database
 * Under path: site_telemetry/views
 */
export function listenAndIncrementVisitorCount(
  onViewsUpdate: (count: number) => void
): () => void {
  const viewsRef = rtdbRef(rtdb, 'site_telemetry/views');

  // Initial fallback from localStorage or default baseline
  const cachedViews = parseInt(localStorage.getItem('flocus_total_views') || '142', 10);
  onViewsUpdate(cachedViews);

  // Automatically increment the total view count on initial page load
  const sessionKey = 'flocus_telemetry_view_counted';
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, 'true');
    try {
      rtdbRunTransaction(viewsRef, (currentVal) => {
        const val = typeof currentVal === 'number' && !isNaN(currentVal) ? currentVal : cachedViews;
        return val + 1;
      }).catch((err) => {
        console.warn('Visitor view count transaction notice:', err);
        const fallback = cachedViews + 1;
        localStorage.setItem('flocus_total_views', String(fallback));
        onViewsUpdate(fallback);
      });
    } catch (err) {
      console.warn('Visitor counter init notice:', err);
    }
  }

  // Real-time listener using onValue
  try {
    const unsubscribe = rtdbOnValue(
      viewsRef,
      (snapshot) => {
        const val = snapshot.val();
        if (typeof val === 'number' && !isNaN(val)) {
          localStorage.setItem('flocus_total_views', String(val));
          onViewsUpdate(val);
        } else if (val === null) {
          // If node doesn't exist yet, seed it with 1
          rtdbSet(viewsRef, 1).catch(() => {});
          onViewsUpdate(1);
        }
      },
      (err) => {
        console.warn('Realtime Database views onValue notice:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Realtime Database listener failed:', err);
    return () => {};
  }
}

// ==============================================================================
// 10. FIREBASE DAILY REGISTRY + PERSONAL HISTORY PERSISTENCE
// ==============================================================================

export interface DailyRegistryEntryItem {
  id: string;
  timestamp: string; // ISO string e.g. 2026-10-19T14:30:00.000Z
  time: string; // HH:mm local e.g. 14:30
  eventType: 'study_session' | 'task_completed' | 'revision' | 'syllabus_update' | 'manual_log' | 'exam_prep' | 'goal_achieved';
  description: string;
  topic?: string;
  subject?: string;
  durationMinutes: number;
  notes?: string;
  status: 'completed' | 'in-progress' | 'review-needed';
  rating?: number; // 1 to 5
  createdAt: number;
}

export interface DailyRegistryDayRecord {
  userId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. Monday
  subjectsStudied: string[];
  plannedTasks: Array<{ id: string; text: string; completed: boolean; subject?: string; priority?: string }>;
  completedTasks: Array<{ id: string; text: string; completedAt: string; subject?: string }>;
  studySessions: Array<{ id: string; mode: string; durationMinutes: number; completedAt: string; subject?: string }>;
  totalStudyMinutes: number;
  tuitionRevisionProgress: string;
  dailyGoals: string[];
  dailySummaryNotes: string;
  aiSummary?: string;
  examPrepProgress: string;
  entries: Record<string, DailyRegistryEntryItem>;
  updatedAt: string;
}

export function getDayOfWeekName(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Save or merge a full day's registry record in Firebase
 * Primary: users/{uid}/dailyRegistry/{YYYY-MM-DD}
 * Dual-save: Firestore users/{uid}/dailyRegistry/{YYYY-MM-DD}
 */
export async function saveDailyRegistryDay(
  uid: string,
  date: string,
  record: Partial<DailyRegistryDayRecord>
): Promise<boolean> {
  if (!uid || !date) return false;

  const nowIso = new Date().toISOString();
  const dayOfWeek = record.dayOfWeek || getDayOfWeekName(new Date(date + 'T12:00:00'));

  const payload: DailyRegistryDayRecord = {
    userId: uid,
    date,
    dayOfWeek,
    subjectsStudied: Array.isArray(record.subjectsStudied) ? record.subjectsStudied : [],
    plannedTasks: Array.isArray(record.plannedTasks) ? record.plannedTasks : [],
    completedTasks: Array.isArray(record.completedTasks) ? record.completedTasks : [],
    studySessions: Array.isArray(record.studySessions) ? record.studySessions : [],
    totalStudyMinutes: typeof record.totalStudyMinutes === 'number' ? record.totalStudyMinutes : 0,
    tuitionRevisionProgress: record.tuitionRevisionProgress || '',
    dailyGoals: Array.isArray(record.dailyGoals) ? record.dailyGoals : [],
    dailySummaryNotes: record.dailySummaryNotes || '',
    aiSummary: record.aiSummary || '',
    examPrepProgress: record.examPrepProgress || '',
    entries: record.entries || {},
    updatedAt: record.updatedAt || nowIso,
  };

  try {
    const docRef = doc(db, 'users', uid, 'dailyRegistry', date);
    await setDoc(docRef, payload, { merge: true });
    console.log(`[DailyRegistry Firestore] Saved day ${date} for UID: ${uid}`);

    // Optional non-blocking RTDB mirror
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyRegistry/${date}`);
      rtdbSet(targetRef, payload).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.error(`[DailyRegistry Firestore Error] Save failed for day ${date}:`, err);
    throw err;
  }
}

/**
 * Save an individual activity entry to users/{uid}/dailyRegistry/{YYYY-MM-DD}/entries/{entryId}
 * Safely adds or updates the entry in Firestore without destroying other entries or overwriting the day!
 */
export async function saveDailyRegistryEntryItem(
  uid: string,
  date: string,
  entry: DailyRegistryEntryItem,
  dayMeta?: Partial<DailyRegistryDayRecord>
): Promise<boolean> {
  if (!uid || !date || !entry || !entry.id) return false;

  const nowIso = new Date().toISOString();

  try {
    const docRef = doc(db, 'users', uid, 'dailyRegistry', date);
    await setDoc(docRef, {
      userId: uid,
      date,
      updatedAt: nowIso,
      entries: {
        [entry.id]: entry,
      },
      ...(dayMeta || {}),
    }, { merge: true });

    console.log(`[DailyRegistry Firestore] Entry ${entry.id} saved for ${date}`);

    // Optional non-blocking RTDB mirror
    try {
      const entryRef = rtdbRef(rtdb, `users/${uid}/dailyRegistry/${date}/entries/${entry.id}`);
      rtdbSet(entryRef, entry).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.error(`[DailyRegistry Save Error] Write failed for entry ${entry.id}:`, err);
    throw err;
  }
}

/**
 * Update dailySummaryNotes and aiSummary in Firestore without altering other records
 */
export async function updateDailySummaryNotes(
  uid: string,
  date: string,
  notes: string,
  aiSummary?: string
): Promise<boolean> {
  if (!uid || !date) return false;
  const nowIso = new Date().toISOString();

  const payload: Record<string, any> = {
    userId: uid,
    date,
    dailySummaryNotes: notes,
    updatedAt: nowIso,
  };
  if (aiSummary !== undefined) {
    payload.aiSummary = aiSummary;
  }

  try {
    const docRef = doc(db, 'users', uid, 'dailyRegistry', date);
    await setDoc(docRef, payload, { merge: true });
    console.log(`[DailyRegistry Firestore] Updated summary notes and AI summary for ${date}`);

    // Optional non-blocking RTDB mirror
    try {
      const dayRef = rtdbRef(rtdb, `users/${uid}/dailyRegistry/${date}`);
      rtdbUpdate(dayRef, payload).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.error(`[DailyRegistry Error] Failed to update summary notes:`, err);
    throw err;
  }
}

/**
 * Delete a single entry from users/{uid}/dailyRegistry/{date}/entries/{entryId}
 */
export async function deleteDailyRegistryEntry(
  uid: string,
  date: string,
  entryId: string
): Promise<boolean> {
  if (!uid || !date || !entryId) return false;
  try {
    const docRef = doc(db, 'users', uid, 'dailyRegistry', date);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const entries = { ...(data.entries || {}) };
      delete entries[entryId];
      await setDoc(docRef, {
        entries,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    try {
      const entryRef = rtdbRef(rtdb, `users/${uid}/dailyRegistry/${date}/entries/${entryId}`);
      rtdbRemove(entryRef).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.warn(`[DailyRegistry Delete Notice] Entry delete notice:`, err);
    throw err;
  }
}

/**
 * Load a specific day's Daily Registry record from Firestore
 */
export async function loadDailyRegistryDay(
  uid: string,
  date: string
): Promise<DailyRegistryDayRecord | null> {
  if (!uid || !date) return null;

  try {
    const docRef = doc(db, 'users', uid, 'dailyRegistry', date);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DailyRegistryDayRecord;
    }
  } catch (err) {
    console.warn(`[DailyRegistry Firestore Read Notice] Day ${date}:`, err);
  }

  return null;
}

/**
 * Load entire user daily registry history across all dates from Firestore
 */
export async function loadUserDailyRegistryAll(
  uid: string
): Promise<Record<string, DailyRegistryDayRecord>> {
  if (!uid) return {};

  try {
    const collRef = collection(db, 'users', uid, 'dailyRegistry');
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      const result: Record<string, DailyRegistryDayRecord> = {};
      snap.forEach(docSnap => {
        result[docSnap.id] = docSnap.data() as DailyRegistryDayRecord;
      });
      console.log(`[DailyRegistry Firestore] Loaded ${Object.keys(result).length} days of history for UID: ${uid}`);
      return result;
    }
  } catch (err) {
    console.warn(`[DailyRegistry Firestore All Read Notice]:`, err);
  }

  return {};
}

/**
 * Subscribe to real-time changes of the user's daily registry via Firestore
 */
export function subscribeToUserDailyRegistry(
  uid: string,
  onUpdate: (data: Record<string, DailyRegistryDayRecord>) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!uid) return () => {};

  try {
    const collRef = collection(db, 'users', uid, 'dailyRegistry');
    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const result: Record<string, DailyRegistryDayRecord> = {};
          snapshot.forEach(docSnap => {
            result[docSnap.id] = docSnap.data() as DailyRegistryDayRecord;
          });
          onUpdate(result);
        }
      },
      (err) => {
        console.warn(`[DailyRegistry Firestore Listener Notice] UID ${uid}:`, err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`[DailyRegistry Listener Init Error]:`, err);
    return () => {};
  }
}

/**
 * Diagnostic utility: Verify if current user has write permissions to Daily Registry path
 */
export async function verifyWritePermission(uid: string): Promise<boolean> {
  try {
    const probeRef = rtdbRef(rtdb, `users/${uid}/dailyRegistry/_probe`);
    await rtdbSet(probeRef, { probe: Date.now(), timestamp: new Date().toISOString() });
    console.log(`[Diagnostic] Write permission VERIFIED for users/${uid}/dailyRegistry/`);
    return true;
  } catch (err) {
    console.error(`[Diagnostic] Write permission DENIED for users/${uid}/dailyRegistry/:`, err);
    return false;
  }
}

export async function saveDailyRegister(
  uid: string,
  date: string,
  payload: any
): Promise<boolean> {
  if (!uid || !date) return false;
  try {
    const docRef = doc(db, 'users', uid, 'daily_registers', date);
    await setDoc(docRef, {
      ...payload,
      date,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('[Firebase] Save Daily Register Error:', err);
    return false;
  }
}

export async function loadDailyRegisters(uid: string): Promise<any[]> {
  if (!uid) return [];
  try {
    const collRef = collection(db, 'users', uid, 'daily_registers');
    const q = query(collRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('[Firebase] Load Daily Registers Error:', err);
    return [];
  }
}

// ==============================================================================
// FOCUS MODE PHASE 2: PERSISTENT FOCUS SESSIONS & STATISTICS
// ==============================================================================

export interface FocusSessionRecord {
  sessionId: string;
  userId: string;
  subject: string;
  task: string;
  goal?: string;
  plannedDurationMinutes: number;
  actualElapsedMinutes: number;
  startTimestamp: number;
  endTimestamp: number;
  status: 'completed' | 'interrupted' | 'cancelled' | 'expired';
  fullscreenExitsCount: number;
  approvedBreaksCount: number;
  totalBreakMinutes: number;
  userReflection?: string;
  createdAt: string;
}

/**
 * Save a complete Focus Session Record to Firebase
 * Dual-write: Cloud Firestore users/{uid}/focusSessions/{sessionId}
 * Mirror: Realtime Database users/{uid}/focusSessions/{sessionId}
 */
export async function saveFocusSessionRecord(
  uid: string,
  record: FocusSessionRecord
): Promise<boolean> {
  if (!uid || !record?.sessionId) return false;

  // Clean undefined fields for Firestore
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(record)) {
    if (v !== undefined) cleaned[k] = v;
  }

  let firestoreSuccess = false;
  try {
    const docRef = doc(db, 'users', uid, 'focusSessions', record.sessionId);
    await setDoc(docRef, cleaned, { merge: true });
    firestoreSuccess = true;
    console.log(`[Firebase Firestore] Saved focus session ${record.sessionId} for UID: ${uid}`);
  } catch (err) {
    console.warn(`[Firebase Firestore] Failed to save focus session ${record.sessionId}:`, err);
  }

  // Non-blocking RTDB mirror
  try {
    const rtdbTargetRef = rtdbRef(rtdb, `users/${uid}/focusSessions/${record.sessionId}`);
    rtdbSet(rtdbTargetRef, cleaned).catch(() => {});
  } catch {}

  return firestoreSuccess;
}

/**
 * Load all user focus session records from Firebase (Firestore primary, RTDB fallback)
 */
export async function loadUserFocusSessions(uid: string): Promise<FocusSessionRecord[]> {
  if (!uid) return [];

  // 1. Try Cloud Firestore
  try {
    const collRef = collection(db, 'users', uid, 'focusSessions');
    const q = query(collRef, orderBy('startTimestamp', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as FocusSessionRecord);
    }
  } catch (fsErr) {
    console.warn(`[Firebase Firestore] Query failed for focusSessions UID: ${uid}:`, fsErr);
  }

  // 2. Fallback to RTDB
  try {
    const rtdbTargetRef = rtdbRef(rtdb, `users/${uid}/focusSessions`);
    const snap = await rtdbGet(rtdbTargetRef);
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        const records = Object.values(val) as FocusSessionRecord[];
        records.sort((a, b) => (b.startTimestamp || 0) - (a.startTimestamp || 0));
        return records;
      }
    }
  } catch (rtdbErr) {
    console.warn(`[Firebase RTDB] Query failed for focusSessions UID: ${uid}:`, rtdbErr);
  }

  return [];
}

/**
 * Real-time listener for user focus sessions
 */
export function subscribeToUserFocusSessions(
  uid: string,
  onData: (records: FocusSessionRecord[]) => void
): () => void {
  if (!uid) return () => {};

  try {
    const rtdbTargetRef = rtdbRef(rtdb, `users/${uid}/focusSessions`);
    const unsubscribe = rtdbOnValue(rtdbTargetRef, snapshot => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          const records = Object.values(val) as FocusSessionRecord[];
          records.sort((a, b) => (b.startTimestamp || 0) - (a.startTimestamp || 0));
          onData(records);
          return;
        }
      }
      onData([]);
    }, err => {
      console.warn('[Firebase RTDB] subscribeToUserFocusSessions error:', err);
    });

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  } catch {
    return () => {};
  }
}


