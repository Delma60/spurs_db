import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const res = NextResponse.redirect(`${appUrl}/auth/login`);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
