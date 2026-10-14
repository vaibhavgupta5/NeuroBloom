import Goal from "@/lib/models/Goal";
import { AuthError, authErrorResponse, requireCaregiver } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const goal = await Goal.findById(id);
    if (!goal) throw new AuthError(404, "Goal not found");
    await requireCaregiver(String(goal.childId), ["therapist"]);
    if (["active", "paused", "mastered"].includes(body.status)) {
      goal.status = body.status;
      goal.masteredAt = body.status === "mastered" ? goal.masteredAt || new Date() : null;
    }
    if (typeof body.title === "string" && body.title.trim()) goal.title = body.title.trim().slice(0, 120);
    await goal.save();
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
