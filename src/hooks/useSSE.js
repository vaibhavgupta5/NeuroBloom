"use client";

import { useEffect, useRef } from "react";

const EVENTS = ["telemetry", "snapshot", "parent-action", "refresh"];
const shared = new Map(); // url → { es, listeners:Set, refs }

function subscribe(url, listener) {
  let entry = shared.get(url);
  if (!entry) {
    const es = new EventSource(url);
    entry = { es, listeners: new Set() };
    for (const name of EVENTS) {
      es.addEventListener(name, (e) => {
        let data;
        try {
          data = JSON.parse(e.data);
        } catch {
          return;
        }
        for (const l of entry.listeners) l(name, data);
      });
    }
    shared.set(url, entry);
  }
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size === 0) {
      entry.es.close();
      shared.delete(url);
    }
  };
}

/**
 * Subscribes to /api/stream. Hooks on the same page share one EventSource per role.
 *  role "parent": telemetry, snapshot, refresh · role "child": parent-action
 */
export function useSSE(handlers, role = "parent") {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(
    () => subscribe(`/api/stream?role=${role}`, (name, data) => handlersRef.current?.[name]?.(data)),
    [role]
  );
}
