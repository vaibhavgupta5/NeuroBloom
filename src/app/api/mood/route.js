import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import MoodEntry from "@/lib/models/MoodEntry";

export const dynamic = "force-dynamic";

const SCORES = { great: 5, good: 4, ok: 3, notgreat: 2, sad: 1 };

export async function POST(request) {
  await getConnection();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { moodId } = body;
  if (!moodId || !SCORES[moodId]) {
    return Response.json({ error: "moodId must be one of: great, good, ok, notgreat, sad" }, { status: 400 });
  }

  const child = await Child.findOne();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  await MoodEntry.create({
    childId: child._id,
    moodId,
    score: SCORES[moodId],
    source: "checkin",
    createdAt: new Date(),
  });

  return Response.json({ ok: true, moodId });
}
