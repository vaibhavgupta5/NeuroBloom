import { NextResponse } from "next/server";
import { SESSION_COOKIE, decodeSession } from "./lib/sessionToken";

const PUBLIC_API = ["/api/auth/"];

// Optimistic cookie check only; route handlers re-verify against the database.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);

  if (pathname.startsWith("/api/")) {
    if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next();
    if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // A device locked in child mode can only see the child app.
  if (session.cm && !pathname.startsWith("/dashboard/child")) {
    return NextResponse.redirect(new URL("/dashboard/child", request.url));
  }

  if (pathname.startsWith("/therapist") && session.role !== "therapist") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/dashboard/parent") && session.role !== "parent") {
    return NextResponse.redirect(new URL("/therapist", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/therapist/:path*", "/reports/:path*", "/onboarding/:path*", "/api/:path*"],
};
