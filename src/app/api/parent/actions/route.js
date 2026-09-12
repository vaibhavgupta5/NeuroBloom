import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import ParentAction from "@/lib/models/ParentAction";
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

  const { actionType, payload = {} } = body;
  if (!["SEND_STICKER", "SET_SPEED", "TOGGLE_PAUSE"].includes(actionType)) {
    return Response.json({ error: `Unknown actionType: ${actionType}` }, { status: 400 });
  }

  const child = await Child.findOne();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  await ParentAction.create({
    childId: child._id,
    actionType,
    payload,
    createdAt: new Date(),
  });

  // Speed/pause are authoritative on the LiveSession doc too, so the parent's
  // own HUD and any other observer stay in sync.
  if (actionType === "SET_SPEED" && typeof payload.speed === "number") {
    await LiveSession.findOneAndUpdate(
      { childId: child._id },
      { speedMultiplier: payload.speed, updatedAt: new Date() },
      { upsert: true }
    );
  }
  if (actionType === "TOGGLE_PAUSE") {
    const current = await LiveSession.findOne({ childId: child._id });
    const nextPaused = current ? current.status !== "paused" : true;
    await LiveSession.findOneAndUpdate(
      { childId: child._id },
      { status: nextPaused ? "paused" : "playing", updatedAt: new Date() },
      { upsert: true }
    );
  }

  return Response.json({ ok: true });
}
