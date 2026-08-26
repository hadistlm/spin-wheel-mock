/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WheelSegment, SpinConfig, ClaimedReward, WheelTheme, DisplayMode } from './types';
import { PRESET_SEGMENTS, PRESET_THEMES } from './data/presets';
import { KioskView } from './pages/KioskView';
import { AdminPage } from './pages/AdminPage';
import { HistoryPage } from './pages/HistoryPage';
import { getHashQueryParam } from './utils/common';

const LOCAL_STORAGE_KEY_REWARDS = 'spin_and_win_claimed_rewards_v3';
const LOCAL_STORAGE_KEY_SEGMENTS = 'spin_and_win_segments_v3';
const LOCAL_STORAGE_KEY_CONFIG = 'spin_and_win_config_v3';
const LOCAL_STORAGE_KEY_DISPLAY_MODE = 'spin_and_win_display_mode_v3';
const LOCAL_STORAGE_KEY_TOTAL_SPINS = 'spin_and_win_total_spins_v3';

const requestedThemeId = getHashQueryParam('theme');
const urlThemeId = requestedThemeId && PRESET_THEMES[requestedThemeId] ? requestedThemeId : null;

export default function App() {
  // Theme state (URL ?theme= param wins over the default)
  const [currentThemeId, setCurrentThemeId] = useState<string>(urlThemeId || 'btn-housing-expo');
  const activeTheme: WheelTheme = PRESET_THEMES[currentThemeId] || PRESET_THEMES['btn-housing-expo'];

  // Strip ?theme= from the URL once applied, so a refresh doesn't re-trigger it
  useEffect(() => {
    if (urlThemeId) {
      window.history.replaceState(null, '', `${window.location.pathname}#/`);
    }
  }, []);

  // Display mode (Default: 'signage' for digital signage)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DISPLAY_MODE);
      if (saved === 'signage' || saved === 'desktop' || saved === 'tablet' || saved === 'mobile') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'signage';
  });

  // Segments state
  const [segments, setSegments] = useState<WheelSegment[]>(() => {
    if (urlThemeId) {
      return PRESET_SEGMENTS[urlThemeId] || [];
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SEGMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PRESET_SEGMENTS['btn-housing-expo'] || [];
  });

  // Spin Configuration
  const [config, setConfig] = useState<SpinConfig>(() => {
    const defaultConfig: SpinConfig = {
      spinDuration: 5.5,
      minRotations: 6,
      easing: 'suspense-slowdown',
      soundEnabled: true,
      hapticEnabled: true,
      themeId: (urlThemeId as SpinConfig['themeId']) || 'btn-housing-expo',
      bulbsEffect: 'chase',
      testRiggedSegmentId: null,
      dailySpinLimit: 10,
    };
    if (urlThemeId) {
      return defaultConfig;
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultConfig, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return defaultConfig;
  });

  // Won Rewards state
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REWARDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Total Spins Count
  const [totalSpinsCount, setTotalSpinsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TOTAL_SPINS);
      if (saved) {
        const parsed = parseInt(saved);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return 0;
  });

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

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DISPLAY_MODE, displayMode);
    } catch {
      // ignore
    }
  }, [displayMode]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TOTAL_SPINS, totalSpinsCount.toString());
    } catch {
      // ignore
    }
  }, [totalSpinsCount]);

  // Handlers
  const handleSpinStart = () => {
    setTotalSpinsCount((prev) => prev + 1);
  };

  const handleSpinEnd = (winner: WheelSegment) => {
    // If winner is not a loss, update quota counters
    if (!winner.isLoss) {
      setSegments((prev) =>
        prev.map((s) => (s.id === winner.id ? { ...s, wonCount: (s.wonCount || 0) + 1 } : s))
      );
    }
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
    setClaimedRewards([]);
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

  const handleResetStats = () => {
    setTotalSpinsCount(0);
    setSegments((prev) => prev.map((s) => ({ ...s, wonCount: 0 })));
  };

  const handleToggleSound = () => {
    setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  return (
    <HashRouter>
      <Routes>
        {/* Main Kiosk View Route */}
        <Route
          path="/"
          element={
            <KioskView
              segments={segments}
              config={config}
              activeTheme={activeTheme}
              claimedRewards={claimedRewards}
              displayMode={displayMode}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
              onClaimReward={handleClaimReward}
              onToggleSound={handleToggleSound}
            />
          }
        />

        {/* Dedicated /admin URL */}
        <Route
          path="/admin"
          element={
            <AdminPage
              segments={segments}
              config={config}
              claimedRewards={claimedRewards}
              totalSpins={totalSpinsCount}
              displayMode={displayMode}
              onUpdateSegments={setSegments}
              onUpdateConfig={setConfig}
              onUpdateDisplayMode={setDisplayMode}
              onResetPreset={handleResetPreset}
              onResetStats={handleResetStats}
            />
          }
        />

        {/* Dedicated /history URL */}
        <Route
          path="/history"
          element={
            <HistoryPage
              rewards={claimedRewards}
              onRedeemReward={handleRedeemReward}
              onClearHistory={handleClearHistory}
            />
          }
        />

        {/* Fallback to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
