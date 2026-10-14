// Plain-language readings of live telemetry. Thresholds live here only.
export const PROMPT_LABELS = ["No help", "Spoken hint", "Highlighted", "Fewer choices", "Shown the answer"];

export function describeAccuracy(pct) {
  if (pct == null) return { label: "Just started", tone: "neutral" };
  if (pct >= 80) return { label: "Going well", tone: "good" };
  if (pct >= 50) return { label: "Working at it", tone: "neutral" };
  return { label: "Finding it hard", tone: "attention" };
}

export function formatElapsed(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, Math.round(sec % 60));
  return `${m}:${String(s).padStart(2, "0")}`;
}
