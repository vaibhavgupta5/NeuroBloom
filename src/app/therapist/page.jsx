"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Flag, Stethoscope } from "lucide-react";
import { api } from "../../lib/api";
import { Card, EmptyState } from "../../components/ui/kit";

function timeAgo(date) {
  if (!date) return "Never";
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export default function CaseloadPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/therapist/caseload").then(setData, (err) => setError(err.message));
  }, []);

  if (error) return <p className="font-dm-sans text-ink">{error}</p>;
  if (!data) return <div aria-busy="true" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-nunito font-extrabold text-3xl text-ink">Your caseload</h1>
        <p className="font-dm-sans text-muted mt-1">Share your invite code <strong className="text-ink">{data.therapist.inviteCode}</strong> with families to link them.</p>
      </div>
      {!data.children.length ? (
        <Card><EmptyState>No children linked yet. Share your invite code with a family.</EmptyState></Card>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {data.children.map((c) => (
            <li key={c.id}>
              <Link href={`/therapist/${c.id}`} className="card p-5 flex flex-col gap-3 hover:shadow-[var(--shadow-raised)] transition-shadow h-full">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-mint text-teal-700 flex items-center justify-center font-nunito font-bold">{c.name.slice(0, 1)}</span>
                  <div>
                    <p className="font-nunito font-bold text-lg text-ink">{c.name}</p>
                    <p className="font-dm-sans text-[13px] text-muted">Age {c.age} · parent {c.parentName || "—"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 font-dm-sans text-[13px] text-ink-soft mt-1">
                  <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden /> last session {timeAgo(c.lastSessionAt)}</span>
                  <span className="inline-flex items-center gap-1"><Flag size={14} aria-hidden /> {c.goalsActive} active goal{c.goalsActive === 1 ? "" : "s"}</span>
                </div>
                <div className="flex gap-2 mt-auto pt-2">
                  <span className="rounded-full bg-canvas px-2.5 py-1 font-dm-sans text-[12px] font-bold text-ink-soft">{c.sessions7d} sessions / 7d</span>
                  {c.accuracy7d != null && <span className="rounded-full bg-canvas px-2.5 py-1 font-dm-sans text-[12px] font-bold text-ink-soft">{c.accuracy7d}% accuracy</span>}
                  {c.highIntensityIncidents7d > 0 && <span className="rounded-full bg-coral-50 px-2.5 py-1 font-dm-sans text-[12px] font-bold text-coral-700">{c.highIntensityIncidents7d} high-intensity</span>}
                  {c.draftReports > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-dm-sans text-[12px] font-bold text-amber-700 inline-flex items-center gap-1"><Stethoscope size={12} aria-hidden /> {c.draftReports} draft report{c.draftReports === 1 ? "" : "s"}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
