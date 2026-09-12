"use client";

import { SvgIconBadge } from "../ui/SvgIconBadge";
import { useParentStore } from "../../stores/useParentStore";
import { EMOTION_META } from "../../lib/emotionUtils";
import { Camera } from "lucide-react";

/**
 * After-game emotion results: picks the most recent session with camera
 * emotion data and shows the dominant emotion, a distribution mini-chart
 * from the session's emotion timeline, and a parent-friendly interpretation.
 */
export default function SessionEmotionSummary() {
  const { sessionTimeline, child } = useParentStore();

  // Timeline arrives newest-first from the API — take the newest with camera data
  const session = sessionTimeline.find((s) => s.emotion);

  if (!session) {
    return (
      <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 mb-3">
          <Camera size={18} className="text-[#3ECFB2]" />
          <h3 className="font-nunito font-bold text-lg text-[#1B2D3E]">
            Camera Emotion Insights
          </h3>
        </div>
        <p className="font-dm-sans text-sm text-[#8FA3B1]">
          Play a game with the camera on to see emotion insights from {child.name}&apos;s
          sessions here.
        </p>
      </div>
    );
  }

  const meta = EMOTION_META[session.emotion];
  const timeline = session.emotionTimeline || [];

  // Emotion distribution across the session timeline
  const counts = {};
  for (const p of timeline) counts[p.emotion] = (counts[p.emotion] || 0) + 1;
  const total = timeline.length || 1;
  const distribution = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => ({
      emotion,
      pct: Math.round((count / total) * 100),
      color: EMOTION_META[emotion]?.color || "#8FA3B1",
      label: EMOTION_META[emotion]?.label || emotion,
    }));

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-[#3ECFB2]" />
          <h3 className="font-nunito font-bold text-lg text-[#1B2D3E]">
            Camera Emotion Insights
          </h3>
        </div>
        <span className="font-dm-sans text-xs text-[#8FA3B1] font-bold">
          {session.module} · {session.time}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <SvgIconBadge
          type={meta?.iconKey || "emotion"}
          size={30}
          variant={session.emotion === "happy" ? "teal" : "coral"}
        />
        <div>
          <div className="font-nunito font-bold text-xl" style={{ color: meta?.color || "#1B2D3E" }}>
            Mostly {meta?.label || session.emotion}
          </div>
          <div className="font-dm-sans text-xs text-[#8FA3B1]">
            {child.name} {meta?.parentText?.toLowerCase() || ""}
          </div>
        </div>
      </div>

      {/* Distribution mini-bars */}
      {distribution.length > 0 && (
        <div className="space-y-1.5">
          {distribution.map((d) => (
            <div key={d.emotion} className="flex items-center gap-2">
              <span className="font-dm-sans text-[11px] font-bold text-[#8FA3B1] w-20 shrink-0">
                {d.label}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-[#8FA3B1]/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                />
              </div>
              <span className="font-sora font-bold text-[11px] text-[#1B2D3E] w-9 text-right">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
