"use client";

import { useState } from "react";
import { Check, Circle, MessageSquareText, Sparkles } from "lucide-react";
import { useParentStore } from "../../../stores/useParentStore";
import { api } from "../../../lib/api";
import { Button, Card, EmptyState, Textarea } from "../../ui/kit";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { IndependenceChart, MoodTrendChart, SkillProgress } from "../charts";
import LiveObserverBanner from "../live/LiveObserverBanner";

function GoalRing({ done, goal }) {
  const pct = Math.min(1, goal > 0 ? done / goal : 0);
  const R = 40;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative w-24 h-24 shrink-0" role="img" aria-label={`${done} of ${goal} activities done today`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#E8FAF6" strokeWidth="10" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="#17977F" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-sora font-semibold text-xl text-ink tabular">
        {done}<span className="text-sm text-muted">/{goal}</span>
      </span>
    </div>
  );
}

function TodayCard() {
  const { child, stats, todayPlan, activeDaysStrip, commSentences7d, independenceThisWeek } = useParentStore();
  const done = stats.todayCompletedCount;
  const goal = stats.dailyGoal || 4;
  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex items-center gap-4 sm:w-64 shrink-0">
          <GoalRing done={done} goal={goal} />
          <div>
            <h2 className="font-nunito font-bold text-lg text-ink">Today</h2>
            <p className="font-dm-sans text-sm text-ink-soft mt-0.5">
              {done >= goal ? `${child.name} reached today's goal.` : `${goal - done} more to reach today's goal.`}
            </p>
            <p className="font-dm-sans text-[13px] text-muted mt-1 tabular">{stats.todayMinutes} min practised</p>
          </div>
        </div>
        <ul className="flex-1 grid sm:grid-cols-2 gap-2" aria-label="Today's activities">
          {todayPlan.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5">
              <SvgIconBadge type={m.iconKey} size={18} variant="ghost" className="p-0 border-0" />
              <span className="flex-1 min-w-0">
                <span className="block font-dm-sans text-sm font-bold text-ink truncate">{m.title}</span>
                <span className="block font-dm-sans text-[12px] text-muted">{m.skill} · level {m.level}</span>
              </span>
              {m.done ? <Check size={18} className="text-teal-700" aria-label="Done" /> : <Circle size={18} className="text-line" aria-label="Not yet" />}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 pt-5 border-t border-line grid grid-cols-3 gap-4">
        <div>
          <p className="font-dm-sans text-[13px] text-muted">Last 7 days</p>
          <div className="flex gap-1 mt-2" aria-label="Active days this week">
            {activeDaysStrip.map((d) => (
              <span key={d.day} title={`${d.day}: ${d.count} finished`} className={`w-5 h-5 rounded-md ${d.active ? "bg-teal-600" : "bg-mint"}`} />
            ))}
          </div>
        </div>
        <div>
          <p className="font-dm-sans text-[13px] text-muted">Answered alone</p>
          <p className="font-sora text-xl font-semibold text-ink mt-1 tabular">{independenceThisWeek == null ? "—" : `${independenceThisWeek}%`}</p>
        </div>
        <div>
          <p className="font-dm-sans text-[13px] text-muted">Talk-board sentences</p>
          <p className="font-sora text-xl font-semibold text-ink mt-1 tabular">{commSentences7d}</p>
        </div>
      </div>
    </Card>
  );
}

export function CoachingCard() {
  const { coaching, child, reload } = useParentStore();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!coaching) return null;
  const { activity, doneToday } = coaching;

  const markDone = async () => {
    setSaving(true);
    await api("/api/coaching", { method: "POST", body: { activityId: activity.id, note } }).catch(() => {});
    setSaving(false);
    setOpen(false);
    reload();
  };

  return (
    <Card title="Try this at home" action={<span className="font-dm-sans text-[13px] text-muted whitespace-nowrap">{activity.minutes} min · {activity.skill}</span>}>
      <h3 className="font-nunito font-bold text-xl text-ink -mt-1">{activity.title}</h3>
      <ol className="mt-3 flex flex-col gap-2 font-dm-sans text-[15px] text-ink-soft list-decimal pl-5">
        {activity.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>
      <p className="mt-3 font-dm-sans text-[13px] text-muted flex gap-1.5"><Sparkles size={14} className="mt-0.5 shrink-0" aria-hidden /> {activity.why}</p>
      <div className="mt-auto pt-5">
        {doneToday ? (
          <p className="font-dm-sans text-sm font-bold text-teal-700 flex items-center gap-1.5"><Check size={16} aria-hidden /> Done today{coaching.note ? ` — “${coaching.note}”` : ""}</p>
        ) : open ? (
          <div className="flex flex-col gap-3">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={`How did ${child.name} respond? (optional, shared with your therapist)`} aria-label="Note" />
            <div className="flex gap-2">
              <Button onClick={markDone} loading={saving}>Save</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setOpen(true)}><MessageSquareText size={16} aria-hidden /> We tried it</Button>
        )}
      </div>
    </Card>
  );
}

export function GoalsCard({ editable = false, onEdit }) {
  const { goals } = useParentStore();
  return (
    <Card title="Goals" action={editable ? onEdit : null}>
      {!goals.length ? (
        <EmptyState>No goals yet. Your therapist can set them, linked to a game, with a clear target.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {goals.map((g) => (
            <li key={g.id}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-dm-sans text-[15px] font-bold text-ink">{g.title}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-dm-sans text-[12px] font-bold ${g.status === "mastered" ? "bg-teal-100 text-teal-800" : g.status === "paused" ? "bg-mint text-muted" : "bg-amber-50 text-amber-700"}`}>
                  {g.status === "mastered" ? "Reached" : g.status === "paused" ? "Paused" : "In progress"}
                </span>
              </div>
              <p className="font-dm-sans text-[13px] text-muted mt-0.5">
                {g.skill} · target ≥{g.criterion.independentPct}% without help in {g.criterion.sessions} sessions in a row
              </p>
              <div className="flex gap-1.5 mt-2" aria-label={`${g.progress.meeting} of ${g.progress.needed} recent sessions met the target`}>
                {Array.from({ length: g.progress.needed }).map((_, i) => {
                  const score = g.progress.recentScores[i];
                  const met = score != null && score >= g.criterion.independentPct;
                  return (
                    <span key={i} className={`h-7 min-w-11 px-1.5 rounded-lg flex items-center justify-center font-dm-sans text-[12px] font-bold tabular ${met ? "bg-teal-600 text-white" : score != null ? "bg-mint text-ink-soft" : "bg-canvas text-muted ring-1 ring-line"}`}>
                      {score != null ? `${score}%` : "—"}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function Overview() {
  const { liveSession, weeklyMoodData, skillProgress, promptDependency, child, stats } = useParentStore();
  return (
    <div className="flex flex-col gap-6 pb-12">
      {liveSession?.isLive && <LiveObserverBanner />}
      <div className="grid lg:grid-cols-3 gap-6">
        <TodayCard />
        <CoachingCard />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <IndependenceChart data={promptDependency} childName={child.name} />
        <GoalsCard />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <MoodTrendChart
          data={weeklyMoodData}
          subtitle={stats.avgMoodDelta == null ? null : `Average ${stats.avgMoodScore}/5, ${stats.avgMoodDelta >= 0 ? "up" : "down"} ${Math.abs(stats.avgMoodDelta)} from last week.`}
        />
        <SkillProgress data={skillProgress} />
      </div>
    </div>
  );
}
