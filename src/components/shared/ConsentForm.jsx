"use client";

import { Toggle } from "../ui/kit";

export default function ConsentForm({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col divide-y divide-line">
      <Toggle
        label="Camera expression estimates"
        description="The camera runs on this device only. It estimates facial expressions to offer breaks and power the Mirror Me game. Video is never recorded or uploaded. Estimates are approximate and can be wrong, especially for autistic children."
        checked={value.camera}
        onChange={(camera) => set({ camera, liveFrames: camera ? value.liveFrames : false })}
      />
      <Toggle
        label="Live snapshot for parents"
        description="While a game is running, a small low-resolution still is shared with signed-in carers every few seconds. Only the latest frame is kept, and it is deleted when the game ends."
        checked={value.liveFrames}
        disabled={!value.camera}
        onChange={(liveFrames) => set({ liveFrames })}
      />
      <Toggle
        label="Share progress with linked therapists"
        description="Lets therapists you link see sessions, goals, logs and reports for this child. You can unlink them at any time."
        checked={value.dataSharing}
        onChange={(dataSharing) => set({ dataSharing })}
      />
    </div>
  );
}
