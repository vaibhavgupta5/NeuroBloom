"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { api } from "../../../lib/api";
import { Button, Card, EmptyState, Field, Input, Segmented, Select, Textarea } from "../../../components/ui/kit";
import { GoalsCard } from "../../../components/parent-dashboard/sections/Overview";
import { useParentStore } from "../../../stores/useParentStore";
import RoutineEditor from "../../../components/shared/RoutineEditor";
import ClinicalReports from "../../../components/parent-dashboard/ClinicalReports";
import { IndependenceChart, MoodTrendChart, SkillProgress } from "../../../components/parent-dashboard/charts";

function NewGoalForm({ childId, modules, onDone }) {
  const [moduleCode, setModuleCode] = useState(modules[0]?.code || "");
  const [title, setTitle] = useState("");
  const [pct, setPct] = useState(80);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/goals", { method: "POST", body: { childId, moduleCode, title, independentPct: pct, sessions: 3 } });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-3 rounded-xl bg-canvas p-4">
      <Field label="Activity">
        {(id) => (
          <Select id={id} value={moduleCode} onChange={(e) => setModuleCode(e.target.value)}>
            {modules.map((m) => <option key={m.code} value={m.code}>{m.title} ({m.skill})</option>)}
          </Select>
        )}
      </Field>
      <Field label="Goal, in plain language">
        {(id) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Identify 6 everyday words without help" required />}
      </Field>
      <Field label="Target independence">
        <Segmented label="Target independence" value={pct} onChange={setPct} options={[70, 80, 90].map((n) => ({ value: n, label: `${n}%` }))} />
      </Field>
      {error && <p role="alert" className="font-dm-sans text-sm text-coral-700">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={saving}>Add goal</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

function NewNoteForm({ childId, onDone }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/notes", { method: "POST", body: { childId, content } });
      setContent("");
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a note the parent will see…" required />
      {error && <p role="alert" className="font-dm-sans text-sm text-coral-700">{error}</p>}
      <Button type="submit" loading={saving} disabled={!content.trim()} className="self-start">Send note</Button>
    </form>
  );
}

function GenerateReport({ childId, onDone }) {
  const router = useRouter();
  const [days, setDays] = useState(14);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setGenerating(true);
    setError("");
    try {
      const { id } = await api("/api/reports/generate", { method: "POST", body: { childId, days } });
      onDone();
      router.push(`/reports/${id}`);
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label="Period">
        <Segmented label="Period" value={days} onChange={setDays} options={[7, 14, 28].map((n) => ({ value: n, label: `${n} days` }))} />
      </Field>
      {error && <p role="alert" className="font-dm-sans text-sm text-coral-700">{error}</p>}
      <Button onClick={run} loading={generating}><FileText size={16} aria-hidden /> Draft report from real data</Button>
      <p className="font-dm-sans text-[13px] text-muted">Pulls this child&apos;s actual sessions, goals and logs. You review and edit before the parent sees it.</p>
    </div>
  );
}

export default function TherapistChildPage() {
  const { childId } = useParams();
  const [modules, setModules] = useState([]);
  const [addingGoal, setAddingGoal] = useState(false);
  const [addingReport, setAddingReport] = useState(false);
  const store = useParentStore();

  const load = useCallback(() => {
    api(`/api/parent/dashboard?childId=${childId}`).then(store.hydrateDashboard, (err) => store.setLoadError(err.message));
  }, [childId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    api("/api/modules").then((d) => setModules(d.modules));
  }, [load]);

  if (!store.hydrated) return <div aria-busy="true" />;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href="/therapist" className="inline-flex items-center gap-1.5 font-dm-sans text-sm font-bold text-teal-700"><ArrowLeft size={15} aria-hidden /> Caseload</Link>
      <h1 className="font-nunito font-extrabold text-3xl text-ink">{store.child.name}</h1>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <MoodTrendChart data={store.weeklyMoodData} title={`${store.child.name}'s mood`} />
        <IndependenceChart data={store.promptDependency} childName={store.child.name} />
      </div>
      <SkillProgress data={store.skillProgress} />

      <GoalsCard
        editable
        onEdit={!addingGoal && <Button size="sm" variant="secondary" onClick={() => setAddingGoal(true)}><Plus size={15} aria-hidden /> New goal</Button>}
      />
      {addingGoal && (
        <Card title="Add a goal">
          <NewGoalForm childId={childId} modules={modules} onDone={() => { setAddingGoal(false); load(); }} />
        </Card>
      )}

      <RoutineEditor routines={store.routines} childId={childId} childName={store.child.name} onChange={load} />

      <Card title="Notes for the family">
        <NewNoteForm childId={childId} onDone={load} />
        {store.therapistNotes.length > 0 && (
          <ul className="mt-5 flex flex-col gap-3 pt-5 border-t border-line">
            {store.therapistNotes.map((n) => (
              <li key={n.id}>
                <p className="font-dm-sans text-[13px] text-muted">{n.date}</p>
                <p className="font-dm-sans text-[15px] text-ink mt-0.5">{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Reports" action={!addingReport && <Button size="sm" variant="secondary" onClick={() => setAddingReport(true)}><Plus size={15} aria-hidden /> New report</Button>}>
        {addingReport ? <GenerateReport childId={childId} onDone={() => { setAddingReport(false); load(); }} /> : (
          !store.clinicalReports.length && <EmptyState>No reports yet for this child.</EmptyState>
        )}
      </Card>
      {store.clinicalReports.length > 0 && <ClinicalReports reports={store.clinicalReports} therapistView />}
    </div>
  );
}
