"use client";

import { useCallback, useEffect, useRef } from "react";

const THROTTLE_MS = 1500;

/**
 * Throttled telemetry emitter for child games. sendTelemetry(data) POSTs to
 * /api/telemetry at most once every 1.5s; flush() forces an immediate send
 * (call it when a game ends so the final state lands promptly).
 */
export function useTelemetryEmitter() {
  const lastSentAt = useRef(0);
  const pending = useRef(null);
  const timer = useRef(null);

  const post = useCallback(async (data) => {
    lastSentAt.current = Date.now();
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

  const flushTelemetry = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current) post(pending.current);
  }, [post]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { sendTelemetry, flushTelemetry };
}
