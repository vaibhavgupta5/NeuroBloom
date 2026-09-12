"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { useTelemetryEmitter } from "../../../hooks/useTelemetryEmitter";
import { useSessionRecorder } from "../../../hooks/useRealtimeSync";
import { useCameraEmotion } from "../../../context/CameraEmotionContext";
import { summarizeEmotionTimeline } from "../../../lib/emotionUtils";
import { Smile, Frown, Meh, Star, Gamepad2, Heart, Brain, PartyPopper, Microscope } from "lucide-react";

const MODULE_CODE = "emotion-match";

const questions = [
  { face: <Smile size={120} className="text-[#FFB020]" />, prompt: 'How is this person feeling?', options: ['Happy', 'Sad', 'Angry'],   correct: 0 },
  { face: <Frown size={120} className="text-[#C4B5FD]" />, prompt: 'What does this face show?',  options: ['Surprised', 'Sad', 'Happy'], correct: 1 },
  { face: <Frown size={120} className="text-[#FF7E6B]" />, prompt: 'How is this person feeling?', options: ['Angry', 'Happy', 'Scared'],  correct: 0 },
  { face: <Meh size={120} className="text-[#4A90D9]" />, prompt: 'What does this face show?',  options: ['Sad', 'Happy', 'Surprised'], correct: 2 },
  { face: <Smile size={120} className="text-[#3ECFB2]" />, prompt: 'How is this person feeling?', options: ['Angry', 'Excited', 'Tired'],  correct: 1 },
];

export default function EmotionMatchGame() {
  const { setActiveGame, completeModule } = useChildStore();
  const { sendTelemetry, flushTelemetry } = useTelemetryEmitter();
  const { recordSession } = useSessionRecorder();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const startedAtRef = useRef(Date.now());
  const mistakesRef = useRef(0);
  const consecutiveWrongRef = useRef(0); // auto-mode frustration signal
  const emotionTimelineRef = useRef([]);
  const lastSnapshotSentRef = useRef(null);
  const [disabledOption, setDisabledOption] = useState(null); // gentle hint: one wrong option greyed
  const currentMood = useChildStore((s) => s.currentMood);
  const { status: cameraStatus, emotion, emotionConfidence, snapshot } = useCameraEmotion();
  const cameraOn = cameraStatus === 'granted';

  const q = questions[currentQ];

  // Emotion-adaptive difficulty: frustration/anger/stress (camera) or
  // 2+ consecutive wrong answers (auto mode) greys out one wrong option.
  // Reverts when the child is calm/happy again.
  useEffect(() => {
    if (showResult) return;
    const frustrated = cameraOn
      ? ['frustrated', 'angry', 'stressed'].includes(emotion)
      : consecutiveWrongRef.current >= 2;
    if (frustrated) {
      setDisabledOption(prev => (prev !== null ? prev : pickWrongOption(q.correct)));
    } else {
      setDisabledOption(null);
    }
  }, [emotion, cameraOn, currentQ, showResult, q]);

  const pickWrongOption = (correctIndex) => {
    const wrong = [0, 1, 2].filter((i) => i !== correctIndex);
    return wrong[Math.floor(Math.random() * wrong.length)];
  };

  // Live telemetry for the parent observer
  useEffect(() => {
    if (showResult) return;
    const focusScore = Math.min(100, Math.max(55, 90 - mistakesRef.current * 8 + score * 2));

    // Camera snapshot goes out only when it changed (~every 10s)
    const snapshotPayload = {};
    if (cameraOn && snapshot && snapshot !== lastSnapshotSentRef.current) {
      lastSnapshotSentRef.current = snapshot;
      snapshotPayload.snapshotFrame = snapshot;
    }

    sendTelemetry({
      status: "playing",
      activeGame: MODULE_CODE,
      gameTitle: "Feelings Game",
      score,
      targetScore: questions.length,
      elapsedSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
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
  }, [currentQ, score, showResult, sendTelemetry, cameraOn, emotion, emotionConfidence, snapshot]);

  // Track camera emotion changes for the after-game summary
  useEffect(() => {
    if (!cameraOn || !emotion) return;
    const t = Math.round((Date.now() - startedAtRef.current) / 1000);
    const timeline = emotionTimelineRef.current;
    if (timeline.length === 0 || timeline[timeline.length - 1].emotion !== emotion) {
      timeline.push({ t, emotion });
      if (timeline.length > 20) timeline.shift();
    }
  }, [emotion, cameraOn]);

  const finishSession = (finalScore) => {
    const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    const accuracy = Math.round((finalScore / questions.length) * 100);
    completeModule(MODULE_CODE);
    flushTelemetry({
      status: "idle",
      activeGame: MODULE_CODE,
      gameTitle: "Feelings Game",
      score: finalScore,
      targetScore: questions.length,
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
    });
    recordSession({
      moduleCode: MODULE_CODE,
      score: finalScore,
      maxScore: questions.length,
      durationSec,
      focusScore: Math.min(100, Math.max(55, 90 - mistakesRef.current * 8 + finalScore * 2)),
      avgResponseMs: 0,
      outcome: "completed",
      moodBefore: currentMood,
      emotionSummary: cameraOn ? summarizeEmotionTimeline(emotionTimelineRef.current) : null,
    });
  };

  const handleAnswer = (index) => {
    if (selectedOpt !== null) return; // prevent double clicks

    setSelectedOpt(index);
    const isCorrect = index === q.correct;

    if (isCorrect) {
      consecutiveWrongRef.current = 0;
      setLastAnswerCorrect(true);
      setScore(s => s + 1);
      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ(c => c + 1);
          setLastAnswerCorrect(null);
          setSelectedOpt(null);
          setDisabledOption(null);
        } else {
          setShowResult(true);
          finishSession(score + 1);
        }
      }, 1500);
    } else {
      mistakesRef.current += 1;
      consecutiveWrongRef.current += 1;
      setLastAnswerCorrect(false);
      setTimeout(() => {
        setLastAnswerCorrect(null);
        setSelectedOpt(null);
      }, 1000);
    }
  };

  const handlePlayAgain = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setLastAnswerCorrect(null);
    setSelectedOpt(null);
    setDisabledOption(null);
    startedAtRef.current = Date.now();
    mistakesRef.current = 0;
    consecutiveWrongRef.current = 0;
    emotionTimelineRef.current = [];
    lastSnapshotSentRef.current = null;
  };

  if (showResult) {
    return (
      <div className="absolute inset-0 bg-[#E8FAF6] z-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0, transition: { type: "spring", bounce: 0.6 } }}
          className="text-[80px] mb-4"
        >
          <PartyPopper size={80} className="text-[#FF7E6B]" />
        </motion.div>
        <h1 className="font-nunito font-bold text-[32px] text-[#1B2D3E] mb-2">You finished!</h1>
        <p className="font-sora font-bold text-[24px] text-[#3ECFB2] mb-8">
          You got {score}/{questions.length} correct!
        </p>
        
        <div className="flex gap-2 mb-12 h-[60px]">
          {Array(score).fill(0).map((_, i) => (
            <motion.span 
              key={i} 
              className="text-4xl"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
            >
              <Star size={36} fill="currentColor" className="text-[#FFB020]" />
            </motion.span>
          ))}
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <button 
            onClick={handlePlayAgain}
            className="w-full min-h-[64px] bg-[#3ECFB2] text-white rounded-2xl font-nunito font-bold text-[20px] shadow-[0_6px_0_#1A9E8C] active:translate-y-1.5 active:shadow-none transition-all"
          >
            <span className="flex items-center justify-center gap-2">Play Again <Gamepad2 size={24} /></span>
          </button>
          <button 
            onClick={() => setActiveGame(null)}
            className="w-full min-h-[64px] bg-white/50 border-2 border-[#3ECFB2] text-[#1A9E8C] rounded-2xl font-nunito font-bold text-[20px] active:translate-y-1 transition-all"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#E8FAF6] z-50 flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex items-center relative">
        <button 
          onClick={() => setActiveGame(null)}
          className="px-4 py-2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl font-nunito font-bold text-[#1B2D3E] shadow-sm flex items-center gap-2"
        >
          <span>←</span> Back
        </button>
      </div>

      {/* Parent Info Button */}
      <button 
        onClick={() => setShowInfo(true)}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-2xl shadow-sm border border-[#3ECFB2]/30 hover:bg-white transition-colors z-50"
        title="For Parents: Science behind this game"
      >
        <Microscope size={24} className="text-[#1B2D3E]" />
      </button>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {questions.map((_, i) => {
          let dotClass = "bg-[#8FA3B1]/30 w-4 h-4 rounded-full";
          if (i < currentQ) dotClass = "bg-[#3ECFB2] w-4 h-4 rounded-full";
          if (i === currentQ) dotClass = "bg-[#3ECFB2]/60 w-5 h-5 rounded-full ring-2 ring-[#3ECFB2]";
          
          return <div key={i} className={`transition-all ${dotClass}`}></div>;
        })}
      </div>

      <div className="flex-1 flex flex-col items-center px-6 max-w-md mx-auto w-full">
        {/* Face Display */}
        <motion.div
          key={currentQ}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={
            lastAnswerCorrect === false 
              ? { x: [0, -6, 6, -6, 6, 0], scale: 1, opacity: 1 } 
              : { scale: 1, opacity: 1, x: 0 }
          }
          transition={{ duration: lastAnswerCorrect === false ? 0.4 : 0.5, type: "spring" }}
          className="text-[120px] my-4 leading-none"
        >
          {q.face}
        </motion.div>

        <h2 className="font-nunito font-bold text-[20px] text-[#1B2D3E] text-center mb-8">
          {q.prompt}
        </h2>

        {/* Answer Buttons */}
        <div className="w-full space-y-4 relative">
          {q.options.map((opt, i) => {
            const isSelected = selectedOpt === i;
            const isHintDisabled = disabledOption === i && !isSelected;
            let btnClass = "bg-white/70 border-white/80";

            if (isSelected) {
              if (lastAnswerCorrect === true) btnClass = "bg-[#3ECFB2]/30 border-[#3ECFB2]";
              if (lastAnswerCorrect === false) btnClass = "bg-[#FFF4E3] border-[#FFA94D]";
            }

            return (
              <motion.div key={i} className="relative">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  animate={isSelected && lastAnswerCorrect === true ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  onClick={() => handleAnswer(i)}
                  disabled={isHintDisabled}
                  className={`w-full min-h-[64px] rounded-2xl backdrop-blur-sm border-2 font-nunito font-bold text-[18px] text-[#1B2D3E] transition-colors relative z-10 ${
                    isHintDisabled ? "opacity-40 grayscale pointer-events-none" : ""
                  } ${btnClass}`}
                >
                  {opt}
                </motion.button>
                
                {isSelected && lastAnswerCorrect === false && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="absolute -bottom-6 left-0 right-0 text-center font-dm-sans text-[14px] text-[#8FA3B1] font-bold"
                  >
                    Try again <Heart size={14} className="inline-block text-[#4A90D9] ml-1" />
                  </motion.div>
                )}
                
                {/* Confetti effect on correct */}
                {isSelected && lastAnswerCorrect === true && (
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {Array(8).fill(0).map((_, idx) => {
                      const angle = (idx / 8) * Math.PI * 2;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                          animate={{ x: Math.cos(angle)*60, y: Math.sin(angle)*60, opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[#3ECFB2] -ml-1.5 -mt-1.5"
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {lastAnswerCorrect === true && (
          <motion.div
            initial={{ y: -50, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 left-1/2 bg-[#3ECFB2] text-white px-8 py-4 rounded-2xl shadow-xl font-nunito font-bold text-[20px] flex items-center gap-2 z-[60]"
          >
            <Star size={24} fill="currentColor" /> Great job!
          </motion.div>
        )}
      </AnimatePresence>

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
                This module uses <strong>Computerized Facial Emotion Recognition (FER)</strong> training. Research demonstrates that guided digital interventions significantly improve emotion identification, reaction time, and social cognition in children and adolescents with Autism Spectrum Disorder.
              </p>
              <a 
                href="https://pubmed.ncbi.nlm.nih.gov/?term=facial+emotion+recognition+autism+computerized" 
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
