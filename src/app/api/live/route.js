import LiveSession from "@/lib/models/LiveSession";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { effectiveLiveStatus } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { child } = await requireCaregiver();
    const live = await LiveSession.findOne({ childId: child._id }).lean();
    const status = effectiveLiveStatus(live);
    return Response.json({
      childName: child.name,
      isLive: status !== "idle",
      liveSession: live ? { ...live, status, snapshotFrame: child.consent?.liveFrames ? live.snapshotFrame : null } : null,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
