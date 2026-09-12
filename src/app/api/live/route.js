import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import LiveSession from "@/lib/models/LiveSession";

export const dynamic = "force-dynamic";

export async function GET() {
  await getConnection();

  const child = await Child.findOne();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  const live = await LiveSession.findOne({ childId: child._id }).lean();
  return Response.json({
    childName: child.name,
    isLive: live ? live.status !== "idle" : false,
    liveSession: live || null,
  });
}
