import Child from "@/lib/models/Child";
import Achievement from "@/lib/models/Achievement";
import { authErrorResponse, requireUser, writeSession } from "@/lib/auth";
import { publicChild } from "@/lib/childPlan";
import { DEFAULT_ACHIEVEMENTS } from "@/lib/content/achievements";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { session, user } = await requireUser(["parent"]);
    if (session.cm) return Response.json({ error: "Exit child mode first" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim().slice(0, 40);
    const age = Number(body.age);
    if (!name || !Number.isInteger(age) || age < 2 || age > 18) {
      return Response.json({ error: "Enter a name and an age between 2 and 18." }, { status: 400 });
    }

    const consent = body.consent || {};
    const child = await Child.create({
      parentId: user._id,
      name,
      age,
      sensoryProfile: body.sensoryProfile || undefined,
      consent: {
        camera: Boolean(consent.camera),
        liveFrames: Boolean(consent.camera && consent.liveFrames),
        dataSharing: Boolean(consent.dataSharing),
        grantedAt: new Date(),
      },
    });
    await Achievement.insertMany(DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a, childId: child._id })));

    await writeSession({ uid: session.uid, role: session.role, cid: String(child._id), cm: false });
    return Response.json({ ok: true, child: publicChild(child) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
