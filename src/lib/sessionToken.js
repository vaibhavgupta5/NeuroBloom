import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "nb_session";

/** Verifies an HMAC-signed session token; returns its payload or null. Safe for proxy.js. */
export function decodeSession(raw, secret) {
  if (!raw || !secret) return null;
  const [body, mac] = raw.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
