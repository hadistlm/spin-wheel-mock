import React, { useState } from 'react';
import { WheelSegment, SpinConfig, EasingType, Rarity } from '../types';
import { SegmentIcon } from './Icons';
import { PRESET_SEGMENTS, PRESET_THEMES } from '../data/presets';
import {
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  RotateCcw,
  Gauge,
  Layers,
  Wand2,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ProbabilitySettingsModalProps {
  isOpen: boolean;
  segments: WheelSegment[];
  config: SpinConfig;
  onClose: () => void;
  onUpdateSegments: (newSegments: WheelSegment[]) => void;
  onUpdateConfig: (newConfig: SpinConfig) => void;
  onResetPreset: (presetId: string) => void;
  onAddSpins: (count: number) => void;
}

const AVAILABLE_ICONS = [
  'coffee',
  'home',
  'gift',
  'percent',
  'award',
  'sparkles',
  'zap',
  'smartphone',
  'shopping-bag',
  'dollar-sign',
  'ticket',
  'frown',
] as const;

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'bg-slate-800 text-slate-300 border-slate-700',
  rare: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
  epic: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  legendary: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  loss: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
};

export const ProbabilitySettingsModal: React.FC<ProbabilitySettingsModalProps> = ({
  isOpen,
  segments,
  config,
  onClose,
  onUpdateSegments,
  onUpdateConfig,
  onResetPreset,
  onAddSpins,
}) => {
  const [activeTab, setActiveTab] = useState<'probabilities' | 'animations' | 'presets'>('probabilities');

  if (!isOpen) return null;

  const totalWeight = segments.reduce((sum, s) => sum + Math.max(0.001, s.weight), 0);

  // Segment modifiers
  const handleWeightChange = (id: string, newWeight: number) => {
    const updated = segments.map((seg) =>
      seg.id === id ? { ...seg, weight: Math.max(0.1, Number(newWeight)) } : seg
    );
    onUpdateSegments(updated);
  };

  const handleUpdateSegmentField = (
    id: string,
    field: keyof WheelSegment,
    value: string | number | boolean
  ) => {
    const updated = segments.map((seg) =>
      seg.id === id ? { ...seg, [field]: value } : seg
    );
    onUpdateSegments(updated);
  };

  const handleAddSegment = () => {
    const newId = `custom-slice-${Date.now()}`;
    const newSegment: WheelSegment = {
      id: newId,
      label: 'New Prize Voucher',
      subtext: 'Special Reward',
      iconName: 'gift',
      color: '#2563EB',
      textColor: '#FFFFFF',
      weight: 10,
      rarity: 'common',
      isLoss: false,
      prizeValue: '$25 Value',
      voucherCodeTemplate: 'VOUCHER-NEW',
      terms: 'Valid during promotional campaign.',
      stock: 50,
    };
    onUpdateSegments([...segments, newSegment]);
  };

  const handleDeleteSegment = (id: string) => {
    if (segments.length <= 2) {
      alert('The wheel requires at least 2 segments to spin!');
      return;
    }
    onUpdateSegments(segments.filter((s) => s.id !== id));
  };

  const handleEqualizeWeights = () => {
    const equalWeight = 100 / segments.length;
    const updated = segments.map((s) => ({ ...s, weight: Number(equalWeight.toFixed(1)) }));
    onUpdateSegments(updated);
  };

  const handleJackpotOdds = () => {
    // Give legendary 1%, common high, others tiered
    const updated = segments.map((s) => {
      if (s.rarity === 'legendary') return { ...s, weight: 1 };
      if (s.rarity === 'epic') return { ...s, weight: 5 };
      if (s.rarity === 'rare') return { ...s, weight: 15 };
      if (s.isLoss) return { ...s, weight: 35 };
      return { ...s, weight: 44 / Math.max(1, segments.length - 4) };
    });
    onUpdateSegments(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0F172A] text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 ring-1 ring-slate-700/40">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Wheel Settings &amp; Probability Engine
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Live RNG weights, animation physics, presets &amp; test simulator
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-2 shrink-0">
          <button
            id="tab-probabilities"
            type="button"
            onClick={() => setActiveTab('probabilities')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'probabilities'
                ? 'border-indigo-500 text-indigo-400 bg-[#0F172A] rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Prizes &amp; Probabilities ({segments.length})</span>
          </button>

          <button
            id="tab-animations"
            type="button"
            onClick={() => setActiveTab('animations')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'animations'
                ? 'border-indigo-500 text-indigo-400 bg-[#0F172A] rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Physics &amp; Effects</span>
          </button>

          <button
            id="tab-presets"
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400 bg-[#0F172A] rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Theme Presets</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: PROBABILITIES & SEGMENTS */}
          {activeTab === 'probabilities' && (
            <div className="space-y-4">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl">
                <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Total Probability Base: {totalWeight.toFixed(1)} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-equalize-weights"
                    type="button"
                    onClick={handleEqualizeWeights}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
                  >
                    Equal Odds (1/N)
                  </button>
                  <button
                    id="btn-jackpot-odds"
                    type="button"
                    onClick={handleJackpotOdds}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/50 rounded-lg transition-colors shadow-2xs"
                  >
                    Casino Jackpot Curve
                  </button>
                  <button
                    id="btn-add-slice"
                    type="button"
                    onClick={handleAddSegment}
                    className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Prize Slice</span>
                  </button>
                </div>
              </div>

              {/* Segments Table / Cards */}
              <div className="space-y-3">
                {segments.map((seg, idx) => {
                  const odds = totalWeight > 0 ? (seg.weight / totalWeight) * 100 : 0;

                  return (
                    <div
                      key={seg.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 shadow-2xs hover:border-slate-700 transition-all space-y-2.5"
                    >
                      {/* Top Row: Color, Icon, Label, Odds Pill, Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          {/* Color picker circle */}
                          <div className="relative">
                            <input
                              type="color"
                              value={seg.color}
                              onChange={(e) => handleUpdateSegmentField(seg.id, 'color', e.target.value)}
                              className="w-7 h-7 rounded-full cursor-pointer border border-slate-700 p-0 overflow-hidden bg-transparent"
                              title="Pick slice wedge color"
                            />
                          </div>

                          {/* Icon Selector */}
                          <select
                            value={seg.iconName}
                            onChange={(e) =>
                              handleUpdateSegmentField(
                                seg.id,
                                'iconName',
                                e.target.value as WheelSegment['iconName']
                              )
                            }
                            className="text-xs font-semibold border border-slate-700 rounded-lg px-2 py-1 bg-slate-800 text-slate-200"
                          >
                            {AVAILABLE_ICONS.map((icon) => (
                              <option key={icon} value={icon}>
                                {icon.toUpperCase()}
                              </option>
                            ))}
                          </select>

                          {/* Label input */}
                          <input
                            type="text"
                            value={seg.label}
                            onChange={(e) => handleUpdateSegmentField(seg.id, 'label', e.target.value)}
                            placeholder="Slice label..."
                            className="flex-1 font-bold text-sm text-white bg-slate-800/80 border border-slate-700 focus:border-indigo-500 rounded-lg px-2.5 py-1"
                          />
                        </div>

                        {/* Odds Badge & Rarity Tag */}
                        <div className="flex items-center gap-2">
                          <select
                            value={seg.rarity}
                            onChange={(e) =>
                              handleUpdateSegmentField(seg.id, 'rarity', e.target.value as Rarity)
                            }
                            className={`text-[11px] font-black uppercase border rounded-md px-2 py-1 ${
                              RARITY_COLORS[seg.rarity]
                            }`}
                          >
                            <option value="common">COMMON</option>
                            <option value="rare">RARE</option>
                            <option value="epic">EPIC</option>
                            <option value="legendary">LEGENDARY</option>
                            <option value="loss">MISS / LOSS</option>
                          </select>

                          <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold">
                            {odds.toFixed(1)}%
                          </div>

                          <button
                            id={`btn-delete-slice-${idx}`}
                            type="button"
                            onClick={() => handleDeleteSegment(seg.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Delete slice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Weight Slider & Subtext row */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-800/80 text-xs">
                        {/* Weight Slider */}
                        <div className="sm:col-span-6 flex items-center gap-2">
                          <span className="text-slate-400 font-medium whitespace-nowrap">
                            Weight:
                          </span>
                          <input
                            type="range"
                            min="0.1"
                            max="100"
                            step="0.5"
                            value={seg.weight}
                            onChange={(e) => handleWeightChange(seg.id, Number(e.target.value))}
                            className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                          <input
                            type="number"
                            min="0.1"
                            max="100"
                            step="0.5"
                            value={seg.weight}
                            onChange={(e) => handleWeightChange(seg.id, Number(e.target.value))}
                            className="w-14 text-center font-bold text-white bg-slate-800 border border-slate-700 rounded px-1 py-0.5"
                          />
                        </div>

                        {/* Prize Value */}
                        <div className="sm:col-span-3 flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Value:</span>
                          <input
                            type="text"
                            value={seg.prizeValue || ''}
                            onChange={(e) =>
                              handleUpdateSegmentField(seg.id, 'prizeValue', e.target.value)
                            }
                            placeholder="e.g. $50 or Rp 500k"
                            className="w-full text-white bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs"
                          />
                        </div>

                        {/* Loss Toggle */}
                        <div className="sm:col-span-3 flex items-center justify-end gap-1.5">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
                            <input
                              type="checkbox"
                              checked={seg.isLoss}
                              onChange={(e) =>
                                handleUpdateSegmentField(seg.id, 'isLoss', e.target.checked)
                              }
                              className="accent-rose-500 rounded"
                            />
                            <span>Is Miss / Loss</span>
                          </label>
                        </div>
                      </div>

                      {/* Visual Probability Distribution Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(2, odds))}%`,
                            backgroundColor: seg.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ANIMATION PHYSICS & SOUND */}
          {activeTab === 'animations' && (
            <div className="space-y-5">
              {/* Spin Duration & Speed */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  <span>Spin Physics &amp; Deceleration</span>
                </h3>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Spin Duration: {config.spinDuration} seconds</span>
                    <span className="text-slate-500">Fast (3s) to Cinematic (10s)</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={config.spinDuration}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, spinDuration: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Min Rotations Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Minimum Full Rotations: {config.minRotations} turns</span>
                    <span className="text-slate-500">More turns = more suspense</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={config.minRotations}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, minRotations: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Easing Curve */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Deceleration Curve:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'cubic-ease-out', label: 'Classic Smooth', desc: 'Standard natural slowdown' },
                      { id: 'suspense-slowdown', label: 'Suspense Crawl', desc: 'High suspense at end' },
                      { id: 'elastic-bounce', label: 'Elastic Recoil', desc: 'Slight bounce on stop' },
                      { id: 'ultra-fast', label: 'Arcade Turbo', desc: 'Snappy quick results' },
                    ].map((ease) => (
                      <button
                        key={ease.id}
                        type="button"
                        onClick={() =>
                          onUpdateConfig({ ...config, easing: ease.id as EasingType })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          config.easing === ease.id
                            ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold shadow-xs'
                            : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{ease.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{ease.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lighting Bulbs Mode & Audio */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Bezel Light Effects &amp; Audio</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bulbs animation style */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Rim LED Bulbs Pattern:
                    </label>
                    <select
                      value={config.bulbsEffect}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          bulbsEffect: e.target.value as SpinConfig['bulbsEffect'],
                        })
                      }
                      className="w-full text-xs font-semibold border border-slate-700 rounded-lg p-2 bg-slate-800 text-white"
                    >
                      <option value="chase">Chasing Marquee (Fast during spin)</option>
                      <option value="blink">Synchronized Blink</option>
                      <option value="steady">Steady Golden Glow</option>
                    </select>
                  </div>

                  {/* Sound Toggle */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Sound Effects:
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({ ...config, soundEnabled: !config.soundEnabled })
                      }
                      className={`w-full p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                        config.soundEnabled
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span>{config.soundEnabled ? 'Web Audio FX Active' : 'Sound Muted'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Test Rigging Simulator */}
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    <span>Developer Rigging / Test Spin Selector</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-900/60 text-amber-200 border border-amber-700/60 rounded-full">
                    DEMO TOOL
                  </span>
                </div>
                <p className="text-xs text-amber-300/80">
                  Force the wheel to land on an exact slice to test specific reward animations, audio fanfares, and confetti particles without waiting for RNG odds.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={config.testRiggedSegmentId || ''}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        testRiggedSegmentId: e.target.value ? e.target.value : null,
                      })
                    }
                    className="text-xs font-bold border border-amber-700/60 rounded-lg p-2 bg-slate-800 text-white flex-1 min-w-[200px]"
                  >
                    <option value="">Randomized RNG (Uses Probability Weights)</option>
                    {segments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        Force Land: {seg.label} ({seg.rarity.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => onAddSpins(5)}
                    className="px-3 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+5 Test Spins</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-medium">
                Select a ready-to-use campaign preset. This will load custom slices, branding, and color palettes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.values(PRESET_THEMES).map((thm) => {
                  const segs = PRESET_SEGMENTS[thm.id] || [];
                  const isCurrent = config.themeId === thm.id;

                  return (
                    <div
                      key={thm.id}
                      className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-950/30 shadow-md ring-1 ring-indigo-500/30'
                          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-white">{thm.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{thm.tagline}</p>

                      <div className="flex items-center gap-1 pt-1">
                        {segs.slice(0, 5).map((s) => (
                          <div
                            key={s.id}
                            className="w-4 h-4 rounded-full border border-slate-700 shadow-2xs"
                            style={{ backgroundColor: s.color }}
                            title={s.label}
                          />
                        ))}
                        <span className="text-[10px] text-slate-500 font-medium ml-1">
                          {segs.length} slices
                        </span>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => onResetPreset(thm.id)}
                          className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Load Preset</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-medium">
            Changes apply in real-time to the active wheel.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-500 transition-colors shadow-2xs"
          >
            Apply &amp; Back to Wheel
          </button>
        </div>
      </div>
    </div>
  );
};
