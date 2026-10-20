/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  db,
  rtdb,
  auth,
} from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
} from 'firebase/database';
import {
  ActivityRecord,
  ActivityCategory,
  DailyGoal,
  DailyReflection,
  ActiveTimerState,
  DayInReviewSettings,
  DEFAULT_ACTIVITY_CATEGORIES,
} from './dayInReviewTypes';

/**
 * Helper function to sanitize objects before sending to Firestore
 * Firestore throws an error if any property value is `undefined`.
 */
export function cleanFirestorePayload<T extends Record<string, any>>(data: T): T {
  if (data === null || typeof data !== 'object') return data;
  const cleaned: Record<string, any> = Array.isArray(data) ? [] : {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = cleanFirestorePayload(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/**
 * Save Activity Record to Firebase (Firestore primary, RTDB mirror)
 */
export async function saveActivityRecordToFirebase(
  uid: string,
  activity: ActivityRecord
): Promise<boolean> {
  if (!uid || !activity?.id) return false;

  const now = Date.now();
  const payload: ActivityRecord = {
    ...activity,
    userId: uid,
    updatedAt: now,
  };

  const cleanedPayload = cleanFirestorePayload(payload);

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'activities', 'list', activity.id);
    await setDoc(docRef, cleanedPayload, { merge: true });
    console.log(`[DayInReview Firestore] Saved activity ${activity.id} for UID: ${uid}`);

    // RTDB mirror
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/activities/${activity.id}`);
      rtdbSet(targetRef, cleanedPayload).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.error(`[DayInReview Firestore Error] Save activity failed:`, err);
    // Try RTDB directly
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/activities/${activity.id}`);
      await rtdbSet(targetRef, payload);
      return true;
    } catch {
      throw err;
    }
  }
}

/**
 * Delete Activity Record from Firebase
 */
export async function deleteActivityRecordFromFirebase(
  uid: string,
  activityId: string
): Promise<boolean> {
  if (!uid || !activityId) return false;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'activities', 'list', activityId);
    await deleteDoc(docRef);

    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/activities/${activityId}`);
      rtdbRemove(targetRef).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.error(`[DayInReview Firestore Error] Delete activity failed:`, err);
    throw err;
  }
}

/**
 * Load all user activity records from Firebase
 */
export async function loadUserActivityRecordsFromFirebase(uid: string): Promise<ActivityRecord[]> {
  if (!uid) return [];

  // 1. Try Cloud Firestore
  try {
    const collRef = collection(db, 'users', uid, 'dailyActivity', 'activities', 'list');
    const q = query(collRef, orderBy('startTimestamp', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as ActivityRecord);
    }
  } catch (fsErr) {
    console.warn(`[DayInReview Firestore] Activities query failed, trying RTDB:`, fsErr);
  }

  // 2. Try RTDB
  try {
    const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/activities`);
    const snap = await rtdbGet(targetRef);
    if (snap.exists()) {
      const val = snap.val();
      return Object.values(val) as ActivityRecord[];
    }
  } catch {}

  return [];
}

/**
 * Save Custom/Edited Category
 */
export async function saveCategoryToFirebase(
  uid: string,
  category: ActivityCategory
): Promise<boolean> {
  if (!uid || !category?.id) return false;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'categories', 'list', category.id);
    const cleaned = cleanFirestorePayload(category);
    await setDoc(docRef, cleaned, { merge: true });

    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/categories/${category.id}`);
      rtdbSet(targetRef, cleaned).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.warn('[DayInReview] Failed to save category:', err);
    return false;
  }
}

/**
 * Load User Categories (merging custom categories with defaults)
 */
export async function loadUserCategoriesFromFirebase(uid: string): Promise<ActivityCategory[]> {
  if (!uid) return DEFAULT_ACTIVITY_CATEGORIES;

  let stored: ActivityCategory[] = [];

  try {
    const collRef = collection(db, 'users', uid, 'dailyActivity', 'categories', 'list');
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      stored = snap.docs.map(d => d.data() as ActivityCategory);
    }
  } catch {
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/categories`);
      const snap = await rtdbGet(targetRef);
      if (snap.exists()) {
        stored = Object.values(snap.val()) as ActivityCategory[];
      }
    } catch {}
  }

  if (stored.length === 0) {
    return DEFAULT_ACTIVITY_CATEGORIES;
  }

  // Merge stored categories over defaults by ID
  const map = new Map<string, ActivityCategory>();
  DEFAULT_ACTIVITY_CATEGORIES.forEach(c => map.set(c.id, c));
  stored.forEach(c => map.set(c.id, c));

  return Array.from(map.values());
}

/**
 * Save Daily Goal
 */
export async function saveGoalToFirebase(
  uid: string,
  goal: DailyGoal
): Promise<boolean> {
  if (!uid || !goal?.id) return false;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'goals', 'list', goal.id);
    const cleaned = cleanFirestorePayload(goal);
    await setDoc(docRef, cleaned, { merge: true });

    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/goals/${goal.id}`);
      rtdbSet(targetRef, cleaned).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.warn('[DayInReview] Failed to save goal:', err);
    return false;
  }
}

/**
 * Delete Daily Goal
 */
export async function deleteGoalFromFirebase(
  uid: string,
  goalId: string
): Promise<boolean> {
  if (!uid || !goalId) return false;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'goals', 'list', goalId);
    await deleteDoc(docRef);

    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/goals/${goalId}`);
      rtdbRemove(targetRef).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.warn('[DayInReview] Failed to delete goal:', err);
    return false;
  }
}

/**
 * Load User Goals
 */
export async function loadUserGoalsFromFirebase(uid: string): Promise<DailyGoal[]> {
  if (!uid) return [];

  try {
    const collRef = collection(db, 'users', uid, 'dailyActivity', 'goals', 'list');
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as DailyGoal);
    }
  } catch {
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/goals`);
      const snap = await rtdbGet(targetRef);
      if (snap.exists()) {
        return Object.values(snap.val()) as DailyGoal[];
      }
    } catch {}
  }

  return [];
}

/**
 * Save Daily Reflection
 */
export async function saveReflectionToFirebase(
  uid: string,
  reflection: DailyReflection
): Promise<boolean> {
  if (!uid || !reflection?.date) return false;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'reflections', 'list', reflection.date);
    const cleaned = cleanFirestorePayload(reflection);
    await setDoc(docRef, cleaned, { merge: true });

    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/reflections/${reflection.date}`);
      rtdbSet(targetRef, cleaned).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.warn('[DayInReview] Failed to save reflection:', err);
    return false;
  }
}

/**
 * Load User Reflections
 */
export async function loadUserReflectionsFromFirebase(uid: string): Promise<Record<string, DailyReflection>> {
  if (!uid) return {};

  const map: Record<string, DailyReflection> = {};

  try {
    const collRef = collection(db, 'users', uid, 'dailyActivity', 'reflections', 'list');
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      snap.docs.forEach(d => {
        const data = d.data() as DailyReflection;
        if (data.date) map[data.date] = data;
      });
      return map;
    }
  } catch {
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/reflections`);
      const snap = await rtdbGet(targetRef);
      if (snap.exists()) {
        return snap.val() as Record<string, DailyReflection>;
      }
    } catch {}
  }

  return map;
}

/**
 * Save Active Timer State for Session Recovery
 */
export async function saveActiveTimerStateToFirebase(
  uid: string,
  timerState: ActiveTimerState | null
): Promise<boolean> {
  if (!uid) return false;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'activeTimer', 'current', 'state');
    if (timerState) {
      const cleaned = cleanFirestorePayload(timerState);
      await setDoc(docRef, cleaned);
    } else {
      await deleteDoc(docRef);
    }

    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/activeTimer`);
      if (timerState) {
        const cleaned = cleanFirestorePayload(timerState);
        rtdbSet(targetRef, cleaned).catch(() => {});
      } else {
        rtdbRemove(targetRef).catch(() => {});
      }
    } catch {}

    return true;
  } catch (err) {
    console.warn('[DayInReview] Failed to save active timer state:', err);
    return false;
  }
}

/**
 * Load Active Timer State for Session Recovery
 */
export async function loadActiveTimerStateFromFirebase(uid: string): Promise<ActiveTimerState | null> {
  if (!uid) return null;

  try {
    const docRef = doc(db, 'users', uid, 'dailyActivity', 'activeTimer', 'current', 'state');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ActiveTimerState;
    }
  } catch {
    try {
      const targetRef = rtdbRef(rtdb, `users/${uid}/dailyActivity/activeTimer`);
      const snap = await rtdbGet(targetRef);
      if (snap.exists()) {
        return snap.val() as ActiveTimerState;
      }
    } catch {}
  }

  return null;
}
