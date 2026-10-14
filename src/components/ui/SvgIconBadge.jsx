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
        return <Smile size={size} className="text-teal-700" strokeWidth={2.2} />;
      case "word":
      case "words":
      case "🔤":
        return <Type size={size} className="text-coral-700" strokeWidth={2.2} />;
      case "puzzle":
      case "puzzles":
      case "🧩":
        return <Puzzle size={size} className="text-lavender-300" strokeWidth={2.2} />;
      case "focus":
      case "ball":
      case "🎯":
        return <Crosshair size={size} className="text-amber-400" strokeWidth={2.2} />;
      case "schedule":
      case "📅":
        return <Calendar size={size} className="text-blue-700" strokeWidth={2.2} />;

      // Moods
      case "happy":
      case "😊":
      case "😄":
        return <Smile size={size} className="text-teal-700" strokeWidth={2.2} />;
      case "neutral":
      case "😐":
        return <Meh size={size} className="text-amber-400" strokeWidth={2.2} />;
      case "sad":
      case "overwhelmed":
      case "😔":
        return <Frown size={size} className="text-coral-700" strokeWidth={2.2} />;

      // Achievements & Streaks
      case "streak":
      case "flame":
      case "🔥":
        return <Flame size={size} className="text-coral-700" strokeWidth={2.2} />;
      case "star":
      case "⭐":
      case "🌟":
        return <Star size={size} className="text-amber-400" fill="currentColor" strokeWidth={1.5} />;
      case "trophy":
      case "top_scorer":
      case "🏅":
        return <Trophy size={size} className="text-amber-400" strokeWidth={2} />;
      case "master":
      case "award":
        return <Award size={size} className="text-blue-700" strokeWidth={2} />;

      // Avatars & Actions
      case "child":
      case "🧒":
        return <User size={size} className="text-teal-700" strokeWidth={2} />;
      case "speech":
      case "🗣️":
        return <MessageCircle size={size} className="text-blue-700" strokeWidth={2} />;
      case "palette":
        return <Palette size={size} className="text-lavender-300" strokeWidth={2} />;
      case "alert":
        return <ShieldAlert size={size} className="text-coral-700" strokeWidth={2} />;
      case "heart":
        return <Heart size={size} className="text-coral-700" fill="currentColor" strokeWidth={1.5} />;
      case "zap":
        return <Zap size={size} className="text-amber-400" fill="currentColor" strokeWidth={1.5} />;
      default:
        return <Sparkles size={size} className="text-teal-700" strokeWidth={2} />;
    }
  };

  const variantStyles = {
    teal: "bg-teal-400/15 border-teal-400/30 text-teal-700",
    coral: "bg-coral-400/15 border-coral-400/30 text-coral-700",
    amber: "bg-amber-400/15 border-amber-400/30 text-[#D98200]",
    lavender: "bg-lavender-300/20 border-lavender-300/40 text-[#7C3AED]",
    blue: "bg-blue-400/15 border-blue-400/30 text-[#2563EB]",
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
