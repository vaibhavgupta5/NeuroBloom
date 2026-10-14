"use client";

import { Camera, Radio } from "lucide-react";
import { useParentStore } from "../../../stores/useParentStore";
import { EMOTION_META } from "../../../lib/emotionUtils";
import { PROMPT_LABELS, describeAccuracy, formatElapsed } from "../../../lib/metrics";
import { Card, EmptyState } from "../../ui/kit";
import ParentRemoteControls from "./ParentRemoteControls";

function Stat({ label, value, sub }) {
  return (
    <div>
      <p className="font-dm-sans text-[13px] text-muted">{label}</p>
      <p className="font-sora text-2xl font-semibold text-ink tabular mt-0.5">{value}</p>
      {sub && <p className="font-dm-sans text-[13px] text-ink-soft">{sub}</p>}
    </div>
  );
}

function BallMirror({ x = 50, y = 50 }) {
  return (
    <div className="relative aspect-[4/3] rounded-xl bg-canvas ring-1 ring-line overflow-hidden" role="img" aria-label="Where the Focus Ball is on your child's screen">
      <span className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-amber-400 ring-4 ring-white shadow transition-[left,top] duration-700" style={{ left: `${x}%`, top: `${y}%` }} />
    </div>
  );
}

export default function LiveView() {
  const { liveSession: live, child } = useParentStore();

  if (!live.isLive) {
    return (
      <div className="pb-12 max-w-2xl">
        <Card title={<span className="inline-flex items-center gap-2"><Radio size={18} className="text-muted" aria-hidden /> Nothing live right now</span>}>
          <EmptyState>When {child.name} starts a game on their device, you&apos;ll see it here as it happens and can send encouragement or offer a break.</EmptyState>
        </Card>
      </div>
    );
  }

  const acc = describeAccuracy(live.accuracy);
  const expression = live.emotion ? EMOTION_META[live.emotion] : null;

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,380px)] gap-6 pb-12 items-start">
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-nunito font-bold text-xl text-ink">{child.name} · {live.gameTitle}</h2>
            <span className={`rounded-full px-3 py-1 font-dm-sans text-[13px] font-bold ${live.isPaused ? "bg-amber-50 text-amber-700" : "bg-teal-100 text-teal-800"}`}>
              {live.isPaused ? "Paused" : "Playing"}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
            <Stat label="Progress" value={`${live.score}/${live.targetScore}`} />
            <Stat label="Time" value={formatElapsed(live.elapsedSeconds)} />
            <Stat label="Correct so far" value={live.accuracy == null ? "—" : `${live.accuracy}%`} sub={acc.label} />
            <Stat label={live.activeGame === "ball-tracker" ? "Avg reaction" : "Help on last item"} value={live.activeGame === "ball-tracker" ? (live.avgResponseMs ? `${(live.avgResponseMs / 1000).toFixed(1)}s` : "—") : PROMPT_LABELS[live.promptLevel || 0]} />
          </div>
          <p className="font-dm-sans text-[13px] text-muted mt-5">Level {live.level || 1} · numbers update every couple of seconds.</p>
        </Card>

        {live.activeGame === "ball-tracker" && (
          <Card title="Ball position">
            <BallMirror x={live.liveCoordinates?.x} y={live.liveCoordinates?.y} />
          </Card>
        )}

        {child.consent?.camera && (
          <Card title={<span className="inline-flex items-center gap-2"><Camera size={18} className="text-teal-700" aria-hidden /> Camera</span>}>
            <div className="flex flex-col sm:flex-row gap-5">
              {child.consent.liveFrames && (
                live.snapshotFrame ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={live.snapshotFrame} alt={`Latest still of ${child.name}`} className="w-48 aspect-[4/3] rounded-xl object-cover bg-canvas" />
                ) : (
                  <div className="w-48 aspect-[4/3] rounded-xl bg-canvas flex items-center justify-center font-dm-sans text-[13px] text-muted">Waiting for a still…</div>
                )
              )}
              <div>
                <p className="font-dm-sans text-[13px] text-muted">Expression estimate</p>
                <p className="font-nunito font-bold text-xl text-ink mt-0.5">{expression ? expression.label : "No reading"}</p>
                <p className="font-dm-sans text-sm text-ink-soft mt-1 max-w-sm">
                  {expression ? expression.parentText : "No face in view, or the camera is off on the child's device."} Estimates can be wrong — trust what you know about {child.name}.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
      <ParentRemoteControls liveSession={live} />
    </div>
  );
}
