"use client";

import { Check, Lock, Play } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useSpeak } from "../../../hooks/useSpeak";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { cn } from "../../../lib/cn";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const { child, todayModules, currentMood, setScreen, setActiveGame } = useChildStore();
  const { speak } = useSpeak();
  const next = todayModules.find((m) => m.unlocked && !m.completed);
  const doneCount = todayModules.filter((m) => m.completed).length;

  const start = (m) => {
    speak(m.title);
    setScreen("play");
    setActiveGame(m.activeGameKey);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-8">
      <section className="pt-2">
        <h1 className="font-nunito font-extrabold text-4xl md:text-5xl text-ink">{greeting()}, {child.name}!</h1>
        <p className="font-dm-sans text-xl text-ink-soft mt-2">
          {next ? `${doneCount} of ${todayModules.length} done today.` : "You finished everything today!"}
        </p>
      </section>

      {!currentMood && (
        <button onClick={() => setScreen("feel")} className="rounded-3xl bg-lavender-50 ring-2 ring-lavender-300 p-5 text-left flex items-center gap-4">
          <SvgIconBadge type="happy" size={36} variant="ghost" />
          <span className="font-nunito font-bold text-2xl text-lavender-700">How do you feel today?</span>
        </button>
      )}

      {next && (
        <button onClick={() => start(next)} className="clay-btn-primary h-24 rounded-3xl flex items-center justify-center gap-4 font-nunito text-3xl">
          <Play size={34} fill="currentColor" aria-hidden /> Play {next.shortTitle}
        </button>
      )}

      <ol className="flex flex-col gap-3" aria-label="Today's games">
        {todayModules.map((m, i) => {
          const locked = !m.unlocked && !m.completed;
          return (
            <li key={m.id}>
              <button
                onClick={() => !locked && start(m)}
                disabled={locked}
                aria-label={`${m.title}${m.completed ? ", done" : locked ? ", locked" : ""}`}
                className={cn(
                  "w-full min-h-20 rounded-3xl px-5 py-4 flex items-center gap-4 text-left",
                  m.completed ? "bg-teal-50" : locked ? "bg-white/60 opacity-60" : "bg-white ring-2 ring-teal-400"
                )}
              >
                <span className="font-sora font-semibold text-lg text-muted w-6 tabular">{i + 1}</span>
                <SvgIconBadge type={m.iconKey} size={36} variant="ghost" />
                <span className="flex-1 font-nunito font-bold text-2xl text-ink">{m.title}</span>
                {m.completed ? <Check size={30} className="text-teal-700" aria-hidden /> : locked ? <Lock size={24} className="text-muted" aria-hidden /> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
