"use client";

import { MotionConfig } from "framer-motion";
import TopStrip from "./TopStrip";
import BottomNav from "./BottomNav";
import { StickerOverlay, PauseOverlay, BreakOffer } from "./Overlays";
import { useChildStore } from "../../stores/useChildStore";

export default function ChildLayout({ children }) {
  const profile = useChildStore((s) => s.child.sensoryProfile);
  const motion = profile?.motion || "reduced";

  return (
    <MotionConfig reducedMotion={motion === "full" ? "user" : "always"}>
      <div
        data-motion={motion}
        data-palette={profile?.calmPalette ? "calm" : "standard"}
        className="min-h-dvh bg-canvas flex flex-col"
      >
        <TopStrip />
        <main className="flex-1 flex flex-col pt-20 pb-28 md:pb-10 md:pl-32 md:pr-8">{children}</main>
        <BottomNav />
        <StickerOverlay />
        <PauseOverlay />
        <BreakOffer />
      </div>
    </MotionConfig>
  );
}
