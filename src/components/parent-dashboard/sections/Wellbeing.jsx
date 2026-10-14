"use client";

import { useState } from "react";
import { useParentStore } from "../../../stores/useParentStore";
import { api } from "../../../lib/api";
import { Button, Card, EmptyState, Field, Input, Segmented, Textarea } from "../../ui/kit";
import { BehaviorChart, MoodTrendChart, SleepChart } from "../charts";

function QuickLog() {
  const { child, reload } = useParentStore();
  const [kind, setKind] = useState("moment");
  const [form, setForm] = useState({ antecedent: "", behavior: "", consequence: "", intensity: 3, hours: "" });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      if (kind === "moment") {
        await api("/api/logs/behavior", { method: "POST", body: { antecedent: form.antecedent, behavior: form.behavior, consequence: form.consequence, intensity: Number(form.intensity) } });
        setForm((f) => ({ ...f, antecedent: "", behavior: "", consequence: "", intensity: 3 }));
      } else {
        await api("/api/logs/sleep", { method: "POST", body: { hours: Number(form.hours) } });
        setForm((f) => ({ ...f, hours: "" }));
      }
      setStatus({ ok: true, text: "Saved." });
      reload();
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Quick log">
      <Segmented label="What to log" value={kind} onChange={setKind} options={[{ value: "moment", label: "Difficult moment" }, { value: "sleep", label: "Last night's sleep" }]} />
      <form onSubmit={save} className="mt-5 flex flex-col gap-4">
        {kind === "moment" ? (
          <>
            <Field label="What happened just before?" hint="The trigger, if you noticed one.">
              {(id) => <Input id={id} value={form.antecedent} onChange={set("antecedent")} placeholder="e.g. Screen time ended" />}
            </Field>
            <Field label={`What did ${child.name} do?`}>
              {(id) => <Textarea id={id} value={form.behavior} onChange={set("behavior")} required className="min-h-20" />}
            </Field>
            <Field label="What happened after?" hint="What helped, or how it ended.">
              {(id) => <Input id={id} value={form.consequence} onChange={set("consequence")} placeholder="e.g. Used Calm Corner, settled in 5 min" />}
            </Field>
            <Field label="How intense was it?">
              <Segmented label="Intensity" value={Number(form.intensity)} onChange={(v) => setForm((f) => ({ ...f, intensity: v }))} options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
            </Field>
          </>
        ) : (
          <Field label="Hours slept">
            {(id) => <Input id={id} type="number" step="0.5" min="0" max="16" inputMode="decimal" value={form.hours} onChange={set("hours")} required className="w-32" />}
          </Field>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>Save</Button>
          {status && <p role="status" className={`font-dm-sans text-sm ${status.ok ? "text-teal-700" : "text-coral-700"}`}>{status.text}</p>}
        </div>
      </form>
    </Card>
  );
}

function BehaviorEntries() {
  const { behaviorEntries } = useParentStore();
  return (
    <Card title="Recent entries">
      {!behaviorEntries.length ? (
        <EmptyState>Logged moments will show here, so you and your therapist can spot patterns.</EmptyState>
      ) : (
        <ul className="divide-y divide-line">
          {behaviorEntries.map((b) => (
            <li key={b.id} className="py-3 font-dm-sans text-sm">
              <div className="flex justify-between text-muted text-[13px]">
                <span>{new Date(b.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="tabular">Intensity {b.intensity}/5</span>
              </div>
              <dl className="mt-1 grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-0.5 text-ink-soft">
                {b.antecedent && <><dt className="text-muted">Before</dt><dd>{b.antecedent}</dd></>}
                <dt className="text-muted">What</dt><dd className="text-ink">{b.behavior}</dd>
                {b.consequence && <><dt className="text-muted">After</dt><dd>{b.consequence}</dd></>}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function Wellbeing() {
  const { weeklyMoodData, sleepMoodData, behavioralData } = useParentStore();
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-6 items-start">
        <QuickLog />
        <div className="flex flex-col gap-6">
          <MoodTrendChart data={weeklyMoodData} title="Mood check-ins" />
          <div className="grid md:grid-cols-2 gap-6">
            <SleepChart data={sleepMoodData} />
            <BehaviorChart data={behavioralData} />
          </div>
        </div>
      </div>
      <BehaviorEntries />
    </div>
  );
}
