/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WheelSegment, SpinConfig, ClaimedReward, WheelTheme } from './types';
import { PRESET_SEGMENTS, PRESET_THEMES } from './data/presets';
import { KioskHeader } from './components/KioskHeader';
import { KioskFooter } from './components/KioskFooter';
import { SpinningWheel } from './components/SpinningWheel';
import { RewardClaimModal } from './components/RewardClaimModal';
import { ProbabilitySettingsModal } from './components/ProbabilitySettingsModal';
import { RewardWalletDrawer } from './components/RewardWalletDrawer';
import { StatsBar } from './components/StatsBar';
import { Sparkles, SlidersHorizontal, Trophy, Award, Gift, Zap } from 'lucide-react';

const LOCAL_STORAGE_KEY_REWARDS = 'spin_and_win_claimed_rewards_v1';
const LOCAL_STORAGE_KEY_SEGMENTS = 'spin_and_win_segments_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'spin_and_win_config_v1';

export default function App() {
  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState<string>('btn-housing-expo');
  const activeTheme: WheelTheme = PRESET_THEMES[currentThemeId] || PRESET_THEMES['btn-housing-expo'];

  // Segments state
  const [segments, setSegments] = useState<WheelSegment[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SEGMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRESET_SEGMENTS['btn-housing-expo'];
  });

  // Spin Configuration
  const [config, setConfig] = useState<SpinConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      spinDuration: 5.5,
      minRotations: 6,
      easing: 'suspense-slowdown',
      soundEnabled: true,
      hapticEnabled: true,
      themeId: 'btn-housing-expo',
      bulbsEffect: 'chase',
      testRiggedSegmentId: null,
      dailySpinLimit: 5,
    };
  });

  // Won Rewards state
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REWARDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // UI state
  const [spinsLeft, setSpinsLeft] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [totalSpinsCount, setTotalSpinsCount] = useState<number>(0);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SEGMENTS, JSON.stringify(segments));
    } catch {
      // ignore
    }
  }, [segments]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REWARDS, JSON.stringify(claimedRewards));
    } catch {
      // ignore
    }
  }, [claimedRewards]);

  // Handlers
  const handleSpinStart = () => {
    setIsSpinning(true);
    setWinningSegment(null);
    setSpinsLeft((prev) => Math.max(0, prev - 1));
    setTotalSpinsCount((prev) => prev + 1);
  };

  const handleSpinEnd = (winner: WheelSegment) => {
    setIsSpinning(false);
    setWinningSegment(winner);
    // Slight suspense pause before popping celebratory modal
    setTimeout(() => {
      setIsClaimModalOpen(true);
    }, 450);
  };

  const handleClaimReward = (newReward: ClaimedReward) => {
    setClaimedRewards((prev) => [newReward, ...prev]);
  };

  const handleRedeemReward = (rewardId: string) => {
    setClaimedRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, isRedeemed: true } : r))
    );
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your rewards inventory?')) {
      setClaimedRewards([]);
    }
  };

  const handleResetPreset = (presetId: string) => {
    const newTheme = PRESET_THEMES[presetId];
    const newSegs = PRESET_SEGMENTS[presetId];
    if (newTheme && newSegs) {
      setCurrentThemeId(presetId);
      setSegments(newSegs);
      setConfig((prev) => ({
        ...prev,
        themeId: presetId as SpinConfig['themeId'],
        testRiggedSegmentId: null,
      }));
    }
  };

  const handleAddSpins = (count: number) => {
    setSpinsLeft((prev) => prev + count);
  };

  const handleToggleSound = () => {
    setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-between items-center relative overflow-x-hidden font-sans">
      {/* Background Decorative Ambient Canvas */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0F172A] to-[#0B1120] pointer-events-none" />

      {/* Top Floating Stats & Mode Bar */}
      <div className="w-full relative z-30 pt-2 px-2">
        <StatsBar
          segments={segments}
          totalSpins={totalSpinsCount}
          totalWins={claimedRewards.length}
          isPhoneFrame={isPhoneFrame}
          onTogglePhoneFrame={() => setIsPhoneFrame((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main Kiosk Container */}
      <main
        className={`w-full relative z-20 my-auto transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[440px] sm:max-w-[480px] my-3 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 bg-[#0F172A] ring-1 ring-slate-700/40'
            : 'max-w-4xl my-4 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 bg-[#0F172A] ring-1 ring-slate-700/40'
        }`}
      >
        {/* Kiosk Header */}
        <KioskHeader
          theme={activeTheme}
          spinsLeft={spinsLeft}
          walletCount={claimedRewards.length}
          soundEnabled={config.soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWallet={() => setIsWalletOpen(true)}
        />

        {/* Center Stage & Wheel Content Area */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 bg-sleek-grid overflow-hidden">
          {/* Subtle watermark in background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            <svg width="400" height="400" viewBox="0 0 200 200" fill="none" className="text-indigo-500">
              <path
                d="M100 0 C120 40 160 40 200 100 C160 160 120 160 100 200 C80 160 40 160 0 100 C40 40 80 40 100 0 Z"
                fill="currentColor"
                opacity="0.15"
              />
              <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            </svg>
          </div>

          {/* Bold Display Headline */}
          <div className="text-center relative z-10 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md uppercase">
              Spin &amp; Win
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1 max-w-xs mx-auto">
              {activeTheme.tagline}
            </p>
          </div>

          {/* Interactive Wheel Component */}
          <div className="relative z-10 w-full flex justify-center">
            <SpinningWheel
              segments={segments}
              config={config}
              theme={activeTheme}
              isSpinning={isSpinning}
              spinsLeft={spinsLeft}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
            />
          </div>

          {/* Live Odds & Slice Badges underneath */}
          <div className="mt-6 w-full max-w-sm relative z-10 flex flex-wrap items-center justify-center gap-1.5 px-2">
            {segments.map((s) => (
              <span
                key={s.id}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-800/90 text-slate-200 shadow-2xs flex items-center gap-1"
                title={`${s.label}: ${s.weight} pts`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate max-w-[90px]">{s.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Kiosk Footer with Danantara & Indonesia 81 Branding */}
        <KioskFooter theme={activeTheme} />
      </main>

      {/* MODAL 1: Reward Claim & Celebration Modal */}
      <RewardClaimModal
        segment={winningSegment}
        isOpen={isClaimModalOpen}
        soundEnabled={config.soundEnabled}
        onClose={() => setIsClaimModalOpen(false)}
        onClaim={handleClaimReward}
        onSpinAgain={() => {
          setIsClaimModalOpen(false);
        }}
      />

      {/* MODAL 2: Probability Settings & Physics Studio */}
      <ProbabilitySettingsModal
        isOpen={isSettingsOpen}
        segments={segments}
        config={config}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSegments={setSegments}
        onUpdateConfig={setConfig}
        onResetPreset={handleResetPreset}
        onAddSpins={handleAddSpins}
      />

      {/* DRAWER 3: Won Rewards Inventory / History */}
      <RewardWalletDrawer
        isOpen={isWalletOpen}
        rewards={claimedRewards}
        onClose={() => setIsWalletOpen(false)}
        onRedeemReward={handleRedeemReward}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
