"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { useTelemetryEmitter } from "../../../hooks/useTelemetryEmitter";
import { useSessionRecorder } from "../../../hooks/useRealtimeSync";
import { useCameraEmotion } from "../../../context/CameraEmotionContext";
import { summarizeEmotionTimeline } from "../../../lib/emotionUtils";
import confetti from "canvas-confetti";
import { Apple, Cat, Car, HelpCircle, Heart, Star, Brain, Microscope } from "lucide-react";

const MODULE_CODE = "word-match";

export default function WordMatchGame() {
  const { setActiveGame, completeModule } = useChildStore();
  const { sendTelemetry, flushTelemetry } = useTelemetryEmitter();
  const { recordSession } = useSessionRecorder();
  const currentMood = useChildStore((s) => s.currentMood);

  const levels = [
    { icon: <Apple size={100} className="text-[#FF7E6B]" />, options: ["Apple", "Banana", "Dog"], correct: "Apple" },
    { icon: <Cat size={100} className="text-[#FFB020]" />, options: ["Bird", "Cat", "Cow"], correct: "Cat" },
    { icon: <Car size={100} className="text-[#4A90D9]" />, options: ["Car", "Bus", "Train"], correct: "Car" }
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const startedAtRef = useRef(0);
  const mistakesRef = useRef(0);
  const consecutiveWrongRef = useRef(0); // auto-mode frustration signal
  const emotionTimelineRef = useRef([]);
  const lastSnapshotSentRef = useRef(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const [disabledOption, setDisabledOption] = useState(null); // gentle hint: one wrong option greyed
  const { status: cameraStatus, emotion, emotionConfidence, snapshot, requestCamera } = useCameraEmotion();
  const cameraOn = cameraStatus === 'granted';

  // Auto-request camera observation when child enters the game
  useEffect(() => {
    requestCamera();
  }, [requestCamera]);

  const level = levels[currentLevel];

  // Emotion-adaptive difficulty: frustration/anger/stress (camera) or
  // 2+ consecutive wrong answers (auto mode) greys out one wrong option.
  useEffect(() => {
    const frustrated = cameraOn
      ? ['frustrated', 'angry', 'stressed'].includes(emotion)
      : consecutiveWrongRef.current >= 2;
    if (frustrated) {
      setDisabledOption(prev => {
        if (prev !== null) return prev;
        const wrong = level.options.filter((o) => o !== level.correct);
        return wrong[Math.floor(Math.random() * wrong.length)];
      });
    } else {
      setDisabledOption(null);
    }
  }, [emotion, cameraOn, currentLevel, level]);

  // Live telemetry for the parent observer
  useEffect(() => {
    const focusScore = Math.min(100, Math.max(55, 90 - mistakesRef.current * 10 + currentLevel * 3));

    // Camera snapshot goes out only when it changed (~every 10s)
    const snapshotPayload = {};
    if (cameraOn && snapshot && snapshot !== lastSnapshotSentRef.current) {
      lastSnapshotSentRef.current = snapshot;
      snapshotPayload.snapshotFrame = snapshot;
    }

    sendTelemetry({
      status: "playing",
      activeGame: MODULE_CODE,
      gameTitle: "Word Match",
      score: currentLevel,
      targetScore: levels.length,
      elapsedSeconds: Math.round(((startedAtRef.current ? Date.now() : Date.now()) - (startedAtRef.current || Date.now())) / 1000),
      focusScore,
      focusStatus: focusScore > 85 ? "Optimal Attention" : "Steady Focus",
      trackingSmoothness: mistakesRef.current === 0 ? "High Precision" : "Steady",
      avgResponseMs: 0,
      frustrationLevel: mistakesRef.current > 2 ? "Moderate" : "Low",
      liveCoordinates: { x: 50, y: 50 },
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
      ...snapshotPayload,
    });
  }, [currentLevel, sendTelemetry, cameraOn, emotion, emotionConfidence, snapshot, levels.length]);

  // Track camera emotion changes for the after-game summary
  useEffect(() => {
    if (!cameraOn || !emotion) return;
    const t = Math.round(((startedAtRef.current ? Date.now() : Date.now()) - (startedAtRef.current || Date.now())) / 1000);
    const timeline = emotionTimelineRef.current;
    if (timeline.length === 0 || timeline[timeline.length - 1].emotion !== emotion) {
      timeline.push({ t, emotion });
      if (timeline.length > 20) timeline.shift();
    }
  }, [emotion, cameraOn]);

  const finishSession = useCallback((correctCount) => {
    const startedAt = startedAtRef.current || Date.now();
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    completeModule(MODULE_CODE);
    flushTelemetry({
      status: "idle",
      activeGame: MODULE_CODE,
      gameTitle: "Word Match",
      score: correctCount,
      targetScore: levels.length,
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
    });
    recordSession({
      moduleCode: MODULE_CODE,
      score: correctCount,
      maxScore: levels.length,
      durationSec,
      focusScore: Math.min(100, Math.max(55, 90 - mistakesRef.current * 10 + correctCount * 3)),
      avgResponseMs: 0,
      outcome: "completed",
      moodBefore: currentMood,
      wordsLearned: correctCount,
      emotionSummary: cameraOn ? summarizeEmotionTimeline(emotionTimelineRef.current) : null,
    });
  }, [cameraOn, currentMood, emotion, emotionConfidence, flushTelemetry, recordSession, completeModule, levels.length]);

  const handleSelect = (option) => {
    if (option === level.correct) {
      consecutiveWrongRef.current = 0;
      setFeedback("correct");
      if (currentLevel === levels.length - 1) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          finishSession(levels.length - mistakesRef.current > 0 ? Math.max(1, levels.length - mistakesRef.current) : 1);
          setActiveGame(null);
        }, 2000);
      } else {
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
          setFeedback(null);
          setDisabledOption(null);
        }, 1200);
      }
    } else {
      mistakesRef.current += 1;
      consecutiveWrongRef.current += 1;
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white/40 px-4 z-50 fixed inset-0">
      <button 
        onClick={() => setActiveGame(null)}
        className="absolute top-6 left-6 md:top-8 md:left-8 min-w-[56px] min-h-[56px] bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center font-nunito font-bold text-[#1B2D3E] shadow-sm border border-white hover:bg-white transition-colors"
      >
        ← Back
      </button>

      {/* Parent Info Button */}
      <button 
        onClick={() => setShowInfo(true)}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-2xl shadow-sm border border-[#3ECFB2]/30 hover:bg-white transition-colors z-50"
        title="For Parents: Science behind this game"
      >
        <Microscope size={24} className="text-[#1B2D3E]" />
      </button>

      <div className="max-w-md w-full flex flex-col items-center">
        <h2 className="font-nunito font-bold text-2xl md:text-3xl text-[#1B2D3E] mb-8 text-center">
          What is this? <HelpCircle size={28} className="inline-block text-[#4A90D9] ml-2 pb-1" />
        </h2>

        <motion.div 
          key={currentLevel}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-sm border-2 border-[#3ECFB2]/20 flex items-center justify-center text-6xl md:text-8xl mb-12"
        >
          {level.icon}
        </motion.div>

        <div className="w-full space-y-4">
          {level.options.map((option, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option)}
              disabled={feedback !== null || (disabledOption === option && feedback !== "correct")}
              className={`w-full py-4 md:py-5 rounded-2xl font-nunito font-bold text-xl md:text-2xl border-2 transition-colors ${
                disabledOption === option && feedback !== "correct" ? "opacity-40 grayscale pointer-events-none bg-gray-100 border-gray-200 text-gray-400" :
                feedback === "correct" && option === level.correct ? "bg-[#3ECFB2]/20 border-[#3ECFB2] text-[#1A9E8C]" :
                feedback === "wrong" && option !== level.correct ? "bg-gray-100 border-gray-200 text-gray-400" :
                "bg-white border-white/60 shadow-sm text-[#1B2D3E] hover:border-[#3ECFB2]/50 hover:bg-white/90"
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>

        <div className="h-12 mt-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {feedback === "wrong" && (
              <motion.div
                key="wrong"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[#8FA3B1] font-dm-sans font-bold md:text-lg"
              >
                Try again <Heart size={18} className="inline-block text-[#4A90D9] ml-1 mb-1" />
              </motion.div>
            )}
            {feedback === "correct" && (
              <motion.div
                key="correct"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-[#1A9E8C] font-dm-sans font-bold text-xl md:text-2xl"
              >
                Great job! <Star size={24} className="inline-block text-[#FFB020] ml-2 pb-1" fill="currentColor" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Science / Research Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1B2D3E]/40 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 shadow-2xl border-4 border-[#3ECFB2]/20"
            >
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold"
              >
                ✕
              </button>
              <div className="mb-4 text-[#4A90D9]"><Brain size={40} /></div>
              <h3 className="font-nunito font-bold text-2xl text-[#1B2D3E] mb-2">
                Backed by Science
              </h3>
              <p className="font-dm-sans text-[#56728A] leading-relaxed mb-6">
                This module uses <strong>Picture-to-Word Mapping</strong>. Clinical research indicates that combining visual supports (imageability) with textual pairing is a highly effective strategy for vocabulary acquisition and reading comprehension in individuals with autism.
              </p>
              <a 
                href="https://pubmed.ncbi.nlm.nih.gov/?term=visual+supports+vocabulary+autism" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#E8FAF6] text-[#1A9E8C] px-5 py-3 rounded-xl font-bold font-dm-sans border border-[#3ECFB2]/30 hover:bg-[#3ECFB2]/20 transition-colors w-full md:w-auto"
              >
                Read NIH Research Papers ↗
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
