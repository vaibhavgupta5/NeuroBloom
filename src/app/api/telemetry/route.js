import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import LiveSession from "@/lib/models/LiveSession";

export const dynamic = "force-dynamic";

export async function POST(request) {
  await getConnection();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const child = await Child.findOne();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  const update = { childId: child._id, updatedAt: new Date() };

  // Only copy known telemetry fields
  const fields = [
    "status", "activeGame", "gameTitle", "score", "targetScore", "elapsedSeconds",
    "focusScore", "focusStatus", "trackingSmoothness", "avgResponseMs",
    "frustrationLevel", "liveCoordinates", "speedMultiplier",
    "emotion", "emotionConfidence", "snapshotFrame",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) update[f] = body[f];
  }

  const doc = await LiveSession.findOneAndUpdate({ childId: child._id }, update, {
    upsert: true,
    new: true,
  }).lean();

  return Response.json({ ok: true, updatedAt: doc.updatedAt });
}
