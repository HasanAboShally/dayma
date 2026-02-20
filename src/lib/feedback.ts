// ============================================================
// Ramadan Companion — Feedback Utilities
// Haptic feedback + audio cues for micro-interactions
// ============================================================

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
