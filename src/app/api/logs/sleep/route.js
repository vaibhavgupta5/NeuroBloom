import SleepLog from "@/lib/models/SleepLog";
import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { daysAgoKey } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

// Sleep is logged for "last night", stored against the day it ended.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { child } = await requireCaregiver(body.childId);
    const hours = Number(body.hours);
    if (!Number.isFinite(hours) || hours < 0 || hours > 16) {
      return Response.json({ error: "Enter hours between 0 and 16." }, { status: 400 });
    }
    const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : daysAgoKey(0);
    await SleepLog.findOneAndUpdate({ childId: child._id, date }, { hours: Math.round(hours * 2) / 2 }, { upsert: true });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
