"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "../../stores/useChildStore";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { SvgIconBadge } from "../ui/SvgIconBadge";

export default function StickerOverlay() {
  const activeSticker = useChildStore((s) => s.activeSticker);
  const remotePaused = useChildStore((s) => s.remotePaused);

  useEffect(() => {
    if (activeSticker) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 },
        colors: ["#3ECFB2", "#FFB020", "#FF7E6B"],
      });
    }
  }, [activeSticker]);

  return (
    <>
      {/* Remote Pause Screen Overlay */}
      <AnimatePresence>
        {remotePaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1B2D3E]/80 backdrop-blur-md flex flex-col items-center justify-center text-white px-6 text-center"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <SvgIconBadge type="heart" size={40} variant="ghost" />
            </div>
            <h2 className="font-nunito font-bold text-3xl md:text-4xl mb-2">
              Time for a Gentle Pause 🌸
            </h2>
            <p className="font-dm-sans text-lg text-white/80 max-w-md">
              Take a deep breath in... and out. Your parent has triggered a quick calm break.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Parent Sticker Toast */}
      <AnimatePresence>
        {activeSticker && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: -40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[90] bg-white/95 backdrop-blur-xl border-4 border-[#3ECFB2] px-6 py-4 rounded-3xl shadow-[0_12px_40px_rgba(62,207,178,0.3)] flex items-center gap-4 pointer-events-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E8FAF6] flex items-center justify-center shadow-inner">
              <SvgIconBadge type={activeSticker.iconKey || "star"} size={32} variant="amber" />
            </div>
            <div>
              <div className="font-dm-sans text-xs font-bold text-[#3ECFB2] uppercase tracking-wider">
                Encouragement from Mom & Dad
              </div>
              <div className="font-nunito font-bold text-xl md:text-2xl text-[#1B2D3E]">
                {activeSticker.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
