"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wind } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { api } from "../../../lib/api";
import Face from "../content/Face";
import { cn } from "../../../lib/cn";

const MOODS = [
  { id: "great", label: "Great", face: ["happy", "high"] },
  { id: "good", label: "Good", face: ["happy", "low"] },
  { id: "ok", label: "Okay", face: ["calm", "high"] },
  { id: "notgreat", label: "Not great", face: ["sad", "low"] },
  { id: "sad", label: "Sad", face: ["sad", "high"] },
];

function MoodPicker({ title, onPick, selected }) {
  const { speak } = useSpeak();
  return (
    <section>
      <h2 className="font-nunito font-extrabold text-3xl text-ink">{title}</h2>
      <ul className="mt-5 grid grid-cols-3 md:grid-cols-5 gap-3">
        {MOODS.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => { speak(m.label); onPick(m.id); }}
              aria-pressed={selected === m.id}
              className={cn("w-full rounded-3xl p-3 flex flex-col items-center gap-1 bg-white", selected === m.id ? "ring-4 ring-teal-400" : "ring-1 ring-line")}
            >
              <Face emotion={m.face[0]} intensity={m.face[1]} size={84} title={m.label} />
              <span className="font-nunito font-bold text-xl text-ink">{m.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

const PHASES = [
  { key: "in", label: "Breathe in", ms: 4000 },
  { key: "out", label: "Breathe out", ms: 5000 },
];
const BREATHS = 4;

function CalmCorner({ onDone }) {
  const motionPref = useChildStore((s) => s.child.sensoryProfile?.motion);
  const { speak } = useSpeak();
  const [step, setStep] = useState(0); // phases elapsed
  const [stage, setStage] = useState("breathe"); // breathe → squeeze → check
  const [squeezes, setSqueezes] = useState(0);
  const holdTimer = useRef(null);
  const phase = PHASES[step % 2];
  const breath = Math.floor(step / 2) + 1;

  useEffect(() => {
    if (stage !== "breathe") return;
    speak(phase.label);
    const t = setTimeout(() => {
      if (step + 1 >= BREATHS * 2) setStage("squeeze");
      else setStep((s) => s + 1);
    }, phase.ms);
    return () => clearTimeout(t);
  }, [step, stage, phase, speak]);

  useEffect(() => {
    if (stage === "squeeze") speak("Now squeeze the ball. Hold it, then let go.");
  }, [stage, speak]);

  const startSqueeze = () => {
    holdTimer.current = setTimeout(() => {
      setSqueezes((n) => {
        const next = n + 1;
        speak(next >= 3 ? "Well done." : "Let go.");
        if (next >= 3) setTimeout(() => setStage("check"), 1200);
        return next;
      });
    }, 1500);
  };
  const endSqueeze = () => clearTimeout(holdTimer.current);

  const pick = async (moodId) => {
    await api("/api/mood", { method: "POST", body: { moodId, source: "calm" } }).catch(() => {});
    api("/api/calm", { method: "POST" }).catch(() => {});
    speak("Thank you for telling me.");
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-lavender-50 flex flex-col">
      <div className="p-4 md:p-6">
        <button onClick={onDone} className="h-14 px-4 rounded-2xl bg-white ring-1 ring-line flex items-center gap-2 font-nunito font-bold text-lg text-ink">
          <ArrowLeft size={22} aria-hidden /> Back
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {stage === "breathe" && (
          <>
            <motion.div
              className="rounded-full bg-lavender-300/60 ring-8 ring-lavender-300/40"
              animate={{ scale: phase.key === "in" ? 1.35 : 0.85 }}
              transition={{ duration: phase.ms / 1000, ease: "easeInOut" }}
              style={{ width: 200, height: 200 }}
              aria-hidden
            />
            <p className="font-nunito font-extrabold text-4xl text-ink mt-12" aria-live="polite">{phase.label}</p>
            <p className="font-dm-sans text-lg text-ink-soft mt-2 tabular">Breath {breath} of {BREATHS}</p>
            {motionPref === "none" && <p className="font-dm-sans text-base text-muted mt-2">Count slowly to four.</p>}
          </>
        )}
        {stage === "squeeze" && (
          <>
            <button
              onPointerDown={startSqueeze}
              onPointerUp={endSqueeze}
              onPointerLeave={endSqueeze}
              className="w-56 h-56 rounded-full bg-coral-400/70 active:scale-90 transition-transform ring-8 ring-coral-400/30 touch-none"
              aria-label="Press and hold to squeeze"
            />
            <p className="font-nunito font-extrabold text-3xl text-ink mt-10">Press and hold to squeeze</p>
            <p className="font-dm-sans text-lg text-ink-soft mt-2 tabular">{squeezes} of 3</p>
          </>
        )}
        {stage === "check" && (
          <div className="w-full max-w-3xl">
            <MoodPicker title="How do you feel now?" onPick={pick} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeelScreen() {
  const { currentMood, setMood, calmRequested, clearCalmRequest } = useChildStore();
  const { speak } = useSpeak();
  const [calm, setCalm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!calmRequested) return;
    clearCalmRequest();
    const t = setTimeout(() => setCalm(true), 0);
    return () => clearTimeout(t);
  }, [calmRequested, clearCalmRequest]);

  const checkIn = async (moodId) => {
    setMood(moodId);
    await api("/api/mood", { method: "POST", body: { moodId, source: "checkin" } }).catch(() => {});
    setSaved(true);
    if (moodId === "notgreat" || moodId === "sad") speak("Thank you for telling me. Would the Calm Corner help?");
  };

  if (calm) return <CalmCorner onDone={() => setCalm(false)} />;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-8">
      <MoodPicker title="How do you feel?" onPick={checkIn} selected={currentMood} />
      {saved && <p role="status" className="font-dm-sans text-lg text-teal-700 font-bold -mt-4">Thanks for telling me!</p>}
      <button onClick={() => { speak("Calm Corner"); setCalm(true); }} className="rounded-3xl bg-lavender-50 ring-2 ring-lavender-300 p-6 flex items-center gap-5 text-left">
        <span className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-lavender-700"><Wind size={44} aria-hidden /></span>
        <span>
          <span className="block font-nunito font-extrabold text-3xl text-ink">Calm Corner</span>
          <span className="block font-dm-sans text-lg text-ink-soft mt-1">Breathe slowly and squeeze</span>
        </span>
      </button>
    </div>
  );
}
