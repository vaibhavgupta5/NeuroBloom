"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { 
  Sparkles, 
  Eye, 
  Smile, 
  Star, 
  Moon, 
  Sun, 
  Apple, 
  Puzzle, 
  Type, 
  Flame,
  Camera
} from "lucide-react";

export default function LiveScreenReplica({ liveSession }) {
  const { 
    liveCoordinates = { x: 50, y: 50 }, 
    gameTitle, 
    isLive, 
    score = 0, 
    targetScore = 5,
    activeGame: rawActiveGame,
    snapshotFrame,
    emotion,
    emotionConfidence
  } = liveSession;

  // Determine current active game code
  const currentGameCode = rawActiveGame || "ball-tracker";
  const [selectedGameOverride, setSelectedGameOverride] = useState(null);
  
  const activeGame = selectedGameOverride || currentGameCode;

  const gameTabs = [
    { id: "ball-tracker", label: "Focus Ball", icon: Flame, color: "#FDE047" },
    { id: "emotion-match", label: "Feelings", icon: Smile, color: "#3ECFB2" },
    { id: "puzzle", label: "Puzzle", icon: Puzzle, color: "#C4B5FD" },
    { id: "word-match", label: "Word Match", icon: Type, color: "#FF7E6B" },
  ];

  const renderGameContent = () => {
    switch (activeGame) {
      case "emotion-match":
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-4 z-10">
            <div className="text-center mt-2">
              <span className="bg-white/10 text-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-nunito font-bold">
                How is this person feeling?
              </span>
            </div>

            {/* Center Emotion Target Face */}
            <div className="relative flex flex-col items-center justify-center my-auto">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-amber-400/20 to-teal-400/20 border-2 border-white/40 flex items-center justify-center shadow-xl backdrop-blur-md"
              >
                <Smile size={64} className="text-[#FFB020]" />
              </motion.div>
            </div>

            {/* Answer Options Row */}
            <div className="w-full grid grid-cols-3 gap-2 mb-4 max-w-xs">
              {["Happy", "Sad", "Angry"].map((opt, i) => (
                <div
                  key={opt}
                  className={`py-2 px-1 rounded-xl text-center font-nunito font-bold text-xs border transition-all ${
                    i === 0
                      ? "bg-[#3ECFB2]/30 border-[#3ECFB2] text-white shadow-md"
                      : "bg-white/10 border-white/20 text-white/70"
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        );

      case "puzzle":
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-4 z-10">
            <div className="text-center mt-2">
              <span className="bg-white/10 text-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-nunito font-bold">
                Find the matching shape!
              </span>
            </div>

            {/* Silhouette Target Slot */}
            <div className="relative flex items-center justify-center my-auto">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-black/40 border-2 border-dashed border-white/40 flex items-center justify-center shadow-inner">
                <Star size={64} fill="currentColor" className="text-white/20" />
              </div>
            </div>

            {/* Shape Options Row */}
            <div className="w-full flex justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-[#3ECFB2] flex items-center justify-center shadow-lg">
                <Star size={28} fill="currentColor" className="text-[#FFB020]" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center opacity-60">
                <Moon size={28} fill="currentColor" className="text-[#C4B5FD]" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center opacity-60">
                <Sun size={28} fill="currentColor" className="text-[#FF7E6B]" />
              </div>
            </div>
          </div>
        );

      case "word-match":
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-4 z-10">
            <div className="text-center mt-2">
              <span className="bg-white/10 text-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-nunito font-bold">
                What object is this?
              </span>
            </div>

            {/* Picture Card Display */}
            <div className="relative flex items-center justify-center my-auto">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white/15 border-2 border-white/30 flex items-center justify-center shadow-xl backdrop-blur-md"
              >
                <Apple size={64} className="text-[#FF7E6B]" />
              </motion.div>
            </div>

            {/* Word AAC Buttons */}
            <div className="w-full space-y-1.5 mb-3 max-w-xs">
              {["Apple", "Banana", "Dog"].map((word, i) => (
                <div
                  key={word}
                  className={`py-1.5 px-3 rounded-xl text-center font-nunito font-bold text-xs border ${
                    i === 0
                      ? "bg-[#3ECFB2]/30 border-[#3ECFB2] text-white shadow-sm"
                      : "bg-white/10 border-white/20 text-white/70"
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        );

      case "ball-tracker":
      default:
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-4 z-10">
            <div className="text-center mt-2">
              <span className="bg-white/10 text-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-nunito font-bold">
                Catch the glowing ball!
              </span>
            </div>

            {/* Floating Target Ball */}
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
          </div>
        );
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-[0_8px_32px_rgba(62,207,178,0.12)] flex flex-col h-full relative overflow-hidden">
      {/* Top Mirror Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-3">
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

      {/* Game Selector Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {gameTabs.map((tab) => {
          const isActive = activeGame === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedGameOverride(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-dm-sans text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? "bg-[#1B2D3E] text-white border-[#1B2D3E] shadow-sm"
                  : "bg-white/50 text-[#8FA3B1] border-white/70 hover:bg-white hover:text-[#1B2D3E]"
              }`}
            >
              <Icon size={14} style={{ color: isActive ? tab.color : undefined }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Screen Replica Stage */}
      <div className="relative flex-1 min-h-[300px] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl border-2 border-white/40 shadow-inner overflow-hidden flex flex-col justify-between">
        {/* Stage Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3ECFB2_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        {/* Live Active Game Title Badge */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-[#1B2D3E]">
          <SvgIconBadge type="focus" size={14} variant="amber" />
          <span>{gameTitle || gameTabs.find(t => t.id === activeGame)?.label || "Active Game"}</span>
        </div>

        {/* Live Score Counter Badge */}
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white shadow-sm flex items-center gap-1 text-xs font-bold text-[#3ECFB2]">
          <span>{score} / {targetScore || 5}</span>
          <SvgIconBadge type="star" size={12} variant="amber" />
        </div>

        {/* Game Stage Specific Content */}
        {renderGameContent()}

        {/* Touch Cursor Ripple Indicator for Child Action */}
        {isLive !== false && (
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
              repeatDelay: 0.4,
            }}
            className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-[#3ECFB2] bg-[#3ECFB2]/20 pointer-events-none z-20"
          />
        )}

        {/* Idle overlay */}
        {isLive === false && (
          <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-6">
            <Eye size={28} className="text-[#3ECFB2]/60 mb-2" />
            <p className="font-nunito font-bold text-white/90 text-sm">
              Waiting for a live session…
            </p>
            <p className="font-dm-sans text-white/50 text-xs mt-1">
              The mirror activates when the child starts a game
            </p>
          </div>
        )}

        {/* Footer Target Position */}
        <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-md text-white/90 px-3 py-0.5 rounded-full text-[11px] font-dm-sans z-20">
          🎯 Touch position: ({Math.round(liveCoordinates.x)}%, {Math.round(liveCoordinates.y)}%)
        </div>

        {/* Camera Observation PIP Window */}
        <div className="absolute bottom-3 right-3 z-30 w-24 sm:w-28 h-20 sm:h-24 bg-slate-950/90 rounded-2xl border-2 border-[#3ECFB2] shadow-xl overflow-hidden flex flex-col items-center justify-center p-0.5 group">
          {snapshotFrame ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={snapshotFrame}
              alt="Child Live Observation Stream"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-1">
              <div className="relative mb-0.5">
                <Camera size={18} className="text-[#3ECFB2] animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#3ECFB2] rounded-full animate-ping" />
              </div>
              <span className="font-dm-sans text-[9px] font-extrabold text-[#3ECFB2] uppercase tracking-tighter leading-tight">
                Camera Feed
              </span>
              <span className="font-dm-sans text-[8px] text-white/60">AI Observing</span>
            </div>
          )}

          {/* Emotion Badge Pill */}
          <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-[#3ECFB2]/50 text-[9px] font-bold text-[#3ECFB2] flex items-center gap-0.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECFB2] animate-pulse" />
            <span className="capitalize">{emotion || "Active"}</span>
            {emotionConfidence > 0 ? (
              <span className="text-white/80">({Math.round(emotionConfidence * 100)}%)</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
