import { PRESET_THEMES } from './presets';
import { getHashQueryParam } from '../utils/common';

export const LOCAL_STORAGE_KEYS = {
  rewards: 'spin_and_win_claimed_rewards_v3',
  segments: 'spin_and_win_segments_v3',
  config: 'spin_and_win_config_v3',
  displayMode: 'spin_and_win_display_mode_v3',
  totalSpins: 'spin_and_win_total_spins_v3',
} as const;

const requestedThemeId = getHashQueryParam('theme');
export const urlThemeId = requestedThemeId && PRESET_THEMES[requestedThemeId] ? requestedThemeId : null;

// A ?theme= URL starts a fresh session for that preset: wipe any stored state
// before App's state initializers run.
if (urlThemeId) {
  try {
    Object.values(LOCAL_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
