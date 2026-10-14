"use client";

import { useState } from "react";
import { Delete, Volume2, X } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { IconFor } from "../../../lib/icons";
import { api } from "../../../lib/api";
import { cn } from "../../../lib/cn";

// Core vocabulary first (high-frequency words that combine into many sentences),
// colour-coded by word type in the spirit of the modified Fitzgerald key.
const CORE = [
  { label: "I", icon: "baby", type: "person" },
  { label: "you", icon: "family", type: "person" },
  { label: "want", icon: "hand", type: "verb" },
  { label: "go", icon: "walk", type: "verb" },
  { label: "play", icon: "gamepad", type: "verb" },
  { label: "eat", icon: "utensils", type: "verb" },
  { label: "drink", icon: "water", type: "verb" },
  { label: "more", icon: "more", type: "social" },
  { label: "stop", icon: "stop", type: "social" },
  { label: "help", icon: "help", type: "social" },
  { label: "yes", icon: "yes", type: "social" },
  { label: "no", icon: "no", type: "social" },
];
const FEELINGS = [
  { label: "happy", icon: "happy", type: "describe" },
  { label: "sad", icon: "sad", type: "describe" },
  { label: "angry", icon: "angry", type: "describe" },
  { label: "tired", icon: "bed", type: "describe" },
  { label: "too loud", icon: "loud", type: "describe" },
  { label: "hurt", icon: "heart", type: "describe" },
  { label: "feel", icon: "heart", type: "verb" },
  { label: "break", icon: "moon", type: "social" },
];
const THINGS = [
  { label: "water", icon: "water", type: "thing" },
  { label: "apple", icon: "apple", type: "thing" },
  { label: "cookie", icon: "cookie", type: "thing" },
  { label: "pizza", icon: "pizza", type: "thing" },
  { label: "toilet", icon: "toilet", type: "thing" },
  { label: "outside", icon: "park", type: "thing" },
  { label: "book", icon: "book", type: "thing" },
  { label: "music", icon: "music", type: "thing" },
  { label: "TV", icon: "tv", type: "thing" },
  { label: "home", icon: "home", type: "thing" },
];

const TYPE_STYLE = {
  person: "bg-amber-50 ring-amber-400/50",
  verb: "bg-teal-50 ring-teal-400/60",
  social: "bg-coral-50 ring-coral-400/50",
  describe: "bg-blue-50 ring-blue-400/50",
  thing: "bg-white ring-line",
  custom: "bg-lavender-50 ring-lavender-300",
};

export default function TalkScreen() {
  const tiles = useChildStore((s) => s.child.aacTiles) || [];
  const { speak } = useSpeak();
  const sound = useSoundEffect();
  const [tab, setTab] = useState("core");
  const [sentence, setSentence] = useState([]);

  const sets = {
    core: CORE,
    feelings: FEELINGS,
    things: THINGS,
    mine: tiles.map((t) => ({ label: t.label, icon: t.iconKey, image: t.image, type: "custom" })),
  };
  const tabs = [
    ["core", "Words"],
    ["feelings", "Feelings"],
    ["things", "Things"],
    ...(tiles.length ? [["mine", "Mine"]] : []),
  ];

  const add = (w) => {
    sound("tap");
    speak(w.label, { force: true });
    setSentence((s) => (s.length >= 12 ? s : [...s, w]));
  };

  const sayIt = () => {
    if (!sentence.length) return;
    speak(sentence.map((w) => w.label).join(" "), { force: true });
    api("/api/comm", { method: "POST", body: { words: sentence.map((w) => w.label) } }).catch(() => {});
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 md:px-4 flex flex-col gap-4">
      <div className="sticky top-16 z-20 bg-canvas pt-1 pb-2">
        <div className="flex items-stretch gap-2">
          <button onClick={sayIt} className="flex-1 min-h-20 rounded-3xl bg-white ring-2 ring-teal-400 px-3 flex items-center gap-2 overflow-x-auto text-left" aria-label={sentence.length ? `Say: ${sentence.map((w) => w.label).join(" ")}` : "Sentence is empty"}>
            {sentence.length ? (
              sentence.map((w, i) => (
                <span key={i} className="shrink-0 flex flex-col items-center px-1.5">
                  {w.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <IconFor name={w.icon} size={30} className="text-ink" />
                  )}
                  <span className="font-nunito font-bold text-base text-ink">{w.label}</span>
                </span>
              ))
            ) : (
              <span className="font-nunito font-bold text-xl text-muted px-2">Tap pictures to talk</span>
            )}
          </button>
          <button onClick={sayIt} disabled={!sentence.length} className="w-20 rounded-3xl clay-btn-primary flex items-center justify-center p-0 disabled:opacity-50" aria-label="Say it">
            <Volume2 size={34} />
          </button>
          <div className="flex flex-col gap-2">
            <button onClick={() => setSentence((s) => s.slice(0, -1))} className="flex-1 w-16 rounded-2xl bg-white ring-1 ring-line flex items-center justify-center text-ink-soft" aria-label="Remove last word"><Delete size={24} /></button>
            <button onClick={() => setSentence([])} className="flex-1 w-16 rounded-2xl bg-white ring-1 ring-line flex items-center justify-center text-ink-soft" aria-label="Clear"><X size={24} /></button>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist">
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={cn("h-12 px-5 rounded-2xl font-nunito font-bold text-lg shrink-0", tab === id ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 pb-6">
        {sets[tab].map((w) => (
          <li key={`${tab}-${w.label}`}>
            <button onClick={() => add(w)} className={cn("w-full aspect-square rounded-3xl ring-2 flex flex-col items-center justify-center gap-2 p-2 active:scale-95 transition-transform", TYPE_STYLE[w.type])}>
              {w.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <IconFor name={w.icon} size={48} strokeWidth={1.75} className="text-ink" />
              )}
              <span className="font-nunito font-extrabold text-lg md:text-xl text-ink">{w.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
