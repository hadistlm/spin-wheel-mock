import React, { useState } from 'react';
import { ClaimedReward } from '../types';
import { SegmentIcon } from './Icons';
import {
  Gift,
  X,
  Copy,
  Check,
  QrCode,
  Calendar,
  CheckCircle2,
  Trash2,
  Download,
} from 'lucide-react';

interface RewardWalletDrawerProps {
  isOpen: boolean;
  rewards: ClaimedReward[];
  onClose: () => void;
  onRedeemReward: (id: string) => void;
  onClearHistory: () => void;
}

export const RewardWalletDrawer: React.FC<RewardWalletDrawerProps> = ({
  isOpen,
  rewards,
  onClose,
  onRedeemReward,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unredeemed' | 'redeemed'>('all');

  if (!isOpen) return null;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRewards = rewards.filter((r) => {
    if (filter === 'unredeemed') return !r.isRedeemed;
    if (filter === 'redeemed') return r.isRedeemed;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs animate-fadeIn flex justify-end">
      <div className="w-full max-w-md bg-[#0F172A] text-slate-100 h-full shadow-2xl flex flex-col transform transition-transform animate-slideLeft border-l border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900/90 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                My Won Rewards &amp; Vouchers
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {rewards.length} prize{rewards.length === 1 ? '' : 's'} won
              </p>
            </div>
          </div>
          <button
            id="btn-close-wallet-drawer"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs font-semibold">
          <div className="flex items-center gap-1">
            {(['all', 'unredeemed', 'redeemed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  filter === tab
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {rewards.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              title="Clear inventory history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Reward List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {filteredRewards.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-200 text-sm">No Rewards Found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Spin the wheel to win official Housing Expo coffee vouchers, KPR booking discounts, fine gold bars, and merchandise!
              </p>
            </div>
          ) : (
            filteredRewards.map((reward) => {
              const isCopied = copiedId === reward.id;

              return (
                <div
                  key={reward.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2.5 relative overflow-hidden ${
                    reward.isRedeemed
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                      : 'bg-slate-900/80 border-slate-800 shadow-xs hover:border-slate-700'
                  }`}
                >
                  {/* Status Ribbon */}
                  {reward.isRedeemed && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>REDEEMED AT BOOTH</span>
                    </div>
                  )}

                  {/* Header info */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: reward.color }}
                    >
                      <SegmentIcon name={reward.iconName} className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full text-white"
                          style={{ backgroundColor: reward.color }}
                        >
                          {reward.rarity}
                        </span>
                        {reward.prizeValue && (
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
                            {reward.prizeValue}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white truncate mt-0.5">
                        {reward.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        Won on {new Date(reward.wonAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Voucher Code Box */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/90 text-xs font-mono font-bold text-white border border-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{reward.voucherCode}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(reward.voucherCode, reward.id)}
                      className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-[11px] text-slate-200 hover:bg-slate-600 flex items-center gap-1 shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-sans font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="font-sans font-semibold">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expiry and Redeem Actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Expires in 14 days</span>
                    </div>

                    {!reward.isRedeemed ? (
                      <button
                        type="button"
                        onClick={() => onRedeemReward(reward.id)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                      >
                        Mark Redeemed
                      </button>
                    ) : (
                      <span className="text-slate-500 font-medium">Used</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Auto-saved to local device</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
