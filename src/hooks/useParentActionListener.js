"use client";

import { useEffect } from "react";
import { useChildStore } from "../stores/useChildStore";
import { useSSE } from "./useSSE";

/**
 * Listens for parent interventions (sticker / speed / pause) arriving over
 * the SSE stream and applies them to the child store. Mount once in the
 * child dashboard page.
 */
export function useParentActionListener() {
  const receiveParentAction = useChildStore((s) => s.receiveParentAction);

  useSSE({
    "parent-action": (event) => receiveParentAction(event),
  });

  return null;
}
