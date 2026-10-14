"use client";

import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, EmptyState } from "../ui/kit";

// Validated categorical order (skills) and chart ink; see dataviz palette check.
export const SERIES = {
  primary: "#17977F",
  independent: "#17977F",
  prompted: "#E59400",
  notYet: "#C5D3CF",
  sleep: "#2B6CB0",
  incidents: "#D9603F",
};
const INK_MUTED = "#5F7384";
const GRID = "#E3EEEB";
const AXIS_TICK = { fill: INK_MUTED, fontSize: 12, fontFamily: "var(--font-dm-sans)" };
const MOOD_LABEL = { 1: "Sad", 2: "Not great", 3: "Okay", 4: "Good", 5: "Great" };

function ChartTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-[var(--shadow-raised)] font-dm-sans text-[13px]">
      <p className="font-bold text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-ink-soft mt-0.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color || p.fill }} aria-hidden />
          {format ? format(p) : `${p.name}: ${p.value ?? "—"}`}
        </p>
      ))}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <details className="mt-3 group">
      <summary className="font-dm-sans text-[13px] font-bold text-teal-700 cursor-pointer w-fit">View as table</summary>
      <div className="overflow-x-auto mt-2">
        <table className="w-full font-dm-sans text-[13px] tabular">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} className="text-left font-bold text-ink py-1 pr-4">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                {columns.map((c) => <td key={c.key} className="py-1 pr-4 text-ink-soft">{r[c.key] ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

const hasValues = (rows, key) => rows.some((r) => r[key] != null && r[key] !== 0);

export function MoodTrendChart({ data, title = "Mood this week", subtitle }) {
  return (
    <Card title={title}>
      {subtitle && <p className="font-dm-sans text-[13px] text-muted -mt-3 mb-3">{subtitle}</p>}
      {!hasValues(data, "score") ? (
        <EmptyState>No mood check-ins this week yet.</EmptyState>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 3, 5]} tickFormatter={(v) => MOOD_LABEL[v]} tick={AXIS_TICK} axisLine={false} tickLine={false} width={64} />
              <Tooltip content={<ChartTooltip format={(p) => `Mood: ${p.value} / 5`} />} cursor={{ stroke: GRID, strokeWidth: 2 }} />
              <Line type="monotone" dataKey="score" name="Mood" stroke={SERIES.primary} strokeWidth={2} connectNulls dot={{ r: 4, fill: SERIES.primary, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <DataTable columns={[{ key: "day", label: "Day" }, { key: "score", label: "Mood (1–5)" }]} rows={data} />
    </Card>
  );
}

export function SkillProgress({ data }) {
  return (
    <Card title="Skills (last 4 weeks)">
      {!data.length ? (
        <EmptyState>Skills appear after the first finished activity.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((s) => (
            <li key={s.label}>
              <div className="flex items-baseline justify-between font-dm-sans text-sm">
                <span className="font-bold text-ink">{s.label}</span>
                <span className="text-ink-soft tabular">
                  {s.value}% correct · level {s.level}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-full bg-mint overflow-hidden" role="img" aria-label={`${s.label}: ${s.value}% correct`}>
                <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function IndependenceChart({ data, childName }) {
  const latest = data[data.length - 1];
  const first = data.find((d) => d.trials > 0);
  const hasTrials = data.some((d) => d.trials > 0);
  let headline = "Independence is measured from game answers that needed no help.";
  if (hasTrials && latest?.trials && first && first !== latest) {
    const diff = latest.independent - first.independent;
    headline = diff > 0
      ? `${childName} answered ${latest.independent}% on their own this week, up from ${first.independent}%.`
      : diff < 0
        ? `${childName} answered ${latest.independent}% on their own this week, down from ${first.independent}%.`
        : `${childName} answered ${latest.independent}% on their own — steady.`;
  }
  return (
    <Card title="Independence">
      <p className="font-dm-sans text-sm text-ink-soft -mt-2 mb-4">{headline}</p>
      {!hasTrials ? (
        <EmptyState>Not enough answers yet.</EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-2 font-dm-sans text-[13px] text-ink-soft">
            {[["No help", SERIES.independent], ["With a hint", SERIES.prompted], ["Not yet", SERIES.notYet]].map(([l, c]) => (
              <span key={l} className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} aria-hidden />{l}</span>
            ))}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickFormatter={(v) => `${v}%`} tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<ChartTooltip format={(p) => `${p.name}: ${p.value}%`} />} cursor={{ fill: "#F0F7F5" }} />
                <Bar dataKey="independent" name="No help" stackId="a" fill={SERIES.independent} stroke="#fff" strokeWidth={2} isAnimationActive={false} />
                <Bar dataKey="prompted" name="With a hint" stackId="a" fill={SERIES.prompted} stroke="#fff" strokeWidth={2} isAnimationActive={false} />
                <Bar dataKey="skipped" name="Not yet" stackId="a" fill={SERIES.notYet} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      <DataTable
        columns={[{ key: "week", label: "Week" }, { key: "independent", label: "No help %" }, { key: "prompted", label: "With a hint %" }, { key: "skipped", label: "Not yet %" }, { key: "trials", label: "Answers" }]}
        rows={data}
      />
    </Card>
  );
}

export function FocusChart({ data }) {
  return (
    <Card title="Focus Ball accuracy">
      <p className="font-dm-sans text-[13px] text-muted -mt-3 mb-3">Daily average for the attention game. Hover to see the longest session.</p>
      {!hasValues(data, "focusScore") ? (
        <EmptyState>No Focus Ball games this week.</EmptyState>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl bg-white px-3 py-2 shadow-[var(--shadow-raised)] font-dm-sans text-[13px]">
                      <p className="font-bold text-ink">{label}</p>
                      <p className="text-ink-soft">Focus score: {payload[0].payload.focusScore ?? "—"}</p>
                      <p className="text-ink-soft">Longest session: {payload[0].payload.attentionSpan ?? "—"} min</p>
                    </div>
                  ) : null
                }
                cursor={{ stroke: GRID, strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="focusScore" stroke={SERIES.primary} strokeWidth={2} connectNulls dot={{ r: 4, fill: SERIES.primary, stroke: "#fff", strokeWidth: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <DataTable columns={[{ key: "day", label: "Day" }, { key: "focusScore", label: "Focus score" }, { key: "attentionSpan", label: "Longest (min)" }]} rows={data} />
    </Card>
  );
}

export function TimePerSkillChart({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <Card title="Practice time this week">
      {!data.length ? (
        <EmptyState>No practice this week yet.</EmptyState>
      ) : (
        <>
          <p className="font-sora text-3xl font-semibold text-ink tabular">{total}<span className="text-base text-muted font-dm-sans font-medium"> min</span></p>
          <ul className="mt-4 flex flex-col gap-3">
            {[...data].sort((a, b) => b.value - a.value).map((d) => (
              <li key={d.name} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 font-dm-sans text-sm">
                <span className="text-ink font-bold truncate">{d.name}</span>
                <span className="h-2.5 rounded-full bg-mint overflow-hidden">
                  <span className="block h-full rounded-full" style={{ width: `${Math.round((d.value / total) * 100)}%`, background: d.color }} />
                </span>
                <span className="text-ink-soft text-right tabular">{d.value}m</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export function SleepChart({ data }) {
  return (
    <Card title="Sleep">
      {!hasValues(data, "sleepHours") ? (
        <EmptyState>No sleep logged this week. Add last night&apos;s sleep with Quick log.</EmptyState>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} ticks={[0, 6, 12]} tickFormatter={(v) => `${v}h`} tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip format={(p) => `Sleep: ${p.value ?? "—"} h`} />} cursor={{ fill: "#F0F7F5" }} />
              <Bar dataKey="sleepHours" name="Sleep" fill={SERIES.sleep} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <DataTable columns={[{ key: "day", label: "Day" }, { key: "sleepHours", label: "Sleep (h)" }, { key: "moodScore", label: "Mood (1–5)" }]} rows={data} />
    </Card>
  );
}

export function BehaviorChart({ data }) {
  return (
    <Card title="Difficult moments">
      {!hasValues(data, "incidents") ? (
        <EmptyState>Nothing logged this week.</EmptyState>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl bg-white px-3 py-2 shadow-[var(--shadow-raised)] font-dm-sans text-[13px]">
                      <p className="font-bold text-ink">{label}</p>
                      <p className="text-ink-soft">{payload[0].payload.incidents} logged</p>
                      {payload[0].payload.intensity > 0 && <p className="text-ink-soft">Highest intensity {payload[0].payload.intensity}/5</p>}
                    </div>
                  ) : null
                }
                cursor={{ fill: "#F0F7F5" }}
              />
              <Bar dataKey="incidents" name="Incidents" fill={SERIES.incidents} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <DataTable columns={[{ key: "day", label: "Day" }, { key: "incidents", label: "Logged" }, { key: "intensity", label: "Highest intensity" }]} rows={data} />
    </Card>
  );
}

export function VocabularyChart({ data }) {
  return (
    <Card title="Words matched without help">
      {!hasValues(data, "wordsLearned") ? (
        <EmptyState>Play Word Match to start counting words.</EmptyState>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="week" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTooltip format={(p) => `${p.value} words`} />} cursor={{ fill: "#F0F7F5" }} />
              <Bar dataKey="wordsLearned" name="Words" fill={SERIES.primary} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <DataTable columns={[{ key: "week", label: "Week" }, { key: "wordsLearned", label: "Words" }, { key: "cumulative", label: "Running total" }]} rows={data} />
    </Card>
  );
}
