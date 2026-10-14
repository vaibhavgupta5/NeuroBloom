"use client";

import { Eye } from "lucide-react";
import { useParentStore } from "../../../stores/useParentStore";
import { Button } from "../../ui/kit";

export default function LiveObserverBanner() {
  const { liveSession, child, setActiveTab } = useParentStore();
  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="font-dm-sans text-[15px] text-ink flex items-center gap-2.5">
        <span className="relative flex w-2.5 h-2.5" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-60" />
          <span className="relative w-2.5 h-2.5 rounded-full bg-teal-700" />
        </span>
        <span>
          <strong>{child.name}</strong> is {liveSession.status === "paused" ? "paused in" : "playing"} {liveSession.gameTitle || "a game"} right now.
        </span>
      </p>
      <Button size="sm" onClick={() => setActiveTab("live")}><Eye size={15} aria-hidden /> Watch live</Button>
    </div>
  );
}
