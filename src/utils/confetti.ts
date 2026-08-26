import confetti from 'canvas-confetti';

/**
 * Fires multi-stage celebratory confetti upon wheel win
 */
export function fireCelebrationConfetti() {
  // First burst: Center explosion with gold, red, blue, and emerald
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#2563eb', '#dc2626', '#f59e0b', '#10b981', '#ffffff', '#8b5cf6'],
    disableForReducedMotion: true,
  });

  // Second burst: Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: ['#f59e0b', '#dc2626', '#3b82f6', '#ffd700'],
      disableForReducedMotion: true,
    });
  }, 250);

  // Third burst: Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: ['#10b981', '#8b5cf6', '#ec4899', '#ffd700'],
      disableForReducedMotion: true,
    });
  }, 400);

  // Fourth burst: Falling star glitter shower
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 120,
      origin: { y: 0.3 },
      shapes: ['star', 'circle'],
      colors: ['#ffd700', '#f59e0b', '#ffffff'],
      gravity: 0.8,
      scalar: 1.2,
      disableForReducedMotion: true,
    });
  }, 650);
}

/**
 * Targeted confetti & gold sparkle burst when claiming a voucher
 */
export function fireClaimSparkles(x: number = 0.5, y: number = 0.5) {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x, y },
    colors: ['#ffd700', '#10b981', '#3b82f6', '#ffffff'],
    scalar: 1.1,
    ticks: 150,
  });
}
