"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../../lib/animations";
import { Gamepad2, Type, Puzzle, Star } from "lucide-react";

export default function ScheduleScreen() {
  const schedule = [
    { status: "NOW", badgeBg: "bg-[#3ECFB2]", textStyle: "text-white", boxStyle: "bg-white border-l-4 border-[#3ECFB2] shadow-md scale-[1.02]", icon: (s) => <Gamepad2 size={s} className="text-[#4A90D9]" />, name: "Feelings Game" },
    { status: "AFTER", badgeBg: "bg-[#8FA3B1]/20", textStyle: "text-[#8FA3B1]", boxStyle: "bg-white/40 border border-white/60 opacity-80", icon: (s) => <Type size={s} className="text-[#FF7E6B]" />, name: "Word Match" },
    { status: "THEN", badgeBg: "bg-[#8FA3B1]/20", textStyle: "text-[#8FA3B1]", boxStyle: "bg-white/40 border border-white/60 opacity-80", icon: (s) => <Puzzle size={s} className="text-[#C4B5FD]" />, name: "Puzzle Time" },
    { status: "🌟", badgeBg: "bg-[#C4B5FD]", textStyle: "text-white", boxStyle: "bg-[#C4B5FD]/20 border border-[#C4B5FD] opacity-80", icon: (s) => <Star size={s} className="text-[#FFB020]" />, name: "All finished!" },
  ];

  return (
    <div className="flex flex-col max-w-5xl mx-auto pb-12 h-full">
      <h1 className="font-nunito font-bold text-[24px] md:text-[32px] text-[#1B2D3E] pt-6 px-4 md:px-8 mb-6 text-center md:text-left">
        What&apos;s happening today 📅
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4 md:px-8 w-full">
        {/* Timeline (Left on Desktop) */}
        <motion.div 
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {schedule.map((item, index) => (
            <motion.div 
              key={index}
              variants={fadeUp}
              className={`rounded-2xl p-4 md:p-5 flex items-center gap-4 min-h-[80px] md:min-h-[100px] ${item.boxStyle} transition-transform hover:scale-[1.02] cursor-default`}
            >
              <div className={`text-[11px] md:text-[13px] font-bold px-2.5 py-1.5 rounded-lg w-[60px] md:w-[70px] text-center ${item.badgeBg} ${item.textStyle}`}>
              {item.status}
              {item.status === "NOW" && " →"}
            </div>
            
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-black/5 flex items-center justify-center text-2xl md:text-3xl shrink-0">
                {item.icon(32)}
              </div>
              
              <div className="font-nunito font-bold text-[16px] md:text-[20px] text-[#1B2D3E]">
                {item.name}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* First-Then Board (Right on Desktop) */}
        <div>
          <h2 className="font-nunito font-bold text-[18px] md:text-[24px] text-[#1B2D3E] mb-4 text-center md:text-left">
            First → Then 👆
          </h2>
          
          <div className="grid grid-cols-2 gap-4 h-[200px] md:h-[400px]">
            <div className="rounded-3xl p-6 flex flex-col items-center gap-4 bg-[#3ECFB2]/20 border-2 border-[#3ECFB2] shadow-sm justify-center group hover:bg-[#3ECFB2]/30 transition-colors">
              <span className="text-[12px] md:text-[14px] font-bold text-[#1A9E8C] tracking-wider bg-white/50 px-3 py-1 rounded-full">FIRST</span>
              <div className="my-2 group-hover:scale-110 transition-transform flex items-center justify-center w-[80px] h-[80px]">{schedule[0].icon(80)}</div>
              <span className="font-dm-sans font-bold text-[14px] md:text-[18px] text-[#1B2D3E] text-center">{schedule[0].name}</span>
            </div>
            
            <div className="rounded-3xl p-6 flex flex-col items-center gap-4 bg-[#FFF4E3] border-2 border-[#FFA94D] shadow-sm justify-center group hover:bg-[#FFE8C2] transition-colors">
              <span className="text-[12px] md:text-[14px] font-bold text-[#D97A1F] tracking-wider bg-white/50 px-3 py-1 rounded-full">THEN</span>
              <div className="my-2 group-hover:scale-110 transition-transform flex items-center justify-center w-[80px] h-[80px]">{schedule[1].icon(80)}</div>
              <span className="font-dm-sans font-bold text-[14px] md:text-[18px] text-[#1B2D3E] text-center">{schedule[1].name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
