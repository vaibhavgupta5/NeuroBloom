import MoodEntry from "@/lib/models/MoodEntry";
import Achievement from "@/lib/models/Achievement";
import { authErrorResponse, requireChild } from "@/lib/auth";
import { buildTodayModules, publicChild } from "@/lib/childPlan";
import { localDayKey, startOfLocalDay } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

const MOOD_SCORE_TO_ID = { 5: "great", 4: "good", 3: "ok", 2: "notgreat", 1: "sad" };

export async function GET() {
  try {
    const { child, session } = await requireChild();
    const [todayModules, todayMood, achievements] = await Promise.all([
      buildTodayModules(child),
      MoodEntry.findOne({ childId: child._id, source: "checkin", createdAt: { $gte: startOfLocalDay() } }).sort({ createdAt: -1 }).lean(),
      Achievement.find({ childId: child._id }).select("iconKey label unlocked").lean(),
    ]);

    return Response.json({
      child: publicChild(child),
      childMode: Boolean(session.cm),
      todayModules,
      todayCompletedCount: todayModules.filter((m) => m.completed).length,
      currentMood: todayMood ? todayMood.moodId || MOOD_SCORE_TO_ID[todayMood.score] : null,
      todayKey: localDayKey(new Date()),
      achievements: achievements.map((a) => ({ id: String(a._id), iconKey: a.iconKey, label: a.label, unlocked: a.unlocked })),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
