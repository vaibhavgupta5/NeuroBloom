import { getConnection } from "@/lib/db";
import User from "@/lib/models/User";
import Child from "@/lib/models/Child";
import { verifySecret, writeSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  await getConnection();
  const user = await User.findOne({ email }).lean();
  if (!user || !(await verifySecret(password, user.passwordHash))) {
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const filter = user.role === "parent" ? { parentId: user._id } : { therapistIds: user._id };
  const firstChild = await Child.findOne(filter).sort({ createdAt: 1 }).select("_id").lean();

  await writeSession({ uid: String(user._id), role: user.role, cid: firstChild ? String(firstChild._id) : null, cm: false });

  let next = "/dashboard";
  if (user.role === "therapist") next = "/therapist";
  else if (!firstChild) next = "/onboarding";
  return Response.json({ ok: true, role: user.role, next });
}
