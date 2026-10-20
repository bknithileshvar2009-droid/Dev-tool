/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivityTrackingMethod = 'timer' | 'manual';
export type ActivityStatus = 'in-progress' | 'completed' | 'paused';

export interface ActivityRecord {
  id: string;
  userId: string;
  title: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startTimestamp: number; // UTC epoch ms
  endTimestamp: number; // UTC epoch ms
  durationMinutes: number;
  notes?: string;
  tags?: string[];
  trackingMethod: ActivityTrackingMethod;
  status: ActivityStatus;
  goalId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom?: boolean;
  isArchived?: boolean;
}

export interface DailyGoal {
  id: string;
  userId: string;
  title: string;
  goalType: 'target_duration' | 'limit_duration' | 'activity_count' | 'custom';
  targetValue: number; // Minutes or count
  categoryId?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  enabled: boolean;
  createdAt: number;
}

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  userId: string;
  whatWentWell: string;
  whatToImprove: string;
  topPriorityTomorrow: string;
  additionalNotes: string;
  updatedAt: number;
}

export interface ActiveTimerState {
  activityId: string;
  userId: string;
  title: string;
  categoryId: string;
  goalId?: string;
  notes?: string;
  tags?: string[];
  startTimestamp: number;
  accumulatedMs: number; // Accumulated active time before current running stretch
  isPaused: boolean;
  lastPausedTimestamp?: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface DayInReviewSettings {
  preferredReviewTime?: string; // HH:mm e.g. "21:00"
  enableNotifications?: boolean;
  defaultCategoryId?: string;
}

export const DEFAULT_ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { id: 'study', name: 'Study / Learning', color: '#3b82f6', icon: '📚' },
  { id: 'work', name: 'School / Work', color: '#8b5cf6', icon: '💼' },
  { id: 'exercise', name: 'Exercise / Sports', color: '#10b981', icon: '🏋️' },
  { id: 'sleep', name: 'Sleep / Rest', color: '#6366f1', icon: '🌙' },
  { id: 'travel', name: 'Travel / Commute', color: '#f59e0b', icon: '🚗' },
  { id: 'personal', name: 'Personal Time', color: '#ec4899', icon: '✨' },
  { id: 'family', name: 'Family', color: '#f43f5e', icon: '👨‍👩‍👧' },
  { id: 'entertainment', name: 'Entertainment', color: '#06b6d4', icon: '🎬' },
  { id: 'social_media', name: 'Social Media', color: '#e11d48', icon: '📱' },
  { id: 'hobbies', name: 'Hobbies', color: '#14b8a6', icon: '🎨' },
  { id: 'creative', name: 'Creative Projects', color: '#a855f7', icon: '💡' },
  { id: 'coding', name: 'Coding & Tech', color: '#0284c7', icon: '💻' },
  { id: 'meals', name: 'Meals', color: '#eab308', icon: '🍽️' },
  { id: 'breaks', name: 'Breaks', color: '#f97316', icon: '☕' },
  { id: 'household', name: 'Household', color: '#64748b', icon: '🏠' },
  { id: 'other', name: 'Other', color: '#94a3b8', icon: '📌' },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime24to12(time24: string): string {
  if (!time24 || !time24.includes(':')) return '12:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) h = 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatDurationMinutes(mins: number): string {
  if (!mins || mins <= 0) return '0m';
  if (mins < 1) {
    const s = Math.round(mins * 60);
    return `${s}s (${mins.toFixed(1)}m)`;
  }
  const totalSecs = Math.round(mins * 60);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  if (h === 0) {
    if (s > 0) return `${m}m ${s}s (${mins.toFixed(1)}m)`;
    return `${m}m`;
  }
  if (m === 0 && s === 0) return `${h}h`;
  if (s > 0) return `${h}h ${m}m ${s}s`;
  return `${h}h ${m}m`;
}

export function formatFullDateAndWeekday(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatTimerMs(ms: number): string {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Computes unique logged time (in minutes) by merging overlapping time intervals
 */
export function calculateUniqueLoggedMinutes(activities: ActivityRecord[]): number {
  if (!activities || activities.length === 0) return 0;
  const intervals: Array<[number, number]> = [];

  for (const act of activities) {
    if (act.startTimestamp && act.endTimestamp && act.endTimestamp > act.startTimestamp) {
      intervals.push([act.startTimestamp, act.endTimestamp]);
    } else if (act.durationMinutes > 0) {
      const dummyStart = act.startTimestamp || Date.now();
      intervals.push([dummyStart, dummyStart + act.durationMinutes * 60 * 1000]);
    }
  }

  if (intervals.length === 0) return 0;

  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  let totalMs = 0;
  for (const [s, e] of merged) {
    totalMs += e - s;
  }

  return Math.round(totalMs / (60 * 1000));
}

/**
 * Find overlapping activity pairs for warning indicators
 */
export function detectOverlappingActivities(activities: ActivityRecord[]): Array<{ act1: ActivityRecord; act2: ActivityRecord }> {
  const overlaps: Array<{ act1: ActivityRecord; act2: ActivityRecord }> = [];
  if (!activities || activities.length < 2) return overlaps;

  for (let i = 0; i < activities.length; i++) {
    for (let j = i + 1; j < activities.length; j++) {
      const a1 = activities[i];
      const a2 = activities[j];
      if (
        a1.startTimestamp &&
        a1.endTimestamp &&
        a2.startTimestamp &&
        a2.endTimestamp &&
        a1.startTimestamp < a2.endTimestamp &&
        a2.startTimestamp < a1.endTimestamp
      ) {
        overlaps.push({ act1: a1, act2: a2 });
      }
    }
  }

  return overlaps;
}
