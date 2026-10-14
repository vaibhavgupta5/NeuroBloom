"use client";

import { useCallback, useEffect } from "react";
import { useChildStore } from "../stores/useChildStore";

/** Loads GET /api/child/state into the child store; returns a reload function. */
export function useChildState() {
  const hydrateChildState = useChildStore((s) => s.hydrateChildState);
  const setLoadError = useChildStore((s) => s.setLoadError);

  const load = useCallback(
    () =>
      fetch("/api/child/state")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then(hydrateChildState)
        .catch((err) => setLoadError(err.message)),
    [hydrateChildState, setLoadError]
  );

  useEffect(() => {
    load();
  }, [load]);

  return load;
}
