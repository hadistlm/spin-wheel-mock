import React, { useState, useEffect } from 'react';
import { WheelSegment, ClaimedReward } from '../types';
import { SegmentIcon } from './Icons';
import { fireCelebrationConfetti, fireClaimSparkles } from '../utils/confetti';
import { playWinFanfare, playJackpotSound, playLossSound, playClaimStampSound } from '../utils/audio';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  RotateCcw,
  Calendar,
  AlertCircle,
  X,
  Share2,
} from 'lucide-react';

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
  const [isClaimed, setIsClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [stampAnimating, setStampAnimating] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  useEffect(() => {
    if (isOpen && segment) {
      setIsClaimed(false);
      setCopiedCode(false);
      setStampAnimating(false);

      // Generate realistic dynamic voucher code
      const prefix = segment.voucherCodeTemplate || 'BTN-PRIZE';
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${prefix}-${randomSuffix}`;
      setVoucherCode(code);

      if (!segment.isLoss) {
        // Trigger celebratory confetti upon winning
        fireCelebrationConfetti();

        if (soundEnabled) {
          if (segment.rarity === 'legendary' || segment.rarity === 'epic') {
            playJackpotSound();
          } else {
            playWinFanfare();
          }
        }
      } else {
        if (soundEnabled) {
          playLossSound();
        }
      }
    }
  }, [isOpen, segment, soundEnabled]);

  if (!isOpen || !segment) return null;

  const handleClaim = (e: React.MouseEvent) => {
    if (isClaimed) return;

    // Get click coordinates for targeted sparkle burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    setStampAnimating(true);
    if (soundEnabled) {
      playClaimStampSound();
    }
    fireClaimSparkles(x, y);

    const now = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 14); // 14 days validity

    const newReward: ClaimedReward = {
      id: `reward-${Date.now()}`,
      segmentId: segment.id,
      label: segment.label,
      subtext: segment.subtext,
      iconName: segment.iconName,
      color: segment.color,
      rarity: segment.rarity,
      voucherCode: voucherCode,
      prizeValue: segment.prizeValue,
      wonAt: now.toISOString(),
      claimedAt: now.toISOString(),
      isClaimed: true,
      isRedeemed: false,
      expiresAt: expires.toISOString(),
      terms: segment.terms || 'Valid during expo operational hours. Show voucher code at counter.',
    };

    setIsClaimed(true);
    onClaim(newReward);
  };

  const handleCopyCode = () => {
    if (!voucherCode) return;
    navigator.clipboard.writeText(voucherCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] text-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 transition-all transform animate-scaleUp ring-1 ring-slate-700/40">
        {/* Close Button */}
        <button
          id="btn-close-reward-modal"
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon / Banner */}
        {!segment.isLoss ? (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 pt-7 pb-5 text-center text-white relative overflow-hidden">
            {/* Background sparkle motifs */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />
            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-extrabold uppercase tracking-widest text-amber-100 border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>CONGRATULATIONS!</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              YOU WON A PRIZE!
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-0.5">
              BTN Housing Expo Special Rewards Program
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 pt-7 pb-5 text-center text-white border-b border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              BETTER LUCK NEXT TIME!
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Keep spinning to unlock exclusive expo vouchers
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {!segment.isLoss ? (
            <>
              {/* Voucher Ticket Card */}
              <div
                className="relative rounded-xl border-2 border-dashed p-4.5 bg-slate-900/90 shadow-inner overflow-hidden"
                style={{ borderColor: segment.color || '#475569' }}
              >
                {/* Left/Right ticket notches */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0F172A] border border-slate-700" />
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0F172A] border border-slate-700" />

                {/* Animated "CLAIMED" Rubber Stamp */}
                {isClaimed && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 ${
                      stampAnimating ? 'animate-stampSlam' : ''
                    }`}
                  >
                    <div className="border-4 border-red-500 rounded-lg px-6 py-2 transform -rotate-12 bg-red-950/40 shadow-lg backdrop-blur-xs">
                      <span className="text-3xl font-black tracking-widest text-red-400 uppercase">
                        CLAIMED
                      </span>
                    </div>
                  </div>
                )}

                {/* Prize Details */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ backgroundColor: segment.color }}
                  >
                    <SegmentIcon name={segment.iconName} className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: segment.color }}
                      >
                        {segment.rarity}
                      </span>
                      {segment.prizeValue && (
                        <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                          {segment.prizeValue}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-white truncate mt-0.5">
                      {segment.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {segment.subtext || 'Official Expo Voucher'}
                    </p>
                  </div>
                </div>

                {/* Voucher Code Box */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block leading-none">
                        VOUCHER CODE
                      </span>
                      <span className="font-mono text-sm font-bold text-white tracking-wider">
                        {voucherCode}
                      </span>
                    </div>
                  </div>
                  <button
                    id="btn-copy-voucher-code"
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md text-slate-200 transition-colors shadow-2xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Validity Note */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Valid for 14 days at Danantara Housing Expo booths</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              {segment.terms && (
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{segment.terms}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {!isClaimed ? (
                  <button
                    id="btn-claim-reward-primary"
                    type="button"
                    onClick={handleClaim}
                    className="w-full py-3.5 rounded-xl font-black text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>CLAIM REWARD NOW</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Voucher Successfully Saved to Your Wallet!</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    id="btn-spin-again-modal"
                    type="button"
                    onClick={() => {
                      onClose();
                      onSpinAgain();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Spin Again</span>
                  </button>
                  <button
                    id="btn-share-voucher"
                    type="button"
                    onClick={handleCopyCode}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Pass</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Loss / Try Again Content */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <SegmentIcon name="frown" className="w-10 h-10" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Don't give up! Every property booth visit gives bonus spin tokens.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Visit the BTN customer service desk or scan the booth QR code for extra turns.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-loss-spin-again"
                  type="button"
                  onClick={() => {
                    onClose();
                    onSpinAgain();
                  }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Your Luck Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
