import { clearSession, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (session?.cm) return Response.json({ error: "Exit child mode first" }, { status: 403 });
  await clearSession();
  return Response.json({ ok: true });
}
