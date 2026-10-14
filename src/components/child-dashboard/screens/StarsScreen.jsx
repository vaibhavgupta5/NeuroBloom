"use client";

import { Lock, Star } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useSpeak } from "../../../hooks/useSpeak";
import { SvgIconBadge } from "../../ui/SvgIconBadge";

export default function StarsScreen() {
  const { child, achievements } = useChildStore();
  const { speak } = useSpeak();
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-8">
      <section className="rounded-3xl bg-amber-50 p-8 flex items-center gap-6">
        <Star size={84} className="text-amber-400 shrink-0" fill="currentColor" aria-hidden />
        <div>
          <p className="font-sora text-6xl font-semibold text-ink tabular">{child.stars}</p>
          <p className="font-nunito font-bold text-2xl text-ink-soft">stars so far</p>
        </div>
      </section>
      <section>
        <h1 className="font-nunito font-extrabold text-3xl text-ink">My badges</h1>
        <p className="font-dm-sans text-lg text-ink-soft mt-1 tabular">{unlocked} of {achievements.length}</p>
        <ul className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <li key={a.id}>
              <button onClick={() => speak(a.unlocked ? a.label : `${a.label}. Not yet.`)} className={`w-full rounded-3xl p-4 flex flex-col items-center gap-2 text-center ${a.unlocked ? "bg-white ring-2 ring-amber-400" : "bg-white/60 ring-1 ring-line"}`}>
                {a.unlocked ? <SvgIconBadge type={a.iconKey} size={44} variant="amber" /> : <Lock size={40} className="text-muted my-1" aria-hidden />}
                <span className={`font-nunito font-bold text-lg ${a.unlocked ? "text-ink" : "text-muted"}`}>{a.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
