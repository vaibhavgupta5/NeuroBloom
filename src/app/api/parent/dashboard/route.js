import { authErrorResponse, requireCaregiver } from "@/lib/auth";
import { buildChildReport } from "@/lib/childReport";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const childId = new URL(request.url).searchParams.get("childId");
    const { user, child } = await requireCaregiver(childId);
    return Response.json(await buildChildReport(child, user));
  } catch (err) {
    return authErrorResponse(err);
  }
}
