"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Sparkles } from "lucide-react";
import { SvgIconBadge } from "../ui/SvgIconBadge";
import { useCameraEmotion } from "../../context/CameraEmotionContext";
import { EMOTION_META } from "../../lib/emotionUtils";

const DISMISS_KEY = "neurobloom_camera_dismissed";

/**
 * Floating child-side camera status pill. Small, playful, never scary.
 *  - Prompt state: gentle one-time "Allow camera?" card (Allow / No thanks)
 *  - Granted: live emotion chip with the current face color
 *  - Denied/idle: subtle "Auto Mode" chip (difficulty adapts to gameplay only)
 */
export default function CameraEmotionBadge() {
  const { status, emotion, requestCamera } = useCameraEmotion();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const showPrompt =
    !dismissed && (status === "idle" || status === "unsupported") && status !== "requesting";

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // private mode — just hide for this visit
    }
    setDismissed(true);
  };

  const meta = emotion ? EMOTION_META[emotion] : null;

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col gap-2 max-w-[240px]">
      {/* One-time permission prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="bg-white/90 backdrop-blur-xl border border-[#3ECFB2]/30 rounded-3xl p-4 shadow-[0_8px_32px_rgba(62,207,178,0.18)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-9 h-9 rounded-2xl bg-[#3ECFB2]/15 flex items-center justify-center">
                <Camera size={18} className="text-[#1A9E8C]" />
              </span>
              <p className="font-nunito font-bold text-sm text-[#1B2D3E] leading-tight">
                Can your coach see your smile?
              </p>
            </div>
            <p className="font-dm-sans text-[11px] text-[#8FA3B1] mb-3 leading-snug">
              The camera helps games go at just the right speed for you. Nothing is
              ever recorded.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  dismiss();
                  requestCamera();
                }}
                className="flex-1 bg-[#3ECFB2] text-white font-nunito font-bold text-xs py-2 rounded-xl shadow-[0_3px_0_#1A9E8C] active:translate-y-0.5 active:shadow-[0_1px_0_#1A9E8C] transition-all"
              >
                Yes, allow
              </button>
              <button
                onClick={dismiss}
                className="px-3 bg-white/70 text-[#8FA3B1] font-nunito font-bold text-xs py-2 rounded-xl border border-white/80 active:translate-y-0.5 transition-all"
              >
                No thanks
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status pill */}
      <AnimatePresence>
        {status !== "requesting" && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(27,45,62,0.10)] w-fit"
          >
            {status === "granted" && meta ? (
              <>
                <SvgIconBadge type={meta.iconKey} size={16} variant="ghost" className="!p-1.5 !rounded-xl" />
                <span
                  className="font-nunito font-bold text-xs"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ECFB2] animate-pulse" />
              </>
            ) : status === "granted" ? (
              <>
                <Camera size={14} className="text-[#3ECFB2]" />
                <span className="font-nunito font-bold text-xs text-[#3ECFB2]">
                  Coach watching
                </span>
              </>
            ) : (
              <>
                <CameraOff size={14} className="text-[#8FA3B1]" />
                <span className="font-dm-sans font-bold text-[11px] text-[#8FA3B1]">
                  Auto mode
                </span>
                <Sparkles size={12} className="text-[#FFB020]" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
