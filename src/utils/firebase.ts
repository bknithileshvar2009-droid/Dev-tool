/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  onValue as rtdbOnValue,
  runTransaction as rtdbRunTransaction,
} from 'firebase/database';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const customDbId = (firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)' &&
  firebaseConfig.firestoreDatabaseId.trim() !== '')
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Initialize Firestore with auto-detect long-polling to prevent 10s backend unreachable timeouts
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
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
 * Validate Connection to Firestore on startup
 */
export async function testConnection(): Promise<boolean> {
  try {
    const probePromise = getDocFromServer(doc(db, 'test', 'connection'));
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
// Run connection probe safely in background
testConnection().catch(() => {});

/**
 * Sign in using Google Auth Provider via Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In failed:', err);
    throw err;
  }
}

/**
 * Sign out current user
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Save user dashboard data to Firestore under /users/{uid}/dashboard/data
 */
export async function saveUserDashboard(uid: string, dashboardData: { config: any; tasks: any[]; dailyRegister?: any[]; updatedAt: string }): Promise<boolean> {
  if (!uid) return false;
  const path = `users/${uid}/dashboard/data`;
  try {
    const docRef = doc(db, 'users', uid, 'dashboard', 'data');
    await setDoc(docRef, {
      userId: uid,
      config: dashboardData.config,
      tasks: dashboardData.tasks,
      dailyRegister: dashboardData.dailyRegister || dashboardData.config?.dailyRegister || [],
      updatedAt: dashboardData.updatedAt || new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Load user dashboard data from Firestore
 */
export async function loadUserDashboard(uid: string): Promise<any | null> {
  if (!uid) return null;
  const path = `users/${uid}/dashboard/data`;
  try {
    const docRef = doc(db, 'users', uid, 'dashboard', 'data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Real-time Auto-Sync Listener for User Dashboard
 */
export function subscribeToUserDashboard(
  uid: string,
  onData: (data: any) => void,
  onError?: (error: unknown) => void
): () => void {
  if (!uid) return () => {};
  const path = `users/${uid}/dashboard/data`;
  const docRef = doc(db, 'users', uid, 'dashboard', 'data');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data());
      }
    },
    (err) => {
      console.warn('Firestore real-time auto sync listener warning:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
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
