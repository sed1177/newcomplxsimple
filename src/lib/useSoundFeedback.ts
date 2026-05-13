"use client";

import { useCallback } from "react";

function beep(frequency: number, duration: number, gain: number) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sound-feedback") === "on";
}

export function useSoundFeedback() {
  const playCorrect = useCallback(() => {
    if (!isSoundEnabled()) return;
    beep(523, 0.12, 0.3); // C5
    setTimeout(() => beep(659, 0.15, 0.25), 100); // E5
  }, []);

  const playWrong = useCallback(() => {
    if (!isSoundEnabled()) return;
    beep(220, 0.2, 0.25); // A3 low buzz
  }, []);

  const playComplete = useCallback(() => {
    if (!isSoundEnabled()) return;
    beep(523, 0.1, 0.3);
    setTimeout(() => beep(659, 0.1, 0.25), 100);
    setTimeout(() => beep(784, 0.2, 0.3), 200); // G5
  }, []);

  return { playCorrect, playWrong, playComplete };
}
