import React from 'react';
import { WheelTheme } from '../types';
import footerImg from '../../assets/footer.png';

interface KioskFooterProps {
  theme: WheelTheme;
}

export const KioskFooter: React.FC<KioskFooterProps> = ({ theme }) => {
  return (
    <footer className="w-full bg-[#8E0914] select-none">
      <img
        src={footerImg}
        alt="Indonesia Berdaulat Adil dan Makmur - Danantara Housing Expo"
        width={1600}
        height={480}
        loading="eager"
        fetchPriority="high"
        className="w-full h-auto max-h-24 sm:max-h-28 md:max-h-32 object-contain mx-auto"
      />
    </footer>
  );
};
