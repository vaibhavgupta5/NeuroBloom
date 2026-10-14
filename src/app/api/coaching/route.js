import CoachingLog from "@/lib/models/CoachingLog";
import { COACHING } from "@/lib/content/coaching";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { localDayKey } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { child } = await requireCaregiver(body.childId, ["parent"]);
    if (!COACHING.some((a) => a.id === body.activityId)) {
      return Response.json({ error: "Unknown activity" }, { status: 400 });
    }
    await CoachingLog.findOneAndUpdate(
      { childId: child._id, date: localDayKey(new Date()), activityId: body.activityId },
      { note: String(body.note || "").trim().slice(0, 500) },
      { upsert: true }
    );
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
