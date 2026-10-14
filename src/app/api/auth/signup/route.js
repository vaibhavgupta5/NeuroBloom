import { getConnection } from "@/lib/db";
import User from "@/lib/models/User";
import { hashSecret, newInviteCode, writeSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = body?.role === "therapist" ? "therapist" : "parent";

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return Response.json({ error: "Enter your name, a valid email and a password of 8+ characters." }, { status: 400 });
  }

  await getConnection();
  if (await User.exists({ email })) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = await User.create({
    name,
    email,
    role,
    passwordHash: await hashSecret(password),
    avatarInitials: name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    organization: role === "therapist" ? String(body?.organization || "").trim() || null : null,
    inviteCode: role === "therapist" ? newInviteCode() : undefined,
  });

  await writeSession({ uid: String(user._id), role, cid: null, cm: false });
  return Response.json({ ok: true, role, next: role === "therapist" ? "/therapist" : "/onboarding" });
}
