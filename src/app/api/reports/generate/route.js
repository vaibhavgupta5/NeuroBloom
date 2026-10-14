import Session from "@/lib/models/Session";
import MoodEntry from "@/lib/models/MoodEntry";
import SleepLog from "@/lib/models/SleepLog";
import BehaviorLog from "@/lib/models/BehaviorLog";
import Goal from "@/lib/models/Goal";
import ClinicalReport from "@/lib/models/ClinicalReport";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { goalProgress, independentPct } from "@/lib/goals";
import { daysAgoKey, localDayKey } from "@/lib/dayUtils";
import { draftReport } from "@/lib/reportDraft";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (x) => (x == null ? null : Math.round(x * 10) / 10);

async function collectMetrics(child, days) {
  const since = new Date(Date.now() - days * 86400000);
  const sinceKey = daysAgoKey(days);
  const [sessions, moods, sleep, behaviors, goals] = await Promise.all([
    Session.find({ childId: child._id, completedAt: { $gte: since } }).lean(),
    MoodEntry.find({ childId: child._id, createdAt: { $gte: since } }).lean(),
    SleepLog.find({ childId: child._id, date: { $gte: sinceKey } }).lean(),
    BehaviorLog.find({ childId: child._id, date: { $gte: sinceKey } }).lean(),
    Goal.find({ childId: child._id }).lean(),
  ]);
  const completed = sessions.filter((s) => s.outcome === "completed");
  const levels = child.levels instanceof Map ? Object.fromEntries(child.levels) : child.levels || {};
  const bySkill = new Map();
  for (const s of completed) {
    if (!bySkill.has(s.skill)) bySkill.set(s.skill, []);
    bySkill.get(s.skill).push(s);
  }

  return {
    child: { name: child.name, age: child.age },
    period: { start: sinceKey, end: localDayKey(new Date()), days },
    totals: {
      completedSessions: completed.length,
      stoppedEarly: sessions.length - completed.length,
      activeDays: new Set(completed.map((s) => localDayKey(s.completedAt))).size,
      minutes: Math.round(sessions.reduce((a, s) => a + s.durationSec, 0) / 60),
      independencePct: completed.length ? Math.round(avg(completed.map(independentPct))) : null,
    },
    skills: [...bySkill.entries()].map(([skill, list]) => ({
      skill,
      sessions: list.length,
      avgAccuracy: Math.round(avg(list.map((s) => s.accuracy))),
      level: levels[skill] || 1,
    })),
    goals: await Promise.all(
      goals.map(async (g) => {
        const p = await goalProgress(g);
        return { title: g.title, skill: g.skill, status: g.status, criterionPct: g.criterion.independentPct, sessionsNeeded: p.needed, sessionsMeetingCriterion: p.meeting, recentIndependencePct: p.recentScores };
      })
    ),
    wellbeing: {
      moodEntries: moods.length,
      avgMood: round1(avg(moods.map((m) => m.score))),
      calmUses: moods.filter((m) => m.source === "calm").length,
      avgSleep: round1(avg(sleep.map((s) => s.hours))),
      behaviorIncidents: behaviors.reduce((a, b) => a + (b.incidents || 1), 0),
      maxIntensity: behaviors.length ? Math.max(...behaviors.map((b) => b.intensity)) : 0,
      behaviorExamples: behaviors.slice(0, 5).map((b) => ({ antecedent: b.antecedent, behavior: b.behavior, intensity: b.intensity })),
    },
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { user, child } = await requireCaregiver(body.childId, ["therapist"]);
    const days = [7, 14, 28].includes(body.days) ? body.days : 14;

    const metrics = await collectMetrics(child, days);
    const draft = await draftReport(metrics);

    const details = [
      `Skill and goal progress\n${draft.progress}`,
      `Mood, sleep and regulation\n${draft.regulation}`,
      `Recommendations\n${draft.recommendations.map((r) => `• ${r}`).join("\n")}`,
    ].join("\n\n");

    const report = await ClinicalReport.create({
      childId: child._id,
      authorId: user._id,
      title: `${days}-day progress report`,
      date: localDayKey(new Date()),
      type: "Progress",
      status: "draft",
      periodStart: metrics.period.start,
      periodEnd: metrics.period.end,
      generatedBy: draft.generatedBy,
      summary: draft.summary,
      details,
      metrics,
    });
    return Response.json({ ok: true, id: String(report._id), generatedBy: draft.generatedBy });
  } catch (err) {
    return authErrorResponse(err);
  }
}
