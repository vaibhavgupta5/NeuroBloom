"use client";

import { useCallback, useEffect, useRef } from "react";

const THROTTLE_MS = 1500;
const HEARTBEAT_MS = 5000;

/**
 * Throttled telemetry emitter for child games. sendTelemetry(data) POSTs to
 * /api/telemetry at most once every 1.5s; flush() forces an immediate send
 * (call it when a game ends so the final state lands promptly).
 */
export function useTelemetryEmitter() {
  const lastSentAt = useRef(0);
  const pending = useRef(null);
  const timer = useRef(null);

  const lastPayload = useRef(null);

  const post = useCallback(async (data) => {
    lastSentAt.current = Date.now();
    lastPayload.current = data.status === "idle" ? null : data;
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // transient network failure — next tick will retry
    }
  }, []);

  const sendTelemetry = useCallback(
    (data) => {
      pending.current = data;
      const elapsed = Date.now() - lastSentAt.current;
      if (elapsed >= THROTTLE_MS) {
        post(data);
      } else if (!timer.current) {
        timer.current = setTimeout(
          () => {
            timer.current = null;
            if (pending.current) post(pending.current);
          },
          THROTTLE_MS - elapsed
        );
      }
    },
    [post]
  );

  const flushTelemetry = useCallback((data) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const payload = data ?? pending.current;
    pending.current = null;
    if (payload) post(payload);
  }, [post]);

  // Keeps the live session fresh while the child is thinking (no state changes)
  useEffect(() => {
    const beat = setInterval(() => {
      if (lastPayload.current && Date.now() - lastSentAt.current >= HEARTBEAT_MS) {
        const { snapshotFrame: _frame, ...rest } = lastPayload.current;
        post(rest);
      }
    }, HEARTBEAT_MS);
    return () => {
      clearInterval(beat);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [post]);

  return { sendTelemetry, flushTelemetry };
}
