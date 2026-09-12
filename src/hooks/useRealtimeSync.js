"use client";

import { useEffect } from "react";
import { realtimeBridge } from "../lib/realtimeBridge";
import { useParentStore } from "../stores/useParentStore";
import { useChildStore } from "../stores/useChildStore";

export function useRealtimeSync() {
  const updateLiveTelemetry = useParentStore((s) => s.updateLiveTelemetry);
  const receiveParentAction = useChildStore((s) => s.receiveParentAction);

  useEffect(() => {
    const unsubscribe = realtimeBridge.subscribe((event) => {
      if (event.type === "CHILD_TELEMETRY") {
        updateLiveTelemetry(event.payload);
      } else if (event.type === "PARENT_ACTION") {
        receiveParentAction(event.payload);
      }
    });

    return () => unsubscribe();
  }, [updateLiveTelemetry, receiveParentAction]);

  return {
    sendTelemetry: (data) => realtimeBridge.emitTelemetry(data),
    sendParentAction: (action) => realtimeBridge.emitParentAction(action),
  };
}
