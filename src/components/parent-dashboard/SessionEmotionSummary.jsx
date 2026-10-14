"use client";

import { Camera } from "lucide-react";
import { useParentStore } from "../../stores/useParentStore";
import { EMOTION_META } from "../../lib/emotionUtils";
import { Card } from "../ui/kit";

/** Camera expression estimates from the most recent session that had them. */
export default function SessionEmotionSummary() {
  const { sessionTimeline, child } = useParentStore();
  if (!child.consent?.camera) return null;
  const session = sessionTimeline.find((s) => s.emotion);

  return (
    <Card title={<span className="inline-flex items-center gap-2"><Camera size={18} className="text-teal-700" aria-hidden /> Camera expression estimates</span>}>
      <p className="font-dm-sans text-[13px] text-muted -mt-2 mb-4 max-w-prose">
        Approximate readings of facial expression, not of feelings. These models were trained mostly on neurotypical faces and can misread autistic children — use them as a prompt to check in, never as a conclusion.
      </p>
      {!session ? (
        <p className="font-dm-sans text-sm text-ink-soft">No camera readings from today&apos;s games yet.</p>
      ) : (
        <Distribution session={session} />
      )}
    </Card>
  );
}

function Distribution({ session }) {
  const counts = {};
  for (const p of session.emotionTimeline || []) counts[p.emotion] = (counts[p.emotion] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <p className="font-dm-sans text-sm text-ink">
        {session.module} at {session.time}: mostly <strong>{EMOTION_META[session.emotion]?.label.toLowerCase() || session.emotion}</strong>.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map(([emotion, n]) => (
          <li key={emotion} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 font-dm-sans text-sm">
            <span className="text-ink-soft">{EMOTION_META[emotion]?.label || emotion}</span>
            <span className="h-2.5 rounded-full bg-mint overflow-hidden">
              <span className="block h-full rounded-full" style={{ width: `${Math.round((n / total) * 100)}%`, background: EMOTION_META[emotion]?.color || "#5F7384" }} />
            </span>
            <span className="text-right text-ink-soft tabular">{Math.round((n / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </>
  );
}
