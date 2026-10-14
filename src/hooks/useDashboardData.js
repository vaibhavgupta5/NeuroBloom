"use client";

import { useCallback, useEffect } from "react";
import { useParentStore } from "../stores/useParentStore";
import { useSSE } from "./useSSE";

/**
 * Loads GET /api/parent/dashboard, exposes reload() through the store, and
 * refetches when the SSE stream reports a newly saved session.
 */
export function useDashboardData() {
  const hydrateDashboard = useParentStore((s) => s.hydrateDashboard);
  const setLoadError = useParentStore((s) => s.setLoadError);
  const setReload = useParentStore((s) => s.setReload);

  const load = useCallback(() => {
    return fetch("/api/parent/dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(hydrateDashboard)
      .catch((err) => setLoadError(err.message));
  }, [hydrateDashboard, setLoadError]);

  useEffect(() => {
    setReload(load);
    load();
  }, [load, setReload]);

  useSSE({ refresh: () => load() });
}
