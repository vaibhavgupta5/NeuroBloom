import { authErrorResponse, requireCaregiver, writeSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { session, child } = await requireCaregiver(body.childId);
    await writeSession({ uid: session.uid, role: session.role, cid: String(child._id), cm: false });
    return Response.json({ ok: true, childId: String(child._id) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
