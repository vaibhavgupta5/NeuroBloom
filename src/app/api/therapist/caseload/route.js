import Child from "@/lib/models/Child";
import Session from "@/lib/models/Session";
import Goal from "@/lib/models/Goal";
import BehaviorLog from "@/lib/models/BehaviorLog";
import ClinicalReport from "@/lib/models/ClinicalReport";
import User from "@/lib/models/User";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { daysAgoKey } from "@/lib/dayUtils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user } = await requireUser(["therapist"]);
    const children = await Child.find({ therapistIds: user._id }).sort({ name: 1 }).lean();
    const ids = children.map((c) => c._id);
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const [lastSessions, weekCounts, goals, behaviors, drafts, parents] = await Promise.all([
      Session.aggregate([
        { $match: { childId: { $in: ids } } },
        { $sort: { completedAt: -1 } },
        { $group: { _id: "$childId", at: { $first: "$completedAt" } } },
      ]),
      Session.aggregate([
        { $match: { childId: { $in: ids }, completedAt: { $gte: weekAgo }, outcome: "completed" } },
        { $group: { _id: "$childId", n: { $sum: 1 }, acc: { $avg: "$accuracy" } } },
      ]),
      Goal.find({ childId: { $in: ids } }).select("childId status").lean(),
      BehaviorLog.find({ childId: { $in: ids }, date: { $gte: daysAgoKey(6) }, intensity: { $gte: 4 } }).select("childId").lean(),
      ClinicalReport.find({ childId: { $in: ids }, status: "draft" }).select("childId").lean(),
      User.find({ _id: { $in: children.map((c) => c.parentId) } }).select("name").lean(),
    ]);

    const byId = (list, key = "_id") => new Map(list.map((x) => [String(x[key]), x]));
    const lastMap = byId(lastSessions);
    const weekMap = byId(weekCounts);
    const parentMap = byId(parents);

    return Response.json({
      therapist: { name: user.name, organization: user.organization, inviteCode: user.inviteCode },
      children: children.map((c) => {
        const id = String(c._id);
        const g = goals.filter((x) => String(x.childId) === id);
        return {
          id,
          name: c.name,
          age: c.age,
          parentName: parentMap.get(String(c.parentId))?.name || null,
          lastSessionAt: lastMap.get(id)?.at || null,
          sessions7d: weekMap.get(id)?.n || 0,
          accuracy7d: weekMap.get(id)?.acc != null ? Math.round(weekMap.get(id).acc) : null,
          goalsActive: g.filter((x) => x.status === "active").length,
          goalsMastered: g.filter((x) => x.status === "mastered").length,
          highIntensityIncidents7d: behaviors.filter((b) => String(b.childId) === id).length,
          draftReports: drafts.filter((d) => String(d.childId) === id).length,
        };
      }),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
