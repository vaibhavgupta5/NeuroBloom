"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, RotateCcw, Star, Volume2 } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useTelemetryEmitter } from "../../../hooks/useTelemetryEmitter";
import { useSessionRecorder } from "../../../hooks/useRealtimeSync";
import { useCameraEmotion } from "../../../context/CameraEmotionContext";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { summarizeEmotionTimeline, TENSE_EXPRESSIONS } from "../../../lib/emotionUtils";
import { cn } from "../../../lib/cn";

const ITEMS_PER_SESSION = 6;
const MAX_PROMPT = 4; // 0 none · 1 spoken · 2 highlight · 3 fewer choices · 4 shown the answer
const TIME_DELAY_MS = [8000, 10000]; // no tap → step up to spoken, then highlight
const MISSES_BEFORE_BREAK = 3;

/**
 * Shared engine for matching games. buildItems(level) returns
 * [{ id, prompt, visual, choices: [{ id, label, render, correct }] }].
 * Implements least-to-most prompting with a time delay, records one trial per item.
 */
export default function QuizGame({ moduleCode, title, skill, buildItems, introText }) {
  const { setActiveGame, completeModule, offerBreak, remotePaused } = useChildStore();
  const child = useChildStore((s) => s.child);
  const currentMood = useChildStore((s) => s.currentMood);
  const level = child.levels?.[skill] || 1;

  const { sendTelemetry, flushTelemetry } = useTelemetryEmitter();
  const { recordSession } = useSessionRecorder();
  const { status: cameraStatus, emotion, emotionConfidence, snapshot, requestCamera, allowed } = useCameraEmotion();
  const { speak } = useSpeak();
  const sound = useSoundEffect();
  const cameraOn = allowed && cameraStatus === "granted";

  const [items, setItems] = useState(() => buildItems(level).slice(0, ITEMS_PER_SESSION));
  const [index, setIndex] = useState(0);
  const [promptLevel, setPromptLevel] = useState(0);
  const [removed, setRemoved] = useState([]);
  const [feedback, setFeedback] = useState(null); // { choiceId, correct }
  const [trials, setTrials] = useState([]);
  const [result, setResult] = useState(null); // { score, stars }
  const [round, setRound] = useState(0);

  const startedAt = useRef(0);
  const itemShownAt = useRef(0);
  const firstTapLatency = useRef(null);
  const missStreak = useRef(0);
  const breakOffered = useRef(false);
  const emotionTimeline = useRef([]);
  const lastSnapshot = useRef(null);

  const item = items[index];
  const done = result !== null;

  useEffect(() => {
    requestCamera();
  }, [requestCamera]);

  // New round: reset clocks and say the instruction
  useEffect(() => {
    startedAt.current = Date.now();
    const t = setTimeout(() => speak(introText), 300);
    return () => clearTimeout(t);
  }, [round, introText, speak]);

  // Each new item: reset its clock and read the prompt aloud
  useEffect(() => {
    if (!item || done) return;
    itemShownAt.current = Date.now();
    firstTapLatency.current = null;
    const t = setTimeout(() => speak(item.prompt), index === 0 ? 1800 : 400);
    return () => clearTimeout(t);
  }, [item, index, done, speak]);

  // Constant time delay: if no answer comes, step up the prompt
  useEffect(() => {
    if (!item || done || remotePaused || promptLevel >= TIME_DELAY_MS.length) return;
    const t = setTimeout(() => {
      setPromptLevel((p) => Math.max(p, promptLevel + 1));
      if (promptLevel === 0) speak(item.prompt);
    }, TIME_DELAY_MS[promptLevel]);
    return () => clearTimeout(t);
  }, [item, promptLevel, done, remotePaused, speak]);

  // Soft regulation signal from the camera: offer (never force) a break
  useEffect(() => {
    if (!cameraOn || !emotion) return;
    const t = Math.round((Date.now() - startedAt.current) / 1000);
    const tl = emotionTimeline.current;
    if (!tl.length || tl[tl.length - 1].emotion !== emotion) {
      tl.push({ t, emotion, confidence: emotionConfidence });
      if (tl.length > 20) tl.shift();
    }
    if (TENSE_EXPRESSIONS.includes(emotion) && emotionConfidence >= 0.45 && !breakOffered.current) {
      breakOffered.current = true;
      offerBreak("auto");
    }
  }, [emotion, emotionConfidence, cameraOn, offerBreak]);

  const correctCount = trials.filter((t) => t.correct).length;
  const accuracy = trials.length ? Math.round((correctCount / trials.length) * 100) : null;

  useEffect(() => {
    if (done) return;
    const payload = {};
    if (cameraOn && snapshot && snapshot !== lastSnapshot.current) {
      lastSnapshot.current = snapshot;
      payload.snapshotFrame = snapshot;
    }
    sendTelemetry({
      status: remotePaused ? "paused" : "playing",
      activeGame: moduleCode,
      gameTitle: title,
      score: correctCount,
      targetScore: items.length,
      elapsedSeconds: Math.round((Date.now() - startedAt.current) / 1000),
      accuracy,
      promptLevel,
      level,
      emotion: cameraOn ? emotion : null,
      emotionConfidence: cameraOn ? emotionConfidence : 0,
      ...payload,
    });
  }, [index, promptLevel, correctCount, accuracy, done, remotePaused, cameraOn, emotion, emotionConfidence, snapshot, sendTelemetry, moduleCode, title, items.length, level]);

  const finish = useCallback(
    async (allTrials) => {
      const score = allTrials.filter((t) => t.correct).length;
      setResult({ score, stars: null });
      flushTelemetry({ status: "idle", activeGame: moduleCode, gameTitle: title, score, targetScore: allTrials.length });
      completeModule(moduleCode);
      const latencies = allTrials.map((t) => t.latencyMs).filter(Number.isFinite);
      const res = await recordSession({
        moduleCode,
        score,
        maxScore: allTrials.length,
        durationSec: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        avgResponseMs: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
        outcome: "completed",
        moodBefore: currentMood,
        wordsLearned: allTrials.filter((t) => t.correct && t.promptLevel === 0).length,
        level,
        trials: allTrials,
        emotionSummary: cameraOn ? summarizeEmotionTimeline(emotionTimeline.current) : null,
      });
      setResult({ score, stars: res?.starsEarned ?? 0, newLevel: res?.newLevel });
      speak(score >= allTrials.length - 1 ? `Wonderful! You did it, ${child.name}!` : `All done! Nice work, ${child.name}.`);
      sound("success");
    },
    [flushTelemetry, moduleCode, title, completeModule, recordSession, currentMood, level, cameraOn, speak, child.name, sound]
  );

  const advance = useCallback(
    (trial) => {
      const all = [...trials, trial];
      setTrials(all);
      setFeedback(null);
      setPromptLevel(0);
      setRemoved([]);
      if (index + 1 >= items.length) finish(all);
      else setIndex((i) => i + 1);
    },
    [trials, index, items.length, finish]
  );

  const choose = useCallback(
    (choice) => {
      if (feedback?.correct || remotePaused || done) return;
      const now = Date.now();
      if (firstTapLatency.current == null) firstTapLatency.current = now - itemShownAt.current;

      if (choice.correct) {
        missStreak.current = 0;
        setFeedback({ choiceId: choice.id, correct: true });
        sound("success");
        speak(promptLevel === 0 ? "Yes!" : `Yes, that's ${choice.label}.`);
        const trial = { itemId: item.id, correct: promptLevel < MAX_PROMPT, latencyMs: firstTapLatency.current, promptLevel };
        setTimeout(() => advance(trial), 1100);
        return;
      }

      missStreak.current += 1;
      sound("gentle");
      setFeedback({ choiceId: choice.id, correct: false });
      setTimeout(() => setFeedback(null), 700);
      const next = Math.min(MAX_PROMPT, promptLevel + 1);
      setPromptLevel(next);
      if (next >= 3) {
        const wrong = item.choices.filter((c) => !c.correct && !removed.includes(c.id));
        const keep = next === 3 ? 1 : 0;
        setRemoved((r) => [...r, ...wrong.slice(0, Math.max(0, wrong.length - keep)).map((c) => c.id)]);
      }
      speak(next === MAX_PROMPT ? `This one is ${item.choices.find((c) => c.correct).label}. Tap it.` : `That's ${choice.label}. ${item.prompt}`);

      if (missStreak.current >= MISSES_BEFORE_BREAK && !breakOffered.current) {
        breakOffered.current = true;
        offerBreak("auto");
      }
    },
    [feedback, remotePaused, done, item, promptLevel, removed, sound, speak, offerBreak, advance]
  );

  const playAgain = () => {
    setItems(buildItems(level).slice(0, ITEMS_PER_SESSION));
    setIndex(0);
    setTrials([]);
    setResult(null);
    setPromptLevel(0);
    setRemoved([]);
    missStreak.current = 0;
    breakOffered.current = false;
    emotionTimeline.current = [];
    setRound((r) => r + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-canvas flex flex-col">
      <div className="flex items-center gap-3 p-4 md:p-6">
        <button onClick={() => setActiveGame(null)} className="h-14 px-4 rounded-2xl bg-white ring-1 ring-line flex items-center gap-2 font-nunito font-bold text-lg text-ink" aria-label="Back to games">
          <ArrowLeft size={22} aria-hidden /> Back
        </button>
        <div className="flex-1 flex justify-center gap-2" aria-label={`Question ${Math.min(index + 1, items.length)} of ${items.length}`}>
          {items.map((it, i) => (
            <span key={it.id} className={cn("h-3 rounded-full transition-all", i < trials.length ? "w-3 bg-teal-600" : i === index && !done ? "w-8 bg-teal-400" : "w-3 bg-line")} />
          ))}
        </div>
        {!done && (
          <button onClick={() => speak(item.prompt, { force: true })} className="w-14 h-14 rounded-2xl bg-white ring-1 ring-line flex items-center justify-center text-teal-700" aria-label="Hear it again">
            <Volume2 size={26} />
          </button>
        )}
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
          <p className="font-dm-sans text-xl text-ink-soft mt-3">
            {result.stars == null ? "Saving…" : result.stars > 0 ? `You earned ${result.stars} ${result.stars === 1 ? "star" : "stars"}.` : "Great practice!"}
          </p>
          {result.newLevel && <p className="font-dm-sans text-lg text-teal-700 font-bold mt-2">New level unlocked next time!</p>}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button onClick={playAgain} className="flex-1 h-16 rounded-2xl bg-white ring-1 ring-line font-nunito font-bold text-xl text-ink flex items-center justify-center gap-2">
              <RotateCcw size={22} aria-hidden /> Again
            </button>
            <button onClick={() => setActiveGame(null)} className="flex-1 h-16 rounded-2xl clay-btn-primary font-nunito text-xl">
              Finish
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 px-4 pb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-3xl bg-white p-4 md:p-6 shadow-[var(--shadow-card)]">{item.visual}</div>
            <p className="font-nunito font-extrabold text-2xl md:text-3xl text-ink text-center text-balance">{item.prompt}</p>
          </div>
          <div className={cn("grid gap-3 md:gap-5 w-full max-w-3xl", item.choices.length <= 2 ? "grid-cols-2 max-w-xl" : item.choices.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>
            {item.choices.map((c) => {
              const hidden = removed.includes(c.id);
              const highlighted = promptLevel >= 2 && c.correct;
              const isFeedback = feedback?.choiceId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => choose(c)}
                  disabled={hidden}
                  aria-label={c.label}
                  className={cn(
                    "relative min-h-36 md:min-h-44 rounded-3xl bg-white flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 ring-1 ring-line",
                    hidden && "opacity-0 pointer-events-none",
                    highlighted && "ring-4 ring-teal-400",
                    isFeedback && feedback.correct && "ring-4 ring-teal-700 bg-teal-50",
                    isFeedback && !feedback.correct && "bg-canvas opacity-60"
                  )}
                >
                  {c.render}
                  {c.showLabel && <span className="font-nunito font-bold text-xl text-ink">{c.label}</span>}
                  {promptLevel === MAX_PROMPT && c.correct && (
                    <Hand size={34} className="absolute -bottom-3 -right-2 text-coral-700 rotate-[-20deg]" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
          {remotePaused && <p className="font-nunito font-bold text-xl text-ink-soft">Paused for a moment…</p>}
        </div>
      )}
    </div>
  );
}
