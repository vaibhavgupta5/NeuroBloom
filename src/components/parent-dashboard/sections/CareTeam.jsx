"use client";

import { useState } from "react";
import { Stethoscope, UserMinus } from "lucide-react";
import { useParentStore } from "../../../stores/useParentStore";
import { api } from "../../../lib/api";
import { Button, Card, EmptyState, Field, Input } from "../../ui/kit";
import ClinicalReports from "../ClinicalReports";
import RoutineEditor from "../../shared/RoutineEditor";
import { GoalsCard } from "./Overview";

function Therapists() {
  const { child, therapists, reload } = useParentStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const link = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/api/children/${child.id}/therapist`, { method: "POST", body: { inviteCode: code } });
      if (!child.consent?.dataSharing) await api(`/api/children/${child.id}`, { method: "PATCH", body: { consent: { dataSharing: true } } });
      setCode("");
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const unlink = async (therapistId) => {
    await api(`/api/children/${child.id}/therapist`, { method: "DELETE", body: { therapistId } }).catch(() => {});
    reload();
  };

  return (
    <Card title="Therapists">
      {therapists.length ? (
        <ul className="flex flex-col gap-2 mb-5">
          {therapists.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5">
              <Stethoscope size={18} className="text-teal-700" aria-hidden />
              <span className="flex-1 min-w-0">
                <span className="block font-dm-sans text-sm font-bold text-ink">{t.name}</span>
                {t.organization && <span className="block font-dm-sans text-[13px] text-muted truncate">{t.organization}</span>}
              </span>
              <Button variant="ghost" size="sm" onClick={() => unlink(t.id)} aria-label={`Unlink ${t.name}`}><UserMinus size={15} /></Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No therapist linked yet.</EmptyState>
      )}
      <form onSubmit={link} className="flex items-end gap-2">
        <Field label="Add with invite code" error={error} className="flex-1">
          {(id) => <Input id={id} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. NEHA2026" className="uppercase tracking-wider" />}
        </Field>
        <Button type="submit" loading={saving} disabled={!code.trim()} className={error ? "mb-6" : ""}>Link</Button>
      </form>
    </Card>
  );
}

function Notes() {
  const { therapistNotes } = useParentStore();
  return (
    <Card title="Notes from your therapist">
      {!therapistNotes.length ? (
        <EmptyState>Notes your therapist writes will appear here.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {therapistNotes.map((n) => (
            <li key={n.id}>
              <p className="font-dm-sans text-[13px] text-muted">{n.date} · {n.author}</p>
              <p className="font-dm-sans text-[15px] text-ink leading-relaxed mt-1 max-w-prose">{n.content}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function CareTeam() {
  const { child, routines, clinicalReports, reload } = useParentStore();
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          <GoalsCard />
          <Notes />
        </div>
        <div className="flex flex-col gap-6">
          <ClinicalReports reports={clinicalReports} />
          <Therapists />
        </div>
      </div>
      <RoutineEditor routines={routines} childId={child.id} childName={child.name} onChange={reload} />
    </div>
  );
}
