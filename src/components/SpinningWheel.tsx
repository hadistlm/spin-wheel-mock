import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WheelSegment, SpinConfig, WheelTheme } from '../types';
import { SegmentIcon } from './Icons';
import { playTickSound, playButtonPressSound } from '../utils/audio';

interface SpinningWheelProps {
  segments: WheelSegment[];
  config: SpinConfig;
  theme: WheelTheme;
  isSpinning: boolean;
  spinsLeft: number;
  onSpinStart: () => void;
  onSpinEnd: (winningSegment: WheelSegment) => void;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  segments,
  config,
  theme,
  isSpinning,
  spinsLeft,
  onSpinStart,
  onSpinEnd,
}) => {
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [tickerAngle, setTickerAngle] = useState<number>(0);
  const [winningSliceIndex, setWinningSliceIndex] = useState<number | null>(null);
  const [bulbFrame, setBulbFrame] = useState<number>(0);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const lastPegCrossedRef = useRef<number>(-1);
  const targetSegmentRef = useRef<WheelSegment | null>(null);

  const numSegments = Math.max(1, segments.length);
  const sliceAngle = 360 / numSegments;
  const numBulbs = 24;

  // LED bulb chasing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBulbFrame((prev) => (prev + 1) % numBulbs);
    }, isSpinning ? 60 : 250);
    return () => clearInterval(interval);
  }, [isSpinning, numBulbs]);

  // Generate bulbs around rim
  const bulbs = useMemo(() => {
    const arr = [];
    const radius = 232;
    for (let i = 0; i < numBulbs; i++) {
      const angle = (i * 360) / numBulbs;
      const rad = (angle * Math.PI) / 180;
      const cx = 250 + radius * Math.cos(rad);
      const cy = 250 + radius * Math.sin(rad);
      arr.push({ id: i, cx, cy, angle });
    }
    return arr;
  }, [numBulbs]);

  // Easing helper functions
  const getProgress = (t: number, easing: SpinConfig['easing']) => {
    // t is 0 to 1
    if (easing === 'cubic-ease-out') {
      return 1 - Math.pow(1 - t, 3);
    }
    if (easing === 'elastic-bounce') {
      // Custom overshoot and settle
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    if (easing === 'ultra-fast') {
      return 1 - Math.pow(1 - t, 4);
    }
    // 'suspense-slowdown': high speed early, dramatic slow crawl at the end
    return 1 - Math.pow(1 - t, 5);
  };

  // Perform Spin
  const startSpin = () => {
    if (isSpinning || (spinsLeft <= 0 && !config.testRiggedSegmentId)) return;

    if (config.soundEnabled) {
      playButtonPressSound();
    }

    setWinningSliceIndex(null);
    onSpinStart();

    // 1. Pick target segment based on weights (or test rigging)
    let selectedSegment: WheelSegment;

    if (config.testRiggedSegmentId) {
      const found = segments.find((s) => s.id === config.testRiggedSegmentId);
      selectedSegment = found || segments[0];
    } else {
      const totalWeight = segments.reduce((sum, seg) => sum + Math.max(0.001, seg.weight), 0);
      let rand = Math.random() * totalWeight;
      selectedSegment = segments[0];

      for (const seg of segments) {
        if (rand < seg.weight) {
          selectedSegment = seg;
          break;
        }
        rand -= seg.weight;
      }
    }

    const selectedIndex = segments.findIndex((s) => s.id === selectedSegment.id);
    targetSegmentRef.current = selectedSegment;

    // 2. Compute target rotation
    // In SVG, segment 0 starts at 0 deg (top = 0 deg).
    // Mid angle of segment i: (i + 0.5) * sliceAngle
    // When wheel is rotated clockwise by R degrees, the top pointer (0 deg) hits the slice at:
    // pointerSlice = Math.floor(((360 - (R % 360)) % 360) / sliceAngle)
    // To make top pointer hit selectedIndex:
    // We want ((360 - (R % 360)) % 360) = (selectedIndex + 0.5) * sliceAngle
    // => (R % 360) = (360 - (selectedIndex + 0.5) * sliceAngle)
    const midAngle = (selectedIndex + 0.5) * sliceAngle;
    const targetRemainder = (360 - midAngle + 360) % 360;

    // Add safe random jitter inside slice (+/- 25% of slice width so it never hits the line)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.5);

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

      // Ticker pin deflection & tick sound calculation
      // Number of slices passed:
      const totalPegAngle = newAngle;
      const currentPegIndex = Math.floor(totalPegAngle / sliceAngle);

      if (currentPegIndex !== lastPegCrossedRef.current) {
        lastPegCrossedRef.current = currentPegIndex;

        // Animate pointer kick
        setTickerAngle(-22);
        setTimeout(() => setTickerAngle(0), 40);

        if (config.soundEnabled) {
          // Dynamic pitch based on spin speed
          const speedFactor = 1 - progress;
          playTickSound(500 + speedFactor * 400, 0.12 + speedFactor * 0.1);
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

  return (
    <div className="flex flex-col items-center justify-center relative w-full max-w-[480px] mx-auto select-none">
      {/* Glow aura behind wheel */}
      <div
        className={`absolute -inset-4 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700 ${
          isSpinning
            ? 'bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 scale-105 opacity-60 animate-pulse'
            : 'bg-gradient-to-tr from-blue-400 to-amber-200 opacity-20'
        }`}
      />

      {/* Wheel Container */}
      <div className="relative w-full aspect-square max-w-[420px] sm:max-w-[440px] p-2 flex items-center justify-center">
        {/* Top Ticker Pointer */}
        <div
          className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-xl transition-transform duration-75 origin-top"
          style={{
            transform: `translateX(-50%) rotate(${tickerAngle}deg)`,
          }}
        >
          {/* Stylized 3D Metallic Triangle Pointer */}
          <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
            <defs>
              <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="pointerHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
              </linearGradient>
              <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>
            <path
              d="M 22 46 L 5 8 C 3 4, 6 1, 10 1 L 34 1 C 38 1, 41 4, 39 8 Z"
              fill="url(#pointerGrad)"
              filter="url(#pointerShadow)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* Top Gloss Highlight */}
            <path
              d="M 12 3 L 32 3 C 34 3, 35 4, 34 6 L 22 34 L 10 6 C 9 4, 10 3, 12 3 Z"
              fill="url(#pointerHighlight)"
              opacity="0.6"
            />
            {/* Center golden pivot jewel on pointer */}
            <circle cx="22" cy="12" r="4.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
            <circle cx="21" cy="11" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Main SVG Wheel Canvas */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Outer Bezel Gradients */}
            <linearGradient id="rimGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="rimOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            <radialGradient id="centerJewel" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#3B82F6" />
              <stop offset="85%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>

            <radialGradient id="goldJewel" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Heavy Bezel / Ring */}
          <circle
            cx="250"
            cy="250"
            r="246"
            fill="url(#rimOuter)"
            stroke="#94A3B8"
            strokeWidth="3"
          />
          <circle
            cx="250"
            cy="250"
            r="228"
            fill="#0F172A"
            stroke="#CBD5E1"
            strokeWidth="2"
          />

          {/* Animated LED Bulbs on Bezel */}
          {bulbs.map((bulb, idx) => {
            const isChasing = (bulbFrame + idx) % 4 === 0;
            const isAltChasing = (bulbFrame + idx + 2) % 4 === 0;
            const isLit = config.bulbsEffect === 'steady' || (config.bulbsEffect === 'chase' ? isChasing : isAltChasing);
            const bulbColor = isLit ? '#FBBF24' : '#475569';
            const glowColor = isLit ? '#F59E0B' : 'transparent';

            return (
              <g key={bulb.id}>
                {/* Glow ring */}
                {isLit && (
                  <circle
                    cx={bulb.cx}
                    cy={bulb.cy}
                    r="8"
                    fill={glowColor}
                    opacity="0.6"
                    filter="url(#glowFilter)"
                  />
                )}
                {/* Bulb body */}
                <circle
                  cx={bulb.cx}
                  cy={bulb.cy}
                  r="5"
                  fill={bulbColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                {isLit && (
                  <circle
                    cx={bulb.cx - 1.2}
                    cy={bulb.cy - 1.2}
                    r="1.5"
                    fill="#FFFFFF"
                  />
                )}
              </g>
            );
          })}

          {/* INNER ROTATING DISC */}
          <g
            id="wheel-rotor"
            transform={`rotate(${currentRotation}, 250, 250)`}
            className="transition-none"
          >
            {/* Outer Wheel Rim */}
            <circle
              cx="250"
              cy="250"
              r="216"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="4"
            />

            {/* SECTORS / SLICES */}
            {segments.map((segment, index) => {
              const startAngle = index * sliceAngle - 90; // Align 0 index to top (12 o'clock)
              const endAngle = (index + 1) * sliceAngle - 90;
              const midAngle = startAngle + sliceAngle / 2;

              const r = 214;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 250 + r * Math.cos(startRad);
              const y1 = 250 + r * Math.sin(startRad);
              const x2 = 250 + r * Math.cos(endRad);
              const y2 = 250 + r * Math.sin(endRad);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `M 250 250 L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              const isWinningSlice = winningSliceIndex === index;

              return (
                <g key={segment.id} className="select-none">
                  {/* Slice Wedge */}
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className={isWinningSlice ? 'filter brightness-125' : ''}
                  />

                  {/* Inner divider highlight line */}
                  <line
                    x1="250"
                    y1="250"
                    x2={x1}
                    y2={y1}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Text & Icon in Slice */}
                  <g
                    transform={`rotate(${midAngle + 90}, 250, 250)`}
                    className="pointer-events-none"
                  >
                    {/* Position group towards outer edge */}
                    <g transform="translate(250, 75)">
                      {/* Icon */}
                      <g transform="translate(0, 5) scale(1.15)">
                        <foreignObject x="-14" y="-14" width="28" height="28">
                          <div className="w-full h-full flex items-center justify-center text-white drop-shadow-md">
                            <SegmentIcon name={segment.iconName} className="w-6 h-6 text-white" />
                          </div>
                        </foreignObject>
                      </g>

                      {/* Label Text - Optimized for readability without truncation */}
                      <text
                        x="0"
                        y="34"
                        fill={segment.textColor || '#FFFFFF'}
                        textAnchor="middle"
                        className="font-black tracking-tight drop-shadow-md"
                        style={{
                          fontSize: numSegments > 8 ? '11px' : numSegments > 6 ? '12.5px' : '14px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {segment.label.length > 18
                          ? segment.label.slice(0, 16) + '…'
                          : segment.label}
                      </text>

                      {/* Subtext or Value Pill */}
                      {segment.prizeValue && (
                        <text
                          x="0"
                          y="48"
                          fill="#FEF08A"
                          textAnchor="middle"
                          className="font-bold text-[9px] tracking-normal"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
                        >
                          {segment.prizeValue}
                        </text>
                      )}
                    </g>
                  </g>

                  {/* Rim Pegs */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Inner Ring Separator */}
            <circle
              cx="250"
              cy="250"
              r="48"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              opacity="0.9"
            />
          </g>

          {/* STATIC CENTER HUB & JEWEL */}
          <circle
            cx="250"
            cy="250"
            r="44"
            fill="url(#rimGold)"
            stroke="#FFFFFF"
            strokeWidth="3"
            filter="url(#pointerShadow)"
          />
          <circle
            cx="250"
            cy="250"
            r="32"
            fill="url(#centerJewel)"
            stroke="#FEF08A"
            strokeWidth="2"
          />
          {/* Inner Golden Star in Center Hub */}
          <path
            d="M 250 234 L 254 245 L 265 246 L 257 253 L 260 264 L 250 258 L 240 264 L 243 253 L 235 246 L 246 245 Z"
            fill="#FEF08A"
            opacity="0.9"
          />
          <circle cx="244" cy="242" r="3" fill="#FFFFFF" opacity="0.6" />
        </svg>
      </div>

      {/* Tactile 3D "SPIN" Button */}
      <div className="mt-4 sm:mt-6 w-full flex flex-col items-center">
        <button
          id="btn-main-spin"
          type="button"
          disabled={isSpinning || (spinsLeft <= 0 && !config.testRiggedSegmentId)}
          onClick={startSpin}
          className={`relative group px-10 py-3.5 sm:px-14 sm:py-4 rounded-full font-black text-lg sm:text-xl tracking-wider uppercase text-white shadow-xl transition-all duration-200 transform ${
            isSpinning
              ? 'opacity-80 scale-95 cursor-not-allowed bg-slate-600'
              : spinsLeft <= 0 && !config.testRiggedSegmentId
              ? 'opacity-60 cursor-not-allowed bg-slate-500'
              : 'hover:scale-105 active:scale-95 cursor-pointer hover:shadow-2xl'
          }`}
          style={{
            backgroundColor:
              isSpinning || (spinsLeft <= 0 && !config.testRiggedSegmentId)
                ? undefined
                : theme.buttonColor || '#E62129',
            boxShadow:
              !isSpinning && (spinsLeft > 0 || config.testRiggedSegmentId)
                ? `0 10px 25px -3px ${theme.buttonColor || '#E62129'}80, inset 0 2px 4px rgba(255,255,255,0.4)`
                : undefined,
          }}
        >
          {/* Top gloss highlight on button */}
          <span className="absolute top-1 inset-x-4 h-2 bg-white/30 rounded-full blur-[1px] pointer-events-none" />

          <span className="relative flex items-center justify-center gap-2">
            {isSpinning ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>SPINNING...</span>
              </>
            ) : spinsLeft <= 0 && !config.testRiggedSegmentId ? (
              <span>NO SPINS LEFT</span>
            ) : (
              <span>SPIN &amp; WIN</span>
            )}
          </span>
        </button>

        {/* Spins helper label */}
        <p className="mt-2 text-xs font-semibold text-slate-400">
          {spinsLeft > 0 ? (
            <span>
              Tap to spin • <span className="text-indigo-400 font-bold">{spinsLeft}</span> chances remaining
            </span>
          ) : (
            <span className="text-amber-400">Out of spins today. Adjust in settings or reset tokens.</span>
          )}
        </p>
      </div>
    </div>
  );
};
