"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
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

export function CameraEmotionProvider({ children, consent }) {
  const allowed = Boolean(consent?.camera);
  const face = useFaceEmotion({ captureFrames: allowed && Boolean(consent?.liveFrames) });
  const { requestCamera: rawRequest, stopCamera } = face;

  // The camera never starts without a parent's consent on the child profile
  const requestCamera = useCallback(() => {
    if (allowed) rawRequest();
  }, [allowed, rawRequest]);

  useEffect(() => {
    if (!allowed) stopCamera();
  }, [allowed, stopCamera]);

  const difficulty = useMemo(
    () => computeDifficultyAdjust(face.emotion, null),
    [face.emotion]
  );

  const value = useMemo(
    () => ({ ...face, requestCamera, allowed, difficulty }),
    [face, requestCamera, allowed, difficulty]
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
      scores: null,
      faceVisible: false,
      allowed: false,
      difficulty: { speedMultiplier: 1, hintLevel: 0 },
      requestCamera: () => {},
      stopCamera: () => {},
    };
  }
  return ctx;
}
