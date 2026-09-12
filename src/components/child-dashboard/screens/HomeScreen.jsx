"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { fadeUp, staggerContainer } from "../../../lib/animations";
import { Star, Lock, Palette, Type, Puzzle, Crosshair, Gamepad2, Flame } from "lucide-react";

export default function HomeScreen() {
  const { child, todayModules, setScreen, setActiveGame } = useChildStore();

  const iconKeyMap = {
    emotion: <Palette size={48} className="text-[#4A90D9]" />,
    word: <Type size={48} className="text-[#FF7E6B]" />,
    puzzle: <Puzzle size={48} className="text-[#C4B5FD]" />,
    focus: <Crosshair size={48} className="text-[#3ECFB2]" />,
  };

  const allComplete = todayModules.every(m => m.completed);
  const uncompleted = todayModules.filter(m => !m.completed).length;

  const handleStart = (mod) => {
    setScreen('play');
    setActiveGame(mod.activeGameKey);
  };

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full max-w-5xl mx-auto px-4 pb-12 md:pb-8 pt-6">
      
      {/* Duolingo Style Top Stats Widget */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full flex justify-between items-center mb-8 px-2"
      >
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white shadow-sm">
          <div className="relative">
            <Flame size={28} className="text-[#FF7E6B]" fill="#FF7E6B" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#FF7E6B]/20 rounded-full blur-md -z-10"
            />
          </div>
          <span className="font-nunito font-bold text-xl text-[#FF7E6B]">{child.streak}</span>
        </div>
        
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white shadow-sm">
          <span className="font-nunito font-bold text-xl text-[#FFB020]">{child.stars}</span>
          <Star size={28} className="text-[#FFB020]" fill="#FFB020" />
        </div>
      </motion.div>

      <div className="pb-8 text-center w-full">
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="font-nunito font-black text-[32px] md:text-[42px] text-[#1B2D3E] mb-2 tracking-tight"
        >
          Good morning, {child.name}!
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-dm-sans text-[18px] text-[#8FA3B1] font-medium"
        >
          {allComplete ? "You've finished everything today! 🎉" : `You have ${uncompleted} super fun activities today`}
        </motion.p>
      </div>

      <motion.div 
        className="w-full grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-12 flex-1 min-h-0"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {todayModules.map((mod) => (
          <motion.div 
            key={mod.id}
            variants={fadeUp}
            className={`clay-card rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center justify-between border-2 min-h-0 ${
              !mod.unlocked ? "opacity-70 bg-white/30 border-white/40" : "bg-white/60 border-white/80"
            }`}
          >
            <div className="flex flex-col items-center gap-2 md:gap-3 text-center flex-1 min-h-0 justify-center">
              <div className={`w-[56px] h-[56px] md:w-[90px] md:h-[90px] rounded-2xl flex items-center justify-center text-2xl md:text-5xl shadow-sm shrink-0 ${
                mod.completed ? "bg-[#3ECFB2]/20" : (!mod.unlocked ? "bg-gray-100" : "bg-white border-2 border-[#3ECFB2]/30")
              }`}>
                {iconKeyMap[mod.iconKey] || <Gamepad2 size={48} className="text-[#1B2D3E]" />}
              </div>
              <div className="min-h-0">
                <h2 className="font-nunito font-bold text-[14px] md:text-[22px] text-[#1B2D3E] md:mb-2 leading-tight line-clamp-2">{mod.title}</h2>
                <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 mt-1 hidden md:flex">
                  <span className="bg-[#E8FAF6] text-[#1A9E8C] px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-[12px] font-bold border border-white whitespace-nowrap">
                    ⏱ {mod.duration}
                  </span>
                  <span className="bg-[#F5FDFC] text-[#8FA3B1] px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-[12px] font-bold border border-white whitespace-nowrap">
                    {mod.skill}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 w-full mt-2 md:mt-4">
              {mod.completed ? (
                <div className="bg-[#E8FAF6] text-[#1A9E8C] border-2 border-[#3ECFB2]/30 px-2 py-1.5 md:py-2 rounded-xl text-[14px] md:text-[16px] font-bold font-nunito flex items-center gap-2 justify-center h-[42px] md:h-[56px] w-full">
                  <span>✓</span> <span className="hidden md:inline">Completed</span>
                </div>
              ) : !mod.unlocked ? (
                <div className="bg-[#F1F5F9] text-[#94A3B8] border-2 border-[#E2E8F0] px-2 py-1.5 md:py-2 rounded-xl text-[14px] md:text-[16px] font-bold font-nunito flex items-center gap-2 justify-center h-[42px] md:h-[56px] w-full">
                  <span><Lock size={16} /></span> <span className="hidden md:inline">Locked</span>
                </div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStart(mod)}
                  className="bg-gradient-to-b from-[#3ECFB2] to-[#2BB89B] text-white px-2 py-1.5 md:py-2 rounded-xl text-[15px] md:text-[18px] font-bold font-nunito flex items-center gap-2 justify-center h-[42px] md:h-[56px] w-full shadow-[0_4px_0_#1A9E8C] active:translate-y-1 active:shadow-none transition-all"
                >
                  <span>▶</span> Play!
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {allComplete ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg h-[72px] rounded-2xl bg-gradient-to-r from-[#C4B5FD] to-[#A78BFA] flex items-center justify-center font-nunito font-bold text-white text-[20px] shadow-[0_4px_0_#8B5CF6] mx-auto border-2 border-white/40"
        >
          <Star size={28} className="text-white mr-3" fill="currentColor" /> All done! Amazing work!
        </motion.div>
      ) : (
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98, y: 2, boxShadow: "0 0 0 #1A9E8C" }}
          onClick={() => {
            const nextMod = todayModules.find(m => m.unlocked && !m.completed);
            if (nextMod) handleStart(nextMod);
            else setScreen('play');
          }}
          className="w-full max-w-lg h-[80px] rounded-2xl bg-gradient-to-b from-[#3ECFB2] to-[#2BB89B] flex items-center justify-center font-nunito font-bold text-white text-[22px] shadow-[0_6px_0_#1A9E8C] transition-all mb-4 mx-auto border-2 border-white/20"
        >
          <span className="mr-2">▶</span> Start Today&apos;s Journey
        </motion.button>
      )}

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-dm-sans text-[14px] md:text-[16px] text-[#8FA3B1] text-center mt-8 bg-white/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/60 inline-flex items-center gap-2 shadow-sm mx-auto"
      >
        <span>Keep your streak going!</span>
        <Flame size={16} fill="#FF7E6B" className="text-[#FF7E6B]" />
      </motion.p>
    </div>
  );
}
