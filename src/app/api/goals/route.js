import Goal from "@/lib/models/Goal";
import Module from "@/lib/models/Module";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { user, child } = await requireCaregiver(body.childId);
    const mod = await Module.findOne({ code: body.moduleCode }).lean();
    const title = String(body.title || "").trim().slice(0, 120);
    if (!mod || !title) return Response.json({ error: "Pick an activity and describe the goal." }, { status: 400 });
    const independentPct = Math.min(100, Math.max(50, Number(body.independentPct) || 80));
    const sessions = Math.min(10, Math.max(1, Number(body.sessions) || 3));
    const goal = await Goal.create({
      childId: child._id,
      createdBy: user._id,
      skill: mod.skill,
      moduleCode: mod.code,
      title,
      criterion: { independentPct, sessions },
    });
    return Response.json({ ok: true, id: String(goal._id) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
