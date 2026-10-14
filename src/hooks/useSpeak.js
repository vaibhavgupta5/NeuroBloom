"use client";

import { useCallback, useEffect } from "react";
import { useChildStore } from "../stores/useChildStore";

let cachedVoice;
function pickVoice() {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices() || [];
  if (!voices.length) return null;
  cachedVoice =
    voices.find((v) => /en[-_]IN/i.test(v.lang)) ||
    voices.find((v) => /en[-_](GB|US)/i.test(v.lang) && /female|samantha|google/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    null;
  return cachedVoice;
}

/** Text-to-speech for prompts and labels (Web Speech API), following the child's voice settings. */
export function useSpeak() {
  const enabled = useChildStore((s) => s.child.sensoryProfile?.voice);
  const rate = useChildStore((s) => s.child.sensoryProfile?.voiceRate) || 0.9;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const reset = () => { cachedVoice = undefined; };
    window.speechSynthesis.addEventListener?.("voiceschanged", reset);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", reset);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text, { force = false } = {}) => {
      if ((!enabled && !force) || !text || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = 1.05;
      const voice = pickVoice();
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    },
    [enabled, rate]
  );

  return { speak, voiceOn: Boolean(enabled) };
}
