export const LIVE_STALE_MS = 12000;

/** A live session with no telemetry for a while is treated as idle (tab closed, device asleep). */
export function effectiveLiveStatus(live) {
  if (!live || live.status === "idle") return "idle";
  if (Date.now() - new Date(live.updatedAt).getTime() > LIVE_STALE_MS) return "idle";
  return live.status;
}
