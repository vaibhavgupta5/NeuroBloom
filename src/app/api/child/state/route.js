import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import Module from "@/lib/models/Module";
import Session from "@/lib/models/Session";
import MoodEntry from "@/lib/models/MoodEntry";
import { localDayKey, startOfLocalDay } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

export async function GET() {
  await getConnection();

  const child = await Child.findOne().lean();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  const modules = await Module.find().sort({ order: 1 }).lean();
  const dayStart = startOfLocalDay();
  const todayKey = localDayKey(new Date());

  const [todaySessions, todayMood] = await Promise.all([
    Session.find({ childId: child._id, completedAt: { $gte: dayStart } })
      .sort({ completedAt: 1 })
      .lean(),
    MoodEntry.findOne({ childId: child._id, createdAt: { $gte: dayStart } }).sort({ createdAt: -1 }).lean(),
  ]);

  const doneCodes = new Set(todaySessions.map((s) => s.moduleCode));

  // Modules unlock sequentially: everything up to and including the first
  // incomplete one is playable; the rest stay locked (Duolingo path style).
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

  const moodScoreToId = { 5: "great", 4: "good", 3: "ok", 2: "notgreat", 1: "sad" };

  return Response.json({
    child: {
      id: child._id,
      name: child.name,
      age: child.age,
      avatarIcon: child.avatarIcon,
      streak: child.streak,
      stars: child.stars,
      dailyGoal: child.dailyGoal,
    },
    todayModules,
    todayCompletedCount: todaySessions.filter((s) => s.outcome === "completed").length,
    currentMood: todayMood ? todayMood.moodId : null,
    todayKey,
  });
}
