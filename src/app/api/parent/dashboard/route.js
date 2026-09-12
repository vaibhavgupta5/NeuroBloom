import { getConnection } from "@/lib/db";
import Parent from "@/lib/models/Parent";
import Child from "@/lib/models/Child";
import Module from "@/lib/models/Module";
import Session from "@/lib/models/Session";
import MoodEntry from "@/lib/models/MoodEntry";
import SleepLog from "@/lib/models/SleepLog";
import BehaviorLog from "@/lib/models/BehaviorLog";
import TherapistNote from "@/lib/models/TherapistNote";
import ClinicalReport from "@/lib/models/ClinicalReport";
import Achievement from "@/lib/models/Achievement";
import { localDayKey, startOfLocalDay } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayWindow(n) {
  // n days back → { start, key, label }
  const d = new Date();
  d.setDate(d.getDate() - n);
  return { start: startOfLocalDay(d), key: localDayKey(d), label: DAY_LABELS[d.getDay()], n };
}

const MOOD_ICON = { 5: "happy", 4: "happy", 3: "neutral", 2: "neutral", 1: "sad" };

export async function GET() {
  await getConnection();

  const parent = await Parent.findOne().lean();
  const child = await Child.findOne().lean();
  if (!parent || !child) {
    return Response.json({ error: "No family found. Run: npm run seed" }, { status: 404 });
  }

  const since = dayWindow(27).start; // 4-week window

  const [sessions, moods, sleepLogs, behaviorLogs, notes, reports, achievements, modules] = await Promise.all([
    Session.find({ childId: child._id, completedAt: { $gte: since } }).sort({ completedAt: 1 }).lean(),
    MoodEntry.find({ childId: child._id, createdAt: { $gte: since } }).sort({ createdAt: 1 }).lean(),
    SleepLog.find({ childId: child._id, date: { $gte: localDayKey(since) } }).lean(),
    BehaviorLog.find({ childId: child._id, date: { $gte: localDayKey(since) } }).lean(),
    TherapistNote.find({ childId: child._id }).sort({ date: -1 }).lean(),
    ClinicalReport.find({ childId: child._id }).sort({ date: -1 }).lean(),
    Achievement.find({ childId: child._id }).lean(),
    Module.find().sort({ order: 1 }).lean(),
  ]);

  // ---- Group sessions by local day -----------------------------------------
  const sessionsByDay = new Map(); // dayKey → [sessions]
  for (const s of sessions) {
    const k = localDayKey(s.completedAt);
    if (!sessionsByDay.has(k)) sessionsByDay.set(k, []);
    sessionsByDay.get(k).push(s);
  }
  const moodsByDay = new Map(); // dayKey → [moods]
  for (const m of moods) {
    const k = localDayKey(m.createdAt);
    if (!moodsByDay.has(k)) moodsByDay.set(k, []);
    moodsByDay.get(k).push(m);
  }
  const sleepByDay = new Map();
  for (const s of sleepLogs) sleepByDay.set(s.date, s.hours);
  const behaviorByDay = new Map();
  for (const b of behaviorLogs) behaviorByDay.set(b.date, b);

  // ---- Stats row ------------------------------------------------------------
  const todayKey = localDayKey(new Date());
  const todaySessions = sessionsByDay.get(todayKey) || [];
  const todayMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.durationSec, 0) / 60);
  const monthStart = dayWindow(29).start;
  const modulesThisMonth = sessions.filter(
    (s) => s.completedAt >= monthStart && s.outcome === "completed"
  ).length;

  const last7 = [...Array(7)].map((_, i) => dayWindow(6 - i));
  const weekMoodScores = last7.flatMap(({ key }) => (moodsByDay.get(key) || []).map((m) => m.score));
  const avgMoodScore = weekMoodScores.length
    ? Math.round((weekMoodScores.reduce((a, b) => a + b, 0) / weekMoodScores.length) * 10) / 10
    : 0;

  // Deltas vs yesterday
  const yesterdaySessions = sessionsByDay.get(dayWindow(1).key) || [];
  const yesterdayMinutes = Math.round(yesterdaySessions.reduce((acc, s) => acc + s.durationSec, 0) / 60);

  // ---- Weekly mood chart (last 7 days) --------------------------------------
  const weeklyMoodData = last7.map(({ key, label }) => {
    const dayMoods = moodsByDay.get(key) || [];
    const score = dayMoods.length
      ? Math.round((dayMoods.reduce((a, m) => a + m.score, 0) / dayMoods.length) * 10) / 10
      : null;
    return { day: label, score, iconKey: score ? MOOD_ICON[Math.round(score)] : null };
  });

  // ---- Concentration (last 7 days): avg focus + longest attention span ------
  const concentrationData = last7.map(({ key, label }) => {
    const daySessions = sessionsByDay.get(key) || [];
    const focusScore = daySessions.length
      ? Math.round(daySessions.reduce((a, s) => a + (s.focusScore || 0), 0) / daySessions.length)
      : null;
    const attentionSpan = daySessions.length
      ? Math.round(Math.max(...daySessions.map((s) => s.durationSec)) / 60)
      : null;
    return { day: label, focusScore, attentionSpan };
  });

  // ---- Category time (minutes per skill, last 7 days) -----------------------
  const SKILL_COLORS = {
    Emotions: "#FFB020",
    Communication: "#3ECFB2",
    Cognitive: "#4A90D9",
    Attention: "#C4B5FD",
    Social: "#FFA94D",
  };
  const categoryMinutes = new Map();
  for (const { key } of last7) {
    for (const s of sessionsByDay.get(key) || []) {
      categoryMinutes.set(s.skill, (categoryMinutes.get(s.skill) || 0) + s.durationSec / 60);
    }
  }
  const categoryTimeData = [...categoryMinutes.entries()].map(([name, mins]) => ({
    name,
    value: Math.round(mins),
    color: SKILL_COLORS[name] || "#8FA3B1",
  }));

  // ---- Skill progress (avg accuracy per skill, last 30 days) ----------------
  const skillAcc = new Map();
  for (const s of sessions) {
    if (s.outcome !== "completed") continue;
    if (!skillAcc.has(s.skill)) skillAcc.set(s.skill, []);
    skillAcc.get(s.skill).push(s.accuracy);
  }
  const skillProgress = [...skillAcc.entries()].map(([label, arr]) => ({
    label,
    value: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    color: SKILL_COLORS[label] || "#8FA3B1",
  }));

  // ---- Session timeline (today's sessions, newest first) --------------------
  const MOOD_ID_TO_LABEL = { great: "Happy", good: "Happy", ok: "Neutral", notgreat: "Uneasy", sad: "Sad" };
  const sessionTimeline = [...todaySessions]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .map((s) => ({
      time: new Date(s.completedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      module: s.gameTitle,
      iconKey: modules.find((m) => m.code === s.moduleCode)?.iconKey || "star",
      duration: `${Math.round(s.durationSec / 60) || 1} min`,
      mood: MOOD_ID_TO_LABEL[s.moodBefore] || "—",
      moodIconKey: s.moodBefore ? MOOD_ICON[{ great: 5, good: 4, ok: 3, notgreat: 2, sad: 1 }[s.moodBefore]] : null,
      score: s.accuracy,
      emotion: s.emotionSummary?.dominant || null,
      emotionTimeline: s.emotionSummary?.timeline || [],
    }));

  // ---- Prompt dependency (4 weeks, accuracy binned) --------------------------
  const promptDependency = [...Array(4)].map((_, i) => {
    // week i back
    const weekSessions = sessions.filter((s) => {
      const daysBack = Math.floor((Date.now() - new Date(s.completedAt).getTime()) / 86400000);
      return daysBack >= i * 7 && daysBack < (i + 1) * 7;
    });
    if (weekSessions.length === 0) return { week: `Week ${i + 1}`, independent: 0, prompted: 0, skipped: 0 };
    const avgAcc = weekSessions.reduce((a, s) => a + s.accuracy, 0) / weekSessions.length;
    const abandoned = weekSessions.filter((s) => s.outcome === "abandoned").length;
    const independent = Math.round(avgAcc);
    const skipped = Math.round((abandoned / weekSessions.length) * 100);
    return {
      week: `Week ${4 - i}`,
      independent,
      prompted: Math.max(0, 100 - independent - skipped),
      skipped,
    };
  }).reverse();

  // ---- Completion rate (last 30 days) ---------------------------------------
  const completedCount = sessions.filter((s) => s.outcome === "completed").length;
  const abandonedCount = sessions.length - completedCount;
  const totalForCompletion = Math.max(1, sessions.length);
  const completionData = [
    { name: "Completed", value: Math.round((completedCount / totalForCompletion) * 100), color: "#3ECFB2" },
    { name: "Abandoned", value: Math.round((abandonedCount / totalForCompletion) * 100), color: "#FF7E6B" },
  ];

  // ---- Vocabulary growth (weekly words learned from word-match sessions) -----
  const vocabWeeks = [...Array(4)].map((_, i) => {
    const weekSessions = sessions.filter((s) => {
      const daysBack = Math.floor((Date.now() - new Date(s.completedAt).getTime()) / 86400000);
      return s.moduleCode === "word-match" && daysBack >= i * 7 && daysBack < (i + 1) * 7;
    });
    return { idx: i, wordsLearned: weekSessions.reduce((a, s) => a + (s.wordsLearned || 0), 0) };
  }).reverse();
  let cumulative = 0;
  const vocabularyData = vocabWeeks.map((w, i) => {
    cumulative += w.wordsLearned;
    return { week: `Week ${i + 1}`, wordsLearned: w.wordsLearned, cumulative };
  });

  // ---- Sleep vs mood (last 7 days) -------------------------------------------
  const sleepMoodData = last7.map(({ key, label }) => ({
    day: label,
    sleepHours: sleepByDay.get(key) ?? null,
    moodScore: weeklyMoodData.find((d) => d.day === label)?.score ?? null,
  }));

  // ---- Behavioral log (last 7 days) ------------------------------------------
  const behavioralData = last7.map(({ key, label }) => {
    const b = behaviorByDay.get(key);
    return { day: label, incidents: b ? b.incidents : 0, intensity: b ? b.intensity : 0 };
  });

  // ---- Upcoming modules (next uncompleted in catalog order) -------------------
  const doneToday = new Set(todaySessions.map((s) => s.moduleCode));
  const upcomingModules = modules
    .filter((m) => !doneToday.has(m.code))
    .slice(0, 3)
    .map((m, i) => ({
      id: `up-${m.code}`,
      iconKey: m.iconKey,
      title: m.title,
      duration: `${m.durationMin} min`,
      skill: m.skill,
      difficulty: m.order,
    }));

  // ---- 7-day activity strip (for the streak calendar) -------------------------
  const activeDaysStrip = last7.map(({ key, label }) => ({
    day: label,
    active: (sessionsByDay.get(key) || []).length > 0,
    count: (sessionsByDay.get(key) || []).length,
  }));

  return Response.json({
    parent: { name: parent.name, avatarInitials: parent.avatarInitials },
    child: {
      id: child._id,
      name: child.name,
      age: child.age,
      streak: child.streak,
      stars: child.stars,
      dailyGoal: child.dailyGoal,
    },
    stats: {
      todayMinutes,
      todayMinutesDelta: todayMinutes - yesterdayMinutes,
      weeklyStreak: child.streak,
      totalModules: modulesThisMonth,
      avgMoodScore,
      avgMoodDelta: 0.3, // TODO: compute vs previous week once there are two weeks of data
      todayCompletedCount: todaySessions.filter((s) => s.outcome === "completed").length,
      dailyGoal: child.dailyGoal,
    },
    activeDaysStrip,
    weeklyMoodData,
    concentrationData,
    categoryTimeData,
    behavioralData,
    vocabularyData,
    completionData,
    sleepMoodData,
    promptDependency,
    skillProgress,
    sessionTimeline,
    therapistNotes: notes.map((n) => ({
      id: String(n._id),
      date: new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      author: n.author,
      content: n.content,
    })),
    clinicalReports: reports.map((r) => ({
      id: String(r._id),
      title: r.title,
      date: new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      type: r.type,
      summary: r.summary,
      details: r.details,
    })),
    achievements: achievements.map((a) => ({
      id: String(a._id),
      iconKey: a.iconKey,
      label: a.label,
      unlocked: a.unlocked,
    })),
    upcomingModules,
    generatedAt: new Date().toISOString(),
  });
}
