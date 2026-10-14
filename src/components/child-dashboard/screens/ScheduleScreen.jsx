"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useChildStore } from "../../../stores/useChildStore";
import { useSpeak } from "../../../hooks/useSpeak";
import { useSoundEffect } from "../../../hooks/useSoundEffect";
import { IconFor } from "../../../lib/icons";
import { api } from "../../../lib/api";
import { cn } from "../../../lib/cn";

function FirstThen({ first, then }) {
  if (!first) return null;
  return (
    <section aria-label="First, then" className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
      {[["First", first], null, ["Then", then]].map((slot, i) =>
        slot === null ? (
          <ArrowRight key={i} size={36} className="self-center text-muted" aria-hidden />
        ) : (
          <div key={slot[0]} className={cn("rounded-3xl p-4 flex flex-col items-center gap-2 text-center", i === 0 ? "bg-white ring-4 ring-teal-400" : "bg-white/70 ring-1 ring-line")}>
            <span className="font-nunito font-extrabold text-lg uppercase tracking-wide text-muted">{slot[0]}</span>
            {slot[1] ? (
              <>
                <IconFor name={slot[1].iconKey} size={64} strokeWidth={1.75} className={i === 0 ? "text-teal-700" : "text-ink-soft"} />
                <span className="font-nunito font-extrabold text-2xl text-ink">{slot[1].label}</span>
              </>
            ) : (
              <span className="font-nunito font-bold text-xl text-ink-soft my-auto">All done!</span>
            )}
          </div>
        )
      )}
    </section>
  );
}

export default function ScheduleScreen() {
  const todayModules = useChildStore((s) => s.todayModules);
  const { speak } = useSpeak();
  const sound = useSoundEffect();
  const [routines, setRoutines] = useState(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    api("/api/routines").then((d) => setRoutines(d.routines), () => setRoutines([]));
  }, []);

  // With no authored routine, today's games are the schedule
  const fallback = {
    id: "games",
    name: "Games",
    steps: todayModules.map((m) => ({ id: m.id, label: m.shortTitle, iconKey: "gamepad", done: m.completed })),
  };
  const list = routines?.length ? routines : routines ? [fallback] : [];
  const routine = list[Math.min(selected, list.length - 1)];
  const remaining = routine?.steps.filter((s) => !s.done) || [];

  const toggle = async (step) => {
    if (routine.id === "games") return;
    sound(step.done ? "tap" : "success");
    if (!step.done) speak(`${step.label}, done!`);
    const { routine: updated } = await api(`/api/routines/${routine.id}/progress`, { method: "POST", body: { stepId: step.id, done: !step.done } });
    setRoutines((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
  };

  if (!routines) return <div className="w-full max-w-3xl mx-auto px-4" aria-busy="true" />;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <h1 className="font-nunito font-extrabold text-4xl text-ink">My day</h1>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist">
          {list.map((r, i) => (
            <button key={r.id} role="tab" aria-selected={i === selected} onClick={() => { setSelected(i); speak(r.name); }}
              className={cn("h-12 px-5 rounded-2xl font-nunito font-bold text-lg shrink-0", i === selected ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line")}>
              {r.name}
            </button>
          ))}
        </div>
      )}
      <FirstThen first={remaining[0]} then={remaining[1]} />
      <ol className="flex flex-col gap-3">
        {routine?.steps.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => toggle(s)}
              aria-pressed={s.done}
              className={cn("w-full min-h-20 rounded-3xl px-5 py-3 flex items-center gap-4 text-left", s.done ? "bg-teal-50" : s.id === remaining[0]?.id ? "bg-white ring-2 ring-teal-400" : "bg-white ring-1 ring-line")}
            >
              <IconFor name={s.iconKey} size={40} strokeWidth={1.75} className={s.done ? "text-teal-700" : "text-ink"} />
              <span className={cn("flex-1 font-nunito font-bold text-2xl", s.done ? "text-ink-soft line-through decoration-2" : "text-ink")}>{s.label}</span>
              {s.durationMin && <span className="font-dm-sans text-base text-muted tabular">{s.durationMin} min</span>}
              <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.done ? "bg-teal-700 text-white" : "ring-2 ring-line")}>
                {s.done && <Check size={24} aria-hidden />}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
