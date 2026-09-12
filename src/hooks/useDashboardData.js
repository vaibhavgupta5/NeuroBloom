"use client";

import { useEffect } from "react";
import { useParentStore } from "../stores/useParentStore";
import { useSSE } from "./useSSE";

/**
 * Parent dashboard data: fetches GET /api/parent/dashboard, subscribes to the
 * SSE stream, and refetches aggregates whenever a new session lands
 * (the `refresh` event). Mount once in the parent dashboard page.
 */
export function useDashboardData() {
  const hydrateDashboard = useParentStore((s) => s.hydrateDashboard);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/parent/dashboard")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((data) => {
          if (!cancelled) hydrateDashboard(data);
        })
        .catch((err) => console.error("Failed to load dashboard:", err.message));
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [hydrateDashboard]);

  useSSE({
    refresh: () => {
      // A new session was saved — refetch all aggregates
      fetch("/api/parent/dashboard")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((data) => hydrateDashboard(data))
        .catch((err) => console.error("Failed to refresh dashboard:", err.message));
    },
  });

  return null;
}
