import Routine from "@/lib/models/Routine";
import { AuthError, authErrorResponse, requireCaregiver } from "@/lib/auth";
import { cleanSteps, serializeRoutine } from "@/lib/routines";

export const dynamic = "force-dynamic";

async function load(id) {
  const routine = await Routine.findById(id);
  if (!routine) throw new AuthError(404, "Routine not found");
  await requireCaregiver(String(routine.childId));
  return routine;
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const routine = await load(id);
    if (typeof body.name === "string" && body.name.trim()) routine.name = body.name.trim().slice(0, 40);
    if (Array.isArray(body.steps)) {
      const steps = cleanSteps(body.steps);
      if (steps.length < 2) throw new AuthError(400, "A routine needs at least two steps.");
      routine.steps = steps;
      routine.progress = { day: null, doneStepIds: [] };
    }
    await routine.save();
    return Response.json({ ok: true, routine: serializeRoutine(routine) });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const routine = await load(id);
    routine.active = false;
    await routine.save();
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
