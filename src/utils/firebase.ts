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
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

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
export async function saveUserDashboard(uid: string, dashboardData: { config: any; tasks: any[]; updatedAt: string }): Promise<boolean> {
  if (!uid) return false;
  const path = `users/${uid}/dashboard/data`;
  try {
    const docRef = doc(db, 'users', uid, 'dashboard', 'data');
    await setDoc(docRef, {
      userId: uid,
      config: dashboardData.config,
      tasks: dashboardData.tasks,
      updatedAt: dashboardData.updatedAt || new Date().toISOString(),
    });
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

export {
  signOut,
  onAuthStateChanged,
  type User,
};
