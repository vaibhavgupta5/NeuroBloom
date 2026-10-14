"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import { User, Flame, Smile, Puzzle, Rocket, Star, BarChart3, Calendar, Settings, Pause, Stethoscope, Flag, FileText } from "lucide-react";

export default function AudienceToggle() {
  const [activeTab, setActiveTab] = useState("parents");
  const tabs = ["parents", "children", "therapists"];

  const content = {
    parents: {
      headline: "Everything you need to stay close to your child's growth",
      body: "See your child's mood curve, engagement streaks, and module progress — all in one beautiful dashboard.",
      features: ["🔔 In-app notifications", "📈 Mood timeline", "🏆 Progress milestones", "📝 Therapist notes"],
      mockup: (
        <div className="relative mx-auto w-[280px] h-[560px] bg-white rounded-[40px] border-[12px] border-ink shadow-2xl overflow-hidden flex flex-col">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-ink rounded-b-3xl z-20"></div>
          
          {/* App Header */}
          <div className="bg-gradient-to-r from-teal-400 to-blue-400 pt-12 pb-6 px-6 text-white relative">
            <div className="flex justify-between items-center mb-4">
              <div className="font-nunito font-bold text-lg">Leo&apos;s Overview</div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"><User size={20} /></div>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm border border-white/30 flex items-center gap-3">
              <span className="text-coral-700"><Flame size={24} /></span>
              <div>
                <div className="text-xs text-white/80 font-bold uppercase tracking-wider">Current Streak</div>
                <div className="text-xl font-bold">7 Days!</div>
              </div>
            </div>
          </div>

          {/* App Body */}
          <div className="flex-1 bg-canvas p-5 space-y-4">
            <div className="text-sm font-bold text-ink mb-2">Today&apos;s Progress</div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-mint">
              <div className="flex justify-between text-xs text-muted font-bold mb-2">
                <span>Attention Span</span>
                <span className="text-teal-700">12m / 15m</span>
              </div>
              <div className="w-full h-2 bg-mint rounded-full overflow-hidden">
                <div className="w-[80%] h-full bg-teal-700 rounded-full"></div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-mint flex flex-col items-center justify-center gap-2">
                <span className="text-amber-400"><Smile size={24} /></span>
                <span className="text-xs font-bold text-ink">Joyful</span>
              </div>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-mint flex flex-col items-center justify-center gap-2">
                <span className="text-blue-700"><Puzzle size={24} /></span>
                <span className="text-xs font-bold text-ink">Pattern</span>
              </div>
            </div>
          </div>
          
          {/* App Bottom Nav */}
          <div className="h-16 bg-white border-t border-mint flex justify-around items-center px-4">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 text-teal-700 flex items-center justify-center"><BarChart3 size={20} /></div>
            <div className="w-10 h-10 rounded-full text-muted flex items-center justify-center"><Calendar size={20} /></div>
            <div className="w-10 h-10 rounded-full text-muted flex items-center justify-center"><Settings size={20} /></div>
          </div>
        </div>
      )
    },
    children: {
      headline: "Practice that feels like play, not a worksheet",
      body: "Short, calm games where every level is adjusted to how independently your child is answering — not a fixed difficulty slider.",
      features: ["🎮 Simple, calm games", "🧩 Adjusts automatically", "🌸 A Calm Corner for breaks", "🎁 Stars and badges"],
      mockup: (
        <div className="relative mx-auto w-full max-w-[500px] h-[320px] bg-ink rounded-[32px] border-[12px] border-ink shadow-2xl overflow-hidden mt-8">
          {/* iPad Camera Hole */}
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full z-20 hidden md:block"></div>
          
          {/* Game Screen Content */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-[#87CEEB] overflow-hidden">
            {/* Sun */}
            <div className="absolute top-6 right-10 w-16 h-16 bg-amber-400 rounded-full shadow-[0_0_40px_rgba(255,176,32,0.8)]"></div>
            
            {/* Clouds */}
            <div className="absolute top-10 left-8 w-20 h-8 bg-white/80 rounded-full blur-[2px]"></div>
            <div className="absolute top-16 left-32 w-16 h-6 bg-white/60 rounded-full blur-[2px]"></div>
            
            {/* Game Landscape / Hills */}
            <div className="absolute bottom-0 w-[150%] h-[120px] bg-teal-700 rounded-t-[100%] left-[-25%] border-t-8 border-[#2E9B85]"></div>
            
            {/* Game Character (Spaceship/Hero) */}
            <motion.div 
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl border-4 border-ink shadow-lg flex items-center justify-center text-4xl"
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Rocket size={36} className="text-ink" />
            </motion.div>

            {/* Collectibles */}
            <motion.div className="absolute bottom-24 right-20 text-3xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}><Star size={28} className="text-amber-400" fill="currentColor" /></motion.div>
            <motion.div className="absolute bottom-32 left-24 text-3xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}><Star size={28} className="text-amber-400" fill="currentColor" /></motion.div>

            {/* Game UI Overlay */}
            <div className="absolute top-4 left-4 bg-white/30 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/50 text-white font-bold text-sm flex items-center gap-2">
              <span className="text-amber-400"><Star size={16} fill="currentColor" /></span> 1,240
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center text-white">
              <Pause size={20} />
            </div>
          </div>
        </div>
      )
    },
    therapists: {
      headline: "Real session data, not a status call",
      body: "See every linked child's streak, accuracy and active goals at a glance, set measurable goals, and draft progress reports from their actual sessions.",
      features: ["📋 A real caseload view", "🎯 Goals with mastery criteria", "📝 Notes the family sees", "📄 AI-assisted report drafts"],
      mockup: (
        <div className="relative mx-auto w-full max-w-[420px] bg-white rounded-[28px] border border-mint shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-400 to-blue-400 p-5 text-white">
            <div className="font-nunito font-bold text-lg">Your caseload</div>
            <div className="font-dm-sans text-xs text-white/80 mt-0.5">2 children linked</div>
          </div>
          <div className="p-4 space-y-3 bg-canvas">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-mint flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mint text-teal-700 flex items-center justify-center font-bold">A</div>
              <div className="flex-1">
                <div className="font-bold text-ink text-sm">Arjun, age 6</div>
                <div className="text-xs text-muted flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><Flag size={12} /> 1 active goal</span>
                  <span className="flex items-center gap-1"><Flame size={12} className="text-coral-700" /> 20-day streak</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-mint flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mint text-teal-700 flex items-center justify-center font-bold">M</div>
              <div className="flex-1">
                <div className="font-bold text-ink text-sm">Meera, age 8</div>
                <div className="text-xs text-muted flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><Flag size={12} /> 1 active goal</span>
                  <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 font-bold flex items-center gap-1"><FileText size={11} /> 1 draft report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const tabLabels = { parents: "For Parents", children: "For Children", therapists: "For Therapists" };

  return (
    <section id="audience" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="font-dm-sans text-teal-700 font-semibold mb-3 block text-lg bg-mint px-4 py-1.5 rounded-full">
            Who It&apos;s For
          </span>
          <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-ink mb-10">
            Built for the Whole Support Circle
          </h2>

          {/* Toggle */}
          <div className="flex p-1 bg-mint rounded-full border border-teal-400/20">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-dm-sans font-bold text-sm md:text-base transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-teal-700 text-white shadow-[0_4px_0_#1A9E8C]"
                    : "text-muted hover:text-teal-700"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
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
                <h3 className="font-nunito font-bold text-3xl text-ink mb-4">
                  {content[activeTab].headline}
                </h3>
                <p className="font-dm-sans text-lg text-muted mb-8 leading-relaxed max-w-lg">
                  {content[activeTab].body}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {content[activeTab].features.map((feature, idx) => (
                    <div key={idx} className="bg-canvas border border-mint rounded-xl px-4 py-3 font-dm-sans text-ink font-medium flex items-center shadow-sm">
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
