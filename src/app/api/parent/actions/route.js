import ParentAction from "@/lib/models/ParentAction";
import LiveSession from "@/lib/models/LiveSession";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ACTIONS = ["SEND_STICKER", "SET_SPEED", "TOGGLE_PAUSE", "OFFER_BREAK"];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const actionType = body?.actionType;
    const payload = body?.payload && typeof body.payload === "object" ? body.payload : {};
    if (!ACTIONS.includes(actionType)) {
      return Response.json({ error: `Unknown actionType: ${actionType}` }, { status: 400 });
    }

    const { child } = await requireCaregiver(body.childId);

    if (actionType === "SET_SPEED") {
      const speed = Number(payload.speed);
      if (!Number.isFinite(speed) || speed < 0.5 || speed > 2) {
        return Response.json({ error: "speed must be between 0.5 and 2" }, { status: 400 });
      }
      payload.speed = speed;
      await LiveSession.findOneAndUpdate({ childId: child._id }, { speedMultiplier: speed, updatedAt: new Date() }, { upsert: true });
    }

    if (actionType === "TOGGLE_PAUSE") {
      const current = await LiveSession.findOne({ childId: child._id }).lean();
      const paused = typeof payload.isPaused === "boolean" ? payload.isPaused : current?.status !== "paused";
      payload.paused = paused;
      await LiveSession.findOneAndUpdate(
        { childId: child._id },
        { status: paused ? "paused" : "playing", updatedAt: new Date() },
        { upsert: true }
      );
    }

    await ParentAction.create({ childId: child._id, actionType, payload, createdAt: new Date() });
    return Response.json({ ok: true, payload });
  } catch (err) {
    return authErrorResponse(err);
  }
}
