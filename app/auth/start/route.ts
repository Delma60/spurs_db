import { NextResponse } from "next/server";
import { buildAuthorizeUrl, pkceChallenge, randomToken } from "@/lib/spurs-oidc";

// Kick off the Spurs SSO login: generate state + PKCE, stash them, redirect.
export async function GET() {
  const state = randomToken(16);
  const verifier = randomToken(32);
  const challenge = await pkceChallenge(verifier);

  const res = NextResponse.redirect(buildAuthorizeUrl(state, challenge));
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes to complete the round-trip
  };
  res.cookies.set("spurs_oauth_state", state, opts);
  res.cookies.set("spurs_oauth_verifier", verifier, opts);
  return res;
}
