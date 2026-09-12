"use client";

import { useParentStore } from "../../../stores/useParentStore";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { Eye, ChevronRight } from "lucide-react";

export default function LiveObserverBanner() {
  const { liveSession, setActiveTab } = useParentStore();

  return (
    <div className="bg-gradient-to-r from-[#3ECFB2]/20 via-[#E8FAF6] to-[#4A90D9]/20 border-2 border-[#3ECFB2]/50 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
      <div className="flex items-start sm:items-center gap-3">
        <div className="relative shrink-0 mt-1 sm:mt-0">
          <SvgIconBadge type="focus" size={24} variant="teal" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#3ECFB2] rounded-full animate-ping" />
        </div>
        <div className="min-w-0">
          <div className="font-nunito font-extrabold text-sm sm:text-base text-[#1B2D3E] leading-snug">
            Live Session Active — {liveSession.childName || "Arjun"} is playing {liveSession.gameTitle || "Focus Ball"}
          </div>
          <div className="font-dm-sans text-xs text-[#56728A] flex flex-wrap items-center gap-2 mt-1">
            <span>Focus: <strong className="text-[#1A9E8C]">{liveSession.focusScore || 0}%</strong></span>
            <span>·</span>
            <span>Speed: <strong className="text-[#1A9E8C]">{liveSession.speedMultiplier || 1.0}x</strong></span>
            <span>·</span>
            <span>Elapsed: <strong className="text-[#1A9E8C]">{liveSession.elapsedSeconds || 0}s</strong></span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setActiveTab("live")}
        className="w-full sm:w-auto bg-[#3ECFB2] text-white px-4 py-2.5 rounded-xl font-nunito font-bold text-xs sm:text-sm shadow-[0_3px_0_#1A9E8C] hover:bg-[#1A9E8C] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 shrink-0"
      >
        <Eye size={16} /> Open Live Command Center <ChevronRight size={14} />
      </button>
    </div>
  );
}
