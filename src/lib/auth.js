import "server-only";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getConnection } from "./db";
import User from "./models/User";
import Child from "./models/Child";
import { SESSION_COOKIE, decodeSession } from "./sessionToken";

const scrypt = promisify(scryptCb);
const SESSION_TTL_SEC = 60 * 60 * 24 * 14;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars) in .env.local");
  return s;
}

export async function hashSecret(plain) {
  const salt = randomBytes(16);
  const key = await scrypt(plain, salt, 32);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifySecret(plain, stored) {
  if (!stored) return false;
  const [saltHex, keyHex] = stored.split(":");
  const key = await scrypt(plain, Buffer.from(saltHex, "hex"), 32);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

/** { uid, role, cid (active child id), cm (child mode) } */
export async function writeSession(data) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const store = await cookies();
  store.set(SESSION_COOKIE, sign({ ...data, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  return decodeSession(raw, secret());
}

export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function authErrorResponse(err) {
  if (err instanceof AuthError) return Response.json({ error: err.message }, { status: err.status });
  throw err;
}

/** Loads the signed-in user; throws AuthError(401) if missing. */
export async function requireUser(roles) {
  const session = await getSession();
  if (!session) throw new AuthError(401, "Not signed in");
  await getConnection();
  const user = await User.findById(session.uid).lean();
  if (!user) throw new AuthError(401, "Not signed in");
  if (roles && !roles.includes(user.role)) throw new AuthError(403, "Not allowed");
  return { session, user };
}

function canAccess(user, child) {
  if (user.role === "parent") return String(child.parentId) === String(user._id);
  return (child.therapistIds || []).some((id) => String(id) === String(user._id));
}

/**
 * Resolves the child a request acts on: an explicit childId (checked against the
 * user's access) or the session's active child.
 */
export async function requireChild(childId, roles) {
  const { session, user } = await requireUser(roles);
  const id = childId || session.cid;
  if (!id) throw new AuthError(404, "No child selected");
  const child = await Child.findById(id);
  if (!child || !canAccess(user, child)) throw new AuthError(404, "Child not found");
  if (session.cm && String(session.cid) !== String(child._id)) throw new AuthError(403, "Child mode is locked");
  return { session, user, child };
}

/** Parent-only actions are refused while the device is locked in child mode. */
export async function requireCaregiver(childId, roles = ["parent", "therapist"]) {
  const ctx = await requireChild(childId, roles);
  if (ctx.session.cm) throw new AuthError(403, "Exit child mode first");
  return ctx;
}

export function newInviteCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}
