import User from "@/lib/models/User";
import { AuthError, authErrorResponse, hashSecret, requireCaregiver, requireUser, verifySecret, writeSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Enter child mode: lock this device to one child. Sets the PIN on first use.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { session, user, child } = await requireCaregiver(body.childId, ["parent"]);
    const pin = String(body.pin || "");
    if (!user.pinHash) {
      if (!/^\d{4}$/.test(pin)) throw new AuthError(400, "Choose a 4-digit PIN to lock child mode.");
      await User.updateOne({ _id: user._id }, { pinHash: await hashSecret(pin) });
    }
    await writeSession({ uid: session.uid, role: session.role, cid: String(child._id), cm: true });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}

// Exit child mode with the parent PIN.
export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { session, user } = await requireUser(["parent"]);
    if (!(await verifySecret(String(body.pin || ""), user.pinHash))) throw new AuthError(401, "That PIN didn't match.");
    await writeSession({ uid: session.uid, role: session.role, cid: session.cid, cm: false });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
