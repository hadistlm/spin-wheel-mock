import React, { useState } from 'react';
import { WheelSegment, SpinConfig, Rarity, DisplayMode, ClaimedReward } from '../types';
import { PRESET_SEGMENTS, PRESET_THEMES } from '../data/presets';
import { SegmentIcon } from '../components/Icons';
import {
  Sliders,
  Sparkles,
  Zap,
  RotateCcw,
  Gauge,
  Layers,
  Wand2,
  Trash2,
  Plus,
  ArrowLeft,
  Gift,
  Trophy,
  Volume2,
  VolumeX,
  Tv,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminPageProps {
  segments: WheelSegment[];
  config: SpinConfig;
  claimedRewards: ClaimedReward[];
  totalSpins: number;
  displayMode: DisplayMode;
  onUpdateSegments: (newSegments: WheelSegment[]) => void;
  onUpdateConfig: (newConfig: SpinConfig) => void;
  onUpdateDisplayMode: (mode: DisplayMode) => void;
  onResetPreset: (presetId: string) => void;
  onResetStats: () => void;
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

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Umum (Common)',
  rare: 'Langka (Rare)',
  epic: 'Epik (Epic)',
  legendary: 'Legendaris (Jackpot)',
  loss: 'Zonk / Coba Lagi',
};

export const AdminPage: React.FC<AdminPageProps> = ({
  segments,
  config,
  claimedRewards,
  totalSpins,
  displayMode,
  onUpdateSegments,
  onUpdateConfig,
  onUpdateDisplayMode,
  onResetPreset,
  onResetStats,
}) => {
  const [activeTab, setActiveTab] = useState<'segments' | 'stats' | 'display' | 'physics'>('segments');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const totalWeight = segments.reduce((sum, s) => sum + Math.max(0.001, s.weight), 0);
  const winSegments = segments.filter((s) => !s.isLoss);
  const totalPrizeWeight = winSegments.reduce((sum, s) => sum + s.weight, 0);
  const overallWinRate = totalWeight > 0 ? ((totalPrizeWeight / totalWeight) * 100).toFixed(1) : '0';

  // Segment Handlers
  const handleWeightChange = (id: string, newWeight: number) => {
    const updated = segments.map((seg) =>
      seg.id === id ? { ...seg, weight: Math.max(0.1, Number(newWeight)) } : seg
    );
    onUpdateSegments(updated);
  };

  const handleUpdateSegmentField = (
    id: string,
    field: keyof WheelSegment,
    value: any
  ) => {
    const updated = segments.map((seg) =>
      seg.id === id ? { ...seg, [field]: value } : seg
    );
    onUpdateSegments(updated);
  };

  const handleAddSegment = () => {
    const newId = `custom-hadiah-${Date.now()}`;
    const newSegment: WheelSegment = {
      id: newId,
      label: 'Kupon Hadiah Baru',
      subtext: 'Spesial Promo Expo',
      iconName: 'gift',
      color: '#2563EB',
      textColor: '#FFFFFF',
      weight: 10,
      rarity: 'common',
      isLoss: false,
      prizeValue: 'Senilai Rp 100.000',
      voucherCodeTemplate: 'KUPON-BARU',
      terms: 'Berlaku selama pameran berlangsung.',
      initialQuota: 10,
      wonCount: 0,
      unlimitedQuota: false,
    };
    onUpdateSegments([...segments, newSegment]);
    showToast('Hadiah baru berhasil ditambahkan');
  };

  const handleDeleteSegment = (id: string) => {
    if (segments.length <= 2) {
      alert('Roda membutuhkan minimal 2 segmen hadiah!');
      return;
    }
    onUpdateSegments(segments.filter((s) => s.id !== id));
    showToast('Segmen berhasil dihapus');
  };

  const handleEqualizeWeights = () => {
    const equalWeight = 100 / segments.length;
    const updated = segments.map((s) => ({ ...s, weight: Number(equalWeight.toFixed(1)) }));
    onUpdateSegments(updated);
    showToast('Semua peluang telah diratakan sama besar');
  };

  const handleJackpotOdds = () => {
    const updated = segments.map((s) => {
      if (s.rarity === 'legendary') return { ...s, weight: 1 };
      if (s.rarity === 'epic') return { ...s, weight: 4 };
      if (s.rarity === 'rare') return { ...s, weight: 15 };
      if (s.isLoss) return { ...s, weight: 35 };
      return { ...s, weight: 45 / Math.max(1, segments.length - 4) };
    });
    onUpdateSegments(updated);
    showToast('Mode Peluang Jackpot Expo Berhasil Diterapkan (1% Hadiah Utama)');
  };

  const handleResetAllQuotas = () => {
    if (confirm('Reset semua jumlah hadiah yang sudah dimenangkan kembali ke 0?')) {
      const updated = segments.map((s) => ({ ...s, wonCount: 0 }));
      onUpdateSegments(updated);
      showToast('Semua kuota hadiah berhasil di-reset');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 font-semibold text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-4 sm:px-8 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              title="Kembali ke Layar Roda Utama"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Layar Roda</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                  Panel Pengelola
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white">
                  Pengaturan Roda &amp; Mesin Probabilitas
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Konfigurasi kuota hadiah, peluang RNG, fisika putaran, dan mode layar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Link
              to="/history"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-bold"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Riwayat Hadiah ({claimedRewards.length})</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-950"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Roda Kiosk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('segments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'segments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Segmen &amp; Kuota Hadiah</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-950 text-indigo-200 font-black">
              {segments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Statistik &amp; Win Rate</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40">
              {overallWinRate}% Win Rate
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'display'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Ukuran Tampilan &amp; Digital Signage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('physics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'physics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Fisika, Suara &amp; Rigging Test</span>
          </button>
        </div>

        {/* TAB 1: Segmen & Kuota Hadiah */}
        {activeTab === 'segments' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Odds & Quota Actions Bar */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <span>Kustomisasi Peluang Cepat &amp; Kuota</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Atur persentase probabilitas RNG dan kapasitas maksimal stok hadiah pameran.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleEqualizeWeights}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ratakan Semua Peluang</span>
                </button>
                <button
                  type="button"
                  onClick={handleJackpotOdds}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Jackpot (1% Hadiah Utama)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAllQuotas}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Hitungan Menang</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSegment}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Hadiah</span>
                </button>
              </div>
            </div>

            {/* Segment Cards List */}
            <div className="space-y-4">
              {segments.map((seg, idx) => {
                const probPercent = totalWeight > 0 ? ((seg.weight / totalWeight) * 100).toFixed(1) : '0';
                const hasQuota = !seg.unlimitedQuota && seg.initialQuota !== undefined;
                const won = seg.wonCount || 0;
                const remaining = hasQuota ? Math.max(0, seg.initialQuota! - won) : '∞';
                const isOutOfStock = hasQuota && remaining === 0;

                return (
                  <div
                    key={seg.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isOutOfStock
                        ? 'bg-rose-950/20 border-rose-900/50'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Slice Index, Color Picker & Icon */}
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-black text-slate-500">
                          #{idx + 1}
                        </span>

                        <input
                          type="color"
                          value={seg.color}
                          onChange={(e) => handleUpdateSegmentField(seg.id, 'color', e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-slate-700 bg-transparent shrink-0"
                          title="Ganti warna segmen"
                        />

                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: seg.color }}
                        >
                          <SegmentIcon name={seg.iconName} className="w-5 h-5" />
                        </div>

                        <div>
                          <input
                            type="text"
                            value={seg.label}
                            onChange={(e) => handleUpdateSegmentField(seg.id, 'label', e.target.value)}
                            placeholder="Nama Hadiah"
                            className="font-bold text-white bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-48 sm:w-64"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={seg.prizeValue || ''}
                              onChange={(e) => handleUpdateSegmentField(seg.id, 'prizeValue', e.target.value)}
                              placeholder="Nilai (e.g. Rp 18.000.000)"
                              className="text-xs text-amber-300 font-semibold bg-slate-800/60 border border-slate-700/80 rounded px-2 py-0.5 w-36 outline-none"
                            />
                            <input
                              type="text"
                              value={seg.subtext || ''}
                              onChange={(e) => handleUpdateSegmentField(seg.id, 'subtext', e.target.value)}
                              placeholder="Subteks kupon"
                              className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700/80 rounded px-2 py-0.5 w-36 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Middle: Quota & Stock Capacity */}
                      <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Batas Kuota:
                          </label>
                          <input
                            type="number"
                            min="1"
                            disabled={seg.unlimitedQuota}
                            value={seg.initialQuota ?? 10}
                            onChange={(e) =>
                              handleUpdateSegmentField(seg.id, 'initialQuota', Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className={`w-16 text-center font-bold text-sm bg-slate-800 border rounded-lg px-2 py-1 outline-none ${
                              seg.unlimitedQuota
                                ? 'opacity-40 border-slate-800 text-slate-500'
                                : 'border-slate-700 text-white'
                            }`}
                          />
                        </div>

                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={seg.unlimitedQuota ?? false}
                            onChange={(e) =>
                              handleUpdateSegmentField(seg.id, 'unlimitedQuota', e.target.checked)
                            }
                            className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                          />
                          <span>Tanpa Batas</span>
                        </label>

                        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-slate-400">
                            Menang: <span className="text-white">{won}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                              isOutOfStock
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isOutOfStock ? 'STOK HABIS (0)' : `Sisa: ${remaining}`}
                          </span>
                          {won > 0 && (
                            <button
                              type="button"
                              onClick={() => handleUpdateSegmentField(seg.id, 'wonCount', 0)}
                              title="Reset jumlah kemenangan untuk hadiah ini"
                              className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: RNG Probability Weight Slider & Delete */}
                      <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">Peluang:</span>
                            <span className="text-sm font-black text-amber-400 font-mono">
                              {probPercent}%
                            </span>
                            <span className="text-xs text-slate-500">({seg.weight} pt)</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="100"
                            step="0.5"
                            value={seg.weight}
                            onChange={(e) => handleWeightChange(seg.id, parseFloat(e.target.value))}
                            className="w-32 sm:w-40 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-1"
                          />
                        </div>

                        {/* Rarity selector */}
                        <select
                          value={seg.rarity}
                          onChange={(e) => handleUpdateSegmentField(seg.id, 'rarity', e.target.value as Rarity)}
                          className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg px-2 py-1.5 outline-none"
                        >
                          <option value="common">Umum</option>
                          <option value="rare">Langka</option>
                          <option value="epic">Epik</option>
                          <option value="legendary">Legendaris</option>
                          <option value="loss">Zonk</option>
                        </select>

                        {/* Delete segment button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSegment(seg.id)}
                          className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                          title="Hapus segmen ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Statistik & Win Rate */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Putaran
                  </span>
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-2">{totalSpins}</p>
                <p className="text-xs text-slate-500 mt-1">Akumulasi putaran di pameran</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Hadiah Dimenangkan
                  </span>
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-amber-400 mt-2">{claimedRewards.length}</p>
                <p className="text-xs text-slate-500 mt-1">Kupon voucher tercatat di database</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Overall Win Rate
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-400 mt-2">{overallWinRate}%</p>
                <p className="text-xs text-slate-500 mt-1">Peluang menang vs Zonk saat ini</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Jumlah Segmen Aktif
                  </span>
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-purple-300 mt-2">{segments.length}</p>
                <p className="text-xs text-slate-500 mt-1">Potongan irisan pada roda</p>
              </div>
            </div>

            {/* Quota Depletion Summary Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Status Kuota &amp; Kemenangan Tiap Hadiah</h3>
                  <p className="text-xs text-slate-400">Pantau sisa hadiah pameran real-time</p>
                </div>
                <button
                  type="button"
                  onClick={onResetStats}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition-colors"
                >
                  Reset Log Statistik
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="pb-2.5">Hadiah</th>
                      <th className="pb-2.5">Kategori</th>
                      <th className="pb-2.5 text-center">Peluang RNG</th>
                      <th className="pb-2.5 text-center">Kuota Awal</th>
                      <th className="pb-2.5 text-center">Dimenangkan</th>
                      <th className="pb-2.5 text-right">Status Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {segments.map((s) => {
                      const prob = totalWeight > 0 ? ((s.weight / totalWeight) * 100).toFixed(1) : '0';
                      const won = s.wonCount || 0;
                      const hasQuota = !s.unlimitedQuota && s.initialQuota !== undefined;
                      const rem = hasQuota ? Math.max(0, s.initialQuota! - won) : 'Tak Terbatas';
                      const isZero = hasQuota && rem === 0;

                      return (
                        <tr key={s.id} className="text-slate-200">
                          <td className="py-3 font-bold flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <span>{s.label}</span>
                            {s.prizeValue && (
                              <span className="text-[10px] text-amber-300 font-normal">
                                ({s.prizeValue})
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-slate-400 uppercase text-[10px] font-bold">
                            {s.rarity}
                          </td>
                          <td className="py-3 text-center font-mono font-bold text-amber-400">
                            {prob}%
                          </td>
                          <td className="py-3 text-center font-medium">
                            {s.unlimitedQuota ? '∞' : s.initialQuota}
                          </td>
                          <td className="py-3 text-center font-bold text-white">{won}</td>
                          <td className="py-3 text-right font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                isZero
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isZero ? 'HABIS' : rem}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Ukuran Tampilan & Digital Signage */}
        {activeTab === 'display' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-indigo-400" />
                <span>Pilih Mode Ukuran Tampilan Kiosk (Display Mode)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pilih format layout yang sesuai untuk layar TV Signage stand expo, tablet pengunjung, atau layar smartphone.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {/* 1. Digital Signage */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateDisplayMode('signage');
                    showToast('Mode Tampilan: Digital Signage Layar Penuh');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all relative ${
                    displayMode === 'signage'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {displayMode === 'signage' && (
                    <span className="absolute top-3 right-3 text-indigo-400 font-bold text-xs bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
                      Aktif (Default)
                    </span>
                  )}
                  <Tv className="w-8 h-8 text-amber-400 mb-3" />
                  <h4 className="font-bold text-white text-base">Digital Signage (Layar Penuh)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Cocok untuk TV LED/Digital Signage booth expo. Menampilkan roda besar dengan desain maksimal tanpa batasan frame.
                  </p>
                </button>

                {/* 2. Desktop Lebar */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateDisplayMode('desktop');
                    showToast('Mode Tampilan: Desktop Lebar (1280px)');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all relative ${
                    displayMode === 'desktop'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {displayMode === 'desktop' && (
                    <span className="absolute top-3 right-3 text-indigo-400 font-bold text-xs bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
                      Aktif
                    </span>
                  )}
                  <Monitor className="w-8 h-8 text-indigo-400 mb-3" />
                  <h4 className="font-bold text-white text-base">Desktop Lebar (1280px)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Format bingkai desktop proporsional dengan tata letak horizontal yang rapi.
                  </p>
                </button>

                {/* 3. Tablet Kiosk */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateDisplayMode('tablet');
                    showToast('Mode Tampilan: Tablet Stand (768px)');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all relative ${
                    displayMode === 'tablet'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {displayMode === 'tablet' && (
                    <span className="absolute top-3 right-3 text-indigo-400 font-bold text-xs bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
                      Aktif
                    </span>
                  )}
                  <Tablet className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="font-bold text-white text-base">Tablet Kiosk (768px)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Disesuaikan untuk tablet iPad / Android stand pada meja registrasi pameran.
                  </p>
                </button>

                {/* 4. Mobile Kiosk */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateDisplayMode('mobile');
                    showToast('Mode Tampilan: Mobile Handheld (480px)');
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all relative ${
                    displayMode === 'mobile'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {displayMode === 'mobile' && (
                    <span className="absolute top-3 right-3 text-indigo-400 font-bold text-xs bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
                      Aktif
                    </span>
                  )}
                  <Smartphone className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="font-bold text-white text-base">Mobile Kiosk (480px)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ukuran ringkas vertikal yang dioptimalkan untuk browser ponsel.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Fisika, Suara & Rigging Test */}
        {activeTab === 'physics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Spin Duration & Easing */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-400" />
                <span>Pengaturan Kecepatan &amp; Kurva Animasi Putaran</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-300">Durasi Putaran:</span>
                    <span className="text-indigo-400 font-mono">{config.spinDuration} Detik</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.5"
                    value={config.spinDuration}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, spinDuration: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Cepat (2s)</span>
                    <span>Ideal (5.5s)</span>
                    <span>Dramatis (10s)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-300">Putaran Minimal (Rotasi):</span>
                    <span className="text-indigo-400 font-mono">{config.minRotations}x Putaran</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={config.minRotations}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, minRotations: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>3 Putaran</span>
                    <span>6 Putaran (Standar)</span>
                    <span>12 Putaran</span>
                  </div>
                </div>
              </div>

              {/* Easing Curves */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Tipe Kurva Perlambatan (Easing Physics):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'suspense-slowdown', label: 'Suspense Slowdown', desc: 'Sangat dramatis di akhir' },
                    { id: 'elastic-bounce', label: 'Elastic Bounce', desc: 'Sedikit membal saat berhenti' },
                    { id: 'cubic-ease-out', label: 'Cubic Ease Out', desc: 'Perlambatan halus natural' },
                    { id: 'ultra-fast', label: 'Ultra Fast', desc: 'Langsung cepat berhenti' },
                  ].map((ease) => (
                    <button
                      key={ease.id}
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, easing: ease.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        config.easing === ease.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs block text-slate-200">{ease.label}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                        {ease.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound & LED Bulbs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                      {config.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Efek Suara (Audio FX)</span>
                      <span className="text-xs text-slate-400">Suara detak jarum &amp; fanfare menang</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ ...config, soundEnabled: !config.soundEnabled })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      config.soundEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {config.soundEnabled ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">Lampu LED Rim</span>
                    <span className="text-xs text-slate-400">Animasi lampu keliling roda</span>
                  </div>
                  <select
                    value={config.bulbsEffect}
                    onChange={(e) => onUpdateConfig({ ...config, bulbsEffect: e.target.value as any })}
                    className="bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 outline-none"
                  >
                    <option value="chase">Chase (Berputar)</option>
                    <option value="blink">Blink (Kedip)</option>
                    <option value="steady">Steady (Menyala)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Test Simulator / Rigging Control */}
            <div className="bg-amber-950/20 border border-amber-800/40 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-300 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm">Mode Uji Coba Demonstrasi (Simulator Rigging)</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Paksa roda untuk mendarat tepat pada hadiah tertentu saat putaran berikutnya (hanya untuk pengujian presentasi).
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ ...config, testRiggedSegmentId: null });
                    showToast('Simulator: Acak Murni (Normal RNG)');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    config.testRiggedSegmentId === null
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Acak Murni (Normal RNG)
                </button>

                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({ ...config, testRiggedSegmentId: seg.id });
                      showToast(`Simulator: Terkunci pada '${seg.label}'`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      config.testRiggedSegmentId === seg.id
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span>{seg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
