import React from 'react';
import { WheelTheme } from '../types';
import { Sparkles, SlidersHorizontal, Gift, Volume2, VolumeX } from 'lucide-react';

interface KioskHeaderProps {
  theme: WheelTheme;
  spinsLeft: number;
  walletCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenWallet: () => void;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  theme,
  spinsLeft,
  walletCount,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenWallet,
}) => {
  const isBtnTheme = theme.id === 'btn-housing-expo';

  return (
    <header className="w-full bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6 shadow-xs flex items-center justify-between z-20">
      {/* Brand logo & event title */}
      <div className="flex items-center gap-3">
        {isBtnTheme ? (
          <div className="flex items-center gap-3">
            <div className="flex items-baseline">
              <span className="text-3xl font-black italic tracking-tighter text-[#3B82F6] leading-none">
                b<span className="text-[#EF4444]">t</span>n
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden xs:block" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight leading-tight">
                {theme.headerSubtitle}
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                Danantara Housing Property Showcase 2026
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-black text-sm">
              {theme.headerBrand.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-100 leading-tight block">
                {theme.headerBrand}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {theme.headerSubtitle}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right controls: Sound, Wallet, Probability Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Spins Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{spinsLeft} Spins Available</span>
        </div>

        {/* Mute/Unmute Audio */}
        <button
          id="btn-toggle-sound"
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          className={`p-2 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/50'
          }`}
          title={soundEnabled ? 'Sound FX: ON' : 'Sound FX: OFF'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Won Rewards Wallet Drawer Button */}
        <button
          id="btn-open-wallet"
          type="button"
          onClick={onOpenWallet}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all text-xs sm:text-sm font-medium shadow-xs"
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span className="hidden xs:inline">Prizes</span>
          {walletCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
              {walletCount}
            </span>
          )}
        </button>

        {/* Probability & Wheel Settings */}
        <button
          id="btn-open-settings"
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-all text-xs sm:text-sm font-semibold shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Settings & Odds</span>
        </button>
      </div>
    </header>
  );
};
