import Child from "@/lib/models/Child";
import { authErrorResponse, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { session, user } = await requireUser();
    const filter = user.role === "parent" ? { parentId: user._id } : { therapistIds: user._id };
    const children = await Child.find(filter).select("name age avatarIcon").sort({ createdAt: 1 }).lean();
    return Response.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
        organization: user.organization,
        inviteCode: user.role === "therapist" ? user.inviteCode : undefined,
        hasPin: Boolean(user.pinHash),
      },
      activeChildId: session.cid,
      childMode: Boolean(session.cm),
      children: children.map((c) => ({ id: String(c._id), name: c.name, age: c.age, avatarIcon: c.avatarIcon })),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
