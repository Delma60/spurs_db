import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, fetchUserInfo } from "@/lib/spurs-oidc";
import { createSession, SESSION_COOKIE } from "@/lib/session";
import { db, users } from "@/lib/db";

// Spurs redirects the user back here with ?code&state. Exchange it and sign in.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const appUrl = process.env.APP_URL ?? url.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(`${appUrl}/auth/login?error=${encodeURIComponent(reason)}`);

  if (url.searchParams.get("error")) return fail(url.searchParams.get("error")!);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("spurs_oauth_state")?.value;
  const verifier = request.cookies.get("spurs_oauth_verifier")?.value;

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    return fail("invalid_state");
  }

  try {
    const tokens = await exchangeCode(code, verifier);
    const user = await fetchUserInfo(tokens.access_token);

    // Mirror the Spurs user into our control plane so projects can reference them.
    await db
      .insert(users)
      .values({ id: user.sub, name: user.name ?? null, email: user.email ?? null })
      .onConflictDoUpdate({
        target: users.id,
        set: { name: user.name ?? null, email: user.email ?? null },
      });

    const session = await createSession(user);

    const res = NextResponse.redirect(`${appUrl}/`);
    res.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.delete("spurs_oauth_state");
    res.cookies.delete("spurs_oauth_verifier");
    return res;
  } catch {
    return fail("exchange_failed");
  }
}
