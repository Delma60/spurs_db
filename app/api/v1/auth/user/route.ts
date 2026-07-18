import { NextRequest, NextResponse } from "next/server";
import { bearer } from "@/lib/api/public";
import { verifyEndUserToken } from "@/lib/endusers";

// Returns the end user for a given end-user session token (from signin/signup).
export async function GET(req: NextRequest) {
  const token = bearer(req);
  const claims = token ? await verifyEndUserToken(token) : null;
  if (!claims) return NextResponse.json({ error: "Invalid or missing token" }, { status: 401 });

  return NextResponse.json({ user: { id: claims.sub, email: claims.email, project: claims.project } });
}
