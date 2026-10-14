import Goal from "./models/Goal";
import Session from "./models/Session";

export function independentPct(session) {
  const trials = session.trials || [];
  if (trials.length === 0) return session.accuracy ?? 0;
  const independent = trials.filter((t) => t.correct && (t.promptLevel || 0) === 0).length;
  return Math.round((independent / trials.length) * 100);
}

/** Progress of one goal: the last N completed sessions of its module vs the criterion. */
export async function goalProgress(goal) {
  const recent = await Session.find({ childId: goal.childId, moduleCode: goal.moduleCode, outcome: "completed" })
    .sort({ completedAt: -1 })
    .limit(goal.criterion.sessions)
    .select("trials accuracy completedAt")
    .lean();
  const scores = recent.map(independentPct);
  const meeting = scores.filter((s) => s >= goal.criterion.independentPct).length;
  return { recentScores: scores.reverse(), meeting, needed: goal.criterion.sessions };
}

/** Marks active goals for this module as mastered once the criterion is met. Returns newly mastered goals. */
export async function evaluateGoals(childId, moduleCode) {
  const goals = await Goal.find({ childId, moduleCode, status: "active" });
  const mastered = [];
  for (const goal of goals) {
    const { meeting, needed } = await goalProgress(goal);
    if (meeting >= needed) {
      goal.status = "mastered";
      goal.masteredAt = new Date();
      await goal.save();
      mastered.push(goal);
    }
  }
  return mastered;
}
