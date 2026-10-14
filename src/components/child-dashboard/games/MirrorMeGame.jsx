"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, RotateCcw, Star } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useTelemetryEmitter } from "../../../hooks/useTelemetryEmitter";
import { useSessionRecorder } from "../../../hooks/useRealtimeSync";
import { useCameraEmotion } from "../../../context/CameraEmotionContext";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { summarizeEmotionTimeline } from "../../../lib/emotionUtils";
import Face from "../content/Face";
import { cn } from "../../../lib/cn";

const MODULE_CODE = "mirror-me";
const TARGETS = ["happy", "calm", "sad", "angry", "surprised"];
// "calm" has no dedicated blendshape score — it reads from the neutral score instead.
const SCORE_KEY = { happy: "happy", calm: "neutral", sad: "sad", angry: "angry", surprised: "surprised" };
const HOLD_MS = 800; // how long the expression must be sustained to count
const ITEM_TIMEOUT_MS = 14000;
const ROUNDS = 5;

function pickTargets() {
  const shuffled = [...TARGETS].sort(() => Math.random() - 0.5);
  return Array.from({ length: ROUNDS }, (_, i) => shuffled[i % shuffled.length]);
}

export default function MirrorMeGame() {
  const { setActiveGame, completeModule, remotePaused } = useChildStore();
  const currentMood = useChildStore((s) => s.currentMood);
  const { sendTelemetry, flushTelemetry } = useTelemetryEmitter();
  const { recordSession } = useSessionRecorder();
  const { status: cameraStatus, emotion, emotionConfidence, scores, faceVisible, snapshot, requestCamera, allowed } = useCameraEmotion();
  const { speak } = useSpeak();
  const sound = useSoundEffect();
  const cameraOn = allowed && cameraStatus === "granted";

  const [targets] = useState(pickTargets);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 hold progress on the current target
  const [trials, setTrials] = useState([]);
  const [result, setResult] = useState(null);

  const startedAt = useRef(0);
  const itemShownAt = useRef(0);
  const holdStartedAt = useRef(null);
  const emotionTimeline = useRef([]);
  const lastSnapshot = useRef(null);
  const rafRef = useRef(null);

  const target = targets[index];
  const done = result !== null;

  useEffect(() => {
    requestCamera();
  }, [requestCamera]);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (done) return;
    itemShownAt.current = Date.now();
    holdStartedAt.current = null;
    const t = setTimeout(() => speak(`Can you make a ${target} face?`), index === 0 ? 1200 : 300);
    return () => clearTimeout(t);
  }, [index, target, done, speak]);

  const finish = useCallback(
    async (allTrials) => {
      const score = allTrials.filter((t) => t.correct).length;
      setResult({ score, stars: null });
      flushTelemetry({ status: "idle", activeGame: MODULE_CODE, gameTitle: "Mirror Me", score, targetScore: allTrials.length });
      completeModule(MODULE_CODE);
      const latencies = allTrials.map((t) => t.latencyMs).filter(Number.isFinite);
      const res = await recordSession({
        moduleCode: MODULE_CODE,
        score,
        maxScore: allTrials.length,
        durationSec: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        avgResponseMs: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
        outcome: "completed",
        moodBefore: currentMood,
        trials: allTrials,
        emotionSummary: summarizeEmotionTimeline(emotionTimeline.current),
      });
      setResult({ score, stars: res?.starsEarned ?? 0 });
      speak(score >= allTrials.length - 1 ? `Amazing faces, ${useChildStore.getState().child.name}!` : "All done! Great try.");
      sound("success");
    },
    [flushTelemetry, completeModule, recordSession, currentMood, speak, sound]
  );

  const advance = useCallback(
    (trial) => {
      const all = [...trials, trial];
      setTrials(all);
      if (index + 1 >= targets.length) finish(all);
      else setIndex((i) => i + 1);
    },
    [trials, index, targets.length, finish]
  );

  // Hold-to-confirm loop: while the matching score clears the threshold, accumulate
  // hold time; drop and reset if the expression isn't sustained.
  useEffect(() => {
    if (done || remotePaused || !cameraOn) return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const now = Date.now();
      const elapsed = now - itemShownAt.current;
      const key = SCORE_KEY[target];
      const live = scores?.[key] ?? 0;
      const threshold = key === "neutral" ? 0.5 : 0.32;
      const matching = faceVisible && live >= threshold;

      if (matching) {
        if (holdStartedAt.current == null) holdStartedAt.current = now;
        const held = now - holdStartedAt.current;
        setProgress(Math.min(1, held / HOLD_MS));
        if (held >= HOLD_MS) {
          sound("success");
          speak("Yes! Just like that.");
          advance({ itemId: target, correct: true, latencyMs: elapsed, promptLevel: 0 });
          return;
        }
      } else {
        holdStartedAt.current = null;
        setProgress(0);
      }

      if (elapsed >= ITEM_TIMEOUT_MS) {
        speak("Let's try the next one.");
        advance({ itemId: target, correct: false, latencyMs: null, promptLevel: 4 });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, index, done, remotePaused, cameraOn, scores, faceVisible, advance, sound, speak]);

  // Telemetry + emotion timeline for the after-game summary
  useEffect(() => {
    if (!cameraOn || !emotion) return;
    const t = Math.round((Date.now() - startedAt.current) / 1000);
    const tl = emotionTimeline.current;
    if (!tl.length || tl[tl.length - 1].emotion !== emotion) {
      tl.push({ t, emotion, confidence: emotionConfidence });
      if (tl.length > 20) tl.shift();
    }
  }, [emotion, emotionConfidence, cameraOn]);

  useEffect(() => {
    if (done) return;
    const payload = {};
    if (cameraOn && snapshot && snapshot !== lastSnapshot.current) {
      lastSnapshot.current = snapshot;
      payload.snapshotFrame = snapshot;
    }
    sendTelemetry({
      status: remotePaused ? "paused" : "playing",
      activeGame: MODULE_CODE,
      gameTitle: "Mirror Me",
      score: trials.filter((t) => t.correct).length,
      targetScore: targets.length,
      elapsedSeconds: Math.round((Date.now() - startedAt.current) / 1000),
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
      ...payload,
    });
  }, [index, trials, done, remotePaused, cameraOn, emotion, emotionConfidence, snapshot, sendTelemetry, targets.length]);

  const playAgain = () => {
    setIndex(0);
    setTrials([]);
    setResult(null);
    setProgress(0);
    holdStartedAt.current = null;
    emotionTimeline.current = [];
    startedAt.current = Date.now();
  };

  if (!allowed || (cameraStatus !== "granted" && cameraStatus !== "requesting")) {
    return (
      <div className="fixed inset-0 z-50 bg-canvas flex flex-col items-center justify-center text-center px-6">
        <Camera size={56} className="text-muted" aria-hidden />
        <p className="font-nunito font-extrabold text-2xl text-ink mt-5">Camera needed for this game</p>
        <p className="font-dm-sans text-lg text-ink-soft mt-2 max-w-sm">Ask a grown-up to turn on the camera in Settings to play Mirror Me.</p>
        <button onClick={() => setActiveGame(null)} className="mt-8 h-14 px-6 rounded-2xl clay-btn-primary font-nunito text-xl">Back to games</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-canvas flex flex-col">
      <div className="flex items-center gap-3 p-4 md:p-6">
        <button onClick={() => setActiveGame(null)} className="h-14 px-4 rounded-2xl bg-white ring-1 ring-line flex items-center gap-2 font-nunito font-bold text-lg text-ink" aria-label="Back to games">
          <ArrowLeft size={22} aria-hidden /> Back
        </button>
        <div className="flex-1 flex justify-center gap-2" aria-label={`Face ${Math.min(index + 1, targets.length)} of ${targets.length}`}>
          {targets.map((t, i) => (
            <span key={i} className={cn("h-3 w-3 rounded-full transition-colors", i < trials.length ? "bg-teal-600" : i === index && !done ? "bg-teal-400" : "bg-line")} />
          ))}
        </div>
        <span className="w-14" />
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="flex gap-2 mb-6" aria-hidden>
            {Array.from({ length: Math.max(1, result.stars ?? 1) }).map((_, i) => (
              <motion.span key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 * i }}>
                <Star size={52} className="text-amber-400" fill="currentColor" />
              </motion.span>
            ))}
          </div>
          <h2 className="font-nunito font-extrabold text-4xl text-ink">All done!</h2>
          <p className="font-dm-sans text-xl text-ink-soft mt-3">{result.stars == null ? "Saving…" : `You made ${result.score} of ${targets.length} faces.`}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button onClick={playAgain} className="flex-1 h-16 rounded-2xl bg-white ring-1 ring-line font-nunito font-bold text-xl text-ink flex items-center justify-center gap-2">
              <RotateCcw size={22} aria-hidden /> Again
            </button>
            <button onClick={() => setActiveGame(null)} className="flex-1 h-16 rounded-2xl clay-btn-primary font-nunito text-xl">Finish</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 pb-8">
          <Face emotion={target} intensity="high" size={200} title={`Make a ${target} face`} />
          <p className="font-nunito font-extrabold text-3xl text-ink text-center">Can you make this face?</p>
          <div className="w-full max-w-xs h-5 rounded-full bg-mint overflow-hidden" role="img" aria-label="How close your face is to matching">
            <motion.div className="h-full rounded-full bg-teal-600" animate={{ width: `${Math.round(progress * 100)}%` }} transition={{ ease: "linear", duration: 0.1 }} />
          </div>
          {!faceVisible && <p className="font-dm-sans text-base text-muted">Make sure your face is in view.</p>}
          {remotePaused && <p className="font-nunito font-bold text-xl text-ink-soft">Paused for a moment…</p>}
        </div>
      )}
    </div>
  );
}
