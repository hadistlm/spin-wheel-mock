import React, { useEffect, useState } from 'react';
import { WheelTheme } from '../types';
import { SlidersHorizontal, Gift, Volume2, VolumeX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo1 from '../../assets/logo_1.png';
import logo2 from '../../assets/logo_2.png';
import logo3 from '../../assets/logo_3.png';

const BTN_LOGOS = [logo1, logo2, logo3];
const LOGO_FADE_INTERVAL_MS = 3000;

interface BtnLogoFadeProps {
  size?: 'default' | 'signage';
}

export const BtnLogoFade: React.FC<BtnLogoFadeProps> = ({ size = 'default' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BTN_LOGOS.length);
    }, LOGO_FADE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const sizeClass =
    size === 'signage'
      ? 'h-[220px] w-[440px] sm:h-[300px] sm:w-[600px] md:h-[360px] md:w-[720px] lg:h-[425px] lg:w-[850px]'
      : 'h-8 w-20 sm:h-9 sm:w-24';

  return (
    <div className={`relative shrink-0 ${sizeClass}`}>
      {BTN_LOGOS.map((logo, index) => (
        <img
          key={logo}
          src={logo}
          alt="BTN"
          className={`absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-700 ease-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
};

interface KioskHeaderProps {
  theme: WheelTheme;
  spinsLeft: number;
  walletCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
  onOpenWallet?: () => void;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  theme,
  walletCount,
  soundEnabled,
  onToggleSound,
}) => {
  const isBtnTheme = theme.id === 'btn-housing-expo';
  const location = useLocation();
  const isRoot = location.pathname === '/';

  return (
    <header className="w-full bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6 shadow-xs flex items-center justify-between z-20">
      {/* Brand logo & event title (btn-theme logo moved above wheel in KioskView) */}
      <div className="flex items-center gap-3">
        {!isBtnTheme && (
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

      {/* Right controls: Sound Toggle, Link to History, Link to Admin - Hidden on root "/" */}
      {!isRoot && (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute/Unmute Audio */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/50'
            }`}
            title={soundEnabled ? 'Efek Suara: AKTIF' : 'Efek Suara: NONAKTIF'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Link to /history */}
          <Link
            id="nav-link-history"
            to="/history"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all text-xs sm:text-sm font-medium shadow-xs"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">Riwayat Hadiah</span>
            {walletCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                {walletCount}
              </span>
            )}
          </Link>

          {/* Link to /admin */}
          <Link
            id="nav-link-admin"
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-all text-xs sm:text-sm font-semibold shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Admin Panel</span>
          </Link>
        </div>
      )}
    </header>
  );
};
