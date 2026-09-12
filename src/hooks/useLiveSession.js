"use client";

import { useEffect } from "react";
import { useParentStore } from "../stores/useParentStore";
import { useSSE } from "./useSSE";

/**
 * Parent-side live session tracking: initial snapshot from GET /api/live,
 * then live updates over the SSE `telemetry` events. Mount once in the
 * parent dashboard page.
 */
export function useLiveSession() {
  const updateLiveTelemetry = useParentStore((s) => s.updateLiveTelemetry);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/live")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled && data.liveSession) {
          updateLiveTelemetry({
            ...data.liveSession,
            childName: data.childName,
            isLive: data.isLive,
          });
        }
      })
      .catch((err) => console.error("Failed to load live session:", err.message));

    return () => {
      cancelled = true;
    };
  }, [updateLiveTelemetry]);

  useSSE({
    telemetry: (data) => updateLiveTelemetry(data),
  });

  return null;
}
