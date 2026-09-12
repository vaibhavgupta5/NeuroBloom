/**
 * NeuroBloom seed script — one parent (Priya), one child (Arjun, 6),
 * and ~4 weeks of internally-consistent history so every parent-dashboard
 * number is aggregated from these same records.
 *
 * Run: npm run seed   (or: node --env-file=.env.local scripts/seed.js)
 * Idempotent: clears all collections, then re-inserts.
 */
import mongoose from "mongoose";
import Parent from "../src/lib/models/Parent.js";
import Child from "../src/lib/models/Child.js";
import Module from "../src/lib/models/Module.js";
import Session from "../src/lib/models/Session.js";
import MoodEntry from "../src/lib/models/MoodEntry.js";
import SleepLog from "../src/lib/models/SleepLog.js";
import BehaviorLog from "../src/lib/models/BehaviorLog.js";
import TherapistNote from "../src/lib/models/TherapistNote.js";
import ClinicalReport from "../src/lib/models/ClinicalReport.js";
import Achievement from "../src/lib/models/Achievement.js";
import LiveSession from "../src/lib/models/LiveSession.js";
import ParentAction from "../src/lib/models/ParentAction.js";
import { localDayKey } from "../src/lib/dayUtils.js";

// Deterministic-ish PRNG so reruns look similar but not identical to the eye
let randSeed = 42;
function rand() {
  randSeed = (randSeed * 1103515245 + 12345) % 2147483648;
  return randSeed / 2147483648;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const MODULES = [
  { code: "emotion-match", title: "Feelings Game", shortTitle: "Feelings", iconKey: "emotion", skill: "Emotions",       durationMin: 8, order: 1, activeGameKey: "emotion-match" },
  { code: "word-match",    title: "Word Match",    shortTitle: "Words",    iconKey: "word",    skill: "Communication", durationMin: 6, order: 2, activeGameKey: "word-match" },
  { code: "puzzle",        title: "Puzzle Time",   shortTitle: "Puzzles",  iconKey: "puzzle",  skill: "Cognitive",     durationMin: 7, order: 3, activeGameKey: "puzzle" },
  { code: "ball-tracker",  title: "Focus Ball",    shortTitle: "Focus",    iconKey: "focus",   skill: "Attention",     durationMin: 5, order: 4, activeGameKey: "ball-tracker" },
];

const MOOD_TO_SCORE = { great: 5, good: 4, ok: 3, notgreat: 2, sad: 1 };
const SCORE_TO_MOOD = { 5: "great", 4: "good", 3: "ok", 2: "notgreat", 1: "sad" };

function dayKeyNdaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDayKey(d);
}

async function seed() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "neurobloom" });

  console.log("Clearing existing data…");
  await Promise.all(
    [Parent, Child, Module, Session, MoodEntry, SleepLog, BehaviorLog, TherapistNote, ClinicalReport, Achievement, LiveSession, ParentAction].map((M) => M.deleteMany({}))
  );

  const parent = await Parent.create({ name: "Priya", avatarInitials: "PM" });
  const child = await Child.create({ parentId: parent._id, name: "Arjun", age: 6, avatarIcon: "child", streak: 0, stars: 0, dailyGoal: 4 });
  await Module.insertMany(MODULES);

  // --- Day-level history: 28 days ending today -----------------------------
  // Skip one day 3 weeks ago so the current streak reads exactly 7.
  const skippedDay = 20;
  const days = [];
  for (let n = 27; n >= 0; n--) {
    if (n === skippedDay) continue;
    days.push(n);
  }

  const sessions = [];
  const sleepLogs = [];
  const behaviorLogs = [];
  const moodEntries = [];
  let totalStars = 0;

  for (const n of days) {
    const dayKey = dayKeyNdaysAgo(n);
    const progress = (27 - n) / 27; // 0 → 1 across the month (upward trend)

    const sleepHours = Math.round((7.2 + rand() * 2.6) * 10) / 10; // 7.2–9.8h
    sleepLogs.push({ childId: child._id, date: dayKey, hours: sleepHours });

    // Incidents trend down over the month
    const baseIncidents = Math.max(0, Math.round(2.5 - progress * 2 + (rand() - 0.5) * 1.6));
    const intensity = baseIncidents === 0 ? 0 : Math.max(1, Math.min(5, Math.round(baseIncidents + (rand() - 0.5))));
    behaviorLogs.push({ childId: child._id, date: dayKey, incidents: baseIncidents, intensity });

    // Mood correlates with sleep
    let moodScore = 3;
    if (sleepHours >= 9) moodScore = 5;
    else if (sleepHours >= 8.2) moodScore = rand() > 0.3 ? 4 : 5;
    else if (sleepHours >= 7.6) moodScore = rand() > 0.5 ? 4 : 3;
    else moodScore = rand() > 0.5 ? 3 : 2;
    if (baseIncidents >= 3) moodScore = Math.max(1, moodScore - 1);

    const moodAt = new Date(`${dayKey}T09:00:00`);
    moodEntries.push({ childId: child._id, moodId: SCORE_TO_MOOD[moodScore], score: moodScore, source: "checkin", createdAt: moodAt });

    // 2–4 sessions per day, mornings; accuracy trends upward with progress
    const sessionCount = n === 0 ? 3 : randInt(2, 4); // today: 3 done so far
    const dayModules = [...MODULES].sort(() => rand() - 0.5).slice(0, sessionCount);
    let cursor = new Date(`${dayKey}T09:15:00`);

    // Today: only the first 3 modules done, last one not started
    const todayCount = n === 0 ? 3 : dayModules.length;

    for (let i = 0; i < todayCount; i++) {
      const mod = dayModules[i];
      const durationSec = randInt(mod.durationMin * 60 - 120, mod.durationMin * 60 + 90);
      const accuracy = Math.min(100, Math.round(58 + progress * 30 + (rand() - 0.4) * 16));
      // Focus correlates with sleep + trend
      const focusScore = Math.min(100, Math.round(64 + progress * 24 + (sleepHours - 8) * 5 + (rand() - 0.4) * 12));
      const startedAt = new Date(cursor);
      const completedAt = new Date(cursor.getTime() + durationSec * 1000);
      cursor = new Date(completedAt.getTime() + randInt(3, 9) * 60 * 1000);

      const starsEarned = Math.max(1, Math.round(accuracy / 25)); // 1–4 stars per session
      totalStars += starsEarned;

      sessions.push({
        childId: child._id,
        moduleCode: mod.code,
        gameTitle: mod.title,
        skill: mod.skill,
        startedAt,
        completedAt,
        durationSec,
        score: Math.max(3, Math.round((accuracy / 100) * 5)),
        maxScore: 5,
        accuracy,
        focusScore,
        avgResponseMs: randInt(280, 420),
        outcome: "completed",
        moodBefore: SCORE_TO_MOOD[moodScore],
        wordsLearned: mod.code === "word-match" ? randInt(3, 6) : 0,
      });
    }
  }

  await Session.insertMany(sessions);
  await SleepLog.insertMany(sleepLogs);
  await BehaviorLog.insertMany(behaviorLogs);
  await MoodEntry.insertMany(moodEntries);

  // --- Streak: consecutive days ending today with ≥1 session ---------------
  const activeDays = new Set(sessions.map((s) => localDayKey(s.completedAt)));
  let streak = 0;
  const cursor = new Date();
  while (activeDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Stars: seeded sessions earned stars + a head start
  const stars = 34 + totalStars;
  await Child.findByIdAndUpdate(child._id, { streak, stars });

  // --- Therapist notes ------------------------------------------------------
  await TherapistNote.insertMany([
    { childId: child._id, date: dayKeyNdaysAgo(1), author: "Dr. Neha Sharma", content: "Arjun showed great improvement in turn-taking today. Recommend continuing Social Story modules. Increase puzzle difficulty next session." },
    { childId: child._id, date: dayKeyNdaysAgo(6), author: "Dr. Neha Sharma", content: "Communication board usage is up significantly. Try introducing 3-symbol sentences next week." },
    { childId: child._id, date: dayKeyNdaysAgo(12), author: "Dr. Neha Sharma", content: "Great emotional regulation during the transition between activities. The visual timer strategy is working well." },
    { childId: child._id, date: dayKeyNdaysAgo(19), author: "Dr. Neha Sharma", content: "Session started with some resistance but Arjun settled within 5 minutes. Keep morning sessions consistent." },
  ]);

  // --- Clinical reports -----------------------------------------------------
  await ClinicalReport.insertMany([
    {
      childId: child._id,
      title: "Weekly Progress Report",
      date: dayKeyNdaysAgo(2),
      type: "Progress",
      summary: "Arjun showed an increase in independent task completion this week. Notable improvements in the Emotion Recognition modules.",
      details: "This week, Arjun completed 14 modules. The most significant progress was observed during the Social Story exercises. Behavioral incidents decreased compared to last week. Sleep quality has been consistently good, which correlates with higher focus scores during morning sessions.",
    },
    {
      childId: child._id,
      title: "Category Training: Communication",
      date: dayKeyNdaysAgo(15),
      type: "Category",
      summary: "Focus on AAC board usage and vocabulary expansion.",
      details: "Over the past month, Arjun has successfully integrated new words into daily use through the Word Match modules. Prompt dependency for communication has dropped steadily. Next phase will focus on forming 3-symbol sentences.",
    },
    {
      childId: child._id,
      title: "Monthly Behavioral Summary",
      date: dayKeyNdaysAgo(27),
      type: "Behavioral",
      summary: "Overall decrease in trigger intensity; transition periods remain challenging.",
      details: "A review of the past 30 days indicates that transitions between highly preferred and non-preferred activities are the primary triggers. Recommend introducing visual timers 5 minutes prior to transitions.",
    },
  ]);

  // --- Achievements ----------------------------------------------------------
  await Achievement.insertMany([
    { childId: child._id, iconKey: "flame",   label: "7-Day Streak",    rule: "streak-7",  unlocked: streak >= 7,  unlockedAt: streak >= 7 ? new Date() : null },
    { childId: child._id, iconKey: "puzzle",  label: "Puzzle Master",   rule: null,        unlocked: true,  unlockedAt: dayKeyNdaysAgo(9) },
    { childId: child._id, iconKey: "happy",   label: "Happy Explorer",  rule: null,        unlocked: true,  unlockedAt: dayKeyNdaysAgo(5) },
    { childId: child._id, iconKey: "speech",  label: "First Words",     rule: null,        unlocked: true,  unlockedAt: dayKeyNdaysAgo(21) },
    { childId: child._id, iconKey: "star",    label: "Top Scorer",      rule: null,        unlocked: true,  unlockedAt: dayKeyNdaysAgo(3) },
    { childId: child._id, iconKey: "trophy",  label: "Week Champion",   rule: null,        unlocked: true,  unlockedAt: dayKeyNdaysAgo(1) },
    { childId: child._id, iconKey: "award",   label: "30-Day Streak",   rule: "streak-30", unlocked: streak >= 30, unlockedAt: null },
    { childId: child._id, iconKey: "emotion", label: "Social Star",     rule: null,        unlocked: false, unlockedAt: null },
  ]);

  // --- Live session: idle ----------------------------------------------------
  await LiveSession.create({
    childId: child._id,
    status: "idle",
    updatedAt: new Date(),
  });

  console.log("Seed complete:");
  console.log(`  Parent: ${parent.name} (${parent._id})`);
  console.log(`  Child: Arjun (${child._id}) — streak ${streak}, stars ${stars}`);
  console.log(`  ${sessions.length} sessions, ${moodEntries.length} moods, ${sleepLogs.length} sleep logs, ${behaviorLogs.length} behavior logs`);
  console.log("  4 therapist notes, 3 clinical reports, 8 achievements");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
