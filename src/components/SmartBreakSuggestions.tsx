import React, { useState } from 'react';
import { Eye, Activity, HeartPulse, Sparkles, Check, ChevronRight, ChevronLeft, Droplets, RotateCcw } from 'lucide-react';

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  durationSec: number;
  icon: any;
  steps: string[];
  benefit: string;
}

export const SMART_BREAK_EXERCISES: ExerciseItem[] = [
  {
    id: 'eye-strain',
    name: '20-20-20 Eye Strain Relief',
    category: 'Vision Recovery',
    durationSec: 30,
    icon: Eye,
    steps: [
      'Gently look away from your screen at an object 20 feet (6 meters) away.',
      'Blink deliberately 10 times to re-lubricate your eye surface.',
      'Slowly trace large clockwise circles with your gaze, then counter-clockwise.',
    ],
    benefit: 'Relaxes ciliary muscles and prevents screen-induced digital eye fatigue.',
  },
  {
    id: 'neck-stretch',
    name: 'Cervical Neck & Trapezius Relief',
    category: 'Muscle Mobility',
    durationSec: 45,
    icon: Activity,
    steps: [
      'Slowly drop your chin toward your chest and hold for 10 seconds.',
      'Gently tilt your right ear toward your right shoulder for 10 seconds.',
      'Repeat on the left side, feeling the stretch along your trapezius.',
      'Roll your shoulders backward 5 times in a wide circular motion.',
    ],
    benefit: 'Releases upper cervical tension caused by prolonged downward studying posture.',
  },
  {
    id: 'spine-decompression',
    name: 'Standing Spine Decompression',
    category: 'Posture Realignment',
    durationSec: 45,
    icon: HeartPulse,
    steps: [
      'Stand up from your desk and place feet shoulder-width apart.',
      'Interlace fingers, flip palms upward, and reach toward the ceiling.',
      'Elongate your spine while taking 3 deep belly breaths.',
      'Gently side-bend slightly left and right.',
    ],
    benefit: 'Restores intervertebral disc spacing and activates venous blood return.',
  },
  {
    id: 'wrist-carpal',
    name: 'Wrist & Finger Flexor Stretches',
    category: 'RSI Prevention',
    durationSec: 30,
    icon: Sparkles,
    steps: [
      'Extend your right arm forward with palm facing up; gently pull fingers down with left hand.',
      'Hold 15 seconds, then reverse with palm down.',
      'Repeat on the left arm, then open and close fists rapidly 10 times.',
    ],
    benefit: 'Protects the median nerve from repetitive strain during intensive typing and note-taking.',
  },
  {
    id: 'hydration-breathing',
    name: 'Hydration & 4-7-8 Parasympathetic Reset',
    category: 'Cellular Wellness',
    durationSec: 60,
    icon: Droplets,
    steps: [
      'Drink a full glass (200-250ml) of clean water to rehydrate brain cells.',
      'Inhale quietly through your nose for a count of 4.',
      'Hold your breath for a count of 7.',
      'Exhale completely through your mouth with a whoosh for a count of 8. Repeat 3 times.',
    ],
    benefit: 'Rapidly lowers cortisol, reduces exam anxiety, and oxygenates neural pathways.',
  },
];

interface SmartBreakSuggestionsProps {
  onCompleteExercise?: (exerciseId: string) => void;
  completedList?: string[];
  compact?: boolean;
}

export default function SmartBreakSuggestions({
  onCompleteExercise,
  completedList = [],
  compact = false,
}: SmartBreakSuggestionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const currentExercise = SMART_BREAK_EXERCISES[activeIndex];
  const isCompleted = completedList.includes(currentExercise.id);
  const Icon = currentExercise.icon;

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % SMART_BREAK_EXERCISES.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + SMART_BREAK_EXERCISES.length) % SMART_BREAK_EXERCISES.length);
  };

  return (
    <div className={`rounded-2xl border transition ${compact ? 'p-3 bg-black/40 border-emerald-500/30' : 'p-4 bg-emerald-500/10 border-emerald-500/40 text-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
              Smart Break Suggestion ({activeIndex + 1}/{SMART_BREAK_EXERCISES.length})
            </span>
            <span className="text-xs font-bold text-white block truncate max-w-[200px]">
              {currentExercise.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
            title="Previous stretch"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
            title="Next stretch"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-1.5 my-2">
        {currentExercise.steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[11px] text-white/80 leading-snug">
            <span className="w-4 h-4 rounded-full bg-white/10 text-[9px] font-mono font-bold flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-emerald-200/70 italic mb-2.5">
        💡 {currentExercise.benefit}
      </div>

      {/* Complete Button */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <span className="text-[10px] font-mono text-white/50">
          ⏱️ Recommended: {currentExercise.durationSec}s
        </span>

        <button
          type="button"
          onClick={() => onCompleteExercise && onCompleteExercise(currentExercise.id)}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
            isCompleted
              ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          <Check className="w-3 h-3" />
          <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
        </button>
      </div>
    </div>
  );
}
