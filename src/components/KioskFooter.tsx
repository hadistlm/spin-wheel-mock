import React from 'react';
import { WheelTheme } from '../types';

interface KioskFooterProps {
  theme: WheelTheme;
}

export const KioskFooter: React.FC<KioskFooterProps> = ({ theme }) => {
  const isBtnTheme = theme.id === 'btn-housing-expo';

  if (!isBtnTheme) {
    return (
      <footer className="w-full bg-slate-950 text-white border-t border-slate-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {theme.footerTitle}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {theme.footerSubtitle}
            </p>
          </div>
          <div className="text-[10px] text-slate-500">
            Terms & Conditions Apply • Real-Time RNG Certified
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-gradient-to-r from-[#590408] via-[#7B0710] to-[#8E0914] text-white py-4 px-4 sm:px-8 border-t border-red-900/40 shadow-inner relative overflow-hidden">
      {/* Subtle shine overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-6 relative z-10">
        {/* Left emblem & Indonesia 81 logo */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Danantara stylized D logo mark */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg p-1.5 flex items-center justify-center shadow-md shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 15 15 L 60 15 C 80 15 90 35 90 50 C 90 65 80 85 60 85 L 15 85 Z"
                fill="#111"
              />
              <path
                d="M 25 50 Q 50 25 80 40 Q 50 48 25 50 Z"
                fill="#E62129"
              />
              <path
                d="M 25 55 Q 55 48 75 60 Q 50 70 25 55 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* 81 INDONESIA BERDAULAT ADIL DAN MAKMUR */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-baseline font-black tracking-tight text-xl sm:text-2xl text-white font-sans">
              <span>8</span>
              <span className="text-red-300">1</span>
            </div>
            <div className="flex flex-col text-[8px] sm:text-[9px] font-black uppercase tracking-tight leading-tight text-white/90">
              <span>INDONESIA</span>
              <span>BERDAULAT</span>
              <span>ADIL DAN</span>
              <span>MAKMUR</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-9 sm:h-11 w-px bg-red-400/40 shrink-0" />

        {/* Right side: DANANTARA HOUSING EXPO */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-col text-right sm:text-left">
            <span className="text-[9px] sm:text-[11px] font-black tracking-wider text-white uppercase leading-none">
              DANANTARA
            </span>
            <span className="text-[9px] sm:text-[11px] font-black tracking-wider text-red-200 uppercase leading-none mt-0.5">
              HOUSING
            </span>
          </div>

          <div className="text-xl sm:text-3xl font-black tracking-tighter text-white flex items-center">
            <span>E</span>
            <span className="relative inline-block mx-px">
              X
              {/* Roof icon overlay above X for housing expo */}
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 sm:w-2.5 h-0.5 bg-red-400 rounded-full" />
            </span>
            <span>PO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
