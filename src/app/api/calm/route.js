import { authErrorResponse, requireChild } from "@/lib/auth";
import { unlockAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { child } = await requireChild();
    await unlockAchievements(child._id, ["calm-corner"]);
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
