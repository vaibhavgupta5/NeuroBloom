"use client";

import { useChildStore } from "../../stores/useChildStore";
import Link from "next/link";
import { Users, Flame, Leaf, Baby } from "lucide-react";

export default function TopStrip() {
  const { child } = useChildStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/60 px-4 md:px-6 h-16 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="flex items-center text-[#3ECFB2]"><Leaf size={24} /></span>
        <h1 className="font-nunito font-black text-[#3ECFB2] text-xl tracking-tight hidden sm:block">
          NeuroBloom
        </h1>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/dashboard/parent" className="bg-white/50 border border-[#3ECFB2]/30 text-[#1A9E8C] hover:bg-[#E8FAF6] transition-colors rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1.5">
          <Users size={16} /> <span className="hidden sm:inline">Parent View</span>
        </Link>
        <div className="bg-[#FFF0ED] border border-[#FF7E6B]/30 text-[#FF7E6B] rounded-xl px-3 py-1.5 text-sm font-bold shadow-sm flex items-center gap-1">
          <Flame size={16} fill="currentColor" /> <span className="hidden sm:inline">{child.streak}</span>
        </div>
        
        {/* Child Profile */}
        <div className="flex items-center gap-2 bg-white/80 border border-white/60 pl-1.5 pr-3 py-1 rounded-2xl shadow-sm">
          <div className="bg-[#E8FAF6] rounded-xl w-8 h-8 flex items-center justify-center text-sm shadow-inner border border-white/80 text-[#1A9E8C]">
            <Baby size={16} />
          </div>
          <div className="font-nunito font-bold text-[#1B2D3E] text-sm hidden sm:block">
            {child.name}
          </div>
        </div>
      </div>
    </div>
  );
}
