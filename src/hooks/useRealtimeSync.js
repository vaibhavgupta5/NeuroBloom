"use client";

import { useCallback } from "react";
import { useChildStore } from "../stores/useChildStore";

/**
 * Persists a finished game session: POST /api/sessions, then reconciles the
 * child store with the server's refreshed state (stars, streak, unlocks).
 */
export function useSessionRecorder() {
  const hydrateChildState = useChildStore((s) => s.hydrateChildState);

  const recordSession = useCallback(
    async (sessionData) => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        hydrateChildState({
          child: data.child,
          todayModules: data.todayModules,
          todayCompletedCount: data.todayModules.filter((m) => m.completed).length,
        });
        return data;
      } catch (err) {
        console.error("Failed to record session:", err.message);
        return null;
      }
    },
    [hydrateChildState]
  );

  return { recordSession };
}

/**
 * Sends a parent intervention to the server queue (POST /api/parent/actions),
 * which the child receives over its SSE stream.
 */
export function useParentActionSender() {
  const sendParentAction = useCallback(async (action) => {
    try {
      await fetch("/api/parent/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
    } catch (err) {
      console.error("Failed to send parent action:", err.message);
    }
  }, []);

  return { sendParentAction };
}
