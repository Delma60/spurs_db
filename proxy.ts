import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

// Gate the whole console behind a valid Spurs session. /auth/* stays public.
// (Next 16 renamed the `middleware` convention to `proxy`.)
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths: login, SSO handlers, and the API-key-authenticated public API.
  if (pathname === "/login" || pathname.startsWith("/auth/") || pathname.startsWith("/api/v1/")) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
