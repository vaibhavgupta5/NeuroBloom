"use client";

import { useCallback, useRef } from "react";
import { useChildStore } from "../stores/useChildStore";

const TONES = {
  tap: { from: 520, to: 360, dur: 0.08, gain: 0.12 },
  success: { from: 520, to: 780, dur: 0.18, gain: 0.12 },
  gentle: { from: 330, to: 300, dur: 0.15, gain: 0.08 },
};

/** Soft synthesized UI sounds; silent when the child's profile turns sound effects off. */
export function useSoundEffect() {
  const enabled = useChildStore((s) => s.child.sensoryProfile?.sfx);
  const ctxRef = useRef(null);

  return useCallback(
    (kind = "tap") => {
      if (!enabled) return;
      try {
        if (!ctxRef.current) {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return;
          ctxRef.current = new Ctx();
        }
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") ctx.resume();
        const t = TONES[kind] || TONES.tap;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(t.from, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(t.to, ctx.currentTime + t.dur);
        gain.gain.setValueAtTime(t.gain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t.dur);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + t.dur);
      } catch {
        // audio unavailable
      }
    },
    [enabled]
  );
}
