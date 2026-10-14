import Routine from "@/lib/models/Routine";
import { AuthError, authErrorResponse, requireChild } from "@/lib/auth";
import { localDayKey } from "@/lib/dayUtils";
import { serializeRoutine } from "@/lib/routines";

export const dynamic = "force-dynamic";

// Child checks a step off (or un-checks it) for today.
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const routine = await Routine.findById(id);
    if (!routine) throw new AuthError(404, "Routine not found");
    await requireChild(String(routine.childId));
    const stepId = String(body.stepId || "");
    if (!routine.steps.some((s) => String(s._id) === stepId)) throw new AuthError(400, "Unknown step");

    const today = localDayKey(new Date());
    const done = routine.progress?.day === today ? new Set(routine.progress.doneStepIds) : new Set();
    if (body.done === false) done.delete(stepId);
    else done.add(stepId);
    routine.progress = { day: today, doneStepIds: [...done] };
    await routine.save();
    return Response.json({ ok: true, routine: serializeRoutine(routine) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
