import CommEvent from "@/lib/models/CommEvent";
import { authErrorResponse, requireChild } from "@/lib/auth";
import { unlockAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const words = Array.isArray(body.words) ? body.words.filter((w) => typeof w === "string").map((w) => w.slice(0, 24)).slice(0, 12) : [];
    if (!words.length) return Response.json({ error: "No words" }, { status: 400 });
    const { child } = await requireChild();
    await CommEvent.create({ childId: child._id, words });
    await unlockAchievements(child._id, ["first-sentence"]);
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
