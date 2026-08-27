import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WheelSegment, SpinConfig, WheelTheme, DisplayMode } from '../types';
import { SegmentIcon } from './Icons';
import { playTickSound, playButtonPressSound } from '../utils/audio';
import { wrapLabel } from '../utils/common';

interface SpinningWheelProps {
  segments: WheelSegment[];
  config: SpinConfig;
  theme: WheelTheme;
  isSpinning: boolean;
  displayMode?: DisplayMode;
  onSpinStart: () => void;
  onSpinEnd: (winningSegment: WheelSegment) => void;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  segments,
  config,
  theme,
  isSpinning,
  displayMode,
  onSpinStart,
  onSpinEnd,
}) => {
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [tickerAngle, setTickerAngle] = useState<number>(0);
  const [winningSliceIndex, setWinningSliceIndex] = useState<number | null>(null);
  const [oddLightPhase, setOddLightPhase] = useState<number>(0);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const lastPegCrossedRef = useRef<number>(-1);
  const targetSegmentRef = useRef<WheelSegment | null>(null);

  const numSegments = Math.max(1, segments.length);
  const sliceAngle = 360 / numSegments;
  const numBulbs = 24;

  // Odd lights animation loop (chasing wave & pulse through odd bulbs)
  useEffect(() => {
    const interval = setInterval(() => {
      setOddLightPhase((prev) => (prev + 1) % 12);
    }, isSpinning ? 70 : 200);
    return () => clearInterval(interval);
  }, [isSpinning]);

  // Generate 24 bulbs around the silver bezel rim
  const bulbs = useMemo(() => {
    const arr = [];
    const radius = 230;
    for (let i = 0; i < numBulbs; i++) {
      // 0 deg is at 3 o'clock; offset so top starts cleanly
      const angle = (i * 360) / numBulbs - 90;
      const rad = (angle * Math.PI) / 180;
      const cx = 250 + radius * Math.cos(rad);
      const cy = 250 + radius * Math.sin(rad);
      const isOdd = i % 2 === 1;
      const oddIndex = Math.floor(i / 2);
      arr.push({ id: i, cx, cy, angle, isOdd, oddIndex });
    }
    return arr;
  }, [numBulbs]);

  // Easing helper functions
  const getProgress = (t: number, easing: SpinConfig['easing']) => {
    if (easing === 'cubic-ease-out') {
      return 1 - Math.pow(1 - t, 3);
    }
    if (easing === 'elastic-bounce') {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    if (easing === 'ultra-fast') {
      return 1 - Math.pow(1 - t, 4);
    }
    return 1 - Math.pow(1 - t, 5);
  };

  // Perform Spin
  const startSpin = () => {
    if (isSpinning) return;

    if (config.soundEnabled) {
      playButtonPressSound();
    }

    setWinningSliceIndex(null);
    onSpinStart();

    // 1. Pick target segment based on weights, test rigged ID, and quotas
    let selectedSegment: WheelSegment;

    if (config.testRiggedSegmentId) {
      const found = segments.find((s) => s.id === config.testRiggedSegmentId);
      selectedSegment = found || segments[0];
    } else {
      // Calculate active weights respecting remaining quotas
      const segmentsWithEffectiveWeights = segments.map((seg) => {
        const hasQuotaLimit = !seg.unlimitedQuota && seg.initialQuota !== undefined;
        const isOutOfStock = hasQuotaLimit && (seg.initialQuota! - (seg.wonCount || 0) <= 0);
        return {
          segment: seg,
          effectiveWeight: isOutOfStock ? 0 : Math.max(0.001, seg.weight),
        };
      });

      const totalWeight = segmentsWithEffectiveWeights.reduce((sum, item) => sum + item.effectiveWeight, 0);

      if (totalWeight <= 0) {
        const lossSegment = segments.find((s) => s.isLoss) || segments[0];
        selectedSegment = lossSegment;
      } else {
        let rand = Math.random() * totalWeight;
        selectedSegment = segments[0];

        for (const item of segmentsWithEffectiveWeights) {
          if (item.effectiveWeight <= 0) continue;
          if (rand < item.effectiveWeight) {
            selectedSegment = item.segment;
            break;
          }
          rand -= item.effectiveWeight;
        }
      }
    }

    const selectedIndex = segments.findIndex((s) => s.id === selectedSegment.id);
    targetSegmentRef.current = selectedSegment;

    // 2. Compute target rotation
    // Pointer is at the top (270 deg / -90 deg from center)
    const midAngle = (selectedIndex + 0.5) * sliceAngle;
    const targetRemainder = (360 - midAngle + 360) % 360;

    // Subtle random jitter inside slice (±25% width)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.4);

    const fullSpins = config.minRotations * 360;
    const currentBase = Math.floor(currentRotation / 360) * 360;
    const finalAngle = currentBase + fullSpins + targetRemainder + jitter;

    startAngleRef.current = currentRotation;
    targetAngleRef.current = finalAngle;
    startTimeRef.current = performance.now();
    lastPegCrossedRef.current = -1;

    // 3. Animation loop using requestAnimationFrame
    const duration = config.spinDuration * 1000;

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = getProgress(progress, config.easing);

      const newAngle = startAngleRef.current + (targetAngleRef.current - startAngleRef.current) * eased;
      setCurrentRotation(newAngle);

      // Ticker pin deflection & tick sound
      const totalPegAngle = newAngle;
      const currentPegIndex = Math.floor(totalPegAngle / sliceAngle);

      if (currentPegIndex !== lastPegCrossedRef.current) {
        lastPegCrossedRef.current = currentPegIndex;
        setTickerAngle(-20);
        setTimeout(() => setTickerAngle(0), 40);

        if (config.soundEnabled) {
          const speedFactor = 1 - progress;
          playTickSound(520 + speedFactor * 400, 0.12 + speedFactor * 0.1);
        }
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        // Finished spin!
        setCurrentRotation(targetAngleRef.current);
        setWinningSliceIndex(selectedIndex);
        setTickerAngle(0);

        if (targetSegmentRef.current) {
          onSpinEnd(targetSegmentRef.current);
        }
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const isSignage = displayMode === 'signage';

  return (
    <div
      className={`flex flex-col items-center justify-center relative w-full mx-auto select-none ${
        isSignage ? 'max-w-[900px]' : 'max-w-[560px]'
      }`}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute -inset-6 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700 ${
          isSpinning
            ? 'bg-gradient-to-r from-blue-600 via-amber-400 to-red-600 scale-105 opacity-55 animate-pulse'
            : 'bg-gradient-to-tr from-blue-600/30 via-slate-800/20 to-amber-500/30 opacity-30'
        }`}
      />

      {/* Wheel Stage Container - CLICKABLE TO SPIN */}
      <div
        id="interactive-wheel-stage"
        onClick={startSpin}
        title={isSpinning ? 'Sedang Memutar...' : 'Klik Roda Untuk Memutar!'}
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          isSignage
            ? 'w-[440px] h-[440px] sm:w-[600px] sm:h-[600px] md:w-[720px] md:h-[720px] lg:w-[850px] lg:h-[850px]'
            : 'w-[340px] h-[340px] xs:w-[390px] xs:h-[390px] sm:w-[460px] sm:h-[460px] md:w-[510px] md:h-[510px]'
        } ${isSpinning ? 'cursor-not-allowed scale-[0.995]' : 'hover:scale-[1.015] active:scale-[0.985]'}`}
      >
        {/* Top Pointer Needle (Fixed at top 12 o'clock, styled like Screenshot_1.png) */}
        <div
          className="absolute -top-4 z-40 flex flex-col items-center pointer-events-none drop-shadow-2xl transition-transform duration-75 origin-top"
          style={{ transform: `rotate(${tickerAngle}deg)` }}
        >
          <div className="w-12 h-16 relative flex justify-center items-start">
            <svg viewBox="0 0 44 56" className="w-full h-full drop-shadow-xl" fill="none">
              <defs>
                <linearGradient id="needleRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="45%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
                <radialGradient id="needlePinGold" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </radialGradient>
                <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Red triangular pointer body with white outline */}
              <polygon
                points="22,54 4,14 40,14"
                fill="url(#needleRedGrad)"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinejoin="round"
                filter="url(#needleShadow)"
              />

              {/* Red curved top cap */}
              <path
                d="M 4 14 C 4 6 40 6 40 14 Z"
                fill="url(#needleRedGrad)"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Top golden jewel pin */}
              <circle
                cx="22"
                cy="14"
                r="7"
                fill="url(#needlePinGold)"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle cx="22" cy="14" r="3.5" fill="#EF4444" />
            </svg>
          </div>
        </div>

        {/* SVG Wheel Graphic */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full transform transition-all duration-300"
        >
          <defs>
            {/* Outer silver bevel gradient */}
            <linearGradient id="silverBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="25%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="75%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            {/* Silver rim 3D inner stroke */}
            <linearGradient id="silverRimDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Blue spherical center hub gradient */}
            <radialGradient id="centerBlueSphere" cx="38%" cy="36%" r="62%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="25%" stopColor="#3B82F6" />
              <stop offset="65%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#172554" />
            </radialGradient>

            {/* Gold star gradient */}
            <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            {/* Golden bulb glow filter */}
            <filter id="goldenBulbGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Slice Drop Shadow */}
            <filter id="sliceDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 1. Outermost Dark Bezel Trim */}
          <circle
            cx="250"
            cy="250"
            r="248"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="3"
          />

          {/* 2. Broad Silver/White Metallic Bezel (Screenshot_1.png style) */}
          <circle
            cx="250"
            cy="250"
            r="244"
            fill="url(#silverBezelGrad)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Inner silver groove */}
          <circle
            cx="250"
            cy="250"
            r="218"
            fill="none"
            stroke="#64748B"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* 3. Outer Light Bulbs Array (Odd Lights Animated with Golden Glow Rings) */}
          <g id="outer-bezel-lights">
            {bulbs.map((b) => {
              if (b.isOdd) {
                // Odd bulb: Signature amber-gold glowing orb with outer halo ring
                // Animated pulse / wave moving across odd bulbs
                const waveIntensity = (b.oddIndex + oddLightPhase) % 12;
                const isPeak = waveIntensity === 0 || waveIntensity === 1;
                const haloRadius = isPeak ? 9.5 : 8;
                const haloOpacity = isPeak ? 0.95 : 0.65;
                const coreFill = isPeak ? '#FEF08A' : '#F59E0B';

                return (
                  <g key={b.id} className="transition-all duration-150">
                    {/* Outer Golden Halo Ring */}
                    <circle
                      cx={b.cx}
                      cy={b.cy}
                      r={haloRadius}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={isPeak ? 2.5 : 1.8}
                      opacity={haloOpacity}
                      filter="url(#goldenBulbGlow)"
                    />

                    {/* Amber Core Jewel */}
                    <circle
                      cx={b.cx}
                      cy={b.cy}
                      r="5.5"
                      fill={coreFill}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      filter="url(#goldenBulbGlow)"
                    />

                    {/* Specular White Highlight */}
                    <circle
                      cx={b.cx - 1.2}
                      cy={b.cy - 1.2}
                      r="2"
                      fill="#FFFFFF"
                      opacity="0.9"
                    />
                  </g>
                );
              } else {
                // Even bulb: Metallic dark slate socket (Screenshot_1.png style)
                return (
                  <g key={b.id}>
                    <circle
                      cx={b.cx}
                      cy={b.cy}
                      r="5.5"
                      fill="#334155"
                      stroke="#1E293B"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={b.cx}
                      cy={b.cy}
                      r="3.5"
                      fill="#475569"
                    />
                    <circle
                      cx={b.cx - 1}
                      cy={b.cy - 1}
                      r="1.2"
                      fill="#94A3B8"
                      opacity="0.7"
                    />
                  </g>
                );
              }
            })}
          </g>

          {/* 4. ROTATING DISC SLICES */}
          <g
            id="wheel-slices-group"
            style={{
              transform: `rotate(${currentRotation}deg)`,
              transformOrigin: '250px 250px',
            }}
          >
            {/* White boundary ring behind slices */}
            <circle
              cx="250"
              cy="250"
              r="215"
              fill="#FFFFFF"
            />

            {segments.map((segment, index) => {
              const startAngle = index * sliceAngle - 90;
              const endAngle = startAngle + sliceAngle;
              const midAngle = startAngle + sliceAngle / 2;

              const isWinning = winningSliceIndex === index;
              const hasQuotaLimit = !segment.unlimitedQuota && segment.initialQuota !== undefined;
              const isOutOfStock = hasQuotaLimit && (segment.initialQuota! - (segment.wonCount || 0) <= 0);

              const radius = 212;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 250 + radius * Math.cos(startRad);
              const y1 = 250 + radius * Math.sin(startRad);
              const x2 = 250 + radius * Math.cos(endRad);
              const y2 = 250 + radius * Math.sin(endRad);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `M 250 250 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              // Alternate red & blue if custom not specified
              const sliceColor = isOutOfStock
                ? '#334155'
                : segment.color || (index % 2 === 0 ? '#D92D20' : '#1D4ED8');

              return (
                <g key={segment.id} id={`slice-${segment.id}`}>
                  {/* Segment Slice Path */}
                  <path
                    d={pathData}
                    fill={sliceColor}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    opacity={isOutOfStock ? 0.65 : isWinning ? 1 : 0.98}
                    filter={isWinning ? 'url(#sliceDropShadow)' : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Spoke Divider Line */}
                  <line
                    x1="250"
                    y1="250"
                    x2={x1}
                    y2={y1}
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Text & Icon in Slice */}
                  <g
                    transform={`rotate(${midAngle + 90}, 250, 250)`}
                    className="pointer-events-none"
                  >
                    <g transform="translate(250, 80)">
                      {/* Icon */}
                      <g transform="translate(0, 10) scale(1.2)">
                        <foreignObject x="-14" y="-14" width="28" height="28">
                          <div className="w-full h-full flex items-center justify-center text-white drop-shadow-md">
                            <SegmentIcon name={segment.iconName} className="w-6 h-6 text-white stroke-[2.2]" />
                          </div>
                        </foreignObject>
                      </g>

                      {/* Label Text */}
                      {(() => {
                        const labelFontSize =
                          numSegments >= 8 ? 9.5 : numSegments > 6 ? 12.5 : 14.5;
                        const maxLineLen = numSegments >= 8 ? 12 : numSegments > 6 ? 15 : 19;
                        const labelLines = isOutOfStock
                          ? ['HABIS']
                          : wrapLabel(segment.label, maxLineLen, 2);
                        const lineHeight = labelFontSize + 2;
                        const labelStartY = 40 - ((labelLines.length - 1) * lineHeight) / 2;

                        return (
                          <>
                            <text
                              x="0"
                              fill={isOutOfStock ? '#94A3B8' : segment.textColor || '#FFFFFF'}
                              textAnchor="middle"
                              className="font-black tracking-tight"
                              style={{
                                fontSize: `${labelFontSize}px`,
                                textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                                fontWeight: 900,
                              }}
                            >
                              {labelLines.map((line, i) => (
                                <tspan key={i} x="0" y={labelStartY + i * lineHeight}>
                                  {line}
                                </tspan>
                              ))}
                            </text>

                            {/* Subtext or Value */}
                            {!isOutOfStock &&
                              (segment.prizeValue || segment.subtext) &&
                              (() => {
                                const subtextFontSize = numSegments >= 8 ? 8 : 9.5;
                                const subMaxLineLen = numSegments >= 8 ? 16 : 22;
                                const subLineHeight = subtextFontSize + 1.5;
                                const subLines = wrapLabel(
                                  segment.prizeValue || segment.subtext || '',
                                  subMaxLineLen,
                                  2
                                );
                                const subStartY = labelStartY + labelLines.length * lineHeight;

                                return (
                                  <text
                                    x="0"
                                    fill="#FEF08A"
                                    textAnchor="middle"
                                    className="font-bold tracking-tight"
                                    style={{
                                      fontSize: `${subtextFontSize}px`,
                                      textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {subLines.map((line, i) => (
                                      <tspan key={i} x="0" y={subStartY + i * subLineHeight}>
                                        {line}
                                      </tspan>
                                    ))}
                                  </text>
                                );
                              })()}
                          </>
                        );
                      })()}

                      {isOutOfStock && (
                        <text
                          x="0"
                          y="55"
                          fill="#F87171"
                          textAnchor="middle"
                          className="font-bold text-[9px] tracking-normal uppercase"
                        >
                          Kuota Habis
                        </text>
                      )}
                    </g>
                  </g>

                  {/* Outer Spoke Rim Pin/Peg (White dot with border) */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#1E293B"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Inner Center Cutout Circle */}
            <circle
              cx="250"
              cy="250"
              r="48"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
            />
          </g>

          {/* 5. STATIC CENTER HUB (Screenshot_1.png: Silver Bezel + Blue Sphere + Golden Star ⭐) */}
          {/* Outer Silver Bezel Ring of Center Hub */}
          <circle
            cx="250"
            cy="250"
            r="46"
            fill="url(#silverBezelGrad)"
            stroke="#475569"
            strokeWidth="2.5"
            filter="url(#sliceDropShadow)"
          />

          {/* Middle White/Silver Ring */}
          <circle
            cx="250"
            cy="250"
            r="38"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* Inner Glossy Blue Spherical Dome */}
          <circle
            cx="250"
            cy="250"
            r="31"
            fill="url(#centerBlueSphere)"
            stroke="#1D4ED8"
            strokeWidth="2"
          />

          {/* Center "SPIN WHEEL" Label */}
          <text
            x="250"
            y="245"
            textAnchor="middle"
            className="pointer-events-none select-none"
            fontSize="9.5"
            fontWeight="900"
            fill="#FFFFFF"
            fontFamily="sans-serif"
          >
            SPIN
          </text>
          <text
            x="250"
            y="258"
            textAnchor="middle"
            className="pointer-events-none select-none"
            fontSize="9.5"
            fontWeight="900"
            fill="#FFFFFF"
            fontFamily="sans-serif"
          >
            WHEEL
          </text>
        </svg>
      </div>
    </div>
  );
};
