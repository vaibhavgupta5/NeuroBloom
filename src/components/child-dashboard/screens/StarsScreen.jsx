"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { Flame, Puzzle, Smile, MessageCircle, Star, Trophy, Palette } from "lucide-react";

export default function StarsScreen() {
  const { child } = useChildStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = child.stars;
    const timer = setInterval(() => {
      start += 1;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 40); // 40ms per tick ~ 1.3 seconds for 34 stars

    return () => clearInterval(timer);
  }, [child.stars]);

  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayIndex = (currentDayIndex + 6) % 7; // Map so 0 is Mon, 6 is Sun

  const weekStars = [
    { day: "Mon", stars: 3, today: todayIndex === 0 },
    { day: "Tue", stars: 2, today: todayIndex === 1 },
    { day: "Wed", stars: 3, today: todayIndex === 2 },
    { day: "Thu", stars: 1, today: todayIndex === 3 },
    { day: "Fri", stars: 0, today: todayIndex === 4 },
    { day: "Sat", stars: 0, today: todayIndex === 5 },
    { day: "Sun", stars: 0, today: todayIndex === 6 },
  ];

  const badges = [
    { emoji: "🔥", label: "7 Days in a Row!" },
    { emoji: "🧩", label: "Puzzle Expert!" },
    { emoji: "😊", label: "Happy Explorer!" },
    { emoji: "🗣️", label: "First Words!" },
    { emoji: "⭐", label: "Top Scorer!" },
    { emoji: "🌟", label: "Week Champion!" },
  ];

  const badgeIconMap = {
    '🔥': <Flame size={32} className="text-[#FF7E6B]" />,
    '🧩': <Puzzle size={32} className="text-[#4A90D9]" />,
    '😊': <Smile size={32} className="text-[#3ECFB2]" />,
    '🗣️': <MessageCircle size={32} className="text-[#C4B5FD]" />,
    '⭐': <Star size={32} className="text-[#FFB020]" fill="currentColor" />,
    '🌟': <Star size={32} className="text-[#FFB020]" />,
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto px-4 pb-12 md:pb-8 h-full">
      <h1 className="font-nunito font-bold text-[28px] md:text-[36px] text-center pt-4 md:pt-6 text-[#1B2D3E]">
        Your Stars <Star size={32} fill="currentColor" className="inline-block text-[#FFB020] ml-2 pb-1" />
      </h1>

      <div className="flex flex-col items-center justify-center my-6 md:my-8">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="font-sora font-bold text-[72px] md:text-[100px] text-[#3ECFB2] leading-none">{count}</span>
          <span className="animate-pulse text-[#FFB020]"><Star size={64} fill="currentColor" /></span>
        </div>
        <p className="font-dm-sans text-[16px] md:text-[18px] text-[#8FA3B1] mt-2">stars collected!</p>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 md:p-8 border border-white/80 shadow-sm mb-6 md:mb-8 flex justify-between md:justify-around w-full max-w-3xl mx-auto">
        {weekStars.map((d, i) => (
          <div key={i} className={`flex flex-col items-center rounded-2xl p-2 md:p-4 min-w-[40px] md:min-w-[60px] ${d.today ? "border-2 border-[#3ECFB2] bg-[#3ECFB2]/10" : "hover:bg-white/50 transition-colors cursor-pointer"}`}>
            <span className="font-dm-sans text-[12px] md:text-[16px] text-[#1B2D3E] font-bold mb-2">{d.day}</span>
            <div className="flex flex-col gap-0.5 md:gap-1 items-center justify-end h-[48px] md:h-[60px] mt-4">
              {d.stars > 0 ? (
                Array(d.stars).fill(0).map((_, idx) => <Star key={idx} size={16} fill="currentColor" className="text-[#FFB020] mx-0.5" />)
              ) : (
                <span className="text-[12px] md:text-[16px] text-[#8FA3B1] opacity-50">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-nunito font-medium text-[18px] md:text-[24px] text-[#1B2D3E] mb-3 md:mb-4 text-center">
        You&apos;ve earned these! <Trophy size={24} className="inline-block text-[#FFB020] ml-2 pb-1" />
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 mb-6 md:mb-8 w-full">
        {badges.map((badge, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: index * 0.08 }}
            className="rounded-2xl p-3 bg-white/60 backdrop-blur-sm border border-white/70 flex flex-col items-center gap-2 shadow-sm min-h-[90px] justify-center"
          >
            <div className="mb-1">{badgeIconMap[badge.emoji] || badge.emoji}</div>
            <span className="text-[10px] font-dm-sans font-bold text-center text-[#1B2D3E] leading-tight">
              {badge.label}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="font-nunito font-bold text-[20px] text-[#3ECFB2] text-center mt-auto">
        You&apos;re doing amazing, {child.name}! <Palette size={20} className="inline-block text-[#3ECFB2] ml-1 pb-1" />
      </p>
    </div>
  );
}
