import Module from "@/lib/models/Module";
import { authErrorResponse, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const modules = await Module.find().sort({ order: 1 }).select("code title skill").lean();
    return Response.json({ modules: modules.map((m) => ({ code: m.code, title: m.title, skill: m.skill })) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
