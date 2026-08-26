import React, { useState } from 'react';
import { ClaimedReward } from '../types';
import { SegmentIcon } from '../components/Icons';
import {
  Gift,
  ArrowLeft,
  Sliders,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Calendar,
  Trash2,
  Download,
  Search,
  CheckCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HistoryPageProps {
  rewards: ClaimedReward[];
  onRedeemReward: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  rewards,
  onRedeemReward,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unredeemed' | 'redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRewards = rewards.filter((r) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'unredeemed'
        ? !r.isRedeemed
        : r.isRedeemed;

    const matchesSearch =
      r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.voucherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.prizeValue && r.prizeValue.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    if (rewards.length === 0) return;
    const headers = ['ID', 'Nama Hadiah', 'Nilai Hadiah', 'Kode Kupon', 'Waktu Menang', 'Status Penukaran'];
    const rows = rewards.map((r) => [
      r.id,
      `"${r.label}"`,
      `"${r.prizeValue || '-'}"`,
      r.voucherCode,
      r.wonAt,
      r.isRedeemed ? 'Sudah Ditukar' : 'Belum Ditukar',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_hadiah_expo_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans">
      {/* Top History Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-4 sm:px-8 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              title="Kembali ke Layar Roda"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Layar Roda</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  Dompet Kupon
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white">
                  Riwayat &amp; Inventaris Hadiah Pemenang
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Daftar lengkap kupon hadiah, kode voucher, dan status penukaran di booth expo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-all text-xs font-bold"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Admin Panel</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-6">
        {/* Filter and Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            {(['all', 'unredeemed', 'redeemed'] as const).map((tab) => {
              const count =
                tab === 'all'
                  ? rewards.length
                  : tab === 'unredeemed'
                  ? rewards.filter((r) => !r.isRedeemed).length
                  : rewards.filter((r) => r.isRedeemed).length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    filter === tab
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>
                    {tab === 'all'
                      ? 'Semua Hadiah'
                      : tab === 'unredeemed'
                      ? 'Belum Ditukar'
                      : 'Sudah Ditukar'}
                  </span>
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-950/80 text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kupon / hadiah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            {rewards.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={exportCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Unduh data dalam format CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Hapus semua riwayat hadiah yang tersimpan?')) {
                      onClearHistory();
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                  title="Hapus riwayat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Belum Ada Riwayat Hadiah</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Putar roda keberuntungan di layar kiosk pameran untuk mendapatkan berbagai hadiah eksklusif expo, smartphone, voucher diskon biaya KPR, dan merchandise menarik!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Putar Roda Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {filteredRewards.map((reward) => {
              const isCopied = copiedId === reward.id;

              return (
                <div
                  key={reward.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                    reward.isRedeemed
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                      : 'bg-slate-900/90 border-slate-800 shadow-md hover:border-slate-700'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: reward.color }}
                    >
                      {reward.rarity}
                    </span>

                    {reward.isRedeemed ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SUDAH DITUKAR</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">
                        BELUM DITUKAR
                      </span>
                    )}
                  </div>

                  {/* Prize Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: reward.color }}
                    >
                      <SegmentIcon name={reward.iconName} className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white truncate">
                        {reward.label}
                      </h4>
                      {reward.prizeValue && (
                        <p className="text-xs font-bold text-amber-300 mt-0.5">
                          {reward.prizeValue}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {reward.subtext || 'Voucher Resmi Expo'}
                      </p>
                    </div>
                  </div>

                  {/* Voucher Code Box */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                          Kode Voucher
                        </span>
                        <span className="font-mono text-xs font-black text-white tracking-wider">
                          {reward.voucherCode}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(reward.voucherCode, reward.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Footer Timestamps & Redeem Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(reward.wonAt).toLocaleDateString('id-ID')}</span>
                    </div>

                    {!reward.isRedeemed ? (
                      <button
                        type="button"
                        onClick={() => onRedeemReward(reward.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40 text-[11px] transition-colors flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Tandai Ditukar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Selesai Ditukar</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
