"use client";

import { useChildStore } from "../../../stores/useChildStore";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import EmotionMatchGame from "../games/EmotionMatchGame";
import WordMatchGame from "../games/WordMatchGame";
import PuzzleGame from "../games/PuzzleGame";
import BallTrackingGame from "../games/BallTrackingGame";
import MirrorMeGame from "../games/MirrorMeGame";

const GAMES = {
  "emotion-match": { title: "Feelings", icon: "emotion", tint: "bg-teal-50", Component: EmotionMatchGame },
  "word-match": { title: "Words", icon: "word", tint: "bg-coral-50", Component: WordMatchGame },
  puzzle: { title: "Shapes", icon: "puzzle", tint: "bg-lavender-50", Component: PuzzleGame },
  "mirror-me": { title: "Mirror Me", icon: "happy", tint: "bg-amber-50", Component: MirrorMeGame },
  "ball-tracker": { title: "Focus Ball", icon: "focus", tint: "bg-blue-50", Component: BallTrackingGame },
};

export default function PlayScreen() {
  const { activeGame, setActiveGame, todayModules } = useChildStore();
  const { speak } = useSpeak();
  const sound = useSoundEffect();

  if (activeGame && GAMES[activeGame]) {
    const { Component } = GAMES[activeGame];
    return <Component />;
  }

  const order = todayModules.length ? todayModules.map((m) => m.activeGameKey).filter((k) => GAMES[k]) : Object.keys(GAMES);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h1 className="font-nunito font-extrabold text-4xl text-ink">Let&apos;s play</h1>
      <ul className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {order.map((key) => {
          const g = GAMES[key];
          const done = todayModules.find((m) => m.activeGameKey === key)?.completed;
          return (
            <li key={key}>
              <button
                onClick={() => { sound("tap"); speak(g.title); setActiveGame(key); }}
                className={`w-full aspect-square rounded-3xl ${g.tint} flex flex-col items-center justify-center gap-3 p-4 ring-1 ring-line hover:ring-2 hover:ring-teal-400 transition-shadow`}
              >
                <SvgIconBadge type={g.icon} size={64} variant="ghost" />
                <span className="font-nunito font-extrabold text-2xl text-ink">{g.title}</span>
                {done && <span className="font-dm-sans text-sm font-bold text-teal-700">Done today</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
