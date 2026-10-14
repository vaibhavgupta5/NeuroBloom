"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, Printer } from "lucide-react";
import { Card, EmptyState } from "../ui/kit";

export default function ClinicalReports({ reports, therapistView = false, footer }) {
  const [open, setOpen] = useState(null);
  return (
    <Card title="Reports" action={footer}>
      {!reports.length ? (
        <EmptyState>{therapistView ? "Draft a report from this child's real data." : "Reports from your therapist will appear here once they approve them."}</EmptyState>
      ) : (
        <ul className="divide-y divide-line -my-2">
          {reports.map((r) => {
            const expanded = open === r.id;
            return (
              <li key={r.id} className="py-3">
                <button onClick={() => setOpen(expanded ? null : r.id)} aria-expanded={expanded} className="w-full flex items-start gap-3 text-left">
                  <FileText size={20} className="text-teal-700 mt-0.5 shrink-0" aria-hidden />
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-dm-sans text-[15px] font-bold text-ink">{r.title}</span>
                      {r.status === "draft" && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-dm-sans text-[12px] font-bold text-amber-700">Draft</span>}
                      {r.generatedBy === "ai" && <span className="rounded-full bg-lavender-50 px-2 py-0.5 font-dm-sans text-[12px] font-bold text-lavender-700">AI-assisted</span>}
                    </span>
                    <span className="block font-dm-sans text-[13px] text-muted">{r.date}</span>
                  </span>
                  <ChevronDown size={18} className={`text-muted shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {expanded && (
                  <div className="mt-3 ml-8">
                    <p className="font-dm-sans text-[15px] text-ink leading-relaxed">{r.summary}</p>
                    <p className="font-dm-sans text-sm text-ink-soft leading-relaxed whitespace-pre-line mt-3">{r.details}</p>
                    <Link href={`/reports/${r.id}`} className="mt-4 inline-flex items-center gap-1.5 font-dm-sans text-sm font-bold text-teal-700 underline">
                      <Printer size={15} aria-hidden /> {therapistView ? "Open, edit or print" : "Open printable version"}
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
