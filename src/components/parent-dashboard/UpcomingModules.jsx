"use client";

import { motion } from "framer-motion";
import { useParentStore } from "../../stores/useParentStore";
import { staggerContainer, fadeUp, clayHover } from "../../lib/animations";
import { Star, Palette, Type, Puzzle, Gamepad2 } from "lucide-react";

export default function UpcomingModules() {
  const { upcomingModules } = useParentStore();

  const moduleIconMap = {
    emotion: <Palette size={32} className="text-[#4A90D9]" />,
    word: <Type size={32} className="text-[#FF7E6B]" />,
    puzzle: <Puzzle size={32} className="text-[#C4B5FD]" />,
    focus: <Star size={32} className="text-[#3ECFB2]" />,
  };

  const getBorderColor = (skill) => {
    switch(skill) {
      case 'Social': return 'border-l-[#3ECFB2]';
      case 'Communication': return 'border-l-[#4A90D9]';
      case 'Cognitive': return 'border-l-[#C4B5FD]';
      default: return 'border-l-[#3ECFB2]';
    }
  };

  const getDifficultyStars = (level) => {
    return Array(level).fill(0).map((_, i) => <Star key={i} size={10} fill="currentColor" className="inline-block" />);
  };

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <h2 className="font-nunito font-bold text-xl text-[#1B2D3E] mb-6">Recommended for Tomorrow</h2>

      <div className="flex-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col sm:flex-row gap-4 h-full"
        >
          {upcomingModules.map((mod, index) => (
            <motion.div
              key={mod.id}
              variants={fadeUp}
              whileHover={clayHover}
              className={`bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-sm min-w-[240px] flex-1 flex flex-col border-l-4 ${getBorderColor(mod.skill)} cursor-pointer`}
            >
              <div className="mb-2">{moduleIconMap[mod.iconKey] || <Gamepad2 size={32} />}</div>
              <h3 className="font-nunito font-bold text-[#1B2D3E] text-sm mb-2 leading-tight">
                {mod.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4 mt-auto pt-2">
                <span className="bg-[#E8FAF6] text-[#1A9E8C] px-2 py-0.5 rounded-md text-[10px] font-bold border border-white">
                  ⏱ {mod.duration}
                </span>
                <span className="bg-[#F5FDFC] text-[#8FA3B1] px-2 py-0.5 rounded-md text-[10px] font-bold border border-white">
                  {mod.skill}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5">
                <div className="text-[10px] tracking-widest">{getDifficultyStars(mod.difficulty)}</div>
                <button className="text-[#3ECFB2] font-bold font-dm-sans text-xs hover:text-[#1A9E8C] transition-colors bg-[#3ECFB2]/10 px-3 py-1.5 rounded-lg">
                  Start &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
