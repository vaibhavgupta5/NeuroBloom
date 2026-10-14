import Routine from "@/lib/models/Routine";
import { authErrorResponse, requireCaregiver, requireChild } from "@/lib/auth";
import { cleanSteps, serializeRoutine } from "@/lib/routines";

export const dynamic = "force-dynamic";

// Child and caregivers can read; the child device reads its own active child.
export async function GET(request) {
  try {
    const childId = new URL(request.url).searchParams.get("childId");
    const { child } = await requireChild(childId);
    const routines = await Routine.find({ childId: child._id, active: true }).sort({ createdAt: 1 }).lean();
    return Response.json({ routines: routines.map(serializeRoutine) });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { user, child } = await requireCaregiver(body.childId);
    const name = String(body.name || "").trim().slice(0, 40);
    const steps = cleanSteps(body.steps);
    if (!name || steps.length < 2) {
      return Response.json({ error: "Give the routine a name and at least two steps." }, { status: 400 });
    }
    const routine = await Routine.create({ childId: child._id, createdBy: user._id, name, steps });
    return Response.json({ ok: true, routine: serializeRoutine(routine) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
