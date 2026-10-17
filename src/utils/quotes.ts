/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MotivationQuote {
  id: string;
  quote: string;
  author: string;
  category: 'consistency' | 'discipline' | 'centum' | 'perseverance' | 'focus';
}

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    id: 'q1',
    quote: "Centum is not just an ambition; it is the daily habit of relentless, error-free preparation.",
    author: "BK Nithileshvar",
    category: 'centum',
  },
  {
    id: 'q2',
    quote: "Discipline is choosing between what you want now and what you want most for your future.",
    author: "Abraham Lincoln",
    category: 'discipline',
  },
  {
    id: 'q3',
    quote: "Success is the sum of small, focused efforts repeated day in and day out.",
    author: "Robert Collier",
    category: 'consistency',
  },
  {
    id: 'q4',
    quote: "Difficult derivations today become your effortless 5-markers on examination day.",
    author: "Study Law",
    category: 'focus',
  },
  {
    id: 'q5',
    quote: "Do not count the days to March 3. Make every single study hour leading to it count.",
    author: "Muhammad Ali",
    category: 'perseverance',
  },
  {
    id: 'q6',
    quote: "Consistency turns average talent into genius. Show up for tuition, practice the formula sheets, master the drills.",
    author: "Focus Manifesto",
    category: 'consistency',
  },
  {
    id: 'q7',
    quote: "When your focus is absolute, pressure turns into laser-sharp execution.",
    author: "APES AI",
    category: 'focus',
  },
  {
    id: 'q8',
    quote: "The pain of discipline is far less than the pain of regret. Keep solving, keep revising.",
    author: "Board Aspirant",
    category: 'discipline',
  },
];
