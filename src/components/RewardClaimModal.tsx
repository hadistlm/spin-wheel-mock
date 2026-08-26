import React, { useEffect } from 'react';
import { WheelSegment, ClaimedReward } from '../types';
import { SegmentIcon } from './Icons';
import { fireCelebrationConfetti } from '../utils/confetti';
import { playWinFanfare, playJackpotSound, playLossSound } from '../utils/audio';
import { Sparkles, X } from 'lucide-react';

interface RewardClaimModalProps {
  segment: WheelSegment | null;
  isOpen: boolean;
  soundEnabled: boolean;
  onClose: () => void;
  onClaim: (reward: ClaimedReward) => void;
  onSpinAgain: () => void;
}

export const RewardClaimModal: React.FC<RewardClaimModalProps> = ({
  segment,
  isOpen,
  soundEnabled,
  onClose,
  onClaim,
  onSpinAgain,
}) => {
  useEffect(() => {
    if (isOpen && segment) {
      if (!segment.isLoss) {
        fireCelebrationConfetti();
        if (soundEnabled) {
          if (segment.rarity === 'legendary' || segment.rarity === 'epic') {
            playJackpotSound();
          } else {
            playWinFanfare();
          }
        }

        // Auto-generate claimed reward record for history
        const prefix = segment.voucherCodeTemplate || 'HADIAH';
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${prefix}-${randomSuffix}`;
        const now = new Date();
        const expires = new Date();
        expires.setDate(expires.getDate() + 14);

        const newReward: ClaimedReward = {
          id: `reward-${Date.now()}`,
          segmentId: segment.id,
          label: segment.label,
          subtext: segment.subtext,
          iconName: segment.iconName,
          color: segment.color,
          rarity: segment.rarity,
          voucherCode: code,
          prizeValue: segment.prizeValue,
          wonAt: now.toISOString(),
          claimedAt: now.toISOString(),
          isClaimed: true,
          isRedeemed: false,
          expiresAt: expires.toISOString(),
          terms: segment.terms || 'Tunjukkan kupon ini ke booth/petugas untuk penukaran.',
        };
        onClaim(newReward);
      } else {
        if (soundEnabled) {
          playLossSound();
        }
      }
    }
  }, [isOpen, segment, soundEnabled]);

  if (!isOpen || !segment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#0F172A] text-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 transition-all transform animate-scaleUp">
        {/* Tombol Tutup */}
        <button
          id="btn-close-reward-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        {!segment.isLoss ? (
          <div className="bg-gradient-to-b from-amber-500/20 via-indigo-900/40 to-transparent pt-8 pb-3 px-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SELAMAT!</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Anda Mendapatkan
            </h2>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-slate-800/50 to-transparent pt-8 pb-3 px-6 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-200">
              Belum Beruntung
            </h2>
          </div>
        )}

        {/* Modal Body - Simple & Clean */}
        <div className="p-6 pt-2 text-center space-y-5">
          {!segment.isLoss ? (
            <>
              {/* Prize Badge & Icon */}
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl mb-3 border-2 border-white/20"
                  style={{ backgroundColor: segment.color }}
                >
                  <SegmentIcon name={segment.iconName} className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {segment.label}
                </h3>
                {segment.prizeValue && (
                  <p className="text-sm font-bold text-amber-400 mt-1 bg-amber-950/40 border border-amber-500/30 px-3 py-0.5 rounded-full inline-block">
                    {segment.prizeValue}
                  </p>
                )}
                {segment.subtext && (
                  <p className="text-xs text-slate-400 mt-1">
                    {segment.subtext}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-950"
                >
                  Selesai
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Loss Screen */}
              <div className="flex flex-col items-center py-2">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                  <SegmentIcon name="frown" className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">
                  {segment.label || 'Coba Lagi'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {segment.subtext || 'Terima kasih telah mencoba! Silakan putar kembali untuk mencoba keberuntungan Anda.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

