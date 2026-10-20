import React from 'react';
import { Award, Flame, Coffee, Sparkles, Check, X, ArrowRight } from 'lucide-react';

interface FocusStreakBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  subject?: string;
}

export default function FocusStreakBadgeModal({
  isOpen,
  onClose,
  streakCount = 1,
  subject = 'Deep Focus',
}: FocusStreakBadgeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#090d19] border-2 border-amber-400/60 p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.35)] flex flex-col items-center text-center text-white animate-in zoom-in-95 duration-300 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Animated Background Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Sparks */}
        <div className="absolute top-4 right-4 flex items-center gap-1 text-amber-300/60 text-xs font-mono">
          <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
        </div>

        {/* Central Animated Badge */}
        <div className="relative my-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center transform hover:scale-105 transition duration-300 animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-[#0c1424] flex flex-col items-center justify-center">
              <Award className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-black text-xs shadow-md border-2 border-[#090d19]">
            🔥 {streakCount}
          </span>
        </div>

        {/* Title & Celebration Copy */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-2">
          Focus Cycle Master!
        </h3>
        <p className="text-xs text-amber-300 font-semibold tracking-wider uppercase mt-1">
          Full Study + Recovery Cycle Honored
        </p>

        <p className="text-xs text-white/70 leading-relaxed mt-3 max-w-sm">
          Sensational mental fortitude! You completed your deep focus sprint on <strong className="text-white">{subject}</strong> and honored your verified 5-minute recovery break without skipping.
        </p>

        {/* Metrics Pill */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-left">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-white/40">Total Cycles</div>
              <div className="font-bold text-white font-mono">{streakCount} Completed</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-white/40">Fatigue Index</div>
              <div className="font-bold text-emerald-300">Optimal Recovery</div>
            </div>
          </div>
        </div>

        {/* Claim Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Claim Reward & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
