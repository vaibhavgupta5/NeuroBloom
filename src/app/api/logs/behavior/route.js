import BehaviorLog from "@/lib/models/BehaviorLog";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { localDayKey } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

const clip = (v) => String(v || "").trim().slice(0, 280);

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { child } = await requireCaregiver(body.childId);
    const intensity = Number(body.intensity);
    if (!Number.isInteger(intensity) || intensity < 1 || intensity > 5) {
      return Response.json({ error: "Choose an intensity from 1 to 5." }, { status: 400 });
    }
    if (!clip(body.behavior)) return Response.json({ error: "Describe what happened." }, { status: 400 });
    const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : localDayKey(new Date());
    const entry = await BehaviorLog.create({
      childId: child._id,
      date,
      incidents: 1,
      intensity,
      antecedent: clip(body.antecedent),
      behavior: clip(body.behavior),
      consequence: clip(body.consequence),
    });
    return Response.json({ ok: true, id: String(entry._id) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
