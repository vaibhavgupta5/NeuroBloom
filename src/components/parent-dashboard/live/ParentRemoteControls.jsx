"use client";

import { useRef, useState } from "react";
import { Coffee, Pause, Play } from "lucide-react";
import { useParentActionSender } from "../../../hooks/useRealtimeSync";
import { useParentStore } from "../../../stores/useParentStore";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { Button, Card, Segmented } from "../../ui/kit";

const STICKERS = [
  { id: "great", label: "Great job", iconKey: "star", text: "Great job!" },
  { id: "proud", label: "Proud of you", iconKey: "heart", text: "So proud of you!" },
  { id: "keep", label: "Keep going", iconKey: "flame", text: "Keep going!" },
  { id: "breath", label: "Slow breath", iconKey: "happy", text: "Let's take a slow breath" },
];

export default function ParentRemoteControls({ liveSession }) {
  const { sendParentAction } = useParentActionSender();
  const child = useParentStore((s) => s.child);
  const [sent, setSent] = useState(null);
  const [speed, setSpeed] = useState(liveSession.speedMultiplier || 1);
  const speedTimer = useRef(null);

  const sticker = (s) => {
    sendParentAction({ actionType: "SEND_STICKER", payload: s });
    setSent(s.id);
    setTimeout(() => setSent(null), 2000);
  };

  const changeSpeed = (v) => {
    setSpeed(v);
    clearTimeout(speedTimer.current);
    speedTimer.current = setTimeout(() => sendParentAction({ actionType: "SET_SPEED", payload: { speed: v } }), 300);
  };

  return (
    <Card title="Support from here">
      <p className="font-dm-sans text-[13px] text-muted -mt-2 mb-3">Encouragement appears gently on {child.name}&apos;s screen for a few seconds.</p>
      <div className="grid grid-cols-2 gap-2">
        {STICKERS.map((s) => (
          <button key={s.id} onClick={() => sticker(s)} className="h-12 px-3 rounded-xl bg-canvas hover:bg-mint flex items-center gap-2 font-dm-sans text-sm font-bold text-ink text-left">
            <SvgIconBadge type={s.iconKey} size={18} variant="amber" />
            {sent === s.id ? "Sent" : s.label}
          </button>
        ))}
      </div>

      {liveSession.activeGame === "ball-tracker" && (
        <div className="mt-5">
          <p className="font-dm-sans text-sm font-bold text-ink mb-2">Ball speed</p>
          <Segmented label="Ball speed" value={speed} onChange={changeSpeed} options={[{ value: 0.5, label: "Slower" }, { value: 0.75, label: "Gentle" }, { value: 1, label: "Normal" }, { value: 1.25, label: "Faster" }]} />
        </div>
      )}

      <div className="mt-5 grid sm:grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => sendParentAction({ actionType: "OFFER_BREAK", payload: {} })}>
          <Coffee size={16} aria-hidden /> Offer a break
        </Button>
        <Button variant={liveSession.isPaused ? "primary" : "secondary"} onClick={() => sendParentAction({ actionType: "TOGGLE_PAUSE", payload: { isPaused: !liveSession.isPaused } })}>
          {liveSession.isPaused ? <><Play size={16} aria-hidden /> Resume</> : <><Pause size={16} aria-hidden /> Pause game</>}
        </Button>
      </div>
    </Card>
  );
}
