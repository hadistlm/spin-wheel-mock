export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'loss';

export type DisplayMode = 'signage' | 'desktop' | 'tablet' | 'mobile';

export interface WheelSegment {
  id: string;
  label: string;
  subtext?: string;
  iconName: 'coffee' | 'gift' | 'percent' | 'ticket' | 'sparkles' | 'award' | 'zap' | 'frown' | 'home' | 'smartphone' | 'shopping-bag' | 'dollar-sign';
  color: string;
  textColor: string;
  weight: number; // Bobot probabilitas (contoh: 20, 10, 1)
  rarity: Rarity;
  isLoss: boolean;
  prizeValue?: string;
  voucherCodeTemplate?: string;
  terms?: string;
  initialQuota?: number; // Kapasitas/Kuota maksimal (contoh: iPhone 10, Earpods 3)
  wonCount?: number; // Jumlah yang sudah dimenangkan
  unlimitedQuota?: boolean; // True jika kuota tanpa batas
}

export type EasingType = 'cubic-ease-out' | 'suspense-slowdown' | 'elastic-bounce' | 'ultra-fast';

export interface SpinConfig {
  spinDuration: number; // dalam detik (contoh: 4 sampai 8)
  minRotations: number; // putaran penuh minimum (contoh: 5 sampai 10)
  easing: EasingType;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  themeId: 'btn-housing-expo' | 'tech-bonanza' | 'gold-jackpot' | 'foodie-delight';
  bulbsEffect: 'chase' | 'blink' | 'rainbow' | 'steady';
  testRiggedSegmentId: string | null; // Untuk pengujian admin / developer
  dailySpinLimit: number;
  displayMode?: DisplayMode;
}

export interface ClaimedReward {
  id: string;
  segmentId: string;
  label: string;
  subtext?: string;
  iconName: string;
  color: string;
  rarity: Rarity;
  voucherCode: string;
  prizeValue?: string;
  wonAt: string;
  claimedAt?: string;
  isClaimed: boolean;
  isRedeemed: boolean;
  expiresAt: string;
  terms: string;
}

export interface WheelTheme {
  id: string;
  name: string;
  headerBrand: string;
  headerSubtitle: string;
  tagline: string;
  bgGradient: string;
  wheelRimColor: string;
  wheelOuterBorder: string;
  footerTitle: string;
  footerSubtitle: string;
  brandPrimaryColor: string;
  buttonColor: string;
  patternType: 'batik' | 'geometric' | 'dots' | 'grid';
}
