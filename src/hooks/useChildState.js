"use client";

import { useEffect } from "react";
import { useChildStore } from "../stores/useChildStore";

/**
 * Fetches the child's world from GET /api/child/state and hydrates the store.
 * Mount once in the child dashboard page.
 */
export function useChildState() {
  const hydrateChildState = useChildStore((s) => s.hydrateChildState);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/child/state")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled) hydrateChildState(data);
      })
      .catch((err) => console.error("Failed to load child state:", err.message));

    return () => {
      cancelled = true;
    };
  }, [hydrateChildState]);

  return null;
}
