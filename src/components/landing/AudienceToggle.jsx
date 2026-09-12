"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import { User, Flame, Smile, Puzzle, Rocket, Star, BarChart3, Calendar, Settings, Pause } from "lucide-react";

export default function AudienceToggle() {
  const [activeTab, setActiveTab] = useState("parents");

  const content = {
    parents: {
      headline: "Everything you need to stay close to your child's growth",
      body: "See your child's mood curve, engagement streaks, and module progress — all in one beautiful dashboard.",
      features: ["📧 Daily summary emails", "📈 Mood timeline", "🏆 Progress milestones", "📝 Caregiver notes"],
      mockup: (
        <div className="relative mx-auto w-[280px] h-[560px] bg-white rounded-[40px] border-[12px] border-[#1B2D3E] shadow-2xl overflow-hidden flex flex-col">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1B2D3E] rounded-b-3xl z-20"></div>
          
          {/* App Header */}
          <div className="bg-gradient-to-r from-[#3ECFB2] to-[#4A90D9] pt-12 pb-6 px-6 text-white relative">
            <div className="flex justify-between items-center mb-4">
              <div className="font-nunito font-bold text-lg">Leo&apos;s Overview</div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"><User size={20} /></div>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm border border-white/30 flex items-center gap-3">
              <span className="text-[#FF7E6B]"><Flame size={24} /></span>
              <div>
                <div className="text-xs text-white/80 font-bold uppercase tracking-wider">Current Streak</div>
                <div className="text-xl font-bold">7 Days!</div>
              </div>
            </div>
          </div>

          {/* App Body */}
          <div className="flex-1 bg-[#F5FDFC] p-5 space-y-4">
            <div className="text-sm font-bold text-[#1B2D3E] mb-2">Today&apos;s Progress</div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8FAF6]">
              <div className="flex justify-between text-xs text-[#8FA3B1] font-bold mb-2">
                <span>Attention Span</span>
                <span className="text-[#3ECFB2]">12m / 15m</span>
              </div>
              <div className="w-full h-2 bg-[#E8FAF6] rounded-full overflow-hidden">
                <div className="w-[80%] h-full bg-[#3ECFB2] rounded-full"></div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-[#E8FAF6] flex flex-col items-center justify-center gap-2">
                <span className="text-[#FFB020]"><Smile size={24} /></span>
                <span className="text-xs font-bold text-[#1B2D3E]">Joyful</span>
              </div>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-[#E8FAF6] flex flex-col items-center justify-center gap-2">
                <span className="text-[#4A90D9]"><Puzzle size={24} /></span>
                <span className="text-xs font-bold text-[#1B2D3E]">Pattern</span>
              </div>
            </div>
          </div>
          
          {/* App Bottom Nav */}
          <div className="h-16 bg-white border-t border-[#E8FAF6] flex justify-around items-center px-4">
            <div className="w-10 h-10 rounded-full bg-[#3ECFB2]/20 text-[#3ECFB2] flex items-center justify-center"><BarChart3 size={20} /></div>
            <div className="w-10 h-10 rounded-full text-[#8FA3B1] flex items-center justify-center"><Calendar size={20} /></div>
            <div className="w-10 h-10 rounded-full text-[#8FA3B1] flex items-center justify-center"><Settings size={20} /></div>
          </div>
        </div>
      )
    },
    children: {
      headline: "Therapy that feels exactly like their favorite video game",
      body: "A high-quality, adaptive game environment where every level is dynamically tailored to your child's developmental needs.",
      features: ["🎮 Immersive worlds", "🧩 Adaptive difficulty", "🚫 Zero clinical pressure", "🎁 Built-in rewards"],
      mockup: (
        <div className="relative mx-auto w-full max-w-[500px] h-[320px] bg-[#1B2D3E] rounded-[32px] border-[12px] border-[#1B2D3E] shadow-2xl overflow-hidden mt-8">
          {/* iPad Camera Hole */}
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full z-20 hidden md:block"></div>
          
          {/* Game Screen Content */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A90D9] to-[#87CEEB] overflow-hidden">
            {/* Sun */}
            <div className="absolute top-6 right-10 w-16 h-16 bg-[#FFB020] rounded-full shadow-[0_0_40px_rgba(255,176,32,0.8)]"></div>
            
            {/* Clouds */}
            <div className="absolute top-10 left-8 w-20 h-8 bg-white/80 rounded-full blur-[2px]"></div>
            <div className="absolute top-16 left-32 w-16 h-6 bg-white/60 rounded-full blur-[2px]"></div>
            
            {/* Game Landscape / Hills */}
            <div className="absolute bottom-0 w-[150%] h-[120px] bg-[#3ECFB2] rounded-t-[100%] left-[-25%] border-t-8 border-[#2E9B85]"></div>
            
            {/* Game Character (Spaceship/Hero) */}
            <motion.div 
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl border-4 border-[#1B2D3E] shadow-lg flex items-center justify-center text-4xl"
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Rocket size={36} className="text-[#1B2D3E]" />
            </motion.div>

            {/* Collectibles */}
            <motion.div className="absolute bottom-24 right-20 text-3xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}><Star size={28} className="text-[#FFB020]" fill="currentColor" /></motion.div>
            <motion.div className="absolute bottom-32 left-24 text-3xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}><Star size={28} className="text-[#FFB020]" fill="currentColor" /></motion.div>

            {/* Game UI Overlay */}
            <div className="absolute top-4 left-4 bg-white/30 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/50 text-white font-bold text-sm flex items-center gap-2">
              <span className="text-[#FFB020]"><Star size={16} fill="currentColor" /></span> 1,240
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center text-white">
              <Pause size={20} />
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="font-dm-sans text-[#1A9E8C] font-semibold mb-3 block text-lg bg-[#E8FAF6] px-4 py-1.5 rounded-full">
            Who It&apos;s For
          </span>
          <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-[#1B2D3E] mb-10">
            Built for the Whole Support Circle
          </h2>

          {/* Toggle */}
          <div className="flex p-1 bg-[#E8FAF6] rounded-full border border-[#3ECFB2]/20">
            <button
              onClick={() => setActiveTab("parents")}
              className={`px-6 py-2.5 rounded-full font-dm-sans font-bold text-sm md:text-base transition-all duration-300 ${
                activeTab === "parents"
                  ? "bg-[#3ECFB2] text-white shadow-[0_4px_0_#1A9E8C]"
                  : "text-[#8FA3B1] hover:text-[#1A9E8C]"
              }`}
            >
              For Parents
            </button>
            <button
              onClick={() => setActiveTab("children")}
              className={`px-6 py-2.5 rounded-full font-dm-sans font-bold text-sm md:text-base transition-all duration-300 ${
                activeTab === "children"
                  ? "bg-[#3ECFB2] text-white shadow-[0_4px_0_#1A9E8C]"
                  : "text-[#8FA3B1] hover:text-[#1A9E8C]"
              }`}
            >
              For Children
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col md:flex-row items-center gap-12 absolute inset-0 w-full"
            >
              {/* Left Content */}
              <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                <h3 className="font-nunito font-bold text-3xl text-[#1B2D3E] mb-4">
                  {content[activeTab].headline}
                </h3>
                <p className="font-dm-sans text-lg text-[#8FA3B1] mb-8 leading-relaxed max-w-lg">
                  {content[activeTab].body}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {content[activeTab].features.map((feature, idx) => (
                    <div key={idx} className="bg-[#F5FDFC] border border-[#E8FAF6] rounded-xl px-4 py-3 font-dm-sans text-[#1B2D3E] font-medium flex items-center shadow-sm">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Mockup */}
              <div className="w-full md:w-1/2 flex justify-center">
                {content[activeTab].mockup}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
