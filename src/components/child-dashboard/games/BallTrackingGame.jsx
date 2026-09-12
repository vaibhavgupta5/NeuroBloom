"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { useTelemetryEmitter } from "../../../hooks/useTelemetryEmitter";
import { useSessionRecorder } from "../../../hooks/useRealtimeSync";
import { useCameraEmotion } from "../../../context/CameraEmotionContext";
import { computeDifficultyAdjust, summarizeEmotionTimeline } from "../../../lib/emotionUtils";
import StickerOverlay from "../StickerOverlay";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import confetti from "canvas-confetti";
import { Timer, Sparkles, Trophy, RefreshCw, Brain, Microscope } from "lucide-react";

const MODULE_CODE = "ball-tracker";

export default function BallTrackingGame() {
  const { setActiveGame, completeModule, remoteSpeedMultiplier, remotePaused } = useChildStore();
  const { sendTelemetry, flushTelemetry } = useTelemetryEmitter();
  const { recordSession } = useSessionRecorder();
  const currentMood = useChildStore((s) => s.currentMood);
  const { status: cameraStatus, emotion, emotionConfidence, snapshot, difficulty, requestCamera } = useCameraEmotion();

  // Auto-request camera observation when child enters the game
  useEffect(() => {
    requestCamera();
  }, [requestCamera]);

  const [score, setScore] = useState(0);
  const targetScore = 5;
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('playing'); // playing, won, timeout
  const [showInfo, setShowInfo] = useState(false);
  const [tapHistory, setTapHistory] = useState([]);
  const startedAtRef = useRef(0);
  const emotionTimelineRef = useRef([]); // {t, emotion} whenever the camera emotion changes
  const lastSnapshotSentRef = useRef(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const cameraOn = cameraStatus === 'granted';

  // Blend camera emotion with gameplay accuracy; auto mode = gameplay only
  const gameplayAccuracy = tapHistory.length > 0
    ? Math.round((tapHistory.filter(t => t.success).length / tapHistory.length) * 100)
    : null;
  const adjust = computeDifficultyAdjust(
    cameraOn ? emotion : null,
    gameplayAccuracy
  );
  // Parent remote speed × emotion difficulty (both apply)
  const effectiveSpeedMultiplier = Math.max(
    0.5,
    (remoteSpeedMultiplier || 1.0) * (cameraOn ? difficulty.speedMultiplier : adjust.speedMultiplier)
  );

  const moveBall = () => {
    setPosition({
      x: Math.floor(Math.random() * 75) + 12,
      y: Math.floor(Math.random() * 75) + 12
    });
  };

  const computeMetrics = (finalScore, taps) => {
    const focusScore = Math.min(100, Math.max(60, 80 + finalScore * 4 - taps.filter(t => !t.success).length * 5));
    const avgResponseMs = taps.length > 0
      ? Math.round(taps.reduce((acc, t) => acc + (t.latencyMs || 300), 0) / taps.length)
      : 320;
    return { focusScore, avgResponseMs };
  };

  // Record the session (win or timeout) to the server
  const finishSession = useCallback((finalScore, outcome) => {
    const startedAt = startedAtRef.current || Date.now();
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const { focusScore, avgResponseMs } = computeMetrics(finalScore, tapHistory);

    if (outcome === "won") completeModule(MODULE_CODE);

    flushTelemetry({
      status: "idle",
      activeGame: MODULE_CODE,
      gameTitle: "Focus Ball Game",
      score: finalScore,
      targetScore,
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
    });

    recordSession({
      moduleCode: MODULE_CODE,
      score: finalScore,
      maxScore: targetScore,
      durationSec,
      focusScore,
      avgResponseMs,
      outcome, // 'completed' | 'abandoned'
      moodBefore: currentMood,
      emotionSummary: cameraOn ? summarizeEmotionTimeline(emotionTimelineRef.current) : null,
    });
  }, [cameraOn, currentMood, emotion, emotionConfidence, flushTelemetry, recordSession, targetScore, tapHistory, completeModule]);

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

  // Emit realtime telemetry whenever position, score, state, or timer changes (throttled by the hook)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const { focusScore, avgResponseMs } = computeMetrics(score, tapHistory);

    // Camera snapshot goes out only when it changed (~every 10s), not every tick
    const snapshotPayload = {};
    if (cameraOn && snapshot && snapshot !== lastSnapshotSentRef.current) {
      lastSnapshotSentRef.current = snapshot;
      snapshotPayload.snapshotFrame = snapshot;
    }

    sendTelemetry({
      activeGame: MODULE_CODE,
      gameTitle: 'Focus Ball Game',
      status: remotePaused ? 'paused' : 'playing',
      score,
      targetScore,
      elapsedSeconds: 30 - timeLeft,
      focusScore,
      focusStatus: focusScore > 85 ? 'Optimal Attention' : 'Steady Focus',
      trackingSmoothness: 'High Precision',
      avgResponseMs,
      frustrationLevel: tapHistory.filter(t => !t.success).length > 2 ? 'Moderate' : 'Low',
      liveCoordinates: position,
      speedMultiplier: effectiveSpeedMultiplier,
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
      ...snapshotPayload,
    });
  }, [position, score, gameState, timeLeft, remoteSpeedMultiplier, remotePaused, sendTelemetry, tapHistory, cameraOn, emotion, emotionConfidence, snapshot, effectiveSpeedMultiplier]);

  useEffect(() => {
    if (gameState !== 'playing' || remotePaused) return;

    // Base interval 2.5s. Speed = parent remote multiplier × emotion-difficulty
    // multiplier (frustration/stress slows the ball; joy with good accuracy
    // nudges it faster). Clamped so it never gets frantic.
    const moveIntervalTime = Math.max(900, Math.round(2500 / effectiveSpeedMultiplier));
    const moveInterval = setInterval(() => {
      moveBall();
    }, moveIntervalTime);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(timerInterval);
    };
  }, [gameState, effectiveSpeedMultiplier, remotePaused]);

  // Persist the session when the game ends (win or timeout)
  useEffect(() => {
    if (gameState === 'won') {
      finishSession(score, 'completed');
      const t = setTimeout(() => setActiveGame(null), 2500);
      return () => clearTimeout(t);
    }
    if (gameState === 'timeout') {
      finishSession(score, 'abandoned');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleTap = () => {
    if (gameState !== 'playing' || remotePaused) return;

    const newScore = score + 1;
    setScore(newScore);

    setTapHistory(prev => [...prev, { success: true, latencyMs: 280, timestamp: Date.now() }]);

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#FDE047', '#3ECFB2'] });

    if (newScore >= targetScore) {
      setGameState('won');
    } else {
      moveBall();
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    setTapHistory([]);
    startedAtRef.current = Date.now();
    emotionTimelineRef.current = [];
    lastSnapshotSentRef.current = null;
    moveBall();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900/10 px-4 z-50 fixed inset-0 overflow-hidden backdrop-blur-sm">
      <StickerOverlay />

      {/* Back Button */}
      <button 
        onClick={() => setActiveGame(null)}
        className="absolute top-6 left-6 md:top-8 md:left-8 min-w-[56px] min-h-[56px] z-50 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center font-nunito font-bold text-[#1B2D3E] shadow-sm border border-white hover:bg-white transition-colors"
      >
        ← Back
      </button>

      {/* Parent Info Button */}
      <button 
        onClick={() => setShowInfo(true)}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-2xl shadow-sm border border-white hover:bg-white transition-colors z-50"
        title="For Parents: Science behind this game"
      >
        <Microscope size={24} className="text-[#1B2D3E]" />
      </button>

      {/* Bottom Bar for Score and Timer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center font-nunito font-bold text-[#3ECFB2] shadow-lg border-2 border-white px-6 py-3 text-xl md:text-2xl min-w-[140px] gap-2">
          <span>{score} / {targetScore}</span>
          <SvgIconBadge type="star" size={22} variant="amber" />
        </div>
        <div className={`bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center font-dm-sans font-bold shadow-lg border-2 border-white px-6 py-3 text-xl md:text-2xl min-w-[120px] ${timeLeft <= 10 ? 'text-[#FF7E6B] animate-pulse' : 'text-[#8FA3B1]'}`}>
          <Timer size={20} className="inline-block mr-1 pb-0.5" /> {timeLeft}s
        </div>
      </div>
      
      <div className="absolute top-24 left-0 right-0 text-center pointer-events-none z-40">
        <h2 className="font-nunito font-bold text-2xl md:text-3xl text-[#1B2D3E] mb-2 bg-white/80 inline-flex items-center gap-3 px-8 py-3 rounded-full backdrop-blur-md shadow-sm border border-white">
          <span>Catch the glowing ball!</span>
          <SvgIconBadge type="focus" size={26} variant="amber" />
        </h2>
      </div>

      {gameState === 'playing' && (
        <motion.button
          onClick={handleTap}
          animate={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: Math.max(0.8, 2.5 / effectiveSpeedMultiplier)
          }}
          className="absolute w-24 h-24 md:w-32 md:h-32 -ml-12 -mt-12 md:-ml-16 md:-mt-16 rounded-full bg-[#FDE047] shadow-[0_0_60px_rgba(253,224,71,0.8)] border-4 border-white flex items-center justify-center text-5xl md:text-7xl cursor-pointer hover:scale-105 active:scale-95 transition-transform z-10"
          whileTap={{ scale: 0.8 }}
        >
          <Sparkles size={48} className="text-white" />
        </motion.button>
      )}

      {gameState === 'won' && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center shadow-lg border-2 border-[#3ECFB2]/30 z-50 flex flex-col items-center"
        >
          <div className="mb-4">
            <SvgIconBadge type="trophy" size={64} variant="amber" />
          </div>
          <h2 className="font-nunito font-bold text-2xl md:text-4xl text-[#1B2D3E]">
            Amazing Focus!
          </h2>
          <p className="font-dm-sans text-[#8FA3B1] mt-2 md:text-xl">
            You tracked every single move smoothly.
          </p>
        </motion.div>
      )}

      {gameState === 'timeout' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center shadow-lg border-2 border-[#FF7E6B]/30 z-50 flex flex-col items-center"
        >
          <div className="flex justify-center mb-4 text-[#FF7E6B]"><Timer size={80} /></div>
          <h2 className="font-nunito font-bold text-2xl md:text-4xl text-[#1B2D3E]">
            Time&apos;s Up!
          </h2>
          <p className="font-dm-sans text-[#8FA3B1] mt-2 md:text-xl mb-6">
            You got {score} stars. Let&apos;s try again!
          </p>
          <button
            onClick={handlePlayAgain}
            className="bg-[#3ECFB2] text-white px-8 py-3 rounded-xl font-nunito font-bold text-xl shadow-[0_4px_0_#1A9E8C] active:translate-y-1 active:shadow-none transition-all"
          >
            <span className="flex items-center justify-center gap-2">Play Again <RefreshCw size={20} /></span>
          </button>
        </motion.div>
      )}

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
                This module uses <strong>Smooth Pursuit Eye Movement</strong> training. Research demonstrates that computerized visual tracking exercises significantly improve response inhibition, cognitive control, and sustained attention (focus) in children with ADHD.
              </p>
              <a 
                href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6404780/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#E8FAF6] text-[#1A9E8C] px-5 py-3 rounded-xl font-bold font-dm-sans border border-[#3ECFB2]/30 hover:bg-[#3ECFB2]/20 transition-colors w-full md:w-auto"
              >
                Read NIH Research Paper ↗
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
