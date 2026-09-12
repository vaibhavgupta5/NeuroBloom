"use client";

import { createContext, useContext, useMemo } from "react";
import { useFaceEmotion } from "../hooks/useFaceEmotion";
import { computeDifficultyAdjust } from "../lib/emotionUtils";

/**
 * Mounts the camera emotion pipeline ONCE and shares it with the child
 * dashboard (games + the floating badge) via useCameraEmotion().
 *
 * `difficulty` is derived from the current smoothed emotion; games also blend
 * in their own gameplay accuracy when calling computeDifficultyAdjust.
 */
const CameraEmotionContext = createContext(null);

export function CameraEmotionProvider({ children }) {
  const face = useFaceEmotion();

  const difficulty = useMemo(
    () => computeDifficultyAdjust(face.emotion, null),
    [face.emotion]
  );

  const value = useMemo(
    () => ({ ...face, difficulty }),
    [face.status, face.emotion, face.emotionConfidence, face.snapshot, difficulty, face.requestCamera, face.stopCamera]
  );

  return (
    <CameraEmotionContext.Provider value={value}>
      {children}
    </CameraEmotionContext.Provider>
  );
}

export function useCameraEmotion() {
  const ctx = useContext(CameraEmotionContext);
  if (!ctx) {
    // Safe fallback so a missing provider never crashes a game —
    // the game runs in auto mode (gameplay-only adaptation).
    return {
      status: "idle",
      emotion: null,
      emotionConfidence: 0,
      snapshot: null,
      difficulty: { speedMultiplier: 1, hintLevel: 0 },
      requestCamera: () => {},
      stopCamera: () => {},
    };
  }
  return ctx;
}
