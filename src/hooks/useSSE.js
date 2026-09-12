"use client";

import { useEffect, useRef } from "react";

/**
 * Subscribes to the server SSE stream (/api/stream) and dispatches named
 * events to callbacks. EventSource auto-reconnects on connection drops.
 *
 * Events:
 *  - telemetry     → live game snapshot (parent dashboards; camera frame stripped)
 *  - snapshot      → single camera frame, only when it changed (~every 10s)
 *  - parent-action → sticker/speed/pause commands (child screen)
 *  - refresh       → a new Session was saved; refetch aggregates
 */
export function useSSE(handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const es = new EventSource("/api/stream");

    const bind = (eventName) => {
      es.addEventListener(eventName, (e) => {
        try {
          const data = JSON.parse(e.data);
          handlersRef.current?.[eventName]?.(data);
        } catch {
          // malformed event — ignore
        }
      });
    };

    ["telemetry", "snapshot", "parent-action", "refresh"].forEach(bind);

    return () => es.close();
  }, []);

  return null;
}
