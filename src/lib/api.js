"use client";

/** fetch wrapper: JSON in/out, throws Error(message) with the server's error text. */
export async function api(path, { method = "GET", body, signal } = {}) {
  const res = await fetch(path, {
    method,
    signal,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
