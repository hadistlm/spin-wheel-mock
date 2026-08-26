import React, { useState } from 'react';
import { WheelSegment, SpinConfig, WheelTheme, ClaimedReward, DisplayMode } from '../types';
import { BtnLogoFade } from '../components/KioskHeader';
import { KioskFooter } from '../components/KioskFooter';
import { SpinningWheel } from '../components/SpinningWheel';
import { RewardClaimModal } from '../components/RewardClaimModal';

interface KioskViewProps {
  segments: WheelSegment[];
  config: SpinConfig;
  activeTheme: WheelTheme;
  claimedRewards: ClaimedReward[];
  displayMode: DisplayMode;
  onSpinStart: () => void;
  onSpinEnd: (winningSegment: WheelSegment) => void;
  onClaimReward: (reward: ClaimedReward) => void;
  onToggleSound: () => void;
}

export const KioskView: React.FC<KioskViewProps> = ({
  segments,
  config,
  activeTheme,
  claimedRewards,
  displayMode,
  onSpinStart,
  onSpinEnd,
  onClaimReward,
  onToggleSound,
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false);

  const handleStart = () => {
    setIsSpinning(true);
    setWinningSegment(null);
    onSpinStart();
  };

  const handleEnd = (winner: WheelSegment) => {
    setIsSpinning(false);
    setWinningSegment(winner);
    onSpinEnd(winner);
    setTimeout(() => {
      setIsClaimModalOpen(true);
    }, 450);
  };

  // Container width styling based on displayMode
  const getContainerWidthClass = () => {
    switch (displayMode) {
      case 'desktop':
        return 'max-w-6xl my-4 rounded-3xl border border-slate-800 shadow-2xl bg-[#0F172A] ring-1 ring-slate-700/40';
      case 'tablet':
        return 'max-w-3xl my-3 rounded-2xl border border-slate-800 shadow-2xl bg-[#0F172A] ring-1 ring-slate-700/40';
      case 'mobile':
        return 'max-w-[480px] my-2 rounded-2xl border border-slate-800 shadow-2xl bg-[#0F172A] ring-1 ring-slate-700/40';
      case 'signage':
      default:
        // 100% Fullscreen digital signage view
        return 'w-full min-h-screen my-0 rounded-none border-none shadow-none bg-transparent';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-between items-center relative overflow-x-hidden font-sans select-none">
      {/* Background Decorative Ambient Canvas */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0F172A] to-[#0B1120] pointer-events-none" />

      {/* Main Kiosk Container */}
      <main
        className={`w-full relative z-20 transition-all duration-300 flex flex-col justify-between ${getContainerWidthClass()}`}
      >
        {/* Center Stage & Wheel Content Area */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 bg-sleek-grid overflow-hidden">
          {/* Subtle watermark in background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            <svg width="460" height="460" viewBox="0 0 200 200" fill="none" className="text-indigo-500">
              <path
                d="M100 0 C120 40 160 40 200 100 C160 160 120 160 100 200 C80 160 40 160 0 100 C40 40 80 40 100 0 Z"
                fill="currentColor"
                opacity="0.12"
              />
              <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            </svg>
          </div>

          {/* Brand Logo (btn theme) above event title */}
          {activeTheme.id === 'btn-housing-expo' && (
            <div
              className={`relative z-10 flex justify-center ${
                displayMode === 'signage' ? 'mb-10 sm:mb-14' : 'mb-3 sm:mb-4'
              }`}
            >
              <BtnLogoFade size={displayMode === 'signage' ? 'signage' : 'default'} />
            </div>
          )}

          {/* Event Title Header */}
          <div
            className={`text-center relative z-10 ${
              displayMode === 'signage' ? 'mb-8 sm:mb-12' : 'mb-3 sm:mb-4'
            }`}
          >
            <div
              className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-black uppercase tracking-wider ${
                displayMode === 'signage' ? 'px-6 py-2.5 text-xl sm:text-2xl' : 'px-3.5 py-1 text-[11px]'
              }`}
            >
              <span>DANANTARA BTN HOUSING EXPO 2026</span>
            </div>
          </div>

          {/* Interactive Wheel Component (Auto-spun on click) */}
          <div className="relative z-10 w-full flex justify-center">
            <SpinningWheel
              segments={segments}
              config={config}
              theme={activeTheme}
              isSpinning={isSpinning}
              displayMode={displayMode}
              onSpinStart={handleStart}
              onSpinEnd={handleEnd}
            />
          </div>

          {/* Live Prize Segment Badges underneath */}
          <div
            className={`mt-20 w-full relative z-10 flex flex-wrap items-center justify-center ${
              displayMode === 'signage' ? 'max-w-4xl gap-4 px-4' : 'max-w-md gap-1.5 px-2'
            }`}
          >
            {segments.map((s) => {
              const hasQuota = !s.unlimitedQuota && s.initialQuota !== undefined;
              const remaining = hasQuota ? Math.max(0, s.initialQuota! - (s.wonCount || 0)) : null;
              const isOutOfStock = hasQuota && remaining === 0;

              return (
                <span
                  key={s.id}
                  className={`font-bold rounded-full border shadow-2xs flex items-center transition-all ${
                    displayMode === 'signage' ? 'text-lg px-5 py-2.5 gap-3' : 'text-[10px] px-2.5 py-1 gap-1.5'
                  } ${
                    isOutOfStock
                      ? 'border-slate-800 bg-slate-900/60 text-slate-500 line-through'
                      : 'border-slate-700/80 bg-slate-800/90 text-slate-200'
                  }`}
                >
                  <span
                    className={`rounded-full inline-block ${displayMode === 'signage' ? 'w-4 h-4' : 'w-2 h-2'}`}
                    style={{ backgroundColor: isOutOfStock ? '#64748B' : s.color }}
                  />
                  <span className={`truncate ${displayMode === 'signage' ? 'max-w-[280px]' : 'max-w-[100px]'}`}>
                    {s.label}
                  </span>
                  {hasQuota && (
                    <span
                      className={`rounded ${displayMode === 'signage' ? 'text-sm px-2.5 py-0.5' : 'text-[9px] px-1'} ${
                        isOutOfStock
                          ? 'bg-rose-950 text-rose-400 font-normal'
                          : 'bg-slate-700 text-amber-300 font-black'
                      }`}
                    >
                      {isOutOfStock ? 'Habis' : `Sisa ${remaining}`}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Kiosk Footer with Danantara & Indonesia 81 Branding */}
        <KioskFooter theme={activeTheme} />
      </main>

      {/* Simplified Reward Modal */}
      <RewardClaimModal
        segment={winningSegment}
        isOpen={isClaimModalOpen}
        soundEnabled={config.soundEnabled}
        displayMode={displayMode}
        onClose={() => setIsClaimModalOpen(false)}
        onClaim={onClaimReward}
        onSpinAgain={() => {
          setIsClaimModalOpen(false);
        }}
      />
    </div>
  );
};
