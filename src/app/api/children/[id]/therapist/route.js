import User from "@/lib/models/User";
import { AuthError, authErrorResponse, requireCaregiver } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Parent links a therapist using the therapist's invite code.
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { child } = await requireCaregiver(id, ["parent"]);
    const body = await request.json().catch(() => ({}));
    const code = String(body.inviteCode || "").trim().toUpperCase();
    const therapist = code ? await User.findOne({ inviteCode: code, role: "therapist" }).lean() : null;
    if (!therapist) throw new AuthError(404, "No therapist found with that code.");
    if (!child.therapistIds.some((t) => String(t) === String(therapist._id))) {
      child.therapistIds.push(therapist._id);
      await child.save();
    }
    return Response.json({ ok: true, therapist: { id: String(therapist._id), name: therapist.name, organization: therapist.organization } });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const { child } = await requireCaregiver(id, ["parent"]);
    const therapists = await User.find({ _id: { $in: child.therapistIds } }).select("name organization").lean();
    return Response.json({ therapists: therapists.map((t) => ({ id: String(t._id), name: t.name, organization: t.organization })) });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { child } = await requireCaregiver(id, ["parent"]);
    const body = await request.json().catch(() => ({}));
    child.therapistIds = child.therapistIds.filter((t) => String(t) !== String(body.therapistId));
    await child.save();
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
