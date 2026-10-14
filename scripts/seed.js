/**
 * NeuroBloom demo seed: two families and one therapist with ~4 weeks of
 * internally consistent SAMPLE history, so every dashboard number is
 * aggregated from these records. All of it is demo data.
 *
 *   Parent    priya@demo.neurobloom.app / bloom-demo   (child-mode PIN 1234)
 *   Parent    rahul@demo.neurobloom.app / bloom-demo
 *   Therapist neha@demo.neurobloom.app  / bloom-demo   (invite code NEHA2026)
 *
 * Run: npm run seed. Idempotent: clears all collections, then re-inserts.
 */
import mongoose from "mongoose";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import User from "../src/lib/models/User.js";
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
import Goal from "../src/lib/models/Goal.js";
import Routine from "../src/lib/models/Routine.js";
import CoachingLog from "../src/lib/models/CoachingLog.js";
import CommEvent from "../src/lib/models/CommEvent.js";
import { localDayKey } from "../src/lib/dayUtils.js";
import { DEFAULT_ACHIEVEMENTS } from "../src/lib/content/achievements.js";
import { COACHING } from "../src/lib/content/coaching.js";

const scrypt = promisify(scryptCb);
async function hashSecret(plain) {
  const salt = randomBytes(16);
  const key = await scrypt(plain, salt, 32);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

let randSeed = 42;
function rand() {
  randSeed = (randSeed * 1103515245 + 12345) % 2147483648;
  return randSeed / 2147483648;
}
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const MODULES = [
  { code: "emotion-match", title: "Feelings Game", shortTitle: "Feelings", iconKey: "emotion", skill: "Emotions", durationMin: 6, order: 1, activeGameKey: "emotion-match" },
  { code: "word-match", title: "Word Match", shortTitle: "Words", iconKey: "word", skill: "Communication", durationMin: 6, order: 2, activeGameKey: "word-match" },
  { code: "puzzle", title: "Shape Puzzles", shortTitle: "Puzzles", iconKey: "puzzle", skill: "Cognitive", durationMin: 6, order: 3, activeGameKey: "puzzle" },
  { code: "mirror-me", title: "Mirror Me", shortTitle: "Mirror", iconKey: "happy", skill: "Social", durationMin: 4, order: 4, activeGameKey: "mirror-me" },
  { code: "ball-tracker", title: "Focus Ball", shortTitle: "Focus", iconKey: "focus", skill: "Attention", durationMin: 3, order: 5, activeGameKey: "ball-tracker" },
];
const QUIZ = new Set(["emotion-match", "word-match", "puzzle"]);
const SCORE_TO_MOOD = { 5: "great", 4: "good", 3: "ok", 2: "notgreat", 1: "sad" };

const ANTECEDENTS = ["Screen time ended", "Loud noise at the market", "Asked to change clothes", "Sibling took a toy", "Transition from park to home", "New food at dinner"];
const BEHAVIORS = ["Cried and dropped to the floor", "Covered ears and hid under table", "Threw the toy", "Shouted 'no' repeatedly", "Ran out of the room"];
const CONSEQUENCES = ["Offered Calm Corner; settled in 5 min", "Gave a 2-minute warning next time", "Moved to a quiet room", "Used First-Then board; transitioned", "Hug and deep breaths together"];

const dayKeyNdaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDayKey(d);
};

function makeTrials(code, progress, count) {
  return Array.from({ length: count }, (_, i) => {
    const r = rand();
    // Prompt need fades as the month progresses
    const promptLevel = r < 0.35 + progress * 0.45 ? 0 : r < 0.75 + progress * 0.15 ? 1 : randInt(2, 4);
    return { itemId: `${code}-${i}`, correct: promptLevel < 4 || rand() > 0.5, latencyMs: randInt(1800, 6500) - Math.round(progress * 900), promptLevel };
  });
}

async function seedHistory(child, { days = 28, skip = [], sessionsPerDay = [2, 4], todayCount = 3, trend = 1 }) {
  const sessions = [];
  const sleepLogs = [];
  const behaviorLogs = [];
  const moodEntries = [];
  const commEvents = [];
  let stars = 0;

  for (let n = days - 1; n >= 0; n--) {
    if (skip.includes(n)) continue;
    const dayKey = dayKeyNdaysAgo(n);
    const progress = ((days - 1 - n) / (days - 1)) * trend;

    const sleepHours = Math.round((7 + rand() * 2.6) * 2) / 2;
    if (n > 0) sleepLogs.push({ childId: child._id, date: dayKey, hours: sleepHours });

    const incidents = Math.max(0, Math.round(2.2 - progress * 1.8 + (rand() - 0.5) * 1.4));
    for (let i = 0; i < incidents; i++) {
      behaviorLogs.push({
        childId: child._id,
        date: dayKey,
        incidents: 1,
        intensity: Math.max(1, Math.min(5, Math.round(3.2 - progress * 1.5 + (rand() - 0.5) * 2))),
        antecedent: pick(ANTECEDENTS),
        behavior: pick(BEHAVIORS),
        consequence: pick(CONSEQUENCES),
        createdAt: new Date(`${dayKey}T${String(randInt(15, 20)).padStart(2, "0")}:10:00`),
      });
    }

    let moodScore = sleepHours >= 9 ? 5 : sleepHours >= 8 ? (rand() > 0.3 ? 4 : 5) : sleepHours >= 7.5 ? (rand() > 0.5 ? 4 : 3) : rand() > 0.5 ? 3 : 2;
    if (incidents >= 3) moodScore = Math.max(1, moodScore - 1);
    moodEntries.push({ childId: child._id, moodId: SCORE_TO_MOOD[moodScore], score: moodScore, source: "checkin", createdAt: new Date(`${dayKey}T09:00:00`) });
    if (incidents >= 2 && rand() > 0.4) {
      moodEntries.push({ childId: child._id, moodId: "ok", score: 3, source: "calm", createdAt: new Date(`${dayKey}T18:30:00`) });
    }

    if (rand() < 0.3 + progress * 0.5) {
      commEvents.push({ childId: child._id, words: pick([["I", "want", "more"], ["help"], ["I", "feel", "happy"], ["stop"], ["want", "water"]]), createdAt: new Date(`${dayKey}T12:00:00`) });
    }

    const count = n === 0 ? todayCount : randInt(...sessionsPerDay);
    const dayModules = [...MODULES].sort((a, b) => a.order - b.order).slice(0, MODULES.length).sort(() => rand() - 0.5).slice(0, count);
    let cursor = new Date(`${dayKey}T09:15:00`);
    for (const mod of dayModules) {
      const durationSec = randInt(mod.durationMin * 60 - 90, mod.durationMin * 60 + 60);
      const startedAt = new Date(cursor);
      const completedAt = new Date(cursor.getTime() + durationSec * 1000);
      cursor = new Date(completedAt.getTime() + randInt(3, 9) * 60000);
      const stoppedEarly = rand() < 0.08 - progress * 0.05;

      let trials = [];
      let score;
      let maxScore;
      if (QUIZ.has(mod.code)) {
        trials = makeTrials(mod.code, progress, 6);
        maxScore = trials.length;
        score = trials.filter((t) => t.correct).length;
      } else {
        maxScore = 5;
        score = Math.min(5, Math.max(1, Math.round(2.5 + progress * 2.5 + (rand() - 0.5) * 2)));
      }
      const accuracy = Math.round((score / maxScore) * 100);
      const focusScore = Math.min(100, Math.round(62 + progress * 24 + (sleepHours - 8) * 5 + (rand() - 0.4) * 10));
      if (!stoppedEarly) stars += Math.max(1, Math.round(accuracy / 25));

      sessions.push({
        childId: child._id,
        moduleCode: mod.code,
        gameTitle: mod.title,
        skill: mod.skill,
        startedAt,
        completedAt,
        durationSec,
        score,
        maxScore,
        accuracy,
        focusScore: mod.code === "ball-tracker" ? focusScore : 0,
        avgResponseMs: trials.length ? Math.round(trials.reduce((a, t) => a + t.latencyMs, 0) / trials.length) : randInt(600, 1100),
        outcome: stoppedEarly ? "abandoned" : "completed",
        moodBefore: SCORE_TO_MOOD[moodScore],
        wordsLearned: mod.code === "word-match" ? trials.filter((t) => t.correct && !t.promptLevel).length : 0,
        level: progress > 0.66 ? 3 : progress > 0.33 ? 2 : 1,
        trials,
      });
    }
  }

  await Session.insertMany(sessions);
  await SleepLog.insertMany(sleepLogs);
  await BehaviorLog.insertMany(behaviorLogs);
  await MoodEntry.insertMany(moodEntries);
  await CommEvent.insertMany(commEvents);

  const activeDays = new Set(sessions.filter((s) => s.outcome === "completed").map((s) => localDayKey(s.completedAt)));
  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const levels = {};
  for (const m of MODULES) levels[m.skill] = trend >= 1 ? 2 : 1;
  await Child.findByIdAndUpdate(child._id, { streak, stars, levels });

  const unlocked = new Set(["first-session"]);
  if (streak >= 3) unlocked.add("streak-3");
  if (streak >= 7) unlocked.add("streak-7");
  if (commEvents.length) unlocked.add("first-sentence");
  if (moodEntries.some((m) => m.source === "calm")) unlocked.add("calm-corner");
  if (stars >= 50) unlocked.add("stars-50");
  await Achievement.insertMany(
    DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a, childId: child._id, unlocked: unlocked.has(a.rule), unlockedAt: unlocked.has(a.rule) ? new Date() : null }))
  );

  await LiveSession.create({ childId: child._id, status: "idle", updatedAt: new Date() });
  return { sessions: sessions.length, streak, stars };
}

async function seed() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "neurobloom" });

  console.log("Clearing existing data…");
  const db = mongoose.connection.db;
  for (const name of ["parents", "users", "children", "modules", "sessions", "moodentries", "sleeplogs", "behaviorlogs", "therapistnotes", "clinicalreports", "achievements", "livesessions", "parentactions", "goals", "routines", "coachinglogs", "commevents"]) {
    await db.dropCollection(name).catch(() => {});
  }
  await Promise.all([User, Child, Session, BehaviorLog, SleepLog, ParentAction, CoachingLog].map((M) => M.syncIndexes()));

  const passwordHash = await hashSecret("bloom-demo");
  const therapist = await User.create({ email: "neha@demo.neurobloom.app", name: "Dr. Neha Sharma", role: "therapist", passwordHash, avatarInitials: "NS", organization: "Bloom Child Development Clinic (demo)", inviteCode: "NEHA2026" });
  const priya = await User.create({ email: "priya@demo.neurobloom.app", name: "Priya Mehta", role: "parent", passwordHash, avatarInitials: "PM", pinHash: await hashSecret("1234") });
  const rahul = await User.create({ email: "rahul@demo.neurobloom.app", name: "Rahul Iyer", role: "parent", passwordHash, avatarInitials: "RI", pinHash: await hashSecret("1234") });

  await Module.insertMany(MODULES);

  const arjun = await Child.create({
    parentId: priya._id,
    therapistIds: [therapist._id],
    name: "Arjun",
    age: 6,
    sensoryProfile: { motion: "reduced", sfx: true, voice: true, voiceRate: 0.9, calmPalette: false, showTimer: false, sessionMinutes: 15 },
    consent: { camera: true, liveFrames: false, dataSharing: true, grantedAt: new Date() },
    aacTiles: [{ label: "Grandma", iconKey: "heart", category: "custom" }, { label: "Swing", iconKey: "sun", category: "custom" }],
  });
  const meera = await Child.create({
    parentId: rahul._id,
    therapistIds: [therapist._id],
    name: "Meera",
    age: 8,
    sensoryProfile: { motion: "none", sfx: false, voice: true, voiceRate: 0.8, calmPalette: true, showTimer: false, sessionMinutes: 10 },
    consent: { camera: false, liveFrames: false, dataSharing: true, grantedAt: new Date() },
  });

  const a = await seedHistory(arjun, { days: 28, skip: [20], todayCount: 2, trend: 1 });
  const m = await seedHistory(meera, { days: 21, skip: [3, 9, 15], sessionsPerDay: [1, 3], todayCount: 0, trend: 0.6 });

  await Goal.insertMany([
    { childId: arjun._id, createdBy: therapist._id, skill: "Emotions", moduleCode: "emotion-match", title: "Identify happy, sad and angry faces without help", criterion: { independentPct: 80, sessions: 3 } },
    { childId: arjun._id, createdBy: therapist._id, skill: "Communication", moduleCode: "word-match", title: "Match 6 everyday words to pictures independently", criterion: { independentPct: 80, sessions: 3 }, status: "mastered", masteredAt: new Date(Date.now() - 2 * 86400000) },
    { childId: meera._id, createdBy: therapist._id, skill: "Cognitive", moduleCode: "puzzle", title: "Match shapes to silhouettes with no more than a verbal prompt", criterion: { independentPct: 70, sessions: 3 } },
  ]);

  await Routine.insertMany([
    {
      childId: arjun._id,
      createdBy: priya._id,
      name: "Morning",
      steps: [
        { label: "Wake up", iconKey: "sun" },
        { label: "Toilet", iconKey: "droplet" },
        { label: "Brush teeth", iconKey: "smile", durationMin: 2 },
        { label: "Get dressed", iconKey: "shirt" },
        { label: "Breakfast", iconKey: "utensils", durationMin: 15 },
        { label: "Play time", iconKey: "gamepad", durationMin: 15 },
      ],
    },
    {
      childId: meera._id,
      createdBy: therapist._id,
      name: "After school",
      steps: [
        { label: "Snack", iconKey: "utensils" },
        { label: "Quiet time", iconKey: "moon", durationMin: 10 },
        { label: "NeuroBloom games", iconKey: "gamepad", durationMin: 10 },
        { label: "Park", iconKey: "sun" },
      ],
    },
  ]);

  await CoachingLog.insertMany(
    [1, 2, 4].map((n) => ({ childId: arjun._id, activityId: COACHING[n % COACHING.length].id, date: dayKeyNdaysAgo(n), note: n === 1 ? "He copied my surprised face twice!" : "" }))
  );

  await TherapistNote.insertMany([
    { childId: arjun._id, authorId: therapist._id, date: dayKeyNdaysAgo(1), author: therapist.name, content: "Arjun is answering most Feelings Game items without prompts now. Next step: practise 'scared' and 'surprised' at home with picture books." },
    { childId: arjun._id, authorId: therapist._id, date: dayKeyNdaysAgo(6), author: therapist.name, content: "He is using the Talk board to ask for 'more' at snack time. Keep the clear-container activity going this week." },
    { childId: arjun._id, authorId: therapist._id, date: dayKeyNdaysAgo(13), author: therapist.name, content: "Transitions from screen time are the most common trigger in the behaviour log. Try a 2-minute warning plus the First-Then board." },
    { childId: meera._id, authorId: therapist._id, date: dayKeyNdaysAgo(2), author: therapist.name, content: "Meera prefers the calm palette and no sound effects — keep those settings. Shape matching is improving with verbal prompts." },
  ]);

  await ClinicalReport.insertMany([
    {
      childId: arjun._id,
      authorId: therapist._id,
      title: "14-day progress report",
      date: dayKeyNdaysAgo(3),
      type: "Progress",
      status: "approved",
      generatedBy: "manual",
      periodStart: dayKeyNdaysAgo(17),
      periodEnd: dayKeyNdaysAgo(3),
      summary: "Arjun practised on most days and needed fewer prompts in the Feelings Game and Word Match. The Word Match goal was reached this period.",
      details:
        "Skill and goal progress\nIndependent answers rose across Emotions and Communication. The Word Match goal (6 everyday words, 80% independent across 3 sessions) was met.\n\nMood, sleep and regulation\nMood check-ins were mostly 'good'. Behaviour logs show screen-time transitions as the main trigger; Calm Corner was used after several of these.\n\nRecommendations\n• Keep sessions short and in the morning.\n• Use a 2-minute warning and the First-Then board before ending screen time.\n• Practise naming 'scared' and 'surprised' with picture books.",
    },
  ]);

  console.log("Seed complete (demo data):");
  console.log(`  Arjun — ${a.sessions} sessions, streak ${a.streak}, stars ${a.stars}`);
  console.log(`  Meera — ${m.sessions} sessions, streak ${m.streak}, stars ${m.stars}`);
  console.log("  Logins (password bloom-demo): priya@demo.neurobloom.app · rahul@demo.neurobloom.app · neha@demo.neurobloom.app");
  console.log("  Child-mode PIN: 1234 · Therapist invite code: NEHA2026");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
