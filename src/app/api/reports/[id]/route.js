import ClinicalReport from "@/lib/models/ClinicalReport";
import { AuthError, authErrorResponse, requireCaregiver } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function load(id) {
  const report = await ClinicalReport.findById(id);
  if (!report) throw new AuthError(404, "Report not found");
  const ctx = await requireCaregiver(String(report.childId));
  if (ctx.user.role === "parent" && report.status !== "approved") throw new AuthError(404, "Report not found");
  return { report, ...ctx };
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const { report, child } = await load(id);
    return Response.json({
      report: {
        id: String(report._id),
        title: report.title,
        date: report.date,
        type: report.type,
        status: report.status,
        generatedBy: report.generatedBy,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        summary: report.summary,
        details: report.details,
        metrics: report.metrics,
      },
      child: { name: child.name, age: child.age },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { report, user } = await load(id);
    if (user.role !== "therapist") throw new AuthError(403, "Only the therapist can edit reports.");
    if (typeof body.title === "string" && body.title.trim()) report.title = body.title.trim().slice(0, 120);
    if (typeof body.summary === "string" && body.summary.trim()) report.summary = body.summary.trim().slice(0, 2000);
    if (typeof body.details === "string" && body.details.trim()) report.details = body.details.trim().slice(0, 10000);
    if (body.status === "approved" || body.status === "draft") report.status = body.status;
    await report.save();
    return Response.json({ ok: true, status: report.status });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const { report, user } = await load(id);
    if (user.role !== "therapist" || report.status !== "draft") throw new AuthError(403, "Only draft reports can be deleted.");
    await report.deleteOne();
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
