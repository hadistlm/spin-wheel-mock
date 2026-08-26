import React from 'react';
import { WheelSegment } from '../types';
import { Sparkles, Trophy, Award, SlidersHorizontal, Smartphone, Monitor } from 'lucide-react';

interface StatsBarProps {
  segments: WheelSegment[];
  totalSpins: number;
  totalWins: number;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenSettings: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  segments,
  totalSpins,
  totalWins,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenSettings,
}) => {
  const winSegments = segments.filter((s) => !s.isLoss);
  const totalWeight = segments.reduce((acc, s) => acc + Math.max(0.001, s.weight), 0);
  const winWeight = winSegments.reduce((acc, s) => acc + Math.max(0.001, s.weight), 0);
  const overallWinRate = totalWeight > 0 ? (winWeight / totalWeight) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
      {/* Left: Quick Live Probability stats */}
      <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-md">
        <div className="flex items-center gap-1 font-semibold text-slate-200">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Overall Win Rate:</span>
          <span className="font-bold text-emerald-400">{overallWinRate.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <span>Spins:</span>
          <span className="font-bold text-indigo-400">{totalSpins}</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <span>Prizes Won:</span>
          <span className="font-bold text-purple-400">{totalWins}</span>
        </div>
      </div>

      {/* Right: View Mode (Kiosk Mobile Frame vs Full Screen) & Quick Settings */}
      <div className="flex items-center gap-2">
        <button
          id="btn-toggle-frame-mode"
          type="button"
          onClick={onTogglePhoneFrame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/90 text-slate-300 hover:bg-slate-700 transition-colors shadow-2xs font-semibold"
          title="Toggle between Mobile Kiosk Display and Fullscreen Desktop"
        >
          {isPhoneFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Width</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Kiosk Frame View</span>
            </>
          )}
        </button>

        <button
          id="btn-quick-odds"
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-colors shadow-2xs font-semibold"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Customize Odds</span>
        </button>
      </div>
    </div>
  );
};
