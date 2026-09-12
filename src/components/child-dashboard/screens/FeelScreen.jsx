"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { Wind, Flower, Leaf, Heart, Smile, Meh, Frown, Moon } from "lucide-react";

function CalmingScreen({ onClose }) {
  const [phase, setPhase] = useState('inhale');

  // We could use an interval for the text, but framer motion's onUpdate or a simple useEffect works too.
  // We'll just use a simple interval for the text to keep it perfectly in sync with the 4s CSS animation (2s each phase).
  useState(() => {
    const timer = setInterval(() => {
      setPhase(p => p === 'inhale' ? 'exhale' : 'inhale');
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#C4B5FD]/40 to-[#4A90D9]/20 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl font-nunito font-bold text-[#1B2D3E] shadow-sm flex items-center gap-2 border border-white"
      >
        <span>←</span> Back
      </button>

      <motion.div
        className="w-48 h-48 rounded-full border-4 flex items-center justify-center mb-8"
        animate={{ 
          scale: [1, 1.4, 1], 
          backgroundColor: ['rgba(74,144,217,0.3)', 'rgba(196,181,253,0.4)', 'rgba(74,144,217,0.3)'],
          borderColor: ['rgba(74,144,217,0.5)', 'rgba(196,181,253,0.5)', 'rgba(74,144,217,0.5)']
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wind size={64} className="text-[#4A90D9]" />
      </motion.div>

      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="h-10 flex items-center justify-center mb-12"
      >
        <p className="font-nunito font-medium text-2xl text-[#1B2D3E]">
          {phase === 'inhale' ? <>Breathe in... <Flower size={24} className="inline-block text-[#C4B5FD] ml-2 mb-1" /></> : <>Breathe out... <Leaf size={24} className="inline-block text-[#3ECFB2] ml-2 mb-1" /></>}
        </p>
      </motion.div>

      <p className="font-dm-sans text-[16px] text-[#1B2D3E]/70 absolute bottom-12">
        You're safe. Take your time. <Heart size={16} className="inline-block text-[#4A90D9] ml-1 mb-0.5" />
      </p>
    </motion.div>
  );
}

export default function FeelScreen() {
  const { currentMood, setMood, child } = useChildStore();
  const [showCalm, setShowCalm] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  const moodIconMap = {
    '😄': <Smile size={36} className="text-[#FFB020]" />,
    '😊': <Smile size={36} className="text-[#3ECFB2]" />,
    '😐': <Meh size={36} className="text-[#4A90D9]" />,
    '😕': <Frown size={36} className="text-[#FF7E6B]" />,
    '😢': <Frown size={36} className="text-[#C4B5FD]" />,
  };

  const moods = [
    { id: 'great', emoji: '😄', label: 'Great!', bg: 'bg-[#FFF9C4]', border: 'border-[#FFF59D]', activeBg: 'bg-[#FFF9C4]', screenBg: '#FFF9C4' },
    { id: 'good', emoji: '😊', label: 'Good', bg: 'bg-[#E8FAF6]', border: 'border-[#3ECFB2]/50', activeBg: 'bg-[#E8FAF6]', screenBg: '#E8FAF6' },
    { id: 'ok', emoji: '😐', label: 'OK', bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]', activeBg: 'bg-[#EFF6FF]', screenBg: '#EFF6FF' },
    { id: 'notgreat', emoji: '😕', label: 'Not great', bg: 'bg-[#FFF3E0]', border: 'border-[#FFCC80]', activeBg: 'bg-[#FFF3E0]', screenBg: '#FFF3E0' },
    { id: 'sad', emoji: '😢', label: 'Sad', bg: 'bg-[#F3F0FF]', border: 'border-[#C4B5FD]', activeBg: 'bg-[#F3F0FF]', screenBg: '#F3F0FF' },
  ];

  const handleSelect = (m) => {
    setMood(m.id);
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 3000);

    // Persist the check-in so it appears on the parent dashboard
    fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodId: m.id }),
    }).catch((err) => console.error("Failed to save mood:", err.message));
  };

  const activeMoodObj = moods.find(m => m.id === currentMood);

  return (
    <>
      <AnimatePresence>
        {showCalm && <CalmingScreen onClose={() => setShowCalm(false)} />}
      </AnimatePresence>

      <motion.div 
        className="flex flex-col items-center max-w-xl mx-auto h-full px-4 pb-8"
        animate={{ backgroundColor: activeMoodObj ? activeMoodObj.screenBg : 'transparent' }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-nunito font-bold text-[26px] text-[#1B2D3E] text-center pt-8 mb-8 leading-tight">
          How are you feeling right now?
        </h1>

        <div className="grid grid-cols-5 gap-2 w-full max-w-md mb-8">
          {moods.map((m) => {
            const isSelected = currentMood === m.id;
            
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSelect(m)}
                animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`rounded-3xl p-2 flex flex-col items-center justify-center gap-2 border-2 min-h-[90px] w-full transition-colors relative z-10 ${
                  isSelected ? `${m.activeBg} ${m.border}` : 'bg-white/60 border-white/80'
                }`}
                style={isSelected ? { filter: 'drop-shadow(0 0 12px rgba(62,207,178,0.5))' } : {}}
              >
                <div className="mb-1">{moodIconMap[m.emoji] || m.emoji}</div>
                <span className="font-dm-sans text-[11px] font-bold text-[#1B2D3E] text-center leading-none">
                  {m.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {justSelected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 border border-white shadow-sm"
            >
              <p className="font-nunito font-bold text-[20px] text-[#3ECFB2]">
                Thanks for telling us, {child.name}! <Heart size={20} className="inline-block text-[#3ECFB2] ml-1 mb-1" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowCalm(true)}
          className="mt-auto mb-4 bg-[#C4B5FD]/20 border-2 border-[#C4B5FD]/50 text-[#1B2D3E] font-nunito font-bold text-[18px] px-8 py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform w-full max-w-xs shadow-sm backdrop-blur-sm"
        >
          <span>Need a break?</span>
          <Moon size={24} />
        </button>
      </motion.div>
    </>
  );
}
