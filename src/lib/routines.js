import { localDayKey } from "./dayUtils";

export function cleanSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps
    .filter((s) => s && typeof s.label === "string" && s.label.trim())
    .slice(0, 12)
    .map((s) => ({
      label: s.label.trim().slice(0, 40),
      iconKey: typeof s.iconKey === "string" ? s.iconKey.slice(0, 24) : "star",
      durationMin: Number.isInteger(s.durationMin) && s.durationMin > 0 && s.durationMin <= 120 ? s.durationMin : null,
    }));
}

export function serializeRoutine(r) {
  const today = localDayKey(new Date());
  const done = r.progress?.day === today ? r.progress.doneStepIds : [];
  return {
    id: String(r._id),
    name: r.name,
    steps: r.steps.map((s) => ({ id: String(s._id), label: s.label, iconKey: s.iconKey, durationMin: s.durationMin, done: done.includes(String(s._id)) })),
  };
}
