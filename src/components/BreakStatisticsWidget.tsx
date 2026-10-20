import React from 'react';
import { Coffee, Activity, Award, TrendingUp, Sparkles, Clock, ShieldCheck, Flame, ArrowUpRight } from 'lucide-react';

interface BreakStatisticsWidgetProps {
  totalBreaksTaken: number;
  timeSpentOnBreaksThisWeek: number;
  productivityImpactScore: number;
  streakCount: number;
  onOpenHistory: () => void;
  onOpenBadge: () => void;
  onRequestBreak: () => void;
  isFocusActive: boolean;
  glassBg?: boolean;
  showHandles?: boolean;
  onToggleTransparency?: () => void;
}

export default function BreakStatisticsWidget({
  totalBreaksTaken = 0,
  timeSpentOnBreaksThisWeek = 0,
  productivityImpactScore = 95,
  streakCount = 0,
  onOpenHistory,
  onOpenBadge,
  onRequestBreak,
  isFocusActive = false,
  glassBg = true,
  showHandles = false,
  onToggleTransparency,
}: BreakStatisticsWidgetProps) {
  const getImpactColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 75) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getImpactStatus = (score: number) => {
    if (score >= 90) return 'Optimal Recovery';
    if (score >= 75) return 'Balanced Focus';
    return 'Needs Recovery Break';
  };

  return (
    <div className="w-full h-full flex flex-col justify-between select-none relative">
      {/* Handles & Transparency Switch */}
      {showHandles && (
        <>
          <div className="drag-pill absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400/40 pointer-events-none" />
          {onToggleTransparency && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleTransparency();
              }}
              title={glassBg ? 'Switch to Transparent' : 'Switch to Glass Card'}
              className="no-drag absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 text-[9px] font-mono text-white/80 hover:text-white border border-white/20 transition cursor-pointer z-30 flex items-center gap-1 shadow-sm"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${glassBg ? 'bg-cyan-400' : 'bg-amber-400'}`} />
              <span>{glassBg ? 'Glass' : 'Transp.'}</span>
            </button>
          )}
        </>
      )}

      {/* Widget Header */}
      <div className="flex items-center justify-between no-drag">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
            <Coffee className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white flex items-center gap-1.5">
              <span>Break & Wellness Stats</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                BREVO
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-[10px]"
          title="Open Focus History and Study Analytics"
        >
          <span>History</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-3 gap-2 my-2 no-drag">
        {/* Total Breaks */}
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Total Breaks</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 tabular-digits font-mono my-0.5">
            {totalBreaksTaken}
          </div>
          <span className="text-[9px] text-white/40">Verified pauses</span>
        </div>

        {/* Time Spent This Week */}
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Break Time (Wk)</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 tabular-digits font-mono my-0.5">
            {timeSpentOnBreaksThisWeek}m
          </div>
          <span className="text-[9px] text-white/40">Past 7 days</span>
        </div>

        {/* Productivity Impact Score */}
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Impact Score</span>
          <div className="text-xl sm:text-2xl font-black text-amber-300 tabular-digits font-mono my-0.5">
            {productivityImpactScore}
          </div>
          <span className="text-[9px] text-white/40">/100 wellness</span>
        </div>
      </div>

      {/* Wellness & Streak Badge Status Bar */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10 text-[10px] no-drag">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white/60">Status:</span>
          <span className={`px-2 py-0.2 rounded-full font-bold border ${getImpactColor(productivityImpactScore)}`}>
            {getImpactStatus(productivityImpactScore)}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenBadge}
          className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition cursor-pointer font-bold"
          title="View Focus Streak Badge"
        >
          <Flame className="w-3 h-3 text-amber-400" />
          <span>🔥 {streakCount} Cycles</span>
        </button>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 no-drag text-[10px]">
        <span className="text-white/40 truncate">
          {isFocusActive ? 'Active Sprint in Progress' : '5m Recovery Breaks by Brevo Email'}
        </span>

        {isFocusActive && (
          <button
            type="button"
            onClick={onRequestBreak}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <Coffee className="w-3 h-3" />
            <span>Request 5m Break</span>
          </button>
        )}
      </div>
    </div>
  );
}
