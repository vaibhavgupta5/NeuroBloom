import LiveSession from "@/lib/models/LiveSession";
import { authErrorResponse, requireChild } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FIELDS = [
  "status", "activeGame", "gameTitle", "score", "targetScore", "elapsedSeconds",
  "focusScore", "focusStatus", "avgResponseMs", "accuracy", "promptLevel", "level",
  "liveCoordinates", "speedMultiplier", "emotion", "emotionConfidence", "snapshotFrame",
];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    const { child } = await requireChild();

    const update = { childId: child._id, updatedAt: new Date() };
    for (const f of FIELDS) {
      if (body[f] !== undefined) update[f] = body[f];
    }
    // Frames are only kept when the parent opted into live snapshots
    if (!child.consent?.liveFrames || !child.consent?.camera) update.snapshotFrame = null;
    if (!child.consent?.camera) {
      update.emotion = null;
      update.emotionConfidence = 0;
    }
    if (typeof update.snapshotFrame === "string" && update.snapshotFrame.length > 60000) delete update.snapshotFrame;

    const doc = await LiveSession.findOneAndUpdate({ childId: child._id }, update, { upsert: true, new: true }).lean();
    return Response.json({ ok: true, updatedAt: doc.updatedAt });
  } catch (err) {
    return authErrorResponse(err);
  }
}
