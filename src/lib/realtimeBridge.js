"use client";

// Realtime Bridge Event Bus using BroadcastChannel with localStorage fallback
const CHANNEL_NAME = "neurobloom_realtime_channel";
const STORAGE_KEY = "neurobloom_telemetry_event";

class RealtimeBridge {
  constructor() {
    this.listeners = new Set();
    this.channel = null;

    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      }

      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch (err) {
            console.error("Failed to parse storage telemetry", err);
          }
        }
      });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => callback(data));
  }

  emit(type, payload) {
    const eventData = {
      type,
      payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(eventData);
      } catch (err) {
        console.error("BroadcastChannel emit failed", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventData));
      } catch (err) {
        // storage quota exceeded or disabled
      }
    }

    // Also trigger locally in same window context
    this.notifyListeners(eventData);
  }

  // Helper emitters
  emitTelemetry(telemetryData) {
    this.emit("CHILD_TELEMETRY", telemetryData);
  }

  emitParentAction(actionData) {
    this.emit("PARENT_ACTION", actionData);
  }
}

export const realtimeBridge = new RealtimeBridge();
