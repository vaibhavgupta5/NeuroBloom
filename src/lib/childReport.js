import Module from "./models/Module";
import Session from "./models/Session";
import MoodEntry from "./models/MoodEntry";
import SleepLog from "./models/SleepLog";
import BehaviorLog from "./models/BehaviorLog";
import TherapistNote from "./models/TherapistNote";
import ClinicalReport from "./models/ClinicalReport";
import Achievement from "./models/Achievement";
import Goal from "./models/Goal";
import Routine from "./models/Routine";
import CoachingLog from "./models/CoachingLog";
import CommEvent from "./models/CommEvent";
import User from "./models/User";
import { localDayKey, startOfLocalDay } from "./dayUtils";
import { goalProgress, independentPct } from "./goals";
import { pickCoaching } from "./content/coaching";
import { CAMERA_MODULES, publicChild } from "./childPlan";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MOOD_ICON = { 5: "happy", 4: "happy", 3: "neutral", 2: "neutral", 1: "sad" };
const MOOD_ID_TO_LABEL = { great: "Great", good: "Good", ok: "Okay", notgreat: "Not great", sad: "Sad" };
const MOOD_ID_TO_SCORE = { great: 5, good: 4, ok: 3, notgreat: 2, sad: 1 };

export const SKILL_COLORS = {
  Emotions: "#E59400",
  Communication: "#17977F",
  Cognitive: "#2B6CB0",
  Attention: "#7C66D9",
  Social: "#D9603F",
};

function dayWindow(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return { start: startOfLocalDay(d), key: localDayKey(d), label: DAY_LABELS[d.getDay()], n };
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const k = keyFn(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

function avg(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function weeksBack(sessions, i) {
  return sessions.filter((s) => {
    const daysBack = Math.floor((Date.now() - new Date(s.completedAt).getTime()) / 86400000);
    return daysBack >= i * 7 && daysBack < (i + 1) * 7;
  });
}

/** Everything the parent dashboard and therapist child view render, from real records only. */
export async function buildChildReport(child, viewer) {
  const since = dayWindow(27).start;
  const sinceKey = localDayKey(since);
  const isParent = viewer.role === "parent";

  const [sessions, moods, sleepLogs, behaviorLogs, notes, reports, achievements, modules, goals, routines, coachingLogs, commCount, therapists, parent] =
    await Promise.all([
      Session.find({ childId: child._id, completedAt: { $gte: since } }).sort({ completedAt: 1 }).lean(),
      MoodEntry.find({ childId: child._id, createdAt: { $gte: since } }).sort({ createdAt: 1 }).lean(),
      SleepLog.find({ childId: child._id, date: { $gte: sinceKey } }).lean(),
      BehaviorLog.find({ childId: child._id, date: { $gte: sinceKey } }).sort({ createdAt: -1 }).lean(),
      TherapistNote.find({ childId: child._id }).sort({ date: -1 }).limit(20).lean(),
      ClinicalReport.find(isParent ? { childId: child._id, status: "approved" } : { childId: child._id }).sort({ date: -1 }).lean(),
      Achievement.find({ childId: child._id }).lean(),
      Module.find().sort({ order: 1 }).lean(),
      Goal.find({ childId: child._id }).sort({ status: 1, createdAt: -1 }).lean(),
      Routine.find({ childId: child._id, active: true }).sort({ createdAt: 1 }).lean(),
      CoachingLog.find({ childId: child._id, date: { $gte: localDayKey(dayWindow(6).start) } }).lean(),
      CommEvent.countDocuments({ childId: child._id, createdAt: { $gte: dayWindow(6).start } }),
      User.find({ _id: { $in: child.therapistIds || [] } }).select("name organization").lean(),
      User.findById(child.parentId).select("name avatarInitials").lean(),
    ]);

  const sessionsByDay = groupBy(sessions, (s) => localDayKey(s.completedAt));
  const moodsByDay = groupBy(moods, (m) => localDayKey(m.createdAt));
  const sleepByDay = new Map(sleepLogs.map((s) => [s.date, s.hours]));
  const behaviorByDay = groupBy(behaviorLogs, (b) => b.date);

  const todayKey = localDayKey(new Date());
  const todaySessions = sessionsByDay.get(todayKey) || [];
  const completed = sessions.filter((s) => s.outcome === "completed");
  const minutesOf = (list) => Math.round(list.reduce((acc, s) => acc + s.durationSec, 0) / 60);

  const last7 = [...Array(7)].map((_, i) => dayWindow(6 - i));
  const prev7 = [...Array(7)].map((_, i) => dayWindow(13 - i));
  const moodScoresIn = (days) => days.flatMap(({ key }) => (moodsByDay.get(key) || []).map((m) => m.score));
  const weekMood = avg(moodScoresIn(last7));
  const prevWeekMood = avg(moodScoresIn(prev7));

  const stats = {
    todayMinutes: minutesOf(todaySessions),
    todayMinutesDelta: minutesOf(todaySessions) - minutesOf(sessionsByDay.get(dayWindow(1).key) || []),
    weeklyStreak: child.streak,
    totalModules: completed.length,
    avgMoodScore: weekMood == null ? 0 : Math.round(weekMood * 10) / 10,
    avgMoodDelta: weekMood != null && prevWeekMood != null ? Math.round((weekMood - prevWeekMood) * 10) / 10 : null,
    todayCompletedCount: todaySessions.filter((s) => s.outcome === "completed").length,
    dailyGoal: child.dailyGoal,
  };

  const weeklyMoodData = last7.map(({ key, label }) => {
    const score = avg((moodsByDay.get(key) || []).map((m) => m.score));
    const rounded = score == null ? null : Math.round(score * 10) / 10;
    return { day: label, score: rounded, iconKey: rounded ? MOOD_ICON[Math.round(rounded)] : null };
  });

  const concentrationData = last7.map(({ key, label }) => {
    const day = (sessionsByDay.get(key) || []).filter((s) => s.focusScore > 0);
    return {
      day: label,
      focusScore: day.length ? Math.round(avg(day.map((s) => s.focusScore))) : null,
      attentionSpan: day.length ? Math.round(Math.max(...day.map((s) => s.durationSec)) / 60) : null,
    };
  });

  const categoryMinutes = new Map();
  for (const { key } of last7) {
    for (const s of sessionsByDay.get(key) || []) {
      categoryMinutes.set(s.skill, (categoryMinutes.get(s.skill) || 0) + s.durationSec / 60);
    }
  }
  const categoryTimeData = [...categoryMinutes.entries()].map(([name, mins]) => ({
    name,
    value: Math.max(1, Math.round(mins)),
    color: SKILL_COLORS[name] || "#5F7384",
  }));

  const levels = child.levels instanceof Map ? Object.fromEntries(child.levels) : child.levels || {};
  const skillProgress = [...groupBy(completed, (s) => s.skill).entries()].map(([label, list]) => ({
    label,
    value: Math.round(avg(list.map((s) => s.accuracy))),
    level: levels[label] || 1,
    color: SKILL_COLORS[label] || "#5F7384",
  }));

  const sessionTimeline = [...todaySessions]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .map((s) => ({
      id: String(s._id),
      time: new Date(s.completedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      module: s.gameTitle,
      iconKey: modules.find((m) => m.code === s.moduleCode)?.iconKey || "star",
      duration: `${Math.max(1, Math.round(s.durationSec / 60))} min`,
      outcome: s.outcome,
      mood: MOOD_ID_TO_LABEL[s.moodBefore] || null,
      moodIconKey: s.moodBefore ? MOOD_ICON[MOOD_ID_TO_SCORE[s.moodBefore]] : null,
      score: s.accuracy,
      emotion: s.emotionSummary?.dominant || null,
      emotionTimeline: s.emotionSummary?.timeline || [],
    }));

  // Independence: share of trials answered correctly with no prompt, per week (oldest first)
  const promptDependency = [3, 2, 1, 0].map((i) => {
    const week = weeksBack(sessions, i);
    const trials = week.flatMap((s) => s.trials || []);
    const label = i === 0 ? "This week" : i === 1 ? "Last week" : `${i} wks ago`;
    if (!trials.length) {
      const abandoned = week.filter((s) => s.outcome === "abandoned").length;
      return { week: label, independent: 0, prompted: 0, skipped: week.length ? Math.round((abandoned / week.length) * 100) : 0, trials: 0 };
    }
    const independent = trials.filter((t) => t.correct && !t.promptLevel).length;
    const prompted = trials.filter((t) => t.correct && t.promptLevel > 0).length;
    const pct = (n) => Math.round((n / trials.length) * 100);
    return { week: label, independent: pct(independent), prompted: pct(prompted), skipped: Math.max(0, 100 - pct(independent) - pct(prompted)), trials: trials.length };
  });

  const completionTotal = Math.max(1, sessions.length);
  const completionData = [
    { name: "Finished", value: Math.round((completed.length / completionTotal) * 100), color: "#17977F" },
    { name: "Stopped early", value: Math.round(((sessions.length - completed.length) / completionTotal) * 100), color: "#D9603F" },
  ];

  let cumulative = 0;
  const vocabularyData = [3, 2, 1, 0].map((i) => {
    const words = weeksBack(sessions, i).filter((s) => s.moduleCode === "word-match").reduce((a, s) => a + (s.wordsLearned || 0), 0);
    cumulative += words;
    return { week: i === 0 ? "This week" : `${i} wk${i > 1 ? "s" : ""} ago`, wordsLearned: words, cumulative };
  });

  const sleepMoodData = last7.map(({ key, label }, idx) => ({
    day: label,
    sleepHours: sleepByDay.get(key) ?? null,
    moodScore: weeklyMoodData[idx].score,
  }));

  const behavioralData = last7.map(({ key, label }) => {
    const entries = behaviorByDay.get(key) || [];
    return {
      day: label,
      incidents: entries.reduce((a, b) => a + (b.incidents || 1), 0),
      intensity: entries.length ? Math.max(...entries.map((b) => b.intensity)) : 0,
    };
  });
  const behaviorEntries = behaviorLogs.slice(0, 10).map((b) => ({
    id: String(b._id),
    date: b.date,
    intensity: b.intensity,
    antecedent: b.antecedent,
    behavior: b.behavior,
    consequence: b.consequence,
  }));

  const activeDaysStrip = last7.map(({ key, label }) => {
    const count = (sessionsByDay.get(key) || []).filter((s) => s.outcome === "completed").length;
    return { day: label, active: count > 0, count };
  });

  const doneToday = new Set(todaySessions.filter((s) => s.outcome === "completed").map((s) => s.moduleCode));
  const todayPlan = modules.filter((m) => child.consent?.camera || !CAMERA_MODULES.includes(m.code)).map((m) => ({
    id: m.code,
    iconKey: m.iconKey,
    title: m.title,
    duration: `${m.durationMin} min`,
    skill: m.skill,
    level: levels[m.skill] || 1,
    done: doneToday.has(m.code),
  }));

  const goalsOut = await Promise.all(
    goals.map(async (g) => ({
      id: String(g._id),
      title: g.title,
      skill: g.skill,
      moduleCode: g.moduleCode,
      status: g.status,
      criterion: g.criterion,
      masteredAt: g.masteredAt,
      progress: await goalProgress(g),
    }))
  );

  const activeGoalSkills = [...new Set(goals.filter((g) => g.status === "active").map((g) => g.skill))];
  const coachingActivity = pickCoaching(todayKey, activeGoalSkills);
  const coachingToday = coachingLogs.find((l) => l.date === todayKey && l.activityId === coachingActivity.id);

  const weekAgo = dayWindow(6).start;
  const notifications = [
    ...goals.filter((g) => g.masteredAt && g.masteredAt >= weekAgo).map((g) => ({
      id: `goal-${g._id}`, kind: "goal", at: g.masteredAt, text: `Goal reached: ${g.title}`,
    })),
    ...notes.filter((n) => n.date >= localDayKey(weekAgo)).map((n) => ({
      id: `note-${n._id}`, kind: "note", at: new Date(n.date), text: `New note from ${n.author}`,
    })),
    ...reports.filter((r) => r.status === "approved" && r.updatedAt && r.updatedAt >= weekAgo).map((r) => ({
      id: `report-${r._id}`, kind: "report", at: r.updatedAt, text: `Report ready: ${r.title}`,
    })),
    ...todaySessions.filter((s) => s.outcome === "completed").map((s) => ({
      id: `session-${s._id}`, kind: "session", at: s.completedAt, text: `${child.name} finished ${s.gameTitle}`,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);

  return {
    parent: parent ? { name: parent.name, avatarInitials: parent.avatarInitials } : null,
    child: publicChild(child),
    stats,
    activeDaysStrip,
    weeklyMoodData,
    concentrationData,
    categoryTimeData,
    behavioralData,
    behaviorEntries,
    vocabularyData,
    completionData,
    sleepMoodData,
    promptDependency,
    skillProgress,
    sessionTimeline,
    todayPlan,
    goals: goalsOut,
    routines: routines.map((r) => ({
      id: String(r._id),
      name: r.name,
      steps: r.steps.map((s) => ({ id: String(s._id), label: s.label, iconKey: s.iconKey, durationMin: s.durationMin })),
    })),
    coaching: {
      activity: coachingActivity,
      doneToday: Boolean(coachingToday),
      note: coachingToday?.note || "",
      doneThisWeek: coachingLogs.length,
    },
    commSentences7d: commCount,
    therapists: therapists.map((t) => ({ id: String(t._id), name: t.name, organization: t.organization })),
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
      status: r.status,
      generatedBy: r.generatedBy,
      summary: r.summary,
      details: r.details,
    })),
    achievements: achievements.map((a) => ({ id: String(a._id), iconKey: a.iconKey, label: a.label, unlocked: a.unlocked })),
    notifications,
    independenceThisWeek: independentPctOfWeek(sessions),
    generatedAt: new Date().toISOString(),
  };
}

function independentPctOfWeek(sessions) {
  const week = weeksBack(sessions, 0).filter((s) => s.outcome === "completed");
  return week.length ? Math.round(avg(week.map(independentPct))) : null;
}
