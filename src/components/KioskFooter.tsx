import React from 'react';
import { WheelTheme } from '../types';

interface KioskFooterProps {
  theme: WheelTheme;
}

export const KioskFooter: React.FC<KioskFooterProps> = ({ theme }) => {
  return (
    <footer className="w-full bg-[#8E0914] bg-gradient-to-r from-[#70050E] via-[#940B17] to-[#70050E] text-white py-3.5 sm:py-4 px-4 sm:px-8 border-t border-red-800/60 shadow-lg relative overflow-hidden select-none">
      {/* Subtle radial sheen overlay for premium depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto flex items-center justify-center gap-4 sm:gap-8 md:gap-12 relative z-10">
        {/* Left Section: Danantara & 81 Indonesia Monogram */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Danantara Emblem (Black rounded box with eagle head swoop) */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-black rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex items-center justify-center shadow-lg shrink-0 border border-black/40">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              {/* Stylized D shape / shield */}
              <path
                d="M 16 14 L 56 14 C 78 14 90 32 90 50 C 90 68 78 86 56 86 L 16 86 Z"
                fill="#000000"
              />
              {/* Red upper crest */}
              <path
                d="M 22 48 Q 50 26 82 40 Q 56 46 22 48 Z"
                fill="#E62129"
              />
              {/* White lower crest */}
              <path
                d="M 22 54 Q 54 48 76 60 Q 52 70 22 54 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* 81 Monogram & Indonesia Berdaulat Adil dan Makmur */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Custom vector for official 81 logo */}
            <svg viewBox="0 0 70 70" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0" fill="none">
              {/* Digit 8 with interlinked ribbons */}
              <path
                d="M 24 16 C 18 16 14 20 14 26 C 14 31 18 35 24 37 C 30 39 34 43 34 49 C 34 56 29 60 21 60 C 13 60 8 55 8 48"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 22 16 C 29 16 34 21 34 27 C 34 32 30 36 24 37 C 17 39 12 43 12 49 C 12 56 17 60 25 60"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Digit 1 with beveled ribbon fold */}
              <path
                d="M 46 24 L 54 16 L 54 60"
                stroke="#FFFFFF"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 54 36 L 64 22 L 64 60"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </svg>

            {/* Tagline 4-lines */}
            <div className="flex flex-col text-[8.5px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-tight leading-[1.1] text-white">
              <span>INDONESIA</span>
              <span>BERDAULAT</span>
              <span>ADIL DAN</span>
              <span>MAKMUR</span>
            </div>
          </div>
        </div>

        {/* Crisp Center Vertical Divider */}
        <div className="h-10 sm:h-12 md:h-14 w-[1.5px] sm:w-[2px] bg-white/75 shrink-0" />

        {/* Right Section: DANANTARA HOUSING EXPO */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="flex flex-col text-left">
            <span className="text-[10px] sm:text-[12px] md:text-[14px] font-black tracking-wider text-white uppercase leading-none">
              DANANTARA
            </span>
            <span className="text-[10px] sm:text-[12px] md:text-[14px] font-black tracking-wider text-white uppercase leading-none mt-1">
              HOUSING
            </span>
          </div>

          {/* EXPO with House Silhouette in X */}
          <div className="flex items-center text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white font-sans leading-none">
            <span>E</span>
            <span className="relative inline-flex items-center justify-center mx-0.5">
              <span>X</span>
              {/* House roof silhouette at base/center of X */}
              <svg
                viewBox="0 0 24 24"
                className="absolute -bottom-1 sm:-bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 sm:w-5 md:w-6 h-3.5 sm:h-5 md:h-6 text-white"
                fill="currentColor"
              >
                <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 3.5l5 4.5v6h-3v-4h-4v4H7v-6l5-4.5z" />
              </svg>
            </span>
            <span>PO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
