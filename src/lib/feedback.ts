// ============================================================
// Ramadan Companion — Feedback Utilities
// Haptic feedback + audio cues + confetti for micro-interactions
// ============================================================

import confetti from "canvas-confetti";

// Ramadan-themed confetti palette
const CONFETTI_COLORS = [
  "#10b981", // emerald
  "#34d399", // light emerald
  "#f59e0b", // amber
  "#fbbf24", // gold
  "#a78bfa", // purple accent
];

/**
 * Fire a celebration confetti burst (canvas-confetti).
 * intensity: "small" (25%), "medium" (50/75%), "big" (100%)
 */
export function fireConfetti(
  intensity: "small" | "medium" | "big" = "big",
): void {
  if (typeof window === "undefined") return;
  try {
    const base =
      intensity === "big" ? 80 : intensity === "medium" ? 45 : 25;
    const spread = intensity === "big" ? 70 : intensity === "medium" ? 55 : 40;

    // Fire from left
    confetti({
      particleCount: base,
      angle: 60,
      spread,
      origin: { x: 0, y: 0.7 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });
    // Fire from right
    confetti({
      particleCount: base,
      angle: 120,
      spread,
      origin: { x: 1, y: 0.7 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });

    if (intensity === "big") {
      // Extra shower from center for 100%
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: CONFETTI_COLORS,
          disableForReducedMotion: true,
        });
      }, 250);
    }
  } catch {
    // Silently fail if canvas-confetti unavailable
  }
}

/**
 * Trigger haptic feedback if the device supports it.
 * Falls back silently on unsupported devices.
 */
export function haptic(style: "light" | "medium" | "heavy" = "light"): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  const patterns: Record<string, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30],
  };
  try {
    navigator.vibrate(patterns[style] || [10]);
  } catch {
    // Silently fail – some browsers restrict vibrate
  }
}

/**
 * Play a very short audio cue. Uses the WebAudio API for
 * zero-latency, no-file-needed sound synthesis.
 */
export function playSound(type: "check" | "complete" | "celebrate"): void {
  if (typeof AudioContext === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case "check":
        osc.frequency.value = 880;
        gain.gain.value = 0.08;
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
        break;
      case "complete":
        osc.frequency.value = 660;
        gain.gain.value = 0.1;
        osc.start();
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.12);
        osc.stop(ctx.currentTime + 0.15);
        break;
      case "celebrate":
        osc.frequency.value = 523;
        gain.gain.value = 0.1;
        osc.start();
        osc.frequency.linearRampToValueAtTime(784, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.35);
        break;
    }

    // Cleanup
    osc.onended = () => {
      gain.disconnect();
      ctx.close();
    };
  } catch {
    // Audio playback failed silently
  }
}
