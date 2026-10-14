import { AuthError, authErrorResponse, requireCaregiver } from "@/lib/auth";
import { publicChild } from "@/lib/childPlan";

export const dynamic = "force-dynamic";

const MOTION = ["full", "reduced", "none"];
const MAX_TILE_IMAGE = 80_000;

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const { child } = await requireCaregiver(id);
    return Response.json({ child: publicChild(child) });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { user, child } = await requireCaregiver(id);
    const body = await request.json().catch(() => ({}));

    if (body.name !== undefined || body.age !== undefined || body.consent !== undefined) {
      if (user.role !== "parent") throw new AuthError(403, "Only the parent can change profile or consent.");
    }
    if (typeof body.name === "string" && body.name.trim()) child.name = body.name.trim().slice(0, 40);
    if (Number.isInteger(body.age) && body.age >= 2 && body.age <= 18) child.age = body.age;
    if (Number.isInteger(body.dailyGoal) && body.dailyGoal >= 1 && body.dailyGoal <= 10) child.dailyGoal = body.dailyGoal;

    const sp = body.sensoryProfile;
    if (sp && typeof sp === "object") {
      if (MOTION.includes(sp.motion)) child.sensoryProfile.motion = sp.motion;
      for (const k of ["sfx", "voice", "calmPalette", "showTimer"]) {
        if (typeof sp[k] === "boolean") child.sensoryProfile[k] = sp[k];
      }
      if (Number.isFinite(sp.voiceRate)) child.sensoryProfile.voiceRate = Math.min(1.5, Math.max(0.5, sp.voiceRate));
      if (Number.isInteger(sp.sessionMinutes)) child.sensoryProfile.sessionMinutes = Math.min(60, Math.max(5, sp.sessionMinutes));
    }

    const c = body.consent;
    if (c && typeof c === "object") {
      if (typeof c.camera === "boolean") child.consent.camera = c.camera;
      if (typeof c.liveFrames === "boolean") child.consent.liveFrames = c.liveFrames;
      if (typeof c.dataSharing === "boolean") child.consent.dataSharing = c.dataSharing;
      if (!child.consent.camera) child.consent.liveFrames = false;
      child.consent.grantedAt = new Date();
    }

    if (body.addTile && typeof body.addTile.label === "string" && body.addTile.label.trim()) {
      const image = typeof body.addTile.image === "string" && body.addTile.image.startsWith("data:image/") && body.addTile.image.length <= MAX_TILE_IMAGE
        ? body.addTile.image
        : null;
      if (child.aacTiles.length >= 48) throw new AuthError(400, "The Talk board is full (48 custom tiles).");
      child.aacTiles.push({
        label: body.addTile.label.trim().slice(0, 24),
        iconKey: typeof body.addTile.iconKey === "string" ? body.addTile.iconKey : null,
        image,
        category: "custom",
      });
    }
    if (typeof body.removeTileId === "string") {
      child.aacTiles = child.aacTiles.filter((t) => String(t._id) !== body.removeTileId);
    }

    if (body.levels && typeof body.levels === "object") {
      for (const [skill, level] of Object.entries(body.levels)) {
        if ([1, 2, 3].includes(level)) child.levels.set(skill, level);
      }
    }

    await child.save();
    return Response.json({ ok: true, child: publicChild(child) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
