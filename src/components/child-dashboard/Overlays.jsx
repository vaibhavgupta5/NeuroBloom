"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause } from "lucide-react";
import { useChildStore } from "../../stores/useChildStore";
import { useSpeak } from "../../hooks/useSpeak";
import { SvgIconBadge } from "../ui/SvgIconBadge";

export function StickerOverlay() {
  const sticker = useChildStore((s) => s.activeSticker);
  const { speak } = useSpeak();

  useEffect(() => {
    if (sticker?.text) speak(sticker.text);
  }, [sticker, speak]);

  return (
    <AnimatePresence>
      {sticker && (
        <motion.div
          key={sticker.key}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="status"
          className="fixed top-24 inset-x-0 z-[70] flex justify-center pointer-events-none px-4"
        >
          <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-4 shadow-[var(--shadow-raised)]">
            <SvgIconBadge type={sticker.iconKey || "star"} size={36} variant="amber" />
            <span className="font-nunito font-extrabold text-2xl text-ink">{sticker.text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PauseOverlay() {
  const paused = useChildStore((s) => s.remotePaused);
  const activeGame = useChildStore((s) => s.activeGame);
  if (!paused || !activeGame) return null;
  return (
    <div className="fixed inset-0 z-[65] bg-ink/30 flex items-center justify-center p-6" role="status">
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-[var(--shadow-raised)]">
        <Pause size={48} className="mx-auto text-teal-700" aria-hidden />
        <p className="font-nunito font-extrabold text-3xl text-ink mt-4">Little pause</p>
        <p className="font-dm-sans text-lg text-ink-soft mt-2">We&apos;ll keep going soon.</p>
      </div>
    </div>
  );
}

export function BreakOffer() {
  const { breakOffer, dismissBreak, takeBreak } = useChildStore();
  const { speak } = useSpeak();

  useEffect(() => {
    if (breakOffer) speak("Would you like a break?");
  }, [breakOffer, speak]);

  if (!breakOffer) return null;
  return (
    <div className="fixed inset-0 z-[66] bg-ink/30 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Would you like a break?">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-raised)]">
        <p className="font-nunito font-extrabold text-3xl text-ink">Want a break?</p>
        <p className="font-dm-sans text-lg text-ink-soft mt-2">You can breathe in the Calm Corner, then come back.</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button onClick={takeBreak} className="h-20 rounded-2xl bg-lavender-50 ring-2 ring-lavender-300 font-nunito font-bold text-xl text-lavender-700">Break</button>
          <button onClick={dismissBreak} className="h-20 rounded-2xl bg-white ring-2 ring-line font-nunito font-bold text-xl text-ink">Keep going</button>
        </div>
      </div>
    </div>
  );
}
