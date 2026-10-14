"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Pencil, Printer, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";
import { Button, Field, Input, Textarea } from "../../../components/ui/kit";

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api("/api/auth/me"), api(`/api/reports/${id}`)])
      .then(([meData, reportData]) => {
        setMe(meData);
        setData(reportData);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const isTherapist = me?.user.role === "therapist";

  const startEdit = () => {
    setForm({ title: data.report.title, summary: data.report.summary, details: data.report.details });
    setEditing(true);
  };

  const save = async (patch) => {
    setSaving(true);
    try {
      await api(`/api/reports/${id}`, { method: "PATCH", body: patch });
      const fresh = await api(`/api/reports/${id}`);
      setData(fresh);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    await api(`/api/reports/${id}`, { method: "DELETE" }).catch((err) => setError(err.message));
    router.back();
  };

  if (error) {
    return (
      <main className="min-h-dvh bg-canvas flex items-center justify-center p-6">
        <p className="font-dm-sans text-ink">{error}</p>
      </main>
    );
  }
  if (!data) return <main className="min-h-dvh bg-canvas" aria-busy="true" />;

  const { report, child } = data;

  return (
    <main className="min-h-dvh bg-canvas px-4 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl">
        <div className="no-print flex items-center justify-between mb-6 flex-wrap gap-2">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft size={16} aria-hidden /> Back</Button>
          <div className="flex gap-2">
            {isTherapist && !editing && <Button variant="secondary" onClick={startEdit}><Pencil size={16} aria-hidden /> Edit</Button>}
            <Button variant="secondary" onClick={() => window.print()}><Printer size={16} aria-hidden /> Print / Save PDF</Button>
            {isTherapist && report.status === "draft" && !editing && (
              <Button variant="danger" onClick={remove}><Trash2 size={16} aria-hidden /> Delete draft</Button>
            )}
          </div>
        </div>

        <article className="card p-8 print:shadow-none print:ring-0">
          <header className="flex items-start justify-between gap-4 pb-6 border-b border-line">
            <div className="flex-1">
              {editing ? (
                <Field label="Title">{(id2) => <Input id={id2} value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />}</Field>
              ) : (
                <h1 className="font-nunito font-extrabold text-2xl text-ink">{report.title}</h1>
              )}
              <p className="font-dm-sans text-sm text-muted mt-1">
                {child.name} · {report.periodStart && report.periodEnd ? `${report.periodStart} to ${report.periodEnd}` : report.date}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 font-dm-sans text-[13px] font-bold ${report.status === "approved" ? "bg-teal-100 text-teal-800" : "bg-amber-50 text-amber-700"}`}>
              {report.status === "approved" ? "Approved" : "Draft"}
            </span>
          </header>

          <section className="mt-6">
            <h2 className="font-nunito font-bold text-lg text-ink">Summary</h2>
            {editing ? (
              <Textarea value={form.summary} onChange={(e) => setForm((s) => ({ ...s, summary: e.target.value }))} className="mt-2" />
            ) : (
              <p className="font-dm-sans text-[15px] text-ink leading-relaxed mt-2 whitespace-pre-line">{report.summary}</p>
            )}
          </section>

          <section className="mt-6">
            <h2 className="font-nunito font-bold text-lg text-ink">Details</h2>
            {editing ? (
              <Textarea value={form.details} onChange={(e) => setForm((s) => ({ ...s, details: e.target.value }))} className="mt-2 min-h-56" />
            ) : (
              <p className="font-dm-sans text-sm text-ink-soft leading-relaxed mt-2 whitespace-pre-line">{report.details}</p>
            )}
          </section>

          {report.generatedBy && report.generatedBy !== "manual" && !editing && (
            <p className="no-print font-dm-sans text-[12px] text-muted mt-6 pt-4 border-t border-line">
              {report.generatedBy === "ai"
                ? "First drafted with AI assistance from this child's real session data, then reviewed by their therapist."
                : "Drafted from a template because AI drafting wasn't available."}
            </p>
          )}
        </article>

        {isTherapist && (
          <div className="no-print mt-4 flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button onClick={() => save(form)} loading={saving}>Save changes</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : report.status === "draft" ? (
              <Button onClick={() => save({ status: "approved" })} loading={saving}><Check size={16} aria-hidden /> Approve for parent</Button>
            ) : (
              <Button variant="ghost" onClick={() => save({ status: "draft" })} loading={saving}>Move back to draft</Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
