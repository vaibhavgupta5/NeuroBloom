import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import Module from "@/lib/models/Module";
import Session from "@/lib/models/Session";
import LiveSession from "@/lib/models/LiveSession";
import Achievement from "@/lib/models/Achievement";
import { localDayKey, startOfLocalDay } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

export async function POST(request) {
  await getConnection();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { moduleCode, score = 0, maxScore = 5, durationSec = 0, focusScore = 0, avgResponseMs = 0, outcome = "completed", moodBefore = null, wordsLearned = 0, emotionSummary = null } = body;

  if (!moduleCode) {
    return Response.json({ error: "moduleCode is required" }, { status: 400 });
  }

  const child = await Child.findOne();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  const mod = await Module.findOne({ code: moduleCode }).lean();
  if (!mod) {
    return Response.json({ error: `Unknown module: ${moduleCode}` }, { status: 400 });
  }

  const completedAt = new Date();
  const startedAt = new Date(completedAt.getTime() - Math.max(0, durationSec) * 1000);
  const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // After-game camera emotion summary (no snapshots — those live only on LiveSession)
  let cleanEmotionSummary = null;
  if (emotionSummary && typeof emotionSummary === "object") {
    cleanEmotionSummary = {
      dominant: typeof emotionSummary.dominant === "string" ? emotionSummary.dominant : null,
      avgConfidence: Number(emotionSummary.avgConfidence) || 0,
      timeline: Array.isArray(emotionSummary.timeline)
        ? emotionSummary.timeline
            .filter((p) => p && typeof p.emotion === "string")
            .slice(-20)
            .map((p) => ({ t: Number(p.t) || 0, emotion: p.emotion }))
        : [],
    };
  }

  await Session.create({
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
    outcome,
    moodBefore,
    wordsLearned: moduleCode === "word-match" ? wordsLearned : 0,
    emotionSummary: cleanEmotionSummary,
  });

  // Stars: 1–4 based on accuracy
  const starsEarned = Math.max(1, Math.round(accuracy / 25));

  // Recompute streak from session history
  const allSessions = await Session.find({ childId: child._id, outcome: "completed" })
    .select("completedAt")
    .lean();
  const activeDays = new Set(allSessions.map((s) => localDayKey(s.completedAt)));
  let streak = 0;
  const cursor = new Date();
  while (activeDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalSessions = await Session.countDocuments({ childId: child._id, outcome: "completed" });
  const stars = child.stars + starsEarned;

  await Child.findByIdAndUpdate(child._id, { streak, stars });

  // Achievement checks
  const achievementUpdates = [];
  if (streak >= 7) achievementUpdates.push({ rule: "streak-7" });
  if (streak >= 30) achievementUpdates.push({ rule: "streak-30" });
  if (stars >= 50) achievementUpdates.push({ rule: "stars-50" });
  if (achievementUpdates.length > 0) {
    await Achievement.updateMany(
      { childId: child._id, rule: { $in: achievementUpdates.map((u) => u.rule) }, unlocked: false },
      { unlocked: true, unlockedAt: new Date() }
    );
  }

  // Live session goes idle
  await LiveSession.findOneAndUpdate(
    { childId: child._id },
    { status: "idle", activeGame: null, gameTitle: null, updatedAt: new Date() },
    { upsert: true }
  );

  // Return the refreshed child state so the client can reconcile
  const modules = await Module.find().sort({ order: 1 }).lean();
  const dayStart = startOfLocalDay();
  const todaySessions = await Session.find({ childId: child._id, completedAt: { $gte: dayStart } })
    .sort({ completedAt: 1 })
    .lean();
  const doneCodes = new Set(todaySessions.map((s) => s.moduleCode));

  let firstIncompleteSeen = false;
  const todayModules = modules.map((m) => {
    const completed = doneCodes.has(m.code);
    let unlocked = completed;
    if (!completed && !firstIncompleteSeen) {
      unlocked = true;
      firstIncompleteSeen = true;
    }
    return {
      id: m.code,
      moduleCode: m.code,
      title: m.title,
      shortTitle: m.shortTitle,
      iconKey: m.iconKey,
      skill: m.skill,
      duration: `${m.durationMin} min`,
      durationSec: m.durationMin * 60,
      activeGameKey: m.activeGameKey,
      order: m.order,
      completed,
      unlocked,
    };
  });

  return Response.json({
    starsEarned,
    child: {
      id: child._id,
      name: child.name,
      age: child.age,
      avatarIcon: child.avatarIcon,
      streak,
      stars,
      dailyGoal: child.dailyGoal,
    },
    todayModules,
    totalSessions,
  });
}
