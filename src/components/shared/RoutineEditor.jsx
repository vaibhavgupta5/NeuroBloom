"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../../lib/api";
import { IconFor, ROUTINE_ICON_CHOICES } from "../../lib/icons";
import { Button, Card, EmptyState, Field, Input } from "../ui/kit";

const blankStep = () => ({ label: "", iconKey: "star", durationMin: null, key: Math.random().toString(36).slice(2) });

function Editor({ initial, childId, onDone, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [steps, setSteps] = useState(initial?.steps?.map((s) => ({ ...s, key: s.id })) || [blankStep(), blankStep()]);
  const [pickerFor, setPickerFor] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (i, patch) => setSteps((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i, d) => setSteps((list) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    return next;
  });

  const save = async () => {
    setSaving(true);
    setError("");
    const body = { childId, name, steps: steps.map(({ label, iconKey, durationMin }) => ({ label, iconKey, durationMin: durationMin ? Number(durationMin) : null })) };
    try {
      if (initial) await api(`/api/routines/${initial.id}`, { method: "PATCH", body });
      else await api("/api/routines", { method: "POST", body });
      onDone();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Routine name">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bedtime" />}</Field>
      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={s.key} className="rounded-xl bg-canvas p-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPickerFor(pickerFor === i ? null : i)} aria-label="Choose picture" className="w-11 h-11 shrink-0 rounded-lg bg-white ring-1 ring-line flex items-center justify-center text-teal-700">
                <IconFor name={s.iconKey} size={22} />
              </button>
              <Input aria-label={`Step ${i + 1}`} value={s.label} onChange={(e) => update(i, { label: e.target.value })} placeholder={`Step ${i + 1}`} />
              <Input aria-label="Minutes (optional)" type="number" min="1" max="120" value={s.durationMin ?? ""} onChange={(e) => update(i, { durationMin: e.target.value })} placeholder="min" className="w-20 shrink-0" />
              <div className="flex shrink-0">
                <Button variant="ghost" size="sm" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></Button>
                <Button variant="ghost" size="sm" aria-label="Move down" disabled={i === steps.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></Button>
                <Button variant="ghost" size="sm" aria-label="Remove step" disabled={steps.length <= 2} onClick={() => setSteps((l) => l.filter((_, j) => j !== i))}><X size={16} /></Button>
              </div>
            </div>
            {pickerFor === i && (
              <div className="mt-2 grid grid-cols-6 sm:grid-cols-9 gap-1.5" role="listbox" aria-label="Pictures">
                {ROUTINE_ICON_CHOICES.map((k) => (
                  <button key={k} type="button" role="option" aria-selected={s.iconKey === k} aria-label={k} onClick={() => { update(i, { iconKey: k }); setPickerFor(null); }}
                    className={`h-10 rounded-lg flex items-center justify-center ${s.iconKey === k ? "bg-teal-700 text-white" : "bg-white text-ink-soft ring-1 ring-line hover:bg-mint"}`}>
                    <IconFor name={k} size={18} />
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <Button variant="ghost" className="self-start" disabled={steps.length >= 12} onClick={() => setSteps((l) => [...l, blankStep()])}><Plus size={16} aria-hidden /> Add step</Button>
      {error && <p role="alert" className="font-dm-sans text-sm text-coral-700">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={save} loading={saving}>Save routine</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function RoutineEditor({ routines, childId, childName, onChange }) {
  const [editing, setEditing] = useState(null); // routine | "new" | null

  const remove = async (id) => {
    await api(`/api/routines/${id}`, { method: "DELETE" }).catch(() => {});
    onChange();
  };

  return (
    <Card
      title="Visual schedules"
      action={!editing && <Button size="sm" variant="secondary" onClick={() => setEditing("new")}><Plus size={15} aria-hidden /> New</Button>}
    >
      <p className="font-dm-sans text-[13px] text-muted -mt-2 mb-4">Shown on {childName}&apos;s Schedule screen as pictures with a First → Then view.</p>
      {editing ? (
        <Editor initial={editing === "new" ? null : editing} childId={childId} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); onChange(); }} />
      ) : !routines.length ? (
        <EmptyState>No schedules yet. Start with one everyday routine, like the morning.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {routines.map((r) => (
            <li key={r.id} className="rounded-xl bg-canvas p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-dm-sans font-bold text-ink">{r.name}</p>
                <div className="flex">
                  <Button variant="ghost" size="sm" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)}><Pencil size={15} /></Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${r.name}`} onClick={() => remove(r.id)}><Trash2 size={15} /></Button>
                </div>
              </div>
              <ol className="mt-2 flex flex-wrap gap-1.5">
                {r.steps.map((s) => (
                  <li key={s.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-dm-sans text-[13px] text-ink-soft ring-1 ring-line">
                    <IconFor name={s.iconKey} size={14} className="text-teal-700" /> {s.label}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
