"use client";

import { Field, Segmented, Toggle } from "../ui/kit";

export const DEFAULT_SENSORY = { motion: "reduced", sfx: true, voice: true, voiceRate: 0.9, calmPalette: false, showTimer: false, sessionMinutes: 15 };

export default function SensoryProfileForm({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col divide-y divide-line">
      <div className="pb-4">
        <Field label="Movement on screen" hint="Reduced keeps gentle transitions only. None turns off all animation.">
          <Segmented
            label="Movement on screen"
            value={value.motion}
            onChange={(motion) => set({ motion })}
            options={[
              { value: "full", label: "Full" },
              { value: "reduced", label: "Reduced" },
              { value: "none", label: "None" },
            ]}
          />
        </Field>
      </div>
      <Toggle label="Read prompts aloud" description="Speaks questions, answers and labels — helpful for children who don't read yet." checked={value.voice} onChange={(voice) => set({ voice })} />
      {value.voice && (
        <div className="py-3">
          <Field label="Voice speed">
            <Segmented
              label="Voice speed"
              value={value.voiceRate}
              onChange={(voiceRate) => set({ voiceRate })}
              options={[
                { value: 0.75, label: "Slow" },
                { value: 0.9, label: "Calm" },
                { value: 1.05, label: "Normal" },
              ]}
            />
          </Field>
        </div>
      )}
      <Toggle label="Sound effects" description="Soft taps and chimes on buttons and rewards." checked={value.sfx} onChange={(sfx) => set({ sfx })} />
      <Toggle label="Calm colours" description="Lowers colour saturation across the child app." checked={value.calmPalette} onChange={(calmPalette) => set({ calmPalette })} />
      <Toggle label="Show countdown timers" description="Off by default — timers can feel stressful. Games still end on their own." checked={value.showTimer} onChange={(showTimer) => set({ showTimer })} />
      <div className="pt-4">
        <Field label="Daily practice length" hint="A gentle reminder to take a break appears after this.">
          <Segmented
            label="Daily practice length"
            value={value.sessionMinutes}
            onChange={(sessionMinutes) => set({ sessionMinutes })}
            options={[10, 15, 20, 30].map((m) => ({ value: m, label: `${m} min` }))}
          />
        </Field>
      </div>
    </div>
  );
}
