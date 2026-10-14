"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, RefreshCw, Sparkles, Star, Timer } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useTelemetryEmitter } from "../../../hooks/useTelemetryEmitter";
import { useSessionRecorder } from "../../../hooks/useRealtimeSync";
import { useCameraEmotion } from "../../../context/CameraEmotionContext";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { computeDifficultyAdjust, summarizeEmotionTimeline, TENSE_EXPRESSIONS } from "../../../lib/emotionUtils";
import { SvgIconBadge } from "../../ui/SvgIconBadge";

const MODULE_CODE = "ball-tracker";
const SKILL = "Attention";
// level → how many catches to finish, and the base pace between ball moves (ms)
const LEVELS = { 1: { target: 4, baseMs: 2900 }, 2: { target: 5, baseMs: 2400 }, 3: { target: 6, baseMs: 1900 } };
const DURATION_SEC = 30;

export default function BallTrackingGame() {
  const { setActiveGame, completeModule, remoteSpeedMultiplier, remotePaused, offerBreak } = useChildStore();
  const child = useChildStore((s) => s.child);
  const currentMood = useChildStore((s) => s.currentMood);
  const level = child.levels?.[SKILL] || 1;
  const { target: targetScore, baseMs } = LEVELS[level] || LEVELS[1];
  const showTimer = Boolean(child.sensoryProfile?.showTimer);

  const { sendTelemetry, flushTelemetry } = useTelemetryEmitter();
  const { recordSession } = useSessionRecorder();
  const { status: cameraStatus, emotion, emotionConfidence, snapshot, difficulty, requestCamera, allowed } = useCameraEmotion();
  const { speak } = useSpeak();
  const sound = useSoundEffect();
  const cameraOn = allowed && cameraStatus === "granted";

  useEffect(() => {
    requestCamera();
  }, [requestCamera]);

  const [score, setScore] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC);
  const [gameState, setGameState] = useState("playing"); // playing | won | timeout
  const [tapHistory, setTapHistory] = useState([]);

  const startedAtRef = useRef(0);
  const ballMovedAtRef = useRef(0);
  const emotionTimelineRef = useRef([]);
  const lastSnapshotSentRef = useRef(null);
  const breakOfferedRef = useRef(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    ballMovedAtRef.current = Date.now();
    speak("Catch the glowing ball!");
  }, [speak]);

  const gameplayAccuracy = tapHistory.length > 0 ? Math.round((tapHistory.filter((t) => t.success).length / tapHistory.length) * 100) : null;
  const adjust = computeDifficultyAdjust(cameraOn ? emotion : null, gameplayAccuracy);
  const effectiveSpeedMultiplier = Math.max(0.5, (remoteSpeedMultiplier || 1.0) * (cameraOn ? difficulty.speedMultiplier : adjust.speedMultiplier));

  const moveBall = () => {
    ballMovedAtRef.current = Date.now();
    setPosition({ x: Math.floor(Math.random() * 75) + 12, y: Math.floor(Math.random() * 75) + 12 });
  };

  const computeMetrics = (finalScore, taps) => {
    const focusScore = Math.min(100, Math.max(60, 80 + finalScore * 4 - taps.filter((t) => !t.success).length * 5));
    const hits = taps.filter((t) => t.success && t.latencyMs != null);
    const avgResponseMs = hits.length > 0 ? Math.round(hits.reduce((acc, t) => acc + t.latencyMs, 0) / hits.length) : 0;
    return { focusScore, avgResponseMs };
  };

  const finishSession = useCallback(
    (finalScore, outcome, taps) => {
      const startedAt = startedAtRef.current || Date.now();
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const { focusScore, avgResponseMs } = computeMetrics(finalScore, taps);

      if (outcome === "completed") completeModule(MODULE_CODE);

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
        outcome,
        moodBefore: currentMood,
        level,
        trials: taps.map((t, i) => ({ itemId: `tap-${i}`, correct: t.success, latencyMs: t.latencyMs, promptLevel: 0 })),
        emotionSummary: cameraOn ? summarizeEmotionTimeline(emotionTimelineRef.current) : null,
      });
      speak(outcome === "completed" ? "Amazing focus!" : "All done — nice work!");
      sound("success");
    },
    [cameraOn, currentMood, emotion, emotionConfidence, flushTelemetry, recordSession, targetScore, completeModule, level, speak, sound]
  );

  // Soft regulation signal: offer a break if the camera reads a tense expression
  useEffect(() => {
    if (!cameraOn || !emotion) return;
    const t = Math.round((Date.now() - startedAtRef.current) / 1000);
    const timeline = emotionTimelineRef.current;
    if (timeline.length === 0 || timeline[timeline.length - 1].emotion !== emotion) {
      timeline.push({ t, emotion, confidence: emotionConfidence });
      if (timeline.length > 20) timeline.shift();
    }
    if (TENSE_EXPRESSIONS.includes(emotion) && emotionConfidence >= 0.45 && !breakOfferedRef.current) {
      breakOfferedRef.current = true;
      offerBreak("auto");
    }
  }, [emotion, emotionConfidence, cameraOn, offerBreak]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const { focusScore, avgResponseMs } = computeMetrics(score, tapHistory);
    const snapshotPayload = {};
    if (cameraOn && snapshot && snapshot !== lastSnapshotSentRef.current) {
      lastSnapshotSentRef.current = snapshot;
      snapshotPayload.snapshotFrame = snapshot;
    }
    sendTelemetry({
      activeGame: MODULE_CODE,
      gameTitle: "Focus Ball Game",
      status: remotePaused ? "paused" : "playing",
      score,
      targetScore,
      elapsedSeconds: DURATION_SEC - timeLeft,
      focusScore,
      accuracy: gameplayAccuracy,
      promptLevel: 0,
      level,
      avgResponseMs,
      liveCoordinates: position,
      speedMultiplier: effectiveSpeedMultiplier,
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
      ...snapshotPayload,
    });
  }, [position, score, gameState, timeLeft, remotePaused, sendTelemetry, tapHistory, cameraOn, emotion, emotionConfidence, snapshot, effectiveSpeedMultiplier, targetScore, level, gameplayAccuracy]);

  useEffect(() => {
    if (gameState !== "playing" || remotePaused) return;
    const moveIntervalTime = Math.max(900, Math.round(baseMs / effectiveSpeedMultiplier));
    const moveInterval = setInterval(moveBall, moveIntervalTime);
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(moveInterval);
      clearInterval(timerInterval);
    };
  }, [gameState, effectiveSpeedMultiplier, remotePaused, baseMs]);

  useEffect(() => {
    if (gameState === "won") {
      finishSession(score, "completed", tapHistory);
      const t = setTimeout(() => setActiveGame(null), 2500);
      return () => clearTimeout(t);
    }
    if (gameState === "timeout") {
      finishSession(score, "abandoned", tapHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleMiss = (e) => {
    if (e.target !== e.currentTarget || gameState !== "playing" || remotePaused) return;
    setTapHistory((prev) => [...prev, { success: false, latencyMs: null, timestamp: Date.now() }]);
  };

  const handleTap = () => {
    if (gameState !== "playing" || remotePaused) return;
    const newScore = score + 1;
    setScore(newScore);
    const now = Date.now();
    setTapHistory((prev) => [...prev, { success: true, latencyMs: now - ballMovedAtRef.current, timestamp: now }]);
    sound("tap");

    if (newScore >= targetScore) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors: ["#FFB020", "#17977F"] });
      setGameState("won");
    } else {
      moveBall();
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(DURATION_SEC);
    setGameState("playing");
    setTapHistory([]);
    startedAtRef.current = Date.now();
    emotionTimelineRef.current = [];
    lastSnapshotSentRef.current = null;
    breakOfferedRef.current = false;
    moveBall();
  };

  const timePct = timeLeft / DURATION_SEC;

  return (
    <div onPointerDown={handleMiss} className="fixed inset-0 z-50 bg-canvas overflow-hidden">
      <button
        onClick={() => setActiveGame(null)}
        className="absolute top-6 left-6 h-14 px-4 z-50 bg-white ring-1 ring-line rounded-2xl flex items-center gap-2 font-nunito font-bold text-lg text-ink"
        aria-label="Back to games"
      >
        <ArrowLeft size={22} aria-hidden /> Back
      </button>

      <div className="absolute top-24 left-0 right-0 text-center pointer-events-none z-30 px-4">
        <h2 className="font-nunito font-bold text-2xl md:text-3xl text-ink inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white shadow-[var(--shadow-card)]">
          <span>Catch the glowing ball!</span>
          <SvgIconBadge type="focus" size={26} variant="amber" />
        </h2>
      </div>

      {gameState === "playing" && (
        <motion.button
          onClick={handleTap}
          animate={{ left: `${position.x}%`, top: `${position.y}%` }}
          transition={{ type: "tween", ease: "easeInOut", duration: Math.max(0.8, baseMs / 1000 / effectiveSpeedMultiplier) }}
          className="absolute w-24 h-24 md:w-32 md:h-32 -ml-12 -mt-12 md:-ml-16 md:-mt-16 rounded-full bg-amber-400 shadow-[0_0_60px_rgba(229,148,0,0.5)] ring-4 ring-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-10"
          whileTap={{ scale: 0.8 }}
          aria-label="Tap the ball"
        >
          <Sparkles size={48} className="text-white" aria-hidden />
        </motion.button>
      )}

      {gameState === "won" && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-40 bg-canvas/70">
          <SvgIconBadge type="trophy" size={64} variant="amber" />
          <h2 className="font-nunito font-extrabold text-3xl md:text-4xl text-ink mt-4">Amazing focus!</h2>
          <p className="font-dm-sans text-ink-soft mt-2 md:text-xl">You tracked every single move smoothly.</p>
        </motion.div>
      )}

      {gameState === "timeout" && (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-40 bg-canvas/70">
          <Timer size={64} className="text-ink-soft" aria-hidden />
          <h2 className="font-nunito font-extrabold text-3xl md:text-4xl text-ink mt-4">All done — nice work!</h2>
          <p className="font-dm-sans text-ink-soft mt-2 md:text-xl mb-6">You caught {score} {score === 1 ? "star" : "stars"}. Want to try again?</p>
          <button onClick={handlePlayAgain} className="clay-btn-primary h-16 px-8 rounded-2xl font-nunito text-xl flex items-center gap-2">
            Play again <RefreshCw size={20} aria-hidden />
          </button>
        </motion.div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <div className="bg-white rounded-2xl flex items-center justify-center font-nunito font-bold text-teal-700 shadow-[var(--shadow-card)] px-6 py-3 text-xl md:text-2xl min-w-[140px] gap-2">
          <span>{score} / {targetScore}</span>
          <Star size={22} className="text-amber-400" fill="currentColor" aria-hidden />
        </div>
        {showTimer && (
          <div className="relative w-16 h-16" role="img" aria-label={`${timeLeft} seconds left`}>
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="white" stroke="#E3EEEB" strokeWidth="8" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#17977F" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - timePct)} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-sora font-semibold text-ink tabular text-sm">{timeLeft}</span>
          </div>
        )}
      </div>
    </div>
  );
}
