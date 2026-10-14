import MoodEntry from "@/lib/models/MoodEntry";
import { authErrorResponse, requireChild } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SCORES = { great: 5, good: 4, ok: 3, notgreat: 2, sad: 1 };

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { moodId, source = "checkin" } = body;
    if (!SCORES[moodId]) {
      return Response.json({ error: "moodId must be one of: great, good, ok, notgreat, sad" }, { status: 400 });
    }
    const { child } = await requireChild();
    await MoodEntry.create({
      childId: child._id,
      moodId,
      score: SCORES[moodId],
      source: ["checkin", "session", "calm"].includes(source) ? source : "checkin",
      createdAt: new Date(),
    });
    return Response.json({ ok: true, moodId });
  } catch (err) {
    return authErrorResponse(err);
  }
}
