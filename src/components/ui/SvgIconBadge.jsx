"use client";

import React from "react";
import { 
  Smile, 
  Meh, 
  Frown, 
  Sparkles, 
  Flame, 
  Star, 
  Trophy, 
  Award, 
  Type, 
  Puzzle, 
  Crosshair, 
  Calendar, 
  MessageCircle, 
  Palette, 
  User, 
  ShieldAlert,
  Heart,
  Zap,
  CheckCircle2
} from "lucide-react";

export function SvgIconBadge({ type, size = 24, variant = "teal", className = "" }) {
  const getIcon = () => {
    switch (type) {
      // Game Modules
      case "emotion":
      case "feelings":
      case "🎭":
        return <Smile size={size} className="text-[#3ECFB2]" strokeWidth={2.2} />;
      case "word":
      case "words":
      case "🔤":
        return <Type size={size} className="text-[#FF7E6B]" strokeWidth={2.2} />;
      case "puzzle":
      case "puzzles":
      case "🧩":
        return <Puzzle size={size} className="text-[#C4B5FD]" strokeWidth={2.2} />;
      case "focus":
      case "ball":
      case "🎯":
        return <Crosshair size={size} className="text-[#FFB020]" strokeWidth={2.2} />;
      case "schedule":
      case "📅":
        return <Calendar size={size} className="text-[#4A90D9]" strokeWidth={2.2} />;

      // Moods
      case "happy":
      case "😊":
      case "😄":
        return <Smile size={size} className="text-[#3ECFB2]" strokeWidth={2.2} />;
      case "neutral":
      case "😐":
        return <Meh size={size} className="text-[#FFB020]" strokeWidth={2.2} />;
      case "sad":
      case "overwhelmed":
      case "😔":
        return <Frown size={size} className="text-[#FF7E6B]" strokeWidth={2.2} />;

      // Achievements & Streaks
      case "streak":
      case "flame":
      case "🔥":
        return <Flame size={size} className="text-[#FF7E6B]" strokeWidth={2.2} />;
      case "star":
      case "⭐":
      case "🌟":
        return <Star size={size} className="text-[#FFB020]" fill="currentColor" strokeWidth={1.5} />;
      case "trophy":
      case "top_scorer":
      case "🏅":
        return <Trophy size={size} className="text-[#FFB020]" strokeWidth={2} />;
      case "master":
      case "award":
        return <Award size={size} className="text-[#4A90D9]" strokeWidth={2} />;

      // Avatars & Actions
      case "child":
      case "🧒":
        return <User size={size} className="text-[#1A9E8C]" strokeWidth={2} />;
      case "speech":
      case "🗣️":
        return <MessageCircle size={size} className="text-[#4A90D9]" strokeWidth={2} />;
      case "palette":
        return <Palette size={size} className="text-[#C4B5FD]" strokeWidth={2} />;
      case "alert":
        return <ShieldAlert size={size} className="text-[#FF7E6B]" strokeWidth={2} />;
      case "heart":
        return <Heart size={size} className="text-[#FF7E6B]" fill="currentColor" strokeWidth={1.5} />;
      case "zap":
        return <Zap size={size} className="text-[#FFB020]" fill="currentColor" strokeWidth={1.5} />;
      default:
        return <Sparkles size={size} className="text-[#3ECFB2]" strokeWidth={2} />;
    }
  };

  const variantStyles = {
    teal: "bg-[#3ECFB2]/15 border-[#3ECFB2]/30 text-[#1A9E8C]",
    coral: "bg-[#FF7E6B]/15 border-[#FF7E6B]/30 text-[#FF7E6B]",
    amber: "bg-[#FFB020]/15 border-[#FFB020]/30 text-[#D98200]",
    lavender: "bg-[#C4B5FD]/20 border-[#C4B5FD]/40 text-[#7C3AED]",
    blue: "bg-[#4A90D9]/15 border-[#4A90D9]/30 text-[#2563EB]",
    ghost: "bg-white/60 border-white/80 shadow-sm",
  };

  return (
    <div
      className={`inline-flex items-center justify-center p-2 rounded-2xl border backdrop-blur-md transition-all ${
        variantStyles[variant] || variantStyles.teal
      } ${className}`}
    >
      {getIcon()}
    </div>
  );
}
