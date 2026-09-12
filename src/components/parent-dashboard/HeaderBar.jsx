"use client";

import { useParentStore } from "../../stores/useParentStore";
import { useRealtimeSync } from "../../hooks/useRealtimeSync";
import { Hand, Bell, Eye } from "lucide-react";

export default function HeaderBar() {
  const { parent, liveSession, setActiveTab } = useParentStore();

  useRealtimeSync();

  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = today.toLocaleDateString('en-GB', options);

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-white/60 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
      {/* Left */}
      <div className="min-w-0">
        <h1 className="font-nunito font-bold text-lg md:text-2xl text-[#1B2D3E] leading-tight flex items-center gap-1.5 truncate">
          <span>Good morning, {parent.name}</span>
          <Hand size={20} className="inline-block text-[#FFB020] shrink-0" />
        </h1>
        <div className="font-dm-sans text-xs md:text-sm text-[#8FA3B1] truncate">
          {dateString}
        </div>
      </div>

      {/* Center / Right: Live Tracking Pill if session active */}
      {liveSession?.isLive && (
        <button
          onClick={() => setActiveTab("live")}
          className="flex items-center gap-1.5 bg-[#E8FAF6] border-2 border-[#3ECFB2] px-3 py-1 rounded-full text-xs font-bold text-[#1A9E8C] shadow-sm hover:scale-105 transition-all shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-[#3ECFB2] animate-ping" />
          <Eye size={14} /> <span className="hidden sm:inline">Live Observer</span>
        </button>
      )}

      {/* Right Icons */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <button className="relative text-[#8FA3B1] hover:text-[#1B2D3E] transition-colors p-1">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#FF7E6B] rounded-full text-white text-[8px] font-bold flex items-center justify-center border border-white">
            2
          </span>
        </button>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#4A90D9]/20 flex items-center justify-center text-[#4A90D9] font-bold text-xs md:text-sm border-2 border-[#3ECFB2] cursor-pointer">
          {parent.avatarInitials}
        </div>
      </div>
    </header>
  );
}
