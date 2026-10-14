import TherapistNote from "@/lib/models/TherapistNote";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { localDayKey } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { user, child } = await requireCaregiver(body.childId, ["therapist"]);
    const content = String(body.content || "").trim().slice(0, 2000);
    if (!content) return Response.json({ error: "Write a note first." }, { status: 400 });
    await TherapistNote.create({ childId: child._id, date: localDayKey(new Date()), author: user.name, authorId: user._id, content });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
