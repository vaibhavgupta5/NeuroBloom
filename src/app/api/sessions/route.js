import Module from "@/lib/models/Module";
import Session from "@/lib/models/Session";
import LiveSession from "@/lib/models/LiveSession";
import { unlockAchievements } from "@/lib/achievements";
import { authErrorResponse, requireChild } from "@/lib/auth";
import { buildTodayModules, publicChild } from "@/lib/childPlan";
import { evaluateGoals, independentPct } from "@/lib/goals";
import { localDayKey, startOfLocalDay } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

const MAX_LEVEL = 3;

function cleanTrials(trials) {
  if (!Array.isArray(trials)) return [];
  return trials.slice(0, 100).map((t) => ({
    itemId: String(t?.itemId ?? ""),
    correct: Boolean(t?.correct),
    latencyMs: Number.isFinite(t?.latencyMs) ? Math.max(0, Math.round(t.latencyMs)) : null,
    promptLevel: Math.min(4, Math.max(0, Number(t?.promptLevel) || 0)),
  }));
}

function cleanEmotionSummary(summary) {
  if (!summary || typeof summary !== "object") return null;
  return {
    dominant: typeof summary.dominant === "string" ? summary.dominant : null,
    avgConfidence: Number(summary.avgConfidence) || 0,
    timeline: Array.isArray(summary.timeline)
      ? summary.timeline
          .filter((p) => p && typeof p.emotion === "string")
          .slice(-20)
          .map((p) => ({ t: Number(p.t) || 0, emotion: p.emotion }))
      : [],
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body?.moduleCode) return Response.json({ error: "moduleCode is required" }, { status: 400 });

    const { child } = await requireChild();
    const {
      moduleCode, score = 0, maxScore = 5, durationSec = 0, focusScore = 0, avgResponseMs = 0,
      outcome = "completed", moodBefore = null, wordsLearned = 0, emotionSummary = null, level = 1,
    } = body;

    const mod = await Module.findOne({ code: moduleCode }).lean();
    if (!mod) return Response.json({ error: `Unknown module: ${moduleCode}` }, { status: 400 });

    const completedAt = new Date();
    const startedAt = new Date(completedAt.getTime() - Math.max(0, durationSec) * 1000);
    const accuracy = maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;
    const trials = cleanTrials(body.trials);
    const finalOutcome = outcome === "completed" ? "completed" : "abandoned";

    const alreadyCompletedToday = finalOutcome === "completed" && await Session.exists({
      childId: child._id,
      moduleCode,
      outcome: "completed",
      completedAt: { $gte: startOfLocalDay() },
    });

    const session = await Session.create({
      childId: child._id,
      moduleCode,
      gameTitle: mod.title,
      skill: mod.skill,
      startedAt,
      completedAt,
      durationSec,
      score,
      maxScore,
      accuracy,
      focusScore,
      avgResponseMs,
      outcome: finalOutcome,
      moodBefore,
      wordsLearned: moduleCode === "word-match" ? wordsLearned : 0,
      level,
      trials,
      emotionSummary: cleanEmotionSummary(emotionSummary),
    });

    // Stars only for the first completion of a module each day
    const starsEarned = finalOutcome === "completed" && !alreadyCompletedToday && score > 0
      ? Math.max(1, Math.round(accuracy / 25))
      : 0;

    // Session-level staircase: step up after a strong independent session, down after a hard one
    let newLevel = null;
    if (finalOutcome === "completed") {
      const indep = independentPct(session);
      const current = child.levels?.get(mod.skill) || 1;
      if (indep >= 80 && current < MAX_LEVEL) newLevel = current + 1;
      else if (accuracy < 50 && current > 1) newLevel = current - 1;
      if (newLevel) child.levels.set(mod.skill, newLevel);
    }

    const allSessions = await Session.find({ childId: child._id, outcome: "completed" }).select("completedAt").lean();
    const activeDays = new Set(allSessions.map((s) => localDayKey(s.completedAt)));
    let streak = 0;
    const cursor = new Date();
    if (!activeDays.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(localDayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    child.streak = streak;
    child.stars += starsEarned;
    await child.save();

    const masteredGoals = finalOutcome === "completed" ? await evaluateGoals(child._id, moduleCode) : [];

    const rules = [];
    if (finalOutcome === "completed") rules.push("first-session");
    if (streak >= 3) rules.push("streak-3");
    if (streak >= 7) rules.push("streak-7");
    if (streak >= 30) rules.push("streak-30");
    if (child.stars >= 50) rules.push("stars-50");
    if (masteredGoals.length) rules.push("goal-mastered");
    await unlockAchievements(child._id, rules);

    await LiveSession.findOneAndUpdate(
      { childId: child._id },
      { status: "idle", activeGame: null, gameTitle: null, snapshotFrame: null, emotion: null, updatedAt: new Date() },
      { upsert: true }
    );

    return Response.json({
      starsEarned,
      newLevel,
      masteredGoals: masteredGoals.map((g) => g.title),
      child: publicChild(child),
      todayModules: await buildTodayModules(child),
      totalSessions: allSessions.length,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
