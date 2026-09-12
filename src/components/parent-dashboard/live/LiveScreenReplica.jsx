"use client";

import { motion } from "framer-motion";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { Sparkles, Eye } from "lucide-react";

export default function LiveScreenReplica({ liveSession }) {
  const { liveCoordinates = { x: 50, y: 50 }, gameTitle, isLive, score, targetScore } = liveSession;

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-[0_8px_32px_rgba(62,207,178,0.12)] flex flex-col h-full relative overflow-hidden">
      {/* Top Mirror Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-4">
        <div className="flex items-center gap-2">
          <Eye size={20} className="text-[#3ECFB2] animate-pulse" />
          <h3 className="font-nunito font-bold text-lg text-[#1B2D3E]">
            Digital Screen Mirror
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-[#E8FAF6] text-[#1A9E8C] px-3 py-1 rounded-full text-xs font-bold font-dm-sans border border-[#3ECFB2]/30">
          <span className="w-2 h-2 rounded-full bg-[#3ECFB2] animate-ping" /> Live Mirroring
        </div>
      </div>

      {/* Screen Replica Stage */}
      <div className="relative flex-1 min-h-[280px] bg-gradient-to-br from-slate-900/90 to-slate-800 rounded-2xl border-2 border-white/40 shadow-inner overflow-hidden flex items-center justify-center">
        {/* Stage Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3ECFB2_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        {/* Live Active Game Badge */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2 text-xs font-bold text-[#1B2D3E]">
          <SvgIconBadge type="focus" size={16} variant="amber" />
          <span>{gameTitle || "Focus Ball Game"}</span>
        </div>

        {/* Live Score Counter Badge */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-[#3ECFB2]">
          <span>{score} / {targetScore}</span>
          <SvgIconBadge type="star" size={14} variant="amber" />
        </div>

        {/* Target Mirror Indicator */}
        <motion.div
          animate={{
            left: `${liveCoordinates.x || 50}%`,
            top: `${liveCoordinates.y || 50}%`,
          }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.8,
          }}
          className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full bg-[#FDE047] shadow-[0_0_30px_rgba(253,224,71,0.9)] border-2 border-white flex items-center justify-center text-white pointer-events-none z-10"
        >
          <Sparkles size={24} className="text-white" />
        </motion.div>

        {/* Simulated Child Touch Ripple */}
        <motion.div
          animate={{
            left: `${liveCoordinates.x || 50}%`,
            top: `${liveCoordinates.y || 50}%`,
            scale: [0.5, 1.8, 0],
            opacity: [0.8, 0.4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-[#3ECFB2] bg-[#3ECFB2]/20 pointer-events-none z-0"
        />

        {/* Footer Status */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white/90 px-4 py-1 rounded-full text-xs font-dm-sans">
          🎯 Target position: ({Math.round(liveCoordinates.x)}%, {Math.round(liveCoordinates.y)}%)
        </div>
      </div>
    </div>
  );
}
