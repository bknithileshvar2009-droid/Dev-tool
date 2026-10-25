/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DashboardWidgetKey =
  | 'clock'
  | 'countdown'
  | 'nameWidget'
  | 'tasks'
  | 'notification'
  | 'calendar'
  | 'motivation'
  | 'pomodoro'
  | 'scratchpad'
  | 'breakStats'
  | 'studyCommandCenter'
  | 'studyTracker';

export interface GridCellSlot {
  widgetKey: DashboardWidgetKey;
  xPercent: number; // 0 to 100 (%)
  yPercent: number; // 0 to 100 (%)
  wPercent: number; // 0 to 100 (%)
  hPercent: number; // 0 to 100 (%)
  label: string;
  isPrimary?: boolean;
}

export interface LayoutPresetOption {
  id: string;
  number: number; // 1 to 50
  name: string;
  category: 'bento' | 'symmetrical' | 'asymmetrical' | 'magazine' | 'sidebar' | 'split' | 'masonry' | 'minimal';
  badge: string;
  description: string;
  slots: GridCellSlot[];
}

// 50 Genuinely Distinct, Numbered Visual Grid Presets
export const STUDIO_LAYOUT_ARRANGEMENTS: LayoutPresetOption[] = [
  // --- BENTO LAYOUTS (1 - 8) ---
  {
    id: 'preset-grid-1',
    number: 1,
    name: '01. Centered Hero & Balanced Bento',
    category: 'bento',
    badge: 'Bento',
    description: 'Prominent central clock header flanked by four balanced utility cards below',
    slots: [
      { widgetKey: 'clock', xPercent: 20, yPercent: 4, wPercent: 60, hPercent: 24, label: 'Clock Hero', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 25, yPercent: 30, wPercent: 50, hPercent: 12, label: 'Centum Badge' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 44, wPercent: 44, hPercent: 26, label: 'Public Exam Target' },
      { widgetKey: 'notification', xPercent: 52, yPercent: 44, wPercent: 44, hPercent: 26, label: 'Routine Schedule' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 72, wPercent: 29, hPercent: 24, label: 'Quick Sprint Tasks' },
      { widgetKey: 'motivation', xPercent: 35, yPercent: 72, wPercent: 30, hPercent: 24, label: 'Daily Intention' },
      { widgetKey: 'pomodoro', xPercent: 67, yPercent: 72, wPercent: 29, hPercent: 24, label: 'Focus Timer' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 4, wPercent: 14, hPercent: 38, label: 'Monthly Calendar' },
    ],
  },
  {
    id: 'preset-grid-2',
    number: 2,
    name: '02. Bento Pro: 1 Massive Feature, 4 Satellites',
    category: 'bento',
    badge: 'Bento Pro',
    description: 'Large feature hero card on the left with an organized 2x2 satellite grid on the right',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 50, hPercent: 42, label: 'Feature Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 56, yPercent: 6, wPercent: 40, hPercent: 20, label: 'Exam Countdown' },
      { widgetKey: 'pomodoro', xPercent: 56, yPercent: 28, wPercent: 40, hPercent: 20, label: 'Pomodoro Timer' },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 50, wPercent: 50, hPercent: 14, label: 'Centum Badge' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 66, wPercent: 24, hPercent: 30, label: 'Quick Tasks' },
      { widgetKey: 'motivation', xPercent: 30, yPercent: 66, wPercent: 24, hPercent: 30, label: 'Motivation' },
      { widgetKey: 'notification', xPercent: 56, yPercent: 50, wPercent: 40, hPercent: 22, label: 'Study Routine' },
      { widgetKey: 'calendar', xPercent: 56, yPercent: 74, wPercent: 40, hPercent: 22, label: 'Exam Calendar' },
    ],
  },
  {
    id: 'preset-grid-3',
    number: 3,
    name: '03. Bento Modern: 3x3 Modular Matrix',
    category: 'bento',
    badge: 'Modular',
    description: 'Nine-cell modular grid with clock spanning the central upper columns',
    slots: [
      { widgetKey: 'clock', xPercent: 34, yPercent: 5, wPercent: 62, hPercent: 28, label: 'Clock Master', isPrimary: true },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 5, wPercent: 28, hPercent: 44, label: 'Calendar Desk' },
      { widgetKey: 'nameWidget', xPercent: 34, yPercent: 35, wPercent: 30, hPercent: 14, label: 'Student Badge' },
      { widgetKey: 'pomodoro', xPercent: 66, yPercent: 35, wPercent: 30, hPercent: 14, label: 'Focus Timer' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 51, wPercent: 44, hPercent: 22, label: 'Exam Countdown' },
      { widgetKey: 'notification', xPercent: 50, yPercent: 51, wPercent: 46, hPercent: 22, label: 'Routine Schedule' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 75, wPercent: 44, hPercent: 21, label: 'Target Checklist' },
      { widgetKey: 'motivation', xPercent: 50, yPercent: 75, wPercent: 46, hPercent: 21, label: 'Quote & Intention' },
    ],
  },
  {
    id: 'preset-grid-4',
    number: 4,
    name: '04. Bento Cruciform: Central Hearth',
    category: 'bento',
    badge: 'Cross',
    description: 'Cross-shaped bento with a central focal element and four perimeter wings',
    slots: [
      { widgetKey: 'clock', xPercent: 28, yPercent: 26, wPercent: 44, hPercent: 32, label: 'Core Timepiece', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 28, yPercent: 6, wPercent: 44, hPercent: 18, label: 'Upper Banner' },
      { widgetKey: 'motivation', xPercent: 28, yPercent: 60, wPercent: 44, hPercent: 18, label: 'Lower Intention' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 6, wPercent: 22, hPercent: 44, label: 'West Tasks' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 52, wPercent: 22, hPercent: 44, label: 'West Calendar' },
      { widgetKey: 'countdown', xPercent: 74, yPercent: 6, wPercent: 22, hPercent: 44, label: 'East Countdown' },
      { widgetKey: 'notification', xPercent: 74, yPercent: 52, wPercent: 22, hPercent: 44, label: 'East Routine' },
      { widgetKey: 'pomodoro', xPercent: 28, yPercent: 80, wPercent: 44, hPercent: 16, label: 'Bottom Pomodoro' },
    ],
  },
  {
    id: 'preset-grid-5',
    number: 5,
    name: '05. Bento Horizon: Wide Header with Tri-Podium',
    category: 'bento',
    badge: 'Podium',
    description: 'Wide horizontal hero header supported by a three-column podium below',
    slots: [
      { widgetKey: 'clock', xPercent: 5, yPercent: 5, wPercent: 90, hPercent: 26, label: 'Wide Master Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 5, yPercent: 33, wPercent: 29, hPercent: 32, label: 'Exam Column' },
      { widgetKey: 'nameWidget', xPercent: 36, yPercent: 33, wPercent: 28, hPercent: 14, label: 'Centum Badge' },
      { widgetKey: 'pomodoro', xPercent: 36, yPercent: 49, wPercent: 28, hPercent: 16, label: 'Pomodoro Box' },
      { widgetKey: 'notification', xPercent: 66, yPercent: 33, wPercent: 29, hPercent: 32, label: 'Timetable Column' },
      { widgetKey: 'tasks', xPercent: 5, yPercent: 67, wPercent: 29, hPercent: 28, label: 'Tasks Matrix' },
      { widgetKey: 'motivation', xPercent: 36, yPercent: 67, wPercent: 28, hPercent: 28, label: 'Daily Inspiration' },
      { widgetKey: 'calendar', xPercent: 66, yPercent: 67, wPercent: 29, hPercent: 28, label: 'Monthly View' },
    ],
  },
  {
    id: 'preset-grid-6',
    number: 6,
    name: '06. Bento Compact: 6-Cell Precision Desk',
    category: 'bento',
    badge: 'Compact',
    description: 'Six neatly proportioned bento tiles engineered for 13-inch and 14-inch laptops',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 44, hPercent: 28, label: 'Clock Tile', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 50, yPercent: 6, wPercent: 46, hPercent: 28, label: 'Countdown Tile' },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 36, wPercent: 44, hPercent: 14, label: 'Name Banner' },
      { widgetKey: 'pomodoro', xPercent: 50, yPercent: 36, wPercent: 46, hPercent: 14, label: 'Pomodoro' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 52, wPercent: 29, hPercent: 42, label: 'Task List' },
      { widgetKey: 'motivation', xPercent: 35, yPercent: 52, wPercent: 30, hPercent: 42, label: 'Motivation' },
      { widgetKey: 'notification', xPercent: 67, yPercent: 52, wPercent: 29, hPercent: 20, label: 'Routine Alert' },
      { widgetKey: 'calendar', xPercent: 67, yPercent: 74, wPercent: 29, hPercent: 20, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-7',
    number: 7,
    name: '07. Bento Diagonal: Stepped Hierarchy',
    category: 'bento',
    badge: 'Diagonal',
    description: 'Cascading card spans descending diagonally across the workspace canvas',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 5, wPercent: 54, hPercent: 30, label: 'Top-Left Focus', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 60, yPercent: 5, wPercent: 36, hPercent: 14, label: 'Corner Badge' },
      { widgetKey: 'countdown', xPercent: 60, yPercent: 21, wPercent: 36, hPercent: 26, label: 'Exam Countdown' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 37, wPercent: 26, hPercent: 32, label: 'Sprint Tasks' },
      { widgetKey: 'notification', xPercent: 32, yPercent: 37, wPercent: 26, hPercent: 32, label: 'Daily Timetable' },
      { widgetKey: 'pomodoro', xPercent: 60, yPercent: 49, wPercent: 36, hPercent: 20, label: 'Pomodoro Desk' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 71, wPercent: 45, hPercent: 24, label: 'Wide Calendar' },
      { widgetKey: 'motivation', xPercent: 51, yPercent: 71, wPercent: 45, hPercent: 24, label: 'Wide Intention' },
    ],
  },
  {
    id: 'preset-grid-8',
    number: 8,
    name: '08. Bento Ultrawide: 12-Column Command Matrix',
    category: 'bento',
    badge: 'Ultrawide',
    description: 'Spanning multi-tier bento architecture for wide monitors and panoramic displays',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 3, yPercent: 5, wPercent: 26, hPercent: 16, label: 'Student Bio' },
      { widgetKey: 'clock', xPercent: 31, yPercent: 5, wPercent: 44, hPercent: 28, label: 'Central Chronometer', isPrimary: true },
      { widgetKey: 'pomodoro', xPercent: 77, yPercent: 5, wPercent: 20, hPercent: 28, label: 'Pomodoro Box' },
      { widgetKey: 'countdown', xPercent: 3, yPercent: 23, wPercent: 26, hPercent: 40, label: 'Exam Milestone' },
      { widgetKey: 'notification', xPercent: 31, yPercent: 35, wPercent: 44, hPercent: 28, label: 'Routine Schedule' },
      { widgetKey: 'tasks', xPercent: 77, yPercent: 35, wPercent: 20, hPercent: 60, label: 'Tasks Column' },
      { widgetKey: 'motivation', xPercent: 3, yPercent: 65, wPercent: 34, hPercent: 30, label: 'Intention Desk' },
      { widgetKey: 'calendar', xPercent: 39, yPercent: 65, wPercent: 36, hPercent: 30, label: 'Monthly Grid' },
    ],
  },

  // --- ASYMMETRICAL LAYOUTS (9 - 16) ---
  {
    id: 'preset-grid-9',
    number: 9,
    name: '09. Golden Ratio Asymmetric Split',
    category: 'asymmetrical',
    badge: 'Golden',
    description: 'Classic 62/38 proportion separating focus time from active working widgets',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 58, hPercent: 38, label: 'Golden Clock Hero', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 46, wPercent: 58, hPercent: 14, label: 'Centum Badge' },
      { widgetKey: 'countdown', xPercent: 64, yPercent: 6, wPercent: 32, hPercent: 28, label: 'Target Milestone' },
      { widgetKey: 'pomodoro', xPercent: 64, yPercent: 36, wPercent: 32, hPercent: 24, label: 'Pomodoro Hub' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 62, wPercent: 28, hPercent: 33, label: 'Task Sprint' },
      { widgetKey: 'motivation', xPercent: 34, yPercent: 62, wPercent: 28, hPercent: 33, label: 'Inspiration' },
      { widgetKey: 'notification', xPercent: 64, yPercent: 62, wPercent: 32, hPercent: 18, label: 'Routine Alert' },
      { widgetKey: 'calendar', xPercent: 64, yPercent: 82, wPercent: 32, hPercent: 14, label: 'Mini Calendar' },
    ],
  },
  {
    id: 'preset-grid-10',
    number: 10,
    name: '10. Asymmetric Skyline: Variable Pillars',
    category: 'asymmetrical',
    badge: 'Skyline',
    description: 'Dynamic uneven vertical heights creating a modern architectural silhouette',
    slots: [
      { widgetKey: 'tasks', xPercent: 4, yPercent: 6, wPercent: 22, hPercent: 88, label: 'Tower: Tasks' },
      { widgetKey: 'clock', xPercent: 28, yPercent: 6, wPercent: 44, hPercent: 30, label: 'Center Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 28, yPercent: 38, wPercent: 44, hPercent: 14, label: 'Center Badge' },
      { widgetKey: 'countdown', xPercent: 28, yPercent: 54, wPercent: 44, hPercent: 40, label: 'Exam Focus' },
      { widgetKey: 'notification', xPercent: 74, yPercent: 6, wPercent: 22, hPercent: 28, label: 'Right Routine' },
      { widgetKey: 'pomodoro', xPercent: 74, yPercent: 36, wPercent: 22, hPercent: 26, label: 'Right Pomodoro' },
      { widgetKey: 'calendar', xPercent: 74, yPercent: 64, wPercent: 22, hPercent: 30, label: 'Right Calendar' },
      { widgetKey: 'motivation', xPercent: 4, yPercent: 95, wPercent: 92, hPercent: 4, label: 'Footer Strip' },
    ],
  },
  {
    id: 'preset-grid-11',
    number: 11,
    name: '11. Asymmetric Heavy-Left Studio',
    category: 'asymmetrical',
    badge: 'Heavy Left',
    description: 'Weighted left workstation counterbalanced by lightweight floating tools on the right',
    slots: [
      { widgetKey: 'clock', xPercent: 5, yPercent: 6, wPercent: 52, hPercent: 32, label: 'Timepiece Deck', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 5, yPercent: 40, wPercent: 52, hPercent: 28, label: 'Exam Target Desk' },
      { widgetKey: 'tasks', xPercent: 5, yPercent: 70, wPercent: 52, hPercent: 24, label: 'Checklist Matrix' },
      { widgetKey: 'nameWidget', xPercent: 60, yPercent: 6, wPercent: 35, hPercent: 14, label: 'Badge' },
      { widgetKey: 'pomodoro', xPercent: 60, yPercent: 22, wPercent: 35, hPercent: 22, label: 'Timer' },
      { widgetKey: 'notification', xPercent: 60, yPercent: 46, wPercent: 35, hPercent: 26, label: 'Timetable' },
      { widgetKey: 'calendar', xPercent: 60, yPercent: 74, wPercent: 35, hPercent: 20, label: 'Calendar' },
      { widgetKey: 'motivation', xPercent: 5, yPercent: 95, wPercent: 90, hPercent: 4, label: 'Subtle Quote' },
    ],
  },
  {
    id: 'preset-grid-12',
    number: 12,
    name: '12. Asymmetric Heavy-Right Cockpit',
    category: 'asymmetrical',
    badge: 'Heavy Right',
    description: 'Clean visual rest space on the left leading into an information-dense right command deck',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 5, yPercent: 8, wPercent: 35, hPercent: 16, label: 'Student Bio' },
      { widgetKey: 'motivation', xPercent: 5, yPercent: 26, wPercent: 35, hPercent: 34, label: 'Daily Inspiration' },
      { widgetKey: 'calendar', xPercent: 5, yPercent: 62, wPercent: 35, hPercent: 32, label: 'Academic Calendar' },
      { widgetKey: 'clock', xPercent: 42, yPercent: 8, wPercent: 54, hPercent: 30, label: 'Cockpit Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 42, yPercent: 40, wPercent: 26, hPercent: 26, label: 'Milestone' },
      { widgetKey: 'pomodoro', xPercent: 70, yPercent: 40, wPercent: 26, hPercent: 26, label: 'Pomodoro' },
      { widgetKey: 'tasks', xPercent: 42, yPercent: 68, wPercent: 26, hPercent: 26, label: 'Sprint' },
      { widgetKey: 'notification', xPercent: 70, yPercent: 68, wPercent: 26, hPercent: 26, label: 'Routine' },
    ],
  },
  {
    id: 'preset-grid-13',
    number: 13,
    name: '13. Asymmetric Staggered Wave',
    category: 'asymmetrical',
    badge: 'Wave',
    description: 'Alternating high and low widget anchors creating a wave-like visual rhythm',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 12, wPercent: 44, hPercent: 28, label: 'Time Hub', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 50, yPercent: 5, wPercent: 46, hPercent: 14, label: 'Banner' },
      { widgetKey: 'countdown', xPercent: 50, yPercent: 21, wPercent: 46, hPercent: 26, label: 'Exam Countdown' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 42, wPercent: 44, hPercent: 26, label: 'Active Tasks' },
      { widgetKey: 'pomodoro', xPercent: 50, yPercent: 49, wPercent: 46, hPercent: 22, label: 'Pomodoro' },
      { widgetKey: 'motivation', xPercent: 4, yPercent: 70, wPercent: 44, hPercent: 24, label: 'Motivation' },
      { widgetKey: 'notification', xPercent: 50, yPercent: 73, wPercent: 22, hPercent: 22, label: 'Schedule' },
      { widgetKey: 'calendar', xPercent: 74, yPercent: 73, wPercent: 22, hPercent: 22, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-14',
    number: 14,
    name: '14. Asymmetric Stepped Diagonal',
    category: 'asymmetrical',
    badge: 'Stepped',
    description: 'Stepped card progression guiding the student eye diagonally downward',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 5, wPercent: 38, hPercent: 26, label: 'Primary Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 44, yPercent: 14, wPercent: 52, hPercent: 14, label: 'Heading Badge' },
      { widgetKey: 'countdown', xPercent: 24, yPercent: 33, wPercent: 40, hPercent: 26, label: 'Center Countdown' },
      { widgetKey: 'pomodoro', xPercent: 66, yPercent: 30, wPercent: 30, hPercent: 24, label: 'Timer Hub' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 33, wPercent: 18, hPercent: 61, label: 'Side Tasks' },
      { widgetKey: 'notification', xPercent: 24, yPercent: 61, wPercent: 35, hPercent: 33, label: 'Routine Table' },
      { widgetKey: 'calendar', xPercent: 61, yPercent: 56, wPercent: 35, hPercent: 22, label: 'Calendar' },
      { widgetKey: 'motivation', xPercent: 61, yPercent: 80, wPercent: 35, hPercent: 15, label: 'Quote Footnote' },
    ],
  },
  {
    id: 'preset-grid-15',
    number: 15,
    name: '15. Asymmetric Offset Quadrants',
    category: 'asymmetrical',
    badge: 'Offset',
    description: 'Four quadrants offset by 15% to eliminate static grid monotony',
    slots: [
      { widgetKey: 'clock', xPercent: 6, yPercent: 4, wPercent: 44, hPercent: 36, label: 'Offset Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 54, yPercent: 10, wPercent: 42, hPercent: 32, label: 'Offset Countdown' },
      { widgetKey: 'nameWidget', xPercent: 6, yPercent: 42, wPercent: 44, hPercent: 14, label: 'Badge' },
      { widgetKey: 'notification', xPercent: 54, yPercent: 44, wPercent: 42, hPercent: 26, label: 'Routine Schedule' },
      { widgetKey: 'tasks', xPercent: 6, yPercent: 58, wPercent: 22, hPercent: 36, label: 'Tasks' },
      { widgetKey: 'motivation', xPercent: 30, yPercent: 58, wPercent: 20, hPercent: 36, label: 'Intention' },
      { widgetKey: 'pomodoro', xPercent: 54, yPercent: 72, wPercent: 20, hPercent: 22, label: 'Pomodoro' },
      { widgetKey: 'calendar', xPercent: 76, yPercent: 72, wPercent: 20, hPercent: 22, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-16',
    number: 16,
    name: '16. Asymmetric Fibonacci Spiral',
    category: 'asymmetrical',
    badge: 'Fibonacci',
    description: 'Widget geometry inspired by logarithmic spiral proportions',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 5, wPercent: 52, hPercent: 52, label: 'Fibonacci Master', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 58, yPercent: 5, wPercent: 38, hPercent: 32, label: 'Second Order' },
      { widgetKey: 'nameWidget', xPercent: 58, yPercent: 39, wPercent: 38, hPercent: 18, label: 'Third Order' },
      { widgetKey: 'pomodoro', xPercent: 4, yPercent: 59, wPercent: 24, hPercent: 36, label: 'Fourth Order' },
      { widgetKey: 'tasks', xPercent: 30, yPercent: 59, wPercent: 26, hPercent: 36, label: 'Fifth Order' },
      { widgetKey: 'notification', xPercent: 58, yPercent: 59, wPercent: 18, hPercent: 36, label: 'Sixth' },
      { widgetKey: 'calendar', xPercent: 78, yPercent: 59, wPercent: 18, hPercent: 18, label: 'Seventh' },
      { widgetKey: 'motivation', xPercent: 78, yPercent: 79, wPercent: 18, hPercent: 16, label: 'Eighth' },
    ],
  },

  // --- SYMMETRICAL LAYOUTS (17 - 24) ---
  {
    id: 'preset-grid-17',
    number: 17,
    name: '17. Quad Symmetrical Command Grid',
    category: 'symmetrical',
    badge: 'Quad',
    description: 'Four equal quadrants offering clean geometric equilibrium across the screen',
    slots: [
      { widgetKey: 'clock', xPercent: 5, yPercent: 6, wPercent: 44, hPercent: 42, label: 'Quadrant 1: Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 51, yPercent: 6, wPercent: 44, hPercent: 42, label: 'Quadrant 2: Target' },
      { widgetKey: 'notification', xPercent: 5, yPercent: 51, wPercent: 44, hPercent: 43, label: 'Quadrant 3: Routine' },
      { widgetKey: 'tasks', xPercent: 51, yPercent: 51, wPercent: 44, hPercent: 43, label: 'Quadrant 4: Tasks' },
      { widgetKey: 'nameWidget', xPercent: 25, yPercent: 46, wPercent: 50, hPercent: 8, label: 'Center Crossbar' },
      { widgetKey: 'pomodoro', xPercent: 40, yPercent: 95, wPercent: 20, hPercent: 4, label: 'Mini Timer' },
      { widgetKey: 'calendar', xPercent: 5, yPercent: 95, wPercent: 20, hPercent: 4, label: 'Mini Cal' },
      { widgetKey: 'motivation', xPercent: 75, yPercent: 95, wPercent: 20, hPercent: 4, label: 'Mini Intention' },
    ],
  },
  {
    id: 'preset-grid-18',
    number: 18,
    name: '18. Symmetrical Octant: 8-Widget Equilibrium',
    category: 'symmetrical',
    badge: 'Octant',
    description: 'Eight perfectly balanced geometric modules arranged in two tidy 4-card decks',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 22, hPercent: 42, label: 'Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 28, yPercent: 6, wPercent: 21, hPercent: 42, label: 'Bio Card' },
      { widgetKey: 'countdown', xPercent: 51, yPercent: 6, wPercent: 21, hPercent: 42, label: 'Countdown' },
      { widgetKey: 'pomodoro', xPercent: 74, yPercent: 6, wPercent: 22, hPercent: 42, label: 'Pomodoro' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 52, wPercent: 22, hPercent: 42, label: 'Tasks' },
      { widgetKey: 'motivation', xPercent: 28, yPercent: 52, wPercent: 21, hPercent: 42, label: 'Motivation' },
      { widgetKey: 'notification', xPercent: 51, yPercent: 52, wPercent: 21, hPercent: 42, label: 'Routine' },
      { widgetKey: 'calendar', xPercent: 74, yPercent: 52, wPercent: 22, hPercent: 42, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-19',
    number: 19,
    name: '19. Symmetrical Dual Pillars (Bookends)',
    category: 'symmetrical',
    badge: 'Bookends',
    description: 'Two sturdy symmetric side pillars flanking an open atmospheric center',
    slots: [
      { widgetKey: 'clock', xPercent: 28, yPercent: 12, wPercent: 44, hPercent: 34, label: 'Center Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 28, yPercent: 48, wPercent: 44, hPercent: 14, label: 'Center Title' },
      { widgetKey: 'motivation', xPercent: 28, yPercent: 64, wPercent: 44, hPercent: 24, label: 'Center Quote' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 8, wPercent: 21, hPercent: 42, label: 'Left: Tasks' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 52, wPercent: 21, hPercent: 42, label: 'Left: Calendar' },
      { widgetKey: 'countdown', xPercent: 75, yPercent: 8, wPercent: 21, hPercent: 42, label: 'Right: Countdown' },
      { widgetKey: 'notification', xPercent: 75, yPercent: 52, wPercent: 21, hPercent: 28, label: 'Right: Routine' },
      { widgetKey: 'pomodoro', xPercent: 75, yPercent: 82, wPercent: 21, hPercent: 12, label: 'Right: Timer' },
    ],
  },
  {
    id: 'preset-grid-20',
    number: 20,
    name: '20. Symmetrical Triple Crown',
    category: 'symmetrical',
    badge: 'Triple',
    description: 'Three vertically aligned columns with identical geometric boundaries',
    slots: [
      { widgetKey: 'clock', xPercent: 35, yPercent: 6, wPercent: 30, hPercent: 32, label: 'Central Crown', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 35, yPercent: 40, wPercent: 30, hPercent: 16, label: 'Central Badge' },
      { widgetKey: 'motivation', xPercent: 35, yPercent: 58, wPercent: 30, hPercent: 36, label: 'Central Quote' },
      { widgetKey: 'countdown', xPercent: 5, yPercent: 6, wPercent: 27, hPercent: 44, label: 'Left: Target' },
      { widgetKey: 'tasks', xPercent: 5, yPercent: 52, wPercent: 27, hPercent: 42, label: 'Left: Tasks' },
      { widgetKey: 'notification', xPercent: 68, yPercent: 6, wPercent: 27, hPercent: 44, label: 'Right: Timetable' },
      { widgetKey: 'calendar', xPercent: 68, yPercent: 52, wPercent: 27, hPercent: 22, label: 'Right: Calendar' },
      { widgetKey: 'pomodoro', xPercent: 68, yPercent: 76, wPercent: 27, hPercent: 18, label: 'Right: Pomodoro' },
    ],
  },
  {
    id: 'preset-grid-21',
    number: 21,
    name: '21. Symmetrical Diamond Matrix',
    category: 'symmetrical',
    badge: 'Diamond',
    description: 'Rhombus-inspired layout with dominant center and symmetric satellites',
    slots: [
      { widgetKey: 'clock', xPercent: 26, yPercent: 28, wPercent: 48, hPercent: 34, label: 'Diamond Core', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 30, yPercent: 8, wPercent: 40, hPercent: 16, label: 'North Apex' },
      { widgetKey: 'motivation', xPercent: 30, yPercent: 66, wPercent: 40, hPercent: 26, label: 'South Base' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 28, wPercent: 19, hPercent: 44, label: 'West Flank' },
      { widgetKey: 'countdown', xPercent: 77, yPercent: 28, wPercent: 19, hPercent: 44, label: 'East Flank' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 8, wPercent: 19, hPercent: 18, label: 'Northwest' },
      { widgetKey: 'notification', xPercent: 77, yPercent: 8, wPercent: 19, hPercent: 18, label: 'Northeast' },
      { widgetKey: 'pomodoro', xPercent: 4, yPercent: 74, wPercent: 19, hPercent: 18, label: 'Southwest' },
    ],
  },
  {
    id: 'preset-grid-22',
    number: 22,
    name: '22. Symmetrical 2x4 Laptop Deck',
    category: 'symmetrical',
    badge: '2x4 Deck',
    description: 'Clean two-row, four-column uniform grid designed for rapid scanning',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 8, wPercent: 45, hPercent: 26, label: 'Time Hub', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 51, yPercent: 8, wPercent: 45, hPercent: 26, label: 'Exam Target' },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 37, wPercent: 21, hPercent: 26, label: 'Student ID' },
      { widgetKey: 'pomodoro', xPercent: 27, yPercent: 37, wPercent: 22, hPercent: 26, label: 'Pomodoro' },
      { widgetKey: 'notification', xPercent: 51, yPercent: 37, wPercent: 22, hPercent: 26, label: 'Routine' },
      { widgetKey: 'calendar', xPercent: 75, yPercent: 37, wPercent: 21, hPercent: 26, label: 'Calendar' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 66, wPercent: 45, hPercent: 26, label: 'Tasks Desk' },
      { widgetKey: 'motivation', xPercent: 51, yPercent: 66, wPercent: 45, hPercent: 26, label: 'Daily Goal' },
    ],
  },
  {
    id: 'preset-grid-23',
    number: 23,
    name: '23. Symmetrical Cathedral Vault',
    category: 'symmetrical',
    badge: 'Cathedral',
    description: 'Arched visual balance honoring classical architectural proportions',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 30, yPercent: 4, wPercent: 40, hPercent: 12, label: 'Crown Keystone' },
      { widgetKey: 'clock', xPercent: 25, yPercent: 18, wPercent: 50, hPercent: 32, label: 'Central Altar', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 5, yPercent: 10, wPercent: 18, hPercent: 42, label: 'Left Spire' },
      { widgetKey: 'notification', xPercent: 77, yPercent: 10, wPercent: 18, hPercent: 42, label: 'Right Spire' },
      { widgetKey: 'tasks', xPercent: 5, yPercent: 54, wPercent: 18, hPercent: 40, label: 'Left Nave' },
      { widgetKey: 'calendar', xPercent: 77, yPercent: 54, wPercent: 18, hPercent: 40, label: 'Right Nave' },
      { widgetKey: 'motivation', xPercent: 25, yPercent: 53, wPercent: 24, hPercent: 41, label: 'Intention Crypt' },
      { widgetKey: 'pomodoro', xPercent: 51, yPercent: 53, wPercent: 24, hPercent: 41, label: 'Focus Crypt' },
    ],
  },
  {
    id: 'preset-grid-24',
    number: 24,
    name: '24. Symmetrical Monolith Equilibrium',
    category: 'symmetrical',
    badge: 'Monolith',
    description: 'Solid central stack with mirrored flanking tools for deep concentration',
    slots: [
      { widgetKey: 'clock', xPercent: 32, yPercent: 8, wPercent: 36, hPercent: 28, label: 'Monolith: Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 32, yPercent: 38, wPercent: 36, hPercent: 14, label: 'Monolith: Badge' },
      { widgetKey: 'motivation', xPercent: 32, yPercent: 54, wPercent: 36, hPercent: 38, label: 'Monolith: Goal' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 8, wPercent: 25, hPercent: 42, label: 'Flank 1: Exam' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 52, wPercent: 25, hPercent: 40, label: 'Flank 2: Tasks' },
      { widgetKey: 'notification', xPercent: 71, yPercent: 8, wPercent: 25, hPercent: 42, label: 'Flank 3: Routine' },
      { widgetKey: 'pomodoro', xPercent: 71, yPercent: 52, wPercent: 25, hPercent: 20, label: 'Flank 4: Timer' },
      { widgetKey: 'calendar', xPercent: 71, yPercent: 74, wPercent: 25, hPercent: 18, label: 'Flank 5: Calendar' },
    ],
  },

  // --- MAGAZINE & EDITORIAL LAYOUTS (25 - 30) ---
  {
    id: 'preset-grid-25',
    number: 25,
    name: '25. Magazine Editorial Hero Spread',
    category: 'magazine',
    badge: 'Editorial',
    description: 'Prominent cover-story clock with structured multi-column articles beneath',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 5, yPercent: 5, wPercent: 90, hPercent: 12, label: 'Editorial Masthead' },
      { widgetKey: 'clock', xPercent: 5, yPercent: 19, wPercent: 56, hPercent: 36, label: 'Cover Story: Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 63, yPercent: 19, wPercent: 32, hPercent: 36, label: 'Feature: Exam' },
      { widgetKey: 'tasks', xPercent: 5, yPercent: 58, wPercent: 28, hPercent: 36, label: 'Column 1: Tasks' },
      { widgetKey: 'notification', xPercent: 35, yPercent: 58, wPercent: 29, hPercent: 36, label: 'Column 2: Routine' },
      { widgetKey: 'motivation', xPercent: 66, yPercent: 58, wPercent: 29, hPercent: 20, label: 'Pull Quote' },
      { widgetKey: 'pomodoro', xPercent: 66, yPercent: 80, wPercent: 14, hPercent: 14, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 81, yPercent: 80, wPercent: 14, hPercent: 14, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-26',
    number: 26,
    name: '26. Magazine Double-Page Spread',
    category: 'magazine',
    badge: 'Spread',
    description: 'Left page dedicated to time and identity, right page dedicated to targets and execution',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 6, wPercent: 44, hPercent: 16, label: 'Left Page Header' },
      { widgetKey: 'clock', xPercent: 4, yPercent: 24, wPercent: 44, hPercent: 36, label: 'Left Hero Clock', isPrimary: true },
      { widgetKey: 'motivation', xPercent: 4, yPercent: 62, wPercent: 44, hPercent: 32, label: 'Left Editorial Intention' },
      { widgetKey: 'countdown', xPercent: 52, yPercent: 6, wPercent: 44, hPercent: 26, label: 'Right Page Target' },
      { widgetKey: 'tasks', xPercent: 52, yPercent: 34, wPercent: 21, hPercent: 40, label: 'Right Tasks' },
      { widgetKey: 'notification', xPercent: 75, yPercent: 34, wPercent: 21, hPercent: 40, label: 'Right Routine' },
      { widgetKey: 'pomodoro', xPercent: 52, yPercent: 76, wPercent: 21, hPercent: 18, label: 'Right Timer' },
      { widgetKey: 'calendar', xPercent: 75, yPercent: 76, wPercent: 21, hPercent: 18, label: 'Right Calendar' },
    ],
  },
  {
    id: 'preset-grid-27',
    number: 27,
    name: '27. Magazine Executive Ticker',
    category: 'magazine',
    badge: 'Ticker',
    description: 'Upper continuous news ticker ribbon above balanced analytic cards',
    slots: [
      { widgetKey: 'motivation', xPercent: 4, yPercent: 5, wPercent: 92, hPercent: 14, label: 'Headline Ticker' },
      { widgetKey: 'clock', xPercent: 4, yPercent: 21, wPercent: 44, hPercent: 36, label: 'Analytic: Time', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 50, yPercent: 21, wPercent: 46, hPercent: 36, label: 'Analytic: Milestone' },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 59, wPercent: 22, hPercent: 35, label: 'Author Bio' },
      { widgetKey: 'tasks', xPercent: 28, yPercent: 59, wPercent: 24, hPercent: 35, label: 'Executive Tasks' },
      { widgetKey: 'notification', xPercent: 54, yPercent: 59, wPercent: 24, hPercent: 35, label: 'Schedule' },
      { widgetKey: 'pomodoro', xPercent: 80, yPercent: 59, wPercent: 16, hPercent: 17, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 80, yPercent: 77, wPercent: 16, hPercent: 17, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-28',
    number: 28,
    name: '28. Magazine Broadsheet Ledger',
    category: 'magazine',
    badge: 'Broadsheet',
    description: 'Dense four-column newspaper layout maximizing information visibility',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 68, hPercent: 26, label: 'Broadsheet Banner', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 74, yPercent: 6, wPercent: 22, hPercent: 26, label: 'Index & Edition' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 34, wPercent: 22, hPercent: 60, label: 'Column 1: Target' },
      { widgetKey: 'tasks', xPercent: 28, yPercent: 34, wPercent: 22, hPercent: 60, label: 'Column 2: Tasks' },
      { widgetKey: 'notification', xPercent: 52, yPercent: 34, wPercent: 20, hPercent: 60, label: 'Column 3: Routine' },
      { widgetKey: 'motivation', xPercent: 74, yPercent: 34, wPercent: 22, hPercent: 28, label: 'Column 4: Op-Ed' },
      { widgetKey: 'pomodoro', xPercent: 74, yPercent: 64, wPercent: 10, hPercent: 30, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 86, yPercent: 64, wPercent: 10, hPercent: 30, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-29',
    number: 29,
    name: '29. Magazine Exam Target Feature',
    category: 'magazine',
    badge: 'Target Focus',
    description: 'Public Exam Countdown given primary front-cover billing with clock support',
    slots: [
      { widgetKey: 'countdown', xPercent: 4, yPercent: 6, wPercent: 60, hPercent: 42, label: 'Primary Feature: Exam', isPrimary: true },
      { widgetKey: 'clock', xPercent: 66, yPercent: 6, wPercent: 30, hPercent: 24, label: 'Clock Satellite' },
      { widgetKey: 'nameWidget', xPercent: 66, yPercent: 32, wPercent: 30, hPercent: 16, label: 'Student Badge' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 50, wPercent: 30, hPercent: 44, label: 'Sprint Checklist' },
      { widgetKey: 'notification', xPercent: 36, yPercent: 50, wPercent: 28, hPercent: 44, label: 'Timetable Guide' },
      { widgetKey: 'motivation', xPercent: 66, yPercent: 50, wPercent: 30, hPercent: 22, label: 'Intention Box' },
      { widgetKey: 'pomodoro', xPercent: 66, yPercent: 74, wPercent: 14, hPercent: 20, label: 'Pomodoro' },
      { widgetKey: 'calendar', xPercent: 82, yPercent: 74, wPercent: 14, hPercent: 20, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-30',
    number: 30,
    name: '30. Magazine Swiss Minimal Grid',
    category: 'magazine',
    badge: 'Swiss',
    description: 'Clean rational Swiss typographic architecture with strict baseline rhythm',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 6, yPercent: 6, wPercent: 40, hPercent: 14, label: 'Identity Cell' },
      { widgetKey: 'clock', xPercent: 48, yPercent: 6, wPercent: 46, hPercent: 28, label: 'Swiss Clock Cell', isPrimary: true },
      { widgetKey: 'motivation', xPercent: 6, yPercent: 22, wPercent: 40, hPercent: 24, label: 'Typographic Quote' },
      { widgetKey: 'countdown', xPercent: 48, yPercent: 36, wPercent: 46, hPercent: 26, label: 'Data: Exam' },
      { widgetKey: 'tasks', xPercent: 6, yPercent: 48, wPercent: 40, hPercent: 46, label: 'Data: Tasks' },
      { widgetKey: 'notification', xPercent: 48, yPercent: 64, wPercent: 22, hPercent: 30, label: 'Schedule' },
      { widgetKey: 'calendar', xPercent: 72, yPercent: 64, wPercent: 22, hPercent: 15, label: 'Calendar' },
      { widgetKey: 'pomodoro', xPercent: 72, yPercent: 81, wPercent: 22, hPercent: 13, label: 'Pomodoro' },
    ],
  },

  // --- SIDEBAR DOCK LAYOUTS (31 - 36) ---
  {
    id: 'preset-grid-31',
    number: 31,
    name: '31. Left Command Sidebar Dock',
    category: 'sidebar',
    badge: 'Left Dock',
    description: 'All operational study tools grouped along the left margin leaving canvas open',
    slots: [
      { widgetKey: 'clock', xPercent: 32, yPercent: 8, wPercent: 64, hPercent: 38, label: 'Main Canvas Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 32, yPercent: 48, wPercent: 64, hPercent: 28, label: 'Main Canvas Target' },
      { widgetKey: 'motivation', xPercent: 32, yPercent: 78, wPercent: 64, hPercent: 16, label: 'Bottom Banner' },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 6, wPercent: 25, hPercent: 14, label: 'Sidebar: Name' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 22, wPercent: 25, hPercent: 30, label: 'Sidebar: Tasks' },
      { widgetKey: 'notification', xPercent: 4, yPercent: 54, wPercent: 25, hPercent: 20, label: 'Sidebar: Routine' },
      { widgetKey: 'pomodoro', xPercent: 4, yPercent: 76, wPercent: 12, hPercent: 18, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 17, yPercent: 76, wPercent: 12, hPercent: 18, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-32',
    number: 32,
    name: '32. Right Focus Sidebar Dock',
    category: 'sidebar',
    badge: 'Right Dock',
    description: 'Main study heroes open on the left, utility tools neatly docked to the right edge',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 8, wPercent: 65, hPercent: 40, label: 'Master View Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 50, wPercent: 32, hPercent: 44, label: 'Milestone Desk' },
      { widgetKey: 'motivation', xPercent: 38, yPercent: 50, wPercent: 31, hPercent: 44, label: 'Daily Inspiration' },
      { widgetKey: 'nameWidget', xPercent: 71, yPercent: 6, wPercent: 25, hPercent: 14, label: 'Dock: Name' },
      { widgetKey: 'tasks', xPercent: 71, yPercent: 22, wPercent: 25, hPercent: 30, label: 'Dock: Tasks' },
      { widgetKey: 'notification', xPercent: 71, yPercent: 54, wPercent: 25, hPercent: 24, label: 'Dock: Routine' },
      { widgetKey: 'pomodoro', xPercent: 71, yPercent: 80, wPercent: 12, hPercent: 14, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 84, yPercent: 80, wPercent: 12, hPercent: 14, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-33',
    number: 33,
    name: '33. Dual Sidebar Dock (Double Bookends)',
    category: 'sidebar',
    badge: 'Dual Dock',
    description: 'Compact docks along both left and right edges, framing central hero space',
    slots: [
      { widgetKey: 'clock', xPercent: 26, yPercent: 18, wPercent: 48, hPercent: 38, label: 'Hearth: Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 26, yPercent: 58, wPercent: 48, hPercent: 14, label: 'Hearth: Badge' },
      { widgetKey: 'motivation', xPercent: 26, yPercent: 74, wPercent: 48, hPercent: 20, label: 'Hearth: Goal' },
      { widgetKey: 'tasks', xPercent: 3, yPercent: 8, wPercent: 21, hPercent: 48, label: 'Left Dock: Tasks' },
      { widgetKey: 'calendar', xPercent: 3, yPercent: 58, wPercent: 21, hPercent: 36, label: 'Left Dock: Cal' },
      { widgetKey: 'countdown', xPercent: 76, yPercent: 8, wPercent: 21, hPercent: 48, label: 'Right Dock: Exam' },
      { widgetKey: 'notification', xPercent: 76, yPercent: 58, wPercent: 21, hPercent: 24, label: 'Right Dock: Routine' },
      { widgetKey: 'pomodoro', xPercent: 76, yPercent: 84, wPercent: 21, hPercent: 10, label: 'Right Dock: Timer' },
    ],
  },
  {
    id: 'preset-grid-34',
    number: 34,
    name: '34. Bottom Dock & Hero Timepiece',
    category: 'sidebar',
    badge: 'Bottom Dock',
    description: 'Giant floating centerpiece clock with all tools neatly housed in a bottom row dock',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 30, yPercent: 6, wPercent: 40, hPercent: 12, label: 'Top Badge' },
      { widgetKey: 'clock', xPercent: 15, yPercent: 20, wPercent: 70, hPercent: 46, label: 'Hero Timepiece', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 3, yPercent: 68, wPercent: 18, hPercent: 26, label: 'Dock: Exam' },
      { widgetKey: 'tasks', xPercent: 22, yPercent: 68, wPercent: 18, hPercent: 26, label: 'Dock: Tasks' },
      { widgetKey: 'notification', xPercent: 41, yPercent: 68, wPercent: 18, hPercent: 26, label: 'Dock: Routine' },
      { widgetKey: 'motivation', xPercent: 60, yPercent: 68, wPercent: 18, hPercent: 26, label: 'Dock: Quote' },
      { widgetKey: 'pomodoro', xPercent: 79, yPercent: 68, wPercent: 10, hPercent: 26, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 90, yPercent: 68, wPercent: 8, hPercent: 26, label: 'Cal' },
    ],
  },
  {
    id: 'preset-grid-35',
    number: 35,
    name: '35. Top Toolbar & Full-Width Canvas',
    category: 'sidebar',
    badge: 'Top Toolbar',
    description: 'Header utility strip above an expansive 3-column study matrix',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 3, yPercent: 5, wPercent: 30, hPercent: 12, label: 'User ID' },
      { widgetKey: 'pomodoro', xPercent: 35, yPercent: 5, wPercent: 30, hPercent: 12, label: 'Timer Bar' },
      { widgetKey: 'motivation', xPercent: 67, yPercent: 5, wPercent: 30, hPercent: 12, label: 'Quick Goal' },
      { widgetKey: 'clock', xPercent: 3, yPercent: 19, wPercent: 50, hPercent: 38, label: 'Clock Hub', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 55, yPercent: 19, wPercent: 42, hPercent: 38, label: 'Milestone Hub' },
      { widgetKey: 'tasks', xPercent: 3, yPercent: 59, wPercent: 31, hPercent: 36, label: 'Sprint Tasks' },
      { widgetKey: 'notification', xPercent: 36, yPercent: 59, wPercent: 31, hPercent: 36, label: 'Class Schedule' },
      { widgetKey: 'calendar', xPercent: 69, yPercent: 59, wPercent: 28, hPercent: 36, label: 'Monthly Matrix' },
    ],
  },
  {
    id: 'preset-grid-36',
    number: 36,
    name: '36. Collapsed Sidebar Minimal Dock',
    category: 'sidebar',
    badge: 'Slim Dock',
    description: 'Slim vertical 15% sidebar paired with wide 85% dashboard field',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 3, yPercent: 6, wPercent: 16, hPercent: 14, label: 'Bio' },
      { widgetKey: 'pomodoro', xPercent: 3, yPercent: 22, wPercent: 16, hPercent: 18, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 3, yPercent: 42, wPercent: 16, hPercent: 26, label: 'Calendar' },
      { widgetKey: 'notification', xPercent: 3, yPercent: 70, wPercent: 16, hPercent: 24, label: 'Routine' },
      { widgetKey: 'clock', xPercent: 21, yPercent: 6, wPercent: 76, hPercent: 42, label: 'Main Stage Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 21, yPercent: 50, wPercent: 37, hPercent: 44, label: 'Exam Countdown' },
      { widgetKey: 'tasks', xPercent: 60, yPercent: 50, wPercent: 18, hPercent: 44, label: 'Tasks' },
      { widgetKey: 'motivation', xPercent: 80, yPercent: 50, wPercent: 17, hPercent: 44, label: 'Intention' },
    ],
  },

  // --- SPLIT-SCREEN & MULTI-COLUMN LAYOUTS (37 - 44) ---
  {
    id: 'preset-grid-37',
    number: 37,
    name: '37. Balanced 50/50 Dual-Focus Split',
    category: 'split',
    badge: '50/50 Split',
    description: 'Equal division between current time & status on left, targets & routines on right',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 45, hPercent: 40, label: 'Left: Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 48, wPercent: 45, hPercent: 14, label: 'Left: Bio' },
      { widgetKey: 'motivation', xPercent: 4, yPercent: 64, wPercent: 45, hPercent: 30, label: 'Left: Goal' },
      { widgetKey: 'countdown', xPercent: 51, yPercent: 6, wPercent: 45, hPercent: 34, label: 'Right: Exam' },
      { widgetKey: 'notification', xPercent: 51, yPercent: 42, wPercent: 45, hPercent: 24, label: 'Right: Schedule' },
      { widgetKey: 'tasks', xPercent: 51, yPercent: 68, wPercent: 22, hPercent: 26, label: 'Right: Tasks' },
      { widgetKey: 'pomodoro', xPercent: 74, yPercent: 68, wPercent: 11, hPercent: 26, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 86, yPercent: 68, wPercent: 10, hPercent: 26, label: 'Cal' },
    ],
  },
  {
    id: 'preset-grid-38',
    number: 38,
    name: '38. Tri-Pane 25/50/25 Panoramic Split',
    category: 'split',
    badge: 'Tri-Pane',
    description: 'Prominent 50% center stage flanked by two symmetrical 25% utility wings',
    slots: [
      { widgetKey: 'clock', xPercent: 27, yPercent: 8, wPercent: 46, hPercent: 40, label: 'Center Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 27, yPercent: 50, wPercent: 46, hPercent: 14, label: 'Center Badge' },
      { widgetKey: 'motivation', xPercent: 27, yPercent: 66, wPercent: 46, hPercent: 28, label: 'Center Quote' },
      { widgetKey: 'countdown', xPercent: 3, yPercent: 8, wPercent: 22, hPercent: 44, label: 'Left Wing: Target' },
      { widgetKey: 'tasks', xPercent: 3, yPercent: 54, wPercent: 22, hPercent: 40, label: 'Left Wing: Tasks' },
      { widgetKey: 'notification', xPercent: 75, yPercent: 8, wPercent: 22, hPercent: 44, label: 'Right Wing: Timetable' },
      { widgetKey: 'calendar', xPercent: 75, yPercent: 54, wPercent: 22, hPercent: 20, label: 'Right Wing: Cal' },
      { widgetKey: 'pomodoro', xPercent: 75, yPercent: 76, wPercent: 22, hPercent: 18, label: 'Right Wing: Timer' },
    ],
  },
  {
    id: 'preset-grid-39',
    number: 39,
    name: '39. Horizontal Split (30% Upper / 70% Lower)',
    category: 'split',
    badge: 'Horizontal',
    description: 'Thin upper status deck with an expansive lower study workspace',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 3, yPercent: 5, wPercent: 24, hPercent: 20, label: 'Upper: Bio' },
      { widgetKey: 'clock', xPercent: 29, yPercent: 5, wPercent: 42, hPercent: 20, label: 'Upper: Clock', isPrimary: true },
      { widgetKey: 'pomodoro', xPercent: 73, yPercent: 5, wPercent: 24, hPercent: 20, label: 'Upper: Timer' },
      { widgetKey: 'countdown', xPercent: 3, yPercent: 27, wPercent: 31, hPercent: 68, label: 'Lower: Exam' },
      { widgetKey: 'tasks', xPercent: 36, yPercent: 27, wPercent: 30, hPercent: 68, label: 'Lower: Tasks' },
      { widgetKey: 'notification', xPercent: 68, yPercent: 27, wPercent: 29, hPercent: 33, label: 'Lower: Routine' },
      { widgetKey: 'calendar', xPercent: 68, yPercent: 62, wPercent: 14, hPercent: 33, label: 'Calendar' },
      { widgetKey: 'motivation', xPercent: 83, yPercent: 62, wPercent: 14, hPercent: 33, label: 'Motivation' },
    ],
  },
  {
    id: 'preset-grid-40',
    number: 40,
    name: '40. Horizontal Split (70% Upper / 30% Lower)',
    category: 'split',
    badge: 'Upper Heavy',
    description: 'High-visibility visual upper theater paired with compact lower utility dock',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 56, hPercent: 56, label: 'Upper Theater: Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 62, yPercent: 6, wPercent: 34, hPercent: 38, label: 'Upper Theater: Target' },
      { widgetKey: 'nameWidget', xPercent: 62, yPercent: 46, wPercent: 34, hPercent: 16, label: 'Upper Theater: Bio' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 64, wPercent: 22, hPercent: 30, label: 'Lower Dock: Tasks' },
      { widgetKey: 'notification', xPercent: 28, yPercent: 64, wPercent: 24, hPercent: 30, label: 'Lower Dock: Routine' },
      { widgetKey: 'motivation', xPercent: 54, yPercent: 64, wPercent: 24, hPercent: 30, label: 'Lower Dock: Quote' },
      { widgetKey: 'pomodoro', xPercent: 80, yPercent: 64, wPercent: 9, hPercent: 30, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 90, yPercent: 64, wPercent: 6, hPercent: 30, label: 'Cal' },
    ],
  },
  {
    id: 'preset-grid-41',
    number: 41,
    name: '41. Quad Column Desktop Strip',
    category: 'split',
    badge: '4-Column',
    description: 'Four vertical parallel columns distributing widgets with equal horizontal rhythm',
    slots: [
      { widgetKey: 'clock', xPercent: 3, yPercent: 6, wPercent: 22, hPercent: 44, label: 'Col 1: Clock', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 3, yPercent: 52, wPercent: 22, hPercent: 42, label: 'Col 1: Bio' },
      { widgetKey: 'countdown', xPercent: 27, yPercent: 6, wPercent: 22, hPercent: 44, label: 'Col 2: Exam' },
      { widgetKey: 'pomodoro', xPercent: 27, yPercent: 52, wPercent: 22, hPercent: 42, label: 'Col 2: Timer' },
      { widgetKey: 'tasks', xPercent: 51, yPercent: 6, wPercent: 22, hPercent: 44, label: 'Col 3: Tasks' },
      { widgetKey: 'calendar', xPercent: 51, yPercent: 52, wPercent: 22, hPercent: 42, label: 'Col 3: Cal' },
      { widgetKey: 'notification', xPercent: 75, yPercent: 6, wPercent: 22, hPercent: 44, label: 'Col 4: Routine' },
      { widgetKey: 'motivation', xPercent: 75, yPercent: 52, wPercent: 22, hPercent: 42, label: 'Col 4: Quote' },
    ],
  },
  {
    id: 'preset-grid-42',
    number: 42,
    name: '42. Two-Column Study Flow',
    category: 'split',
    badge: 'Two-Column',
    description: 'Traditional two-column study layout dividing time from operational tasking',
    slots: [
      { widgetKey: 'clock', xPercent: 5, yPercent: 6, wPercent: 43, hPercent: 36, label: 'Time Stream', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 5, yPercent: 44, wPercent: 43, hPercent: 14, label: 'Student Stream' },
      { widgetKey: 'motivation', xPercent: 5, yPercent: 60, wPercent: 43, hPercent: 34, label: 'Goal Stream' },
      { widgetKey: 'countdown', xPercent: 52, yPercent: 6, wPercent: 43, hPercent: 30, label: 'Target Stream' },
      { widgetKey: 'notification', xPercent: 52, yPercent: 38, wPercent: 43, hPercent: 28, label: 'Routine Stream' },
      { widgetKey: 'tasks', xPercent: 52, yPercent: 68, wPercent: 20, hPercent: 26, label: 'Tasks' },
      { widgetKey: 'pomodoro', xPercent: 74, yPercent: 68, wPercent: 10, hPercent: 26, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 86, yPercent: 68, wPercent: 9, hPercent: 26, label: 'Cal' },
    ],
  },
  {
    id: 'preset-grid-43',
    number: 43,
    name: '43. Split Crosswise Horizon',
    category: 'split',
    badge: 'Crosswise',
    description: 'Cross-stitched cards overlapping horizontally to preserve wide wallpaper visibility',
    slots: [
      { widgetKey: 'clock', xPercent: 6, yPercent: 6, wPercent: 54, hPercent: 28, label: 'Upper Left', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 62, yPercent: 6, wPercent: 32, hPercent: 12, label: 'Upper Right' },
      { widgetKey: 'countdown', xPercent: 62, yPercent: 20, wPercent: 32, hPercent: 34, label: 'Center Right' },
      { widgetKey: 'notification', xPercent: 6, yPercent: 36, wPercent: 54, hPercent: 26, label: 'Center Left' },
      { widgetKey: 'tasks', xPercent: 6, yPercent: 64, wPercent: 26, hPercent: 30, label: 'Lower Left' },
      { widgetKey: 'motivation', xPercent: 34, yPercent: 64, wPercent: 26, hPercent: 30, label: 'Lower Center' },
      { widgetKey: 'pomodoro', xPercent: 62, yPercent: 56, wPercent: 15, hPercent: 38, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 79, yPercent: 56, wPercent: 15, hPercent: 38, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-44',
    number: 44,
    name: '44. Split 40/60 Studio Ratio',
    category: 'split',
    badge: '40/60 Split',
    description: 'Narrow 40% focus column combined with wide 60% collaborative dashboard canvas',
    slots: [
      { widgetKey: 'clock', xPercent: 44, yPercent: 6, wPercent: 52, hPercent: 38, label: 'Wide Stage: Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 44, yPercent: 46, wPercent: 25, hPercent: 48, label: 'Target Milestone' },
      { widgetKey: 'notification', xPercent: 71, yPercent: 46, wPercent: 25, hPercent: 48, label: 'Schedule Routine' },
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 6, wPercent: 36, hPercent: 14, label: 'Bio Card' },
      { widgetKey: 'motivation', xPercent: 4, yPercent: 22, wPercent: 36, hPercent: 24, label: 'Inspiration' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 48, wPercent: 36, hPercent: 32, label: 'Checklist' },
      { widgetKey: 'pomodoro', xPercent: 4, yPercent: 82, wPercent: 17, hPercent: 12, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 23, yPercent: 82, wPercent: 17, hPercent: 12, label: 'Calendar' },
    ],
  },

  // --- MASONRY & COMPACT ARRAYS (45 - 48) ---
  {
    id: 'preset-grid-45',
    number: 45,
    name: '45. Dynamic 3-Column Masonry Flow',
    category: 'masonry',
    badge: 'Masonry',
    description: 'Staggered vertical cards fitting organically without vertical blank voids',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 30, hPercent: 34, label: 'Col 1: Clock', isPrimary: true },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 42, wPercent: 30, hPercent: 52, label: 'Col 1: Tasks' },
      { widgetKey: 'nameWidget', xPercent: 36, yPercent: 6, wPercent: 28, hPercent: 16, label: 'Col 2: Name' },
      { widgetKey: 'countdown', xPercent: 36, yPercent: 24, wPercent: 28, hPercent: 42, label: 'Col 2: Exam' },
      { widgetKey: 'motivation', xPercent: 36, yPercent: 68, wPercent: 28, hPercent: 26, label: 'Col 2: Motivation' },
      { widgetKey: 'notification', xPercent: 66, yPercent: 6, wPercent: 30, hPercent: 44, label: 'Col 3: Routine' },
      { widgetKey: 'pomodoro', xPercent: 66, yPercent: 52, wPercent: 14, hPercent: 42, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 82, yPercent: 52, wPercent: 14, hPercent: 42, label: 'Calendar' },
    ],
  },
  {
    id: 'preset-grid-46',
    number: 46,
    name: '46. Masonry Waterfall Column Cascade',
    category: 'masonry',
    badge: 'Waterfall',
    description: 'Alternating masonry cards creating a rhythmic waterfall cascading down the viewport',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 6, wPercent: 28, hPercent: 14, label: 'Pillar A1' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 22, wPercent: 28, hPercent: 44, label: 'Pillar A2' },
      { widgetKey: 'pomodoro', xPercent: 4, yPercent: 68, wPercent: 28, hPercent: 26, label: 'Pillar A3' },
      { widgetKey: 'clock', xPercent: 34, yPercent: 6, wPercent: 32, hPercent: 48, label: 'Pillar B1: Clock', isPrimary: true },
      { widgetKey: 'tasks', xPercent: 34, yPercent: 56, wPercent: 32, hPercent: 38, label: 'Pillar B2: Tasks' },
      { widgetKey: 'notification', xPercent: 68, yPercent: 6, wPercent: 28, hPercent: 38, label: 'Pillar C1' },
      { widgetKey: 'motivation', xPercent: 68, yPercent: 46, wPercent: 28, hPercent: 32, label: 'Pillar C2' },
      { widgetKey: 'calendar', xPercent: 68, yPercent: 80, wPercent: 28, hPercent: 14, label: 'Pillar C3' },
    ],
  },
  {
    id: 'preset-grid-47',
    number: 47,
    name: '47. Masonry Dense: Compact Study Tiles',
    category: 'masonry',
    badge: 'Dense Tiles',
    description: 'Tightly nested mosaic tiles eliminating wasted space on laptop screens',
    slots: [
      { widgetKey: 'clock', xPercent: 4, yPercent: 6, wPercent: 45, hPercent: 30, label: 'Clock Mosaic', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 51, yPercent: 6, wPercent: 45, hPercent: 14, label: 'Title Tile' },
      { widgetKey: 'pomodoro', xPercent: 51, yPercent: 22, wPercent: 45, hPercent: 14, label: 'Pomodoro Tile' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 38, wPercent: 30, hPercent: 32, label: 'Exam Target' },
      { widgetKey: 'notification', xPercent: 36, yPercent: 38, wPercent: 30, hPercent: 32, label: 'Routine Schedule' },
      { widgetKey: 'tasks', xPercent: 68, yPercent: 38, wPercent: 28, hPercent: 32, label: 'Task List' },
      { widgetKey: 'motivation', xPercent: 4, yPercent: 72, wPercent: 62, hPercent: 22, label: 'Intention Banner' },
      { widgetKey: 'calendar', xPercent: 68, yPercent: 72, wPercent: 28, hPercent: 22, label: 'Calendar Desk' },
    ],
  },
  {
    id: 'preset-grid-48',
    number: 48,
    name: '48. Single Column Vertical Reading Stack',
    category: 'masonry',
    badge: 'Vertical',
    description: 'Single centered vertical column designed for narrow browser windows and tablets',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 20, yPercent: 4, wPercent: 60, hPercent: 10, label: 'Top Bio' },
      { widgetKey: 'clock', xPercent: 15, yPercent: 16, wPercent: 70, hPercent: 22, label: 'Centered Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 20, yPercent: 40, wPercent: 60, hPercent: 18, label: 'Exam Milestone' },
      { widgetKey: 'notification', xPercent: 20, yPercent: 60, wPercent: 60, hPercent: 16, label: 'Class Alert' },
      { widgetKey: 'tasks', xPercent: 20, yPercent: 78, wPercent: 30, hPercent: 18, label: 'Sprint' },
      { widgetKey: 'motivation', xPercent: 52, yPercent: 78, wPercent: 28, hPercent: 18, label: 'Goal' },
      { widgetKey: 'pomodoro', xPercent: 82, yPercent: 16, wPercent: 14, hPercent: 22, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 16, wPercent: 9, hPercent: 22, label: 'Cal' },
    ],
  },

  // --- MINIMAL & HORIZON ARRAYS (49 - 50) ---
  {
    id: 'preset-grid-49',
    number: 49,
    name: '49. Four Corners Perimeter Open Horizon',
    category: 'minimal',
    badge: 'Perimeter',
    description: 'Widgets pushed to the four outer corners, leaving the center 100% open for wallpaper art',
    slots: [
      { widgetKey: 'nameWidget', xPercent: 4, yPercent: 4, wPercent: 28, hPercent: 16, label: 'Top-Left: Name' },
      { widgetKey: 'tasks', xPercent: 4, yPercent: 22, wPercent: 28, hPercent: 38, label: 'Left: Tasks' },
      { widgetKey: 'calendar', xPercent: 4, yPercent: 62, wPercent: 28, hPercent: 34, label: 'Bottom-Left: Cal' },
      { widgetKey: 'clock', xPercent: 34, yPercent: 34, wPercent: 32, hPercent: 28, label: 'Floating Heart Clock', isPrimary: true },
      { widgetKey: 'countdown', xPercent: 68, yPercent: 4, wPercent: 28, hPercent: 32, label: 'Top-Right: Exam' },
      { widgetKey: 'notification', xPercent: 68, yPercent: 38, wPercent: 28, hPercent: 28, label: 'Right: Routine' },
      { widgetKey: 'motivation', xPercent: 68, yPercent: 68, wPercent: 28, hPercent: 28, label: 'Bottom-Right: Quote' },
      { widgetKey: 'pomodoro', xPercent: 38, yPercent: 64, wPercent: 24, hPercent: 14, label: 'Sub-Timer' },
    ],
  },
  {
    id: 'preset-grid-50',
    number: 50,
    name: '50. Zen Solitary Hearth & Low Satellites',
    category: 'minimal',
    badge: 'Zen Minimal',
    description: 'Ultimate minimal focus with solitary hero timepiece and discreet lower anchors',
    slots: [
      { widgetKey: 'clock', xPercent: 20, yPercent: 16, wPercent: 60, hPercent: 44, label: 'Zen Timepiece', isPrimary: true },
      { widgetKey: 'nameWidget', xPercent: 25, yPercent: 62, wPercent: 50, hPercent: 12, label: 'Centum Badge' },
      { widgetKey: 'countdown', xPercent: 4, yPercent: 78, wPercent: 22, hPercent: 18, label: 'Exam Satellite' },
      { widgetKey: 'tasks', xPercent: 28, yPercent: 78, wPercent: 22, hPercent: 18, label: 'Tasks Satellite' },
      { widgetKey: 'notification', xPercent: 52, yPercent: 78, wPercent: 22, hPercent: 18, label: 'Routine Satellite' },
      { widgetKey: 'motivation', xPercent: 76, yPercent: 78, wPercent: 20, hPercent: 18, label: 'Quote Satellite' },
      { widgetKey: 'pomodoro', xPercent: 4, yPercent: 6, wPercent: 14, hPercent: 8, label: 'Timer' },
      { widgetKey: 'calendar', xPercent: 82, yPercent: 6, wPercent: 14, hPercent: 8, label: 'Cal' },
    ],
  },
];

/**
 * Calculates responsive pixel coordinates for all active dashboard widgets
 * based on the chosen Grid Arrangement Preset and canvas dimensions.
 */
export function computePresetWidgetCoordinates(
  preset: LayoutPresetOption,
  screenWidth: number,
  screenHeight: number,
  gap: number = 16,
  margin: number = 24
): Record<DashboardWidgetKey, { x: number; y: number; width: number; height: number }> {
  const usableWidth = Math.max(600, screenWidth - margin * 2);
  const usableHeight = Math.max(500, screenHeight - margin * 2);

  const coords: Partial<Record<DashboardWidgetKey, { x: number; y: number; width: number; height: number }>> = {};

  preset.slots.forEach(slot => {
    const rawX = margin + (slot.xPercent / 100) * usableWidth;
    const rawY = margin + (slot.yPercent / 100) * usableHeight;
    const rawW = (slot.wPercent / 100) * usableWidth - (gap / 2);
    const rawH = (slot.hPercent / 100) * usableHeight - (gap / 2);

    coords[slot.widgetKey] = {
      x: Math.round(Math.max(margin, Math.min(rawX, screenWidth - rawW - margin))),
      y: Math.round(Math.max(margin, Math.min(rawY, screenHeight - rawH - margin))),
      width: Math.round(Math.max(160, rawW)),
      height: Math.round(Math.max(60, rawH)),
    };
  });

  // Guarantee coordinates exist for any unmapped widgets by docking in a safe bottom row
  const allKeys: DashboardWidgetKey[] = ['clock', 'countdown', 'nameWidget', 'tasks', 'notification', 'calendar', 'motivation', 'pomodoro', 'scratchpad', 'breakStats', 'studyCommandCenter', 'studyTracker'];
  let unmappedOffset = 0;
  allKeys.forEach(key => {
    if (!coords[key]) {
      coords[key] = {
        x: Math.round(margin + (unmappedOffset * 220) % (screenWidth - 240)),
        y: Math.round(screenHeight - 120),
        width: 200,
        height: 90,
      };
      unmappedOffset++;
    }
  });

  return coords as Record<DashboardWidgetKey, { x: number; y: number; width: number; height: number }>;
}

/**
 * Calculates optimal responsive coordinates specifically tailored for laptop displays
 * (1366x768 to 1920x1080 screens) ensuring all widgets fit without clipping.
 */
export function computeLaptopFitCoordinates(
  screenWidth: number,
  screenHeight: number
): Record<DashboardWidgetKey, { x: number; y: number; width: number; height: number }> {
  const sw = Math.max(1024, screenWidth);
  const sh = Math.max(650, screenHeight);
  const pad = 24;

  // Center Hero Clock
  const clockW = Math.min(560, sw * 0.45);
  const clockH = Math.min(160, sh * 0.22);
  const clockX = Math.round((sw - clockW) / 2);
  const clockY = pad + 15;

  // Exam Countdown (Flanking right or top right)
  const cdW = Math.min(420, sw * 0.34);
  const cdH = 160;
  const cdX = sw - cdW - pad;
  const cdY = clockY;

  // Daily Register (Scratchpad) — Left main workspace
  const regW = Math.min(440, sw * 0.35);
  const regH = Math.min(320, sh * 0.44);
  const regX = pad;
  const regY = clockY + clockH + 16;

  // Pomodoro Focus Timer — Center below clock
  const pomoW = Math.min(340, sw * 0.28);
  const pomoH = 220;
  const pomoX = Math.round((sw - pomoW) / 2);
  const pomoY = clockY + clockH + 16;

  // Tasks & Habits — Right side below countdown
  const taskW = Math.min(380, sw * 0.32);
  const taskH = Math.min(260, sh * 0.36);
  const taskX = sw - taskW - pad;
  const taskY = cdY + cdH + 16;

  // Motivation Quote Banner — Bottom dock center
  const motW = Math.min(520, sw * 0.45);
  const motH = 90;
  const motX = Math.round((sw - motW) / 2);
  const motY = sh - motH - pad;

  // Centum Badge Name Widget — Above or below clock
  const nameW = 380;
  const nameH = 80;
  const nameX = pad;
  const nameY = clockY;

  // Notification / Routine Schedule
  const notifW = 360;
  const notifH = 140;
  const notifX = pad;
  const notifY = regY + regH + 16;

  // Calendar
  const calW = 280;
  const calH = 240;
  const calX = sw - calW - pad;
  const calY = sh - calH - pad;

  return {
    clock: { x: clockX, y: clockY, width: Math.round(clockW), height: Math.round(clockH) },
    countdown: { x: Math.round(cdX), y: Math.round(cdY), width: Math.round(cdW), height: Math.round(cdH) },
    nameWidget: { x: Math.round(nameX), y: Math.round(nameY), width: Math.round(nameW), height: Math.round(nameH) },
    scratchpad: { x: Math.round(regX), y: Math.round(regY), width: Math.round(regW), height: Math.round(regH) },
    pomodoro: { x: Math.round(pomoX), y: Math.round(pomoY), width: Math.round(pomoW), height: Math.round(pomoH) },
    tasks: { x: Math.round(taskX), y: Math.round(taskY), width: Math.round(taskW), height: Math.round(taskH) },
    motivation: { x: Math.round(motX), y: Math.round(motY), width: Math.round(motW), height: Math.round(motH) },
    notification: { x: Math.round(notifX), y: Math.round(notifY), width: Math.round(notifW), height: Math.round(notifH) },
    calendar: { x: Math.round(calX), y: Math.round(calY), width: Math.round(calW), height: Math.round(calH) },
    breakStats: { x: Math.round(taskX), y: Math.round(taskY + taskH + 12), width: Math.round(taskW), height: 180 },
    studyCommandCenter: { x: Math.round(regX), y: Math.round(regY + regH + 16), width: Math.round(regW), height: 240 },
    studyTracker: { x: Math.round(sw * 0.2), y: Math.round(sh * 0.25), width: Math.min(680, Math.round(sw * 0.6)), height: Math.min(500, Math.round(sh * 0.55)) },
  };
}

/**
 * Mobile-specific stack is permanently disabled.
 * Strictly returns laptop-fit multi-column positioning for all screens.
 */
export function computeMobileFitCoordinates(
  screenWidth: number,
  screenHeight: number
): Record<DashboardWidgetKey, { x: number; y: number; width: number; height: number }> {
  return computeLaptopFitCoordinates(screenWidth, screenHeight);
}
